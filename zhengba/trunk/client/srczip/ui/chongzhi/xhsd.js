/**
 * Created by wfq on 2018/5/24.
 */
(function () {
    //宝石-详情
    var ID = 'xhsd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ["sale2.png","sale2.plist"];
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds("Panel_2").click(function () {
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
        getData: function (callback) {
            var me = this;

            connectApi("shop_open", [me.curType], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.curType = 13;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.setTable();
            me.showAttr();
            me.initBtnState();

        },
        showAttr: function () {
            var me = this;

            X.render({
                zs_wz: X.fmtValue(G.class.getOwnNum("2073", 'item'))
            }, me.nodes);
        },
        initBtnState:function () {
            var me = this ;
            me.nodes.btn1.hide();
            me.nodes.btn2.hide();
            // X.radio([me.nodes.btn1, me.nodes.btn2], function (sender) {
            //     var obj = {
            //         btn1$: "13",
            //         btn2$: "14"
            //     };
            //     me.changeType(obj[sender.getName()]);
            // });
            // if(G.class.opencond.getIsOpenById('xinghunskinshop')){
            //     me.nodes.btn1.triggerTouch(2);
            // }else{
            //     me.nodes.btn1.hide();
            //     me.nodes.btn2.hide();
            // }
        },
        changeType:function (shopid) {
            var me = this ;
            if(shopid == me.curType){
                return;
            };
            me.curType = shopid;
            me.getData(function () {
                me.setTable(true);
                me.showAttr();
            })

        },
        setTable: function (istop) {
            var me = this;
            var arr = [];
            var data = [];
            var shop = me.DATA.shop.shopitem;
            var img = me.curType*1 == 13 ? "img_xinghunshangdian.png" : "img_xinghunshangdian2.png";
            me.ui.finds("img_banner").loadTexture("img/sale/"+img,1);
            for (var index = 0; index < shop.length; index ++) {
                if (arr.length == 2) {
                    data.push(arr);
                    arr = [];
                }
                arr.push(shop[index]);
            }
            if (arr.length > 0) data.push(arr);

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(istop || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                list1: function (node) {
                    node.removeAllChildren();
                    me.initItem(node, data[0]);
                },
                list2: function (node) {
                    node.removeAllChildren();
                    me.initItem(node, data[1]);
                }
            }, ui.nodes);
        },
        initItem: function (parent, data) {
            if (!data) return null;
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            var txt_bg = list.finds('bg_limit');
            txt_bg.setColor(cc.color('#d37656'));
            X.render({
                img_ygm: function (node) {
                    node.setVisible(data.buynum == 0);
                },
                img_zkbg: function (node) {
                    node.setVisible(data.sale < 10);
                    if (data.sale <= 5) {
                        node.loadTexture('img/sale/img_sale_zhong.png', 1);
                    } else {
                        node.loadTexture('img/sale/img_sale_zlv.png', 1);
                    }
                },
                text_zk: function (node) {
                    node.setString(data.sale + L("sale"));
                    node.setVisible(data.sale < 10);
                    if (data.sale <= 5) {
                        X.enableOutline(node, '#b51718', 2);
                    } else {
                        X.enableOutline(node, '#085f0d', 2);
                    }
                },
                panel_line: function (node) {
                    node.setVisible(data.sale < 10);
                },
                img_zs: function (node) {
                    node.loadTexture(G.class.getItemIco(data.need[0].t), 1);
                },
                ico_tb: function (node) {
                    var item = G.class.sitem(data.item);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                    item.setSwallowTouches(true);
                },
                txt_limit: function (node) {
                    if (data.buynum != -1) node.setString(X.STR(L('todaycs'), data.buynum));
                    else {
                        var item = G.class.sitem(data.item);
                        node.setString(item.conf.name);
                    }
                },
                txt_jb1: function (node) {
                    node.setVisible(data.sale < 10);
                    node.setString(data.need[0].n);
                },
                txt_jb: function (node) {
                    if (data.sale >= 10) node.y = 38;
                    node.setString(data.need[0].n * (data.sale / 10));
                },
                panel_limit: function (node) {
                    // node.setVisible(data.buynum != -1);
                }
            }, list.nodes);
            list.show();
            list.setPosition(0, 0);
            parent.addChild(list);
            list.setTouchEnabled(true);
            list.setSwallowTouches(false);
            list.noMove(function () {
                if (data.buynum == 0) return G.tip_NB.show(L('SELLOVER'));
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function() {
                        me.ajax("shop_buy", [me.curType, data.idx], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: [].concat(data.item)
                                }).show();
                                me.getData(function () {
                                    me.setTable();
                                });
                                me.showAttr();
                            }
                        });
                    },
                    richText: L("SFGM"),
                    sizeType: 3
                }).show();
            });
        }
    });

    G.frame[ID] = new fun('sale_xinghunshangdian.json', ID);
})();