// created by LYF on 2018/6/5

(function () {
    //悬赏任务

    var ID = 'xuanshangrenwu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        getData : function(callback){
            var me = this;
            G.ajax.send('xstask_open',[],function(data){
                if(!data) return;
                var data = JSON.parse(data);
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.iszchd = data.d.iszchd > 0 ? data.d.iszchd / 100 : 1;
                    callback && callback();
                }
            },true);
        },
        shuaxinData: function(callback){
            var me = this;
            G.ajax.send("xstask_shuaxin", [], function (data) {
                if(!data) return;
                var data = JSON.parse(data);
                if(data.s == 1){
                    G.event.emit("sdkevent", {
                        event: "xstask_shuaxin",
                        data:{
                            consume: me.need,
                        }
                    });
                    me.isRank = true;
                    me.isSX = true;
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        bindUI: function () {
            var me = this;
            me.ui.nodes.mask.click(function(sender,type){
                if(G.frame.tanxian.isShow){
                    G.frame.tanxian.ui.nodes.txt_xsds.setString(P.gud.jifen);
                }
                me.remove();
            });
            //setPanelTitle(me.nodes.tip_title, L('UI_TITLE_XSRW'));
            me.nodes.tip_title.setString(L('UI_TITLE_XSRW'));
        },
        viewUI: function(){
            var me = this;
            me._view.nodes.btn2_on.click(function (sender, type) {
                me.setHaveZi();
                if(me.isZi){
                    G.frame.alert.data({
                        title: L("GM"),
                        cancelCall:null,
                        okCall: function () {
                            me.shuaxinData(function () {
                                me.setContents();
                                if(me.DATA.rfnum < 4) {
                                    me.getData(function () {
                                        me.checkCertainlyOrange();
                                    });
                                }
                            });
                        },
                        richText:L("RWZYZ"),
                    }).show();
                }else{
                    me.shuaxinData(function () {
                        me.setContents();
                        if(me.DATA.rfnum < 4) {
                            me.getData(function () {
                                me.checkCertainlyOrange();
                            });
                        }
                    });
                }
            });
            me._view.nodes.btn_tishi.click(function (sender, type) {
                // G.frame.alert.data({
                //     title: L("BZ"),
                //     richText: L("TS3"),
                // }).show();

                G.frame.help.data({
                    intr:L("TS3")
                }).show();
            });

            var btn_tq = me._view.nodes.btn_xuanshangrenwu_tq;
            me.adventure = me.DATA.adventure;
            me.hero = me.DATA.hero;
            if(me.DATA.adventure || me.DATA.hero){
                G.class.ani.show({
                    json: "ani_huiyuan",
                    addTo: me._view.ui,
                    x: btn_tq.getPositionX() + btn_tq.width/2 - 5,
                    y: btn_tq.getPositionY() - btn_tq.height/2 + 3,
                    repeat: true,
                    autoRemove: false,
                });
            }
            btn_tq.setEnabled(true);
            btn_tq.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    G.frame.tequanxiangqing.show();
                }else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_NOMOVE || type == ccui.Widget.TOUCH_CANCELED) {
                    me.ui.setTimeout(function () {
                        if (G.frame.tequanxiangqing.isShow) {
                            G.frame.tequanxiangqing.remove();
                        }
                    },100);
                }
            });

            me._view.nodes.btn2.click(function () {
                var getnum = 0;
                for(var i = 0; i < me.DATA.task.length; i++){
                    if(me.DATA.task[i].isjiequ && G.time >= me.DATA.task[i].ftime){
                        getnum++;
                    }
                }
                if(getnum == 0){
                    G.tip_NB.show(L("XUANSHANGBKL"));
                }else {
                    me.ajax('xstask_yjlingqu',[],function (str,data) {
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.refreshData();
                        }
                    });
                }
            })
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openxuanshang.mp3");
            me.bindUI();
            me.isRank = true;
            me.SXCONF = G.class.xuanshangrenwu.getConf();
            me.SXtype = 1;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            new X.bView("xuanshangrenwu.json", function (view) {
                me._view = view;
                me._view.nodes.scrollview_xuanshangrenwu.hide();
                me._view.finds("panel_db").setTouchEnabled(false);
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.viewUI();
                X.viewCache.getView("xuanshangrenwu_list.json", function (node) {
                    me.list = node.finds("list_nr");
                    me.setHaveZi();
                    me.setContents();
                    me.ui.setTimeout(function(){
                        G.guidevent.emit('xuanshangrenwuOpenOver');
                    },200);
                });
                me.checkCertainlyOrange();
            });
        },
        checkCertainlyOrange: function() {
            var me = this;

            if(me.DATA.hero && me.DATA.rfnum == 2) {
                me._view.nodes.txt_sxwz.setString(L("BC"));
            } else {
                me._view.nodes.txt_sxwz.setString(L("SX"));
            }
        },
        setHaveZi: function(){
            var me = this;
            var data = me.DATA.task;
            me.isZi = false;
            for(var i = 0; i < data.length; i ++){
                if(data[i].color >= 3 && data[i].isjiequ == 0){
                    me.isZi = true;
                    break;
                }
            }
        },
        showSX: function(){
            var me = this;
            me._view.nodes.txt_xssl.setString(G.class.getOwnNum(me.SXCONF.needitem[0].t, me.SXCONF.needitem[0].a));
            if(me.DATA.freenum <= 0){
                me._view.finds("txt_mfsx").hide();
                me._view.nodes.panel_xhsx.show();
                me._view.nodes.panel_xhsx.setTouchEnabled(false);
                if(G.class.getOwnNum(me.SXCONF.needitem[0].t, me.SXCONF.needitem[0].a) > 0){
                    me.SXtype = 2;
                    me._view.finds("panel_db").setBackGroundImage(G.class.getItemIco(me.SXCONF.needitem[0].t), 1);
                    // me._view.nodes.txt_xh.setString(me.SXCONF.needitem[0].n + "/" + G.class.getOwnNum(me.SXCONF.needitem[0].t, me.SXCONF.needitem[0].a));
                    me._view.nodes.txt_xh.setString(1);
                    me.need = me.SXCONF.needitem;

                }else{
                    me.SXtype = 3;
                    me._view.finds("panel_db").setBackGroundImage(G.class.getItemIco(me.SXCONF.needrmbmoney[0].t), 1);
                    me._view.nodes.txt_xh.setString(me.SXCONF.needrmbmoney[0].n);
                    me.need = me.SXCONF.needrmbmoney
                }
            }else{
                me._view.finds("txt_mfsx").show();
                me._view.nodes.panel_xhsx.hide();
                me.need = [];
            }
        },
        refreshData: function () {
            var me = this;

            me.getData(function () {
                me.setTaskList();
            });
        },
        setTaskList: function(){
            var me = this;
            var data = me.DATA.task;
            var view = me._view.nodes.listview_xuanshangrenwu;

            var jd_dq = P.gud.jifen;
            var jd_max = G.class.tanxian.getMax() + G.frame.tanxian.getVipAddJF();
            var pre = jd_dq / jd_max * 100;
            me._view.nodes.img_jdt1.setPercent(pre);
            me._view.nodes.txt_xsds.setString(jd_dq + "/" + jd_max);

            me.isZi = false;
            if(me.isRank){
                me.sortData(data);
                me.isRank = false;
            }

            view.removeAllChildren();
            cc.enableScrollBar(view);

            view.setItemsMargin(6);

            for(var i = 0; i < data.length; i ++){
                view.pushBackCustomItem(me.setTask(me.list.clone(), data[i], i));
            }
        },
        setTask: function(ui, data, index){
            var me = this;
            var conf = G.class.xuanshangrenwu.getConfById(data.taskid);

            X.autoInitUI(ui);
            X.alignItems(ui.nodes.ico_jlwp,data.prize,'left',{touch: true});
            X.enableOutline(ui.nodes.txt_djs,cc.color('#66370e'),2);
            ui.indexType = index;
            ui._id = data._id;
            ui.lv = data.color;
            ui.setSwallowTouches(false);
            ui.nodes.txt_djs.setFontSize(15);
            ui.nodes.ico_jlwp.setTouchEnabled(false);
            ui.nodes.wz_title.setString(conf.tasktitle);
            ui.nodes.wz_xhsl.setString(conf.need[0].n * me.iszchd);
            ui.nodes.btn2_on.hide();
            ui.finds("panel_xh").hide();
            ui.finds("token_xsds").loadTexture(G.class.getItem(conf.need[0].t, "attr").ico, 1);
            ui.nodes.bg_xuanshangrenwu_pj.setBackGroundImage("img/xuanshangrenwu/bg_xuanshangrenwu_" + (parseInt(conf.color) + 1) + ".png", 1);

            while (ui.getChildByTag(123123)) {
                ui.getChildByTag(123123).removeFromParent();
            }
            while (ui.getChildByTag(123234)) {
                ui.getChildByTag(123234).removeFromParent();
            }
            while (ui.nodes.img_xuanshangrenwu_jdt.getChildByTag(123345)) {
                ui.nodes.img_xuanshangrenwu_jdt.getChildByTag(123345).removeFromParent();
            }

            if(data.isAniJiequ){
                G.class.ani.show({
                    json: "ani_xuanshang_jsrw",
                    addTo: ui,
                    x: ui.width / 2,
                    y: ui.height / 2,
                    repeat: false,
                    autoRemove: true,
                    onload: function (node, action) {
                        node.setScaleX(1.2)
                    },
                    onend: function (node, action) {
                        data.isAniJiequ = false;
                    }
                });
            }

            if(data.isjiequ){
                if(data.ftime - G.time > 0){
                    var xh = 0;
                    var time = data.ftime - G.time;

                    for(var i in me.SXCONF.jiasuneed){
                        var rand = i.split("_");
                        var ms = time / 3600;
                        if(rand[0] <= ms && ms < rand[1]){
                            xh = me.SXCONF.jiasuneed[i][0].n;
                            break;
                        }
                    }

                    X.timeout(ui.nodes.txt_djs, data.ftime, function () {
                        setPanelTitle(ui.nodes.wz_djs, L("WC"));
                        ui.nodes.img_xuanshangrenwu_jdt.setPercent(100);
                        ui.nodes.btn3_on.hide();
                        ui.nodes.btn1_on.show();
                        G.setNewIcoImg(ui.nodes.btn1_on, .9);
                    });

                    ui.nodes.text_2.setString(xh);
                    X.enableOutline(ui.nodes.text_2, '#2a1c0f', 1);
                    ui.nodes.bg_xuanshangrenwu_jdt.show();
                    ui.nodes.img_xuanshangrenwu_jdt.setPercent(100 - time / conf.dotime * 100);
                    ui.nodes.btn3_on.show();
                    ui.nodes.btn3_on.click(function (sender, type) {
                        G.ajax.send("xstask_lingqu", [data._id, 1], function (d) {
                            if(!d) return;
                            var d = JSON.parse(d);
                            if(d.s == 1){
                                G.event.emit('sdkevent',{
                                    event:'xstask_lingqu',
                                    data:{
                                        xstaskLv:data.color,
                                        get:d.d,
                                    }
                                });
                                G.frame.jiangli.data({
                                    prize: d.d
                                }).show();
                                me.getData();
                                // me._view.nodes.listview_xuanshangrenwu.removeItemByTag(ui);
                                ui.removeFromParent();
                            }
                        })
                    });
                }else{
                    ui.nodes.bg_xuanshangrenwu_jdt.show();
                    ui.nodes.img_xuanshangrenwu_jdt.setPercent(100);
                    G.class.ani.show({
                        json: "ani_xuanshang_rwwc",
                        addTo: ui.nodes.img_xuanshangrenwu_jdt,
                        x: ui.nodes.img_xuanshangrenwu_jdt.width / 2,
                        y: ui.nodes.img_xuanshangrenwu_jdt.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            node.setTag(321321);
                        }
                    });
                    setPanelTitle(ui.nodes.txt_djs, L("WC"));
                    G.setNewIcoImg(ui.nodes.btn1_on, .9);
                    ui.nodes.btn1_on.show();
                    ui.nodes.btn1_on.setTitleColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn1_on.touch(function (sender, type) {
                        if(type == ccui.Widget.TOUCH_ENDED){
                            G.ajax.send("xstask_lingqu", [data._id, 0], function (d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1){
                                    G.event.emit('sdkevent',{
                                        event:'xstask_lingqu',
                                        data:{
                                            xstaskLv:data.color,
                                            get:d.d,
                                        }
                                    });
                                    G.frame.jiangli.data({
                                        prize:d.d
                                    }).show();
                                    me.getData();
                                    // me._view.nodes.listview_xuanshangrenwu.removeItemByTag(ui);
                                    ui.removeFromParent();
                                }
                            })
                        }
                    })
                }
            }else{
                ui.finds("panel_rwz").hide();
                ui.nodes.bg_xuanshangrenwu_jdt.hide();
                ui.finds("panel_xh").show();
                ui.nodes.btn1_on.hide();
                ui.nodes.btn2_on.show();
                ui.nodes.btn2_on.touch(function (sender, type) {
                    if(type == ccui.Widget.TOUCH_ENDED){
                        me.jiequTask = ui;
                        G.frame.xuanshangrenwu_jiequ.data({conf: conf, data: data}).show();
                    }
                })
            }
            return ui;
        },
        setContents:function() {
            var me = this;

            if(me.DATA.freenum && me.DATA.freenum < 1){
                me._view.node.btn2_on.finds("txt_mfsx").hide();
                me._view.node.panel_xhsx.show();
            }

            me.showSX();
            me.setTaskList();

            // me._view.nodes.txt_xsds.setString(P.gud.jifen);
        },
        sortData: function(data){
            var me = this;
            for(var i = 0; i < data.length; i ++){
                var p = data[i];
                if(p.isjiequ){
                    if(p.ftime - G.time <= 0){
                        p[2] = 1;
                    }else{
                        p[2] = 3;
                    }
                }else{
                    p[2] = 2
                }
                if(me.isSX){
                    data[i].isAni = true;
                }
            }
            data.sort(function (a, b) {
                if(a[2] != b[2]) {
                    return a[2] < b[2]? -1 : 1;
                } else {
                    return a.color * 1 > b.color * 1 ? -1 : 1;
                }

            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');

            G.hongdian.getData("xstask", 1);
        },
        jqTask: function (data) {
            var me = this;
            var ui;
            for(var i = 0; i < me._view.nodes.listview_xuanshangrenwu.getChildren().length; i ++){
                var chr = me._view.nodes.listview_xuanshangrenwu.getChildren()[i];
                if(chr._id == data._id){
                    ui = chr;
                    break;
                }
            }
            me.setTask(ui, data);
            var jd_dq = P.gud.jifen;
            var jd_max = G.class.tanxian.getMax() + G.frame.tanxian.getVipAddJF();
            var pre = jd_dq / jd_max * 100;
            me._view.nodes.img_jdt1.setPercent(pre);
            me._view.nodes.txt_xsds.setString(jd_dq + "/" + jd_max);
        }
    });

    G.frame[ID] = new fun('ui_tip7.json', ID);
})();