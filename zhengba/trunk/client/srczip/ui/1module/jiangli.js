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
            if(me.data().showTxt) me.nodes.txt_djgb.setString(me.data().showTxt);
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
                me.remove();
            });
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
                me.checkKaogu();
                me.checkZhiTouzi();
                G.guidevent.emit('jiangliShowOver');
            }, 200);
        },
        //考古商店
        checkKaogu:function(){
            var me = this;
            if(me.data().type == "kaogu"){
                me.nodes.btn_qr.show();
                me.nodes.btn_kg.show();
                me.nodes.kg_2.setString(me.data().need.n);
                me.nodes.btn_kg.finds('img_zs$').loadTexture(G.class.getItemIco(me.data().need.t), 1);
                me.nodes.btn_kg.need = me.data().need;
                me.nodes.btn_kg.index = me.data().index;
                me.nodes.btn_kg.shopid = me.data().shopid;
                me.nodes.btn_kg.click(function (sender) {
                    me.remove();
                    G.frame.kaogu_main._panels[3].onemore(sender.index,sender.need,sender.shopid);
                })
            }
        },
        checkWordTree: function() {
            var me = this;

            if(me.data().tree) {
                me.nodes.btn_qr.show();
                me.nodes.btn_zzyc.show();
                me.nodes.text_2.setString(1);
                me.nodes.btn_zzyc.finds('img_zs$').loadTexture(G.class.getItemIco("2011"), 1);
                me.ui.finds("txt_sx").setString(L("ZH"));
                me.nodes.btn_zzyc.click(function () {
                    me.remove();
                    G.frame.worldtree.tree.noAni = true;
                    G.frame.worldtree.tree.nodes.btn_gs.triggerTouch(ccui.Widget.TOUCH_ENDED);
                })
            }
        },
        checkZhiTouzi:function(){
            var me = this;
            if(me.data().type == "touzi"){
                me.nodes.txt_djgb.hide();

                me.nodes.btn_qr.show();
                me.nodes.btn_kg.show();
                me.nodes.btn_kg.finds('img_zs$').hide();
                me.nodes.kg_2.hide();
                me.ui.finds('txt_kg_sx$').setString('再来一次');
                me.nodes.btn_kg.click(function (sender) {
                    me.remove();
                    G.frame.sf_xingyuntouzi.resetGame();
                })
            }
        },
        onAniShow: function () {
            var me = this;
            me.action.play("wait", true);
        },
        onRemove: function () {
            var me = this;
            me.emit("hide");
            G.guidevent.emit('jiangliRemoveOver');
            G.event.emit("showPackage");
        },
        setContents: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview_ico);
            if(me.DATA && me.DATA.prize){
                //X.lengthChangeByPanel(me.DATA.prize, me.nodes.panel_ico, me.nodes.listview_ico3);
                var prize = me.DATA.prize;
                if(prize.length <= 5){
                    X.alignCenter(me.nodes.panle_tb2, prize, {
                        touch: !me.DATA.noclick,
                        mapItem: function (item) {
                            if(me.DATA.isAni) {
                                item.hide();
                                me.aniItem.push(item);
                            }
                            if(me.DATA.addAni){
                                me.aniItem.push(item);
                            }
                            item.setSwallowTouches(true);
                        }
                    });
                    me.nodes.listview_ico.setTouchEnabled(false);
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
                            if(me.DATA.addAni){
                                me.aniItem.push(item);
                            }
                            me.icon = item;
                            panel.addChild(item);
                            item.setPosition(panel.width / 2, arr.length > 2 ? 70 : panel.height / 2);
                            if(!me.DATA.noclick)G.frame.iteminfo.showItemInfo(item);
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
            if(me.DATA.addAni) {
                me.addAni();
            }
        },
        playAni: function() {
            var me = this;

            for (var i = 0; i < me.aniItem.length; i ++) {
                me.aniItem[i].fuse(me.aniItem[i]);
            }
        },
        addAni:function(){
            var me = this;
            for (var i = 0; i < me.aniItem.length; i ++) {
                G.class.ani.show({
                    json: "ani_wupingkuang",
                    addTo: me.aniItem[i],
                    x: 50,
                    y: 50,
                    repeat: true,
                    autoRemove: false,
                });
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
