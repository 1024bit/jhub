// 模块index
define(function(require, exports, module) {
    return jHub.Module({ 
        el: '#index1', 
        initialize: function() {
            var indexStore;
            
            // 依赖
            this.require('index2');
            
            // 初始化子模块
            this.module('index3');
            this.module('index4'); 
            
            // 初始化数据模型
            // 也可以写成这种风格
            // indexStore = this.store('index.store', {title: 'Welcome!', user: 'Cherish Peng'});
            // indexStore.watch({'viewchange': function() {}});
            this.store('index.store', {title: 'Welcome!', user: 'VIP'}, function(store) {
                indexStore = store;
                this.on('viewchange', function(e, user) { 
                    this.set('user', user);
                });
            });

            // 初始化视图
            this.view('index.view', {id: 'main', store: indexStore}, function() {
                this.on('storechange', function(e) {
                    this.render();
                });
            });
        }
    });
});
