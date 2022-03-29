/**
 * Created by LYF on 2018/6/8.
 */
(function () {
    //挑战
    var ID = 'dafashita_tiaozhan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_lx.click(function (sender, type) {
                G.frame.dafashita_jxtg.data(me.data().conf.id).show();
            });
            me.nodes.btn_zd.click(function (seder, type) {
                var obj = {
                    pvType:'pvdafashita',
                    data:me.data().conf.id
                };
                G.frame.yingxiong_fight.data(obj).show();
            })
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openguanqia.mp3");
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
            X.audio.playEffect("sound/openguanqia.mp3");
        },
        setContents: function () {
            var me = this;
            var zhanli = 0;
            var bossArr = [];
            var conf = me.data().conf;
            var enemyConf = G.class.npc.getById(conf.boss);
            me.nodes.text_guanqia.setString(X.STR(L('TANXIAN_CENG'),conf.id));
            for(var i = 0; i < enemyConf.length; i ++){
                var boss = G.class.shero(enemyConf[i]);
                var info = G.class.herogrow.getById(enemyConf[i].hid);
                zhanli += info.hp + info.hp_grow * (enemyConf[i].lv - 1) / 6;
                zhanli += info.atk + info.atk_grow * (enemyConf[i].lv - 1);
                zhanli += info.def + info.def_grow * (enemyConf[i].lv - 1);
                bossArr.push(boss);
            }
            X.center(bossArr, me.nodes.panel_ico1, {
                callback: function (node) {
                    node.setScale(.8);
                }
            });
            me.nodes.text_zdl1.setString(parseInt(zhanli));
            X.alignItems(me.nodes.panel_ico2, conf.prize, "center", {
                touch: true
            })
        },
    });
    G.frame[ID] = new fun('julongshendian_dsxx.json', ID);
})();