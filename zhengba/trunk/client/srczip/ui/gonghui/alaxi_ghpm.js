/**
 * Created by  on 2019//.
 */
(function () {
    //公会排行
    G.class.alaxi_ghpm = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("ghz_tip_phb.json",null,{cache:true});
        },
        onOpen: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.getData(function () {
                me.setContents();
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            connectApi('gonghuisiege_userrank',[1],function (data) {
                me.DATA = data;
                callback && callback();
            })
        },
        setContents:function () {
            var me = this;
            me.nodes.txt_wdjf.setString(me.DATA.ranklist.myval);
            me.nodes.txt_wdpm.setVisible(me.DATA.ranklist.myrank > 0);
            if(me.DATA.ranklist.myrank > 0) me.nodes.txt_wdpm.setString(me.DATA.ranklist.myrank);
            me.nodes.img_paihangbang_wsb.setVisible(me.DATA.ranklist.myrank <= 0);
            me.nodes.listview.removeAllChildren();
            me.nodes.img_zwnr.setVisible(me.DATA.ranklist.ranklist.length == 0);
            for(var i = 0; i < me.DATA.ranklist.ranklist.length; i++){
                var list = me.nodes.list.clone();
                me.setItem(list,me.DATA.ranklist.ranklist[i]);
                me.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();

            X.render({
                panel_pm:function (node) {
                    node.setVisible(data.rank < 4);
                    if(data.rank < 4){
                        node.removeAllChildren();
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + ".png",1);
                    }
                },
                txt_pm:function (node) {
                    node.setVisible(data.rank > 3);
                    node.setString(data.rank);
                },
                panel_tx:function (node) {
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2, node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                },
                txt_name:function (node) {
                    node.setString(data.headdata.name);
                },
                txt_cs:data.fightnum,
                txt_jf:data.val
            },ui.nodes)
        }
    });
})();