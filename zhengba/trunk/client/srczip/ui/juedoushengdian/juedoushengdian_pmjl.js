/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典排名奖励
    var ID = 'juedoushengdian_pmjl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.prizeData = G.gc.gongpingjjc.emailprize;
            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_phjl.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_phjl.click(function () {
                me.nodes.btn_phjl.setBright(false);
                me.nodes.btn_phb.setBright(true);
                me.changeType(1);
            });
            me.nodes.btn_phb.click(function () {
                me.nodes.btn_phb.setBright(false);
                me.nodes.btn_phjl.setBright(true);
                me.changeType(2);
            });
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        changeType:function(type){
            var me = this;
            if(type == 1){
                me.setPrizeInfo();
            }else {
                if(!me.rankData){
                    me.getRankData(function () {
                        me.setRankInfo();
                    })
                }else {
                    me.setRankInfo();
                }
            }
        },
        setPrizeInfo:function () {
            var me = this;
            me.nodes.wodepaiming.hide();
            me.nodes.jifen.hide();
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb2, 1, function (ui, data) {
                me.setPrizeItem(ui, data);
            }, null, null, 0, 0);
            table.setData(me.prizeData);
            table.reloadDataWithScroll(true);
        },
        setPrizeItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(false);
            ui.nodes.panel_pm2.setTouchEnabled(false);
            ui.nodes.tubiao_neirong.setTouchEnabled(false);
            ui.nodes.panel_pm2.removeBackGroundImage();
            ui.nodes.sz_phb2.show();
            if(data[0][0] == data[0][1]){
                if(data[0][0] <= 3){
                    ui.nodes.sz_phb2.hide();
                    ui.nodes.panel_pm2.setBackGroundImage('img/public/img_paihangbang_' + data[0][0] + '.png', 1);
                }else {
                    ui.nodes.sz_phb2.setString(data[0][0]);
                }
            }else {
                ui.nodes.sz_phb2.setString(data[0][0] + "-" + data[0][1]);
            }
            X.alignItems(ui.nodes.tubiao_neirong,data[1],'left',{
                touch:true
            });

        },
        setRankInfo:function () {
            var me = this;
            me.nodes.wodepaiming.show();
            me.nodes.jifen.show();
            me.nodes.wodepaiming.setString(L('MY_RANK') + (me.myRankData.myrank ?
                (me.myRankData.myrank >= 100 ? 100 + L("YH") : me.myRankData.myrank) : L('WRWZ')));
            me.nodes.jifen.setString(X.STR(L('JUEDOUSHENGDIAN1'),me.myRankData.myval));
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                me.setRankItem(ui, data);
            }, null, null, 1, 3);
            table.setData(me.rankData);
            table.reloadDataWithScroll(true);
        },
        setRankItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(false);
            ui.nodes.sz_phb.show();
            ui.nodes.panel_pm.removeBackGroundImage();
            if(data.rank < 4){
                ui.nodes.sz_phb.hide();
                ui.nodes.panel_pm.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
            }else {
                ui.nodes.sz_phb.setString(data.rank);
            }
            var head = G.class.shead(data.headdata);
            head.setPosition(0,0);
            head.setAnchorPoint(0,0);
            ui.nodes.panel_tx.removeAllChildren();
            ui.nodes.panel_tx.addChild(head);
            ui.nodes.text_mz.setString(data.headdata.name);
            ui.nodes.text_qf.setString(X.STR(L('YWZB_QF'),data.headdata.svrname));
            ui.nodes.text_jf.setString(data.val);
        },
        getRankData:function (callback) {
            var me = this;
            connectApi('rank_open',[31],function (data) {
                me.myRankData = data;
                me.rankData = data.ranklist;
                callback && callback();
            })
        }
    });
    G.frame[ID] = new fun('juedou4.json', ID);
})();