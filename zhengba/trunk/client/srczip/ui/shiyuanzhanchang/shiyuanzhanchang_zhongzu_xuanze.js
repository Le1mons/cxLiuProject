/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //噬渊战场-种族-选择
    G.class.shiyuanzhanchang_zhongzu_xuanze = X.bView.extend({
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
                        5:1, //神圣
                        6:0, //暗影
                        4:2, //自然
                        3:4, //邪能
                        2:5, //奥术
                        1:6, //亡灵
                        7:7
                    };


                    if (dataA.star != dataB.star) {
                        return dataA.star > dataB.star ? -1 : 1;
                    } else if (dataA.lv != dataB.lv) {
                        return dataA.lv > dataB.lv ? -1 : 1;
                    } else if (dataA.zhongzu != dataB.zhongzu) {
                        return zz[dataA.zhongzu] < zz[dataB.zhongzu] ? -1 : 1;
                    } else if (dataA.hid != dataB.hid) {
                        return dataA.hid < dataB.hid ? -1 : 1;
                    } else {
                        return dataA.zhanli > dataB.zhanli ? -1 : 1;
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
            me.selectedData1 = [];
            me.selectedData2 = [];
            me.selectedData3 = [];
            me.createMenu();
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            me.fightData =[];
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var cacheArr = [];
            //
            // for(var i = 0; i < me.fightData.length; i ++) {
            //     cacheArr.push(me.fightData[i].tid);
            // }
            //
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
            d.sort(me.extConf[me._type].sort);
            var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 5);
            table.setData(d);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            var curTeam = 1;
            if (G.frame.shiyuanzhanchang_xzyx.bottom && G.frame.shiyuanzhanchang_xzyx.bottom.curTeam) {
                 curTeam = G.frame.shiyuanzhanchang_xzyx.bottom.curTeam;
            }

            X.autoInitUI(ui);
            var heroData = G.DATA.yingxiong.list[data];
            ui.setName(data);

            var widget = G.class.shero(heroData);
            widget.setName('widget');
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            widget.setScale(0.9);

            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);
            ui.nodes.panel_ico.setTouchEnabled(false);
            ui.nodes.panel_ico.show();
            ui.nodes.panel_pd.hide();
            ui.nodes.panel_pd.setPosition(21.5,23.5);
            ui.szinfo = 0;
            for (var i=1;i<=3;i++){
                if (i!=curTeam){
                    if (X.inArray(me['selectedData'+i],data)){
                        //已在其他两队上阵
                        ui.szinfo = i;
                        widget.setSuo(true);
                        ui.nodes.panel_pd.show();
                        ui.nodes.panel_pd.setBackGroundImage('img/shiyuanzhanchang/img_pd'+i+'.png',1);
                    }
                }
            }
            if (X.inArray(me['selectedData'+curTeam],data)) {
                widget.setGou(true);
                ui.nodes.panel_pd.show();
                ui.nodes.panel_pd.setBackGroundImage('img/shiyuanzhanchang/img_pd'+curTeam+'.png',1);
            }
            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    var plidarr = [];
                    for (var k=0;k< me['selectedData'+curTeam].length;k++){
                        if (G.DATA.yingxiong.list[me['selectedData'+curTeam][k]] && G.DATA.yingxiong.list[me['selectedData'+curTeam][k]].zhongzu == 7){
                            plidarr.push(G.DATA.yingxiong.list[me['selectedData'+curTeam][k]].pinglunid);
                        }
                    }
                    if (X.inArray(plidarr,G.DATA.yingxiong.list[sender.data].pinglunid) && !X.inArray(me['selectedData'+curTeam], sender.data)){
                        return  G.tip_NB.show('传说种族同名英雄只可以上阵一个');
                    }
                    G.frame.shiyuanzhanchang_xzyx.posSelect = G.frame.shiyuanzhanchang_xzyx.ui.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition()));
                    if (X.inArray(me['selectedData'+curTeam], sender.data)) {
                        G.frame.shiyuanzhanchang_xzyx.posSelect.x += sender.width / 2;
                        sender.finds('widget').setGou(false);
                        sender.nodes.panel_pd.hide();
                        me['selectedData'+curTeam].splice(X.arrayFind(me['selectedData'+curTeam],sender.data),1);
                        G.frame.shiyuanzhanchang_xzyx.bottom.removeItem(sender.data);
                    } else {

                        if (me['selectedData'+curTeam].length >= 6) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }
                        if (sender.szinfo){
                            G.frame.alert.data({
                                sizeType:3,
                                cancelCall:null,
                                okCall: function () {
                                    me['selectedData'+curTeam].push(sender.data);
                                    me['selectedData'+sender.szinfo].splice(X.arrayFind(me['selectedData'+sender.szinfo],sender.data),1);
                                    sender.finds('widget').setGou(true);
                                    sender.finds('widget').setSuo(false);
                                    sender.nodes.panel_pd.hide();
                                    G.frame.shiyuanzhanchang_xzyx.bottom.addItem(sender.data);
                                },
                                autoClose:true,
                                richText:X.STR(L('syzc_1'),sender.szinfo)
                            }).show();
                            return;
                        }
                        me['selectedData'+curTeam].push(sender.data);
                        sender.finds('widget').setGou(true);
                        sender.nodes.panel_pd.show();
                        sender.nodes.panel_pd.setBackGroundImage('img/shiyuanzhanchang/img_pd'+curTeam+'.png',1);
                        G.frame.shiyuanzhanchang_xzyx.bottom.addItem(sender.data);

                        if (cc.isNode(G.frame.shiyuanzhanchang_xzyx.item)) {
                            G.frame.shiyuanzhanchang_xzyx.item.stopAllActions();
                            G.frame.shiyuanzhanchang_xzyx.item.removeFromParent();
                        }
                        var itemClone = G.frame.shiyuanzhanchang_xzyx.item = sender.clone();
                        itemClone.finds('gou').hide();
                        itemClone.setPosition(G.frame.shiyuanzhanchang_xzyx.posSelect);
                        G.frame.shiyuanzhanchang_xzyx.ui.addChild(itemClone);
                        G.frame.shiyuanzhanchang_xzyx.playAniMove(itemClone);
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
