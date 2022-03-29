(function () {
    X.getMyCity = function (callback) {
        G.DATA.myProvince = {};
        X.ajax.get('http://huixieapi.legu.cc/ip2city/index.php', null, function (text) {
            try {
                G.DATA.myProvince = JSON.parse(text);
            } catch (e) { }
            callback && callback();
        }, function () {
            callback && callback();
        });
    };

    G.event.on("newchat", function (data) {
        data = JSON.parse(data);
        G.frame.chat.addOneChat(data);
    });

    var func = {
        face: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        openConfig: {
            3: function () {
                return P.gud.ghid ? true : false;
            },
            4: function () {
                return P.gud.lv >= 30 && G.time > G.OPENTIME + X.getOpenTimeToNight() + 6 * 24 * 3600;
            },
            5: function () {
                return X.checkIsOpen('wjzz') && G.DATA.asyncBtnsData.wjzz;
            }
        },
        closeTxt: {
            3: function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        if (P.gud.lv < 21) return G.tip_NB.show(L("KQGH"));
                        G.view.mainMenu.nodes.btn_gonghui.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        G.frame.chat.remove();
                    },
                    richText: L("QWGH"),
                }).show();
            },
            4: function () {
                G.tip_NB.show(L('KUAFULTL'));
            },
            5: function () {
                if (!X.checkIsOpen('wjzz')) return G.tip_NB.show(L('WUJUN_OPENNEED'));
                if (!G.DATA.asyncBtnsData.wjzz) return G.tip_NB.show(L("BZHDQJN"));
            },
        },
        getCity: function () {
            if (X.isHavItem(G.DATA.myProvince)) {
                return G.DATA.myProvince.c;
            }
            return '';
        },
        getProvince: function () {
            if (X.isHavItem(G.DATA.myProvince)) {
                return G.DATA.myProvince.p;
            }
            return '';
        },
        getChatData: function (callback) {
            var me = this;
            me.redConf = {};
            me.chatData = {};
            me.privateRed = {};
            G.DATA.kfpb = X.cacheByUid("newkfpb") || {};
            connectApi("chat_getlist", [], function (data) {
                me.classifyData(data);
                callback && callback();
            }, function () {
                callback && callback();
            });
        },
        setMessageLen: function (data, type) {
            var obj = {
                7: 9999
            };
            var maxLen = obj[type] || 100;
            if (data.length >= maxLen) data.shift();
        },
        classifyData: function (data) {
            if (cc.isArray(data)) {
                for (var index = 0; index < data.length; index++) {
                    var chat = data[index];
                    if (chat.t == 3 && chat.ghid != P.gud.ghid) continue;
                    if (chat.t == 6 && chat.province != this.getProvince()) continue;
                    if (chat.t == 7 && chat.uid != P.gud.uid && chat.touid != P.gud.uid) continue;
                    if (X.inArray(['zhaohuanjitan', 'hechenghero', 'hechengshipin'], chat.pmd)
                        || (chat.pmd == 'herostarup' && chat.pmdargs[2] < 10)) {
                        continue;
                    }
                    if (X.inArray(this.BDPB, chat.uid)) continue;

                    if (!this.chatData[chat.t]) this.chatData[chat.t] = [];
                    this.chatData[chat.t].push(chat);
                }
            } else {
                if (!this.chatData[data.t]) this.chatData[data.t] = [];
                this.setMessageLen(this.chatData[data.t], data.t);
                this.chatData[data.t].push(data);
            }
        },
        addPMD: function (data) {
            if (!cc.isNode(G.view.paomadeng)) {
                new G.class.paomadeng();
                cc.director.getRunningScene().addChild(G.view.paomadeng, 999);
                this.timer = setTimeout(function () {
                    G.view.paomadeng.scrollMessage(data);
                }, 1000);
            } else {
                this.timer = setTimeout(function () {
                    cc.isNode(G.view.paomadeng) && G.view.paomadeng.scrollMessage(data);
                }, 1000);
            }
        },
        addOneChat: function (data) {
            var me = this;
            if (!cc.isNode(G.view.mainView)) return null;
            if (X.cacheByUid("chatType_" + data.t)) return null;
            if (this.openConfig[data.t] && !this.openConfig[data.t]()) return null;
            if (X.inArray(this.BDPB, data.uid)) return null;
            if (data.t == 3 && data.ghid != P.gud.ghid) return null;
            if (data.t == 6 && data.province != this.getProvince()) return null;
            if (data.t == 7 && data.uid != P.gud.uid && data.touid != P.gud.uid) return null;
            if (data.t == 4 && G.DATA.kfpb[data.uid]) return null;
            if (data.t == 5) G.frame.wujunzhizhan_main.showChat();

            if (data.pmd && data.t != 4 && data.t != 5) this.addPMD(data);
            if (X.inArray(['zhaohuanjitan', 'hechenghero', 'hechengshipin'], data.pmd)
                || (data.pmd == 'herostarup' && data.pmdargs[2] < 10)) {
                return null;
            }
            this.chatType != 7 && this.classifyData(data);
            if (!this.redConf[data.t]) this.redConf[data.t] = 0;
            if (cc.isNode(this.ui)) {
                if (data.t == this.chatType) {
                    this.chatType != 7 && this.setChatTable();
                    if (this.chatType == 7) {
                        if (this.selectUid == data.uid || this.selectUid == data.touid) {
                            this.classifyData(data);
                            this.setPrivateTable();
                        } else {
                            this.getPrivateHeadData(null, function () {
                                me.setPrivateHeadTable();
                            });
                            if (data.uid != P.gud.uid) {
                                if (!this.privateRed[data.uid]) this.privateRed[data.uid] = 0;
                                this.privateRed[data.uid]++;
                            }
                        }
                    }
                } else {
                    this.redConf[data.t]++;
                    if (data.t == 7) {
                        this.privateRed[data.uid]++;
                    }
                }
            } else {
                this.redConf[data.t]++;
            }
            this.checkRedPoint();
        },



        showFight: function (richText) {
            var me = this;
            var data = richText.data;

            me.ajax("chat_watch", [data.fightlog], function (str, data) {
                if (data.s == 1) {
                    data.d.pvType = 'video';
                    G.frame.fight.demo(data.d);
                }
            });
        },
        showWZTT: function (richText) {
            var me = this;
            var data = richText.data;

            me.ajax("ladder_watch", [data.fightlog], function (str, data) {
                if (data.s == 1) {
                    var fight = data.d.data;
                    if (fight.length == 1) {
                        fight[0].pvType = "wztt_one";
                        G.frame.fight.demo(fight[0]);
                    } else {
                        data.d.fightres = data.d.data;
                        G.frame.fight.data({
                            pvType: 'wztt_three',
                            session: 0,
                            fightlength: fight.length,
                            fightData: data.d,
                            callback: function (session) {
                                G.frame.fight.demo(fight[session]);
                            }
                        }).demo(fight[0]);
                    }
                }
            });
        },
        showHeroInfo: function (richText) {
            var data = richText.data;
            var sendData = richText.data.sendData;
            if (sendData.pid) {
                return G.frame.sc_xq.data({
                    t: sendData.pid,
                    lv: sendData.lv
                }).show();
            }
            if (data.t == 4) {
                G.frame.yingxiong_jianjie.data({
                    data: sendData
                }).show();
            } else {
                this.ajax("user_army_details", [sendData.uid, sendData.tid], function (str, dd) {
                    if (dd.s == 1) {
                        G.frame.yingxiong_jianjie.data({
                            data: dd.d
                        }).show();
                    }
                });
            }
        },
        getChatStr: function (data) {
            var me = this;
            if (data.sendType) {
                var conf = data.sendData.pid ? G.class.pet(data.sendData, true) : G.class.shero(data.sendData);
                var str = '<font color=' + G.gc.COLOR[data.sendData.color || conf.conf.color || 1]
                    + ' onclick=G.frame.chat.showHeroInfo(this)>[' + conf.conf.name + ']</font>';
                if (data.sendData.pid) {
                    return [X.STR(L('CHAT_SHOW_PET'), str)];
                }
                return data.t == 4 ?
                    [X.STR(L('KF_SHOW_ITEM'), str, data.sendData.lv, data.sendData.zhanli)]
                    : [X.STR(L('LT_SHOW_ITEM'), str, data.sendData.lv, data.sendData.zhanli)];
            } else if (data.syzc) {
                if(data.syzc.isask){
                    var obj = {};
                    obj.pindao = data.t;
                    obj.data = data.syzc
                    return [X.STR(L('syzc_103'), JSON.stringify(obj))]
                }else{
                    return [X.STR(L('syzc_104'), data.syzc.name,data.syzc.type)]
                }
            }
            else if (data.fightlog) {
                if (data.mode) return [X.STR(L("fight_video_wztt"), data.mode == 1 ? L("DD") : L("SD"))];
                return [X.STR(L("fight_video"), data.toname)];
            } else if (data.t == 1) {
                return [data.ghid == P.gud.ghid ? data.m : data.m + "<br><font node=1></font>"];
            } else {
                var faces = [];
                var faces_words = [];
                var msg = data.m || data.content || '';

                msg = msg.replace(/\[([\w\W]*?)\]/g, function (word) {
                    var _word = word.replace(/[\[\]]/g, '');
                    if (X.inArray(me.face, _word)) {
                        faces_words.push(_word);
                        return X.STR('<font node={1}></font>', faces_words.length);
                    } else {
                        return word;
                    }
                });
                faces.push(msg);
                if (faces_words.length > 0) {
                    for (var i = 0; i < faces_words.length; i++) {
                        var img = new ccui.ImageView('img/chat/img_bq' + faces_words[i] + '.png', 1);
                        faces.push(img);
                    }
                }
                return faces;
            }
        },
        isFaceStr: function (str) {
            if (str.match(/\[([\w\W]*?)\]/g) != null) {
                return str.replace(/[\[\]]/g, '');
            }
            return null;
        },
        getChatStrColor: function (data) {
            if (data.uid == 'SYSTEM') return "#be1b1a";
            if (data.isyang) return "#258e2f";
            if (data.chatborder && data.chatborder != 1) return {
                2: "#f5ff37",
                3: "#fff000",
                4: "#ff2e1d",
                5: "#ffb400",
            }[data.chatborder];
            if(data.syzc) return "#804326"
            if (data.vip && data.vip >= 7) return "#eb3a3a";
            return "#804326";
        },
        getChatStrBgImg: function (data) {
            if (data.chatborder) {
                var conf = G.gc.zaoxing.chatborder[data.chatborder];
                if (!conf) return "img/chat/wz_bg_chat.png";
                return "img/chat/" + conf.img;
            }
            return "img/chat/wz_bg_chat.png";
        }
    };

    cc.mixin(G.frame.chat, func);
})();