/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wztt';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.showKSPP();
            me.nodes.panel_gou.setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });
            me.nodes.panel_gou.click(function () {
                if (X.cacheByUid("wztt_kspp") == 1) {
                    X.cacheByUid("wztt_kspp", 0);
                    me.showKSPP();
                } else {
                    if (!X.cacheByUid("wztt_hint")) {
                        G.frame.hint.data({
                            callback: function () {
                                X.cacheByUid("wztt_kspp", 1);
                                me.showKSPP();
                            },
                            cacheKey: "wztt_hint",
                            txt: L("KSPP_TS")
                        }).show();
                    } else {
                        X.cacheByUid("wztt_kspp", 1);
                        me.showKSPP();
                    }
                }

            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS67')
                }).show();
            });
            me.nodes.btn_duanweibaoxiang.click(function () {//每日历练
                G.frame.wztt_mrll.show();
            });
            me.nodes.btn_paimingjiangli.click(function () {//排行奖励
                G.frame.wztt_pmjl.show()
            });
            me.nodes.btn_lijiewangzhe.click(function () {//天梯霸主
                G.frame.wztt_ttbz.show();
            });
            me.nodes.btn_sdpp.click(function () {
                me.ui.finds("btn_baoming").triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
            me.nodes.btn_sqsd.click(function () {
                // G.frame.shop.data({type:"12"}).show();
                G.frame.shopmain.data('12').show();
            });
            me.nodes.btn_zdrz.click(function () {
                G.frame.wztt_zdrz.show();
            });
            me.ui.finds("btn_baoming").click(function () {
                var isKSPP = X.cacheByUid("wztt_kspp") == 1;
                if (me.DATA.star < G.gc.wztt.showThreeFight) {
                    var hasCache = {};
                    var hasHero = false;
                    var cache = X.cacheByUid("wztt_one") || {};
                    if (isKSPP) {
                        for (var pos in cache) {
                            if (G.DATA.yingxiong.list[cache[pos]]) {
                                hasHero = true;
                                hasCache[pos] = cache[pos];
                            } else if (pos == 'sqid') {
                                hasCache[pos] = cache[pos];
                            }
                        }
                    }
                    if (isKSPP && hasHero) {
                        return me.fight([].concat(hasCache), function (data, showCall, closeCall) {
                            data.fightres[0].prize = data.prize;
                            data.fightres[0].headdata = data.headdata;
                            data.fightres[0].pvType = "wztt_one";
                            G.frame.wztt_ppds.once("willClose", function () {
                                G.frame.fight.once("willClose", function () {
                                    me.getData(function () {
                                        me.showDan(true);
                                        me.showFightNum();
                                        me.showTimeReply();
                                    });
                                    closeCall && closeCall();
                                }).once('show', function () {
                                    showCall && showCall();
                                }).demo(data.fightres[0]);
                            }).data(data).show();
                        });
                    }
                    G.frame.fight.startFight({
                        pvType: "wztt_one"
                    }, function(node) {
                        var selectedData = node.getSelectedData();
                        me.fight([].concat(selectedData), function (data, showCall, closeCall) {
                            data.fightres[0].prize = data.prize;
                            data.fightres[0].headdata = data.headdata;
                            data.fightres[0].pvType = "wztt_one";
                            X.cacheByUid('wztt_one', selectedData);
                            G.frame.yingxiong_fight.remove();
                            G.frame.wztt_ppds.once("willClose", function () {
                                G.frame.fight.once("willClose", function () {
                                    me.getData(function () {
                                        me.showDan(true);
                                        me.showFightNum();
                                    });
                                    closeCall && closeCall();
                                }).once('show', function () {
                                    showCall && showCall();
                                }).demo(data.fightres[0]);
                            }).data(data).show();
                        });
                    });
                } else {
                    var caches = [{}, {}, {}];
                    var cache = X.cacheByUid("wztt_three") || [];
                    var has = [];
                    if (isKSPP) {
                        for (var index = 0; index < cache.length; index ++) {
                            var _troop = cache[index] || {};
                            for (var pos in _troop) {
                                if (pos == 'sqid') caches[index][pos] = _troop[pos];
                                else if (G.DATA.yingxiong.list[_troop[pos]]) {
                                    caches[index][pos] = _troop[pos];
                                    has[index] = true;
                                }
                            }
                        }
                    }
                    if (isKSPP && has.length == 3) {//三队
                        return me.fight(caches, function (data, showCall, closeCall) {
                            data.fightres[0].headdata = data.headdata;
                            G.frame.wztt_ppds.once("willClose", function () {
                                G.frame.fight.data({
                                    pvType: 'wztt_three',
                                    prize: data.prize,
                                    session: 0,
                                    fightlength: data.fightres.length,
                                    fightData:data,
                                    callback: function(session) {
                                        data.fightres[session].headdata = data.headdata;
                                        G.frame.fight.demo(data.fightres[session]);
                                    }
                                }).once('willClose', function() {
                                    me.getData(function () {
                                        me.showDan(true);
                                        me.showFightNum();
                                    });
                                    closeCall && closeCall();
                                }).once('show', function () {
                                    showCall && showCall();
                                }).demo(data.fightres[0]);
                            }).data(data).show();
                        });
                    }

                    G.frame.jingjichang_gjfight.data({
                        type: 'wztt_three',
                        callback: function(node) {
                            var _data = node.getDefendData();
                            me.fight(_data, function (data, showCall, closeCall) {
                                G.frame.jingjichang_gjfight.remove();
                                X.cacheByUid("wztt_three", _data);
                                data.fightres[0].headdata = data.headdata;
                                G.frame.wztt_ppds.once("willClose", function () {
                                    G.frame.fight.data({
                                        pvType: 'wztt_three',
                                        prize: data.prize,
                                        session: 0,
                                        fightlength: data.fightres.length,
                                        fightData:data,
                                        callback: function(session) {
                                            data.fightres[session].headdata = data.headdata;
                                            G.frame.fight.demo(data.fightres[session]);
                                        }
                                    }).once('willClose', function() {
                                        me.getData(function () {
                                            me.showDan(true);
                                            me.showFightNum();
                                        });
                                        closeCall && closeCall();
                                    }).once('show', function () {
                                        showCall && showCall();
                                    }).demo(data.fightres[0]);
                                }).data(data).show();
                            });
                        }
                    }).show();
                }
            },500);
            me.nodes.btn_jia.click(function () {
                var arr = [];
                var conf = G.gc.wztt.buynum;
                for (var index = 0; index < conf.length; index ++) {
                    if (P.gud.vip >= conf[index][0]) arr.push(conf[index]);
                }
                if (me.DATA.buy >= arr.length) {
                    if (arr.length != conf.length) return G.tip_NB.show(L("GMCSBZ") + "," + L("TSGZDJZJGMCS"));
                    return G.tip_NB.show(L("GMCSBZ"));
                }
                G.frame.alert.data({
                    ok:{wz:L('GM')},
                    okCall: function(){
                        if (me.DATA.buy >= arr.length) {
                            if (arr.length != conf.length) return G.tip_NB.show(L("GMCSBZ") + "," + L("TSGZDJZJGMCS"));
                            return G.tip_NB.show(L("GMCSBZ"));
                        }
                        me.ajax('ladder_buy', [], function (str, data) {
                            if (data.s == 1){
                                G.tip_NB.show(L("GMCG"));
                                me.getData(function () {
                                    me.showFightNum();
                                    me.showTimeReply();
                                    if (me.DATA.buy >= arr.length) return G.frame.alert.remove();
                                    else {
                                        G.frame.alert.data().richText = X.STR(L('wztt_buy'),
                                            arr[me.DATA.buy][1][0].n,
                                            P.gud.vip,
                                            arr.length - me.DATA.buy);
                                        G.frame.alert.updateText();
                                    }
                                });
                            }
                        },true);
                    },
                    autoClose: false,
                    richNodes:[
                        new cc.Sprite('#' + G.class.getItemIco('rmbmoney'))
                    ],
                    richText: X.STR(L('wztt_buy'),
                        arr[me.DATA.buy][1][0].n,
                        P.gud.vip,
                        arr.length - me.DATA.buy)
                }).show();
            });
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.ladder == 2) {
                G.setNewIcoImg(me.nodes.btn_duanweibaoxiang);
                me.nodes.btn_duanweibaoxiang.redPoint.setPosition(79, 79);
                G.class.ani.show({
                    json: "huizhang_tx_mrll",
                    addTo: me.nodes.btn_duanweibaoxiang,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setTag(333);
                    }
                });
            } else {
                if (cc.isNode(me.nodes.btn_duanweibaoxiang.getChildByTag(333))) {
                    me.nodes.btn_duanweibaoxiang.getChildByTag(333).removeFromParent();
                }
                G.removeNewIco(me.nodes.btn_duanweibaoxiang);
            }
        },
        fight: function (cache, callback) {
            var me = this;

            me.ajax("ladder_fight", [cache], function (str, data) {
                if (data.s == 1) {
                    G.hongdian.getData("ladder", 1, function () {
                        me.checkRedPoint();
                        G.frame.jingjichang.checkRedPoint();
                    });
                    callback && callback(data.d, function () {
                        try {
                            G.frame.fight.pvp_start({
                                id: data.d.headdata[1].uid || '',
                                zhanli: data.d.headdata[1].zhanli || 0,
                                rList: G.frame.fight.getHidBySide(data.d.fightres, 1, true),
                                lList: G.frame.fight.getHidBySide(data.d.fightres, 0, true),
                                type: 'wangzhetianti'
                            });
                        } catch (e) {
                            cc.error(e);
                        }
                    }, function () {
                        try {
                            var winside;
                            if (cache.length == 1) {
                                winside = data.d.fightres[0].winside;
                            } else {
                                var myWin = 0;
                                cc.each(data.d.fightres, function (_f) {
                                    if (_f.winside == 0) {
                                        myWin ++;
                                    }
                                });
                                winside = myWin > 1 ? 0 : 1;
                            }
                            G.frame.fight.pvp_end({
                                id: data.d.headdata[1].uid || '',
                                zhanli: data.d.headdata[1].zhanli || 0,
                                rList: G.frame.fight.getHidBySide(data.d.fightres, 1, true),
                                lList: G.frame.fight.getHidBySide(data.d.fightres, 0, true),
                                data: G.frame.fight.getHeroData(d.d.fightres, 0, true),

                                result: winside,
                                type: 'wangzhetianti'
                            });
                        } catch (e) {
                            cc.error(e);
                        }
                    });
                } else if (data.s == -3) {
                    X.cacheByUid("wztt_one", {});
                    X.cacheByUid("wztt_three", []);
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
            me.showTimeReply();
        },
        showTimeReply: function () {
            var me = this;
            var toTime = me.DATA.freetime + G.gc.wztt.cd;
            if (G.time > toTime) return me.nodes.panel_tzcsw.hide();
            me.nodes.panel_tzcsw.show();
            X.timeout(me.nodes.text_sjtz, toTime, function () {
                me.getData(function () {
                    me.showFightNum();
                    me.showTimeReply();
                });
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        getData: function (callback) {
            var me = this;

            connectApi("ladder_open", [], function (data) {
                me.DATA = data;
                if (data.new == 1) {
                    // X.cacheByUid("wztt_one", {});
                    // X.cacheByUid("wztt_three", []);
                }
                callback && callback();
            });
        },
        onHide: function () {
            G.hongdian.getData("ladder", 1, function () {
                G.frame.jingjichang.checkRedPoint();
            });
        },
        onShow: function () {
            var me = this;

            me.showDan();
            me.showToper();
            me.setContents();
            me.setIsOpenState();
            me.checkRedPoint();
        },
        onAniShow: function () {
            var me = this;
            me.action.play("wait", true);
        },
        showDan: function (isAni) {
            var me = this;
            var conf = G.class.getDan(me.DATA.star);
            if (isAni) me.showTimeReply();

            function _star () {
                me.lastCurStar = undefined;
                me.firstKongStar = undefined;
                if (conf.dan == 7) {
                    me.nodes.txt_fnt.setString(me.DATA.star - Object.keys(G.gc.wztt.star).length + 1);
                } else {
                    var num = 0;
                    for (var star in G.gc.wztt.star) {
                        if (G.gc.wztt.star[star].dan == conf.dan && G.gc.wztt.star[star].step == conf.step) num ++;
                    }
                    var arr = [];
                    for (var index = 1; index < num; index ++) {
                        var img = new ccui.ImageView("img/wztt/img_tt_xx" + (conf.star >= index ? 2 : 1) + ".png", 1);
                        img.setAnchorPoint(0.5, 0.5);
                        if (conf.star >= index) {
                            me.lastCurStar = img;
                        } else {
                            if (!me.firstKongStar) me.firstKongStar = img;
                        }
                        arr.push(img);
                    }
                    X.center(arr, me.nodes.panel_xx);
                }
                me.ui.finds("btn_baoming").setVisible(conf.dan == 7 || conf.star < num - 1);
                me.nodes.btn_sdpp.setVisible(conf.dan != 7 && conf.star == num - 1);
            }

            if (isAni && me.lastDan != undefined) {
                var lastConf = G.class.getDan(me.lastDan);
                if (lastConf.dan != conf.dan || lastConf.step != conf.step) {
                    me.nodes.panel_dh.hide();
                    me.nodes.panel_jd_wz.hide();
                    G.class.ani.show({
                        json: lastConf.dan > conf.dan ? "huizhang_tx_jj" : "huizhang_tx_sj",
                        addTo: me.nodes.panel_hz,
                        onload: function (node, action) {
                            X.autoInitUI(node);
                            X.render({
                                panel_hz1: function (node) {
                                    var _conf = lastConf.dan > conf.dan ? conf : lastConf;
                                    node.setBackGroundImage("img/wztt/hz" + _conf.dan + ".png");
                                },
                                panel_hz2: function (node) {
                                    var _conf = lastConf.dan > conf.dan ? lastConf : conf;
                                    node.setBackGroundImage("img/wztt/hz" + _conf.dan + ".png");
                                },
                            }, node.nodes);
                        },
                        onend: function () {
                            me.nodes.panel_dh.show();
                            me.nodes.panel_jd_wz.show();
                            _star();
                        }
                    });
                } else {
                    if (me.DATA.star != me.lastDan) {
                        if (conf.dan == 7) {
                            G.class.ani.show({
                                json: me.lastDan < me.DATA.star ? "huizhang_tx_jiaxing" : "huizhang_tx_jianxing",
                                addTo: me.nodes.txt_fnt,
                                onkey: function (n, a, k) {
                                    if (k == 'hit') {
                                        _star();
                                    }
                                }
                            });
                        } else {
                            if (me.DATA.star > me.lastDan && me.firstKongStar) {
                                G.class.ani.show({
                                    json: "huizhang_tx_liangxing",
                                    addTo: me.firstKongStar,
                                    autoRemove: false,
                                    onend: function () {
                                        _star();
                                    }
                                });
                            } else if (me.DATA.star < me.lastDan && me.lastCurStar) {
                                me.lastCurStar.opacity = 0;
                                G.class.ani.show({
                                    json: "huizhang_tx_miexing",
                                    addTo: me.lastCurStar,
                                    autoRemove: false,
                                    onend: function () {
                                        _star();
                                    }
                                });
                            } else {
                                _star();
                            }
                        }
                    } else {
                        _star();
                    }
                }
            } else {
                _star();
            }
            me.nodes.panel_xx1.setVisible(conf.dan == 7);
            me.nodes.panel_xx.setVisible(conf.dan < 7);
            me.nodes.panel_dh.setBackGroundImage("img/wztt/hz" + conf.dan + ".png");
            me.nodes.panel_jd_wz.setBackGroundImage("img/wztt/img_tt_jd" + conf.dan + "-" + conf.step + ".png", 1);

            me.lastDan = me.DATA.star;
        },
        showKSPP: function () {
            this.nodes.img_gou.setVisible(X.cacheByUid("wztt_kspp") == 1);
        },
        setContents: function () {
            var me = this;

            me.showFightNum();
        },
        setIsOpenState: function () {
            var me = this;
            var weekZeroTime = X.getLastMondayZeroTime();
            var isOpen = G.time >= weekZeroTime + 10 * 3600 && G.time <= weekZeroTime + 6 * 24 * 3600 + 22 * 3600;

            me.nodes.jy_jy.setVisible(isOpen);
            me.nodes.panel_wzw.setVisible(!isOpen);
            me.ui.finds("btn_baoming").setEnableState(isOpen);
            me.ui.finds("wz_baoming").setTextColor(cc.color(G.gc.COLOR[isOpen ? "n13" : "n15"]));
            me.nodes.btn_sdpp.setEnableState(isOpen);
            me.nodes.wz_sdpp.setTextColor(cc.color(G.gc.COLOR[isOpen ? "n12" : "n15"]));
            me.nodes.text_sxcs.setString(L(isOpen ? "SJDJS" : "XSJKQ"));
            X.timeout(me.nodes.text_cs, isOpen ? weekZeroTime + 6 * 24 * 3600 + 22 * 3600 :
                (G.time < weekZeroTime + 10 * 3600 ? weekZeroTime + 10 * 3600 : weekZeroTime + 7 * 24 * 3600), function () {
                me.getData(function () {
                    me.onShow();
                });
            }, null, {
                showDay: true
            });
        },
        showFightNum: function () {
            var me = this;
            var haveNum = me.DATA.num;
            var maxNum = G.gc.wztt.maxnum;

            me.isNumOver = haveNum <= 0;
            // me.isMaxBuyNum = me.DATA.buy >= G.gc.wztt.buynum.length;
            var rh = X.setRichText({
                str: "<font color=#2bdf02>" + haveNum + "</font>" + "/" + maxNum,
                parent: me.nodes.txt_cis,
                size: 20,
                color: "#fff8e1",
                outline: "#000000"
            });
            rh.setPosition(me.nodes.txt_cis.width / 2 - rh.trueWidth() / 2,
                me.nodes.txt_cis.height / 2 - rh.trueHeight() / 2);
        }
    });
    G.frame[ID] = new fun('ui_wztt.json', ID);

    G.class.getDan = function (star) {
        star = star || 0;
        var conf = G.gc.wztt.star;
        return conf[star] || conf[Object.keys(conf).length - 1];
    };
})();