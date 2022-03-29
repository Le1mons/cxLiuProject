/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠-强化
    var ID = 'sc_qh';

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
                me.ajax("pet_upgrade", [me.data().tid], function (str, data) {
                    if (data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'pet_upgrade',
                            data:{
                                oldLv:me.oldlv,
                                newLv:me.nextLv,
                                consume:me.consume,
                                pet_quality:me.color,
                            }
                        });

                        G.frame.jiangli.data({
                            prize: [{a: "pet", t: me.data().pid, lv: me.nextLv}]
                        }).once("willClose", function () {
                            me.remove();
                            G.frame.scsj.panel.setTable();
                        }).show();
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

            me.nextLv = me.data().lv + 1;
            me.oldlv = me.data().lv;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.data();
            var conf = G.gc.pet[data.pid];
            me.color = conf.color;//用于打点
            var lvConf = G.gc.petup[data.pid][data.lv];
            me.consume = lvConf.need;//用于打点
            var nextConf = G.gc.petup[data.pid][data.lv + 1];
            X.render({
                paneL_sc: function (node) {
                    var pet = G.class.pet(data);
                    pet.setPosition(node.width / 2, node.height /2);
                    node.addChild(pet);
                },
                txt_yl: function (node) {
                    var lvStr = data.lv ? " +" + data.lv : "";
                    setTextWithColor(node, conf.name + lvStr, G.gc.COLOR[conf.color]);
                },
                txt_yl1: function (node) {
                    setTextWithColor(node, conf.name + " +" + (data.lv + 1), G.gc.COLOR[conf.color]);
                },
                txt_fhsdj1: function (node) {
                    var str = X.STR(conf.skilldesc,
                        lvConf.value[0] + "<font color=#1c9700>(" + nextConf.value[0] + ")</font>",
                        lvConf.value[1] + "<font color=#1c9700>(" + nextConf.value[1] + ")</font>",
                        lvConf.value[2] + "<font color=#1c9700>(" + nextConf.value[2] + ")</font>",
                        lvConf.value[3] + "<font color=#1c9700>(" + nextConf.value[3] + ")</font>",
                        lvConf.value[4] + "<font color=#1c9700>(" + nextConf.value[4] + ")</font>",
                        lvConf.value[5] + "<font color=#1c9700>(" + nextConf.value[5] + ")</font>",
                        lvConf.value[6] + "<font color=#1c9700>(" + nextConf.value[6] + ")</font>");
                    var rh = X.setRichText({
                        str: str,
                        parent: node,
                        color: G.gc.COLOR.n4,
                        size: 24
                    });
                    rh.setPosition(0, node.height - rh.trueHeight());
                },
                panel_cl: function (node) {
                    X.alignItems(node, lvConf.need, 'left', {
                        touch: true,
                        scale: .8,
                        mapItem: function (node) {
                            if(G.class.getOwnNum(node.data.t, node.data.a, data.lv) < node.data.n) {
                                node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                            }
                        }
                    });
                }
            }, me.nodes);
        }
    });

    G.frame[ID] = new fun('scsj_tip_sqch.json', ID);
})();