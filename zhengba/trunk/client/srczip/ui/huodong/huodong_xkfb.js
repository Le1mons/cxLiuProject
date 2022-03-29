/**
 * Created by LYF on 2019/9/20.
 */
(function () {
    //虚空风暴
    G.class.huodong_xkfb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_xkmw.json", null, {action: true});
        },
        initUi: function () {
            var me = this;


            if(me._data.rtime - G.time > 24 * 3600 * 2) {
                me.nodes.text_ts.setString(X.moment(me._data.rtime - G.time));
            }else {
                X.timeout(me.nodes.text_ts, me._data.rtime, function () {
                    me.nodes.text_ts.setString(L("YJS"));
                });
            }

            me.nodes.panle1 && me.nodes.panle1.setTouchEnabled(false);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS51")
                }).show();
            });

            me.nodes.btn_pmjl.click(function () {
                G.frame.xukongfengbao_tzjl.data(me).show();
            });

            me.nodes.btn_1.click(function () {
                me.selectIndex = undefined;
                me.index = me.DATA.myinfo.boss || 0;
                G.frame.xukongmowang_tz.data(me).show();
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
        dayRefresh: function () {
            var me = this;
            me.refreshPanel();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
                me.checkRedPoint();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.DATA.myinfo.reclist = me.DATA.myinfo.reclist || [];
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     me.DATA.myinfo.reclist = me.DATA.myinfo.reclist || [];
            //     callback && callback();
            // });
        },
        checkRedPoint: function () {
            var me = this;
            me.win = me.DATA.myinfo.boss || 0;
            if (me.DATA.myinfo.over) me.win ++;

            if (me.DATA.myinfo.reclist.length < me.win) {
                G.setNewIcoImg(me.nodes.btn_pmjl);
            } else {
                G.removeNewIco(me.nodes.btn_pmjl);
            }
        },
        setContents: function (isWin) {
            var me = this;

            me.setMapInfo(isWin);
            me.setFightNum();
        },
        setFightNum: function () {
            var me = this;

            me.nodes.txt_sz.setString(G.gc.xkfb.dailynum - me.DATA.myinfo.val);
        },
        setMapInfo: function (isWin) {
            var me = this;
            var bossIndex = me.DATA.myinfo.boss || 0;
            var bossConf = G.gc.xkfb.challengesort;

            for (var i = 0; i < bossConf.length; i ++) {
                (function (index) {
                    var bosData = G.gc.xkfb.mowang[bossConf[index]];
                    var lay = me.nodes["list" + (index + 1)];
                    var list = bossIndex > index ? me.nodes.panel_yjb.clone() : me.nodes.panel_list.clone();
                    list.show();
                    list.setPosition(lay.width / 2, lay.height / 2);
                    lay.removeAllChildren();
                    lay.addChild(list);
                    X.autoInitUI(list);

                    if (bossIndex > index) {
                        if (cc.sys.isNative) {
                            if (isWin == 0 && me.index == index) {
                                G.class.ani.show({
                                    json: "xukongfengbao_jibai_dh",
                                    addTo: list.children[1],
                                });
                            }
                        }
                    } else {
                        X.render({
                            img_xzzt: function (node) {
                                node.setVisible(bossIndex == index);
                                if (cc.sys.isNative) {
                                    G.class.ani.show({
                                        json: "xukongfengbao_dangqian_dh",
                                        addTo: node,
                                        repeat: true,
                                        autoRemove: false
                                    });
                                }
                            },
                            txt_mwmz: function (node) {
                                node.setString(X.STR(L("DXMW"), X.num2Cn(index + 1)));
                                node.setTextColor(cc.color(bossIndex == index ? "#ffd46c" : "#b3c7e5"));
                                X.enableOutline(node, "#251b2f", 1);
                            },
                            panel_tx: function (node) {
                                var head = G.class.shead(bosData.headdata);
                                head.lv.hide();
                                head.setPosition(node.width / 2, node.height / 2);
                                node.addChild(head);
                            },
                            img_mw7: function (node) {
                                node.setVisible(index == bossConf.length - 1);
                            }
                        }, list.nodes);
                        if (bossIndex == index) {
                            list.runAction(cc.sequence(
                                cc.moveBy(1, 0, 2), cc.moveBy(2, 0, -4), cc.moveBy(1, 0, 2)
                            ).repeatForever());
                        }
                        if (bossIndex <= index) {
                            list.setTouchEnabled(true);
                            list.click(function () {
                                me.selectIndex = index;
                                G.frame.xukongmowang_tz.data(me).show();
                            });
                        }
                    }
                })(i);
            }
        }
    });
})();