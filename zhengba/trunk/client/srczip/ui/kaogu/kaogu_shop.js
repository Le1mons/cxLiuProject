/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-地精商人
    G.class.kaogu_shop = X.bView.extend({
        namecolor:{
            "1":"#7aca0c",
            "2":"#0cb6ca",
            "3":"#d67bf8",
        },
        outline:{
            "1":"#1a3c00",
            "2":"#00305c",
            "3":"#450085",
        },
        boxani:{
            "1":"ani_kaogu_xiangzi1",
            "2":"ani_kaogu_xiangzi3",
            "3":"ani_kaogu_xiangzi2",
        },
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("kaogu_djsr.json", null, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.list_bq.hide();
            me.nodes.panel_kp.setTouchEnabled(false);
            me.nodes.btn_bz.click(function(){
                G.frame.help.data({
                    intr:L("TS66"),
                }).show()
            })
        },
        onOpen:function(){
            var me = this;
            me.initBtn();
            me.bindBtn();
            me.nodes.listview.children[0].nodes.btn_bq.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.showNum();
        },
        showNum:function(){
            var me = this;
            //金银考古币
            me.nodes.txt_bq_wz1.setString(G.class.getOwnNum("2069","item"));
            me.nodes.txt_bq_wz2.setString(G.class.getOwnNum("2070","item"));
        },
        onShow:function(){
            var me = this;
        },
        initBtn:function(){
            var me = this;
            me.nodes.listview.removeAllChildren();
            for(var k in G.gc.yjkg.store){
                var btn = me.nodes.list_bq.clone();
                btn.show();
                X.autoInitUI(btn);
                btn.nodes.btn_bq.id = k;
                if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,btn.nodes.btn_bq.id)){
                    btn.nodes.btn_bq.loadTextureNormal('img/kaogu/btn_djsr_bq1.png',1);
                    btn.nodes.btn_bq.loadTextureDisabled('img/kaogu/btn_djsr_bq2.png',1);
                    btn.nodes.btn_bq.loadTexturePressed('img/kaogu/btn_djsr_bq2.png',1);
                    btn.nodes.txt_bq_wz.setTextColor(cc.color("#f6ce3f"));
                }else {
                    btn.nodes.btn_bq.loadTextureNormal('img/kaogu/btn_djsr_bq3.png',1);
                    btn.nodes.btn_bq.loadTextureDisabled('img/kaogu/btn_djsr_bq3.png',1);
                    btn.nodes.btn_bq.loadTexturePressed('img/kaogu/btn_djsr_bq3.png',1);
                    btn.nodes.txt_bq_wz.setTextColor(cc.color("#8c8c8b"));
                }
                btn.nodes.txt_bq_wz.setString(G.gc.yjkg.map[k].name);
                me.nodes.listview.pushBackCustomItem(btn);
            }
            for(var i = 0; i < me.nodes.listview.children.length; i++){
                var btn = me.nodes.listview.children[i].nodes.btn_bq;
                btn.touch(function(sender,type){
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,sender.id)){//是否解锁了
                            for(var j = 0; j < me.nodes.listview.children.length; j++){
                                if(me.nodes.listview.children[j].nodes.btn_bq.id == sender.id){
                                    if(me.shopid != sender.id){
                                        me.shopid = sender.id;
                                        me.nodes.listview.children[j].nodes.btn_bq.setBright(true);
                                        me.nodes.listview.children[j].nodes.txt_bq_wz.setTextColor(cc.color("#f6ce3f"));
                                        me.showShop(me.shopid);
                                    }
                                }else if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,me.nodes.listview.children[j].nodes.btn_bq.id)){
                                    me.nodes.listview.children[j].nodes.btn_bq.setBright(false);
                                    me.nodes.listview.children[j].nodes.txt_bq_wz.setTextColor(cc.color("#af9731"));
                                }
                            }
                        }else {
                            G.tip_NB.show(L("KAOGU33"));
                        }
                    }

                })
            }
        },
        showShop:function(id){
            var me = this;
            me.conf = G.gc.yjkg.store[id];
            var data = X.keysOfObject(me.conf);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,id){
            var me = this;
            var data = me.conf[id];
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.list_wp1.removeBackGroundImage();
            ui.nodes.list_wp1.setBackGroundImage('img/kaogu/' + data.icon + ".png",1);//宝箱图片
            ui.nodes.txt_name.setString(data.name);
            ui.nodes.txt_name.setTextColor(cc.color("#ff9a38"));
            //X.enableOutline(ui.nodes.txt_name,"#3b1f00");
            ui.nodes.txt_ms.setString(X.STR(data.intr,data.exp, G.gc.yjkg.map[me.shopid].name));
            ui.nodes.txt_ms.setTextColor(cc.color("#b15d12"));
            //放大镜,奖励预览
            ui.nodes.panel_box.data = data;
            ui.nodes.list_wp1.data = data;
            ui.nodes.btn_fdj.setTouchEnabled(false);
            ui.nodes.panel_box.setTouchEnabled(true);
            ui.nodes.panel_box.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    var prize = G.gc.diaoluo[data.dlz];
                    G.frame.kaogu_shop_yl.data({
                        prize:prize
                    }).show();
                }
            });
            //如果这个是免费商品并且今天的免费次数没用
            ui.nodes.ico_w_token.removeBackGroundImage();
            ui.nodes.txt_w_ico.setString("");
            if(G.frame.kaogu_map.DATA.free && data.free == 1){
                ui.nodes.txet_gmtp.setString(L("KAOGU34"));
                ui.nodes.btn_gmtp.free = true;
            }else {
                ui.nodes.btn_gmtp.free = false;
                ui.nodes.txet_gmtp.setString(L("BTN_GOUMAI"));
                ui.nodes.ico_w_token.setBackGroundImage(G.class.getItemIco(data.need[0].t),1);
                ui.nodes.txt_w_ico.setString(data.need[0].n);
            }
            ui.nodes.btn_gmtp.id = id;
            ui.nodes.btn_gmtp.need = data.need[0];
            ui.nodes.btn_gmtp.data = data;
            ui.nodes.btn_gmtp.shopid = me.shopid;
            ui.nodes.btn_gmtp.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax('yjkg_buy',[me.shopid,sender.id],function(str,data){
                        if(data.s == 1){
                            if(sender.free){
                                G.class.ani.show({
                                    json:me.boxani[sender.id],
                                    addTo:me.nodes.panel_dh,
                                    repeat:false,
                                    auotRemove:true,
                                    onend:function () {
                                        G.frame.jiangli.data({
                                            prize:data.d.prize,
                                        }).show();
                                    }
                                });
                                G.frame.kaogu_map.DATA.free = false;
                            }else {
                                G.class.ani.show({
                                    json:me.boxani[sender.id],
                                    addTo:me.nodes.panel_dh,
                                    repeat:false,
                                    auotRemove:true,
                                    onend:function () {
                                        G.frame.jiangli.data({
                                            prize:data.d.prize,
                                            type:"kaogu",
                                            need:sender.need,
                                            index:sender.id,
                                            shopid:sender.shopid,
                                        }).show();
                                    }
                                });
                            }
                            me.showShop(me.shopid);
                            me.refresh();
                            G.hongdian.getData('yjkg',1);
                        }
                    })
                }
            }, null, {"touchDelay":3000});
        },
        refresh:function(){
            var me = this;
            me.nodes.txt_bq_wz1.setString(G.class.getOwnNum("2069","item"));
            me.nodes.txt_bq_wz2.setString(G.class.getOwnNum("2070","item"));
            G.frame.kaogu_map.checkdjsrRedPoint();
            G.frame.kaogu_map.checkzlgRedPoint();
            if(G.frame.kaogu_display){
                G.frame.kaogu_display.setContents();
            }
        },
        onemore:function(id,need,shopid){
            var me = this;
            me.ajax('yjkg_buy',[shopid,id],function(str,data){
                if(data.s == 1){
                    G.class.ani.show({
                        json:me.boxani[id],
                        addTo:me.ui,
                        repeat:false,
                        auotRemove:true,
                        onend:function () {
                            G.frame.jiangli.data({
                                prize:data.d.prize,
                                type:"kaogu",
                                need:need,
                                index:id,
                                shopid:shopid,
                            }).once("willClose",function(){
                                me.refresh();
                            }).show();
                        }
                    });

                }
            });
        }
    });
})();
