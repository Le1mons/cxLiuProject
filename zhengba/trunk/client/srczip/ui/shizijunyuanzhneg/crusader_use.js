/**
 * Created by LYF on 2018/11/21.
 */
(function () {
    //远征-选择
    var ID = 'shizijun_use';

    var fun = X.bUi.extend({
        extConf:{
            data: function (id) {
                var data = G.DATA.yingxiong.list;
                var keys = X.keysOfObject(data);
                var arr = [];
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    var heroData = data[tid];
                    if (heroData.lv > 39) {
                        if(id == 1) {
                            if(G.frame.shizijunyuanzheng.DATA.status[tid]
                                && G.frame.shizijunyuanzheng.DATA.status[tid].hp < G.frame.shizijunyuanzheng.DATA.status[tid].maxhp
                                && G.frame.shizijunyuanzheng.DATA.status[tid].hp >= 1)
                            {
                                arr.push(tid);
                            }
                        } else if(id == 2) {
                            if(!G.frame.shizijunyuanzheng.DATA.status[tid]
                                || (G.frame.shizijunyuanzheng.DATA.status[tid]
                                    && G.frame.shizijunyuanzheng.DATA.status[tid].nuqi < 100
                                    && G.frame.shizijunyuanzheng.DATA.status[tid].hp >= 1))
                            {
                                arr.push(tid);
                            }
                        } else {
                            if(G.frame.shizijunyuanzheng.DATA.status[tid] && G.frame.shizijunyuanzheng.DATA.status[tid].hp <= 0)
                            {
                                arr.push(tid);
                            }
                        }
                    }
                }
                return arr;
            },
            getSort: function (arr, str1, str2, str3, str4) {
                var heroData = [];
                var hidData = [];
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
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.finds("Text_1").setString(G.class.shizijunyuanzheng.getSupply()[me.id].desc);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_shiyong.click(function () {
                if(!me.curId) {
                    G.tip_NB.show(L("QXZSYYX"));
                    return;
                }
                if(!G.frame.shizijunyuanzheng.DATA.supply || !G.frame.shizijunyuanzheng.DATA.supply[me.id]) {
                    G.frame.shizijun_buy.data({id: me.id, tid: me.curId}).show();
                    return;
                }
                me.ajax("shizijun_useitem", [me.id, me.curId], function (str, data) {
                    if(data.s == 1) {
                        var conf = G.class.shizijunyuanzheng.getSupply();
                        G.event.emit('sdkevent',{
                            event:'szj_useItem',
                            data:{
                                consume:[{a:conf[me.id].name,t:conf[me.id].name,n:1}],
                            }
                        });
                        for (var i in data.d) {
                            G.frame.shizijunyuanzheng.DATA[i] = data.d[i];
                        }
                        me.curId = undefined;
                        G.tip_NB.show(L("SYCG"));
                        me.setHeroList();
                        G.frame.shizijunyuanzheng.setSupply();
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.id = me.data();
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setHeroList();
        },
        setHeroList: function () {
            var me = this;
            var data = me.extConf.getSort(me.extConf.data(me.id), "star", "lv", "zhongzu", "hid");

            if(data.length < 1) {
                me.nodes.zwnr.show();
            } else {
                me.nodes.zwnr.hide();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(me.ui.finds("scrollview"), me.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 25);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var heroData = G.DATA.yingxiong.list[data];
            var wid = G.class.shero(heroData);
            var state = G.frame.shizijunyuanzheng.DATA.status;
            wid.setScale(.8);
            wid.setAnchorPoint(0.5, 0.5);
            wid.setPosition(ui.width / 2, ui.height / 2);

            if(state[data] && state[data].hp <= 0) {
                wid.setEnabled(false);
                wid.setHP(0, false);
                wid.setNQ(0, false);
            }else if(state[data]){
                wid.setEnabled(true);
                wid.setNQ(state[data].nuqi, true);
                wid.setHP(state[data].hp / state[data].maxhp * 100, true);
            } else {
                wid.setEnabled(true);
                wid.setNQ(50, true);
                wid.setHP(100, true);
            }

            ui.removeAllChildren();
            ui.addChild(wid);
            ui.data = data;
            ui.setSwallowTouches(false);

            if(me.curId && me.curId == ui.data) {
                ui.children[0].setGou(true);
            } else {
                ui.children[0].setGou(false);
            }

            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    sender.children[0].setGou(true);
                    me.curId = sender.data;
                    me.checkGou();
                }
            });
        },
        checkGou: function () {
            var me = this;
            var children = me.table.getAllChildren();

            for (var i in children) {
                if(children[i].data != me.curId) {
                    children[i].children[0].setGou(false);
                }
            }
        }
    });
    G.frame[ID] = new fun('yuanzheng_xuanze.json', ID);
})();