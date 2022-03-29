/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-失败
    var ID = 'fight_fail';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                    G.frame.fight.remove();
                }
            });

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_datacompare.data(G.frame.fight.DATA || me.DATA).show();
                }
            });

            me.nodes.btn_next2.click(function () {
                if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                    G.frame.dafashita.fightCall();
                } else {
                    me.DATA.callback && me.DATA.callback();
                }
            }, 1000);

            me.nodes.btn_confirm2.click(function () {
                me.remove();
                G.frame.fight.remove();
            });

            me.nodes.btn.click(function () {
                G.frame.woyaobianqiang.show();
                G.frame.fight.remove();
                me.remove();
            })
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
            me.DATA = G.frame.fight.data() || G.frame.fight.DATA ||me.data();
            X.audio.playEffect("sound/battlelose.mp3");
            var lose = me.ui.finds("top_sb");
            lose.removeAllChildren();

            if(X.inArray(["pvghtf", "pvfuben", "pvmw", "mwvideo"], me.DATA.pvType)){
                me.nodes.btn.hide();
                me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushengli/bg_zhandou_sl.png", 1);
                G.class.ani.show({
                    json: "ani_zhandoushengli",
                    addTo: lose,
                    x: lose.width / 2,
                    y: lose.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onload: function(node, action) {
                        node.finds("zi1").setSpriteFrame("img/public/zhandoujieshu.png");
                    },
                    onend: function(node, action) {
                        action.play("changtai", true);
                    }
                });
            }else {
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
            }
            if(me.DATA.pvType == "pvfuben" || me.DATA.pvType == "pvmw" || me.DATA.pvType == "pvghtf"){
                me.setfb();
            }else{
                me.setContents();
            }
            if(me.DATA.pvType == "hybs") {
                me.nodes.panel_btn.show();
            }
            if(me.DATA.pvType == "pvguanqia") {
                if(P.gud.mapid == 10) {
                    if(!X.cacheByUid("yindaotanxian")) {
                        X.cacheByUid("yindaotanxian", false);
                        G.event.emit("needOpenWoYaoBianQiang");
                    }
                }
            }
            if(me.DATA.pvType == "damijing") {
                me.setDMJ();
            }
            if(me.DATA.pvType == "mwvideo") {
                me.setMW();
            }
            if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                me.nodes.btn.hide();
                me.nodes.panel_btn.show();
                me.nodes.btn_next2.setTitleText(L("ZCTZ"));
            }
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show")
            }, 100);
        },
        setDMJ: function () {
            var me = this;
            me.nodes.damijing.show();
            me.nodes.btn.hide();
            me.nodes.listview_ico.hide();
            me.ui.finds("img_zhandou_sb2").hide();
            for(var i in me.DATA.pv) {
                var layout = me.nodes["mingji_rw" + i];
                var wid = G.class.shero(me.DATA.pv[i]);
                wid.setAnchorPoint(0.5, 0.5);
                wid.setPosition(layout.width / 2, layout.height / 2);
                i == 1 ? wid.setEnabled(me.DATA.winside ? false : true) : wid.setEnabled(me.DATA.winside ? true : false);
                layout.addChild(wid);
            }
        },
        setMW: function() {
            var me = this;
            me.nodes.btn.hide();
            me.nodes.listview_ico.hide();
            me.ui.finds("img_zhandou_sb2").hide();

            me.nodes.list_fs.show();
            me.nodes.txt_prefix.setString(L("dps"));
            me.nodes.txt_number.setString(me.DATA.dpsbyside[0]);

        },
        setfb: function(){
            var me = this;
            me.ui.finds("img_zhandou_sb2").hide();
            X.alignCenter(me.nodes.panel_nr, me.DATA.prize, {
                touch: true
            })
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

            // var data = me.DATA.prize;
            var callback = function () {
                cc.isNode(me.ui) && cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED)
            };

            var data = [
                {id:'tiejiangpu',callback:callback},
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
        }
    });

    G.frame[ID] = new fun('zhandoushibai.json', ID);
})();