// ģ��index
define(function(require, exports, module) {
    return jHub.Module({ 
        el: '#index1', 
        initialize: function() {
            var indexStore;
            
            // ����
            this.require('index2');
            
            // ��ʼ����ģ��
            this.module('index3');
            this.module('index4'); 
            
            // ��ʼ������ģ��
            // Ҳ����д�����ַ��
            // indexStore = this.store('index.store', {title: 'Welcome!', user: 'Cherish Peng'});
            // indexStore.watch({'viewchange': function() {}});
            this.store('index.store', {title: 'Welcome!', user: 'VIP'}, function(store) {
                indexStore = store;
                this.on('viewchange', function(e, user) { 
                    this.set('user', user);
                });
            });

            // ��ʼ����ͼ
            this.view('index.view', {id: 'main', store: indexStore}, function() {
                this.on('storechange', function(e) {
                    this.render();
                });
            });
        }
    });
});
