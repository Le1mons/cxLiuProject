/**
 * Created by
 */
(function () {
    //赛龙舟-助威数量
    var ID = 'slz_zwsl';
    var fun = X.bUi.extend({
        extConf: {
            item: {
                btnCs: function (node) {
                    var me = G.frame.slz_zwsl;
                    node.setTitleText(L('slz_tip18'));
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
                            } else {
                                me.setCurNum();
                            }
                             if (me.curNum < 1) {
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
                    var me = G.frame.slz_zwsl;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum > 0) {
                                me.curNum--;
                                me.setCurNum();
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
                btnPlusTen: function (node) {
                    var me = G.frame.slz_zwsl;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum > 0) {
                                me.curNum-=10;
                                if (me.curNum<1){
                                    me.curNum = 1;
                                }
                                me.setCurNum();
                            }
                        }
                        if (type == ccui.Widget.LONG_TOUCH) {
                            me.extConf['item'].updata_num_ten(false, false);
                        }
                        if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                            me.extConf['item'].updata_num_ten(true);
                        }
                    }, null, {emitLongTouch: true});
                },
                btnAdd: function (node) {
                    var me = G.frame.slz_zwsl;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum < me.maxNum) {
                                me.curNum++;
                                me.setCurNum();
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
                btnAddTen: function (node) {
                    var me = G.frame.slz_zwsl;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (me.curNum < me.maxNum) {
                                me.curNum+=10;
                                if (me.curNum > me.maxNum){
                                    me.curNum = me.maxNum;
                                }
                                me.setCurNum();
                            }
                        }
                        if (type == ccui.Widget.LONG_TOUCH) {
                            me.extConf['item'].updata_num_ten(false, true);
                        }
                        if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                            me.extConf['item'].updata_num_ten(true);
                        }
                    }, null, {emitLongTouch: true});
                },
                updata_num: function (end, jia) {
                    var me = G.frame.slz_zwsl;
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
                updata_num_ten: function (end, jia) {
                    var me = G.frame.slz_zwsl;
                    if (end) {
                        me.js_jia_ten && clearTimeout(me.js_jia_ten);
                        me.js_jian_ten && clearTimeout(me.js_jian_ten);
                        return;
                    } else {
                        if (jia) {
                            function timedCount_jia_ten() {
                                if (me.curNum < me.maxNum) {
                                    if (me.maxNum - me.curNum>=10){
                                        me.curNum+=10;
                                    } else {
                                        me.curNum++;
                                    }
                                    me.setCurNum();
                                    me.js_jia_ten = setTimeout(function () {
                                        timedCount_jia_ten();
                                    }, 100);
                                } else {
                                    return;
                                }
                            }
                            timedCount_jia_ten();
                        } else {
                            function timedCount_jian_ten() {
                                if (me.curNum > 0) {
                                    if (me.curNum>=10){
                                        me.curNum-=10;
                                    } else {
                                        me.curNum--;
                                    }
                                    me.setCurNum();
                                    me.js_jian_ten = setTimeout(function () {
                                        timedCount_jian_ten();
                                    }, 100);
                                } else {
                                    return;
                                }
                            }
                            timedCount_jian_ten();
                        }
                    }
                },
            }
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.txt_title.setString(L('slz_tip16'));
            // me.ui.finds('bg_tip_title').show();
            me.ui.finds('Image_45_0').show();
            me.ui.finds('Image_45').show();
            me.nodes.text_1.setString(L('slz_tip17'));
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setBaseInfo: function () {
            var me = this;
            me.buy = me.data().buy;
            me.curNum = me.data().num || 1;
            me.maxNum = me.data().maxNum;
        },
        setContents: function () {
            var me = this;
            me.setBaseInfo();
            var layIco = me.nodes.panel_1;
            var btnPlus = me.nodes.btn_1;
            var btnAdd = me.nodes.btn_2;
            var btnCs = me.nodes.btn_zs;
            var btnAddTen = me.nodes.btn_jia10;//加十次
            var btnPlusTen = me.nodes.btn_jian10;//减十次
            var txtNum = me.nodes.textfield_5;
            txtNum.setTouchEnabled(false);
            // txtNum.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
            // txtNum.setTextHorizontalAlignment(1);
            // txtNum.setTextVerticalAlignment(1);
            // X.setInput(txtNum, function () {
            //     var num = parseInt(txtNum.getString().trim());
            //     if (num > me.maxNum) num = me.maxNum;
            //     if (num % 1 !== 0) num = 1;
            //     me.curNum = num;
            //     me.setCurNum();
            // });

            layIco.removeAllChildren();

            var wid = G.class.sitem(me.buy);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);
            wid.num.hide();
            me.setCurNum();
            me.extConf['item'].btnPlus(btnPlus);
            me.extConf['item'].btnAdd(btnAdd);
            me.extConf['item'].btnPlusTen(btnPlusTen);
            me.extConf['item'].btnAddTen(btnAddTen);
            me.extConf['item'].btnCs(btnCs);
        },
        setCurNum: function () {
            var me = this;
            var txtNum = me.nodes.textfield_5;
            txtNum.setString(me.curNum);
            me.setBtns();
        },
        setBtns: function () {
            var me = this;

            var btnAdd = me.nodes.btn_2;
            var btnPlus = me.nodes.btn_1;
            var btnAddTen = me.nodes.btn_jia10;//加十次
            var btnPlusTen = me.nodes.btn_jian10;//减十次
            btnPlus.setEnableState(false);
            btnAdd.setEnableState(false);
            btnAddTen.setEnableState(false);
            btnPlusTen.setEnableState(false);

            if (me.curNum > 1){
                btnPlus.setEnableState(true);
                btnPlusTen.setEnableState(true);
            }
            if (me.curNum < me.maxNum){
                btnAdd.setEnableState(true);
                btnAddTen.setEnableState(true);
            }
        }
    });
    G.frame[ID] = new fun('duanwu_tk1.json', ID);
})();