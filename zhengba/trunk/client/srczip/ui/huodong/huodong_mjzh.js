/**
 * Created by LYF on 2018-12-12
 */
(function () {
    //魔镜置换
    var ID = 'mjzh';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;

            me._super(json, id, {action: true});
            //me._super("event_mojingzhihuan.json");
        },
        onOpen: function () {
            var me = this;
            me._data = G.gc.mjzh;
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            // me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);

            me.showToper();
            me.setView();
            me.setContents();
        },
        setView: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS22")
                }).show();
            });

            me.nodes.btn_zh.click(function () {
                if(me.type == 1) {
                    if(!me.curId) {
                        G.tip_NB.show(L("QXZXYFZDYX"));
                        return;
                    }
                    if(me.selectedData.length < me.curData.needarmynum) {
                        G.tip_NB.show(L("YX") + L("CAILIAO") + L("BUZU"));
                        return;
                    }
                    if(G.class.getOwnNum("2023", "item") < me.curData.need[0].n) {
                        G.tip_NB.show(G.class.getItem(me.curData.need[0].t).name + L("BUZU"));
                        return;
                    }
                    me.ajax("huodong_rearmy_change", [me.curId, me.selectedData], function (str, data) {
                        if(data.s == 1) {
                            me.rightAni.playWithCallback("zhihuan", false, function () {
                                me.rightAni.play("xunhuan", true);
                                if(data.d.prize.length > 0) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    G.class.hero.getSoundByHid(data.d.prize[0].t);
                                }
                            });
                            me.leftAni.playWithCallback("xiaoshi", false, function () {

                                me.leftAni.play("xunhuan", true);
                            });
                            G.tip_NB.show(L("ZHCG"));
                            me.curId = undefined;
                            me.selectedData = [];
                            me.leftNode.removeAllChildren();
                            me.setSate();
                            me.setTable();
                            me.setAttr();
                            me.nodes.img_yxdi.hide();
                            me.ui.finds("txt1").hide();
                        }
                    });
                } else {
                    if(!me.curId) return G.tip_NB.show(L("QXCSYFZDYX"));
                    function f() {
                        me.ajax("huodong_rearmy_reborn", [me.curId, 1], function (str, data) {
                            if(data.s == 1) {
                                G.frame.jiangliyulan.data({
                                    prize: data.d.prize,
                                    title: L("CSYL"),
                                    btnTxt: L("CHONGSHENG"),
                                    callback: function () {
                                        me.ajax("huodong_rearmy_reborn", [me.curId, 0], function (str, data) {
                                            if(data.s == 1) {
                                                me.csAni.playWithCallback("zhihuan", false, function () {
                                                    me.csNode.removeAllChildren();
                                                    G.frame.jiangli.data({
                                                        prize: data.d.prize
                                                    }).show();
                                                    me.csAni.play("xunhuan", true);
                                                });
                                                me.curId = undefined;
                                                me.setTable();
                                                me.setAttr();
                                                me.nodes.text_sl.setString(0);
                                            }
                                        });
                                    }
                                }).show();
                            }
                        });
                    }
                    f();
                    // if (G.DATA.yingxiong.list[me.curId].lv > 1) {
                    //     G.frame.alert.data({
                    //         okCall: function() {
                    //             f();
                    //         },
                    //         ok: {wz: L("ZJCS")},
                    //         cancel: {wz: L("CZDJ")},
                    //         cancelCall: function () {
                    //             G.frame.huodong.remove();
                    //             G.frame.yingxiong_fenjie.data({cs: true}).show();
                    //         },
                    //         richText: L("CS_TS"),
                    //         sizeType: 3
                    //     }).show();
                    // } else {
                    //     f();
                    // }
                }
            });

            me.ui.finds("ico").click(function () {
                if(me.type != 1) return;
                if(!me.curId) {
                    G.tip_NB.show(L("QXZXYFZDYX"));
                    return;
                }
                G.frame.yingxiong_zhxz.data({
                    selectedData: me.selectedData,
                    num: me.curData.needarmynum || 5,
                    star: 5,
                    hid: G.class.hero.getById(G.DATA.yingxiong.list[me.curId].hid).pinglunid + "5",
                    zhongzu: G.DATA.yingxiong.list[me.curId].zhongzu,
                    callback: function (arr) {
                        me.selectedData = arr;
                        me.setSate();
                    }
                }).show();
            });

            me.nodes.txt_sj.hide();
            me.nodes.txt_js.hide();

            X.radio([me.nodes.btn_mjzh, me.nodes.btn_mjcs], function (sender) {
                var name = sender.getName();
                var nameType = {
                    btn_mjzh$: 1,
                    btn_mjcs$: 2
                };
                me.changeType(nameType[name]);
            });
            me.nodes.btn_mjcs.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function(type) {
            var me = this;
            me.type = type;

            if(type == 1) {
                G.class.ani.show({
                    json: "ani_mojing_xunhuan",
                    addTo: me.nodes.panel_1,
                    x: me.nodes.panel_1.width / 2,
                    y: me.nodes.panel_1.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        action.play("xunhuan", true);
                        me.leftNode = node.finds("hero");
                        me.leftAni = action;
                    }
                });

                G.class.ani.show({
                    json: "ani_mojing_xunhuan",
                    addTo: me.nodes.panel_2,
                    x: me.nodes.panel_2.width / 2,
                    y: me.nodes.panel_2.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        action.play("xunhuan", true);
                        me.rightNode = node.finds("hero");
                        me.rightAni = action;
                    }
                });
                me.curId = undefined;
                me.nodes.panel_3.removeAllChildren();
                me.nodes.txt_wz.setString(L("MJZH"));
                me.ui.finds("text_zh").setString(L("ZHIHUAN"));
                me.setTable();
                me.setAttr();
                me.nodes.text_sl.setString(0);
                //me.nodes.img_zwnr.loadTexture("img/mojingzhihuan/img_zwnr3.png", 1);
            } else {
                me.ui.finds("ico").removeAllChildren();
                me.curId = undefined;
                me.selectedData = [];
                me.nodes.img_yxdi.hide();
                me.ui.finds("txt1").hide();
                G.class.ani.show({
                    json: "ani_mojing_xunhuan",
                    addTo: me.nodes.panel_3,
                    x: me.nodes.panel_3.width / 2,
                    y: me.nodes.panel_3.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        action.play("xunhuan", true);
                        me.csNode = node.finds("hero");
                        me.csAni = action;
                    }
                });

                me.nodes.panel_1.removeAllChildren();
                me.nodes.panel_2.removeAllChildren();
                me.nodes.txt_wz.setString(L("MJCS"));
                me.ui.finds("text_zh").setString(L("CHONGSHENG"));
                me.setTable();
                me.setAttr();
                me.nodes.text_sl.setString(0);
                //me.nodes.img_zwnr.loadTexture("img/mojingzhihuan/img_zwnr4.png", 1);
            }
        },
        setContents: function () {
            var me = this;


            me.nodes.img_yxdi.hide();
            me.ui.finds("txt1").hide();
        },
        setAttr: function () {
            var me = this;
            var need = me._data.data.arr[0].need[0];

            me.nodes.text_jiejin.setString(X.fmtValue(G.class.getOwnNum(need.t, need.a)));
        },
        getData: function() {
            var me = this;
            var arr = [];
            var star;
            var heroList = G.DATA.yingxiong.list;

            star = me.type == 1 ? me._data.data.canswap : me._data.data.canreborn;

            for (var i in heroList) {
                if(X.inArray(star, heroList[i].star) && heroList[i].lv > 1 && heroList[i].zhongzu != 7) {
                    arr.push(heroList[i]);
                }
            }

            arr.sort(function (a, b) {
                if(a.star != b.star) {
                    return a.star > b.star ? -1 : 1;
                } else {
                    return a.lv > b.lv ? -1 : 1;
                }
            });

            return arr;
        },
        setTable: function () {
            var me = this;
            var data = me.getData();

            if(data.length < 1) {
                me.nodes.img_zwnr.show();
            } else {
                me.nodes.img_zwnr.hide();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_yx, 5, function (ui, data) {
                    me.setItem(ui, data)
                }, null,null, 10, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            var hero = G.class.shero(data);
            hero.setAnchorPoint(0.5, 0.5);
            hero.setPosition(ui.nodes.panel_yx.width / 2, ui.nodes.panel_yx.height / 2);
            ui.nodes.panel_yx.removeAllChildren();
            ui.nodes.panel_yx.addChild(hero);
            ui.nodes.panel_yx.setTouchEnabled(false);

            ui.data = data.tid;

            if(X.inArray(G.DATA.yingxiong.jjchero, data.tid) || data.islock) {
                hero.setEnabled(false);
                ui.nodes.img_suo.show();
                if(X.inArray(G.DATA.yingxiong.jjchero, data.tid)) ui.def = true;
                else ui.lock = true;
            } else {
                hero.setEnabled(true);
                ui.nodes.img_suo.hide();
                ui.def = false;
                ui.lock = false;
            }

            if(me.curId && me.curId == ui.data) {
                ui.nodes.img_gou.show();
            } else {
                ui.nodes.img_gou.hide();
            }

            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(sender.def) {
                        G.tip_NB.show(L("GYXCYFSZR"));
                        return;
                    }
                    if(sender.lock) {
                        G.tip_NB.show(L("GYXBSD"));
                        return;
                    }

                    me.curId = sender.data;
                    me.selectedData = [];
                    me.getHeroData();
                    me.checkSelected();
                }
            });

            ui.show();
        },
        getHeroData: function() {
            var me = this;
            var conf;
            var data = me._data.data.arr;
            var heroData = G.DATA.yingxiong.list[me.curId];
            me.curData = {};

            for (var i in data) {
                if(data[i].val == heroData.star) {
                    conf = data[i];
                    break;
                }
            }

            me.curData.star = heroData.star;
            me.curData.zhongzu = heroData.zhongzu;

            if(me.type == 1) {
                me.curData.needarmynum = conf.needrate;
                me.curData.need = conf.need;
            } else {
                me.curData.need = conf.rebornneed;
            }


            me.setSelectedHero(me.curData);
        },
        setSelectedHero: function (data) {
            var me = this;

            if(me.type == 1) {
                me.nodes.img_yxdi.show();
                me.ui.finds("txt1").show();
                X.setHeroModel({
                    parent: me.leftNode,
                    data: G.DATA.yingxiong.list[me.curId],
                    scaleNum: .8
                });
                me.setSate();
            } else {
                X.setHeroModel({
                    parent: me.csNode,
                    data: G.DATA.yingxiong.list[me.curId],
                    scaleNum: .8
                });
            }


            G.class.hero.getSoundByHid(G.DATA.yingxiong.list[me.curId].hid);
            me.ui.finds('img_jh').loadTexture(G.class.getItemIco(data.need[0].t),1);
            me.nodes.text_sl.setString(data.need[0].n);
        },
        setSate: function() {
            var me = this;
            var lay = me.ui.finds("ico");
            var data = me.curData || {};

            me.ui.finds("txt1").setString(me.selectedData.length + "/" + (data.needarmynum || 5));

            lay.removeAllChildren();
            me.rightNode.removeAllChildren();

            if(me.selectedData.length > 0) {
                var hero = G.class.shero(G.DATA.yingxiong.list[me.selectedData[0]]);
                hero.setAnchorPoint(0.5, 0.5);
                hero.setPosition(lay.width / 2, lay.height / 2);
                hero.lv.hide();
                lay.addChild(hero);

                var hid = G.DATA.yingxiong.list[me.selectedData[0]].hid;
                var str = "";
                str += hid.substring(0, hid.length - 1);
                str += "6";
                var conf = X.clone(G.class.hero.getById(str));
                conf.star = G.DATA.yingxiong.list[me.curId].star;
                X.setHeroModel({
                    parent: me.rightNode,
                    data: conf,
                    direction: -1,
                    scaleNum: .8
                });
            }
        },
        checkSelected: function (data) {
            var me = this;

            var chr = me.table.getAllChildren();
            for (var i in chr) {
                if(me.curId == chr[i].data) {
                    chr[i].nodes.img_gou.show();
                } else {
                    chr[i].nodes.img_gou.hide();
                }
            }
        }
    });
    G.frame[ID] = new fun('event_mojingzhihuan.json', ID);
})();