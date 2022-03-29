/**
 * Created by LYF on 2018/6/5.
 */

(function () {
    //英雄-种族-选择
    G.class.xstask_xq = X.bView.extend({
        extConf:{
            xuanze:{
                data: function (zhongzu) {
                    var data = G.DATA.yingxiong.list;
                    var keys = X.keysOfObject(data);

                    for(var i = 0; i < keys.length; i ++){
                        if(!data[keys[i]].tid) data[keys[i]].tid = keys[i];
                    }

                    var arr = [];
                    if (zhongzu == 0) {
                        arr = keys;
                    } else {
                        for (var i = 0; i < keys.length; i++) {
                            var tid = keys[i];
                            var heroData = data[tid];
                            if (heroData.zhongzu == zhongzu) {
                                arr.push(tid);
                            }
                        }
                    }

                    return arr;
                },
                sort: function (a,b) {
                    var me = this;
                    var dataA = G.DATA.yingxiong.list[a];
                    var dataB = G.DATA.yingxiong.list[b];
                    var ysz = G.frame.xuanshangrenwu.DATA.herolist;

					var dataA_isRWZ = X.inArray(ysz, dataA.tid)?1:0;
					var dataB_isRWZ = X.inArray(ysz, dataB.tid)?1:0;

                    //先排序，后分类
                    if(dataA_isRWZ != dataB_isRWZ){
                        return dataA_isRWZ < dataB_isRWZ ? -1 : 1;
                    } else if (dataA.star != dataB.star) {
                        return dataA.star > dataB.star ? -1 : 1;
                    } else if (dataA.zhongzu != dataB.zhongzu) {
                        return dataA.zhongzu < dataB.zhongzu ? -1 : 1;
                    } else if (dataA.hid != dataB.hid) {
                        return dataA.hid < dataB.hid ? -1 : 1;
                    }
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
            me.createMenu();
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        setContents: function () {
            var me = this;
            var type = me.curType || 0;
            me.selectedData = [];
            me.ysz = G.frame.xuanshangrenwu.DATA.herolist;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        createMenu: function () {
            var me = this;

            var view = me;
            me._menus = [];
            var listview = view.nodes.listview_zz;
            cc.enableScrollBar(listview);
            view.nodes.list_ico.hide();

            for (var i = 0; i < 8; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                if (i==7){
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                }
                list_ico.nodes.panel_zz.setScale(0.8)
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
                            if(sender.ani){
                                sender.ani.show();
                            }else{
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
                });

                me._menus.push(list_ico);
                listview.pushBackCustomItem(list_ico);
                list_ico.show();
            }
        },
        setData: function(data){
            var me = this;
            for (var i = 0; i < data.length; i ++){
                if(X.inArray(me.ysz, data[i].tid)){
                    data[i].isRWZ = 1;
                }else{
                    data[i].isRWZ = 0;
                }
            }
            data.sort(function (a, b) {
                return a.isRWZ > b.isRWZ ? -1 : 1;
            })
        },
        fmtItemList: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            var d = me.extConf[me._type].data(me.curType);



            if (d.length < 1) {
                cc.sys.isObjectValid(me.ui.finds('zwnr')) && me.ui.finds('zwnr').show();
                return;
            } else {
                cc.sys.isObjectValid(me.ui.finds('zwnr')) && me.ui.finds('zwnr').hide();
            }

            var ysz = G.frame.xuanshangrenwu.DATA.herolist;

            //对材料分类，分类依据：加锁与未加锁
            var canUseArr = [],
                lockArr = [];
            for (var i = 0; i < d.length; i++) {
                var tid = d[i];
                canUseArr.push(tid);
            }

            canUseArr.sort(me.extConf[me._type].sort);

            // lockArr.sort(me.extConf[me._type].sort);

            var list = [].concat(canUseArr);
            //me.setData(list);

            var table = me.table = new X.TableView(scrollview,me.nodes.list, 5,function (ui, data) {
                me.setItem(ui, data);
            },null,null,1,5);
            table.setData(list);
            table.reloadDataWithScroll(true);

        },
        setItem: function (ui, data) {
            var me = this;

            ui.setName(data);
            X.autoInitUI(ui);

            var heroData = G.DATA.yingxiong.list[data];
            var widget = G.class.shero(heroData);
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);
            ui.nodes.panel_ico.show();

            // img_suo$
            // img_gou$
            //var imgSuo = ui.nodes.img_suo;
            // var imgGou = ui.nodes.img_gou;
            //
            // imgGou.hide();
            //imgSuo.hide();

            if(!X.inArray(G.frame.xuanshangrenwu.DATA.herolist, data)){
                ui.nodes.img_rwz.hide();
            }
            if (X.inArray(me.selectedData,data)) {
                // imgGou.show();
                widget.setGou(true);
            }
            if(X.inArray(me.ysz, data)){
                ui.nodes.img_rwz.show();
                ui.nodes.img_rwz.setScale(0.95);
                ui.nodes.img_rwz.setPositionY(53);
                // widget.setHighLight(false);
            }
            ui.nodes.panel_ico.setSwallowTouches(false);
            ui.nodes.panel_ico.data = data;
            ui.nodes.panel_ico.setTouchEnabled(true);
            ui.nodes.panel_ico.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.xuanshangrenwu_jiequ.posSelect = G.frame.xuanshangrenwu_jiequ.ui.convertToNodeSpace(
                        sender.getParent().convertToWorldSpace(sender.getPosition()));
                    if(X.inArray(me.ysz, data)){
                        G.tip_NB.show("该英雄已在任务中");
                        return;
                    }
                    if (X.inArray(me.selectedData, sender.data)) {
                        G.frame.xuanshangrenwu_jiequ.posSelect.x += sender.width / 2;
                        widget.setGou(false);
                        me.selectedData.splice(X.arrayFind(me.selectedData,sender.data),1);
                        G.frame.xuanshangrenwu_jiequ.bottom.removeItem(sender.data);
                    } else {
                        if (me.selectedData.length >= G.frame.xuanshangrenwu_jiequ.data().conf.heronum) {
                            G.tip_NB.show("已达上阵数量上限");
                            return;
                        }
                        me.selectedData.push(sender.data);
                        widget.setGou(true);

                        //移动动画
                        G.frame.xuanshangrenwu_jiequ.bottom.addItem(sender.data);
                        if(cc.isNode(G.frame.xuanshangrenwu_jiequ.item)){
                            G.frame.xuanshangrenwu_jiequ.item.stopAllActions();
                            G.frame.xuanshangrenwu_jiequ.item.removeFromParent();
                        }
                        var itemClone = G.frame.xuanshangrenwu_jiequ.item = sender.clone();
                        itemClone.finds("gou").hide();
                        itemClone.setPosition(G.frame.xuanshangrenwu_jiequ.posSelect);
                        G.frame.xuanshangrenwu_jiequ.ui.addChild(itemClone);
                        G.frame.xuanshangrenwu_jiequ.playAniMove(itemClone);
                    }
                }
            });
            ui.show();
        },
        addGou: function(tid){
            var me = this;
            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.getChildren()[0].data == tid) {
                    child.getChildren()[0].getChildren()[0].setGou(true);
                    break;
                }
            }
        },
        removeGou: function (tid) {
            var me = this;

            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.getChildren()[0].data == tid) {
                    child.getChildren()[0].getChildren()[0].setGou(false);
                    break;
                }
            }
        },
        getChildByTid:function (tid) {
            var me = this;

            var cd = null;
            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.getChildren()[0].data == tid) {

                    cd = child;
                    break;
                }
            }

            return cd;
        }
    });
})();