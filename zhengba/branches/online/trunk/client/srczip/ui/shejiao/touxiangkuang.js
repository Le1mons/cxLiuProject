/**
 * Created by llx on 2018/11/26.
 */

(function() {
    //头像框
    G.class.touxiangkuang= X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.touxiangkuang = me;
            me._type = type;
            me._super('setting_touxiangkuang.json');
        },
        initUi: function () {
            var me = this;
        },
        onOpen: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;
            me.flagId = P.gud.headborder;
            cc.enableScrollBar(me.nodes.scrollview_txk);
           // me.setContents();
            me.getData(function(){
                me.setContents();
            });
        },


        setContents: function(){
            var me= this;
            var scrollview = me.nodes.scrollview_txk;
            var headborder = G.class.zaoxing.getHeadBorder();
            var data=[];
            for(var i in headborder){

                 data[i] = headborder[i];
                 data[i].rank = i;
            }
            data.sort(function (a,b){
               if(a.rank != b.rank){
                   return a.rank < b.rank ?-1 : 1;
               }
            });
            var table = me.table = new X.TableView(scrollview, me.nodes.list_txk,1,
            function (ui, data) {
                me.setItem (ui, data);
            },null, null,10 ,8);
            table.setData(data);
            table.reloadDataWithScroll(true);

        },
        setHeadData:function(data, allData){
            for(var i in data) {
                if(!X.inArray(allData, data[i])) {
                    allData.push(data[i]);
                }
            }
            return allData;
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            if(data.cond.length == 2){
                ui.nodes.img_txgoudi.show();
                if(data.rank == 2) {
                    if (P.gud.vip >= 12) {
                        ui.nodes.img_txgoudi.show();
                    } else {
                        ui.nodes.img_txgoudi.hide();
                        ui.nodes.btn_qwhq.show();
                        ui.nodes.txt_yxq.hide();
                        ui.nodes.txt_yj.hide();
                        ui.nodes.btn_qwhq.click(function () {
                            X.tiaozhuan(37);
                        });
                    }
                }
            }else{
                if(data.rank == 3){
                    if(X.inArray(me.DATA.v, data.rank)) {
                        ui.nodes.img_txgoudi.show();
                    } else {
                        ui.nodes.img_txgoudi.hide();
                        ui.nodes.btn_qwhq.show();
                        ui.nodes.txt_yxq.hide();
                        ui.nodes.txt_yj.hide();
                        ui.nodes.btn_qwhq.click(function(){
                            X.tiaozhuan(10);
                        });
                    }
                }
            }
            X.render({
                panel_txk:function (node) {
                    node.removeBackGroundImage();
                    node.setBackGroundImage('img/public/head_0'+ data.rank + '.png', 1)
                },
                panel_tx:function(node) {
                    node.removeAllChildren();
                    var head = G.class.shead(P.gud, null, null, true);
                    head.setAnchorPoint(0.5, 0.5);
                    head.setPosition(node.width / 2 - 2, node.height / 2);
                    head.kuang.hide();
                    head.background.hide();
                    head.lv.hide();
                    node.addChild(head);

                },
                txt_txkwz1:data.name,
                txt_txkwz2:data.intr,
                img_txgou:function(node) {
                    if(me.flagId==data.rank){
                        node.show();
                        me.oldui=ui;
                    }else{
                        node.hide();
                    }
                },
                txt_yj: function (node) {
                    if(me.DATA.time[data.rank]) {
                        node.setString(X.moment(me.DATA.time[data.rank] - G.time));
                    } else {
                        node.setString(L("YJ"));
                    }
                }

            }, ui.nodes);
            if(data.rank==1){
                ui.nodes.txt_txkwz1.setTextColor(cc.color("#c9721a"));
            }else if(data.rank==2){
                ui.nodes.txt_txkwz1.setTextColor(cc.color("#fb5e1e"));
            }else if(data.rank==3){
                ui.nodes.txt_txkwz1.setTextColor(cc.color("#fb192d"));
            }
            ui.nodes.img_txgoudi.setTouchEnabled(true);
            ui.nodes.img_txgoudi.touch(function (sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data == me.flagId){
                        return;
                    }
                    G.ajax.send('user_changeborder',['headborder', data.rank],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                            G.view.toper.updateHead();
                            me.oldui.nodes.img_txgou.hide();
                            ui.nodes.img_txgou.show();
                            me.oldui=ui;
                            G.view.toper.updateHead();

                        }
                    },true);
                }
            })
        },
        getData: function(callback){
            var me= this;
            G.ajax.send('user_getborder',['head'],function(d){
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        onRemove: function() {
            var me = this;

        }

    });
})();