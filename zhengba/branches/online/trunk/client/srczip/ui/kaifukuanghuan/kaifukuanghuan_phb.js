/**
 * Created by LYF on 2018/9/13.
 */
(function () {
    //开服狂欢-排行榜
    var ID = 'kaifukuanghuan_phb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.text_zdjl.setString(L("PHB"));
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
            new X.bView("ui_paihangbang.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.view.nodes.panel_rank.height -= 103;
                cc.enableScrollBar(me.view.nodes.scrollview);
                cc.enableScrollBar(me.view.nodes.listview);
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                X.viewCache.getView('ui_list2.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.setContents();
                });
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.curType = 12;
            this.getData(function () {
                _super.apply(me,arguments);
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

            scrollview.removeAllChildren();

            me.setMyRank();

            var data = me.DATA;
            if (data.ranklist.length < 1) {
                cc.isNode(me.view.nodes.img_zwnr) && me.view.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(me.view.nodes.img_zwnr) && me.view.nodes.img_zwnr.hide();
            }
            for (var i = 0; i < data.ranklist.length; i++) {
                data.ranklist[i].rank = i + 1;
            }
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8, 2);
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
            ui.nodes.txt_title.setString(L("WCGS"));

            // if(data.zhanli) {
            //     ui.finds("img_zdl").show();
            //     ui.nodes.text_zdl2.show();
            //     ui.nodes.text_zdl2.setString(data.zhanli);
            // }

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
            wid.data = data;
            wid.setTouchEnabled(true);
            wid.click(function (sender) {
                if (P.gud.uid == sender.data.headdata.uid) {
                    return;
                }
                G.frame.wanjiaxinxi.data({
                    pvType: 'zypkjjc',
                    uid: sender.data.headdata.uid,
                    btnsCall: function (node) {
                        var btnsArr = [];

                    }
                }).checkShow();
            });

            txtName.setString(data.headdata.name);
            txtGuanqia.setString(data.count);

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);

        },
        //显示我的排行
        setMyRank: function () {
            var me = this;
            me.view.finds("txt_level").setString(L("WCGS"));

            if(me.DATA.myrank > 0) {
                me.view.nodes.fnt_player.setString(me.DATA.myrank);
                me.view.finds("wsb_player").hide();
                // me.view.finds("txt_level_0").setString(me.getVal(me.DATA.ranklist));
                for(var i in me.DATA.ranklist) {
                    if(me.DATA.ranklist[i].headdata.uid == P.gud.uid) {
                        me.view.finds("txt_level_0").setString(me.DATA.ranklist[i].count);
                    }
                }
            }else {
                me.view.finds("wsb_player").show();
                me.view.nodes.fnt_player.setString("");
                me.view.finds("txt_level_0").setString("");
            }
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();