This is a connect [1] session store using supermarket [2].

It was written by Peteris Krumins (peter@catonmat.net).
His blog is at http://www.catonmat.net  --  good coders code, great reuse.

[1] http://github.com/senchalabs/connect
[2] http://github.com/pkrumins/node-supermarket

------------------------------------------------------------------------------

Supermarket-cart can be used to store connect's sessions in supermarket database.

Here is a full application that starts a server on port 9005. When you first
visit the root page /, it sets session name to be 'pkrumins'. Then when you
visit /whoami, it will tell your name:

    var Cart = require('cart');
    var connect = require('connect');

    var server = connect.createServer();
    server.use(connect.cookieDecoder());
    server.use(connect.bodyDecoder());
    server.use(connect.session({
        store : new Cart({ dbFile : '/tmp/sessions.db' }),
        secret : 'your secret'
    }));
    server.use(
        connect.router(function (app) {
            app.get('/', function (req, res) {
                req.session.name = 'pkrumins';
                res.writeHead(200, { 'Content-Type' : 'text/html' });
                res.end();
            });
            app.get('/whoami', function (req, res) {
                res.writeHead(200, { 'Content-Type' : 'text/html' });
                res.end(req.session.name);
            });
        })
    );
    server.listen(9005);
        

------------------------------------------------------------------------------

Have fun storing sessions in a supermarket cart!


Sincerely,
Peteris Krumins
http://www.catonmat.net

