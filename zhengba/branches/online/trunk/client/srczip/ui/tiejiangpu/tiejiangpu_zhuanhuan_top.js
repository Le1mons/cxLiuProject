/**
 * Created by LYF on 2018/11/15.
 */
(function () {
    //tiejiangpu_top
    G.class.tiejiangpu_zhuanhuan_top = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('zhuangbei_zhuanhuan.json');
        },
        getMaxNum: function(data) {
            var equip = G.frame.beibao.DATA.zhuangbei.list;

            for (var i in equip) {
                if(equip[i].eid == data.id && equip[i].num > 0) {
                    return equip[i].num - equip[i].usenum;
                }
            }
            return 0;
        },
        getIdxData:function (data) {
            var me = this;
            me._curData = data;
            me.maxNum = me.getMaxNum(data);
            me.canMaxBuyNum = 0;
            me.curNum = 0;
            me.isShow && me.setContents();
        },
        getCanArr: function(data) {
            var arr = [];
            var conf = G.class.equip.get();

            for (var i in conf) {
                if(conf[i].star == data.star && conf[i].color == data.color && conf[i].id != data.id) {
                    arr.push(conf[i]);
                }
            }

            return arr;
        },
        setContents: function () {
            var me = this;

            var widget = G.class.szhuangbei(me._curData);
            widget.data.a = 'equip';
            widget.setAnchorPoint(0.5,0.5);
            widget.setPosition(me.nodes.panel_tb2.width / 2, me.nodes.panel_tb2.height / 2 - 4);
            me.nodes.panel_tb2.removeAllChildren();
            me.nodes.panel_tb2.addChild(widget);
            G.frame.iteminfo.showItemInfo(widget);

            var canArr = me.getCanArr(me._curData);

            for (var i = 0; i < canArr.length; i ++) {
                var lay = me.nodes["panel_tb" + (i + 3)];
                var equip = G.class.szhuangbei(canArr[i]);
                equip.data.a = "equip";
                equip.setAnchorPoint(0.5, 0.5);
                equip.setPosition(lay.width / 2, lay.height / 2 - 4);
                lay.removeAllChildren();
                lay.addChild(equip);
            }
            if(!me.eid || G.frame.tiejiangpu.bViewUp.eid != me.eid) {
                me.nodes.panel_tb3.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }else {
                me.curTouch.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
            me.eid = G.frame.tiejiangpu.bViewUp.eid;
        },
        bindBtn:function () {
            var me = this;

            var btn_jia = me.nodes.btn_jia;
            btn_jia.click(function () {
                me.setBuyNum("+");
            });

            var btn_jian = me.nodes.btn_jian;
            btn_jian.click(function () {
                me.setBuyNum("-");
            });

            X.radio([me.nodes.panel_tb3, me.nodes.panel_tb4, me.nodes.panel_tb5], function (sender) {
                if(!sender.children[0]) return;
            }, {
                callback1: function (sender) {
                    sender.children[0].setGou(true);
                    me.setNum(sender.children[0]);
                    me.curTouch = sender;
                },
                callback2: function (sender) {
                    sender.children[0].setGou(false);
                }
            });

            if(!me.nodes.btn_hc.data) me.nodes.btn_hc.data = [];
            me.nodes.btn_hc.click(function () {
                if(me.maxNum == 0) {
                    G.tip_NB.show(L("ZBSLBZ"));
                    return;
                }
                if(me.canMaxBuyNum == 0) {
                    G.tip_NB.show(L("jinbi") + L("BUZU"));
                    return;
                }
                me.ajax("equip_change", [me._curData.id, me.curTouch.children[0].data.id, me.curNum], function (str, data) {
                    if(data.s == 1) {
                        X.audio.playEffect("sound/hechengzhuangbei.mp3");
                        me.action.playWithCallback("ronghe", false, function () {
                            G.frame.jiangli.data({
                                prize: data.d.prize,
                            }).show();
                            var btn = G.frame.tiejiangpu.bViewUp.btn;
                            btn.triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                            G.frame.tiejiangpu.bViewUp.setItem(btn, btn.data, btn.idx);
                            me.action.play("ronghe", false);
                        });
                    }else {
                        X.audio.playEffect("sound/dianji.mp3", false);
                    }
                })
            }, 2000);
        },
        onOpen: function () {
            var me = this;
        },
        onShow : function(){
            var me = this;
            
            me.isShow = this;
            me.bindBtn();
            X.setInputIn(me.nodes.textfield_sl, function () {
                var num = parseInt(me.nodes.textfield_sl.getString()) || 0;
                if(num < 1) {
                    me.curNum = 1;
                } else {
                    me.curNum = num;
                }
                me.setBtns();
                me.setBuyNum();
            });
            me.nodes.textfield_sl.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            G.class.ani.show({
                json: "ani_tiejiangpu_ronglian",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setTag(998877);
                    node.zIndex = -100;
                    me.action = action;
                    action.play("dengdai", true);
                }
            });
        },
        setNum: function(node) {
            var me = this;
            var need = me.need = node.conf.changeprize[0];

            for (var i = 1; i <= me.maxNum; i ++) {
                if(P.gud[need.t] >= i * need.n) {
                    me.curNum = me.canMaxBuyNum = i;
                }
            }
            me.setBtns();
            me.setBuyNum();
        },
        setBuyNum: function(str) {
            var me = this;

            if(!str) {
                me.nodes.textfield_sl.setString(me.curNum || 1);
            }else {
                if(str == "+") {
                    me.nodes.textfield_sl.setString(me.curNum += 1);
                }else {
                    me.nodes.textfield_sl.setString(me.curNum -= 1);
                }
                me.setBtns();
            }
            me.setMoney();
        },
        setMoney: function() {
            var me = this;

            me.nodes.text_jb.setString(X.fmtValue(me.curNum == 0 ? me.need.n : me.curNum * me.need.n));
        },
        setBtns: function () {
            var me = this;

            var btnAdd = me.nodes.btn_jia;
            var btnPlus = me.nodes.btn_jian;

            btnAdd.setTouchEnabled(false);
            btnAdd.setEnableState(false);
            btnPlus.setTouchEnabled(false);
            btnPlus.setEnableState(false);

            if (me.curNum > 1) {
                btnPlus.setTouchEnabled(true);
                btnPlus.setEnableState(true);
            }
            if (me.curNum < me.canMaxBuyNum) {
                btnAdd.setTouchEnabled(true);
                btnAdd.setEnableState(true);
            }
        },
        removePanel: function () {
            var me = this;

            me.nodes.panel_tb2.removeAllChildren();
            me.nodes.panel_tb3.removeAllChildren();
            me.nodes.panel_tb4.removeAllChildren();
            me.nodes.panel_tb5.removeAllChildren();
        }
    });

})();