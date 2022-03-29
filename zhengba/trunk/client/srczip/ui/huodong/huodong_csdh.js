/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //月礼包
    G.class.huodong_csdh = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_chuanqiduihuan.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;

            X.render({
                chuanqi_wz: me._data.intr,
                btn_szq: function (node) {
                    node.click(function () {
                        G.frame.tanxian.once("show", function () {
                            G.frame.huodong.remove();
                        }).show();
                    });
                },
                btn_bangzhu: function (node) {
                    node.click(function () {
                        G.frame.csdh.once("willClose", function () {
                            me.showItemNum();
                        }).data(me).show();
                    });
                }
            }, me.nodes);

            X.setHeroModel({
                parent: me.nodes.rw,
                data: {},
                model: me._data.model || "31115"
            });

            X.alignCenter(me.nodes.panel_wp, me._data.data.haohua, {
                touch: true
            });

            me.finds("ico_zs").loadTexture(G.class.getItemIco(me._data.data.showitem.t), 1);
        },
        showTime: function () {
            var me = this;

            if (G.time < me._data.rtime) {
                X.timeCountPanel(me.nodes.txt_hfsj, me._data.rtime, {
                    endCall: function () {
                        me.showTime();
                    },
                    str: "<font color=#fff8e1>掉落倒计时：</font>" + (me._data.rtime - G.time > 24 * 3600 * 2 ? X.moment(me._data.rtime - G.time) : "{1}")
                });
            } else {
                X.timeCountPanel(me.nodes.txt_hfsj, me._data.etime, {
                    str: "<font color=#fff8e1>结束倒计时：</font>" + (me._data.etime - G.time > 24 * 3600 * 2 ? X.moment(me._data.rtime - G.time) : "{1}")
                });
            }
        },
        showItemNum: function () {
            var me = this;
            me.nodes.zs_wz.setString(G.class.getOwnNum(me._data.data.showitem.t, me._data.data.showitem.a));
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.showTime();
            me.showItemNum();
            me.refreshPanel();
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("huodong_open", [me._data.hdid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;
        }
    })
})();
