/**
 * Created by  on 2019/3/29.
 */
(function () {
    //风暴战场-宝藏
    var ID = 'fbzc_bz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            var time = me.DATA.target.v;
            var hour = me.hour = parseInt(time / 3600);
            me.nodes.tip_title.setString(L("YSBZ"));
            me.nodes.txt_wzsj.setString(hour + L("XS"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.getData();
            me.initUi();
            me.bindBtn();
        },
        getData: function() {
            var me = this;
            me.DATA = G.frame.fengbaozhanchang.DATA;
            me.reclist = me.DATA.target.reclist || [];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView("fengbaozhanchang_baozang_list.json", function (list) {
                me.list = list.finds("list_nr");
                list.hide();
                me.ui.addChild(list);
                me.setContents();
                cc.enableScrollBar(me.nodes.scrollview);
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var arr = [];
            var data = JSON.parse(JSON.stringify(G.gc.fbzc.base.targetprize));

            for (var i = 0; i < data.length; i ++) {
                if(!G.frame.fengbaozhanchang.DATA.target.reclist) {
                    var obj = {};
                    obj.idx = i;
                    obj.hour = data[i][0];
                    obj.prize = data[i][1];
                    obj.state = me.getState(obj.hour, obj.idx);
                    arr.push(obj);
                    if(arr.length == 5) break;
                } else {
                    if(!X.inArray(G.frame.fengbaozhanchang.DATA.target.reclist, i)) {
                        var obj = {};
                        obj.idx = i;
                        obj.hour = data[i][0];
                        obj.prize = data[i][1];
                        obj.state = me.getState(obj.hour, obj.idx);
                        arr.push(obj);
                        if(arr.length == 5) break;
                    }
                }
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8,10);
                table.setData(arr);
                table.reloadDataWithScroll(true);
                table._table.tableView.setTouchEnabled(false);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(false);
            ui.nodes.ico_jlwp.setTouchEnabled(false);
            X.alignItems(ui.nodes.ico_jlwp, data.prize, "left", {
                touch: true
            });
            ui.finds("txt_xh_0").setString("(" + data.hour + L("XS") + ")");

            G.removeNewIco(ui.nodes.btn1_on);
            if(data.state == 3) {
                ui.nodes.btn1_on.setEnableState(false);
                ui.nodes.btn1_on.setTitleText(L("YLQ"));
                ui.nodes.btn1_on.setTitleColor(cc.color(G.gc.COLOR.n15));
            } else if(data.state == 2) {
                ui.nodes.btn1_on.setEnableState(false);
                ui.nodes.btn1_on.setTitleText(L("LQ"));
                ui.nodes.btn1_on.setTitleColor(cc.color(G.gc.COLOR.n15));
            } else {
                ui.nodes.btn1_on.setEnableState(true);
                ui.nodes.btn1_on.setTitleText(L("LQ"));
                ui.nodes.btn1_on.setTitleColor(cc.color(G.gc.COLOR.n13));
                G.setNewIcoImg(ui.nodes.btn1_on, .95);
            }

            ui.nodes.btn1_on.click(function () {

                me.ajax("storm_getprize", [data.idx], function (str, dd) {
                    if(dd.s == 1) {
                        if(dd.d.prize) {
                            G.frame.jiangli.data({
                                prize: dd.d.prize
                            }).show();
                        }
                        G.hongdian.getData("storm", 1, function () {
                            G.frame.fengbaozhanchang.checkRedPoint();
                        });
                        ui.nodes.btn1_on.setEnableState(false);
                        ui.nodes.btn1_on.setTitleText(L("YLQ"));
                        ui.nodes.btn1_on.setTitleColor(cc.color(G.gc.COLOR.n15));
                        G.removeNewIco(ui.nodes.btn1_on);
                        data.state = 3;
                        G.frame.fengbaozhanchang.getData(function () {
                            me.setContents();
                        });
                    }
                })
            });
        },
        getState: function (hour, idx) {
            var me = this;
            var state = 0;
            var curHour = parseInt(me.hour);
            if(curHour >= hour) {
                if(X.inArray(me.reclist, idx)) {
                    state = 3;
                } else {
                    state = 1;
                }
            } else {
                state = 2;
            }

            return state;
        }
    });
    G.frame[ID] = new fun('ui_tip9.json', ID);
})();