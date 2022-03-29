(function () {
    G.class.huodong_sybj = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._super('event_sybj.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.conf = JSON.parse(JSON.stringify(G.gc.stagefund.syzc));
            me.getData(function () {
                me.setContents()
            })
        },
        getData: function (callback) {
            var me = this;
            me.ajax('stagefund_open', ["syzc"], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        setContents: function () {
            var me = this;
            me.nodes.btn_buy.setVisible(!me.DATA.buy);
            me.nodes.btn_txt.setString(L("huodong_xx1"));
            me.nodes.wz_yjh.setVisible(me.DATA.buy);
            me.nodes.txt_cs.setString(parseInt(me.DATA.exp / me.conf.upflagexp));
            if (me.DATA.refreshtime - G.time > 24 * 3600) {
                me.nodes.txt_sj.setString(X.moment(me.DATA.refreshtime - G.time));
            } else {
                X.timeout(me.nodes.txt_sj, me.DATA.refreshtime, function () {
                    me.getData(function () {
                        me.setContents()
                    })
                });
            }
            var rh = new X.bRichText({
                size: 22,
                maxWidth: me.nodes.panel_title.width + 60,
                lineHeight: 24,
                family: G.defaultFNT,
                color: G.gc.COLOR.n5,
                eachText: function (node) {
                    X.enableOutline(node, '#000000');
                },
            });
            rh.text(L("huodong_sybj"));
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, me.nodes.panel_title.height);
            me.nodes.panel_title.addChild(rh);
            me.setTable();
        },
        setTable: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);
            var arr = []
            var keys = X.keysOfObject(me.conf.flagprize);
            for (var i = 0; i < keys.length; i++) {
                var obj = {};
                var obj = me.conf.flagprize[keys[i]];
                obj.i = keys[i];
                obj.next = keys[i - 1];
                arr.push(obj);
            }


            var table = me.table = new X.TableView(scrollview, me.nodes.panel_list, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0] + pos[1]);
            }, null, null, 1, 3);
            table.setData(arr);
            table.reloadDataWithScroll(true);
            table._table.tableView.setBounceable(false);
        },
        setItem: function (ui, data, index) {
            var me = this;
            X.autoInitUI(ui);
            ui.zIndex = index;
            if (ui.getParent()) {
                ui.getParent().zIndex = index;
            } else {
                ui.setTimeout(function () {
                    if (cc.isNode(ui)) {
                        ui.getParent().zIndex = index;
                    }
                }, 20);
            }

            X.render({
                ico_item1: function (node) {
                    var itemarr1 = [];


                    for (var i = 0; i < data.freeprize.length; i++) {
                        var paize = G.class.sitem(data.freeprize[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        paize.setGet(false);
                        if (X.inArray(me.DATA.free, data.i)) {
                            paize.setGet(true, "img_ysq_bg", "get");
                        }
                        itemarr1.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, itemarr1, 1, 10, 5);
                },
                btn_txt2:function(node){
                    var color = (!X.inArray(me.DATA.free, data.i) && (me.DATA.exp / me.conf.upflagexp)>=data.i)?"#2f5719":"#565656";
                    node.setTextColor(cc.color(color));
                },
                btn_l: function (node) {
                    node.setVisible(!X.inArray(me.DATA.free, data.i));
                    node.setBright(!X.inArray(me.DATA.free, data.i) && (me.DATA.exp / me.conf.upflagexp)>=data.i);

                    node.click(function (sender) {
                        me.ajax('stagefund_prize', ["syzc", data.i * 1], function (str, data) {
                            if (data.s == 1) {
                                G.hongdian.getData('stagefund',1,function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                me.DATA = data.d;
                                me.table.reloadDataWithScroll(false);
                            }
                        });
                    })
                    // node.click(function (sender) {
                    //     G.frame.
                    // })                     
                },
                btn_h: function (node) {
                    node.setVisible(!X.inArray(me.DATA.pay, data.i) && X.inArray(me.DATA.free, data.i))
                    node.click(function (sender) {
                        if (!me.DATA.buy) {
                            me.nodes.btn_buy.triggerTouch(2)
                            return
                        }
                        me.ajax('stagefund_prize', ["syzc", data.i * 1], function (str, data) {
                            if (data.s == 1) {
                                G.hongdian.getData('stagefund',1,function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show()
                                me.DATA = data.d;
                                me.table.reloadDataWithScroll(false);
                            }
                        });
                    })
                },
                ico_item2: function (node) {
                    var itemarr2 = [];
                    for (var i = 0; i < data.payprize.length; i++) {
                        var paize = G.class.sitem(data.payprize[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        paize.setGet(false);
                        if (me.DATA.buy == 0) {//未激活锁住
                            paize.setGet(true, "img_suo", "suo");
                            paize.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
                        } else {
                            paize.background.loadTexture("img/public/ico/ico_bg" + paize.conf.color + '.png', 1);
                            if (X.inArray(me.DATA.pay, data.i)) {
                                paize.setGet(true, "img_ysq_bg", "get");
                            }
                        }
                        itemarr2.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, itemarr2, 1, 10, 5);
                },
                img_ylq: function (node) {
                    node.setVisible(X.inArray(me.DATA.pay, data.i))
                },
                txt_jdwz: data.i,
                img_jdt: function (node) {
                    if (data.next) {
                        var lv = parseInt(me.DATA.exp / me.conf.upflagexp)
                        if (data.next - lv < 0) {
                            var p = 100
                        } else {
                            var p = (data.next - lv) / (lv - data.i) * 100
                        }
                  
                        node.setPercent(p)
                    }
                },
                img_jdt_tp: function () {
                    var lv = parseInt(me.DATA.exp / me.conf.upflagexp)
                    if(lv>= data.i){
                            
                        ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian1.png",1);
                    }else{
                        ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian2.png",1);

                    }

                },
                list_jdt1: function (node) {
                    if (data.i == 2) {
                        ui.nodes.list_jdt1.hide();

                    } else {
                        ui.nodes.list_jdt1.show();
                        ui.nodes.list_jdt1.y = 153;
                    }
                    ccui.helper.doLayout(node);

                    // node.setVisible(data.next != undefined)
                },
            }, ui.nodes);




        },
        onShow: function () {
            var me = this;
            me.bindBtn()
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_buy.click(function (sender) {
                G.frame.sybj_tqk.once("close", function () {
                    me.getData(function () {
                        me.setContents()
                    })
                }).data({
                    conf: me.conf,
                    data: me.DATA
                }).show();
            })
        },
    });
})();