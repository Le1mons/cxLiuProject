/**
 * Created by lsm on 2018/6/27
 */
(function() {
    //好友添加 
    G.class.friend_application = X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.friend.qq = me;
            me._type = type;
            me._super('friend_apply.json');
        },
        refreshPanel: function() {
            var me = this;
            me.getData(function() {
                me.ui_table.data(me.DATA.applylist.reverse());
                me.ui_table.reloadDataWithScroll(true);
                me.setApplyNum();
                if(me.DATA.applylist.length == 0){
                    me.nodes.img_zwnr.show();
                    G.DATA.addfriend = false;
                    G.frame.friend.checkRedPoint();
                }else{
                    me.nodes.img_zwnr.hide();
                }
            });
        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_delall.click(function() {
                G.ajax.send('friend_refuse', [1], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                        me.refreshPanel();
                    }
                }, true);
            });

            me.ui.finds("Button_1").click(function () {
                if(me.DATA.applylist.length < 1) {
                    G.tip_NB.show(L("SQLBWK"));
                    return;
                }
                G.ajax.send("friend_yjagree", [], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                        me.refreshPanel();
                    }
                })
            })
        },
        setApplyNum:function(){
            var me = this;
            me.nodes.txt_number.setString(me.DATA.applylist.length);
        },
        onOpen: function() {
            var me = this;

            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.initScrollView();
            me.refreshPanel();
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;

        },
        initScrollView: function() {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview, false);
            me.nodes.scrollview.removeAllChildren();
            var table = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.nodes.list_lb.height + 10,
                paddingTop: 10
            });
            me.ui_table = table;
            table.setDelegate(this);
            me.ui_table.data([]);
            table.bindScrollView(me.nodes.scrollview);
            me.ui_table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            data.isfriend = false;
            data.headdata = data;
            var head = G.class.shead(data);
            var isKf = P.gud.sid == data.uid.split("_")[0] ? "" : L("KF");

            head.setAnchorPoint(0, 0);
            ui.nodes.panel_tx.addChild(head);
            head.data = data;
            ui.nodes.btn_accept.data = data;
            ui.nodes.btn_refuse.data = data;
            head.setTouchEnabled(true);
            head.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.uid,
                        isKf: isKf == "" ? false : true,
                        data: sender.data,
                    }).checkShow();
                }
            });
            ui.nodes.txt_player_name.setString(data.name + isKf);
            ui.nodes.btn_accept.click(function(sender) {
                G.ajax.send('friend_agree', [sender.data.uid], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.tip_NB.show(L("TJCG"));
                        me.refreshPanel();
                        G.frame.friend._panels[1].refreshPanel();
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                    }else {
                        me.refreshPanel();
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                    }
                }, true);
            }, 1000);
            ui.nodes.btn_refuse.click(function(sender) {
                G.ajax.send('friend_refuse', [0, sender.data.uid], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.tip_NB.show(L("SCCG"));
                        me.refreshPanel();
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                    }
                }, true);
            });
        },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function() {
            return this.nodes.list_lb.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         */
        cellDataInit: function(ui, data) {
            if (!data) {
                ui.hide();
                return;
            }
            this.setItem(ui, data);
            ui.show();
        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('friend_applylist', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        }
    });
})();