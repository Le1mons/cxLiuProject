/**
 * Created by LYF on 2019/6/24.
 */
(function () {
    //开服礼包
    var ID = 'kaifulibao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            X.timeout(me.nodes.txt_djs, X.getTodayZeroTime() + 24 * 3600);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            me.conf = G.gc.kaifulibao[G.DATA.creatToDay];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;

            G.view.mainView.getAysncBtnsData(function () {
                G.view.mainView.allBtns["lefttop"] = [];
                G.view.mainView.setSvrBtns();
            }, false, ["kaifulibao"]);
        },
        setContents: function () {
            var me = this;
            var index = 1;

            for (var i in me.conf) {
                
                me.setCardList(me.conf[i], me.nodes["panel_lbt" + index], i);
                index ++;
            }
        },
        setCardList: function (conf, list, key) {
            var me = this;
            G.DATA.asyncBtnsData.kaifulibao[key] = G.DATA.asyncBtnsData.kaifulibao[key] || 0;

            X.autoInitUI(list);
            X.render({
                panel_wp: function (node) {
                    X.alignItems(node, conf.prize, "left", {
                        touch: true,
                        scale: .8
                    });
                },
                txt_mxtsb: conf.name,
                btn_djgb: function (node) {
                    if(conf.buynum - G.DATA.asyncBtnsData.kaifulibao[key] <= 0) {
                        node.setEnableState(false);
                        list.nodes.txt_djgb.setTextColor(cc.color("#6c6c6c"));
                    } else {
                        node.setEnableState(true);
                        list.nodes.txt_djgb.setTextColor(cc.color("#2f5719"));
                    }
                    node.click(function () {
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: conf.prize
                            }).show();
                            G.DATA.asyncBtnsData.kaifulibao[key] ++;
                            me.setContents();
                        });

                        G.event.emit('doSDKPay', {
                            pid: conf.chkey,
                            logicProid: conf.chkey,
                            money: conf.money,
                        });
                    }, 5000);
                },
                txt_xg: X.STR(L("XG"), conf.buynum - G.DATA.asyncBtnsData.kaifulibao[key]),
                txt_djgb: X.STR(L("XYLQ"), conf.money / 100)
            }, list.nodes);

            list.finds("txt_mxtsb$_0_0").setString(conf.showmoney);
        }
    });
    G.frame[ID] = new fun('event_xrxslb.json', ID);
})();