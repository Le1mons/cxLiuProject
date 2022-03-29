/**
 * Created by  on 2019//.
 */
(function () {
    //宝箱奖励预览
    var ID = 'alaxi_boxprize';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.ui.finds("panel_tip").hide();
            me.nodes.panel_top.show();
            X.render({
                panel_bt:function(node){
                    var rh = X.setRichText({
                        parent:node,
                        str:L('GONGHUIFIGHT28'),
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: node.width / 2, y: node.height / 2},
                        color:"#FFE8C0",
                        size:30
                    });
                }
            },me.nodes);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
            new X.bView("ui_hdwp.json", function (node) {
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(node);
                me.view = node;
                me.setContents();
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var data = me.data();
            var canLq = data.nval >= data.conf.pval && !X.inArray(G.frame.alaxi_main.DATA.winprize, data.index);

            X.render({
                panel_wz:function(node){
                    var str = X.STR(L("GONGHUIFIGHT29"), data.conf.pval);
                    var rh = X.setRichText({
                        parent:node,
                        str:str,
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: node.width / 2, y: node.height / 2},
                        color:"#FFF6DD",
                        outline:"#2D1400",
                        size:20
                    })
                },
                panel_1: function (node) {
                    var item = G.class.sitem(data.conf.prize[0]);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                },
                btn_qr: function (node) {
                    node.setEnableState(canLq);
                    node.setTitleColor(cc.color(canLq ? G.gc.COLOR.n13 : G.gc.COLOR.n15));
                    node.setTitleText(X.inArray(G.frame.alaxi_main.DATA.winprize, data.index) ? L('YLQ') : L('LQ'));
                    node.click(function () {
                        me.ajax("gonghuisiege_getwinprize", [data.index], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: _data.d.prize
                                }).once("willClose", function () {
                                    me.remove();
                                }).show();
                                G.frame.alaxi_main.DATA.winprize.push(data.index);
                                G.frame.alaxi_main.showBoxPrize();
                            }
                        });
                    })
                },
                listview_1:function (node) {
                    node.hide();
                }
            }, me.view.nodes);
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();