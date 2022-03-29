/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //战魂奖励
    G.class.zhanhunlin = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("zhanhunlin.json", null, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.herotheme;
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview1);
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        initUi: function () {
            var me = this;
            me.ui.finds("Image_6").setTouchEnabled(true);
            var exp = me.DATA.flag.exp % me.conf.upflagexp
            X.render({
                img_jdt: function (node) {
                    node.setPercent(exp / me.conf.upflagexp * 100);
                },
                txt_jdtsz: function (node) {
                    node.setString(exp + "/" + me.conf.upflagexp)
                },
                txt_hdsj: function (node) {
                    X.timeout(node, G.DATA.asyncBtnsData.herotheme.etime, function () {
                        G.tip_NB.show(L('HUODONG_HD_OVER'));
                        me.remove();
                    }, null, {
                        showDay: true
                    });
                },
                fnt_z2: function (node) {
                    node.setString(me.lv);
                },
                btn_gmdj: function (node) {
                    node.hide();
                    // node.click(function () {
                    //     if(me.DATA.flag.buy == 0){
                    //         G.frame.zhanhunlin_tk2.data(me.lv).show();
                    //     }
                    // });
                },
                btn_djjj: function (node) {
                    node.click(function () {
                        if(me.DATA.flag.buy == 0){
                            G.frame.zhanhunlin_tk1.show();
                        }
                    });
                },
                btn_yjlq: function (node) {
                    node.click(function () {
                        G.ajax.send("herotheme_flagallprize", [], function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                G.frame.yxzt_zhl.view.DATA = data.d.myinfo;
                                me.setContents()
                                // me.remove();
                                G.hongdian.getData('herotheme',1,function () {
                                    G.frame.yingxiongzhuti.checkRedPoint();
                                    G.frame.yxzt_zhl.checkRedPoint();
                                });
                            }
                        });
                    });
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            me.lv = Math.floor(me.DATA.flag.exp / me.conf.upflagexp) + 1;
            me.initUi();
            me.setDown();
            var data = X.keysOfObject(me.conf.flagprize);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview1, me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setDown: function () {
            var me = this;
            var data;
            var id;
            for (var k in me.conf.flagprize) {
                if (k % 5 == 0) {
                    id = k;
                    data = me.conf.flagprize[k];
                    if (k > me.lv) {
                        break;
                    }
                }
            }
            X.render({
                fnt_z1: function (node) {
                    node.setString(id);
                },
                panel_wp4: function (node) {
                    X.alignItems(node, data.freeprize, 'left', {
                        touch: true,
                        // scale: 0.8,
                    });
                },
                panel_wp3: function (node) {
                    X.alignItems(node, data.payprize, 'left', {
                        touch: true,
                        // scale: 0.8,
                    });
                },
                btn_lq1: function (node) {
                    node.hide();
                },
                btn_receive1: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.yxzt_zhl.topMenu.changeMenu(2);
                        }
                    });
                },
                img_received1: function (node) {
                    node.hide();
                },
            }, me.nodes);
        },
        setItem: function (ui, id) {
            var me = this;
            var data = me.conf.flagprize[id];
            X.autoInitUI(ui);
            X.render({
                fnt_z: function (node) {
                    node.setString(id);
                },
                panel_wp2: function (node) {
                    X.alignItems(node, data.freeprize, 'left', {
                        touch: true,
                        // scale: 0.8,
                    });
                    if(X.inArray(me.DATA.flag.free, id)) {
                        var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                        ylq.setAnchorPoint(0.5, 0.5);
                        ylq.setPosition(node.width / 2, node.height / 2);
                        ylq.zIndex = 999999;
                        node.addChild(ylq);
                    }
                    if (!X.inArray(me.DATA.flag.free, id) && me.lv >= id){
                        G.setNewIcoImg(node)
                        G.class.ani.show({
                            json: "ani_qiandao",
                            addTo: node,
                            x: 60,
                            y: 45,
                            cache: true,
                            repeat: true,
                            autoRemove: false,
                            onload :function(node,action){
                                node.setScale(1.2);
                            }
                        });
                    } else {
                        G.removeNewIco(node);
                    }
                    node.id = id;
                    node.setTouchEnabled(true);
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            if (!X.inArray(me.DATA.flag.free, sender.id) && me.lv >= sender.id) {
                                G.ajax.send("herotheme_flagprize", [sender.id], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        me.DATA = data.d.myinfo;
                                        G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                        G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                        me.setContents()
                                        G.hongdian.getData('herotheme',1,function () {
                                            G.frame.yingxiongzhuti.checkRedPoint();
                                            G.frame.yxzt_zhl.checkRedPoint();
                                        });
                                    }
                                });
                            }
                        }
                    });
                },
                panel_wp1: function (node) {
                    X.alignItems(node, data.payprize, 'left', {
                        touch: true,
                        // scale: 0.8,
                        mapItem: function (item) {
                            if(X.inArray(me.DATA.flag.pay, id)) {
                                var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                                ylq.setAnchorPoint(0.5, 0.5);
                                ylq.setPosition(item.width / 2, item.height / 2);
                                ylq.zIndex = 999999;
                                item.addChild(ylq);
                            }
                        }
                    });
                },
                btn_lq: function (node) {
                    node.hide();
                    if (!X.inArray(me.DATA.flag.pay, id) && me.lv >= id && me.DATA.flag.buy == 1) {
                        node.show();
                        G.setNewIcoImg(node);
                        node.id = id;
                        node.finds('redPoint').setPosition(120,45);
                        node.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                G.ajax.send("herotheme_flagprize", [sender.id], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        me.DATA = data.d.myinfo;
                                        G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                        G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                        me.setContents();
                                        G.hongdian.getData('herotheme',1,function () {
                                            G.frame.yingxiongzhuti.checkRedPoint();
                                            G.frame.yxzt_zhl.checkRedPoint();
                                        });
                                    }
                                })
                            }
                        });
                    }else {
                        G.removeNewIco(node);
                    }
                },
                btn_receive: function (node) {
                    node.hide();
                    if(me.lv < id || me.DATA.flag.buy == 0){
                        node.show();
                    }
                    node.setTitleText(L("未完成"));
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            // G.frame.yxzt_zhl.topMenu.changeMenu(2);
                            G.tip_NB.show(L("yxzt27"))
                        }
                    });
                },
                img_received: function (node) {
                    if(X.inArray(me.DATA.flag.free, id) && X.inArray(me.DATA.flag.pay, id)){
                        node.show();
                    }else{
                        node.hide();
                    }
                },
                img_wjh: function (node) {
                    node.hide();
                    if(me.DATA.flag.buy == 0){
                        node.show();
                    }
                },
            }, ui.nodes);
        },
    });
})();