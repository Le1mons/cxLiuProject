/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //关卡信息
    var ID = 'shendian_dsxx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_guanqia.setString(me.DATA.conf.name + "-" + X.STR(L("DXG"), me.DATA.layer));
            me.nodes.text_dr.setString(L("DLSW"));
            // me.nodes.panel_xx.hide();
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_lx.click(function () {

                G.frame.shendian_video.data({
                    path: me.data().path,
                    layer: me.data().layer
                }).show();
            });


            me.nodes.btn_zd.click(function (sender, type) {
                var obj = {
                    pvType:'sddl',
                    idx: me.DATA.path,
                    zz: me.DATA.conf.zhongzu,
                    prize: me.DATA.bossConf.prize,
                    map: me.DATA.bossConf.map,
                    level : me.DATA.layer
                };
                G.frame.yingxiong_fight.data(obj).show();
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.DATA = me.data();

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
        },
        setContents: function () {
            var me = this;
            var arr = [];
            var zhanli = 0;
            var enemyConf = G.gc.npc[me.DATA.bossConf.boss];
            for(var i in enemyConf){
                var enemy = G.class.shero(enemyConf[i]);
                var info = G.class.herogrow.getById(enemyConf[i].hid);
                zhanli += (info.hp + info.hp_grow * (enemyConf[i].lv - 1)) / 6 * enemyConf[i].buffpro.hp;
                zhanli += info.atk + info.atk_grow * (enemyConf[i].lv - 1) * enemyConf[i].buffpro.atk;
                zhanli += info.def + info.def_grow * (enemyConf[i].lv - 1);
                arr.push(enemy);
            }
            me.nodes.text_zdl1.setString(parseInt(zhanli));
            X.center(arr, me.nodes.panel_ico1, {
                scale: .7
            });
            X.alignCenter(me.nodes.panel_ico2, me.DATA.bossConf.prize, {
                name: "",
                touch: true,
                scale: .8,
                callback: function () {

                }
            });
        },
    });
    G.frame[ID] = new fun('julongshendian_dsxx.json', ID);
})();