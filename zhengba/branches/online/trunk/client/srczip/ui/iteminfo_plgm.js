/**
 * Created by wfq on 2018/6/23.
 */
 (function () {
    //批量购买
    var ID = 'iteminfo_plgm';

    var fun = X.bUi.extend({
        extConf: {
            item: {
                btnCs: function (node) {
                    var me = G.frame.iteminfo_plgm;
                    me.setMoneyState(true);
                    node.setTitleText(L('BTN_GOUMAI'));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.inputNumber && cc.isNumber(me.inputNumber) && me.inputNumber != NaN) {
                                me.curNum = me.inputNumber;
                                if (me.curNum < 1) {
                                    me.curNum = 1;
                                }
                                if (me.curNum > me.maxNum) {
                                    me.curNum = me.maxNum;
                                }
                                me.setCurNum();
                                me.setMoney();
                            } else {
                                me.setCurNum();
                                me.setMoney();
                            }
                            if (me.ownNum < me.needAttr[0].n) {
                                G.tip_NB.show(L('ZSBZ'));
                                return;
                            } else if (me.curNum < 1) {
                                G.tip_NB.show(L('NEED_NUM'));
                                return;
                            }
                            var callback = me.data().callback;
                            callback && callback(me.curNum);
                            me.remove();
                        }
                    });
                },
                btnPlus: function (node) {
                    var me = G.frame.iteminfo_plgm;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum > 0) {
                                me.curNum--;
                                me.setCurNum();
                                me.setMoney();
                            }
                        }
                        if (type == ccui.Widget.LONG_TOUCH) {
                            me.extConf['item'].updata_num(false, false);
                        }
                        if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                            me.extConf['item'].updata_num(true);
                        }
                    }, null, {emitLongTouch: true});
                },
                btnAdd: function (node) {
                    var me = G.frame.iteminfo_plgm;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum < me.maxNum) {
                                me.curNum++;
                                me.setCurNum();
                                me.setMoney();
                            }
                        }
                        if (type == ccui.Widget.LONG_TOUCH) {
                            me.extConf['item'].updata_num(false, true);
                        }
                        if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                            me.extConf['item'].updata_num(true);
                        }
                    }, null, {emitLongTouch: true});
                },
                updata_num: function (end, jia) {
                    var me = G.frame.iteminfo_plgm;
                    if (end) {
                        me.js_jia && clearTimeout(me.js_jia);
                        me.js_jian && clearTimeout(me.js_jian);
                        return;
                    } else {
                        if (jia) {
                            function timedCount_jia() {
                                if (me.curNum < me.maxNum) {
                                    me.curNum++;
                                    me.setCurNum();
                                    me.setMoney();
                                    me.js_jia = setTimeout(function () {
                                        timedCount_jia();
                                    }, 100);
                                } else {
                                    return;
                                }
                            }
                            timedCount_jia();
                        } else {
                            function timedCount_jian() {
                                if (me.curNum > 0) {
                                    me.curNum--;
                                    me.setCurNum();
                                    me.setMoney();
                                    me.js_jian = setTimeout(function () {
                                        timedCount_jian();
                                    }, 100);
                                } else {
                                    return;
                                }
                            }
                            timedCount_jian();
                        }
                    }
                },
            }
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('zhuangbei_tip3.json', function (view) {
                me._view = view;

                view.nodes.panel_bg.setTouchEnabled(true);
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);

                me.setContents();
            }, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        setBaseInfo: function () {
            var me = this;

            me.buy = me.data().buy;
            me.curNum = me.data().num || 1;
            me.needAttr = me.data().buyneed;

            me.ownNum = G.class.getOwnNum(me.needAttr[0].t, me.needAttr[0].a);
            me.maxNum = Math.floor(me.ownNum / me.needAttr[0].n);
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();

            var panel = me._view;
            var layIco = panel.nodes.panel_1;
            var txtName = panel.nodes.text_1;
            var btnPlus = panel.nodes.btn_1;
            var btnAdd = panel.nodes.btn_2;
            var btnCs = panel.nodes.btn_3;
            var txtNum = panel.nodes.textfield_5;
            txtNum.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
            txtNum.setTextHorizontalAlignment(1);
            txtNum.setTextVerticalAlignment(1);
            X.setInput(txtNum, function () {
                me.curNum = txtNum.getString().trim() > me.maxNum ? me.maxNum : txtNum.getString().trim();
                me.setMoney();
            });

            layIco.removeAllChildren();

            var wid = G.class.sitem(me.buy);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);
            wid.num.hide();

            setTextWithColor(txtName, wid.conf.name, G.gc.COLOR[wid.conf.color || 1]);

            me.setCurNum();
            me.setMoney();

            me.extConf['item'].btnPlus(btnPlus);
            me.extConf['item'].btnAdd(btnAdd);
            // me.extConf[me.buy.a].btnPlus(btnPlus);
            // me.extConf[me.buy.a].btnAdd(btnAdd);

            btnCs.tid = me.buy.t;
            btnCs.showtype = wid.conf.type || '5'; //5代表饰品的装备类型
            btnCs.itemid = wid.conf.itemid;
            me.extConf['item'].btnCs(btnCs);
            // me.extConf[me.buy.a].btnCs(btnCs);

            // txtNum.addEventListener(function (sender, type) {
            //     var txt = sender.getString().trim();
            //     me.inputNumber = txt * 1;
            //     me.curNum = me.inputNumber;
            //     me.setMoney();
            // }, me);
        },
        setCurNum: function () {
            var me = this;

            var panel = me._view;
            var txtNum = panel.nodes.textfield_5;

            txtNum.setString(me.curNum);
            me.setBtns();
        },
        setMoneyState: function (bool) {
            var me = this;

            var panel = me._view;
            var imgAttr = panel.finds('image_3');
            var txtAttr = panel.nodes.text_2;
            var imgBg = panel.finds('image_2');

            imgAttr.setVisible(bool);
            txtAttr.setVisible(bool);
            imgBg.setVisible(bool);
        },
        setMoney: function () {
            var me = this;

            var panel = me._view;
            var imgAttr = panel.finds('image_3');
            var txtAttr = panel.nodes.text_2;

            imgAttr.loadTexture(G.class.getItemIco(me.needAttr[0].t), 1);
            txtAttr.setString(me.ownNum + '/' + (me.needAttr[0].n * me.curNum));
        },
        setBtns: function () {
            var me = this;

            var btnAdd = me._view.nodes.btn_2;
            var btnPlus = me._view.nodes.btn_1;

            
            

            if (me.curNum > 1) {
                btnPlus.setTouchEnabled(true);
                btnPlus.setEnableState(true);
            }else{
                btnPlus.setTouchEnabled(false);
                btnPlus.setEnableState(false);
            }
            if (me.curNum < me.maxNum) {
                btnAdd.setTouchEnabled(true);
                btnAdd.setEnableState(true);
            }else{
                btnAdd.setTouchEnabled(false);
                btnAdd.setEnableState(false);
            }
        }
    });

G.frame[ID] = new fun('panel_nr.json', ID);
})();