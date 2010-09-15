// inspired by nsession-store
var sys = require('sys');
var ConnectStore = require('connect/middleware/session/store');
var Store = require('supermarket');

module.exports = Cart;

function Cart(options) {
    var self = this;
    
    options = options || {};
    options.maxAge = options.maxAge || 3600000; // Expunge after an hour
    var dbFile = options.dbFile || __dirname + "/sessions.db";
    ConnectStore.call(this, options);
    Store(dbFile, function (err, db) {
        if (err) throw err;
        self.db = db;
        db.filter(
            function (key, item) {
                item = JSON.parse(item);
                return item.lastAccess > Date.now() - options.maxAge;
            },
            function (key, item) {
                db.remove(key);
            }
        );
    });
};

sys.inherits(Cart, ConnectStore);

Cart.prototype.get = function (hash, fn) {
  this.db.get(hash, fn);
};

Cart.prototype.set = function (hash, sess, fn) {
    this.db.set(hash, JSON.stringify(sess), fn);
};

Cart.prototype.destroy = function (hash, fn) {
    this.db.remove(hash, fn);
};

Cart.prototype.length = function (fn) {
    process.nextTick(function () {
        this.db.length(function (err, len) {
            fn(len);
        });
    });
};

Cart.prototype.clear = function (fn) {
    var self = this;
    self.db.filter(
        function () { return true },
        function (err, key, value) {
            self.remove(key);
        },
        function () { fn() }
    );
};

