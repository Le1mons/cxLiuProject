/**
 * Created by LYF on 2019/10/26.
 */
(function () {
    //神宠水晶
    var ID = 'scsj';

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
            
            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_sctq.click(function () {
                G.frame.scsj_tq.show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L("TS52")
                }).show();
            });

            me.nodes.btn_sctj.click(function () {
                G.frame.scsj_tj.show();
            });

            me.nodes.btn_scsd.click(function () {
                if (G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum <= 0) {
                    return G.tip_NB.show(L("JRGMCSBZ"));
                }
                G.frame.iteminfo_plgm.data({
                    add: true,
                    buy: G.gc.petcom.base.daily_goods.prize[0],
                    num: 1,
                    buyneed: G.gc.petcom.base.daily_goods.need[G.frame.scsj.DATA.buynum],
                    buyConf: G.gc.petcom.base.daily_goods.need,
                    buyIndex: G.frame.scsj.DATA.buynum,
                    buyNum: G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum,
                    str: X.STR(L("JRHKGMXC"), G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum),
                    callback: function (num) {
                        me.ajax("pet_buyegg", [num], function (str, data) {
                            if (data.s == 1) {
                                G.frame.scsj.DATA.buynum += num;
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();

                                G.event.emit('sdkevent',{
                                    event:'Egg_buy',
                                    data:{
                                        consume:G.gc.petcom.base.daily_goods.need[G.frame.scsj.DATA.buynum],
                                        getNum:num,
                                    }
                                });
                            }
                        });
                    }
                }).show();
            });

            me.nodes.btn_jjyl.click(function () {
                G.frame.scsj_jinjie.data(me.DATA.crystal.crystal.rank).show();
            });
            me.pos1 = me.nodes.btn_jjyl.getPosition();
            me.pos2 = me.nodes.btn_sctq.getPosition();

            X.radio([me.nodes.btn_sjs1, me.nodes.btn_zhyx], function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_sjs1$:1,
                    btn_zhyx$:2
                };

                me.changeType(name2type[name]);
            });
        },
        checkRedPoint: function () {
            var me = this;

            if (me.DATA.receive) {
                G.setNewIcoImg(me.nodes.btn_sctq);
            } else {
                G.removeNewIco(me.nodes.btn_sctq);
            }

            if(G.DATA.hongdian.pet.crystal == 1){
                G.setNewIcoImg(me.nodes.btn_zhyx);
                me.nodes.btn_zhyx.getChildByName('redPoint').setPosition(30,34);
            }else {
                G.removeNewIco(me.nodes.btn_zhyx);
            }

            if(G.DATA.hongdian.pet.fhs == 0){//只有为0的时候才不打红点
                G.removeNewIco(me.nodes.btn_sjs1);
            }else {
                G.setNewIcoImg(me.nodes.btn_sjs1);
                me.nodes.btn_sjs1.getChildByName('redPoint').setPosition(30,34);
            }
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show: function () {
            var me = this;
            var arg = arguments;
            var _super = this._super;

            this.getData(0, function () {
                _super.apply(me, arg);
            });
        },
        getData: function (type, callback) {
            var me = this;
            connectApi("pet_open", [type], function (data) {
                if (type == 0) {
                    me.DATA = data;
                    me.DATA.buynum = me.DATA.buynum || 0;
                    me.DATA.crystal = me.DATA.crystal || {};
                    me.DATA.crystal.lv = me.DATA.crystal.lv || 0;
                    me.DATA.crystal.data = me.DATA.crystal.petridish || {};
                    me.DATA.crystal.crystal = me.DATA.crystal.crystal || {};
                    me.DATA.crystal.crystal.lv = me.DATA.crystal.crystal.lv || 0;
                    me.DATA.crystal.crystal.rank = me.DATA.crystal.crystal.rank || 0;
                    me.DATA.crystal.play = me.DATA.crystal.play || {};//槽位上的神宠

                    me.isBuy = me.DATA.crystal.pay && me.DATA.crystal.pay > G.time;
                }
                if (type == 1) G.DATA.pet = data.pet || {};
                callback && callback();
            }, function (data, state) {

            });
        },
        onShow: function () {
            var me = this;

            me.setTqTime();
            me.showToper();
            me.checkRedPoint();
            me.changeToperAttr({
                attr1: {a: 'item', t: '2055'}
            });
            me.nodes.btn_sjs1.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
            me.changeToperAttr();
        },
        changeType: function (type) {
            var me = this;

            if (me.curType && me.curType === type) return;

            var viewConf = {
                "1": G.class.scsj_sc,
                "2": G.class.scsj_sj,
            };
            me.nodes.btn_jjyl.setVisible(type == 2);
            me.nodes.btn_sctq.setVisible(type == 1);
            me.nodes.btn_scsd.setVisible(type == 1);
            me.nodes.btn_sctq.setPosition(me["pos" + type]);
            var panel = new viewConf[type](me.DATA);
            me.nodes.panel_nr.addChild(panel);
            if (me.panel) me.panel.removeFromParent();
            me.panel = panel;


        },
        getPetNumByPid: function (pid, petLv) {
            var num = 0;
            var fightArr = [];
            for(var i in this.DATA.crystal.play){
                fightArr.push(this.DATA.crystal.play[i]);
            }
            for (var tid in G.DATA.pet) {
                if (G.DATA.pet[tid].pid == pid && !G.DATA.pet[tid].lv && !X.inArray([fightArr, tid])) num ++;
            }

            if (petLv) {
                return num;
            } else {
                return num > 0 ? num - 1 : num;
            }
        },
        setTqTime: function () {
            var me = this;

            if (me.DATA.crystal.pay && me.DATA.crystal.pay > G.time) {
                if (me.DATA.crystal.pay - G.time > 24 * 3600) {
                    me.nodes.txt_sytqts.setString(X.moment(me.DATA.crystal.pay - G.time));
                } else {
                    X.timeout(me.nodes.txt_sytqts, me.DATA.crystal.pay, function () {
                        me.nodes.txt_sytqts.setString("");
                        me.getData(0, function () {
                            G.frame.scsj.panel.setRoomState && G.frame.scsj.panel.setRoomState();
                        });
                    });
                }
            } else {
                me.nodes.txt_sytqts.setString("");
            }
        },
        checkIsAddPet: function (len) {
            //var fightPet = this.DATA.crystal.play || {};
            var fightPet = G.frame.scsj.panel.DATA.crystal.play || {};
            if (Object.keys(fightPet).length == len) return false;
            var inFight = [];
            for (var pos in fightPet) {
                inFight.push(G.DATA.pet[fightPet[pos]].pid);
            }
            var petIdPet = {};
            for (var tid in G.DATA.pet) {
                var petData = G.DATA.pet[tid];
                if (!X.inArray(inFight, petData.pid)) {
                    if (!petIdPet[petData.pid]) petIdPet[petData.pid] = 1;
                    else petIdPet[petData.pid] ++;
                }
            }
            // return Object.keys(petIdPet).length >= len - Object.keys(fightPet).length;
            //return  len > 0 && Object.keys(petIdPet).length - Object.keys(fightPet).length > 0;
            return  len > 0 && Object.keys(petIdPet).length > 0;
        }
    });

    G.frame[ID] = new fun('scsj_bg.json', ID);
})();