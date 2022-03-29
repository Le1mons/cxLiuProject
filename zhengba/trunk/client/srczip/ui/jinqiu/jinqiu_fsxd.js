/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_fsxd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            if(G.time < G.DATA.asyncBtnsData.midautumn2.etime){
                X.timeout(me.nodes.txt_sj2, G.time + X.getOpenTimeToNight(G.time), function () {
                    me.setContents();
                });
            }else{
                G.tip_NB.show(L("HDJS"));
            }
            var data = X.keysOfObject(G.gc.midautumn2.task);
            var _a = [];
            var _b = [];
            var _c = [];
            for(var i = 0 ;i < data.length ; i++){
                if(X.inArray(G.DATA.jinqiu.myinfo.task.rec,data[i])){
                    _a.push(data[i]);
                }else if(G.DATA.jinqiu.myinfo.task.data[data[i]] >= G.gc.midautumn2.task[data[i]].pval){
                    _b.push(data[i]);
                }else{
                    _c.push(data[i]);
                }
            }
            var data = _b.concat(_c);
            data = data.concat(_a);
            if(!me.table){
                var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list,1, function (ui, data) {
                    me.setItem(ui,data);
                },null,null,10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;


        },
        setItem: function (ui,data) {
            var me = this;
            var conf = G.gc.midautumn2.task[data];
            var task = me.DATA.myinfo.task;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.panel_wp.setTouchEnabled(false);
            X.alignItems(ui.nodes.panel_wp,conf.prize,'left',{
                touch:true,
                scale:0.8,
            });
            var str = conf.desc + '(' + (task.data[data] || 0) + '/' +  conf.pval +')';
            var rh = X.setRichText({
                parent:ui.nodes.txt_rwtj,
                str:str,
                color:"#804326",
            });
            rh.setPosition(0,0);

            //按钮
            

            ui.nodes.btn_qw.conf=conf;
            ui.nodes.btn_ks.data=data;
            if(X.inArray(task.rec,data)){
                //领了
                ui.nodes.btn_qw.hide();
                ui.nodes.btn_ks.show();
                ui.nodes.txt_ks.setString(L('YLQ'));
                ui.nodes.txt_ks.setTextColor(cc.color("#6c6c6c"));
                ui.nodes.btn_ks.setBtnState(false);
            }else if(task.data[data] >= conf.pval){
                //完成
                ui.nodes.btn_ks.setBtnState(true);
                ui.nodes.txt_ks.setTextColor(cc.color("#2f5719"));
                ui.nodes.btn_qw.hide();
                ui.nodes.btn_ks.show();
                ui.nodes.txt_ks.setString(L('LQ'));
                ui.nodes.btn_ks.touch(function (sender,type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        me.ajax('midautumn2_receive',[sender.data],function (str,d) {
                            if(d.s == 1){
                                G.frame.jiangli.data({
                                    prize:d.d.prize
                                }).show();
                                G.DATA.jinqiu.myinfo=d.d.myinfo;
                                me.DATA.myinfo = d.d.myinfo;
                                me.setContents();
                            }
                        })
                    }
                })
                
            }else{
                //未完成
                ui.nodes.btn_qw.show();
                ui.nodes.btn_ks.hide();
                ui.nodes.btn_qw.touch(function (sender,type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        X.tiaozhuan(sender.conf.tiaozhuan);
                        me.remove();
                    }
                })
            }
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.DAO.jinqiu.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
        },
        onAniShow: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_fengshouxingdong.json', ID);
})();