/**
 * Created by LYF on 2018/9/25.
 */
(function () {
    //月基金
    G.class.huodong_yjj = X.bView.extend({
        ctor: function (type) {
            var me = this;
            G.frame.xianshilibao.yjj = me;
            me._super("event_jijin128.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('monthfund_open',[me.conf.hdid],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            },true);
        },
        bindBTN: function() {
            var me = this;

            G.class.ani.show({
                json: "ani_jiangliyulan",
                addTo: me.nodes.btn_jlyl,
                x: me.nodes.btn_jlyl.width / 2,
                y: me.nodes.btn_jlyl.height / 2,
                cache: true,
                repeat: true,
                autoRemove: false
            });

            me.nodes.btn_01.click(function () {
                me.nodes.panel_xz1.show();
                me.nodes.panel_xz2.hide();
                me.conf = G.gc.monthfund[0];
                me.changeView();
            });
            me.nodes.btn_02.click(function () {
                me.nodes.panel_xz1.hide();
                me.nodes.panel_xz2.show();
                me.conf = G.gc.monthfund[1];
                me.changeView();
            });

            me.nodes.btn_jlyl.opacity = 0;
            me.nodes.btn_jlyl.click(function () {
                G.frame.yjj_jlyl.data({data: me.conf.data.arr, list: me.nodes.list.clone(), texiao: me.conf.data.texiao}).show();
            });

            me.nodes.pan1.finds("btn_sz").click(function () {
                if (!me.DATA.myinfo.zhizunka) {
                    G.frame.alert.data({
                        sizeType:3,
                        cancelCall:null,
                        okCall: function () {
                            G.frame.huodong.data({
                                type: 0,
                                stype: 17
                            }).show();
                        },
                        autoClose:true,
                        richText:L('HUODONG_CZJJ_ZHIZUNKA')
                    }).show();
                    return;
                }

                G.event.once('paysuccess', function() {
                    me.refreshPanel();
                    G.hongdian.getData("monthfund", 1, function () {
                        G.frame.huodong.checkRedPoint();
                        me.checkRedPoint();
                    });
                });
                G.event.emit('doSDKPay', {
                    pid:me.conf.data.chkkey,
                    logicProid: me.conf.data.chkkey,
                    money: me.conf.data.money,
                });
            }, 500);

            me.nodes.pan2.finds("btn_sz").click(function () {
                me.ajax('monthfund_use',[me.conf.hdid],function(s, d) {
                    if(d.s == 1) {
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        cc.mixin(me.DATA.myinfo,d.d.myinfo,true);
                        if (me.DATA.myinfo.isover) {
                            G.tip_NB.show(L('HUODONG_CZJJ_JLYLQ'));
                            me.nodes.pan2.finds('btn_sz').setTitleText(L('BTN_YLQ'));
                            me.nodes.pan2.finds('btn_sz').setTitleColor(cc.color("#6c6c6c"));
                            me.nodes.pan2.finds('btn_sz').setTouchEnabled(false);
                            me.nodes.pan2.finds('btn_sz').setBright(false);
                            G.removeNewIco(me.nodes.pan2.finds('btn_sz'));
                        }else {
                            me.setContents();
                        }
                        G.hongdian.getData("monthfund", 1, function () {
                            G.frame.huodong.checkRedPoint();
                            me.checkRedPoint();
                        });
                    } else if (d.s == -10) {
                        G.frame.huodong.remove();
                    }
                },true);
            })
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.checkRedPoint();
            if(G.DATA.hongdian.monthfund_170 == 0 && G.DATA.hongdian.monthfund_180 == 1){
                me.nodes.btn_02.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }else {
                me.nodes.btn_01.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
        },
        changeView:function(){
            var me = this;
            me.refreshPanel();
            me.setBanner();
            me.ui.finds("bg").loadTexture(me.conf.hdid == 170 ? "img/bg/bg_jijin128.png" : "img/bg/bg_jijin328.png", 0);
        },
        onShow: function () {
            var me = this;
            me.ui.finds("txt1").y += 10;
        },
        setContents: function () {
            var me = this;
            me.setTable();
        },
        setBanner: function () {
            var me = this;

            var prize = me.conf.data.showprize;
            X.newExtendLayout(me.nodes.neirong, {
                dataCount: prize.length,
                extend: true,
                delay: 10,
                cellCount: 4,
                nodeWidth:120,
                rowHeight:160,
                itemAtIndex: function (index) {
                    var p = prize[index];
                    var list = me.nodes.list.clone();

                    var widget = G.class.sitem(me.conf.data.arr[p].p[0]);
                    widget.setPosition(list.finds("ico").width / 2, list.finds("ico").height / 2);
                    list.finds("ico").addChild(widget);
                    G.frame.iteminfo.showItemInfo(widget);

                    var str = X.STR(L("LJJT"), p + 1);
                    var rh = new X.bRichText({
                        size: 18,
                        maxWidth: list.finds("wz").width,
                        lineHeight: 32,
                        color: "#b55222",
                        family: G.defaultFNT,
                    });
                    rh.text(str);
                    rh.setAnchorPoint(0.5, 0.5);
                    rh.setPosition(list.finds("wz").width / 2, list.finds("wz").height / 2);
                    list.finds("wz").addChild(rh);
                    list.show();
                    return list;
                }
            })
        },
        setTable: function () {
            var me = this;

            if(me.DATA.myinfo.isbuy) {
                me.nodes.pan1.hide();
                me.nodes.pan2.show();

                X.render({
                    ico: function(node){
                        var p = me.conf.data.arr[me.DATA.myinfo.val - 1].p;
                        var widget = G.class.sitem(p[0]);
                        widget.setPosition(node.width / 2, node.height / 2);
                        node.removeAllChildren();
                        node.addChild(widget);
                        G.frame.iteminfo.showItemInfo(widget);
                    },
                    wz1: X.STR(L('HUODONG_YJJ_LJ'), me.DATA.myinfo.val),
                    wz2: X.STR(L('HUODONG_YJJ_LQSJ'), me.DATA.myinfo.usetime)
                }, me.nodes);

                if (X.inArray(me.DATA.myinfo.gotarr, me.DATA.myinfo.val)) {
                    me.nodes.pan2.finds('btn_sz').setTitleText(L('BTN_YLQ'));
                    me.nodes.pan2.finds('btn_sz').setTitleColor(cc.color("#6c6c6c"));
                    me.nodes.pan2.finds('btn_sz').setTouchEnabled(false);
                    me.nodes.pan2.finds('btn_sz').setBright(false);
                    G.removeNewIco(me.nodes.pan2.finds('btn_sz'));
                } else {
                    me.nodes.pan2.finds('btn_sz').setTitleText(L('BTN_LQ'));
                    me.nodes.pan2.finds('btn_sz').setTouchEnabled(true);
                    me.nodes.pan2.finds('btn_sz').setTitleColor(cc.color("#2f5719"));
                    me.nodes.pan2.finds('btn_sz').setBright(true);
                    G.setNewIcoImg(me.nodes.pan2.finds('btn_sz'), .9);
                }
            }else {
                me.nodes.pan2.hide();
                me.nodes.pan1.show();
                me.conf.htype == 170 ? me.nodes.pan1.finds("btn_sz").setTitleText("￥128") : me.nodes.pan1.finds("btn_sz").setTitleText("￥328");
                me.conf.htype == 170 ? me.nodes.txt_info1.setBackGroundImage("img/yuejijin/bg_128.png", 1) : me.nodes.txt_info1.setBackGroundImage("img/yuejijin/bg_328.png", 1)
            }
        },
        checkRedPoint:function () {
            var me = this;
            if(G.DATA.hongdian.monthfund_170){
                G.setNewIcoImg(me.nodes.btn_01);
            }else {
                G.removeNewIco(me.nodes.btn_01);
            }
            if(G.DATA.hongdian.monthfund_180){
                G.setNewIcoImg(me.nodes.btn_02);
            }else {
                G.removeNewIco(me.nodes.btn_02);
            }
        }

    })
})();