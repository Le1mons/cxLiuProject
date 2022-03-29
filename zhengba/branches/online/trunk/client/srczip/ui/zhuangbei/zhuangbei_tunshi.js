/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    //装备吞噬
    var ID = 'zhuangbei_tunshi';

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
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_ZBTS'));

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

            // 装备选择
            new X.bView('zhuangbei_zbxz.json',function(viewTop){
                me.ui.nodes.panel_nr1.addChild(viewTop);
                me._viewTop = viewTop;

                new X.bView('zhuangbei_tunshi.json',function(viewBottom){
                    me.ui.nodes.panel_nr2.addChild(viewBottom);
                    me._viewBottom = viewBottom;
                    me.bindUI();
                    // G.frame.yingxiong_xxxx.getNextBuff('dengjielv', me.curXbId, function(buff){
                        me.setContents();
                    // });
                });

            });
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();