/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd_lb';
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
            me.nodes.img_banner.setBackGroundImage('img/wuyipaidui/img_banner01.png', 1);
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.wyhd.libao;
            var data = [];
            cc.each(conf, function (obj, id) {
                var _obj = JSON.parse(JSON.stringify(obj));
                _obj.id = id;
                _obj.buyNum = G.frame.wyhd.DATA.myinfo.libao[_obj.id] || 0;
                _obj.buyMax = _obj.buyNum >= _obj.buynum;
                data.push(_obj);
            });
            data.sort(function (a, b) {
                if (a.buyMax != b.buyMax) {
                    return a.buyMax < b.buyMax ? -1 : 1;
                } else {
                    return a.money < b.money ? -1 : 1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao1, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                libao_mz: function (node) {
                    node.setString(data.name || '');
                    node.setTextColor(cc.color('#ffe8a5'));
                    X.enableOutline(node, '#a01e00', 2);
                },
                wz_xg: function (node) {
                    node.setTextColor(cc.color('#804326'));
                    node.setString(X.STR(L("DOUBLE12"), data.buynum - data.buyNum));
                },
                ico_nr: function (node) {
                    node.setTouchEnabled(false);
                    X.alignItems(node, data.prize, 'left', {
                        touch: true,
                        scale: .8
                    });
                },
                ico_list: function (node) {
                    node.setTouchEnabled(false);
                },
                btn_gm: function (node) {
                    node.setEnableState(!data.buyMax);
                    if (data.money == 0) {
                        node.click(function () {
                            me.ajax('labour_libao', [data.id], function (str, _data) {
                                if (_data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.prize
                                    }).show();
                                    G.frame.wyhd.getData(function () {
                                        me.setTable();
                                    });
                                    G.hongdian.getData('labour', 1, function () {
                                        G.frame.wyhd.checkRedPoint();
                                    });
                                }
                            });
                        });
                    } else {
                        node.click(function () {
                            G.event.once('paysuccess', function(arg) {
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: data.prize
                                }).show();
                                G.frame.wyhd.getData(function () {
                                    me.setTable();
                                });
                                G.hongdian.getData('labour', 1, function () {
                                    G.frame.wyhd.checkRedPoint();
                                });
                            });
                            G.event.emit('doSDKPay', {
                                pid:data.proid,
                                logicProid: data.proid,
                                money: data.money,
                            });
                        }, 5000);
                    }

                },
                zs_wz: function (node) {
                    var need = data.need[0] || {};
                    var needConf = G.class.getItem(need.t, need.a);
                    node.setString('');
                    node.removeAllChildren();

                    if (data.money == 0) {
                        var ico = new ccui.ImageView(G.class.getItemIco(need.t), 1);
                        ico.scale = .8;
                        X.setRichText({
                            str: '<font node=1></font>' + X.fmtValue(need.n),
                            parent: node,
                            node: ico,
                            color: data.buyMax ? '#6c6c6c' : '#7b531a',
                            size: node.fontSize,
                            maxWidth: node.width + 20
                        });
                    } else {
                        node.setString(data.money == 0 ? X.fmtValue(need.n) + needConf.name : data.money / 100 + L("YUAN"));
                        node.setTextColor(cc.color(data.buyMax ? '#6c6c6c' : '#7b531a'));
                    }
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wuyipaidui_tk1.json', ID);
})();