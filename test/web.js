var Cart = require('cart');
var connect = require('connect');
var http = require('http');

exports.webserver = function (assert) {
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = connect.createServer();
    server.use(connect.cookieDecoder());
    server.use(connect.session({
        store : new Cart({ dbFile : '/tmp/cart-' + port + '.db' }),
        secret : 'meowmers',
    }));
    
    server.use(connect.router(function (app) {
        app.get('/', function (req, res) {
            res.writeHead(200, { 'Content-Type' : 'text/html' });
            res.write('catface');
            res.end();
        });
    }));
    server.listen(port, 'localhost');
    
    setTimeout(function () {
        var client = http.createClient(port);
        var req = client.request('GET', '/', { host : 'localhost' });
        req.end();
        req.on('response', function (res) {
            res.on('data', function (data) {
                assert.equal('catface', data.toString());
            });
            server.close();
        });
    }, 100);
};
