/**
 * Created by LYF on 2019-3-12
 */
(function () {
    //限时招募
    G.class.huodong_xszm = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.data = data;
            G.frame.huodong.xszm = me;
            me._super("xianshizhaomu.json", null, {action: true,releaseRes:false});
        },
        onOpen: function() {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.nodes.list.hide();
            me.nodes.panle1.setTouchEnabled(false);
            me.getData(function () {
                me.setContents();
            });
            me.curListViewHeight = me.nodes.paihangxinxi.height;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(false);
            me.nodes.img_tiao6.setPercent(100);
        },
        onHide: function () {

        },
        initUi: function () {
            var me = this;

            me.ui.finds("heiditu_1").hide();
            me.nodes.text_sl1.setString(G.gc.xianshizhaomu.data[1].need[0].n);
            me.nodes.text_sl2.setString(G.gc.xianshizhaomu.data[15].need[0].n);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS27')
                }).show();
            });

            me.nodes.btn_pmjl.click(function () {
                G.frame.xianshizhaomu_phb.show();
            });

            me.nodes.btn_1.click(function () {

                me.chou(1);
            });

            me.nodes.btn_2.click(function () {

                me.chou(15);
            });

            me.nodes.btn_dianjigengduo.setTouchEnabled(true);
            me.nodes.btn_dianjigengduo.click(function (sender) {

                if(!me.zk) {
                    me.zk = true;
                    me.nodes.paihangxinxi.height += 7 * me.nodes.list.height + 5;
                    sender.loadTexture("img/xianshizhaomu/btn_fanhui.png", 1);
                } else {
                    me.zk = false;
                    me.nodes.paihangxinxi.height = me.curListViewHeight;
                    sender.loadTexture("img/xianshizhaomu/btn_xianshizhaomu.png", 1);
                }
                ccui.helper.doLayout(me.nodes.paihangxinxi);
            });
        },
        chou: function(type) {
            var me = this;
            if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));
            var list = G.DATA.yingxiong.list;
            var keys = X.keysOfObject(list);
            if(keys.length + type > G.DATA.heroCell.maxnum){
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        G.frame.yingxiong.show();
                    },
                    richText: L("YXLBYM"),
                }).show();
            }else{
                G.DATA.noClick = true;
                me.ajax("xszm_lottery", [type], function (str, data) {
                    if(data.s == 1) {
                        if(me.DATA.myinfo.freenum>0 && type == 1){
                            var need = [];
                        }else {
                            var need = G.gc.xianshizhaomu.data[type].need;
                        }
                        try {
                            G.event.emit("leguXevent", {
                                type: 'track',
                                event: 'summon',
                                data: {
                                    summon_genre: '限时招募',
                                    summon_type: type,
                                    summon_cost_num: type,
                                    summon_cost_type: 'item',
                                    item_list: X.arrPirze(data.d.prize),
                                }
                            });
                        } catch (e) {
                            cc.error(e);
                        }
                        G.event.emit("sdkevent", {
                            event: "activity",
                            data:{
                                joinActivityType:me.data.stype,
                                get:data.d.prize,
                                consume:need ,
                            }
                        });
                        if(G.frame.xianshizhaomu_chouka.isShow) {
                            if(type != 1) {
                                for (var i = 1; i < 16; i ++) {
                                    G.frame.xianshizhaomu_chouka.nodes["ico_" + i].removeAllChildren();
                                }
                            } else {
                                G.frame.xianshizhaomu_chouka.nodes.ico_yx.removeAllChildren();
                            }
                            me.isAni = false;
                        } else me.isAni = true;
                        G.frame.xianshizhaomu_chouka.data(data.d.prize).show();
                        if(G.frame.huodong.isShow){
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }
                        me.getData(function () {
                            me.setBox();
                            me.setButtonState();
                            me.setRankInfo();
                        });
                        G.DATA.noClick = false;
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            }
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("huodong_open", [me.data.hdid], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        setContents: function () {
            var me = this;

            me.setBox();
            me.setRankInfo();
            me.setBaseInfo();
            me.setButtonState();
            me.setDJS();
        },
        setBox: function () {
            var me = this;
            var val = me.DATA.myinfo.val;
            var boxConf = me.DATA.hdinfo.data.jifen2prize;

            me.ui.finds("wz_jf").setString(val);

            for (var i = 0; i < boxConf.length; i ++) {
                var jdt = me.nodes["img_tiao" + (i + 2)];
                jdt.setPercent(0);
                if(!boxConf[i - 1]) {
                    jdt.setPercent(val / boxConf[i][0] * 100);
                } else {
                    if(val > boxConf[i - 1][0]) {
                        jdt.setPercent((val - boxConf[i - 1][0])  / (boxConf[i][0] - boxConf[i - 1][0]) * 100);
                    }
                }
            }

            for (var i = 0; i < boxConf.length; i ++) {
                (function (data, ui, idx) {
                    ui.removeAllChildren();
                    var img = "img/xianshizhaomu/img_xszm_bx1.png";
                    var box = me.nodes.list_bx.clone();
                    X.autoInitUI(box);
                    box.nodes.text_cs2.setString(data[0]);
                    box.nodes.text_cs2.setTextColor(cc.color("#FFF0D8"));
                    X.enableOutline(box.nodes.text_cs2, "#000000", 2);
                    box.nodes.panel_bx.setTouchEnabled(true);
                    box.nodes.panel_bx.idx = idx;
                    box.nodes.panel_bx.prize = data[1];
                    box.nodes.img_ylq.hide();
                    if(val >= data[0]) {
                        if(X.inArray(me.DATA.myinfo.gotarr, idx)) {
                            // box.nodes.img_ylq.show();
                            img = "img/xianshizhaomu/img_xszm_bx1_d.png"
                        } else {
                            box.nodes.panel_bx.state = "lq";
                        }
                    } else {
                        box.nodes.panel_bx.state = "ck";
                    }
                    if(box.nodes.panel_bx.state == "lq") {
                        X.addBoxAni({
                            parent: box.nodes.panel_bx,
                            boximg: img
                        });
                    } else {
                        box.nodes.panel_bx.setBackGroundImage(img, 1);
                    }

                    box.nodes.panel_bx.click(function (sender) {
                        if(sender.state == "lq") {

                            me.ajax("xszm_recprize", [sender.idx], function (str, data) {
                                if(data.s == 1) {
                                    G.event.emit("sdkevent", {
                                        event: "activity",
                                        data:{
                                            joinActivityType:me.data.stype,
                                            consume:[],
                                            get:data.d.prize,
                                        }
                                    });
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                    me.getData(function () {
                                        me.setBox();
                                    });
                                }
                            })
                        } else if(sender.state == "ck") {
                            G.frame.jiangliyulan.data({
                                prize: data[1]
                            }).show();
                        }
                    });
                    box.show();
                    box.setAnchorPoint(0.5, 0.5);
                    box.setPosition(27, 23);
                    ui.addChild(box);
                })(boxConf[i], me.nodes["panel_bx" + (i + 1)], i);
            }
        },
        setRankInfo: function () {
            var me = this;
            var data = me.DATA.myinfo.rank;

            me.ui.finds("wz_ph").setString(data.myrank > 0 ? (data.myrank > 50 ? L("WSB") : data.myrank) : L("WSB"));
            me.nodes.listview.removeAllChildren();

            for (var i = 0; i < 10; i ++) {
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                (function (data, rank) {
                    list.nodes.txt_mc.setString(rank);
                    list.nodes.txt_mc.setTextColor(cc.color("#FFA500"));
                    if(data) {
                        list.nodes.txt_name.setString(data.name);
                        list.nodes.txt_jf.setString(data.val);
                        list.nodes.txt_name.setTextColor(cc.color("#ffffff"));
                    } else {
                        list.nodes.txt_name.setString(L("XWYD"));
                        list.nodes.txt_jf.setString(me.getScore(rank));
                        list.nodes.txt_name.setTextColor(cc.color("#A2938C"));
                    }

                    list.show();
                    me.nodes.listview.pushBackCustomItem(list);
                })(data.ranklist[i], i + 1);
            }
        },
        getScore: function(idx) {
            var data = G.gc.xianshizhaomu.rankprize;

            for (var i in data) {
                if(idx >= data[i][0][0] && idx <= data[i][0][1]) return data[i][2];
            }
        },
        showEventTime: function () {
            var me = this;
            var txt = me.ui.finds("txt_sz");
            var time = me.DATA.hdinfo.rtime;
            var endTime = me.DATA.hdinfo.etime

            if(time - G.time > 24 * 3600) {
                txt.setString(X.moment(time - G.time));
            } else {
                if (G.time > time) {
                    me.ui.finds('txt_xcmfsx').setString(L("GSDJS"));
                    me.eventEnd = true;
                    X.timeout(txt, endTime, function () {
                        X.uiMana.closeAllFrame();
                        G.tip_NB.show(L("HDJS"));
                    });
                } else {
                    X.timeout(txt, time, function () {
                        me.showEventTime();
                    });
                }
            }
        },
        setBaseInfo: function () {
            var me = this;

            me.showEventTime();
            if(me.DATA.hdinfo.model) {
                X.setModel({
                    parent: me.nodes.panel_rw,
                    data: {hid: me.DATA.hdinfo.model},
                    scale: 1.2
                });

                G.class.hero.getSoundByHid(me.DATA.hdinfo.model);

                var data = G.class.hero.getById(me.DATA.hdinfo.model);
                me.nodes.txt_name1.setString(data.name);
                G.class.ui_star(me.nodes.panel_xx, data.star, 1.2, null, null, 1);
            }

            G.class.ani.show({
                json: "ani_xianshizhaomu_taizi",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: 186,
                repeat: true,
                autoRemove: false,
            });
        },
        setButtonState: function () {
            var me = this;
            var data = me.DATA;

            if(data.myinfo.freenum) {
                me.nodes.panle1.hide();
                me.nodes.btn_1.finds("txt_sx2").show();
            } else {
                me.nodes.panle1.show();
                me.nodes.btn_1.finds("txt_sx2").hide();
            }

            X.setRichText({
                str: data.myinfo.num > 0 ? X.STR(L("HYBCWX"), data.myinfo.num) : L("BCWX"),
                parent: me.ui.finds("wz_2"),
                anchor: {x: 0.5, y: 0.5},
                pos: {x: me.ui.finds("wz_2").width / 2, y: me.ui.finds("wz_2").height / 2},
                size: 16,
                color: "#ffffff",
                outline: "#000000"
            });

        },
        setDJS: function () {
            var me = this;

            var txt = new ccui.Text("", G.defaultFNT, 25);
            txt.setAnchorPoint(0.5, 0.5);
            txt.setTextColor(cc.color("#30ff01"));
            txt.setPosition(me.ui.width / 2, me.ui.height / 2);
            txt.hide();
            me.ui.addChild(txt);
            X.timeout(txt, X.getTodayZeroTime() + 24 * 3600, function () {
                if(cc.isNode(me.ui)) {
                    me.ui.setTimeout(function () {
                        me.getData(function () {
                            me.setButtonState();
                        });
                    }, 2000);
                }
            });
        }
    });
})();