/**
 *  jHub's art-template template adapter
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
        return define('jhub.template.arttemplate', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var 
        util = require('jhub.util'), 
        Template  = require('jhub.template');
        
        Template.adapter('artTemplate', {
            output: '',
            valid: function () {
                return 'function' === util.type(template);
            },
            init: function (tpl, data, options) {
                if (options && options.openTag && options.closeTag) {
                    template.openTag = options.openTag;
                    template.closeTag = options.closeTag;
                }

                var fn = template.compile(tpl);
                this.output = fn(data);
            }
        });
    }
});