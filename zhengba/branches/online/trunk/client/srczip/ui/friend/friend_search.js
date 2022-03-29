/**
 * Creat
ed by lsm on 2018/6/27
 */
(function() {
    //好友查找
    G.class.friend_search = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            G.frame.friend.cz = me;
            me._super('friend_search.json');
        },
        refreshPanel: function(isref) {
            var me = this;
        },
        initUi: function() {
            var me = this;
            var btns = [me.nodes.btn_search, me.nodes.btn_blacklist]
            me.sendList = [];
            X.radio(btns, function(sender) {
                var name = sender.getName();
                var name2type = {
                    btn_search$: 1,
                    btn_blacklist$: 2,
                };
                me.changeType(name2type[name]);
            }, {
                color: ['#E8FDFF', '#edbb82']
            });
        },
        bindBTN: function() {
            var me = this;

            function f(sender, time) {
                sender.setTouchEnabled(false);
                sender.setBright(false);
                me.nodes.txt_djs.setString(time + "s");
                me.nodes.txt_djs.setTextColor(cc.color(G.gc.COLOR.n15));
                me.ui.setTimeout(function () {
                    time --;
                    sender.setTouchEnabled(true);
                    sender.setBright(true);
                    if(time <= 0) {
                        me.nodes.txt_djs.setString("");
                        me.ui.setTimeout(function () {
                            delete me.isRefres;
                        }, 200);
                        return;
                    }else {
                        f(sender, time);
                    }
                }, 1000);
            }


            me.nodes.btn_refresh.click(function(sender) {
                if(!me.isRefres) {
                    me.isRefres = true;
                    me.getTuijian(1, function() {
                        for (var i in me.nodes.listview[i]) {
                            var chr = me.nodes.listview.children[i];
                            G.class.ani.show({
                                json: "ani_qicailiuguang",
                                addTo: chr,
                                x: chr.width/2,
                                y: chr.height/2,
                                repeat: false,
                                autoRemove: true,
                                onload : function (node) {
                                    node.setScaleX(1.25);
                                }
                            });
                        }
                        me.ui.setTimeout(function () {
                            me.setTuijian();
                        });
                    });
                    f(sender, 3);
                }
            });
            me.nodes.btn_search2.click(function() {
                var text = me.nodes.txt_input.getString()
                if (text.trim().length == 0) {
                    G.tip_NB.show(L('SRFRIEND'));
                    return;
                }
                text = text.substr(0, 40);
                if (text.length > 6) {
                    G.tip_NB.show(L('TEXT_ALERT'));
                    return;
                }
                G.ajax.send('friend_find', [text], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.ajax.send('friend_apply', [d.d.headdata.uid], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.tip_NB.show(L('applyChengong'));
                                me.nodes.txt_input.setString('');
                            }
                        })
                    }
                })
            })
        },
        onOpen: function() {
            var me = this;
            me.initUi();
            me.bindBTN();
            me.initScrollView();
        },
        onShow: function() {
            var me = this;

            me.nodes.btn_search.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function(type) {
            var me = this;
            if (me.curType && me.curType == type) {
                return;
            }
            me.curType = type;
            if (type == 1) {
                me.nodes.panel_content.show();
                me.nodes.panel_content1.hide();
                me.showTuijian();
                X.editbox.create(me.nodes.txt_input);
            } else {
                me.showBlackList();
                me.nodes.panel_content1.show();
                me.nodes.panel_content.hide();
            }
        },
        onRemove: function() {
            var me = this;
            if (me.isrefres) G.ajax.send('friend_tuijian', [1]);
        },
        initScrollView: function() {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview1, false);
            me.nodes.scrollview1.removeAllChildren();
            var table = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.nodes.list_friend1.height + 10,
                paddingTop: 12
            });
            me.ui_table = table;
            table.setDelegate(this);
            me.ui_table.data([]);
            table.bindScrollView(me.nodes.scrollview1);
            me.ui_table.reloadDataWithScroll(true);

        },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function() {
            return this.nodes.list_friend1.clone();
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
        setItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var d = data;
            var head = G.class.shead(d);
            // head.setAnchorPoint(0, 0);
            head.setPosition(cc.p(ui.nodes.panel_tx1.width / 2, ui.nodes.panel_tx1.height / 2));
            ui.nodes.panel_tx1.addChild(head);
            head.data = d;
            head.setTouchEnabled(true);
            head.icon.setTouchEnabled(false);
            head.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.uid
                    }).checkShow();
                }
            });
            ui.nodes.txt_player_name1.setString(d.name);
            ui.nodes.btn_remove1.uid = d.uid;
            ui.nodes.btn_remove1.show();
            ui.nodes.btn_remove1.click(function(sender) {
                G.ajax.send('friend_shield', [sender.uid,1], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        me.showBlackList();
                        G.tip_NB.show(L('shieldsuccess'));
                    }
                }, true);
            })
        },
        showTuijian: function() {
            var me = this;
            if (!me.tuijian) {
                me.getTuijian(0, function() {
                    me.setTuijian();
                })
            }
        },
        showBlackList: function() {
            var me = this;
            me.getBlackList(function() {
                me.ui_table.data(me.blacklist.blacklist);
                me.ui_table.reloadDataWithScroll(true);
                me.ui_table.scrollToCell(0);
            })
        },
        setTuijian: function(guang) {
            var me = this;
            var data = me.tuijian.userlist;
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            for (var i in data) {
                var d = data[i];
                if (X.inArray(me.sendList, d.headdata.uid)) continue;
                var list = me.nodes.list_friend.clone();
                X.autoInitUI(list);
                var head = G.class.shead(d.headdata);
                head.setAnchorPoint(0, 0);
                list.nodes.panel_tx.addChild(head);
                head.data = d;
                head.setTouchEnabled(true);
                head.icon.setTouchEnabled(false);
                head.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.headdata.uid
                        }).checkShow();
                    }
                });
                if (data.lasttime + 60 > G.time) {
                    list.nodes.txt_player_time.setString(L('ZAIXIAN'));
                } else {
                    list.nodes.txt_player_time.setString(X.moment(data.lasttime - G.time));
                }
                list.nodes.txt_player_name.setString(d.headdata.name);
                if (d.guildname != '') {
                    list.nodes.txt_player_name.setString(d.headdata.name + '(' + d.guildname + ')');
                } else {
                    list.nodes.txt_player_name.setString(d.headdata.name);
                }
                list.nodes.text_zdl2.setString(d.zhanli);
                list.nodes.btn_apply.uid = d.headdata.uid;
                list.nodes.btn_apply.touch(function(sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        G.ajax.send('friend_apply', [sender.uid], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.tip_NB.show(L('applyChengong'));
                                me.isrefres = 1;
                                me.sendList.push(sender.uid);
                                me.setTuijian(true);
                            }
                        }, true);
                    }
                });
                list.nodes.img_dk.setColor(cc.color('#EDE4D0'));
                list.show();
                listview.pushBackCustomItem(list);
            }
            me.ui.setTimeout(function () {
                listview.jumpToTop();
            },5)
        },
        getTuijian: function(isref, callback) {
            var me = this;
            G.ajax.send('friend_tuijian', [isref], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.tuijian = d.d;
                    callback && callback();
                }
            }, true);
        },
        getBlackList: function(callback) {
            var me = this;
            G.ajax.send('friend_blacklist', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.blacklist = d.d;
                    callback && callback();
                }
            }, true);
        }
    });
})();