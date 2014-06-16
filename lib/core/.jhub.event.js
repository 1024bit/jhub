/**
 *  jHub's `Event` class
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
        return define('jhub.event', [], factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        eventRegistry = {};
        
        // A simple implementing of jQuery.Event
        function Event(event, props) {
            event = ('string' === util.type(event)) ? {
                type: event
            } : {
                originalEvent: event,
                type: event.type
            };
            util.extend(true, event, props);
            return event;
        }

        // Notify an event
        Event.notify = function(event, data, addPrefix) {
            var
            listener, listeners, result, defaultPrevented, 
            args, namespaces, type, callback, orig, i;

            if ('string' === util.type(event)) {
                namespaces = event.split('.');
                event = namespaces.shift();
            }
            // Ensure the event is a new instance
            event = Event(event, {namespace: namespaces.join('.')});
            data = [].concat(data);
            addPrefix = addPrefix || true;
            type = event.type;
            callback = this[type];
            orig = event.originalEvent;
            
            if (orig) {
                // You may not want to append namespace to the event which export to the external
                if (event.namespace) orig.namespace = "";
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }
            
            type = (!type.indexOf(this.eventPrefix) ? type : (!addPrefix ? type : this.eventPrefix + type)).toLowerCase();
            event.type = type;
            listeners = eventRegistry[this.uuid][type];         
            if (!event.target) event.target = this; 
            args = [event].concat(data);

            for (i = 0; i < listeners.length; i++) {
                listener = listeners[i];
                if (!event.namespace || ~listener.namespace.indexOf(event.namespace)) {
                    event.data = listener.data;
                    if ((result = listener.handler.apply(this, args)) === false) {
                        defaultPrevented = true;
                    }
                    if (result !== undefined) {
                        event.result = result;
                        orig && (orig.result = result);
                    }
                }
            }

            return !(
                (('function' === util.type(callback)) &&
                (callback.apply(this, args) === false)) ||
                defaultPrevented === true);
        }

        // Register or unregister an event
        // Event.watch(type, data, listener), Event.unwatch(type) or Event.unwatch()
        // on can accepts event object?
        util.each('watch unwatch'.split(' '), function(i, method) {
            Event[method] = function(type, data, listener) {
                if ('function' === util.type(data)) {
                    listener = data;
                    data = undefined;
                }
                var
                self = this, i = 0, 
                off = ('unwatch' === method),
                events, types, namespaces, namespace;
                
                if (off) {
                    if (!arguments.length) // Prevent from removing all events of ill-considered action
                        delete eventRegistry[this.uuid];
                    listener = data;
                }
                if ('string' === util.type(type)) {
                    types = type.split(' ');
                    for (; i < types.length; i++) {
                        type = types[i];
                        namespaces = type.split('.');
                        type = namespaces.shift();
                        namespace = namespaces.join('.');
                        if (off) {
                            if (type) {
                                // unwatch(type), unwatch(xxx.xxx)
                                // Sometimes, you must focus the main other than do the lesser overly
                                iterator = eventRegistry[this.uuid][type];
                                if (!namespace) {
                                    delete eventRegistry[this.uuid][type]; 
                                } else {
                                    util.each(iterator, function(i) {
                                        util.each(this, function() {
                                            if (~this.namespace.indexOf(namespace)) {
                                                iterator.splice(i, 1);
                                            }                                            
                                        });
                                    });
                                }
                            } 
                        } else {
                            if (!eventRegistry[this.uuid]) eventRegistry[this.uuid] = {};
                            if (!eventRegistry[this.uuid][type]) eventRegistry[this.uuid][type] = [];
                            
                            eventRegistry[this.uuid][type].push({
                                data: data,
                                handler: handlerProxy,
                                namespace: namespace
                            });
                        }
                        function handlerProxy() { return listener.apply(self, arguments); }
                    }
                } else {
                    events = type;
                    for (type in events)
                        Event[method](type, data, listener);
                }
                return this;
            };
        });
        
        return Event;
    }
}); 