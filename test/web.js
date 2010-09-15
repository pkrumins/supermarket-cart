var Cart = require('cart');
var connect = require('connect');
var http = require('http');
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
console.dir(req.body);
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.write('meow');
            res.end();
        });
    }));
    server.listen(port, 'localhost');
    
    var get = request.bind({}, port, 'GET', {});
    var post = request.bind({}, port, 'POST');
    
    setTimeout(function () {
        get('/', function (s) {
            assert.equal('catface', s);
        });
        post({ user : 'substack', pass : 'hax' }, '/login', function (s) {
            console.log(s);
        });
    }, 100);
    
    setTimeout(function () { server.close() }, 500);
};

function request (port, method, vars, path, cb) {
    var client = http.createClient(port);
    var opts = { host : 'localhost' };
    if (method == 'POST') {
        opts['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    var req = client.request(method, path, opts);
    req.end(qs.stringify(vars));
    
    req.on('response', function (res) {
        var s = '';
        res.on('data', function (buf) { s += buf.toString() });
        res.on('end', function () { cb(s) });
    });
}
