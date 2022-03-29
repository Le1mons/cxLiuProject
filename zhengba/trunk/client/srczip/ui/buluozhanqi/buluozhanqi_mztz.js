/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //战旗奖励
    G.class.buluozhanqi_mztz = X.bView.extend({
        ctor: function (taskType) {
            var me = this;
            me.taskType = taskType;
            me._super("buluozhanqi_rtz.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bujy.setEnableState(G.frame.buluozhanqi.DATA.rec);

            if (G.frame.buluozhanqi.DATA.rec && G.frame.buluozhanqi.DATA.jinjie) G.setNewIcoImg(me.nodes.btn_bujy);
            else G.removeNewIco(me.nodes.btn_bujy);


            if(G.frame.buluozhanqi.DATA.rec) {
                G.class.ani.show({
                    json: "ani_zhanqi_dailingqu",
                    addTo: me.nodes.panel_dh,
                    x: 50,
                    y: 35,
                    repeat: true,
                    autoRemove: false
                });
            } else {
                me.nodes.panel_dh.removeAllChildren();
            }

            me.nodes.btn_bujy.click(function (sender) {

                if(!G.frame.buluozhanqi.DATA.jinjie) return G.tip_NB.show(X.STR(L("JJZQKLQ"), G.gc.flag.base.addexp[0].n));

                me.ajax("flag_addexp", [], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).once("hide", function () {
                            G.frame.buluozhanqi.getInfo();
                        }).show();
                        sender.setEnableState(false);
                        G.removeNewIco(sender);
                        me.nodes.panel_dh.removeAllChildren();

                        G.hongdian.getData("flag", 1, function () {
                            G.frame.buluozhanqi.checkRedPoint();
                        });
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.refreshView();

            var time;
            if(X.getLastMondayZeroTime() + 7 * 24 * 3600 < G.time) {
                time = X.getLastMondayZeroTime() + 14 * 24 * 3600;
            } else {
                time = X.getLastMondayZeroTime() + 7 * 24 * 3600;
            }
            me.nodes.txt_tzsj.setString(X.moment(time - G.time));
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            me.ajax("flag_taskopen", [me.taskType], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        refreshView: function () {
            var me = this;

            me.getData(function () {

                me.setTable();
            });
        },
        setTable: function () {
            var me = this;

            G.frame.buluozhanqi.initScrollView(me.nodes.scrollview, me.nodes.list1, me);
        }
    });
})();