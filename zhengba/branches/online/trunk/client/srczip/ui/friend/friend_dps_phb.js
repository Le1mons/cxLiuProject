/**
 * Created by lsm on 2018/6/28.
 */
(function () {
    //伤害-排行榜
    var ID = 'friend_dps_phb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.text_zdjl.setString(L("DPSPHB"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("rank_open", [6], function (d) {
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
                cc.enableScrollBar(me.view.nodes.scrollview);
                cc.enableScrollBar(me.view.nodes.listview);
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                X.viewCache.getView('ui_list3.json', function (node) {
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
            scrollview.removeAllChildren();
            var listview = me.view.nodes.listview;

            var data = me.DATA;
            me.setMyRank();
            if (data.ranklist.length < 1) {
                cc.isNode(me.view.nodes.img_zwnr) && me.view.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(me.view.nodes.img_zwnr) && me.view.nodes.img_zwnr.hide();
            }
            // data.dps.sort(function(a,b){
            //     return a.dps > b.dps;
            // });
            me.maxDps = data.ranklist[0].dps;
            for (var i = 0; i < data.ranklist.length; i++) {
                data.ranklist[i].rank = i + 1;
            }

            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,10,10);
            table.setData(data.ranklist);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = -1;
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var pre;
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
            wid.data = data;
            wid.setTouchEnabled(true);
            wid.icon.setTouchEnabled(false);
            wid.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.headdata.uid
                    }).checkShow();
                }
            });
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);
            txtName.setString(data.headdata.name);

            if(data.dps == me.maxDps){
                pre = 100;
                ui.nodes.img_jdt.setPercent(pre);
                ui.nodes.txt_jdt.setString(data.dps);
            }else{
                pre = data.dps / me.maxDps * 100;
                ui.nodes.img_jdt.setPercent(pre.toFixed(2));
                ui.nodes.txt_jdt.setString(data.dps);
            }
            X.enableOutline(ui.nodes.txt_jdt, '#66370e', 1);

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);
        },
        setMyRank: function () {
            var me = this;

            var rank = me.DATA.myrank;
            var list = me.view.nodes.panel_player;
            var txtPh = me.view.nodes.fnt_player;

            X.autoInitUI(list);
            if (rank < 0) {
                txtPh.setString("");
                me.view.finds('wsb_player').show();
            } else{
                txtPh.setString(rank);
            }
            list.finds('txt_level').setString(L("SH"));
            list.finds("txt_level_0").setString(me.DATA.dps);
            list.show();
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();