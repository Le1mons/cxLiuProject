/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //噬渊战场-保存备战阵容
    G.class.shiyuanzhanchang_save_hero = X.bView.extend({
        extConf:{
            maxnum:6,
        },
        sqimg: {
            1: "shenbing_hmzr",
            2: "shenbing_lrsg",
            3: "shenbing_snfz",
            4: "shenbing_zwjj",
            5: "shenbing_slcq",
            6: "shenbing_jdzc"
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('shiyuan_tk9_nr.json');
        },
        refreshPetBtn: function (data) {
            var me = this;
            if (data) me.DATA.crystal.play = data;
            //神宠按钮显示
            if (X.checkIsOpen("pet")) {
                me.getPetData(function () {
                    me.nodes.btn_shenchong.show();
                    //剩余的槽位，并有可上阵的宠物
                    var petonfightnum = X.keysOfObject(me.DATA.crystal.play).length;//在阵上的宠物数量
                    var slotopen = G.gc.petcom.base.slotopen;//槽位开放的条件
                    var sitnum = 0;//当前开放的槽位数量
                    for (var m in slotopen) {
                        if (me.DATA.crystal.crystal.rank >= slotopen[m]) sitnum++;
                    }

                    //放按钮特效
                    if (sitnum > petonfightnum && me.checkIsAddPet(sitnum)) {
                        if (me.nodes.btn_shenchong.childrenCount == 0) {
                            G.class.ani.show({
                                json: "ani_shenchong_anniu",
                                addTo: me.nodes.btn_shenchong,
                                repeat: true,
                                autoRemove: false,
                            });
                        }
                    } else {
                        me.nodes.btn_shenchong.removeAllChildren();
                    }
                });
            } else {
                me.nodes.btn_shenchong.hide();
            }
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
        refreshPanel: function () {
            var me = this;
            me.createLayout();
            me.createMenu();
            me.addShenQi(me.sqid[me.curTeam]);
        },
        createMenu:function(){
          var me = this;
            var duizhang = G.gc.syzccom.duizhang;
          for (var i=1;i<=3;i++){
              me.nodes['panel_dw'+i].removeAllChildren();
              var list = me.nodes.list_dw.clone();
              X.autoInitUI(list);
              list.show();
              list.setAnchorPoint(0,0);
              list.setPosition(0,0);
              list.nodes.panel_k.removeBackGroundImage();
              list.nodes.panel_k.setBackGroundImage('ico/itemico/'+ duizhang[i] + 'y.png',0);
              list.nodes.panel_ico.setBackGroundImage('img/shiyuanzhanchang/ico_dw'+i+'.png',1);
              list.ID = i;
              me.nodes['panel_dw'+i].setTouchEnabled(false);
              list.nodes.panel_zz.hide();
              list.setTouchEnabled(true);
              list.click(function (sender,type) {
                  if (me.oldselect && me.oldselect.ID == sender.ID) return;
                  sender.nodes.img_xz.show();
                  sender.nodes.panel_zz.show();
                  if (me.oldselect){
                      me.oldselect.nodes.img_xz.hide();
                      me.oldselect.nodes.panel_zz.hide();
                  }

                  if (cc.isNode(G.frame.shiyuanzhanchang_xzyx.item)) {
                      G.frame.shiyuanzhanchang_xzyx.item.stopAllActions();
                      G.frame.shiyuanzhanchang_xzyx.item.removeFromParent();
                  }
                  me.oldselect = sender;
                  me.curTeam = sender.ID;
                  G.frame.shiyuanzhanchang_xzyx.top.curType = 0;
                  if (G.frame.shiyuanzhanchang_xzyx.top._menus && G.frame.shiyuanzhanchang_xzyx.top._menus.length>0){
                      G.frame.shiyuanzhanchang_xzyx.top._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
                  }
                  me.addShenQi(me.sqid[me.curTeam-1]);
                  me.loadCache();
                  me.setBuff();
                  me.checkHeroTx();
                  me.checkRedPoint();
              });
              me.nodes['panel_dw'+i].addChild(list);
          }
            me.nodes.panel_dw1.getChildren()[0].triggerTouch(2);
        },
        bindBTN: function () {
            var me = this;
            me.nodes.btn_tishi.setTouchEnabled(true);
            me.nodes.btn_kz.click(function () {
                var teamarr1 = G.frame.shiyuanzhanchang_xzyx.top['selectedData1'];
                var teamarr2 = G.frame.shiyuanzhanchang_xzyx.top['selectedData2'];
                var teamarr3 = G.frame.shiyuanzhanchang_xzyx.top['selectedData3'];
                if (teamarr1.length<1 || teamarr2.length<1 || teamarr3.length<1){
                    return G.tip_NB.show(L('syzc_4'));
                }
                if ((teamarr1.length+teamarr2.length+teamarr3.length)<18){
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function () {
                            var arr = me.getSelectedData();
                            G.DAO.shiyuanzhanchang.start(arr,G.frame.shiyuanzhanchang_xzyx.layer,function () {
                                G.frame.shiyuanzhanchang_floor.createDz();
                                G.frame.shiyuanzhanchang_floor.floorInfo(G.DATA.shiyuanzhanchang.layer);
                                G.frame.shiyuanzhanchang_xzyx.remove();

                            },me);
                        },
                        richText: L("syzc_5"),
                    }).show();
                    return ;
                }
                var arr = me.getSelectedData();
                G.DAO.shiyuanzhanchang.start(arr,G.frame.shiyuanzhanchang_xzyx.layer,function () {
                    G.frame.shiyuanzhanchang_floor.createDz();
                    G.frame.shiyuanzhanchang_xzyx.remove();
                    G.frame.shiyuanzhanchang_floor.floorInfo(G.DATA.shiyuanzhanchang.layer);
                },me);
            });
            me.nodes.btn_zxxq.click(function () {
                G.frame.fight_zzkezhi.data(me.zzConf).show();
            });
            //神宠
            me.nodes.btn_shenchong.setVisible(X.checkIsOpen("pet"));
            me.nodes.btn_shenchong.click(function () {
                if (me.DATA.crystal.crystal.rank == 0 || X.keysOfObject(G.DATA.pet).length == 0) {
                    G.tip_NB.show(L("pettip10"));
                } else {
                    G.frame.sc_order.data("shiyuanzhanchang").show();
                }
            });
            me.nodes.btn_tishi.click(function () {
                me.changeSQ(me.curTeam);
            });
        },
        getObj:function(arr){
            var me = this;
            var obj = {};
            for (var i=0;i<arr.length;i++){
                obj[i+1] = arr[i].toString();
            }
            return obj;
        },
        onOpen: function () {
            var me = this;
            me.sqid = ["", "", ""];
            me.panel_yx = me.ui.finds("panel_yx");
        },
        onShow: function () {
            var me = this;
            me.curTeam = 1;
            // me.fightData1 = [];
            // me.fightData2 = [];
            // me.fightData3 = [];
            me.refreshPanel();
            me.refreshPetBtn();
            me.bindBTN();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
        },
        setBuff: function () {
            var me = this;
            var zzConf = me.zzConf = {};
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);
            var zz2num = me.getZz2Num();

            for (var i = 0; i < keys.length; i++) {
                var data = G.class.zhenfa.getById(keys[i]).data;

                for (var j = 0; j < data.length; j++) {
                    var isOk = true;
                    var cond = data[j].cond;

                    for (var zz in cond) {
                        if (!zz2num[zz] || zz2num[zz] < cond[zz]) {
                            isOk = false;
                            break;
                        }
                    }

                    if (isOk) {
                        zzConf[keys[i]] = j;
                    }
                }
            }
            var zzdata = [];
            for (var i in zzConf) {
                var obj = {};
                obj.zz = i;
                obj.lv = zzConf[i];
                zzdata.push(obj);
            }

            zzdata.sort(function (a, b) {
                if (a.lv != b.lv) {
                    return a.lv > b.lv ? -1 : 1;
                } else {
                    return a.zz > b.zz ? -1 : 1;
                }
            });


            me.nodes.list_zf.hide();
            var arr = me.arr = [];
            var zzkeys = X.keysOfObject(zzdata);

            for (var i = 0; i < 3; i++) {
                (function (data) {
                    var list = me.nodes.list_zf.clone();
                    X.autoInitUI(list);
                    list.show();

                    if (data) {
                        if (zzdata[data].zz == 1) {
                            list.nodes.panel_top.hide();
                        } else {
                            list.nodes.panel_top.show();
                            list.nodes.txt_top.setString(zzdata[data].lv + 1);
                        }
                        list.nodes.ico_zx.setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(zzdata[data].zz) + '.png', 1);
                    } else {
                        if (i != 0) list.hide();
                        list.nodes.ico_zx.setBackGroundImage("img/zhenfa/zhenfa_1_h.png", 1);
                    }

                    list.nodes.ico_zx.click(function () {
                        G.frame.fight_zzkezhi.data(zzConf).show();
                    });
                    arr.push(list);
                })(zzkeys[i]);
            }
            me.nodes.zckz = arr[0].nodes.ico_zx;
            X.left(me.nodes.panel_cx, arr, 1, 5, 1);
        },
        //获得选择数据种族对应的数量
        getZz2Num: function () {
            var me = this;

            var sData = G.frame.shiyuanzhanchang_xzyx.top['selectedData'+me.curTeam] || [];

            var obj = {};
            for (var i = 0; i < sData.length; i++) {
                var id = sData[i];
                var heroData = G.DATA.yingxiong.list[id];
                obj[heroData.zhongzu] = obj[heroData.zhongzu] || 0;
                obj[heroData.zhongzu]++;
            }

            return obj;
        },
        createLayout: function () {
            var me = this;

            var layArr = [me.ui.finds("panel_qp"), me.ui.finds("panel_hp")];
            var lay, herInterval;
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
                X.autoInitUI(item);
                item.idx = i;
                item.setName(i);
                me.setItem(item);
                item.nodes.img_renwu.loadTexture("img/zhandou/img_zdtx" + (i + 1) + ".png", 1);

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
                item.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                itemBg.setScale(scale);
                itemBg.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6), lay.height / 2));

                num++;

                itemBg.finds('img_renwu$').hide();

                lay.addChild(itemBg);
                itemBg.setLocalZOrder(-1);
                itemBg.show();

                lay.addChild(item);
                item.setLocalZOrder(1);
                item.show();
                me.itemArr.push(item);
            };
        },
        loadCache: function() {
            var me = this;
            var fightData = G.frame.shiyuanzhanchang_xzyx.top['selectedData'+me.curTeam]||[];
            for(var i = 0; i < me.itemArr.length; i ++) {
                var item = me.itemArr[i];
                item.data = undefined;
                var latIco = item.nodes.panel_yx;
                latIco.removeAllChildren();
                if(fightData[i]) {
                    var herod = G.DATA.yingxiong.list[fightData[i]];
                    var tid = fightData[i];
                    var wid = G.class.shero(herod);
                    wid.setAnchorPoint(0.5, 1);
                    wid.setPosition(latIco.width / 2, latIco.height);
                    latIco.addChild(wid);
                    item.data = tid;
                }
            }
            me.setZL();
        },
        setItem: function (item) {
            X.autoInitUI(item);
            var me = this;
            var layIco = item.nodes.panel_yx;
            layIco.setTouchEnabled(false);
            layIco.removeAllChildren();

            item.setTouchEnabled(true);
            item.click(function (sender) {
                if (sender.data) {
                    me.removeItem(sender.data);
                }
            })
        },
        removeItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item.nodes.panel_yx;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.shiyuanzhanchang_xzyx.top['selectedData'+me.curTeam], tid);
                    if (idx > -1) {
                        G.frame.shiyuanzhanchang_xzyx.top['selectedData'+me.curTeam].splice(idx, 1);
                        G.frame.shiyuanzhanchang_xzyx.top.removeGou(tid);
                    }

                    var child = G.frame.shiyuanzhanchang_xzyx.top.getChildByTid(tid);
                    if (child) {
                        G.frame.shiyuanzhanchang_xzyx.posSelect = G.frame.shiyuanzhanchang_xzyx.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                        G.frame.shiyuanzhanchang_xzyx.posSelect.x += child.width / 2;
                    }
                    if (cc.isNode(G.frame.shiyuanzhanchang_xzyx.item)) {
                        G.frame.shiyuanzhanchang_xzyx.item.stopAllActions();
                        G.frame.shiyuanzhanchang_xzyx.item.removeFromParent();
                    }
                    G.frame.shiyuanzhanchang_xzyx.playAniType = 'remove';
                    G.frame.shiyuanzhanchang_xzyx.posSz = G.frame.shiyuanzhanchang_xzyx.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    var itemClone = G.frame.shiyuanzhanchang_xzyx.item = layIco.clone();
                    itemClone.setPosition(G.frame.shiyuanzhanchang_xzyx.posSz);
                    G.frame.shiyuanzhanchang_xzyx.ui.addChild(itemClone);
                    G.frame.shiyuanzhanchang_xzyx.playAniMove(itemClone);

                    delete item.data;
                    layIco.removeAllChildren();
                }
            }
            me.setBuff();
            me.setZL();
        },
        addItem: function (hid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = hid;
                    var layIco = item.nodes.panel_yx;
                    var wid = G.class.shero(G.DATA.yingxiong.list[hid]);
                    wid.setAnchorPoint(0.5,1);
                    wid.setPosition(cc.p(layIco.width / 2,layIco.height));
                    layIco.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);

                    G.frame.shiyuanzhanchang_xzyx.playAniType = 'add';
                    G.frame.shiyuanzhanchang_xzyx.posSz = G.frame.shiyuanzhanchang_xzyx.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    G.frame.shiyuanzhanchang_xzyx.posSz.x -= layIco.width / 2;
                    me.setBuff();
                    break;
                }
            }
            me.setZL();
        },
        getSelectedData: function () {
            var me = this;
            var arr = [];
            var yidui = {};
            var erdui = {};
            var sandui = {};
            var teamarr1 = G.frame.shiyuanzhanchang_xzyx.top['selectedData1'];
            var teamarr2 = G.frame.shiyuanzhanchang_xzyx.top['selectedData2'];
            var teamarr3 = G.frame.shiyuanzhanchang_xzyx.top['selectedData3'];
            //一队
            for (var i =0;i<teamarr1.length;i++){
                yidui[i+1] = teamarr1[i];
            }
            yidui['sqid'] = me.sqid[0];
            //二队
            for (var i =0;i<teamarr2.length;i++){
                erdui[i+1] = teamarr2[i];
            }
            erdui['sqid'] = me.sqid[1];
            //三队
            for (var i =0;i<teamarr3.length;i++){
                sandui[i+1] = teamarr3[i];
            }
            sandui['sqid'] = me.sqid[2];
            arr = [yidui,erdui,sandui];
            return arr;
        },
        setZL: function () {
            var me = this;
            var fightData = G.frame.shiyuanzhanchang_xzyx.top['selectedData'+me.curTeam]||[];
            var num = 0;
            var txt = me.nodes.txt_djs;
            var zhanli = 0;
            for (var i=0;i<=fightData.length;i++){
                if (fightData[i] && G.DATA.yingxiong.list[fightData[i]]){
                    zhanli += G.DATA.yingxiong.list[fightData[i]].zhanli;
                }
            }
            txt.setString(zhanli);
        },
        addShenQi: function(sqid) {
            var me = this;
            var panel = me.ui.finds("Panel_3").finds("ico_zx1$");

            panel.removeBackGroundImage();
            if (me.sqimg[sqid]) {
                panel.setBackGroundImage("img/shenbing/" + me.sqimg[sqid] + ".png");
                me.nodes.txt_zx.setString(G.gc.shenqicom.shenqi[sqid].name);
            } else {
                me.nodes.txt_zx.setString(L("SQ"));
            }
        },
        changeSQ: function(type) {
            var me = this;

            G.frame.shenqi_xuanze.data({
                sqid: me.sqid[type - 1],
                sqArr: me.sqid,
                idx: type - 1,
                callback: function f(data) {
                    me.sqid[type - 1] = data;
                    me.checkHeroTx();
                    me.addShenQi(me.sqid[type - 1]);
                    me.checkRedPoint();
                },
            }).show();
        },
        checkHeroTx:function(){
            var me = this;
            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                if (itemArr[i].data) {
                    itemArr[i].finds("panel_yx$").getChildren()[0].setArtifact(me.sqid[me.curTeam-1], true);
                }
            }
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
        checkRedPoint: function () {
            var me = this;
            var num=0;
            me.nodes.btn_tishi.removeChildByTag(999);
            for (var i=0;i<me.sqid.length;i++){
                if (me.sqid[i]) num++;
            }
            if (!me.sqid[me.curTeam-1] && (P.gud.artifact-num)>0) {
                G.class.ani.show({
                    json: "shenbingpeidai_dh",
                    addTo: me.nodes.btn_tishi,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setTag(999);
                    }
                });
            }
        },
    });

})();