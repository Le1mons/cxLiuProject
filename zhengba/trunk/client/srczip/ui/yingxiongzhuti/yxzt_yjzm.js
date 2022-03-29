/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //永劫之门
    var ID = 'yxzt_yjzm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
            });
            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
            });
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.conf = G.gc.herotheme;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.tian = Math.floor((G.time - G.DATA.asyncBtnsData.herotheme.stime) / (24 * 60 * 60))+1;
            me.nodes.panel_bg.setTouchEnabled(false);
            me.bindBtn();
            me.setContents();
            if(me.DATA.guankarec.win.length % 3 == 2){
                me.xuanzhuan(true);
            }else if(me.DATA.guankarec.win.length % 3 == 1){
                me.xuanzhuan();
            }
        },
        setContents: function () {
            var me = this;
            me.updateAttr();
            for (var i = 1; i < 6; i++) {
                me.nodes['txt_' + i].setString(L('yxzt_yjzm' + i));
                me.nodes['btn_' + i].id = i;
                me.nodes['btn_' + i].touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        if (sender.id > me.tian) return G.tip_NB.show(L('yxzt29'));
                        if (Math.floor(me.DATA.guankarec.win.length / 3) >= sender.id - 1) {
                            me.setDoor(sender.id);
                            sender.setBright(false);
                            for (var k = 1; k < 6; k++) {
                                if (sender.id != k) {
                                    me.nodes['btn_' + k].setBright(true);
                                }
                            }
                        } else {
                            G.tip_NB.show(L("yxzt23"));
                        }
                    }
                });
            };
            for (var i = 1; i < 6; i++) {
                var list = me.nodes.list2.clone();
                var conf = me.conf.guankapassprize;
                me.setDownItem(list, conf[i - 1], i);
                me.nodes['panel_wp' + i].setTouchEnabled(false);
                me.nodes['panel_wp' + i].removeAllChildren();
                me.nodes['panel_wp' + i].addChild(list);
            };
            me.nodes.loadingbar.setPercent((me.DATA.guankarec.win.length / 15) * 100);
            var btnnum = (Math.floor(me.DATA.guankarec.win.length / 3) + 1) > 5 ? 5 : (Math.floor(me.DATA.guankarec.win.length / 3) + 1);
            var num1 = me.tian > btnnum ? btnnum : me.tian;
            me.nodes['btn_' + num1].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
        },
        xuanzhuan: function (type) {
            var me = this;
            if (!me.stop) {
                me.stop = true;
                me.nodeArr[0].runActions([
                    cc.spawn(
                        cc.moveTo(0.5, me.nodeArr[2].getPosition()),
                        cc.scaleTo(0.5, me.nodeArr[2].getScale()),
                        cc.callFunc(function () {
                            if (me.nodeArr[2].getScale() == 1) {
                                me.nodeArr[0].zIndex = 2;
                                me.nodeArr[0].setTouchEnabled(true);
                                // me.nodetxtArr[0].setColor("#fff8e1");
                            } else {
                                me.nodeArr[0].setTouchEnabled(false);
                                // me.nodetxtArr[0].setColor("#c5c1b2");
                                me.nodeArr[0].zIndex = 1;
                            }
                            me.stop = false;
                            if(type){
                                me.ui.setTimeout(function(){
                                    me.xuanzhuan();
                                },600)
                            }
                        })
                    )

                ]);
                me.nodeArr[1].runActions([
                    cc.spawn(
                        cc.moveTo(0.5, me.nodeArr[0].getPosition()),
                        cc.scaleTo(0.5, me.nodeArr[0].getScale()),
                        cc.callFunc(function () {
                            if (me.nodeArr[0].getScale() == 1) {
                                me.nodeArr[1].zIndex = 2;
                                me.nodeArr[1].setTouchEnabled(true);
                                // me.nodetxtArr[1].setTextColor(cc.p("#fff8e1"));
                            } else {
                                me.nodeArr[1].setTouchEnabled(false);
                                // me.nodetxtArr[1].setTextColor(cc.p("#c5c1b2"));
                                me.nodeArr[1].zIndex = 1;
                            }
                        })
                    )
                ]);
                me.nodeArr[2].runActions([
                    cc.spawn(
                        cc.moveTo(0.5, me.nodeArr[1].getPosition()),
                        cc.scaleTo(0.5, me.nodeArr[1].getScale()),
                        cc.callFunc(function () {
                            if (me.nodeArr[1].getScale() == 1) {
                                me.nodeArr[2].zIndex = 2;
                                me.nodeArr[2].setTouchEnabled(true);
                                // me.nodetxtArr[2].setTextColor(cc.p("#fff8e1"));
                            } else {
                                me.nodeArr[2].setTouchEnabled(false);
                                me.nodeArr[2].zIndex = 1;
                                // me.nodetxtArr[2].setTextColor(cc.p("#c5c1b2"));
                            }
                        })
                    )
                ]);
            }
        },
        setDoor: function (id) {
            var me = this;
            var conf = [];
            for (var i = 0; i < me.conf.guanka.length; i++) {
                if (id == me.conf.guanka[i].page) {
                    conf.push(me.conf.guanka[i]);
                }
            };
            me.nodeArr = [];
            me.nodetxtArr = [];
            for (var i = 1; i < 4; i++) {
                var list = me.nodes.list1.clone();
                me.Door(list, conf[i - 1], i);
                me.nodes['panel_gq' + i].removeAllChildren();
                me.nodes['panel_gq' + i].addChild(list);
                me.nodeArr.push(me.nodes['panel_gq' + i]);
            }
        },
        Door: function (ui, data, i) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.finds('img_gq').loadTexture('img/buluoshilian/gq_00' + data.page + '.png')
            ui.nodes.txt_mz.setString(data.name);
            me.nodetxtArr.push(ui.nodes.txt_mz);
            ui.nodes.panel_zz.hide();
            if (X.inArray(me.DATA.guankarec.win, data.level) || data.level == me.DATA.guankarec.win.length) {
                ui.nodes.img_zz.hide();
            }
            ui.data = data;
            ui.level = data.level;
            ui.setTouchEnabled(true);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (!X.inArray(me.DATA.guankarec.win, sender.level) && sender.level == me.DATA.guankarec.win.length) {
                        // var obj = {
                        //     pvType: 'herothemedoor',
                        //     data: data.level
                        // };
                        G.frame.yjzm_setDef.data({
                            data: sender.data
                        }).show();
                    } else if (X.inArray(me.DATA.guankarec.win, sender.level)) {
                        G.tip_NB.show(L("yxzt20"));
                    } else {
                        G.tip_NB.show(L("yxzt21"));
                    }
                } else if (type == ccui.Widget.TOUCH_CANCELED) {
                    me.xuanzhuan();
                }
            });
            if (X.inArray(me.DATA.guankarec.win, data.level) || data.level == me.DATA.guankarec.win.length) {
                ui.nodes.txt_mz.setTextColor(cc.color("#ffffff"));
                G.class.ani.show({
                    json: 'yingxiongyure_cs0' + data.page + '_dh',
                    addTo: ui,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        aniNode = node;
                        action.playWithCallback('in', false, function () {
                            action.play('wait', true);
                        });
                    }
                })
            } else {
                ui.nodes.txt_mz.setTextColor(cc.color("#6c6c6c"));
            }

        },
        setDownItem: function (ui, data, i) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setPosition(cc.p(80, 90));
            X.render({
                panel_ico: function (node) {
                    ui.setTouchEnabled(true);
                    node.id = i - 1;
                    if (X.inArray(me.DATA.guankarec.boxrec, i - 1)) {
                        node.setBackGroundImage('img/event/zhounianqingdian/img_znq_bx1.png', 1);
                    } else if (!X.inArray(me.DATA.guankarec.boxrec, i - 1) && me.DATA.guankarec.win.length < i * 3) {
                        node.setBackGroundImage('img/event/zhounianqingdian/img_znq_bx.png', 1);
                        node.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                G.frame.yxzt_jlyl.data(data).show();
                            }
                        })
                    } else {
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
                        node.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                G.ajax.send("herotheme_boxprize", [sender.id], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).show();
                                        me.DATA.guankarec = data.d.myinfo.guankarec;
                                        G.frame.yingxiongzhuti.DATA.myinfo.guankarec = data.d.myinfo.guankarec;
                                        // G.frame.yxzt_zhl.DATA = data.d.myinfo;
                                        me.setContents();
                                    }
                                });
                            }
                        })
                    }
                    node.setPosition(cc.p(30, 60));
                    // var item = G.class.sitem(data.prize[0]);
                    // item.setScale(0.6);
                    // node.removeAllChildren();;
                    // node.addChild(item);
                },
                txt_jl: function (node) {
                    node.setString(X.STR(L('yxzt_yjzm6'), L('yxzt_yjzm' + i)));
                    node.setPosition(cc.p(30, 0));
                },
            }, ui.nodes);
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb: X.fmtValue(P.gud.jinbi),
                txt_zs: X.fmtValue(P.gud.rmbmoney),
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('heianzhimen.json', ID);
})();