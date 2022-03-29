/**
 * Created by  on 2019//.
 */
(function () {
    //终身月卡
    G.class.huodong_zsyk = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_zsk.json");
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_gm.click(function () {
                G.event.once('paysuccess', function() {
                    G.frame.jiangli.data({
                        prize:G.gc.lifetimecard.buyprize
                    }).show();
                    G.hongdian.getData('lifetimecard',1,function () {
                        G.frame.huodong.checkRedPoint();
                        me.setContents();
                    })
                });
                G.event.emit('doSDKPay', {
                    pid:G.gc.lifetimecard.proid,
                    logicProid: G.gc.lifetimecard.proid,
                    money: G.gc.lifetimecard.needmoney * 100,
                });
            });
            me.nodes.btn_lq.click(function () {
                me.ajax('lifetimecard_receive',[],function (str,data) {
                    if(data.s == 1){
                        G.frame.jiangli.data({
                            prize:data.d.prize
                        }).show();
                        G.hongdian.getData('lifetimecard',1,function () {
                            G.frame.huodong.checkRedPoint();
                            me.setContents();
                        })
                    }
                })
            });
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
        setContents:function () {
            var me = this;
            var buyprize = G.gc.lifetimecard.buyprize;
            var dayprize = G.gc.lifetimecard.prize;
            me.nodes.btn_gm.setVisible(!P.gud.lifetimecard);
            me.nodes.btn_lq.setVisible(P.gud.lifetimecard);
            me.nodes.panel_1.setVisible(!P.gud.lifetimecard);
            me.nodes.panel_2.setVisible(P.gud.lifetimecard);
            if(P.gud.lifetimecard){//激活了
                //每日获得
                X.alignItems(me.nodes.panel_wp3,dayprize,'center',{
                    mapItem:function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
                //今日是否领取了
                if(G.DATA.hongdian && G.DATA.hongdian.lifetimecard){//可以领
                    me.nodes.btn_lq.setBtnState(true);
                    me.nodes.txt_lq.setString(L('LQ'));
                    me.nodes.txt_lq.setTextColor(cc.color(G.gc.COLOR.n13));
                }else {//已领取
                    me.nodes.btn_lq.setBtnState(false);
                    me.nodes.txt_lq.setString(L('YLQ'));
                    me.nodes.txt_lq.setTextColor(cc.color(G.gc.COLOR.n15));
                }
            }else{//未激活
                //购买获得
                X.alignItems(me.nodes.panel_wp1,buyprize,'center',{
                    mapItem:function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
                //每日获得
                X.alignItems(me.nodes.panel_wp2,dayprize,'center',{
                    mapItem:function (node) {
                        G.frame.iteminfo.showItemInfo(node);
                    }
                });
                //按钮
                me.nodes.txt_gm.setString(G.gc.lifetimecard.needmoney + L("YUAN"));
            }
        }
    });
})();