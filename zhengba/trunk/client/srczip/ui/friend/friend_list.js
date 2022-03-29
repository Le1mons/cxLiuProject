/**
 * Created by lsm on 2018/6/27
 */
(function() {
    //好友列表
    G.class.friend_list = X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.friend.list = me;
            me._type = type;
            me._super('friend_list.json');
        },
        refreshPanel: function() {
            var me = this;
            G.frame.friend.getData(function() {
                me.DATA = G.frame.friend.DATA;
                me.setContents();
            });
        },
        bindBTN: function() {
            var me = this;
            if(!me.nodes.btn_lazy.data) me.nodes.btn_lazy.data = [];
            me.nodes.btn_lazy.click(function() {
                if(me.DATA.friend.length < 1) {
                    return G.tip_NB.show(L("ZW") + L("HY"));
                }
                X.audio.playEffect("sound/lingquaixin.mp3");
                G.ajax.send('friend_yijian', [], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        if(d.d.prize.length > 0 ){
                           G.tip_NB.show(X.createPrizeInfo(d.d.prize, 1, 1)); 
                        }
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        });
                        me.refreshPanel();
                    }else {
                        G.tip_NB.show(L('heartError_' + d.d.act));
                    }
                }, true);
            })
        },
        onOpen: function() {
            var me = this;
            me.bindBTN();
            me.isNew = true;
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
            me.initScorllView();
        },
        onNodeShow: function() {
            var me = this;
            if (cc.isNode(me.ui)) {
                me.isNew = true;
                me.refreshPanel();
            }
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;

            G.frame.friend.setFriendNum();
            me.setPanelUp();
        },
        setPanelUp: function() {
            var me = this;
            if(!cc.isNode(me))return;

            var data = me.DATA;
            var imprint = me.nodes.txt_sz1;
            var tili = me.nodes.txt_sz2;
            var friend = me.nodes.text_sj;
            me.boss = data.boss;
            imprint && imprint.setString(G.class.getOwnNum(2013,'item'));
            tili.setString(data.tiliinfo.num + '/' + 10);
            friend.setString(data.friend.length + "/" +G.class.friend.get().base.friendmaxnum);
            if(data.friend.length < 1){
                me.nodes.img_zwnr.show();
            }else{
                me.nodes.img_zwnr.hide();
            }
            me.ui_table.data(me.filterData(data.friend));
            me.ui_table.reloadDataWithScroll(me.isNew);
            me.isNew = false;
        },
        initScorllView: function(data) {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview, false);
            me.nodes.scrollview.removeAllChildren();
            var table = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.nodes.list_friend.height + 8,
                paddingTop: 10
            });
            me.ui_table = table;
            table.setDelegate(this);
            me.ui_table.data([]);
            table.bindScrollView(me.nodes.scrollview);
            me.ui_table.reloadDataWithScroll(false);
            G.table = table;
        },
        filterData:function(data){
            var me = this;
            var d = data;
            d.sort(function(a,b){
                if(!X.inArray(me.boss,a.headdata.uid) && !X.inArray(me.boss,b.headdata.uid)){
                    return a.lasttime < b.lasttime
                }else if(X.inArray(me.boss,b.headdata.uid)){
                    return 1
                }else if(X.inArray(me.boss,a.headdata.uid)){
                    return 0
                }
            });
            return d;
        },
        setItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var tx = ui.nodes.panel_tx;
            var name = ui.nodes.txt_player_name;
            var time = ui.nodes.txt_player_time;
            var boss = ui.nodes.btn_boss;
            var pk = ui.nodes.btn_pk;
            var send = ui.nodes.btn_send;
            var receive = ui.nodes.btn_receive;
            var uid = data.headdata.uid;

            var head = G.class.shead(data.headdata, false);
            // head.setAnchorPoint(0, 0);
            head.setPosition(cc.p(tx.width / 2,tx.height / 2));
            tx.removeAllChildren();
            tx.addChild(head);
            // var isKf = P.gud.sid == data.headdata.uid.split("_")[0] ? "" : L("KF");
            var isKf = X.inArray(G.SIDLIST,data.headdata.uid.split("_")[0]) ? "" : L("KF");
            if(data.zhanli) data.headdata.zhanli = data.zhanli;
            name.setString(data.headdata.name + isKf);
            
            var interval = 60;
            if (data.lasttime + interval > G.time) {
                time.setString(L('ZAIXIAN'));
            } else {
                time.setString(X.moment(data.lasttime - G.time));
            }
            // time.setString(X.moment(-(G.time - data.lasttime)));

            send.uid = uid;
            receive.uid = uid;
            head.data = data;
            pk.data = data;
            boss.uid = uid;
            head.setTouchEnabled(true);
            head.icon.setTouchEnabled(false);
            head.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var obj = JSON.parse(JSON.stringify(sender.data.headdata));
                    var obj1 = JSON.parse(JSON.stringify(sender.data.headdata));
                    obj.headdata = obj1;
                    obj.isfriend = true;
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.headdata.uid,
                        isKf: isKf == "" ? false : true,
                        data: obj,
                    }).checkShow();
                }
            });
            //助战
            if (X.inArray(me.DATA.boss, uid)) {
                boss.hide();
            } else {
                boss.hide();
            }
            //赠送
            if (X.inArray(me.DATA.gift, uid)) {
                send.setBright(false);
                send.setTouchEnabled(false);
            } else {
                send.setBright(true);
                send.setTouchEnabled(true);
            }
            //领取
            if (X.inArray(me.DATA.accept, uid)) {
                while (receive.getChildByTag(889977)) {
                    receive.getChildByTag(889977).removeFromParent();
                }
                if (X.inArray(me.DATA.received, uid)) {
                    receive.setBright(false);
                    receive.setTouchEnabled(false);
                } else {
                    receive.setTouchEnabled(true);
                    G.class.ani.show({
                        json: 'ani_haoyouyouqingdian',
                        addTo:receive,
                        y: receive.height/2 + 3,
                        repeat:true,
                        autoRemove:false,
                        onload: function (node, action) {
                            node.setTag(889977);
                        }
                    });
                }
                receive.show();
            } else {
                receive.hide();
            }

            boss.click(function(sender) {
                G.frame.friend_help.data(sender.uid).show();
            });
            pk.click(function(sender) {
                G.frame.friend.fightName = data.headdata.name;
                G.frame.fight.startFight({}, function(node) {
                    var selectedData = node.getSelectedData();
                    G.ajax.send('friend_discuss', [sender.data.headdata.uid, selectedData], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres.fightkey = d.d.fightkey;
                            X.cacheByUid('fight_hypk', selectedData);
                            G.frame.fight.data({
                                    pvType: 'pvfriend',
                                    prize: d.d.prize
                                }).once('show', function() {
                                    G.frame.yingxiong_fight.remove();

                                }).demo(d.d.fightres);
                            }
                    }, true);
                }, "hypk");
            });
            send.click(function(sender) {
                G.ajax.send('friend_gift', [sender.uid], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.tip_NB.show(L('sendsuccess'));
                        me.refreshPanel();
                    }
                }, true);
            });
            receive.click(function(sender) {
                G.ajax.send('friend_accept', [sender.uid], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.tip_NB.show(X.createPrizeInfo(d.d.prize, 1, 1));
                        me.refreshPanel();
                        G.hongdian.getData("friend", 1, function () {
                            G.frame.friend.checkRedPoint();
                        })
                    }
                }, true);
            });
            ui.nodes.btn_sl.show();
            ui.nodes.btn_sl.click(function () {
                G.frame.chat.data({
                    type: 7,
                    user: {
                        headdata: data.headdata,
                        uid: data.headdata.uid
                    }
                }).show();
                G.frame.friend.remove();
            });
        },
        cellDataTemplate: function() {
            return this.nodes.list_friend.clone();
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
        }
    });
})();