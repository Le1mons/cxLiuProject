/**
 * Created by LYF on 2019/10/26.
 */
(function () {
    //神宠水晶-水晶
    G.class.scsj_sj = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            this._super('scsj_sj.json', null, {action: true});
        },
        bindBTN: function () {
            var me = this;
            
            //升级
            me.nodes.btn_up.click(function () {
                G.ajax.send("pet_crystal", ["lv"], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'crystal_upgrade',
                            data:{
                                oldLv:me.oldlv,
                                newLv:d.d.lv,
                                consume:me.need,
                            }
                        });
                        //刷新等级数据
                        me.DATA.crystal.crystal.lv = d.d.lv || 0;
                        me.DATA.crystal.crystal.rank = d.d.rank || 0;
                        me.setContents();
                        me.downContent();
                        me.lvChange();
                        G.hongdian.getData('pet',1,function () {
                            G.frame.scsj.checkRedPoint();
                        });
                    }
                })
            });
            //升阶
            me.nodes.btn_up_jj.click(function () {
                G.ajax.send("pet_crystal", ["rank"], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        //刷新等级数据
                        me.DATA.crystal.crystal.lv = d.d.lv || 0;
                        me.DATA.crystal.crystal.rank = d.d.rank || 0;
                        me.setContents();
                        me.downContent();
                        me.rankChange();
                        G.hongdian.getData('get',1,function () {
                            G.frame.scsj.checkRedPoint();
                        });
                    }
                })
            })
        },
        initUi:function(){
            var me = this;
            G.class.ani.show({
                json: "ani_shenchong_shuijing_dh",
                addTo: me.nodes.panel_dan,
                repeat: true,
                autoRemove: false,
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.downContent();
        },
        onRemove: function () {
            var me = this;
        },
        refreshPanel:function(id){
            var me = this;
            me.playid = id;//记录播放哪个宠物的光
            me.getData(function () {
                me.setContents();
                me.downContent();
            })
        },
        //上面槽位和下面技能的显示
        setContents: function () {
            var me = this;
            me.itemArr = [];
            var petcomconf = G.gc.petcom;
            var petconf = G.gc.pet;
            var playerindex = X.keysOfObject(me.DATA.crystal.play);//哪些槽位有神宠
            var crysbuff = G.gc.petcom.base.crystalrank[me.DATA.crystal.crystal.rank].pro / 10;
            me.nodes.text_dj.setString(X.STR(L("pettip12"),crysbuff));

            me.nodes.panel_jns.removeAllChildren();
            for(var i = 1; i < 5; i++){
                //四个槽位的显示
                var crystal = me.nodes.panel_sjsl.clone();
                X.autoInitUI(crystal);
                crystal.setName("crystal" + i);
                crystal.show();
                crystal.setPosition(0,0);
                crystal.setAnchorPoint(0,0);
                crystal.nodes.panel_tianjia_dh.ind = i;

                //四个技能的显示
                var interval = (me.nodes.panel_jns.width - me.nodes.list_yx.width * 4) / 4;
                var item = me.nodes.list_yx.clone();
                X.autoInitUI(item);
                item.setName("item" + i);
                item.show();
                item.pos = i;
                item.setAnchorPoint(0,0);
                item.setPosition(cc.p(item.width*(i-1) + interval*(i-1), 0));

                //槽位和技能的开放
                if(me.DATA.crystal.crystal.rank < petcomconf.base.slotopen[i]){//未解锁，显示解锁等级
                    crystal.nodes.img_sj_dz_hui.show();
                    crystal.nodes.img_sj_dz.hide();
                    crystal.nodes.panel_xcw.hide();
                    crystal.nodes.panel_tianjia_dh.hide();
                    crystal.nodes.txt_jiesuo.show();
                    crystal.nodes.txt_jiesuo.setString(X.STR(L("pettip3"),petcomconf.base.slotopen[i]));
                    X.enableOutline(crystal.nodes.txt_jiesuo,"#3C3833", 2);

                    item.nodes.img_suo_bg.show();
                    item.lock = true;
                    //item.nodes.ico_bg_jn.hide();
                }else {
                    item.lock = false;
                    //解锁但没有宠物,显示加号特效
                    crystal.nodes.img_sj_dz_hui.hide();
                    crystal.nodes.img_sj_dz.show();
                    crystal.nodes.panel_xcw.hide();
                    crystal.nodes.panel_tianjia_dh.show();
                    crystal.nodes.txt_jiesuo.hide();
                    crystal.nodes.panel_tianjia_dh.setTouchEnabled(true);
                    crystal.nodes.panel_tianjia_dh.touch(function (sender,type) {//选择宠物
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            //没有可上阵的宠物弹提示
                            var allPet = G.DATA.pet;
                            var tidKeys = Object.keys(allPet);
                            if(tidKeys.length == 0){
                                G.tip_NB.show(L("pettip10"));
                            }else {
                                if(me.checkIsAddPet(me.getSitNum())){
                                    G.frame.scsj_xz.data({
                                        index:sender.ind,
                                        data:me.DATA,
                                        type:"jia"
                                    }).show();
                                }else {
                                    G.tip_NB.show(L("pettip10"));
                                }
                            }
                        }
                    });
                    item.nodes.img_suo_bg.hide();
                    X.addAni(crystal.nodes.panel_tianjia_dh);

                    //解锁且有宠物，显示宠物
                    for(var j = 0; j < playerindex.length; j++){
                        if(i == playerindex[j]){
                            var petData = G.DATA.pet[me.DATA.crystal.play[playerindex[j]]];
                            var pet = G.class.pet(petData);
                            crystal.nodes.panel_xcw.show();
                            crystal.nodes.panel_tianjia_dh.removeAllChildren();
                            crystal.nodes.panel_tianjia_dh.hide();
                            crystal.nodes.txt_jiesuo.hide();
                            X.setHeroModel({//宠物模型
                                parent: crystal.nodes.panel_xcw,
                                data: {},
                                model: petconf[petData.pid].model,
                                scaleNum:0.45,
                                direction: -1,
                                callback: function (model) {
                                    if(me.playid == petData.tid){
                                        model.opacity = 0;
                                        G.class.ani.show({
                                            addTo: crystal.nodes.panel_xcw,
                                            json: "ani_shenchong_shuaxin_dh",
                                            onkey: function (node, action, event) {
                                                if (event == "hit") {
                                                    model.runActions([
                                                        cc.fadeIn(0.15)
                                                    ]);
                                                }
                                            }
                                        })
                                        me.playid = null;
                                    }
                                    if(me.ifchange && X.inArray(me.changetid,petData.tid)){
                                        model.opacity = 0;
                                        G.class.ani.show({
                                            addTo: crystal.nodes.panel_xcw,
                                            json: "ani_shenchong_shuaxin_dh",
                                            onkey: function (node, action, event) {
                                                if (event == "hit") {
                                                    model.runActions([
                                                        cc.fadeIn(0.15)
                                                    ]);
                                                }
                                            }
                                        })
                                    }
                                }
                            });

                            pet.setAnchorPoint(0,0);
                            item.data = petData;
                            item.id = me.DATA.crystal.play[playerindex[j]];
                            item.nodes.panel_yx_jn.removeAllChildren();
                            item.nodes.panel_yx_jn.addChild(pet);
                            item.nodes.img_suo_bg.hide();
                            item.nodes.panel_yx_jn.show();

                            crystal.nodes.panel_xcw.index = i;
                            //点击宠物弹预览
                            crystal.nodes.panel_xcw.setTouchEnabled(true);
                            crystal.nodes.panel_xcw.touch(function (sender,type) {//选择宠物
                                if (type == ccui.Widget.TOUCH_NOMOVE) {
                                    G.frame.scsj_xz.data({
                                        index:sender.index,
                                        data:me.DATA,
                                        type:"pet"
                                    }).show();
                                }
                            });
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
                        }
                    });
                }
                me.itemArr.push(item);
                me.nodes.panel_jns.addChild(item);
                me.nodes["panel_sjsl" + i].removeAllChildren();
                me.nodes["panel_sjsl" + i].addChild(crystal);
            }
            me.ifchange = false;

        },

        downContent:function(){
            var me = this;
            var sjconf = G.gc.scsj;
            var petcomconf = G.gc.petcom;
            var sjarr = [];
            var rankarr = [];
            for(var i = 0; i < X.keysOfObject(sjconf).length; i++){
                sjarr.push(parseInt(X.keysOfObject(sjconf)[i]));
            }
            var maxlv = Math.max.apply(null,sjarr);//找出水晶的最大等级
            for (var j = 0; j < X.keysOfObject(petcomconf.base.crystalrank).length; j++ ){
                rankarr.push(parseInt(X.keysOfObject(petcomconf.base.crystalrank)[j]));
            }
            var rankmax = Math.max.apply(null,rankarr);//找出水晶的最大等阶

            me.oldlv = me.DATA.crystal.crystal.lv;//用于打点
            //等级
            if(me.DATA.crystal.crystal.rank == rankmax){
                me.nodes.zy_wz.setString(X.STR(L("pettip1"),me.DATA.crystal.crystal.lv,petcomconf.base.crystalrank[rankmax].lv));
            }else {
                me.nodes.zy_wz.setString(X.STR(L("pettip1"),me.DATA.crystal.crystal.lv,petcomconf.base.crystalrank[me.DATA.crystal.crystal.rank+1].lv));
            }

            //等阶
            me.space = 0;
            me.nodes.panel_pinjie.removeAllChildren();
            G.class.ui_pinji(me.nodes.panel_pinjie, me.DATA.crystal.crystal.rank || 0, 0.8, 10,10);

            //升级升阶按钮的显示
            //等级等阶都最大按钮隐藏
            var djrank = X.keysOfObject(petcomconf.base.crystalrank);
            if(me.DATA.crystal.crystal.lv == maxlv && me.DATA.crystal.crystal.rank == rankmax){
                me.nodes.btn_up.hide();
                me.nodes.btn_up_jj.hide();
            }else {
                if(petcomconf.base.crystalrank[me.DATA.crystal.crystal.rank].lv == me.DATA.crystal.crystal.lv){
                    var need = me.need = sjconf[me.DATA.crystal.crystal.lv].need;
                    me.nodes.btn_up.show();
                    me.nodes.btn_up_jj.hide();
                }else {
                    if(me.DATA.crystal.crystal.lv != 0 && me.DATA.crystal.crystal.lv >= petcomconf.base.crystalrank[me.DATA.crystal.crystal.rank+1].lv){//升阶
                        var need = me.need = petcomconf.base.crystalrank[me.DATA.crystal.crystal.rank].need;//升级消耗
                        me.nodes.btn_up.hide();
                        me.nodes.btn_up_jj.show();
                    }else {
                        var need = me.need = sjconf[me.DATA.crystal.crystal.lv].need;
                        me.nodes.btn_up.show();
                        me.nodes.btn_up_jj.hide();
                    }
                }
            }

            //消耗
            if(me.DATA.crystal.crystal.lv == maxlv && me.DATA.crystal.crystal.rank == rankmax){
                me.nodes.img_zgdj.show();//最大等级
                me.nodes.panel_xh.hide();
            }else {
                if(G.class.getOwnNum(need[0].t,need[0].a) < need[0].n){
                    me.nodes.txt_xh1.setTextColor(cc.color(G.gc.COLOR.n16));
                    X.enableOutline(me.nodes.txt_xh1,cc.color('#740000'),1);
                }
                if(G.class.getOwnNum(need[1].t,need[1].a) < need[1].n){
                    me.nodes.txt_xh2.setTextColor(cc.color(G.gc.COLOR.n16));
                    X.enableOutline(me.nodes.txt_xh2,cc.color('#740000'),1);
                }
                me.nodes.token_jb.loadTexture(G.class.getItemIco(need[0].t),1);
                me.nodes.txt_xh1.setString(need[0].n);
                me.nodes.token_jy.loadTexture(G.class.getItemIco(need[1].t),1);
                me.nodes.txt_xh2.setString(need[1].n);
            }
            //buff属性
            var buff = X.fmtBuff(sjconf[me.DATA.crystal.crystal.lv].buff);
            me.nodes.txt_sx1.setString(0);
            me.nodes.txt_sx2.setString(0);
            if(buff.length > 0){
                me.nodes.txt_sx1.setString(buff[1].sz);
                me.nodes.txt_sx2.setString(buff[0].sz);
            }
            var buff0 = X.fmtBuff(petcomconf.base.crystalrank[me.DATA.crystal.crystal.rank].buff);
            me.nodes.txt_sx3.setString(buff0[0].sz);
            me.nodes.txt_sx4.setString(0);//策划说属性是0

        },
        //获得当前可用的槽位数量
        getSitNum:function(){
            var me = this;
            var slotopen = G.gc.petcom.base.slotopen;//槽位开放的条件
            var sitnum = 0;
            for(var i in slotopen){
                if(me.DATA.crystal.crystal.rank >= slotopen[i]) sitnum++;
            }
            return parseInt(sitnum);
        },
        checkIsAddPet: function (len) {

            return G.frame.scsj.checkIsAddPet(len);
        },
        //升级属性变化的效果
        lvChange:function(){
            var me = this;
            var arr = ["atk","hp"];
            var attr = [L("atk"),L("hp")];
            var num = 0;
            oldbuff = G.gc.scsj[me.DATA.crystal.crystal.lv-1].buff;
            newbuff = G.gc.scsj[me.DATA.crystal.crystal.lv].buff;
            for (var i = 0; i < 2; i++){
                var shuXingUp = new ccui.ImageView;
                (function (shuXingUp) {
                    var str = attr[i] + "+" + (newbuff[arr[i]] - oldbuff[arr[i]]);
                    var txt = new ccui.Text(str, "fzcyj", 20);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color( "#3cff00"));
                    X.enableOutline(txt, "#000000", 2);
                    txt.setPosition(shuXingUp.width / 2, shuXingUp.height / 2);
                    shuXingUp.addChild(txt);
                    shuXingUp.setPosition(me.width / 2 - 100, 800 - num * 30);
                    num ++;
                    shuXingUp.setTag(999999);
                    me.addChild(shuXingUp);
                    var action1 = cc.moveBy(0.1, cc.p(100, 0));
                    var action2 = cc.fadeOut(0.3);
                    var action3 = cc.moveBy(0.3, cc.p(0, 10));
                    var action4 = cc.spawn(action2, action3);
                    var action5 = cc.sequence(action1, action4, cc.callFunc(()=>{
                        shuXingUp.hide(false);
                    }));
                    shuXingUp.runAction(action5);
                })(shuXingUp);
            }
            me.attrChange();

        },
        //升阶属性变化
        rankChange:function(){
            var me = this;
            var arr = ["speed"];
            var attr = [L("speed")];
            var num = 0;
            oldbuff = G.gc.petcom.base.crystalrank[me.DATA.crystal.crystal.rank-1].buff;
            newbuff = G.gc.petcom.base.crystalrank[me.DATA.crystal.crystal.rank].buff;
            for (var i = 0; i < 1; i++){
                var shuXingUp = new ccui.ImageView;
                (function (shuXingUp) {
                    var str = attr[i] + "+" + (newbuff[arr[i]] - oldbuff[arr[i]]);
                    var txt = new ccui.Text(str, "fzcyj", 20);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color( "#3cff00"));
                    X.enableOutline(txt, "#000000", 2);
                    txt.setPosition(shuXingUp.width / 2, shuXingUp.height / 2);
                    shuXingUp.addChild(txt);
                    shuXingUp.setPosition(me.width / 2 - 100, 800 - num * 30);
                    num ++;
                    shuXingUp.setTag(999999);
                    me.addChild(shuXingUp);
                    var action1 = cc.moveBy(0.1, cc.p(100, 0));
                    var action2 = cc.fadeOut(0.3);
                    var action3 = cc.moveBy(0.3, cc.p(0, 10));
                    var action4 = cc.spawn(action2, action3);
                    var action5 = cc.sequence(action1, action4, cc.callFunc(()=>{
                        shuXingUp.hide(false);
                    }));
                    shuXingUp.runAction(action5);
                })(shuXingUp);
            }
            //点亮星星
            var img = me.nodes.panel_pinjie.children[me.DATA.crystal.crystal.rank-1];
            if(img) {
                G.class.ani.show({
                    json: "ani_jinjie_xingxing",
                    addTo: img,
                    x: img.width / 2,
                    y: img.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onkey: function (node, action, event) {
                        if(event == "chuxian") {
                            G.class.ui_pinji(me.nodes.panel_pinjie, me.DATA.crystal.crystal.rank || 0, 0.8, 10,10);
                        }
                    }
                })
            }
            me.attrChange();
        },

        //属性文本放大效果
        attrChange:function(){
            var me = this;
            me.nodes.txt_sx1.runActions([
                cc.scaleTo(0.1, 1.2, 1.2),
                cc.scaleTo(0.1, 1, 1)
            ]);

            me.nodes.txt_sx2.runActions([
                cc.scaleTo(0.1, 1.2, 1.2),
                cc.scaleTo(0.1, 1, 1)
            ]);

            me.nodes.txt_sx3.runActions([
                cc.scaleTo(0.1, 1.2, 1.2),
                cc.scaleTo(0.1, 1, 1)
            ]);

            me.nodes.txt_sx4.runActions([
                cc.scaleTo(0.1, 1.2, 1.2),
                cc.scaleTo(0.1, 1, 1)
            ]);
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
                me.changetid = [];//记录要刷新并播放特效的两个神宠
                me.changetid.push(item2.id);
                me.changetid.push(item1.id);
                me.ajax("pet_play", [me.DATA.crystal.play], function (str, data) {
                    if (data.s == 1) {
                        me.ifchange = true;
                        me.setContents();
                        G.frame.scsj.DATA.crystal.play = me.DATA.crystal.play;
                    }
                });

            }else {
                item1.data = undefined;
                item2.data = tid1;

                var wid1 = G.class.pet(tid1);
                wid1.setAnchorPoint(0.5,1);
                wid1.setPosition(cc.p(item2.nodes.panel_yx_jn.width / 2,item2.nodes.panel_yx_jn.height));
                item2.nodes.panel_yx_jn.addChild(wid1);
                me.changetid = [];//记录要刷新并播放特效的两个神宠
                me.changetid.push(item1.id);
                me.DATA.crystal.play[item2.pos] = item1.id;
                delete me.DATA.crystal.play[item1.pos];
                me.ajax("pet_play", [me.DATA.crystal.play], function (str, data) {
                    if (data.s == 1) {
                        me.ifchange = true;
                        me.setContents();
                        G.frame.scsj.DATA.crystal.play = me.DATA.crystal.play;
                    }
                });
            }
        },

        getData:function (callback) {
            var me = this;
            me.ajax("pet_open", [0], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback&&callback();
                }
            });
        }
    });
})();