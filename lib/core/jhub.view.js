/**
 *  jHub's `View` class 
 *
 *  Copyright(c) 2014 Vip Inc.
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@vipshop.com>
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
        return define('jhub.view', [], factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        config = require('./jhub.config'), 
        loader = require('./jhub.loader'),  
        Template = require('./jhub.template'), 
        Class = require('./jhub.class'), 
        Base = require('./jhub.base'),  
        EVENT_INIT = 'init',         
        ViewBase = Class(Base, util.extend({
            __construct: function(options) {
                this.parent.call(this);
                var self = this, defaults = {
                    attributes: {}
                }, classname;
                options = util.extend(true, {}, defaults, options);
                if (options.id) this.$el[0].id = options.id;
                if (options.className) {
                    this.$el.addClass(options.className);
                    // classname = this.el.getAttribute('class') ;
                    // if (!(new RegExp('^|\\s' + options.className + '\\s|$')).test(options.className)) {
                    //     this.el.className = classname + ' ' + options.className;
                    // }
                }
                this.$el.attr(options.attributes);
                this.store = options.store;
                
                this.on(this.eventPrefix + EVENT_INIT, function() {
                    this.render();
                });                
            }, 
            eventPrefix: 'view',
            defaultEl: '<div>', 
            /**
            *
            *
            *  @param {String} id - 
            *  @param {Object} options - 
            *  @return {Context}
            */
            template: function(id, options, callback) {
                var self = this, ext, tpl, _callback;
                if ('object' === util.type(id)) {
                    // (options, callback)
                    callback = options;
                    options = id;
                    id = undefined;
                } else if ('function' === util.type(options)) {
                    // (id, callback)
                    callback = options;
                    options = undefined;
                } else if ('function' === util.type(id)) {
                    // (callback)
                    callback = id;
                    options = id = undefined;
                }
                _callback = callback;
                callback = function() {
                    return _callback.apply(self, arguments)
                };
                if (util.isEmptyObject(options)) {
                    // if (id) {
                        // ext = .ext
                        // if (Template.proxies[ext]) options = {name: ext};
                    // } else {
                        options = config.get('tplProxy');
                    // }
                }
                if (id) {                
                    this.require(id, function(tpl) { 
                        tpl = _template(tpl); 
                        if (callback) callback(tpl);
                    });
                } else {
                    tpl = _template();
                    if (callback) callback(tpl);
                }
                
                return this;
                
                function _template(tpl) {
                    return Template(tpl || self.$el.html(), self.store.toJSON(), options);
                }                 
            }, 
            
            on: function(types, selector, data, handler) {
                if (!this.store) {
                    return this.parent.apply(this, arguments);
                }
                var 
                self = this, storeTypes = {}, events = types, 
                storeEventPrefix = this.store.eventPrefix;
                
                if (data == null && handler == null) { 
                    // (types, handler)
                    handler = selector;
                    data = selector = undefined;
                } else if (handler == null) { 
                    if (typeof selector == 'string') { 
                        // (types, selector, handler)
                        handler = data;
                        data = undefined;
                    } else { 
                        // (types, data, handler)
                        handler = data;
                        data = selector;
                        selector = undefined;
                    }
                }
                
                if ('string' === util.type(types)) {
                    events = {};
                    util.each(types.split(' '), function() {
                        events[this] = handler;
                    });
                }

                util.each(events, function(k, v) {
                    if (!k.indexOf(storeEventPrefix)) {
                        storeTypes[k] = function() {
                            v.apply(self, arguments);
                        };
                    }
                });
                
                this.store.on(storeTypes, selector, data, handler);
                return this.parent.apply(this, [types, selector, data, handler]);
            }, 
            // By default add event prefix
            trigger: function (event, data, addPrefix) {
                if (this.store) {
                    this.store.trigger(this.eventPrefix + event, data, false);
                }
                return this.parent.apply(this, arguments);
            }, 
            // Do what u want, just override this function
            render: function() {}, 
            remove: function() {}
        }, {require: loader.require, view: loader.view}));         
        // Define a subclass of ViewBase
        function View(name, proto, noGlobal) {
            var Klass = ('string' === util.type(name)) ? 
                Class(name, ViewBase, proto, noGlobal) :  
                Class(ViewBase, name, proto);
            Klass.prototype._loader = loader;
            Klass.prototype.constructor = View;
            return Klass;
        }
        return View;
    }    
});