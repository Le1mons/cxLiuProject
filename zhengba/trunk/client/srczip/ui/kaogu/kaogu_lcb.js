/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-里程碑
    var ID = 'kaogu_lcb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.type = me.data().type;
            me.getRec = G.frame.kaogu_map.DATA.milestone[me.type];//领奖情况
            me.nodes.tip_title.setString(G.gc.yjkg.map[me.type].name + L("KAOGU22"));
            //考古最远距离
            if(G.frame.kaogu_map.DATA.farthest[me.type]){
                if(G.frame.kaogu_map.DATA.farthest[me.type] > 1000){
                    me.nodes.txt_kgjl.setString((G.frame.kaogu_map.DATA.farthest[me.type] / 1000).toFixed(1) + L("KAOGU16"));
                }else {
                    me.nodes.txt_kgjl.setString(G.frame.kaogu_map.DATA.farthest[me.type] + L("KAOGU15"));
                }
            }else {
                me.nodes.txt_kgjl.setString( 0 + L("KAOGU15"));
            }
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = G.gc.yjkg.milestone[me.type];
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data,pos) {
                    me.setItem(ui, data,pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data,index){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.txt_ddms.setString(data[0] + L("KAOGU15"));
            ui.nodes.txt_ddms.setTextColor(cc.color("#d15519"));
            ui.nodes.txt_zyjls.setTextColor(cc.color("#804326"));
            var item = G.class.sitem(data[1][0],true);
            G.frame.iteminfo.showItemInfo(item);
            item.title.hide();
            item.setAnchorPoint(0,0);
            ui.nodes.img_wp.removeAllChildren();
            ui.nodes.img_wp.addChild(item);
            //按钮状态
            if(X.inArray(me.getRec,index)){//已领取
                ui.nodes.txet_gmtp.setString(L("YLQ"));
                ui.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n15));
                ui.nodes.btn_gmtp.setBtnState(false);
            }else {
                if(G.frame.kaogu_map.DATA.farthest[me.type] >= data[0]){//可领
                    ui.nodes.txet_gmtp.setString(L("LQ"));
                    ui.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_gmtp.setBtnState(true);
                }else {//不可领
                    ui.nodes.txet_gmtp.setString(L("LQ"));
                    ui.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n15));
                    ui.nodes.btn_gmtp.setBtnState(false);
                }
            }
            ui.nodes.btn_gmtp.index = index;
            ui.nodes.btn_gmtp.click(function(sender,type){
                me.ajax('yjkg_milestone',[me.type.toString(),sender.index],function(str,data){
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        G.ajax.send('yjkg_open', [], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.kaogu_map.DATA = d.d;
                                me.getRec = G.frame.kaogu_map.DATA.milestone[me.type];//领奖情况
                                me.setContents();
                                G.frame.kaogu_mapinfo.checklcbRedPoint();
                                G.frame.kaogu_map.checkmapRedPoint();
                            }
                        });
                    }
                })
            })
        }

    });

    G.frame[ID] = new fun('kaogu_lcb.json', ID);
})();