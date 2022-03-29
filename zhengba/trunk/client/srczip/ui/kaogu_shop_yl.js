/**
 * Created by 嘿哈 on 2020/4/15.
 */
(function () {

    var ID = 'kaogu_shop_yl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_qr.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.list = new ccui.Layout();
            me.list.setContentSize(cc.size(100,100));
            me.ui.addChild(me.list);
            me.prize = me.data().prize
            X.render({
                panel_bt:function(node){
                    var rh = new X.bRichText({
                        size: 30,
                        maxWidth: node.width,
                        lineHeight: 32,
                        color: "#FFE8C0",
                        family: G.defaultFNT,
                    });
                    rh.setPosition(cc.p(165, 0));
                    rh.text(me.data().title || L('JLYL'));
                    node.addChild(rh);
                }
            },me.nodes);
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = me.prize;
            data.sort(function(a,b){
                var colorA = G.class.getItem(a.t, a.a).color;
                var colorB = G.class.getItem(b.t, b.a).color;
                return colorA > colorB ? -1:1;
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                },null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            var item = G.class.sitem(data);
            G.frame.iteminfo.showItemInfo(item);
            item.setAnchorPoint(0,0);
            ui.removeAllChildren();
            ui.addChild(item);
            ui.setSwallowTouches(false);
        }
    });
    G.frame[ID] = new fun('ui_kaogu_hd.json', ID);
})();