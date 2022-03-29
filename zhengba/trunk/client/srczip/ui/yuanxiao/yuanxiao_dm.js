/**
 * Created by
 */
(function () {
    //
    var ID = 'yuanxiao_dm';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.answerObj = {};
            cc.each(G.frame.yuanxiao.DATA.myinfo.topic, function (id) {
                me.answerObj[id] = Object.keys(G.gc.yuanxiao.questions[id].answer).sort(function () {
                    return Math.random()>0.5 ? 1:-1;
                });
            });

            me.nodes.txt_dm.show();
            me.nodes.panel_xx1.hide();
            me.nodes.panel_xx2.hide();
            me.nodes.panel_xx3.hide();
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            X.timeout(me.nodes.txt_sj, X.getTodayZeroTime() + 24 * 3600, function () {
                me.remove();
            });
            me.setQuestions();
            X.radio([me.nodes.panel_dm1, me.nodes.panel_dm2, me.nodes.panel_dm3], function (sender) {
                me.sender = sender;
                me.showAnswer();
                me.nodes.txt_dm.hide();
                me.nodes.panel_xx1.show();
                me.nodes.panel_xx2.show();
                me.nodes.panel_xx3.show();
                me.setBtnState();
                me.showDC();
            }, {
                callback1: function (node) {
                    node.list.nodes.img_dm_h.show();
                },
                callback2: function (node) {
                    node.list.nodes.img_dm_h.hide();
                }
            });
            for (var index = 1; index < 4; index ++) {
                var list = me.nodes['panel_xx' + index];
                (function (list) {
                    list.click(function (sender) {
                        G.frame.yuanxiao.eventUse([String(me.sender.id), 'riddle', sender.id], function () {
                            G.frame.yuanxiao.DATA.myinfo.gotarr.riddle[me.sender.id] = sender.id;
                            me.setBtnState();
                            me.showAnswer();
                            me.showDC();
                            G.frame.jiangli.data({
                                prize: me.CONF.right == sender.id ? me.CONF.winprize : me.CONF.loseprize
                            }).show();
                            G.frame.yuanxiao.checkRedPoint();
                            G.hongdian.getData('riddles', 1);
                        });
                    });
                })(list);
            }
            me.nodes.panel_dm1.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.setBtnState();
        },
        showDC: function () {
            var me = this;

            for (var index = 0; index < 3; index ++) {
                var list = me.nodes['panel_dm' + (index + 1)].list;
                X.render({
                    panel_gou: function (node) {
                        node.setVisible(G.frame.yuanxiao.DATA.myinfo.gotarr.riddle[list.id] != undefined);
                        if (node.visible) {
                            var img = G.gc.yuanxiao.questions[list.id].right == G.frame.yuanxiao.DATA.myinfo.gotarr.riddle[list.id] ?
                                'gou' : 'cuo';
                            node.setBackGroundImage('img/yuanxiaodenghui/img_' + img + '.png', 1);
                        }
                    }
                }, list.nodes);
            }
        },
        onShow: function () {
            var me = this;

        },
        show: function () {
            var me = this;
            var _super = me._super;
            G.frame.yuanxiao.getData(function () {
                _super.apply(me);
            });
        },
        setQuestions: function () {
            var me = this;

            cc.each(G.frame.yuanxiao.DATA.myinfo.topic, function (id, index) {
                var list = me.nodes.list.clone();
                var parent = me.nodes['panel_dm' + (index + 1)];
                list.show();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                parent.list = list;
                parent.id = id;
                list.id = id;
                X.autoInitUI(list);
                X.render({
                    img_xh: '#img/yuanxiaodenghui/img_xh' + (index + 1) + '.png',
                    txt_1: cc.sys.isNative ? G.gc.yuanxiao.questions[id].content[0] || '' : '',
                    txt_2: cc.sys.isNative ? G.gc.yuanxiao.questions[id].content[1] || '' : '',
                    txt_3: cc.sys.isNative ? G.gc.yuanxiao.questions[id].content[2] || '' : ''
                }, list.nodes);
            });

            for (var index = 0; index < 3; index ++) {
                var list = me.nodes.list_xx.clone();
                var parent = me.nodes['panel_xx' + (index + 1)];
                list.show();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                parent.list = list;
                X.autoInitUI(list);
            }
        },
        setBtnState: function () {
            var me = this;
            if (!me.sender || G.frame.yuanxiao.DATA.myinfo.gotarr.riddle[me.sender.id] != undefined) {
                me.nodes.panel_dm1.setTouchEnabled(true);
                me.nodes.panel_dm2.setTouchEnabled(true);
                me.nodes.panel_dm3.setTouchEnabled(true);
                me.nodes.panel_xx1.setTouchEnabled(false);
                me.nodes.panel_xx2.setTouchEnabled(false);
                me.nodes.panel_xx3.setTouchEnabled(false);
            } else {
                me.nodes.panel_dm1.setTouchEnabled(true);
                me.nodes.panel_dm2.setTouchEnabled(true);
                me.nodes.panel_dm3.setTouchEnabled(true);
                me.nodes.panel_xx1.setTouchEnabled(true);
                me.nodes.panel_xx2.setTouchEnabled(true);
                me.nodes.panel_xx3.setTouchEnabled(true);
            }
        },
        showAnswer: function () {
            var me = this;
            var answer = me.answerObj[me.sender.id];
            var conf = me.CONF = G.gc.yuanxiao.questions[me.sender.id];

            for (var index = 0; index < 3; index ++) {
                var list = me.nodes['panel_xx' + (index + 1)];
                list.id = answer[index];
                list.list.id = answer[index];
                var xuanze = G.frame.yuanxiao.DATA.myinfo.gotarr.riddle[me.sender.id] == list.id;

                X.render({
                    txt_xx: function (node) {
                        node.setString(conf.answer[list.id].intr);
                        node.setTextColor(cc.color(xuanze ? '#f5e2ca' : '#5f0d10'));
                    },
                    img_xx_h: function (node) {
                        node.setVisible(xuanze);
                    },
                    img_kuang: function (node) {
                        node.setVisible(xuanze);
                    },
                    panel_dui: function (node) {
                        var img = conf.right == list.id ?
                            'gou' : 'cuo';
                        node.setBackGroundImage('img/yuanxiaodenghui/img_' + img + '.png', 1);
                    }
                }, list.list.nodes);
            }
        }
    });
    G.frame[ID] = new fun('yuanxiaodenghui_qwdm.json', ID);
})();