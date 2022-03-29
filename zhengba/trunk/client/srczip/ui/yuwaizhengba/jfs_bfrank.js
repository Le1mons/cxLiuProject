/**
 * Created by LYF on 2019/7/8.
 */
(function () {
    //积分赛-本服排行
    var ID = 'jfs_bfrank';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("BFPH"));
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
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.type = 26;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            new X.bView("kfzb_phb.json", function (view) {
                me.nodes.panel_nr.addChild(view);
                me.view = view;

                me.setMyRank();
                me.setRankList();
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('rank_open', [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setMyRank: function () {
            var me = this;

            me.view.finds("txt_level_0").setString(me.DATA.myval || 0);

            if(me.DATA.myrank > 0) {
                me.view.nodes.fnt_player.setString(me.DATA.myrank);
                me.view.finds("wsb_player").hide();
            }else {
                me.view.finds("wsb_player").show();
                me.view.nodes.fnt_player.setString("");
            }
        },
        setRankList: function () {
            var me = this;

            var scrollView = me.view.nodes.scrollview;
            cc.enableScrollBar(scrollView);
            cc.enableScrollBar(me.view.nodes.listview);

            var data = me.DATA.ranklist;

            if(data.length < 1) {
                me.view.nodes.img_zwnr.show();
                return;
            } else me.view.nodes.img_zwnr.hide();

            var table = me.table = new X.TableView(scrollView, me.view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 8, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {

            X.autoInitUI(ui);

            X.render({
                sz_phb: data.rank,
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var head = G.class.shead(data.headdata);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.addChild(head);
                    head.setTouchEnabled(true);
                    head.setSwallowTouches(false);
                    head.icon.setTouchEnabled(false);
                    head.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.wanjiaxinxi.data({
                                pvType: 'zypkjjc',
                                uid: sender.data.uid
                            }).checkShow();
                        }
                    });
                },
                txt_name: data.headdata.name,
                txt_title: L("JF"),
                txt_number: data.val,
                text_zdl2: function (node) {
                    node.setString(data.zhanli || data.headdata.zhanli || "后端没传");
                    node.show();
                },
            }, ui.nodes);

            ui.finds("img_zdl").show();
        }
    });
    G.frame[ID] = new fun('ui_tip4.json', ID);
})();