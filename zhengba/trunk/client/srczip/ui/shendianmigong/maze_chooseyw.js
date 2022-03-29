(function () {
    var ID = 'maze_chooseyw';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = JSON.parse(JSON.stringify(G.frame.maze.DATA.relicprizelist));
            me.setContents();

        },
        setContents: function () {
            var me = this;
            var data = me.initDATA(me.DATA);
            // me.nodes.list_tx.setPosition(-100, 0);
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 3, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            me.setDown();
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var conf = G.gc.mazerelic[data.ywid];
            X.render({
                img_xz: function (node) {
                    // node.loadTexture("img/shendianmigong/img_sdmg_sz" + conf.color + ".png", 1);
                    // img/public/ico/ico_zz4_s.png
                    // 
                    node.setVisible(me.chosoeData[data.key] == data.ywid);
                },
                panel_zz: function (node) {
                    if (conf.zhongzu) {
                        node.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
                        node.show();

                    } else if (conf.job) {
                        node.setBackGroundImage('img/public/ico_zy/zy_' + conf.job + '_x.png', 1);
                        node.show();
                    } else {
                        node.hide();
                    }

                },
                ico_yw: function (node) {
                    node.setBackGroundImage("ico/relicico/" + conf.icon + ".png");

                },
                txt_name: function (node) {
                    node.setString(conf.name);
                    node.setTextColor(cc.color(G.gc.COLOR['yw' + conf.color]));
                    X.enableOutline(node, "#000000", 1);

                },
            }, ui.nodes);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.key = data.ywid;
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (me.chosoeData[data.key] == sender.key) return;
                    me.chosoeData[data.key] = sender.key;
                    me.table.reloadDataWithScroll(false);
                    me.setDown(conf.intro)
                }
            })
        },
        setDown: function (str) {
            var me = this;
            if (str) {
                me.nodes.txt_sx.setString(str)
            } else {
                me.nodes.txt_sx.setString(L('maze_sw11'))

            }
        },
        initDATA: function (data) {
            var me = this;
            me.chosoeData = {};
            var _data = [];
            data.forEach(function name(item, idx) {
                me.chosoeData[idx] = 99;
                item.forEach(function name(_item, _idx) {

                    var obj = {}
                    obj.key = idx;
                    obj.ywid = _item;
                    obj.idx = _idx;
                    _data.push(obj)
                })
            });
            return _data
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_1.click(function (sender) {
                var arr = [];
                for (var k in me.chosoeData) {
                    if (me.chosoeData[k] == 99) {
                        G.tip_NB.show(L('maze_sw11'))
                        return
                    }
                    arr.push(me.DATA[k].indexOf(me.chosoeData[k]));
                };
              
                G.frame.maze.getSaoDang("relicprizelist", arr,function(){
                    G.tip_NB.show(L("maze_sw12"));
                    me.remove();

                });
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shendianmigong_xzyw2.json', ID);
})();