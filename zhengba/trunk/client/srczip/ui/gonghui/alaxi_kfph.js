/**
 * Created by  on 2019//.
 */
(function () {
    //跨服排行
    G.class.alaxi_kfph = X.bView.extend({
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
        setContents:function(){
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
            ui.finds('txt1').setString(L('GONGHUIFIGHT24'));
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
                    wid.setTouchEnabled(true);
                    wid.setSwallowTouches(false);
                    wid.touch(function(sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.wanjiaxinxi.data({
                                pvType: 'zypkjjc',
                                uid: data.headdata.uid
                            }).checkShow();
                        }
                    });
                },
                txt_name:function (node) {
                    node.setString(data.headdata.name);
                },
                txt_cs:data.headdata.ext_servername || '',
                txt_jf:data.val
            },ui.nodes)
        },
        getData:function (callback) {
            var me = this;
            connectApi('gonghuisiege_userrank',[2],function (data) {
                me.DATA = data;
                callback && callback();
            })
        }
    });
})();