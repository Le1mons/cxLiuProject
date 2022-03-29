/**
 * Created by  on 2019//.
 */
(function () {
    //攻城日志
    var ID = 'alaxi_gcrz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
            me.preLoadRes = ['jingjichang2.plist','jingjichang2.png'];
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.tip_title.setString(L("GONGHUIFIGHT23"));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        show: function () {
            var me = this;
            var _super = me._super;
            connectApi("gonghuisiege_loglist", [], function (data) {
                me.DATA = data;
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;
            new X.bView('ghz_tip_zcrz.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.listview);
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            me.view.nodes.img_zwnr.setVisible(me.DATA.loglist.length == 0);
            me.view.nodes.listview.removeAllChildren();
            for(var i = 0; i < me.DATA.loglist.length; i++){
                var list = me.view.nodes.list.clone();
                me.setItem(list,me.DATA.loglist[i]);
                me.view.nodes.listview.pushBackCustomItem(list)
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var arr = JSON.parse(JSON.stringify(data.log));
            var type = arr.shift();
            var time = arr.pop();
            X.render({
                panel_sb:function (node) {
                    node.removeBackGroundImage();
                    node.setBackGroundImage('img/jingjichang/img_jjc_' + (data.win == P.gud.ghid ? 'sl' : 'sb') + ".png",1);
                },
                panel_nr$: function (node) {
                    var rh = X.setRichText({
                        str: X.STR(G.gc.gonghuisiege.fightlog[type], arr),
                        parent: node,
                        size:22
                    });
                    rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                },
                txt_sj: function (node) {
                    node.setString(X.moment(time - G.time));
                },
            }, ui.nodes);
            ui.nodes.btn_luxiang.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax("gonghuisiege_getloginfo", [data.tid], function (str, d) {
                        if (d.s == 1) {
                            d.d.fight.pvType = 'alaxi';
                            d.d.fight.jifenchange = d.d.jifeninfo;
                            G.frame.fight.data({
                                pvType : 'alaxi',
                            }).demo(d.d.fight);
                        }
                    });
                }
            });
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();