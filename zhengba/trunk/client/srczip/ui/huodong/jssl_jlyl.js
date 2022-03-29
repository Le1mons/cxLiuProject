/**
 * Created by wlx on 2019/12/16.
 */
(function () {
    //剑圣的试炼奖励预览
    var ID = 'jssl_jlyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.val = me.data().val;
            me.prize = me.data().arr;
            me.gotarr = me.data().gotarr;
            me.hdid = me.data().hdid;
            for(var i = 0; i < me.prize.length; i++){
                me.prize[i].index = i;
            }
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = [];
            data = [].concat(me.prize);
            data.sort(function (a,b) {
                var isRa = X.inArray(me.gotarr, a.index);
                var isRb = X.inArray(me.gotarr, b.index);
                if(isRa != isRb){
                    return isRa < isRb ? -1:1;
                }else {
                    return a.needval < b.needval ? -1:1;
                }
            });
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data, pos) {
                    X.autoInitUI(ui);
                    ui.show();
                    ui.setSwallowTouches(false);
                    me.setItem(ui, data);
                }, null, null, 8, 8);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            ui.nodes.btn_lq.hide();
            ui.nodes.panel_wp.removeAllChildren();
            ui.nodes.panel_wp.setTouchEnabled(false);
            X.alignItems(ui.nodes.panel_wp, data.prize, "left", {
                touch: true,
            });

            ui.nodes.txt_csxz.setTouchEnabled(false);
            var str = X.STR(L("JSSLJIFEN"),data.needval);
            var st = X.setRichText({
                str:str,
                parent:ui.nodes.txt_csxz,
                color:"#723013",
                size:20,
            });
            st.x = 0;

            //领奖状态
            if(X.inArray(me.gotarr,data.index)){//已领
                ui.nodes.img_ylq.show();
            }else {
                ui.nodes.img_ylq.hide();
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('event_js_jfjl.json', ID);
})();