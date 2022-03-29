/**
 * Created by LYF on 2019/9/23.
 */
(function () {
    //爵位
    var ID = 'juewei';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            var jdt = me.nodes.panel_jdt_juewei;

            for (var i = 0; i < jdt.children.length; i ++) {
                var jd = me.nodes["img_jdt" + (i + 1)];
                jd && jd.setPercent && jd.setPercent(0);
            }

            var name = me.allName = me.getAllName();
            for (var i = 0; i < name.length; i ++) {
                me.nodes["text_ico_name" + (i + 1)] && me.nodes["text_ico_name" + (i + 1)].setString(name[i]);
            }

            X.autoInitUI(me.nodes.panel_juewei_y1);
            X.autoInitUI(me.nodes.panel_juewei_y2);
            cc.enableScrollBar(me.nodes.listview_jw1);
            cc.enableScrollBar(me.nodes.listview_jw2);
            cc.enableScrollBar(me.nodes.listview_jw3);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_yulan.click(function () {
                G.frame.jueweiyulan.show();
            });

            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L("TS49")
                }).show();
            });

            me.nodes.btn_qwhq.click(function () {
                var conf = G.gc.juewei;
                var curLv = P.gud.title;
                var nextLv = curLv + 1;
                me.ajax("title_lvup", [], function (str, data) {
                    if (data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'title_lvup',
                            data:{
                                oldLv:curLv,
                                newLv:nextLv,
                                consume: me.consume,
                            }
                        });

                        if (conf[nextLv].type != conf[curLv].type) {
                            G.frame.juewei_up.data({
                                cur: curLv,
                                next: nextLv
                            }).show();
                        } else {
                            G.tip_NB.show(L("JW_UPLV"));
                        }
                        me.setProgress();
                        me.setContents();
                        G.hongdian.getData("title", 1, function () {
                            me.checkRedPoint();
                        });
                    }
                });
            }, 1000);

            me.ui.finds("$btn_fanhui").setTouchEnabled(true);
            me.ui.finds("$btn_fanhui").click(function () {
                me.remove();
            });

            me.nodes.btn_tqlb.click(function () {
                me.getBuyNum(function () {
                    G.frame.juewei_tqlb.show();
                });
            });

            me.nodes.btn_jwjl.click(function () {
                G.frame.juewei_targetPrize.show();
            });
        },
        checkRedPoint: function () {
            var me = this;

            var data = G.DATA.hongdian.title || {};
            if (data.prize || data.libao) {
                G.setNewIcoImg(me.nodes.btn_tqlb);
            } else {
                G.removeNewIco(me.nodes.btn_tqlb);
            }
            if (data.aims) {
                G.setNewIcoImg(me.nodes.btn_jwjl);
            } else {
                G.removeNewIco(me.nodes.btn_jwjl);
            }
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getBuyNum: function (callback) {
            var me = this;
            connectApi("title_open", [], function (data) {
                me.DATA = data;
                me.DATA.reclist = me.DATA.reclist || [];
                callback && callback();
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getBuyNum(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.setProgress();
            me.setContents();
            me.checkRedPoint();
            me.changeToperAttr({
                attr1: {a: 'item', t: '2053'}
            });
        },
        onHide: function () {
            var me = this;

            me.changeToperAttr();
        },
        setProgress: function () {
            var me = this;
            var jdt = me.nodes.panel_jdt_juewei;
            var curIndex = G.gc.juewei[P.gud.title].type;

            for (var i = 0; i < jdt.children.length; i ++) {
                var jd = me.nodes["img_jdt" + (i + 1)];
                var tp = me.nodes["panel_ico" + (i + 1)];
                tp.getChildByTag(555) && tp.getChildByTag(555).removeFromParent();

                if (curIndex > i) jd && jd.setPercent && jd.setPercent(100);
                else if (curIndex == i) {
                    var per = me.getProgressByLv();
                    jd && jd.setPercent && jd.setPercent(per[0] / per[1] * 100);

                    G.class.ani.show({
                        addTo: tp,
                        json: "ani_juewei_dangqianxuanzhong",
                        repeat: true,
                        autoRemove: false,
                        z: -10,
                        onload: function (node) {
                            node.setTag(555);
                        }
                    });
                }
            }
        },
        getAllName: function () {
            var name = [];
            var keys = Object.keys(G.gc.juewei);

            keys.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            for (var index = 0; index < keys.length; index ++) {
                var conf = G.gc.juewei[keys[index]];
                if (!X.inArray(name, conf.name)) name.push(conf.name);
            }

            return name;
        },
        getProgressByLv: function (lv) {
            var conf = G.gc.juewei;
            var cur = G.gc.juewei[lv || P.gud.title];
            var arr = [];

            for (var i in conf) if (conf[i].type == cur.type) arr.push(1);

            return [cur.rank, arr.length];
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.juewei;
            var com = G.gc.jueweicom;
            var noUpPanel = me.nodes.panel_juewei_y2;
            var canUpPanel = me.nodes.panel_juewei_y1;

            noUpPanel.setVisible(conf[P.gud.title + 1] == undefined);
            canUpPanel.setVisible(conf[P.gud.title + 1] != undefined);

            if (conf[P.gud.title + 1]) {
                var curConf = conf[P.gud.title];
                me.consume = curConf.need;//打点
                var nextConf = conf[P.gud.title + 1];
                X.render({
                    ico_jw_1: "#img/juewei/" + curConf.ico + ".png",
                    ico_jw_2: "#img/juewei/" + nextConf.ico + ".png",
                    text_jwjc1: function (node) {
                        node.setString(curConf.name + (curConf.rank ? "+" + curConf.rank : ""));
                        node.setTextColor(cc.color(com.fontcolor[curConf.type] || "#ffffff"));
                        X.enableOutline(node, com.fontoulit[curConf.type] || "#ffffff", 1);
                    },
                    text_jwjc2: function (node) {
                        node.setString(nextConf.name + (nextConf.rank ? "+" + nextConf.rank : ""));
                        node.setTextColor(cc.color(com.fontcolor[nextConf.type] || "#ffffff"));
                        X.enableOutline(node, com.fontoulit[nextConf.type] || "#ffffff", 1);
                    },
                    panel_jlwp: function (node) {
                        X.alignItems(node, curConf.need, "left", {
                            touch: true,
                            mapItem: function (node) {
                                if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                                    node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                                }
                            }
                        });
                    },
                    listview_jw1: function (node) {
                        me.showBuff(node, curConf, "#ffdb85");
                    },
                    listview_jw2: function (node) {
                        me.showBuff(node, nextConf, "#38e311");
                    },
                    panel_jcjc_sz: function (node) {
                        if (curConf.type == me.getMaxType()) return node.hide();
                        var per = me.getProgressByLv();
                        var str = X.STR(L("ZSXJTSJWDJ"), per[1] - per[0]);
                        var rh = X.setRichText({
                            str: str,
                            parent: node,
                            size: 20,
                            color: "#ddb071",
                            maxWidth: 200
                        });
                        rh.setPosition(node.width - rh.trueWidth(), node.height / 2 - rh.trueHeight() / 2);
                    }
                }, canUpPanel.nodes);
            } else {
                var curConf = conf[P.gud.title];
                X.render({
                    text_jwjc_max1: function (node) {
                        node.setString(curConf.name + (curConf.rank ? "+" + curConf.rank : ""));
                        node.setTextColor(cc.color(com.fontcolor[curConf.type] || "#ffffff"));
                        X.enableOutline(node, com.fontoulit[curConf.type] || "#ffffff", 1);
                    },
                    ico_jw_max1: "#img/juewei/" + curConf.ico + ".png",
                    listview_jw3: function (node) {
                        me.showBuff(node, curConf, "#c29458");
                    }
                }, noUpPanel.nodes);
            }
        },
        showBuff: function (listView, conf, color, list) {
            var me = this;

            listView.removeAllChildren();
            var buffKeys = Object.keys(conf.buff);
            G.gc.sortBuff(buffKeys);
            for (var index = 0; index < buffKeys.length; index ++) {
                var key = buffKeys[index];
                var buffList = list ? list.clone() : me.nodes.panel_wz_list.clone();
                buffList.show();
                X.autoInitUI(buffList);
                X.render({
                    txt_z_jc: function (node) {
                        node.setString(L(key) + "+" +
                            (key.indexOf("pro") != -1 ? conf.buff[key] / 10 + "%" : conf.buff[key]));
                        node.setTextColor(cc.color(color));
                    }
                }, buffList.nodes);
                listView.pushBackCustomItem(buffList);
            }
        },
        getMaxType: function () {
            var conf = G.gc.juewei;
            var type;

            for (var i in conf) if (conf[i].type > type || !type) type = conf[i].type;

            return type;
        }
    });
    G.frame[ID] = new fun('juewei.json', ID);
})();