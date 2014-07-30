/**
 *  jHub's util
 *  May be u want to replace the jQuery, just enjoy yourself! 
 *  But wait, why u want to do that? Send me!
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
        // Amd module was already supported by jQuery internally
        if (define.cmd) {
            define('jquery', [], function(require, exports) {
				// May be jQuery.noConflict(true) was executed before.
				if (global.jQuery) {
					return global.jQuery;
				}
			});
        }     
        return define('jhub.util', factory);
    }
    // Common
    return factory(require);
    
    function factory(require, exports) {
        var jQuery = require('jquery');
        return {
            /**
            *  Support compatible between Browser and Node.js env
            */
            $: jQuery, 
            document: document, 
            contains: jQuery.contains, 
            createBuffer: function() {
                return document.createDocumentFragment();
            }, 
            
            /**
            *  Utils
            */ 
            guid: jQuery.guid, 
            extend: jQuery.extend, 
            Deferred: jQuery.Deferred, 
            Event: jQuery.Event, 
            each: jQuery.each, 
            makeArray: jQuery.makeArray,
            type: jQuery.type, 
            isEmptyObject: jQuery.isEmptyObject, 
            isPlainObject: jQuery.isPlainObject, 
            proxy: jQuery.proxy, 
            isFunction: jQuery.isFunction
        };
    }
});