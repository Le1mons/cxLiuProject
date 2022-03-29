/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-材料列表
    var ID = 'yingxiong_zhxz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        setContents:function() {
            var me = this;

            me.fmtItemList();
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.txt_title, L('UI_TITLE_XUANZE'));

            me.nodes.mask.click(function(){
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
                    me.remove();
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
        onShow: function () {
            var me = this;


            me.star = me.data().star;
            me.zhongzu = me.data().zhongzu;
            me.callback = me.data().callback;
            me.selected = me.data().selectedData;

            if(me.selected.length > 0) {
                me.curHid = G.DATA.yingxiong.list[me.selected[0]].hid;
            }

            new X.bView('ui_tip_xuanze.json',function(view){
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                me.bindUI();
            });
        },
        onHide: function () {
            var me = this;

            me.callback && me.callback(me.selected);
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
            X.autoInitUI(ui);

            var heroData = G.DATA.yingxiong.list[data];
            var widget = G.class.shero(heroData);
            widget.setScale(0.95);
            widget.setAnchorPoint(0.5,1);
            widget.setPosition(cc.p( ui.nodes.panel_ico.width*0.5, ui.nodes.panel_ico.height ));
            ui.nodes.panel_ico.removeAllChildren();
            ui.nodes.panel_ico.addChild(widget);

            var imgSuo = ui.nodes.img_suo;
            imgSuo.hide();
            widget.setGou(false);
            if (X.inArray(G.DATA.yingxiong.jjchero,data) || G.DATA.yingxiong.list[data].islock) {
                imgSuo.show();
                widget.setEnabled(false);
            }

            if(X.inArray(me.selected, data)) {
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

                    if (X.inArray(G.DATA.yingxiong.jjchero,sender.data)) {
                        G.tip_NB.show(X.STR(L('YX_X_LOACKING'),L('jingjichang')));
                        return;
                    }

                    //已被锁定，不可选择
                    if (G.DATA.yingxiong.list[sender.data].islock) {
                        G.tip_NB.show(L('YX_LOCKING'));

                        return;
                    }

                    if(!me.curHid) {
                        me.curHid = G.DATA.yingxiong.list[sender.data].hid;
                    } else {
                        if(G.DATA.yingxiong.list[sender.data].hid != me.curHid) {
                            G.tip_NB.show(L("XZXTWXYX"));
                            return;
                        }
                    }


                    if (X.inArray(me.selected, sender.data)) {
                        widget.setGou(false);
                        me.selected.splice(X.arrayFind(me.selected,sender.data),1);
                        if(me.selected.length < 1) me.curHid = undefined;
                    } else {
                        if (me.selected.length >= me.data().num) {
                            G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));
                            return;
                        }else{
                            me.selected.push(sender.data);
                            widget.setGou(true);
                        }
                    }
                }
            });
            ui.show();
        },
        filterData: function () {
            var me = this;
            var arr = [];
            var heroData = G.DATA.yingxiong.list;

            for (var i in heroData) {
                if(heroData[i].zhongzu == me.zhongzu && heroData[i].star == me.star && heroData[i].hid != me.data().hid) {
                    var hid = heroData[i].hid;
                    var str = "";
                    str += hid.substring(0, hid.length - 1);
                    str += "6";
                    if(G.class.hero.getById(str) && G.class.hero.getById(str).tenstarmodel) {
                        arr.push(i);
                    }
                }
            }

            return arr;
        },
        sortData: function (d) {
            var me = this;


            var jjcLockData = G.DATA.yingxiong.jjchero;
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