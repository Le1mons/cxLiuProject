/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-材料列表
    var ID = 'ui_tip_xuanze';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        setContents:function() {
            var me = this;

            me.fmtItemList();
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_XUANZE'));

            me.nodes.mask.click(function(){
                var yongyou = me.sortData(me.filterData()).length;

                me.DATA.callback && me.DATA.callback(me.selectArr, yongyou);
                me.remove();
            });


            if(!me.isHave) {
                me._view.nodes.btn_xz.setTitleText(L("HQYX"));
            }

            me._view.nodes.btn_xz.setTouchEnabled(true);
            me._view.nodes.btn_xz.setSwallowTouches(true);
            me._view.nodes.btn_xz.click(function(){
                if(!me.isHave) {
                    me.setGo();
                }else {
                    var yongyou = me.sortData(me.filterData()).length;
                    if (me.selectArr.length < me.DATA.need.num) {
                        var callback = me.DATA.callback;
                        callback && callback(me.selectArr, yongyou);
                        me.remove();
                    } else {
                        var callback = me.DATA.callback;
                        callback && callback(me.selectArr, yongyou);
                        me.remove();
                    }
                }
            });
        },
        setGo: function() {
            var me = this;
            if(!me.go) {
                var up = cc.moveBy(0.1, 0, 50);
                var goUp = cc.spawn(up, cc.callFunc(()=>{
                    new X.bView("zhuangbei_tip2.json", function (view) {
                        me.go = view.nodes.panel_bg.clone();
                        me.go.setPosition(320, 350);
                        me.ui.addChild(me.go);
                        me.go.runAction(cc.moveBy(0.1, 0, -30));
                        me.setTo([15, 1, 9, 8, 5, 3]);
                    })
                }));
                me.ui.finds("panel_tip").runAction(goUp);
                me.nodes.txt_djgb.hide();
            }else {
                me.go.removeFromParent(true);
                delete me.go;
                var down = cc.moveBy(0.1, 0, -50);
                var goDown = cc.sequence(down, cc.callFunc(()=> {
                    me.nodes.txt_djgb.show();
                }));
                me.ui.finds("panel_tip").runAction(goDown);
            }
        },
        setTo: function(conf) {
            var me = this;
            var btnArr = [];
            for(var i = 0; i < conf.length; i ++){
                var btn = G.class.setTZ(conf[i]);
                btnArr.push(btn);
            }
            btnArr.sort(function (a, b) {
                return a.is > b.is ? -1 : 1;
            });
            X.autoInitUI(me.go);
            me.go.nodes.btn_hqtj.hide();
            X.center(btnArr, me.go.nodes.panel_ico, {
                scale: .9
            });
        },
        onOpen: function () {
            var me = this;

        },
        getIdxData: function(){
            var me = this;
            var data = me.data().IdxData;

            return data;
        },
        getSelectedData: function(){
            var me = this;
            var arr = [];
            var data = me.data().selectedData;

            for (var i in data){
                for(var j = 0; j < data[i].length; j ++){
                    arr.push(data[i][j]);
                }
            }

            return arr;
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            if (G.frame.yingxiong_xxxx.curXbId) {
                me.curXbId = G.frame.yingxiong_xxxx.curXbId;
                me.curId = G.DATA.yingxiong.list[me.curXbId].hid;
            }
            me.selectArr = [];
            me.conf = G.class.hero.getById(me.curId || me.DATA.hid);
            me.jjcLockData = G.frame.yingxiong.getLockHeros();
            me.idxData = me.getIdxData();
            me.selectedData = me.getSelectedData();
            for(var i in me.idxData) {
                me.selectArr.push(me.idxData[i]);
            }

            new X.bView('ui_tip_xuanze.json',function(view){
                me._view = view;

                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.jjcLockData = G.frame.yingxiong.getLockHeros();
                me.setContents();
                me.bindUI();
            });
        },
        onRemove: function () {
            var me = this;
        },
        fmtItemList: function () {
            var me = this;

            var panel = me._view;
            cc.enableScrollBar(me._view.nodes.scrollview);
            me._view.nodes.scrollview.removeAllChildren();

            var data = me.sortData(me.filterData());
            if (data.length < 1) {
                panel.finds('img_zwnr').show();
                me.isHave = false;
                return;
            } else {
                me.isHave = true;
                panel.finds('img_zwnr').hide();
            }

            var table = me.table = new X.TableView(me._view.nodes.scrollview, me._view.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 1);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            if (data == null) {
                ui.hide();
                return;
            }
            // ui.setName(pos[0]*1 + pos[1]);
            ui.setName(data);
            X.autoInitUI(ui);

            var heroData = G.DATA.yingxiong.list[data];
            var widget = G.class.shero(heroData);
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

                // img_suo$
                // img_gou$
            var imgSuo = ui.nodes.img_suo;
            // var imgGou = ui.nodes.img_gou;

            // imgGou.hide();
            imgSuo.hide();
            widget.setGou(false);
            if (X.inArray(me.jjcLockData,data) || G.DATA.yingxiong.list[data].islock) {
                imgSuo.show();
                widget.setEnabled(false);
            }

            if(X.inArray(me.selectArr, data)) {
                widget.setGou(true);
            }else {
                widget.setGou(false);
            }

            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //已在竞技场上阵，不可选择
                    if (X.inArray(me.jjcLockData,sender.data)) {
                        G.tip_NB.show(X.STR(L('YX_X_LOACKING'),L('jingjichang')));
                        return;
                    }

                    //已被锁定，不可选择
                    if (G.DATA.yingxiong.list[sender.data].islock) {
                        G.tip_NB.show(L('YX_LOCKING'));

                        return;
                    }


                    if (X.inArray(me.selectArr, sender.data)) {
                        widget.setGou(false);
                        me.selectArr.splice(X.arrayFind(me.selectArr,sender.data),1);
                    } else {
                        if (me.selectArr.length >= me.DATA.need.num) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }else{
                            me.selectArr.push(sender.data);
                            widget.setGou(true);
                        }
                    }
                }
            });
            ui.show();
        },
        filterData: function () {
            var me = this;

            var data = me.DATA;
            var need = data.need;

            var heroData = G.DATA.yingxiong.list;
            var keys = X.keysOfObject(heroData);

            //过滤掉自己本身
            if (me.curXbId) {
                keys.splice(X.arrayFind(keys,me.curXbId),1);
            }

            //需要过滤掉已经被选择的英雄
            // 需要过滤掉不等于该索引的已选择的tid
            for(var i = 0; i < me.selectedData.length; i ++){
                if(!X.inArray(me.idxData, me.selectedData[i])){
                    keys.splice(X.arrayFind(keys, me.selectedData[i]), 1);
                }
            }

            var canShowArr = [];
            //需要过滤不符合条件的英雄
            if (need.sxhero) {
                //指定的使用材料

                var needHid = me.conf.sxhid || me.conf.hid;
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    if (heroData[tid].hid == needHid) {
                        canShowArr.push(tid);
                    }
                }
            } else if (need.samezhongzu) {
                //相同种族的某一星级

                var needStar = need.star;
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    if (heroData[tid].zhongzu == me.conf.zhongzu && heroData[tid].star == needStar) {
                        canShowArr.push(tid);
                    }
                }
            } else if (need.t) {
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    if (heroData[tid].hid == need.t) {
                        canShowArr.push(tid);
                    }
                }
            }else if(need.star){
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    if (heroData[tid].star == need.star) {
                        canShowArr.push(tid);
                    }
                }
            }

            return canShowArr;
        },
        sortData: function (d) {
            var me = this;


            var jjcLockData = me.jjcLockData;
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

            canUseArr.sort(function (a,b) {
                var dA = heroData[a];
                var dB = heroData[b];

                if (dA.lv != dB.lv) {
                    return dA.lv < dB.lv ? -1 : 1;
                } else if (dA.hid != dB.hid) {
                    return dA.hid * 1 < dB.hid * 1 ? -1 : 1;
                }
            });

            lockArr.sort(function (a,b) {
                var dA = heroData[a];
                var dB = heroData[b];

                if (dA.lv != dB.lv) {
                    return dA.lv < dB.lv ? -1 : 1;
                } else if (dA.hid != dB.hid) {
                    return dA.hid * 1 < dB.hid * 1 ? -1 : 1;
                }
            });


            var list = [].concat(canUseArr,lockArr);

            return list;
        }
    });

    G.frame[ID] = new fun('ui_tip2.json', ID);
})();