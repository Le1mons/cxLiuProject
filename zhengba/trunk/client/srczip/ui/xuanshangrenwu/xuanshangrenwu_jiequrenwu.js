// created by LYF on 2018/6/5

(function () {
    //悬赏任务

    var ID = 'xuanshangrenwu_jiequ';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        bindUI: function(){
            var me = this;
            me.ui.nodes.mask.click(function (sender, type) {
                me.remove();
            });
            setPanelTitle(me.ui.nodes.txt_title, "任务详情");
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
        },
        onShow: function () {
            var me = this;
            me.setTop();
            me.setBottom();
        },
        setTop: function () {
            var me = this;
            if (!me.top) {
                me.top = new G.class.xstask_xq("xuanze");
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function () {
            var me = this;
            if (!me.bottom) {
                me.bottom = new G.class.xstask_check("xuanze");
                me.nodes.panel_nr2.removeAllChildren();
                me.nodes.panel_nr2.addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
        },
        playAniMove: function (node) {
            var me = this;
            var posSz = G.frame.xuanshangrenwu_jiequ.posSz;
            var posSelect = G.frame.xuanshangrenwu_jiequ.posSelect;
            var type = G.frame.xuanshangrenwu_jiequ.playAniType;

            var posEnd;
            if(type == "remove"){
                posEnd = posSelect || cc.p(310, 800);
            }else{
                posEnd = posSz;
            }

            cc.isNode(me.item) && me.item.runActions([
                G.frame.xuanshangrenwu_jiequ.bottom.isAllHero ? cc.fadeOut(0.2) : cc.moveTo(0.2, posEnd),
                cc.callFunc(function () {
                    cc.isNode(me.item) && me.item.removeFromParent(true);
                    if(G.frame.xuanshangrenwu_jiequ.bottom.isAllHero){
                        me.ui.setTimeout(function () {
                            G.frame.xuanshangrenwu_jiequ.bottom.isAllHero = false;
                        }, 300);
                    }
                    cc.callLater(function () {
                        //G.guidevent.emit("xuanshangrenwu_sz_move_over");
                    })
                })
            ])
        },

    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();