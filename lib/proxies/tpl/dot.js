/**
 *  jHub's doT proxy
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
        return define('jhub.template.dot', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('../../core/jhub.util'), 
        Template  = require('../../core/jhub.template'),
        doT = require('/jhub/example/browser/doT.js');
        
        Template.proxy('dot', {
            output: '',
            valid: function () {
                return 'object' === util.type(doT);
            },
            init: function (tpl, data, options) {
                var fn = doT.template(tpl, options);
                return this.output = fn(data);
            }
        });
    }
});