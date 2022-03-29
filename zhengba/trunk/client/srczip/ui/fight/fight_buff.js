/**
 * Created by LYF on 2019/6/25.
 */
(function () {
    //BUFF说明
    var ID = 'fight_buff';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.txt_djgb.click(function () {

                me.remove();
            });

            me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var data = me.getData();
            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 2, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        onHide: function () {
            var me = this;
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);

            ui.setTouchEnabled(false);
            ui.children[0].setTouchEnabled(false);
            X.render({
                txt_name: function (node) {
                    node.setString(data.showname);
                    node.setTextColor(cc.color("#FFE8C0"));
                },
                panel_1: function (node) {
                    node.setTouchEnabled(false);
                    node.setBackGroundImage('img/buff/'+ data.icon, 1);
                }
            }, ui.nodes);
        },
        getData: function () {
            var arr = [];
            var conf = G.gc.buff;

            for (var i in conf) {
                if (conf[i].isshow == '1') arr.push(conf[i]);
            }

            arr.sort(function (a, b) {
                return a.rank * 1 < b.rank * 1 ? -1 : 1
            });

            return arr;
        }
    });
    G.frame[ID] = new fun('zhandou_top_buff.json', ID);
})();