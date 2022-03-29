/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典特权
    var ID = 'juedoushengdian_tq';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.wz_sx1.setString(L('JUEDOUSHENGDIAN4'));
            me.nodes.btn_jh.setTitleText(X.STR(L('JUEDOUSHENGDIAN7'),G.gc.gongpingjjc.tqproid.money / 100));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_jh.click(function () {
                G.event.once('paysuccess', function(arg) {
                    G.frame.juedoushengdian_main.DATA.myinfo.tq = 1;
                    me.setContents();
                    // G.frame.jiangli.data({
                    //     prize:G.gc.gongpingjjc.tqproid.prize,
                    // }).show();
                    G.tip_NB.show(L("JUEDOUSHENGDIAN33"));
                });
                G.event.emit('doSDKPay', {
                    pid:G.gc.gongpingjjc.tqproid.proid,
                    logicProid: G.gc.gongpingjjc.tqproid.proid,
                    money: G.gc.gongpingjjc.tqproid.money,
                });
            })
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
            //算出决斗币
            var fightprize = JSON.parse(JSON.stringify(G.gc.gongpingjjc.fightprize[0]));
            var winprize = JSON.parse(JSON.stringify(G.gc.gongpingjjc.winprize[0]));
            var num = G.frame.juedoushengdian_main.DATA.myinfo.fightnum * fightprize.n + G.frame.juedoushengdian_main.DATA.myinfo.winnum * winprize.n;

            if(G.frame.juedoushengdian_main.DATA.myinfo.tq){//已激活
                me.nodes.btn_jh.hide();
                me.nodes.yijihuo.show();
                me.nodes.wz_sx2.setString(X.STR(L('JUEDOUSHENGDIAN6'),num));
                me.nodes.wz_sx2.setTextColor(cc.color("#c97649"));
            }else {//未激活
                me.nodes.yijihuo.hide();
                me.nodes.btn_jh.show();
                me.nodes.wz_sx2.setString(X.STR(L('JUEDOUSHENGDIAN5'),num));
                me.nodes.wz_sx2.setTextColor(cc.color("#d50000"));
            }
        }
    });
    G.frame[ID] = new fun('juedoushengdian_tankuang2.json', ID);
})();