/**
 * Created by
 */
(function () {
    //赛龙舟-奖励展示
    var ID = 'slz_jlzs';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview2.setTouchEnabled(true);
            me.nodes.list.hide();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.setTouchEnabled(true);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.lzid = me.data().id;
            me.extprize = me.data().extprize;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var lzextp = G.gc.longzhou.extprize;
            var last = [];
            for (var i =0;i<X.keysOfObject(me.extprize).length;i++){
                var key = X.keysOfObject(me.extprize)[i];
                if (me.extprize[key].length>0){
                    var item = {};
                    item.plist = me.extprize[key];
                    item.prize = lzextp[me.lzid][i][1];
                    last.push(item);
                }
            }
            if (last.length<1) return;

            me.nodes.scrollview.removeAllChildren();
            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setItem(ui, data);
            });
            me.table.setData(last);
            me.table.reloadDataWithScroll(true);
        },
        setItem:function (ui,data) {
            var me= this;
            X.autoInitUI(ui);
            var prize1 = G.class.sitem(data.prize[0]);
            prize1.setPosition(ui.nodes.panel_wp.width / 2, ui.nodes.panel_wp.height / 2);
            ui.nodes.panel_wp.addChild(prize1);
            G.frame.iteminfo.showItemInfo(prize1);
            ui.nodes.txt_jl.setString(prize1.conf.name);
            ui.nodes.txt_jl.setTextColor(cc.color('#ffe8a5'));
            ui.nodes.txt_sl.setString(X.STR(L('slz_tip21'),data.plist.length));
            ui.nodes.txt_sl.setTextColor(cc.color('#ffe8a5'));
            var scrollview =  ui.nodes.scrollview2;
            cc.enableScrollBar(scrollview,false);
            scrollview.removeAllChildren();
            // scrollview.setSwallowTouches(true);
            me.table2 = new X.TableView(scrollview, me.nodes.list_wz, 2, function (ui, data) {
                me.setWzItem(ui, data);
            });
            me.table2.setData(data.plist);
            me.table2.reloadDataWithScroll(true);
            scrollview.setTouchEnabled(true);
        },
        setWzItem:function (ui,data) {
            if (data.uid == P.gud.uid){
                var str = '('+'我'+')' + X.STR(L('slz_tip22'),data.name,data.servername);
            }else {
                var str =  X.STR(L('slz_tip22'),data.name,data.servername);
            }
            X.setRichText({
                str: str,
                parent: ui,
                color: '#ffffff',
                size: 20,
                maxWidth: ui.width
            });
        }
    });
    G.frame[ID] = new fun('duanwu_tk4.json', ID);
})();