/**
 * Created by LYF on 2019/8/5.
 */
(function () {
    //遗物-详情
    var ID = 'relic_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.id = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents(me.ui, me.id);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function (ui, data) {
            var conf = G.gc.mazerelic[data];
            X.render({
                txt_nywz: conf.intro,
                txt_name: function (node) {
                    node.setString(conf.name);
                    node.setTextColor(cc.color(G.gc.COLOR['yw' + conf.color]));
                    X.enableOutline(node, "#000000", 1);
                },
                panel_zz: function (node) {
                    if (conf.zhongzu) {
                        node.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
                    } else if (conf.job) {
                        node.setBackGroundImage('img/public/ico_zy/zy_' + conf.job + '_x.png', 1);
                    } else {
                        node.hide();
                    }
                },
                ico_yw: function (node) {
                    node.setBackGroundImage("ico/relicico/" + conf.icon + ".png");
                }
            }, ui.nodes);
            ui.nodes.txt_nywz.setTextColor(cc.color("#fffbcc"));
            X.enableOutline(ui.nodes.txt_nywz, "#3d2b28", 2);

            ui.finds("Image_1").loadTexture("img/shendianmigong/img_sdmg_sz" + conf.color + ".png", 1);

            G.class.ani.show({
                json: "ani_shendianmigong_xuanzhong",
                addTo: ui.nodes.paneL_dh,
                x: ui.nodes.paneL_dh.width / 2,
                y: ui.nodes.paneL_dh.height / 2,
                repeat: true,
                autoRemove: false
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_ckyw.json', ID);
})();