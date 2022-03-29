/**
 * Created by  on 2019//.
 */
(function () {
    //我的抽奖
    var ID = 'double_cjInfo';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.nodes.text_1.setString(L("ZJMD"));
            me.nodes.panel_bg.setTouchEnabled(true);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_wz, 2, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(me.data());
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.data());
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var dd = data;
            var rh = X.setRichText({
                str: '<font color=' + (P.gud.uid == dd.uid ? "#2bb22b" : "#804326") + '>' + dd.name +
                    '</font>(' + dd.svrname + ')',
                parent: ui,
                color: P.gud.uid == dd.uid ? "#2bb22b" : "#ab9263"
            });
            rh.setPosition(0,
                ui.height / 2 - rh.trueHeight() / 2);
        }
    });
    G.frame[ID] = new fun('event_double11_xyjc_tip2.json', ID);
})();