/**
 * Created by wfq on 2018/5/29.
 */
 (function () {
    //探险
    var ID = 'tanxian';

    var fun = X.bUi.extend({
        extConf: {
            city: {
                'maxContleft': 20,
                'maxContRight': -1350
            },
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id, {action: true});
            me.preLoadRes = ["jiesuojianzhu.png", "jiesuojianzhu.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            var btnXs = me.nodes.btn_xsrw;
            var btnMap = me.nodes.btn_worldmap;
            btnMap.show();
            var btnTg = me.nodes.btn_tgjl;
            var btnPh = me.nodes.btn_ph;
            var btnHc = me.nodes.btn_fhzc;
            var btnKs = me.nodes.btn_kstx;
            var btnBq = me.nodes.btn_woyaobianqiang;
            var btnSq = me.nodes.btn_sq;
            if(P.gud.lv < 6) {
                btnSq.hide();
            }
            var panel_xsrwdh = me.nodes.panel_xsrwdh;
            panel_xsrwdh.setAnchorPoint(0.5,0.5);
            panel_xsrwdh.setPosition(cc.p(btnXs.width/2, btnXs.height/2));
            btnXs.setZoomScale(0);
            //悬赏积分
            btnXs.click(function(sender,type){
                var xslv = G.class.opencond.getLvById("xuanshangrenwu");
                if(P.gud.lv < xslv){
                    G.tip_NB.show(X.STR(L("XYLVKQ"), xslv));
                    return;
                }else{
                    G.frame.xuanshangrenwu.show();
                }
            });
            // 世界地图
            btnMap.click(function (sender, type) {
                G.frame.tanxian_map.data({
                    tztype: G.class.tanxian.getNanduById(P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid)
                }).show();
            });
            // 通关奖励
            btnTg.click(function (sender, type) {
                G.frame.tanxian_tgprize.show();
            });
            // 排行
            btnPh.click(function (sender, type) {
                G.ajax.send('rank_open', [1], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.tanxian_phb.data(d.d).show();
                    }
                }, true);

            });

            // me.nodes.btn_sq.click(function () {
            //     G.frame.shenqi.show();
            // });
            //返回主城
            // btnHc.click(function(sender,type){
            //     // G.frame.main.show();
            //     me.remove();
            // });
            //快速探险
            btnKs.click(function (sender, type) {
                G.frame.tanxian_kstx.show();
            });
            btnBq.click(function () {
                G.frame.woyaobianqiang.show();
            });
            G.class.ani.show({
                json: "ani_xiaotubiao_shenqi",
                addTo: btnSq,
                x: btnSq.width / 2,
                y: btnSq.height / 2,
                repeat: true,
                autoRemove: false
            });
            btnSq.click(function(){
                G.frame.shenqi.checkShow();
            });
            G.class.ani.show({
                json: "ani_xiaotubiao_renwu",
                addTo: me.nodes.btn_mrrw,
                x: me.nodes.btn_mrrw.width / 2,
                y: me.nodes.btn_mrrw.height / 2,
                repeat: true,
                autoRemove: false
            });
            me.nodes.btn_mrrw.click(function () {
                G.frame.renwu.data({type: 2}).show();
            })
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();

            me.showMainMenu();
            // me.showToper();
            //判断maxmapid是否过界
            me.maxGqid = G.class.tanxian.getCurMaxGqid();
            var maxmapid = P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid;
            me.maxmapid = maxmapid || P.gud.mapid;
            me.curArea = G.class.tanxian.getAreaById(P.gud.mapid);
            me.curNandu = G.class.tanxian.getNanduById(P.gud.mapid);
            me.isPrize = true;
            me.bindMove();
        },
        onAniShow: function () {
            var me = this;
            G.guidevent.emit('tanxianOpenOver');
        },
        show: function (conf) {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.setContents();
            G.guidevent.emit('tanxianrefreshDataOver');
            me.yuan_jdl(P.gud.jifen, 0, true);
            G.frame.chongzhi.once("hide", function () {
                me.getData();
            });
            cc.enableScrollBar(me.nodes.ListView_sytsts);
            me.nodes.Panel_sytsts.hide();
            me.nodes.Panel_sytsts.setCascadeOpacityEnabled(true);
            me.nodes.baozangdianji.setSwallowTouches(false);
            me.nodes.ListView_sytsts.setCascadeOpacityEnabled(true);
            G.view.mainMenu.set_fhzc(2);
            G.view.mainMenu.checkRedPoint('tanxian');
            G.hongdian.checkTask();
            G.hongdian.checkSQ();
        },
        onHide: function () {
            var me = this;

            me.event.emit('hide');
            G.hongdian.getData("tanxian", 1, function () {
                G.hongdian.getData("guajitime", 1, function () {
                    G.hongdian.checkTX();
                })
            });
        },
        refreshData: function () {
            var me = this;

            me.getData(function () {
                me.maxGqid = G.class.tanxian.getCurMaxGqid();
                var maxmapid = P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid;
                me.maxmapid = maxmapid || P.gud.mapid;
                me.setContents();
                G.guidevent.emit('tanxianrefreshDataOver');
            });
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('tanxian_main', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        setContents: function () {
            var me = this;

            me.checkRedPoint();
            me.setBtns();
            me.setDropInfo();
            me.setArea();
            me.setSimulateFight();

            me.scrollToGuanqia(P.gud.mapid);
            me.nodes.panel_zd.setTouchEnabled(false);
            me.nodes.Panel_lvsy.hide()
        },
        checkRedPoint: function () {
            var me = this;
            var arr = [];
            var isHavePoint = false;
            var conf = G.class.tanxian.getTgprize();
            var pass = me.DATA.passprizeidx;

            for (var i = 0; i < conf.length; i++) {
                if (me.maxmapid - 1 >= conf[i][0]) {
                    arr.push(i);
                }
            }
            for (var i = 0; i < arr.length; i++) {
                if (!X.inArray(pass, arr[i])) {
                    isHavePoint = true;
                    break;
                }
            }
            if (isHavePoint) {
                me.nodes.btn_tgjl.removeAllChildren();
                G.setNewIcoImg(me.nodes.btn_tgjl, .8);
                G.class.ani.show({
                    json: "ani_tongguanjiangli",
                    addTo: me.nodes.btn_tgjl,
                    x: me.nodes.btn_tgjl.width / 2,
                    y: me.nodes.btn_tgjl.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setTag(777888);
                        action.setTimeSpeed(0.75);
                    }
                })
            } else {
                G.removeNewIco(me.nodes.btn_tgjl);
                while (me.nodes.btn_tgjl.getChildByTag(777888)) {
                    me.nodes.btn_tgjl.getChildByTag(777888).removeFromParent();
                }
                me.nodes.btn_tgjl.opacity = 255;
            }
            if (me.DATA.freetxnum) {
                G.setNewIcoImg(me.nodes.btn_kstx, .92);
            } else {
                G.removeNewIco(me.nodes.btn_kstx);
            }
            if(G.DATA.hongdian.guajitime > 0){
                G.setNewIcoImg(me.nodes.btn1_on, .8);
            }else{
                G.removeNewIco(me.nodes.btn1_on);
            }
        },
        //设置右下角按钮事件
        setBtns: function () {
            var me = this;

            //挑战领主 下一关 解锁 世界地图
            var btnTz = me.nodes.btn_tzlz;
            var btnXyg = me.nodes.btn_xyg;
            var btnJs = me.nodes.btn_js;
            var btnMap = me.nodes.btn_sjdt;

            btnTz.hide();
            btnXyg.hide();
            btnJs.hide();
            btnMap.hide();

            while (me.ui.finds("panel_ui").getChildByTag(777)) {
                me.ui.finds("panel_ui").getChildByTag(777).removeFromParent();
            }

            var isAll = false;
            var gjmapid = P.gud.mapid;
            var gqArr = G.class.tanxian.getIdArrByNanduAndArea(me.curNandu, me.curArea);
            if (P.gud.maxmapid > gqArr[9] && P.gud.mapid % 10 == 0) {
                isAll = true;
            }

            //当前关卡已通关，如果是该章节最后一关，下一关未解锁时，显示解锁条件；已解锁时，显示世界地图；
            // 如果不是最后关卡，下一关未解锁时，显示解锁条件；已解锁时，显示下一关
            // if (isAll) {
            //     btnMap.show();
            //     G.class.ani.show({
            //         json: "ani_tiaozhan",
            //         addTo: me.ui.finds("panel_ui"),
            //         x: 418,
            //         y: 165,
            //         repeat: true,
            //         autoRemove: false,
            //         onload: function (node, action) {
            //             node.setTag(777);
            //         }
            //     });
            // } else {
                if (gjmapid < P.gud.maxmapid) {
                    var last = G.class.tanxian.checkIsLastByGqid(gjmapid);
                    var nextGqid = gjmapid * 1 + 1,
                    openlv;
                    var lv = P.gud.lv;

                    //是本章节最后关卡
                    if (last) {
                        var curMaxGqid = G.class.tanxian.getCurMaxGqid();
                        var nextConf = G.class.tanxian.getById(nextGqid);
                        if (nextGqid == curMaxGqid || !nextConf || nextGqid == me.maxmapid || isAll) {
                            //已经达到当前允许的最大关卡，或者极致关卡
                            //显示世界地图
                            btnMap.show();
                            G.class.ani.show({
                                json: "ani_tiaozhan",
                                addTo: me.ui.finds("panel_ui"),
                                x: 418,
                                y: 165,
                                repeat: true,
                                autoRemove: false,
                                onload: function (node, action) {
                                    node.setTag(777);
                                }
                            });
                            if(P.gud.mapid == 10 && P.gud.maxmapid == 11) {
                                G.class.ani.show({
                                    json: "ani_xinshou_arrow",
                                    addTo: me.ui.finds("panel_ui"),
                                    x: 418,
                                    y: 165,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node, action) {
                                        G.frame.tanxian.arrow = node;
                                        node.setTag(777);
                                    }
                                });
                            }
                        } else {
                            openlv = G.class.tanxian.getNeedlvByGqid(nextGqid);
                            if (lv >= openlv) {
                                // 显示下一关
                                btnXyg.show();
                                G.class.ani.show({
                                    json: "ani_tiaozhan",
                                    addTo: me.ui.finds("panel_ui"),
                                    x: 418,
                                    y: 165,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node, action) {
                                        node.setTag(777);
                                    }
                                });
                            } else {
                                // 显示解锁
                                btnJs.show();
                                btnJs.setTouchEnabled(false);
                                var txtJs = btnJs.finds('txt_fhzc');
                                txtJs.setString(X.STR(L('X_LV_JS'), openlv));
                            }
                        }

                    } else {
                        // 不是本章节最后关卡
                        openlv = G.class.tanxian.getNeedlvByGqid(nextGqid);
                        if (lv >= openlv) {
                            // 显示下一关
                            btnXyg.show();
                            G.class.ani.show({
                                json: "ani_tiaozhan",
                                addTo: me.ui.finds("panel_ui"),
                                x: 418,
                                y: 165,
                                repeat: true,
                                autoRemove: false,
                                onload: function (node, action) {
                                    node.setTag(777);
                                }
                            });
                        } else {
                            // 显示解锁
                            btnJs.show();
                            btnJs.setTouchEnabled(false);
                            var txtJs = btnJs.finds('txt_fhzc');
                            txtJs.setString(X.STR(L('X_LV_JS'), openlv));
                        }
                    }
                } else if (gjmapid == me.maxmapid) {
                    //当前关卡未通关，显示挑战boss
                    var opelv = G.class.tanxian.getNeedlvByGqid(P.gud.maxmapid);
                    if(P.gud.lv >= opelv) {
                        btnTz.show();
                        G.class.ani.show({
                            json: "ani_tiaozhan",
                            addTo: me.ui.finds("panel_ui"),
                            x: 418,
                            y: 165,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node, action) {
                                node.setTag(777);
                            }
                        });
                    }else {
                        btnJs.show();
                        btnJs.setTouchEnabled(false);
                        var txtJs = btnJs.finds('txt_fhzc');
                        txtJs.setString(X.STR(L('X_LV_JS'), opelv));
                    }

                }
            // }


            // 下一关
            btnXyg.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    sender.setTouchEnabled(false);
                    me.changeGuanqia(P.gud.mapid * 1 + 1, true);
                    me.ui.setTimeout(function () {
                        sender.setTouchEnabled(true);
                    }, 3000);
                    // G.ajax.send('tanxian_changegjmap',[P.gud.mapid * 1 + 1],function(d) {
                    //     if(!d) return;
                    //     var d = JSON.parse(d);
                    //     if(d.s == 1) {
                    //         G.tip_NB.show(L('GUAJI') + L('SUCCESS'));
                    //         me.refreshData();
                    //     }
                    // },true);
                }
            });
            //世界地图
            btnMap.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.tanxian_map.data({
                        tztype: G.class.tanxian.getNanduById(P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid)
                    }).show();
                }
            });
            //挑战按钮
            btnTz.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var obj = {
                        pvType: 'pvguanqia',
                        data: {}
                    };
                    G.frame.yingxiong_fight.data(obj).show();

                    // G.ajax.send('tanxian_fightboss',[],function(d) {
                    //     if(!d) return;
                    //     var d = JSON.parse(d);
                    //     if(d.s == 1) {
                    //
                    //     }
                    // },true);
                }
            });
        },
        // 切换关卡
        changeGuanqia: function (mapid, isAni) {
            var me = this;

            G.ajax.send('tanxian_changegjmap', [mapid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    // G.tip_NB.show(L('GUAJI') + L('SUCCESS'));
                    me.refreshData();
                    me.updateGuanqias();

                    if(mapid == me.maxmapid && isAni) {
                        me.playShouYi();
                    }
                    me.ui.setTimeout(function () {
                        G.guidevent.emit('changeGuanqiaOver');
                    }, 300);
                }
            }, true);
        },
        playShouYi: function() {
            var me = this;
            var addArr = [];

            var curArr = G.class.tanxian.get()[me.maxmapid].gjprize;
            var DropInfo = G.class.tanxian.get()[me.maxmapid - 1].gjprize;

            for(var i in DropInfo) {
                if(curArr[i] > DropInfo[i]) {
                    var str = [];
                    str.push(i);
                    str.push(curArr[i]);
                    addArr.push(str);
                }
            }

            if(addArr.length > 0) {
                me.nodes.Panel_sytsts.show();
                me.nodes.Panel_sytsts.opacity = 255;
                me.nodes.ListView_sytsts.removeAllChildren();
                for(var i = 0; i < addArr.length; i ++) {
                    var list = me.nodes.Panel_lvsy.clone();
                    (function (list) {
                        X.autoInitUI(list);
                        list.show();
                        list.setCascadeOpacityEnabled(true);
                        list.nodes.list_syts.setCascadeOpacityEnabled(true);
                        list.nodes.token_tanxiansy.setBackGroundImage(G.class.getItemIco(addArr[i][0]), 1);
                        list.nodes.txt_szsy.setString(DropInfo[addArr[i][0]] * 12 + "/m → " + addArr[i][1] * 12 + "/m");
                        list.nodes.txt_szsy.setTextColor(cc.color("#F6EBCD"));
                        X.enableOutline(list.nodes.txt_szsy, "#1e1e1e", 2);
                        me.nodes.ListView_sytsts.pushBackCustomItem(list);
                        G.class.ani.show({
                            json: "ani_tanxianshouyi",
                            addTo: list,
                            x: list.width / 2,
                            y: list.height / 2,
                            repeat: false,
                            autoRemove: true,
                        })
                    })(list);
                }
                var act = cc.fadeOut(2);
                me.nodes.Panel_sytsts.runAction(act);
            }
        },
        setGuaJiTime: function(){
            var me = this;
            var currTime = me.DATA.gjtime;
            var tqConf = G.class.vip.get()[P.gud.vip];
            var h = 8;

            if(P.gud.vip > 0) {
                for(var i in tqConf.tq) {
                    if(tqConf.tq[i][0] == 107) {
                        h += tqConf.tq[i][1];
                    }
                }
            }


            var setText = function(){
                me.nodes.txt_gkxx.setString(X.STR(L("DQGJSC"), X.timeLeft(currTime, 'h:mm:s')));
                if(currTime / 3600 >= h) {
                    currTime +=0;
                }else {
                    currTime +=1;
                }
            };

            setText();

            if(me.gjTimer){
                me.ui.clearInterval(me.gjTimer);
                delete me.gjTimer;
            }
            me.gjTimer = me.ui.setInterval(function(){
                setText();
            }, 1000);

        },
        //掉落信息
        setDropInfo: function () {
            var me = this;

            var panel = me.ui.finds('panel_dlxx');
            var btnCk = me.ui.nodes.btn_laiyuan;
            var btnLq = me.btnLq = me.nodes.btn1_on;
            // var layName = me.nodes.txt_gkxx;
            var arr = [];
            var data = me.DATA;
            var conf = G.class.tanxian.get()[me.maxmapid];
            var keys = X.keysOfObject(conf.gjprize);
            if (!btnLq.data) btnLq.data = [];
            // layName.setString(L("DQGJSY"));
            me.setGuaJiTime();

            me.nodes.txt_topgkxx.setString(conf.name);

            for(var i = 0; i < keys.length; i ++) {
                var img = new ccui.ImageView(G.class.getItemIco(keys[i]), 1);
                var str = X.STR("<font node=1></font>{1}/m", conf.gjprize[keys[i]] * 12);
                var rh = new X.bRichText({
                    size: 22,
                    maxWidth: me.nodes["panel_top" + (i + 1)].width,
                    lineHeight: 36,
                    family: G.defaultFNT,
                    color: "#F6EBCD"
                });
                rh.text(str, [img]);
                rh.setAnchorPoint(0, 0.5);
                rh.setPosition(0, me.nodes["panel_top" + (i + 1)].height / 2);
                me.nodes["panel_top" + (i + 1)].removeAllChildren();
                me.nodes["panel_top" + (i + 1)].addChild(rh);
            }

            if (data.gjprize.length < 1) {
                data.gjprize = [
                {a: "attr", t: "useexp", n: 0},
                {a: "attr", t: "jinbi", n: 0},
                {a: "attr", t: "exp", n: 0},
                {a: "attr", t: "jifen", n: 0}
                ];
            }
            for (var i = 0; i < data.gjprize.length; i++) {
                var prize = data.gjprize[i];
                var ui = me.nodes.list_dlxq.clone();
                var layout = me.nodes["panel_" + (i + 1)];
                setItem(ui, prize, layout);
            }

            function setItem(ui, data, list) {
                X.autoInitUI(ui);
                var layAttr = ui.nodes.token_tanxian;
                var txtAttr = ui.nodes.txt_sz;
                var add = G.class.tanxian.getVipAdd(data.t);
                var dd = G.class.tanxian.getGjPerValueByAttr(me.maxmapid, data.t);

                ui.data = data;

                ui.per = Math.ceil((G.class.tanxian.getGjPerValueByAttr(me.maxmapid, data.t) || 0) + add * (G.class.tanxian.getGjPerValueByAttr(me.maxmapid, data.t) || 0));
                layAttr.setBackGroundImage(G.class.getItemIco(data.t), 1);
                txtAttr.setString(X.fmtValue(data.n));
                ui.setAnchorPoint(0.5, 0.5);
                ui.setPosition(list.width / 2, list.height / 2);
                ui.show();
                list.removeAllChildren();
                list.addChild(ui);
                arr.push(ui);
            }

            var checkBtn = function (arr) {
                btnLq.setTouchEnabled(false);
                btnLq.setEnableState(false);
                btnLq.finds('txt_lq').setTextColor(cc.color(G.gc.COLOR.n15));

                for (var i = 0; i < arr.length; i++) {
                    var child = arr[i];
                    if (cc.isNode(child.nodes.txt_sz) && child.nodes.txt_sz.getString() * 1 > 0) {
                        btnLq.setTouchEnabled(true);
                        btnLq.setEnableState(true);
                        btnLq.finds('txt_lq').setTextColor(cc.color(G.gc.COLOR.n13));
                        break;
                    }
                }
            };

            //每5秒刷新一次奖励信息
            if (me.timer_ref) {
                panel.clearTimeout(me.timer_ref);
                delete me.timer_ref;
            }
            var n = 0;
            me.timer_ref = panel.setInterval(function () {
                for (var i = 0; i < arr.length; i++) {
                    var child = arr[i];
                    n++;
                    cc.isNode(child.nodes.txt_sz) && child.nodes.txt_sz.setString(X.fmtValue(child.data.n += child.per));
                }
                checkBtn(arr);
            }, 5000);

            // 领取
            // btnLq.setTouchEnabled(true);
            checkBtn(arr);
            btnLq.hide();
            btnLq.click(function (sender) {
                var max = G.class.tanxian.getMax();
                var cur = arr[3].nodes.txt_sz.getString();
                function f() {
                    var dq_jifen = P.gud.jifen;
                    G.ajax.send('tanxian_recgjprize', [], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            function receive(){
                                if (d.d.prize.length < 1) {
                                    G.tip_NB.show(L('ZW') + L('JIANGLI'));
                                    return;
                                }
                                for (var jf in d.d.prize) {
                                    if (d.d.prize[jf].t == 'jifen') {
                                        me.yuan_jdl(dq_jifen, d.d.prize[jf].n);
                                        continue;
                                    }
                                }
                                me.movePrize(G.view.mainMenu.ui,
                                    G.view.mainMenu.ui.convertToWorldSpace({x: G.frame.tanxian.prizeBox.x + 50, y: G.frame.tanxian.prizeBox.y - 100}),
                                    G.view.mainMenu.nodes.btn_beibao.getPosition());
                                G.frame.jiangli.data({
                                    prize: [].concat(d.d.prize)
                                }).show();

                                me.getData(function() {
                                    me.setDropInfo();
                                    me.setPrizeJinBi();
                                    me.isPrize = false;
                                    me.ui.setTimeout(function(){
                                        me.prizeBox.runAni(0, "baoxiang_jingzhi", false);
                                    },300);
                                    me.ui.setTimeout(function(){
                                        me.prizeBox.runAni(0, "baoxiang_daiji", true);
                                        me.isPrize = true;
                                    },5000);
                                });
                                G.hongdian.getData("guajitime", 1, function() {
                                    me.checkRedPoint();
                                })
                            }
                            if (me.jingBiAni) {
                                me.jingBiAni.playWithCallback('bao',false,function(){
                                    receive()
                                })
                            } else {
                                receive();
                            }
                        } else {
                            X.audio.playEffect("sound/dianji.mp3", false);
                        }
                    }, true);
                }

                if (parseInt(cur) + P.gud.jifen > max) {
                    if(P.gud.lv >= G.class.opencond.getLvById("xuanshangrenwu")) {
                        var str = X.STR(L("JFCGSX"), P.gud.jifen, max, cur);
                        G.frame.alert.data({
                            title: L("TS"),
                            cancelCall: null,
                            okCall: function () {
                                f();
                            },
                            richText: str,
                        }).show();
                    }else {
                        f();
                    }
                } else {
                    f();
                }

            }, 500);

            //查看
            panel.finds("bg_xinxi8").setTouchEnabled(true);
            panel.finds("bg_xinxi8").click(function () {
                G.frame.tanxian_gjprize.data(P.gud.mapid).show();
            });
            btnCk.click(function () {
                G.frame.tanxian_gjprize.data(P.gud.mapid).show();
            });
        },
        //区域
        setArea: function () {
            var me = this;

            // img_tanxian_gk1.png   关卡的三个小图

            //相同区域是不重复设置关卡
            if (me.oldArea == me.curArea) {
                return;
            }

            me.oldArea = me.curArea;

            me.initMap();
            me.setGuanqia();
        },
        initMap: function () {
            var me = this;

            // me.nodes.panel_bj.setPositionY(1309);
            // me.nodes.bg_zhong.setPositionY(766);
            var scrollview = me.nodes.scrollview_dt;
            var conf = G.class.tanxian.getExtConf().base.area[me.curArea];
            // me.nodes.bg_qian.setBackGroundImage('img/bg/' + conf.bigimg,0);
            var size = scrollview.getInnerContainerSize();
            scrollview.setInnerContainerSize(cc.size(me.nodes.bg_qian.width, size.height));
            me.nodes.panel_light.setBackGroundImage('img/bg/wu-' + me.curArea + '.png', 0);
            me.nodes.panel_light.setBackGroundImageScale9Enabled('img/bg/wu-' + me.curArea + '.png');
            me.bindMove();

        },
        bindMove: function () {
            var me = this;
            var scrollview = me.nodes.scrollview_dt,
            innerContent = scrollview.getInnerContainer();

            scrollview.setSwallowTouches(false);
            scrollview.addCCSEventListener(function (sender, type) {
                if (type === ccui.ScrollView.EVENT_SCROLLING) {
                    me.setMax();
                }
            });
            var img0 = me.nodes.bg_hou;
            var img1 = me.nodes.bg_zhong;
            var img2 = me.nodes.bg_qian;
            var guan = G.class.tanxian.getAreaById(P.gud.mapid);
            img0.setBackGroundImage('img/bg/beijing_0' + guan + '_h.png', 0);
            img1.setBackGroundImage('img/bg/beijing_0' + guan + '_z.png', 0);
            img2.setBackGroundImage('img/bg/beijing_0' + guan + '_q.png', 0);

            innerContent.update = function (dt) {
                // [0,-1350]

                img0.x = this.x * 0.3;
                img1.x = this.x * 0.5;
            };
            innerContent.scheduleUpdate();
        },
        setMax: function () {
            var me = this;
            var scrollview = me.nodes.scrollview_dt,
            innerContent = scrollview.getInnerContainer();
            if (innerContent.x > me.extConf.city.maxContleft) {
                innerContent.x = me.extConf.city.maxContleft;
            } else if (innerContent.x < me.extConf.city.maxContRight) {
                innerContent.x = me.extConf.city.maxContRight;
            }
        },
        setGuanqia: function () {
            var me = this;

            var guan = G.class.tanxian.getAreaById(P.gud.mapid);
            var scrollview = me.nodes.scrollview_dt;
            cc.enableScrollBar(scrollview);
            me.nodes.bg_qian.show();
            // me.curArea = G.class.tanxian.getAreaById(P.gud.mapid);
            // me.curNandu = G.class.tanxian.getNanduById(P.gud.mapid);
            var gqArr = G.class.tanxian.getIdArrByNanduAndArea(me.curNandu, me.curArea);

            me.guanqiaArr = [];
            me.nodes.bg_qian.removeAllChildren();

            while (me.nodes.bg_qian.getChildByTag(989898)) {
                me.nodes.bg_qian.getChildByTag(989898).removeFromParent();
            }
            G.class.ani.show({
                json: "ani_tanxian" + guan,
                addTo: me.nodes.bg_qian,
                x: me.nodes.bg_qian.width / 2,
                y: me.nodes.bg_qian.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setTag(989898);
                    node.zIndex = 0;
                    if(guan == 8) {
                        // node.getChildren()[0].getChildren()[1].positionType = 0;
                    }
                    for (var i = 0; i < gqArr.length; i++) {
                        var id = gqArr[i];
                        var item = me.nodes.panel_gq.clone();
                        item.idx = i;
                        me.setItem(item, id);
                        me.nodes.bg_qian.addChild(item);
                        item.show();
                        // item.zIndex = 100;
                        me.guanqiaArr.push(item);
                    }
                }
            });
        },
        setItem: function (ui, data) {
            var me = this;

            var conf = G.class.tanxian.getById(data);
            X.autoInitUI(ui);
            var layIco = ui.nodes.panel_gqwz;
            var layGj = ui.nodes.bg_tanxian_wjwz;
            var layPlayer = ui.nodes.panel_wjtx;


            layPlayer.removeAllChildren();
            layGj.hide();

            layIco.setTouchEnabled(false);
            layGj.setTouchEnabled(false);
            layPlayer.setTouchEnabled(false);
            ui.nodes.panel_wjxx.setTouchEnabled(false);
            ui.nodes.panel_wjxx.zIndex = 100;
            ui.zIndex = 100;

            ui.nodes.panel_zsp.setPositionX(0);
            ui.nodes.panel_zsp.zIndex = 99;
            if (data % 10 == 5) {
                ui.nodes.panel_zsp.removeBackGroundImage();
                if (me.maxmapid < data) {
                    ui.nodes.panel_zsp.setBackGroundImage('img/tanxian/img_tanxian_gk2_zs_h.png', 1);
                    ui.nodes.panel_zsp.setPositionX(-6);
                } else {
                    ui.nodes.panel_zsp.setBackGroundImage('img/tanxian/img_tanxian_gk2_zs.png', 1);
                    ui.nodes.panel_zsp.setPositionX(-1);
                }
                ui.nodes.panel_zsp.show();
                ui.nodes.panel_wjxx.setPositionY(me.nodes.panel_zsp.height * 1.65);
                ui.zIndex = 200;
            } else if (data % 10 == 0) {
                ui.nodes.panel_zsp.removeBackGroundImage();
                if (me.maxmapid < data) {
                    ui.nodes.panel_zsp.setBackGroundImage('img/tanxian/img_tanxian_gk3_zs_h.png', 1);
                    ui.nodes.panel_zsp.setPositionX(-5);
                } else {
                    ui.nodes.panel_zsp.setBackGroundImage('img/tanxian/img_tanxian_gk3_zs.png', 1);
                }
                ui.nodes.panel_zsp.show();
                ui.nodes.panel_wjxx.setPositionY(me.nodes.panel_zsp.height * 1.65);
                ui.zIndex = 200;
            }

            if (data == P.gud.mapid) {
                layGj.show();
                var widget = G.class.shead(P.gud);
                widget.lv.hide();
                X.addCenterChild(layPlayer, widget);
                widget.setScale(0.5);
                ui.nodes.panel_wjxx.show();
                var act1 = cc.moveBy(0.5, 0, 10);
                var act2 = cc.moveBy(0.5, 0, -10);
                var act = cc.sequence(act1, act2);
                ui.nodes.panel_wjxx.runAction(act.repeatForever());
                ui.zIndex = 50;
            }else {
                ui.zIndex = 10;
            }
            ui.setName(data);
            ui.setPosition(cc.p(conf.pos.x, conf.pos.y - 20));
            layIco.setBackGroundImage('img/tanxian/img_tanxian_gk' + conf.level + '.png', 1);
            layIco.show();
            if (ui.button) {
                ui.button.removeFromParent(true);
                delete ui.button;
            }
            if (me.maxmapid < data) {
                layIco.hide();
                var button = ui.button = new ccui.Button;
                button.loadTextureNormal('img/tanxian/img_tanxian_gk' + conf.level + '.png', 1);
                button.setAnchorPoint(0, 0);
                button.setPosition(layIco.getPosition());
                button.setTouchEnabled(false);
                button.setBright(false);
                button.setName("button");
                ui.addChild(button);
            }
            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (me.maxmapid < sender.data) {
                        G.tip_NB.show(L('TX_NEED_JS'));
                        return;
                    }

                    var cnf = G.class.tanxian.getById(sender.data);
                    if (P.gud.lv < cnf.needlv) {
                        G.tip_NB.show(X.STR(L('NEED_X_LV'), cnf.needlv));
                        return;
                    }

                    G.frame.tanxian_gjprize.data(sender.data).show();
                }
            });
        },

        //更新关卡
        updateGuanqias: function () {
            var me = this;

            me.curArea = G.class.tanxian.getAreaById(P.gud.mapid);
            me.curNandu = G.class.tanxian.getNanduById(P.gud.mapid);
            var gqArr = G.class.tanxian.getIdArrByNanduAndArea(me.curNandu, me.curArea);

            var guanqiaArr = me.guanqiaArr;
            for (var i = 0; i < guanqiaArr.length; i++) {
                var item = guanqiaArr[i];
                me.setItem(item, gqArr[i]);
            }
            var num = (P.gud.mapid * 1 + 9) % 10;
            var tx1 = me.guanqiaArr[num].nodes.panel_wjxx;
            tx1.zIndex = 100;
            var conf = G.class.tanxian.getExtConf().base.area[me.curArea];
            var imgArr = conf.fightimg.split('.');
            imgArr[0] = imgArr[0] + '_1';
            var img2 = imgArr.join('.');
            me.ui.finds('bg_battle1').setBackGroundImage('img/bg/' + conf.fightimg, 0);
            me.ui.finds('bg_battle2').setBackGroundImage('img/bg/' + img2, 0);
            G.class.ani.show({
                addTo: tx1,
                json: 'ani_tanxiantongguan',
                x: 215,
                y: 20,
                repeat: false,
                autoRemove: true,
                onload: function (node) {
                    node.setScaleX(1.5);
                }
            });
        },
        scrollToGuanqia: function (id) {
            var me = this;

            var panel = me.nodes.bg_bj;
            var scrollview = me.nodes.scrollview_dt;
            //计算出来的值可能有偏差
            // var gqNode = panel.finds(id.toString());
            // var pos = scrollview.convertToNodeSpace(gqNode.getParent().convertToNodeSpace(gqNode.getPosition()));
            // var per = pos.x / scrollview.getInnerContainerSize().width;
            var per = ((parseInt(id) + 9) % 10) / 10;
            if (per > 0.7) {
                per = 1
            }
            ;
            if (per < 0.3) {
                per = 0
            }
            ;
            cc.sys.isNative && scrollview.scrollToPercentHorizontal(Math.floor(per * 100), 0.7, false);
        },
        playPrizeAni: function () {
            var me = this;

            var gjprize = [{
                a: "attr",
                t: "useexp",
                n: 0
            },
            {
                a: "attr",
                t: "jinbi",
                n: 0
            },
            {
                a: "attr",
                t: "exp",
                n: 0
            },
            {
                a: "attr",
                t: "jifen",
                n: 0
            }
            ];
            var endPos = cc.p(600, 1000);
            for (var i = 0; i < gjprize.length; i++) {
                var parent = me.nodes["panel_" + (i + 1)];
                var bPos = parent.getParent().convertToWorldSpace(parent.getPosition());

                var img = new ccui.ImageView();
                img.loadTexture(G.class.getItemIco(gjprize[i].t), 1);
                img.setPosition(bPos);
                me.ui.addChild(img);
                (function (img) {
                    var action1 = cc.moveTo(0.5, endPos);
                    img.runAction(cc.sequence(action1, cc.callFunc(function () {
                        img.removeFromParent();
                    })));
                })(img);

            }

        },

        yuan_jdl: function (jifen_dq, jifen_jia, begin) {
            var me = this;
            var jindu_max = G.class.tanxian.getMax();
            var bg = me.ui.nodes.panel_xsrwdh;
            var dq = parseInt(100 * jifen_dq / jindu_max);
            var end = parseInt(100 * (jifen_dq+jifen_jia) / jindu_max);
            var jindu_dq = dq > 100 ? 100 : dq;
            var jindu_end = end > 100 ? 100 : end;

            bg.removeAllChildren();
            if(begin){
                var to2 = cc.progressFromTo(1, 0, jindu_dq);
            }else{
                var to2 = cc.progressFromTo(0.5, jindu_dq, jindu_end);
            }
            var right = new cc.ProgressTimer(new cc.Sprite('#img/tanxian/img_tanxian_xsrw.png'));
            right.type = cc.ProgressTimer.TYPE_RADIAL;
            // right.setReverseDirection(true);
            bg.addChild(right);
            right.x = bg.width/2;
            right.y = bg.height/2;
            if(jindu_end < 100){
                right.runAction(cc.sequence(to2, cc.callFunc(function (){
                    me.ui.nodes.txt_xsds.setString(P.gud.jifen);
                })));
            }else{
                right.runAction(cc.sequence(to2,cc.callFunc(function () {
                    G.class.ani.show({
                        json: "ani_tanxian_daojishi",
                        addTo: bg,
                        repeat: true,
                        autoRemove: false,
                    });
                    me.ui.nodes.txt_xsds.setString(P.gud.jifen);
                })));
            }
        },
        showSqAni: function () {
            var me = this;



            G.class.ani.show({
                json: "ani_jiesuoxinwanfa",
                addTo: me.ui.finds("panel_ui"),
                x: me.ui.finds("panel_ui").width / 2,
                y: me.ui.finds("panel_ui").height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.ui.finds("Panel_2").setBackGroundImage("img/jiesuojianzhu/img_shenbing.png", 1);
                    node.ui.finds("htx_3").hide();
                    node.ui.finds("Text_1").setString(L("SQ"));

                    me.ui.setTimeout(function () {
                        me.nodes.btn_sq.show();
                        G.view.mainView.ui.finds("btn_sq").show();
                        G.guidevent.emit("shenqianiover");
                        node.removeFromParent();
                    }, 1000);
                },
            });
        }
    });

G.frame[ID] = new fun('tanxian.json', ID);
})();