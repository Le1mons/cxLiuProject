/**
 * Created by wfq on 2018/6/26.
 */
(function() {
    //公会-捐献
    var ID = 'gonghui_juanxian';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {
                action: true
            });
        },
        initUi: function() {
            var me = this;

            me.nodes.tip_title.setString(L('GHJX'));
        },
        bindBtn: function() {
            var me = this;

            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;

            new X.bView('gonghui_tip2_ghjx.json', function(view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);

                me.setContents();
            });
        },
        onHide: function() {
            var me = this;
        },
        refreshData: function() {
            var me = this;

            me.setContents();
        },
        setContents: function() {
            var me = this;

            me.setExp();
            me.setGongxian();
        },
        setExp: function() {
            var me = this;

            var panel = me._view;

            var exp = G.frame.gonghui_main.DATA.ghdata.exp;

            var arr = G.class.gonghui.getLvByExp(exp) || [50, 0];
            var maxExp = G.class.gonghui.getMaxExpBylv(arr[0]);
            var per = Math.floor(arr[1] / maxExp * 100);

            if (G.class.gonghui.checkIsMaxLv(arr[0])) {
                per = 100;
            }

            X.render({
                txt_lv: L('lv') + arr[0],
                img_jdt: function(node) {
                    node.setPercent(per);
                },
                time_jdt: per + '%'
            }, panel.nodes);
        },
        setGongxian: function() {
            var me = this;

            var panel = me._view;

            for (var i = 0; i < 3; i++) {
                var lay = panel.nodes['panel_' + (i + 1)];
                lay.removeAllChildren();

                var item = panel.nodes.panel_donate.clone();
                item.idx = i;
                me.setItem(item, i + 1);
                item.setPosition(cc.p(lay.width / 2, lay.height / 2));
                lay.addChild(item);
                item.show();
                item.nodes.txt_contribution.setTextColor(cc.color('#FFE9CD'));
                X.enableOutline(item.nodes.txt_contribution, '#711100', 2);
            }
        },
        setItem: function(ui, idx) {
            var me = this;

            X.autoInitUI(ui);

            var conf = G.class.gonghui.get().base.juanxian[ui.idx];

            X.render({
                bg_donate: function(node) {
                    node.loadTexture('img/gonghui/' + conf.img, 1);
                },
                img_treasure: function(node) {
                    node.loadTexture('img/gonghui/' + conf.icon, 1);
                    if(idx > 1) {
                        G.class.ani.show({
                            json: "ani_gonghui_juanzen_" + idx + "dang",
                            addTo: node,
                            x: node.width / 2,
                            y: node.height / 2 + 40,
                            repeat: true,
                            autoRemove: false,
                        })
                    }
                },
                txt_contribution: conf.name,
                img_received: function(node) {
                    node.hide();

                    if (G.frame.gonghui_main.DATA.juanxian == ui.idx) {
                        node.show();
                    }
                },
                btn_buy: function(node) {
                    node.setTouchEnabled(true);
                    node.setBright(true);
                    node.hide();
                    if (G.frame.gonghui_main.DATA.juanxian != undefined) {
                        if (G.frame.gonghui_main.DATA.juanxian != ui.idx) {
                            node.setTouchEnabled(false);
                            node.setBright(false);
                            node.finds('txt_buy').setTextColor(cc.color(G.gc.COLOR.n15));
                            node.show();
                        }
                    } else {
                        node.finds('txt_buy').setTextColor(cc.color(G.gc.COLOR.n12));
                        node.show();
                    }

                    var need = conf.need[0];
                    var ownNum = G.class.getOwnNum(need.t, need.a);
                    var num = need.n;
                    if(need.n == 10000){
                        num = '1万';
                    }
                    setTextWithColor(node.finds('txt_sl$'), num, G.gc.COLOR[ownNum >= need.n ? 'n1' : 'n16']);
                    X.enableOutline(node.finds('txt_sl$'), ownNum >= need.n ? '#272727' : '#740000', 1);
                    conf.name == '1' && node.finds('token_zs').loadTexture(G.class.getItemIco('jinbi'), 1);
                    node.data = ui.idx;
                    node.click(function(sender, type) {
                        G.frame.alert.data({
                            title: L("TS"),
                            cancelCall: null,
                            okCall: function () {
                                G.ajax.send('gonghui_juanxian', [sender.data], function(d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: [].concat(d.d.prize)
                                        }).show();
                                        G.frame.gonghui_main.DATA.ghdata.exp = d.d.exp || 0;
                                        G.frame.gonghui_main.DATA.juanxian = sender.data;
                                        G.hongdian.getData("gonghui", 1, function () {
                                            G.frame.gonghui_main.checkRedPoint();
                                        });
                                        me.refreshData();
                                        me.changeToperAttr({
                                            attr2:{a:'item',t:'2003'}
                                        });
                                    }
                                }, true);
                            },
                            richText: L("GHJXYC"),
                        }).show();
                    });
                }
            }, ui.nodes);
            var str = X.STR(L('gonghui_juanxian'),conf.prize[0].n);
            var img = new ccui.ImageView(G.class.getItemIco(2003),1);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: ui.nodes.txt_number.width,
                lineHeight:10,
                color: '#BE5E30',
                family: G.defaultFNT
            });
            rh.text(str, [img]);
            rh.setPositionX((ui.nodes.txt_number.width - rh.trueWidth()) / 2);
            ui.nodes.txt_number.addChild(rh);
        }
    });

    G.frame[ID] = new fun('gonghui_tip2.json', ID);
})();