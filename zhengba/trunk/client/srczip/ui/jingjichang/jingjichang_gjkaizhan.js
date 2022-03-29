/**
 * Created by lsm on 2018/6/23
 */
(function() {
    //英雄-冠军试炼-开战选择
    G.class.jingjichang_gjkaizhan = X.bView.extend({
        sqimg: {
            1: "shenbing_hmzr",
            2: "shenbing_lrsg",
            3: "shenbing_snfz",
            4: "shenbing_zwjj",
            5: "shenbing_slcq",
            6: "shenbing_jdzc"
        },
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('jingjichang_yxcz.json');
        },
        refreshPetBtn:function(data){
            var me = this;
            //神宠按钮红点显示
            if(data) me.DATA.crystal.play = data;

            if(X.checkIsOpen("pet")){
                me.getPetData(function () {
                    me.nodes.btn_shenchong.show();
                    //剩余的槽位，并有可上阵的宠物
                    var petonfightnum = X.keysOfObject(me.DATA.crystal.play).length;//在阵上的宠物数量
                    var slotopen = G.gc.petcom.base.slotopen;//槽位开放的条件
                    var sitnum = 0;//当前开放的槽位数量
                    for(var m in slotopen){
                        if(me.DATA.crystal.crystal.rank >= slotopen[m]) sitnum++;
                    }
                    //按钮红点
                    if(sitnum > petonfightnum && me.checkIsAddPet(sitnum)){
                        G.setNewIcoImg(me.nodes.btn_shenchong,.95);
                    }else {
                        G.removeNewIco(me.nodes.btn_shenchong);
                    }
                });
            }
        },
        refreshPanel: function() {
            var me = this;
            // me.setContents();
        },
        bindBTN: function() {
            var me = this;

            if ((G.frame.jingjichang_gjfight.data() && G.frame.jingjichang_gjfight.data().type == 'defend') || G.frame.jingjichang_gjfight.data().def) {
                me.nodes.btn_kz.setTitleText(L('BAOCUN'));
            } else {
                me.nodes.btn_kz.setTitleText(L('FIGHT'));
            }
            if(G.frame.jingjichang_gjfight.data().txt) {
                me.nodes.btn_kz.setTitleText(G.frame.jingjichang_gjfight.data().txt);
            }
            //开战
            me.nodes.btn_kz.click(function(sender, type) {
                var sData = me.getDefendData();
                if (sData.length < 1) {
                    G.tip_NB.show(L('YX_FIGHT_TIP_1'));
                    return;
                }
                if(sData.length < 3) {
                    G.tip_NB.show(L('YX_FIGHT_TIP_2'));
                    return;
                }
                for (var i in sData) {
                    if(X.keysOfObject(sData[i]).length == 1 && X.keysOfObject(sData[i])[0] == "sqid") {
                        G.tip_NB.show(L('YX_FIGHT_TIP_2'));
                        return;
                    }
                }
                if(G.frame.jingjichang_guanjunshilian.isShow) {
                    X.cacheByUid("fight_gjjjc", sData);
                }
                if(G.frame.wangzherongyao.isShow && !G.frame.jingjichang_gjfight.data().def){
                    X.cacheByUid("pvwz",sData);
                }
                var callback = G.frame.jingjichang_gjfight.DATA.callback;
                callback && callback(me);
            }, 1500);

            //交换1
            me.nodes.btn_th1.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.swapHero(1);
                }
            });

            me.nodes.btn_th2.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.swapHero(2);
                }
            });

            me.nodes.btn_cdsq.click(function () {
                if(!me.opetion) {
                    me.nodes.panel_option.show();
                    me.opetion = true;
                }else {
                    me.nodes.panel_option.hide();
                    me.opetion = false;
                }
            });

            //神宠
            me.nodes.btn_shenchong.setVisible(X.checkIsOpen("pet"));
            me.nodes.btn_shenchong.click(function () {
                if(me.DATA.crystal.crystal.rank == 0 || X.keysOfObject(G.DATA.pet).length == 0){
                    G.tip_NB.show(L("pettip10"));
                }else {
                    G.frame.sc_order.data("jingjichang").show();
                }
            });

            me.ui.finds("btn1").click(function () {
                me.changeSQ(1);
            });
            me.ui.finds("btn2").click(function () {
                me.changeSQ(2);
            });
            me.ui.finds("btn3").click(function () {
                me.changeSQ(3);
            });

            me.ui.finds("btn_kz$_0").setVisible(X.checkIsOpen("yuanjun"));
            me.ui.finds("btn_kz$_0").click(function () {
                if (!me.yj) {
                    me.yj = true;
                    for (var i = 0; i < 3; i++) {
                        me.nodes['Panel_' + (i + 1)].zhuli.hide();
                        me.nodes['Panel_' + (i + 1)].yuanjun.show();
                    }
                } else {
                    me.yj = false;
                    for (var i = 0; i < 3; i++) {
                        me.nodes['Panel_' + (i + 1)].zhuli.show();
                        me.nodes['Panel_' + (i + 1)].yuanjun.hide();
                    }
                }
                me.showYjBtnState();
            });
        },
        showYjBtnState: function () {
            var me = this;

            if (me.yj) {
                me.ui.finds("btn_kz$_0").setTitleText(L("TZZL"));
            } else {
                if (me.checkHasYj()) {
                    me.ui.finds("btn_kz$_0").setTitleText(L("TZYJ"));
                } else {
                    me.ui.finds("btn_kz$_0").setTitleText(L("SZYJ"));
                }
            }
        },
        checkHasYj: function () {
            var me = this;

            return me.icoList[6].data != undefined || me.icoList[13].data != undefined || me.icoList[20].data != undefined;
        },
        addShenQi: function(sqid, id) {
            var me = this;
            var parent = me.nodes["sq" + id];

            if(me.sqimg[sqid]) {
                parent.setBackGroundImage("img/shenbing/" + me.sqimg[sqid] + ".png");
            } else {
                parent.removeBackGroundImage();
            }
        },
        checkRedPoint: function() {
            var me = this;
            var isNeedShow = false;

            for(var i in me.sqid) {
                if(me.sqid[i] != "") {
                    isNeedShow = true;
                    break;
                }
            }

            if(!isNeedShow && P.gud.artifact) G.setNewIcoImg(me.nodes.btn_cdsq, .95);
            else G.removeNewIco(me.nodes.btn_cdsq);
        },
        changeSQ: function(type) {
            var me = this;

            G.frame.shenqi_xuanze.data({
                sqid: me.sqid[type - 1],
                sqArr: me.sqid,
                idx: type - 1,
                callback: function f(data) {
                    me.sqid[type - 1] = data;
                    for(var i = (type - 1) * 6; i < type * 6; i ++) {
                        if(me.icoList[i].data) {
                            me.icoList[i].getChildren()[0].setArtifact(data, true);
                        }
                    }
                    me.checkRedPoint();
                    me.addShenQi(me.sqid[type - 1], type);
                },
            }).show();
        },
        swapHero: function(type) {
            var me = this;
            var data = me.getSelectedData();
            if (data.length <= 0) return;
            var obj = {
                1: [1, 2],
                2: [2, 3]
            };


            // var tmp = me.sqid[type];
            // me.sqid[type] = me.sqid[type - 1];
            // me.sqid[type - 1] = tmp;

            var str = obj[type];
            var list_1 = data[str[0]];
            var list_2 = data[str[1]];
            var idx = type == 1 ? 0 : 7;
            var idx2 = type == 1 ? 7 : 14;
            for (var k in list_2) {
                var item = me.icoList[idx];
                var wid = G.class.shero(G.DATA.yingxiong.list[list_2[k]]);
                item.data = list_2[k];
                wid.setAnchorPoint(0.5, 1);
                wid.setPosition(cc.p(item.width / 2, item.height));
                item.removeAllChildren();
                if (G.DATA.yingxiong.list[list_2[k]]) {
                    item.addChild(wid);
                    wid.setArtifact(me.sqid[parseInt(idx / 6)]);
                }
                me.addTouchEvent(wid);
                idx++
            }
            for (var j in list_1) {
                var item = me.icoList[idx2];
                var wid = G.class.shero(G.DATA.yingxiong.list[list_1[j]]);
                item.data = list_1[j];
                wid.setAnchorPoint(0.5, 1);
                wid.setPosition(cc.p(item.width / 2, item.height));
                item.removeAllChildren();
                if (G.DATA.yingxiong.list[list_1[j]]) {
                    item.addChild(wid);
                    wid.setArtifact(me.sqid[parseInt(idx2 / 6)]);
                }
                me.addTouchEvent(wid);
                idx2++
            }
        },
        checkItemsCollision: function(cloneItem, p) {
            var me = this;

            var itemsArr = me.icoList;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (item && me.checkCond(cloneItem,item)) {
                    var pos = item.getParent().convertToNodeSpace(p);
                    if (cc.rectContainsPoint(item.getBoundingBox(), pos)) {
                        return item;
                    }
                }
            }
            return null;
        },
        checkCond: function (cloneItem,item) {
            var me = this;
            if (this.yj) {
                if (((item.index + 1) % 7 == 0) && me.checkTheHaveSenve(cloneItem,item)){
                    return true;
                }else {
                    return false;
                }
            } else {
                if (((item.index + 1) % 7 != 0) && me.checkTheHaveSenve(cloneItem,item)){
                    return true;
                }else {
                    return false;
                }
            }
        },
        //检测当前需要替换的英雄队伍里是否已经有第七种族英雄
        //cloneItem:当前英雄，
        //item:碰撞的英雄
        checkTheHaveSenve:function(cloneItem,item){
          var me = this;
            var heroD = G.DATA.yingxiong.list[cloneItem.data.tid];
            var heroD2 = G.DATA.yingxiong.list[item.data];

           function f(idx) {
               if ((idx>=0 && idx<=5) || idx==6){
                   return 1;
               }else if ((idx>=7 && idx<=12) || idx==13){
                   return 2;
               } else if ((idx>=14 && idx<=19) || idx==20) {
                   return 3;
               }
           };
           var teamid = f(item.index);
            var teamArr = me.getSelectedData();
            var theTeaminfo = teamArr[teamid];
            function f1() {
                for (var i in teamArr){
                    for (var k in teamArr[i]){
                        if (teamArr[i][k] == cloneItem.data.tid){
                            return i;
                            break;
                        }
                    }
                }
            }
            var teamid2 = f1();
            if (teamid == teamid2)return true;
            if (heroD){
                for (var i in theTeaminfo){
                    if (theTeaminfo[i]){
                        var hero = G.DATA.yingxiong.list[theTeaminfo[i]];
                        if (heroD.zhongzu == 7 && hero.zhongzu == 7 && heroD.pinglunid == hero.pinglunid){
                            return false;
                            break;
                        }
                    }
                }
            }

            if (teamid != teamid2 && heroD2){
                var theTeaminfo2 = teamArr[teamid2];
                for (var i in theTeaminfo2){
                    if (theTeaminfo2[i]){
                        var hero2 = G.DATA.yingxiong.list[theTeaminfo2[i]];
                        if (heroD2.zhongzu == 7 && hero2.zhongzu == 7 && heroD2.pinglunid == hero2.pinglunid){
                            return false;
                            break;
                        }
                    }
                }
            }
            return true;
        },
        changeItem: function(item1, item2) {
            var me = this;
            var tid1 = item1.data.tid;
            var tid2 = item2.data;
            var parent = item1.getParent();

            var idx1 = item1.getParent().index;
            var idx2 = item2.index;

            parent.removeAllChildren();
            parent.data = undefined;
            item2.removeAllChildren();
            item2.data = undefined;

            item1.setTouchEnabled(true);
            item2.setTouchEnabled(true);

            if(tid2) {
                var wid = G.class.shero(G.DATA.yingxiong.list[tid2]);
                wid.setAnchorPoint(0.5, 1);
                wid.setPosition(cc.p(parent.width / 2, parent.height));
                me.addTouchEvent(wid);
                parent.addChild(wid);
                parent.data = tid2;
                wid.setArtifact(me.sqid[parseInt(idx1 / 6)]);
            }
            var wid1 = G.class.shero(G.DATA.yingxiong.list[tid1]);
            wid1.setAnchorPoint(0.5, 1);
            wid1.setPosition(cc.p(item2.width / 2, item2.height));
            me.addTouchEvent(wid1);
            item2.addChild(wid1);
            item2.data = tid1;
            wid1.setArtifact(me.sqid[parseInt(idx2 / 6)]);
        },
        getDefendData: function() {
            var me = this;
            var data = me.getSelectedData();
            var newdata = [];

            for (var key in data) {
                var list = {};
                for (var i = 1; i < 8; i++) {
                    var d = data[key];
                    if (d[i]) {
                        list[i] = d[i];
                    }
                }
                if(me.sqid[key * 1 - 1]) {
                    list.sqid = me.sqid[key * 1 - 1];
                }
                if (JSON.stringify(list) === '{}') {
                    continue;
                }
                newdata.push(list);
            }
            return newdata;
        },
        getSelectedData: function() {
            var me = this;
            var tiem1 = {};
            var tiem2 = {};
            var tiem3 = {};
            for (var key in me.icoList) {
                var k = key >> 0;
                if (k < 7) {
                    tiem1[k + 1] = me.icoList[key].data || 0;
                } else if (6 < k && k < 14) {
                    tiem2[k % 7 + 1] = me.icoList[key].data || 0;
                } else {
                    tiem3[k % 7 + 1] = me.icoList[key].data || 0;
                }
            }
            return {
                1: tiem1,
                2: tiem2,
                3: tiem3
            };
        },
        setDefendHero: function() {
            var me = this;

            var defdata;
            if (G.frame.jingjichang_gjfight.DATA.type == 'defend') {
                defdata = G.frame.jingjichang_guanjunshilian.DATA.defhero;
            } else{
                if(G.frame.wangzherongyao.isShow && !defdata) {
                    defdata = X.cacheByUid("pvwz");
                }else if (G.frame.jingjichang_gjfight.DATA.type == 'wztt_three') {
                    defdata = X.cacheByUid("wztt_three") || [];
                }else{
                    defdata = X.cacheByUid('fight_gjjjc');
                }
            }

            //没有数据时跳出设置
            if (!defdata || defdata.length < 1) {
                return;
            }

            var ysz = [];

            for (var i = 0; i < defdata.length; i++) {
                var icolist = me.sanList[i];
                var datalist = defdata[i];
                if(datalist.sqid) {
                    me.sqid[i] = datalist.sqid;
                }
                for (var key in datalist) {
                    if(G.DATA.yingxiong.list[datalist[key]] && !X.inArray(ysz, datalist[key])){
                        ysz.push(datalist[key]);
                        var k = key >> 0;
                        var item = icolist[(k - 1)];
                        item.data = datalist[key];
                        var wid = G.class.shero(G.DATA.yingxiong.list[datalist[key]]);
                        wid.setAnchorPoint(0.5, 1);
                        wid.setPosition(cc.p(item.width / 2, item.height));
                        me.addTouchEvent(wid);
                        item.addChild(wid);
                        if(me.sqid[i]) {
                            wid.setArtifact(me.sqid[i]);
                        }
                        G.frame.jingjichang_gjfight.bottom.selectedData.push(datalist[key]);
                    }
                }
            }
            G.frame.jingjichang_gjfight.bottom.fmtItemList();
            me.showYjBtnState();
        },
        addLayout: function() {
            var me = this;
            var count = 0;
            me.icoList = [];
            me.icoData = [];
            me.sanList = [];
            for (var i = 0; i < 3; i++) {
                var list = me.nodes.list.clone();
                var list1 = me.nodes.list1.clone();
                setico();
                list.show();
                list.setAnchorPoint(0, 0);
                list.setPosition(0, 0);
                me.nodes['Panel_' + (i + 1)].addChild(list);
                me.nodes['Panel_' + (i + 1)].zhuli = list;

                list1.hide();
                list1.setAnchorPoint(0, 0);
                list1.setPosition(0, 0);
                me.nodes['Panel_' + (i + 1)].addChild(list1);
                me.nodes['Panel_' + (i + 1)].yuanjun = list1;
            }

            function setico() {
                X.autoInitUI(list);
                X.autoInitUI(list1);
                var zuo = list.nodes.panel_ico1;
                var you = list.nodes.panel_ico2;
                var zhon = list1.nodes.list_yj_ico;
                var oneList = {};
                for (var k = 0; k < 2; k++) {
                    var ico = list.nodes.list_ico.clone();
                    ico.setAnchorPoint(0, 0.5);
                    ico.setPositionX(80 * k);
                    ico.setName(count++);
                    zuo.addChild(ico);
                    me.icoList.push(ico);
                    oneList[k] = ico;
                }
                for (var j = 0; j < 4; j++) {
                    var ico = list.nodes.list_ico.clone();
                    ico.setAnchorPoint(0, 0.5);
                    ico.setPositionX(80 * j);
                    ico.setName(count++);
                    you.addChild(ico);
                    me.icoList.push(ico);
                    oneList[(k + j)] = ico;
                }
                var ico = list.nodes.list_ico.clone();
                ico.setAnchorPoint(0.5, 0.5);
                ico.setPosition(zhon.width / 2, zhon.height / 2);
                ico.setName(count++);
                zhon.addChild(ico);
                me.icoList.push(ico);
                oneList[6] = ico;
                me.sanList.push(oneList);
            }

            for(var i = 0; i < me.icoList.length; i ++) {
                me.icoList[i].index = i;
            }
        },
        addTouchEvent: function(ui) {
            var me = this;
            var item = ui;
            var bPos, cloneItem, pos;
            item.setTouchEnabled(true);
            item.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //卸下英雄
                    if (sender.data) {
                        var a = sender.getParent();
                        me.removeItem(sender.data.tid);
                        sender.setTouchEnabled(false);
                    }
                } else if (type == ccui.Widget.TOUCH_BEGAN) {
                    if (sender.data) {
                        bPos = sender.getTouchBeganPosition();
                        var firstParent = sender.getParent();

                        var firstPos = firstParent.convertToWorldSpace(sender.getPosition());
                        pos = me.ui.convertToNodeSpace(firstPos);
                        cloneItem = me.cloneItem = sender.clone();
                        cloneItem.data = sender.data;
                        sender.hide();
                        cloneItem.setScale(.79);
                        cloneItem.setPosition(cc.p(pos));
                        me.ui.addChild(cloneItem);
                    }
                } else if (type == ccui.Widget.TOUCH_MOVED) {
                    if (sender.data) {
                        var mPos = sender.getTouchMovePosition();
                        var offset = cc.p(mPos.x - bPos.x, mPos.y - bPos.y);

                        cloneItem.setPosition(cc.p(pos.x + offset.x, pos.y + offset.y));

                    }
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (sender.data) {

                        var isCollision = me.checkItemsCollision(cloneItem, sender.getTouchMovePosition());
                        if (isCollision != null) {
                            me.changeItem(sender, isCollision);
                        }

                        if (me.cloneItem) {
                            me.cloneItem.removeFromParent();
                            delete me.cloneItem;
                        }
                        sender.show();
                    }
                }

            });
        },
        removeItem: function(tid) {
            var me = this;

            var itemArr = me.icoList;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item;
                // var imgAdd = item.nodes.img_add;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.jingjichang_gjfight.bottom.selectedData, tid);
                    if (idx > -1) {
                        G.frame.jingjichang_gjfight.bottom.selectedData.splice(idx, 1);
                        G.frame.jingjichang_gjfight.bottom.removeGou(tid);
                    }
                    delete item.data;
                    layIco.removeAllChildren();
                }
            }
        },
        addItem: function(tid) {
            var me = this;

            var itemArr = me.icoList;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!me.yj && (i + 1) % 7 == 0) {
                    continue;
                }
                if (me.yj && (i + 1) % 7 != 0) {
                    continue;
                }
                if (!item.data) {
                    item.data = tid;
                    item.setTouchEnabled(true);
                    var layIco = item;
                    // var imgAdd = item.nodes.img_add;
                    var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                    wid.setAnchorPoint(0.5, 1);
                    wid.setPosition(cc.p(layIco.width / 2, layIco.height));
                    me.addTouchEvent(wid);
                    if(me.sqid[parseInt(i / 6)]) {
                        wid.setArtifact(me.sqid[parseInt(i / 6)]);
                    }
                    layIco.addChild(wid);
                    break;
                }
            }
        },
        onOpen: function() {
            var me = this;
            me.sqid = ["", "", ""];
            me.bindBTN();

            me.nodes.sq1.setTouchEnabled(false);
            me.nodes.sq2.setTouchEnabled(false);
            me.nodes.sq3.setTouchEnabled(false);
        },
        onShow: function() {
            var me = this;
            me.addLayout();
            me.setDefendHero();
            me.addShenQi(me.sqid[0], 1);
            me.addShenQi(me.sqid[1], 2);
            me.addShenQi(me.sqid[2], 3);
            me.refreshPanel();
            me.refreshPetBtn();
            me.checkRedPoint();

        },
        onRemove: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;

        },
        checkIsAddPet: function (len) {
            var fightPet = this.DATA.crystal.play || {};
            if (Object.keys(fightPet).length == len) return false;
            var inFight = [];
            for (var pos in fightPet) {
                inFight.push(G.DATA.pet[fightPet[pos]].pid);
            }
            var petIdPet = {};
            for (var tid in G.DATA.pet) {
                var petData = G.DATA.pet[tid];
                if (!X.inArray(inFight, petData.pid)) {
                    if (!petIdPet[petData.pid]) petIdPet[petData.pid] = 1;
                    else petIdPet[petData.pid] ++;
                }
            }
            //return Object.keys(petIdPet).length >= len - Object.keys(fightPet).length;
            return  len > 0 && Object.keys(petIdPet).length > 0;
        },
        //拿到宠物数据
        getPetData: function (callback) {
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

})();