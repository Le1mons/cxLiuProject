/**
 * Created by lsm on 2018/9/26.
 */
(function () {
    //域外争霸排行榜-排行榜

    G.class.yuwaizhengba_jfphb = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('ui_waiyuzhengbapaihang.json');
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;

        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            // me.nodes.panel_rank.height -= 103;
            // ccui.helper.doLayout(me.nodes.panel_rank);
            X.viewCache.getView('ui_list2.json', function (node) {
                me.list = node.nodes.list_rank;

                var scrollview = me.nodes.scrollview;
                cc.enableScrollBar(scrollview);
                var listview = me.nodes.listview;
                cc.enableScrollBar(listview);

                me.getData(function(){
                    me.setContents();
                });
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('rank_open', [13], function (d) {
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
            var scrollview = me.nodes.scrollview;

            scrollview.removeAllChildren();

            var data = me.DATA;
            me.setMyRank();
            if (data.ranklist.length < 1) {
                cc.isNode(me.nodes.img_zwnr) && me.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(me.nodes.img_zwnr) && me.nodes.img_zwnr.hide();
            }
            for (var i = 0; i < data.ranklist.length; i++) {
                data.ranklist[i].rank = i + 1;
            }
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = 4;
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txt_jf = ui.nodes.txt_number;
            var txt_wz = ui.nodes.txt_wz;
            txt_wz.setString(X.STR(L('YWZB_QF'),data.headdata.svrname));
            ui.nodes.txt_title.setString(L('jifenphb'));

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
            txt_jf.setString(data.jifen);

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
            var txtPh = me.nodes.fnt_player;
            var layIco = list.nodes.panel_tx;
            var txtName = list.nodes.txt_name;
            var txt_jf = me.finds('txt_level_0');
            me.finds('txt_level').setString(L('jifenphb'));
            list.nodes.bg_list.hide();
            list.nodes.txt_title.setString(L('jifenphb'));

            layIco.removeAllChildren();
            txtPh.removeAllChildren();
            if (rank < 0) {
                txtPh.setString("");
                me.finds('wsb_player').show();
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
            txt_jf.setString(me.DATA.val);
            layIco.setTouchEnabled(false);
            // list.setPosition(me.view.nodes.list_player.width / 2, me.view.nodes.list_player.height / 2 - list.height / 2);

            // me.view.nodes.list_player.addChild(list);
            me.nodes.panel_player.show();
        }
    });
})();