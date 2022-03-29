/**
 * Created by LYF on 2019/7/15.
 */
(function () {
    //雕文-选择目标技能
    var ID = 'diaowen_selectSkill';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(true);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.DATA.callback && me.DATA.callback(me.selectId);
                me.remove();
            });

            me.nodes.btn_rcjl.click(function () {

                me.DATA.callback && me.DATA.callback(me.selectId);
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.selectId = me.DATA.arr;

            me.setContents();
            me.showSelectNum();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.glyphextra.extskill.id;
            var keys = Object.keys(conf).sort(function (a, b) {
                if (conf[a].star != conf[b].star) {
                    return conf[a].star > conf[b].star ? -1 : 1;
                } else {
                    return a * 1 < b * 1 ? -1 : 1;
                }
            });

            for (var i = 0; i < keys.length; i ++) {
                var con = conf[keys[i]];
                if (!me.DATA.data.colorlv && con.star) continue;
                me.setItem(me.nodes.list.clone(), con);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            ui.show();
            X.autoInitUI(ui);
            X.render({
                img_txgoudi: function (node) {

                    node.setTouchEnabled(true);
                    node.click(function () {

                        if (X.inArray(me.selectId, data.id)) {
                            me.selectId.splice(X.arrayFind(me.selectId, data.id), 1);
                            ui.nodes.img_txgou.hide();
                        } else {
                            me.selectId.push(data.id);
                            ui.nodes.img_txgou.show();
                        }
                        me.showSelectNum();
                    });
                },
                img_txgou: function (node) {

                    node.setTouchEnabled(false);
                    node.setVisible(X.inArray(me.selectId, data.id));
                },
                panel_wznr: function (node) {

                    X.setRichText({
                        str: "<font color=#cd5f2b>" + data.name +":  " + "</font>" + "<br>" + data.desc.split("：")[1],
                        parent: node,
                        anchor: {x: 0, y: 1},
                        pos: {x: 0, y: node.height - 5},
                        color: "#f6ebcd"
                    });
                }
            }, ui.nodes);

            me.nodes.listview.pushBackCustomItem(ui);
        },
        showSelectNum: function () {
            var me = this;

            X.setRichText({
                str: X.STR(L("YXZXG"), "<font color=#cd5f2b>" + me.selectId.length + "</font>") + L("skill"),
                parent: me.nodes.panel_xzjnm,
                pos: {x: 0, y: 0},
                color: "#f6ebcd"
            });
        }
    });
    G.frame[ID] = new fun('diaowen_mbjn.json', ID);
})();