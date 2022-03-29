/**
 * Created by llx on 2018/11/26.
 */

(function() {
    //聊天框
    G.class.liaotiankuang = X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.liaotiankuang = me;
            me._type = type;
            me._super('setting_liaotiankuang.json');
        },
        initUi: function () {
            var me = this;
        },
        onOpen: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;
            me.flagId = P.gud.chatborder
            me.getData(function(){
                me.setContents();
            });
            cc.enableScrollBar(me.nodes.scrollview_ltk);
        },

        setContents: function(){
            var me= this;
            var scrollview = me.nodes.scrollview_ltk;
            var chatborder = G.class.zaoxing.getChat()
            var data=[];
            for(var i in chatborder){
                data[i] = chatborder[i];
                data[i].rank = i;
            }
            data.sort(function (a,b){
                if(a.rank != b.rank){
                    return a.rank < b.rank ?-1 : 1;
                }
            });
            var table = me.table = new X.TableView(scrollview, me.nodes.list_ltk,1,
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
            ui.nodes.btn_qwhq.hide();
            ui.nodes.img_txgoudi.hide();

            ui.nodes.btn_qwhq.click(function () {
                X.tiaozhuan(data.tiaozhuan)
            });

            if(data.rank == 1) {
                ui.nodes.img_txgoudi.show();
            } else if(data.rank == 2) {
                if(P.gud.vip >= 11) {
                    ui.nodes.img_txgoudi.show();
                } else {
                    ui.nodes.btn_qwhq.show();
                }
            } else {
                if(X.inArray(me.DATA.v, data.rank)) {
                    ui.nodes.img_txgoudi.show();
                } else {
                    ui.nodes.btn_qwhq.show();
                }
            }

            if(!data.tiaozhuan) {
                ui.nodes.btn_qwhq.hide();
            }


            X.render({
                img_ltk:function (node) {

                    node.loadTexture('img/public/chat_0'+ data.rank + '.png', 1)
                },
                txt_ltkwz1:data.name,
                txt_ltkwz2:data.intr,
                img_txgou:function(node) {
                    if(me.flagId==data.rank){
                        node.show();
                        me.oldui=ui;
                    }else{
                        node.hide();
                    }
                },
                txt_yj: function (node) {
                    if(data.rank == 1 || data.rank == 2) {
                        node.setString(L("YJ"));
                    } else {
                        if(!X.inArray(me.DATA.v, data.rank)) {
                            node.setString(X.moment(data.ptime, {
                                d: "{1}天",
                                h: "{1}小时",
                                mm: "{1}分钟",
                                j: "1分以内"
                            }));
                        } else {
                            node.setString(X.moment(me.DATA.time[data.rank] - G.time));
                        }
                    }
                }

            }, ui.nodes);
            if(data.rank==1){
                ui.nodes.txt_ltkwz1.setTextColor(cc.color("#c9721a"));
                ui.nodes.txt_ltkwz2.setTextColor(cc.color("#804326"));
            }else if(data.rank== 4){
                ui.nodes.txt_ltkwz1.setTextColor(cc.color("#ff2e1d"));
                ui.nodes.txt_ltkwz2.setTextColor(cc.color("#f5ff37"));
            } else {
                ui.nodes.txt_ltkwz1.setTextColor(cc.color("#f5ff37"));
                ui.nodes.txt_ltkwz2.setTextColor(cc.color("#f5ff37"));
            }
            ui.nodes.img_txgoudi.setTouchEnabled(true);
            ui.nodes.img_txgoudi.touch(function (sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data == me.flagId){
                        return;
                    }
                    G.ajax.send('user_changeborder',['chatborder', data.rank],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
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
            G.ajax.send('user_getborder',['chat'],function(d){
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