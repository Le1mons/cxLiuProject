/**
 * Created by  on 2019//.
 */
(function () {
    //财运亨通卡-奖励
    var ID = 'cyhtk_prize';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data().prize;
            me.needmoney = me.data().needmoney;
            me.proid = me.data().proid;
            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn.click(function () {
                G.event.once('paysuccess', function(txt) {
                    try {
                        if(G.frame.huodong.isShow){
                            G.frame.huodong._panels.getData(function () {
                                G.hongdian.getData("cyht", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                                G.frame.huodong._panels.setContents(true);
                            });
                        }else {
                            G.frame.zhounianqing_main._panels.getData(function () {
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                                G.frame.zhounianqing_main._panels.setContents(true);
                            });
                        }

                        me.remove();
                    } catch (e) {}
                });
                G.event.emit('doSDKPay', {
                    pid: me.proid,
                    logicProid: me.proid,
                    money: me.needmoney * 100,
                });
            }, 3000);
        },
        setContents:function(){
            var me = this;
            me.nodes.txt_qd.setString(me.needmoney + L("YUAN"));
            var prizearr = [];
            for(var k in me.DATA){
               prizearr.push(me.DATA[k].p);
               prizearr.push(me.DATA[k].tqp);
            }
            var prizeobj = {};
            for(var k in me.DATA){
                for(var i = 0; i < me.DATA[k].p.length; i++){
                    if(!prizeobj[me.DATA[k].p[i].t]){
                        prizeobj[me.DATA[k].p[i].t] = {n:me.DATA[k].p[i].n,a:me.DATA[k].p[i].a};
                    }else {
                        prizeobj[me.DATA[k].p[i].t] = {n:(prizeobj[me.DATA[k].p[i].t].n + me.DATA[k].p[i].n),a:me.DATA[k].p[i].a};
                    }
                }
                for(var j = 0; j < me.DATA[k].tqp.length; j++){
                    if(!prizeobj[me.DATA[k].tqp[j].t]){
                        prizeobj[me.DATA[k].tqp[j].t] = {n:me.DATA[k].tqp[j].n,a:me.DATA[k].tqp[j].a};
                    }else {
                        prizeobj[me.DATA[k].tqp[j].t] = {n:(prizeobj[me.DATA[k].tqp[j].t].n + me.DATA[k].tqp[j].n),a:me.DATA[k].tqp[j].a};
                    }
                }
            }
            var prizearr = [];
            for(var k in prizeobj){
                var arr = {a:prizeobj[k].a, t:k, n:prizeobj[k].n};
                prizearr.push(arr);
            }

            if(prizearr.length > 5){
                me.nodes.panel_wp.hide();
                me.nodes.scrollview.show();
                var layout = new ccui.Layout();
                me.ui.addChild(layout);
                layout.setContentSize(100,100);
                var table = new X.TableView(me.nodes.scrollview, layout, 5, function (ui, data){
                    me.setItem(ui,data);
                });
                table.setData(prizearr);
                table.reloadDataWithScroll(true);
            }else {
                me.nodes.panel_wp.removeAllChildren();
                me.nodes.panel_wp.show();
                me.nodes.scrollview.hide();
                X.alignItems(me.nodes.panel_wp,prizearr,"center", {
                    touch:true,
                })
            }
        },
        setItem:function(ui,data){
            var me = this;
            ui.removeAllChildren();
            var item = G.class.sitem(data);
            G.frame.iteminfo.showItemInfo(item);
            item.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(item);
            item.setScale(.9);
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('event_top_jhcyk.json', ID);
})();