/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //大秘境-种族-选择
    G.class.damijing_zhongzu_xuanze = X.bView.extend({
        extConf:{
            fight:{
                data: function (type) {
                    var data = G.DATA.yingxiong.list;
                    var keys = X.keysOfObject(data);

                    var arr = [];
                    if (type == 0) {
                        arr = keys;
                    } else {
                        for (var i = 0; i < keys.length; i++) {
                            var tid = keys[i];
                            var heroData = data[tid];
                            if (heroData.zhongzu == type) {
                                arr.push(tid);
                            }
                        }
                    }
                    return arr;
                },
                getSort: function (arr) {
                    var heroData = [];
                    var hidData = [];
                    var zz = {
                        5:1,
                        6:0,
                        4:2,
                        3:4,
                        2:5,
                        1:6
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
                        } else if(a.zhongzu != b.zhongzu) {
                            return zz[a.zhongzu] < zz[b.zhongzu] ? -1 : 1;
                        } else if(a.hid != b.hid) {
                            return a.hid * 1 > b.hid ? -1 : 1;
                        } else {
                            return a.zhanli > b.zhanli ? -1 : 1;
                        }
                    });

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

            me.fightData = (G.frame.damijing_setDef.data() && G.frame.damijing_setDef.data().herolist) || [];
            me.createMenu();
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var cacheArr = [];

            for(var i = 0; i < me.fightData.length; i ++) {
                cacheArr.push(me.fightData[i].tid);
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
            for (var i = 0; i < 8; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                if (i==7){
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                }
                list_ico.nodes.panel_zz.setScale(0.8);
                list_ico.show();

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        if (node.data == 7){
                            var img = 'img/public/ico/ico_zz11.png';
                        } else {
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        }
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            if (node.data == 7){
                                img = 'img/public/ico/ico_zz11_g.png';
                            } else {
                                img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            }
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
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
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

            var data = me.extConf[me._type].getSort(d, "star", "lv", "zhongzu", "hid");
            var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 5);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            var heroData = G.DATA.yingxiong.list[data];
            ui.setName(heroData.hid);

            var widget = G.class.shero(heroData);
            widget.setName('widget');
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            widget.setScale(0.9);

            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);
            ui.nodes.panel_ico.setTouchEnabled(false);
            ui.nodes.panel_ico.show();

            if (X.inArray(me.selectedData,data)) {
                widget.setGou(true);
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){

                    var plidarr = [];
                    for (var k=0;k<me.selectedData.length;k++){
                        if (G.DATA.yingxiong.list[me.selectedData[k]] && G.DATA.yingxiong.list[me.selectedData[k]].zhongzu==7){
                            plidarr.push(G.DATA.yingxiong.list[me.selectedData[k]].pinglunid);
                        }
                    }
                    if (X.inArray(plidarr,G.DATA.yingxiong.list[sender.data].pinglunid) && !X.inArray(me.selectedData, sender.data)){
                        return  G.tip_NB.show('传说种族同名英雄只可以上阵一个');
                    }

                    G.frame.damijing_setDef.posSelect = G.frame.damijing_setDef.ui.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition()));
                    if (X.inArray(me.selectedData, sender.data)) {
                        G.frame.damijing_setDef.posSelect.x += sender.width / 2;
                        sender.finds('widget').setGou(false);
                        me.selectedData.splice(X.arrayFind(me.selectedData,sender.data),1);
                        G.frame.damijing_setDef.bottom.removeItem(sender.data);
                    } else {
                        if (me.selectedData.length >= 6) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            for (var i = 0; i < G.frame.damijing_setDef.bottom.panel_yx.children.length; i ++) {
                                var chr = G.frame.damijing_setDef.bottom.panel_yx.children[i];
                                chr.children[2].children[0].setSelected();
                            }
                            return;
                        }
                        me.selectedData.push(sender.data);
                        sender.finds('widget').setGou(true);
                        G.frame.damijing_setDef.bottom.addItem(sender.data);

                        if (cc.isNode(G.frame.damijing_setDef.item)) {
                            G.frame.damijing_setDef.item.stopAllActions();
                            G.frame.damijing_setDef.item.removeFromParent();
                        }
                        var itemClone = G.frame.damijing_setDef.item = sender.clone();
                        itemClone.finds('gou').hide();
                        itemClone.setPosition(G.frame.damijing_setDef.posSelect);
                        G.frame.damijing_setDef.ui.addChild(itemClone);
                        G.frame.damijing_setDef.playAniMove(itemClone);
                    }
                }
            }, null, {"touchDelay": G.DATA.touchHeroHeadTimeInterval});

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
