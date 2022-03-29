/**
 * Created by llx on 2018/11/30.
 */

(function(){
    var ID='gonghui_tanhe';
    var fun = X.bUi.extend({
        ctor: function(json,id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        setContents: function() {
            var me = this;
            var scrollview = me.nodes.scrollview;
            var data = me.DATA.impeach;
            
            data.sort(function (a, b) {
               if(a.maxzhanli  != b.maxzhanli){
                   return a.maxzhanli > b.maxzhanli? -1 : 1;
               }else if (a.ghpower != b.ghpower){
                   return a.ghpoer < b.ghpower ? -1:1;
               }
            });
            for(var i=0; i<data.length ;i++){
                data[i].rank=i+1;
            }
            me.ui.finds('list_nr').setTouchEnabled(false);
            if(!me.table) {
                var table = me.table = new  X.TableView(scrollview, me.ui.finds('list_nr'),1, function (ui,data){
                    me.setItem(ui,data);
                },null,null,8,11);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            for(var i = 0; i < data.length; i ++){
                if(data[i].uid == P.gud.uid){
                    me.nodes.btn_th.setBright(false);
                    me.nodes.txt_th.setString(L("YTH"));
                    me.nodes.txt_th.setTextColor(cc.color("#6c6c6c"));
                }else{
                    me.nodes.txt_th.setString(L("CYTH"));
                }
            }
        },
        setItem: function(ui,data){
            var me =this;
            X.autoInitUI(ui);
            X.render({
                txt_name:data.name,
                txt_name2:L('GONGHUI_POWER_' + data.ghpower),
                sz_zdl:data.maxzhanli,
                ph_sz:data.rank,

            },ui.nodes);
            ui.data = data;
        },
        setBanner: function(){
            var me = this;
            X.render({
                txt_time:function(node) {
                     X.timeout(node, me.DATA.time+24* 3600 ,function(){
                         G.frame.gonghui_dating.zy.refreshPanel();
                         me.remove();
                     })
                }
            },me.nodes)
        },
        bindBIN: function(){
            var me = this;
            me.nodes.txt_th.setString(L("CYTH"));
            me.nodes.btn_th.touch(function (sender, type){
                if(type == ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('gonghui_impeach',[],function(d){
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            me.DATA.impeach.push(d.d.impeach[0]);
                            me.getData(function(){
                                me.setContents();
                            })
                        }
                    }, true);

                }
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBIN();
            me.nodes.mask.click(function(){
                me.remove();
            })
        },

        onShow: function () {
            var me = this;
            me.getData();
            me.setContents();
            me.setBanner();
        },
        checkShow: function () {
            var me  = this;

            G.ajax.send('gonghui_getimpeach',[],function(d){
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    if(d.d.impeach.length == 0 ){
                        G.frame.alert.data({
                            title: L('TS'),
                            cancelCall: null,
                            okCall: function () {
                                G.ajax.send('gonghui_impeach',[],function(d){
                                    if(!d) return;
                                    var d = JSON.parse(d);
                                    if(d.s == 1){
                                        me.DATA.impeach.push(d.d.impeach[0]);
                                        me.getData(function(){
                                            me.show();
                                            me.setContents();
                                        })
                                    }
                                }, true);

                                //setTimeout(function(){
                                //    me.show();
                                //},200)
                            },
                            richText: L('GONGHUI_TANHE')
                        }).show();
                    }else{
                        me.show();
                    }
                }
            }, true);
        },
        getData: function(callback){
            var me= this;
            G.ajax.send('gonghui_getimpeach',[],function(d){
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        onAniShow: function(){
            var me = this;
        },
        onRemove: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('gonghui_tip2_huizhangtanhe.json', ID);
})();