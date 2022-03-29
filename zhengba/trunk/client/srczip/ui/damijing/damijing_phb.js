/**
 * Created by LYF on 2018/10/23.
 */
(function () {
    //排行榜
    var ID = 'damijing_phb';

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

            G.ajax.send("rank_open", [16], function (d) {
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

            me.txt = [
                L("JIANDAN"),
                L("PUTONG"),
                L("KUNNAN"),
                L("DIYU"),
                L("EMENG"),
                L("JUEWANG"),
                L("JUEWANG1"),
                L("JUEWANG2"),
                L("JUEWANG3"),
                L("JUEWANG4")
            ]
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
            },null,null,8,10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = -1;
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var me = this;
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txtGuanqia = ui.nodes.txt_number;
            ui.nodes.txt_title.setString(me.txt[parseInt((data.layer - 1) / 100)] || me.txt[me.txt.length - 1]);

            ui.finds("img_zdl").show();
            ui.nodes.text_zdl2.show();
            ui.nodes.text_zdl2.setString(data.zhanli);

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
            txtGuanqia.setString(data.layer > X.keysOfObject(G.class.getConf("watcher")).length ? X.keysOfObject(G.class.getConf("watcher")).length : data.layer);

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);
        },
        setMyRank: function () {
            var me = this;

            var rank = me.DATA.myrank;
            var txtPh = me.view.nodes.fnt_player;
            var txtGuanqia = me.view.finds('txt_level_0');
            if (!rank || rank == -1) {
                txtPh.setString("");
                me.view.finds('wsb_player').show();
            } else {
                txtPh.setString(rank);
            }
            me.view.finds("txt_level").setString(me.txt[parseInt((G.frame.damijing.DATA.layer - 1) / 100)] || me.txt[me.txt.length - 1]);
            txtGuanqia.setString(G.frame.damijing.DATA.layer > X.keysOfObject(G.class.getConf("watcher")).length ? X.keysOfObject(G.class.getConf("watcher")).length : G.frame.damijing.DATA.layer - 1);

            me.view.nodes.panel_player.show();
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();