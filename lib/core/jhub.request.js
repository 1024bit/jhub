/**
 *  jHub's `Request` proxy class
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
        return define('jhub.request', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        Proxy = require('./jhub.proxy'), 
        Request = Proxy();
        return Request;
    }
}); 