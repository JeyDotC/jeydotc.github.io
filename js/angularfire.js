"use strict";
!function() {
    var a, b;
    angular.module("firebase", []).value("Firebase", Firebase), angular.module("firebase").factory("$firebase", ["$q", "$parse", "$timeout", function(b, c, d) {
            return function(e) {
                var f = new a(b, c, d, e);
                return f.construct()
            }
        }]), angular.module("firebase").filter("orderByPriority", function() {
        return function(a) {
            if (!a)
                return[];
            if (!a.$getIndex || "function" != typeof a.$getIndex) {
                var b = Object.prototype.toString.call(a);
                if ("object" == typeof a && "[object Object]" == b) {
                    var c = [];
                    for (var d in a)
                        a.hasOwnProperty(d) && c.push(a[d]);
                    return c
                }
                return a
            }
            var e = [], f = a.$getIndex();
            if (f.length <= 0)
                return a;
            for (var g = 0; g < f.length; g++) {
                var h = a[f[g]];
                h && (h.$id = f[g], e.push(h))
            }
            return e
        }
    }), Array.prototype.indexOf || (Array.prototype.indexOf = function(a, b) {
        if (void 0 === this || null === this)
            throw new TypeError("'this' is null or not defined");
        var c = this.length >>> 0;
        for (b = + b || 0, 1 / 0 === Math.abs(b) && (b = 0), 0 > b && (b += c, 0 > b && (b = 0)); c > b; b++)
            if (this[b] === a)
                return b;
        return-1
    }), a = function(a, b, c, d) {
        if (this._q = a, this._bound = !1, this._loaded = !1, this._parse = b, this._timeout = c, this._index = [], this._on = {change: [], loaded: [], child_added: [], child_moved: [], child_changed: [], child_removed: []}, "string" == typeof d)
            throw new Error("Please provide a Firebase reference instead of a URL, eg: new Firebase(url)");
        this._fRef = d
    }, a.prototype = {construct: function() {
            var b = this, c = {};
            return c.$bind = function(a, c) {
                return b._bind(a, c)
            }, c.$add = function(a) {
                function c(a) {
                    a ? e.reject(a) : e.resolve(d)
                }
                var d, e = b._q.defer();
                return d = "object" == typeof a ? b._fRef.ref().push(b._parseObject(a), c) : b._fRef.ref().push(a, c), e.promise
            }, c.$save = function(a) {
                function c(a) {
                    a ? d.reject(a) : d.resolve()
                }
                var d = b._q.defer();
                if (a) {
                    var e = b._parseObject(b._object[a]);
                    b._fRef.ref().child(a).set(e, c)
                } else
                    b._fRef.ref().set(b._parseObject(b._object), c);
                return d.promise
            }, c.$set = function(a) {
                var c = b._q.defer();
                return b._fRef.ref().set(a, function(a) {
                    a ? c.reject(a) : c.resolve()
                }), c.promise
            }, c.$transaction = function(a, c) {
                var d = b._q.defer();
                b._fRef.ref().transaction(a, function(a, b, c) {
                    a ? d.reject(a) : b ? d.resolve(c) : d.resolve(null)
                }, c)
            }, c.$remove = function(a) {
                function c(a) {
                    a ? d.reject(a) : d.resolve()
                }
                var d = b._q.defer();
                return a ? b._fRef.ref().child(a).remove(c) : b._fRef.ref().remove(c), d.promise
            }, c.$child = function(c) {
                var d = new a(b._q, b._parse, b._timeout, b._fRef.ref().child(c));
                return d.construct()
            }, c.$on = function(a, c) {
                if ("loaded" == a && b._loaded)
                    return b._timeout(function() {
                        c()
                    }), void 0;
                if (!b._on.hasOwnProperty(a))
                    throw new Error("Invalid event type " + a + " specified");
                b._on[a].push(c)
            }, c.$off = function(a, c) {
                if (b._on.hasOwnProperty(a))
                    if (c) {
                        var d = b._on[a].indexOf(c);
                        -1 !== d && b._on[a].splice(d, 1)
                    } else
                        b._on[a] = [];
                else
                    b._fRef.off()
            }, c.$auth = function(a) {
                var c = b._q.defer();
                return b._fRef.auth(a, function(a, b) {
                    null !== a ? c.reject(a) : c.resolve(b)
                }, function(a) {
                    c.reject(a)
                }), c.promise
            }, c.$getIndex = function() {
                return angular.copy(b._index)
            }, b._object = c, b._getInitialValue(), b._object
        }, _getInitialValue: function() {
            var a = this, b = function(c) {
                var d = c.val();
                if (null === d && a._bound) {
                    var e = a._parseObject(a._parse(a._name)(a._scope));
                    switch (typeof e) {
                        case"string":
                        case"undefined":
                            d = "";
                            break;
                        case"number":
                            d = 0;
                            break;
                        case"boolean":
                            d = !1
                    }
                }
                switch (typeof d) {
                    case"string":
                    case"number":
                    case"boolean":
                        a._updatePrimitive(d);
                        break;
                    case"object":
                        a._getChildValues(), a._fRef.off("value", b);
                        break;
                    default:
                        throw new Error("Unexpected type from remote data " + typeof d)
                }
                a._loaded = !0, a._broadcastEvent("loaded", d)
            };
            a._fRef.on("value", b)
        }, _getChildValues: function() {
            function a(a, b) {
                var c = a.name(), e = a.val(), f = d._index.indexOf(c);
                if (-1 !== f && d._index.splice(f, 1), b) {
                    var g = d._index.indexOf(b);
                    d._index.splice(g + 1, 0, c)
                } else
                    d._index.unshift(c);
                null !== a.getPriority() && (e.$priority = a.getPriority()), d._updateModel(c, e)
            }
            function b(a, b) {
                return function(c, e) {
                    b(c, e), d._broadcastEvent(a, {snapshot: {name: c.name(), value: c.val()}, prevChild: e})
                }
            }
            function c(a, c) {
                d._fRef.on(a, b(a, c))
            }
            var d = this;
            c("child_added", a), c("child_moved", a), c("child_changed", a), c("child_removed", function(a) {
                var b = a.name(), c = d._index.indexOf(b);
                d._index.splice(c, 1), d._updateModel(b, null)
            })
        }, _updateModel: function(a, b) {
            var c = this;
            c._timeout(function() {
                if (null == b ? delete c._object[a] : c._object[a] = b, c._broadcastEvent("change", a), c._bound) {
                    var d = c._object, e = c._parse(c._name)(c._scope);
                    angular.equals(d, e) || c._parse(c._name).assign(c._scope, angular.copy(d))
                }
            })
        }, _updatePrimitive: function(a) {
            var b = this;
            b._timeout(function() {
                if (b._object.$value && angular.equals(b._object.$value, a) || (b._object.$value = a), b._broadcastEvent("change"), b._bound) {
                    var c = b._parseObject(b._parse(b._name)(b._scope));
                    angular.equals(c, a) || b._parse(b._name).assign(b._scope, a)
                }
            })
        }, _broadcastEvent: function(a, b) {
            function c(a, b) {
                e._timeout(function() {
                    a(b)
                })
            }
            var d = this._on[a] || [], e = this;
            if (d.length > 0)
                for (var f = 0; f < d.length; f++)
                    "function" == typeof d[f] && c(d[f], b)
        }, _bind: function(a, b) {
            var c = this, d = c._q.defer();
            c._name = b, c._bound = !0, c._scope = a;
            var e = c._parse(b)(a);
            void 0 !== e && "object" == typeof e && c._fRef.update(c._parseObject(e));
            var f = a.$watch(b, function() {
                var d = c._parseObject(c._parse(b)(a));
                c._object.$value && angular.equals(d, c._object.$value) || angular.equals(d, c._object) || void 0 !== d && c._loaded && (c._fRef.set ? c._fRef.set(d) : c._fRef.ref().update(d))
            }, !0);
            return a.$on("$destroy", function() {
                f()
            }), c._fRef.once("value", function(a) {
                c._timeout(function() {
                    "object" != typeof a.val() ? d.resolve(f) : c._timeout(function() {
                        d.resolve(f)
                    })
                })
            }), d.promise
        }, _parseObject: function(a) {
            function b(a) {
                for (var c in a)
                    a.hasOwnProperty(c) && ("$priority" == c ? (a[".priority"] = a.$priority, delete a.$priority) : "object" == typeof a[c] && b(a[c]));
                return a
            }
            var c = b(angular.copy(a));
            return angular.fromJson(angular.toJson(c))
        }}, angular.module("firebase").factory("$firebaseSimpleLogin", ["$q", "$timeout", "$rootScope", function(a, c, d) {
            return function(e) {
                var f = new b(a, c, d, e);
                return f.construct()
            }
        }]), b = function(a, b, c, d) {
        if (this._q = a, this._timeout = b, this._rootScope = c, this._loginDeferred = null, this._getCurrentUserDeferred = [], this._currentUserData = void 0, "string" == typeof d)
            throw new Error("Please provide a Firebase reference instead of a URL, eg: new Firebase(url)");
        this._fRef = d
    }, b.prototype = {construct: function() {
            var a = {user: null, $login: this.login.bind(this), $logout: this.logout.bind(this), $createUser: this.createUser.bind(this), $changePassword: this.changePassword.bind(this), $removeUser: this.removeUser.bind(this), $getCurrentUser: this.getCurrentUser.bind(this)};
            if (this._object = a, !window.FirebaseSimpleLogin) {
                var b = new Error("FirebaseSimpleLogin is undefined. Did you forget to include firebase-simple-login.js?");
                throw this._rootScope.$broadcast("$firebaseSimpleLogin:error", b), b
            }
            var c = new FirebaseSimpleLogin(this._fRef, this._onLoginEvent.bind(this));
            return this._authClient = c, this._object
        }, login: function(a, b) {
            var c = this._q.defer(), d = this;
            return this.getCurrentUser().then(function() {
                d._loginDeferred = c, d._authClient.login(a, b)
            }), c.promise
        }, logout: function() {
            this._authClient.logout(), delete this._currentUserData
        }, createUser: function(a, b, c) {
            var d = this, e = this._q.defer();
            return d._authClient.createUser(a, b, function(f, g) {
                f ? (d._rootScope.$broadcast("$firebaseSimpleLogin:error", f), e.reject(f)) : c ? e.resolve(g) : e.resolve(d.login("password", {email: a, password: b}))
            }), e.promise
        }, changePassword: function(a, b, c) {
            var d = this, e = this._q.defer();
            return d._authClient.changePassword(a, b, c, function(a) {
                a ? (d._rootScope.$broadcast("$firebaseSimpleLogin:error", a), e.reject(a)) : e.resolve()
            }), e.promise
        }, getCurrentUser: function() {
            var a = this, b = this._q.defer();
            return void 0 !== a._currentUserData ? b.resolve(a._currentUserData) : a._getCurrentUserDeferred.push(b), b.promise
        }, removeUser: function(a, b) {
            var c = this, d = this._q.defer();
            return c._authClient.removeUser(a, b, function(a) {
                a ? (c._rootScope.$broadcast("$firebaseSimpleLogin:error", a), d.reject(a)) : d.resolve()
            }), d.promise
        }, _onLoginEvent: function(a, b) {
            if (this._currentUserData !== b || null !== a) {
                var c = this;
                a ? (c._loginDeferred && (c._loginDeferred.reject(a), c._loginDeferred = null), c._rootScope.$broadcast("$firebaseSimpleLogin:error", a)) : (this._currentUserData = b, c._timeout(function() {
                    for (c._object.user = b, b ? c._rootScope.$broadcast("$firebaseSimpleLogin:login", b) : c._rootScope.$broadcast("$firebaseSimpleLogin:logout"), c._loginDeferred && (c._loginDeferred.resolve(b), c._loginDeferred = null); c._getCurrentUserDeferred.length > 0; ) {
                        var a = c._getCurrentUserDeferred.pop();
                        a.resolve(b)
                    }
                }))
            }
        }}
}();