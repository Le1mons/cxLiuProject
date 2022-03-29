/**
 * Created by
 */
(function () {
    //
    var ID = 'lianhunta_tz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.DATA = me.data();

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.text_guanqia.setString(L("GQXX"));
            X.render({
                text_guanqia: L("GQXX"),
                text_sw: me.DATA.conf.name,
                text_zdl1: X.fmtValue(me.DATA.data.maxzhanli),
                panel_ico1: function (node) {
                    var hero = [];
                    for (var data of me.DATA.data.herolist) {
                        if (!data.hid) continue;
                        var wid = G.class.shero(data);
                        hero.push(wid);
                    }
                    X.center(hero, node, {
                        scale: .85
                    });
                },
                btn_zd: function (node) {
                    node.click(function () {
                        me.ajax('lianhunta_borrowlist', [], function (str, data) {
                            if (data.s == 1) {
                                var hero = JSON.parse(JSON.stringify(G.DATA.yingxiong.list));
                                cc.each(data.d.list, function (_d, index) {
                                    if (!X.inArray(G.frame.lianhunta.DATA.borrowuid, _d.uid)) {
                                        _d.v[0].tid = _d.uid;
                                        hero[_d.uid] = _d.v[0];
                                    }
                                });
                                var borrownum = G.gc.lhtcom.borrownum - G.frame.lianhunta.DATA.borrowuid.length;
                                G.frame.yingxiong_fight.data({
                                    pvType: 'lht',
                                    id: me.DATA.id,
                                    heroList: hero,
                                    helpList: data.d.list,
                                    borrownum: borrownum,
                                    title: X.STR(L('lht_zjyx'), borrownum)
                                }).show();
                            }
                        });
                    });
                }
            }, me.nodes);

            cc.each(me.DATA.data.starcond, function (conf, id) {
                var list = me.nodes.list.clone();
                var parent = me.nodes['panel_tj' + id];
                var isFinish = G.frame.lianhunta.DATA.layerstar[me.DATA.id] && X.inArray(G.frame.lianhunta.DATA.layerstar[me.DATA.id], id);

                X.autoInitUI(list);
                X.render({
                    text_tj: L("cond") + id,
                    ico_xx: function (node) {
                        var imgPath = 'img_xx2';
                        if (isFinish) {
                            imgPath = 'img_xx';
                        }
                        node.setBackGroundImage('img/lianhunta/' + imgPath + '.png', 1);
                    },
                    text_tgtj: function (node) {
                        node.setString(G.frame.lianhunta_gk.getCondShow(conf));
                        node.setTextColor(cc.color('#804326'));
                    },
                    panel_wp: function (node) {
                        X.alignCenter(node, me.DATA.conf.prizeinfo[id], {
                            touch: true,
                            mapItem: function (node) {
                                node.setGet(isFinish, 'img_yhd2');
                            }
                        });
                    }
                }, list.nodes);
                list.show();
                list.setPosition(parent.width / 2, 0);
                parent.addChild(list);
            });
        }
    });
    G.frame[ID] = new fun('lianhunta_tk1.json', ID);
})();