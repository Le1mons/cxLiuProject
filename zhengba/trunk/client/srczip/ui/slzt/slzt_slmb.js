(function () {
    var ID = 'slzt_slmb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var conf = JSON.parse(JSON.stringify(G.class.slzt.getTask()));
            conf.forEach(function name(item, idx) {
                item.idx = idx;
            });
            conf.sort(function (a, b) {
                return X.inArray(G.slzt.reclist, b.idx) - X.inArray(G.slzt.reclist, a.idx);
            });
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(conf);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(conf);
                me.table.reloadDataWithScroll(false);

            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                txt_name: data.intr + X.STR(L('slzt_tip5'), G.slzt.mydata.layernum > data.pval ? data.pval : G.slzt.mydata.layernum,data.pval ),
                img_item: function (node) {
                    X.alignItems(node, data.prize, "left", {
                        touch: true
                    });

                },
                btn_receive: function (node) {
                    node.setTouchEnabled(!X.inArray(G.slzt.reclist, data.idx) && G.slzt.mydata.layernum >= data.pval)
                    node.setBright(!X.inArray(G.slzt.reclist, data.idx) && G.slzt.mydata.layernum >= data.pval)
                    node.click(function (sender) {
                        G.ajax.send('shilianzt_getprize', [data.idx], function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.slzt.reclist = data.d.reclist;
                                me.setContents();
                            }
                        });
                    })
                    if(!X.inArray(G.slzt.reclist, data.idx) && G.slzt.mydata.layernum >= data.pval){
                        node.setTitleColor(cc.color(G.gc.COLOR.n13))

                    }else{

                        node.setTitleColor(cc.color(G.gc.COLOR.n15))

                    }
                    if(X.inArray(G.slzt.reclist, data.idx) ){
                        node.setTitleText(L('YLQ'))

                    }else{
                        node.setTitleText(L('LQ'))

                    }
                },
            }, ui.nodes)
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
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
    G.frame[ID] = new fun('shilianzhita_tk5.json', ID);
})();