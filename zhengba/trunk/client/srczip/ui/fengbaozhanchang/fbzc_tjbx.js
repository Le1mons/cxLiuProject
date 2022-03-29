/**
 * Created by LYF on 2019/4/1.
 */
(function () {
    //风暴战场-天降宝箱
    var ID = 'fbzc_tjbx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("TJBXYL"));
        },
        bindBtn: function () {
            var me = this;

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

            new X.bView("fengbaozhanchang_baozang_list1.json", function (list) {
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
            var data = [];
            var conf = G.gc.fbzc.base.box;

            for (var i in conf) {
                var obj = {};
                obj.data = conf[i];
                obj.idx = parseInt(i);
                data.push(obj);
            }

            var table = new X.TableView(me.nodes.scrollview, me.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 8, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var img = {
                1: 4,
                2: 3,
                3: 1
            };
            ui.show();
            ui.nodes.bx_ico.setBackGroundImage("img/fengbaozhanchang/fengbao_box" + data.data.imgType + ".png", 1);
            ui.nodes.ico_jlwp.setTouchEnabled(false);
            ui.nodes.ico_1.loadTexture('img/public/ico/ico_bg' + img[data.data.imgType] + '.png', 1);
            X.alignItems(ui.nodes.ico_jlwp, data.data.prize, "left", {
                touch: true,
                scale: .8
            });
        }
    });
    G.frame[ID] = new fun('fengbaozhanchang_tip3.json', ID);
})();