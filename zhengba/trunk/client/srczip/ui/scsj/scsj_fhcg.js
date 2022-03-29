/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠水晶-孵化成功
    var ID = 'scsj_fhcg';

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
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data() || [{a: "pet", t: "2001", n: 1}, {a: "item", t: "2055", n: 2}];
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            me.action.play("wait", true);
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var prize = me.DATA;
            var pet;
            var item;

            for (var i = 0; i < prize.length; i ++) {
                if (prize[i].a == "pet" && !pet) {
                    pet = prize[i];
                }
                if (prize[i].a == "item" && !item) {
                    item = prize[i];
                }
            }

            var conf = G.gc.pet[pet.t];
            X.render({
                txt_title: function (node) {
                    setTextWithColor(node, conf.name, G.gc.COLOR[conf.color]);
                },
                txt_goms: conf.stereotype,
                panel_bq: function (node) {
                    var img = {
                        "2": "ls",
                        "3": "zs",
                        "4": "cs",
                        "5": "hs"
                    };
                    node.setBackGroundImage("img/scsj/img_scsj_" + img[conf.color] + ".png", 1);
                },
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        data: {},
                        model: conf.model,
                        direction: -1
                    });
                },
                panel_hdms: function (node) {
                    var rh = X.setRichText({
                        str: X.STR(L("TSHD"), item.n),
                        parent: node,
                        color: "#f6ebcd",
                        node: new ccui.ImageView(G.class.getItemIco(item.t), 1)
                    });
                    rh.setPosition(node.width / 2 - rh.trueWidth() / 2, node.height / 2 - rh.trueHeight() / 2);
                },
            }, me.nodes);
        }
    });

    G.frame[ID] = new fun('scsj_fhcg.json', ID);
})();