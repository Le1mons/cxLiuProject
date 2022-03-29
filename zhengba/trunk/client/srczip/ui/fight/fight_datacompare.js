/**
 * Created by wfq on 2018/6/28.
 */
(function () {
    //战斗-数据对比
    var ID = 'fight_datacompare';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f3";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            X.radio([me.nodes.btn_sc,me.nodes.btn_zl], function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_sc$:0,
                    btn_zl$:1
                };
                me.changeType(name2type[name]);
            }, {color: ["#7b513a", "#6c6c6c"],
                no_enableOutline: true,});
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data();
            me.nodes.btn_sc.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        changeType: function (type) {
            var me = this;

            if (me.curType == type) return;

            me.curType = type;
            me.setContents();
        },
        setContents: function () {
            var me = this;

            var listview = me.nodes.listview_zdxx;
            listview.removeAllChildren();
            cc.enableScrollBar(listview);
            me.nodes.panel_list.hide();

            me.effect = {
                0:'dps',
                1:'addhp'
            }[me.curType];

            me.leftArr = [];
            me.rightArr = [];
            for (var id in me.DATA.roles) {
                var rData = me.DATA.roles[id];
                if(id.split("_")[0] != "role") continue;
                rData.role = id;
                if (rData.side == 1) {
                    me.rightArr.push(rData);
                } else {
                    me.leftArr.push(rData);
                }
            }

            //数据排序
            var sort = function (a,b) {
                return a.pos * 1 < b.pos * 1 ? -1 : 1;
            };
            me.rightArr.sort(sort);
            me.leftArr.sort(sort);

            me.maxLeftValue = me.getMaxValue(me.leftArr,me.effect);
            me.maxRightValue = me.getMaxValue(me.rightArr,me.effect);
            me.maxValue = me.maxLeftValue > me.maxRightValue ? me.maxLeftValue : me.maxRightValue;

            // for (var i = 0; i < 6; i++) {
            //     var item = me.nodes.panel_list.clone();
            //     item.idx = i;
            //     me.setItem(item);
            //     listview.pushBackCustomItem(item);
            //     item.show();
            // }

            var i = 0;
            var addItem = function () {
                var item = me.nodes.panel_list.clone();
                item.idx = i;
                me.setItem(item);
                listview.pushBackCustomItem(item);
                item.show();
                if (7 - i > 1) {
                    i++;
                    addItem();
                }
            };

            addItem();
        },
        getMaxValue: function (d,effect) {
            var me = this;

            var data = me.DATA.signdata;
            var value = 0;
            for (var i = 0; i < d.length; i++) {
                var id = d[i].role;
                if (data[id][effect] > value) {
                    value = data[id][effect];
                }
            }

            return value;
        },
        setItem: function (ui) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                panel1: function (node) {
                    node.removeAllChildren();

                    if (!me.leftArr[ui.idx]) {
                        return;
                    }

                    var item = me.nodes.list_wjxx.clone();
                    item.data = me.leftArr[ui.idx];
                    item.maxValue = me.maxLeftValue;
                    me.setItem2(item);
                    item.setPosition(cc.p(0,0));
                    node.addChild(item);
                },
                panel2: function (node) {
                    node.removeAllChildren();

                    if (!me.rightArr[ui.idx]) {
                        return;
                    }

                    var item = me.nodes.list_wjxx.clone();
                    item.data = me.rightArr[ui.idx];
                    item.maxValue = me.maxRightValue;
                    me.setItem2(item);
                    item.setPosition(cc.p(0,0));
                    node.addChild(item);
                }
            },ui.nodes);
            ui.show();

            if (ui.idx % 2) {
                ui.setOpacity(0);
            } else {
                ui.setOpacity(255);
                ui.setBackGroundColor(cc.color('#3E281D'));
            }
        },
        setItem2: function (ui) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                ico_tx: function (node) {
                    var wid = G.class.shero(ui.data);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                },
                txt_sz:me.DATA.signdata[ui.data.role][me.effect],
                img_zdxq_jdt: function (node) {
                    var value = me.DATA.signdata[ui.data.role][me.effect] || 0;

                    var n = 0,
                        maxPer = Math.floor(value / me.maxValue * 100) || 0;
                    node.setTimeout(function () {
                        node.setPercent(n);
                        n += 1;
                    }, 10, maxPer);
                    node.setPercent(0);
                    // node.setPercent(Math.floor(value / ui.maxValue * 100) || 0);
                },
                img_mvp: function (node) {
                    if(me.DATA.signdata[ui.data.role][me.effect] == me.getMaxDps()) node.show();
                },
                img_yuan: function (node) {
                    node.setVisible(ui.data.pos == 7 && !ui.data.mowangtype);
                }
            },ui.nodes);
            ui.show();
        },
        getMaxDps: function () {
            var me = this;
            var arr = [];

            for (var i in me.DATA.signdata) {
                arr.push(me.DATA.signdata[i].dps);
            }

            arr.sort(function (a, b) {
                return a > b ? -1 : 1;
            });

            return arr[0];
        }
    });

    G.frame[ID] = new fun('zhandou_top_zdxq.json', ID);
})();
