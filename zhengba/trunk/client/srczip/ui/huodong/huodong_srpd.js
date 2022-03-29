/**
 * Created by LYF on 2019/8/21.
 */
(function () {
    //生日派对
    G.class.huodong_srpd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_srdg.json", null, {action: true});
        },
        initUi: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_zhounianqing_lz",
                addTo: me.ui.finds("Image_1"),
                x: me.ui.finds("Image_1").width / 2,
                y: me.ui.finds("Image_1").height,
                repeat: true,
                autoRemove: false
            });

            me.nodes.txt_pdwzlb.setString(L("SRPD"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_zzlbbtn.click(function () {
                me.ajax("huodong_use", [me._data.hdid, 1, me.taskIndex], function (str, dd) {
                    if (dd.s == 1) {
                        G.frame.jiangli.data({
                            prize: me.DATA.info.arr[me.taskIndex].prize
                        }).show();
                        me.DATA.myinfo = dd.d.myinfo;
                        me.setContents();
                        if(me._data.isqingdian){
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }
                    }
                });
            });

            me.nodes.panel_dh.setTouchEnabled(true);
            me.nodes.panel_dh.click(function () {
                if (me.DATA.myinfo.gotarr.length < Object.keys(me.DATA.info.arr).length || me.DATA.myinfo.gotarr.length > Object.keys(me.DATA.info.arr).length) {
                    if (me.DATA.myinfo.gotarr.length > Object.keys(me.DATA.info.arr).length) {
                        G.class.ani.show({
                            json: "ani_zhounianqing_ganxiexin",
                            addTo: G.frame.huodong.ui,
                            x: G.frame.huodong.ui.width / 2,
                            y: G.frame.huodong.ui.height / 2,
                            autoRemove: false,
                            onload: function (node, action) {
                                action.playWithCallback("in", false, function () {
                                    action.play("wait", true);
                                });
                                X.autoInitUI(node);
                                node.nodes.wb.setString(me.DATA.info.gxx || "");
                                node.nodes.mask && node.nodes.mask.click(function () {
                                    node.removeFromParent();
                                });
                            }
                        })
                    } else {
                        G.frame.jiangliyulan.data({
                            prize: me.DATA.info.bigprize
                        }).show();
                    }
                } else {
                    me.ajax("huodong_use", [me._data.hdid, 1, Object.keys(me.DATA.info.arr).length + 1], function (str, dd) {
                        if (dd.s == 1) {
                            me.DATA.myinfo = dd.d.myinfo;
                            if(me._data.isqingdian){
                                G.hongdian.getData("qingdian", 1, function () {
                                    G.frame.zhounianqing_main.checkRedPoint();
                                });
                            }else {
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                });
                            }

                            G.class.ani.show({
                                json: "ani_zhounianqing_ganxiexin",
                                addTo: G.frame.huodong.ui,
                                x: G.frame.huodong.ui.width / 2,
                                y: G.frame.huodong.ui.height / 2,
                                autoRemove: false,
                                onload: function (node, action) {
                                    action.playWithCallback("in", false, function () {
                                        action.play("wait", true);
                                    });
                                    X.autoInitUI(node);
                                    node.nodes.wb.setString(me.DATA.info.gxx || "");
                                    node.nodes.mask && node.nodes.mask.click(function () {
                                        node.removeFromParent();
                                        G.frame.jiangli.data({
                                            prize: me.DATA.info.bigprize
                                        }).show();
                                    });
                                }
                            });
                            me.box.action.pause();
                        }
                    });
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            if(me._data.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_cs.setString(X.moment(me._data.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_cs, me._data.etime, function () {
                    me.timeout = true;
                });
            }

            G.class.ani.show({
                json: "ani_zhounianqing_lihe",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                autoRemove: false,
                onload: function (node, action) {
                    action.pause();
                    node.action = action;
                    me.box = node;
                    me.refreshPanel();
                }
            });
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        setContents: function () {
            var me = this;

            me.setPrizeAndTask();
            me.setCandleShowState();
        },
        setCandleShowState: function () {
            var me = this;
            var openArr = me.DATA.myinfo.gotarr;

            for (var i = 1; i < 8; i ++) {
                var candle = me.nodes['img_wz' + i];
                var aniNode = me.nodes['panel_lazhu' + i];
                // if (openArr.length + 1 >= i) {
                //
                // }
                if (openArr.length >= i) {
                    candle.loadTexture("img/shengridangao/img_srdg_m" + i + ".png", 1);
                    aniNode.removeAllChildren();
                    G.class.ani.show({
                        json: "ani_zhounianqing_lazhu",
                        addTo: aniNode,
                        repeat: true,
                        cache: true,
                        autoRemove: false
                    });
                }
            }
        },
        setPrizeAndTask: function () {
            var me = this;
            var task = me.DATA.info.arr;
            var openArr = me.DATA.myinfo.gotarr;
            var taskIndex = me.taskIndex = openArr.length + 1 > Object.keys(task).length ? Object.keys(task).length : openArr.length + 1;
            var curTask = task[taskIndex];
            var curValue = me.DATA.myinfo.val;

            X.alignItems(me.nodes.panel_jl, curTask.prize, "left", {
                touch: true
            });

            var rh = X.setRichText({
                parent: me.nodes.panel_czsl,
                str: X.STR(curTask.desc, curTask.pval) + "<font color=#ffbe57>" + "(" + curValue + "/" + curTask.pval + ")" + "</font>",
                size: 24,
                color: "#f9eedb"
            });
            rh.setPosition(0, me.nodes.panel_czsl.height / 2 - rh.trueHeight() / 2);

            var isCanLq = curValue >= curTask.pval && !X.inArray(me.DATA.myinfo.gotarr, taskIndex);
            var isLq = X.inArray(me.DATA.myinfo.gotarr, taskIndex);

            me.box.action.play(openArr.length == Object.keys(task).length ? "wait2" : "wait1", true);

            me.nodes.btn_zzlbbtn.setEnableState(isCanLq);
            me.nodes.txt_yuanshul.setString(isLq ? L("YLQ") : L("LQ"));
            me.nodes.txt_yuanshul.setTextColor(cc.color(isCanLq ? "#2f5719" : "#6c6c6c"));

            if (isCanLq) G.setNewIcoImg(me.nodes.btn_zzlbbtn, .95);
            else G.removeNewIco(me.nodes.btn_zzlbbtn);
        }
    });
})();