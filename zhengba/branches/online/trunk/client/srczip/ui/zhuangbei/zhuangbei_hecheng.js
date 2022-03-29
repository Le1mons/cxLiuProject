/**
 * Created by zhangming on 2018-05-17
 */
(function () {
    //装备合成
    var ID = 'zhuangbei_hecheng';

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
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_TJP'));

            me.nodes.mask.click(function(){
                me.remove();
            });

            me.nodes.btn_guanbi.click(function(){
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

            // 装备选择
            new X.bView('zhuangbei_zbxz2.json',function(viewTop){
                me.ui.nodes.panel_nr_up.addChild(viewTop);
                me._viewTop = viewTop;

                new X.bView('zhuangbei_hecheng.json',function(viewBottom){
                    me.ui.nodes.panel_nr_down.addChild(viewBottom);
                    me._viewBottom = viewBottom;
                    me.bindUI();
                    // me.setContents();
                });
            });
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();