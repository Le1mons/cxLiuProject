/**
 * Created by YanJun on 12/21/15.
 */
(function () {
    //王者荣耀-钻石赛
    var ID ='wangzherongyao_zuanshisai';

    var fun = X.bUi.extend({
        ctor: function (json,id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f5";
            me._super(json,id);
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.showToper();
        },
        onAniShow : function(){
            var me = this;
            me.getData(function () {
                if (me.DATA.timelist[0][1] > G.time){
                    me.ui.nodes.btn_1.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    me.ui.nodes.btn_2.disable = true;
                }else {
                    if (me.ui.nodes.btn_2.disable) {
                        G.tip_NB.show(L('WZRY_JSKQ'));
                        me.ui.nodes.btn_2.disable = false;
                    }
                    me.ui.nodes.btn_2.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
                me.updateData();
            });
            // G.playEffect('sound/jingyingfuben.mp3', false);
        },
        checkShow: function(callback) {
            var me = this;

            me.getData(function() {
                if (X.keysOfObject(me.DATA).length > 0) me.show();
                else {
                    callback && callback();
                }
            });
        },
        onHide: function () {
            var me = this;
            if (me.regetDataTimer){
                me.ui.clearTimeout(me.regetDataTimer);
                delete me.regetDataTimer;
            }
        },
        onClose: function () {

        },
        initUi: function () {
            var me = this;

            me.panel_fzs = me.ui.nodes.panel_fzs;
            me.panel_js = me.ui.nodes.panel_js1;
            X.autoInitUI(me.panel_fzs);
            X.autoInitUI(me.panel_js);

            me.panel_fzs.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.ui.nodes.scrollview,false);
            cc.enableScrollBar(me.ui.nodes.listview_js,false);
            me.setTitle();
        },
        bindBtn : function(){
            var me = this;
            me.ui.nodes.btn_fanhui.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    me.remove();
                }
            });

            X.radio([me.ui.nodes.btn_1,me.ui.nodes.btn_2], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_1$: 0,
                    btn_2$: 1,
                };
                if (sender.disable){
                    G.tip_NB.show(L('WZRY_JSWKQ'));
                    me.ui.nodes["btn_" + (me._curType + 1)].setBright(false);
                    return;
                }
                me.changeType(name2type[name]);
            });

        },
        changeType : function(type){
            var me = this;
            me._curType = type;
            me.panel_fzs.hide();
            me.panel_js.hide();
            switch (type){
                case 0:
                    me.setFZS();
                    me.panel_fzs.show();
                    break;
                case 1:
                    me.setJS();
                    me.panel_js.show();
                    break;
            }

            // me.action.play('scrollviewup',false);
        },
        setTitle: function () {
            var me = this;
            // me.ui.nodes.title.setString(L('WZRY_ZZS'));
            me.panel_js.nodes.img_wzdi.show();
            me.panel_fzs.nodes.zss_wz.show();
            me.panel_js.nodes.zss_wz.show();
        },
        getData : function(callback,forceLoad){
            //forceLoad 是否强制读取
            var me = this;
            var group = me.data();
            G.DATA.wzry_zss = G.DATA.wzry_zss || {};
            if(!forceLoad && G.DATA.wzry_zss[group]){
                me.DATA = G.DATA.wzry_zss[group];
                if (me.DATA.nexttime <= G.time){
                    me.getData(function () {
                        callback && callback();
                    },true);
                }else {
                    me.setPlayerData();
                    callback && callback();
                }
                return;
            }
            G.ajax.send('crosswz_matchdata',['zuanshi',group],function(d){
                var data = JSON.parse(d);
                if (data.s == 1) {
                    G.DATA.wzry_zss[group] = data.d;
                    me.DATA = G.DATA.wzry_zss[group];
                    me.setPlayerData();
                    callback && callback();
                }
            });
        },
        updateData: function () {
            var me = this;
            if (me.DATA.nexttime > G.time && !me.regetDataTimer){
                me.regetDataTimer = me.ui.setTimeout(function () {
                    delete me.regetDataTimer;
                    me.getData(function () {
                        me.updateData();
                    },true);
                },0,0,me.DATA.nexttime - G.time);
            }
        },
        setPlayerData: function () {
            var me = this;
            var d = me.DATA.userlist;
            var list = {},
                deepList = {},
                deepKeys = [];
            for (var i in d){
                list[d[i].uid] = d[i];
                if (deepList[d[i].deep] == undefined){
                    deepList[d[i].deep] = [];
                }
            }
            for (var i in d){
                for (var k in deepList){
                    if (d[i].deep >= k*1){
                        deepList[k].push(d[i].uid);
                    }
                }
            }
            deepKeys = X.keysOfObject(deepList);
            deepKeys.sort(function (a, b) {
                return a*1 - b*1;
            });
            me.DATA.playerList = list;
            me.DATA.deepList = deepList;
            me.DATA.deepKeys = deepKeys;
        },
        //分组赛
        setFZS: function () {
            var me = this;
            var panel = me.panel_fzs;
            var scrollView = panel.nodes.scrollview;
            var list = panel.nodes.list;
            var d = me.DATA;
            if(!d) return;
            var time = d.timelist[0];
            // if (!me.tableView || !me.tableView.isEnabled()){
            //     me.tableView = new X.TableView(scrollView,list,1,function (ui, data) {
            //         for (var i = 0; i < 2; i++){
            //             var group = ui.finds('list' + (i + 1) + "$");
            //             X.autoInitUI(group);
            //             group.nodes.wz.setString(L(['a','b','c','d'][data]) + (i + 1) + L('zhu'));
            //             var xz1 = group.nodes.xz,
            //                 xz2 = group.nodes.xz1,
            //                 ck = group.nodes.ck;
            //             xz1.hide();
            //             xz2.hide();
            //             ck.hide();
            //
            //             var winside = 0,
            //                 winuid;
            //             for (var j = 0; j < 2; j++){
            //                 var wj = group.nodes['wj' + (j?j:'')];
            //                 var uid = d.deepList[d.deepKeys[0]][data*4 + i * 2 + j];
            //                 me.setWJ(wj,uid);
            //                 if (d.playerList[uid].deep > d.deepKeys[0]){
            //                     winside = j;
            //                     winuid = uid;
            //                 }
            //             }
            //
            //             if (time[0] <= G.time){
            //                 me.setCK(ck, uid, d.deepKeys[0]);
            //                 if (time[1] <= G.time){
            //                     if (winside == 0) {
            //                         xz1.show();
            //                     } else if (winside == 1) {
            //                         xz2.show();
            //                     }
            //                 }
            //             }
            //         }
            //     });
            //     me.tableView.setData([0,1,2,3]);
            //     me.tableView.reloadDataWithScroll(true);
            // }
            function setItem(ui, data) {
                X.autoInitUI(ui);
                for (var i = 0; i < 2; i++) {
                    var group = ui.nodes['list' + (i + 1)];
                    X.autoInitUI(group);
                    group.nodes.wz.setString(L(['a', 'b', 'c', 'd'][data]) + (i + 1) + L('zhu'));
                    var xz1 = group.nodes.xz,
                        xz2 = group.nodes.xz1,
                        ck = group.nodes.ck;
                    xz1.hide();
                    xz2.hide();
                    ck.show();
                    ck.vis = false;

                    var winside = 0,
                        winuid;
                    for (var j = 0; j < 2; j++) {
                        var wj = group.nodes['wj' + (j ? j : '')];
                        var uid = d.deepList[d.deepKeys[0]][data * 4 + i * 2 + j];
                        me.setWJ(wj, uid);
                        if (d.playerList[uid].deep > d.deepKeys[0]) {
                            winside = j;
                            winuid = uid;
                        }
                    }


                    me.setCK(ck, uid, d.deepKeys[0]);
                    if (time[0] <= G.time) {
                        ck.vis = true;
                        if (time[1] <= G.time) {
                            if (winside == 0) {
                                xz1.show();
                            } else if (winside == 1) {
                                xz2.show();
                            }
                        }
                    }
                }
            }

            if (!me.tableView || !me.tableView.isEnabled()){
                me.tableView = new X.TableView(scrollView,list,1,function (ui, data) {
                    setItem(ui,data);
                });
                me.tableView.setData([0,1,2,3]);
                me.tableView.reloadDataWithScroll(true);
            }
        },
        //决赛
        setJS: function () {
            var me = this;
            var panel = me.panel_js;
            var d = me.DATA;
            me.setGJ();
            if(!d) return;
            var userList = d.deepList;
            //玩家
            for (var i = 0; i < 4; i++){
                var group = panel.nodes['list' + (i + 1)];
                X.autoInitUI(group);
                for (var j = 0; j < 2; j++){
                    var wj = group.nodes['wj' + (j?j:'')];
                    me.setWJ(wj,userList[d.deepKeys[1]][i*2 + j]);
                }
            }
            //线
            var idx = 0;
            for (var i = 1; i < 4; i++){
                var time = d.timelist[i];
                var deep = d.deepKeys[i+1];
                var ul = userList[deep];
                for (var j in ul){
                    var uid = ul[j];
                    idx++;
                    var xz1 = panel.nodes[X.STR('xz{1}_1', idx)],
                        xz2 = panel.nodes[X.STR('xz{1}_2', idx)],
                        ck = panel.nodes['ck' + idx];
					if(!xz1)continue;
					if(!xz2)continue;
                    xz1.hide();
                    xz2.hide();
                    ck.show();
                    ck.vis = false;
                    me.setCK(ck, uid, d.deepKeys[i]);
                    if (time[0] <= G.time) {
                        ck.vis = true;
                        if (time[1] <= G.time){
                            var winside = X.arrayFind(userList[d.deepKeys[i]],uid)%2;
                            if (winside == 0) {
                                xz1.show();
                            } else if (winside == 1) {
                                xz2.show();
                            }
                            if (i == 3){
                                var xz8 = panel.nodes.xz8;
                                xz8.show();
                                me.setGJ(userList[d.deepKeys[d.deepKeys.length - 1]][0]);
                            }
                        }
                    }
                }
            }
            var ui = me.panel_js.nodes.gjd;
            X.autoInitUI(ui);
            if (!cc.sys.isObjectValid(ui.nodes.gj.ani)){
                // G.class.ani.show({
                //     json:'ani_zuanshisai',
                //     addTo:ui.nodes.gj,
                //     x:69,
                //     y:135,
                //     repeat:true,
                //     autoRemove:false,
                //     onload: function (node, action) {
                //         ui.nodes.gj.ani = node;
                //     }
                // });
            }
        },
        //玩家
        setWJ: function (wj, uid) {
            var me = this;
            X.autoInitUI(wj);
            var data = me.DATA.playerList[uid];
            wj.nodes.ico.removeAllChildren();
            var head = G.class.shead(data,false);
            head.setAnchorPoint(0,0);
            wj.nodes.ico.addChild(head);
            wj.nodes.name.setString(data.name);
            wj.nodes.qf1.setString(data.ext_servername || "");
            wj.nodes.txt_zl.setString(data.zhanli || "");
            wj.setTouchEnabled(true);
            wj.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED){
                    G.ajax.send('crosswz_userdetails',[uid],function(rd) {
                        rd = X.toJSON(rd);

                        if (rd.s === 1) {
                            //玩家信息
                            G.frame.wangzherongyao_wjxx.data({frame:me.ID(), data: rd.d}).show();
                            }
                    },true);
                }
            });
        },
        //查看
        setCK: function (ck, uid, deep) {
            var me = this;
            // ck.show();
            // ck.vis = true;
            ck.setSwallowTouches(false);
            ck.uid = uid;
            ck.deep = deep;
            ck.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.vis){
                        G.frame.wangzherongyao_log.data({uid:sender.uid,deep:sender.deep,frame:me.ID()}).show();
                    }else{
                        G.tip_NB.show(L('WZRY_DDJS'));
                    }
                }
            });
        },
        //冠军
        setGJ: function (uid) {
            var me = this;
            var ui = me.panel_js.nodes.gjd;
            X.autoInitUI(ui);
            ui.nodes.gj.show();
            if (!uid){
                ui.nodes.wgj.show();
                ui.nodes.xwyd.show();
                ui.nodes.ico_zl.hide();
                ui.nodes.txt_zl.hide();
                ui.nodes.img_zldi.hide();
            }else{
                ui.nodes.wgj.hide();
                ui.nodes.xwyd.hide();
                ui.nodes.ico.setTouchEnabled(false);
                me.setWJ(ui.nodes.gj,uid);
                ui.nodes.ico_zl.show();
                ui.nodes.txt_zl.show();
                ui.nodes.img_zldi.show();
            }
        }
    });

    G.frame[ID] = new fun('wangzherongyao_zzsfz.json', ID);

    //王者荣耀-王者赛
    var ID1 ='wangzherongyao_wangzhesai';
    var fun1 = fun.extend({
        setTitle: function () {
            var me = this;
            // me.ui.nodes.title.setString(L('WZRY_WZS'));
            // me.panel_fzs.nodes.img_wzdi.loadTexture('img/wangzherongyao/wzs_bg1.png',ccui.Widget.PLIST_TEXTURE);
            // me.panel_js.nodes.img_wzdi.loadTexture('img/wangzherongyao/wzs_bg2.png',ccui.Widget.PLIST_TEXTURE);
            me.panel_js.nodes.wzjs.show();
            me.panel_fzs.nodes.wzjs.show();
        },
        onHide: function () {
            var me = this;
            me._super();
            delete G.DATA.wzry_wzs;
        },
        onClose: function () {
            var me = this;
            me._super();
            delete G.DATA.wzry_wzs;
        },
        getData : function(callback,forceLoad){
            //forceLoad 是否强制读取
            var me = this;
            if(!forceLoad && G.DATA.wzry_wzs){
                me.DATA = G.DATA.wzry_wzs;
                me.setPlayerData();
                callback && callback();
                return;
            }
            G.ajax.send('crosswz_matchdata',['wangzhe'],function(d){
                var data = JSON.parse(d);
                if (data.s == 1) {
                    G.DATA.wzry_wzs = data.d;
                    me.DATA = G.DATA.wzry_wzs;
                    me.setPlayerData();
                    callback && callback();
                }
            });
        }
    });
    G.frame[ID1] = new fun1('wangzherongyao_zzsfz.json', ID1);
})();
