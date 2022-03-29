(function () {

    var fun = {
        getAllHero: function () {
            var me = this;
            var _arr = [];
            var plidObj = {};
            var conf = G.gc.hero;

            me.plObj = {};
            cc.each(conf, function (hero, hid) {
                if (!plidObj[hero.pinglunid]) plidObj[hero.pinglunid] = [];
                var _hero = JSON.parse(JSON.stringify(hero));
                if (_hero.tenstarico) _hero.star = 10;
                plidObj[hero.pinglunid].push(_hero);
            });
            cc.each(plidObj, function (arr) {
                arr.sort(function (a, b) {
                    return a.star > b.star ? -1 : 1;
                });
                _arr.push(arr[0]);
                me.plObj[arr[0].pinglunid] = arr[0];
            });
            return _arr;
        },
        getHeroByRace: function (race) {
            var me = this;
            var arr = [];
            var allHero = this.allHero;

            if (race == 0) {
                arr = [].concat(allHero);
            } else {
                cc.each(allHero, function (hero) {
                    hero.zhongzu == race && arr.push(hero);
                });
            }
            return arr.sort(function (a, b) {
                var selectA = X.inArray(me.selectArr, a.pinglunid);
                var selectB = X.inArray(me.selectArr, b.pinglunid);
                if (selectA != selectB) {
                    return selectA > selectB ? -1 : 1;
                } else if (a.star != b.star) {
                    return a.star > b.star ? -1 : 1;
                } else if (a.zhongzu != b.zhongzu) {
                    return a.zhongzu < b.zhongzu ? -1 : 1;
                } else {
                    return  a.hid * 1 > b.hid * 1;
                }
            });
        },
        act_hx: function () {
            var me = this;

            me.nodes.panel_tz1.show();
            me.nodes.panel_tz2.show();
            me.nodes.panel_tz3.show();
            me.nodes.panel_zhuangtai1.show();
            me.nodes.txt_ywc.setVisible(me.DATA.myinfo.haixuan.length > 0);
            me.nodes.btn_1.setVisible(me.DATA.myinfo.haixuan.length == 0 && G.time < X.getTodayZeroTime() + 22* 3600);

            me.selectArr = me.selectArr || [].concat(me.DATA.myinfo.haixuan);
            if (me.nodes.panel_tz1.children.length < 1) {
                for (var index = 0; index < me.hxLen; index ++) {
                    var parent = me.nodes['panel_tz' + (index + 1)];
                    var list = me.nodes.list_tz.clone();
                    list.setPosition(parent.width / 2, parent.height / 2);
                    parent.addChild(list);
                    X.autoInitUI(list);

                    var act1 = cc.fadeIn(1.5);
                    var act2 = cc.fadeOut(1.5);
                    var action = cc.sequence(act1, act2);
                    list.nodes.panel_jh.runAction(cc.repeatForever(action));
                    list.show();
                }
            }

            for (var index = 0; index < me.hxLen; index ++) {
                var parent = me.nodes['panel_tz' + (index + 1)];
                X.render({
                    rw: function (node) {
                        if (me.selectArr[index]) {
                            X.setHeroModel({
                                parent: node,
                                data: me.plObj[me.selectArr[index]],
                                scaleNum: .75
                            });
                        } else {
                            node.removeAllChildren();
                        }
                    },
                    panel_jh: function (node) {
                        node.setVisible(me.selectArr[index] == undefined);
                    }
                }, parent.children[0].nodes);
            }

            if (me.nodes.listview_zz.children.length < 1) {
                me.createRaceMenu();
            } else {
                me.setHxTable();
            }
        },
        setHxTable: function (isTop) {
            var me = this;
            var data = me.getHeroByRace(me.race);

            if (!me.hxTable) {
                me.nodes.scrollview.removeAllChildren();
                me.hxTable = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                    me.setHxItem(ui, data);
                }, null, null, 5, 3);
                me.hxTable.setData(data);
                me.hxTable.reloadDataWithScroll(true);
            } else {
                me.hxTable.setData(data);
                me.hxTable.reloadDataWithScroll(isTop || false);
            }
            me.showHxTip();
        },
        setHxItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                panel_ico: function (node) {
                    node.setTouchEnabled(false);
                    var hero = G.class.shero(data);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(hero);
                },
                img_gou: function (node) {
                    node.setVisible(X.inArray(me.selectArr, data.pinglunid));
                }
            }, ui.nodes);

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.noMove(function () {
                if (me.DATA.myinfo.haixuan.length > 0) return null;
                if (X.inArray(me.selectArr, data.pinglunid)) {
                    me.selectArr.splice(X.arrayFind(me.selectArr, data.pinglunid), 1);
                } else {
                    if (me.selectArr.length >= me.hxLen) return G.tip_NB.show(L('YYMAX'));
                    me.selectArr.push(data.pinglunid);
                }
                me.act_hx();
            });
        },
        createRaceMenu: function () {
            var me = this;

            for(var i=0;i<7;i++){
                var list_ico = me.nodes.zz_list.clone();
                X.autoInitUI(list_ico);
                list_ico.data = i;
                list_ico.nodes.panel_pj.setTouchEnabled(false);
                list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setTouchEnabled(true);
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.click(function(sender, type){
                    me.race = sender.data;
                    if (cc.isNode(me.lastNode)) me.lastNode.children[1].hide();
                    me.lastNode = sender;
                    sender.children[1].show();
                    me.setHxTable(true);
                });
                me.nodes.listview_zz.pushBackCustomItem(list_ico);
            }
            me.nodes.listview_zz.children[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        showHxTip: function () {
            this.nodes.txt_xz.setString(X.STR(L('XNHD_hxtip'), this.selectArr.length, this.hxLen));
        },
        
        act_gxgs: function (title) {
            var me = this;

            me.ajax('herohot_promoted', [], function (str, data) {
                if (data.s == 1) {
                    G.frame.xnhd_jg.data({
                        data: data.d.kuaizhao,
                        title: title
                    }).show();
                }
            });
        },

        act_32jin16: function () {
            var me = this;

            if (G.time < X.getTodayZeroTime() + 22 * 3600) {
                me.nodes.btn_1.show();
                me.nodes.btn_1.setTitleText(me.DATA.myinfo.selecthid ? L("TOUPIAO") : L("QDYY"));
                me.nodes.txt_ps.show();
            }
            me.nodes.panel_zhuangtai2.show();
            me.nodes.panel_tz2.show();
            if (me.nodes.panel_tz2.children.length < 1) {
                var parent = me.nodes.panel_tz2;
                var list = me.nodes.list_tz.clone();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                X.autoInitUI(list);
                var act1 = cc.fadeIn(1.5);
                var act2 = cc.fadeOut(1.5);
                var action = cc.sequence(act1, act2);
                list.nodes.panel_jh.runAction(cc.repeatForever(action));
                list.show();
            }
            me.selecthid = me.selecthid || me.DATA.myinfo.selecthid;
            X.render({
                rw: function (node) {
                    if (me.plObj[me.selecthid]) {
                        X.setHeroModel({
                            parent: node,
                            data: me.plObj[me.selecthid],
                            scaleNum: .75
                        });
                    }
                },
                panel_jh: function (node) {
                    node.setVisible(me.plObj[me.selecthid] == undefined);
                }
            }, me.nodes.panel_tz2.children[0].nodes);

            me.set32Table();
        },
        set32Table: function (isTop) {
            var me = this;

            if (me.DATA.myinfo.selecthid) {
                var need = G.gc.xnhd.toupiaoneed[0];
                me.nodes.txt_ps.setString(X.STR(L("XGX"), X.fmtValue(G.class.getOwnNum(need.t, need.a))) + L("PIAO"));
            } else {
                me.nodes.txt_ps.setString(L("XZYY"));
            }
            me.nodes.txt_xz2.setString(G.time >= X.getTodayZeroTime() + 12 * 3600 ? '12:00' + L("SBRQ") :
                (me.DATA.day == 3 ? X.STR(L("XQRQ"), 16) : L("HXRQ")));

            var data = me.DATA.kuaizhao;
            if (!me._32Table) {
                me.nodes.scrollview2.removeAllChildren();
                me._32Table = new X.TableView(me.nodes.scrollview2, me.nodes.list, 5, function (ui, data, pos) {
                    me.set32Item(ui, data, pos[0], pos[1]);
                }, null, null, 28, 3);
                me._32Table.setData(data);
                me._32Table.reloadDataWithScroll(true);
            } else {
                me._32Table.setData(data);
                me._32Table.reloadDataWithScroll(isTop || false);
            }
        },
        set32Item: function (ui, data, l, r) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                panel_ico: function (node) {
                    node.setTouchEnabled(false);
                    var hero = G.class.shero(me.plObj[data.plid]);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(hero);
                },
                img_gou: function (node) {
                    node.setVisible(me.selecthid == data.plid);
                },
                txt_mc: function (node) {
                    node.show();
                    node.setString(X.STR(L('DJ'), l * 5 + r + 1))
                }
            }, ui.nodes);

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.noMove(function () {
                if (me.DATA.myinfo.selecthid != '') return null;
                me.selecthid = data.plid;
                me.act_32jin16();
            });
        },

        act_8jin4: function () {
            var me = this;

            if (me.DATA.day == 4 || me.DATA.day == 6 || G.time < X.getTodayZeroTime() + 22 * 3600) {
                me.nodes.btn_1.show();
                me.nodes.btn_1.setTitleText(me.DATA.myinfo.selecthid ? L("TOUPIAO") : L("QDYY"));
                me.nodes.txt_ps.show();
            }
            me.nodes.panel_zhuangtai2.show();
            me.nodes.panel_tz2.show();
            if (me.nodes.panel_tz2.children.length < 1) {
                var parent = me.nodes.panel_tz2;
                var list = me.nodes.list_tz.clone();
                list.setPosition(parent.width / 2, parent.height / 2);
                parent.addChild(list);
                X.autoInitUI(list);
                var act1 = cc.fadeIn(1.5);
                var act2 = cc.fadeOut(1.5);
                var action = cc.sequence(act1, act2);
                list.nodes.panel_jh.runAction(cc.repeatForever(action));
                list.show();
            }
            me.selecthid = me.selecthid || me.DATA.myinfo.selecthid;
            X.render({
                rw: function (node) {
                    if (me.plObj[me.selecthid]) {
                        X.setHeroModel({
                            parent: node,
                            data: me.plObj[me.selecthid]
                        });
                    }
                },
                panel_jh: function (node) {
                    node.setVisible(me.plObj[me.selecthid] == undefined);
                }
            }, me.nodes.panel_tz2.children[0].nodes);

            me.set8Table();
        },
        set8Table: function (isTop) {
            var me = this;

            if (me.DATA.myinfo.selecthid) {
                var need = G.gc.xnhd.toupiaoneed[0];
                me.nodes.txt_ps.setString(X.STR(L("XGX"), X.fmtValue(G.class.getOwnNum(need.t, need.a))) + L("PIAO"));
            } else {
                me.nodes.txt_ps.setString(L("XZYY"));
            }
            if (me.DATA.day == 4 || me.DATA.day == 6) {
                if (G.time < X.getTodayZeroTime() + 12 * 3600) me.nodes.txt_xz2.setString(X.STR(L("XQRQ"), me.DATA.day == 4 ? 8 : 4));
                else if (G.time < X.getTodayZeroTime() + 22 * 3600 + 1800) me.nodes.txt_xz2.setString('12:00' + L("SBRQ"));
                else me.nodes.txt_xz2.setString('22:30' + L("SBRQ"));
            } else {
                if (G.time < X.getTodayZeroTime() + 12 * 3600) me.nodes.txt_xz2.setString(X.STR(L("XQRQ"), me.DATA.day == 4 ? 8 : 4));
                else me.nodes.txt_xz2.setString('12:00' + L("SBRQ"));
            }

            var data = me.DATA.kuaizhao;
            me._8MaxNum = data[0].num;
            if (!me._8Table) {
                me.nodes.scrollview2.removeAllChildren();
                me._8Table = new X.TableView(me.nodes.scrollview2, me.nodes.list_lb, 1, function (ui, data, pos) {
                    me.set8Item(ui, data, pos[0]);
                }, null, null);
                me._8Table.setData(data);
                me._8Table.reloadDataWithScroll(true);
            } else {
                me._8Table.setData(data);
                me._8Table.reloadDataWithScroll(isTop || false);
            }
        },
        set8Item: function (ui, data, pos) {
            var me = this;
            var conf = G.frame.xnhd.plObj[data.plid];

            X.autoInitUI(ui);
            X.render({
                sz_phb: pos + 1,
                text_ps: data.num + L("PIAO"),
                img_jdt: (data.num / me._8MaxNum * 100) || 0,
                text_mz: conf.name,
                panel_tx: function (node) {
                    var hero = G.class.shero(conf);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(hero);
                },
                panel_pm: function (node) {
                    node.setVisible(pos < 3);
                    pos < 3 && node.setBackGroundImage('img/public/img_paihangbang_' + (pos + 1) + '.png', 1);
                    ui.nodes.sz_phb.setVisible(pos > 2);
                },
                panel_xz: function (node) {
                    node.setVisible(me.selecthid == data.plid);
                }
            }, ui.nodes);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.noMove(function () {
                if (me.DATA.myinfo.selecthid != '') return null;
                me.selecthid = data.plid;
                me.act_8jin4();
            });
        },

        act_jsgs: function () {
            var me = this;
            var data = me.DATA.kuaizhao;

            me.nodes.panel_zhuangtai3.show();
            for (var index = 0; index < 4; index ++) {
                var obj = {};
                var _data = data[index];
                obj['rw' + (index + 1)] = function (node) {
                    X.setHeroModel({
                        parent: node,
                        data: me.plObj[_data.plid]
                    });
                };
                obj['img_blzc' + (index + 1)] = function (node) {
                    node.setVisible(me.DATA.myinfo.selecthid == _data.plid);
                };
                obj['txt_mz' + (index + 1)] = me.plObj[_data.plid].name;
                obj['txt_ps' + (index + 1)] = L("ZZPS") + ':' + _data.num;
                obj['txt_rs' + (index + 1)] =  L("TPRS") + ':' + (_data.selectnum || 0);
                X.render(obj, me.nodes.panel_zhuangtai3.nodes);
            }
        }
    };
    cc.mixin(G.frame.xnhd, fun, true);
})();