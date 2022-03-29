(function () {
    G.class.znq_qdbz = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._super('zhounianqing_qdbz.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn;
            me.mapArr = [];
            me.spmapArr = [];
            me.setContents()
        },
        setContents: function (isremove) {
            var me = this;
            me.ui.finds("txt_wz").setString(X.STR(L('szn_3'), me.DATA.lottery.layer))
            me.setChooseprize();
            me.initMap(isremove);
            me.setspecial(isremove);
            me.setNeed();
            me.checkIsMax();
        },
        setspecial: function (isremove) {
            var me = this;
            var idx = 0;
            var conf = G.class.szn.getlotteryinfo().extprize;
            for (var i = 1; i <= 6; i++) {
                var starNum = i < 6 ? 6 : 1;
                var endNum = i < 6 ? 6 : 5;
                for (var j = starNum; j <= endNum; j++) {
                    var node = me.nodes["panel_" + i + "_" + j];
                    isremove && node.removeAllChildren();

                    var clnode = node.children[0];
                    if (!clnode) {
                        var clnode = new G.class.oneList();
                        node.addChild(clnode);
                        clnode.setPosition(0, 0);
                        me.spmapArr.push(clnode);

                    };
                    clnode.setView(conf[idx], idx, true);
                    idx++
                    if (i < 6) {
                        node.showAni = function () {
                            
                            var that = this;
                            G.class.ani.show({
                                json: "3zn_sg_dx",
                                addTo: me.ui.finds("panel_jl"),
                                x: that.x - 300,
                                y: that.y ,
                                repeat: false,
                                autoRemove: true,
                                cache: true,
                                onload: function (node, action) {
                                    node.rotation = 180
                                }
                            });
                        }
                    } else {
                        node.showAni = function () {
                            
                            var that = this;
                            G.class.ani.show({
                                json: "3zn_sgs_dx",
                                addTo: me.ui.finds("panel_jl"),
                                x: that.x - 5,
                                y: that.y + 280,
                                repeat: false,
                                autoRemove: true,
                                cache: true,
                                onload: function (node, action) {
                                    node.rotation = 180
                                }
                            });
                        }
                    }
                }
            }
        },
        initMap: function (isremove) {
            var me = this;

            for (var i = 1; i <= 5; i++) {
                for (var j = 1; j <= 5; j++) {
                    var node = me.nodes["panel_" + i + "_" + j];
                    isremove && node.removeAllChildren();
                    var clnode = node.children[0];
                    if (!clnode) {
                        var clnode = new G.class.oneList();
                        node.addChild(clnode);
                        clnode.setPosition(0, 0);
                        me.mapArr.push(clnode)
                    };
                    var idx = (i - 1) * 5 + (j - 1);
                    clnode.setView(me.DATA.lottery.gezi[idx], idx, false);
                }
            }
        },
        setChooseprize: function () {
            var me = this;
            me.nodes.panel_wp.removeAllChildren();

            if (me.DATA.lottery.targetrec) {
                if (me.DATA.lottery.layer >= G.class.szn.getMaxLayer()) {
                    me.nodes.panel_cio.hide();
                    me.nodes.txt_1.hide();
                    me.nodes.btn_xyc.hide();
                } else {

                    me.nodes.txt_1.setString(L("szn_6"))
                    me.nodes.btn_xyc.show();
                    me.nodes.panel_cio.hide();
                    me.nodes.btn_xyc.click(function (sender) {
                        me.nextLayer()
                    })
                }
            } else {
                me.nodes.panel_cio.show();
                me.nodes.txt_1.show();
                if (me.DATA.lottery.target == -1) {
                    me.nodes.txt_1.setString(L("szn_4"))
                    // return;
                } else {

                    me.nodes.txt_1.setString(L("szn_5"))
                    me.nodes.btn_xyc.hide();
                    me.nodes.panel_cio.show();
                    var prize = G.class.szn.getTarget(me.DATA.lottery.target).prize;
                    var item = G.class.sitem(prize);
                    me.nodes.panel_wp.removeAllChildren()
                    me.nodes.panel_wp.addChild(item);
                    item.setPosition(me.nodes.panel_wp.width / 2, me.nodes.panel_wp.height / 2);
                    // G.frame.iteminfo.showItemInfo(item);

                }
                me.nodes.panel_wp.click(function (sender) {
                    if (X.keysOfObject(me.DATA.lottery.rec).length >= 25) {

                        G.ajax.send('zhounian3_targetprize', [], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                me.DATA.lottery = d.d.myinfo.lottery;
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).show();
                                me.setChooseprize();
                            }
                        }, true);
                    } else {
                        G.frame.szn_choose.data({
                            callback: function (idx) {
                                G.ajax.send('zhounian3_target', [idx], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        me.DATA.lottery = d.d.myinfo.lottery;
                                        me.setChooseprize();
                                    }
                                }, true);

                            },
                        }).show();
                    }
                })
            }
        },
        checkIsMax: function () {
            var me = this;
            me.nodes.panel_wp_dh.setTouchEnabled(false);
            if (X.keysOfObject(me.DATA.lottery.rec).length >= 25) {
                G.class.ani.show({
                    json: "ani_qiandao_1",
                    addTo: me.nodes.panel_wp_dh,
                    repeat: true,
                    autoRemove: false,
                    x:57,
                    y:45,
                    uniqueid: true,
                    onload: function (node, action) {
                        me.nodes.panel_wp_dh.aniNode = node;
                        node.setScale(1.2)
                    }
                });
                me.nodes.panel_wp_dh.aniNode && me.nodes.panel_wp_dh.aniNode.show();
            } else {
                me.nodes.panel_wp_dh.aniNode && me.nodes.panel_wp_dh.aniNode.hide();
            }
        },
        setNeed: function () {
            var me = this;
            var need = G.class.szn.getNeed();
            me.ui.finds("ico_xsz").loadTexture(G.class.getItemIco(need[0].t), 1)
            me.nodes.txt_cs.setString(G.class.getOwnNum(need[0].t, need[0].a) + "/" + need[0].n)
        },
        nextLayer: function () {
            var me = this;
            G.ajax.send('zhounian3_pass', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.nodes.btn_xyc.hide();
                    me.DATA.lottery = d.d.myinfo.lottery;
                    me.spmapArr = [];
                    me.mapArr = [];
                    me.setContents(true)
                }
            }, true);
        },
        getPrize: function () {
            var me = this;
            if (me.noClick) return;
            me.noClick = true;
            G.ajax.send('zhounian3_lottery', [1], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA.lottery = d.d.myinfo.lottery;
                    G.DATA.szn.lottery = d.d.myinfo.lottery;
                    me.DATA.lottery.gezi = me.DATA.lottery.gezi.concat(d.d.myinfo.lottery.getgezi)
                    me.showAni(d.d);
                    me.checkIsMax()
                    me.setNeed();

                } else {
                    me.noClick = false;

                }
            }, true);
        },
        showAni: function (data) {
            var me = this;
            data.getgezi.forEach(function name(item, idx) {
                me.mapArr[item].showAni(function () {
                    if (idx == data.getgezi.length - 1) {
                        G.frame.jiangli.data({
                            prize: data.prize
                        }).show();
                        me.noClick = false;
                    }
                });
            })
            data.extprize.forEach(function name(item, idx) {
                me.spmapArr[item].showAni2(function () {

                });
                me.spmapArr[item].parent.showAni()
            })
        },
        reSetView: function () {
            var me = this;
            me.show()
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_xz.click(function (sender) {
                if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                    G.tip_NB.show(L('szn_26'));
                    return
                }
                if (me.DATA.lottery.target == -1) {
                    G.tip_NB.show(L("szn_10"));
                    return
                };
                me.getPrize()
            })
       
            me.nodes.btn_qdzx.click(function (sender) {
                if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                    G.tip_NB.show(L('szn_26'));
                    return
                }
                G.frame.szn_qdzx.once("close", function () {
                    me.setNeed()
                }).show()
            })
            me.nodes.btn_qdzk.click(function (sender) {
                if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                    G.tip_NB.show(L('szn_26'));
                    return
                }
                G.frame.szn_qdzk.once("close", function () {
                    me.setNeed()
                }).show()
            })


        },
    });
})();
(function () {
    G.class.oneList = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._super('zhounianqing_qdbz_list.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            if (me.bool) {
                var item = G.class.sitem(me.DATA[0]);
                me.nodes.ico_wp.addChild(item);
                item.setPosition(me.nodes.ico_wp.width / 2, me.nodes.ico_wp.height / 2);
                me.nodes.img_yhd.setVisible(X.inArray(G.DATA.szn.lottery.extrec, me.idx))
                G.frame.iteminfo.showItemInfo(item);
                // me.nodes.img_fm.hide();
                me.nodes.img_zm.hide();
                me.nodes.img_wpd.show();
            } else {
                me.nodes.img_zm.show();
                if (G.DATA.szn.lottery.rec[me.idx]) {
                    // me.nodes.img_fm.hide();
                    me.action.play("wait", true)
                } else {
                    // me.nodes.img_fm.show();
                    me.nodes.img_zm.hide();

                }
                // me.nodes.img_fm.setVisible(!G.DATA.szn.lottery.rec[me.idx])
                // me.nodes.img_zm.setVisible(G.DATA.szn.lottery.rec[me.idx])
                me.nodes.img_wpd.hide()
            }
        },
        //bool true 表示是特殊的奖励  false  普通格子
        setView: function (data, idx, bool) {
            var me = this;
            me.show()
            me.DATA = data;
            me.idx = idx;
            me.bool = bool;
            cc.sys.isNative && me.setContents()
        },
        showAni: function (callback) {
            var me = this;
            // me.setContents();
            me.nodes.img_zm.show();
            me.action.playWithCallback("fanka", false, function () {

                me.action.play("wait",true)
                callback && callback();
            })
        },
        showAni2: function () {
            var me = this;
            me.setContents();
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