(function() {
    // 聊天-公共
    var me = G.frame.liaotian;

    var _fun = {
        //判断2个字符串的相似度
        compare: function(str1, str2) {
            var x = str1.split('');
            var y = str2.split('');
            var z = 0;
            var s = x.length + y.length;

            x.sort();
            y.sort();
            var a = x.shift();
            var b = y.shift();

            while (a !== undefined && b !== undefined) {
                if (a === b) {
                    z++;
                    a = x.shift();
                    b = y.shift();
                } else if (a < b) {
                    a = x.shift();
                } else if (a > b) {
                    b = y.shift();
                }
            }
            return z / s * 200;
        },
        _checkRepeat: function(str) {
            var me = this;
            me._lastChat = me._lastChat || [];
            //5个字内不监测
            if (str.length < 5) return false;

            for (var i = 0; i < me._lastChat.length; i++) {
                if (me.compare(str, me._lastChat[i]) > 50) {
                    return true;
                }
            }
            return false;
        },
        addNewChat: function(data, isNewChat) {
            var me = this;
            var a = [].concat(data);
            me.DATA = me.DATA || {
                1: [],
                2: [],
                3: [],
                4: [],
                5: []
            };
            me.DATA.voiceList = me.DATA.voiceList || [];
            me.DATA.userHongDian = me.DATA.userHongDian || {};
            if (a.length == 0) return;
            var lastOne = {
                '1': null,
                '2': null
            };
            var showNewIco = false;
            for (var i = 0; i < a.length; i++) {
                var d = a[i];
                var type = d.t;
                me.insertChat(d);
                var da = me.handleDataBySz(type, a);
                me._idx = 0;
                if (G.frame.liaotian.isShow) {
                    me.setData();
                }
            }
            if (data.pmd && data.t != 4 && data.t != 5) {
                if(!cc.isNode(G.view.paomadeng)) {
                    new G.class.paomadeng();
                    cc.director.getRunningScene().addChild(G.view.paomadeng, 999);
                    me.timer = setTimeout(function() {
                        G.view.paomadeng.scrollMessage(data);
                    }, 1000);
                }else {
                    me.timer = setTimeout(function() {
                        cc.isNode(G.view.paomadeng) && G.view.paomadeng.scrollMessage(data);
                    }, 1000);
                }
            }
            //todo
            // if (lastOne['1']) {
            //     setTimeout(function () {
            //         G.frame.paomadeng.scrollMessage(lastOne['1']);
            //     },1000)
            // }else if (lastOne['2']) {
            //     G.event.emit('new_main_liaotian',lastOne['2']);
            //     //G.frame.main.showMessage(lastOne['2']);
            // }
            // if (showNewIco) {
            //     G.setNewIcoImg(me.topMenu.getBtn('4'), 2);
            // }
        },
        insertChat: function(d) {
            var me = this;
            var type = d.t;

            var da = me.handleDataBySz(type, [].concat(d));
            if (da.length < 1) return;
            me.DATA[type].push(d);
            if (type == 1 && me.DATA[type].length > 100) { //20
                me.DATA[type].shift();
            } else if (type == 2 && me.DATA[type].length > 100) { //60
                me.DATA[type].shift();
            } else if (type == 3 && me.DATA[type].length > 100) { //30
                me.DATA[type].shift();
            } else if (type == 4 && me.DATA[type].length > 100) { //80
                me.DATA[type].shift();
            } else if (type == 5 && me.DATA[type].length > 100) {
                me.DATA[type].shift();
            }
            if (type == 5) {
                G.frame.wujunzhizhan_main.showChat();
            }
        },
        createItem: function(data) {
            var me = this;
            var item = new ccui.Layout();

            var msg = me.getMsg(data);
            // var _1 = data.name || '[' + L({
            //         1: 'xitong',
            //         2: 'world',
            //         3: 'guild'
            //     }[data.t]) + ']',
            //     _2 = data.t == 4 ? '@' + data.toname + ': ' + msg : msg;
            var richText = new X.bRichText({
                size: 22,
                maxWidth: 999999,
                lineHeight: 24,
                color: '#ffb200',
                family: G.defaultFNT
            });
            // richText.text(_1 + '：' + msg, []);
            richText.setAnchorPoint(0.5, 0.5);
            richText.text(L('systemXX') + ':' + msg, []);
            richText.y = 35;
            item.setContentSize(richText.trueWidth(), 24);

            item.addChild(richText);
            return item;
        },
        getMsg: function(data) {
            var me = this;
            var msg;
            if (data.sendType && data.sendType != '') {
                me.armylist.push({
                    uid: data.sendData.uid,
                    tid: data.sendData.tid,
                    data: data.sendData,
                    t: data.t
                });
                me.sendData = data.sendData;
                var c = data.sendData.pid ? G.class.pet(data.sendData, true) : G.class.shero(data.sendData);
                var str = '<font color=' + G.gc.COLOR[data.sendData.color || c.conf.color || 1]
                    + ' onclick=G.frame.liaotian.showItem(this)>[' + c.conf.name + ']</font>';
                msg = data.t == 4 ?
                    X.STR(L('KF_SHOW_ITEM'), str, data.sendData.lv, data.sendData.zhanli)
                    : X.STR(L('LT_SHOW_ITEM'), str, data.sendData.lv, data.sendData.zhanli);
                if (data.sendData.pid) {
                    msg = X.STR(L('CHAT_SHOW_PET'), str);
                }
            } else if (data.t == 1) {
                me.ghlist.push(data.ghid);
                msg = data.m + "<br><font node=1></font>";
            } else {
                msg = data.m || data.content;
            }
            return msg;
        },
        showItem: function(data) {
            var me = this;

            if (me.armylist[data.idx].data.pid) {
                return G.frame.sc_xq.data({
                    t: me.armylist[data.idx].data.pid,
                    lv: me.armylist[data.idx].data.lv
                }).show();
            }

            if(me.armylist[data.idx].t == 4) {
                G.frame.yingxiong_jianjie.data({
                    data: me.armylist[data.idx].data
                }).show();
            } else {
                G.ajax.send('user_army_details', [me.armylist[data.idx].uid, me.armylist[data.idx].tid], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.yingxiong_jianjie.data({
                            data: d.d
                        }).show();
                    }
                }, true)
            }
        },
        //信息分享到聊天
        //[tid,频道type,toName,,是否重复,发言type]
        //d = {
        //    tid:tid,  必选
        //    showType:'item,army,equip,baowu等等',   必选
        //    channelType:'频道类型，可选key',
        //    toName:'发送至谁，可选key',
        //},
        shareToChat: function(d) {
            var me = this;

            var arr = [d.tid, d.channelType || 5, d.toName || '', '', d.showType];
            me.sendMsgToServ(arr, function() {
                G.tip_NB.show(L('LT_SHOW_TIP'));
            });
        },
        handleDataBySz: function(curType, data) {
            var me = this;

            if (!me.szData) {
                me.szData = JSON.parse(X.cache('chat'));
            }
            if (!me.szData) return data;

            var arr = [];
            if (curType == 2) {
                if (!parseInt(me.szData['world'])) {
                    data = [];
                }
            } else if (curType == 1) {
                if (!parseInt(me.szData['recruit'])) {
                    data = [];
                }
            } else if (curType == 3) {
                if (!parseInt(me.szData['guild'])) {
                    data = [];
                }
            }else if(curType == 4) {
                if (!parseInt(me.szData['kuafu'])) {
                    data = [];
                }
            }
            // if (curType == 5) { //跨服
            //     if (me.szData['kuafu'] != 1) {
            //         data = [];
            //     }
            // } else if (curType == 2 || curType == 1) { //综合
            //     if (me.szData['zonghe'] != 1) {
            //         data = [];
            //     } else if (me.szData['xitong'] != 1) {
            //         arr = [];
            //         for (var i = 0; i < data.length; i++) {
            //             var d = data[i];
            //             if (d.t != 1) { //去掉系统消息
            //                 arr.push(d);
            //             }
            //         }
            //         data = arr;
            //     }
            // } else if (curType == 3 || curType == 1) { //公会
            //     if (me.szData['gonghui'] != 1) {
            //         data = [];
            //     } else if (me.szData['xitong'] != 1) {
            //         arr = [];
            //         for (var i = 0; i < data.length; i++) {
            //             var d = data[i];
            //             if (d.type == 'user') { //仅仅是玩家消息，去掉公会里的系统消息
            //                 arr.push(d);
            //             }
            //         }
            //         data = arr;
            //     }
            // }

            return data;
        },
    };
    cc.mixin(me, _fun, true);
})();