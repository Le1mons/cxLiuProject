/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //战魂任务
    G.class.zhanhunlin_th = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("zhanhunlin_th.json", null, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.herotheme;
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        initUi: function () {
            var me = this;
            var exp = me.DATA.flag.exp % me.conf.upflagexp
            X.render({
                img_jdt: function (node) {
                    // node.setPercent(exp / me.conf.upflagexp * 100);
                    node.percent = exp / me.conf.upflagexp * 100;
                },
                txt_jdtsz: function (node) {
                    node.setString(exp + "/" + me.conf.upflagexp);
                    node.zIndex = 2;
                },
                txt_hdsj: function (node) {
                    X.timeout(node, G.DATA.asyncBtnsData.herotheme.etime, function () {
                        G.tip_NB.show(L('HUODONG_HD_OVER'));
                        me.remove();
                    }, null, {
                        showDay: true
                    });
                },
                fnt_z1: function (node) {
                    node.setString(me.lv);
                },
                btn_gmdj: function (node) {
                    node.hide();
                    // node.click(function () {
                    //     G.frame.zhanhunlin_tk2.data(me.lv).show();
                    // });
                },
            }, me.nodes);
        },
        setContents: function () {
            var me = this;
            me.lv = Math.floor(me.DATA.flag.exp / me.conf.upflagexp) + 1;
            me.initUi();
            var data = X.keysOfObject(me.conf.task);
            if (!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list1, 1, function (ui, data) {
                    me.setItem(ui, data)
                }, null, null, 1);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, id) {
            var me = this;
            var conf = me.conf.task[id];
            var num = me.DATA.task.data[id] || 0;
            X.autoInitUI(ui);
            X.render({
                txt_name: function (node) {
                    node.setString(X.STR(conf.desc, conf.pval));
                },
                txt_jdt: function (node) {
                    var maxnum = num > conf.pval ? conf.pval : num;
                    node.setString(maxnum + "/" + conf.pval);
                },
                img_jdt1: function (node) {
                    node.setPercent((num / conf.pval) * 100);
                },
                panel_wp1: function (node) {
                    X.alignItems(node, conf.prize, 'left', {
                        touch: true,
                        scale: 0.8,
                    });
                },
                img_received: function (node) {
                    node.hide();
                    if (X.inArray(me.DATA.task.rec, id)) {
                        node.show();
                    }
                },
                btn_receive: function (node) {
                    node.setTitleText(L('yxzt26'))
                    node.hide();
                    if (!X.inArray(me.DATA.task.rec, id) && num < conf.pval) {
                        node.show();
                        // node.touch(function (sender, type) {
                        //     if (type == ccui.Widget.TOUCH_NOMOVE) {
                        //         if(conf.tiaozhuan){
                        //             X.tiaozhuan(conf.tiaozhuan)
                        //         }
                        //     }
                        // })
                    }
                },
                btn_lq: function (node) {
                    node.hide();
                    if (!X.inArray(me.DATA.task.rec, id) && num >= conf.pval) {
                        node.show();
                        G.setNewIcoImg(node);
                        node.finds('redPoint').setPosition(120, 45);
                        node.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                G.ajax.send("herotheme_receive", [id], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        me.DATA = data.d.myinfo;
                                        G.frame.yingxiongzhuti.DATA.myinfo = data.d.myinfo;
                                        G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                        me.setContents();
                                        G.hongdian.getData('herotheme', 1, function () {
                                            G.frame.yingxiongzhuti.checkRedPoint();
                                            G.frame.yxzt_zhl.checkRedPoint();
                                        });
                                    }
                                });
                            }
                        })
                    } else {
                        G.removeNewIco(node);
                    }
                },
            }, ui.nodes);
        },
    });
})();