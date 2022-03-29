(function(){
    var ID = 'mjhj_uplv';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.DATA = me.data();
            me.CONF = G.gc.hero[me.DATA.hid];
            me.nodes.txt_title.setString(me.DATA.lv == 0 ? L("JZJH") : L("JZSJ"));

            me.nodes.btn_confirm.click(function () {
                var zhanli = P.gud.maxzhanli;
                me.ajax('mjhj_up', [me.CONF.pinglunid, ''], function (str, data) {
                    if (data.s == 1) {
                        G.frame.yxjz.DATA.info[me.CONF.pinglunid].lv ++;
                        G.frame.yxjz.fmtItemList();
                        G.frame.yxjz.refreshRedPoint();
                        me.remove();
                        G.hongdian.getData("mjhj", 1, function () {
                            G.frame.chouka.checkRedPoint();
                        });

                        P.gud.maxzhanli > zhanli && G.class.ani.show({
                            json: "ani_zhandouli_bianhua",
                            addTo: cc.director.getRunningScene(),
                            x: C.WS.width / 2,
                            y: C.WS.height / 2 + (C.WS.height / 2) / 2,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                X.autoInitUI(node);
                                node.action = action;
                                node.nodes.fnt.setString(L("ZDL") + ":" + P.gud.maxzhanli);
                                node.nodes.txt_zlts.setString("+" + 0);
                                var index = 1;
                                var addPower = P.gud.maxzhanli - zhanli;
                                node.nodes.txt_zlts.setTimeout(function () {
                                    var n = parseInt(addPower / 10) < 1 ? 1 : parseInt(addPower / 10);
                                    node.nodes.txt_zlts.setString("+" + index * n);
                                    index ++;
                                    if(index * n >= addPower) node.nodes.txt_zlts.setString("+" + addPower);
                                }, 75, 11);
                                action.playWithCallback("in", false, function () {
                                    action.playWithCallback("xunhuan", false, function () {
                                        action.playWithCallback("out", false, function () {
                                            node.removeFromParent(true);
                                        });
                                    });
                                });
                            }
                        });
                    }
                });
            });
        },
        onShow: function () {
            var me = this;

            if (me.DATA.lv == G.gc.mjhj.upinfo.length) {
                me.state2();
            } else {
                me.state1();
            }
            me.nodes.zhuangtai1.setVisible(me.DATA.lv < G.gc.mjhj.upinfo.length);
            me.nodes.zhuangtai2.setVisible(me.DATA.lv >= G.gc.mjhj.upinfo.length);
        },
        state1: function () {
            var me = this;
            var buff = G.gc.mjhj.buffinfo[me.CONF.huijuantype][me.DATA.lv];
            var buff1 = G.gc.mjhj.buffinfo[me.CONF.huijuantype][me.DATA.lv + 1];

            X.render({
                txt_1: me.CONF.name,
                txt_2: me.CONF.name,
                ico1: function (node) {
                    var hero = G.class.shero(me.CONF);
                    hero.setPosition(node.width / 2, node.height / 2);
                    G.class.ui_star(hero.panel_xx, me.DATA.lv, .7, {interval:-4});
                    node.addChild(hero);
                },
                ico2: function (node) {
                    var hero = G.class.shero(me.CONF);
                    hero.setPosition(node.width / 2, node.height / 2);
                    G.class.ui_star(hero.panel_xx, me.DATA.lv + 1, .7, {interval:-4});
                    node.addChild(hero);
                },
                qtgj_sz1: buff.atk,
                qtgj_sz2: buff1.atk,
                qtsm_sz1: buff.hp,
                qtsm_sz2: buff1.hp,
                wz_shuoming: X.STR(L(me.DATA.lv == 0 ? 'MJHJ_1' : 'MJHJ_2'),
                    me.DATA.num, G.gc.mjhj.upinfo[me.DATA.lv].getnum, me.CONF.name)
            }, me.nodes);

            me.nodes.btn_confirm.setEnableState(me.DATA.num >= G.gc.mjhj.upinfo[me.DATA.lv].getnum);
            me.nodes.btn_confirm.children[0].setString(me.DATA.lv == 0 ? L("JIHUO") : L("pettip4"));
            me.nodes.btn_confirm.children[0].setTextColor(me.DATA.num >= G.gc.mjhj.upinfo[me.DATA.lv].getnum ? cc.color('#2f5719')
                : cc.color("#6c6c6c"));
        },
        state2: function () {
            var me = this;
            var buff = G.gc.mjhj.buffinfo[me.CONF.huijuantype][me.DATA.lv];
            X.render({
                ico3: function (node) {
                    var hero = G.class.shero(me.CONF);
                    hero.setPosition(node.width / 2, node.height / 2);
                    G.class.ui_star(hero.panel_xx, me.DATA.lv, .7, {interval:-4});
                    node.addChild(hero);
                },
                txt_3: me.CONF.name,
                qtgj_sz3: buff.atk,
                qtsm_sz3: buff.hp
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun("yingxiongjuanzhou_jh.json", ID);
})();