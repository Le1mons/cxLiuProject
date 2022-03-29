/**
 * Created by wfq on 2018/6/5.
 */
(function () {
    //英雄-开战选择
    G.class.yingxiong_kaizhan = X.bView.extend({
        extConf:{
            maxnum:6,
            fight:{
                pvdafashita: function (node) {
                    //需要是有站位信息的出站数据
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    G.ajax.send("fashita_fight", [type.data,data], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvdafashita';
                            G.frame.dafashita_tiaozhan.remove();

                            if(!d.d.fightres.winside){
                                G.frame.dafashita.DATA.layernum ++;
                            }
                            X.cacheByUid('fight_fashita',data);

                            if(d.d.israndom) {
                                G.frame.yingxiong_fight.remove();
                                G.class.ani.show({
                                    json: "ani_taopao",
                                    addTo: G.frame.dafashita.ui,
                                    x: G.frame.dafashita.ui.width / 2,
                                    y: G.frame.dafashita.ui.height / 2,
                                    repeat: false,
                                    autoRemove: true,
                                    onend: function () {
                                        G.frame.fight_win.data(d.d).show();
                                        G.tip_NB.show(L("ZJSL"));
                                    }
                                });
                            }else {
                                G.frame.fight.data({
                                    prize:d.d.prize,
                                    pvid:type.data
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                }).demo(d.d.fightres);
                            }
                        }
                    }, true);
                },
                pvshilian: function (node) {
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    G.ajax.send("mrsl_fight", [type.data.type, type.data.nandu, data, type.data.npc], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvshilian';

                            X.cacheByUid('fight_ready', data);
                            G.frame.fight.data({
                                prize: d.d.prize,
                                type1: "pvshilian",
                                type: type.data.type,
                                nandu: type.data.nandu,
                                data: data,
                                npc: type.data.npc
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);

                            G.hongdian.getData("mrsl", 1, function () {
                                G.frame.meirishilian.checkRedPoint();
                            });
                            G.frame.meirishilian.nodes.text_sycs.setString(d.d.lessnum);
                        }
                    });
                },
                pvguanqia: function (node) {
                    // var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    G.ajax.send('tanxian_fightboss',[data],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvguanqia';
                            G.frame.tanxian.refreshData();
                            X.cacheByUid('fight_tanxian',data);
                            if(d.d.israndom && P.gud.maxmapid > 5) {
                                G.frame.yingxiong_fight.remove();
                                G.class.ani.show({
                                    json: "ani_taopao",
                                    addTo: G.frame.tanxian.ui,
                                    x: G.frame.tanxian.ui.width / 2,
                                    y: G.frame.tanxian.ui.height / 2,
                                    repeat: false,
                                    autoRemove: true,
                                    onend: function () {
                                        G.frame.fight_win.data({
                                            prize: d.d.prize
                                        }).show();
                                        G.tip_NB.show(L("ZJSL"));
                                    }
                                });
                            }else {
                                G.frame.fight.data({
                                    prize:d.d.prize,
                                    pvType: "pvguanqia"
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                }).demo(d.d.fightres);
                            }
                        }
                    },true);
                },
                pvshizijun: function (node) {
                    var type = G.frame.yingxiong_fight.data();
                    var data = node.getSelectedData();

                    G.ajax.send("shizijun_fight", [data, type.idx], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            //增加战斗类型
                            d.d.fightres['pvType'] = 'pvshizijun';

                            X.cacheByUid('fight_shizijun',data);
                            G.frame.fight.data({
                                prize:d.d.prize,
                                pvid:type.idx
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                                G.frame.sizijunyuanzheng_dsxx.remove();
                            }).demo(d.d.fightres);

                            G.frame.shizijunyuanzheng.getData(function () {
                                G.frame.shizijunyuanzheng.setContents();
                            });
                            G.frame.fight_win.once('show', function () {
                                G.frame.fanpai.data(d.d.flop).show();
                            });
                            // G.frame.fight_win.once('shizijun', function () {
                            //     G.frame.fanpai.data(d.d.flop).show();
                            // });
                        }else if(d.s == -3){
							//没有数据防守阵容数据，很大几率是由于换天了
							G.tip_NB.show(L('reseted'));
							G.frame.yingxiong_fight.remove();
							G.frame.sizijunyuanzheng_dsxx.remove();
							G.frame.shizijunyuanzheng.remove();
							cc.director.getRunningScene().setTimeout(function(){
								G.frame.shizijunyuanzheng.show();
							},200);
						}
                    }, true);
                },
                pvywzbjf: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("crosszb_jffight", [data.idx, hereList], function (d) {
                        if(!d) return;
                        d = JSON.parse(d);
                        if(d.s == 1) {
                            d.d.fightres['pvType'] = 'pvywzbjf';
                            G.hongdian.getData("crosszbjifen", 1, function () {
                                G.frame.yuwaizhengba.checkRedPoint();
                                G.frame.yuwaizhengba_jifen.checkRedPoint();
                            });
                            X.cacheByUid('fight_ywzbjf',hereList);

                            if(X.cacheByUid("jumpJiFenSai")) {
                                if(d.d.fightres.winside == 0) {
                                    G.frame.fight_win.data(d.d).show();
                                } else {
                                    G.frame.fight_fail.data(d.d.fightres).show();
                                }
                            } else {
                                G.frame.fight.data({
                                    prize:d.d.prize,
                                    pvid:data.idx
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                }).demo(d.d.fightres);
                            }
                            data.callback && data.callback(d);
                        }
                    }, true);
                },
                pvywzbzb: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("crosszb_zbfight", [data.uid, hereList], function (d) {
                        if(!d) return;
                        d = JSON.parse(d);
                        if(d.s == 1) {
                            d.d.fightres['pvType'] = 'pvywzbzb';

                            X.cacheByUid('fight_ywzbzb',hereList);
                            G.frame.fight.data({
                                prize:d.d.prize,
                                pvid:data.idx
                            }).once('show', function () {
                                G.frame.yingxiong_fight.remove();
                            }).demo(d.d.fightres);
                        }
                        data.callback && data.callback(d);
                    }, true);
                },
                pvghz: function (node) {
                    var data = G.frame.yingxiong_fight.data();
                    var hereList = node.getSelectedData();

                    G.ajax.send("ghcompeting_fight", [hereList, data.data], function (d) {
                        if(!d) return;
                        d = JSON.parse(d);
                        if(d.s == 1) {
                            d.d.fightres['pvType'] = 'pvghz';
                            X.cacheByUid('fight_pvghz',hereList);
                            G.frame.yingxiong_fight.remove();
                            G.frame.fight.once('hide', function () {
                                if(G.frame.gonghui_ghz.isShow) {
                                    G.frame.gonghui_ghz.refresh();
                                }
                            }).demo(d.d.fightres);

                            if(d.d.fightres.winside == 0) {
                                G.frame.fight_win.once('show', function () {
                                    G.frame.fanpai.data(d.d.flop).show();
                                });
                            } else {
                                G.frame.fight_fail.once('show', function () {
                                    G.frame.fanpai.data(d.d.flop).show();
                                });
                            }
                        }
                    })
                },
                pvmw: function (node) {
                    var hereList = node.getSelectedData();

                    G.ajax.send("devil_fight", [hereList], function (d) {
                        if(!d) return;
                        d = JSON.parse(d);
                        if(d.s == 1) {
                            d.d.fightres['pvType'] = 'pvmw';
                            X.cacheByUid('fight_pvmw', hereList);
                            G.frame.yingxiong_fight.remove();
                            d.d.fightres.prize = d.d.prize;
                            G.frame.fight.demo(d.d.fightres);
                            G.frame.shendianmowang.getData(function () {
                                G.frame.shendianmowang.setFightNum();
                                G.frame.shendianmowang.setRankInfo();
                            });
                        }
                    })
                },
                pvghtf: function (node) {
                    var hereList = node.getSelectedData();

                    G.ajax.send("teamtask_fight", [hereList], function (d) {
                        if(!d) return;
                        d = JSON.parse(d);
                        if(d.s == 1) {
                            d.d.fightres['pvType'] = 'pvghtf';
                            d.d.fightres['mapIdx'] = G.frame.yingxiong_fight.data().idx;
                            X.cacheByUid('fight_pvghtf', hereList);
                            G.frame.yingxiong_fight.remove();
                            d.d.fightres.prize = d.d.prize;
                            G.frame.fight.demo(d.d.fightres);
                            G.frame.gonghui_ghrw.getData(function () {
                                G.frame.gonghui_ghrw.checkShow();
                            });
                        }
                    })
                }
            },
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhandou_kaizhan.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

            if(G.frame.jingjichang_freepk.isShow){
                me.nodes.btn_kz.hide();
                me.nodes.btn_bc.show();
                if(G.frame.yingxiong_fight.data().type){
                    if(G.frame.yingxiong_fight.data().type == "jjckz"){
                        me.nodes.btn_bc.hide();
                        me.nodes.btn_kz.show();
                    }
                }

                // me.nodes.btn_kz.hide();
            }
            //阵容保存
            me.nodes.btn_bc.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    //空判断
                    var sData = G.frame.yingxiong_fight.bottom.selectedData;
                    if (sData.length < 1) {
                        G.tip_NB.show(L('YX_FIGHT_TIP_1'));
                        return;
                    }

                    var pvData = G.frame.yingxiong_fight.data();
                    console.log('pvType======', pvData.pvType);

                    if (pvData && pvData.pvType) {
                        me.extConf.fight[pvData.pvType](me);
                    } else {
                        var callback = G.frame.yingxiong_fight.DATA.callback;
                        callback && callback(me);

                        // me.extConf.fight['pvguanqia'](me);
                    }
                }
            });

            //开战
            me.nodes.btn_kz.click(function (sender, type) {
                //空判断
                var sData = G.frame.yingxiong_fight.bottom.selectedData;
                if (sData.length < 1) {
                    G.tip_NB.show(L('YX_FIGHT_TIP_1'));
                    return;
                }
                sender.setTouchEnabled(false);
                var pvData = G.frame.yingxiong_fight.data();
                console.log('pvType======', pvData.pvType);

                if (pvData && pvData.pvType) {
                    me.extConf.fight[pvData.pvType](me);
                } else {
                    var callback = G.frame.yingxiong_fight.DATA.callback;
                    callback && callback(me);

                    // me.extConf.fight['pvguanqia'](me);
                }
                me.ui.setTimeout(function () {
                    me.nodes.btn_kz.setTouchEnabled(true);
                }, 5000);
            });
            //提示
            me.nodes.btn_tishi.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_zzkezhi.data(me.zf).show();
                }
            });

            me.nodes.btn_cdsq.click(function () {
                G.frame.shenqi_xuanze.data({
                    sqid: me.sqid,
                    callback: function (id) {
                        me.sqid = id;
                        me.setShenQi();
                        me.checkRedPoint();
                    }
                }).show()
            })
        },
        setShenQi: function() {
            var me = this;
            var itemArr = me.itemArr;
            for(var i = 0; i < itemArr.length; i ++) {
                if(itemArr[i].data) {
                    itemArr[i].finds("panel_yx$").getChildren()[0].setArtifact(me.sqid, true);
                }
            }
        },
        checkRedPoint: function() {
            var me = this;
            if(!me.sqid && P.gud.artifact) {
                G.setNewIcoImg(me.nodes.btn_cdsq, .95);
            }else {
                G.removeNewIco(me.nodes.btn_cdsq);
            }
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.zf = "";
        },
        onShow: function () {
            var me = this;

            me.fightData = G.frame.yingxiong_fight.data();
            if(me.fightData.pvType == "pvshizijun"){
                me.status = G.frame.shizijunyuanzheng.DATA.status;
                me.inStatus = X.keysOfObject(me.status);
            }
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setAttr();
            me.setBuff();
            me.createLayout();
        },
        //创建6个层容器
        createLayout: function () {
            var me = this;
		
            var layArr = [me.nodes.ico_qianpai_yx,me.nodes.ico_houpai_yx];

            // var lay = me.nodes.panel_yxlb;
            // lay.removeAllChildren();
            var lay,herInterval;
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }
            var list = me.nodes.list_yx;
            list.hide();
            me.itemArr = [];

            var scale = 0.8;
            var width = scale * list.width;

            var num = 0;
            for (var i = 0; i < me.extConf.maxnum; i++) {
                var item = list.clone();
                item.idx = i;
                item.setName(i);
                me.setItem(item);

                //创建背景item
                var itemBg = list.clone();
                itemBg.setName('bg_' + i);

                if (i < 2) {
                    lay = layArr[0];
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = layArr[1];
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                item.setScale(scale);
                item.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));

                itemBg.setScale(scale);
                itemBg.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));

                num++;

                itemBg.finds('img_renwu$').hide();

                lay.addChild(itemBg);
                itemBg.setLocalZOrder(-1);
                itemBg.show();

                lay.addChild(item);
                item.setLocalZOrder(1);
                item.show();
                me.itemArr.push(item);
            }

            me.loadCache();
        },
        //加载缓存
        loadCache: function () {
            var me = this;

            var setCache = function (cache) {
                 for (var i = 0; i < me.itemArr.length; i++) {
                     var item = me.itemArr[i];
                     if(cache && cache[i + 1] && G.DATA.yingxiong.list[cache[i + 1]]){
                         var tid = cache[i + 1];
                         item.data = tid;
                         var layIco = item.nodes.panel_yx;
                         if (!G.DATA.yingxiong.list[tid]) continue;
                         var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                         wid.setAnchorPoint(0.5, 1);
                         wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                         if(me.sqid) {
                             wid.setArtifact(me.sqid);
                         }
                         layIco.addChild(wid);
                     }
                 }
                 me.setAttr();
                 me.setBuff();
            };

            if (me.fightData.defhero) {
                me.sqid = me.fightData.defhero.sqid;
                setCache(me.fightData.defhero);
            } else {
                var type = me.fightData.pvType || me.fightData.type;
                switch (type) {
                    case "pvshizijun":
                        cache = X.cacheByUid("fight_shizijun");
                        break;
                    case "jjckz":
                        cache = X.cacheByUid("fight_zyjjc");
                        break;
                    case "hypk":
                        cache = X.cacheByUid("fight_hypk");
                        break;
                    case "hybs":
                        cache = X.cacheByUid("fight_hybs");
                        break;
                    case "ghfb":
                        cache = X.cacheByUid("fight_ghfb");
                        break;
                    case "pvdafashita":
                        cache = X.cacheByUid("fight_fashita");
                        break;
                    case "pvguanqia":
                        cache = X.cacheByUid("fight_tanxian");
                        break;
                    case "pvywzbjf":
                        cache = X.cacheByUid("fight_ywzbjf");
                        break;
                    case "pvywzbzb":
                        cache = X.cacheByUid("fight_ywzbzb");
                        break;
                    case "pvghz":
                        cache = X.cacheByUid("fight_pvghz");
                        break;
                    case "pvmw":
                        cache = X.cacheByUid("fight_pvmw");
                        break;
                    case "pvghtf":
                        cache = X.cacheByUid("fight_pvghtf");
                        break;
                    default:
                        cache = X.cacheByUid('fight_ready');
                        break;
                }
                if(cache && cache.sqid) {
                    me.sqid = cache.sqid;
                }
                me.checkRedPoint();
                if (me.fightData.pvType !== "pvshizijun") {
                    setCache(cache);
                } else {
                    var zhanweiCache = X.cacheByUid("fight_shizijun") || {};
                    for(var i in zhanweiCache){
                        if(zhanweiCache[i]){
                            if(X.inArray(me.inStatus, zhanweiCache[i]) && me.status[zhanweiCache[i]].hp <= 0){
                                zhanweiCache[i] = undefined;
                            }
                        }
                    }
                    for (var i = 0; i < me.itemArr.length; i++) {
                        var item = me.itemArr[i];
                        if(zhanweiCache && zhanweiCache[i + 1] && G.DATA.yingxiong.list[zhanweiCache[i + 1]] && G.DATA.yingxiong.list[zhanweiCache[i + 1]].lv > 39){
                            var tid = zhanweiCache[i + 1];
                            item.data = tid;
                            var layIco = item.nodes.panel_yx;
                            layIco.removeAllChildren();
                            var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                            if(me.sqid) {
                                wid.setArtifact(me.sqid);
                            }
                            if (X.inArray(me.inStatus, tid)) {
                                if (me.status[tid].hp <= 0) break;
                                var hp = me.status[tid].hp / me.status[tid].maxhp * 100;
                                wid.setHP(hp, true);
                            } else {
                                wid.setHP(100, true);
                            }
                            wid.setAnchorPoint(0.5, 1);
                            wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                            layIco.addChild(wid);
                        }
                    }
                    me.setAttr();
                    me.setBuff();
                }
            }
        },
        setItem: function (item) {
            var me = this;

            X.autoInitUI(item);

            var layIco = item.nodes.panel_yx;

            if (item.data) {
                delete item.data;
            }
            layIco.setTouchEnabled(false);
            layIco.removeAllChildren();
            //lay.getTouchMovePosition()
            // imgAdd.show();

            item.setTouchEnabled(true);

            var bPos,cloneItem,pos;
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    if (sender.data) {
                        bPos = sender.getTouchBeganPosition();
                        var firstParent = sender.getParent();

                        var firstPos = firstParent.convertToWorldSpace(sender.getPosition());
                        pos = me.ui.convertToNodeSpace(firstPos);
                        cloneItem = me.cloneItem = sender.clone();
                        cloneItem.data = sender.data;
                        sender.hide();
                        cloneItem.setPosition(cc.p(pos));
                        me.ui.addChild(cloneItem);
                        // cloneItem.
                        //给clone头像加动画
                        if(!sender.finds('star_1')){
                            cloneItem.finds('panel_xx').removeAllChildren();
                            G.class.ani.show({
                                json: "ani_10xingsaoguang",
                                addTo: cloneItem.finds('panel_xx'),
                                x: cloneItem.finds('panel_xx').width / 2,
                                y: cloneItem.finds('panel_xx').height / 2,
                                repeat: true,
                                autoRemove: false,
                            });
                            me.yx1 = true;
                        }else{
                            me.yx1 = false;
                        }
                    }
                } else if(type == ccui.Widget.TOUCH_MOVED){
                    if(sender.data){
                        var mPos = sender.getTouchMovePosition();
                        var offset = cc.p(mPos.x - bPos.x,mPos.y - bPos.y);

                        cloneItem.setPosition(cc.p(pos.x + offset.x,pos.y + offset.y));

                    }
                }else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (sender.data) {

                        var isCollision = me.checkItemsCollision(cloneItem);
                        if(isCollision && !isCollision.finds('star_1')){
                            me.yx2 = true;
                        }else{
                            me.yx2 = false;
                        }
                        if (isCollision != null) {
                            me.changeItem(sender,isCollision);
                        }

                        if(me.cloneItem) {
                            me.cloneItem.removeFromParent();
                            delete me.cloneItem;
                        }
                        sender.show();

                    }
                } else if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //卸下英雄
                    if (sender.data) {
                        me.removeItem(sender.data);
                    }
                }

            });
        },
        removeItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item.nodes.panel_yx;
                // var imgAdd = item.nodes.img_add;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.yingxiong_fight.bottom.selectedData,tid);
                    if (idx > -1) {
                        G.frame.yingxiong_fight.bottom.selectedData.splice(idx, 1);
                        G.frame.yingxiong_fight.bottom.removeGou(tid);
                        // me.ui.setTimeout(function () {
                        //
                        // },180);
                    }

                    var child = G.frame.yingxiong_fight.bottom.getChildByTid(tid);
                    if (child) {
                        G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                        G.frame.yingxiong_fight.posSelect.x += child.width / 2;
                    }

                    //移动动画所需数据
                    if (cc.isNode(G.frame.yingxiong_fight.item)) {
                        G.frame.yingxiong_fight.item.stopAllActions();
                        G.frame.yingxiong_fight.item.removeFromParent();
                    }
                    G.frame.yingxiong_fight.playAniType = 'remove';
                    G.frame.yingxiong_fight.posSz = G.frame.yingxiong_fight.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    var itemClone = G.frame.yingxiong_fight.item = layIco.clone();
                    itemClone.setPosition(G.frame.yingxiong_fight.posSz);
                    G.frame.yingxiong_fight.ui.addChild(itemClone);
                    G.frame.yingxiong_fight.playAniMove(itemClone);
                    
                    delete item.data;
                    layIco.removeAllChildren();
                    // imgAdd.show();
                    me.setAttr();
                    me.setBuff();
                }
            }
        },
        addItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = tid;
                    var layIco = item.nodes.panel_yx;
                    // var imgAdd = item.nodes.img_add;
                    var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                    wid.setAnchorPoint(0.5,1);
                    wid.setPosition(cc.p(layIco.width / 2,layIco.height));
                    if(me.sqid) {
                        wid.setArtifact(me.sqid);
                    }
                    if(me.fightData.pvType == "pvshizijun"){
                        if(X.inArray(me.inStatus, tid)){
                            var hp = me.status[tid].hp / me.status[tid].maxhp * 100;
                            wid.setHP(hp, true);
                        }else{
                            wid.setHP(100, true);
                        }
                    }
                    layIco.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);

                    G.frame.yingxiong_fight.playAniType = 'add';
                    G.frame.yingxiong_fight.posSz = G.frame.yingxiong_fight.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    G.frame.yingxiong_fight.posSz.x -= layIco.width / 2;
                    
                    // imgAdd.hide();
                    me.setAttr();
                    me.setBuff();
                    break;
                }
            }
        },
        getSelectedData: function () {
            var me = this;

            var itemArr = me.itemArr;
            var obj = {};
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (item.data) {
                    obj[item.idx + 1] = item.data;
                }
            }

            if(me.sqid) {
                obj.sqid = me.sqid;
            }

            return obj;
        },
        setAttr: function () {
            var me = this;

            var sData = G.frame.yingxiong_fight.bottom.selectedData || [];
            var zhanli = 0;
            for (var i = 0; i < sData.length; i++) {
                var tid = sData[i];
                var hData = G.DATA.yingxiong.list[tid];
                zhanli += hData.zhanli;
            }

            me.nodes.txt_djs.setString(zhanli);
        },
        //获得选择数据种族对应的数量
        getZz2Num: function () {
            var me = this;

            var sData = G.frame.yingxiong_fight.bottom.selectedData || [];

            var obj = {};
            for (var i = 0; i < sData.length; i++) {
                var id = sData[i];
                var heroData = G.DATA.yingxiong.list[id];
                obj[heroData.zhongzu] = obj[heroData.zhongzu] || 0;
                obj[heroData.zhongzu]++;
            }

            return obj;
        },
        setBuff: function () {
            var me = this;
            var zf;
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);
            var zz2num = me.getZz2Num();

            for(var i = 0; i < keys.length; i ++) {
                var isOk = true;
                var cond = G.class.zhenfa.getById(keys[i]).cond;
                for (var j in cond) {
                    if(!zz2num[j] || zz2num[j] < cond[j]) {
                        isOk = false;
                        break;
                    }
                }
                if(isOk) {
                    zf = keys[i];
                    break;
                }
            }
            if(zf) {
                me.zf = zf;
                var img = G.class.zhenfa.getIcoById(zf);
                me.ui.finds("txt_zx").hide();
                me.nodes.img_wh.hide();
                me.nodes.ico_zx.setBackGroundImage('img/zhenfa/' + img + '.png',1);
                me.nodes.ico_zx.removeAllChildren();
                G.class.ani.show({
                    json: "ani_zhenyingbuff16",
                    addTo: me.nodes.ico_zx,
                    x: me.nodes.ico_zx.width / 2,
                    y: me.nodes.ico_zx.height / 2,
                    repeat: true,
                    autoRemove: false,
                });
            }else {
                me.zf = "";
                me.nodes.img_wh.show();
                me.nodes.ico_zx.removeBackGroundImage();
                me.nodes.ico_zx.removeAllChildren();
                me.ui.finds("txt_zx").show();
            }
        },
        // 检测碰撞内容，如果有合适的，返回item
        checkItemsCollision: function (cloneItem) {
            var me = this;

            var itemsArr = me.itemArr;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.data != item.data) {
                    var pos = item.getParent().convertToNodeSpace(cloneItem.getParent().convertToWorldSpace(cloneItem.getPosition()));
                    if (cc.rectContainsPoint(item.getBoundingBox(), pos)) {
                        return item;
                    }
                }
            }

            return null;
        },
        //交换头像和数据
        changeItem: function (item1,item2) {
            var me = this;

            if(!item1.data) return;

            var tid1 = item1.data;
            var tid2 = item2.data;

            item1.nodes.panel_yx.removeAllChildren();
            item2.nodes.panel_yx.removeAllChildren();
            if(tid2) {
                item2.data = tid1;
                item1.data = tid2;

                var wid = G.class.shero(G.DATA.yingxiong.list[tid2]);
                wid.setAnchorPoint(0.5,1);
                wid.setPosition(cc.p(item1.nodes.panel_yx.width / 2,item1.nodes.panel_yx.height));
                item1.nodes.panel_yx.addChild(wid);
                wid.setArtifact(me.sqid);
                if(me.fightData.pvType == "pvshizijun") {
                    if(me.status[tid2]) {
                        wid.setHP(me.status[tid2].hp / me.status[tid2].maxhp * 100, true);
                    }else {
                        wid.setHP(100, true);
                    }
                }

                var wid1 = G.class.shero(G.DATA.yingxiong.list[tid1]);
                wid1.setAnchorPoint(0.5,1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx.width / 2,item2.nodes.panel_yx.height));
                item2.nodes.panel_yx.addChild(wid1);
                wid1.setArtifact(me.sqid);
                if(me.fightData.pvType == "pvshizijun") {
                    if(me.status[tid1]) {
                    wid1.setHP(me.status[tid1].hp / me.status[tid1].maxhp * 100, true);
                    }else {
                        wid1.setHP(100, true);
                    }
                }

            }else {
                item1.data = undefined;
                item2.data = tid1;

                var wid1 = G.class.shero(G.DATA.yingxiong.list[tid1]);
                wid1.setAnchorPoint(0.5,1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx.width / 2,item2.nodes.panel_yx.height));
                item2.nodes.panel_yx.addChild(wid1);
                wid1.setArtifact(me.sqid);
                if(me.fightData.pvType == "pvshizijun") {
                    if(me.status[tid1]) {
                        wid1.setHP(me.status[tid1].hp / me.status[tid1].maxhp * 100, true);
                    }else {
                        wid1.setHP(100, true);
                    }
                }
            }
        }
    });

})();