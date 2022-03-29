/**
 * Created by LYF on 2018/6/11.
 */
(function () {

    G.event.on("xuyuanchi_grandprize", function () {
        if(G.frame.xuyuanchi.isShow) {
            G.frame.xuyuanchi.getPrizeData(function () {
                G.frame.xuyuanchi.showPrizeInfo();
            })
        }
    });

    //许愿池
    var ID = 'xuyuanchi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
            me.preLoadRes=['xuyuanchi1.png','xuyuanchi1.plist'];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_gmyb.click(function (sender, type) {
                function callback(num) {
                    G.ajax.send('xuyuanchi_buycoin', [num], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            if (d.d.prize) {
                                G.frame.jiangli.data({
                                    prize: [].concat(d.d.prize)
                                }).once('show', function() {
                                    if(G.frame.xuyuanchi.isShow){
                                        G.frame.xuyuanchi.nodes.text_gssl.setString(G.class.getOwnNum(
                                            (G.frame.xuyuanchi.conf.tenneed[0].t),G.frame.xuyuanchi.conf.tenneed[0].a));
                                    }
                                    G.frame.iteminfo_plgm.remove();
                                }).show();
                            }
                        }
                    }, true);
                }
                G.frame.iteminfo_plgm.data({
                    buy: G.class.xuyuanchi.get()["common"].buyprize[0],
                    num: 0,
                    buyneed: G.class.xuyuanchi.get()["common"].buyneed,
                    callback: callback
                }).show();
            });
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS4")
                }).show();
            });
            me.nodes.btn_xysd.click(function (sender, type) {
                G.frame.shop.data({type: "2", name: "xysd"}).show();
            });
            me.nodes.btn_mfsx.click(function (sender, type) {
                me.refreshData();
            });
            me.nodes.btn_sx.click(function (sender, type) {
                me.refreshData();
            });
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_mianfei.click(function () {
                me.lottery(1, true, 1);
            });

            me.nodes.btn_1.click(function (sender, type) {
                var is = true;
                if(me.nodes.text_gssl.getString() < me.conf.oneneed[0].n){
                    if(me.nodes.btn_ptxyc.bright == true){
                        G.tip_NB.show(L("GJXYBBZ"));
                        is = false;
                    }else{
                        function callback(num) {
                            G.ajax.send('xuyuanchi_buycoin', [num], function(d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    if (d.d.prize) {
                                        G.frame.jiangli.data({
                                            prize: [].concat(d.d.prize)
                                        }).once('show', function() {
                                            if(G.frame.xuyuanchi.isShow){
                                                G.frame.xuyuanchi.nodes.text_gssl.setString(G.class.getOwnNum(
                                                    (G.frame.xuyuanchi.conf.tenneed[0].t),G.frame.xuyuanchi.conf.tenneed[0].a));
                                            }
                                            G.frame.iteminfo_plgm.remove();
                                        }).show();
                                    }
                                }
                            }, true);
                        }
                        G.frame.iteminfo_plgm.data({
                            buy: G.class.xuyuanchi.get()["common"].buyprize[0],
                            num: 0,
                            buyneed: G.class.xuyuanchi.get()["common"].buyneed,
                            callback: callback
                        }).show();
                        is = false;
                    }
                    return;
                }
                me.lottery(1, is, 0);
            }, 1000);
            me.nodes.btn_2.click(function (sender, type) {
                var is = true;
                if(me.nodes.text_gssl.getString() < me.conf.tenneed[0].n){
                    if(me.nodes.btn_ptxyc.bright == true){
                        G.tip_NB.show(L("GJXYBBZ"));
                        is = false;
                    }else{
                        function callback(num) {
                            G.ajax.send('xuyuanchi_buycoin', [num], function(d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    if (d.d.prize) {
                                        G.frame.jiangli.data({
                                            prize: [].concat(d.d.prize)
                                        }).once('show', function() {
                                            if(G.frame.xuyuanchi.isShow){
                                                G.frame.xuyuanchi.nodes.text_gssl.setString(G.class.getOwnNum(
                                                    (G.frame.xuyuanchi.conf.tenneed[0].t),G.frame.xuyuanchi.conf.tenneed[0].a));
                                            }
                                            G.frame.iteminfo_plgm.remove();
                                        }).show();
                                    }
                                }
                            }, true);
                        }
                        G.frame.iteminfo_plgm.data({
                            buy: G.class.xuyuanchi.get()["common"].buyprize[0],
                            num: 0,
                            buyneed: G.class.xuyuanchi.get()["common"].buyneed,
                            callback: callback
                        }).show();
                        is = false;
                    }
                    return;
                }
                me.lottery(me.type == "high" ? 10 : 15, is, 0);
            }, 1000);

            if(P.gud.lv >= 45 || P.gud.vip >= 3){

            }else{
                me.nodes.btn_gjxyc.disable = true;
            }

            X.radio([me.nodes.btn_ptxyc,me.nodes.btn_gjxyc], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_ptxyc$:'common',
                    btn_gjxyc$:'high'
                };

                if(sender.disable){
                    G.tip_NB.show(L("KQXYC"));
                    me.nodes.btn_ptxyc.setBright(false);
                    me.nodes.text_ptxyc.setTextColor(cc.color("#e8fdff"));
                    me.nodes.txt_gjxyc.setTextColor(cc.color("#9d8d8a"));
                    return;
                }

                me.changeType(name2type[name]);
            });
        },
        changeType: function (type) {
            var me = this;

            me.type = type;
            me.conf = G.class.xuyuanchi.get()[me.type];

            me._running = false;

            if(me.type == "high"){
                me.nodes.btn_xysd.hide();
                me.nodes.btn_gmyb.hide();
                me.jdt = me.aniNode.finds("jindutiao2");
                me.nodes.img_tiao1.hide();
                me.nodes.panel_boy.hide();
                me.nodes.ico_mzrw.hide();
            }else{
                me.nodes.btn_xysd.show();
                me.nodes.btn_gmyb.show();
                me.jdt = me.aniNode.finds("jindutiao1");
                me.nodes.img_tiao1.show();
                me.nodes.panel_boy.show();
                me.nodes.ico_mzrw.show();
            }

            me.getPrizeData(function () {
                me.showPrizeInfo();
            });

            if(me.isFirst) {
                me.setContents();
                me.isFirst = false;
            } else {
                me.getData(function () {
                    me.setContents();
                });
            }
        },
        refreshData: function(){
            var me = this;
            if(me._running) return;
            me.nodes.btn_sx.setTouchEnabled(false);
            me.nodes.btn_mfsx.setTouchEnabled(false);

            G.ajax.send("xuyuanchi_shuaxin", [me.type], function (d) {
                if (!d || !me.isShow) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.refresh = 1;
                    me.DATA.freetime = d.d.xycdata.freetime;
                    me.DATA.shopitem = d.d.xycdata.shopitem;
                    me.setRefreshTime();
                    if(me._time){
                        me.ui.clearTimeout(me._time);
                        me._time = null;
                    }
                    me.refreshItems();
                    me.nodes.btn_sx.setTouchEnabled(true);
                    me.nodes.btn_mfsx.setTouchEnabled(true);
                }else{
                    me.nodes.btn_sx.setTouchEnabled(true);
                    me.nodes.btn_mfsx.setTouchEnabled(true);
                }
            }, true)
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("xuyuanchi_open", [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d.xycdata;
                    me.allDATA = d.d;
                    callback && callback();
                }
            })
        },
        lottery: function(type, is, isSuper, isAni){
            var me = this;
            if(!is) return;
            if(me._running) return;


            var fun = function(prize, type, data, isSuper, isAni){
                var layout = new ccui.Layout;
                layout.setContentSize(cc.director.getWinSize());
                layout.setAnchorPoint(0.5, 0.5);
                layout.setPosition(cc.director.getWinSize().width / 2, cc.director.getWinSize().height / 2);
                me.ui.addChild(layout);
                layout.setTag(6754);
                layout.setTouchEnabled(true);
                layout.setSwallowTouches(true);
                G.view.toper.hide();
                me.setButtonShow(false);

                if(me._time){
                    me.ui.clearTimeout(me._time);
                    me._time = null;
                }
                var indexs = [];
                // 只有奖励的物品在转盘上存在, 才会走转盘逻辑
                for(var i=0;i<prize.length;i++){
                    for(var j=0;j<me.DATA.shopitem.length;j++){
                        var dp = me.DATA.shopitem[j].item;
                        var pp = prize[i];
                        if(dp.t == pp.t && dp.n == pp.n) {
                            indexs.push(j);
                        }
                    }
                }

                me.DATA.shopitem = data;

                if(isAni) {
                    while (me.ui.getChildByTag(6754)) {
                        me.ui.getChildByTag(6754).removeFromParent();
                    }

                    G.view.toper.show();
                    G.frame.xuyuanchi_jl.data({prize: prize, isSuper: isSuper}).show();

                    me.getData(function () {
                        me.setContents();
                    });

                    if(me.type == "high"){
                        me.nodes.btn_xysd.hide();
                        me.nodes.btn_gmyb.hide();
                    }
                    me._time = me.ui.setTimeout(function () {
                        me._running = null;
                        me.waiting();
                    },0,0,1.85);
                } else {
                    X.audio.playEffect("sound/zhuangpanxuanzhuan.mp3", false);
                    me.goto(indexs[indexs.length-1], type, function(){

                        while (me.ui.getChildByTag(6754)) {
                            me.ui.getChildByTag(6754).removeFromParent();
                        }

                        G.view.toper.show();
                        G.frame.xuyuanchi_jl.data({prize: prize, isSuper: isSuper}).show();

                        me.getData(function () {
                            me.setContents();
                        });

                        if(me.type == "high"){
                            me.nodes.btn_xysd.hide();
                            me.nodes.btn_gmyb.hide();
                        }
                        me._time = me.ui.setTimeout(function () {
                            me._running = null;
                            me.waiting();
                        },0,0,1.85);
                    });
                }
            };

            G.ajax.send("xuyuanchi_lottery", [me.type, type, isSuper], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.nodes.text_gssl.setString(G.class.getOwnNum((me.conf.tenneed[0].t),me.conf.tenneed[0].a));
                    fun(d.d.prizelist, type, d.d.shopitem, isSuper, isAni);
                }
            })
        },
        onOpen: function () {
            var me = this;

            X.audio.playEffect("sound/openxuyuanchi.mp3", false);

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.showToper();
            me.setTime();
            cc.enableScrollBar(me.nodes.txt_zjjrwz);
        },
        onAniShow: function () {
            var me = this;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.type = "common";
            me.isFirst = true;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.listview_bx.hide();

            G.class.ani.show({
                json: "ani_xuyuanchi_0",
                addTo: me.nodes.panel_dh,
                x: 101,
                y: -211,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    me.aniNode = node;
                    me.dialAni = action;
                    me.dial = node.finds("Sprite_2");
                    me.nodes.btn_ptxyc.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
            });

            me.ui.setTimeout(function () {
                G.guidevent.emit('xuyuanchiOpenOver');
            }, 400);
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
        },
        setContents: function () {
            var me = this;

            me.appendItems();

            if(me.DATA.super) {
                me.nodes.btn_mianfei.show();
                me.setButtonShow(false, true);
                me.dialAni.play(me.type == "high" ? "pan2_baoza_idle" : "pan1_baoza_idle", true);
            } else {
                me.dialAni.play(me.type == "high" ? "pan2_idle" : "pan1_idle", true);
                me.setButtonShow(true);
                me.nodes.btn_mianfei.hide();
                me.setRefreshTime();
                me.showIcon();
                me.setEnergy();
                if(me.type != "high") me.setBox();
                me.waiting();
            }

        },
        setEnergy: function() {
            var me = this;
            var max = G.class.xuyuanchi.getMaxByType(me.type);
            me.jdt.setPercent(me.allDATA.energy / max * 100);
            me.jdt.removeAllChildren();

            if(me.allDATA.energy >= max) {
                me.jdt.setTouchEnabled(true);
                G.class.ani.show({
                    json: me.type == "high" ? "ani_xr_zise" : "ani_xr_lanse",
                    addTo: me.jdt,
                    x: me.jdt.width / 2,
                    y: me.jdt.height / 2,
                    repeat: true,
                    autoRemove: false
                });
            } else {
                me.jdt.setTouchEnabled(false);
            }
            
            me.jdt.click(function () {
                if(me.DATA.super && me.allDATA.energy >= max) return;
                me.ajax("xuyuanchi_upgrade", [me.type], function (str, data) {
                    if(data.s == 1) {
                        me.refresh = true;
                        me.allDATA.energy -= max;
                        me.DATA.shopitem = data.d.shopitem;
                        me.DATA.super = 1;
                        me.setEnergy();
                        me.dialAni.playWithCallback(me.type == "high" ? "pan2_baoza" : "pan1_baoza", false, function () {
                            me.setContents();
                        })
                    }
                })
            })
        },
        setBox: function() {
            var me = this;
            var conf = G.class.xuyuanchi.getBoxConf();
            
            for (var i = 0; i < conf.length; i ++) {
                (function (conf, i) {
                    var lay = me.nodes["panel_bx" + (i + 1)];
                    var img1 = "img/xuyuanchi/xuyuanchi_bx1.png";
                    var img2 = "img/xuyuanchi/xuyuanchi_bx2.png";
                    var num = me.allDATA.num || 0;
                    var box = me.nodes.list_bx.clone();
                    box.setPosition(0, 0);
                    lay.removeAllChildren();
                    lay.addChild(box);
                    X.autoInitUI(box);
                    box.idx = i;
                    box.prize = conf[1];
                    box.nodes.text_cs2.setString((conf[0][0] < num ? conf[0][0] : num) + "/" + conf[0][0]);
                    X.enableOutline(box.nodes.text_cs2, "#4A1D09", 1);
                    if(X.inArray(me.allDATA.reclist, i)) {
                        box.nodes.panel_bx.setBackGroundImage(img2, 1);
                        box.setTouchEnabled(false);
                    } else {
                        if(num >= conf[0][0]) {
                            box.isrecve = true;
                            X.addBoxAni({
                                parent: box.nodes.panel_bx,
                                boximg: img1
                            });
                            box.nodes.img_klq.show();
                        } else {
                            box.isrecve = false;
                            box.nodes.panel_bx.setBackGroundImage(img1, 1);
                        }
                    }
                    box.click(function (sender) {
                        if(!sender.isrecve) {
                            G.frame.jiangliyulan.data({
                                prize: sender.prize
                            }).show();
                            return;
                        }
                        me.ajax("xuyuanchi_getprize", [sender.idx], function (str, data) {
                            if(data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                me.allDATA.reclist.push(sender.idx);
                                me.setBox();
                            }
                        })
                    })
                })(conf[i], i);
            }

            me.nodes.img_tiao2.setPercent((me.allDATA.num || 0) / conf[0][0][0] * 100);

            for (var i = 1; i < conf.length; i ++) {
                var num = me.allDATA.num || 0;
                var jdt = me.nodes["img_tiao" + (i + 2)];
                var cur = conf[i][0][0];
                var qian = conf[i - 1][0][0];
                jdt.show();
                if(num > qian) {
                    jdt.setPercent(num / cur * 100);
                }else {
                    jdt.setPercent(0);
                }
            }
        },
        setRefreshTime: function () {
            var me = this;
            if(me.DATA.freetime - G.time <= 0){
                me.ui.finds("txt_xcmfsx").hide();
                me.nodes.txt_sxsj.hide();
                me.nodes.btn_sx.hide();
                me.nodes.btn_mfsx.show();
                me.ui.finds("img__wzbg2").hide();
                me.mfsx = true;
            }else{
                me.nodes.btn_mfsx.hide();
                me.ui.finds("txt_xcmfsx").show();
                me.nodes.txt_sxsj.show();
                me.nodes.btn_sx.show();
                me.ui.finds("img__wzbg2").show();
                me.mfsx = false;
                X.timeout(me.nodes.txt_sxsj, me.DATA.freetime, function () {
                    me.ui.finds("txt_xcmfsx").hide();
                    me.ui.finds("img__wzbg2").hide();
                    me.nodes.txt_sxsj.hide();
                    me.nodes.btn_sx.hide();
                    me.nodes.btn_mfsx.show();
                    me.mfsx = true;
                })
            }
        },
        setButtonShow: function(isShow, isSuper){
            var me = this;

            !isSuper && me.nodes.btn_fh.setVisible(isShow);
            me.type !== "high" && me.nodes.btn_xysd.setVisible(isShow);
            !isSuper && me.nodes.btn_gjxyc.setVisible(isShow);
            !isSuper && me.nodes.btn_ptxyc.setVisible(isShow);
            me.nodes.btn_bz.setVisible(isShow);
            me.type !== "high" && me.nodes.btn_gmyb.setVisible(isShow);
            me.nodes.img_gs.setVisible(isShow);
            me.nodes.text_gssl.setVisible(isShow);
            me.ui.finds("img_token_bg").setVisible(isShow);
            me.ui.finds("img__wzbg2").setVisible(isShow);
            me.nodes.btn_1.setVisible(isShow);
            me.nodes.btn_2.setVisible(isShow);
            me.type !== "high" && me.nodes.img_tiao1.setVisible(isShow);
            me.type !== "high" && me.nodes.panel_boy.setVisible(isShow);
            me.type !== "high" && me.nodes.ico_mzrw.setVisible(isShow);
            if(!me.mfsx) {
                me.nodes.txt_sxsj.setVisible(isShow);
                me.nodes.btn_sx.setVisible(isShow);
                me.ui.finds("txt_xcmfsx").setVisible(isShow);
            } else {
                me.nodes.btn_mfsx.setVisible(isShow);
            }
        },
        showIcon: function () {
            var me = this;
            me.conf = G.class.xuyuanchi.get()[me.type];

            me.nodes.panel_token.setBackGroundImage(G.class.getItemIco(me.conf.tenneed[0].t), 1);
            me.nodes.panel_token2.setBackGroundImage(G.class.getItemIco(me.conf.tenneed[0].t), 1);

            me.nodes.text_sl.setString(me.conf.oneneed[0].n);
            me.nodes.text_sl2.setString(me.conf.tenneed[0].n);

            me.ui.finds("text_yc").setString(1 + L("Ci"));
            me.nodes.text_yc2.setString((me.type == "high" ? 10 : 15) + L("Ci"));

            me.nodes.img_gs.loadTexture(G.class.getItemIco(me.conf.tenneed[0].t), 1);
            me.nodes.text_gssl.setString(G.class.getOwnNum((me.conf.tenneed[0].t),me.conf.tenneed[0].a));
            me.nodes.txt_sxsz.setString(me.conf.rfneed[0].n);
        },
        setTime: function () {
            var me = this;
            var timeTxt = new ccui.Text();
            // timeTxt.setTextColor(cc.color(G.gc.COLOR[5]));
            // timeTxt.setFontName(G.defaultFNT);
            // timeTxt.setFontSize(40);
            // me.ui.addChild(timeTxt);
            // timeTxt.setPosition(300, 400);
            X.timeout(timeTxt, X.getTodayZeroTime() + 24 * 3600,function () {
                X.uiMana.closeAllFrame();
            });
        },
        getPrizeData: function(callback) {
            var me = this;

            G.ajax.send("xuyuanchi_jilu", [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.prizeData = d.d[me.type];
                    callback && callback();
                }
            })
        },
        showPrizeInfo: function () {
            var me = this;
            var data = me.prizeData;
            var scrollView = me.nodes.txt_zjjrwz;

            scrollView.removeAllChildren();

            if(data.length < 1) {
                me.ui.finds("panel_zjjr").hide();
            }else {
                me.ui.finds("panel_zjjr").show();
            }

            for(var i = 0; i < data.length; i ++) {
                var conf = G.class.sitem(data[i].prize).conf;
                var text = X.STR(L("HJXX"), data[i].username, G.gc.COLOR[conf.color || conf.star - 1], conf.name, "x" + data[i].prize.n);
                var rh = new X.bRichText({
                    size: 20,
                    maxWidth: scrollView.width,
                    lineHeight: 28,
                    color: "#ffffff",
                    family: G.defaultFNT
                });
                rh.text(text);
                scrollView.pushBackCustomItem(rh);
            }
            me.movePrize(data, scrollView);
        },
        movePrize: function (data, scrollView) {
            var me = this;
            if(data.length > 3) {
                scrollView.scrollToBottom(data.length - 3, false);
                me.ui.setTimeout(function () {
                    scrollView.jumpToTop();
                    me.movePrize(data, scrollView)
                }, (data.length - 3) * 1000);
            }
        }
    });
    G.frame[ID] = new fun('xuyuanchi.json', ID);
})();