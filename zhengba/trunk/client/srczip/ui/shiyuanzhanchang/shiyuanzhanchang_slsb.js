//
/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-胜利失败小界面
    var ID = 'shiyuanzhanchang_slsb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.panel_ui.setTouchEnabled(false);
            me.nodes.mask.hide();

        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().data;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            function refTimer(sender, time) {
                sender.setString('('+time + 's)');
                me.ui.setTimeout(function () {
                    time--;
                    if (time <= 0) {
                        me.remove();
                        return;
                    } else {
                        refTimer(sender, time);
                    }
                }, 1000)
            }
            if (me.DATA.fightres.winside == 0){
                me.nodes.panel_sl.show();
                me.nodes.panel_sb.hide();
                me.nodes.panel_wp.removeAllChildren();
                X.alignItems(me.nodes.panel_wp,me.DATA.prize,'left',{
                    touch:true,
                    scale: .5,
                });
                me.ui.finds('panel_sl$').finds('btn_bf1$').click(function () {
                    G.frame.fight.data({
                        pvType: 'syzc',
                        isVideo: true,
                        fightData:me.DATA
                    }).once('show', function() {

                    }).demo(me.DATA.fightres);
                });
                refTimer(me.nodes.text_sj,5);
            }else {
                me.nodes.panel_sl.hide();
                me.nodes.panel_sb.show();
                if (me.DATA.fightres.winside == 1){
                    me.nodes.text_ms.setString('我方小队已阵亡');
                } else if (me.DATA.fightres.winside == -1){
                    me.nodes.text_ms.setString('同归于尽');
                } else {
                    me.nodes.text_ms.setString('我方小队战斗失败');
                }

                me.ui.finds('panel_sb$').finds('btn_bf1$').click(function () {
                    G.frame.fight.data({
                        pvType: 'syzc',
                        isVideo: true,
                        fightData:me.DATA
                    }).once('show', function() {

                    }).demo(me.DATA.fightres);
                });
                refTimer(me.nodes.text_sj1,5);
            }
        },
    });
    G.frame[ID] = new fun('shiyuan_tk2.json', ID);
})();