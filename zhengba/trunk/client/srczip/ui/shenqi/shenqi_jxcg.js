/**
 * Created by LYF on 2019-4-2
 */
(function () {
    //神器-觉醒成功
    var ID = 'shenqi_jxcg';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_jinjieshengxing",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2 - 15,
                repeat: true,
                autoRemove: false
            });
            me.setContents();
            G.DATA.noClick = false;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function() {
            var me = this;
            var conf = G.gc.shenqicom.shenqi[me.DATA.type];
            var wakeCon = G.gc.shenqicom.base.wake[conf.waketype];
            var curCon = wakeCon[me.DATA.curLv];
            var lastCon = wakeCon[me.DATA.curLv];
            var rank = me.DATA.rank;
            var curWakeRank= G.gc.shenqicom.wakerank[rank];
            var lastWakeRank = G.gc.shenqicom.wakerank[rank - 1];

            G.class.ani.show({
                json: "shenbing_0" + me.DATA.type,
                addTo: me.nodes.panel_shengxingrw,
                x: me.nodes.panel_shengxingrw.width / 2,
                y: me.nodes.panel_shengxingrw.height / 2 - 50,
                repeat: true,
                autoRemove: false,
                onload: function (node) {
                    var act1 = cc.moveBy(1, 0, 10);
                    var act2 = cc.moveBy(1, 0, -10);
                    var act = cc.sequence(act1, act2);
                    node.runAction(act.repeatForever());
                }
            });

            // G.frame.shenqi_list.showJxStar(me.ui.finds("panel_xx1"), me.DATA.curLv + 1, "center", 1.3);

            me.ui.finds("Text_16").setString(conf.keytitle[4] + "+" + ((lastCon.shenqidpspro + lastWakeRank.shenqidpspro) / 10 + "%"));
            X.render({
                panel_xxs1: function (node) {
                    // if(me.DATA.curLv == 1) return;
                    // G.frame.shenqi_list.showJxStar(node, me.DATA.curLv, "left", 1.5);
                },
                panel_xxs2: function (node) {
                    // if(me.DATA.curLv == 1) return;
                    // G.frame.shenqi_list.showJxStar(node, me.DATA.curLv + 1, "left", 1.5);
                },
                txt_sx1_1: conf.keytitle[0] + "+" + (lastWakeRank.buff.atk + lastCon.buff.atk),
                txt_sx2_1: conf.keytitle[1] + "+" + (lastWakeRank.buff.hp + lastCon.buff.hp),
                txt_sx3_1: conf.keytitle[2] + "+" + ((lastWakeRank.buff.pvpdpspro + lastCon.buff.pvpdpspro) / 10 + "%"),
                txt_sx4_1: conf.keytitle[3] + "+" + ((lastWakeRank.buff.pvpundpspro + lastCon.buff.pvpundpspro) / 10 + "%"),
                txt_sx1_2: conf.keytitle[0] + "+" + (curWakeRank.buff.atk + curCon.buff.atk),
                txt_sx2_2: conf.keytitle[1] + "+" + (curWakeRank.buff.hp + curCon.buff.hp),
                txt_sx3_2: conf.keytitle[2] + "+" + ((curWakeRank.buff.pvpdpspro + curCon.buff.pvpdpspro) / 10 + "%"),
                txt_sx4_2: conf.keytitle[3] + "+" + ((curWakeRank.buff.pvpundpspro + curCon.buff.pvpundpspro) / 10 + "%"),
                txt_sx5_2: conf.keytitle[4] + "+" + ((curCon.shenqidpspro + curWakeRank.shenqidpspro) / 10 + "%"),
                img_arrow7: function (node) {
                    node.hide();
                }
            }, me.nodes);
        },
    });

    G.frame[ID] = new fun('ui_juexing.json', ID);
})();