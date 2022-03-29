/**
 * Created by LYF on 2018/6/5.
 */
(function () {
    //英雄上阵选择
    G.class.xstask_check = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('xuanshangrenwu_tip_dcyq.json');
        },
        refreshPanel: function () {
            var me = this;
        },
        bindBTN: function () {
            var me = this;
            //一键上阵
            me.nodes.btn_1.click(function (sender, type) {
                me.isAllHero = true;
                me.isStar = false;
                for(var i in me.heroArr){
                    if(me.heroArr[i].data){
                        me.removeItem(me.heroArr[i].data);
                    }
                }
                me.heroArr = [];
                for(var i = 0; i < me.conf.heronum; i ++){
                    var list = me.nodes.list_yx.clone();
                    list.setBackGroundImage('img/public/ico/ico_bg0.png',1);
                    me.heroArr.push(list);
                    list.show();
                    me.setTouch(list);
                }
                X.center(me.heroArr, me.nodes.panel_tb, {

                });

                var sz = [];
                var heroList = G.DATA.yingxiong.list;
                var keys = X.keysOfObject(heroList);
                var tiaojian = me.tiaojianArr;
                for(var i = 1, n = 0; n < me.conf.heronum; i ++,n++){
                    if(!tiaojian[i]) break;
                    var ok = [];
                    for(var j = 0; j < keys.length; j ++){
                        var dd = heroList[keys[j]][tiaojian[i][0]];
                        if(tiaojian[i][0] == "zhongzu"){
                            var aa = heroList[keys[j]][tiaojian[i][0]];
                            if(heroList[keys[j]][tiaojian[i][0]] == tiaojian[i][1]){
                                ok.push(heroList[keys[j]]);
                            }
                        }
                    }
                    if(ok.length !== 0){
                        ok.sort(function (a, b) {
                            return a.zhanli < b.zhanli? -1 : 1;
                        });
                        if(me.isStar == false){
                            var is = false;
                            for(var t = 0; t < ok.length; t ++){
                                if(ok[t].star >= me.tiaojianArr[0][1]
                                    && X.inArray(G.frame.xuanshangrenwu.DATA.herolist, ok[t].tid) == false){
                                    sz.push(ok[t].tid);
                                    is = true;
                                    me.isStar = true;
                                    break;
                                }
                            }
                            if(is == false){
                                for(var o in ok){
                                    var a = ok[o].tid;
                                    if(X.inArray(sz, ok[o].tid) == false
                                        && X.inArray(G.frame.xuanshangrenwu.DATA.herolist, ok[o].tid) == false){
                                        sz.push(ok[o].tid);
                                        break;
                                    }
                                }
                            }
                        }else{
                            for(var o in ok){
                                if(X.inArray(sz, ok[o].tid) == false
                                    && X.inArray(G.frame.xuanshangrenwu.DATA.herolist, ok[o].tid) == false){
                                    sz.push(ok[o].tid);
                                    break;
                                }
                            }
                        }

                    }
                }
                function f() {
                    if(sz.length < me.conf.heronum){
                        var hero = G.DATA.yingxiong.list;
                        var keys = X.keysOfObject(hero);
                        var arr = [];
                        for(var i = 0; i < keys.length; i ++){
                            arr.push(hero[keys[i]]);
                        }
                        arr.sort(function (a, b) {
                           return a.star < b.star ? -1 : 1;
                        });
                        for(var i = 0; i < arr.length; i++){
                            if(!X.inArray(sz, arr[i].tid)
                                && !X.inArray(G.frame.xuanshangrenwu.DATA.herolist, arr[i].tid)
                                && arr[i].star >= me.tiaojianArr[0][1]){
                                me.isStar = true;
                                sz.push(arr[i].tid);
                                break;
                            }
                        }
                    }
                }
                if((sz.length < tiaojian.length) && !me.isStar){
                    f();
                }
                if(sz.length < 1){
                    G.tip_NB.show(L("SZYXBZ"));
                    return;
                }

                for(var i in sz){
                    me.addItem(sz[i]);
                    G.frame.xuanshangrenwu_jiequ.top.selectedData.push(sz[i]);
                    G.frame.xuanshangrenwu_jiequ.top.addGou(sz[i]);
                }
                me.isStar = false;
            }, 200);
            //开始
            me.nodes.btn_2.click(function (sender, type) {
                var heroId = [];
                for(var i in me.heroArr){
                    if(!!me.heroArr[i].data){
                        heroId.push(me.heroArr[i].data)
                    }
                }
                G.ajax.send("xstask_jiequ", [me.data._id, heroId], function (data) {
                    if(!data) return;
                    var data = JSON.parse(data);
                    if(data.s == 1){
                        me.isAni = true;
                        G.frame.xuanshangrenwu.getData();
                        var conf = G.class.xuanshangrenwu.getConfById(me.data.taskid);
                        me.data.isjiequ = 1;
                        me.data.ftime = G.time + conf.dotime;
                        me.data.isAniJiequ = true;
                        G.frame.xuanshangrenwu.jqTask(me.data);
                        G.frame.xuanshangrenwu_jiequ.remove();
                        if(G.frame.tanxian.isShow) {
                            G.frame.tanxian.yuan_jdl(P.gud.jifen, 0 - me.conf.need[0].n, 0);
                        }
                    }
                })
            });
        },
        onOpen: function () {
            var me = this;
            me.isAni = false;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.listview_zz);
            me.heroArr = [];
            me.tiaojianArr = [];
            me.zhongZuIcon = [];
            me.data = G.frame.xuanshangrenwu_jiequ.data().data;
            me.conf = G.frame.xuanshangrenwu_jiequ.data().conf;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var keys = X.keysOfObject(me.data.cond);
            me.nodes.txt_ds.setString(P.gud.jifen + "/" + me.conf.need[0].n * G.frame.xuanshangrenwu.iszchd);
            me.nodes.txt_djs.setString(me.conf.dotime / 3600 + L("XS"));
            me.ui.finds("txt_dcys").show();
            me.ui.finds("txt_dcys").setTextColor(cc.color(G.gc.COLOR[5]));
            me.nodes.txt_ds.setTextColor(cc.color(me.conf.need[0].n * G.frame.xuanshangrenwu.iszchd > P.gud.jifen? '#FF3D23' : '#804326'));

            for(var i = 0;i < me.conf.heronum;i ++){
                var list = me.nodes.list_yx.clone();
                list.setBackGroundImage('img/public/ico/ico_bg0.png', 1);
                me.heroArr.push(list);
                me.setTouch(list);
                list.show();
            }
            X.center(me.heroArr, me.nodes.panel_tb, {

            });

            for(var i = 0; i < keys.length; i ++){
                if(me.data.cond[keys[i]].length == undefined){
                    me.tiaojianArr.push([keys[i], me.data.cond[keys[i]], "_h"]);
                }else{
                    for(var j = 0; j < me.data.cond[keys[i]].length; j ++){
                        me.tiaojianArr.push([keys[i], me.data.cond[keys[i]][j], "_h"]);
                    }
                }
            }
            me.tiaojianArr.sort(function (a, b) {
                return a[0] < b[0]? -1 : 1;
            });
            for(var i = 0;i < me.tiaojianArr.length; i ++){
                var icon = me.nodes.list_ico.clone();
                if(me.tiaojianArr[i][0] == "star"){
                    icon.setBackGroundImage("img/public/ico/ico_xj" + (parseInt(me.tiaojianArr[i][1]) + 1) + me.tiaojianArr[i][2] + ".png", 1);
                }else if(me.tiaojianArr[i][0] == "zhongzu"){
                    icon.setBackGroundImage("img/public/ico/ico_zz" + (parseInt(me.tiaojianArr[i][1]) + 1) + me.tiaojianArr[i][2] + ".png", 1);
                }
                me.zhongZuIcon.push(icon);
            }
            X.center(me.zhongZuIcon, me.nodes.panle_tb2, {
                scale:0.8
            });

        },
        removeItem: function (tid) {
            var me = this;

            var itemArr = me.heroArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (item.data && item.data == tid) {
                    var layIco = item.getChildren()[0];
                    var idx = X.arrayFind(G.frame.xuanshangrenwu_jiequ.top.selectedData,tid);
                    if (idx > -1) {
                        G.frame.xuanshangrenwu_jiequ.top.selectedData.splice(idx, 1);
                        G.frame.xuanshangrenwu_jiequ.top.removeGou(tid);
                    }
                    var child = G.frame.xuanshangrenwu_jiequ.top.getChildByTid(tid);
                    if(child){
                        G.frame.xuanshangrenwu_jiequ.posSelect = G.frame.xuanshangrenwu_jiequ.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                        G.frame.xuanshangrenwu_jiequ.posSelect.x += child.width / 2;
                    }
                    if(cc.isNode(G.frame.xuanshangrenwu_jiequ.item)){
                        G.frame.xuanshangrenwu_jiequ.item.stopAllActions();
                        G.frame.xuanshangrenwu_jiequ.item.removeFromParent();
                    }
                    G.frame.xuanshangrenwu_jiequ.playAniType = "remove";
                    G.frame.xuanshangrenwu_jiequ.posSz = G.frame.xuanshangrenwu_jiequ.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    var itemClone = G.frame.xuanshangrenwu_jiequ.item = layIco.clone();
                    itemClone.setPosition(G.frame.xuanshangrenwu_jiequ.posSz);
                    G.frame.xuanshangrenwu_jiequ.ui.addChild(itemClone);
                    G.frame.xuanshangrenwu_jiequ.playAniMove(itemClone);

                    delete item.data;
                    item.removeAllChildren();
                }
            }
            me.checkIsOk();
        },
        addItem: function (tid) {
            var me = this;

            var itemArr = me.heroArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = tid;
                    var dd = G.DATA.yingxiong.list[tid];
                    var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                    wid.setAnchorPoint(0.5,1);
                    wid.setPosition(cc.p(item.width / 2,item.height));
                    item.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);
                    G.frame.xuanshangrenwu_jiequ.playAniType = "add";
                    G.frame.xuanshangrenwu_jiequ.posSz = G.frame.xuanshangrenwu_jiequ.ui.convertToNodeSpace(wid.getParent().convertToWorldSpace(wid.getPosition()));
                    G.frame.xuanshangrenwu_jiequ.posSz.x -= wid.width / 2;
                    break;
                }
            }
            me.checkIsOk();
        },
        checkIsOk: function () {
            var me = this;
            var isOk = true;
            me.zhongZuIcon = [];
            for(var i = 0;i < me.tiaojianArr.length; i ++){
                var icon = me.nodes.list_ico.clone();
                me.tiaojianArr[i][2] = "_h";
                if(me.tiaojianArr[i][0] == "star"){
                    for(var j in me.heroArr){
                        if(me.heroArr[j].data &&
                            G.DATA.yingxiong.list[me.heroArr[j].data].star >= me.tiaojianArr[i][1]){
                            me.tiaojianArr[i][2] = "";
                        }
                    }
                    icon.setBackGroundImage("img/public/ico/ico_xj" + (parseInt(me.tiaojianArr[i][1]) + 1) + me.tiaojianArr[i][2] + ".png", 1);
                }else{
                    for(var j in me.heroArr){
                        if(me.heroArr[j].data &&
                            G.DATA.yingxiong.list[me.heroArr[j].data].zhongzu == me.tiaojianArr[i][1]){
                            me.tiaojianArr[i][2] = "";
                        }
                    }
                    icon.setBackGroundImage("img/public/ico/ico_zz" + (parseInt(me.tiaojianArr[i][1]) + 1) + me.tiaojianArr[i][2] + ".png", 1);
                }
                me.zhongZuIcon.push(icon);
            }
            X.center(me.zhongZuIcon, me.nodes.panle_tb2, {
                scale: 0.8
            });
            for(var i in me.tiaojianArr){
                if(me.tiaojianArr[i][2] == "_h"){
                    isOk = false;
                    break;
                }
            }
            var txtYaoqiu = me.ui.finds("txt_dcys");
            txtYaoqiu.show();
            if(isOk){
                txtYaoqiu.setTextColor(cc.color(G.gc.COLOR[1]));
            }else{
                // me.ui.finds("txt_dcys").hide();
                txtYaoqiu.setTextColor(cc.color(G.gc.COLOR[5]));
            }
            // if(isOk){
            //     me.ui.finds("txt_dcys").show();
            // }else{
            //     me.ui.finds("txt_dcys").hide();
            // }
        },
        setTouch: function (list) {
            var me = this;
            var bPos, cloneItem, pos;
            list.setTouchEnabled(true);
            list.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    if(sender.data){
                        me.removeItem(list.data);
                    }
                }
            });
        },
    });
})();