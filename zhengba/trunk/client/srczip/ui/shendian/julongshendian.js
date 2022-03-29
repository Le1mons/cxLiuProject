/**
 * Created by LYF on 2019/1/10.
 */
(function () {
    //巨龙神殿
    var ID = 'julongshendian';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {
                action: true
            });
            me.preLoadRes = ["julongshendian6.png", "julongshendian6.plist"]
            me.releaseRes = ['julongshendian', 'julongshendian2', 'julongshendian3', "julongshendian4", "julongshendian5", "julongshendian6",
                'shendianmigong', 'shendianmigong1', 'shendianmigong2', 'shizhijun', 'shizhijun1', 'mijing', 'fashita'
            ];
            me.releaseRes1 = ['img/bg/bg_julongfenye.jpg', 'img/changjingfengwei/bg_julongfenye.jpg', 'img/bg/bg_shilian1.jpg',
                'img/bg/jlsdbg.jpg', 'sizijunyuanzheng.jpg', 'img/bg/img_sdmg_bg1.jpg', 'img/bg/bg_mjsdbg.jpg', 'img/bg/bg_sdmw.jpg', 'img/bg/bg_sdmw.jpg',
                'img/bg/bg_yuanzheng.jpg'
            ];
        },
        initUi: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_julongshendian_fengwei",
                addTo: me.nodes.bg_jjc,
                x: me.nodes.bg_jjc.width / 2,
                y: me.nodes.bg_jjc.height / 2,
                repeat: true,
                autoRemove: false,
            });

            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            if (me.nodes.img_sdzl) {
                if (P.gud.lv < G.class.opencond.getLvById("fashita")) {
                    me.nodes.img_sdzl.setBright(false);
                }
                me.nodes.img_sdzl.click(function () {

                    if (P.gud.lv < G.class.opencond.getLvById("fashita")) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("fashita")) + L("SDZL"));
                        return;
                    }
                    G.frame.dafashita.show();
                }, 600);
            }

            if (me.nodes.img_qxjj) {
                if ((X.checkIsOpen('sddl') === 1 && P.gud.lv < 80) || !X.checkIsOpen('sddl')) {
                    me.nodes.img_qxjj.setBright(false);
                }
                me.nodes.img_qxjj.click(function () {
                    var isOpen = X.checkIsOpen('sddl');
                    if (isOpen === 1) {
                        if (P.gud.lv < 80) {
                            return G.tip_NB.show(X.STR(L("XYXJKQ"), 80));
                        }
                        G.frame.shendian_sddl.show();
                    } else {
                        G.frame.shendian_sddl.show();
                    }
                }, 600);
            }
            if (me.nodes.img_slzt) {
                if (!G.class.opencond.getIsOpenById("shilianzt")) {
                    me.nodes.img_slzt.setBright(false);
                }
                me.nodes.img_slzt.click(function () {
                    var isOpen = G.class.opencond.getIsOpenById("shilianzt");
                    if (!isOpen) {
                        return G.tip_NB.show(L(G.class.opencond.getTipById("shilianzt")))
                    }
                    G.frame.slzt.checkShow()
                }, 600);
            }


            if (me.nodes.img_sdmw) {
                if ((X.checkIsOpen('sdmw') === 1 && P.gud.lv < 45) || !X.checkIsOpen('sdmw')) {
                    me.nodes.img_sdmw.setBright(false);
                }
                me.nodes.img_sdmw.click(function () {
                    var isOpen = X.checkIsOpen('sdmw');
                    if (isOpen === 1) {
                        if (P.gud.lv < 45) {
                            G.tip_NB.show(X.STR(L("XYLVKQ"), 45));
                            return;
                        }
                        G.frame.shendianmowang.checkShow();
                    } else {
                        G.frame.shendianmowang.checkShow(isOpen);
                    }
                }, 600);
            }

            if (me.nodes.img_smmg) {
                if (P.gud.lv < G.class.opencond.getLvById("maze")) {
                    me.nodes.img_smmg.setBright(false);
                }
                me.nodes.img_smmg.click(function () {
                    if (P.gud.lv < G.class.opencond.getLvById("maze")) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("maze")) + L("SDMG"));
                        return;
                    }
                    G.frame.maze.show();
                }, 600);
                var parent = me.nodes.img_smmg.getParent();
                var eventTime = G.DATA.asyncBtnsData.maze;
                if (G.time >= eventTime.s && G.time < eventTime.n) {
                    parent.nodes.poan1.show();
                    X.timeout(parent.nodes.daojishi, eventTime.n, function () {
                        parent.nodes.poan1.hide();
                    }, null, {
                        showDay: false,
                    });
                    X.enableOutline(parent.nodes.daojishi, "#2b6000");
                    parent.nodes.daojishi.setTextColor(cc.color('#2bdf02'));
                }
            }

            if (P.gud.lv < G.class.opencond.getLvById("meirishilian")) {
                me.nodes.img_mrsl.setBright(false);
                me.nodes.img_mrsl.showTxt = X.STR(L("XYLVKQ"), G.class.opencond.getLvById("meirishilian")) + L("MRSL");
            }
            me.nodes.img_mrsl.click(function (sender) {
                if (sender.showTxt) return G.tip_NB.show(sender.showTxt);
                G.frame.meirishilian.show();
            });

            if (me.nodes.img_szjyz) {
                if (P.gud.lv < G.class.opencond.getLvById("shizijun_1")) {
                    me.nodes.img_szjyz.setBright(false);
                    me.nodes.img_szjyz.showTxt = X.STR(L("XYLVKQ"), G.class.opencond.getLvById("shizijun_1")) + L("SZJYZ");
                }
                me.nodes.img_szjyz.click(function (sender) {
                    if (sender.showTxt) return G.tip_NB.show(sender.showTxt);
                    G.frame.shizijunyuanzheng.show();
                });
            }
            if (me.nodes.img_wjtf) {
                // var starTime = X.getLastMondayZeroTime() + 10 * 3600;
                // var endTime = X.getLastMondayZeroTime() + (22 + 24 * 6) * 3600;
                // if (G.time < starTime || G.time > endTime) {
                //   me.nodes.img_wjtf.setBright(false);
                //   me.nodes.img_wjtf.showTxt = L("WJTF_TIP1");
                // } else {
                //   me.nodes.img_wjtf.showTxt = false;

                // }
                me.nodes.img_wjtf.click(function (sender) {
                    if (!G.class.opencond.getIsOpenById("wujinzhita")) {
                        G.tip_NB.show(G.class.opencond.getTipById("wujinzhita"))
                        return
                    }
                    // if (sender.showTxt) return G.tip_NB.show(sender.showTxt);
                    G.frame.wjtf.show();
                });
            }


            if (me.nodes.img_swzmj) {
                if (P.gud.lv < G.class.opencond.getLvById("watcher")) {
                    me.nodes.img_swzmj.setBright(false);
                    me.nodes.img_swzmj.showTxt = X.STR(L("XYLVKQ"), G.class.opencond.getLvById("watcher")) + L("SWZMJ");
                }
                me.nodes.img_swzmj.click(function (sender) {
                    if (sender.showTxt) return G.tip_NB.show(sender.showTxt);
                    G.frame.damijing.checkShow();
                });
            }
        },
        checkRedPoint: function () {
            var me = this;
            if (!cc.isNode(me.ui)) return;
            var data =JSON.parse(JSON.stringify( G.DATA.hongdian.fashita));
            if( G.DATA.hongdian.slzt.forevertask ||  G.DATA.hongdian.slzt.task){
                data.slzt = 1
            }else{
                data.slzt = 0

            }
            var valArr = ["fashita", "dungeon", "devil","slzt", "maze", "mrsl", "shizijun", "watcher",];
            var btnArr = [
                me.nodes.img_sdzl, me.nodes.img_qxjj, me.nodes.img_sdmw,me.nodes.img_slzt, me.nodes.img_smmg,
                me.nodes.img_mrsl, me.nodes.img_szjyz, me.nodes.img_swzmj,
            ];

            for (var i = 0; i < valArr.length; i++) {
                var val = i > 4 ? G.DATA.hongdian[valArr[i]] : data[valArr[i]];
                if (cc.isObject(val) && btnArr[i]) {
                    if (G.hongdian.objMeet(val)) {
                        G.setNewIcoImg(btnArr[i], .9);
                        btnArr[i].redPoint.setPosition(590, 172);
                    } else {
                        G.removeNewIco(btnArr[i]);
                    }
                } else {
                    if (val && val < 10 && btnArr[i]) {
                        G.setNewIcoImg(btnArr[i], .9);
                        btnArr[i].redPoint.setPosition(590, 172);
                    } else {
                        G.removeNewIco(btnArr[i]);
                    }
                }
            }
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            G.DATA.music = 'tanxian';
            X.audio.playMusic("sound/tanxian.mp3", true);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            X.audio.playEffect("sound/openfashita.mp3");
            me.showToper();
            me.initList();
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("fashita", 1);

            if (G.frame.zhuangbeifumo.isShow) {
                G.frame.zhuangbeifumo.setFMInfo(G.frame.zhuangbeifumo.name2tye);
            }
        },
        setContents: function () {
            var me = this;
        },
        hua: function (id) {
            var me = this;

            var index = {
                "swzmj": 4,
                "sdmg": 3
            };
            me.nodes.listview.jumpToIdx(index[id] || 3, {
                type: 1
            });

            cc.callLater(function () {
                G.guidevent.emit("huaOver");
            });
        },
        initList: function () {
            var me = this;
            var conf = [{
                name: "img_mrsl",
                isOpen: function () {
                    return true;
                },
                type: 'lv',
                img: "img_mrsl"
            },
            {
                name: "img_sdzl",
                isOpen: function () {
                    return P.gud.lv >= G.class.opencond.getLvById("fashita");
                },
                type: 'lv',
                img: "img_sdzl"
            },
            {
                name: "img_wjtf",
                isOpen: function () {

                    return G.class.opencond.getIsOpenById("wujinzhita");
                },
                type: 'time',
                img: "img_wjsw"
            },
            {
                name: "img_szjyz",
                isOpen: function () {
                    return P.gud.lv >= G.class.opencond.getLvById("shizijun_1");
                },
                type: 'lv',
                img: "img_szjyz"
            },
            {
                name: "img_smmg",
                isOpen: function () {
                    return P.gud.lv >= G.class.opencond.getLvById("maze");
                },
                type: 'lv',
                img: "img_sdmg"
            },
            {
                name: "img_swzmj",
                isOpen: function () {
                    return P.gud.lv >= G.class.opencond.getLvById("watcher")
                },
                type: 'lv',
                img: "img_swzmj"
            },
            {
                name: "img_sdmw",
                isOpen: function () {
                    return G.time >= G.OPENTIME + X.getOpenTimeToNight();
                },
                type: 'time',
                img: "img_sdmw"
            },
            {
                name: "img_qxjj",
                isOpen: function () {
                    return G.time >= G.OPENTIME + X.getOpenTimeToNight() + (6 * 24 * 3600);
                },
                type: 'time',
                img: "img_sdsw"
            },
            {
                name: "img_slzt",
                isOpen: function () {
                    return G.class.opencond.getIsOpenById("shilianzt")
                },
                type: 'time',
                img: "img_slzt"
            },
            ];
            var arr = {};
            var typeArr = ['lv', 'time'];
            for (var i = 0; i < conf.length; i++) {
                var con = conf[i];
                if (!arr[con.type]) arr[con.type] = [];
                arr[con.type].push(i);
            }
            var arr1 = [];
            for (var i = 0; i < typeArr.length; i++) {
                var data = arr[typeArr[i]];
                for (var index = 0; index < data.length; index++) {
                    if (conf[data[index]].type == 'time') {
                        if (conf[data[index]].isOpen()) arr1.push(data[index]);
                    } else {
                        arr1.push(data[index]);
                    }
                    if (!conf[data[index]].isOpen()) break;
                }
            }

            for (var i = 0; i < arr1.length; i++) {
                me.setList(conf[arr1[i]], i == arr1.length - 1);
            }
            me.bindBtn();
            me.checkRedPoint();

            me.ui.setTimeout(function () {
                G.guidevent.emit("shendianzhiluOpenOver");
            }, 300);
        },
        setList: function (conf, isHide) {
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            X.render({
                img_sz1: function (node) {
                    node.setVisible(!isHide);
                },
                img_sz2: function (node) {
                    node.setVisible(!isHide);
                },
                btn_list: function (node) {
                    node.setZoomScale(0.02);
                    node.loadTextureNormal("img/julongshendian/" + conf.img + ".png", 1);
                    me.nodes[conf.name] = node;
                }
            }, list.nodes);
            list.show();
            me.nodes.listview.pushBackCustomItem(list);
        }
    });
    G.frame[ID] = new fun('shendianzhilu_fy.json', ID);
})();