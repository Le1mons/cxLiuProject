/**
 * Created by
 */
(function () {
    //
    var ID = 'jstl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.DATA = me.data();
            me.nodes.listview.setBounceEnabled(false);
            me.nodes.listview.setItemsMargin(50);
            me.layoutArr = [];
            me.listLeftX = 0;
            me.setMax();
        },
        setMax: function() {
            var me = this;
            var scrollview = me.nodes.listview,
                innerContent = scrollview.getInnerContainer();

            me.ui.update = function (dt) {
                if(innerContent.x > me.listLeftX) {
                    innerContent.x = me.listLeftX;
                }
            };
            me.ui.scheduleUpdate();
        },
        onShow: function () {
            var me = this;

            new X.bView('jianshengtulong_list1.json', function (view) {
                me.list1 = view.nodes.list1;
                view.hide();
                me.ui.addChild(view);
                new X.bView('jianshengtulong_list2.json', function (view1) {
                    me.list2 = view1.nodes.list1;
                    view1.hide();
                    me.ui.addChild(view1);
                    me.initTower();
                });
            });
        },
        initTower: function () {
            var me = this;
            var conf = me.DATA.enemy;

            (function create(index) {
                if (!conf[index]) return null;
                var idx = index;
                var _conf = conf[idx];
                var cloneList = idx == conf.length - 1 ? me.list2 : me.list1;
                var layout = new ccui.Layout();
                layout.setAnchorPoint(0.5, 0);
                layout.setContentSize(cloneList.width, C.WS.height);
                var height = 50;
                cc.each(_conf, function (data, index) {
                    var list = cloneList.clone();
                    list.setAnchorPoint(0.5, 0);
                    list.setPosition(layout.width / 2, height - index * 8);
                    list.finds('panel_wp$').idx = idx;
                    me.initLayout(list.finds('panel_wp$'), data);
                    layout.addChild(list);
                    layout.idx = idx;
                    height += list.height - index * 8;
                });
                me.nodes.listview.pushBackCustomItem(layout);
                if (idx < conf.length - 1) {
                    var ding = new ccui.ImageView('img/bg/bg_jstl5.png');
                    ding.setAnchorPoint(0.5, 0);
                    ding.setPosition(layout.width / 2, height - 2);
                    layout.addChild(ding);
                }

                index ++;
                create(index);
            })(0);
        },
        initLayout: function (panel, data) {
            panel.data = data;
            panel.node = [];
            if (data.type == 'enemy') {
                cc.each(data.enemy, function (d, index) {
                    var _d = cc.mixin({"type": "enemy"}, d);
                    var role = new G.class.jstlModel(_d);
                    panel.addChild(role);
                    role.setPosition(panel.width - 20 - index * 75, 0);
                    panel.node.push(role);
                });
                panel.boss = data.boss;
                panel.node.reverse();
            } else {
                var role = new G.class.jstlModel(data);
                panel.addChild(role);
                role.setPosition(data.type == 'me' ? 30 : panel.width - 50, 0);
                if (data.type == 'me') panel.over = true;
                panel.node.push(role);
            }
            this.layoutArr.push(panel);

            // panel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            // panel.setBackGroundColor(cc.color('#000000'));
            // panel.setBackGroundColorOpacity(100);
        },
        checkItemsCollision: function (cloneItem, movePos) {
            var me = this;
            for (var i = 0; i < me.layoutArr.length; i++) {
                var item = me.layoutArr[i];
                if (!item.over) {
                    var pos = cloneItem.convertToWorldSpaceAR();
                    pos.x += cloneItem.height / 2;
                    var nodePos = item.convertToWorldSpaceAR();

                    if (movePos.x >= nodePos.x - item.width / 2 - 50
                        && movePos.x <= nodePos.x + item.width / 2 - 50
                        && movePos.y <= nodePos.y + item.height / 2 + 30
                        && movePos.y >= nodePos.y - item.height / 2 - 40) {
                        return item;
                    }
                }
            }
            return null;
        },
        changeItem: function (my, panel) {
            var me = this;
            var data = JSON.parse(JSON.stringify(my.data));
            var newRole = new G.class.jstlModel(data);
            newRole.setPosition(30, 0);
            my.removeFromParent();
            panel.addChild(newRole);
            newRole.setTouchEnabled(false);

            (function checkNode(index) {
                if (!panel.node[index]) {
                    newRole.setTouchEnabled(true);
                    panel.over = true;
                    if (panel.boss) {
                        if (!X.inArray(G.frame.xiaoyouxi.DATA.xiaoyouxi[0], me.DATA.index)) {
                            me.ajax('xiaoyouxi_getprize', [0, me.DATA.index], function (str, data) {
                                if (data.s == 1) {
                                    G.frame.xiaoyouxi.DATA.xiaoyouxi[0].push(me.DATA.index);
                                    G.frame.xiaoyouxi.setContents();
                                    G.frame.jstl_level.setTable();
                                    G.frame.jiangli.data({
                                        prize: G.gc.xyx[0].level[me.DATA.index].prize
                                    }).once('willClose', function () {
                                        me.remove();
                                    }).show();
                                }
                            });
                        } else {
                            me.remove();
                        }
                    }
                } else {
                    var node = panel.node[index];
                    if (node.data.type == 'item') {
                        newRole.data.power += node.power;
                        newRole.data.model = node.model;
                        node.removeFromParent();
                        G.class.ani.show({
                            json: 'ani_shenchong_shuaxin_dh',
                            addTo: newRole,
                            z: 1000,
                            onend: function () {
                                newRole.showRole();
                                newRole.showPower(true);
                                index ++;
                                checkNode(index);
                            }
                        });
                    } else if (node.data.type == 'enemy') {
                        var __index = 0;
                        var power = node.power;
                        function check() {
                            __index ++;
                            if (__index == 2) {
                                if (newRole.dead) {
                                    G.frame.tdFail.data('jstl').once('willClose', function () {
                                        me.remove();
                                    }).show();
                                } else {
                                    newRole.power += power;
                                    newRole.data.power += power;
                                    newRole.showPower(true);
                                    index ++;
                                    checkNode(index);
                                }
                            }
                        }
                        newRole.atk(node.power, check);
                        node.atk(newRole.power, check);
                    }
                }
            })(0);
            me.nodes.listview.jumpToIdx(panel.idx, {
                action: true
            });
            me.ui.setTimeout(function () {
                me.listLeftX = me.nodes.listview.getInnerContainer().x;
            }, 500)
        },

    });
    G.frame[ID] = new fun('jianshengtulong_pata.json', ID);

    var self = G.frame.jstl;
    G.class.jstlModel = ccui.Layout.extend({
        ctor: function (data) {
            this.data = data;
            this.type = this.data.type;
            this.power = this.data.power;
            this.model = this.data.model;
            this._super.apply(this,arguments);
            this.initThis();
            if (this.type == 'me') {
                this.addTouch();
            }
            return this;
        },
        initThis: function () {
            this.setAnchorPoint(0.5, 0)
            this.setContentSize(80, 100);
            // this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            // this.setBackGroundColor(cc.color('#ffffff'));
            // this.setBackGroundColorOpacity(150);
            if (this.data.item) {
                this.showItem();
            } else {
                this.showRole();
            }
            this.showPower();
        },
        atk: function (power, callback) {
            var me = this;

            me.setAct('atk',false,function(){
                if (me.type == 'me') {
                    if (power >= me.power) {
                        me.dead = true;
                        me.spine.runAni(0,'die',false);
                    } else {
                        me.spine.runAni(0,'wait',true);
                    }
                } else {
                    if (power > me.power) {
                        me.dead = true;
                        me.spine.runAni(0,'die',false);
                        me.setTimeout(function () {
                            me.removeFromParent();
                        }, 1000);
                    } else {
                        me.spine.runAni(0,'wait',true);
                    }
                }
                callback && callback();
            });
        },
        setAct : function(actName,repeat,callback){
            var me = this;

            me.spine.stopAllAni();
            me.spine.setCompleteListener(function(traceIndex){
                delete me._currAct;
                me.spine.setCompleteListener(null);
                cc.callLater(function(){
                    me.spine.stopAllAni();
                    callback && callback.call(me);
                });
            });
            me.spine.runAni(0,actName,repeat);
            return true;
        },
        showItem: function () {
            var item = G.class.sitem(this.data.item);
            item.setAnchorPoint(0.5, 0);
            item.setPosition(this.width / 2, 0);
            item.num.hide();
            item.scale = this.data.scale || 1;
            this.addChild(item);
        },
        showRole: function () {
            var me = this;

            X.setHeroModel({
                parent: me,
                data: {},
                model: me.data.model,
                scaleNum: me.data.scale || 1,
                direction: me.type == 'me' ? 1:-1,
                noParentRemove: true
            });
        },
        showPower: function (ani) {
            if (!this.powerTxt) {
                this.powerTxt = new ccui.Text('', G.defaultFNT, 24);
                this.powerTxt.setTextColor(this.type != 'enemy' ? cc.color('#47eb29') : cc.color('#fc3c34'));
                X.enableOutline(this.powerTxt, '#000000', 1);
                this.powerTxt.setAnchorPoint(0.5, 0);
                this.powerTxt.setPosition(this.width / 2, 0);
                this.addChild(this.powerTxt);
                this.powerTxt.zIndex = 999;
            }
            this.powerTxt.setString(this.data.power);
            if (ani) {
                this.powerTxt.runActions([
                    cc.scaleTo(0.1, 1.2, 1.2),
                    cc.scaleTo(0.1, 1, 1)
                ]);
            }
        },
        addTouch: function () {
            var me = this;
            var cloneRole;
            me.setTouchEnabled(true);
            me.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_MOVED) {
                    if (!cc.isNode(cloneRole)) {
                        cloneRole = new G.class.jstlModel(me.data);
                        cloneRole.setTouchEnabled(false);
                        self.ui.addChild(cloneRole);
                        sender.hide();
                        self.nodes.listview.setTouchEnabled(false);
                    }
                    cloneRole.setPosition(sender.getTouchMovePosition());
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if (cc.isNode(cloneRole)) {
                        var isCollision = self.checkItemsCollision(cloneRole, sender.getTouchMovePosition());
                        if (isCollision) {
                            self.changeItem(sender, isCollision);
                        } else {
                            sender.show();
                        }
                        cloneRole.removeFromParent();
                        cloneRole = undefined;
                    }
                    self.nodes.listview.setTouchEnabled(true);
                }
            });
        }
    });
})();