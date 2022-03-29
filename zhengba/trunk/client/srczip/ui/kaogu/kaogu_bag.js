/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-背包
    var ID = 'kaogu_bag';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
        },
        onShow:function(){
            var me = this;
        }
    });

    G.frame[ID] = new fun('kaogu_beibao.json', ID);
})();