/**
 * Created by lsm on 2018/6/23
 */
(function() {
    //竞技场-冠军试炼-赛季奖励
    var ID = 'jingjichang_gj_prize';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function() {
            var me = this;

            setPanelTitle(me.nodes.text_zdjl, L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function() {
            var me = this;

            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;

            if (me.needRefreshMain) delete me.needRefreshMain;
            me.nodes.text_zdjl.setString(L('SJJL'));
            new X.bView('jingjichang_pmjl.json', function(view) {
                me._view = view;

                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function() {
            var me = this;

        },
        refreshData: function() {
            var me = this;

        },
        getData: function(callback) {
            var me = this;
            
        },
        setContents: function() {
            var me = this;
            me.setMyRank();
            me.setTable(); 

        },
        setMyRank: function () {
            var me = this;
            var panel = me._view.nodes.panel_wzts;

            panel.removeAllChildren();
            var str = L('MY_RANK') + '<font color=#BE5E30>' + (G.frame.jingjichang_guanjunshilian.DATA.myrank || 0) + '</font>';
            var rh = new X.bRichText({
                size:22,
                maxWidth:panel.width,
                lineHeight:34,
                color:G.gc.COLOR.n4,
                family:G.defaultFNT
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0.5);
            rh.setPosition(cc.p(0, panel.height / 2));

            var str1 = L("SJJL_RANK_INFO");
            var rh1 = new X.bRichText({
                size:22,
                maxWidth:panel.width,
                lineHeight:32,
                color:G.gc.COLOR.n4,
                family:G.defaultFNT,
            });
            rh1.text(str1);
            rh1.setAnchorPoint(1, 0.5);
            rh1.setPosition(cc.p(panel.width, panel.height / 2));
            panel.addChild(rh);
            panel.addChild(rh1);
        },
        setTable: function () {
            var me = this;
            var panel = me._view;
            var scrollview = panel.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var ranklist = G.class.championtrial.get().base.weekprize;


            var table = me.table = new X.TableView(scrollview,panel.nodes.list_lb,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8);
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
                }  else if(rank[0] > 100){
                    layPm.show();
                    rank[0] == 101 && layPm.setBackGroundImage('img/public/img_paihangbang_4.png',1);
                    rank[0] == 201 && layPm.setBackGroundImage('img/public/img_paihangbang_5.png',1);
                    rank[0] == 501 && layPm.setBackGroundImage('img/public/img_paihangbang_6.png',1);
                    rank[0] == 1001 && layPm.setBackGroundImage('img/public/img_paihangbang_7.png',1);
                } else {
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

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();