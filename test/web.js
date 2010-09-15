var Cart = require('cart');
var connect = require('connect');
var request = require('request');
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
            res.write('meow');
            res.end();
        });
    }));
    server.listen(port, 'localhost');
    var uri = 'http://localhost:' + port + '/';
    
    setTimeout(function () {
        request({ uri : uri }, function (err, res, body) {
            assert.equal('catface', body);
            var cookie = res.headers['set-cookie'][0];
            var cookies = qs.parse(cookie);
            assert.ok(cookies.connect.sid);
        });
    }, 100);
    
    setTimeout(function () { server.close() }, 500);
};
