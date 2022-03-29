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
                        5:1, //神圣
                        6:0, //暗影
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
            if (G.frame.jingjichang_gjfight.DATA.type == 'wztt_three') {
                cache = X.cacheByUid("wztt_three") || [];
            }
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
            },null,null,1, 5);
            table.setData(d);
            table.reloadDataWithScroll(true);
        },
        checkIsYj: function (data) {
            var arr = G.frame.jingjichang_gjfight.top.icoList;
            var _arr = [].concat(arr[6], arr[13], arr[20]);

            for (var index = 0; index < _arr.length; index ++) {
                var item = _arr[index];
                if (item.data == data) return true;
            }
            return false;
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
            ui.nodes.img_suo.setVisible(false);

            var imgGou = ui.nodes.img_gou;
            imgGou.setAnchorPoint(0.5,0.5);
            imgGou.setPosition(imgGou.width/2, imgGou.height/2);
            imgGou.setScale(.95);
            // 任务中
            var imgRwz = ui.nodes.img_rwz;

            imgGou.hide();
            imgRwz.hide();
            imgGou.loadTexture("img/public/img_gou.png", 1);
            if (X.inArray(me.selectedData,data)) {
                imgGou.show();
                imgGou.setBright(false);
                if (me.checkIsYj(data)) imgGou.loadTexture("img/public/img_yuan.png", 1);
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
                        var num = 0;
                        var arr = G.frame.jingjichang_gjfight.top.icoList;
                        for (var index = 0; index < arr.length; index ++) {
                            if ((index + 1) % 7 == 0) continue;
                            if (arr[index].data) num ++;
                        }
                        if (G.frame.jingjichang_gjfight.top.yj) {
                            if (arr[6].data && arr[13].data && arr[20].data) {
                                G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                                return;
                            }
                            if (!me.checkTheTeam(sender.data,true)){
                                return  G.tip_NB.show('传说种族同名英雄每队只可以上阵一个');
                            }
                        } else {
                            if (num >= 18) {
                                G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                                return;
                            }
                            if (!me.checkTheTeam(sender.data)){
                                return  G.tip_NB.show('传说种族同名英雄每队只可以上阵一个');
                            }
                        }
                        me.selectedData.push(sender.data);
                        G.frame.jingjichang_gjfight.top.addItem(sender.data);
                        if (me.checkIsYj(sender.data)) {
                            sender.nodes.img_gou.loadTexture("img/public/img_yuan.png", 1);
                        } else {
                            sender.nodes.img_gou.loadTexture("img/public/img_gou.png", 1);
                        }
                        sender.nodes.img_gou.show();
                    }
                }
            }, null, {"touchDelay": G.DATA.touchHeroHeadTimeInterval});

            ui.show();
        },
        //检测这个队伍是否有传说英雄
        checkTheTeam:function(tid,isyj){
          var me = this;
          var heroD = G.DATA.yingxiong.list[tid];
          var teamArr = G.frame.jingjichang_gjfight.top.getSelectedData();
          var teamid = 0;
          //判断是哪一队的英雄不满
            for (var i in teamArr){
                if (teamid*1>0)break;
                for (var k in teamArr[i]){
                    if (isyj){
                        if ( k==7 && !teamArr[i][k]){
                            teamid = i;
                        }
                    } else {
                        if (k!=7 && !teamArr[i][k]){
                            teamid = i;
                        }
                    }
                }
            }
            var theTeaminfo = teamArr[teamid];
            if (theTeaminfo){
                for (var i in theTeaminfo){
                    if (theTeaminfo[i]){
                        var hero = G.DATA.yingxiong.list[theTeaminfo[i]];
                        if (heroD.zhongzu == 7 && hero.zhongzu == 7 && heroD.pinglunid == hero.pinglunid){
                            return false;
                            break;
                        }
                    }
                }
            } else {
                return true;
            }
            return true;
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
