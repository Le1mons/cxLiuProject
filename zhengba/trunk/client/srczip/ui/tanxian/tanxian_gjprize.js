/**
 * Created by wfq on 2018/5/29.
 */
(function () {
    //探险-挂机奖励信息
    var ID = 'tanxian_gjprize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
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

            me.DATA = me.data();
            new X.bView('tanxian_tip_jl.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me._view.nodes.btn_qd.click(function (sender, type) {
                    me.remove();
                });
                me.setContents();
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var maxGqid = G.class.tanxian.getCurMaxGqid();
            var conf = G.class.tanxian.getById(P.gud.maxmapid > maxGqid ? maxGqid : P.gud.maxmapid);

            var obj = {
                txt_yxjy:'jinbi',
                txt_jb:'useexp',
                txt_wjjy:'exp',
                txt_xsjf:'jifen'
            };
            panel.nodes.btn_gj.hide();
            for (var key in obj) {
                var attr = obj[key];
                panel.nodes[key].setString(conf.gjprize[attr] * 12 + '/m');
            }

            if (me.DATA == P.gud.mapid) {
                panel.nodes.btn_gj.hide();
                panel.nodes.btn_qd.hide();
                panel.nodes.gj_jl.show();
            } else {
                panel.nodes.btn_gj.show();
                panel.nodes.btn_qd.hide();
                panel.nodes.gj_jl.hide();
            }

            panel.nodes.btn_gj.click(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    G.ajax.send("tanxian_changegjmap", [me.DATA], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.frame.tanxian.refreshData();
                            G.frame.tanxian.updateGuanqias();
                            me.remove();
                        }
                    })
                }
            });
            // panel.finds('Button_1').touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         G.frame.tanxian.changeGuanqia(me.DATA);
            //         me.remove();
            //     }
            // });

            me.setTable();
        },
        setTable: function () {
            var me = this;

            var panel = me._view;
            var conf = G.class.tanxian.getById(me.DATA);
            var prize = [];

            for (var i = 0; i < conf.randgroup.length; i++) {
                var rand = conf.randgroup[i];
                prize = prize.concat(G.class.diaoluo.getById(rand));
            }
            if(G.frame.tanxian.DATA.isopen == 1){
                var jiangjuan = {a: "item", t: "2016", n: 0};
                var n = prize.length;
                prize[n] = jiangjuan;
            }
            var scrollview = panel.nodes.scrollview_hdjl;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            panel.nodes.list_hdjl.hide();

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_hdjl,3, function (ui, data) {
                setItem(ui, data);
            },null,null,7, 2);
            table.setData(prize);
            table.reloadDataWithScroll(true);

            function setItem(ui, data) {
                ui.removeAllChildren();

                var wid = G.class.sitem(data, null, null, true);
                wid.setPosition(cc.p(ui.width / 2,ui.height / 2));
                ui.addChild(wid);

                ui.setTouchEnabled(true);
                ui.setSwallowTouches(false);

                G.frame.iteminfo.showItemInfo(wid);
            }
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();