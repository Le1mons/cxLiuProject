/**
 * Created by LYF on 2019/8/1.
 */
(function () {
    //遗物
    var ID = 'relic';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
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

            me.setTable();
        },
        onHide: function () {
            var me = this;
        },
        setTable: function () {
            var me = this;
            var arr = [];
            var conf = G.gc.mazerelic;
            var data = G.frame.maze.DATA.data.relic;

            for (var key in data) {
                for (var i = 0; i < data[key]; i ++) {
                    arr.push(key);
                }
            }

            arr.sort(function (a, b) {
                if (conf[a].color != conf[b].color) {
                    return conf[a].color > conf[b].color ? -1 : 1;
                } else return  a * 1 > b * 1 ? -1 : 1;
            });

            cc.enableScrollBar(me.nodes.scrollview);
            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 4, function (ui, data) {
                me.setItem(ui, data);
            }, null, null);
            table.setData(arr);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var conf = G.gc.mazerelic[data];
            X.autoInitUI(ui);
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

            ui.setTouchEnabled(false);
            ui.finds("Image_1").loadTexture("img/shendianmigong/img_sdmg_sz" + conf.color + ".png", 1);
            ui.finds("Image_1").setTouchEnabled(true);
            ui.finds("Image_1").setSwallowTouches(false);
            ui.finds("Image_1").touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.relic_xq.data(data).show();
                }
            });
        }
    });
    G.frame[ID] = new fun('shendianmigong_ywbb.json', ID);
})();