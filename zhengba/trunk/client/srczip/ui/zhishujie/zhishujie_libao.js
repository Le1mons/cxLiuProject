/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_libao';
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
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;

            me.setTable();
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.zhishujie.libao;
            var data = [];
            cc.each(conf, function (obj, id) {
                var _obj = JSON.parse(JSON.stringify(obj));
                _obj.id = id;
                _obj.buyNum = G.frame.zhishujie_main.DATA.myinfo.libao[_obj.proid] || 0;
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
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
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
                    node.setTitleText(data.money / 100 + L("YUAN"));
                    node.setTitleColor(cc.color(data.buyMax ? '#6c6c6c' : '#2f5719'));
                    node.setEnableState(!data.buyMax);
                    node.click(function () {
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            G.frame.zhishujie_main.getData(function () {
                                me.setTable();
                            });
                        });
                        G.event.emit('doSDKPay', {
                            pid:data.proid,
                            logicProid: data.proid,
                            money: data.money,
                        });
                    }, 5000);
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('zhishujie_zslb.json', ID);
})();