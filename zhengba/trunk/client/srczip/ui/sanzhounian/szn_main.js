(function () {
    G.event.on("attrchange_over", function () {
        if (G.frame.szn_main.isShow) {
            G.frame.szn_main.showTop();
        }
    });
    //三周年主界面
    var ID = 'szn_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        show: function () {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send('zhounian3_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d.myinfo;
                    G.DATA.szn = d.d.myinfo;
                    callback && callback();
                }
            }, true);
        },
        onOpen: function () {
            var me = this;
            me.initBtn();
            me.showTop();
        },
        showTop: function () {
            var me = this;
            var arr = ["jinbi", "rmbmoney"];
            var nodeArr = [{ num: "txt_jb", node: "btn_jia1", frame: "dianjin" }, { num: "txt_zs", node: "btn_jia2", frame: "chongzhi" }];
            arr.forEach(function name(item, idx) {
                me.nodes[nodeArr[idx].num].setString(X.fmtValue(P.gud[item]));
                me.nodes[nodeArr[idx].node].click(function (sender) {
                    G.frame[nodeArr[idx].frame].show()
                })

            })
        },
        initBtn: function () {
            var me = this;
            var conf = G.class.menu.get("szn");
            conf.forEach(function name(item, idx) {
                var node = me.nodes.list.clone();
                node.show();
                X.autoInitUI(node);
                node.nodes.txt_name.setString(item.title);
                node.nodes.btn_1.idx = item.id;
                node.nodes.btn_1.click(function (sender) {
                    me.changeType(sender.idx);
                })
                me.nodes.listview.pushBackCustomItem(node);
            })
            me.nodes.listview.children[0].nodes.btn_1.triggerTouch(2);
        },
        changeType: function (idx) {
            var me = this;
            if (me.typeidx == idx) return;
            me.typeidx = idx;
            me.reSetBtn();
            var viewConf = {
                "1": G.class.znq_qdhy,
                "2": G.class.znq_qdbz,
                "3": G.class.znq_qdtz,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[idx])) {
                cc.log('type...', idx);
                me._panels[idx] = new viewConf[idx](idx);
                me.nodes.panel_nr.addChild(me._panels[idx]);
            } else {
                me._panels[idx].reSetView();
            }
        },
        reSetBtn: function () {
            var me = this;
            me.nodes.listview.children.forEach(function name(item, idx) {
                item.nodes.btn_1.setBright(item.nodes.btn_1.idx != me.typeidx)
            })
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
            me.setTime()
        },
        setTime: function () {
            var me = this;
            me.nodes.panel_djs.removeAllChildren();
            var strNode = new ccui.Text();
            strNode.setName('txtJdt');
            strNode.setFontName(G.defaultFNT);
            strNode.setFontSize(20);
            strNode.setTextColor(cc.color("#2bdf02"));
            var time = G.time > G.DATA.asyncBtnsData.zhounian3.rtime ? G.DATA.asyncBtnsData.zhounian3.etime : G.DATA.asyncBtnsData.zhounian3.rtime;
            var rh = X.setRichText({
                str: G.time > G.DATA.asyncBtnsData.zhounian3.rtime ? L('szn_24') : L('szn_21'),
                parent: me.nodes.panel_djs,
                node: strNode,
                anchor: { x: 0.5, y: 0.5 },
                pos: { x: me.nodes.panel_djs.width / 2, y: me.nodes.panel_djs.height / 2 },
                color: "#ffffff"
            });
            X.timeout(strNode, time, function () {
                if (G.time > G.DATA.asyncBtnsData.zhounian3.etime) {
                    G.view.mainView.getAysncBtnsData(function () {
                        me.remove();
                    }, false);
                } else {
                    G.frame.szn_main.getData(function () {
                        me.setTime()
                    })
                }
            }, function () {
                if (time - G.time > 3600 * 24) {
                    rh.x = 80
                } else {
                    rh.x = 50
                }
            }, {
                showDay: true,
                onlyDay: true,
                timeLeftStr: "h:mm:s"
            });
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_ph.click(function (sender) {
                G.frame.help.data({
                    intr: L('TS101')
                }).show();
            })
            me.nodes.btn_fh.click(function (sender) {
                me.remove();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing.json', ID);
})();