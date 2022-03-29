/**
 * Created by
 */
(function () {
    //传说大厅
    var ID = 'csdt_main';
    var fun = X.bUi.extend({

        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.csdt;
            me.heroid = X.keysOfObject(me.conf.herodz)[0];

            me.selectedNeed = {
                0: [],
                1: [],
            };
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.initUi();
            me.upBtnShow(false);

            me.showToper();

            me.changeToperAttr({
                attr2: { a: 'item', t: '2093' }
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_lan.setTouchEnabled(false);
            me.nodes.btn_h.setTouchEnabled(false);
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
                btn_1: function (node) {
                    node.click(function (sender) {
                        me.upBtnShow(false);
                    });
                },
                btn_2: function (node) {
                    node.click(function (sender) {
                        return G.tip_NB.show(L("csdt3"))
                        // me.upBtnShow(true);
                    });
                },
                btn_dh: function (node) {
                    node.click(function (sender) {
                        G.frame.csdt_csdh.show();
                    });
                },
                btn_gz: function (node) {
                    node.click(function (sender) {
                        G.frame.help.data({
                            intr: L('TS108')
                        }).show();
                    });
                },
                panel_btn1: function (node) {
                    node.click(function (sender) {
                        var tid = me.selectedNeed[0].concat(me.selectedNeed[1]);
                        if (tid.length<1) return G.tip.show(L('未放入消耗物品'));
                        var allhero = G.DATA.yingxiong.list;
                        var ishave = false;
                        for (var i in allhero){
                            if (allhero[i].pinglunid == '7101'){
                                ishave = true;
                                break;
                            }
                        }
                        if (ishave){
                            G.frame.alert.data({
                                cancelCall:null,
                                okCall: function(){
                                    G.ajax.send("csdt_duanzhao", ['herodz', me.heroid, tid], function (str, data) {
                                        if (!data) return;
                                        if (data.s == 1) {
                                            G.class.ani.show({
                                                json: 'ani_chuanshuodating_baodian',
                                                addTo: me.nodes.panel_rw,
                                                repeat: false,
                                                autoRemove: true,
                                                onload: function () {
                                                    me.selectedNeed = {
                                                        0: [],
                                                        1: [],
                                                    };
                                                    me.downItem();
                                                },
                                                onend: function () {
                                                    G.frame.jiangli.once('close',function(){
                                                        me.updateAttr();
                                                    }).data({
                                                        prize: data.d.itemprize
                                                    }).show();
                                                }
                                            });
                                        }
                                    });
                                },
                                richText: '已拥有一个该英雄，是否确认合成这个英雄?',
                                sizeType: 3
                            }).show();
                        }else {
                            G.ajax.send("csdt_duanzhao", ['herodz', me.heroid, tid], function (str, data) {
                                if (!data) return;
                                if (data.s == 1) {
                                    G.class.ani.show({
                                        json: 'ani_chuanshuodating_baodian',
                                        addTo: me.nodes.panel_rw,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function () {
                                            me.selectedNeed = {
                                                0: [],
                                                1: [],
                                            };
                                            me.downItem();
                                        },
                                        onend: function () {
                                            G.frame.jiangli.once('close',function(){
                                                me.updateAttr();
                                            }).data({
                                                prize: data.d.itemprize
                                            }).show();
                                        }
                                    });
                                }
                            });
                        }

                    });
                },
                panel_btn2: function (node) {
                    node.click(function (sender) {
                        var tid = me.selectedNeed[0].concat(me.selectedNeed[1]);
                        // if (tid.length >= 2) {
                        G.frame.csdt_sxyl.show();
                        // } else {
                        //     G.tip_NB.show(L('csdt4'));
                        // }
                    });
                },
            }, me.nodes);
        },
        upBtnShow: function (isshow) {
            me = this;
            me.nodes.btn_1.setBright(isshow);
            me.nodes.btn_2.setBright(!isshow);
            var color = isshow ? cc.color('#8f5401') : cc.color('#ba987d');
            var color1 = !isshow ? cc.color('#8f5401') : cc.color('#ba987d');
            me.nodes.txet_1.setTextColor(color1);
            me.nodes.txet_2.setTextColor(color);

            if (!isshow) {
                me.downItem();
            }
        },
        downItem: function () {
            var me = this;
            me.updateAttr();
            var arr = [];
            for (var i = 0; i < 3; i++) {
                var list = me.nodes.list_wp.clone();
                me.setItem(list, i);
                arr.push(list);
            };
            X.center(arr, me.nodes.panel_wp1);
        },
        setItem: function (ui, idx) {
            var me = this;
            var ziduan = ['heroneed1', 'heroneed2', 'itemneed'];
            var arr = me.selectedNeed[idx];
            var conf = me.conf.herodz[me.heroid][ziduan[idx]];
            ui.show();
            X.autoInitUI(ui);
            X.render({
                txet_sl: function (node) {
                    if (conf.hid) {
                        var num = arr.length;
                        var maxnum = 1;
                        node.setString(num + "/" + maxnum);
                    } else {
                        var num = G.class.getOwnNum(conf[0].t, "item");
                        var maxnum = conf[0].n;
                        node.setString(num + "/" + conf[0].n);
                    }
                    var color = num >= maxnum ? cc.color("#1eff00") : cc.color("#f35352");
                    var outline = num >= maxnum ? "#002000" : "#95221e";
                    node.setTextColor(color);
                    X.enableOutline(node, outline, 2);
                },
                panel_wp: function (node) {
                    if (conf.hid) {
                        conf.hid = 61025;
                        var hero = G.DATA.yingxiong.list[me.selectedNeed[idx][0]]
                        var hid = (hero && hero.hid) || conf.hid;
                        var prize = [{ "a": "hero", "t": hid }];
                        X.alignItems(node, prize, 'left', {
                            touch: false,
                            mapItem: function (item) {
                                G.class.ui_star(item.panel_xx, (hero && hero.star) || conf.star, 0.8);
                                node.index = idx;
                                node.conf = conf;
                                node.need = {
                                    num: 1,
                                    t: conf.hid,
                                    star: conf.star
                                };
                                node.touch(function (sender, type) {
                                    G.frame.csdt_selectflag.data({
                                        need: sender.need,
                                        idx: sender.index,
                                        hid: sender.conf.hid,
                                        conf: sender.conf,
                                        IdxData: me.selectedNeed[sender.index],
                                        selectedData: me.selectedNeed,
                                    }).show();
                                });
                            }
                        });
                    } else {
                        var prize = [{ "a": "item", "t": conf[0].t }];
                        X.alignItems(node, prize, 'left', {
                            touch: true,
                        });
                    }

                },
                img_cs_jt: function (node) {
                    node.hide();
                },
                img_cs_jh: function (node) {
                    node.setVisible(idx != 2);
                    node.x = 135;
                },
            }, ui.nodes);
        },
        initUi: function () {
            var me = this;
            var heroconf = G.gc.hero[me.heroid];
            X.render({
                txet_1: function (node) {
                    node.setString(L('csdt1'));
                },
                txet_2: function (node) {
                    node.setString(L('csdt2'));
                },
                txet_name: function (node) {
                    node.setString(heroconf.name);
                },
                panel_tb: function (node) {
                    node.setScale(.5);
                    if (heroconf.zhongzu == 7) {
                        node.setBackGroundImage('img/public/ico/ico_zz11.png', ccui.Widget.PLIST_TEXTURE);
                    } else {
                        node.setBackGroundImage('img/public/ico/ico_zz' + (heroconf.zhongzu + 1) + '.png', ccui.Widget.PLIST_TEXTURE);
                    }
                },
                panel_xx: function (node) {
                    G.class.ui_star_mask(node, 15, 0.8);
                },
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        model: heroconf.tenstarmodel,
                        scaleNum: 1
                    });
                },
                panel_dh: function (node) {
                    // G.class.ani.show({
                    //     json: 'ani_chuanshuodating_fenwei',
                    //     addTo: node,
                    //     repeat: true,
                    //     autoRemove: false,
                    // });
                },
                panel_zy1: function (node) {
                    var jinbi = me.conf.herodz[me.heroid].duanzaoneed;
                    var img = new ccui.ImageView(G.class.getItemIco(jinbi[0].t), 1);
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L('yxzt4'), jinbi[0].n),
                        color: "#85492B",
                        node: img
                    });
                    img.y = 5;
                    rh.y = -10;
                },
            }, me.nodes);
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: G.class.getOwnNum(2093, "item"),
            }, me.nodes);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.changeToperAttr();
        },
    });
    G.frame[ID] = new fun('csdt_wp.json', ID);
})();