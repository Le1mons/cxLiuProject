/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠水晶-图鉴
    var ID = 'scsj_tj';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.scrollview = me.ui.finds("scrollview");
            cc.enableScrollBar(me.scrollview);
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
        setContents: function () {
            var me = this;
            var conf = G.gc.pet;
            var petIdArr = [];

            for (var pid in conf) {
                var obj = {
                    t: pid,
                    lv: 0
                };
                var obj1 = {
                    t: pid,
                    lv: Object.keys(G.gc.petup[pid]).length - 1
                };
                petIdArr.push(obj);
                petIdArr.push(obj1);
            }

            petIdArr.sort(function (a, b) {
                var confA = conf[a.t];
                var confB = conf[b.t];
                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else if (a.t != b.t) {
                    return a.t * 1 > b.t * 1 ? -1 : 1;
                } else {
                    return a.lv < b.lv ? -1 : 1;
                }
            });

            var table = new X.TableView(me.scrollview, me.nodes.list, 4, function (ui, data) {
                me.setItem(ui, data);
            });
            table.setData(petIdArr);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            ui.setSwallowTouches(false);
            ui.removeAllChildren();
            var pet = G.class.pet(data);
            pet.setPosition(ui.width / 2, ui.height /2);
            ui.addChild(pet);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.sc_xq.data(data).show();
                }
            });
        }
    });

    G.frame[ID] = new fun('scsj_sctj.json', ID);
})();