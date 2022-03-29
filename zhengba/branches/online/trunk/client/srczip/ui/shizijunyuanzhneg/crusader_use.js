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
                                || (G.frame.shizijunyuanzheng.DATA.status[tid] && G.frame.shizijunyuanzheng.DATA.status[tid].nuqi < 100))
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