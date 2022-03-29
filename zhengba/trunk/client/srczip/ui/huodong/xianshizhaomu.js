/**
 * Created by LYF on 2019/1/10.
 */
(function () {
    //限时招募
    var ID = 'xianshizhaomu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;

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
            }, 1000);

            me.nodes.btn_2.click(function () {

                me.chou(15);
            }, 1000);

            me.nodes.btn_fh.click(function () {
                me.remove();
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
                me.ajax("xszm_lottery", [type], function (str, data) {
                    if(data.s == 1) {
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
                        me.getData(function () {
                            me.setBox();
                            me.setButtonState();
                            me.setRankInfo();
                        });
                    }
                });
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
        getData: function(callback){
            var me = this;

            G.ajax.send("xszm_open", [], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            me.nodes.list.hide();
            me.nodes.panle1.setTouchEnabled(false);
            me.showToper();
            me.setContents();
            me.curListViewHeight = me.nodes.paihangxinxi.height;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(false);
            me.nodes.img_tiao6.setPercent(100);
        },
        onHide: function () {
            var me = this;
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
            var data = me.DATA.rank;

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
        setBaseInfo: function () {
            var me = this;
            var txt = me.ui.finds("txt_sz");
            var time = G.DATA.asyncBtnsData.xianshi_zhaomu;

            if(time - G.time > 24 * 3600) {
                txt.setString(X.moment(time - G.time));
            } else {
                X.timeout(txt, time, function () {
                    X.uiMana.closeAllFrame();
                    G.tip_NB.show(L("HDJS"));
                });
            }

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
                str: data.num > 0 ? X.STR(L("HYBCWX"), data.num) : L("BCWX"),
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
    G.frame[ID] = new fun('xianshizhaomu.json', ID);
})();