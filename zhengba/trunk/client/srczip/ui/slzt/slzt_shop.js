(function () {
    var ID = 'slzt_shop';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            X.setHeroModel({
                parent: me.nodes.panel_csm,
                data: {},
                model: "52013",
                noRelease: true,
                cache: false
            });
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var data = me.data().data;
            me.nodes.txt_wzcs.removeAllChildren();
            X.centerLayout(me.nodes.txt_wzcs, {
                dataCount: data.itemlist.length,
                nodeWidth: me.nodes.txt_wzcs.width /data.itemlist.length,
                rowHeight: me.nodes.list.height,
                itemAtIndex: function (index) {
                    var node = me.nodes.list.clone();
                    node.show();
                    X.autoInitUI(node);
                    var shop = data.itemlist[index];
                    var widget = G.class.sitem(shop.item);
                    G.frame.iteminfo.showItemInfo(widget);
                    widget.setAnchorPoint(0, 0);
                    node.nodes.panel_yx.addChild(widget)
                    node.nodes.txt_yuanjia.setString(shop.need[0].n);
                    node.nodes.txt_zl.setString(parseInt(shop.need[0].n * shop.sale / 10));
                    node.finds("Image_3").loadTexture(G.class.getItemIco(shop.need[0].t), 1)
                    // widget.setScale(0.8);
                    node.nodes.btn_qw.setTouchEnabled(shop.buynum == -1 || shop.buynum > 0);
                    node.nodes.btn_qw.setBright(shop.buynum == -1 || shop.buynum > 0);
                    node.nodes.img_ysq.setVisible(shop.buynum != -1 &&  shop.buynum <  1);
                    if(shop.buynum == -1 || shop.buynum > 0){
                        node.nodes.txt_qw.setTextColor(cc.color(G.gc.COLOR.n13))
                    }else{
                        node.nodes.txt_qw.setTextColor(cc.color(G.gc.COLOR.n15))

                    }
                    node.nodes.txt_qw.setFontSize(22)
                    node.nodes.txt_qw.setPosition(node.nodes.btn_qw.width/2,node.nodes.btn_qw.height/2)
                    node.nodes.btn_qw.idx = index * 1;
                    node.nodes.btn_qw.click(function (sender) {
                        G.ajax.send('shilianzt_event', [me.data().idx, sender.idx], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                sender.setTouchEnabled(false);
                                G.frame.jiangli.once("close", function () {
                                 
                                }).data({
                                    prize: d.d.prize
                                }).show();
                                G.frame.slzt.DATA.mydata = d.d.mydata;
                                me.data().data = d.d.mydata.eventdata[me.data().idx];
                                me.setContents();
                            }
                        }, true);
                    })
                    return node;
                }
            });
        },
        onShow: function () {
            var me = this;
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
    G.frame[ID] = new fun('shilianzhita_tk3.json', ID);
})();