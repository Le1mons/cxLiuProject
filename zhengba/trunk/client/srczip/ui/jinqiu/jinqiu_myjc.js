/**
 * Created by  on 2019//.
 */
 (function () {
    //我的抽奖
    var ID = 'jinqiu_myjc';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.jinqiu_qrjc.DATA ;
            me.setContents();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.finds('mask').click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;

            me.ui.finds('Image_2').setTouchEnabled(true);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var data = X.keysOfObject(G.gc.midautumn2.lotteryprize);
            //me.nodes.img_zwnr.setVisible(myReward.length == 0);
            me.nodes.list.setTouchEnabled(false);
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var info = G.gc.midautumn2.lotteryprize[data];
            X.alignItems(ui.nodes.panel_ico,info.prize[0],'left',{
                touch:true
            });
            ui.nodes.txt_lj.setString(X.STR(L('DOUBLE13'),(me.DATA.lotterynum[data] || 0 ) + '/' +info.needval));
            ui.nodes.txt_cy.setString(X.STR(L('DOUBLE14'),me.DATA.myinfo.lottery[data] || 0));
            // //中奖状态
            ui.nodes.img_kj.hide();
            ui.nodes.txt_wkj.show();
            if(G.time > G.DATA.asyncBtnsData.midautumn2.rtime && G.time < G.DATA.asyncBtnsData.midautumn2.etime){
                //开奖状态
                if(G.DATA.jinqiu.lotterylog[data] && G.DATA.jinqiu.lotterylog[data].length > 0){
                    for(var i = 0; i < G.DATA.jinqiu.lotterylog[data].length; i++){
                        var conf = G.DATA.jinqiu.lotterylog[data][i];
                        if(P.gud.uid == conf.uid){//中奖了
                            ui.nodes.img_kj.show();
                            ui.nodes.txt_wkj.hide();
                            return;
                        }
                    }
                    ui.nodes.txt_wkj.setString(L('DOUBLE16'));
                }else{
                    ui.nodes.txt_wkj.setString(L('DOUBLE15'));
                }
               
            }else{
                ui.nodes.txt_wkj.setString(L('DOUBLE15'));
            }
            
        }
    });
    G.frame[ID] = new fun('event_qiurijiangchi_wdcj.json', ID);
})();