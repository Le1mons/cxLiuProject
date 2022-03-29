(function () {
    //神宠水晶-选宠物
    var ID = 'scsj_xz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.index = me.data().index;//第几个槽位
            me.DATA = me.data().data;
            me.type = me.data().type;
            me.nodes.txt_title.setString(L("pettip9"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
                me.selectarr = [];
            });
        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            new X.bView('scsj_xzsc.json', function (view) {
                me.view1 = view;
                me.nodes.panel_nr1.addChild(view);

                new X.bView('scsj_xz.json', function (view) {
                    me.view2 = view;
                    me.nodes.panel_nr2.addChild(view);
                    me.setContents();
                    //选择
                    me.view2.nodes.btn_kz.click(function () {
                        if(me.selectarr.length != 0){
                            me.DATA.crystal.play[me.index] = me.addId;
                        }
                        me.ajax("pet_play", [me.DATA.crystal.play], function (str, data) {
                            if (data.s == 1) {
                                G.frame.scsj.panel.refreshPanel(me.addId);//刷新水晶界面
                                G.frame.scsj.DATA.crystal.play = me.DATA.crystal.play;
                                me.remove();
                            }
                        });

                        //标题
                        var txt = L("pettip6");
                        var rt = X.setRichText({
                            str: txt,
                            parent: me.view1.nodes.panel_txt,
                            color: G.gc.COLOR.n5,
                            size: 20,
                        });
                    })
                });

            });
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.getData(function () {
                me.showContent();
                me.setTable();
            });
        },
        setTable: function () {
            var me = this;
            var conf = G.gc.pet;
            var allPet = G.DATA.pet;
            var tidKeys = Object.keys(allPet);
            // me.haspet = Object.keys(me.DATA.crystal.play);//已上阵的宠物
            me.haspet = [];
            for(var n in me.DATA.crystal.play){
                me.haspet.push(me.DATA.crystal.play[n]);
            }
            if(!me.isFirst){
                for(var k in allPet){
                    if(X.inArray(me.haspet,k)){
                        allPet[k].order = 2;
                    }else {
                        allPet[k].order = 1;
                    }
                }
                me.isFirst = true;
            }
            tidKeys.sort(function (a, b) {
                var dataA = allPet[a];
                var dataB = allPet[b];
                var confA = conf[dataA.pid];
                var confB = conf[dataB.pid];

                if(dataA.order != dataB.order){
                    return dataA.order > dataB.order ? -1 : 1;
                }else if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else if (dataA.lv != dataB.lv) {
                    return dataA.lv > dataB.lv ? -1 : 1;
                } else {
                    return dataA.pid * 1 > dataB.pid * 1 ? -1 : 1;
                }
            });

            me.selectarr = [];
            cc.enableScrollBar(me.view1.nodes.scrollview);
            if (!me.table) {
                me.table = new X.TableView(me.view1.nodes.scrollview, me.view1.nodes.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 8, 5);
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(tidKeys);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.setName("list" + data);
            var petData = G.DATA.pet[data];
            var pet = G.class.pet(petData);
            pet.setPosition(ui.width / 2, ui.height / 2);
            //pet.setGou(me.selectId == data);
            ui.removeAllChildren();
            ui.addChild(pet);
            ui.pet = pet;
            ui.id = data;

            if (X.inArray(me.haspet, data)) {
                if (data == me.DATA.crystal.play[me.index]) {
                    pet.setGou(true);
                    me.showContent(data);
                    if(me.ifChange){
                        me.addId = data;
                    }
                } else {
                    pet.setGou(true, "bq_ysz", cc.p(33, 66));
                }
            } else {
                pet.setGou(false, "bq_ysz");
                pet.setGou(false);
            }

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    //判断是否有相同的pid
                    var d = me.getIsTouch(data);
                    me.ifChange = true;
                    if (!d) {

                    } else if (d == "xiexia") {
                        me.setTable();
                    } else if (d == "no") {
                        G.tip_NB.show(L("pettip11"));
                    } else {
                        me.setTable();
                    }
                }
            });
        },

        showContent:function (id){
            var me = this;
            if(!id) {
                me.view2.nodes.panel_nr.hide();
                me.view2.nodes.img_zwnr.show();
                return;
            }else {
                me.id = id;
                me.view2.nodes.img_zwnr.hide();
                me.view2.nodes.panel_nr.show();
                var conf = G.gc.pet;
                var petData = G.DATA.pet[id];
                var petId = petData.pid;
                var petLv = petData.lv;
                var lvConf = G.gc.petup[petId][petLv];
                var pet = G.class.pet(petData);
                pet.setPosition(me.view2.nodes.paneL_sc.width / 2, me.view2.nodes.paneL_sc.height / 2);
                me.view2.nodes.paneL_sc.removeAllChildren();
                me.view2.nodes.paneL_sc.addChild(pet);

                //名字
                me.view2.nodes.txt_yl.setString(conf[petId].name);
                //描述
                var str = X.STR(pet.conf.skilldesc, lvConf.value[0], lvConf.value[1], lvConf.value[2], lvConf.value[3]
                    ,lvConf.value[4] || "",lvConf.value[5] || "",lvConf.value[6] || "");
                var rh = X.setRichText({
                    str: str,
                    parent: me.view2.nodes.txt_fhsdj1,
                    color: G.gc.COLOR.n4,
                    size:20
                });
                rh.setPosition(0, me.view2.nodes.txt_fhsdj1.height - rh.trueHeight());
            }

        },
        getData:function (callback) {
            var me = this;
            me.ajax("pet_open", [0], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.DATA.crystal = me.DATA.crystal || {};
                    me.DATA.crystal.crystal = me.DATA.crystal.crystal || {};
                    me.DATA.crystal.lv = me.DATA.crystal.lv || 0;
                    me.DATA.crystal.crystal.lv = me.DATA.crystal.crystal.lv || 0;
                    me.DATA.crystal.play = me.DATA.crystal.play || {};
                    callback&&callback();
                }
            });
        },
        getIsTouch: function (tid) {
            var inFight = this.DATA.crystal.play;
            var arr = [];
            var pidArr = [];
            for (var pos in inFight) {
                if (pos != this.index) {
                    arr.push(inFight[pos]);
                }
                pidArr.push(G.DATA.pet[inFight[pos]].pid);
            }
            if (X.inArray(arr, tid)) return false;
            if (tid == this.DATA.crystal.play[this.index]) {
                this.DATA.crystal.play[this.index] = undefined;
                delete this.DATA.crystal.play[this.index];
                return "xiexia";
            }
            if (X.inArray(pidArr, G.DATA.pet[tid].pid)) return "no";
            return this.DATA.crystal.play[this.index] = tid;
        }
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();