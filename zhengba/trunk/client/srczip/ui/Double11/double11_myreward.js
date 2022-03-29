/**
 * Created by  on 2019//.
 */
(function () {
    //我的抽奖
    var ID = 'double_myreward';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.double_jiangchi.DATA || G.frame.double_kaijiang.DATA;
            me.setContents();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.panel_bg.setTouchEnabled(true);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var myReward = [];//我参与抽奖的奖池,存放奖池索引
            for(var i in me.DATA.v){
                for(var k in me.DATA.v[i]){
                    if(k == P.gud.uid){
                        var info = G.gc.double11.prizepool[i];
                        var obj1 = {'key' : i,'prize':info.prize[0],'prizeindx' : 0};
                        var obj2 = {'key' : i,'prize':info.prize[1],'prizeindx' : 1};
                        myReward.push(obj1);
                        myReward.push(obj2);
                    }
                }
            }
            me.nodes.img_zwnr.setVisible(myReward.length == 0);
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(myReward);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(myReward);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var info = G.gc.double11.prizepool[data.key];
            X.alignItems(ui.nodes.panel_tx,data.prize,'left',{
                touch:true
            });
            ui.nodes.txt_name.setString(X.STR(L('DOUBLE13'),parseInt(me.DATA.sum[data.key]/info.jindu)));
            ui.nodes.txt_title.setString(X.STR(L('DOUBLE14'),me.DATA.v[data.key][P.gud.uid]));
            //中奖状态
            ui.nodes.img_kj.hide();
            ui.nodes.text_wkj.show();
            if(!me.DATA.send || !me.DATA.send[data.key]){//未开奖
                ui.nodes.text_wkj.setString(L('DOUBLE15'));
            }else if(me.DATA.send[data.key]){
                for(var i = 0; i < me.DATA.send[data.key].length; i++){
                    if(P.gud.uid == me.DATA.send[data.key][i].uid && me.DATA.send[data.key][i].idx == data.prizeindx){//中奖了
                        ui.nodes.img_kj.show();
                        ui.nodes.text_wkj.hide();
                        break;
                    }
                    ui.nodes.text_wkj.setString(L('DOUBLE16'));
                }
            }
        }
    });
    G.frame[ID] = new fun('event_double11_xyjc_tip2.json', ID);
})();