/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠水晶-孵化室升级
    var ID = 'scsj_fhsup';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn.click(function () {
                me.ajax("pet_pdupgrade", [], function (str, data) {
                    if (data.s == 1) {
                        G.tip_NB.show(L("SJCG"));
                        G.frame.scsj.DATA.crystal.lv ++;
                        var lv = G.frame.scsj.DATA.crystal.lv;
                        var conf = G.gc.petcom.base.petridish;
                        if (conf[lv + 1] && conf[lv + 1].vip <= P.gud.vip) {
                            me.setContents(G.frame.scsj.DATA.crystal.lv);
                        } else {
                            me.remove();
                        }
                        G.frame.scsj.panel.setFhsInfo();
                    }
                });
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents(G.frame.scsj.DATA.crystal.lv);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function (lv) {
            var me = this;
            var conf = G.gc.petcom.base.petridish[lv];
            var nextConf = G.gc.petcom.base.petridish[lv + 1];

            X.render({
                txt_fhsdj1: X.STR(L("fhsdj"), lv),
                txt_fhsdj2: X.STR(L("fhnl"), 1 + "/" + conf.cd),
                txt_sjfh1: X.STR(L("fhsdj"), lv + 1),
                txt_sjfh2: X.STR(L("fhnl"), 1 + "/" + nextConf.cd),
            }, me.nodes);

            if (P.gud.vip < nextConf.vip) {
                me.nodes.btn.setEnableState(false);
                me.nodes.txt_qd.setString(X.STR(L("GZXKSJ"), nextConf.vip));
                me.nodes.txt_qd.setTextColor(cc.color(G.gc.COLOR.n15));
            }
        }
    });

    G.frame[ID] = new fun('scsj_top_sjfhs.json', ID);
})();