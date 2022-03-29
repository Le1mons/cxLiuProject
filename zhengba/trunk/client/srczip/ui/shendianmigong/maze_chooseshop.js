(function () {
    var ID = 'maze_chooseshop';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = JSON.parse(JSON.stringify(G.frame.maze.DATA.shoplist));
            me.setContents();

        },
        setContents: function () {
            var me = this;
            var data = me.initDATA(me.DATA);
            // me.nodes.list_tx.setPosition(-100, 0);
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            for (var i = 0; i < 4; i++) {
                var node = ui.nodes["panel_tx" + (i + 1)];
                node.removeAllChildren();
                if (!data[i]) return;
                var iteminfo = data[i].shoplist;
                var clnode = me.nodes.list_sp.clone();
                node.addChild(clnode);
                clnode.setPosition(node.width / 2, node.height / 2);
                clnode.show();
                X.autoInitUI(clnode);

                clnode.nodes.img_zheko.setVisible(iteminfo.sale);
                var sitem = G.class.sitem(iteminfo.item);
                clnode.nodes.text_zk.setString(iteminfo.sale);
                clnode.nodes.panel_yx.addChild(sitem);
                clnode.nodes.panel_yx.setTouchEnabled(false);
                sitem.setPosition(clnode.nodes.panel_yx.width / 2, clnode.nodes.panel_yx.height / 2);
                sitem.setGou(X.inArray(me.chosoeData, data[i].key));
                clnode.nodes.txt_yuanjia.setString(iteminfo.need[0].n);
                clnode.nodes.txt_zl.setString(parseInt(iteminfo.need[0].n * (iteminfo.sale / 10)));
                clnode.finds("Image_3").loadTexture(G.class.getItemIco(iteminfo.need[0].t), 1);
                // clnode.nodes.img_ysq.setVisible()
                clnode.key = data[i].key;
                clnode.setTouchEnabled(true);
                clnode.setSwallowTouches(false);
                clnode.click(function (sender) {
                    if (X.inArray(me.chosoeData, sender.key)) {
                        me.chosoeData.splice(me.chosoeData.indexOf(sender.key), 1);
                        me.table.reloadDataWithScroll(false);
                    } else {

                        me.chosoeData.push(sender.key);
                        me.table.reloadDataWithScroll(false);
                    }
                })
            }
        },

        initDATA: function (data) {
            var me = this;
            me.chosoeData = [];
            var _data = [];
            var idx = 0;
            data.forEach(function name(item, _idx) {
                if (!_data[idx]) _data[idx] = [];
                var obj = {}
                obj.key = _idx;
                obj.shoplist = item;
                _data[idx].push(obj);
                if (_data[idx].length > 3) idx++
            });
            return _data
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_qw.click(function (sender) {
                if (me.chosoeData.length < 1) {
                    G.frame.alert_1.data({
                        cancelCall: function(){
                        },
                        okCall: function () {
                            G.frame.maze.getSaoDang("shoplist", me.chosoeData, function (prize) {
                                // G.tip_NB.show(L("maze_sw13"))
                             
                                me.remove();
                            });
                        },
                        richText: L("slzt_tip28"),
                        sizeType: 3
                    }).show();
                } else {
                    G.frame.maze.getSaoDang("shoplist", me.chosoeData, function (prize) {
                        // G.tip_NB.show(L("maze_sw13"))
                        G.frame.jiangli.data({
                            prize: prize
                        }).show();
                        me.remove();
                    });
                }

            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shendianmigong_xzsp.json', ID);
})();