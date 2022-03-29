(function () {
    var ID = 'syzc_jl';
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
            me.nodes.tip_title.setString(L("奖励"))
            new X.bView('shiyuan_tk1.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.bindBtn()

            });
        },

        onAniShow: function () {
            var me = this;
        },
        changetype: function (type) {
            var me = this;
            if (me.type == type) return;
            if (type==1){
                me._view.nodes.btn_h.loadTextureNormal('img/public/btn/btn1_on.png',1);
                me._view.nodes.btn_l.loadTextureNormal('img/public/btn/btn2_on.png',1);
                me._view.nodes.btn_txt1.setTextColor(cc.color('#2f5719'));
                me._view.nodes.btn_txt2.setTextColor(cc.color('#7b531a'));
            } else {
                me._view.nodes.btn_h.loadTextureNormal('img/public/btn/btn2_on.png',1);
                me._view.nodes.btn_l.loadTextureNormal('img/public/btn/btn1_on.png',1);
                me._view.nodes.btn_txt2.setTextColor(cc.color('#2f5719'));
                me._view.nodes.btn_txt1.setTextColor(cc.color('#7b531a'));
            }
            me.type = type;
            me.setContents(true)
        },
        setContents: function (bool) {
            var me = this;
            me.setRed()
            var data = me.getdata();
            data.forEach(function name(item, idx) {
                item.idx = idx
            })
            data.sort(function (a, b) {
                return X.inArray(me.DATA.got, a.idx) - X.inArray(me.DATA.got, b.idx)
            });
            if (!me.table) {
                cc.enableScrollBar(me._view.nodes.scrollview, false);
                var table = me.table = new X.TableView(me._view.nodes.scrollview, me._view.nodes.list_rank, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] + pos[1]);
                }, null, null, 8, 10);
                table.setData(data);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(bool || false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui)
            X.render({
                panel_wp: function (node) {
                    X.alignItems(node, data.prize, "left", {
                        touch: true,
                        scale: .8,
                        interval:5
                    });
                },
                btn_qd: function (node) {
                    node.setVisible(!X.inArray(me.DATA.got, data.idx))
                    node.setTouchEnabled( me.DATA.layer >= data.pval)
                    node.setBright( me.DATA.layer >= data.pval)
                    if(me.DATA.layer >= data.pval){
                        ui.nodes.txt_qd.setTextColor(cc.color("#2f5919"))
                    }else{
                        ui.nodes.txt_qd.setTextColor(cc.color("#6c6c6c"))

                    }
                    node.click(function (sender) {
                        me.getPrize(data.idx)
                    })
                },
                scrollview1: function (node) {
                    node.hide();
                },
                img_ylq: function (node) {
                    node.setVisible(X.inArray(me.DATA.got, data.idx))
            
                },
                txt_name: function (node) {
                    node.removeAllChildren()
                    var str = X.STR(data.intr, me.DATA.layer < data.pval ? "#4f4f4f" : "#189400", me.DATA.layer, data.pval);
                    var rh = new X.bRichText({
                        size: 20,
                        maxWidth: node.width,
                        lineHeight: 20,
                        color: "#804326",
                        family: G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0, node.height - rh.height));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
            }, ui.nodes)

        },
        getPrize: function (idx) {
            var me = this;
            if (me.type == 1) {
                me.ajax("syzc_getprize", [idx], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        G.DATA.shiyuanzhanchang.layerrec.push(idx);
                        me.setContents()
                        
                    }
                });
            } else {
                me.ajax("syzc_getlayerprize", [idx], function (str, data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        G.DATA.shiyuanzhanchang.toplayerrec.push(idx);
                        me.setContents()
                    }
                });
            }
        },
        getdata: function () {
            var me = this;
            if (me.type == 1) {
                me.DATA = {
                    layer: G.DATA.shiyuanzhanchang.layernum,
                    got: G.DATA.shiyuanzhanchang.layerrec
                }
                return JSON.parse(JSON.stringify(G.gc.syzccom.layerprize))
            } else {
                me.DATA = {
                    layer: G.DATA.shiyuanzhanchang.toplayer,
                    got: G.DATA.shiyuanzhanchang.toplayerrec
                }
                return JSON.parse(JSON.stringify(G.gc.syzccom.toplayerprize))

            }
        },
        setRed: function () {
            var me = this;
            var conf = G.gc.syzccom.layerprize;
            var layer1 = G.DATA.shiyuanzhanchang.layernum
            var got1 = G.DATA.shiyuanzhanchang.layerrec
            G.removeNewIco(me._view.nodes.btn_h);
            G.removeNewIco(me._view.nodes.btn_l);
            for (var i = 0; i < conf.length; i++) {
                if (layer1 >= conf[i].pval && !X.inArray(got1, i)) {
                    G.setNewIcoImg(me._view.nodes.btn_h,0.9)
                    break
                }
            }
            var layer2 = G.DATA.shiyuanzhanchang.toplayer
            var got2 = G.DATA.shiyuanzhanchang.toplayerrec
            var conf1 = G.gc.syzccom.toplayerprize;
            for (var i = 0; i < conf1.length; i++) {
                if (layer2 >= conf1[i].pval && !X.inArray(got2, i)) {
                    G.setNewIcoImg(me._view.nodes.btn_l,0.9)
                    break

                }
            }

        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
            me._view.nodes.btn_h.click(function (sender) {
                me.changetype(1)
            });
            me._view.nodes.btn_l.click(function (sender) {
                me.changetype(2)
            });
            me._view.nodes.btn_h.triggerTouch(2);
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();  