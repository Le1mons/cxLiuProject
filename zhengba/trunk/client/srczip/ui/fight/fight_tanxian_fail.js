/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-失败
    var ID = 'fight_tanxian_fail';

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

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isTouch) return;
                    me.remove();
                    G.frame.tanxianFight.remove();
                }
            });

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_datacompare.data(G.frame.tanxianFight.DATA || me.DATA).show();
                }
            });

            me.nodes.btn.click(function () {
                G.frame.woyaobianqiang.show();
                G.frame.tanxianFight.remove();
                me.remove();
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
            me.DATA = G.frame.tanxianFight.data() || G.frame.tanxianFight.DATA ||me.data();
            X.showMvp(me, G.frame.tanxianFight.DATA);
            var lose = me.ui.finds("top_sb");
            lose.removeAllChildren();

            if(me.ui.zIndex > 0) X.audio.playEffect("sound/battlelose.mp3");
            me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushibai/bg_zhandou_sb.png", 1);
            G.class.ani.show({
                json: "ani_zhandoushibai",
                addTo: lose,
                x: lose.width / 2,
                y: lose.height / 2,
                repeat: false,
                autoRemove: false,
                onend: function (node, action) {
                    action.play("xunhuan", true);
                }
            });

            me.setContents();

            if(me.DATA.pvType == "pvguanqia") {
                if(P.gud.mapid == 10) {
                    if(!X.cacheByUid("yindaotanxian")) {
                        X.cacheByUid("yindaotanxian", false);
                        G.event.emit("needOpenWoYaoBianQiang");
                    }
                }
            }

            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show");
            }, 100);

            me.ui.setTimeout(function () {
                me.isTouch = true;
            }, 200);
        },
        onHide: function () {
            var me = this;
            me.emit("hide");
        },
        setContents: function () {
            var me = this;

            var panel = me.ui;
            var listview = panel.nodes.listview_ico;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var list = panel.nodes.list_bqff;
            list.hide();

            var callback = function () {
                cc.isNode(me.ui) && cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED)
            };

            var data = [
                {id:'duanzaofang',callback:callback},
                {id:'yingxiong',callback:callback},
                {id:'chouka',callback:callback}
            ];
            for (var i = 0; i < data.length; i++) {
                var p = data[i];
                var item = list.clone();
                me.setItem(item,p);
                listview.pushBackCustomItem(item);
                item.show();
            }
        },
        setItem: function (ui, data) {
            var wid = G.class.stiaozhuan(data,true);
            wid.setPosition(cc.p(ui.width / 2,ui.height / 2 + 8));
            ui.removeAllChildren();
            ui.addChild(wid);
            wid.setTouchEnabled(false);
            wid.icon.setTouchEnabled(true);
            wid.icon.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var callback = data.callback;
                    callback && callback();
                    X.tiaozhuan(wid.id);
                }
            });
        },
        goToTop: function () {
            this.ui.zIndex = G.frame.tanxianFight.ui.zIndex + 2;
            this.ui.logicZindex = this.ui.zIndex;
            G.openingFrame[this.ID()] = this.ui.zIndex;
        }
    });

    G.frame[ID] = new fun('zhandoushibai.json', ID);
})();