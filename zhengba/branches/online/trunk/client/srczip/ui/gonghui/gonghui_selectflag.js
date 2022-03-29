/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-选择旗帜
    var ID = 'gonghui_selectflag';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f6";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.nodes.panel_bt, L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function(){
                me.remove();
            });

            // me._view.nodes.btn_xz.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         var callback = me.data().callback;
            //         callback && callback(me.flagId);
            //
            //         me.remove();
            //     }
            // });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.flagId = me.data().flag;
            // new X.bView('ui_tip_xuanze.json',function(view){
            //     me._view = view;
            //
            //     me.ui.nodes.panel_nr.removeAllChildren();
            //     me.ui.nodes.panel_nr.addChild(view);
                me.bindBtn();
                me.setContents();
            // });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me.ui;

            var scrollview = panel.nodes.scrollview_;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var conf = G.class.gonghui.get().base.flags;
            var data = X.keysOfObject(conf);
            data.sort(function (a,b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_flag,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(data);
            table.reloadDataWithScroll(true);

        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            X.render({
                panel_flag: function (node) {
                    node.removeBackGroundImage();
                    node.setBackGroundImage(G.class.gonghui.getFlagImgById(data),1);
                },
                img_confirm: function (node) {
                    node.hide();

                    if (me.flagId == data) {
                        node.show();
                    }
                },
            },ui.nodes);

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (sender.data == me.flagId) {
                        return;
                    }

                    me.flagId = sender.data;

                    var callback = me.data().callback;
                    callback && callback(me.flagId);

                    G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                    me.remove();

                    // me.handleItems(sender);
                }
            });
        },
        // handleItems: function () {
        //     var me = this;
        //
        //     var children = me.table.getAllChildren();
        //     for (var i = 0; i < children.length; i++) {
        //         var child = children[i];
        //         if (child.data == me.flagId) {
        //             child.nodes.img_gou.show();
        //         } else {
        //             child.nodes.img_gou.hide();
        //         }
        //     }
        // }
    });

    G.frame[ID] = new fun('ui_top5.json', ID);
})();