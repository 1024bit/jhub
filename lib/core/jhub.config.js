/**
 *  jHub's `config` object
 *  
 *  Copyright(c) 2014 Vip Inc.
 *  Copyright(c) 2014 Cherish Peng<cherish.peng@vipshop.com>
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
    // Support cmd && amd
    if (define && (define.cmd || define.amd)) {  
        return define('jhub.config', factory);
    }
    return factory(require);

	function factory(require, exports) {
   
        var 
        util = require('./jhub.util'), 
        // Setting's tuples: 
        // apppath, modulePath, viewPath, storePath,  // Must be absolute or root path with `/` suffix
        // tplProxy, dependencies         
        settings = {};
        
        return {
            get: function(k) {
                return settings[k];
            },
            set: function(k, v) {
                if ('object' === typeof k)
                    util.extend(true, settings, k);
                else if ('object' === typeof v && 'object' === typeof settings[k])
                    settings[k] = util.extend(true, settings[k], v);
                else 
                    settings[k] = v;
            }
        };        
    }
});