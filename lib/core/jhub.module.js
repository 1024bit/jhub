/**
 *  jHub's `Module` class 
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
        return define('jhub.module', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'),
        loader = require('./jhub.loader'), 
        Class = require('./jhub.class'),         
        Base = require('./jhub.base'), 
        EVENT_INIT = 'init', 
        ModuleBase = Class(Base, util.extend({
            __construct: function(options) {
                this.parent.call(this, options);
                this.on(this.eventPrefix + EVENT_INIT, function() {
                    if (this._renderBuffer.firstChild) {
                        this.$el.append(this._renderBuffer);
                    }
                });
            }, 
            eventPrefix: 'module', 
            defaultEl: '<div>', 
            _renderBuffer: util.createBuffer(),  
        }, {
            require: loader.require, 
            module: loader.module, 
            store: loader.store, 
            view: function() {
                var view = loader.view.apply(this, arguments);
                if (!util.contains(util.document, view.$el[0])) {
                    this._renderBuffer.appendChild(view.$el[0]);
                }
                return this;
            },             
        }));
        // Define a subclass of ModuleBase
        function Module(name, proto, noGlobal) {
            var Klass = ('string' === util.type(name)) ? 
                Class(name, ModuleBase, proto, noGlobal) :  
                Class(ModuleBase, name, proto);
            Klass.prototype._loader = loader;
            Klass.prototype.constructor = Module;
            return Klass;
        }
        return Module;
    }
});
