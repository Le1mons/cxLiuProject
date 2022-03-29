/**
 * Created by LYF on 2019-03-4
 */

(function () {
    //装备附魔
    var ID = 'zhuangbeifumo';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;
            var ani = {
                3: "ani_zhuangbeifumo_qianghua_tk",
                2: "ani_zhuangbeifumo_qianghua_jz",
                1: "ani_zhuangbeifumo_qianghua_wq",
                4: "ani_zhuangbeifumo_qianghua_yf"
            };
            var lay = {
                3: me.nodes.panel_zb1,
                2: me.nodes.panel_zb2,
                1: me.nodes.panel_zb3,
                4: me.nodes.panel_zb4
            };

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });

            me.nodes.btn_chongzhi.click(function () {
                if(!me.DATA.data) return G.tip_NB.show(L("NOFMPER"));

                var num = 0;
                var data = me.DATA.data;

                for (var i in data) {
                    if(data[i]) num ++;
                }

                if(num < 1) return G.tip_NB.show(L("NOFMPER"));

                G.frame.reset.data({
                    needNum: G.gc.zbfm.base.recast[0].n,
                    str: L("CZFM"),
                    callback: function () {
                        if(P.gud.rmbmoney < G.gc.zbfm.base.recast[0].n) return G.tip_NB.show(L("ZSBZ"));
                        me.ajax("equip_fmrecast", [], function (str, data) {
                            if(data.s == 1) {
                                G.event.emit("sdkevent", {
                                    event: "equip_fmrecast"
                                });
                                if(data.d.prize) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                }
                                G.frame.reset.remove();
                                me.getData(function () {
                                    me.changeType(me.type, me.job);
                                });
                            }
                        });
                    }
                }).show();
            });

            me.nodes.btn_fmds.click(function () {

                G.frame.fumodashi.show();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS32')
                }).show();
            });

            me.nodes.btn_fm.click(function () {
                G.DATA.noClick = true;
                me.ajax("equip_enchant", [me.idx], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'fumo_equip',
                            data:{
                                fumoType:me.idx,
                                consume:me.need,
                            }
                        });

                        me.oldDsLv = me.DATA.masterlv;
                        me.getData(function () {
                            G.class.ani.show({
                                json: ani[me.idx],
                                addTo: lay[me.idx],
                                onload: function (node, action) {
                                    action.play(me.job, false);
                                }
                            });

                            me.changeType(me.type, me.job);
                        });
                        G.DATA.noClick = false;
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            });
            
            X.radio([me.nodes.btn_zhanshi, me.nodes.btn_fashi, me.nodes.btn_mushi, me.nodes.btn_cike, me.nodes.btn_youxia], function (sender) {

                var name = sender.getName();
                var name2type = {
                    "btn_zhanshi$": 1,
                    "btn_fashi$": 2,
                    "btn_mushi$": 3,
                    "btn_cike$": 4,
                    "btn_youxia$": 5,
                };
                var job = {
                    "btn_zhanshi$": "zs",
                    "btn_fashi$": "fs",
                    "btn_mushi$": "ms",
                    "btn_cike$": "ck",
                    "btn_youxia$": "yx",
                };
                me.changeType(name2type[name], job[name]);
                me.nodes.panel_dh.getChildByTag(999) && me.nodes.panel_dh.getChildByTag(999).removeFromParent();
                G.class.ani.show({
                    json: "ani_zhuangbeifumo_" + job[name],
                    addTo: me.nodes.panel_dh,
                    x: me.nodes.panel_dh.width / 2,
                    y: me.nodes.panel_dh.height / 2,
                    cache: true,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setTag(999);
                    }
                });

            });

            me.btn = [me.nodes.panel_zb1, me.nodes.panel_zb2, me.nodes.panel_zb3, me.nodes.panel_zb4];

            for (var i = 1; i < 5; i ++) {
                (function (idx) {

                    var btn = me.nodes["panel_zb" + idx];
                    btn.click(function (sender) {
                        var name = sender.getName();
                        var name2type = {
                            "panel_zb1$": 3,
                            "panel_zb2$": 2,
                            "panel_zb3$": 1,
                            "panel_zb4$": 4,
                        };
                        var idx = {
                            "panel_zb1$": 0,
                            "panel_zb2$": 1,
                            "panel_zb3$": 2,
                            "panel_zb4$": 3,
                        };
                        var ani = ["tk", "jz", "wq", "yf"];
                        if(me.bwAni) me.bwAni.removeFromParent();
                        G.class.ani.show({
                            json: "ani_zhuangbeifumo_xuanzhong",
                            addTo: me.btn[idx[name]],
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                action.play(ani[idx[name]], true);
                                me.bwAni = node;
                            }
                        });
                        me.name2tye = name2type[name];
                        me.setFMInfo(name2type[name]);
                    });

                })(i)
            }
        },
        changeType: function(type, job) {
            var me = this;
            me.type = type;
            me.job = job;

            me.nodes.bg_dz.loadTexture("img/bg/zy_" + type + ".png");

            me.nodes.txt_zb1.setString(L("FM") + "+" + me.getLv(3));
            me.nodes.txt_zb2.setString(L("FM") + "+" + me.getLv(2));
            me.nodes.txt_zb3.setString(L("FM") + "+" + me.getLv(1));
            me.nodes.txt_zb4.setString(L("FM") + "+" + me.getLv(4));

            var arr = [];
            arr.push(me.getLv(3));
            arr.push(me.getLv(2));
            arr.push(me.getLv(1));
            arr.push(me.getLv(4));

            me.checkBtn(arr);

            var index = 0;
            for (var i = 0; i < arr.length; i ++) {
                if(arr[i - 1] && arr[i] < arr[i - 1]) {
                    index = i;
                    break;
                }
            }

            me.btn[index].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        checkBtn: function(arr) {
            var me = this;

            for (var i in me.btn) {
                me.btn[i].setTouchEnabled(false);
            }

            for (var i in arr) {
                if(arr[i] < G.class.equip.getFMMaxLv() - 1) return;
            }

            for (var i in me.btn) {
                me.btn[i].setTouchEnabled(true);
            }
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
            me.nodes.btn_zhanshi.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("equip_enchantopen", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    G.DATA.fumo = d.d;
                    if(cc.isNumber(me.oldDsLv) && me.oldDsLv < me.DATA.masterlv) {
                        G.tip_NB.show(X.STR(L("FMDSSJ"), me.oldDsLv, me.DATA.masterlv));
                    }
                    callback && callback();
                }
            })
        },
        show: function(){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;
            me.showToper();

            me.changeToperAttr({
                attr1: {a: "attr", t: "useexp"},
                attr2: {a: 'item', t: '2026'}
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.changeToperAttr();
        },
        setFMInfo: function (idx) {
            var me = this;
            me.idx = idx;

            var lv = me.getLv(idx);
            var maxLv = G.class.equip.getFMMaxLv() - 1;
            var buff = G.class.equip.getFMBuff(lv, me.idx);
            var key = X.keysOfObject(buff)[0];
            var dsbuff = me.getDsBuff(me.getDsLv(), idx);

            if(lv >= maxLv) {
                me.nodes.panel_attribute.hide();
                me.nodes.panel_max.show();

                me.nodes.wz_max2.setString(lv + "/" + maxLv + L("JI"));
                me.nodes.wzmax3.setString(L("ZHUANGBEI_TYPE_" + me.idx) + L(key) + ":");
                me.nodes.wz_max4.setString("+" + buff[key] + " (+" + (parseInt(buff[key] * (dsbuff.pro / 1000))) + ")");
                me.need = [];
            } else {
                me.nodes.panel_attribute.show();
                me.nodes.panel_max.hide();

                var nextBuff = G.class.equip.getFMBuff(lv + 1, me.idx);
                var needArr = me.need = G.gc.zbfm.base.need[lv + 1];

                me.nodes.wz_dj1.setString(lv + "/" + maxLv + L("JI"));
                me.nodes.wz_dj2.setString(lv + 1 + "/" + maxLv + L("JI"));

                me.nodes.wz2.setString(L("ZHUANGBEI_TYPE_" + me.idx) + L(key) + ":");
                me.nodes.xjwz2.setString(L("ZHUANGBEI_TYPE_" + me.idx) + L(key) + ":");

                var cr = " (+" + (parseInt(buff[key] * (dsbuff.pro / 1000))) + ")";
                var nr = " (+" + (parseInt(nextBuff[key] * (dsbuff.pro / 1000))) + ")";

                me.nodes.wz_wqdj1.setString("+" + buff[key] + (me.getDsLv() ? cr : ""));
                me.nodes.wz_wqdj2.setString("+" + nextBuff[key] + (me.getDsLv() ? nr : ""));

                X.alignItems(me.nodes.panel_cl, needArr, "left", {
                    touch: true,
                    scale: .8,
                    mapItem: function (node) {
                        if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                            node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                            X.enableOutline(node.num, cc.color('#740000'), 1);
                        } else {
                            node.num.setTextColor(cc.color("#ffffff"));
                            X.enableOutline(node.num, cc.color('#000000'), 1);
                        }
                    }
                });
            }
        },
        getLv: function (idx) {
            var me = this;
            var data = me.DATA.data;

            if(!data || !data[idx]) return 0;
            return data[idx];
        },
        getDsLv: function () {
            var me = this;
            return me.DATA.masterlv || 0;
        },
        getDsBuff: function (lv, idx) {
            return G.gc.zbfm.base.master[lv][idx];
        }
    });

    G.frame[ID] = new fun('fumo.json', ID);
})();