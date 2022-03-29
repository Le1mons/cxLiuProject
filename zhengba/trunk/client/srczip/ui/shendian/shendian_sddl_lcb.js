/**
 * Created by  on 2019/3/6.
 */
(function () {
    //神殿地牢-里程碑
    var ID = 'shendian_sddl_lcb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            var fun = function(idx) {

                me.ajax("dungeon_recprize", [idx], function (str, data) {

                    if(data.s == 1) {
                        if(data.d.prize) {
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                        }
                        G.frame.shendian_sddl.getData(function () {
                            me.setContents();
                        });
                    }
                })
            };

            me.nodes.but_lq1.click(function () {
                fun(1);
            });

            me.nodes.but_lq2.click(function () {
                fun(2);
            });

            me.nodes.but_lq3.click(function () {
                fun(3);
            });

            me.ui.finds("mask_rz").click(function () {

                me.remove();
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

            me.setContents();
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("fashita", 1, function () {
                G.frame.shendian_sddl.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            var conf = me.conf = G.gc.sddlcom.base;

            me.setLayout(me.nodes.list1, 1);
            me.setLayout(me.nodes.list2, 2);
            me.setLayout(me.nodes.list3, 3);
        },
        setLayout: function (node, idx) {
            var me = this;
            X.autoInitUI(node);

            // node.nodes.luko.setString(me.conf.road[idx].name);
            var conf = me.conf.aimsprize[idx][G.frame.shendian_sddl.getPrizeIdx(idx)];

            if(!conf) {
                node.children[4].hide();
                node.nodes.txt_qsl.hide();
                me.nodes["but_lq" + idx].hide();
                me.nodes["img_ylw" + idx].show();
                return;
            } else {
                me.nodes["img_ylw" + idx].hide();
            }
            node.nodes.txt_qsl.setString(G.frame.shendian_sddl.getLayerPath(idx) - 1 + "/" + conf[0]);
            X.alignItems(node.children[4], conf[1], "left", {
                scale: .8,
                touch: true
            });

            if(G.frame.shendian_sddl.getLayerPath(idx) - 1 < conf[0]) {
                me.nodes["but_lq" + idx].setBright(false);
                me.nodes["but_lq" + idx].setTouchEnabled(false);
                me.nodes["but_lq" + idx].setTitleColor(cc.color("#6c6c6c"));
            }

        }
    });
    G.frame[ID] = new fun('shendianzhilu_lcb_tip1.json', ID);
})();