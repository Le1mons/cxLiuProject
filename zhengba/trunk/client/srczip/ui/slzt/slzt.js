(function () {
    var ID = 'slzt';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.setContents();
            me.bindBtn();
        },
        setContents: function () {
            var me = this;
            me.setEvent()
            me.setTime();
            me.setModel();
            me.nodes.txt_cs.setString(X.STR(L('slzt_tip6'), me.DATA.mydata.layer));
            me.nodes.txt_lhjx.setString(G.class.slzt.getGL(G.slzt.mydata.mirrornum)/10 + "%");

        },
        setModel: function () {
            var me = this;
            var data = me.DATA.mydata;
            var conf = G.class.slzt.getById(data.layer);
            me.nodes.panel_js.removeAllChildren();
            if (X.isHavItem(data.mirror)) {

                me.ui.finds("Text_5_0").setString(L("slzt_tip12"))
                X.setHeroModel({
                    parent: me.nodes.panel_js,
                    data:data.mirror.headdata,
                    // model: ,
                    noRelease: true,
                    cache: false
                });
                me.nodes.panel_js.state = "jingxiang";
                me.nodes.img_ytz.setVisible(me.DATA.mydata.killmirror == 1)
            } else {
                me.nodes.img_ytz.setVisible(me.DATA.mydata.killboss == 1)
                me.ui.finds("Text_5_0").setString(L("slzt_tip13"))
                X.setHeroModel({
                    parent: me.nodes.panel_js,
                    data: {},
                    model: conf.model,
                    noRelease: true,
                    cache: false
                });
                me.nodes.panel_js.state = "boss";
            }
            if (me.DATA.mydata.layernum < G.class.slzt.getCom().daynum) {

            } else { }
            var bool = me.DATA.mydata.layernum < G.class.slzt.getCom().daynum;
            me.nodes.panel_js.setTouchEnabled(bool);
            me.nodes.panel_js.setBright(bool);
            me.nodes.txt_tz.setString(bool ? L('slzt_tip23') : L('slzt_tip24'))
            me.nodes.panel_js.click(function (sender) {
                if (sender.state == "boss") {
                    if (me.DATA.mydata.killboss == 1) {
                        return;
                    }
                    G.frame.slzt_boss.data({ type: 1 }).show()

                } else {
                    if (me.DATA.mydata.killmirror == 1) {
                        return;
                    };
                    G.frame.slzt_boss.data({ type: 2 }).show()
                    // me.fightJingxiang();

                }
            })
        },
        fightJingxiang: function () {
            var me = this;

            G.frame.yingxiong_fight.data({
                pvType: 'slzt2',
                title: L('slzt_tip7'),
                norepeat: me.getUsed(),
                callback: function (cache) {
                    cc.log(cache.getSelectedData())
                    selectedData = cache.getSelectedData();
                    G.ajax.send('shilianzt_fight', [2, selectedData], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            X.cacheByUid('slzt2', selectedData);
                            G.frame.slzt.DATA.mydata = d.d.mydata;
                            me.setContents()

                            // d.d.fightres.fightkey = d.d.fightkey;
                            // G.frame.friend.fightName = me.DATA.headdata.name;
                            G.frame.fight.data({
                                pvType: 'slzt',
                                prize: d.d.prize
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }
                    }, true);
                },
            }).show();
        },
        fightBoss: function () {
            var me = this;

            G.frame.yingxiong_fight.data({
                pvType: 'slzt1',
                title: L('slzt_tip7'),
                norepeat: me.getUsed(),
                callback: function (cache) {
                    cc.log(cache.getSelectedData())
                    selectedData = cache.getSelectedData();

                    G.ajax.send('shilianzt_fight', [1, selectedData], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            X.cacheByUid('slzt1', selectedData);
                            G.frame.slzt.DATA.mydata = d.d.mydata;
                            me.setContents()
                            if (X.isHavItem(d.d.mydata.mirror)) {
                                G.class.ani.show({
                                    json: "ani_xiaotubiao_renwu",                                  
                                    repeat: false,
                                    autoRemove: true
                                });
                            }
                            // d.d.fightres.fightkey = d.d.fightkey;
                            // G.frame.friend.fightName = me.DATA.headdata.name;
                            G.frame.fight.data({
                                pvType: 'slzt',
                                prize: d.d.prize
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }
                    }, true);
                },
            }).show();
        },
        //获取已经用的英雄
        getUsed: function () {
            var me = this;
            var arr = [];
            for (var i = 1; i < 7; i++) {

                var obj = X.cacheByUid('slzt' + i);
                if (X.isHavItem(obj)) {
                    for (var k in obj) {
                        arr.push(obj[k])
                    }
                };
            }
            return arr.concat(me.DATA.mydata.usehero);
        },
        setTime: function () {
            var me = this;
            // var endtime = X.getLastMondayZeroTime() + 7 * 24 * 3600;
            X.timeout(me.nodes.txt_sj, me.DATA.mydata.refreshtime, function () {
                G.tip_NB.show(L("slzt_tip11"));
                // me.remove();
                me.getData(function () {
                    me.setContents();
                })
            })
        },
        getNext: function () {
            var me = this;
            // if (X.isHavItem(G.slzt.mydata.mirror)) {
            //     return G.slzt.mydata.killmirror
            // } else {
            return G.slzt.mydata.killboss
            // }
        },
        nextLayer: function () {
            var me = this;
            var data = me.DATA.mydata.eventdata;
            var idx = 0;
            for (var i = 0; i < data.length; i++) {
                if (data[i].eid != 4) {
                    idx++
                }
            };
            if (me.DATA.mydata.finishevent.length < idx || (X.isHavItem(G.slzt.mydata.mirror) && !G.slzt.mydata.killmirror)) {
                G.frame.alert.data({
                    title: L("TS"),
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send('shilianzt_pass', [], function (str, data) {
                            if (data.s == 1) {
                                me.DATA.mydata = data.d.mydata;

                                me.setContents()
                            }
                        });
                    },
                    richText: L('slzt_tip21'),
                }).show();
            } else {

                G.ajax.send('shilianzt_pass', [], function (str, data) {
                    if (data.s == 1) {
                        me.DATA.mydata = data.d.mydata;

                        me.setContents()
                    }
                });
            }

        },
        setEvent: function () {
            var me = this;
            var data = G.slzt.mydata.eventdata;
            data.forEach(function name(item, idx) {
                var node = me.nodes["panel_" + (idx + 1)];
                var clnode = node.children[0];
                if (!clnode) {
                    clnode = me.nodes.list.clone();
                    X.autoInitUI(clnode);
                    node.addChild(clnode);
                    clnode.setPosition(node.width / 2, node.height / 2);
                    clnode.show()
                    clnode.setTouchEnabled(true);
                }
                me["initEvent" + item.eid](item, clnode, idx)
            })
        },
        //护卫
        initEvent1: function (data, node, idx) {
            var me = this;
            node.nodes.panel_hw.setBackGroundImage("img/shilianzhita/img_hw.png", 1);
            node.nodes.txt_hw.setString(G.class.slzt.getEvent()[1].name)
            node.eventIdx = idx;
            node.click(function (sender) {
                if (X.inArray(me.DATA.mydata.finishevent, idx)) {
                    G.tip_NB.show(L("slzt_tip8"))
                    return
                };
                G.frame.slzt_hw.data({
                    idx: sender.eventIdx,
                    callback: function () {

                    },
                }).show();
            })
        },
        //buff
        initEvent2: function (data, node, idx) {
            var me = this;
            node.eventIdx = idx;
            node.nodes.panel_hw.setBackGroundImage("img/shilianzhita/img_jc.png", 1);
            node.nodes.txt_hw.setString(G.class.slzt.getEvent()[2].name)
            node.click(function (sender) {
                if (X.inArray(me.DATA.mydata.finishevent, idx)) {
                    G.tip_NB.show(L("slzt_tip8"))
                    return
                };
                G.frame.slzt_buff.data({
                    idx: sender.eventIdx,
                    data:  me.DATA.mydata.eventdata[sender.eventIdx],
                    callback: function () {


                    },
                }).show()
            })
        },
        //答题
        initEvent3: function (data, node, idx) {
            var me = this;
            node.eventIdx = idx;
            node.nodes.panel_hw.setBackGroundImage("img/shilianzhita/img_zp.png", 1);
            node.nodes.txt_hw.setString(G.class.slzt.getEvent()[3].name)
            node.click(function (sender) {
                if (X.inArray(me.DATA.mydata.finishevent, idx)) {
                    G.tip_NB.show(L("slzt_tip8"))
                    return
                };
                G.frame.slzt_dt.data({
                    idx: sender.eventIdx,
                    data:  me.DATA.mydata.eventdata[sender.eventIdx],
                    callback: function () {


                    },
                }).show()
            })
        },
        //商店
        initEvent4: function (data, node, idx) {
            var me = this;
            node.eventIdx = idx;
            node.nodes.panel_hw.setBackGroundImage("img/shilianzhita/img_sr.png", 1);
            node.nodes.txt_hw.setString(G.class.slzt.getEvent()[4].name)
            node.click(function (sender) {
                G.frame.slzt_shop.data({
                    idx: sender.eventIdx,
                    data: me.DATA.mydata.eventdata[sender.eventIdx],
                    callback: function () {


                    },
                }).show()
            })
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.redPoint();
        },
        redPoint: function () {
            var me = this;
             if(G.DATA.hongdian.slzt.task){
                G.setNewIcoImg(me.nodes.btn_slmb)
             }else{
                G.removeNewIco(me.nodes.btn_slmb);
             }
             if(G.DATA.hongdian.slzt.forevertask){
                G.setNewIcoImg(me.nodes.slzt_cjrw)

             }else{
                G.removeNewIco(me.nodes.slzt_cjrw);

             }
        },
        onAniShow: function () {
            var me = this;
        },
        checkShow: function () {
            var me = this;
            me.getData(function () {
                if (me.DATA.mydata.new) {
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            me.show()
                        },
                        richText: L("slzt_tip4"),
                    }).show();
                } else {
                    me.show()
                }
            })
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send('shilianzt_open', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    G.slzt = data.d;
                    callback && callback();
                }
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender) {
                me.remove();
            })
            me.nodes.btn_slmb.click(function () {
                G.frame.slzt_slmb.once("close",function(){
                    G.hongdian.getData("slzt", 1, function () {
                        me.redPoint();
                        G.frame.julongshendian.checkRedPoint()
                    });
                }).show();
            })
            me.nodes.btn_phb.click(function () {
                G.frame.slzt_rank.show();
            })
            me.nodes.btn_sljc.click(function () {
                G.frame.slzt_sljc.show();
            })
            me.nodes.btn_kszd.click(function () {
                G.frame.slzt_kszd.show();
            })
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS100')
                }).show();
            })
            me.nodes.btn_rw.click(function () {
                G.frame.slzt_cjrw.once("close",function(){
                    G.hongdian.getData("slzt", 1, function () {
                        me.redPoint();
                        G.frame.julongshendian.checkRedPoint()
                    });
                }).show();
            })
            me.nodes.btn_qw.click(function (sender) {
                if (!me.getNext()) {
                    G.tip_NB.show(L("slzt_tip19"))
                    return
                };
                me.nextLayer();
            })
            me.nodes.btn_cjrw.click(function (sender) {
                G.frame.slzt_lhjx.show()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita.json', ID);
})();