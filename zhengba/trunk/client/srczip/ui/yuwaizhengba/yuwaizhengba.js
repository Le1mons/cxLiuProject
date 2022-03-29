/**
 * Created by LYF on 2018/7/10.
 */
(function () {

    //域外争霸
    var ID = 'yuwaizhengba';
    G.event.on('freshKFZ', function (d) {
        if (G.frame.yuwaizhengba.isShow) {
            G.frame.yuwaizhengba.getData(function () {
                G.frame.yuwaizhengba.setContents();
            });
        }
        if (G.frame.yuwaizhengba_jifen.isShow) {
            G.frame.yuwaizhengba_jifen.setTop();
        }
    });

    G.event.on('itemchange_over', function (data) {
        var keys = X.keysOfObject(data);
        for (var i in keys) {
            if (data[keys[i]].itemid == 2019) {
                if (G.frame.yuwaizhengba.isShow) {
                    G.frame.yuwaizhengba.ui.nodes.text_gssl.setString(X.fmtValue(G.class.getOwnNum(2019, 'item')));
                }
                if (G.frame.yuwaizhengba_jifen.isShow) {
                    G.frame.yuwaizhengba_jifen.ui.nodes.text_gssl.setString(X.fmtValue(G.class.getOwnNum(2019, 'item')));
                }
                if (G.frame.yuwaizhengba_zhengba.isShow) {
                    G.frame.yuwaizhengba_zhengba.ui.nodes.text_gssl.setString(X.fmtValue(G.class.getOwnNum(2019, 'item')));
                }

            }
        }
    });

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        getData: function (callback) {
            var me = this;

            me.ajax('crosszb_status', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            }, true);
        },
        initUI: function () {
            var me = this;

            me.onnp('focus', function () {
                G.event.once('hdchange_over', function () {
                    if (G.frame.yuwaizhengba.isShow) {
                        // me.checkHongdian();
                    }
                });
                // G.event.emit('hdchange');
            });
            me.setBgAni();

        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            me.ui.nodes.btn_bangzhu.click(function (sender, type) {
                G.frame.help.data({
                    intr: L('TS16')
                }).show();
            });

            me.ui.nodes.btn_yysd.click(function (sender, type) {
                // G.frame.shop.data({
                //     type: "7",
                //     name: "ywsd"
                // }).show();
                G.frame.shopmain.data('7').show();
            });

            me.ui.nodes.btn_zbs.click(function (sender, type) {
                G.frame.yuwaizhengba_zbqz.show();
            });
        },
        setBgAni: function () {
            var me = this;
            var node = me.ui.nodes.bg_2;
            node.removeAllChildren();
            G.class.ani.show({
                addTo: node,
                json: 'ani_yuwaizhengba_beijing',
                x: node.width / 2,
                y: node.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
        },
        onOpen: function () {
            var me = this;
            me.initUI();
            me.bindUI();
            X.audio.playEffect("sound/waiyuzhengba.mp3");
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.setContents();
            me.checkRedPoint();
        },
        onHide: function () {
            var me = this;
            G.frame.jingjichang.checkRedPoint();
        },
        checkRedPoint: function() {
            var me = this;

            if(G.DATA.hongdian.crosszbjifen.jifen) {
                G.setNewIcoImg(me.nodes.jfs);
                me.nodes.jfs.getChildByName("redPoint").setPosition(300, 360);
            }else {
                G.removeNewIco(me.nodes.jfs);
            }

            if(G.DATA.hongdian.crosszbjifen.zb) {
                G.setNewIcoImg(me.nodes.zbs);
                me.nodes.zbs.getChildByName("redPoint").setPosition(507, 397);
            }else {
                G.removeNewIco(me.nodes.zbs);
            }
        },
        checkShow: function() {
            var me = this;

            G.ajax.send('crosszb_status', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    G.ajax.send("zypkjjc_open", [], function (b) {
                        if (!b) return;
                        var b = JSON.parse(b);
                        if(b.s == 1) {
                            if(X.keysOfObject(b.d.defhero).length < 1) {
                                G.frame.alert.data({
                                    cancelCall:null,
                                    okCall: function(){
                                        G.frame.jingjichang.nodes.img_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                    },
                                    richText: L("SWSZZR"),
                                    sizeType: 3
                                }).show();
                            }else {
                                me.show();
                            }
                        }
                    });
                }
            });
        },
        setAni:function(parent){
            var me = this;
            parent.stopAllActions();
            if(parent.defPos){
                parent.setPosition(parent.defPos);
            }else{
                parent.defPos = parent.getPosition();
            }
            parent.runActions(
                cc.repeatForever(cc.sequence([
                    cc.moveBy(1.7,cc.p(0,20)),
                    cc.moveBy(1.7,cc.p(0,-20))
                ]))
            );
        },
        setContent: function (parent, data) {
            var me = this;
            X.autoInitUI(parent);
            var nodes = parent.nodes;
            nodes.xzz.hide();
            nodes.text1.hide();
            nodes.text2.hide();
            nodes.hrjxz.hide();
            nodes.Image_51.show();
            nodes.chufaquyu.hide();
            if (data.isOpen) {
                nodes.text1.show();
                nodes.text2.show();
                nodes.hrjxz.show();
                nodes.chufaquyu.show();
                me.setAni(parent);
                if (!cc.isNode(parent.aniNode)) {
                    nodes.chufaquyu.removeAllChildren();
                    G.class.ani.show({
                        addTo: nodes.chufaquyu,
                        json: ['ani_yuwaizhengba_jjc2', 'ani_yuwaizhengba_jjc1'][data.idx || 0],
                        x: nodes.chufaquyu.width / 2,
                        y: nodes.chufaquyu.height / 2,
                        repeat: false,
                        autoRemove: false,
                        onload: function (node, action) {
                            action.play('run', true);
                            parent.aniNode = node;
                            nodes.Image_51.hide();

                        }
                    });
                }else{
                    nodes.Image_51.hide();
                }
                if (parent.timer) {
                    parent.clearTimeout(parent.timer);
                    delete parent.timer;
                }
                parent.timer = X.timeout(nodes.text2, data.cd, function () {
                    me.getData(function () {
                        me.setContents();
                    });
                });
            } else {
                nodes.xzz.show();
            }

        },
        setContents: function () {
            var me = this;
            var nodes = me.ui.nodes;
            var data = me.DATA;
            var jfSate = data.jifen;
            var zbState = data.zhengba;
            nodes.text_gssl.setString(X.fmtValue(G.class.getOwnNum(2019, 'item')));

            //积分赛
            me.setContent(nodes.jfs, {'isOpen': jfSate == 1, 'cd': data.jifencd, 'idx': 0});
            //争霸赛
            me.setContent(nodes.zbs, {'isOpen': zbState == 1 || zbState == 3, 'cd': data.zhengbacd, 'idx': 1});

            if (zbState == 1) {
                nodes.zbs.finds('text1$').setString(X.STR(L('KFZ_tip_2'),L('KFZ_ZB')));
            }else{
                nodes.zbs.finds('text1$').setString(X.STR(L('KFZ_tip_1'),L('KFZ_ZB')));
            }
            nodes.dianji.click(function (sender, type) {
                G.frame.yuwaizhengba_jifen.show();
            }, 1000);
            nodes.dianji1.click(function (sender, type) {
                if (zbState == 3) {
                    G.tip_NB.show(L('KFZ_ZB_tip'));
                    return;
                }
                me.ajax('crosszb_zhengbamain', [], function (str, data) {
                    if (data.s == 1) {
                        G.frame.yuwaizhengba_zhengba.data(data.d).show();
                    }
                }, true);
            }, 1000);
        },
    });
    G.frame[ID] = new fun('kfzb.json', ID);
})();