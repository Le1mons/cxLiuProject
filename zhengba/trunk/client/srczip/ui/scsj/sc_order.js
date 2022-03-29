(function () {
    //神宠--开战前的神宠技能预览
    var ID = 'sc_order';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn:function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.ajax("pet_play", [me.DATA.crystal.play], function (str, data) {
                    if (data.s == 1) {
                        if(me.type == "yingxiong"){
                            G.frame.yingxiong_fight.top.refreshPetBtn(me.DATA.crystal.play);
                        }else if(me.type == "jingjichang"){
                            G.frame.jingjichang_gjfight.top.refreshPetBtn(me.DATA.crystal.play);
                        }else if (me.type == 'shiyuanzhanchang'){
                            G.frame.shiyuanzhanchang_xzyx.bottom.refreshPetBtn(me.DATA.crystal.play);
                        }
                    }
                });
               me.remove();
            });
        },
        onOpen:function () {
            var me = this;
            me.type = me.data();
            me.initUi();
            me.bindBtn()
        },
        onShow:function () {
            var me = this;
            me.getData(function () {
                me.setTable();
                me.showSkill();
            })
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.pet;
            var allPet = G.DATA.pet;
            var tidKeys = Object.keys(allPet);
            me.haspet = Object.keys(me.DATA.crystal.play);//以上阵的宠物

            me.onfightpet = [];
            for(var n in me.DATA.crystal.play){
                me.onfightpet.push(me.DATA.crystal.play[n]);
            }
            if(!me.isFirst){
                for(var k in allPet){
                    if(X.inArray(me.onfightpet,k)){
                        allPet[k].order = 2;
                    }else {
                        allPet[k].order = 1;
                    }
                }
                me.isFirst = true;
            }

            tidKeys.sort(function (a, b) {
                var dataA = allPet[a];
                var dataB = allPet[b];
                var confA = conf[dataA.pid];
                var confB = conf[dataB.pid];

                if(dataA.order != dataB.order){
                    return dataA.order > dataB.order ? -1 : 1;
                }else if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else if (dataA.lv != dataB.lv) {
                    return dataA.lv > dataB.lv ? -1 : 1;
                } else {
                    return dataA.pid * 1 > dataB.pid * 1 ? -1 : 1;
                }
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8, 5);
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(false);
            }
        },
        //下面技能顺序的显示
        showSkill:function(){
            var me = this;
            me.selectarr = [];
            me.itemArr = [];
            var petcomconf = G.gc.petcom;
            var playerindex = me.sit = X.keysOfObject(me.DATA.crystal.play);//哪些槽位有技能
            for(var i = 1; i < 5; i++) {
                var interval = (me.nodes.panbel_jlwp.width - me.nodes.list_yx.width * 4) / 4;
                var item = me.nodes.list_yx.clone();
                X.autoInitUI(item);
                item.setName("item" + i);
                item.show();
                item.pos = i;
                item.setAnchorPoint(0, 0);
                item.setPosition(cc.p(item.width * (i - 1) + interval * (i - 1), 0));

                if (me.DATA.crystal.crystal.rank < petcomconf.base.slotopen[i]) {//未解锁
                    item.nodes.img_suo_bg.show();
                    item.lock = true;
                } else {
                    item.lock = false;
                    //解锁但没有技能
                    item.nodes.img_suo_bg.hide();

                    //解锁且有技能
                    for (var j = 0; j < playerindex.length; j++) {
                        if (i == playerindex[j]) {
                            var petData = G.DATA.pet[me.DATA.crystal.play[playerindex[j]]];
                            var pet = G.class.pet(petData);
                            pet.setAnchorPoint(0, 0);
                            item.data = petData;
                            item.id = me.DATA.crystal.play[playerindex[j]];
                            item.nodes.panel_yx_jn.removeAllChildren();
                            item.nodes.panel_yx_jn.addChild(pet);
                            item.nodes.img_suo_bg.hide();
                            item.nodes.panel_yx_jn.show();

                            me.selectarr.push(me.DATA.crystal.play[playerindex[j]]);
                        }
                    }

                    //技能拖动
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
                                cloneItem.setPosition(cc.p(pos));
                                me.ui.addChild(cloneItem);
                                sender.nodes.panel_yx_jn.hide();
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
                                if (isCollision != null) {
                                    me.changeItem(sender,isCollision);
                                }
                                if(me.cloneItem) {
                                    me.cloneItem.removeFromParent();
                                    delete me.cloneItem;
                                }
                                sender.nodes.panel_yx_jn.show();
                            }
                        }else if(type == ccui.Widget.TOUCH_NOMOVE){//点击宠物下阵
                            for(var k in me.DATA.crystal.play){
                                if(me.DATA.crystal.play[k] == sender.id){
                                    delete me.DATA.crystal.play[k];
                                    me.showSkill();
                                    me.setTable();
                                }
                            }
                        }
                    });
                }
                me.itemArr.push(item);
                me.nodes.panbel_jlwp.addChild(item);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.setName("list" + data);
            var petData = G.DATA.pet[data];
            var pet = G.class.pet(petData);
            pet.setPosition(ui.width / 2, ui.height / 2);
            //pet.setGou(me.selectId == data);
            ui.removeAllChildren();
            ui.addChild(pet);
            ui.pet = pet;
            ui.id = data;
            ui.data = data;

            if(X.inArray(me.onfightpet,data)) ui.pet.setGou(true);//已上阵的默认勾选

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.onfighttid = [];
                    me.onfightpid = [];
                    for(var n in me.DATA.crystal.play){
                        me.onfighttid.push(me.DATA.crystal.play[n]);
                        me.onfightpid.push(G.DATA.pet[me.DATA.crystal.play[n]].pid);
                    }
                    //阵上的宠物数量满,且点击的不是已勾选的
                    if(X.keysOfObject(me.DATA.crystal.play).length >= 4  && !X.inArray(me.onfighttid,sender.id)){
                        G.tip_NB.show(L("pettip8"));
                    }else {
                        if(X.inArray(me.onfighttid,sender.id)){//点击的是已勾选的,就取消勾选
                            sender.pet.setGou(false);
                            for (var k in me.DATA.crystal.play) {
                                if(sender.id == me.DATA.crystal.play[k]){
                                    delete me.DATA.crystal.play[k];
                                    me.showSkill();
                                    break;
                                }
                            }
                        }else {//点击是其他神宠的，首先判断是否已经上阵了相同pid的神宠
                            if(X.keysOfObject(me.DATA.crystal.play).length >= me.getSitNum()){//没有足够槽位放宠物
                                G.tip_NB.show(L("pettip13"));
                            }else {
                                if(X.inArray(me.onfightpid,G.DATA.pet[sender.id].pid)){//已经有相同pid的神宠
                                    G.tip_NB.show(L("pettip11"));
                                }else {//可以选择上阵
                                    sender.pet.setGou(true);
                                    for(var i = 1; i < 5; i++){
                                        if(me.DATA.crystal.play[i]){

                                        }else {
                                            me.DATA.crystal.play[i] = sender.id;
                                            me.showSkill();
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        },

        // 检测碰撞内容，如果有合适的，返回item
        checkItemsCollision: function (cloneItem) {
            var me = this;

            var itemsArr = me.itemArr;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.data != item.data && !item.lock) {
                    if (me.checkItem(cloneItem, item)) return item;
                }
            }
            return null;
        },

        checkItem: function (item1, item2) {
            var pos1 = item1.convertToWorldSpace();
            var point = cc.p(pos1.x + item1.width / 2, pos1.y + item1.height / 2);

            var pos2 = item2.convertToWorldSpace();

            if (point.x >= pos2.x
                && point.x <= pos2.x + item2.width
                && point.y >= pos2.y
                && point.y <= pos2.y + item2.height) {
                return true;
            } else return false;
        },
        //交换数据
        changeItem: function (item1,item2) {
            var me = this;

            if(!item1.data) return;

            var tid1 = item1.data;
            var tid2 = item2.data;

            item1.nodes.panel_yx_jn.removeAllChildren();
            item2.nodes.panel_yx_jn.removeAllChildren();
            item1.setTouchEnabled(true);
            item2.setTouchEnabled(true);
            if(tid2) {
                item2.data = tid1;
                item1.data = tid2;

                var wid = G.class.pet(tid2);
                wid.setAnchorPoint(0.5,1);
                wid.setPosition(cc.p(item1.nodes.panel_yx_jn.width / 2,item1.nodes.panel_yx_jn.height));
                item1.nodes.panel_yx_jn.addChild(wid);

                var wid1 = G.class.pet(tid1);
                wid1.setAnchorPoint(0.5,1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx_jn.width / 2,item2.nodes.panel_yx_jn.height));
                item2.nodes.panel_yx_jn.addChild(wid1);

                me.DATA.crystal.play[item1.pos] = item2.id;
                me.DATA.crystal.play[item2.pos] = item1.id;

            }else {
                item1.data = undefined;
                item2.data = tid1;

                var wid1 = G.class.pet(tid1);
                wid1.setAnchorPoint(0.5,1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx_jn.width / 2,item2.nodes.panel_yx_jn.height));
                item2.nodes.panel_yx_jn.addChild(wid1);

                me.DATA.crystal.play[item2.pos] = item1.id;
                delete me.DATA.crystal.play[item1.pos];
            }
        },

        getSitNum :function(){
            var me = this;
            var slotopen = G.gc.petcom.base.slotopen;//槽位开放的条件
            var sitnum = 0;
            for(var i in slotopen){
                if(me.DATA.crystal.crystal.rank >= slotopen[i]) sitnum++;
            }
            return parseInt(sitnum);
        },

        getData: function (callback) {
            var me = this;
            me.ajax("pet_open", [0], function (str, data) {
                if(data.s == 1){
                    me.DATA = data.d;
                    me.DATA.crystal.play = me.DATA.crystal.play || {};//槽位上的神宠
                    me.DATA.crystal.crystal = me.DATA.crystal.crystal || {};
                    me.DATA.crystal.crystal.lv = me.DATA.crystal.crystal.lv || 0;
                    me.DATA.crystal.crystal.rank = me.DATA.crystal.crystal.rank || 0;
                    callback && callback();
                }
            });
        },
    });
    G.frame[ID] = new fun('scsj_top_xzsc.json', ID);
})();