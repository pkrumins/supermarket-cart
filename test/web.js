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
            res.write('catface');
            res.end();
        });
        
        app.post('/login', function (req, res) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            if (req.body.user == 'substack' && req.body.pass == 'hax') {
                
                res.write('ok');
            }
            else {
                res.write('failed');
            }
            res.end();
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
        agent.request({ uri : '/' }, function (err, res, body) {
console.log(body);
            assert.equal('catface', body);
console.dir(agent.cookies);
        });
    }, 100);
    
    setTimeout(function () { server.close() }, 500);
};

function Agent (uri) {
    var self = this;
    self.cookies = {};
    
    self.request = function (params, cb) {
        request(Hash.merge(params, {
            uri : uri + params.uri,
            headers : Hash.merge(params.headers, {
                cookie : qs.stringify(Hash.merge(
                    self.cookies,
                    qs.parse((params.headers || {}).cookie)
                ))
            })}),
            function (err, res, body) {
                ((res.headers || {})['set-cookie'] || [])
                    .forEach(function (raw) {
                        var key = raw.split(/=/)[0];
                        self.cookies[key] = {};
                        raw.replace(key, 'value').split(/;\s*/)
                            .forEach(function (kv) {
                                var k = kv.split(/=/)[0];
                                self.cookies[key][k] = kv.split(/=/)[1] || true;
                            });
                    });
                cb(err, res, body);
            }
        );
    };
}
