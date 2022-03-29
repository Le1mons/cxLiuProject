/**
 * Created by
 */
(function () {
    //
    var ID = 'niudan';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            G.class.ani.show({
                json: 'zhengguniudan_ndj_tx',
                addTo: me.nodes.panel_ndj,
                autoRemove: false,
                z: -1,
                onload: function (n, a) {
                    me.ndjAni = n;
                    a.play('wait', true);
                },
                onkey: function (n, a, e) {
                    if (e == 'hit') {
                        n.callback && n.callback();
                    }
                }
            });


            me.clickNum = me.DATA.myinfo.click;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr: L('TS87')
                }).show();
            });
            me.nodes.btn_libao.click(function () {
                if (me.eventEnd) {
                    return G.tip_NB.show(L("HDYJS"));
                }
                G.frame.niudan_libao.show();
            });
            me.nodes.btn_jl.click(function () {
                G.frame.niudan_fuli.show();
            });
            me.nodes.qipao.setVisible(me.DATA.myinfo.todayfight == 0);
            var conf = JSON.parse(JSON.stringify(G.gc.hero['11011']));
            conf.rid = 'rng';
            var role = new G.class.Role(conf);
            me.nodes.ruanni.addChild(role);
            me.isShowFight = false;
            me.nodes.ruanni.click(function () {
                if (me.clickNum >= G.gc.niudan.clickNum && me.DATA.myinfo.todayfight == 0 && !me.isShowFight && !me.eventEnd) {
                    me.isShowFight = true;


                    G.frame.niudan_tz.once('willClose', function () {
                        me.isShowFight = false;
                    }).show();
                }
                me.nodes.qipao.hide();
                role.setAct('byatk', false, function () {
                    role.role.runAni(0,'wait',true);
                    !me.eventEnd && me.DATA.myinfo.todayfight == 0 && me.nodes.qipao.show();
                });
                me.clickNum ++;
            });
            cc.enableScrollBar(me.nodes.scrollview);

            var need = G.gc.niudan.niudanneed[0];
            me.nodes.ico_zs.loadTexture(G.class.getItemIco(need.t), 1);
            me.nodes.ico_zs10.loadTexture(G.class.getItemIco(need.t), 1);
            me.showTenBtnState();

            me.nodes.btn_1ci.click(function (sender) {
                if (me.getIsOver()) {
                    return G.tip_NB.show(L("niudan_prize_over"));
                }
                if (G.class.getOwnNum(need.t, need.a) < 1) {
                    return G.tip_NB.show(G.class.getItem(need.t, need.a).name + L("BUZU"))
                }
                me.lottery(1);
            });
            me.nodes.btn_10ci.click(function (sender) {
                if (me.getIsOver()) {
                    return G.tip_NB.show(L("niudan_prize_over"));
                }
                if (G.class.getOwnNum(need.t, need.a) < 1) {
                    return G.tip_NB.show(G.class.getItem(need.t, need.a).name + L("BUZU"))
                }
                me.lottery(10);
            });
            me.showTime();
        },
        showTime: function () {
            var me = this;

            if (G.time < me.DATA.info.rtime) {
                X.timeout(me.nodes.shijian, me.DATA.info.rtime, function () {
                    me.showTime();
                }, null, {
                    showDay: true
                });
            } else {
                me.eventEnd = true;
                me.nodes.qipao.hide();
                me.ui.finds('txt_sl$_0').setString(L("DUIHUAN") + L("DJS") + ":");
                X.timeout(me.nodes.shijian, me.DATA.info.etime, function () {
                    me.nodes.shijian.setString(L("YJS"));
                }, null, {
                    showDay: true
                });
            }

        },
        lottery: function (num) {
            var me = this;

            me.ajax('niudan_lottery', [String(me.index + 1), num], function (str, data) {
                if (data.s == 1) {
                    
                    me.ndjAni.callback = function () {
                        G.class.ani.show({
                            json: 'zhengguniudan_nd_tx',
                            addTo: me.ui,
                            onkey: function (n, a, e) {
                                if (e == 'hit') {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).once('willClose', function () {
                                        if (data.d.good && G.frame.niudan.DATA.info.data.niudan[me.index + 2]) {
                                            G.frame.alert.data({
                                                sizeType: 3,
                                                cancelCall: null,
                                                okCall: function () {
                                                    me.nodes.anniu2.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                                },
                                                richText: X.STR(L("niudan_prize"), me.index + 2)
                                            }).show();
                                        }
                                    }).show();
                                    G.frame.loadingIn.remove();
                                }
                            }
                        })
                    }
                    G.frame.loadingIn.show();
                    me.ndjAni.action.playWithCallback('niudan', false, function () {
                        me.ndjAni.callback = undefined;
                        delete me.ndjAni.callback;
                        me.ndjAni.action.play('wait', true);
                    });
                    G.frame.niudan.getData(function () {
                        me.showPrize();
                    });
                    me.showTenBtnState();
                }
            });
        },
        showTenBtnState: function () {
            var me = this;
            var need = G.gc.niudan.niudanneed[0];
            var haveNum = G.class.getOwnNum(need.t, need.a);
            var maxNum = haveNum > 10 ? 10 : (haveNum || 1);
            me.nodes.zs_wz.setString(X.fmtValue(haveNum) + '/' + need.n);
            me.nodes.zs_wz10.setString(X.fmtValue(haveNum) + '/' + need.n * maxNum);
            me.ui.finds('Text_21_0').setString(X.STR(L("nd_njc"), maxNum));
        },
        onHide: function () {
            var me = this;

            if (me.clickNum > me.DATA.myinfo.click && me.DATA.myinfo.todayfight == 0 && !me.eventEnd) {
                G.ajax.send('niudan_click', [me.clickNum]);
            }
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        onShow: function () {
            var me = this;

            me.index = me.getCurIndex();
            me.setButtonState();

            me.nodes.anniu1.click(function () {
                me.index --;
                me.change(true);
                me.setButtonState();
            });
            me.nodes.anniu2.click(function () {
                me.index ++;
                me.change(true);
                me.setButtonState();
            });

            me.change();
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;
            var data = G.DATA.hongdian.niudan;

            if (data.task) {
                G.setNewIcoImg(me.nodes.btn_jl);
            } else {
                G.removeNewIco(me.nodes.btn_jl);
            }
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

            me.ajax("niudan_open", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        getActive: function () {
            if (this.index == 0) return true;
            var goodIndex = 0;
            for (var index = 0; index < G.frame.niudan.DATA.info.data.niudan[this.index].length; index ++) {
                if (G.frame.niudan.DATA.info.data.niudan[this.index][index].good == 1) {
                    goodIndex = index;
                    break;
                }
            }
            return G.frame.niudan.DATA.myinfo.niudan[this.index] && G.frame.niudan.DATA.myinfo.niudan[this.index][goodIndex] >= 1;
        },
        getCurIndex: function () {
            var idx = 0;
            for (var index = 0; index < Object.keys(G.frame.niudan.DATA.info.data.niudan).length; index ++) {
                idx = index;
                var goodIndex = 0;
                for (var _index = 0; _index < G.frame.niudan.DATA.info.data.niudan[index + 1].length; _index ++) {
                    if (G.frame.niudan.DATA.info.data.niudan[index + 1][_index].good == 1) {
                        goodIndex = index;
                        break;
                    }
                }
                if (G.frame.niudan.DATA.myinfo.niudan[index + 1] && G.frame.niudan.DATA.myinfo.niudan[index + 1][goodIndex] >= 1) {

                } else {
                    break;
                }
            }
            return idx;
        },
        setButtonState: function () {
            var me = this;

            me.nodes.anniu1.setVisible(me.index > 0);
            me.nodes.anniu2.setVisible(me.index < Object.keys(G.frame.niudan.DATA.info.data.niudan).length - 1);
        },
        change: function (isTop) {
            var me = this;

            me.showPrize(isTop);
            me.nodes.wenzi_1.setString(X.STR(L('ndj_lock'), me.index));
            //
            if (me.getActive()) {
                me.ui.finds('Panel_27').show();
                // me.ndj.nodes.btn_1ci.show();
                // me.ndj.nodes.btn_10ci.show();
                // me.ndj.nodes.quhuokou.show();
                // me.ndj.nodes.zhuangtai_10.hide();
                me.nodes.wenzi_1.hide();
            } else {
                me.ui.finds('Panel_27').hide();
                me.nodes.wenzi_1.show();
                // me.ndj.nodes.btn_1ci.hide();
                // me.ndj.nodes.btn_10ci.hide();
                // me.ndj.nodes.quhuokou.hide();
                // me.ndj.nodes.zhuangtai_10.show();
                // me.ndj.nodes.niudan_wzsm1.setString(X.STR(L('ndj_lock'), me.index));
            }
        },
        showPrize: function (isTop) {
            var me = this;
            var prizeArr = G.frame.niudan.DATA.info.data.niudan[me.index + 1];
            var arr1 = [];
            for (var index = 0; index < prizeArr.length; index ++) {
                var prize = prizeArr[index];
                prize.index = index;
                arr1.push(prize);
            }

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panle_ico, 4, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(arr1);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(arr1);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var numData = G.frame.niudan.DATA.myinfo.niudan[me.index + 1] || {};

            X.autoInitUI(ui);
            X.render({
                ico: function (node) {
                    X.alignCenter(node, data.prize, {
                        touch: true
                    });
                },
                ico_wz: data.num - (numData[data.index] || 0) + "/" + data.num,
                zz: function (node) {
                    node.setVisible(data.num - (numData[data.index] || 0) <= 0);
                },
                ico_biao: function (node) {
                    node.setVisible(data.good == 1);
                }
            }, ui.nodes);
        },
        getIsOver: function () {
            var me = this;
            var overLen = 0;
            var prizeArr = G.frame.niudan.DATA.info.data.niudan[me.index + 1];
            var numData = G.frame.niudan.DATA.myinfo.niudan[me.index + 1] || {};

            for (var index = 0; index < prizeArr.length; index ++) {
                var num = numData[index] || 0;
                if (num >= prizeArr[index].num) {
                    overLen ++;
                }
            }
            return overLen >= prizeArr.length;
        }
    });
    G.frame[ID] = new fun('zhengguniudan.json', ID);
})();