/**
 * Created by zhangming on 2018-05-14
 */

G.event.on('itemchange_over', function (data) {
    var isSuiPian = false;
    var keys = X.keysOfObject(data);
    for (var i in keys) {
        var conf = G.class.getItem(data[keys[i]].itemid);
        if (conf && (conf.bagtype == "3" || conf.bagtype == "4")) {
            isSuiPian = true;
            break;
        }
    }
    if (isSuiPian) {
        G.hongdian.checkYx();
        G.hongdian.checkUseItem();
        if (G.frame.yingxiong.isShow) {
            G.frame.yingxiong.checkRedPoint();
        }
        if (G.frame.beibao.isShow) {
            G.frame.beibao.checkRedPoint();
        }
    }
    if (G.frame.beibao.isShow) {
        G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
    }
});

G.event.on("wuhunchange_over", function () {
    if (G.frame.beibao.isShow) {
        G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
    }
});

(function () {
    //背包
    var ID = 'beibao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me.needshowMainMenu = true;
            me._super(json, id, {action: true});
        },
        changeType: function (sender) {
            var me = this;
            var type = sender.data.id;
            me._curType = type;

            if (type == 2) {
                me.trr2 = true;
            } else {
                if (me.trr2) {
                    if (!X.cacheByUid("showToDayUseItemRedPoint")) {
                        X.cacheByUid("showToDayUseItemRedPoint", 1);
                        me.checkRedPoint();
                        G.hongdian.checkUseItem();
                    }
                }
            }

            var viewConf = {
                "1": G.class.beibao_list,
                "2": G.class.beibao_list,
                "3": G.class.beibao_list,
                "4": G.class.beibao_list,
                "5": G.class.beibao_list,
                "6": G.class.beibao_list,
            };

            var newView = new viewConf[type];
            newView.setVisible(false);
            newView._type = type;
            me.ui.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)) {
                me.playBookAni(function () {
                    me._panels.removeFromParent();
                    me._panels = newView;
                    me._panels.setVisible(true);
                    cc.callLater(function () {
                        G.guidevent.emit('beibaoChangeTypeOver', type);
                    });
                })
            }else {
                me.playBookAni(function () {
                    me._panels = newView;
                    me._panels.setVisible(true);
                })
            }
        },
        playBookAni: function(callback, type) {
            var me = this;

            callback && callback();
            // G.class.ani.show({
            //     json: "ani_fanshu",
            //     addTo: me.nodes.panel_fydh,
            //     x: me.nodes.panel_fydh.width / 2,
            //     y: me.nodes.panel_fydh.height / 2,
            //     repeat: false,
            //     autoRemove: true,
            //     onend: function () {
            //
            //     }
            // });
        },
        getCurType: function () {
            var me = this;
            return me._curType;
        },
        _glyph: function () {

            return (P.gud.ctime + 13 * 24 * 3600) - X.getTodayZeroTime() < 24 * 3600 || P.gud.isglyph;
        },
        bindUI: function () {
            var me = this;

            // 关闭
            // me.ui.nodes.btn_guanbi.click(function(sender,type){
            //     me.remove();
            // });
            var arr = [];
            var btns = G.class.menu.get('beibao');
            for (var i = 0; i < 5; i ++) {
                var btn = me.nodes["page_" + (i + 1)];
                if (btn && btns[i]) {
                    btn.show();
                    btn.children[0].setString(btns[i].title);
                    if(btns[i].checkLv) {
                        if(P.gud.lv < G.class.opencond.getLvById(btns[i].checkLv)) {
                            btn.checkLv = true;
                            btn.show = X.STR(btns[i].show, G.class.opencond.getLvById(btns[i].checkLv));
                        }
                    }else if(btns[i].checkIsOpenId){
                        if (!X.checkIsOpen(btns[i].checkIsOpenId)){
                            btn.hide();
                        }
                    }
                    btn.data = btns[i];
                    arr.push(btn);
                } else {
                    btn.hide();
                }
            }
            me.nodes.page_4.setVisible(me._glyph());
            X.radio(arr, function (sender) {
                if(sender.disable){
                    G.tip_NB.show(sender.show);
                    return;
                }
                me.changeType(sender);
            }, {
                callback1: function (sender) {
                    sender.children[0].setTextColor(cc.color("#ffffff"));
                    X.enableOutline(sender.children[0], "#001e5b", 2);
                },
                callback2: function (sender) {
                    sender.children[0].setTextColor(cc.color("#af9e89"));
                    X.enableOutline(sender.children[0], "#592e1c", 2);
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.nodes.tip_title.setBackGroundImage(X.getTitleImg('bb'), 1);
            me.bindUI();
            me.ui.finds("panel_tip").setTouchEnabled(false);
            me.ui.finds("bg_tip_1").zIndex = -2;
        },
        onShow: function () {
            var me = this;
            me.pageArr = [];
            if(G.tiShenIng){
                me.ui.finds('panel_tip').hide();
                me.ui.finds('bg_tip_1').loadTexture('img/main2/bg_wupin.png');
            }

            me.showToper();
            var type;
            if (me.data() && me.data().tztype) {
                type = me.data().tztype;
            } else {
                type = '1';
            }
            me.nodes["page_" + type].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.checkRedPoint();
            if (cc.isNode(G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint"))) {
                G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint").hide();
            }
            G.view.mainMenu.set_fhzc(0);
            G.view.mainMenu.checkRedPoint();
            me.ui.setTimeout(function () {
                G.guidevent.emit('beibaoShowOver');
            }, 500)
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');
            if (cc.isNode(G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint"))) {
                G.view.mainMenu.nodes.btn_beibao.getChildByName("redPoint").show();
            }

            if (!X.cacheByUid("showToDayUseItemRedPoint")) {
                X.cacheByUid("showToDayUseItemRedPoint", 1);
                G.hongdian.checkUseItem();
            }
        },
        checkRedPoint: function () {
            var me = this;

            if (G.hongdian.checkUseItem()) {
                G.setNewIcoImg(me.nodes.page_2);
                me.nodes.page_2.getChildByName("redPoint").setPosition(80, 70);
            } else G.removeNewIco(me.nodes.page_2);

            if (G.hongdian.checkSuiPian()) {
                G.setNewIcoImg(me.nodes.page_3);
                me.nodes.page_3.getChildByName("redPoint").setPosition(80, 70);
            } else G.removeNewIco(me.nodes.page_3);
        }
    });
    G.frame[ID] = new fun('ui_tip5.json', ID);
})();