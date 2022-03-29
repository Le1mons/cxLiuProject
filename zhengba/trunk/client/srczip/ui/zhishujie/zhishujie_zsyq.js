/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_zsyq';
    var fun = X.bUi.extend({
        maxLen: 8,
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS86')
                }).show();
            });
            me.nodes.btn_zsfl.click(function () {
                G.frame.zhishujie_zsfl.show();
            });
            me.nodes.btn_jshz.click(function () {
                G.frame.zhishujie_haoyou.data({
                    type: 'help'
                }).show();
            });
            me.nodes.btn_sqnl.click(function () {
                G.frame.zhishujie_haoyou.data({
                    type: 'get'
                }).show();
            });
            me.nodes.btn_mfsf.click(function () {
                me.ajax('planttrees_shifei', [], function (str, data) {
                    if (data.s == 1) {
                        G.frame.zhishujie_main.getData(function () {
                            me.showAni({
                                state: 'sf',
                                callback: function () {
                                    me.showFruit();
                                    for (var index = 0; index < me.maxLen; index ++) {
                                        var parent = me.nodes['panel_' + (index + 1)];
                                        me.upFruit(parent.list.gz, index);
                                    }
                                }
                            });
                            me.showSfState();
                        });
                    }
                });
            });

            X.timeout(me.nodes.txt_cs, G.DATA.asyncBtnsData.planttrees.rtime, function () {
                me.nodes.txt_cs.setString(L("YJS"));
            }, null, {
                showDay: true
            });
            me.nodes.txt_zs.setString(G.gc.zhishujie.shifeineed[0].n);
        },
        onShow: function () {
            var me = this;

            me.showTask();
            me.showFruit();
            me.showSfState();
            me.showOpenState();
            if (G.time < G.frame.zhishujie_main.endTime) {
                X.timeout(me.ui, G.frame.zhishujie_main.endTime, function () {
                    me.showOpenState();
                });
            }
            me.checkRedPoint();

            for (var index = 0; index < me.maxLen; index ++) {
                var parent = me.nodes['panel_' + (index + 1)];
                me.upFruit(parent.list.gz, index);
            }
        },
        showTask: function () {
            var me = this;
            var conf = G.gc.zhishujie.task;
            var data = G.frame.zhishujie_main.DATA.myinfo.task;

            cc.each(conf, function (task, id) {
                var parent = me.nodes['panel_rw' + id];
                if (!parent.list) {
                    var list = parent.list = me.nodes.list.clone();
                    list.show();
                    list.setPosition(parent.width / 2, parent.height / 2);
                    parent.addChild(list);
                    X.autoInitUI(list);
                    X.render({
                        txt_jl: function (node) {
                            node.setTextColor(cc.color("#fff8e1"));
                            node.setString(L("zsj_nl") + '*' + task.addval);
                            X.enableOutline(node, '#183604', 1);
                        }
                    }, list.nodes);
                    var txt_rw1 = me.nodes.list.finds('txt_rw$').clone();
                    txt_rw1.y -= 20;

                    list.addChild(txt_rw1);
                    list.nodes.txt_rw1 = txt_rw1;
                    txt_rw1.zIndex = -1;
                    list.nodes.panel_qiu.zIndex = -2;
                    list.setTouchEnabled(true);
                    list.click(function () {
                        if (data.data[id] >= task.pval && !X.inArray(data.rec, id)) {
                            me.ajax('planttrees_receive', [id], function (str, _data) {
                                if (_data.s == 1) {
                                    list.nodes.panel_qiu.ani.action.playWithCallback('lingqu', false, function () {
                                        _data.d.prize && _data.d.prize.length > 0 && G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).show();
                                        G.frame.zhishujie_main.getData(function () {
                                            me.showTask();
                                            G.frame.loadingIn.show();
                                            me.showAni({
                                                state: 'addnl',
                                                callback: function () {
                                                    me.showFruit();
                                                    for (var index = 0; index < me.maxLen; index ++) {
                                                        var parent = me.nodes['panel_' + (index + 1)];
                                                        me.upFruit(parent.list.gz, index);
                                                    }
                                                    G.frame.loadingIn.remove();
                                                }
                                            });

                                        });
                                        G.hongdian.getData('planttrees', 1, function () {
                                            G.frame.zhishujie_main.checkRedPoint();
                                            G.frame.zhishujie_zsyq.checkRedPoint();
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
                X.render({
                    txt_rw: function (node) {
                        var rh = X.setRichText({
                            str: task.desc,
                            parent: node,
                            color: '#fff8e1',
                            outline:'#183604'
                        });
                    },
                    txt_rw1: function (node) {
                        var rh = X.setRichText({
                            str: '(' + (data.data[id] || 0) + '/' + task.pval + ')',
                            parent: node,
                            color: '#fff8e1',
                            outline:'#183604'
                        });
                    },
                    img_ylq: function (node) {
                        node.setVisible(X.inArray(data.rec, id));
                    },
                    panel_qiu: function (node) {
                        node.setBackGroundImage('img/zhishujie/img_nlq0' + (data.data[id] >= task.pval ? '2' : '1') + '.png', 1);
                        if (data.data[id] >= task.pval && !X.inArray(data.rec, id)) {
                            if (!cc.isNode(node.ani)) {
                                G.class.ani.show({
                                    json: 'zhishujie_nl_tx',
                                    addTo: node,
                                    autoRemove: false,
                                    onload: function (n, a) {
                                        node.ani = n;
                                        a.play('wait', true);
                                    },
                                    onkey: function (n, a, e) {
                                        // if (e == 'hit') {
                                        //     n.callback && n.callback();
                                        //     n.callback = undefined;
                                        //     delete n.callback;
                                        // }
                                    }
                                });
                            } else {
                                node.ani.show();
                                node.ani.action.play('wait', true);
                            }
                        } else {
                            cc.isNode(node.ani) && node.ani.hide();
                        }
                    }
                }, parent.list.nodes);
            });
        },
        showFruit: function () {
            var me = this;

            for (var index = 0; index < me.maxLen; index ++) {
                (function (index) {
                    var data = G.frame.zhishujie_main.DATA.myinfo.posinfo[index];
                    var parent = me.nodes['panel_' + (index + 1)];
                    var p = G.frame.zhishujie_main.DATA.myinfo.posinfo[index].p;
                    if (!parent.list) {
                        var list = parent.list = me.nodes.list_gs.clone();
                        list.show();
                        list.setPosition(parent.width / 2, parent.height / 2);
                        parent.addChild(list);
                        X.autoInitUI(list);
                        list.removeBackGroundImage();
                        list.setTouchEnabled(true);
                        list.click(function () {
                            if (G.frame.zhishujie_main.DATA.myinfo.posinfo[index].p != -1) {
                                me.ajax('planttrees_getprize', [String(index)], function (str, _data) {
                                    if (_data.s == 1) {
                                        cc.mixin(G.frame.zhishujie_main.DATA.myinfo, _data.d.myinfo, true);
                                        G.frame.jiangli.data({
                                            prize: _data.d.prize
                                        }).once('willClose', function () {
                                            G.frame.loadingIn.show();
                                            me.showAni({
                                                callback: function () {
                                                    me.showFruit();
                                                    me.upFruit(list.gz, index);
                                                    G.frame.loadingIn.remove();
                                                },
                                                state: 'rec',
                                                index: index,
                                                list: list
                                            });
                                        }).show();
                                    }
                                });
                            }
                        });
                        list.gz = new ccui.Layout();
                        list.gz.setAnchorPoint(0.5, 0.5);
                        list.gz.setPosition(list.width / 2, list.height / 2);
                        list.addChild(list.gz);
                        list.gz.zIndex = -1;
                        G.class.ani.show({
                            json: 'zhishujie_pgtx_lv',
                            addTo: list,
                            autoRemove: false,
                            onload: function (node) {
                                list['ani4'] = node;
                                node.hide();

                                G.class.ani.show({
                                    json: 'zhishujie_pgtx_jin',
                                    addTo: list,
                                    autoRemove: false,
                                    onload: function (node1) {
                                        list['ani5'] = node1;
                                        node1.hide();

                                        if (list['ani' + p]) {
                                            list['ani' + p].show();
                                            list['ani' + p].action.play('kelingqu', true);
                                            list.gz.hide();
                                        }
                                    }
                                });
                            }
                        });

                    }
                    X.render({
                        txt_jd: function (node) {
                            node.setString(data.v + '/' + G.gc.zhishujie.maxval);
                            node.setVisible(p == -1);
                        }
                    }, parent.list.nodes);
                })(index);
            }
            me.nodes.txt_nl.setString(G.frame.zhishujie_main.DATA.myinfo.allv ? G.frame.zhishujie_main.DATA.myinfo.allv : '');
            me.nodes.img_qiu.setVisible(G.frame.zhishujie_main.DATA.myinfo.allv > 0);
        },
        showAni: function (conf) {
            var me = this;
            if (G.frame.zhishujie_main.oldDATA) {
                var oldData = G.frame.zhishujie_main.oldDATA.myinfo.posinfo;
            }
            var data = G.frame.zhishujie_main.DATA.myinfo.posinfo;

            switch (conf.state) {
                case "rec":
                    var list = conf.list;
                    var index = conf.index;
                    list.ani4.hide();
                    list.ani5.hide();
                    if (data[index].p != -1) {
                        list.gz.hide();
                        var aniNode = list['ani' + data[index].p];
                        aniNode.show();
                        aniNode.action.playWithCallback('jieguo', false, function () {
                            aniNode.action.play('kelingqu', true);
                            conf.callback && conf.callback();
                        });
                    } else {
                        list.gz.show();
                        conf.callback && conf.callback();
                    }
                    break;
                case 'addnl':
                    for (var index = 0; index < me.maxLen; index ++) {
                        if (data[index].p != oldData[index].p) {
                            me.showAni({
                                state: 'rec',
                                index: index,
                                list: me.nodes['panel_' + (index + 1)].list
                            });
                        }
                    }
                    conf.callback && conf.callback();
                    break;
                case "sf":
                    for (var index = 0; index < me.maxLen; index ++) {
                        (function (index) {
                            var curP = data[index].p;
                            var oldP = oldData[index].p;
                            var curColor = data[index].color;
                            var oldColor = oldData[index].color;
                            var list = me.nodes['panel_' + (index + 1)].list;
                            list.ani4.hide();
                            list.ani5.hide();
                            list.gz.hide();
                            if (oldP == -1) {
                                var aniNode = list['ani' + oldColor];
                                aniNode.show();
                                if (curColor != oldColor) {
                                    aniNode.action.playWithCallback('shifei', false, function () {
                                        aniNode.action.playWithCallback('jinjie', false, function () {
                                            aniNode.hide();
                                            list.gz.show();
                                        });
                                    });
                                } else {
                                    aniNode.action.playWithCallback('shifei', false, function () {
                                        aniNode.hide();
                                        list.gz.show();
                                    });
                                }
                            } else {
                                var aniNode = list['ani' + oldP];
                                aniNode.show();
                                if (curP != oldP) {
                                    aniNode.action.playWithCallback('shifei1', false, function () {
                                        aniNode.action.playWithCallback('jinjie1', false, function () {
                                            aniNode.hide();
                                            list.ani5.show();
                                            list.ani5.action.play('kelingqu', true);
                                        });
                                    });
                                } else {
                                    aniNode.action.playWithCallback('shifei1', false, function () {
                                        aniNode.action.play('kelingqu', true);
                                    });
                                }
                            }
                        })(index);
                    }

                    conf.callback && conf.callback();
                    break;
            }
        },
        upFruit: function (list, index) {
            var me = this;
            var data = G.frame.zhishujie_main.DATA.myinfo.posinfo[index];

            var img = {
                4: 1,
                5: 2
            };
            if (data.p == -1) {
                list.setBackGroundImage("img/zhishujie/img_cw" + img[data.color] + ".png", 1);
            } else {
                list.setBackGroundImage("img/zhishujie/img_gs" + img[data.p] + ".png", 1);
            }
        },
        showSfState: function () {
            var me = this;

            X.setRichText({
                str: X.STR(L("jrhksf"), G.gc.zhishujie.shifeimaxnum - G.frame.zhishujie_main.DATA.myinfo.shifeinum),
                parent: me.nodes.panel_wz,
                color: '#fbfbf8',
                outline: '#794309'
            });
            me.nodes.btn_mfsf.setEnableState(G.frame.zhishujie_main.DATA.myinfo.shifeinum < G.gc.zhishujie.shifeimaxnum);
            var targetNum = G.gc.zhishujie.targetnum;
            var num = G.frame.zhishujie_main.DATA.myinfo.allshifeinum + 1;

            me.nodes.txt_sycs.setString(X.STR(L("sgpzts"), num != 0 && num % targetNum == 0 ? L("they")+L("CI")
                : targetNum - num % targetNum + L("CI") + L("HOU")));

            me.nodes.img_mfsf.setVisible(G.frame.zhishujie_main.DATA.myinfo.shifeinum < G.gc.zhishujie.freenum);
            me.nodes.panel_xh.setVisible(G.frame.zhishujie_main.DATA.myinfo.shifeinum >= G.gc.zhishujie.freenum);
            if (G.frame.zhishujie_main.DATA.myinfo.shifeinum >= G.gc.zhishujie.shifeimaxnum) {
                me.nodes.img_sf.loadTexture('img/zhishujie/img_sf_hui.png', 1);
            }
        },
        showOpenState: function () {
            var isEnd = G.time > G.frame.zhishujie_main.endTime;

            //this.nodes.img_js.setVisible(isEnd);
            this.nodes.panel_rw1.setVisible(!isEnd);
            this.nodes.panel_rw2.setVisible(!isEnd);
            this.nodes.panel_rw3.setVisible(!isEnd);
            this.nodes.panel_rw4.setVisible(!isEnd);
            this.nodes.btn_mfsf.setVisible(!isEnd);
            this.nodes.panel_wz.setVisible(!isEnd);
            this.nodes.btn_jshz.setVisible(!isEnd);
            this.nodes.btn_sqnl.setVisible(!isEnd);
            isEnd && this.nodes.txt_sycs.setString(L("HDYJS"));
        },
        checkRedPoint: function () {
            var me = this;
            var redData = G.DATA.hongdian.planttrees;

            // if (redData.accept || redData.gift || redData.fuli || redData.task) {
            //     G.setNewIcoImg(me.nodes.panel_zsyq.finds('Image_37_0'));
            //     me.nodes.panel_zsyq.finds('Image_37_0').redPoint.setPosition(128, 38);
            // } else {
            //     G.removeNewIco(me.nodes.panel_zsyq.finds('Image_37_0'));
            // }
            if (redData.gift) {
                G.setNewIcoImg(me.nodes.btn_jshz);
            } else {
                G.removeNewIco(me.nodes.btn_jshz);
            }
            if (redData.accept) {
                G.setNewIcoImg(me.nodes.btn_sqnl);
            } else {
                G.removeNewIco(me.nodes.btn_sqnl);
            }
            if (redData.fuli) {
                G.setNewIcoImg(me.nodes.btn_zsfl);
            } else {
                G.removeNewIco(me.nodes.btn_zsfl);
            }
        }
    });
    G.frame[ID] = new fun('zhishujie_zsyq.json', ID);
})();