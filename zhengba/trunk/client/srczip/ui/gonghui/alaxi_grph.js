/**
 * Created by  on 2019//.
 */
(function () {
    //个人排行
    var ID = 'alaxi_grph';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.type = 1;
            cc.enableScrollBar(me.nodes.listview);
            me.bindBtn();
            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('alaxi'))
            });
            me.nodes.listview.children[2].setVisible(P.gud.ghpower < 3);//只有会长和官员可以看
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.topMenu.changeMenu(me.type);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        changeType: function(sender) {
            var me = this;
            var type = sender.data.id;
            me.type = type;
            me.setPanel(me.type);
        },
        setPanel:function(type){
            var me = this;
            var viewConf = {
                "1":G.class.alaxi_kfph,//跨服排行
                "2":G.class.alaxi_ghpm,//公会排行
                "3":G.class.alaxi_ghtj,//公会统计
            };
            var panel = new viewConf[type](me.type);
            me.ui.finds("p_nr").addChild(panel);
            if(me.panle) me.panle.removeFromParent();
            me.panle = panel;
        },
    });
    G.frame[ID] = new fun('ui_tip10.json', ID);
})();