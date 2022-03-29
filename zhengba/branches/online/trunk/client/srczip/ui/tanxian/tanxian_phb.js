/**
 * Created by wfq on 2018/6/4.
 */
(function () {
    //探险-排行榜
    var ID = 'tanxian_phb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_zdjl.setString(L("PHB"));
            // me.ui.finds("text_zdjl").setString(L("PHB"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.curType = 1;
            new X.bView("ui_paihangbang.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.view.nodes.panel_rank.height -= 103;
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                X.viewCache.getView('ui_list2.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.DATA = me.data();
                    me.setContents();
                });
            });

        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('rank_open', [me.curType], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            var scrollview = me.view.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            var listview = me.view.nodes.listview;
            cc.enableScrollBar(listview);
            scrollview.removeAllChildren();



            var data = me.DATA;
            if (data.ranklist.length < 1) {
                cc.isNode(me.ui.finds('zwnr')) && me.ui.finds('zwnr').show();
                return;
            } else {
                cc.isNode(me.ui.finds('zwnr')) && me.ui.finds('zwnr').hide();
            }
            me.setMyRank();
            for (var i = 0; i < data.ranklist.length; i++) {
                data.ranklist[i].rank = i + 1;
            }
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8, 10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = -1;
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txtGuanqia = ui.nodes.txt_number;
            ui.nodes.txt_title.setString(L('GUANQIA'));

            layPh.hide();
            txtPh.setString('');
            layIco.removeAllChildren();
            if (data.rank < 0) {
                txtPh.setString(0);
            } else if (data.rank < 4) {
                layPh.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                layPh.show();
            } else {
                txtPh.setString(data.rank);
                txtPh.show();
            }

            var wid = G.class.shead(data.headdata);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);
            wid.data = data.headdata;
            wid.setTouchEnabled(true);
            wid.icon.setTouchEnabled(false);
            wid.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.uid
                    }).checkShow();
                }
            });

            txtName.setString(data.headdata.name);
            txtGuanqia.setString(data.maxmapid > 560 ? 560 : data.maxmapid);

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);

        },
        //显示我的排行
        setMyRank: function () {
            var me = this;

            var rank = me.DATA.myrank;
            var list = me.list.clone();
            X.autoInitUI(list);
            var txtPh = me.view.nodes.fnt_player;
            var layIco = list.nodes.panel_tx;
            var txtName = list.nodes.txt_name;
            var txtGuanqia = me.view.finds('txt_level_0');

            list.nodes.bg_list.hide();
            list.nodes.txt_title.setString(L('GUANQIA'));

            layIco.removeAllChildren();
            txtPh.removeAllChildren();
            if (rank < 0) {
                txtPh.setString("");
                me.view.finds('wsb_player').show();
            } else{
                txtPh.setString(rank);
            }
            // else if (rank < 4) {
            //     txtPh.setBackGroundImage('img/public/img_paihangbang_' + rank + '.png', 1);
            // }

                var wid = G.class.shead(P.gud);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            var maxGqid = G.class.tanxian.getCurMaxGqid();
            txtName.setString(P.gud.name);
            txtGuanqia.setString(P.gud.maxmapid > maxGqid ? maxGqid : P.gud.maxmapid);

            layIco.setTouchEnabled(false);
            // list.setPosition(me.view.nodes.list_player.width / 2, me.view.nodes.list_player.height / 2 - list.height / 2);

            // me.view.nodes.list_player.addChild(list);
            me.view.nodes.panel_player.show();
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();