/**
 * Created by lsm on 2018/6/28.
 */
(function () {
    //积分-排行榜
    var ID = 'friend_jifen_pmjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.text_zdjl.setString(L("jifenjiangli"));
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
                me.view.nodes.panel_refresh.hide();
                me.view.nodes.panel_player.hide();
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                X.viewCache.getView('ui_list4.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.setContents();
                });
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var scrollview = me.view.nodes.scrollview;
            var listview = me.view.nodes.listview;
            var data = G.class.friend.getWeekprize();
            cc.enableScrollBar(scrollview);
            cc.enableScrollBar(listview);
            scrollview.removeAllChildren();
            // scrollview.y -= me.view.nodes.panel_player.height/2;
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,10,10);
            table.setData(data.prize);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = -1;
            // me.view.nodes.panel_refresh.show();
            var zeroTime = X.getLastMondayZeroTime();
            X.timeout(me.view.nodes.txt_time,zeroTime + 7 * 24 * 60 * 60,null,null,null);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            txtPh.removeAllChildren();
            layPh.removeAllChildren();
            var rank = data[0];
            if (rank[0] < 4) {
                layPh.setBackGroundImage('img/public/img_paihangbang_' + rank[0] + '.png', 1);
                layPh.show();
                txtPh.hide();
            }else if(rank[0] > 100){
                layPh.show();
                txtPh.hide();
                rank[0] == 101 && layPh.setBackGroundImage('img/public/img_paihangbang_4.png',1);
                rank[0] == 201 && layPh.setBackGroundImage('img/public/img_paihangbang_5.png',1);
                rank[0] == 501 && layPh.setBackGroundImage('img/public/img_paihangbang_6.png',1);
                rank[0] == 1001 && layPh.setBackGroundImage('img/public/img_paihangbang_7.png',1);
            } else {
                txtPh.setString(rank[0] + '-' +rank[1] );
                txtPh.show();
                layPh.hide();
            }
            ui.nodes.panel_item.setPositionX(520);
            X.alignItems(ui.nodes.panel_item,data[1],'left',{touch:true});
            ui.show();
        },
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();