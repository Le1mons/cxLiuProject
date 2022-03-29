/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //关卡信息
    var ID = 'sizijunyuanzheng_dsxx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });


            if(me.DATA.isOk) {
                me.nodes.btn_zd.hide();
                me.nodes.text_zd.hide();
                me.nodes.img_zd.hide();
                me.nodes.img_ytz.show();
            }
            me.nodes.btn_zd.click(function (sender, type) {
                var obj = {
                    pvType:'pvshizijun',
                    idx:me.DATA.idx,
                    prize: G.class.shizijunyuanzheng.getConf().base.passprize[me.DATA.idx.toString()]
                };
                G.frame.yingxiong_fight.data(obj).show();
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
            var arr = [];
            var me = this;
            var sqid = "";
            var enemyConf = me.DATA.conf.rival;
            var headData = me.DATA.conf.headdata;
            var tx = G.class.shead(headData);
            tx.setPosition(me.nodes.panel_tx.width / 2, me.nodes.panel_tx.height / 2);
            me.nodes.text_mz.setString(headData.name);
            me.nodes.panel_tx.addChild(tx);
            if(me.DATA.conf.isnpc){
                me.nodes.text_zdl1.setString(999999);
                me.nodes.text_wz.setString("S100");
            }else{
                me.nodes.text_zdl1.setString(me.DATA.conf.zhanli);
                me.nodes.text_wz.setString(me.DATA.conf.sname);
            }

            for (var i in enemyConf) {
                if(enemyConf[i].sqid) {
                    sqid = enemyConf[i].sqid;
                    enemyConf.splice(i, 1);
                    break;
                }
            }

            for(var i in enemyConf){
                var list = me.nodes.list_ico1.clone();
                var conf = enemyConf[i];
                var enemy = G.class.shero(conf);
                var hp = conf.hp >= conf.maxhp? 100 : conf.hp / conf.maxhp * 100;
                if(me.DATA.isOk) hp = 0;
                enemy.setHP(hp, true);
                enemy.setPosition(list.width / 2, list.height / 2);
                enemy.setArtifact(sqid);
                list.addChild(enemy);
                if(hp <= 0){
                    var yzw = new ccui.ImageView("img/public/img_yzw.png", 1);
                    yzw.setPosition(list.width / 2, list.height / 2 - 1);
                    list.addChild(yzw);
                    enemy.setEnabled(false);
                }
                list.setAnchorPoint(0.5, 0.5);
                arr.push(list);
            }
            X.center(arr, me.nodes.panel_ico1, {
                scale: .7
            });
            X.alignCenter(me.nodes.panel_ico2, G.class.shizijunyuanzheng.getConf().base.passprize[me.DATA.idx.toString()], {
                name: "",
                touch: true,
                scale: .8,
                callback: function () {
                    
                }
            });
        },
    });
    G.frame[ID] = new fun('yuanzheng_dsxx.json', ID);
})();