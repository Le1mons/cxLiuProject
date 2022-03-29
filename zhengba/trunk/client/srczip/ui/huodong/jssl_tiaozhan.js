/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'jssl_tiaozhan';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.btn_lx.hide();
            me.bindBtn();
            me.diff = me.data().diff;
            me.npc = me.data().npc;
            me.prize = me.data().prize;
            me.zhanli = me.data().zhanli;
            me.hdid = me.data().hdid;

            me.nodes.text_guanqia.setString(L("JSSLTIAOZHAN" + me.diff));//关卡类型
            me.nodes.text_dr.setString(L("JSSLTITLE"));//npc名字，目前前端写死

        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_zd.click(function () {
                G.frame.yingxiong_fight.data({
                    pvType: "syzlb",
                    data: {
                        enemy: me.npc,
                        isNpc: true
                    },
                    hdid: me.hdid,
                    index: me.diff,
                    prizenum:me.prize[0].n,
                    zhanli: me.zhanli,
                }).once("hide",function () {
                    me.remove();
                }).show();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var enemyConf = G.class.npc.getById(me.npc);
            var boss = G.class.shero(enemyConf[0]);
            var bossArr = [].concat(boss);
            X.center(bossArr, me.nodes.panel_ico1, {
                callback: function (node) {
                    node.setScale(.8);
                }
            });
            X.alignItems(me.nodes.panel_ico2, me.prize, "center", {
                touch: true
            });
            me.nodes.text_zdl1.setString(parseInt(me.zhanli));
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('julongshendian_dsxx.json', ID);
})();