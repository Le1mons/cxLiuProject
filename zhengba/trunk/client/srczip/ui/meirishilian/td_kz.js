/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //大秘境-保存备战阵容
    G.class.td_kz = X.bView.extend({
        extConf:{
            maxnum:3,
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhandou_kaizhan2.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_kz.click(function () {
                var arr = me.getSelectedData();
                if(arr.length < me.extConf.maxnum) {
                    return G.tip_NB.show(L('td_fight_need'));
                }
                // me.ajax("watcher_prepare", [arr], function (str, data) {
                //     if(data.s == 1) {
                //         G.frame.td_fightRead.remove();
                //         G.frame.damijing.checkShow();
                //         G.hongdian.getData("watcher", 1);
                //     }
                // })

                G.frame.td_fight.data({
                    type:G.frame.td_fightRead.data().type,
                    idx: G.frame.td_fightRead.data().idx,
                    showJump: G.frame.td_fightRead.data().showJump,
                    hero: arr
                }).show();
                G.frame.td_fightRead.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            //me.panel_yx = me.ui.finds("panel_yx");
        },
        onShow: function () {
            var me = this;
            me.fightData = [];
            me.refreshPanel();

            //me.ui.finds("panel_time").hide();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.createLayout();
        },
        createLayout: function () {
            var me = this;
            var list = me.nodes.panel_list;

            me.itemArr = [];
            for(var i = 0; i < me.extConf.maxnum; i ++) {
                var item = list.clone();
                item.idx = i;
                item.setName(i);
                item.show();
                me.setItem(item);
                me.itemArr.push(item);
                var parent = me.nodes['panel_qp' + (i + 1)];
                parent.addChild(item);
                item.setPosition(0, 0);
            }
            me.loadCache();
        },
        loadCache: function() {
            var me = this;

            for(var i = 0; i < me.itemArr.length; i ++) {
                var item = me.itemArr[i];
                if(me.fightData[i] && G.DATA.yingxiong.list[me.fightData[i].tid]) {
                    var tid = me.fightData[i].tid;
                    var latIco = item.nodes.panel_ico;
                    var wid = G.class.shero(me.fightData[i]);
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
            var layIco = item.nodes.panel_ico;
            layIco.setTouchEnabled(false);
            layIco.removeAllChildren();

            item.nodes.shanghai_sz.setTextColor(cc.color("#fff5da"));
            item.setTouchEnabled(true);
            // item.click(function (sender) {
            //     if (sender.data) {
            //         me.removeItem(sender.data);
            //     }
            // });

            var bPos,cloneItem,pos;
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_MOVED) {
                    if (sender.data) {
                        var mPos = sender.getTouchMovePosition();
                        if (!cc.isNode(cloneItem)) {
                            cloneItem = G.class.shero(G.DATA.yingxiong.list[sender.data]);
                            cloneItem.scale = .8;
                            cloneItem.tid = sender.data;
                            G.frame.td_fightRead.ui.addChild(cloneItem);
                            sender.hide();
                        }
                        cloneItem.setPosition(mPos);
                    }
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (sender.data) {
                        if (cc.isNode(cloneItem)) {
                            var isCollision = me.checkItemsCollision(cloneItem);
                            if (isCollision) {
                                me.changeItem(sender, isCollision);
                            }
                            cloneItem.removeFromParent();
                            cloneItem = undefined;
                            sender.show();
                        }
                    }
                } else if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data) {
                        me.removeItem(sender.data);
                    }
                }
            });
        },
        checkItemsCollision: function (cloneItem) {
            var me = this;

            var itemsArr = me.itemArr;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.tid != item.data) {
                    var pos = cloneItem.convertToWorldSpaceAR();
                    var node = item.nodes.panel_ico;
                    var nodePos = node.convertToWorldSpaceAR();

                    if (pos.x >= nodePos.x - node.width / 2
                        && pos.x <= nodePos.x + node.width / 2
                        && pos.y <= nodePos.y + node.height / 2
                        && pos.y >= nodePos.y - node.height / 2 ) {
                        return item;
                    }
                }
            }
            return null;
        },
        changeItem: function(item1,item2) {
            var me = this;
            var tid1 = item1.data;
            var tid2 = item2.data;
            item1.nodes.panel_ico.removeAllChildren();
            item2.nodes.panel_ico.removeAllChildren();

            if (tid2) {
                item2.data = tid1;
                item1.data = tid2;

                var wid = G.class.shero(G.DATA.yingxiong.list[tid2]);
                wid.setAnchorPoint(0.5, 1);
                wid.setPosition(item1.nodes.panel_ico.width / 2,item1.nodes.panel_ico.height);
                item1.nodes.panel_ico.addChild(wid);

                var wid1 = G.class.shero(G.DATA.yingxiong.list[tid1]);
                wid1.setAnchorPoint(0.5, 1);
                wid1.setPosition(item2.nodes.panel_ico.width / 2,item2.nodes.panel_ico.height);
                item2.nodes.panel_ico.addChild(wid1);

            } else {
                item1.data = undefined;
                item2.data = tid1;

                var wid1 = G.class.shero(G.DATA.yingxiong.list[tid1]);
                wid1.setAnchorPoint(0.5, 1);
                wid1.setPosition(item2.nodes.panel_ico.width / 2,item2.nodes.panel_ico.height);
                item2.nodes.panel_ico.addChild(wid1);
            }
            me.setZL();
        },
        removeItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item.nodes.panel_ico;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.td_fightRead.top.selectedData, tid);
                    if (idx > -1) {
                        G.frame.td_fightRead.top.selectedData.splice(idx, 1);
                        G.frame.td_fightRead.top.removeGou(tid);
                    }

                    var child = G.frame.td_fightRead.top.getChildByTid(tid);
                    if (child) {
                        G.frame.td_fightRead.posSelect = G.frame.td_fightRead.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                        G.frame.td_fightRead.posSelect.x += child.width / 2;
                    }
                    if (cc.isNode(G.frame.td_fightRead.item)) {
                        G.frame.td_fightRead.item.stopAllActions();
                        G.frame.td_fightRead.item.removeFromParent();
                    }
                    G.frame.td_fightRead.playAniType = 'remove';
                    G.frame.td_fightRead.posSz = G.frame.td_fightRead.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    var itemClone = G.frame.td_fightRead.item = layIco.clone();
                    itemClone.setPosition(G.frame.td_fightRead.posSz);
                    G.frame.td_fightRead.ui.addChild(itemClone);
                    G.frame.td_fightRead.playAniMove(itemClone);

                    delete item.data;
                    layIco.removeAllChildren();
                }
            }
            me.setZL();
        },
        addItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = tid;
                    var layIco = item.nodes.panel_ico;
                    var wid = G.class.shero(G.DATA.yingxiong.list[tid]);
                    wid.setAnchorPoint(0.5,1);
                    wid.setPosition(cc.p(layIco.width / 2,layIco.height));
                    layIco.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);

                    G.frame.td_fightRead.playAniType = 'add';
                    G.frame.td_fightRead.posSz = G.frame.td_fightRead.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    G.frame.td_fightRead.posSz.x -= layIco.width / 2;
                    break;
                }
            }
            me.setZL();
        },
        getSelectedData: function () {
            var me = this;

            var itemArr = me.itemArr;
            var arr = [];
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (item.data) {
                    arr.push(item.data);
                }
            }
            return arr;
        },
        setZL: function () {
            var me = this;
            var num = 0;
            var txt = me.nodes.txt_djs;
            var conf = G.gc.jgsw[G.frame.td_fightRead._extData.type][G.frame.td_fightRead._extData.idx][0];

            for (var i = 0; i < me.itemArr.length; i ++) {
                var item = me.itemArr[i];
                if(!item.data) {
                    item.nodes.shanghai_sz.setString('');
                } else {
                    num += G.DATA.yingxiong.list[item.data].zhanli;
                    var atk = G.DATA.yingxiong.list[item.data].atk * conf.power * conf.frequent;
                    item.nodes.shanghai_sz.setString(L('MIAODPS') + X.fmtValue(atk));
                }

            }
            txt.setString(X.fmtValue(num));
        }
    });

})();