/**
 * Created by lsm on 2018/6/23
 */
(function () {
    //冠军试炼-选择
    G.class.jingjichang_gjxuanzhe = X.bView.extend({
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
                sort: function (a,b) {
                    var dataA = G.DATA.yingxiong.list[a];
                    var dataB = G.DATA.yingxiong.list[b];
                    var zz = {
                        5:0, //神圣
                        6:1, //暗影
                        4:2, //自然
                        3:4, //邪能
                        2:5, //奥术
                        1:6 //亡灵
                    };


                    if (dataA.star != dataB.star) {
                        return dataA.star > dataB.star ? -1 : 1;
                    } else if (dataA.lv != dataB.lv) {
                        return dataA.lv > dataB.lv ? -1 : 1;
                    } else if (dataA.zhongzu != dataB.zhongzu) {
                        return zz[dataA.zhongzu] < zz[dataB.zhongzu] ? -1 : 1;
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

            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.createMenu();
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var cache = G.frame.wangzherongyao.isShow ? X.cacheByUid("pvwz") : X.cacheByUid('fight_gjjjc');
            var cacheArr = [];
            if (cache) {
                for (var id in cache) {
                    var tid = cache[id];
                    if (G.DATA.yingxiong.list[tid]) {
                        cacheArr.push(tid);
                    }
                }
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
            for (var i = 0; i < 7; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.nodes.panel_zz.setScale(0.8);
                list_ico.show();

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3",false);
                            me.effect=true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json:"ani_guangbiaoqiehuan",
                                    addTo:sender,
                                    x:sender.width / 2,
                                    y:sender.height /2,
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

            d.sort(me.extConf[me._type].sort);

            var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1, 5);
            table.setData(d);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            var heroData = G.DATA.yingxiong.list[data];
            ui.setName(heroData.hid);

            var widget = G.class.shero(heroData);
            widget.setName('widget');
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

            ui.nodes.panel_ico.setTouchEnabled(false);
            ui.nodes.panel_ico.show();

            var imgGou = ui.nodes.img_gou;
            imgGou.setAnchorPoint(0.5,0.5);
            imgGou.setPosition(imgGou.width/2, imgGou.height/2);
            imgGou.setScale(.95);
            // 任务中
            var imgRwz = ui.nodes.img_rwz;

            imgGou.hide();
            imgRwz.hide();

            if (X.inArray(me.selectedData,data)) {
                imgGou.show();
                imgGou.setBright(false);
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if (X.inArray(me.selectedData, sender.data)) {
                        sender.nodes.img_gou.hide();
                        me.selectedData.splice(X.arrayFind(me.selectedData,sender.data),1);
                        G.frame.jingjichang_gjfight.top.removeItem(sender.data);
                    } else {
                        if (me.selectedData.length >= 18) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }
                        me.selectedData.push(sender.data);
                        sender.nodes.img_gou.show();
                        G.frame.jingjichang_gjfight.top.addItem(sender.data);
                    }
                }
            });

            ui.show();
        },
        removeGou: function (tid) {
            var me = this;

            var children = me.table.getAllChildren();
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                if (child.isVisible() && child.data == tid) {
                    child.nodes.img_gou.hide();
                    break;
                }
            }
        },
    });

})();
