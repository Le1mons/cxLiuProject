/**
 * Created by zhangming on 2018-05-14
 */
(function(){
 // 出售物品
G.class.zhuangbei_tip_cs = X.bView.extend({
    ctor: function (callback) {
        var me = this;
        me._super('zhuangbei_tip3.json', function(){
            var size = cc.size(534, 350);
            me.setContentSize( size );
            me.ui.setContentSize( me.getContentSize() );
            ccui.helper.doLayout( me.ui );
            callback && callback();
        }, {autoFillSize:false});
    },
    refreshPanel: function(){
        var me = this;
    },
    setContents:function() {
        var me = this;

        // panel_1$ Layout 物品框
        // text_1$ text 物品名称

        // btn_1$ 按钮减
        // btn_2$ 按钮加
        // btn_3$ 出售

        // textField_5$ 数量文本框, 可输入
        // text_2$ text 消耗金币数
    },
    bindBTN:function() {
        var me = this;

        // me.nodes.mask.click(function(){
        //     me.remove();
        // });

        // 减号
        me.nodes.btn_1.click(function(){
        });

        // 加号
        me.nodes.btn_2.click(function(){
        });

        // 出售
        // me.nodes.btn_3.click(function(){
        //     me.remove();
        // });
    },
    onOpen: function () {
        var me = this;
        me.bindBTN();
    },
    onShow : function(){
        var me = this;
        me.refreshPanel();

        // G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
        //     if(G.frame.yingxiong_xxxx.getCurType() == me._type){
        //         me.refreshPanel();
        //     }else{
        //         me._needRefresh = true;
        //     }
        // }, me.getViewJson());
    },
    onNodeShow : function(){
        var me = this;
        
        // if(me._needRefresh){
        //     delete me._needRefresh;
        //     me.refreshPanel();
        // }
    },
    onRemove: function () {
        var me = this;
    },
});

})();