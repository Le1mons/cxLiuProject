/**
 * Created by
 */
(function () {
    //
    var ID = 'wyhd_rw';
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
            me.nodes.btn_up.click(function () {

            });
            me.nodes.img_banner.setBackGroundImage('img/wuyipaidui/img_banner03.png', 1);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.panel_refresh.show();
            //me.nodes.btn_up.show();
        },
        onShow: function () {
            var me = this;

            me.setTable();
            X.timeout(me.nodes.txt_time, X.getTodayZeroTime() + 24 * 3600, function () {
                G.frame.wyhd.getData(function () {
                    me.onShow();
                });
            });
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.wyhd.task;
            var data = [];
            cc.each(conf, function (obj, id) {
                var _obj = JSON.parse(JSON.stringify(obj));
                _obj.id = id;
                _obj.nval = G.frame.wyhd.DATA.myinfo.task.data[_obj.id] || 0;
                _obj.rec =  G.frame.wyhd.DATA.myinfo.task.rec;
                data.push(_obj);
            });
            data.sort(function (a, b) {
                var isLqA = X.inArray(a.rec, a.id);
                var isLqB = X.inArray(b.rec, b.id);
                var isCanA = !isLqA && a.nval >= a.pval;
                var isCanB = !isLqB && b.nval >= b.pval;
                if (isCanA != isCanB) {
                    return isCanA > isCanB ? -1 : 1;
                }else if (isLqA != isLqB) {
                    return isLqA < isLqB ? -1 : 1;
                } else {
                    return Number(a.id) < Number(b.id);
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao3, 1, function (ui, data) {
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
                txt_jdt: function (node) {
                    node.setString(data.nval + '/' + data.pval);
                    X.enableOutline(node, '#584115', 2);
                },
                img_jdt: data.nval / data.pval * 100,
                txt_name: data.desc,
                img_item: function (node) {
                    X.alignItems(node, data.prize, 'left', {
                        touch: true
                    });
                },
                btn_go: function (node) {
                    node.loadTextureNormal('img/public/btn/btn1_on.png', 1);
                    node.setVisible(!X.inArray(data.rec, data.id));
                    node.setEnableState(data.nval >= data.pval);
                    node.setTitleText(L("LQ"));
                    node.setTitleColor(cc.color(data.nval >= data.pval ? '#2f5719' : '#6c6c6c'));
                    node.click(function () {
                        me.ajax('labour_receive', [data.id], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.prize
                                }).show();
                                G.frame.wyhd.DATA.myinfo.task.rec.push(data.id);
                                me.setTable();
                                G.hongdian.getData('labour', 1, function () {
                                    G.frame.wyhd.checkRedPoint();
                                });
                            }
                        })
                    });
                },
                img_received: function (node) {
                    node.setVisible(X.inArray(data.rec, data.id));
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('wuyipaidui_tk1.json', ID);
})();