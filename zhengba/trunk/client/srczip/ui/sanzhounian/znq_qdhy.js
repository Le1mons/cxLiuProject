(function () {
    G.class.znq_qdhy = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._super('zhounianqing_qdhy.json', null, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.DATA.szn;
        },
        onShow: function () {
            var me = this;
            me.setContents()
            me.bindBtn();
            me.checkRed();
        },
        checkRed: function () {
            var me = this;
            if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                G.removeNewIco(me.nodes.btn_qdrw)
                G.removeNewIco(G.frame.szn_main.nodes.listview.children[0]);

                return
            }
            var conf = G.class.szn.getqdTask();
            var got = me.DATA.task.rec;

            var bool1 = false;
            for (var key in conf) {
                var val = me.DATA.task.data[key] || 0;
                if (conf[key].pval <= val && !X.inArray(got, key)) {
                    bool1 = true
                    break
                }
            }
            var gotArr = me.DATA.jifenprize;
            var conf2 = G.class.szn.getjfConf();
            var bool2 = false;
            for (var k in conf2) {
                if (me.DATA.val >= conf2[k].val && !X.inArray(gotArr, k)) {
                    bool2 = true;
                    break
                }
            }
            G.removeNewIco(G.frame.szn_main.nodes.listview.children[0]);
            if (bool1 || bool2) {
                G.setNewIcoImg(G.frame.szn_main.nodes.listview.children[0]);
                G.frame.szn_main.nodes.listview.children[0].getChildByName("redPoint").x = 104;
            }
            if (bool1) {
                G.setNewIcoImg(me.nodes.btn_qdrw);
            } else {
                G.removeNewIco(me.nodes.btn_qdrw)
            };

        },
        setContents: function () {
            var me = this;
            var conf = G.class.szn.getjfConf();
            for (var i = 1; i < 10; i++) {
                var node = me.nodes["panel_" + i];
                var clnode = node.children[0];
                if (!clnode) {
                    clnode = me.nodes.list.clone();
                    clnode.show();
                    X.autoInitUI(clnode);
                    node.addChild(clnode);
                    clnode.setPosition(node.width / 2, node.height / 2);
                }
                me.setList(clnode, i - 1, conf[i - 1],conf[i - 2] ? conf[i - 2].val : 0);
            }
            me.setJf();
        },
        setJf: function () {
            var me = this;
            var rh1 = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.panel_jf.width,
                lineHeight: 20,
                family: G.defaultFNT,
                color: G.gc.COLOR.n5,
            });
            rh1.text(X.STR(L('szn_18'), me.DATA.val));
            me.nodes.panel_jf.removeAllChildren();
            me.nodes.panel_jf.addChild(rh1);
            rh1.setPosition(me.nodes.panel_jf.width / 2 - rh1.trueWidth() / 2, me.nodes.panel_jf.height / 2 - rh1.trueHeight() / 2);

        },
        setList: function (ui, idx, data,val) {
            var me = this;
            var gotArr = me.DATA.jifenprize;
            me.nodes["jdt" + (idx +1)] && me.nodes["jdt" + (idx +1)].setPercent(parseInt(me.DATA.val - val)/data.val*100)
            X.render({
                panel_bx: function (node) {
                    node.setVisible(!X.inArray(gotArr, idx));
                    if (me.DATA.val >= data.val) {
                        G.setNewIcoImg(node);
                        G.class.ani.show({
                            json: "3zn_bx_dx",
                            addTo: node,
                    
                            repeat: true,
                            autoRemove: false,
                            uniqueid: true,
                            onload: function (_node, action) {
                                action.play("zhong",true)
                                node.action = action
                            }
                        });

                    } else {
                        G.removeNewIco(node)
                    }
                    node.click(function (sender) {
                        if (me.DATA.val >= data.val) {
                            node.removeBackGroundImage()
                            sender.action.playWithCallback("hou",false,function(){

                                G.ajax.send('zhounian3_jifenprize', [idx], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        me.DATA.jifenprize = d.d.myinfo.jifenprize;
                                        G.frame.jiangli.data({
                                            prize: d.d.prize
                                        }).show();
                                        me.setList(ui, idx, data,val);
                                        me.checkRed();
    
                                    }
                                }, true);
                            })
                        } else {
                            G.frame.szn_jlyl.data(data).show();
                        }
                    })
                },
                panel_bxk: function (node) {
                    node.setVisible(X.inArray(gotArr, idx));
                    node.setTouchEnabled(true);
                    node.click(function (sender) {
                        G.frame.szn_jlyl.data(data).show();
                    })
                },
                txt_ms: function (node) {
                    if (X.inArray(gotArr, idx)) {
                        var str = L("YLQ");
                        var color = "#ffffff"
                    } else {
                        if (me.DATA.val >= data.val) {
                            var str = L("KLQ");
                            var color = "#2bdf02"

                        } else {
                            var str = data.val;
                            var color = "#b6b6b6"

                        }
                    }
                    setTextWithColor(node, str, color);
                }
            }, ui.nodes)
        },
        reSetView: function () {
            var me = this;
            me.show()
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_qdrw.click(function (sender) {
                if (G.time >= G.DATA.asyncBtnsData.zhounian3.rtime) {
                    G.tip_NB.show(L('szn_26'));
                    return
                }
                G.frame.szn_qdrw.once("close", function () {
                    me.setContents()
                    me.checkRed();

                }).show()
            })
        },
    });
})();

