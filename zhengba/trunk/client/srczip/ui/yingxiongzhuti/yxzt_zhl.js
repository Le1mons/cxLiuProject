/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //
    var ID = 'yxzt_zhl';
    var fun = X.bUi.extend({
       
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
            });
            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
            });
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
                btn_ph: function (node) {
                    // node.setTouchEnabled(true);
                    node.click(function () {
                        G.frame.help.data({
                            intr:L('TS107')
                        }).show();
                    });
                },
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('zhanhun'))
            });
            cc.enableScrollBar(me.nodes.listview);
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.updateAttr();
            me.topMenu.changeMenu(1);
            me.checkRedPoint();
        },
        changeType: function (sender) {
            var me = this;
            var type = me.type = sender.data.id;
            var viewConf = {
                1: G.class.zhanhunlin,
                2: G.class.zhanhunlin_th,
            };
            var view = new viewConf[type](me.DATA);
            me.nodes.panel_nr.addChild(view);

            if (me.view) me.view.removeFromParent();
            me.view = view;
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb:X.fmtValue(P.gud.jinbi),
                txt_zs:X.fmtValue(P.gud.rmbmoney),
            },me.nodes);
        },
        checkRedPoint:function () {
            var me = this;
            var myinfo  = me.DATA;
            //战魂令
            var zhlconf = G.gc.herotheme;
            var zhllv = Math.floor(myinfo.flag.exp / zhlconf.upflagexp) + 1;
            var zhlprize = zhlconf.flagprize;
            var zhlhd = 0;
            var zhltaskhd = 0;
            for (var i in zhlprize){
                if (zhllv>=i && !X.inArray(myinfo.flag.free,i)){
                    zhlhd = 1;
                    break;
                }
                if (myinfo.buy==1){
                    if (zhllv>=i && !X.inArray(myinfo.flag.pay(),i)){
                        zhlhd = 1;
                        break;
                    }
                }
            }
            //
            var task = zhlconf.task;
            var rec = myinfo.task.rec;
            var jindu = myinfo.task.data;
            for (var i in task){
                var nval = jindu[i]||0;
                if (!X.inArray(rec,i)){
                    if (nval>=task[i].pval){
                        zhltaskhd = 1;
                        break;
                    }
                }
            };
            if (zhlhd==1){
                G.setNewIcoImg(me.nodes.listview.getChildren()[0]);
                me.nodes.listview.getChildren()[0].finds('redPoint').setPosition(100,57);
            } else {
                G.removeNewIco(me.nodes.listview.getChildren()[0]);
            }
            if (zhltaskhd==1){
                G.setNewIcoImg(me.nodes.listview.getChildren()[1]);
                me.nodes.listview.getChildren()[1].finds('redPoint').setPosition(100,57);
            } else {
                G.removeNewIco(me.nodes.listview.getChildren()[1]);
            }
        }
    });
    G.frame[ID] = new fun('zhanhunlin_wk.json', ID);
})();