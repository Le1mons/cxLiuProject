/**
 * Created by LYF on 2019/9/23.
 */
(function () {
    //爵位晋升
    var ID = 'juewei_up';

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
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.action.gotoFrameAndPlay(0, false);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.juewei;
            var com = G.gc.jueweicom;
            var curConf = conf[me.data().cur];
            var nextConf = conf[me.data().next];

            X.render({
                ico_juewei1: function (node) {
                    node.setBackGroundImage("img/juewei/" + curConf.ico + ".png", 1);
                },
                ico_juewei2: function (node) {
                    node.setBackGroundImage("img/juewei/" + nextConf.ico + ".png", 1);
                },
                txt_juewei_mz1: function (node) {
                    node.setString(curConf.name + (curConf.rank ? "+" + curConf.rank : ""));
                    node.setTextColor(cc.color(com.fontcolor[curConf.type] || "#ffffff"));
                    X.enableOutline(node, com.fontoulit[curConf.type] || "#ffffff", 1);
                },
                txt_juewei_mz2: function (node) {
                    node.setString(nextConf.name + (nextConf.rank ? "+" + nextConf.rank : ""));
                    node.setTextColor(cc.color(com.fontcolor[nextConf.type] || "#ffffff"));
                    X.enableOutline(node, com.fontoulit[nextConf.type] || "#ffffff", 1);
                }
            }, me.nodes);

            var buffKeys = Object.keys(curConf.buff);
            G.gc.sortBuff(buffKeys);
            var buffKeys1 = Object.keys(nextConf.buff);
            G.gc.sortBuff(buffKeys1);

            function f(key, txt, conf) {
                txt.setString(L(key) + "+" + (key.indexOf("pro") != -1 ? conf.buff[key] / 10 + "%" : conf.buff[key]))
            }

            for (var i = 0; i < 6; i ++) {
                var lay = me.nodes["panel_z_wz" + (i + 1)];
                var lay1 = me.nodes["panel_y_wz" + (i + 1)];
                var buffKey = buffKeys[i];
                var buffKey1 = buffKeys1[i];

                if (buffKey) {
                    f(buffKey, lay.children[1], curConf);
                } else {
                    lay.hide();
                }

                if (buffKey1) {
                    f(buffKey1, lay1.children[1], nextConf);
                } else {
                    lay1.hide();
                }
            }
        }
    });
    G.frame[ID] = new fun('juewei_jinsheng.json', ID);
})();