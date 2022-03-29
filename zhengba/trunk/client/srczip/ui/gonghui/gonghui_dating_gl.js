/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-大厅-管理
    G.class.gonghui_dating_gl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('gonghui_tip1_gl.json');
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBTN: function () {
            var me = this;

            // 招募
            me.nodes.btn_zm.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.edit.data({
                        type:1,
                        title:L('ZHAOMU'),
                        info:L('ZHAOMU_INFO'),
                        // need:[{a:'attr',t:'rmbmoney',n:100}],
                        callback: function (data) {
                            if (cc.sys.isNative && G.frame.chat.isFaceStr(data)) {
                                data = text.split('[').join('');
                                data = text.split(']').join('');
                            }
                            G.ajax.send('chat_send',[data,1,'','','',''],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('FASONG') + L('SUCCESS'));
                                    G.frame.edit.remove();
                                }
                            },true);
                        }
                    }).show();
                }
            });

            // 公告
            me.nodes.btn_yj.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.edit.data({
                        type:1,
                        title:L('GONGGAO'),
                        info:L('XGGG'),
                        placeholder:G.frame.gonghui_main.DATA.ghdata.notice || L('ZHAOMU_CONTENT'),
                        callback: function (data) {
                            var obj = {
                                joinlv: G.frame.gonghui_main.DATA.ghdata.joinlv,
                                notice: data,
                                flag: G.frame.gonghui_main.DATA.ghdata.flag
                            };
                            G.ajax.send('gonghui_changedata',[obj],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                    G.frame.edit.remove();
                                    G.frame.gonghui_main.getData(function () {
                                        G.frame.gonghui_dating.emit('updateInfo');
                                    });
                                }
                            },true);
                        }
                    }).show();
                }
            });
            // 设置
            me.nodes.btn_sz.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (P.gud.ghpower !== 0) {
                        G.tip_NB.show(L('GONGHUI_ONLY_HZ'));
                        return;
                    }
                    
                    G.frame.gonghui_dating_ghsz.show();
                }
            });

            me.nodes.btn_js.click(function (sender, type) {
                if (P.gud.ghpower !== 0) {
                    G.tip_NB.show(L('GONGHUI_ONLY_HZ'));
                    return;
                }
                G.frame.alert.data({
                    title: L("TISHI"),
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send('gonghui_disband', [], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                X.uiMana.closeAllFrame();
                            }
                        }, true);
                    },
                    richText: L("TSJSGH"),
                }).show();
                
            }, 1000);
        },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();

            G.frame.gonghui_dating.onnp('updateInfo', function (d) {
                if(G.frame.gonghui_dating.curType == me._type){
                    me.refreshPanel();
                }else{
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.frame.gonghui_dating.getMemberData(function () {
                callback && callback();
            });
        },
        setContents: function () {
            var me = this;

            me.setPeoples();
        },
        setPeoples: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            scrollview.removeAllChildren();

            var data = G.frame.gonghui_dating.DATA.userlist;

            data = G.frame.gonghui_main.sortData(data);

            var table = me.table = new X.TableView(scrollview,me.nodes.list_lb,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,8);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            X.render({
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                    wid.setTouchEnabled(true);
                    wid.data = data;
                    wid.click(function (sender, type) {
                        if (P.gud.uid == sender.data.headdata.uid) {
                            return;
                        }

                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.headdata.uid,
                            btnsCall: function (node) {
                                G.frame.wanjiaxinxi.setDefaultBtns(false);

                                var btnsArr = [];
                                var power = sender.data.power;
                                var myPower = P.gud.ghpower;
                                var obj = {
                                    0:{
                                        1:['btn_rmhz','btn_jwcy','btn_qlgh'],
                                        3:['btn_rmhz','btn_swgy','btn_qlgh'],
                                    },
                                    1:{
                                        3:['btn_qlgh']
                                    }
                                };

                                btnsArr = [].concat(obj[myPower] && obj[myPower][power] || []);
                                for (var i = 0; i < btnsArr.length; i++) {
                                    var btnName = btnsArr[i];
                                    var btn = node.nodes[btnName];
                                    btn.show();
                                    btn.data = sender.data;
                                }

                                //任命会长
                                node.nodes.btn_rmhz.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {
                                        var power = 0;
                                        var str = X.STR(L('GONGHUI_RENMING_X'),sender.data.headdata.name,L('GONGHUI_POWER_' + power));
                                        G.frame.alert.data({
                                            sizeType:3,
                                            cancelCall:null,
                                            okCall: function () {
                                                me.changePower(sender.data.uid,power);
                                            },
                                            richText:str
                                        }).show();
                                    }
                                });
                                // 将为成员
                                node.nodes.btn_jwcy.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {
                                        me.changePower(sender.data.uid,3);
                                    }
                                });
                                // 升为官员
                                node.nodes.btn_swgy.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {
                                        me.changePower(sender.data.uid,1);
                                    }
                                });
                                // 清理公会
                                node.nodes.btn_qlgh.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {

                                        var str = X.STR(L('GONGHUI_QINGLI_X'),sender.data.headdata.name);
                                        G.frame.alert.data({
                                            sizeType:3,
                                            cancelCall:null,
                                            okCall: function () {
                                                G.ajax.send('gonghui_kick',[sender.data.uid],function(d) {
                                                    if(!d) return;
                                                    var d = JSON.parse(d);
                                                    if(d.s == 1) {
                                                        G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                                        G.frame.gonghui_main.getData(function () {
                                                            G.frame.gonghui_dating.emit('updateInfo');
                                                        });
                                                        if (G.frame.wanjiaxinxi.isShow) {
                                                            G.frame.wanjiaxinxi.remove();
                                                        }
                                                        try{
                                                            var _data = G.frame.gonghui_main.DATA.ghdata;
                                                            G.event.emit("leguXevent", {
                                                                type: 'track',
                                                                event: "quit_guild",
                                                                data: {
                                                                    guild_id: sender.data.uid,
                                                                    guild_name: _data.name,
                                                                    guild_level: _data.lv,
                                                                    guild_people_num: _data.usernum,
                                                                    guild_fighting_capacity: 0,
                                                                    guild_create_time: _data.ctime
                                                                    //这里填写excel里对应事件所需记录的数据
                                                                }
                                                            });
                                                        }catch(e){
                                                            cc.error(e);
                                                        }
                                                    }
                                                },true);
                                            },
                                            richText:str
                                        }).show();
                                    }
                                });
                            }
                        }).checkShow();
                    })
                },
                txt_player_name:data.headdata.name,
                txt_player_class:L('GONGHUI_POWER_' + data.power),
                txt_online_time: function (node) {
                    var interval = 60;

                    if (data.hearttime + interval > G.time) {
                        node.setString(L('ZAIXIAN'));
                    } else {
                        node.setString(X.moment(data.hearttime - G.time));
                    }
                },
                txt_lsgxwz: L("LSGX"),
                txt_ligx: data.sungongxian
            },ui.nodes);

            ui.data = data;
        },
        changePower: function () {
            var me = this;

            var uid = arguments[0];
            var power = arguments[1];

            G.ajax.send('gonghui_renzhi',[uid,power],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    G.tip_NB.show(L('RENMING') + L('SUCCESS'));
                    G.frame.gonghui_main.getData(function () {
                        G.frame.gonghui_dating.emit('updateInfo');
                    });
                    if (G.frame.wanjiaxinxi.isShow) {
                        G.frame.wanjiaxinxi.remove();
                    }
                }
            },true);
        }
    });

})();