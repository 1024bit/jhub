/**
 *  jHub's loader object
 *  
 *  Copyright(c) 2014 xxx Inc.
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@xxx.com>
 *  MIT Licensed
 */
(function(global, factory) {
    // Node.js, CommonJS, CommonJS Like
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory(global, true);
    } else {
        factory(global);
    }
})(this, function(global, noGlobal) {
    var loader = {};
    // Support cmd && amd
    if (define && (define.cmd || define.amd)) { 
        return define('jhub.loader', factory);
    }
    return factory(require);

    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        config = require('./jhub.config');

        util.each('require module store view'.split(' '), function(i, name) {
            var require = global.require, deps, proxies;
            loader[name] = function(id, options, callback) {
                if ('function' === util.type(options)) {
                    callback = options;
                    options = undefined;
                }
                
                // Prefetch
                deps = config.get('dependencies') || [];
                /*
                proxies = config.get('proxies');
                
                if (proxies) 
                    util.each(proxies, function(k) {
                        util.each(this, function(i, v) {
                            deps = deps.concat('../proxies/' + k + '/' + v);
                            if ('tpl' === k) {
                                jNode.addType('document', v);
                            }                            
                        });

                    });
                */
                if (deps.length) jNode.set('deps', deps);
                
                if ('require' === name) {                
                    return require.call(this._loader, id, callback);
                }
                // module, store, and view are shortcut of require
                id = rule(id);
                if (this._loader && this._loader.status === 4) {
                    Class = require.call(this._loader, id);
                    return instantiate(Class);
                } else {
                    return require.call(this._loader, id, instantiate);
                }
                
                function instantiate(Class) {
                    // if (name !== 'view') {
                    var instance = new Class(options);
                    if (callback) callback.call(instance, instance);
                    return instance;
                    // }
                }                
            };
            
            // Add a rule for extracting module dependencies
            if ('require' !== name) {  
                jNode.addRule(name, rule);
            }
            
            function rule(id) {
                var path = '';
                if (!id.indexOf('/') || !~id.indexOf('//')) { // Non-Root and Non-Abs path
                    path = config.get(name + 'Path');
                    if (!path) {
                        path = config.get('appPath');
                        if (path) path += name + 's' + '/';
                    }
                } 
                if (path) id = path + id;
                return id;
            }            
        });        
        jNode.on('moduleexecute', function(e, module, Class) {
            if ('function' === util.type(Class) && Class.prototype._loader === loader) {
                Class.prototype._loader = module;
            }
        });
        jNode.addType('document', 'dot');
        return loader;
    }
});