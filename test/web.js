var Cart = require('cart');
var connect = require('connect');
var request = require('request');
var Hash = require('traverse/hash');
var qs = require('querystring');

exports.webserver = function (assert) {
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = connect.createServer();
    server.use(connect.cookieDecoder());
    server.use(connect.bodyDecoder());
    server.use(connect.session({
        store : new Cart({ dbFile : '/tmp/cart-' + port + '.db' }),
        secret : 'salty-' + Math.floor(Math.random() * 1e16)
    }));
    
    server.use(connect.router(function (app) {
        app.get('/', function (req, res) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.write(req.session.name || 'nobody');
            res.end();
        });
        
        app.get('/login', function (req, res) {
            req.session.regenerate(function (err) {
                if (err) throw err;
                req.session.name = 'substack';
                res.writeHead(200, { 'Content-Type' : 'text/html' });
                res.end('ok');
            });
        });
        
        app.get('/logout', function (req, res) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.write('meow');
            res.end();
        });
    }));
    server.listen(port, 'localhost');
    
    var agent = new Agent('http://localhost:' + port);
    
    setTimeout(function () {
        agent
            .request({ uri : '/' }, function (err, res, body) {
                assert.ok(!err);
                assert.equal(body, 'nobody');
            })
            .request({ uri : '/login', }, function (err, res, body) {
                assert.ok(!err);
                assert.equal(body, 'ok');
            })
            .request({ uri : '/' }, function (err, res, body) {
                assert.ok(!err);
                assert.equal(body, 'substack');
                server.close();
            })
            .end()
        ;
    }, 100);
};

function Agent (uri, cookies) {
    var self = this;
    self.cookies = cookies || {};
    var requests = [];
    
    self.request = function (params, cb) {
        requests.push({ params : params, cb : cb });
        return self;
    };
    
    self.end = function () {
        if (!requests.length) return;
        
        (function next () {
            var r = requests.shift();
            if (r) {
                process(Hash.copy(r.params), function (err, res, body) {
                    r.cb(err, res, body);
                    next();
                });
            }
        })();
    };
    
    function process (params, cb) {
        var headers = Hash.copy(params.headers || {});
        
        if (Hash.size(self.cookies)) {
            headers.cookie = qs.stringify(Hash.map(
                self.cookies,
                function (c) { return c.value }
            ));
        }
        
        if (params.method == 'POST') {
            if (params.body && !headers['Content-Type']) {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }
            if (!Array.isArray(params.body) && typeof params.body == 'object') {
                params.body = qs.stringify(params.body);
            }
        }
        
        request(
            Hash.merge(params, {
                uri : uri + params.uri,
                headers : headers
            }),
            function (err, res, body) {
                var set = (res.headers || {})['set-cookie'] || [];
                if (typeof set == 'string') set = [set];
                set.forEach(function (raw) {
                    var key = raw.split(/=/)[0];
                    self.cookies[key] = {};
                    var vars = raw.replace(key, 'value').split(/;\s*/);
                    vars.forEach(function (kv) {
                        var k = kv.split(/=/)[0];
                        self.cookies[key][k] = kv.split(/=/)[1] || true;
                    });
                });
                cb(err, res, body);
            }
        );
    };
}
