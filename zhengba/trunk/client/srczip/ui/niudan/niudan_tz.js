/**
 * Created by
 */
(function () {
    //
    var ID = 'niudan_tz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_zd.click(function (sender, type) {
                G.frame.yingxiong_fight.data({
                    pvType:'niudanFight',
                }).show();
                me.remove();
            });
        },
        onShow: function () {
            var me = this;

            X.alignCenter(me.nodes.panel_ico2, G.gc.niudan.fightinfo.prize, {
                touch: true
            });

            var arr = [];
            var zhanli = 0;
            var enemyConf = G.gc.npc[G.gc.niudan.fightinfo.npcid];
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
        },
        onAniShow: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        }
    });
    G.frame[ID] = new fun('zhengguniudan_tankuang1.json', ID);
})();