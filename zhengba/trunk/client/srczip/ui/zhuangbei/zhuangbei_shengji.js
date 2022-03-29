/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    //宝石升级
    var ID = 'zhuangbei_shengji';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        setContents:function() {
            var me = this;

        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_ZBSJ'));

            me.nodes.mask.click(function(){
                me.remove();
            });
            
            // me._view.nodes.btn_qr.click(function(){
            //     me.remove();
            // });
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            // me.curXbId = me.data().tid;

            var view = new X.bView('zhuangbei_shengji.json',function(view){
                me.ui.nodes.panel_nr.addChild(view);
                me._view = view;
                me.bindUI();
                // G.frame.yingxiong_xxxx.getNextBuff('dengjielv', me.curXbId, function(buff){
                    me.setContents();
                // });
            });
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();