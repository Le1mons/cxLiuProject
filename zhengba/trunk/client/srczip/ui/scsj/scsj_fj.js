/**
 * Created by LYF on 2019//.
 */
(function () {
    //
    var ID = 'scsj_fj';

    var fun = X.bUi.extend({
        maxNum: 10,
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.showSelectNum();
            me.nodes.txt_qx.setString(L("YJXZ"));
            me.nodes.txt_qd.setString(L("FJ"));
            cc.enableScrollBar(me.nodes.scrollview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_qx.click(function () {
                if (me.selectArr.length >= me.maxNum) return;
                for (var index = 0; index < me.DATA.length; index ++) {
                    var tid = me.DATA[index];
                    if (!X.inArray(me.selectArr, tid)) me.selectArr.push(tid);
                    if (me.selectArr.length >= me.maxNum) break;
                }
                me.setContents();
                me.showSelectNum();
            });

            me.nodes.btn.click(function () {
                if (me.selectArr.length < 1) return G.tip_NB.show(L("QXZYGCW"));
                G.frame.jiangliyulan.data({
                    prize: me.getPrize(),
                    title: L("FJYL"),
                    btnTxt: L("FJ"),
                    callback: function () {
                        me.cacheOldData(me.selectArr);
                        me.ajax("pet_breakdown", me.selectArr, function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).once("willClose", function () {
                                    me.selectArr = [];
                                    me.setContents();
                                    G.frame.scsj.sc.setTable();
                                }).show();
                            }
                        });
                    }
                }).show();
            });
        },
        cacheOldData: function (arr) {
          var me = this;
          G.DATA.oldPet = {};
          arr.forEach(function (item) {
            G.DATA.oldPet[item] = (JSON.parse(JSON.stringify(G.DATA.pet[item])));
          })
        },
        getPrize: function () {
            var me = this;
            var prize = [];

            for (var index = 0; index < me.selectArr.length; index ++) {
                var petData = G.DATA.pet[me.selectArr[index]];
                prize = prize.concat(G.gc.petup[petData.pid][petData.lv || 0].prize);
            }
            return X.combinationPrize(prize);
        },
        onOpen: function () {
            var me = this;
            me.selectArr = [];
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
        showSelectNum: function () {
            var me = this;

            me.nodes.txt_yl.setString(L("DQYXZ") + "：" + me.selectArr.length + "/" + me.maxNum);
        },
        setContents: function () {
            var me = this;
            var data = me.getData();
            var arr = [];
            for(var i = 0 ; i < data.length ; i++){
                if(!G.DATA.pet[data[i]].lock){
                    arr.push(data[i]);
                }
            }
            me.DATA = arr;
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8, 5);
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            ui.removeAllChildren();
            ui.setTouchEnabled(false);
            var petData = G.DATA.pet[data];
            var pet = G.class.pet(petData);
            pet.setPosition(ui.width / 2, ui.height / 2);
            ui.addChild(pet);
            pet.setGou(X.inArray(me.selectArr, data));
            pet.setTouchEnabled(true);
            pet.setSwallowTouches(false);
            pet.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (X.inArray(me.selectArr, data)) {
                        sender.setGou(false);
                        me.selectArr.splice(X.arrayFind(me.selectArr, data), 1);
                        me.showSelectNum();
                    } else {
                        if (me.selectArr.length >= me.maxNum) return G.tip_NB.show(X.STR(L("pet_select_max"), me.maxNum));
                        sender.setGou(true);
                        me.selectArr.push(data);
                        me.showSelectNum();
                    }
                }
            });
        },
        getData: function () {
            this.DATA = [];
            var petConf = G.gc.pet;
            var allPetData = G.DATA.pet;

            for (var tid in allPetData) {
                var data = allPetData[tid];
                if (petConf[data.pid].color < 4 && !X.inArray(G.frame.scsj.sc.inFightPet, tid)) this.DATA.push(tid);
            }

            this.DATA.sort(function (a, b) {
                var dataA = allPetData[a];
                var dataB = allPetData[b];
                var confA = petConf[dataA.pid];
                var confB = petConf[dataB.pid];

                if (confA.color != confB.color) {
                    return confA.color < confB.color ? -1 : 1;
                } else if (dataA.lv != dataB.lv) {
                    return dataA.lv < dataB.lv ? -1 : 1;
                } else {
                    return dataA.pid * 1 < dataB.pid * 1 ? -1 : 1;
                }
            });

            return this.DATA;
        }
    });

    G.frame[ID] = new fun('ui_top_hdqr.json', ID);
})();