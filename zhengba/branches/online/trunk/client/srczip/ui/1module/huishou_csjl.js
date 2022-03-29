/**
 * Created by YanJun on 12/22/15.
 */
(function () {
    //重生奖励
    var ID = 'huishou_csjl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        onOpen: function () {
            var me = this;
            new X.bView('ui_tip_tishi3.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                me.initUI();
                me.getData(me.setData);
            })
        },
        initUI: function () {
            var me = this;
            me.ui.render({
                top_title: L('UI_TITLE_CHONGZAO_JIANGLI')
            });
            me.ui.nodes.btn_gb.click(function () {
                me.remove();
            });
            qxfun = function () {
                me.remove();
            };
            qdfun = function () {
                var callback = me.data().callback;
                callback && callback();
                me.remove();
            };
            X.addBtn(me.view.nodes.panel_btn, {
                count: 2,
                texture: ['btn_hong.png', 'btn_lan.png'],
                title: [L('BTN_CANCEL'), L('BTN_OK')],
                callback: [qxfun, qdfun]
            });
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send(me.data().api, [me.data().data], function (data) {
                data = X.toJSON(data);
                if (data.s == 1) {
                    me.DATA = data.d.prize || data.d;
                    callback && callback.call(me);
                }
            });
        },
        setData: function () {
            var me = this;
            var d = me.DATA;
            var listView = me.view.nodes.listview;
            listView.removeAllChildren();
            // var table = me.table = new X.TableView(scrollview, me.list, 4, function (ui, data) {
            //     me.setItem(ui, data);
            // }, null, null, 35);
            for (var i in d) {
                var p = G.class.sitem(d[i], true);
                p.setScale(0.8);
                // p.setPosition(cc.p(ui.width / 2, ui.height / 2));
                listView.pushBackCustomItem(p);
            }
            // table.setData(d);
            // table.reloadDataWithScroll(true);
            //
            me.setRichtext();
        },
        // setItem: function (ui, data) {
        //     var me = this;
        //
        //     ui.removeAllChildren();
        //     var p = G.class.sitem(data, true);
        //     p.setPosition(cc.p(ui.width / 2, ui.height / 2));
        //     ui.addChild(p);
        // },
        setRichtext: function () {
            var me = this;
            var str = me.data().richText;
            X.render({
                panel_title: !str ? L('CS_' + me.data().api) : str
            }, me.view.nodes);
        }
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();