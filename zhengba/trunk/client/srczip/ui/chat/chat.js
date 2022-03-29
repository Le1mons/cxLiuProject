/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'chat';

    var fun = X.bUi.extend({
        btnType: {
            btn_tongsheng: 6,
            btn_kuafu: 4,
            btn_world: 2,
            btn_guild: 3,
            btn_sl: 7,
            btn_recruit: 1,
            // btn_wujun: 5,
        },
        typeBtn: {},
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            for (var name in me.btnType) {
                me.nodes[name].chatType = me.btnType[name];
                me.typeBtn[me.btnType[name]] = me.nodes[name];
                me.setBtnState(me.nodes[name]);
            }

            X.editbox.create(me.nodes.txtfield);
            cc.enableScrollBar(me.nodes.listview_bq);
            cc.enableScrollBar(me.nodes.scrollview_sl);
            cc.enableScrollBar(me.nodes.scrollview_top);
            cc.enableScrollBar(me.nodes.scrollview_chat);
            cc.enableScrollBar(me.nodes.listview_opiton);
            cc.enableScrollBar(me.nodes.scrollview_chat1);

            me.defaultWidth = me.nodes.scrollview_chat.width;
            me.layout = new ccui.Layout();
            me.layout.setContentSize(me.defaultWidth, 50);
            me.ui.addChild(me.layout);
        },
        setBtnState: function (btn) {
            var me = this;
            if (me.openConfig[btn.chatType] && !me.openConfig[btn.chatType]()) {
                var lay = new ccui.Layout();
                lay.setContentSize(btn.getSize());
                btn.addChild(lay);
                btn.setTouchEnabled(false);
                lay.setTouchEnabled(true);
                lay.click(function(){
                    me.closeTxt[btn.chatType] && me.closeTxt[btn.chatType]();
                });
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_send.click(function () {
                if (me.chatType == 7 && !me.selectUid) return G.tip_NB.show(L("QXZSLDX"));
                if (X.inArray([6, 7, 2], me.chatType) && P.gud.lv < 30) {
                    return G.tip_NB.show(L('gonghuipindao'));
                }
                var text = me.nodes.txtfield.getString(),
                    toName = me.selectUid || '';
                if (text.trim().length == 0) {
                    return G.tip_NB.show(L('SRLTNR'));
                }
                text = text.substr(0, 40);
                if (text.length > 30) {
                    return G.tip_NB.show(L('TEXT_ALERT'));
                }
                if (cc.sys.isNative && me.isFaceStr(text)) {
                    text = text.split('[').join('');
                    text = text.split(']').join('');
                }
                var _sendData = [text, me.chatType, toName, '', '', '',
                    X.cacheByUid("hideVip") ? 1 : 0, me.getProvince(), me.getCity()];
                me.sendChat(_sendData, function () {
                    me.nodes.txtfield.setString('');
                    X.editbox.create(me.nodes.txtfield);
                });
            });
            me.nodes.btn_wujun.width = 0;
            X.radio([
                me.nodes.btn_tongsheng, me.nodes.btn_kuafu, me.nodes.btn_world, me.nodes.btn_guild,
                me.nodes.btn_sl, me.nodes.btn_recruit
            ], function (sender) {
                me.changeType(sender.chatType);
            });

            me.nodes.btn_sl_bq.click(function () {
                me.nodes.panel_bq.show();
                me.nodes.close_option.setTouchEnabled(true);
            });

            me.nodes.close_option.click(function (sender) {
                me.nodes.panel_bq.hide();
                sender.setTouchEnabled(false);
            });

            me.nodes.btn_option.click(function (sender) {
                sender.setBright(!sender.bright);
                me.nodes.panel_option.setVisible(!me.nodes.panel_option.visible);
            });

            me.nodes.btn_sl_tj.click(function () {
                G.frame.friend.show();
                me.remove();
            });
        },
        sendChat: function (sendData, callback) {
            connectApi("chat_send", sendData, function () {
                callback && callback();
            });
        },
        checkRedPoint: function () {
            if (cc.isNode(this.ui)) {
                for (var type in this.redConf) {
                    if (this.redConf[type] && this.redConf[type] > 0) {
                        G.setNewIcoImg(this.typeBtn[type], .85);
                    } else {
                        G.removeNewIco(this.typeBtn[type]);
                    }
                }
            }
            this.allRedNum = 0;
            for (var type in this.redConf) this.allRedNum += this.redConf[type];

            if (this.allRedNum) {
                G.setNewIcoImg(G.view.mainView.nodes.btn_lt, 0.8, this.allRedNum);
                if(G.frame.gonghui_main.isShow) {
                    G.setNewIcoImg(G.frame.gonghui_main.nodes.btn_lt, 0.8, this.allRedNum);
                }
            } else {
                G.removeNewIco(G.view.mainView.nodes.btn_lt);
                if(G.frame.gonghui_main.isShow) {
                    G.removeNewIco(G.frame.gonghui_main.nodes.btn_lt);
                }
            }
        },
        setChatSetting: function () {
            var me = this;
            var setData = {
                chatType_1: L('recruit_opiton'),
                chatType_2: L('world_opiton'),
                chatType_3: L('guild_opiton'),
                chatType_4: L('kuafu'),
                hideVip: L('hide_vip'),
            };
            function setitem(ui, d, k) {
                X.autoInitUI(ui);
                var txt = ui.nodes.txt_option;
                var check = ui.nodes.check;
                setTextWithColor(txt, d, '#f6ebcd');
                if (k == 'hideVip') {
                    check.setSelected(P.gud.showvip==0);
                    X.cacheByUid(k, P.gud.showvip==0);
                }else {
                    check.setSelected(X.cacheByUid(k) ? true : false);
                }
                check.addEventListener(function (sender, type) {
                    if (k == 'hideVip'){
                        G.ajax.send("user_showvip",[],function(data){
                            var d = X.toJSON(data);
                            if(d.s != 1)return;
                        })
                    }
                    switch (type) {
                        case ccui.CheckBox.EVENT_UNSELECTED:
                            sender.setSelected(false);
                            X.cacheByUid(k, false);
                            G.view.toper.updateData();
                            break;
                        case ccui.CheckBox.EVENT_SELECTED:
                            sender.setSelected(true);
                            X.cacheByUid(k, true);
                            G.view.toper.updateData();
                            break;
                    }
                });
                ui.show();
            }
            for (var key in setData) {
                var item = me.nodes.list_option.clone();
                setitem(item, setData[key], key);
                me.nodes.listview_opiton.pushBackCustomItem(item);
            }
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
            me.initFaceUi();
            me.setChatSetting();
            if (me.data()) me.toUser = me.data().user;
        },
        onHide: function () {
            this.chatType = undefined;
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
                } else {
                    me.BDPB = [];
                    callback && callback();
                }
            }, true);
        },
        // show : function(conf){
        //     var me = this;
        //     var _super = this._super;
        //     this.getDBPB(function () {
        //         _super.apply(me,arguments);
        //     });
        // },
        onShow: function () {
            var me = this;
            var data = me.data() || {};
            var type = data.type || undefined;

            if (!me.typeBtn[type]) {
                if (me.openConfig[4]()) {
                    type = 4;
                } else type = 2;
            }
            me.typeBtn[type] && me.typeBtn[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function (type) {
            var me = this;
            this.chatType = type;
            this.chatType != 7 && this.setChatTable(true);
            this.chatType == 7 && this.getPrivateHeadData(null, function () {
                me.setPrivateHeadTable();
            });
            this.nodes.txtfield.setString('');
            this.nodes.panel_chat.setVisible(type != 7);
            this.nodes.panel_chat1.setVisible(type == 7);
            this.nodes.btn_send.setVisible(type != 1);
            this.ui.finds('panel_txtfield').setVisible(type != 1);


            this.redConf[type] = 0;
            this.checkRedPoint();
            cc.log("chatType ========== ", type);
        },
        initCellSize: function (data, table) {
            var me = this;
            function setCell() {
                var cellObj = {};
                for (var index = 0; index < data.length; index ++) {
                    var _data = data[index];
                    var height;
                    if (_data.uid) {
                        height = 135;
                        if (me.isFaceStr(_data.m)) height = 160;
                    } else height = 60;
                    cellObj[index] = cc.size(me.layout.width, height);
                }
                return cellObj;
            }
            table._table._cellSize = setCell();
        },
        setChatTable: function (isTop) {
            var me = this;
            var chatList = me.chatData[me.chatType] || [];

            me.nodes.img_zwnr.setVisible(chatList.length == 0);
            if (!me.chatTable) {
                me.chatTable = new X.TableView(me.nodes.scrollview_chat, me.layout, 1, function (ui, data, pos) {
                    me.setChatList(ui, data, pos[0]);
                }, null, null, 10, 10);
                me.chatTable.setData(chatList);
                me.initCellSize(chatList, me.chatTable);
                me.chatTable.reloadDataWithScroll(true);
                me.chatTable.scrollToCell(chatList.length - 1);
            } else {
                me.chatTable.setData(chatList);
                me.initCellSize(chatList, me.chatTable);
                if (isTop) {
                    me.chatTable.reloadDataWithScroll(true);
                    me.chatTable.scrollToCell(chatList.length - 1);
                } else {
                    me.chatTable.reloadDataWithScroll(false);
                }
            }
        },
        getOtherChatData: function (uid) {
            var me = this;
            var chatList = [];
            var chatData = me.chatData[7] || [];
            for (var index = 0; index < chatData.length; index ++) {
                var chat = chatData[index];
                if (chat.uid == selectUid || chat.touid == selectUid) chatList.push(chat);
            }
            chatList.sort(function (a, b) {
                return a.ctime > b.citime ? -1 : 1;
            });
            return chatList;
        },
        getPrivateHeadData: function (uid, callback) {
            var me = this;

            me.ajax("chat_open", uid ? [uid] : [], function (str, data) {
                if (data.s == 1) {
                    var list = data.d;
                    if (!uid){
                        me.chatData.userList = me.chatData.userList || [];
                        for (var i in list){
                            var idx = X.arrayFind(me.chatData.userList, list[i].uid, 'uid');
                            if (idx < 0) {
                                me.chatData.userList.push(list[i]);
                            }
                        }
                    }else{
                        me.chatData[7] = [];
                        me.classifyData(list);
                    }
                    callback && callback();
                }
            });
        },
        setPrivateHeadTable: function () {
            var me = this;
            if(me.data() && me.data().user){
                var idx = X.arrayFind(me.chatData.userList, me.data().user.uid, 'uid');
                if (idx < 0) {
                    me.chatData.userList.unshift(me.data().user);
                }
            }
            var arr = [];
            for(var i = 0; i < me.chatData.userList.length; i++){
                if(me.chatData.userList[i].headdata && X.keysOfObject(me.chatData.userList[i].headdata).length > 0){
                    arr.push(me.chatData.userList[i]);
                }
            }
            if (!this.headTable) {
                this.nodes.scrollview_sl.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
                this.headTable = new X.TableView(this.nodes.scrollview_sl, this.nodes.list_sl_tx, 1, function (ui, data) {
                    me.showHeadList(ui, data);
                }, cc.size(this.nodes.list_sl_tx.width,this.nodes.list_sl_tx.height));
                if (!cc.sys.isNative) this.headTable._table.tableView.y = 200;
            }
            this.headTable.setData(arr);
            this.headTable.reloadDataWithScroll(true);
            if(arr.length > 0){
                cc.callLater(function(){
                    if (me.selectUid) {
                        var chr = me.headTable.getAllChildren();
                        var name = chr[0].getName();
                        for (var index = 0; index < chr.length; index ++) {
                            var children = chr[index];
                            if (children.data == me._privateUid) {
                                name = children.getName();
                                break;
                            }
                        }
                        me.headTable._table.getItemByName(name)[0].nodes.panel_sl_tx.triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                        // G.removeNewIco(me.headTable._table.getItemByName(name)[0]);
                    } else {
                        me.headTable.getAllChildren()[0].nodes.panel_sl_tx.triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                        // G.removeNewIco(me.headTable.getAllChildren()[0]);
                    }
                });
            }else{
                me.setPrivateTable();
            }
        },
        showHeadList: function (ui, data) {
            var me = this;
            if(X.keysOfObject(data.headdata).length == 0) return
            X.autoInitUI(ui);
            X.render({
                panel_xz: function (node) {
                    node.setVisible(me.selectUid == data.uid);
                },
                txt_sl_name: function(node){
                    node.setString(data.headdata.name);
                    node.setTextColor(cc.color("#6b2605"));
                },
                btn_sl_j: function (node) {
                    node.noMove(function () {
                        me.ajax('chat_delete',[data.uid],function(ss, dd) {
                            if (dd.s === 1) {
                                // var num = me.privateRed[data.uid] || 0;
                                // me.redConf[7] -= num;
                                // me.privateRed[data.uid] = 0;
                                // me.checkRedPoint();
                                me.selectUid = undefined;
                                var idx = X.arrayFind(me.chatData.userList, data.uid, 'uid');
                                if (idx > -1) {
                                    me.chatData.userList.splice(idx,1);
                                }
                                if(me.toUser && me.toUser.uid == data.uid) me.data().user = null;
                                me.chatData[7] = [];
                                me.setPrivateHeadTable();
                            }
                        });
                    });
                },
                panel_sl_tx: function (node) {
                    if(X.keysOfObject(data.headdata).length > 0){
                        var head = G.class.shead(data.headdata);
                        head.setPosition(node.width / 2, node.height / 2);
                        node.addChild(head);
                    }

                    node.setSwallowTouches(false);
                    node.noMove(function () {
                        me.selectUid = data.uid;
                        me.headTable._table.forEachChild(function(child){
                            child.nodes.panel_xz.setVisible(child.data == me.selectUid);
                        });
                        me.getPrivateHeadData(data.uid, function(){
                            me.setPrivateTable(true);
                        });
                        // me.redConf[7] -= me.privateRed[data.uid] || 0;
                        // me.privateRed[data.uid] = 0;
                        // me.checkRedPoint();
                    });
                }
            }, ui.nodes);
            ui.data = data.uid;
            ui.setName(data.uid);
        },
        setPrivateTable: function (isTop) {
            var me = this;
            var chatList = me.chatData[7] || [];

            me.nodes.img_zwnr1.setVisible(chatList.length == 0);
            if (!me.chatTable1) {
                me.chatTable1 = new X.TableView(me.nodes.scrollview_chat1, me.layout, 1, function (ui, data, pos) {
                    me.setChatList(ui, data, pos[0]);
                }, null, null, 10, 10);
                me.chatTable1.setData(chatList);
                me.initCellSize(chatList, me.chatTable1);
                me.chatTable1.reloadDataWithScroll(true);
                me.chatTable1.scrollToCell(chatList.length - 1);
            } else {
                me.chatTable1.setData(chatList);
                me.initCellSize(chatList, me.chatTable1);
                if (isTop) {
                    me.chatTable1.reloadDataWithScroll(true);
                    me.chatTable1.scrollToCell(chatList.length - 1);
                } else {
                    me.chatTable1.reloadDataWithScroll(false);
                }
            }
        },
        setChatList: function (ui, data, pos) {
            var me = this;
            var list;
            ui.removeAllChildren();
            if (data.uid) {
                var isMy = data.uid == P.gud.uid;
                list = isMy ? me.nodes.list_lb_r.clone() : me.nodes.list_lb.clone();
                X.autoInitUI(list);
                X.render({
                    panel_vip: function (node) {
                        node.hide();
                    },
                    bg_vip: function (node) {
                        data.vip && node.loadTexture(X.getVipIcon(data.vip), 0);
                    },
                    fnt_vip: function (node) {
                        node.setString(data.vip);
                        node.setTextColor(cc.color('#ffecaa'));
                        X.enableOutline(node, '#250e00',1);
                    }
                }, list.nodes);
                X.render({
                    panel_tx: function (node) {
                        var head = G.class.shead(data);
                        head.setPosition(node.width / 2, node.height / 2);
                        node.addChild(head);
                        if (data.uid == 'SYSTEM') {
                            head.num.setString(999);
                            head.icon.loadTextureNormal("ico/itemico/gmtx.png", 0);
                        }
                        head.data = data.uid == 'SYSTEM' ? 'system' : data;
                        head.setTouchEnabled(true);
                        head.icon.setSwallowTouches(false);
                        head.touch(function(sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                if(sender.data == "system") {
                                    return G.tip_NB.show(L("XSYDY"));
                                }
                                if (sender.data.uid == P.gud.uid) return null;
                                G.frame.wanjiaxinxi.data({
                                    pvType: 'zypkjjc',
                                    uid: sender.data.uid,
                                    iskf: sender.data.sid != P.gud.sid,
                                    showBy: me.chatType == 4
                                }).checkShow();
                            }
                        });
                    },
                    panel_ch: function (node) {
                        node.setVisible(data.chenghao != '');
                        data.chenghao && node.setBackGroundImage("img/public/chenghao_" + data.chenghao + ".png", 1);
                    },
                    txt_send_time: function (node) {
                        node.setVisible(data.chenghao == '');
                        node.setString(X.timetostr(data.ctime, '[m-d h:mm]'));
                    },
                    txt_player_name: function (node) {
                        var str = isMy ? "<font node=1></font> <font color=#964300>{1} </font>" + data.name :
                            data.name + "<font color=#964300> {1}</font> <font node=1></font>";
                        var addValue = '';
                        switch (data.t) {
                            case 4:
                            case 7:
                            case 5:
                                addValue = data.svrname || '';
                                break;
                            case 6:
                                addValue = data.city || '';
                                break;
                        }
                        if (addValue != '') addValue = X.STR("[{1}]", addValue);
                        str = X.STR(str, addValue);

                        var vipNode = list.nodes.panel_vip.clone();
                        vipNode.children[1].setTextColor(cc.color('#ffecaa'));
                        X.enableOutline(vipNode.children[1], '#250e00',1);
                        vipNode.setVisible(data.vip && !data.hidevip);

                        var rh = new X.setRichText({
                            parent: node,
                            str: str,
                            color: '#6b2605',
                            size: 22,
                            node: vipNode
                        });
                        rh.setPosition(isMy ? node.width - rh.trueWidth() : 0,
                            0);
                    },
                    img_player_chat: function (node) {
                        node.loadTexture(me.getChatStrBgImg(data), 1);
                    },
                    txt_player_chat: function (node) {
                        var richTextNode;
                        var text;
                        var str = me.getChatStr(data);
                        var isFace = str.length > 1;
                        var rh = new X.bRichText({
                            size: 18,
                            maxWidth: 420,
                            lineHeight: 30,
                            color: me.getChatStrColor(data),
                            family: G.defaultFNT
                        });
                        rh.data = data;
                        text = str.shift();
                        richTextNode = str;
                        if (data.t == 1 && data.ghid != P.gud.ghid) {
                            richTextNode = me.nodes.btn_apply.clone();
                            richTextNode.setTitleColor(cc.color("#7B531A"));
                            richTextNode.show();
                            richTextNode.click(function () {
                                G.frame.gonghui_main.gonghuiApply(data.ghid);
                            });
                        }
                        rh.text(text, [].concat(richTextNode));
                        var width = rh.trueWidth();
                        if (width > node.width) {
                            list.nodes.img_player_chat.width += width - node.width;
                            node.width += width - node.width;
                        }
                        if (rh.trueHeight() > node.height) {
                            var addHeiNum = 0.3;
                            if (data.t == 1 && data.ghid != P.gud.ghid) addHeiNum = 0.5;
                            if (isFace) addHeiNum = 1;
                            node.height += node.height * addHeiNum;
                            list.nodes.img_player_chat.height += list.nodes.img_player_chat.height * addHeiNum;
                        }
                        var posY = node.height / 2 - rh.trueHeight() / 2;
                        if (isFace) posY = -50;
                        cc.log(rh.trueHeight());
                        rh.setPosition(0, posY);
                        node.addChild(rh);
                    }
                }, list.nodes);
            } else {
                list = data.iszqwz ? me.nodes.list_zqwz.clone() : me.nodes.list_system.clone();
                X.autoInitUI(list);
                X.render({
                    txt_system: function (node) {
                        var rh = X.setRichText({
                            str: data.iszqwz ? data.m : L('systemXX') + data.m,
                            parent: node,
                            color: "#804326"
                        });
                        rh.setPosition(data.iszqwz ? node.width / 2 - rh.trueWidth() / 2 : 0,
                            node.height / 2 - rh.trueHeight() / 2);
                    },
                    bg_system: function (node) {
                        if (data.iszqwz) {
                            G.class.ani.show({
                                json: "ani_zuiqiangwangzhe_tanchuang",
                                addTo: node,
                                autoRemove: false,
                                onload: function (node, action) {
                                    action.playWithCallback("in", false, function () {
                                        action.play("wait", true);
                                    });
                                }
                            });
                        }
                    }
                }, list.nodes);
            }
            if (list) {
                list.show();
                ui.addChild(list);
                list.setAnchorPoint(0, 1);
                list.setPosition(0, ui.height);
            }
        }
    });
    G.frame[ID] = new fun('chat.json', ID);
})();