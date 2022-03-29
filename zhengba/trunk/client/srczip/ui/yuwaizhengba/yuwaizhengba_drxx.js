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
            });
            if((data && data.uid == P.gud.uid) || me.btnName == 'QUEDIN'){
                me.nodes.btn_tz.setTitleText(L('QUEDIN'));
            }else {
                me.nodes.btn_tz.setTitleText(L('TIAOZHAN'));
            }
            me.nodes.btn_tz.show();
            me.nodes.btn_tz.click(function () {
                if (me.data().pknum != undefined && me.data().pknum == 0) return G.tip_NB.show(L("TZCSBZ"));
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
                    herolist: me.DATA.herolist,
                    zhanli: me.DATA.zhanli,
                    callback:call
                };
                G.frame.yingxiong_fight.data(obj).show();
            });

            X.radio([me.nodes.btn_yingxiong, me.nodes.btn_shenchong], function (sender) {
                var name = sender.getName();
                me.nodes.panel_qh_yx.setVisible(name == "btn_yingxiong$");
                me.nodes.panel_qh_sc.setVisible(name == "btn_shenchong$");
            });
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
            me.jifen = data.jifen;
            me.rank = data.rank;
            if(data.uid){
                G.ajax.send('crosszb_userdetails',[data.uid],function (str,dd) {
                    if(dd.s == 1){
                        me.DATA.herolist = dd.d.fightdata;
                        me.callback = data.callback;
                        me.show();
                    }
                })
            }else {
                me.callback = data.callback;
                me.show();
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.nodes.panel_zr1.show();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();
            me.setHero();
            me.setPet();
            me.nodes.btn_yingxiong.triggerTouch(ccui.Widget.TOUCH_ENDED);
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
            var data = me.DATA;
            var defhero = data.defhero || data.herolist;

            me.setOneItem(defhero);
        },
        setOneItem: function (data) {
            var me = this;
            var leftLay = me.nodes.panel_yx_qh;
            var rightLay = me.nodes.panel_yx1_qh;

            var wid,
                herInterval,
                lay,
                scale = 1,
                num = 0,
                sqid = me.getSqId(data);
            for (var i = 0; i < 6; i++) {
                var defhero = me.getPosData(i + 1, data);
                if (defhero) {
                    wid = G.class.shero(defhero);
                    wid.setArtifact(sqid);
                    wid.data = defhero;
                    // me.setShowHeroInfo(wid);
                } else{
                    wid = G.class.shero();
                }

                var width = scale * wid.width;

                if (i < 2) {
                    lay = leftLay;
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = rightLay;
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                wid.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));
                lay.addChild(wid);
                num++;
            }
        },
        setPet: function () {
            var me = this;
            var data = me.DATA;
            var defhero = data.defhero || data.herolist;
            var allPetData = me.getPetData(defhero);

            if (Object.keys(allPetData).length == 0) return;

            for (var pos in allPetData) {
                var dd = allPetData[pos];
                var lay = me.nodes["panel_list" + pos];
                var chr = lay.children[0];
                lay.children[1].hide();
                var pet = G.class.pet(dd);
                pet.setPosition(chr.width / 2, chr.height / 2);
                chr.addChild(pet);
                pet.setTouchEnabled(true);
                pet.click(function (sender) {
                    G.frame.sc_xq.data({
                        t: sender.data.pid,
                        lv: sender.data.lv
                    }).show();
                });
            }
        },
        getPosData: function (pos, data) {

            for (var index in data) {
                if (data[index].pos == pos && data[index].hid) return data[index];
            }

            return null;
        },
        getSqId: function (data) {
            for (var index in data) {
                if (data[index].sqid) return data[index].sqid;
            }

            return "";
        },
        getPetData: function (data) {
            var obj = {};

            for (var pos in data) {
                if (data[pos].pid) {
                    obj[data[pos].pos] = data[pos];
                }
            }

            return obj;
        }
    });
    G.frame[ID] = new fun('jingjichang_wjxx.json', ID);
})();