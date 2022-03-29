/**
 * Created by wfq on 2018/6/27.
 */
(function() {
    //公会-副本
    var ID = 'gonghui_fuben';

    var fun = X.bUi.extend({
        extConf: {
            num: 5
        },
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me.fullScreen = true;
            me._super(json, id, {
                action: true
            });
        },
        initUi: function() {
            var me = this;
        },
        bindBtn: function() {
            var me = this;

            me.nodes.btn_fh.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.nodes.btn_help.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr: L('TS11')
                    }).show();
                }
            });

            me.nodes.btn_zuo1.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.curType > 1) {
                        me.curType--;
                        me.setContents();
                    }
                }
            });
            me.nodes.btn_you1.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(me.DATA.fuben * 1 <= me.curType * 5) {
                        G.tip_NB.show(L("QXTGDQZJ"))
                        return;
                    }
                    if (me.curType < me.getMaxPage()) {
                        me.curType++;
                        me.setContents();
                    }
                }
            });
        },
        onOpen: function() {
            var me = this;

            me.fillSize();
            me.showToper();
            me.nodes.panel_list.show();
        },
        onAniShow: function() {
            var me = this;
        },
        show: function(conf) {
            var me = this;
            var _super = this._super;
            this.getData(function() {
                me.curType = me.getPageByFbid(me.DATA.fuben);
                _super.apply(me, arguments);
            });
        },
        onShow: function() {
            var me = this;

            me.initUi();
            me.bindBtn();
            me.setContents();
        },
        onHide: function() {
            var me = this;

            G.hongdian.getData("gonghui", 1, function () {
                G.frame.gonghui_main.checkRedPoint();
            })
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('gonghuifuben_open', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        refreshData: function(callback) {
            var me = this;

            me.getData(function() {
                me.curType = me.getPageByFbid(me.DATA.fuben);
                me.setContents();
                callback && callback();
            });
        },
        refreshCurData: function() {
            var me = this;

            me.getData(function() {
                me.setContents();
            });
        },
        setContents: function() {
            var me = this;
            var startId = me.getStartFbidByPage(me.curType);
            me.setPageNum(me.curType);
            me.setArrowsState();

            var idx = 1;
            for (var i = startId - 1; i < startId - 1 + me.extConf.num; i ++) {
                var conf = G.class.gonghui.getFubenById(i + 1);

                me.setItem(conf, i + 1, idx);
                idx ++;
            }
        },
        setItem: function(conf, level, index) {
            var me = this;
            var list = me.nodes.list_instance.clone();

            X.autoInitUI(list);

            X.setHeroModel({
                parent: list.nodes.rw,
                data: {
                    hid: conf.hid
                },
                callback: function (node) {
                    node.runAni(0, me.DATA.fuben * 1 > level ? "shihua" : "wait", true);
                }
            });

            if(me.DATA.fuben * 1 > level) {
                if(!X.inArray(me.DATA.rec_data, level)) list.nodes.img_complete.show();
            }

            if(X.inArray(me.DATA.rec_data, level)) {
                list.nodes.btn_bljl.show();
            }

            list.nodes.btn_bljl.click(function () {
                G.frame.gonghui_bljl.data(level).show();
            });

            list.nodes.txt_name.setString(X.STR(L("DJG"), level));
            X.enableOutline(list.nodes.txt_name, "#000000", 2);

            if(me.DATA.fuben == level) {
                G.class.ani.show({
                    json: 'ani_gonghuiboss',
                    addTo: list,
                    x: list.width / 2,
                    y: list.height / 2,
                    repeat: true,
                    autoRemove: false
                });
            }

            if(me.timer) {
                list.nodes.txt_time.clearTimeout(me.timer);
                delete me.timer;
            }
            X.enableOutline(list.nodes.txt_time, "#000000", 2);
            if(me.DATA.fuben * 1 == level && me.DATA.pknum) {
                me.timer = X.timeout(list.nodes.txt_time, X.getTodayZeroTime() + 24 * 60 * 60, function() {
                    me.refreshData();
                });
            }

            list.nodes.rw.data = level;
            list.nodes.rw.setTouchEnabled(true);
            list.nodes.rw.click(function (sender) {
                if(me.DATA.fuben * 1 < sender.data) {
                    G.tip_NB.show(L('GONGHUI_FUBEN_TIP1'));
                }else {
                    if(me.DATA.fuben == sender.data) {
                        G.frame.gonghui_fuben_xq.data({
                            fbid: sender.data
                        }).show();
                    }else {
                        G.frame.gonghui_fuben_shph.data({
                            fbid: sender.data
                        }).show();
                    }
                }
            });

            me.nodes["panel_" + index].removeAllChildren();
            me.nodes["panel_" + index].addChild(list);
            list.setPosition(0, 0);
            list.show();
        },
        setPageNum: function(page) {
            var me = this;

            me.nodes.text_ys.setString(X.STR(L('D_X_PAGE'), page));
        },
        //根据副本id获得对应页码
        getPageByFbid: function(id) {
            var me = this;
            var max = me.getMaxPage();

            if(id * 1 > max * me.extConf.num) {
                return max
            } else {
                return Math.ceil((id * 1) / me.extConf.num);
            }
        },
        // 当前页开始的副本id
        getStartFbidByPage: function(page) {
            var me = this;

            return (page - 1) * me.extConf.num + 1;
        },
        //最大页数
        getMaxPage: function() {
            var me = this;

            var fbConf = G.class.gonghui.getFubenConf().fuben;

            return X.keysOfObject(fbConf).length / me.extConf.num;
        },
        setArrowsState: function() {
            var me = this;

            me.nodes.btn_zuo1.setEnableState(false);
            me.nodes.btn_you1.setEnableState(false);

            if (me.curType != 1) {
                me.nodes.btn_zuo1.setEnableState(true);
            }
            if (me.curType != me.getMaxPage()) {
                me.nodes.btn_you1.setEnableState(true);
            }
        }
    });

    G.frame[ID] = new fun('gonghui_tip2_ghxfb.json', ID);
})();