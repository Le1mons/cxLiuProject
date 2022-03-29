/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //部落战旗-升阶
    var ID = 'buluozhanqi_buystep';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);

            me.nodes.btn_djs.setString(X.STR(L("XJ"), me.DATA.section[1]));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_confirm.setVisible(G.frame.buluozhanqi.DATA.jinjie ? false : true);

            me.nodes.btn_confirm.click(function () {

                if(G.frame.buluozhanqi.type == 1) {
                    var view = G.frame.buluozhanqi.view;

                    if(!view.nodes.panel_qieh2.visible) {
                        view.nodes.btn_djjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    }
                } else {
                    G.frame.buluozhanqi.topMenu.changeMenu(1);
                }
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();

            me.nodes.panel_hz.hide();
            G.class.ani.show({
                json: "ani_zhanqi_huizhang",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setScale(2);
                    action.playWithCallback("in", false, function () {
                        action.play("changtai", true);
                    });
                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var prize = G.DATA.blzq_prize;
            var arr = [];
            var obj = {};
            var data = [];

            for (var i = me.DATA.section[0]; i <= me.DATA.section[1]; i ++) {
                for (var j in prize[i][me.DATA.key]) {
                    arr.push(prize[i][me.DATA.key][j]);
                }
            }

            G.frame.buluozhanqi_buylv.mergePrize(arr, obj);
            G.frame.buluozhanqi_buylv.dismantlePrize(obj, data);

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        onHide: function () {
            var me = this;
        },
        setItem: function (ui, data) {
            ui.setTouchEnabled(false);
            ui.removeAllChildren();

            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(item);
            G.frame.iteminfo.showItemInfo(item);
        }
    });
    G.frame[ID] = new fun('buluozhanqi_zqsj1.json', ID);
})();