/**
 * Created by LYF on 2018/8/8.
 */
(function () {
    //礼品兑换
    var ID = 'lipinduihuan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_duihuan.click(function () {
                var code = me.nodes.wz_1.getString();
                if(code.trim() == "") {
                    G.tip_NB.show(L("QSRDHM"));
                    return;
                }
                X.ajax.get(
                    X.STR(G.check_card_url, P.gud.uid, encodeURIComponent(P.gud.name), code, G.owner||""), {},
                    function (txt) {
                        var d = X.toJSON(txt);
                        if(d.result == 0) {
                            G.ajax.send("user_getcard", [d.code], function (data) {
                                data = X.toJSON(data);
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize: data.d
                                    }).show();
                                    //me.remove();  不存在的方法
                                }
                            })
                        }else{
                            G.tip_NB.show(d.result);
                        }
                    }
                )

            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
        },
        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('likaduihuan.json', ID);
})();