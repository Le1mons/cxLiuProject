/**
 * Created by wfq on 2018/6/4.
 */
(function () {
    //探险-通关奖励
    var ID = 'yuwaizhengba_jiangli';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action: true});
        },
        getData: function (callback) {
            var me = this;
            me.ajax('crosszb_prizelist', [], function (s,data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            }, true);
        },
        initUi: function () {
            var me = this;

            me.ui.nodes.tip_title.setString(L("SCJL"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
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

            // G.frame.tanxian.DATA.passprizeidx = [0,1];
            // P.gud.maxmapid = 60;

            new X.bView('tongguanjiangli.json', function (view) {
                me._view = view;
                me._view.nodes.panel_tgjl.show();
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                X.viewCache.getView('tongguanjiangli_list.json', function (node) {
                    me.list = node.finds('list_nr');
                    me.getData(function () {
                        me.setContents();
                    });
                });
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var conf = G.class.kuafuzhan.getDatePrize();

            var scrollview = panel.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            me.list.hide();

            var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data ,pos) {
                me.setItem(ui, data ,pos[0] + pos[1]);
            }, null, null, 8, 10);
            table.setData(conf);
            table.reloadDataWithScroll(true);
            // scrollview.getChildren()[0].getChildren()[0].setPositionX(7);
        },
        setItem:function (ui,data , pos) {
            if(!data){
                ui.hide();
                return;
            }
            data[2] = pos;
            var me = this;
            X.autoInitUI(ui);
            var layWp = ui.nodes.ico_jlwp;
            var btnLq = ui.nodes.btn1_on;
            var ylq = ui.nodes.img_ylq;

            btnLq.hide();
            ylq.hide();
            X.render({
                wz_title : X.STR(L('KFZ_JF_SC_tip'), data[0],  me.DATA.winnum + '/' + data[0] )
            },ui.nodes);
            layWp.removeAllChildren();
            X.alignItems(layWp,data[1],'left',{
                touch:true,
                interval:15
            });
            if (X.inArray(me.DATA.reclist, data[2])) {
                ylq.show();
            } else {
                if (me.DATA.winnum >= data[0]) {
                    btnLq.setTouchEnabled(true);
                    btnLq.setBright(true);
                    btnLq.setTitleColor(cc.color(G.gc.COLOR.n13));
                } else {
                    btnLq.setTouchEnabled(false);
                    btnLq.setBright(false);
                    btnLq.setTitleColor(cc.color(G.gc.COLOR.n15));
                }
                btnLq.show();
            }
            btnLq.idx = data[2];
            btnLq.data = data[1];
            btnLq.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.ajax('crosszb_recprize', [sender.idx], function (s,data) {
                        if (data.s == 1) {

                            G.event.emit('sdkevent',{
                                event:'waiyu_lingjiang',
                                data:{
                                    waiyu_boxNum:sender.idx,
                                    get:sender.data,
                                }
                            });

                            for (var k in data.d) {
                                me.DATA[k] = data.d[k]
                            }
                            G.hongdian.getData("crosszbjifen", 1, function () {
                                G.frame.yuwaizhengba.checkRedPoint();
                                G.frame.yuwaizhengba_jifen.checkRedPoint();
                            });
                            G.frame.jiangli.data({
                                prize: [].concat(sender.data)
                            }).show();
                            G.event.emit('freshKFZ');
                            me.table.reloadDataWithScroll(false);
                            // if (me.DATA.scjl == 0) {
                            //     G.event.emit('hdchange',{type: 0, tag: 'kfzb_scjl'});
                            //     G.event.emit('hdchange',{type: 0, tag: 'kfzb_jfs'});
                            //     G.event.emit('hdchange', {type: 0, tag: 'zhengzhan_kfzb'});
                            //     // G.frame.zhengzhan.isShow && G.frame.zhengzhan.upData({5:me.DATA.scjl});
                            // }
                        }
                    }, true);
                }
            });

            ui.show();
        }
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();