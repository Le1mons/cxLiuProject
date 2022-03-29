/**
 * Created by wfq on 2018/6/5.
 */
(function () {
    //英雄-种族-选择
    G.class.yingxiong_zhongzu_xuanze = X.bView.extend({
        extConf:{
            fight:{
                data: function (type) {
                    var data = G.DATA.yingxiong.list;
                    var keys = X.keysOfObject(data);

                    var arr = [];
                    if (type == 0) {
                        arr = keys;
                        if(G.frame.yingxiong_fight.data().pvType == "pvshizijun"){
                            var arr1 = [];
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.lv > 39) {
                                    arr1.push(tid);
                                }
                            }
                            arr = arr1;
                        }
                    } else {
                        if(G.frame.yingxiong_fight.data().pvType == "pvshizijun"){
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type && heroData.lv > 39) {
                                    arr.push(tid);
                                }
                            }
                        }else{
                            for (var i = 0; i < keys.length; i++) {
                                var tid = keys[i];
                                var heroData = data[tid];
                                if (heroData.zhongzu == type) {
                                    arr.push(tid);
                                }
                            }
                        }

                    }

                    return arr;
                },
                getSort: function (arr, str1, str2, str3, str4, str5) {
                    var data = [];
                    var heroData = [];
                    var hidData = [];
                    var sortArr = [];
                    var zz = {
                        5:0, //神圣
                        6:1, //暗影
                        4:2, //自然
                        3:4, //邪能
                        2:5, //奥术
                        1:6 //亡灵
                    };
                    for(var i = 0; i < arr.length; i ++){
                        heroData.push(G.DATA.yingxiong.list[arr[i]]);
                        if(!heroData[i].tid) heroData[i].tid = arr[i];
                    }
                    
                    heroData.sort(function (a, b) {
                        if(a.star != b.star) {
                            return a.star > b.star ? -1 : 1;
                        } else if(a.lv != b.lv) {
                            return a.lv > b.lv ? -1 : 1;
                        } else if(a.zhanli != b.zhanli) {
                            return a.zhanli > b.zhanli ? -1 : 1;
                        } else if(a.zhongzu != b.zhongzu) {
                            return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                        } else {
                            return a.hid > b.hid ? -1 : 1;
                        }
                    });

                    // for(var i = 0; i < data.length; i ++){
                    //     var dd = data[i];
                    //     cc.log("名字：" + dd.name + ", 星级：" + dd.star + ", 等级：" + dd.lv + ", 战力：" + dd.zhanli);
                    // }
                    for(var i = 0; i < heroData.length; i ++){
                        hidData.push(heroData[i].tid);
                    }
                    return hidData;
                }
            }
        },
        
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('ui_tip3_shang.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.fightData = G.frame.yingxiong_fight.data();
            if(me.fightData.pvType == "pvshizijun"){
                me.status = G.frame.shizijunyuanzheng.DATA.status;
                me.inStatus = X.keysOfObject(me.status);
            }
            me.createMenu();
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var cacheArr = [];
            var cache = {};
            if (me.fightData.defhero) {
                cache = me.fightData.defhero;
            } else {
                //战斗站位缓存
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
            }
            if (cache) {
                if(me.fightData.pvType == "pvshizijun"){
                    for(var id in cache){
                        var tid = cache[id];
                        if(((me.status[tid] && me.status[tid].hp > 0) || !me.status[tid]) && G.DATA.yingxiong.list[tid]){
                            cacheArr.push(tid);
                        }
                    }
                }else{
                    for (var id in cache) {
                        var tid = cache[id];
                        if (G.DATA.yingxiong.list[tid]) {
                            cacheArr.push(tid);
                        }
                    }
                }

            }
            me.selectedData = cacheArr;

            var type = me.curType || 0;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        createMenu: function () {
            var me = this;

            var view = me;
            me._menus = [];
            var listview = view.nodes.listview_zz;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            view.nodes.list_ico.hide();

            //图标中，1指的是全部
            for (var i = 0; i < 7; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.nodes.panel_zz.setScale(0.8);
                list_ico.show();

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;

                                    }
                                })
                            }
                        }else{
                            //node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                    //sender.nodes.img_yuan_xz.show();
                });

                me._menus.push(list_ico);
                listview.pushBackCustomItem(list_ico);
                list_ico.show();
            }
        },
        fmtItemList: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            me.nodes.list.hide();

            var d = me.extConf[me._type].data(me.curType);

            if (d.length < 1) {
                me.ui.finds('img_zwnr').show();
                return;
            } else {
                me.ui.finds('img_zwnr').hide();
            }

            var data = me.extConf[me._type].getSort(d, "star", "lv", "zhanli", "zhongzu", "hid");
            me._headUI = [];
            var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,me.fightData.pvType == "pvshizijun" ? 15 : 1,5);
            table.setData(data);
            table.reloadDataWithScroll(true);
            //scrollview.getChildren()[0].getChildren()[0].setPositionX(1);
        },
        setItem: function (ui, data) {
            var me = this;
			
			//记录第一个头像，便于新手指导中直接指向
			if(me._headUI.length<6){
				me._headUI.push(ui);
			}
			
            X.autoInitUI(ui);
            var heroData = G.DATA.yingxiong.list[data];
            ui.setName(heroData.hid);

            var widget = G.class.shero(heroData);
            var hp = 100;
            widget.setName('widget');
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            if(me.fightData.pvType == "pvshizijun"){
                widget.setScale(0.9);
                if(X.inArray(me.inStatus, data)){
                    hp = me.status[data].hp == 0? 0 : me.status[data].hp / me.status[data].maxhp * 100;
                    widget.setHP(hp, true);
                }else{
                    widget.setHP(hp, true);
                }
            }else{
                widget.setScale(0.9);
            }
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

            ui.nodes.panel_ico.setTouchEnabled(false);
            ui.nodes.panel_ico.show();

            // 任务中
            var imgRwz = ui.nodes.img_rwz;

            imgRwz.hide();
            //widget.setHighLight(true);
            // widget.panel_tx.setBright(true);

            if (X.inArray(me.selectedData,data)) {
                widget.setGou(true);
                //widget.setHighLight(false);
            }
            if(hp <= 0){
                ui.nodes.img_yzw.show();
                ui.nodes.img_yzw.setScale(.9);
                ui.nodes.img_yzw.y += 4;
                widget.setEnabled(false);
            }else{
                ui.nodes.img_yzw.hide();
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition()));
                    if (X.inArray(me.selectedData, sender.data)) {
                        G.frame.yingxiong_fight.posSelect.x += sender.width / 2;

                        sender.finds('widget').setGou(false);
                        // widget.panel_tx.setBright(true);
                        //sender.finds('widget').setHighLight(true);
                        me.selectedData.splice(X.arrayFind(me.selectedData,sender.data),1);
                        G.frame.yingxiong_fight.top.removeItem(sender.data);
                    } else {
                        if (me.selectedData.length >= G.frame.yingxiong_fight.top.extConf.maxnum) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }
                        if(hp <= 0){
                            G.tip_NB.show(L("YX_YZW"));
                            return;
                        }

                        me.selectedData.push(sender.data);
                        sender.finds('widget').setGou(true);
                        // widget.panel_tx.setBright(false);
                        //sender.finds('widget').setHighLight(false);
                        G.frame.yingxiong_fight.top.addItem(sender.data);

                        //移动动画所需数据
                        if (cc.isNode(G.frame.yingxiong_fight.item)) {
                            G.frame.yingxiong_fight.item.stopAllActions();
                            G.frame.yingxiong_fight.item.removeFromParent();
                        }
                        var itemClone = G.frame.yingxiong_fight.item = sender.clone();
                        //itemClone.finds('black').hide();
                        itemClone.finds('gou').hide();
                        itemClone.setPosition(G.frame.yingxiong_fight.posSelect);
                        G.frame.yingxiong_fight.ui.addChild(itemClone);
                        G.frame.yingxiong_fight.playAniMove(itemClone);
                    }
                }
            });

            ui.show();
        },
        removeGou: function (tid) {
            var me = this;

            var child = me.getChildByTid(tid);
            if (child) {
                me.ui.setTimeout(function () {
                    child.finds('widget').setGou(false);
                    child.finds('widget').setHighLight(true);
                }, 180);
            }


            // var children = me.table.getAllChildren();
            // for (var i = 0; i < children.length; i++) {
            //     var child = children[i];
            //     if (child.isVisible() && child.data == tid) {
            //         // child.finds('widget').setGou(false);
            //         // child.finds('widget').setHighLight(true);
            //         me.ui.setTimeout(function () {
            //             child.finds('widget').setGou(false);
            //             child.finds('widget').setHighLight(true);
            //         },180);

            //         G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
            //         G.frame.yingxiong_fight.posSelect.x += child.width / 2;
            //         break;
            //     }
            // }
        },
        getChildByTid:function (tid) {
            var me = this;

            var cd = null;
            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.data == tid) {
                    
                    cd = child;
                    break;
                }
            }

            return cd;
        }
    });

})();
