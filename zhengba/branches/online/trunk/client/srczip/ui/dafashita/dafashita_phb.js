/**
 * Created by LYF on 2018/6/8.
 */
(function () {
    //排行榜
    var ID = 'dafashita_phb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.text_zdjl.setString(L("PHB"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("rank_open", [2], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            })
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
            new X.bView("ui_paihangbang.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.view.nodes.panel_rank.height -= 103;
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                cc.enableScrollBar( me.view.nodes.panel_rank.finds('listview$') );
                X.viewCache.getView('ui_list2.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.getData(function () {
                        me.setContents();
                    });
                });
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var scrollview = me.view.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            var data = me.DATA;
            me.setMyRank();
            if (data.ranklist.length < 1) {
                cc.isNode(me.ui.finds('zwnr')) && me.ui.finds('zwnr').show();
                return;
            } else {
                cc.isNode(me.ui.finds('zwnr')) && me.ui.finds('zwnr').hide();
            }

            for (var i = 0; i < data.ranklist.length; i++) {
                data.ranklist[i].rank = i + 1;
            }
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
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
            ui.nodes.txt_title.setString(L('CENGSHU'));

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
            txtGuanqia.setString(data.layernum);

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);
        },
        setMyRank: function () {
            var me = this;

            var rank = me.DATA.myrank;
            var txtPh = me.view.nodes.fnt_player;
            var txt = me.view.finds("txt_player");
            var txtGuanqia = me.view.finds('txt_level_0');
            if (!rank || rank == -1) {
                txtPh.setString("");
                me.view.finds('wsb_player').show();
            } else {
                txtPh.setString(rank);
            }
            txtGuanqia.setString(G.frame.dafashita.DATA.layernum);

            me.view.nodes.panel_player.show();
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();