/**
 *  jHub's `Class` definition function 
 *
 *  Usage: 
 *  Class(name, base, proto), Class(base, proto), 
 *  Class(name, proto), Class(proto),
 *  Class(name, base), Class(base)
 *
 *  @param {String} name - Class name with namespace  
 *  @param {Function} base - Baseclass of class
 *  @param {Object} proto - Class's prototype chain
 *  @param {Boolean} noGlobal - If class name without namespace, whether add to global directly or not
 *  @return {Function}
 *
 *  Copyright(c) 2014 xxx Inc.
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@xxx.com>
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
        return define('jhub.class', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        EVENT_INIT = 'init';
        
        function Class(name, base, proto, noGlobal) {
            var _klass, _base, _proto, namespace;
            if ('string' !== util.type(name)) {
                noGlobal = proto;
                proto = base;
                base = name;
                name = '';
            }            
            if (typeof base === 'object') {
                noGlobal = proto;
                proto = base;
                base = Base;
            }

            _base = new base();
            
            function __proto() {
                // Shallow copy
                util.extend(this, proto);
            }
            __proto.prototype = _base;
            _proto = new __proto();

            function constructor(options) {
                if (!this.__construct) {
                    return new constructor(options);
                }
                
                var k, v;
                // Support "super", only for method
                // util.each don't support array-like object
                for (k in _proto) {
                    v = _proto[k];
                    if ('function' === util.type(v)) {
                        _proto[k] = _(k, v);
                    }
                    
                    function _(k, v) {
                        var _baseParent = function() {
                            return _base[k].apply(this, arguments);
                        };
                        return function() {
                            var _parent = this.parent, rtr;
                            
                            this.parent = _baseParent;
                            rtr = v.apply(this, arguments);
                            this.parent =  _parent;

                            return rtr;
                        };
                    }
                }

                // Prevent affecting other instances, security copy
                _extend(this, _proto);
                
                this.__construct(options);
                if (this.initialize) {
                    this.initialize(options);
                }
                this.trigger(EVENT_INIT);
            }
            constructor.prototype = _proto;
            
            name = name.split('.');
            namespace = name[0];
            name = name[1];
            if (namespace) {
                if (name) {
                    if (!global[namespace]) global[namespace] = {};
                    global[namespace][name] = constructor;
                } else {
                    if (!noGlobal) {
                        global[namespace] = constructor;
                    }
                }                
            } 
            
            return constructor;
        }
        
        // Default super class
        function Base() {}
        Base.prototype = {
            __construct: function() {}
        };  
        
        // Only copy the plain-object and array property from prototype chain, non deep copy
        function _extend(target, source, level) {
            var k, v, isarr;
            for (k in source) {
                v = source[k];
                isarr = ('array' === util.type(v));
                if (!target.hasOwnProperty(k)) {
                    if (level) {
                        target[k] = v;
                    } else if (isarr) {
                        target[k] = [].concat(v);
                    } else if ('object' === util.type(v)) {
                        if (!util.isPlainObject(v)) target[k] = v;
                        else target[k] = _extend({}, v, 1);
                    } 
                }
            }
            return target;
        }
        
        return Class;
    }
});