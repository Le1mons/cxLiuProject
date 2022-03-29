(function () {
    G.class.znq_qdtz2 = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._super('zhounianqing_tz_gk2.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn.guankarec;
            me.conf = G.class.szn.getConfByzj(2);
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.setAlllist();
            me.setStar();
            me.setRole();
        },
        setAlllist: function () {
            var me = this;
            for (var i = 2; i < 9; i++) {
                var node = me.nodes["panel_" + i];
                var clnode = node.children[0];
                if (!clnode) {
                    clnode = G.frame.znq_qdtz.nodes.list.clone()
                    X.autoInitUI(clnode);
                    clnode.setPosition(node.width / 2, node.height / 2);
                    node.addChild(clnode);
                    clnode.show();
                    node.setTouchEnabled(true);
                    node.idx = i;
                    node.conf = me.conf[i - 2];
                    node.click(function (sender) {
                        if (me.pos == sender.idx) {
                            me.chooseConf = sender.conf;

                            me.kaizhan()

                            return;
                        }
                        if (!X.inArray(me.DATA.win, sender.conf.idx - 1) && sender.idx > 2) {
                            G.tip_NB.show(L("szn_17"))
                            return
                        }
                        me.chooseConf = sender.conf;
                        me.pos = sender.idx
                        me.roleRun(sender.idx);
                    })
                }
                me.setList(clnode, i - 1, me.conf[i - 2]);
            }
        },
        roleRun: function () {
            var me = this;
            me.isMove = true;

            // var pos = me.nodes["panel_" + idx].getPosition();
            var star = me.getPos(me.role._pos);
            G.class.ani.show({
                json: "3zn_shanxianchu_dx",
                addTo: me.ui.finds("panel_bg"),
                repeat: false,
                cache: true,
                autoRemove: true,
                x: star.x,
                y: star.y,
                onload: function () {
                    me.role.hide();
                    me.role.setPosition(me.getPos(me.pos))
                },
                onend: function () {
                    me.showRole()

                },
            });

            // me.role.runAni(0, "run", true);
            // if (me.role._pos > me.pos) {
            //     me.role._pos--
            // } else {
            //     me.role._pos++
            // };
            // var pos = me.getPos(me.role._pos);
            // me.role.runActions([
            //     cc.moveTo(me.role._speed, pos),
            //     cc.callFunc(function () {
            //         if (me.role._pos != me.pos) {
            //             me.roleRun();
            //         } else {
            //             me.isMove = false
            //             me.kaizhan()
            //         }
            //     })
            // ])
        },
        showRole: function () {
            var me = this;
            var end = me.getPos(me.pos);
            me.role._pos = me.pos * 1;
            G.class.ani.show({
                json: "3zn_shanxianru_dx",
                addTo: me.ui.finds("panel_bg"),
                x: end.x - 5,
                y: end.y,
                cache: true,
                repeat: false,
                autoRemove: true,
                onload: function () {
                    me.role.show();
                    me.isMove = false;
                    me.kaizhan()

                }
            });
        },
        kaizhan: function () {
            var me = this;
            if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                G.tip_NB.show(L('szn_26'));
                return
            }
            if (me.isMove) return;

            var num = G.frame.znq_qdtz.getNum(me.chooseConf.idx);
            var allnum = G.class.szn.getNum();
            if (num >= allnum) {
                G.tip_NB.show(L("szn_23"))
                return
            }
            G.frame.szn_tz.data({
                conf: me.chooseConf,
                pos: me.pos,
                callback: function () {
                    G.frame.yingxiong_fight.data({
                        pvType: 'sznfight' + me.chooseConf.idx,
                        data: me.chooseConf,
                        callback: function (frame) {
                            var selectedData = frame.getSelectedData();
                            X.cacheByUid("sznfight" + me.chooseConf.idx, selectedData);
                            var obj = {};
                            for (var k in selectedData) {
                                for (var i = 0; i < frame.allHero.length; i++) {
                                    if (frame.allHero[i].tid == selectedData[k]) {

                                        obj[k] = frame.allHero[i].hid * 1 + ""
                                        break;
                                    }
                                }
                            };
                            G.ajax.send('zhounian3_fight', [me.chooseConf.idx, obj], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    me.DATA = d.d.myinfo.guankarec;
                                    G.DATA.szn.guankarec = d.d.myinfo.guankarec;
                                    G.DATA.szn.task = d.d.myinfo.task;

                                    G.frame.fight.data({
                                        pvType: 'sznfight',
                                        prize: d.d.prize
                                    }).once('show', function () {
                                        G.frame.yingxiong_fight.remove();
                                        me.setAlllist()
                                    }).demo(d.d.fightres);
                                }
                            }, true);
                        },
                    }).show();
                },
            }).show()
            // G.frame.szn_fightPlane.data(me.chooseConf).show();

        },
        setRole: function () {
            var me = this;
            var pos = me.getPos(me.getIdx());
            X.setModel({
                parent: me.ui.finds("panel_bg"),
                data: {
                    hid: "13012",
                    noRemove: true,
                },
                scale: .5,
                callback: function (node) {
                    node.setPosition(pos)
                    node.runAni(0, "run", true);
                    node._pos = me.pos * 1;
                    me.role = node;
                }
            });
        },
        getPos: function (idx) {
            var me = this;
            var pos = me.nodes["panel_" + idx].getPosition();
            return cc.p(pos.x, pos.y - 35)
        },
        getIdx: function () {
            var me = this;
            var pos = 1;
            me.conf.forEach(function name(item, idx) {
                if (X.inArray(me.DATA.win, item.idx) && idx + 2 > pos) {
                    pos = idx + 2
                }
            });
            me.pos = pos;
            return pos
        },
        setStar: function () {
            var me = this;
            var clnode = G.frame.znq_qdtz.nodes.list.clone()
            me.nodes.panel_1.addChild(clnode);
            X.autoInitUI(clnode);
            clnode.setPosition(me.nodes.panel_1.width / 2, me.nodes.panel_1.height / 2);
            clnode.show();
            clnode.nodes.txt_gk.setString(L('szn_16'));
        },
        setList: function (ui, idx, conf) {
            var me = this;
            if (X.inArray(me.DATA.win, conf.idx)) {
                me.nodes["jd_" + idx].show()
            }
            X.render({
                panel_bx: function (node) {
                    node.setVisible(!X.inArray(me.DATA.boxrec, conf.idx) && conf.boxprize.length > 0);
                    if (X.inArray(me.DATA.win, conf.idx)) {
                        G.class.ani.show({
                            json: "3zn_bx_dx",
                            addTo: node,

                            repeat: true,
                            autoRemove: false,
                            uniqueid: true,
                            onload: function (_node, action) {
                                action.play("zhong", true)
                                node.action = action
                            }
                        });
                    }
                    node.click(function (sender) {
                        if (X.inArray(me.DATA.win, conf.idx)) {
                            G.ajax.send('zhounian3_boxprize', [conf.idx], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    me.DATA = d.d.myinfo.guankarec;
                                    G.frame.jiangli.data({
                                        prize: d.d.prize
                                    }).show();
                                    me.setList(ui, idx, conf);
                                }
                            }, true);
                        } else {
                            var obj = {};
                            obj.prize = conf.boxprize
                            G.frame.szn_jlyl.data(obj).show();

                        }
                    })
                },
                panel_bxk: function (node) {
                    node.setVisible(X.inArray(me.DATA.boxrec, conf.idx) && conf.boxprize.length > 0)

                },
                txt_gk: function (node) {

                    node.setString(X.STR(L('szn_15'), idx));
                    X.enableOutline(node, cc.color('#000000'), 2);

                }
            }, ui.nodes);

        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
    });
})();