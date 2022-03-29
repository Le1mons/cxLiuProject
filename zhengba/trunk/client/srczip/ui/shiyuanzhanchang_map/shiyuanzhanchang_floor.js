/**
 * Created by
 */
(function () {
    //
    var ID = 'shiyuanzhanchang_floor';

    G.event.on('itemchange_over', function (data) {
        var keys = X.keysOfObject(data);
        for (var i in keys) {
            if (data[keys[i]].itemid == 2093) {
                if (G.frame.shiyuanzhanchang_floor.isShow) {
                    G.frame.shiyuanzhanchang_floor.setTop();
                }
            }
        }
    });
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes = ['shiyuanzhanchang.plist', 'shiyuanzhanchang.png', 'shiyuanzhanchang1.plist', 'shiyuanzhanchang1.png'];
            me._super(json, id, { action: true });
        },
        floorInfo: function (floor) {
            var me = this;
            if (!cc.isNode(me.ui)) return;
            me.nodes.panel_di.removeAllChildren();
            var conf = G.gc.syzcmapinfo[floor];
            me.nodes.txet_tittle.setString(conf.name);
            var mapconf = {
                id: floor,
                mapconf: G.gc[conf.map],
                name: conf.name,
                tileJsonFile: conf.guanka,
            };
            me.map = new G.class.shiyuanzhanchang_map(mapconf, function () {
                me.bgAninode && me.bgAninode.action.play('out', false);
                X.setLockLayer(G.frame.shiyuanzhanchang_floor.nodes.ui,false);
            });
            // me.map.setClippingEnabled(false);
            me.map.zIndex = 1000;
            me.nodes.panel_di.setContentSize(cc.director.getWinSize());
            // me.map.setPositionY(200);
            me.nodes.panel_di.addChild(me.map);
            ccui.helper.doLayout(me.nodes.panel_di);
        },
        bindUI: function () {
            var me = this;
            if (!cc.isNode(me.ui)) return;
            var huitui = G.gc.syzccom.huituicengshu;
            G.DAO.shiyuanzhanchang.getServerData(function () {
                if (G.DATA.shiyuanzhanchang.isstart == 0 && G.DATA.shiyuanzhanchang.isstart != undefined) {
                    X.cacheByUid("syzcJumpfight",1);
                    X.cacheByUid('mydzid','');
                    if (G.DATA.shiyuanzhanchang.layer <= Math.abs(huitui[1])) {
                        G.frame.shiyuanzhanchang_xzyx.data({
                            layer: 0
                        }).show();
                    } else {
                        G.frame.shiyuanzhanchang_xzcs.data({
                            cs: G.DATA.shiyuanzhanchang.layer,
                            callback: function (cs) {
                                G.frame.shiyuanzhanchang_xzyx.data({
                                    layer: cs
                                }).show();
                            }
                        }).show();
                    }

                } else {
                    me.createDz();
                    me.floorInfo(G.DATA.shiyuanzhanchang.layer);
                    me.checkWeiTuo();

                }
                me.setContents();
            }, me);
            me.ui.setTimeout(function () {
                if (!G.DATA.shiyuanzhanchang){
                    me.bgAninode && me.bgAninode.action.play('out', false);
                }
            },5000);
        },
        onOpen: function () {
            var me = this;
            G.DATA.syzcHeroState = false;//说明都还活着
            me.currerentT = 1;
            me.nodes.btn_fh.click(function () {
                me.remove();
                G.DATA.isFight = false;
            });
        },
        onShow: function () {
            var me = this;
            if (!cc.isNode(me.ui)) return;
            G.class.ani.show({
                json: "ani_shiyuanzczhuanchang_dh",
                addTo: me.nodes.ui,
                z: 100,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    me.bgAninode = node;
                    action.playWithCallback('in', false, function () {
                        action.play('wait', true);
                        me.bindUI();
                    })
                }
            });
        },
        setContents: function () {
            var me = this;
            me.setTop();
            me.setBottom();
            me.setRed();
            G.class.ani.show({
                json: "shiyuan_cjry_dx",
                addTo: me.nodes.bg,
                repeat: true,
                autoRemove: false,
            });
        },
        setRed: function () {
            var me = this;
            var conf = G.gc.syzccom.layerprize;
            var layer1 = G.DATA.shiyuanzhanchang.layernum;
            var got1 = G.DATA.shiyuanzhanchang.layerrec;
            G.removeNewIco(me.nodes.btn_jl);
            for (var i = 0; i < conf.length; i++) {
                if (layer1 >= conf[i].pval && !X.inArray(got1, i)) {
                    G.setNewIcoImg(me.nodes.btn_jl, 0.9)
                    return

                }
            }
            var layer2 = G.DATA.shiyuanzhanchang.toplayer
            var got2 = G.DATA.shiyuanzhanchang.toplayerrec
            var conf1 = G.gc.syzccom.toplayerprize;
            for (var i = 0; i < conf1.length; i++) {
                if (layer2 >= conf1[i].pval && !X.inArray(got2, i)) {
                    G.setNewIcoImg(me.nodes.btn_jl, 0.9)
                    return
                }
            }
            if (X.inArray(G.DATA.hongdian.stagefund,'syzc')){
                G.setNewIcoImg(me.nodes.btn_bj, 0.9);
            }else {
                G.removeNewIco(me.nodes.btn_bj, 0.9);
            }
        },
        setTop: function () {
            var me = this;
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr: L("TS110")
                }).show();
            });
            //奖励
            me.nodes.btn_jl.click(function () {
                G.frame.syzc_jl.once("close", function () {
                    G.hongdian.getData('syzc',1,function () {
                        G.frame.yijiexuanwo.refreshRedPoint();
                    });
                    me.setRed();
                }).show()
            });
            //补给
            me.nodes.btn_bj.click(function () {
                G.frame.huodong.once('willClose',function () {
                    me.setRed();
                    G.frame.yijiexuanwo.refreshRedPoint();
                }).data({
                    type: 0,
                    stype: 20
                }).show();
            });
            var myown = G.class.getOwnNum('2093', 'item');
            me.nodes.txt_jb.setString(myown);
            me.ui.finds('token_jb').loadTexture(G.class.getItemIco('2093'), 1);
            me.nodes.btn_jia1.hide();
        },
        setBottom: function () {
            var me = this;
            //队伍
            me.nodes.btn_dw.click(function () {
                G.frame.syzc_group.show()

            });
            me.nodes.panel_fh.hide();
            me.nodes.panel_fh.setTouchEnabled(true);
            me.nodes.panel_fh.click(function (sender) {
                me.nodes.panel_fh.hide();
            });
            //药品
            me.nodes.btn_yp.click(function () {
                if (me.getAllherostate()) {
                    return G.tip_NB.show(L('syzc_26'));
                }
                me.setyaopin();
            });
            //战斗日志
            me.nodes.btn_rz.click(function () {
                G.frame.syzc_rz.show()
            });

            //定位,回到当前位置
            me.nodes.btn_db.click(function () {
                var idx = me.map.myRole.getStandGrid();
                var pos = me.map.indexToPosition(idx);
                me.map.moveCameraToPos(pos);
            });
            //道具
            me.nodes.btn_dj.click(function () {
                if (me.getAllherostate()) {
                    return G.tip_NB.show(L('syzc_27'));
                }
                me.showdaoju()
            });
            me.nodes.panel_yp.hide();
            me.nodes.panel_yp.setTouchEnabled(true);
            me.nodes.panel_yp.click(function (sender) {
                me.nodes.panel_yp.hide();
            });
            var zero = X.getLastMondayZeroTime() + 24 * 3600 * 7;
            if (me._timer) {
                delete me._timer;
                me.nodes.txet_sj.clearTimeout(me._timer);
            }
            me._timer = X.timeout(me.nodes.txet_sj, zero, function () {
                me.remove();
            },null,{showDay:true});

            var checkbox = me.nodes.img_gou;
            checkbox.setVisible(X.cacheByUid("syzcJumpfight") == 1);
            me.nodes.img_kuang.setTouchEnabled(true);
            me.nodes.img_kuang.click(function (sender, type) {
                if (checkbox.visible) {
                    //勾选状态
                    checkbox.hide();
                    X.cacheByUid("syzcJumpfight", 0);
                } else {
                    checkbox.show();
                    X.cacheByUid("syzcJumpfight", 1);
                }
            });
        },
        setyaopin: function () {
            var me = this;
            if (me.yaopinview) {
                me.nodes.shiyuanzhanchang_fh.show()
                me.nodes.panel_fh.show();
                me.yaopinlist()
            } else {
                me.nodes.panel_fh.show();
                me.nodes.shiyuanzhanchang_fh.show();
                new X.bView('shiyuanzhanchang_fh.json', function (view) {
                    me.yaopinview = view;
                    me.nodes.shiyuanzhanchang_fh.addChild(view);
                    me.yaopinlist()
                });
            }
        },
        yaopinlist: function () {
            var me = this;
            me.yaopinview.nodes.ui.setTouchEnabled(false);
            var checkbox = me.yaopinview.nodes.img_gou;
            var cache = X.cacheByUid("syzcuse");
            checkbox.setVisible(cache);
            me.yaopinview.nodes.img_kuang.setTouchEnabled(true);
            me.yaopinview.nodes.img_kuang.click(function (sender) {
                if (checkbox.visible) {
                    //勾选状态
                    checkbox.hide();
                    X.cacheByUid("syzcuse", false);
                } else {
                    checkbox.show();
                    X.cacheByUid("syzcuse", true);
                }
            });

            var list = JSON.parse(JSON.stringify(G.gc.syzccom.useinfo));
            var arr = [];
            for (var k in list) {
                list[k].id = k
                arr.push(list[k])
            }
            me.yaopinview.nodes.panel_up.hide();
            me.yaopinview.nodes.scrollview.setDirection(0);
            me.yaopinview.nodes.scrollview.removeAllChildren();
            var table = me.yaopintable = new X.TableView(me.yaopinview.nodes.scrollview, me.yaopinview.nodes.list_wp, 1, function (ui, data) {
                me.setItemyp(ui, data)
            }, me.yaopinview.nodes.list_wp.getSize(), null, 0, 0);
            table.setData(arr);
            table.reloadDataWithScroll(true);
        },
        setItemyp: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var prize = { a: "item", "t": data.need[0].t, n: G.frame.beibao.getItemNumByTypeid(data.need[0].t) || 0 };
            var item = G.class.sitem(prize);
            item.setPosition(ui.nodes.panel_wp.width / 2, ui.nodes.panel_wp.height / 2 + 7);
            item.setScale(.95);
            ui.nodes.panel_wp.removeAllChildren();
            ui.nodes.panel_wp.addChild(item);
            ui.nodes.panel_zz.setVisible(prize.n<1);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var n = G.frame.beibao.getItemNumByTypeid(data.need[0].t) || 0;
                    var cache = X.cacheByUid("syzcuse");
                    if (cache) {
                        me.useyaopin(data.id)
                    } else {
                        G.frame.syzc_use.data({
                            data: data,
                            callback: function (id) {
                                if (n < 1) {
                                    G.tip_NB.show(L("syzc_99"))
                                    return
                                }
                                G.frame.syzc_use.remove();
                                me.useyaopin(id)
                            },
                        }).show()
                    }
                }
            }, null, {"touchDelay": 1000});
        },
        checkWeiTuo: function () {
            var me = this;
            var key = [7, 8, 9, 10];
            var data = G.DATA.shiyuanzhanchang.eventdata;

            var arr = [];
            key.forEach(function (idx) {
                if (data[idx]) {
                    for (var k in data[idx]) {
                        if (X.isHavItem(data[idx][k]) && !X.inArray(G.DATA.shiyuanzhanchang.finishgzid,k)) {

                            var node = me.setWeiTuo(data[idx][k], idx)
                            arr.push(node)
                        }
                    }
                }
            });
            me.nodes.panel_wt.removeAllChildren();
            X.verticalcenter(me.nodes.panel_wt, arr, {
                itemHeight: me.nodes.list_wt.height + 5,
            })

        },
        setWeiTuo: function (data, event) {
            var me = this;
            var node = me.nodes.list_wt.clone();
            node.show();
            X.autoInitUI(node);
            var conf = G.gc.syzccom.eventinfo[event];
            node.nodes.txt_xz.setString(conf.biaoti);
            if (G.time < data.endtime) {
                X.timeout(node.nodes.txt_sj2, data.endtime, function () {
                    G.DAO.shiyuanzhanchang.getServerData(function () {
                        me.checkWeiTuo();
                    }, me)
                });
            } else {
                node.nodes.panel_zt.show()
                if (X.inArray(G.DATA.shiyuanzhanchang.finishgzid, data.targetid)) {
                } else {
                    node.nodes.panel_zt.setBackGroundImage("img/shiyuanzhanchang/img_sb.png", 1)

                }
            }
            return node
        },
        useyaopin: function (id) {
            var me = this;
            var fun = function (data, callback) {
                me.ajax("syzc_use", data, function (str, data) {
                    if (data.s == 1) {
                        G.DATA.shiyuanzhanchang = data.d.mydata;
                        me.nodes.panel_fh.hide();
                        callback && callback(data);
                    }
                });
            };
            switch (id * 1) {
                case 1:
                    var state = me.getTheteamState(me.currerentT);
                    if (state.nowhp>=state.maxhp){
                        return G.tip_NB.show(L('syzc_33'));
                    }
                    var oldhp = state.nowhp;
                    fun([id, me.getteamid(me.curTeam)], function () {
                        // 加血的动效  todo
                        var newhp = me.getTheteamState(me.currerentT).nowhp;
                        me.map.myRole.role.zhiliaoani(function () {
                            me.createDz();
                            me.map.myRole.role.hmpChange(newhp - oldhp);
                        });
                    });
                    break;
                case 2:
                    var allteam = G.gc.syzccom.duizhang;
                    // var arr = [];
                    // for (var k in allteam) {
                    //     if (me.getTheteamState(k).isdead) {
                    //         arr.push(k);
                    //     }
                    // };
                    // if (arr.length == 0) {
                    //     G.tip_NB.show(L("syzc_102"));
                    // } 
                    // else if (arr.length == 1) {
                    //     fun([id, arr[0]])
                    // } 
                    // else 
                    // {
                    me.yaopinview.nodes.panel_up.show();
                    for (var i in allteam) {
                        var node = me.yaopinview.nodes["panel_dw" + i];
                        node.removeAllChildren();
                        var clnode = me.yaopinview.nodes.list_dw.clone();
                        node.addChild(clnode);
                        clnode.show();
                        X.autoInitUI(clnode);
                        clnode.setPosition(node.width / 2, node.height);
                        var img = new ccui.ImageView('ico/itemico/' + allteam[i] + 'y.png', 0);
                        clnode.nodes.panel_k.addChild(img);
                        img.setPosition(clnode.nodes.panel_k.width / 2, clnode.nodes.panel_k.height / 2)
                        var herodata = G.DATA.shiyuanzhanchang.herodata[parseInt(i) - 1];
                        var zbnum = 0;
                        herodata.forEach(function name(item, idx) {
                            if (item.hp <= 0) {
                                zbnum++
                            }
                        });
                        X.enableOutline(clnode.nodes.txet_zb,'#ffffff',2);
                        clnode.nodes.panel_zz.setVisible(zbnum >= herodata.length);
                        clnode.nodes.panel_ico.setBackGroundImage("img/shiyuanzhanchang/ico_dw" + i + ".png", 1)
                        var rh = X.setRichText({
                            parent: clnode.nodes.txt_zb,
                            color: "#480f00",
                            str: X.STR(L('syzc_101'), zbnum)
                        });
                        clnode.isdead = me.getTheteamState(i).isdead;
                        clnode.id = i;
                        clnode.setTouchEnabled(true);
                        clnode.click(function (sender) {
                            if (!sender.isdead) return G.tip_NB.show(L("syzc_102"));
                            fun([2, sender.id*1-1], function () {
                                // 复活的动效  todo
                                G.class.ani.show({
                                    json: "ani_shiyuanzcfuhuo_dh",
                                    addTo: cc.director.getRunningScene(),
                                    x: 320,
                                    y: 568,
                                    repeat: false,
                                    autoRemove: true,
                                    onend: function (node) {
                                        me.createDz();
                                    }
                                });
                            })
                        })
                        // }

                    }
                    break;
                case 3:
                    //毒药  todo
                    var playstart = me.map.indexToPosition(G.DATA.shiyuanzhanchang.nowgzid);
                    var grids = me.map.getGroundBossScope(playstart);
                    if (grids.length > 0) {
                        fun([3, grids], function (data) {
                            // 毒杀的动效  todo
                            for (var k = 0; k < grids.length; k++) {
                                (function (idx) {
                                    var gzid = grids[idx];
                                    var pos = me.map.indexToPosition(gzid);
                                    var concent = me.map.mapContent.getChildByName(pos.gy+'_'+pos.gx);
                                    if (cc.isNode(concent) && concent.gridContent && cc.isNode(concent.gridContent.getChildren()[0])){
                                        G.class.ani.show({
                                            json: "ani_shiyuanzczhongdu_dh",
                                            addTo: concent.gridContent.getChildren()[0],
                                            repeat: false,
                                            autoRemove: false,
                                            cache:true,
                                            onend: function (node) {
                                                cc.log('111');
                                                if (data.d.prize && data.d.prize.length>0){
                                                    G.frame.jiangli.data({
                                                        prize: data.d.prize
                                                    }).show();
                                                }
                                                if (concent.data.conf.typeid == '3'){
                                                    var BOSSGRIDARR  = G.frame.shiyuanzhanchang_map.getBossGrid();
                                                    for (var m=0;m< BOSSGRIDARR.length;m++){
                                                        me.map.refreshGrids( BOSSGRIDARR[m] );
                                                    }
                                                }
                                                me.map.refreshGrids( gzid );
                                            }
                                        });
                                    }
                                })(k);
                            }
                        })
                    } else {
                        G.tip_NB.show(L('syzc_14'));
                    }
                    break;
                case 4:
                    if (G.DATA.shiyuanzhanchang.miwu == 1) {
                        return G.tip_NB.show(L('syzc_31'));
                    }
                    fun([4, 1], function () {
                        G.class.ani.show({
                            json: "ani_shiyuanzcyinyan_dh",
                            addTo: cc.director.getRunningScene(),
                            x: 320,
                            y: 568,
                            repeat: false,
                            autoRemove: true,
                            onend: function (node) {
                                me.map.clearAllfog();
                                G.tip_NB.show(L('syzc_30'));
                            }
                        });
                    });
                    break;

                default:
                    break;
            }
        },
        showdaoju: function () {
            var me = this;
            if (me.daojuview) {
                me.nodes.shiyuanzhanchang_yp.show();
                me.nodes.panel_yp.show();
                me.daujulist()
            } else {
                me.nodes.panel_yp.show();
                me.nodes.shiyuanzhanchang_yp.show();
                new X.bView('shiyuanzhanchang_yp.json', function (view) {
                    me.daojuview = view;
                    me.nodes.shiyuanzhanchang_yp.addChild(view);
                    me.daujulist();
                });
            }
        },
        daujulist: function () {
            var me = this;
            var list = G.gc.syzccom.daoju;
            list.sort(function (a,b) {
                var mya = G.class.getOwnNum(a,'item');
                var myb = G.class.getOwnNum(b,'item');
                if (mya!=myb){
                    return mya-myb>0?-1:1;
                }else {
                    return a - b>0?1:-1;
                }
            });
            me.daojuview.nodes.scrollview.removeAllChildren();
            var table = me.daojutable = new X.TableView(me.daojuview.nodes.scrollview, me.daojuview.nodes.list_wp, 5, function (ui, data) {
                me.setItemdj(ui, data);
            }, null, null, -5, 0);
            table.setData(list);
            table.reloadDataWithScroll(true);
        },
        getteamid: function (hid) {
            var me = this;
            var duizhang = G.gc.syzccom.duizhang;
            for (var k in duizhang) {
                if (duizhang[k] == hid) {
                    return k*1-1;
                }
            }
        },
        setItemdj: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            // var _data = G.frame.beibao.DATA.item;
            var prize = { a: "item", "t": data + "", n: G.frame.beibao.getItemNumByTypeid(data) || 0 };

            var item = G.class.sitem(prize);
            item.setPosition(ui.nodes.panel_wp.width / 2, ui.nodes.panel_wp.height / 2);
            G.frame.iteminfo.showItemInfo(item);
            ui.nodes.panel_wp.removeAllChildren();
            var myown = G.class.getOwnNum(data, 'item');
            ui.nodes.panel_zz.setVisible(myown < 1);
            ui.nodes.panel_wp.addChild(item);
        },
        createDz: function () {
            var me = this;
            var duizhang = G.gc.syzccom.duizhang;
            var dz = X.cacheByUid('mydzid');
            if (!dz) {
                dz = duizhang[1];
                me.curTeam = duizhang[1];
                me.currerentT = 1;
                X.cacheByUid('mydzid', duizhang[1]);
            }
            for (var i = 1; i <= 3; i++) {
                me.nodes['panel_dw' + i].removeAllChildren();
                var list = me.nodes.list_dw.clone();
                X.autoInitUI(list);
                X.enableOutline(list.nodes.txet_zb,'#ffffff',2);
                list.show();
                list.setAnchorPoint(0, 0);
                list.setPosition(0, 0);
                list.nodes.panel_k.setTouchEnabled(false);
                list.nodes.panel_k.removeBackGroundImage();
                list.nodes.panel_k.setBackGroundImage('ico/itemico/' + duizhang[i] + 'y.png', 0);
                list.ID = duizhang[i];
                if (list.ID == dz) {
                    me.curTeam = duizhang[i];
                    me.currerentT = i;
                }
                me.nodes['panel_dw' + i].setTouchEnabled(false);
                var state = me.getTheteamState(i);
                if (state.isdead) {
                    list.nodes.panel_zz1.show();
                    list.nodes.jdt2.show();
                    list.nodes.jdt2.setPercent(100);
                    list.nodes.jdt1.hide();
                } else {
                    list.nodes.panel_zz1.hide();
                    list.nodes.jdt1.show();
                    list.nodes.jdt1.setPercent(state.hps);
                    list.nodes.jdt2.hide();
                }
                if (dz == duizhang[i] && !state.isdead) {
                    me.oldselect = list;
                    list.nodes.img_xz.show();
                }
                list.idx = i;
                list.isdead = state.isdead;
                list.setTouchEnabled(!state.isdead);
                list.click(function (sender, type) {
                    if (G.DATA.isFight) return G.tip_NB.show(L('syzc_38'));
                    if (me.oldselect && me.oldselect.ID == sender.ID) return;
                    sender.nodes.img_xz.show();
                    if (me.oldselect) {
                        me.oldselect.nodes.img_xz.hide();
                    }
                    me.curTeam = sender.ID;
                    me.oldselect = sender;
                    me.currerentT = sender.idx;
                    me.setDuizhang(sender.ID);
                });
                me.nodes['panel_dw' + i].addChild(list);
            }
        },
        cheackDz: function () {
            var me = this;
            var dz = X.cacheByUid('mydzid');
            me.oldselect = undefined;
            delete me.oldselect;
          var nodearr = [];
          var curNode;
            for (var i = 1; i <= 3; i++) {
                var parent = me.nodes['panel_dw' + i];
                var child = parent.getChildren()[0];
                if (cc.isNode(child) && !child.isdead) {
                    nodearr.push(child);
                }
            }
            if (nodearr.length < 1) {
                //全死了。在原位置放一个死亡的小人
                G.frame.shiyuanzhanchang_tip.data({
                    title: L('syzc_24'),
                    intr: L('syzc_25')
                }).show();
                    me.map.myRole.role.setHeroNowState();
                return;
            } else {
                for (var i in nodearr) {
                    if (nodearr[i].ID == dz) {
                        curNode = nodearr[i];
                        break;
                    }
                }
            }
            if (!cc.isNode(curNode)){
                nodearr[0].triggerTouch(2);
            }
        },
        getAllherostate: function () {
            var me = this;
            var siwang = true;
            for (var i = 1; i <= 3; i++) {
                var state = me.getTheteamState(i);
                if (!state.isdead) {
                    siwang = false;
                    break;
                }
            }
            return siwang;
        },
        getTheteamState: function (team) {
            var me = this;
            var herodata = G.DATA.shiyuanzhanchang.herodata[team - 1];
            var state = {
                hps: 0,
                isdead: true
            };
            var nowhp = 0;
            var maxhp = 0;
            var isdead = true;
            for (var i = 0; i < herodata.length; i++) {
                if (herodata[i].hp > 0) isdead = false;
                nowhp += herodata[i].hp;
                maxhp += herodata[i].maxhp;
            }
            state.hps = nowhp / maxhp * 100;
            state.isdead = isdead;
            state.nowhp = nowhp;
            state.maxhp = maxhp;
            return state;
        },
        getTheEnemyState: function (team) {
            var me = this;
            var herodata = team;
            var state = {
                hps: 0,
                isdead: true
            };
            var nowhp = 0;
            var maxhp = 0;
            var isdead = true;
            for (var i = 0; i < herodata.length; i++) {
                if (herodata[i].hp > 0) isdead = false;
                nowhp += herodata[i].hp;
                maxhp += herodata[i].maxhp;
            }
            state.hps = nowhp / maxhp * 100;
            state.isdead = isdead;
            state.nowhp = nowhp;
            state.maxhp = maxhp;
            return state;
        },
        refreshHpJdt:function(hp){
          var me = this;
          var dw =  me.currerentT;
          var parent = me.nodes['panel_dw' + dw];
          var state = me.getTheteamState(dw);
            var child = parent.getChildren()[0];
           var jd = parseInt(state.nowhp-hp)/parseInt(state.maxhp)*100;
            child.nodes.jdt2.setPercent(jd);
        },
        setDuizhang: function (hid) {
            var me = this;
            X.cacheByUid('mydzid', hid);
            me.map.myRole.changeData(true, hid);
        },
        getTheFightDps:function(data){
          var me = this;
          var leftArr = [];
          var getvalue = function (d,effect) {
              var sign = data.signdata;
              var value = 0;
              for (var i = 0; i < d.length; i++) {
                  var id = d[i].role;
                  value += sign[id][effect];
              }
              return value;
          }
            for (var id in data.roles) {
                var rData = data.roles[id];
                if(id.split("_")[0] != "role") continue;
                rData.role = id;
                if (rData.side == 0) {
                    leftArr.push(rData);
                }
            }
            var addhp = getvalue(leftArr,'addhp');
            var dps =   getvalue(leftArr,'dps');
            return Math.abs(dps - addhp);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('shiyuanzhanchang.json', ID);
})();