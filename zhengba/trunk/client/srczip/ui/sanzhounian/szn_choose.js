(function () {
    var ID = 'szn_choose';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.DATA.szn.lottery;
            me.chooseID = me.DATA.target * 1;
            me.setContents();

        },
        setContents: function () {
            var me = this;
            var conf = X.clone(G.class.szn.getAllTarget());
            var arr = [];
            for (var k in conf) {
                conf[k].key = k;
                arr.push(conf[k])
            }
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var useNum = me.DATA.targetrnum[data.key] || 0;
            X.render({
                libao_mz: X.STR(L('szn_7'), data.layer),
                ico_nr: function (node) {
                    // var arr = [];
                    // data.targetprize.forEach(function name(item, idx) {
                    //     arr.push(item[0]);
                    // });
                    node.removeAllChildren();
                    var clnode = me.nodes.ico_list.clone();
                    node.addChild(clnode);
                    clnode.setPosition(clnode.width / 2 + 3, node.height / 2);
                    clnode.show()
                    X.autoInitUI(clnode);
                    var color1,color2,color3;
                    if(data.num - useNum > 0){
                        color1 = "#30ff01";
                        color2 = "#ffffff";
                        color3 = "#ffffff";
                    }else{
                        color1 = "#eb3a3a";
                        color2 = "#eb3a3a";
                        color3 = "#eb3a3a";

                    }
                    var rh = X.setRichText({
                        str: X.STR(L('szn_28'),color1,data.num - useNum,color2,color3,data.num),
                        parent: clnode.nodes.txt_sl,
                        maxWidth: 300,
                        color: "#f6ebcd",
                        outline: "#000000"
                    });
                    rh.setPosition(clnode.nodes.txt_sl.width/2 - rh.trueWidth()/2, clnode.nodes.txt_sl.height / 2 - rh.trueHeight() / 2-3);

                    X.alignItems(clnode.nodes.panel_ico, [data.prize], "left", {
                        scale: 1,
                        mapItem: function (item) {
                            if (me.chooseID == data.key) {

                                item.setGou(true)
                                me.chooseNode = item;
                            }
                            item.setTouchEnabled(true);
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_NOMOVE) {
                                    if(data.num - useNum <= 0 )return;
                                    me.chooseID = data.key;
                                    me.clickLayer = data.layer
                                    me.table.reloadDataWithScroll(false);

                                }
                            })

                        },
                    });
                },
                img_mc: function (node) {
                    // node.setVisible(me.DATA.layer < data.layer);
                    // node.setTouchEnabled(true)
                }
            }, ui.nodes)
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            });
            me.nodes.btn_xz.click(function (sender) {
                if (me.chooseID == -1) {
                    G.tip_NB.show(L("szn_8"))
                    return
                };
                if(me.clickLayer > me.DATA.layer){
                    G.tip_NB.show(X.STR(L('szn_29'),me.clickLayer ))
                    return
                }
                me.data().callback && me.data().callback(me.chooseID);
                me.remove();
            });
            me.nodes.btn_xq.click(function (sender) {
                if (me.chooseID == -1) {
                    G.tip_NB.show(L("szn_8"))
                    return
                };
                G.frame.iteminfo.data(me.chooseNode).show();

            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_tip_zjbz.json', ID);
})();