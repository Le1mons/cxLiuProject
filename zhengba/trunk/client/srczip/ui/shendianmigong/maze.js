/**
 * Created by LYF on 2019/7/30.
 */
(function () {
    //神殿迷宫
    var ID = 'maze';

    var fun = X.bUi.extend({
        inType: {
            left: ["middle", "left"],
            right: ["middle", "right"],
            middle: ["middle", "left", "right"]
        },
        inter: 15,
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);

            me.nodes.listview.setItemsMargin(-35 + me.inter);

            if (G.owner == 'wwceshi' || !cc.sys.isNative) {
                me.nodes.btn_cz.show();
            } else {
                me.nodes.btn_cz.hide();
            }
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_nszl.click(function () {

                G.frame.goddess.show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L("TS43")
                }).show();
            });

            me.nodes.btn_yx.click(function () {

                G.frame.maze_herolist.show();
            });

            me.nodes.btn_yw.click(function () {
                var relic = me.DATA.data.relic;
                if (!relic || Object.keys(relic).length < 1) return G.tip_NB.show(L("ZW") + L("HUODE") + L("RHYW"));
                G.frame.relic.show();
            });

            me.ui.finds("btn_bx").setTouchEnabled(true);
            me.ui.finds("btn_bx").click(function () {
                // G.frame.shop.data({type: "11", name: "xysd"}).show();
                G.frame.shopmain.data('11').show();
            });

            me.nodes.btn_lcb.click(function () {

                G.frame.maze_lcb.show();
            });

            me.nodes.btn_cz.click(function () {

                me.ajax("maze_prepare", [], function (str, data) {
                    if (data.s == 1) {
                        me.getData(function () {
                            me.onShow();
                        });
                    }
                });
            });

            me.nodes.btn_sd.click(function (sender) {
          
                G.frame.maze_sd.show();
            })
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            G.class.ani.show({
                json: "ani_shendianmigong_qizhi",
                addTo: me.ui,
                autoRemove: false,
                onload: function (node, action) {
                    me.flag = node;
                    me.flagAni = action;
                    node.hide();
                    action.gotoFrameAndPause(0);
                }
            });

            G.class.ani.show({
                json: "ani_shendianmigong_bg",
                addTo: me.nodes.panel_bgdh,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            connectApi("maze_open", [], function (data) {
                me.DATA = data;
                me.DATA.data.total = me.DATA.data.total || {};
                me.DATA.data.reclist = me.DATA.data.reclist || [];
                callback && callback();
            }, function (data) {
                me.DATA = data.d || {};
                X.cacheByUid("pvmaze", {});//清空上轮活动的站位缓存
                me.once("show", function () {
                    G.frame.maze_open.show();
                });
                callback && callback();
            });
        },
        show: function () {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.flag && me.flag.hide();
            me.setViewInfo();
            me.checkSaoDang();
            me.setContents();
            me.setCountdown();
            me.checkRedPoint();
            me.nodes.list.hide();
            G.guidevent.emit("sdmgShowOver");
        },
        saodang: function (key, key1) {
            var me = this;
            me.ajax("maze_saodang", [key, key1], function (str, data) {
                if (data.s == 1) {
                    me.nodes.btn_sd.hide()
                    if (data.d.prize) {

                        G.frame.jiangli.once("close", function () {
                            me.checkSaoDang()

                            me.getData(function () {
                                me.onShow();
                            });
                        }).data({
                            prize: data.d.prize
                        }).show();
                    } else {
                        me.checkSaoDang()

                        me.getData(function () {
                            me.onShow();
                        });
                    }

                }
            });
        },
        checkSaoDang: function () {
            var me = this;
            if (me.DATA.herolist && me.DATA.herolist.length > 0) {
                G.frame.maze_chooseHero.show();
                return
            }
            if (me.DATA.relicprizelist && me.DATA.relicprizelist.length > 0) {
                G.frame.maze_chooseyw.show();
                return
            }
            if (me.DATA.shoplist && me.DATA.shoplist.length > 0) {
                G.frame.maze_chooseshop.show();
                return
            }
        },
        getSaoDang: function (key, val, callback) {
            var me = this;
            me.ajax("maze_getsaodang", [key, val], function (str, data) {
                if (data.s == 1) {

                    me.getData(function () {

                        me.checkSaoDang()
                    })
                    callback && callback(data.d ? data.d.prize : null)
                }
            });
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.fashita.maze == 2) {
                G.setNewIcoImg(me.nodes.btn_lcb);
            } else {
                G.removeNewIco(me.nodes.btn_lcb);
            }
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("fashita", 1, function () {
                G.frame.julongshendian.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;

            me.grid = {};
            me.creatGrid();
            me.nodes.btn_sd.setVisible(me.DATA.data
                && me.DATA.data.total && me.DATA.data.total[3] && me.DATA.data.total[3] >= 10
                && me.DATA.data.step < 3 && (!me.DATA.data.trace[11] || me.DATA.data.trace[11].finish == 0))
        },
        setViewInfo: function () {//背景和标题文字
            var me = this;

            X.render({
                txt_mgcs: (me.DATA.data ? me.DATA.data.step : 1) + L("CENG"),
                bg_fst: "img/bg/img_sdmg_bg" + (me.DATA.data ? me.DATA.data.step : 1) + ".jpg"
            }, me.nodes);

            if (!me.DATA.data) return;

            if (me.DATA.data.step > 2) {
                G.class.ani.show({
                    json: "ani_shendianmigong_bg3",
                    addTo: me.nodes.panel_bgdh1,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {

                    }
                });
            }
            if (me.DATA.data.reclist.length == Object.keys(G.gc.mazecom.base.landmark).length) me.nodes.btn_lcb.hide();
        },
        setCountdown: function () {//倒计时
            var me = this;

            X.timeout(me.nodes.txt_sjdjs, me.DATA.cd, function () {
                if (G.frame.fight.isShow) {
                    G.frame.fight.once("hide", function () {
                        G.DATA.noClick = false;
                        X.uiMana.closeAllFrame();
                    });
                } else {
                    G.DATA.noClick = false;
                    X.uiMana.closeAllFrame();
                }
            });
        },
        creatGrid: function () {//创建格子
            var me = this;
            if (!me.DATA.data) return;

            var mazeList = JSON.parse(JSON.stringify(me.DATA.data.maze));
            mazeList[1] = [{}];

            var keys = Object.keys(mazeList);
            keys.sort(function (a, b) {
                return a * 1 > b * 1 ? -1 : 1;
            });

            me.nodes.listview.removeAllChildren();
            me.gridFlag = undefined;
            me.lastNode = undefined;
            me.curNode = undefined;

            var destination = me.descendants = new ccui.Layout();
            destination.setContentSize(me.nodes.panel_list1.width, 300);
            me.nodes.listview.pushBackCustomItem(destination);
            me.initDestination(function () {
                for (var i = 0; i < keys.length; i++) {
                    me.initGrid(keys[i], mazeList[keys[i]]);
                }
                me.setAllGridState();
                me.ui.setTimeout(function () {
                    if (me.getCurAt() * 1 < 5) {
                        me.nodes.listview.jumpToIdx(me.getListChildrenIdx(), {
                            type: "vertical"
                        });
                    }
                }, 50);
            });
        },
        getListChildrenIdx: function () {
            var me = this;
            var curStep = me.getCurAt();

            for (var i = 0; i < me.nodes.listview.children.length; i++) {
                if (me.nodes.listview.children[i].name == "grid" + curStep) return i;
            }

            return 5;
        },
        initDestination: function (callback) {//添加终点宝箱、传送门节点
            var me = this;
            var parent = me.descendants;
            parent.removeAllChildren();

            me.portal = [];
            var max = Object.keys(G.gc.maze).length;
            if (me.DATA.data.step != max) {
                for (var i = 0; i < me.DATA.data.step; i++) {
                    (function (index) {
                        var nestStep = me.DATA.data.step + 1;
                        var needOpenConf = G.gc.mazecom.base.maze[nestStep][index].cond;
                        var needNum = Object.keys(needOpenConf).length < 1 ? 0 : needOpenConf.num;
                        var curHaveNum = me.DATA.data.total[nestStep] || 0;
                        var portal = new ccui.ImageView("img/shendianmigong/img_sdmg_csm" + index + ".png", 1);
                        portal.opacity = 0;
                        G.class.ani.show({
                            json: index == 1 ? "ani_shendianmigong_chuansongmen_zi" : "ani_shendianmigong_chuansongmen_cheng",
                            addTo: portal,
                            x: portal.width / 2,
                            y: portal.height / 2,
                            autoRemove: false,
                            onload: function (node, action) {
                                portal.ani = action;
                                action.play(curHaveNum < needNum ? "wait2" : "wait", true);
                            }
                        });
                        portal.setAnchorPoint(0.5, 0.5);
                        me.portal.push(portal);
                        portal.setTouchEnabled(true);
                        portal.click(function (sender) {
                            if (curHaveNum < needNum) return G.tip_NB.show(X.STR(L("MAZE_TZNEED"), needNum));
                            me.csm = sender;
                            G.frame.maze_portal.data(index).show();
                        });
                    })(i + 1);
                }
            } else {
                var over = new ccui.ImageView("img/shendianmigong/img_sdmg_qizi2.png", 1);
                over.opacity = 0;
                over.setAnchorPoint(0.5, 0.5);
                G.class.ani.show({
                    json: "ani_shendianmigong_gongxitongguan",
                    addTo: over,
                    x: over.width / 2,
                    y: over.height / 2,
                    autoRemove: false,
                    onload: function (node, action) {
                        action.play("wait", true);
                    }
                });
                me.portal.push(over);
            }
            X.center(me.portal, parent, {
                noRemove: true
            });

            X.addBoxAni({
                parent: parent,
                boximg: "img/shendianmigong/img_sdmg_box.png",
                callback: function (node) {
                    me.prizeBox = node;
                    var clickBox = me.clickBox = node.finds("baoxiang");
                    clickBox.setTouchEnabled(true);
                    clickBox.click(function () {
                        if (!me.checkIsOver()) return G.tip_NB.show(L("MAZEWFLQ"));
                        if (me.DATA.data.relicprize && me.DATA.data.relicprize.length > 0) return G.tip_NB.show(L("DQHYYWWXQ"));
                        me.ajax("maze_receive", [], function (str, data) {
                            if (data.s == 1) {
                                if (data.d.prize) {
                                    G.event.emit('sdkevent', {
                                        event: 'shendian_lingjiang',
                                        data: {
                                            lingjiangType: "神殿迷宫",
                                            sd_boxNum: me.DATA.data.step,
                                            get: data.d.prize
                                        }
                                    });
                                    G.frame.jiangli.data({
                                        prize: data.d.prize
                                    }).show();
                                }
                                me.DATA.data.receive = 1;
                                me.setDestinationState();
                            }
                        });
                    });
                    callback && callback();
                }
            });
        },
        setDestinationState: function () {//刷新当前层数的进度状态
            var me = this;

            for (var i in me.portal) me.portal[i].hide();
            if (me.checkIsOver()) {
                if (me.DATA.data.receive) {
                    me.prizeBox.hide();
                    for (var i in me.portal) me.portal[i].show();
                } else {
                    G.class.ani.show({
                        json: "ani_shendianmigong_shouzhi",
                        addTo: me.clickBox,
                        x: me.clickBox.width / 2,
                        y: me.clickBox.height / 2,
                        repeat: true,
                        autoRemove: false,
                    });
                    me.prizeBox.show();
                }
            } else {
                me.prizeBox.show();
            }
        },
        checkIsOver: function () {
            var me = this;
            var data = me.DATA.data;

            var isOver = true;
            for (var step in data.trace) {
                if (!data.trace[step].finish) {
                    isOver = false;
                    break;
                }
            }

            return isOver && Object.keys(data.trace).length == Object.keys(data.maze).length;
        },
        initGrid: function (step, stepData) {
            var me = this;
            var gridArr = [];
            var panel = me.nodes.panel_list1.clone();
            panel.setName("grid" + step);

            me.grid[step] = {};
            for (var i = 0; i < stepData.length; i++) {
                var grid = me.grid[step][i] = G.class.mazeGrid(me.nodes.list.clone(), stepData[i], step, i, me);
                gridArr.push(grid);
            }
            me.setGridsPosition(gridArr, panel);
            me.nodes.listview.pushBackCustomItem(panel);
        },
        setGridsPosition: function (gridArr, panel) {//由于格子个数是固定2~3个 所以写死坐标
            var me = this;
            if (gridArr.length == 1) {
                gridArr[0].type = "middle";
                gridArr[0].setAnchorPoint(0.5, 0.5);
                gridArr[0].setPosition(panel.width / 2, panel.height / 2);
            } else if (gridArr.length == 2) {
                gridArr[0].type = "left";
                gridArr[1].type = "right";
                gridArr[0].setAnchorPoint(1, 0.5);
                gridArr[0].setPosition(panel.width / 2 - me.inter, panel.height / 2);
                gridArr[1].setAnchorPoint(0, 0.5);
                gridArr[1].setPosition(panel.width / 2 + me.inter, panel.height / 2);
            } else {
                gridArr[0].type = "left";
                gridArr[1].type = "middle";
                gridArr[2].type = "right";
                gridArr[0].setAnchorPoint(1, 0.5);
                gridArr[0].setPosition(panel.width / 2 - gridArr[1].width / 2 - me.inter, panel.height / 2);
                gridArr[1].setAnchorPoint(0.5, 0.5);
                gridArr[1].setPosition(panel.width / 2, panel.height / 2);
                gridArr[2].setAnchorPoint(0, 0.5);
                gridArr[2].setPosition(panel.width / 2 + gridArr[1].width / 2 + me.inter, panel.height / 2);
            }

            for (var i = 0; i < gridArr.length; i++) {
                panel.addChild(gridArr[i]);
            }
        },
        addRemoveAni: function (grid) {
            grid.showEventNode.hide();
            for (var i = 0; i < grid.children.length; i++) {
                grid.children[i].hide && grid.children[i].hide();
            }

            G.class.ani.show({
                json: "ani_shendianmigong_taizi",
                addTo: grid,
                x: grid.width / 2,
                y: 20,
                onend: function () {
                    grid.hide();
                }
            });
        },
        setAllGridState: function (isAni) {//刷新所有格子状态
            var me = this;
            var data = me.DATA.data.trace;
            var curAtStep = me.getCurAt();
            var curAtStepIndex = data[curAtStep].idx;

            for (var step in data) {
                var stepData = data[step];
                var stepGrids = me.grid[step];

                for (var gridIndex in stepGrids) {
                    var grid = stepGrids[gridIndex];
                    if (grid.index != stepData.idx) {

                        grid.over = true;
                        if (step == curAtStep && isAni && grid.visible) {
                            me.addRemoveAni(grid)
                        } else {
                            grid.hide();
                        }
                    } else {
                        if (step == curAtStep) {
                            grid.nodes.bg.setBackGroundImage("img/shendianmigong/img_tz_xiao_m" + me.DATA.data.step + ".png", 1);
                            G.class.ani.show({
                                json: "ani_shendianmigong_qizhi",
                                addTo: grid.nodes.bg,
                                y: 218,
                                cache: true,
                                autoRemove: false,
                                onload: function (node, action) {
                                    if (me.gridFlag) me.gridFlag.removeFromParent();
                                    node.hide();
                                    me.gridFlag = node;
                                    action.play("wait", true);
                                }
                            });

                            if (!me.curNode) {
                                if (!me.lastNode) me.lastNode = grid;
                                else me.curNode = grid;
                            } else {
                                me.lastNode = me.curNode;
                                me.curNode = grid;
                            }
                        } else {
                            grid.nodes.bg.setBackGroundImage("img/shendianmigong/img_tz_xiao_a" + me.DATA.data.step + ".png", 1);
                        }

                        if (stepData.finish) {//如果选择了此格子并且完成了该格子的事件则隐藏除背景外的所有子节点
                            grid.finish = true;
                            for (var len in grid.children) {
                                if (grid.children[len].name != "bg$") grid.children[len].hide();
                            }
                        }
                    }
                }
            }


            var maxStep = Object.keys(me.DATA.data.maze).length;
            for (var step in me.grid) {
                for (var gridIndex in me.grid[step]) {
                    var grid = me.grid[step][gridIndex];
                    me.addArrowAni(grid, me.getIsClick(step, gridIndex));//给接下来能点击的格子加箭头动画

                    if (step * 1 > curAtStep * 1 + 2 && step * 1 < maxStep - 1) {
                        if (X.inArray([2, 3], grid.event)) {
                            grid.showEventNode.hide();
                            grid.noClick = true;
                        } else {
                            grid.noClick = false;
                        }
                    } else {
                        grid.noClick = false;
                        if (!grid.finish) {
                            if (!grid.over) {
                                grid.showEventNode && grid.showEventNode.show();
                            }
                        }
                    }
                }
            }

            if (me.DATA.data.relicprize && me.DATA.data.relicprize.length > 0) {//加遗物宝箱
                var curGrid = me.grid[curAtStep][curAtStepIndex];
                X.addBoxAni({
                    parent: curGrid,
                    pos: cc.p(103, 29),
                    boximg: "img/shendianmigong/img_sdmg_box_x1.png",
                    callback: function (node) {
                        me.boxNode = node;
                        node.y += 47;
                        var box = node.finds("baoxiang");
                        box.setTouchEnabled(true);
                        box.click(function () {
                            G.frame.maze_change.show();
                        });
                        me.ui.setTimeout(function () {
                            box.triggerTouch(ccui.Widget.TOUCH_ENDED);
                        }, 500);
                    }
                });
            }

            me.setDestinationState();
            me.ui.setTimeout(function () {
                me.setFlagPos();
            }, 700);
        },
        setFlagPos: function () {
            var me = this;
            if (!me.lastNode || !me.curNode || me.lastNode == me.curNode) {
                return me.gridFlag.show && me.gridFlag.show();
            }

            var pos1 = me.lastNode.convertToWorldSpace();
            var correction1 = cc.p(pos1.x + 80, pos1.y + 130);
            var pos2 = me.curNode.convertToWorldSpace();
            var correction2 = cc.p(pos2.x + 80, pos2.y + 130);

            me.flag.setPosition(correction1);
            me.flag.show();

            me.flagAni.play("in", false);
            me.flag.runActions([
                cc.moveTo(0.3, correction2),
                cc.callFunc(function () {
                    me.flag.hide();
                    me.flagAni.gotoFrameAndPause(0);
                    me.gridFlag.show && me.gridFlag.show();
                })
            ]);
        },
        getCurAt: function () {//获取我当前在哪一行格子
            var me = this;
            var overArr = [];
            var data = me.DATA.data.trace;

            for (var i in data) if (data[i].finish) overArr.push(i);

            overArr.sort(function (a, b) { return a * 1 > b * 1 ? -1 : 1; });

            return overArr[0];
        },
        getCurAtGrid: function () {
            var me = this;
            var curAt = me.getCurAt();

            return me.grid[curAt][me.DATA.data.trace[curAt].idx];
        },
        getIsClick: function (step, index) {//检测此格子是否在当前所处格子的可选区域 step:哪一层 index:该层的格子下标
            var me = this;
            var data = me.DATA.data.trace;
            var curAtStep = me.getCurAt();
            var curAtStepIndex = data[curAtStep].idx;
            var curType = me.getGridType(curAtStep, curAtStepIndex);
            var theyType = me.getGridType(step, index);

            if (step == curAtStep * 1 + 1 && X.inArray(me.inType[curType], theyType)) return true;

            return false;
        },
        getGridType: function (step, index) {//获取格子的type
            var me = this;

            return me.grid[step][index].type;
        },
        addArrowAni: function (grid, isShow) {//加箭头动画
            var me = this;
            if (isShow) {
                grid.nodes.bg.setBackGroundImage("img/shendianmigong/img_tz_xiao_m" + me.DATA.data.step + ".png", 1);
                if (cc.isNode(grid.arrow)) return;
                var arrow = grid.arrow = new ccui.ImageView("img/shendianmigong/img_sdmg_jiantou.png", 1);
                arrow.setAnchorPoint(0.5, 0);
                arrow.setPosition(grid.width / 2, grid.height / 2 + 50);
                grid.addChild(arrow);
                arrow.runAction(cc.sequence(cc.moveBy(0.5, 0, 5), cc.moveBy(1, 0, -10), cc.moveBy(0.5, 0, 5)).repeatForever());
            } else {
                cc.isNode(grid.arrow) && grid.arrow.removeFromParent();
                if (!grid.finish) grid.nodes.bg.setBackGroundImage("img/shendianmigong/img_tz_xiao_a" + me.DATA.data.step + ".png", 1);
            }
        },
        mazeChange: function (args, callback, isFight) {//触发格子事件接口
            var me = this;

            me.ajax("maze_chess", args, function (str, data) {
                if (data.s == 1) {
                    me.getData(function () {
                        if (isFight) {
                            G.frame.fight.once("hide", function () {
                                me.setAllGridState(true);
                            })
                        } else {
                            me.setAllGridState(true);
                        }
                    });
                    callback && callback(data.d);
                    if (data.d && data.d.fightres && data.d.fightres.winside == 0) {
                        G.event.emit('sdkevent', {
                            event: 'shendian_migong',
                            data: {
                                sdmg_maxsection: me.DATA.data.step,
                            }
                        });
                    }
                } else {
                    X.uiMana.closeAllFrame();
                }
            });
        },
        initEventUi: function (isClick, that) {//设置事件窗口的事件按钮显隐

            if (isClick) {
                that.nodes.btn_qw && that.nodes.btn_qw.show();
                that.nodes.img_zwkq && that.nodes.img_zwkq.hide();
            } else {
                that.nodes.btn_qw && that.nodes.btn_qw.hide();
                that.nodes.img_zwkq && that.nodes.img_zwkq.show();
            }
        }
    });
    G.frame[ID] = new fun('julongshendian_sdmg.json', ID);

    G.class.mazeGrid = function (ui, data, step, index, from) {//设置单个格子
        ui.show();
        ui.data = data;
        ui.step = step;
        ui.index = index;
        ui.event = data.event;
        ui.from = from;

        X.autoInitUI(ui);
        X.render({
            bg: function (node) {
                node.setBackGroundImage("img/shendianmigong/img_tz_xiao_a" + from.DATA.data.step + ".png", 1);
            }
        }, ui.nodes);

        if (ui.nodes["panel_zt" + data.event]) {
            ui.nodes["panel_zt" + data.event].show();
            ui.showEventNode = ui.nodes["panel_zt" + data.event];
        }

        if (data.zhanli) {
            if (ui.showEventNode.finds("panel_zdld$")) {
                ui.showEventNode.finds("panel_zdld$").show();
                ui.showEventNode.finds("panel_zdld$").children[2].setString(data.zhanli);
            }
            if (ui.showEventNode.finds("panel_zdld1$")) {
                ui.showEventNode.finds("panel_zdld1$").show();
                ui.showEventNode.finds("panel_zdld1$").children[2].setString(data.zhanli);
            }
            if (ui.showEventNode.finds("panel_zdld2$")) {
                ui.showEventNode.finds("panel_zdld2$").show();
                ui.showEventNode.finds("panel_zdld2$").children[2].setString(data.zhanli);
            }
        }

        ui.nodes.panel_dj.touch(function (sender, type) {
            if (type == ccui.Widget.TOUCH_NOMOVE) {
                //完成了有遗物的事件但是遗物没有被领取需要领取完遗物才能点击下一个事件
                if (ui.noClick) return;
                if (from.DATA.data.relicprize && from.DATA.data.relicprize.length > 0) return G.tip_NB.show(L("DQHYYWWXQ"));

                G.frame["maze_state" + data.event] && G.frame["maze_state" + data.event].data({
                    gridData: data,
                    step: step,
                    index: index,
                    isClick: from.getIsClick(step, index),
                }).show();
            }
        });

        ui.setTimeout(function () {
            ui.runAction(cc.sequence(cc.moveBy(1, 0, 2), cc.moveBy(2, 0, -4), cc.moveBy(1, 0, 2)).repeatForever());
        }, X.rand(100, 2000));

        switch (data.event) {
            case "3":
                ui.nodes.img_jyg.opacity = 0;
                G.class.ani.show({
                    json: "ani_shendianmigong_xiaobing2",
                    addTo: ui.nodes.img_jyg,
                    repeat: true,
                    autoRemove: false,
                });
                break;
            case "4":
                ui.nodes.img_mw.finds("Image_8").hide();
                G.class.ani.show({
                    json: "ani_shendianmigong_boss",
                    addTo: ui.nodes.img_mw,
                    repeat: true,
                    autoRemove: false,
                });
                break;
            case "5":
                ui.nodes.img_yingdi.finds("Image_8").hide();
                G.class.ani.show({
                    json: "ani_shendianmigong_zhangpeng",
                    addTo: ui.nodes.img_yingdi,
                    repeat: true,
                    autoRemove: false,
                });
                break;
            case "6":
                ui.nodes.panel_zt6.finds("Image_8").hide();
                G.class.ani.show({
                    json: "ani_shendianmigong_chizi",
                    addTo: ui.nodes.panel_zt6.finds("img_lhql$"),
                    repeat: true,
                    autoRemove: false,
                });
                break;
            case "9":
                ui.nodes.img_dongxue.finds("Image_8").hide();
                G.class.ani.show({
                    json: "ani_shendianmigong_dongku",
                    addTo: ui.nodes.img_dongxue,
                    repeat: true,
                    autoRemove: false,
                });
                break;
            case "7":
                ui.nodes.panel_zt7.finds("Image_8").hide();
                X.setHeroModel({
                    parent: ui.nodes.panel_zt7.finds("img_lhql$"),
                    data: {},
                    model: "13045"
                });
                break;
            case "8":
                ui.nodes.panel_zt8.finds("Image_8").hide();
                X.setHeroModel({
                    parent: ui.nodes.panel_zt8.finds("img_lhql$"),
                    data: {},
                    model: "dijing_1"
                });
                break;
        }

        return ui;
    };
})();