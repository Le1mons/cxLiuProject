/**
 * Created by LYF on 2019/9/23.
 */
(function () {
    //爵位预览
    var ID = 'jueweiyulan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.listview.setTouchEnabled(true);
            cc.enableScrollBar(me.nodes.listview);
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

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        getData: function () {
            var arr = [];
            var obj = {};
            var keys = Object.keys(G.gc.juewei);

            keys.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            for (var index = 0; index < keys.length; index ++) {
                var id = keys[index];
                var conf = G.gc.juewei[keys[index]];

                if (obj[conf.type] == undefined) obj[conf.type] = id;
            }

            var keyArr = Object.keys(obj);
            keyArr.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });
            for (var i = 0; i < keyArr.length; i ++) {
                arr.push(obj[keyArr[i]]);
            }

            return arr;
        },
        setContents: function () {
            var me = this;
            var data = me.getData();

            for (var i = 0; i < data.length; i ++) {
                me.setItem(data[i]);
            }
        },
        setItem: function (id) {
            var me = this;
            var conf = G.gc.juewei[id];
            var list = me.nodes.list.clone();
            var buffKeys = Object.keys(conf.buff);
            G.gc.sortBuff(buffKeys);

            list.show();
            X.autoInitUI(list);
            X.render({
                txt_yzjc: function (node) {
                    node.setString(conf.name + (conf.rank ? "+" + conf.rank : ""));
                    node.setTextColor(cc.color("#fdd464"));
                }
            }, list.nodes);

            for (var i = 0; i < 6; i ++) {
                var lay = list.nodes["txt_jcsz" + (i + 1)];
                var buffKey = buffKeys[i];
                if (buffKey) {
                    me.showBuff(lay, conf.buff, buffKey);
                }
            }

            me.nodes.listview.pushBackCustomItem(list);
        },
        showBuff: function (lay, buff, key) {

            var rh = X.setRichText({
                str: "<font color=#ffe8c0>" + L(key) + "</font>" +
                    "+" + (key.indexOf("pro") != -1 ? buff[key] / 10 + "%" : buff[key]),
                parent: lay,
                size: 20,
                color: "#1c9700",
                maxWidth: 200
            });
            rh.setPosition(0, lay.height / 2 - rh.trueHeight() / 2);
        }
    });
    G.frame[ID] = new fun('juewei_top.json', ID);
})();