/**
 * Created by ys on 2018/8/17.
 */
(function () {
    //抽卡_积分召唤
    var ID = 'chouka_jfzh';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('chouka_tip.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                view.setTouchEnabled(true);
            });
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var view = me._view;

            var widget = G.class.sitem("4009");
            widget.panel_zz.hide();
            widget.num.hide();
            widget.sui.hide();
            widget.setPosition(cc.p(view.nodes.panel_1.width/2, view.nodes.panel_1.height/2));
            view.nodes.panel_1.addChild(widget);

            if(me.data().jifen < 1000 || P.gud.lv < 3){
                view.nodes.btn_3.setBright(false);
                view.nodes.btn_3.setTouchEnabled(true);
                view.nodes.btn_3.setTitleColor(cc.color(G.gc.COLOR.n15));
            }
            view.nodes.btn_3.click(function () {
                if(G.frame.chouka.DATA.jifen < 1000 || P.gud.lv < 3){
                    G.tip_NB.show(L("NLTANDVIP"));
                    return;
                }
                me.huan();
                G.frame.chouka_jfzh.remove();
            }, 1000)
        },
        huan: function(){
            var me = G.frame.chouka;

            G.ajax.send('jitan_duihuan',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    X.audio.playEffect("sound/zhaohuan.mp3");
                    if(G.frame.chouka_hdyx.isShow){
                        G.frame.chouka_hdyx.nodes.ico_yx.removeAllChildren();
                        for(var i = 0; i < 10; i ++){
                            G.frame.chouka_hdyx.nodes["ico_" + (i + 1)].removeAllChildren();
                        }
                    }
                    G.frame.chouka_hdyx.data({
                        hero:d.d.prize
                    }).show();
                    me.getData(function () {
                        me.setContents();
                        if (G.frame.chouka_hdyx.isShow) {
                            G.frame.chouka_hdyx.setBar();
                            G.frame.chouka_hdyx.bindBtn();
                        }
                    });
                }else{
                    X.audio.playEffect("sound/dianji.mp3", false);
                }
            },true);
        },
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();