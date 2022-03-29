/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //奖励预览
    var ID = 'jiangliyulan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            X.render({
                panel_bt:function(node){
                    var rh = new X.bRichText({
                        size: 30,
                        maxWidth: node.width,
                        lineHeight: 32,
                        color: "#FFE8C0",
                        family: G.defaultFNT,
                    });
                    rh.setPosition(cc.p(165, 0));
                    rh.text(me.data().title || L('JLYL'));
                    node.addChild(rh);
                }
            },me.nodes);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.ui.finds("panel_tip").hide();
            me.nodes.panel_top.show();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            
            new X.bView("ui_hdwp.json", function (node) {
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(node);
                me.view = node;
                if(me.DATA.callback){
                    me.view.nodes.btn_qr.setTitleText(me.DATA.btnTxt || L("QW"));
                    me.view.nodes.btn_qr.click(function (sender, type) {
                        me.DATA.callback();
                        me.remove();
                    });
                }else{
                    me.view.nodes.btn_qr.click(function (sender, type) {
                        me.remove();
                    });
                }
                me.setContents();
            })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            if(me.DATA.prize){
                X.lengthChangeByPanel(me.DATA.prize, me.view.nodes.panel_1, me.view.nodes.listview_1, {
                    num: 5,
                    touch:true,
                    scale: .9
                });
            }

            if(me.DATA.layer) {
                var rh = new X.bRichText({
                    size: 20,
                    maxWidth: me.view.nodes.panel_wz.width,
                    lineHeight: 32,
                    color: "#FFE8C0",
                    family: G.defaultFNT,
                });
                rh.setAnchorPoint(0.5, 0.5);
                rh.setPosition(cc.p(me.view.nodes.panel_wz.width / 2 - 20, 20));
                rh.text(X.STR(L('JLSDLQBX'), me.DATA.layer));
                me.view.nodes.panel_wz.addChild(rh);
            }

            me.nodes.txt_title.setString(me.DATA.title || L("JLYL"));
        },
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();