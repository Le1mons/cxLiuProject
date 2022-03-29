/**
 * Created by lsm on 2018/6/23
 */
(function() {
    //英雄-冠军试炼-开战选择
    G.class.jingjichang_gjkaizhan = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('jingjichang_yxcz.json');
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
            me.nodes.btn_kz.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    //空判断
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
                }
            });

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

            me.ui.finds("btn1").click(function () {
                me.changeSQ(1);
            });
            me.ui.finds("btn2").click(function () {
                me.changeSQ(2);
            });
            me.ui.finds("btn3").click(function () {
                me.changeSQ(3);
            });
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

            if(!isNeedShow) G.setNewIcoImg(me.nodes.btn_cdsq, .95);
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
            var idx = type == 1 ? 0 : 6;
            var idx2 = type == 1 ? 6 : 12;
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
                if (item) {
                    var pos = item.getParent().convertToNodeSpace(p);
                    if (cc.rectContainsPoint(item.getBoundingBox(), pos)) {
                        return item;
                    }
                }
            }

            return null;
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
                for (var i = 1; i < 7; i++) {
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
                if (k < 6) {
                    tiem1[k + 1] = me.icoList[key].data || 0;
                } else if (5 < k && k < 12) {
                    tiem2[k % 6 + 1] = me.icoList[key].data || 0;
                } else {
                    tiem3[k % 6 + 1] = me.icoList[key].data || 0;
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
            }else{
                if(G.frame.wangzherongyao.isShow && !defdata) {
                 defdata = X.cacheByUid("pvwz");
             }else{
                defdata = X.cacheByUid('fight_gjjjc');
            }
            }

            //没有数据时跳出设置
            if (!defdata || defdata.length < 1) {
                return;
            }

            for (var i = 0; i < defdata.length; i++) {
                var icolist = me.sanList[i];
                var datalist = defdata[i];
                if(datalist.sqid) {
                    me.sqid[i] = datalist.sqid;
                }
                for (var key in datalist) {
                    if(G.DATA.yingxiong.list[datalist[key]]){
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
        },
        addLayout: function() {
            var me = this;
            var count = 0;
            me.icoList = [];
            me.icoData = [];
            me.sanList = [];
            for (var i = 0; i < 3; i++) {
                var list = me.nodes.list.clone();
                setico();
                list.show();
                list.setAnchorPoint(0, 0);
                list.setPosition(0, 0);
                me.nodes['Panel_' + (i + 1)].addChild(list);
            }

            function setico() {
                X.autoInitUI(list);
                var zuo = list.nodes.panel_ico1;
                var you = list.nodes.panel_ico2;
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
                if (!item.data) {
                    item.data = tid;
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
        },
        onShow: function() {
            var me = this;
            me.addLayout();
            me.setDefendHero();
            me.refreshPanel();
            me.checkRedPoint();
        },
        onRemove: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;

        },

    });

})();