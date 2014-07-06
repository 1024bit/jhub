/**
 *  jHub's bootstrap
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
	var jHub = {};
    
	if (!noGlobal) {
		global.jHub = global.$H = jHub;
	}

    // Support cmd && amd
    if (define && (define.cmd || define.amd)) {
        return define('jhub', factory);
    }
    return factory(require);

	function factory(require, exports) {
        // Dependencies
        var 
        util = require('./jhub.util'), 
        config = require('./jhub.config'), 
        loader = require('./jhub.loader');
        
        // Export API
        jHub.Class = require('./jhub.class');
        jHub.Module = require('./jhub.module');
        jHub.View = require('./jhub.view');
        jHub.Store = require('./jhub.store');        
        jHub.get = config.get;
        jHub.set = config.set;
        jHub.load = loader.module;
        
        return jHub;
	}
});
