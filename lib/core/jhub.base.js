/**
 *  jHub's `Base` class
 *  You can design a flow for all subclasses
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
        return define('jhub.base', [], factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        Class = require('./jhub.class'), 
        uuid = 0, EVENT_REMOVE = 'remove', 
        Base = Class({
            __construct: function(options) {
                this.parent.call(this, options);
                // Deep copy the options, this's very important!
                options = util.extend(true, {}, options);
                // util.$ will return a new obj when treat an object with a length prop
                this.$el = util.$(options.el || this.el || this.defaultEl || this);

                this.uuid = uuid++;
                this.eventNamespace = '.' + this.uuid;

                this.on(EVENT_REMOVE, function(event) {
                    // Filter remove event bubble from child nodes
                    if (event.target === this.$el[0]) {
                        this.destroy();
                    }
                });
            }, 
            eventPrefix: '', 
            $: function (selector, context) {
                return util.$(selector, context || this.$el);
            },  
            on: function (types, selector, data, handler) {
                var 
                instance = this, events = types, 
                delegateElement = this.$el || this;

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
                
                // jquery.ui.widget's _on method
                util.each(events, function(event, handler) {
                    var match, eventName;
                    function handlerProxy() {
                        return (typeof handler === "string" ? instance[handler] : handler)
                            .apply(instance, arguments);
                    }

                    // copy the guid so direct unbinding works
                    if (typeof handler !== "string") {
                        handlerProxy.guid = handler.guid =
                            handler.guid || handlerProxy.guid || util.guid++;
                    }

                    match = event.match(/^(\w+)\s*(.*)$/);
                    eventName = match[1] + instance.eventNamespace;
                    selector = match[2] || selector;
                    delegateElement.on(eventName, selector, data, handlerProxy);
                });
                
                return this;
            }, 
            // By default add event prefix
            trigger: function (event, data, addPrefix) {
                var prop, orig, callback, type, namespaces;

                if ('string' === util.type(event)) {
                    namespaces = event.split('.');
                    event = namespaces.shift();
                }
                // Ensure the event is a new instance
                event = util.Event(event, {namespace: namespaces.join('.')});
                data = [].concat(data);
                addPrefix = (addPrefix !== undefined) ? addPrefix : true;
                type = event.type;
                callback = this[type];
                orig = event.originalEvent;
                
                if (orig) {
                    // You may not want to append namespace to the event which export to the external
                    orig.namespace = "";
                    for (prop in orig) {
                        if (!(prop in event)) {
                            event[prop] = orig[prop];
                        }
                    }
                }
                type = (!type.indexOf(this.eventPrefix) ? type : (!addPrefix ? type : this.eventPrefix + type)).toLowerCase();
                event.type = type;
                
                if (!event.target) event.target = this.$el[0];
                this.$el.trigger(event, data);
                
                return !(util.isFunction(callback) &&
                    callback.apply(this, [event].concat(data)) === false ||
                    event.isDefaultPrevented());
            }, 
            // In theory, a UI object must implement a destroy method
            // Two scene: call destroy manually and remove this.el
            destroy: function() {
                this.off(this.eventNamespace);
            }
        });         

        return Base;
    }
});