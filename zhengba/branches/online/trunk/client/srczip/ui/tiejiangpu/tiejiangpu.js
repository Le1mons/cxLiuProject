/**
 * Created by zhangming on 2018-05-14
 */

G.event.on('equipchange_over', function () {
    G.hongdian.checkHeCheng();
    if(G.frame.tiejiangpu.isShow) {
        if(G.frame.tiejiangpu.viewType == 1) {
            G.frame.tiejiangpu.checkTypeRedPoint();
        }
    }
});

(function () {
    //杂货铺
    var ID = 'tiejiangpu';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;

            me.ui.finds('panle_2').setTouchEnabled(false);

            me.topMenu = new G.class.topMenu(me,{
                btns:X.clone(G.class.menu.get('tiejiangpu'))
            });

            me.nodes.btn_rl1.show();
            me.nodes.btn_zh1.show();
            me.nodes.btn_dwjl1.show();

            if(P.gud.lv < G.class.opencond.getLvById("glyphrefine")) {
                me.nodes.btn_dwjl1.checkLv = true;
                me.nodes.btn_dwjl1.show = X.STR(L("XJKQ"), G.class.opencond.getLvById("glyphrefine"));
            }


            X.radio([me.nodes.btn_rl1, me.nodes.btn_zh1, me.nodes.btn_dwjl1], function (sender) {
                var type = {
                    btn_rl1$: 1,
                    btn_zh1$: 2,
                    btn_dwjl1: 3
                };

                me.changeView(type[sender.getName()]);
            })
        },
        changeView: function(type) {
            var me = this;

            if(me.viewType && me.viewType == type) return;

            me.viewType = type;

            var bViewDown;
            var bViewUp;
            var bViewDW;
            if(type == 1) {
                bViewDown = me.bViewDown = new G.class.tiejiangpu_top();
                bViewUp = me.bViewUp = new G.class.tiejiangu_table();
                me.checkTypeRedPoint();
                me.nodes.listview.show();
            }else if(type == 2){
                bViewDown = me.bViewDown = new G.class.tiejiangpu_zhuanhuan_top();
                bViewUp = me.bViewUp = new G.class.tiejiangu_zhuanhuan_table();
                me.checkTypeRedPoint(true);
                me.nodes.listview.show();
            } else {
                me.nodes.listview.hide();
                bViewDW = me.bViewDW = new G.class.diaowenjinglian();
            }
            me.ui.finds('panle_1').removeAllChildren();
            me.ui.finds('panle_2').removeAllChildren();
            me.ui.finds('panle_3').removeAllChildren();

            if(bViewUp) {
                bViewUp.event.once("showed", function () {
                    me.topMenu.changeMenu(1);
                });
                me.ui.finds('panle_1').addChild(bViewUp);
            }
            if(bViewDown) {
                me.ui.finds('panle_2').addChild(bViewDown);
            }
            if(bViewDW) {
                me.ui.finds('panle_3').addChild(bViewDW);
            }

        },
        changeType: function(sender){
            var me = this;
            var type = sender.data.id;
            me._curType = type;

            if(me.viewType == 1) {
                me.bViewDown.refreshData(me.getData(type),type);
                me.bViewUp.refreshData(me.getEquipData(type),type);
            }else {
                me.bViewUp.refreshData(type);
            }
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/opentiejiangpu.mp3");
            me.bindUI();
            me.ui.finds('panle_1').setTouchEnabled(false);
        },
        checkTypeRedPoint: function(boll) {
            var me = this;

            if(boll) {
                for (var i in me.nodes.listview.children) {
                    G.removeNewIco(me.nodes.listview.children[i]);
                }
            } else {
                var redArr = G.hongdian.checkHeCheng();
                for(var i in redArr) {
                    if(redArr[i]) {
                        G.setNewIcoImg(me.nodes.listview.getChildren()[i]);
                        me.nodes.listview.getChildren()[i].getChildByName("redPoint").x = 107;
                    }else{
                        G.removeNewIco(me.nodes.listview.getChildren()[i]);
                    }
                }
            }
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.nodes.btn_rl1.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');
        },
    });

    G.frame[ID] = new fun('ui_tip6.json', ID);
})();