/**
 * Created by LYF on 2019/8/2.
 */
(function () {
    //神殿迷宫-购买商品
    var ID = 'maze_buy';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            var data = me.DATA.data;
            var item = data.item;
            var conf = G.class.getItem(item.t, item.a);

            setTextWithColor(me.nodes.text_1, conf.name, G.gc.COLOR[conf.color]);

            var wid = G.class.sitem(item);
            wid.setPosition(me.nodes.panel_1.width / 2, me.nodes.panel_1.height / 2);
            me.nodes.panel_1.addChild(wid);
            G.frame.iteminfo.showItemInfo(wid);

            me.nodes.text_2.setString(parseInt(data.need[0].n * (data.sale / 10)));
            me.ui.finds("image_3").loadTexture(G.class.getItemIco(data.need[0].t), 1);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_3.click(function () {
                G.DATA.noClick = true;
                me.ajax("maze_chess", [me.DATA.index, me.DATA.step, 0, me.DATA.idx], function (str, data) {
                    if (data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "maze_chess"
                        });
                        G.frame.maze.DATA.data.trace[me.DATA.step] = {finish: 0, idx: me.DATA.index};
                        G.frame.maze.DATA.data.maze[me.DATA.step][me.DATA.index].goods[me.DATA.idx].buynum -= 1;
                        G.frame.jiangli.data({
                            prize: [].concat(me.DATA.data.item)
                        }).once("hide", function () {
                            G.frame.maze_state8.setShopItem();
                            G.frame.maze.setAllGridState();
                            me.remove();
                        }).show();
                        G.DATA.noClick = false;
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            });

            me.nodes.mask && me.nodes.mask.click(function () {
                me.remove();
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
        },
        onHide: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianmigong_gm.json', ID);
})();