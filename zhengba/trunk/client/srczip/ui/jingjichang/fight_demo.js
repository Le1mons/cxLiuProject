/**
 * Created by LYF on 2019/6/24.
 */
(function () {
    //战斗演习
    var ID = 'fight_demo';

    var fun = X.bUi.extend({
        extConf: {
            maxnum: 6
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L("TS37")
                }).show();
            });

            me.nodes.btn_kz.click(function () {

                G.frame.yingxiong_fight.data({
                    pvType:'fight_demo',
                    data: {
                        npcPos: me.npcArr
                    }
                }).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            me.npcArr = [1];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.createLayout();
        },
        onHide: function () {
            var me = this;
        },
        createLayout: function () {
            var me = this;
            var num = 0;
            var scale = 0.8;
            var width = scale * me.nodes.list_yx.width;
            var layArr = [me.ui.finds("panel_qp"), me.ui.finds("panel_hp")];

            me.itemArr = [];

            for (var i = 0; i < me.extConf.maxnum; i++) {
                var lay;
                var item = me.nodes.list_yx.clone();
                X.autoInitUI(item);
                item.pos = i + 1;
                item.setName(i);
                me.setItem(item);
                item.nodes.img_renwu.loadTexture("img/zhandou/img_zdtx" + (i + 1) + ".png", 1);

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

                num++;
                item.show();
                item.setScale(scale);
                item.setPosition(cc.p((width + herInterval) * (num % 6) - 40, lay.height / 2));
                lay.addChild(item);
                me.itemArr.push(item);

                if(X.inArray(me.npcArr, item.pos)) me.addRole(item);
            }
        },
        setItem: function (item) {
            var me = this;
            var bPos, cloneItem, pos;

            item.setTouchEnabled(true);
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    if(X.inArray(me.npcArr, sender.pos)) {
                        var firstParent = sender.getParent();
                        var firstPos = firstParent.convertToWorldSpace(sender.getPosition());

                        bPos = sender.getTouchBeganPosition();
                        pos = me.ui.convertToNodeSpace(firstPos);
                        cloneItem = me.cloneItem = sender.clone();
                        cloneItem.pos = sender.pos;
                        cloneItem.setPosition(cc.p(pos));
                        me.ui.addChild(cloneItem);
                        sender.nodes.panel_yx.hide();
                    }
                } else if (type == ccui.Widget.TOUCH_MOVED){
                    if(X.inArray(me.npcArr, sender.pos)){
                        var mPos = sender.getTouchMovePosition();
                        var offset = cc.p(mPos.x - bPos.x, mPos.y - bPos.y);

                        cloneItem.setPosition(cc.p(pos.x + offset.x,pos.y + offset.y));
                    }
                } else if(type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (X.inArray(me.npcArr, sender.pos)) {

                        var isCollision = me.checkItemsCollision(cloneItem);

                        if (isCollision != null) {
                            me.changeItem(sender, isCollision);
                        }

                        if(me.cloneItem) {
                            me.cloneItem.removeFromParent();
                            delete me.cloneItem;
                            sender.nodes.panel_yx.show();
                        }
                    }
                } else if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(X.inArray(me.npcArr, sender.pos)) {
                        me.removeRole(sender);
                    } else {
                        me.addRole(sender);
                    }
                }
            });
        },
        checkItemsCollision: function (cloneItem) {
            var me = this;

            var itemsArr = me.itemArr;

            for (var i = 0; i < itemsArr.length; i++) {
                var item = itemsArr[i];
                if (cloneItem.pos != item.pos) {
                    var pos = item.getParent().convertToNodeSpace(cloneItem.getParent().convertToWorldSpace(cloneItem.getPosition()));
                    if (cc.rectContainsPoint(item.getBoundingBox(), pos)) {
                        return item;
                    }
                }
            }

            return null;
        },
        changeItem: function (sender, isCollision) {
            var me = this;

            if(!X.inArray(me.npcArr, isCollision.pos)) {

                me.addRole(isCollision);
                me.removeRole(sender);
            } else {
                sender.nodes.panel_yx.show();
            }
        },
        addRole: function (sender) {
            var me = this;

            var npc = G.class.shero(G.gc.npc[90000][0]);
            npc.setPosition(sender.nodes.panel_yx.width / 2, sender.nodes.panel_yx.height / 2);
            sender.nodes.panel_yx.addChild(npc);
            sender.nodes.panel_yx.show();
            sender.nodes.img_jiah.hide();

            if(!X.inArray(me.npcArr, sender.pos)) me.npcArr.push(sender.pos);
        },
        removeRole: function (sender) {
            var me = this;

            if(me.npcArr.length == 1) {
                sender.nodes.panel_yx.show();
                return G.tip_NB.show(L("ZSYYYGYXDSO"));
            }

            sender.nodes.panel_yx.removeAllChildren();
            sender.nodes.img_jiah.show();

            me.npcArr.splice(X.arrayFind(me.npcArr, sender.pos), 1);
        }
    });
    G.frame[ID] = new fun('zhandouyanxi.json', ID);
})();