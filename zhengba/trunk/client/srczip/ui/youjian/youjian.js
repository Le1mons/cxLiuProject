/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    //邮件

    G.event.on("newemail", function () {
        G.hongdian.getData("email", 1);
    });

    var ID = 'youjian';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
            me.preLoadRes = ["youjian.png", "youjian.plist"];
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("YOUJIAN"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });
        },
        changeType: function(type) {
            var me = this;

            me.curType = type;

            var view = {
                1: G.class.youjian_lb,
                2: G.class.youjian_sl
            };

            var panel = new view[type];
            me.nodes.panel_nr.addChild(panel);
            if(me.panle) me.panle.removeFromParent();
            me.panle = panel;
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("email_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.changeType(1);
        },
        checkRedPoint: function () {},
        onHide: function () {
            var me = this;
            G.hongdian.getData("email", 1);
        },
        getDataByType: function () {
            var me = this;
            var arr = [];

            if(me.curType == 1) {
                for (var i = 1; i < 3; i ++) {
                    for (var j in me.DATA[i]) {
                        me.DATA[i][j].type = i;
                        arr.push(me.DATA[i][j]);
                    }
                }
            } else {
                for (var i in me.DATA[3]) {
                    me.DATA[3][i].type = 3;
                    arr.push(me.DATA[3][i]);
                }
            }

            arr.sort(function (a, b) {
                return a.ctime > b.ctime ? -1 : 1;
            });

            return arr;
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                if(me.panle.getData) {
                    me.panle.getData(function () {
                        me.panle.setContents()
                    })
                } else {
                    me.panle.setContents && me.panle.setContents();
                }

            });
        }
    });
    G.frame[ID] = new fun('youjian2.json', ID);
})();

(function () {
    G.class.youjian_lb = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("youjian_lb.json");
        },
        bindBTN: function() {
            var me = this;

            me.nodes.btn_kssc.click(function (sender, type) {
                var is = false;
                for(var i in me.DATA){
                    var data = me.DATA[i];
                    if(!data.getprize || data.getprize){
                        is = true;
                        break;
                    }
                }
                if(is){
                    G.ajax.send("email_deleteall", [0], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            G.tip_NB.show(L("CGSCSYWJLYJ"));
                            G.frame.youjian.refreshPanel();
                        }
                    })
                }else{
                    G.tip_NB.show(L("WKSCYJ"));
                }
            });

            me.nodes.btn_yjlq.click(function (sender, type) {
                var is = false;
                for(var i in me.DATA){
                    if(me.DATA[i].getprize == 0){
                        is = true;
                        break;
                    }
                }
                if(is){
                    G.ajax.send("email_getallprize", [], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            G.frame.jiangli.data({
                                prize: d.d
                            }).show();
                            G.frame.youjian.refreshPanel();
                            G.hongdian.getData("email", 1, function () {
                                // G.frame.youjian.checkRedPoint();
                            });
                        }
                    })
                }else{
                    G.tip_NB.show(L("WKLQJLYJ"));
                }
            })
        },
        onShow: function () {
            var me = this;

            me.setContents();
            me.bindBTN();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        setContents: function() {
            var me = this;
            var data = me.DATA = G.frame.youjian.getDataByType();

            me.nodes.text_sl.setString(data.length + "/50");

            if(data.length < 1) {
                me.nodes.img_zwnr.show();
            } else {
                me.nodes.img_zwnr.hide();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] + pos[1]);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, index) {
            X.autoInitUI(ui);
            var me = this;
            var img = data.prize ? "img_xtyj" : "img_xtgg";
            if(data.getprize){
                img = "img_ydyj";
            }

            ui.nodes.text_yjm.setString(data.title);
            ui.nodes.panel_tb.setBackGroundImage("img/youjian/" + img + ".png", 1);
            ui.nodes.img_lbbg2.setVisible(data.vipzs == 1);
            var str = "";
            for (var i = 0; i < 10; i ++) {
                if(data.content[i]) str += data.content[i];
            }
            str = str.replace("<br>","");
            str += "...";
            ui.nodes.text_yjnr.setString(str);
            ui.nodes.text_sj.setString(X.moment(data.ctime - G.time));
            ui.data = data;
            ui.setSwallowTouches(false);
            ui.setTouchEnabled(true);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.youjian_nr.data(sender.data).show();
                }
            });
            ui.nodes.panel_tb.touch(function (sender, type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.ajax.send("email_getprize", [data.eid], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.frame.jiangli.data({
                                prize: data.prize
                            }).show();
                            ui.nodes.panel_tb.setBackGroundImage("img/youjian/img_ydyj.png", 1);
                            me.DATA[index].getprize = 1;
                        }
                    })
                }
            });


            ui.show();
        }
    });
})();

(function () {
    G.class.youjian_sl = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("youjian_sl.json");
        },
        bindBTN: function() {
            var me = this;

            me.nodes.btn_kssc.click(function (sender, type) {
                var is = false;
                for(var i in me.DATA){
                    var data = me.DATA[i];
                    if(!data.getprize || data.getprize){
                        is = true;
                        break;
                    }
                }
                if(is){
                    G.ajax.send("email_deleteall", [1], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1){
                            G.tip_NB.show(L("CGSCSYWJLYJ"));
                            G.frame.youjian.refreshPanel();
                        }
                    })
                }else{
                    G.tip_NB.show(L("WKSCYJ"));
                }
            });

            me.nodes.btn_yjlq.click(function (sender, type) {

                me.ajax("email_yjread", [], function (str, data) {
                    if(data.s == 1) {
                        G.hongdian.getData("email", 1, function () {
                            // G.frame.youjian.checkRedPoint();
                        });
                    }
                })
            });
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
            me.bindBTN();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        getData: function(cb) {
            var me = this;

            me.ajax("email_siliaoopen", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d[3];
                    cb && cb();
                }
            })
        },
        setContents: function() {
            var me = this;
            var data = me.DATA;

            me.nodes.text_sl.setString(data.length + "/50");

            if(data.length < 1) {
                me.nodes.img_zwnr.show();
            } else {
                me.nodes.img_zwnr.hide();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0] + pos[1]);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data, index) {
            X.autoInitUI(ui);

            var img = "img_wjyj";

            ui.nodes.text_yjm.setString(data.binduid);
            ui.nodes.panel_tb.setBackGroundImage("img/youjian/" + img + ".png", 1);

            ui.nodes.text_yjnr.setString(data.content);
            ui.nodes.text_sj.setString(X.moment(data.ctime - G.time));
            ui.data = data;
            ui.setSwallowTouches(false);
            ui.setTouchEnabled(true);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.youjian_nr.data(sender.data).show();
                }
            });
            ui.show();
        }
    });
})();