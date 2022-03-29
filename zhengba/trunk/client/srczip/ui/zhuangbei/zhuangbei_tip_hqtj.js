/**
 * Created by zhangming on 2018-05-14
 */
(function(){
 // 获取途径
G.class.zhuangbei_tip_hqtj = X.bView.extend({
    ctor: function (callback) {
        var me = this;
        me._super('zhuangbei_tip2.json', function(){
            var size = cc.size(534, 169);
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
        var data = G.DATA.yingxion
    },
    bindBTN:function() {
        var me = this;

        // 铁匠铺
        me.nodes.button_tjp.click(function(){
        });

        // 成就
        me.nodes.button_cj.click(function(){
        });

        // 挂机
        me.nodes.button_gj.click(function(){
        });

        // 市场
        me.nodes.button_sc.click(function(){
        });

        // 许愿池
        me.nodes.button_xyc.click(function(){
        });
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