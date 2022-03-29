(function () {
    var ID = 'sybj_tqk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            //奖励总和
            me.DATA = G.gc.stagefund.syzc.flagprize;
            var prize = {};
            var allprize = [];
            var keys = X.keysOfObject(me.DATA);
            for (var i = 0; i < keys.length; i++) {
                for (var j = 0; j < me.DATA[keys[i]].freeprize.length; j++) {
                    if (prize[me.DATA[keys[i]].freeprize[j].t]) {
                        prize[me.DATA[keys[i]].freeprize[j].t].n += me.DATA[keys[i]].freeprize[j].n;
                    } else {
                        prize[me.DATA[keys[i]].freeprize[j].t] = { a: me.DATA[keys[i]].freeprize[j].a, n: me.DATA[keys[i]].freeprize[j].n };
                    }
                }
                for (var k = 0; k < me.DATA[keys[i]].payprize.length; k++) {
                    if (prize[me.DATA[keys[i]].payprize[k].t]) {
                        prize[me.DATA[keys[i]].payprize[k].t].n += me.DATA[keys[i]].payprize[k].n;
                    } else {
                        prize[me.DATA[keys[i]].payprize[k].t] = { a: me.DATA[keys[i]].payprize[k].a, n: me.DATA[keys[i]].payprize[k].n };
                    }
                }
            }
            for (var m in prize) {
                var item = { a: prize[m].a, t: m, n: prize[m].n };
                allprize.push(item);
            }
            for (var i = 0; i < allprize.length; i++) {
                var conf = G.class.getItemByType(allprize[i].t, allprize[i].a);
                if (conf.color >= 5) {
                    allprize[i].rank = 1;
                } else {
                    allprize[i].rank = 2;
                }
            }
            allprize.sort(function (a, b) {
                if (a.rank != b.rank) {
                    return a.rank < b.rank ? -1 : 1
                }
            });
            me.nodes.scrollview.hide();
            // me.nodes.scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
            // var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_wp, 1, function (ui, data) {
            //     me.setItem(ui, data);
            // }, cc.size(this.nodes.list_wp.width + 5, this.nodes.list_wp.height), null, 1, 0);
            // table.setData(allprize);
            // table.reloadDataWithScroll(true);
            me.nodes.btn_txt.setString(X.STR(L('DOUBLE9'), G.gc.stagefund.syzc.money / 100) + "激活")
            X.alignItems(me.nodes.panel_wp, allprize, "center", {
                touch: true,
                scale: 1
            });
        },
        setItem: function (ui, data) {
            var me = this;
            ui.removeAllChildren();
            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2, ui.height / 2)
            ui.addChild(item);
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
            me.nodes.btn_1.click(function (sender) {
                G.event.once('paysuccess', function () {
                    G.tip_NB.show(L("GMCG"));
                    G.hongdian.getData('stagefund',1,function () {
                        G.frame.huodong.checkRedPoint();
                    });
                    me.remove();
                });
                G.event.emit('doSDKPay', {
                    pid: G.gc.stagefund.syzc.proid,
                    logicProid: G.gc.stagefund.syzc.proid,
                    money: G.gc.stagefund.syzc.money,
                });
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('ui_tips_sytq.json', ID);
})();