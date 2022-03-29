/**
 * Created by LYF on 2018/12/27.
 */
(function () {
    G.class.diaowenjinglian = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('diaowenjinlian.json');
            G.frame.diaowen_tisheng.dw = me;
        },
        bindBtn:function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS25")
                }).show();
            });

            me.nodes.btn_jl.click(function () {
                if(me.selectedArr.length < 1) {
                    G.tip_NB.show(L("QFRZSYGDW"));
                    return;
                }
                function f() {
                    me.ajax("glyph_refine", me.selectedArr, function (str, data) {
                        if(data.s == 1) {
                            G.event.emit('sdkevent',{
                                event:'jinglian_diaowen',
                                data:{
                                    prize:data.d.prize
                                }
                            });

                            me.action.playWithCallback("fenjie", false, function () {
                                if(data.d.prize && data.d.prize.length > 0) {
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                }
                                G.hongdian.getData("glyph", 1, function () {
                                    G.frame.duanzaofang.checkRedPoint();
                                    me.checkRedPoint();
                                });
                                me.setJDT();
                                me.setAttr();
                                for (var i = 1; i < 6; i ++) {
                                    var lay = me.nodes["panel_dw_" + i];
                                    lay.removeAllChildren();
                                    me.selectedArr = [];
                                }
                                me.action.play("xunhuan", true);
                            });
                        }
                    });
                }
                var isRed = false;
                for (var i in me.selectedArr) {
                    var data = G.frame.beibao.DATA.glyph.list[me.selectedArr[i]];
                    if(data.color >= 4) {
                        isRed = true;
                        break;
                    }
                }

                if(isRed && !X.cacheByUid("diaowenHint")) {
                    // G.frame.alert.data({
                    //     cancelCall: null,
                    //     okCall: function () {
                    //         f();
                    //     },
                    //     richText: L("CZHSPZ"),
                    //     sizeType: 3
                    // }).show();

                    G.frame.hint.data({
                        callback: function () {
                            f();
                        },
                        cacheKey: "diaowenHint",
                        txt: L("CZHSPZ")
                    }).show();
                } else {
                    f();
                }
            }, 1000);

            me.nodes.btn_yjjl.click(function () {
                for (var i = 1; i < 6; i ++) {
                    if(me.selectedArr.length == 5) {
                        G.tip_NB.show(L("JLCYM"));
                        return;
                    }
                    if(G.frame.diaowen.getNoInArrByRed(me.selectedArr).length < 1) {
                        G.tip_NB.show(L("ZWKFRDW"));
                        return;
                    }
                    var lay = me.nodes["panel_dw_" + i];
                    if(!lay.children[0]) {
                        var arr = G.frame.diaowen.getNoInArrByRed(me.selectedArr);
                        if(arr.length > 0) {
                            me.setDW(lay, arr[0]);
                        } else {
                            break;
                        }
                    }
                    me.setAni();
                    G.tip_NB.show(L("YJFRCG"));
                }
            });

            me.nodes.btn_fh.click(function () {
                G.frame.diaowen_tisheng.remove();
            });

            me.nodes.btn_jlz.click(function () {
                G.frame.diaowenduihuan.show();
            });

            for (var i = 1; i < 6; i ++) {
                (function (lay) {
                    lay.setTouchEnabled(true);
                    lay.click(function (sender) {
                        if(sender.children[0]) {
                            me.selectedArr.splice(X.arrayFind(me.selectedArr, sender.gid), 1);
                            sender.removeAllChildren();
                            me.setAni();
                        } else {
                            G.frame.diaowen_select.data({
                                callback: function (gidArr) {
                                    me.setLay(gidArr);
                                    me.setAni();
                                },
                                selected: me.selectedArr,
                                maxNum: 5
                            }).show();
                        }
                    })
                })(me.nodes["panel_dw_" + i]);
            }
        },
        setAni: function () {
            var me = this;

            if(G.frame.diaowen.getNoInArr(me.selectedArr).length < 1) {
                for (var i = 1; i < 6; i ++) {
                    me.nodes["img_jia" + i].hide();
                }
            } else {
                for (var i = 1; i < 6; i ++) {
                    me.nodes["img_jia" + i].show();
                }
            }
        },
        onOpen: function () {
            var me = this;

            for (var i = 1; i < 6; i ++) {
                me.nodes["img_jia" + i].runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
            }

            me.selectedArr = [];
            me.bindBtn();
        },
        onShow : function(){
            var me = this;

            G.class.ani.show({
                json: "ani_diaowen_jinglian",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("xunhuan", true);
                    me.action = action;
                }
            });

            me.setAttr();
            me.setJDT();
            me.setAni();
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.glyph) {
                G.setNewIcoImg(me.nodes.btn_jlz, .85);
            } else {
                G.removeNewIco(me.nodes.btn_jlz);
            }
        },
        getData: function(cb) {
            var me = this;

            me.ajax("glyph_getrefinenum", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    cb && cb();
                }
            })
        },
        setAttr: function () {
            var me = this;

            me.nodes.text_jhsl.setString(G.class.getOwnNum("2024", "item"));
        },
        setDW: function (lay, gid) {
            var me = this;

            var wid = G.class.sglyph(G.frame.beibao.DATA.glyph.list[gid], true);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(lay.width / 2, lay.height / 2);
            lay.removeAllChildren();
            lay.addChild(wid);
            lay.gid = gid;

            me.selectedArr.push(gid);
        },
        setJDT: function () {
            var me = this;

            me.getData(function () {
                me.nodes.img_jdt1.setPercent(me.DATA);
                me.ui.finds("wz_1").setString(me.DATA);
            });
        },
        setLay: function (gidArr) {
            var me = this;

            for (var i = 1; i < 6; i ++) {
                var lay = me.nodes["panel_dw_" + i];
                for (var j in gidArr) {
                    if(!X.inArray(me.selectedArr, gidArr[j]) && !lay.children[0]) {
                        me.setDW(lay, gidArr[j]);
                    }
                }
            }
        }
    });

})();