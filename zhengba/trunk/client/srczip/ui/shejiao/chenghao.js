/**
 * Created by LYF on 2019/1/8.
 */

(function() {
    //称号
    G.class.chenghao = X.bView.extend({
        ctor: function() {
            var me = this;
            me._super('setting_chenghao.json');
        },
        bindBtn: function() {
            var me = this;
        },
        onOpen: function() {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview_ch);
        },
        onShow: function() {
            var me = this;
            me.getData(function () {
                me.setContents();
            });
        },
        getData: function(callback) {
            var me= this;
            G.ajax.send('chenghao_getlist',[], function(d){
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    me.DATA.list = me.DATA.list || {};
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.zaoxing.chenghao;
            var data = Object.keys(conf);

            data.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview_ch, me.nodes.list_ch, 1, function (ui, id) {
                    me.setItem(ui, id);
                }, null, null, 10, 10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, id) {
            var me = this;
            var conf = G.gc.zaoxing.chenghao[id];
            var time = me.DATA.list[id];
            var isShow = time != undefined && (time == 0 || time > G.time);

            X.autoInitUI(ui);
            X.render({
                panel_ch: function (node) {
                    node.setBackGroundImage("img/public/" + conf.img, 1);
                },
                txt_txkwz2: conf.intr,
                txt_yxq: function (node) {
                    node.setVisible(isShow);
                },
                txt_yj: function (node) {
                    node.setVisible(isShow);
                    if (isShow) {
                        var str;
                        if (time == 0) str = L("YJ");
                        else str = X.moment(time - G.time, {
                            d: "{1}天",
                            h: "{1}小时",
                            mm: "{1}分钟",
                        });
                        node.setString(str);
                    }
                },
                img_txgoudi: function (node) {
                    if (!isShow) return node.hide();
                    else node.show();
                    node.setTouchEnabled(true);
                    node.click(function (sender) {
                        var ch = P.gud.chenghao;
                        me.ajax("chenghao_wear", [id], function (str, data) {
                            if (data.s == 1) {
                                if (ch != id) G.tip_NB.show("佩戴" + L('SUCCESS'));
                                else G.tip_NB.show("已取消佩戴");
                                me.setContents();
                            }
                        });
                    });
                },
                img_txgou: function (node) {
                    node.setTouchEnabled(false);
                    node.setVisible(P.gud.chenghao == id);
                },
                txt_txkwz1: conf.buffintro || ""
            },ui.nodes);
        }

    });
})();