/**
 * Created by LYF on 2018/9/26.
 */
(function () {
    //域外争霸-敌人信息
    var ID = 'yuwaizhengba_drxx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes=['jingjichang.png','jingjichang.plist'];
            me._super(json, id);
        },

        initUi: function () {
            var me = this;
            var nodes = me.ui.nodes;
            nodes.btn_jhy.hide();
            nodes.btn_fsyj.hide();
        },
        bindBtn: function () {
            var me = this;
            var data = me.DATA;
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            },1000);
            if((data && data.uid == P.gud.uid) || me.btnName == 'QUEDIN'){
                me.nodes.btn_tz.setTitleText(L('QUEDIN'));
            }else {
                me.nodes.btn_tz.setTitleText(L('TIAOZHAN'));
            }
            me.nodes.btn_tz.show();
            me.nodes.btn_tz.click(function () {
                if(me.DATA.uid == P.gud.uid || me.btnName == 'QUEDIN'){
                    me.remove();
                    return;
                }
                var call = function (d) {
                    if(d.d.fightres.winside == 0){
                        G.frame.fight_win.once("hide", function () {
                            if(G.frame.yingxiong_fight.isShow) {
                                G.frame.yingxiong_fight.remove();
                            }
                            me.callback && me.callback(d);
                        })
                    }else{
                        G.frame.fight_fail.once("hide", function () {
                            if(G.frame.yingxiong_fight.isShow) {
                                G.frame.yingxiong_fight.remove();
                            }
                            me.callback && me.callback(d);
                        })
                    }
                    me.remove();
                };
                var obj = {
                    pvType:me.pvType,
                    idx: me.DATA.index,
                    uid: me.DATA.uid,
                    callback:call
                };
                G.frame.yingxiong_fight.data(obj).show();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.setContents();
        },
        checkShow:function(){
            var me = this;
            var data = me.data();
            if(!data && !data.data){
                G.tip_NB.show(L('KFGHZ_SJCW'));
                return;
            }
            me.DATA = data.data;
            me.pvType = data.pvType;
            me.btnName = data.btnName;
            me.callback = data.callback;
            me.show();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();
            me.setHero();
        },
        setBaseInfo: function () {
            var me = this;

            var data = me.DATA;

            X.render({
                panel_tx: function (node) {
                    node.removeAllChildren();

                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                },
                text_id:data.headdata.uuid || L('WU'),
                text_gh:data.headdata.guildname && data.headdata.guildname != '' ? data.headdata.guildname : L('WU'),
                text_zdl1:data.zhanli

            },me.nodes);

            me.ui.finds('text_zzke').setString(data.headdata.name);
        },
        setHero: function () {
            var me = this;
            var arr = [];
            var data = me.DATA;
            var defhero = data.defhero || data.herolist;

            var lay = me.nodes.list_zr;

            for(var i in defhero){
                var conf = defhero[i];
                if(!conf.hid || conf.sqid) continue;
                var enemy = G.class.shero(conf);
                enemy.setArtifact(defhero.sqid || "");
                arr.push(enemy);
            }
            X.center(arr, lay, {
                scale: .7
            });
        },
    });
    G.frame[ID] = new fun('jingjichang_wjxx.json', ID);
})();