/**
 * Created by LYF on 2019/8/21.
 */
(function () {
    G.event.on('currencyChange', function () {
        if(G.frame.jierikuanghuan.isShow){
            G.frame.jierikuanghuan.updateAttr();
        }
    });
    //节日狂欢
    var ID = 'jierikuanghuan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        updateAttr: function() {
            var me = this;
            var jinbi = me.nodes.txt_jb;
            var rmb = me.nodes.txt_zs;
            jinbi.setString(X.fmtValue(P.gud.jinbi));
            rmb.setString(X.fmtValue(P.gud.rmbmoney));

            me.nodes.btn_jia1.hide();
            var a = me.DATA.info.duihuan[0].need[0].a;
            var t = me.DATA.info.duihuan[0].need[0].t;
            me.ui.finds('panel_db1').finds('token_jb').loadTexture(G.class.getItemIco(t), 1);
            me.nodes.txt_jb.setString(G.class.getOwnNum(t,a) );
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.listview1);
            me.nodes.list1.hide();

            var endTime = me.DATA.info.rtime;
            if (G.time > endTime) {
                me.eventEnd = true;
                me.nodes.txt_sjcs.setString(L("HDYJS"));
            } else {
                if (endTime - G.time > 24 * 3600 * 2) {
                    me.nodes.txt_sjcs.setString(X.moment(endTime - G.time));
                } else {
                    X.timeout(me.nodes.txt_sjcs, endTime, function () {
                        me.nodes.txt_sjcs.setString(L("HDYJS"));
                    });
                }
            }

            var arr = [];
            var menu = G.class.menu.get("jierikuanghuan");

            for(var i = 0; i < menu.length; i ++){
                var btn = me.nodes.btn_1.clone();
                btn.redPointTarget = i + 1;
                btn.setName("btn" + menu[i].id);
                btn.getChildren()[0].setString(menu[i].title);
                btn.show();
                if (me.eventEnd && i != 2) {
                    btn.disabledCall = function () {
                        G.tip_NB.show(L('HDYJS'));
                    }
                }
                if(menu[i].id == 4 && me.DATA.info.libao.length <= 0){
                    continue;
                }
                arr.push(btn);
                me.nodes.listview.addChild(btn);
            }
            X.radio(arr, function (sender) {
                me.changeType({btn1: 1, btn2: 2, btn3: 3, btn4: 4}[sender.getName()]);
            },{
                callback1: function (sender) {
                    X.enableOutline(sender.finds('txt_name$'), cc.color('#34221d'),2);
                },
                callback2: function (sender) {
                    X.enableOutline(sender.finds('txt_name$'), cc.color('#34221d'),2);
                },
            });
        },
        changeType: function (type) {
            var me = this;

            me.type = type;
            me.setList();
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
                G.frame.dianjin.once("hide", function () {
                    me.updateAttr();
                });
            });

            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
                G.frame.chongzhi.once("hide", function () {
                    me.updateAttr();
                    me.refreshRedPoint();
                });
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show : function(){
            var me = this;
            var _super = this._super;

            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            if (me.DATA.info.intr) me.nodes.txt_djxqkh.setString(me.DATA.info.intr);
            me.updateAttr();
            me.checkRedPoint();
            me.nodes.listview.children[me.eventEnd ? 2 : 0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            var hdid = me.hdid = G.DATA.asyncBtnsData.jrkh;

            connectApi("huodong_open", [hdid], function (data) {
                me.DATA = data;
                me.checkData();
                callback && callback();
            });
        },
        checkData: function() {
            var me = this;

            me.DATA.myinfo.gotarr.fuli = me.DATA.myinfo.gotarr.fuli || [];
            me.DATA.myinfo.gotarr.task = me.DATA.myinfo.gotarr.task || [];
            me.DATA.myinfo.gotarr.duihuan = me.DATA.myinfo.gotarr.duihuan || {};
            me.DATA.myinfo.gotarr.libao = me.DATA.myinfo.gotarr.libao || {};
        },
        refreshRedPoint: function () {
            var me = this;

            G.hongdian.getData("jrkh", 1, function () {
                me.checkRedPoint();
            });
        },
        checkRedPoint: function () {
            var me = this;

            for (var index = 0; index < me.nodes.listview.children.length; index ++) {
                var chr = me.nodes.listview.children[index];
                if (X.inArray(G.DATA.hongdian.jrkh, chr.redPointTarget)) {
                    G.setNewIcoImg(chr);
                    chr.redPoint.setPosition(108, 60);
                } else {
                    G.removeNewIco(chr);
                }
            }
        },
        setList: function () {
            var me = this;
            var type = me.type;
            var typeList = {
                1: "event_list4",
                2: "event_list4",
                3: "event_list2",
                4: "event_list7"
            };
            var listName = typeList[type];
            if (me[listName]) {
                me.setContents(me[listName]);
            } else {
                X.viewCache.getView(listName + ".json", function (node) {
                    var listNode = node.nodes.panel_list || node.nodes.list1;
                    me[listName] = listNode.clone();
                    me[listName].hide();
                    me[listName].setName(listName);
                    me.ui.addChild(me[listName]);
                    me.setContents(me[listName]);
                });
            }
        },
        setContents: function (list) {
            var me = this;
            var key = {
                1: 'fuli',
                2: 'task',
                3: 'duihuan',
                4: 'libao'
            };
            me.nodes.listview1.removeAllChildren();
            me[key[me.type]](list);
        },
        fuli: function (list) {
            var me = this;
            var data = Object.keys(me.DATA.info.fuli);
            var curData = me.DATA.myinfo;

            data.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            for (var i = 0; i < data.length; i ++) {
                (function (day) {
                    var _list = list.clone();
                    var isLq = X.inArray(curData.gotarr.fuli, day);
                    var canLq = curData.val.fuli >= day * 1 && !isLq;
                    X.autoInitUI(_list);
                    X.render({
                        txt: function (node) {
                            var rh = X.setRichText({
                                parent: node,
                                str: X.STR(L("DLXRKLQ"), day, curData.val.fuli || 0, day),
                                size: 24,
                                color: curData.val.fuli >= day * 1 ? "#12950f" : "#804326"
                            });
                            rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                        },
                        btn: function (node) {

                            if (canLq) G.setNewIcoImg(node, .95);
                            else G.removeNewIco(node);

                            node.setEnableState(canLq);
                            node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                            node.click(function (sender) {

                                me.ajax("huodong_use", [me.hdid, 1, day], function (str, dd) {
                                    if (dd.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: me.DATA.info.fuli[day]
                                        }).show();
                                        me.refreshRedPoint();
                                        G.removeNewIco(sender);
                                        sender.setEnableState(false);
                                        me.DATA.myinfo = dd.d.myinfo;
                                        me.checkData();
                                        _list.nodes.btn_txt.setString(L("YLQ"));
                                        _list.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                        me.updateAttr();
                                    }
                                });

                            });
                        },
                        btn_txt: function (node) {
                            node.setString(isLq ? L("YLQ") : L("LQ"));
                            node.setTextColor(cc.color(canLq ? "#2f5719" : "#6c6c6c"));
                        },
                        ico_item: function (node) {
                            X.alignItems(node, me.DATA.info.fuli[day], "left", {
                                touch: true
                            });
                        }
                    }, _list.nodes);
                    _list.show();
                    me.nodes.listview1.pushBackCustomItem(_list);
                })(data[i]);
            }
        },
        task: function (list) {
            var me = this;
            var data = Object.keys(me.DATA.info.task);
            var curData = me.DATA.myinfo;

            data.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });

            for (var i = 0; i < data.length; i ++) {
                (function (day) {
                    var _list = list.clone();
                    var isLq = X.inArray(curData.gotarr.task, day);
                    var canLq = curData.val.task[day] >= me.DATA.info.task[day].pval && !isLq;
                    X.autoInitUI(_list);
                    X.render({
                        txt: function (node) {
                            var rh = X.setRichText({
                                parent: node,
                                str: X.STR(L(me.DATA.info.task[day].desc), me.DATA.info.task[day].pval,
                                    curData.val.task[day] || 0, me.DATA.info.task[day].pval),
                                size: 24,
                                color: curData.val.task[day] >= me.DATA.info.task[day].pval ? "#12950f" : "#804326"
                            });
                            rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                        },
                        btn: function (node) {

                            if (canLq) G.setNewIcoImg(node, .95);
                            else G.removeNewIco(node);

                            node.setEnableState(!isLq);

                            node.click(function (sender) {
                                if (sender.tz) {
                                    if (!me.DATA.info.task[day].tzid) {
                                        return;
                                    }
                                    X.tiaozhuan(me.DATA.info.task[day].tzid);
                                    return me.remove();
                                }
                                me.ajax("huodong_use", [me.hdid, 2, day], function (str, dd) {
                                    if (dd.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: me.DATA.info.task[day].prize
                                        }).show();
                                        me.refreshRedPoint();
                                        G.removeNewIco(sender);
                                        sender.setEnableState(false);
                                        me.DATA.myinfo = dd.d.myinfo;
                                        me.checkData();
                                        _list.nodes.btn_txt.setString(L("YLQ"));
                                        _list.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                                        me.updateAttr();
                                    }
                                });
                            });
                        },
                        btn_txt: function (node) {
                            node.setString(isLq ? L("YLQ") : (canLq ? L("LQ") : L("QW")));
                            node.setTextColor(cc.color(isLq ? "#6c6c6c" : (canLq ? "#2f5719" : "#7b531a")));

                            if (canLq) {
                                _list.nodes.btn.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                            } else {
                                _list.nodes.btn.tz = true;
                                _list.nodes.btn.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                            }
                        },
                        ico_item: function (node) {
                            X.alignItems(node, me.DATA.info.task[day].prize, "left", {
                                touch: true
                            });
                        }
                    }, _list.nodes);
                    _list.show();
                    me.nodes.listview1.pushBackCustomItem(_list);
                })(data[i]);
            }
        },
        duihuan: function (list) {
            var me = this;
            var data = me.DATA.info.duihuan;
            var showBuyNumTxt = function (txtNode, index) {
                var canBuyNum = data[index].num;
                var buyNum = me.DATA.myinfo.gotarr.duihuan[index] || 0;
                var rh = X.setRichText({
                    parent: txtNode,
                    str: canBuyNum > 0 ? X.STR(L('XGX'), canBuyNum - buyNum) : L("YJ"),
                    size: 24,
                    color: "#804326"
                });
                rh.setPosition(txtNode.width / 2 - rh.trueWidth() / 2, txtNode.height / 2 - rh.trueHeight() / 2)
            };

            for (var i = 0; i < data.length; i ++) {
                (function (index) {
                    var _list = list.clone();
                    var conf = data[index];
                    var prize = [];
                    for (var i = 0; i < conf.need.length; i ++) {
                        prize.push(conf.need[i]);
                    }
                    for (var i = 0; i < conf.prize.length; i ++) {
                        prize.push(conf.prize[i]);
                    }

                    X.autoInitUI(_list);
                    _list.nodes.btn.data = conf;
                    X.render({
                        img_plus: function (node) {
                            if (conf.need.length == 1) {
                                node.loadTexture("img/event/img_event_equal.png", 1);
                            }
                        },
                        img_event_equal: function (node) {
                            if (prize.length < 3) node.hide();
                            else if (conf.need.length == 2) {
                                node.loadTexture("img/event/img_event_equal.png", 1);
                            }
                        },
                        item1: function (node) {
                            X.alignCenter(node, [].concat(prize[0]), {
                                touch: true
                            });
                        },
                        item2: function (node) {
                            X.alignCenter(node, [].concat(prize[1]), {
                                touch: true
                            });
                        },
                        item3: function (node) {
                            if (!prize[2]) return node.hide();
                            X.alignCenter(node, [].concat(prize[2]), {
                                touch: true
                            });
                        },
                        btn_txt:function (node) {
                            node.setString(L('DUIHUAN'));
                            node.setTextColor(cc.color(G.gc.COLOR.n12));
                        },
                        txt: function (node) {
                            showBuyNumTxt(node, index);
                        },
                        btn: function (node) {
                            node.click(function (sender) {
                                if (data[index].num - (me.DATA.myinfo.gotarr.duihuan[index] || 0) <= 0) return G.tip_NB.show(L("DUIHUAN") + L('CSBZ'));
                                G.frame.buying.data({
                                    num: 1,
                                    item: sender.data.prize,
                                    need: sender.data.need,
                                    maxNum: data[index].num - (me.DATA.myinfo.gotarr.duihuan[index] || 0),
                                    callback: function (num) {
                                        me.ajax("huodong_use", [me.hdid, 3, index, num], function (str, dd) {
                                            if (dd.s == 1) {
                                                var p = JSON.parse(JSON.stringify(conf.prize));
                                                for (var i = 0; i < p.length; i ++) p[i].n *= num;
                                                G.frame.jiangli.data({
                                                    prize: p
                                                }).show();
                                                me.DATA.myinfo = dd.d.myinfo;
                                                me.checkData();
                                                showBuyNumTxt(_list.nodes.txt, index);
                                                me.ui.setTimeout(function () {
                                                    me.updateAttr();
                                                },100);
                                            }
                                        });
                                    }
                                }).show();
                            });
                        }
                    }, _list.nodes);
                    _list.show();
                    me.nodes.listview1.pushBackCustomItem(_list);
                })(i);
            }
        },
        libao: function (list) {
            var me = this;
            var data = me.DATA.info.libao;
            var showBuyNumTxt = function (txtNode, index, nodes) {
                var canBuyNum = data[index].num;
                var buyNum = me.DATA.myinfo.gotarr.libao[index] || 0;
                var rh = X.setRichText({
                    parent: txtNode,
                    str: X.STR(L(data[index].needvip ? L("VIPBJ") : L("QMBJ")), data[index].needvip) + X.STR(L('XXX'), canBuyNum - buyNum, canBuyNum),
                    size: 24,
                    color: "#804326"
                });
                rh.setPosition(0, txtNode.height / 2 - rh.trueHeight() / 2);

                if (canBuyNum - buyNum <= 0) {
                    nodes.btn_buy.setEnableState(false);
                    nodes.txt_buy.setTextColor(cc.color("#6c6c6c"));
                }
            };

            for (var i = 0; i < data.length; i ++) {
                (function (index) {
                    var _list = list.clone();
                    var conf = data[index];
                    X.autoInitUI(_list);
                    _list.nodes.btn_buy.data = conf;
                    X.render({
                        txt_buy: conf.need[0].n,
                        txt_number1: parseInt(conf.need[0].n / (conf.sale / 10)),
                        panel_item: function (node) {
                            X.alignItems(node, conf.prize, "left", {
                                touch: true
                            });
                        },
                        txt_title: function (node) {
                            showBuyNumTxt(node, index, _list.nodes);
                        },
                        btn_buy: function (node) {
                            node.click(function (sender) {
                                if (P.gud.rmbmoney < conf.need[0].n) return G.tip_NB.show(L("ZSBZ"));
                                G.frame.buying.data({
                                    num: 1,
                                    item: sender.data.prize,
                                    need: sender.data.need,
                                    maxNum: data[index].num - (me.DATA.myinfo.gotarr.libao[index] || 0),
                                    callback: function (num) {
                                        me.ajax("huodong_use", [me.hdid, 4, index, num], function (str, dd) {
                                            if (dd.s == 1) {
                                                G.event.emit("sdkevent", {
                                                    event: "jierikuanghuan"
                                                });
                                                var p = JSON.parse(JSON.stringify(conf.prize));
                                                for (var i = 0; i < p.length; i ++) p[i].n *= num;
                                                G.frame.jiangli.data({
                                                    prize: p
                                                }).show();
                                                me.DATA.myinfo = dd.d.myinfo;
                                                me.checkData();
                                                showBuyNumTxt(_list.nodes.txt_title, index, _list.nodes);
                                                me.updateAttr();
                                                me.refreshRedPoint();
                                            }
                                        });
                                    }
                                }).show();
                            });
                        }
                    }, _list.nodes);
                    _list.show();
                    me.nodes.listview1.pushBackCustomItem(_list);
                })(i);
            }
        }
    });
    G.frame[ID] = new fun('event_jrkh.json', ID);
})();