/**
 * Created by wfq on 2018/6/21.
 */
(function () {
    //竞技场-奖励-赛季奖励
    G.class.jingjichang_sjjl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('jingjichang_pmjl.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setMyRank();
            me.setTable();
        },
        setMyRank: function () {
            var me = this;

            var panel = me.nodes.panel_wzts;
            var data = me.DATA;

            panel.removeAllChildren();
            var str = L('SJJL_RANK_INFO');
            var rh = new X.bRichText({
                size:22,
                maxWidth:panel.width,
                lineHeight:32,
                color:G.gc.COLOR.n4,
                family:G.defaultFNT
            });
            rh.text(str);
            rh.setPosition(cc.p(panel.width / 2 - rh.trueWidth() / 2,panel.height / 2 - rh.trueHeight() / 2));
            panel.addChild(rh);
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var ranklist = G.class.jingjichang.get().base.weekprize.prize;


            var table = me.table = new X.TableView(scrollview,me.nodes.list_lb,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(ranklist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            var layIco = ui.nodes.panel_tx;
            var layPm = ui.nodes.panel_pm;
            var txtPm = ui.nodes.sz_phb;

            layPm.hide();
            txtPm.setString('');
            txtPm.hide();

            layIco.removeAllChildren();
            layIco.setTouchEnabled(false);
            //排名
            var rank = data[0];
            if (rank.length == 1) {
                if (rank[0] < 4) {
                    layPm.show();
                    layPm.setBackGroundImage('img/public/img_paihangbang_' + rank[0] + '.png',1);
                } else {
                    txtPm.setString(rank[0]);
                    txtPm.show();
                }
            } else {
                if (rank[0] == rank[1]) {
                    // txtPm.setString(rank[0]);
                    if (rank[0] < 4) {
                        layPm.show();
                        layPm.setBackGroundImage('img/public/img_paihangbang_' + rank[0] + '.png',1);
                    } else {
                        txtPm.setString(rank[0]);
                        txtPm.show();
                    }
                } else if(rank[0] > 100){
                    layPm.show();
                    rank[0] == 101 && layPm.setBackGroundImage('img/public/img_paihangbang_4.png',1);
                    rank[0] == 201 && layPm.setBackGroundImage('img/public/img_paihangbang_5.png',1);
                    rank[0] == 501 && layPm.setBackGroundImage('img/public/img_paihangbang_6.png',1);
                    rank[0] == 1001 && layPm.setBackGroundImage('img/public/img_paihangbang_7.png',1);
                }  else {
                    txtPm.setString(rank[0] + '-' + rank[1]);
                    txtPm.show();
                }
            }

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            X.alignItems(layIco,data[1],'left',{
                touch:true
            });
        }
    });

})();