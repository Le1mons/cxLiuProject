/**
 * Created by  on 2019/3/6.
 */
(function () {
    //神殿地牢-排行榜
    var ID = 'shendian_sddl_phb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_dlal.children[0].setString(L("BAOFENGZHILU"));
            me.nodes.btn_dlbl.children[0].setString(L("ZHIYANZHILU"));
            me.nodes.btn_dlcl.children[0].setString(L("BINGFENGZHILU"));

            X.radio([me.nodes.btn_dlal, me.nodes.btn_dlbl, me.nodes.btn_dlcl], function (sender) {

                var name = sender.getName();
                var name2type = {
                    btn_dlal$: 23,
                    btn_dlbl$: 24,
                    btn_dlcl$: 25
                };

                me.getData(name2type[name], function () {
                    me.setContents();
                });
            })
        },
        getData: function(type, callback) {
            var me = this;

            me.ajax("rank_open", [type], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
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

            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_dlal.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;

            if(data.ranklist.length < 1) {
                me.nodes.img_zwnr.show();
            } else {
                me.nodes.img_zwnr.hide();
            }

            if(data.myrank < 0) {
                me.ui.finds("wsb_player").show();
                me.nodes.fnt_player.hide();
            } else {
                me.ui.finds("wsb_player").hide();
                me.nodes.fnt_player.show();
                me.nodes.fnt_player.setString(data.myrank);
            }

            me.nodes.txt_jf.setString(data.myval);
            me.ui.finds("txt_level").setString(L("WDGS"));

            me.nodes.scrollview.removeAllChildren();

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.sz_phb.setString(data.rank);
            ui.nodes.txt_cs.setString(data.val);
            ui.nodes.name.setString(data.headdata.name);

            ui.nodes.img_rank.removeAllChildren();
            var head = G.class.shead(data.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.nodes.img_rank.width / 2, ui.nodes.img_rank.height / 2);
            ui.nodes.img_rank.addChild(head);
        }
    });
    G.frame[ID] = new fun('shendianzhilu_sddl_phb.json', ID);
})();