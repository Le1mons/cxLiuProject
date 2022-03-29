/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-胜利
    var ID = 'fight_tanxian_win';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.finds('bg_zhandou_sl').setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isTouch) return;
                    me.remove();
                    G.frame.tanxianFight.remove();
                    G.event.emit("showPackage");
                }
            });

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(G.frame.damijing.isShow) {
                        G.frame.fight_datacompare.data(G.frame.tanxianFight.DATA || me.data() || (me.data() && me.data().fightres) || me.DATA).show();
                    } else {
                        G.frame.fight_datacompare.data(G.frame.tanxianFight.DATA || (me.data() && me.data().fightres) || me.data() || me.DATA).show();
                    }

                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
            me.action.play("wait", true);
        },
        onShow: function () {
            var me = this;

            X.showMvp(me, G.frame.tanxianFight.DATA);
            cc.isNode(me.nodes.btn_confirm2) && me.nodes.btn_confirm2.hide();
            var win = me.ui.finds("top_sl");
            if(me.ui.zIndex > 0) X.audio.playEffect("sound/battlewin.mp3");
            win.removeAllChildren();
            G.class.ani.show({
                json: "ani_zhandoushengli",
                addTo: win,
                x: win.width / 2,
                y: win.height / 2,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {

                },
                onend: function (node, action) {
                    action.play("changtai", true);
                    cc.isNode(me.nodes.btn_confirm2) && me.nodes.btn_confirm2.show();
                }
            });

            me.DATA = G.frame.tanxianFight.data() || G.frame.tanxianFight.DATA || me.data();
            me.setContents();
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show");
            }, 100);

            me.ui.setTimeout(function () {
                me.isTouch = true;
            },250);

            me.ui.setTimeout(function () {
                G.guidevent.emit('fightWin_showOver');
            }, 1000);
        },
        onHide: function () {
            var me = this;
            me.emit("hide");
        },
        setContents: function () {
            var me = this;
            var prize = me.data() && me.data().prize;
            if(!prize && me.DATA && me.DATA.prize)prize=me.DATA.prize;

            if(!prize)return;

            X.lengthChangeByPanel(prize, me.nodes.panel_ico, me.nodes.listview_ico, {
                touch: true
            });
        },
        goToTop: function () {

            var maxZ = X.uiMana.getMaxZOrder();
            this.ui.zIndex = G.frame.tanxianFight.isShow ? G.frame.tanxianFight.ui.zIndex + 2 : maxZ+5;
            this.ui.logicZindex = this.ui.zIndex;
            G.openingFrame[this.ID()] = this.ui.zIndex;
        }
    });

    G.frame[ID] = new fun('zhandoushengli.json', ID);
})();