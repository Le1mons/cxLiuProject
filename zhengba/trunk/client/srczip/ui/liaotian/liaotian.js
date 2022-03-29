/**
 * Created by lsm on 2018/6/25
 */
(function() {
    //聊天
    //todo 聊天主逻辑改为chat
    var ID = 'liaotian';
    // G.event.on('loginOver', function() {
    //     G.frame.liaotian.getSzData();
    //     G.frame.liaotian.getData(function(d) {
    //         G.frame.liaotian.DATA = {
    //             1: [],
    //             2: [],
    //             3: [],
    //             4: [],
    //             5: []
    //         };
    //         G.frame.liaotian.addNewChat(d, false);
    //         G.frame.liaotian.DATA.userHongDian = G.frame.liaotian.DATA.userHongDian || {};
    //         G.frame.liaotian.DATA.userList = G.frame.liaotian.DATA.userList || [];
    //     });
    //     G.frame.liaotian.armylist = [];
    //     G.frame.liaotian.armyidx = 0;
    //     G.frame.liaotian.ghlist = [];
    //     G.frame.liaotian.ghidx = 0;
    // });


    // G.event.on('newchat', function(d) {
    //     var o = X.toJSON(d);
    //
    //     function f() {
    //         G.frame.liaotian.addNewChat(o, true);
    //     }
    //
    //     if(o.pmd && o.t != 4){
    //         var str = o.m.split(">")[2] && o.m.split(">")[2][0];
    //         switch (str) {
    //             case L("CHOU"):
    //                 G.frame.chouka_hdyx.once("over", function () {
    //                     f();
    //                 });
    //                 break;
    //             default:
    //                 f();
    //                 break;
    //         }
    //     }else{
    //         f();
    //         var szData = JSON.parse(X.cache('chat'));
    //         var conf = {
    //             5: "wujun",
    //             4: "kuafu",
    //             2: "world",
    //             3: "guild",
    //             1: "recruit"
    //         };
    //         var type = conf[o.t];
    //         if(!szData[type]) return;
    //
    //         if((type == "kuafu" && P.gud.lv < 30) || (type == "kuafu" && G.OPENTIME + 7 * 24 * 3600 > G.time)) return;
    //         if (type == 'wujun' && (!X.checkIsOpen('wjzz') || !G.DATA.asyncBtnsData.wjzz)) return;
    //
    //         G.DATA.chatRedPoint > 60 ? G.DATA.chatRedPoint = 60 : G.DATA.chatRedPoint ++;
    //         if(!G.view.mainView) return;
    //         if (type == 'guild' && G.frame.liaotian._curType != 3) {
    //             if (!G.DATA.gonghuiPoint) G.DATA.gonghuiPoint = 1;
    //             else G.DATA.gonghuiPoint ++;
    //
    //             if (G.frame.liaotian.isShow) {
    //                 G.setNewIcoImg(G.frame.liaotian.nodes.btn_guild, .9);
    //                 G.frame.liaotian.nodes.btn_guild.redPoint.setPosition(115, 32);
    //             }
    //         }
    //         G.setNewIcoImg(G.view.mainView.nodes.btn_lt, 0.8, G.DATA.chatRedPoint);
    //         if(G.frame.gonghui_main.isShow) {
    //             G.setNewIcoImg(G.frame.gonghui_main.nodes.btn_lt, 0.8, G.DATA.chatRedPoint);
    //         }
    //     }
    // });

    var _CONF = {
        world: 'world',
        guild: 'guild',
        recruit: 'recruit',
        hideVip: "hideVip",
        kuafu: "kuafu",
    };
    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function() {
            var me = this;
            me.ui.nodes.listview_opiton.y += 10;
            me.btnArry = [me.nodes.btn_kuafu, me.nodes.btn_world, me.nodes.btn_guild, me.nodes.btn_recruit];
            // if (X.checkIsOpen('wjzz') &&
            //     X.inArray(['event', 'eventEnd'], G.frame.wujunzhizhan.getState().state) &&
            //     G.DATA.asyncBtnsData.wjzz) {
            //
            // } else {
            //
            // }
            me.btnArry.push(me.nodes.btn_wujun);

            var zeroTime = X.getTodayZeroTime();

            if(P.gud.lv < 30 || (G.OPENTIME + 7 * 24 * 3600 > G.time && G.OPENTIME + 7 * 24 * 3600 - zeroTime > 24 * 3600)){
                var lay = new ccui.Layout();
                lay.setContentSize(me.nodes.btn_kuafu.getSize());
                me.nodes.btn_kuafu.addChild(lay);
                me.nodes.btn_kuafu.setTouchEnabled(false);
                lay.setTouchEnabled(true);
                lay.click(function(){
                    G.tip_NB.show(L('KUAFULTL'));
                });
                me.noOpen = G.DATA.closeKf = true;
            }
            if(!X.checkIsOpen('wjzz') || !G.DATA.asyncBtnsData.wjzz){
                var lay = new ccui.Layout();
                lay.setContentSize(me.nodes.btn_wujun.getSize());
                me.nodes.btn_wujun.addChild(lay);
                me.nodes.btn_wujun.setTouchEnabled(false);
                lay.setTouchEnabled(true);
                lay.click(function(){
                    if (!X.checkIsOpen('wjzz')) return G.tip_NB.show(L('WUJUN_OPENNEED'));
                    if (!G.DATA.asyncBtnsData.wjzz) return G.tip_NB.show(L("BZHDQJN"));
                });
            }
            if (!P.gud.ghid) {
                var lay = new ccui.Layout();
                lay.setContentSize(me.nodes.btn_guild.getSize());
                me.nodes.btn_guild.addChild(lay);
                me.nodes.btn_guild.setTouchEnabled(false);
                lay.setTouchEnabled(true);
                lay.click(function(){
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            if (P.gud.lv < 21) return G.tip_NB.show(L("KQGH"));
                            G.view.mainMenu.nodes.btn_gonghui.triggerTouch(ccui.Widget.TOUCH_ENDED);
                            G.frame.liaotian.remove();
                        },
                        richText: L("QWGH"),
                    }).show();
                });
            }
            if (G.DATA.gonghuiPoint) {
                G.setNewIcoImg(me.nodes.btn_guild, 9);
                me.nodes.btn_guild.redPoint.setPosition(115, 32);
            }
            X.radio(me.btnArry, function(sender) {
                var name = sender.getName();
                var name2type = {
                    btn_world$: 2,
                    btn_guild$: 3,
                    btn_recruit$: 1,
                    btn_kuafu$: 4,
                    btn_wujun$: 5
                };
                for (var i = me.btnArry.length - 1; i >= 0; i--) {
                    me.btnArry[i].setBright(true);
                }
                sender.setBright(false);
                me.changeType(name2type[name]);
            }, {
                color: ['#ffffff', '#af9e89'],
                callback1: function (sender) {
                    if (sender.redPoint) G.removeNewIco(sender);
                    if (sender.getName() == "btn_guild$") G.DATA.gonghuiPoint = 0;
                },
                callback2: function (sender) {
                    
                }
            });
            me.initUi_listview();
            cc.enableScrollBar(me.nodes.scrollview_top);
        },
        bindBtn: function() {
            var me = this;
            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            //聊天设置
            me.ui.nodes.btn_option.touch(function(sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.liaotianOption(sender);
                }
            });

            me.ui.nodes.close_option.click(function(sender) {
                sender.setTouchEnabled(false);
                me.nodes.panel_option.hide();
            });

            me.ui.nodes.btn_send.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {

                    if (me._curType == 2 && P.gud.lv < 30) {
                        G.tip_NB.show(L('gonghuipindao'));
                        return;
                    }
                    var text = me.ui.nodes.txtfield.getString(),
                        toName = '';
                    if (text.trim().length == 0) {
                        G.tip_NB.show(L('SRLTNR'));
                        return;
                    }
                    text = text.substr(0, 40);

                    if (text.length > 30) {
                        G.tip_NB.show(L('TEXT_ALERT'));
                        return;
                    }

                    var _sendData = [text, me._curType, toName, ''];
                    var notmsg = '';
                    if (me._curType == 2) {
                        if (!parseInt(me.szData['world'])) {
                            notmsg = 'notSendMessage';
                        }
                    } else if (me._curType == 1) {
                        if (!parseInt(me.szData['recruit'])) {
                            notmsg = 'notSendMessage';
                        }
                    } else if (me._curType == 3) {
                        if (!parseInt(me.szData['guild'])) {
                            notmsg = 'notSendMessage';
                        }
                    } else if(me._curType == 4) {
                        if (!parseInt(me.szData['kuafu'])) {
                            notmsg = 'notSendMessage';
                        }
                    }
                    _sendData[5] = '';
                    _sendData[6] = G.frame.liaotian.szData.hideVip == 0 ? 1 : 0;

                    me.ui.nodes.txtfield.setString('');

                    me.sendMsgToServ(_sendData, function() {
                        X.editbox.create(me.ui.nodes.txtfield);
                    });
                }
            });
        },
        sendMsgToServ: function(d, callback) {
            var me = this;
            G.ajax.send('chat_send', d, function(data) {
                var data = X.toJSON(data);
                if (data.s == 1) {
                    callback && callback();
                }
            }, true);
        },
        liaotianOption: function(ui) {
            var me = this;
            cc.log(JSON.stringify(me.szData));
            var data = me.szData || {
                world: 1,
                guild: 1,
                recruit: 1,
                kuafu: 1,
                hideVip: 1,
            };
            var conf = {
                world: L('world_opiton'),
                guild: L('guild_opiton'),
                recruit: L('recruit_opiton'),
                hideVip: L("hide_vip"),
                kuafu: L("kuafu")
            };
            if (me.nodes.panel_option.visible) {
                me.nodes.panel_option.hide();
            } else {
                setOption();
                me.nodes.panel_option.show();
            }
            me.ui.nodes.close_option.setTouchEnabled(true);

            function setOption() {
                var listview = me.ui.nodes.listview_opiton;
                cc.enableScrollBar(listview);
                var kong = me.ui.nodes.list_option.clone();
                kong.height = kong.height / 2 + 3;
                listview.removeAllChildren();
                listview.pushBackCustomItem(kong);
                for (var k in data) {
                    var item = me.ui.nodes.list_option.clone();
                    setitem(item, data[k], k);
                    listview.pushBackCustomItem(item);
                }
            }

            function setitem(ui, d, k) {
                X.autoInitUI(ui);
                var txt = ui.nodes.txt_option;
                var check = ui.nodes.check;
                setTextWithColor(txt, conf[k], '#f6ebcd');
                check.setSelected(d > 0 ? false : true);
                check.data = _CONF[k];
                check.touch(function(sender, type) {
                    if (type === ccui.Widget.TOUCH_ENDED) {
                        G.frame.liaotian.szData[sender.data] = sender.isSelected() ? 0 : 1;
                        cc.log(JSON.stringify(G.frame.liaotian.szData));
                        X.cache('chat', JSON.stringify(G.frame.liaotian.szData));
                    }
                });
                ui.show();
            }
        },
        onOpen: function() {
            var me = this;
            me._curType = 2;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.ui.finds("text_2").setString(1);
            me.ui.nodes.txtfield.setPlaceHolderColor(cc.color(G.gc.COLOR.n11));
            me.ui.nodes.txtfield.setTextHorizontalAlignment(0);
            me.ui.nodes.txtfield.setTextVerticalAlignment(1);
            X.editbox.create(me.nodes.txtfield);
            me.isNew = false;
        },
        onAniShow: function() {
            var me = this;
        },
        getDBPB: function(callback) {
            var me = this;

            G.ajax.send('friend_blacklist', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    var data = d.d.blacklist;
                    me.BDPB = [];
                    for (var i in data) {
                        me.BDPB.push(data[i].uid);
                    }
                    callback && callback();
                }
            }, true);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getDBPB(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function() {
            var me = this;
            me.DATA = me.DATA || {
                1: [],
                2: [],
                3: [],
                4: [],
                5: []
            };
            var type = me.data() && me.data().type ? me.data().type : 1;
            if(type == 1) {
                if(me.noOpen) {
                    type = 2;
                }
            }
            me.btnArry[type - 1].triggerTouch(ccui.Widget.TOUCH_ENDED);
            G.DATA.chatRedPoint = 0;
            G.removeNewIco(G.view.mainView.nodes.btn_lt);
            if(G.frame.gonghui_main.isShow) {
                G.removeNewIco(G.frame.gonghui_main.nodes.btn_lt);
            }

            me.friend = [];
            me.getFriendData();
        },
        getFriendData: function() {},
        onHide: function() {
            var me = this;

            G.removeNewIco(G.view.mainView.nodes.btn_lt);
            if(G.frame.gonghui_main.isShow) {
                G.removeNewIco(G.frame.gonghui_main.nodes.btn_lt);
            }
        },

        setContents: function() {
            var me = this;

        },
        getSzData: function(callback) {
            var me = this;
            var new_chat_sz = X.cache('chat');
            if (!new_chat_sz) {
                X.cache('chat', JSON.stringify({
                    world: 1,
                    guild: 1,
                    recruit: 1,
                    kuafu: 1,
                    hideVip: 1,
                }));
            }
            me.szData = JSON.parse(X.cache('chat'));
            G.DATA.kfpb = X.cacheByUid("newkfpb") || {};
        },
        getData: function(callback) {
            var me = this;
            G.ajax.send('chat_getlist', '', function(data) {
                data = X.toJSON(data);
                if (data.s == 1) {
                    callback && callback.call(me, data.d);
                }
            });
        },
        changeType: function(type) {
            var me = this;
            me._curType = type;

            if (me._curType != type) {
                me._needShowScrollViewUp = true;
                me._scrollOffset = cc.p(0, 0);
                me.ui.nodes.txtfield.setString('');
            } else {
                me._needShowScrollViewUp = false;
            }

            if (type == 1) {
                me.nodes.btn_send.hide();
                me.ui.finds('panel_txtfield').hide();
            } else {
                me.nodes.btn_send.show();
                me.ui.finds('panel_txtfield').show();
            }

            me.isNew = false;
            me.setData();
        },
        onNodeShow: function() {
            var me = this;

            if(!cc.isNode(me.ui)) return;

            me.setData();
        },
        setData: function() {
            var me = this;
            var data;
            var type = me._curType;
            if (type == 1) {
                data = [].concat(me.DATA[1]);
            } else if (type == 2) {
                // data = [].concat(me.DATA[2]);
                var arr = [];
                for (var i in me.DATA[2]) {
                    if(!me.DATA[2][i].pmd) {
                        arr.push(me.DATA[2][i]);
                    }
                    if (me.DATA[2][i].m.indexOf(L("GHBX")) != -1) {
                        arr.push(me.DATA[2][i]);
                    }
                    var str = me.DATA[2][i].m.split("<")[5];
                    if(str && str.split(">")[1] && parseInt(str.split(">")[1]) >= 10) arr.push(me.DATA[2][i]);
                }
                var logArr = [];

                for (var i in arr) {
                    if(!X.inArray(me.BDPB, arr[i].uid)) logArr.push(arr[i]);
                }
                data = logArr;
            } else if (type == 3) {
                data = [].concat(me.DATA[3]);
            } else if(type == 4) {
                data = [].concat(me.DATA[4]);
                var pb = [];
                for (var i in data) {

                    if(!G.DATA.kfpb[data[i].uid]) pb.push(data[i]);
                }
                data = pb;
            } else if (type == 5) {
                data = [].concat(me.DATA[5]);
            }
            if(data.length < 1){
                if(cc.isNode(me.nodes.img_zwnr)){
                    me.nodes.img_zwnr.show();
                }
            }else{
                if(cc.isNode(me.nodes.img_zwnr)){
                    me.nodes.img_zwnr.hide();
                }
            }
            me.fmtItemList(data);
            me.ui_table1.setCellSize(data.length - 1, cc.size(me.ui.nodes.list_dialogue.width, me.oldlineheight || me.defLineheight));
        },

    });

    G.frame[ID] = new fun('chat.json', ID);
})();