/**
 * Created by admin on 2018-03-09
 */
(function () {
    //批量购买
    var ID = 'ui_tip_plgm';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        setContents: function () {
            var me = this;

            var view = me._view;

            if(me.data().data){
                X.render({
                    txt_name: function (node) {
                        var conf = G.class.getItem(me.data().data.t, me.data().data.a);
                        node.setString(conf.name);
                    },
                    ico: function (node) {
                        var wid = G.class.sitem(me.data().data);
                        wid.setPosition(cc.p(node.width / 2,node.height / 2));
                        wid.num.hide();
                        node.removeAllChildren();
                        node.addChild(wid);
                    },
                    panel_wp: function (node) {
                        node.show();
                    },
                    txt_yysl:X.STR(L('CUR_OWN_X'), me.mynum),
                },view.nodes);
            }else{
                view.nodes.txt_nr.show();
                X.render({
                    txt_nr: me.data().intr
                },view.nodes);
            }

            // X.render({
            //     txt_nr: function (node) {
            //         var myNum = me.mynum;
            //         var str = X.STR(L('CUR_OWN_X'), myNum);
            //         var rh = new X.bRichText({
            //             size:20,
            //             maxWidth:node.width,
            //             lineHeight:32,
            //             color:G.gc.COLOR.n5
            //         });
            //         rh.text(str);
            //         rh.setPosition(cc.p(0,node.height - 10));
            //         node.removeAllChildren();
            //         node.addChild(rh);
            //         node.show();
            //     },
            // },view.nodes);

            me.setCount(1);
        },
        setCount: function (v) {
            var me = this;
            var view = me._view;
            var maxBuy = me.data().maxBuy; // 最多可购买数量
            var need = me.data().need.n;
            var num = maxBuy || 999999999;

            if (v < 0 && me._count == 1)return;
            if (v > 10 && me._count == num)return;
            me._count += v;
            if (me._count < 0) me._count = 1;
            if (me._count > num ) me._count = num;

            view.nodes.txt_cs.setString(me._count);
            me.setXiaohao(need * me._count);
        },
        setXiaohao: function(count){
            var me = this;
            var view = me._view;

            var lay = view.nodes.txt_xh1;
            var img = new ccui.ImageView();
            img.loadTexture(G.class.attricon.getById(me.data().need.t).ico, ccui.Widget.PLIST_TEXTURE);
            var rt = new X.bRichText({
                size: 20,
                maxWidth: lay.width,
                lineHeight: 28,
                color:G.gc.COLOR.n12,
            });
            rt.text.apply(rt,[X.STR(L('<font node=1></font>{1}'), count), img]);
            rt.setAnchorPoint(0, 1);
            rt.setPosition(cc.p(lay.width*0.5 - rt.trueWidth()*0.5, lay.height));
            lay.removeAllChildren();
            lay.addChild(rt);
            lay.show();
        },
        bindBtn: function () {
            var me = this;
            var view = me._view;

            // 购买
            view.nodes.btn_gm.click(function(){
                var callback = me.data().callback;
                callback && callback(me._count);
                me.remove();
            });

            // 减
            view.nodes.btn_jian1.click(function(){
                me.setCount(-1);
            });

            // 减10
            view.nodes.btn_jian10.click(function(){
                me.setCount(-10);
            });

            // 加
            view.nodes.btn_jia1.click(function(){
                me.setCount(1);
            });

            // 加10
            view.nodes.btn_jia10.click(function(){
                me.setCount(10);
            });

        },
        onOpen: function () {
            var me = this;

            // me.ui.render({
            //     top_title: me.data().title
            // });
        },
        onShow: function () {
            var me = this;
            me._count = 0;

            me.mynum = me.data().mynum;
            X.render({
                btn_gb: function (node) {
                    node.click(function (sender, type) {
                        me.remove();
                    });
                },
                top_title:L('PILIANG') + L('GOUMAI') ,
            }, me.nodes);

            new X.bView('ui_tip_plgm.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                me.bindBtn();
            });
        },
        onRemove: function () {
        }
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();
