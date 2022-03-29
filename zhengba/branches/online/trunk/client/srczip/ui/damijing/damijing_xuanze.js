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
                getSort: function (arr, str1, str2, str3, str4) {
                    var data = [];
                    var heroData = [];
                    var hidData = [];
                    var sortArr = [];
                    var zz = {
                        5:0, //神圣
                        6:1, //暗影
                        4:2, //自然
                        3:4, //邪能
                        2:5, //奥术
                        1:6 //亡灵
                    };
                    for(var i = 0; i < arr.length; i ++){
                        heroData.push(G.DATA.yingxiong.list[arr[i]]);
                        if(!heroData[i].tid) heroData[i].tid = arr[i];
                    }
                    for(var i = 0, j = heroData.length; i < j; i += 1){
                        var conf = heroData[i];
                        var q = conf[str1];
                        var w = conf[str2];
                        var e = zz[conf[str3]];
                        var r = conf[str4];
                        if(!sortArr[q]){
                            sortArr[q] = [];
                        }
                        if(!sortArr[q][w]){
                            sortArr[q][w] = [];
                        }
                        if(!sortArr[q][w][e]){
                            sortArr[q][w][e] = [];
                        }
                        if(!sortArr[q][w][e][r]){
                            sortArr[q][w][e][r] = [];
                        }
                        sortArr[q][w][e][r].push(heroData[i]);
                    }
                    var index = heroData.length - 1;
                    for(var i in sortArr){
                        for(var j in sortArr[i]){
                            for (var k in sortArr[i][j]){
                                for(var l in sortArr[i][j][k]){
                                    for(var m in sortArr[i][j][k][l]){
                                        data[index --] = sortArr[i][j][k][l][m];
                                    }
                                }
                            }
                        }
                    }
                    for(var i = 0; i < data.length; i ++){
                        hidData.push(data[i].tid);
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
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList();
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
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
            });

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
