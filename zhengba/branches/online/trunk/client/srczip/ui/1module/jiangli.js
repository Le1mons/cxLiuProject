/**
 * Created by admin on 2018/1/6.
 */
(function () {
    //奖励
    var ID = 'jiangli';
    var fun = X.bUi.extend({
        extConf:{
            maxnum:5
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            if(me.data().sd) me.ui.finds("wz_huodewupin_hdwp").loadTexture("img/public/wz_sdjl.png", 1);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_qr.click(function () {
                me.remove();
            });
            //新手指导会调用这个按钮的逻辑，按钮虽然隐藏了，但事件不能屏蔽
            me.nodes.btn_qr2.click(function () {
                me.remove();
            });
            me.ui.nodes.mask.click(function () {
                if(me.isTouch) me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.isTouch = false;
            me.nodes.btn_qr2.zIndex = 999;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            X.audio.playEffect("sound/lingqujiangli.mp3");
            me.aniItem = [];
            me.DATA = me.data();
            me.nodes.btn_qr.hide();
            me.nodes.btn_zzyc.hide();
            me.nodes.btn_qr2.hide();
            me.nodes.text_btn.setString(L("QR"));
            me.ui.setTimeout(function () {
                me.setContents();
                me.checkWordTree();
                G.guidevent.emit('jiangliShowOver');
            }, 200);
            me.action.playWithCallback("in", false, function () {
                me.isTouch = true;
                me.action.play("wait", true);
            });

        },
        checkWordTree: function() {
            var me = this;

            if(me.data().tree) {
                me.nodes.btn_qr.show();
                me.nodes.btn_zzyc.show();
                me.nodes.text_2.setString(1);
                me.nodes.img_zs.loadTexture(G.class.getItemIco("2011"), 1);
                me.ui.finds("txt_sx").setString(L("ZH"));
                me.nodes.btn_zzyc.click(function () {
                    me.remove();
                    G.frame.worldtree.tree.noAni = true;
                    G.frame.worldtree.tree.nodes.btn_gs.triggerTouch(ccui.Widget.TOUCH_ENDED);
                })
            }
        },
		onAniShow: function () {
            var me = this;
		},
        onRemove: function () {
            var me = this;
            me.emit("hide");
			G.guidevent.emit('jiangliRemoveOver');
        },
        setContents: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview_ico);
            if(me.DATA && me.DATA.prize){
                //X.lengthChangeByPanel(me.DATA.prize, me.nodes.panel_ico, me.nodes.listview_ico3);
                var prize = me.DATA.prize;
                if(prize.length <= 5){
                    X.alignCenter(me.nodes.panle_tb2, prize, {
                        touch: true,
                        mapItem: function (item) {
                            if(me.DATA.isAni) {
                                item.hide();
                                me.aniItem.push(item);
                            }
                        }
                    })
                }else{
                    me.nodes.panle_tb2.hide();
                    me.nodes.panel_ico.removeAllChildren();
                    me.nodes.panel_tb.hide();
                    var arr = me.formatData(me.DATA.prize);
                    for(var i = 0; i < arr.length; i ++){
                        var list = me.nodes.panel_tb.clone();
                        list.setAnchorPoint(0.5, 0.5);
                        X.autoInitUI(list);

                        for(var j = 0; j < arr[i].length; j ++){
                            var item = G.class.sitem(arr[i][j]);
                            var panel = list.nodes["panel_" + (j + 1)];
                            if(me.DATA.isAni) {
                                item.hide();
                                me.aniItem.push(item);
                            }
                            me.icon = item;
                            panel.addChild(item);
                            item.setPosition(panel.width / 2, arr.length > 2 ? 70 : panel.height / 2);
                            G.frame.iteminfo.showItemInfo(item);
                        }
                        list.show();
                        list.setAnchorPoint(0.5, 0.5);
                        me.nodes.listview_ico.pushBackCustomItem(list);
                    }
                    me.nodes.listview_ico.jumpToTop();
                }
            }
            if(me.DATA.isAni) {
                me.playAni();
            }
        },
        playAni: function() {
            var me = this;

            for (var i = 0; i < me.aniItem.length; i ++) {
                me.aniItem[i].fuse(me.aniItem[i]);
            }
        },
        formatData: function (data) {
            var arr = [];
            var p = [];
            for(var i = 0; i < data.length; i ++){
                p.push(data[i]);
                if((i + 1) % 5 == 0){
                    arr.push(p);
                    p = [];
                }
            }
            if(data.length % 5 !== 0){
                var a = [];
                for(var i = data.length - data.length % 5; i < data.length; i ++){
                    a.push(data[i]);
                }
                arr.push(a);
            }
            return arr;
        }
    });

    G.frame[ID] = new fun('ui_hdwp2.json', ID);
})();
