(function () {
    var ID = 'syzc_shop';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var shop = me.getdata();
            cc.enableScrollBar(me.nodes.scrollview_sp, false);
            var table = me.table = new X.TableView(me.nodes.scrollview_sp, me.nodes.list_mb, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 3, 3);
            table.setData(shop);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            for (var i = 1; i < 4; i++) {
                ui.nodes["panel_wp" + i].removeAllChildren();
                if (!data[i - 1]) return;
                me.setlist(ui.nodes["panel_wp" + i], data[i - 1]);

            }
        },
        setlist: function (ui, data) {
            var me = this;
            var node = ui.children[0]
            if (!node) {
                node = me.nodes.list.clone();
                ui.addChild(node);
                node.show()
            }
            X.autoInitUI(node);
            X.render({
                ico_tb: function (node) {
                    var item = G.class.sitem(data.item);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setSwallowTouches(true);
                },
                text_1: G.class.getItemConf(data.item).name,
                wz1: X.STR(L('syzc_110'), data.buynum),
                image_jb: function (node) {
                    node.loadTexture(G.class.getItemIco(data.need[0].t), 1)
                },
                text_jinbi: data.need[0].n,
                img_ygm: function (node) {
                    node.setVisible(data.buynum < 1);
                },
            }, node.nodes)

            node.setPosition(0, 0);
            node.setTouchEnabled(true);
            node.setSwallowTouches(false);
            node.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (data.buynum < 1) return;
                    G.frame.buying.data({
                        num: 1,
                        item: [].concat(data.item),
                        need: data.need,
                        maxNum: data.buynum < 0 ? 0 : data.buynum,
                        callback: function (num) {
                            me.DATA.callback && me.DATA.callback({ idx: data.idx, num: num }, function () {
                                data.buynum--;
                                me.setlist(ui, data)
                            })

                        }
                    }).show();
                }
            })
        },
        getdata: function () {
            var me = this;
            var data = me.DATA.data.eventdata;
            var arr = [];
            var idx = 0;
            data.forEach(function name(item, i) {
                if (!arr[idx]) arr[idx] = [];
                arr[idx].push(item);
                if (arr[idx].length >= 3) {

                    idx++;
                }
            })
            return arr
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shiyuan_qb_sd.json', ID);
})();