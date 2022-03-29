/**
 * Created by  on 2019//.
 */
(function () {
    //武魂穿戴更换
    var ID = 'wuhun_change';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.herodata = me.data();
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.listview);
        },
        onShow: function () {
            var me = this;
            me.getData(function(){
                me.setContents();
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            me.nodes.listview.removeAllChildren();
            var data = me.DATA;
            if(data.length == 0) return ;
            //自己穿戴的靠前，等级高的靠前
            data.sort(function(a,b){
                var ifselfA = (a.wearer == me.herodata.tid);
                var ifselfB = (b.wearer == me.herodata.tid);
                if(ifselfA != ifselfB){
                    return ifselfA > ifselfB ? -1 : 1;
                }else {
                    return a.lv > b.lv ? -1 : 1;
                }
            });
            for(var i = 0;  i < data.length; i++){
                var list = me.nodes.list.clone();
                me.setItem(list,data[i]);
                me.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var info = G.gc.wuhun[data.id][data.lv];
            var item = G.class.wuhun(data,true);
            item.setAnchorPoint(0,0);
            ui.nodes.ico.removeAllChildren();
            ui.nodes.ico.addChild(item);
            //名字
            ui.nodes.txt_name.setString(info.name);
            ui.nodes.txt_name.setTextColor(cc.color(G.gc.COLOR[info.color]));
            //专属武将
            ui.nodes.biaoqian.show();
            ui.nodes.shuxingwz.setString(G.gc.hero[info.hero].name + L("WUHUN14"));
            //属性
            for(var i = 0; i < X.keysOfObject(info.buff).length; i++){
                var rh = X.setRichText({
                    parent:ui.nodes['shuxing_wz' + (i+1)],
                    str:L(X.keysOfObject(info.buff)[i]) + "<font color=#1c9700>" + "+" + info.buff[X.keysOfObject(info.buff)[i]] + "</font>",
                    color:"#f6ebcd",
                });
                rh.x = 0;
            }
            //是不是自己穿戴
            if(data.wearer && data.wearer == me.herodata.tid){
                ui.nodes.btn_xx.show();
                ui.nodes.btn_cd.hide();
            }else {
                ui.nodes.btn_xx.hide();
                ui.nodes.btn_cd.show();
            }
            ui.nodes.btn_xx.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.herodata.tid]));
                    me.ajax("wuhun_takeoff",[me.herodata.tid],function(str,data){
                        if(data.s == 1){
                            me.remove();
                            if(G.frame.yingxiong_xxxx.isShow){
                                G.frame.yingxiong_xxxx.showWuhun();
                                G.frame.yingxiong_xxxx.checkRedPoint();
                                G.frame.yingxiong_xxxx.updateInfo();
                            }
                        }
                    })
                }
            });
            ui.nodes.btn_cd.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.herodata.tid]));
                    me.ajax("wuhun_wear",[data.tid,me.herodata.tid],function(str,data){
                        if(data.s == 1){
                            me.remove();
                            if(G.frame.yingxiong_xxxx.isShow){
                                G.frame.yingxiong_xxxx.showWuhun();
                                G.frame.yingxiong_xxxx.checkRedPoint();
                                G.frame.yingxiong_xxxx.updateInfo();
                            }
                        }
                    })
                }
            })

        },
        getData:function(callback){
            var me = this;
            me.DATA = [];
            for(var k in G.DATA.wuhun){
                G.DATA.wuhun[k].tid = k;
                //筛选出这个武将的专属武魂中没有被同名武将穿戴的武魂
                if(!(G.DATA.wuhun[k].wearer && G.DATA.wuhun[k].wearer != me.herodata.tid)
                    && G.gc.hero[me.herodata.hid].wuhun == G.DATA.wuhun[k].id){
                    me.DATA.push(G.DATA.wuhun[k]);
                }
            }
            callback && callback();
        }
    });
    G.frame[ID] = new fun('shengwu_xz.json', ID);
})();