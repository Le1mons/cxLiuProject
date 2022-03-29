/**
 * Created by wfq on 2018/6/19.
 */
(function() {
    //自由竞技场-排行榜
    G.class.jingjichang_phb = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('jingjichang_phb.json');
        },
        refreshPanel: function() {
            var me = this;

            me.getData(function() {
                me.setContents();
            });
        },
        bindBTN: function() {
            var me = this;

        },
        onOpen: function() {
            var me = this;
            me.DATA = G.frame.jingjichang_freepk.isShow ? G.frame.jingjichang_freepk.rankData : G.frame.jingjichang_guanjunshilian.rankData;
            me.bindBTN();
        },
        onShow: function(data) {
            var me = this;
            me.setContents();
        },
        onRemove: function() {
            var me = this;
        },
        getData: function(callback) {
            var me = this;
            G.ajax.send('rank_open', [G.frame.jingjichang_freepk.isShow ? 3 : 4], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function() {
            var me = this;

            me.setMyRank();
            me.setTable();
        },
        setMyRank: function() {
            var me = this;

            var panel = me.ui.finds('panel_wdxx');
            X.autoInitUI(panel);

            var layIco = panel.nodes.panel_tx;
            var txtRank = panel.nodes.text_pm;
            var txtScore = panel.nodes.text_jf;
            var txtZdl = panel.nodes.text_zdl1;

            layIco.removeAllChildren();

            var data = G.frame.jingjichang_freepk.isShow ? G.frame.jingjichang_freepk.DATA : G.frame.jingjichang_guanjunshilian.DATA;

            var wid = G.class.shead(P.gud);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);

            var rank = data.myrank || 0;
            txtRank.setString(rank > 1000 ? "1000+" : rank);
            txtScore.setString(data.jifen);
            txtZdl.setString(data.zhanli || 0);
        },
        setTable: function() {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var ranklist = [].concat(me.DATA.ranklist);
            if (ranklist.length < 1) {
                me.nodes.img_zwnr.show();
                return;
            } else {
                me.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < ranklist.length; i++) {
                ranklist[i].rank = i + 1;
            }

            // for (var i = 0; i < ranklist.length; i++) {
            //     me.setItem(me.nodes.list_lb.clone(), ranklist[i]);
            // }
            //
            // // if (ranklist.length > 5) {
            // //     for (var i = 0; i < 5; i++) {
            // //         me.setItem(me.nodes.list_lb.clone(), ranklist[i]);
            // //     }
            // //     me.ui.setTimeout(function() {
            // //         for (var i = 6; i < ranklist.length; i++) {
            // //             me.setItem(me.nodes.list_lb.clone(), ranklist[i]);
            // //         }
            // //     }, 200)
            // // } else {
            //
            // // }


            var table = me.table = new X.TableView(scrollview,me.nodes.list_lb,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,12);
            table.setData(ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me = this;

            X.autoInitUI(ui);
            var layIco = ui.nodes.panel_tx;
            var layPm = ui.nodes.panel_pm;
            var txtPm = ui.nodes.sz_phb;
            var txtName = ui.nodes.text_mz;
            var txtZl = ui.nodes.text_zdl2;
            var txtScore = ui.nodes.text_jf;
            ui.finds('img_dk').setColor(cc.color('#EDE4D0'));


            layPm.hide();
            txtPm.setString('');
            txtPm.hide();
            layIco.removeAllChildren();
            layPm.setTouchEnabled(false);
            ui.setTouchEnabled(false);

            //排名
            if (data.rank < 4) {
                layPm.show();
                layPm.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
            } else {
                txtPm.setString(data.rank);
                txtPm.show();
            }

            var wid = G.class.shead(data.headdata);
            wid.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.addChild(wid);

            layIco.setTouchEnabled(true);
            layIco.setSwallowTouches(false);
            layIco.data = data.headdata.uid;
            layIco.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.wanjiaxinxi.data({
                        pvType: G.frame.jingjichang_freepk.isShow ? 'zypkjjc' : 'championtrial',
                        uid: sender.data,
                        isHideTwo: G.time >= X.getLastMondayZeroTime() + 6 * 24 * 3600 + 21 * 3600 + 1800
                    }).checkShow();
                }
            });

            txtName.setString(data.headdata.name);
            txtZl.setString(data.zhanli || 0);
            txtScore.setString(data.jifen || 0);

            ui.show();
        },
        onNodeShow: function() {
            var me = this;

            if (!cc.isNode(me.ui)) {
                return;
            }
            me.refreshPanel();
        }
    });

})();