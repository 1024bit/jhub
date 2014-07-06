// 视图index
define(function(require, exports, module) {
    return jHub.View({
        initialize: function() {
            // 事件
            this.on({
                'change .input': function(e) {
                    console.log('Send an event to cpu!');
                    // 传递消息
                    this.trigger('change', e.target.value);
                }
            });
            
        }, 
        render: function() {
            // 加载模板
            this.template('../templates/index.dot', function(tpl) {
                this.$el.html(tpl);
            });
        }
    });
});