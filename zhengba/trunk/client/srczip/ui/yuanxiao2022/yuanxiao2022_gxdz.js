/**
 * Created by
 */

(function () {
    //个性定制
    var ID = 'yuanxiao2022_gxdz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var _list = G.gc.yuanxiao2022.libao;
            var last = [];
            for (var i in _list){
                _list[i].lbid = i;
                last.push(_list[i]);
            }
            // var lastdata = me.getData(last);
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.panel_list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(last);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            var buyNum = G.DATA.yuanxiao2022.myinfo.libao[data.lbid]||0;
            var select = G.DATA.yuanxiao2022.myinfo.choose[data.lbid] || {};

            function f(idx) {
                G.frame.zxlb_select.data({
                    choose: data.choose,
                    select: select,
                    idx: idx,
                    callback: function (select) {
                        me.ajax("yuanxiao3_choose", [data.lbid, select], function (str, dd) {
                            if (dd.s == 1) {
                                G.DATA.yuanxiao2022.myinfo = dd.d.myinfo;
                                me.setContents();
                            }
                        });
                    }
                }).show();
            }
            X.autoInitUI(ui);
            X.render({
                wz_sm: function (node) {
                    node.setString(parseInt(data.price / 100) + L("YUAN") + L("ZXLB"));
                    X.enableOutline(node,"#790000");
                },
                hd_jf: function (node) {
                    node.setString(X.STR(L("XGXC"), data.num) + "(" + buyNum + "/" + data.num + ")");
                },
                btn_txt1:function(node){
                    node.setString(parseInt(data.price / 100) + L("YUAN"));
                    node.setTextColor(cc.color(buyNum < data.num ? G.gc.COLOR.n13:G.gc.COLOR.n15));
                } ,
                btn: function (node) {
                    node.setEnableState(buyNum < data.num);
                    node.data = data;
                    node.click(function (sender,type) {
                        if (Object.keys(select).length < Object.keys(data.choose).length) return f(0);
                        if (sender.data.price == 0) {
                            me.ajax("yuanxiao3_libao", [ssender.data.lbid], function (str, dd) {
                                if (dd.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: dd.d.prize
                                    }).show();
                                    G.DATA.yuanxiao2022.myinfo = dd.d.myinfo;
                                   me.setContents();
                                    G.frame.yuanxiao2022.showIteminfo();
                                }
                            });
                        } else {
                            var prize = [];
                            for (var idx in select) {
                                prize.push(data.choose[idx][select[idx]]);
                            }
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: [].concat(sender.data.prize, prize)
                                }).show();
                                G.DAO.yuanxiao2022.getServerData(function () {
                                    me.setContents();
                                    G.frame.yuanxiao2022.showIteminfo();
                                })
                            });
                            G.event.emit('doSDKPay', {
                                pid:sender.data.proid,
                                logicProid: sender.data.proid,
                                money: sender.data.price,
                            });
                        }
                    });
                },
                ico_item1: function (node) {
                    node.removeAllChildren();
                    var item = G.class.sitem(data.prize[0]);
                    item.setPosition(node.width / 2, node.height / 2);
                    item.setScale(0.68);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                ico_item1_1:function (node) {
                    node.removeAllChildren();
                    if (!data.prize[1])return;
                    var item = G.class.sitem(data.prize[1]);
                    item.setPosition(node.width / 2, node.height / 2);
                    item.setScale(0.68);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                }
            }, ui.nodes);
            for (var idx = 0; idx < 3; idx ++) {
                (function (parent, idx) {
                    parent.removeAllChildren();
                    if (data.choose[idx] != undefined) {
                        var list = me.nodes.panel_list.finds("ico_list$").clone();
                        X.autoInitUI(list);
                        list.nodes.brn_gh = list.finds("brn_gh");
                        X.render({
                            ico: function (node) {
                                node.removeBackGroundImage();
                                if (select[idx] != undefined) {
                                    var item = G.class.sitem(data.choose[idx][select[idx]]);
                                    item.setPosition(node.width / 2, node.height / 2);
                                    G.frame.iteminfo.showItemInfo(item);
                                    node.addChild(item);
                                    item.setSwallowTouches(true);
                                }else {
                                    node.setBackGroundImage('img/public/ico/ico_bg0.png', 1)
                                }
                                node.click(function () {
                                    f(idx);
                                });
                            },
                            jia: function (node) {
                                node.setVisible(select[idx] == undefined);
                                node.setTouchEnabled(true);
                                node.click(function () {
                                    f(idx);
                                });
                            },
                            brn_gh: function (node) {
                                node.setVisible(select[idx] != undefined);
                                node.ifnum = buyNum < data.num;//是否还有次数
                                node.click(function (sender) {
                                    if(!sender.ifnum) return G.tip_NB.show(L('CSBZ'));
                                    f(idx);
                                });
                            }
                        }, list.nodes);
                        list.show();
                        list.setPosition(parent.width / 2, parent.height / 2);
                        parent.addChild(list);
                    }
                })(ui.nodes["ico_item" + (idx + 2)], idx);
            }
        },
    });
    G.frame[ID] = new fun('yuanxiao_tk3.json', ID);
})();