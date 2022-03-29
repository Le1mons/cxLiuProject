/**
/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    G.event.on("attrchange_over", function () {
        if(G.frame.buluozhanqi.isShow) {
            G.frame.buluozhanqi.showAttr();
        }
    });

    //部落战旗
    var ID = 'buluozhanqi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('buluozhanqi'))
            });

            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_ph.click(function () {

                G.frame.help.data({
                    intr:L("TS36")
                }).show();
            });

            me.nodes.btn_fh.click(function () {

                if(me.view.nodes.panel_qieh1 && !me.view.nodes.panel_qieh1.visible) {
                    me.view.nodes.panel_qieh1.setVisible(true);
                    me.view.nodes.panel_qieh2.setVisible(false);
                } else {
                    me.remove();
                }
            });

            me.nodes.btn_jia1.click(function () {

                G.frame.dianjin.show();
            });

            me.nodes.btn_jia2.click(function () {

                G.frame.chongzhi.show();
            });
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.flag;

            for (var i = 0; i < me.nodes.listview.children.length; i ++) {

                if (i == 2) continue;
                if(X.inArray(data, i)) {
                    G.setNewIcoImg(me.nodes.listview.children[i], .95);
                    me.nodes.listview.children[i].getChildByName("redPoint").setPosition(105, 60);
                } else {
                    G.removeNewIco(me.nodes.listview.children[i]);
                }
            }

            if (X.inArray(data, 2) || X.inArray(data, "week")) {

                G.setNewIcoImg(me.nodes.listview.children[2], .95);
                me.nodes.listview.children[2].getChildByName("redPoint").setPosition(105, 60);
            } else {
                G.removeNewIco(me.nodes.listview.children[2]);
            }
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.showAttr();
            me.topMenu.changeMenu(1);
            me.checkRedPoint();
        },
        onHide: function () {
            var me = this;
        },
        showAttr: function () {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        changeType: function (sender) {
            var me = this;
            var type = me.type = sender.data.id;
            var viewConf = {
                1: G.class.buluozhanqi_zqjl,
                2: G.class.buluozhanqi_mrtz,
                3: G.class.buluozhanqi_mztz,
                4: G.class.buluozhanqi_zjtz
            };

            var view = new viewConf[type](type - 1);
            me.nodes.panel_nr.addChild(view);

            if (me.view) me.view.removeFromParent();
            me.view = view;
        },
        getInfo: function (callback) {
            var me = this;
            
            me.ajax("flag_open", [], function (str, data) {
                if(data.s == 1) {
                    if (G.DATA.blzq_lv != undefined && data.d.lv > G.DATA.blzq_lv) {
                        if(data.d.lv % 10 == 0 && !data.d.jinjie) {
                            G.frame.buluozhanqi_buystep.data({
                                showBtn: true,
                                section: [G.DATA.blzq_lv + 1, data.d.lv],
                                key: 'base'
                            }).show();
                        } else {
                            G.frame.buluozhanqi_zqsj.data(data.d.lv).show();
                        }
                        G.hongdian.getData("flag", 1, function () {
                            G.frame.buluozhanqi.checkRedPoint();
                        });
                    }
                    G.DATA.blzq_prize = data.d.prize;
                    G.DATA.blzq_lv = data.d.lv;
                    me.DATA = data.d;
                    callback && callback(data.d);
                }
            });
        },
        initScrollView: function (scrollView, list, other) {
            var me = this;

            if( !other.table ) {
                other.table = new X.TableView(scrollView, list, 1, function (ui, data) {

                    me.setItem(ui, data)
                });
                other.table.setData(me.view.DATA);
                other.table.reloadDataWithScroll(true);
            } else {
                other.table.setData(me.view.DATA);
                other.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var conf = G.gc.flag.base.task[me.type - 1][data.id];

            ui.setTouchEnabled(false);
            X.autoInitUI(ui);
            X.render({
                txt_name: X.STR(conf.desc, conf.pval),
                img_received: function (node) {
                    if (data.finish) node.show();
                    else node.hide();
                },
                panel_wp1: function (node) {
                    node.setTouchEnabled(false);

                    X.alignItems(node, conf.prize, "left", {
                        touch: true,
                        scale: .9
                    });
                },
                btn_lq: function (node) {
                    if (!data.finish && data.nval >= conf.pval) {
                        node.show();
                        G.setNewIcoImg(node, .9);
                    } else {
                        node.hide();
                        G.removeNewIco(node);
                    }

                    node.click(function () {

                        me.ajax("flag_receive", [data.id], function (str, dd) {
                            if(dd.s == 1) {
                                G.frame.jiangli.data({
                                    prize: dd.d.prize,
                                }).once("hide", function () {
                                    me.getInfo();
                                }).show();

                                me.view.refreshView();

                                G.hongdian.getData("flag", 1, function () {
                                    G.frame.buluozhanqi.checkRedPoint();
                                });
                            }
                        });
                    });
                },
                btn_receive: function (node) {
                    if (data.nval < conf.pval) node.show();
                    else node.hide();

                    node.click(function () {

                        X.tiaozhuan(conf.tzid);
                        me.remove();
                    });
                },
                txt_jdt: function (node) {
                    node.setString(data.nval + "/" + conf.pval);
                    X.enableOutline(node, "#66370e", 2);
                },
                img_jdt: function (node) {
                    node.setPercent(data.nval / conf.pval * 100);
                }
            }, ui.nodes);
        },
        setTime: function () {//第二天凌晨00:00:00 + 2秒刷新红点
            var me = this;
            var timeTxt = new ccui.Text();

            X.timeout(timeTxt, X.getTodayZeroTime() + 24 * 3600 + 2,function () {
                G.hongdian.getData("flag", 1, function () {
                    G.frame.buluozhanqi.checkRedPoint();
                });
            });
        }
    });
    G.frame[ID] = new fun('bulouzhanqi.json', ID);
})();