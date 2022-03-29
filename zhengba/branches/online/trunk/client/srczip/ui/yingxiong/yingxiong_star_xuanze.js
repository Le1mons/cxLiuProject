/**
 * Created by wfq on 2018/6/2.
 */
(function () {
    //英雄-星级-选择
    G.class.yingxiong_star_xuanze = X.bView.extend({
        extConf:{
            fenjie:{
                data: function (star) {
                    var data = G.DATA.yingxiong.list;
                    var keys = X.keysOfObject(data);

                    var arr = [];
                    if (star == 0) {
                        for(var i = 0; i < keys.length; i ++){
                            arr.push(keys[i]);
                        }
                    } else {
                        for (var i = 0; i < keys.length; i++) {
                            var tid = keys[i];
                            var heroData = data[tid];
                            if (heroData.zhongzu == star) {
                                arr.push(tid);
                            }
                        }
                    }

                    return arr;
                },
                sort: function (a,b) {
//                  var dataA = X.clone(G.DATA.yingxiong.list[a]);
//                  var dataB = X.clone(G.DATA.yingxiong.list[b]);
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


                    //先排序，后分类
                    if (dataA.star != dataB.star) {
                        return dataA.star < dataB.star ? -1 : 1;
                    } else if (dataA.zhongzu != dataB.zhongzu) {
                        return zz[dataA.zhongzu] > zz[dataB.zhongzu] ? -1 : 1;
                    } else if (dataA.hid != dataB.hid) {
                        return dataA.hid < dataB.hid ? -1 : 1;
                    } else if (dataA.lv != dataB.lv) {
                        return dataA.lv < dataB.lv ? -1 : 1;
                    }
                }
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;

            me._super('jisifazhen_tip_fjyx.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
            me.initUI();
        },
        bindBTN: function () {
            var me = this;
            // me.nodes.btn_1.setTitleColor(cc.color(G.gc.COLOR.n13));
            //关闭
            me.ui.finds('$btn_fanhui').click(function(sender,type){
                G.frame.yingxiong_fenjie.remove();
            });

            me.nodes.btn_bz.show();
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS14")
                }).show();
            });
            //预览
            me.nodes.btn_tishi.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var sData = G.frame.yingxiong_fenjie.top.selectedData;

                    if(sData.length < 1){
                        G.tip_NB.show("请放入需要分解的英雄");
                        return;
                    }

                    function showJiangli(data) {
                        G.frame.jiangliyulan.data({
                            prize:[].concat(data || []),
                        }).show();
                    }

                    if (sData.length  < 1) {
                        showJiangli();
                        return;
                    }

                    G.ajax.send('hero_fenjieyulan',sData,function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            showJiangli(d.d.prize);
                        }
                    });

                }
            });
            //快速放入
            me.nodes.btn_1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var sData = me.selectedData;
                    if (sData.length >= 10) {
                        return;
                    }
                    me.kuaisu = true;

                    var list = me.curList;
                    var table = me.table;
                    var lockArr = me.lockArr;
                    if(!list) {
                        G.tip_NB.show(L("ZWKFJYX"));
                        return;
                    }
                    for (var i = 0; i < list.length; i++) {
                        var tid = list[i];
                        //选择过的继续
                        if (X.inArray(sData, tid)) {
                            continue;
                        }
                        if(G.DATA.yingxiong.list[tid].star < 5 && !X.inArray(lockArr,tid)){
                            var obj = table.cellByName(tid);
                            if (obj && cc.sys.isObjectValid(obj[0])) {
                                obj[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE)
                            } else {
                                // me.addItem(tid);
                                if(me.selectedData.length < 10){
                                    me.selectedData.push(tid);
                                }

                            }
                        }
                        if (me.selectedData.length >= 10) {
                            break;
                        }

                    }
                    if(me.selectedData.length < 1) {
                        G.tip_NB.show(L("ZWKFJSXYX"));
                    }
                }
            });
            //分解
            if(!me.nodes.btn_2.data) me.nodes.btn_2.data = [];
            me.nodes.btn_2.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    //空判断
                    var sData = me.selectedData;
                    if (sData.length < 1) {
                        G.tip_NB.show(L('YX_FENJIE_TIP_1'));
                        return;
                    }
                    //高级英雄判断
                    var highStar = 0;
                    for (var i = 0; i < sData.length; i++) {
                        var tid = sData[i];
                        var heroData = G.DATA.yingxiong.list[tid];
                        if (heroData.star > highStar) {
                            highStar = heroData.star;
                        }
                    }
                    if (highStar >= 4) {
                        var str = X.STR(L('YX_FENJIE_TIP_2'),highStar);
                        G.frame.alert.data({
                            sizeType:3,
                            cancelCall:null,
                            okCall: function () {
                                me._resolve(sData);
                            },
                            richText:str
                        }).show();
                    }else{
                        me._resolve(sData);
                    }
                    G.frame.yingxiong_fenjie.bottom.setyxsl();
                }
            });
        },
        _resolve:function (sData) {
            var me = this;
            G.ajax.send('hero_fenjie',sData,function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    X.audio.playEffect("sound/yingxiongfenjie.mp3");
                    me.nodes.btn_2.setTouchEnabled(false);
                    G.frame.yingxiong_fenjie.men.playWithCallback("wait", false, function () {
                        G.frame.yingxiong_fenjie.men.play("in", true);
                        G.frame.jiangli.data({
                            prize:[].concat(d.d.prize),
                            state: "fjlq"
                        }).show();
                        me.nodes.btn_2.setTouchEnabled(true);
                    });
                    // G.tip_NB.show(L('FENJIE') + L('SUCCESS'));

                    G.frame.yingxiong_fenjie.setContents();
                }else{
                    X.audio.playEffect("sound/dianji.mp3", false);
                }
            },true);
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
            me.createMenu();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.selectedData = [];
            var type = me.curType || 0;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        initUI:function(){
            var me = this;

        },
        createMenu: function () {
            var me = this;

            var view = me;
            me._menus = [];
            var listview = view.nodes.listview_zz;
            listview.removeAllChildren();
            view.nodes.list_ico.hide();

            for (var i = 0; i < 7; i++) {
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
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
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
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
                            //node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });

                me._menus.push(list_ico);
                list_ico.show();
            }
            X.center(me._menus, listview, {

            })
        },
        fmtItemList: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
			
            var d = me.extConf[me._type].data(me.curType);

            me.setEquipNum(d);
            if (d.length < 1) {
                cc.sys.isObjectValid(me.ui.finds('img_zwnr')) && me.ui.finds('img_zwnr').show();
                return;
            } else {
                cc.sys.isObjectValid(me.ui.finds('img_zwnr')) && me.ui.finds('img_zwnr').hide();
            }
			
            var jjcLockData = G.frame.yingxiong.getLockHeros();
            var heroData = G.DATA.yingxiong.list;

            //对材料分类，分类依据：加锁与未加锁
            var canUseArr = [],
                lockArr = [];
            for (var i = 0; i < d.length; i++) {
                var tid = d[i];
                var data = heroData[tid];
                if (X.inArray(jjcLockData,tid) || data.islock) {
                    lockArr.push(tid);
                } else {
                    canUseArr.push(tid);
                }
            }
			
			//cc.log('canUseArr',canUseArr,me.extConf[me._type].sort); 
			//cc.log('lockArr',lockArr); 
			
            canUseArr.sort(me.extConf[me._type].sort);

            lockArr.sort(me.extConf[me._type].sort);

            me.lockArr = lockArr;

            var list = me.curList = [].concat(canUseArr,lockArr);
			
            var table = me.table = new X.TableView(scrollview,me.nodes.list, 5,function (ui, data) {
                me.setItem(ui, data);
            },null,null,1,5);
            table.setData(list);
            table.reloadDataWithScroll(true);
            scrollview.getChildren()[0].getChildren()[0]._setAnchorX(-0.001);
        },
        setItem: function (ui, data) {
            var me = this;

            ui.setName(data);
            X.autoInitUI(ui);

            var heroData = G.DATA.yingxiong.list[data];
            // ui.setName(heroData.hid);

            if (cc.isNode(ui.nodes.panel_tx)) {
                var widget = G.class.shero(heroData);
                widget.setName('widget');
                widget.setAnchorPoint(0.5,1);
                widget.setPosition(cc.p( ui.nodes.panel_tx.width*0.5, ui.nodes.panel_tx.height ));
                widget.setScale(.9);
                ui.nodes.panel_tx.removeAllChildren();
                ui.nodes.panel_tx.addChild(widget);
            }

            // img_suo$
            // img_gou$
            var imgSuo = ui.nodes.img_suo;
            // var imgGou = ui.nodes.img_gou;
            //
            // imgGou.hide();
            imgSuo.hide();
            var a = G.DATA.yingxiong.list[data].islock;
            var b = X.inArray(me.lockArr,data);
            if (X.inArray(me.lockArr,data) || G.DATA.yingxiong.list[data].islock || heroData.star >= 8) {
                imgSuo.show();
                widget.setEnabled(false);
            }

            // if (X.inArray(me.selectedData,data)) {
            //     imgGou.show();
            // }
            if (X.inArray(me.selectedData,data)) {
                me.handleHeros(me.curId);
                widget.setGou(true);
                // widget.setHighLight(false);
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //已在竞技场上阵，不可选择
                    if (X.inArray(G.frame.yingxiong.getLockHeros(),sender.data)) {
                        G.tip_NB.show(X.STR(L('YX_X_LOACKING'),L('jingjichang')));
                        return;
                    }

                    if(heroData.star >= 8) {
                        G.tip_NB.show(L("XJWFFJ"));
                        return;
                    }

                    //已被锁定，不可选择
                    if (G.DATA.yingxiong.list[sender.data].islock) {
                        G.tip_NB.show(L('YX_LOCKING'));
                        return;
                    }

                    if (X.inArray(me.selectedData, sender.data)) {
                        sender.finds('widget').setGou(false);
                        me.selectedData.splice(X.arrayFind(me.selectedData,sender.data),1);
                        // G.frame.yingxiong_fenjie.bottom.removeItem(sender.data);
                    } else {
                        if (me.selectedData.length >= G.frame.yingxiong_fenjie.bottom.extConf.maxnum) {
                            if(me.kuaisu){
                                me.kuaisu = false;
                            }else{
                                G.tip_NB.show(L('YX_SX_XZ_FULL'));
                            }
                            return;
                        }
                        me.selectedData.push(sender.data);
                        sender.finds('widget').setGou(true);
                        // G.frame.yingxiong_fenjie.bottom.addItem(sender.data);
                    }
                    G.frame.yingxiong_fenjie.bottom.setyxsl();
                }
            });
            ui.show();
        },
        handleHeros: function (id) {
            var me = this;

            var parent = me.table._table.tableView.getChildren()[0];
            for (var i = 0; i < parent.getChildren().length; i++) {
                var children = parent.getChildren()[i];
                for (var j = 0; j < children.getChildren().length; j++) {
                    var child = children.getChildren()[j];
                    cc.isNode(child.finds('wid')) && child.finds('wid').setGou(child.data == id);
                }
            }
        },
        // removeGou: function (tid) {
        //     var me = this;
        //
        //     var children = me.table.getAllChildren();
        //     for (var i = 0; i < children.length; i++) {
        //         var child = children[i];
        //         if (child.isVisible() && child.data == tid) {
        //             child.nodes.img_gou.hide();
        //             break;
        //         }
        //     }
        // },
        //装备数量
        setEquipNum: function (d) {
            var me = this;

            var allNum = G.DATA.heroCell.maxnum;
            var keys = X.keysOfObject(d);

            me.nodes.txt_sl.setString(keys.length + '/' + allNum);
        }
    });

})();