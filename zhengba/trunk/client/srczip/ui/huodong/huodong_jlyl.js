/**
 * Created by LYF on 2018/8/15.
 */
(function () {
    //活动-奖励预览
    var ID = 'huodong_jlyl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.text_zdjl.setString(L("JLYL"));
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
            new X.bView("ui_eventphb.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                me.view.nodes.panel_rank.height -= 103;
                ccui.helper.doLayout(me.view.nodes.panel_rank);
                me.view.nodes.panel_rank.setPositionY(560);
                X.viewCache.getView('ui_list4.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.setDownText();
                    me.setContents();
                });
            });


        },
        setDownText:function(){
            var me = this;
            me.view.nodes.txt_sm.show();
            me.view.nodes.txt_sm.setString(L('JLYL_INFO'));
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var scrollview = me.view.nodes.scrollview;
            var data = me.data();
            data[data.length - 1].push([]);
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            // scrollview.y -= me.view.nodes.panel_player.height/2;
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,10,10);
            table.setData(data);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0].x = -1;
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
            }else {
                if(data.length < 3) {
                    txtPh.setString(rank[0] + '-' +rank[1] );
                    txtPh.show();
                    layPh.hide();
                }else {
                    txtPh.hide();
                    layPh.show();
                    layPh.setBackGroundImage("img/public/ph_200yihou.png", 1);
                }
            }
            ui.nodes.panel_item.setPositionX(520);
            X.alignItems(ui.nodes.panel_item,data[1],'left',{touch:true});
            ui.show();
        },
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();