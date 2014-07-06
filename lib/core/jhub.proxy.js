/**
 *  jHub's `ProxyFactory` class
 *  A proxy is a sigleton object
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
        return define('jhub.proxy', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('./jhub.util'), 
        IMPLEMENT = 'proxy output valid init';
        function ProxyFactory(implementList) {
            implementList = IMPLEMENT + (implementList ? (' ' + implementList) : '');
            function Proxy() {
                var proxy, args = [].slice.call(arguments), options = args.pop();
                if (options.name) {
                    proxy = Proxy.proxies[options.name];
                    // Apply validator to proxy
                    if (proxy && !proxy.valid()) {
                        proxy = undefined;
                        throw 'Unknown proxy.';
                    }
                } 
                if (!proxy) throw 'Must provide a proxy name.';
                // Initialize
                return proxy.init.apply(proxy, args.concat(options.options));
            }

            Proxy.proxies = {};
            Proxy.proxy = function(id, obj) {
                obj['proxy'] = id;
                // Apply implement to adaper
                var implementing = implementList.split(' ');
                util.each(obj, function(key) {
                    if (!new RegExp('^|\\s' + key + '\\s|$').test(implementList)) {
                        throw 'Invalid proxy! Nonstandard method: ' + key;
                    }
                });
                
                Proxy.proxies[id] = obj;
            };
            
            return Proxy;
        }
        return ProxyFactory;
    }
});