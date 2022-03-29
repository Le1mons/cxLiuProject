(function () {

    //日期更迭时刷新主界面UI
    // G.event.on('dayChange', function (d) {
    //     if (!d) return;

    //     if (cc.sys.isObjectValid(G.frame.world.ui)) {
    //         G.frame.world.map.getOtherPlayers();
    //     }

    //     if (cc.sys.isObjectValid(G.frame.world_lmjs_tk.ui)) {
    //         G.frame.world_lmjs_tk.refreshData();
    //     }
    // });

    G.class.mainMenu = X.bView.extend({
        ctor: function () {
            var me = this;

            me.showWithHistory = [];
            me._super('mainmenu.json');
            G.view.mainMenu = me;
            G.event.on('uiChange', me.uiChange, me);

            //跳转时，有几率出现被异常隐藏的情况，先暂时去掉
            G.view.mainView.event.on('visiableChangeByFullScreen', me.checkAutoVisiable, me);
        },
        checkAutoVisiable: function () {
            //跟随mainView的显隐状态
            //cc.log('mainMenu checkAutoVisiable', this._bind2Frameid, G.view.mainView.isVisible());
            if (this.frameID == 'main' && cc.isNode(G.view.mainView) && G.view.mainView.isVisible() == false) {
                this.hide();
            } else {
                this.show();
            }
        },
        uiChange: function (data) {
            if (data.frameid == 'loading') return;
            //按zindex排序后，找到第一个有needshowMainMenu属性的bui
            var openedFrames = X.uiMana.getOpenFrameOrderByZindex();
            var _bind2;
            for (var i = 0; i < openedFrames.length; i++) {
                var _fid = openedFrames[i].frameid;
                if (G.frame[_fid] && G.frame[_fid].needshowMainMenu) {
                    _bind2 = openedFrames[i];
                    break;
                }
            }

            //如果找到，则放置于该bui上一层，否则重置回默认值
            var _bind2id;
            if (_bind2) {
                this.zIndex = _bind2.zIndex + 1;
                _bind2id = _bind2.frameid;
            } else {
                this.zIndex = G.gc.zIndex.mainmenu;
                _bind2id = "main";
            }

            if (this._bind2Frameid != _bind2id) {
                //如果有变化，则触发事件
                this.showWith && this.showWith(_bind2id);
            }
            this._bind2Frameid = _bind2id;
        },
        delShowWithHistory: function (id) {
            var me = this;

            var idx = X.arrayFind(me.showWithHistory, id);
            if (idx != -1) {
                me.showWithHistory.splice(idx, 1);
            }
        },
        getLastShowWith: function () {
            //获取最后一个被要求显示的frame
            var me = this;

            if (me.showWithHistory.length > 0) {
                return me.showWithHistory.pop();
            } else {
                return null;
            }
        },
        showWith: function (frameid) {
            var me = this;
            cc.log('mainMenu showWith', frameid);

            //被frame要求显示
            this.frameID = frameid;

            //维护显示历史
            me.delShowWithHistory(this.frameID);
            me.showWithHistory.push(this.frameID);
        },
        showMainCity: function () {
            var me = this;
            G.frame.fight.visible(false);
            // G.frame.world.visible(false);
            if (!G.class.mainView.isTop) G.class.mainView.visible(true);
            // X.hideAllFrame({singleGroup:"f2"});
            // X.hideAllFrame({singleGroup:"f3"});
            // X.hideAllFrame({singleGroup:"f4"});

            G.frame.tanxian_zdbg.hide();
            G.frame.gonggao.hide();
        },
        bindBTN: function () {
            var me = this;
            if (X.keysOfObject(me.nodes).length == 0) return;

            function isHave() {
                var isHave = false;
                var redPointData = X.clone(G.DATA.hongdian);
                delete redPointData.tanxian;
                delete redPointData.gonghui;
                delete redPointData.worship;
                delete redPointData.guajitime;
                for (var i in redPointData) {
                    var is = redPointData[i];
                    if (cc.isArray(is)) {
                        if (is.length > 0) {
                            isHave = true;
                            break;
                        }
                    } else if(cc.isObject(is)){
                        for (var j in is) {
                            if (is[j] > 0) {
                                isHave = true;
                                break;
                            }
                        }
                    } else {
                        if (is > 0) {
                            isHave = true;
                            break;
                        }
                    }
                }
                if (isHave) {
                    G.setNewIcoImg(me.nodes.btn_haoyou);
                    me.nodes.btn_haoyou.getChildByName("redPoint").y -= 5;
                } else {
                    G.removeNewIco(me.nodes.btn_haoyou);
                }
            }

            me.checkRedPoint = function(val) {
                if (val) {
                    G.hongdian.getData(val, 1, function () {
                        isHave();
                        switch (val) {
                            case "tanxian":
                                G.removeNewIco(me.nodes.btn_tanxian);
                                break;
                            case "gonghui":
                                G.removeNewIco(me.nodes.btn_gonghui);
                                break;
                        }
                    })
                } else {
                    isHave();
                }
            };

            var btn_arr = ["btn_beibao", "btn_yingxiong", "btn_tanxian", "btn_haoyou", "btn_gonghui"];
            var ani_arr = ["ani_ui_beibao", "ani_ui_yingxiong", "ani_ui_tanxian", "ani_ui_zhucheng", "ani_ui_gonghui"];
            var act_arr = [];
            for (var i = 0; i < btn_arr.length; i++) {
                me.nodes[btn_arr[i]].setTouchEnabled(true);
                me.nodes[btn_arr[i]].setPositionY(me.nodes[btn_arr[i]].height / 2 + 10);

                if(G.tiShenIng){
                    var _img = new ccui.ImageView();
                    _img.loadTexture("img/main2/"+ ani_arr[i] + ".png");
                    me.nodes[btn_arr[i]].addChild(_img);
                    _img.x = _img.y = 50;
                }else{
                    G.class.ani.show({
                        addTo: me.nodes[btn_arr[i]],
                        json: ani_arr[i],
                        y: 10,
                        repeat: false,
                        autoRemove: false,
                        onload: function (node, action) {
                            if (i == 3) {
                                action.play('xuanzhong', true);
                            } else {
                                action.play('changtai', true)
                            }
                            act_arr.push(action);
                        }
                    });
                }
            }


            // var xuanzhong = function (n) {
            //     for (var i = 0; i < btn_arr.length; i++) {
            //         if (i == n) {
            //             act_arr[i].play('xuanzhong', true);
            //         } else {
            //             act_arr[i].play('changtai', true);
            //         }
            //     }
            // };

            me.set_fhzc = function (n) {
                if(G.tiShenIng)return;
                for (var i = 0; i < btn_arr.length; i++) {
                    if (i == n) {
                        act_arr[i].play('xuanzhong', true);
                    } else {
                        act_arr[i].play('changtai', true);
                    }
                }
            };
            // 背包
            me.nodes.btn_beibao.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.set_fhzc(0);
                    if (G.frame.beibao.isTop) return;
                    G.frame.beibao.once('show', function () {
                        X.uiMana.closeAllFrame(true, function (frame) {
                            if (frame.ID() == 'beibao') {
                                return false;
                            }
                        });
                    }).show();
                    me.checkRedPoint();
                    me.checkGonghuiRed();
                }
            });

            // 英雄
            me.nodes.btn_yingxiong.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.set_fhzc(1);
                    if (G.frame.yingxiong.isTop) return;
                    G.frame.yingxiong.once('show', function () {
                        X.uiMana.closeAllFrame(true, function (frame) {
                            if (frame.ID() == 'yingxiong') {
                                return false;
                            }
                        });
                    }).show();
                    me.checkRedPoint();
                    me.checkGonghuiRed();
                }
            });
            //探险
            me.nodes.btn_tanxian.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.set_fhzc(2);
                    if (G.frame.tanxian.isTop) return;
                    G.frame.tanxian.once('show', function () {
                        X.uiMana.closeAllFrame(true, function (frame) {
                            if (frame.ID() == 'tanxian') {
                                return false;
                            }
                        });
                    }).show();
                    me.checkRedPoint("tanxian");
                    me.checkGonghuiRed();
                }
            });
            // 好友
            // me.nodes.btn_haoyou.click(function () {
            //     if (G.frame.friend.isTop) return;
            //     G.frame.friend.show();
            //     f();
            // });

            //回城
            me.nodes.btn_haoyou.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.set_fhzc(3);
                    X.uiMana.closeAllFrame();
                    G.removeNewIco(sender);
                    me.checkGonghuiRed();
                }
            });
            //公会
            me.nodes.btn_gonghui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var openType = 'gonghui';
                    if (G.frame.gonghui_main.isTop) return;
                    if (!G.class.opencond.getIsOpenById(openType)) {
                        G.tip_NB.show(G.class.opencond.getTipById(openType));
                        return;
                    }
                    me.set_fhzc(4);
                    if (!P.gud.ghid) {
                        G.ajax.send('gonghui_getlist', [1], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                if (!d.d.applylist) d.d.applylist = [];
                                d.d[1] = d.d.list;

                                G.frame.gonghui_main.once('show', function () {
                                    X.uiMana.closeAllFrame(true, function (frame) {
                                        if (frame.ID() == 'gonghui_main') {
                                            return false;
                                        }
                                    });
                                }).checkShow(d.d);
                            }
                        }, true);
                    } else {
                        G.frame.gonghui_main.once('show', function () {
                            X.uiMana.closeAllFrame(true, function (frame) {
                                if (frame.ID() == 'gonghui_main') {
                                    return false;
                                }
                            });
                        }).checkShow();
                    }
                    me.checkRedPoint("gonghui");
                }
            });
        },
        showMessage: function (d) {
            var me = this;
            var item = G.frame.liaotian.createItem(d);
            if (cc.isNode(me.nodes.panel_wz)) {
                me.nodes.panel_wz.removeAllChildren();
                item.y = -20;
                me.nodes.panel_wz.addChild(item);
            }
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();

            me.zIndex = G.gc.zIndex.mainmenu;
            // G.event.on('new_main_liaotian', function (d) {
            //     me.showMessage(d);
            // })
        },
        onShow: function () {
            var me = this;
            me.checkGonghuiRed();

            if(G.tiShenIng){
                me.finds('bg_down').hide();
            }
        },
        onRemove: function () {
            var me = this;
            delete G.view.mainMenu;
            G.event.removeListener('uiChange', me.uiChange);
        },
        checkGonghuiRed: function () {
            var me = this;
            if (!P.gud.ghid && P.gud.lv >= G.class.opencond.getLvById("gonghui")) {
                G.setNewIcoImg(me.nodes.btn_gonghui);
                me.nodes.btn_gonghui.getChildByName("redPoint").y -= 5;
            }
        }
    });

})();