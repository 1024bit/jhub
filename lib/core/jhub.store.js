/**
 *  jHub's `Store` class, responsible for application's data
 *  You can operate store-object as jquery-object
 *  Reference API from Backbone<http://backbonejs.org/> to lower learning curve
 *  
 *  Copyright(c) 2014 Vip Inc.
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@vip.com>
 *  MIT Licensed
 */
(function (global, factory) {
    // Node.js, CommonJS, CommonJS Like
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global, true);
    } else {
        factory(global);
    }
})(this, function(global, noGlobal) {
    // Support cmd && amd
    if (define && (define.cmd || define.amd)) {
        return define('jhub.store', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        loader = require('./jhub.loader'), 
        request = require('./jhub.request'), 
        Class = require('./jhub.class'),         
        Base = require('./jhub.base'), 
        StoreBase, arr = [], methods = {}, 
        EVENT_REQUEST = 'request', EVENT_SYNC = 'sync', EVENT_ERROR = 'error', 
        EVENT_ADD = 'add', EVENT_DESTROY = 'destroy';
        
        util.each('concat pop push reverse shift slice sort splice unshift'.split(' '), function() { 
            var method = this; 
            methods[method] = arr[method];
        });
        // TODO: validate filter
        StoreBase = Class(Base, util.extend({
            __construct: function(stores) {
                stores = stores || [];
                this.parent.call(this, stores);
                var self = this;
                // Ensure url and urlRoot are function
                util.each('url urlRoot'.split(' '), function() {
                    if ('string' === util.type(self[this])) {
                        self[this] = function() { return self[this]; };
                    }
                });
                
                if ('array' !== util.type(stores)) stores = [stores];
                util.each(stores, function(i) {
                    // Add cid to all new stores
                    if (!(this instanceof StoreBase)) {
                        stores[i] = util.extend({}, self.defaults, this, {cid: self.uuid++});
                    }
                    util.each(stores[i], function() {
                        // Concat the substore's url
                        if ((this instanceof StoreBase) && !(this instanceof self.constructor)) {
                            if (!this.originalUrl) this.originalUrl = this.url();
                            this.url = function() { 
                                return [self.url(), this.originalUrl()].join(this.urlGlue); 
                            };
                        }
                    });
                });
                // makeArray's args should have length prop
                if (stores.length) {
                    this.length = 0;
                    util.makeArray(stores, this);
                }
            },
            eventPrefix: 'store', 
            defaults: {}, 
            changed: {}, 
            // An attributes map between local and server
            dict: {}, 
            // Be used for joining parent-son store's url
            urlGlue: '/', 
            // Generate the `RESTFul` style URL
            url: function() {
                if (this.length > 1) {
                    return this.urlRoot();
                }
                return (this.urlRoot()) + '/' + this[0][this.dict.id || 'id'];
            }, 
            /**
            *  If a raw-store does not yet have an id, it is considered to be new
            *  
            *  @param {Number} index -
            *  @return {Boolean}
            */
            isNew: function(index) {
                return (this[index || 0][this.dict.id || 'id'] !== undefined);
            }, 
            /**
            *  Whether a store has a new raw-store
            *  
            *  @return {Boolean}
            */
            hasNew: function() {
                var l = this.length;
                while (l--) {
                    if (this.isNew(l)) return true;
                }
                return false;
            }, 
            /**
            *  CRUD a store to the `server`
            *  You can override it in order to use a different persistence strategy, 
            *  such as WebSockets, XML transport, or Local Storage
            *
            *  @param {String} method - the CRUD method
            *  @param {Object|ObjectArray} stores - a object or a object array
            *  @param {Object} requestSettings - all jQuery request options and others
            *  @event {Event} request - begin a sync with the server 
            *  @event {Event} sync - the sync completes successfully 
            *  @event {Event} error - the sync completes unsuccessfully
            *  @return {Deferred}
            */
            sync: function(method, stores, requestSettings) {
                method = method.toUpperCase();
                this.trigger(EVENT_REQUEST);
                var self = this, type, deferred = util.Deferred();              
                
                if (method === 'CREATE') {
                    type = 'POST';
                } else if (method === 'READ') {
                    type = 'GET';
                } else if (method === 'UPDATE') {
                    type = 'PUT';
                } else if (method === 'DELETE') {
                    type = 'DELETE';
                } 
                if (requestSettings.patch) type = 'PATCH';
                
                // Keep all local and server key are the same
                util.each(this.dict, function(k, v) {
                    util.each(stores, function() {
                        if (this[k]) {
                            this[v] = this[k];
                            delete this[k];
                        }                        
                    })
                }); 
                
                if ('array' === util.type(stores)) stores = this.toJSON.call(stores);
                        
                request(util.extend({type: type, url: this.url(), data: stores}, Object(requestSettings)))
                    .done(function(data) {
                        self.trigger(EVENT_SYNC);
                        deferred.resolve(data);
                    })
                    .fail(function(data) {
                        self.trigger(EVENT_ERROR);
                        deferred.reject(data);
                    });
                return deferred.promise();
            }, 
            /**
            *  Resets the store's state from the `server`
            *
            *  @return {Deferred}
            */            
            fetch: function() {
                var self = this;
                return this.sync('READ')
                    .done(function(data) {
                        self.set(data);
                    });
            },
            /**
            *  Save a store to your `server`
            *  
            *  @param {Object} options - {patch: {Boolean}}
            *  - patch: send an HTTP PATCH request to the server with just the changed stores
            *  @return {Deferred}
            */
            save: function(options) {
                var 
                self = this, 
                stores = options.patch ? this.changed : this.slice(), 
                request = {CREATE: [], UPDATE: []}, 
                deferred = util.Deferred();

                util.each(stores, function(k, v) { 
                    request[self.isNew(k) ? 'CREATE' : 'UPDATE'].push(v); 
                });
                util.each(request, function(k, v) {
                    if (v.length) {
                        self.sync(k, v, options);
                    }
                });
            },
            /**
            *  Destroys the store on the server
            *
            *  @param {Object} options - {wait: {Boolean}}
            *  @event {Event} destroy - 
            *  - wait: wait for the server to respond before clearing the store
            */
            destroy: function(options) {
                var self = this;
                this.trigger(EVENT_DESTROY);
                if (this.hasNew()) return false;

                if (!options.wait) this.clear();
                return this.sync('DELETE')
                    .done(function(data) {
                        self.clear();
                    });
            },               
            /**
            *  Get a raw-store, specified by an id, a cid or get a value, specified by a key
            *
            *  @param {Number|String} key - id, cid or key  
            *  @return {RawStore|*} - the all raw-stores's key value or a raw-store 
            */
            get: function(key) {
                var rtr = [];
                if (this.length > 1) {
                    util.each(this.slice(), function() {
                        rtr.push(this[key]);
                    });
                } else {
                    rtr = this[0][key];
                }
                return rtr;
            }, 
            /**
            *  Set a hash of attributes (one or many) on the store
            *  
            *  @param {String|Object} key - attributes hash or attributes key
            *  @param {*} val - attributes val
            *  @return {Context} - return this
            */
            set: function(key, val) {
                var self = this, changed = {}, attributes = {},  slice = this.slice();
                if ('string' === util.type(key)) {
                    attributes[key] = val;
                } else {
                    attributes = key;
                }
                util.each(attributes, function(k, v) {
                    util.each(slice, function() { 
                        _set.call(this, k, v); 
                    });
                });

                if (!util.isEmptyObject(changed)) {
                    this.changed = changed;
                    this.trigger('change');
                }
                return this;
                
                function _set(key, val) {
                    if (val !== this[key]) {
                        // self.trigger('change.' + key + self.eventNamespace); // note eventnamspace
                        this[key] = val;
                        changed[key] = val;
                    }
                }                 
            }, 
            /**
            *  Clear store then add attributes
            */
            reset: function(attributes) {
                return this.clear().add(attributes);
            }, 
            /**
            *  Add attributes or attributes hash to the set of matched stores           
            *  
            *  @param {Object|ObjectArray} attributes - 
            *  @param {Object} options - {at: {Number}, merge: {Boolean}}
            *  @param {Event} add - when a new attributes is added
            *  - at: splice the attributes into the store at the specified index
            *  - merge: merge attributes with same cid
            *  @return {Context}
            */
            add: function(attributes, options) {
                var self = this, i = options.at || this.length;
                if (!attributes.length) attributes = [attributes];
                util.each(attributes, function() {
                    var store = self.eq('cid', this.cid);
                    if (undefined === this.cid) {
                        self.trigger(EVENT_ADD);
                        self.splice(i, 0, self.constructor(this));
                    } else {
                        store.length ? store.set(this) : self.splice(i, 0, this);
                    }
                });
                return this;
            }, 
            /**
            *  Remove those matches the the specified key from the set of matched stores
            *  
            *  @param {Number|String} key - an index, attribute key
            *  @param {Scalar} val - an attribute value
            *  @param {Object} options - {all: {Boolean}, silence: {Boolean}}
            *  - all: whether remove only the first match or not, default true
            *  - silence: suppress remove event
            *  @return {Context}
            */          
            remove: function(key, val, options) {
                options = options || {};
                var removed, all = options.all || true;
                var self = this;
                if ('number' === util.type(key)) {
                    removed = true;
                    key = Math.min(key, this.length - 1);
                    if (key < 0) key = this.length + Math.max(key, -this.length); 
                    this.splice(key, 1);
                } else {
                    util.each(this.slice(), function(k) {
                        if (this[key] === val) {
                            removed = true;
                            self.splice(k, 1);
                            if (!all) {
                                return false;
                            } 
                        }
                    });
                }
                if (removed && !options.silent) {
                    this.trigger('EVENT_REMOVE');
                }
                return this;           
            }, 
            /**
            *  A shortcut of util.each
            *  
            *  @param {Function} fn - iterator of store
            *  @return {Context}
            */
            each: function(fn) {
                util.each(this.slice, fn);
                return this;
            }, 
            /**
            *  Remove attribute from raw-store
            *  
            *  @param {String|Array} key - a attribute key of raw-store            
            *  @param {Object} options - {silent: {Boolean}}
            *  - silent: suppress change event
            *  @return {Context}
            */
            unset: function(key, options) {
                var unset, slice = this.slice();
                if ('string' === util.type(key)) key = [key];
                util.each(key, function(k) {
                    util.each(slice, function() {
                        if (this[k]) {
                            delete this[k];
                            unset = true;
                        }
                    });
                });
                if (unset && !options.silent) {
                    this.trigger('EVENT_CHANGE');
                }
                return this;
            },
            /**
            *  Removes all raw-stores from the store
            *  
            *  @param {Object} options - {silent: {Boolean}}
            *  - silent: suppress change event
            *  @return {Context}
            */
            clear: function(options) {
                if (!options.silent) {
                    this.trigger('EVENT_CHANGE');
                }            
                this.splice(0);
                return this;
            },  
            /**
            *  Reduce the set of matched stores to those matches the the specified key
            *  
            *  @param {Number|String} key - an index, attribute key
            *  @param {Scalar} val - an attribute value
            *  @param {Boolean} all - whether return only the first match or not
            *  @return {Store}
            */
            eq: function(key, val, all) { 
                var rtr = [];
                if ('number' === util.type(key)) {
                    key = Math.min(key, this.length - 1);
                    if (key < 0) key = this.length + Math.max(key, -this.length); 
                    return this.constructor(this[key]);
                }

                util.each(this.slice(), function() {
                    if (this[key] === val) {
                        if (all) {
                            rtr.push(this);
                        } else {
                            rtr = this;
                            return false;
                        }
                    }
                });

                return this.constructor(rtr); 
            },  
            /**
            *  A shortcut of eq set all to true
            *  
            *  @param {Number|String} key - an index, attribute key
            *  @param {Scalar} val - an attribute value
            *  @return {Store}
            */
            find: function(key, val) {
                return this.eq(key, val, true);
            }, 
            /**
            *  Whether a store has an attribute or not 
            *  
            *  @param {String} key - a attribute key of raw-store
            *  @return {Boolean}
            */
            has: function(key) { return (undefined !== this[0][key]); }, 
            /**
            *  Store's length
            *  
            *  @return {Number}
            */
            size: function() { return this.length; },
            /**
            *  Reduce the set of matched stores to the first in the set
            *  
            *  @return {Store}
            */
            first: function() { return this.eq(0); },
            /**
            *  Reduce the set of matched stores to the last in the set
            *  
            *  @return {Store}
            */
            last: function() { return this.eq(-1); },
            /**
            *  Return a shallow copy of the store's raw-store, 
            *  if the set of matched stores gt 1 will return an array of raw-store
            *  
            *  @return {ObjectArray|Object}
            */
            toJSON: function() { 
                var rtr = this.slice();
                util.each(rtr, function(i, v) {
                    delete v.cid;
                    util.each(v, function(k) {
                        if (this instanceof StoreBase) {
                            v[k] = this.toJSON();
                        }                     
                    })

                });
                if (this.length <= 1) rtr = rtr[0];
                return rtr;
            }       
        }, methods, {require: loader.require, store: loader.store}));         
        // Define a subclass of StoreBase
        function Store(name, proto, noGlobal) {      
            var Klass = ('string' === util.type(name)) ? 
                Class(name, StoreBase, proto, noGlobal) :  
                Class(StoreBase, name, proto);
            Klass.prototype._loader = loader;
            Klass.prototype.constructor = Store;
            return Klass;
        }
        return Store;
    }
});