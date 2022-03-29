/**
 * Created by  on 2019//.
 */
(function () {
    //卡集成展示
    G.class.huodong_ka = X.bView.extend({
        bgimg : ['img_card_czyk.png','img_card_zzyk.png'],
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_hhtq.json");
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_gm.click(function () {
                G.event.once('paysuccess', function() {
                    G.frame.jiangli.data({
                        prize:G.gc.lifetimecard.buyprize
                    }).show();
                    me.getData(function () {
                        me.setAllLife();
                        me.setKa();
                        G.hongdian.getData('yueka',1,function () {
                            G.frame.huodong.checkRedPoint();
                        })
                    });
                });
                G.event.emit('doSDKPay', {
                    pid:G.gc.lifetimecard.proid,
                    logicProid: G.gc.lifetimecard.proid,
                    money: G.gc.lifetimecard.needmoney * 100,
                });
            });
            me.nodes.btn_lq.click(function () {
                me.ajax('lifetimecard_receive',[],function (str,data) {
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        me.getData(function () {
                            me.setAllLife();
                            G.hongdian.getData('yueka',1,function () {
                                G.frame.huodong.checkRedPoint();
                            })
                        });
                    }
                })
            });
        },
        onShow: function () {
            var me = this;
            me.getData(function () {
                me.setContents();
                me.setAllLife();
            })
        },
        setContents:function(){
            var me = this;
            me.setKa();
        },
        //终身卡
        setAllLife:function(){
            var me = this;
            var buyprize = G.gc.lifetimecard.buyprize;
            var dayprize = G.gc.lifetimecard.prize;
            me.nodes.btn_gm.setVisible(!P.gud.lifetimecard);
            me.nodes.btn_lq.setVisible(P.gud.lifetimecard);
            me.nodes.panel_1.setVisible(!P.gud.lifetimecard);
            me.nodes.panel_2.setVisible(P.gud.lifetimecard);
            if(P.gud.lifetimecard){//激活了
                //每日获得
                X.alignItems(me.nodes.panel_wp3,dayprize,'center',{
                    mapItem:function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
                //今日是否领取了
                G.removeNewIco(me.nodes.btn_lq);
                if(!me.DATA.lifetimecard){//可以领
                    me.nodes.img_ylq2.hide();
                    me.nodes.btn_lq.show();
                    me.nodes.btn_lq.setBtnState(true);
                    me.nodes.txt_lq.setString(L('LQ'));
                    me.nodes.txt_lq.setTextColor(cc.color(G.gc.COLOR.n13));
                    G.setNewIcoImg(me.nodes.btn_lq,.9);
                }else {//已领取
                    me.nodes.img_ylq2.show();
                    me.nodes.btn_lq.hide();
                }
            }else {//未激活
                //购买获得
                X.alignItems(me.nodes.panel_wp1, buyprize, 'center', {
                    mapItem: function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
                //每日获得
                X.alignItems(me.nodes.panel_wp2, dayprize, 'center', {
                    mapItem: function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
            }
            me.nodes.txt_gm.setString(G.gc.lifetimecard.needmoney + L("YUAN"));

        },
        setKa:function(){
            var me = this;
            var obj = {};
            for(var k in me.DATA){
                if(k == 'da' || k == 'xiao'){
                    obj[k] =  me.DATA[k];
                }
            }
            var arr = X.keysOfObject(obj);
            for(var i = 0; i < arr.length; i++){
                var data = me.DATA[arr[i]];
                var list = me.nodes.list_card.clone();
                X.autoInitUI(list);
                list.show();
                list.setPosition(0,0);
                list.setAnchorPoint(0,0);
                me.setKaItem(list,data,arr[i],i);
                me.nodes['panel_card' + (i+1)].removeAllChildren();
                me.nodes['panel_card' + (i+1)].addChild(list);
            }
        },
        setKaItem:function(ui,data,type,index){
            var me = this;
            var conf = G.class.getConf("xiaoyueka")[type];
            ui.finds('Image_47').loadTexture('img/event/' + me.bgimg[index],1);

            if(data.rmbmoney / 100 >= conf.maxmoney / 100){//已激活
                ui.finds('panel_1').hide();
                ui.finds('panel_2').show();
                var rh = new X.bRichText({
                    size: 18,
                    maxWidth: ui.nodes.txt_info2.width,
                    lineHeight: 34,
                    family: G.defaultFNT,
                    color: "#ececd3",
                    eachText: function (node) {
                        node.enableOutline && X.enableOutline(node, "#000000", 2);
                    }
                });

                if(data.nt + 30 * 24 * 3600 - G.time > 24 * 3600) {
                    var str = X.STR(L("KA_" + type), parseInt(((data.nt + 30 * 24 * 3600) - G.time) / (24 * 3600)));
                    rh.text(str);
                } else {
                    var txt = new ccui.Text("", G.defaultFNT, 22);
                    txt.setTextColor(cc.color("#1c9700"));
                    X.enableOutline(txt, "#000000", 2);
                    X.timeout(txt, data.nt + 30 * 24 * 3600, function () {
                        me.getData(function () {
                            me.setContents();
                        });
                    });
                    var str = L("KAA_" + type) + "<font node=1></font>";
                    rh.text(str, [txt]);
                }

                rh.setPosition(ui.nodes.txt_info2.width / 2 - rh.trueWidth() / 2, ui.nodes.txt_info2.height / 2);
                ui.nodes.txt_info1.removeAllChildren();
                ui.nodes.txt_info2.removeAllChildren();
                ui.nodes.txt_info2.addChild(rh);
                if(!data.act){
                    G.removeNewIco(ui.nodes.btn_receive);
                }else{
                    G.setNewIcoImg(ui.nodes.btn_receive, .9);
                }
                ui.nodes.btn_receive.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                if(data.act == 0){//已领取
                    ui.nodes.img_ylq.show();
                    ui.nodes.btn_receive.hide();
                }else {
                    ui.nodes.btn_receive.setTitleText(L('LQ'));
                    ui.nodes.btn_receive.setTitleColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_receive.setTouchEnabled(true);
                    ui.nodes.btn_receive.setBright(true);
                    ui.nodes.img_ylq.hide();
                    ui.nodes.btn_receive.show();
                }
                ui.nodes.btn_receive.type = type;
                ui.nodes.btn_receive.click(function (sender, type) {
                    G.ajax.send("yueka_getprize", [sender.type], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.frame.jiangli.data({
                                prize: conf.prize
                            }).show();
                            me.getData(function () {
                                me.setKa();
                                G.hongdian.getData("yueka", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            });
                            G.frame.huodong.updateTop();

                        }
                    }, true);
                })
            }else {//未激活
                ui.finds('panel_1').show();
                ui.finds('panel_2').hide();
                ui.nodes.img_jdt.setPercent(data.rmbmoney / conf.maxmoney * 100);
                ui.nodes.txt_jdt.setString(X.STR(L("DQCZ"), data.rmbmoney / 100, conf.maxmoney / 100));

                var str = X.STR(L("LJCZ"), conf.maxmoney / 100);
                var rh = new X.bRichText({
                    size: 18,
                    maxWidth: ui.nodes.txt_info1.width,
                    lineHeight: 34,
                    family: G.defaultFNT,
                    color: "#ececd3",
                    eachText: function (node) {
                        node.enableOutline && X.enableOutline(node, "#000000", 2);
                    }
                });
                rh.text(str);
                rh.setPosition(ui.nodes.txt_info1.width / 2 - rh.trueWidth() / 2, ui.nodes.txt_info1.height / 2);
                ui.nodes.txt_info1.removeAllChildren();
                ui.nodes.txt_info2.removeAllChildren();
                ui.nodes.txt_info1.addChild(rh);

                ui.nodes.btn_activate.click(function (sender, type) {
                    G.frame.chongzhi.show();
                    G.frame.chongzhi.once("hide", function () {
                        me.getData(function () {
                            me.setKa();
                            G.hongdian.getData('yueka',1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        });
                        G.frame.huodong.updateTop();
                    });
                })
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            me.ajax('yueka_open',[],function (str,data) {
                if(data.s == 1){
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        }
    });
})();