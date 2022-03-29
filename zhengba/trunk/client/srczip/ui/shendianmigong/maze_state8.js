/**
 * Created by LYF on 2019/7/31.
 */
(function () {
    //神殿迷宫-神秘商人
    var ID = 'maze_state8';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            G.frame.maze.initEventUi(me.DATA.isClick, me);
            me.nodes.txt_jlwz.setString(L("maze_sw8"));

            if (G.frame.maze.DATA.data.trace[me.DATA.step]) {
                me.nodes.btn_qw.loadTextureNormal("img/public/btn/btn3_on.png", 1);
                me.nodes.txt_qw.setString(L("FQ"));
                me.nodes.txt_qw.setTextColor(cc.color(G.gc.COLOR.n14));
            } else {

            }

            X.setHeroModel({
                parent: me.nodes.panel_csm,
                data: {},
                model: "dijing_1"
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_qw.click(function () {

                G.frame.maze.mazeChange([me.DATA.index, me.DATA.step, G.frame.maze.DATA.data.trace[me.DATA.step] ? 1 : 0], function () {
                    me.remove();
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.list.hide();
            me.setShopItem();
        },
        onHide: function () {
            var me = this;
        },
        setShopItem: function () {
            var me = this;
            var step = me.DATA.step;
            var index = me.DATA.index;
            var shopItem = G.frame.maze.DATA.data.maze[step][index].goods;

            var shopArr = [];
            for (var i = 0; i < shopItem.length; i ++) {
                (function (index, data) {
                    var list = me.nodes.list.clone();
                    X.autoInitUI(list);
                    X.render({
                        txt_zl: parseInt(data.need[0].n * (data.sale / 10)),
                        panel_yx: function (node) {
                            var item = G.class.sitem(data.item);
                            item.setPosition(node.width / 2, node.height / 2);
                            node.addChild(item);
                            node.setTouchEnabled(me.DATA.isClick);
                            node.click(function () {
                                if (data.buynum < 1) return G.tip_NB.show(L("SHOP_ITEM_OVER"));
                                if (!G.frame.maze.DATA.data.trace[me.DATA.step]) return;
                                G.frame.maze_buy.data({
                                    index: me.DATA.index,
                                    step: me.DATA.step,
                                    data: data,
                                    idx: index
                                }).show();
                            });
                        },
                        img_ysq: function (node) {
                            if (data.buynum < 1) node.show();
                        },
                        txt_yuanjia: data.need[0].n,
                        text_zk: data.sale + L("sale")
                    }, list.nodes);
                    X.enableOutline(list.nodes.text_zk, "#1D9600", 2);
                    X.enableOutline(list.nodes.txt_zl, "#3C2100", 2);
                    list.finds("Image_3").loadTexture(G.class.getItemIco(data.need[0].t), 1);
                    list.show();
                    shopArr.push(list);
                })(i, shopItem[i]);
            }

            X.center(shopArr, me.nodes.txt_wzcs);
        }
    });
    G.frame[ID] = new fun('shendianmigong_smsr.json', ID);
})();