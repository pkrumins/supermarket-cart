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
    Store({ filename : dbFile, json : true }, function (err, db) {
        if (err) throw new Error(err);
        self.db = db;
        db.filter(
            function (item) {
                return item.value.lastAccess < Date.now() - options.maxAge;
            }
        ).forEach(
            function (item) {
                db.remove(item.key);
            }
        );
    });
};

sys.inherits(Cart, ConnectStore);

Cart.prototype.get = function (hash, fn) {
    this.db.get(hash, function (err, val) {
        if (err) throw new Error(err);
        if (val) {
            fn(null, val);
        }
        else {
            fn();
        }
    })
};

Cart.prototype.set = function (hash, sess, fn) {
    this.db.set(hash, sess, function (err) {
        if (err) throw new Error(err);
        if (fn) fn();
    });
};

Cart.prototype.destroy = function (hash, fn) {
    this.db.remove(hash, function (err) {
        if (err) throw new Error(err);
        if (fn) fn();
    });
};

Cart.prototype.length = function (fn) {
    this.db.length(function (err, len) {
        fn(null, len);
    });
};

Cart.prototype.clear = function (fn) {
    this.db.forEach(
        function (item) {
            this.db.remove(item.key);
        }
    ).on('end', function () { if (fn) fn() });
};

