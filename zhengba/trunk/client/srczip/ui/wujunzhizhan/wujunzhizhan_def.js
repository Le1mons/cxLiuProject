/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wujunzhizhan_def';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);


           
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_kz.click(function () {
                if (me.getMeetDefNum() < 1) return G.tip_NB.show(L("WJZZ_APPLYNEED"));
                var defArr = [];
                for (var index = 0; index < me.defCache.length; index ++) {
                    var obj = JSON.parse(JSON.stringify(me.defCache[index]));
                    for(var k in obj){
                        if(k == 'lack'){
                            delete obj['lack'];
                        }
                    }
                    if(Object.keys(obj).length > 0){
                        if (Object.keys(obj).length == 1 && obj.sqid != undefined) {

                        } else {
                            defArr.push(obj);
                        }
                    }
                }
                // for(var i = 0; i < defArr.length; i++){
                //     if(X.keysOfObject(defArr[i]).length < 6) return G.tip_NB.show(L('WJZZ_SZNEED'));
                // }
                if (me.data() && me.data().apply) {
                    me.ajax("wjzz_signup", defArr, function (str, data) {
                        if (data.s == 1) {
                            G.tip_NB.show(L("APPLY_OK"));
                            G.frame.wujunzhizhan.getData(function () {
                                G.frame.wujunzhizhan_apply.setContents();
                            });
                            X.cacheByUid("wjzz_defhero", me.defCache);
                            me.remove();
                            G.hongdian.getData("wjzz", 1, function () {
                                G.frame.jingjichang.checkRedPoint();
                            });
                            G.event.emit("sdkevent", {
                                event: "GVG_signup"
                            });
                        }
                    });
                } else {
                    me.ajax("wjzz_defend", [defArr], function (str, data) {
                        if (data.s == 1) {
                            G.tip_NB.show(L("DEF_OK"));
                            X.cacheByUid("wjzz_defhero", me.defCache);
                            me.remove();
                            G.event.emit("sdkevent", {
                                event: "GVG_save"
                            });
                        }
                    }, null, {
                        dataArr: defArr,
                        index: 0
                    });
                }
            });

            me.nodes.btn_cx.click(function () {
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function() {
                        me.defCache = [
                            {},
                            {},
                            {},
                            {},
                            {}
                        ];
                        me.setTable();
                    },
                    title: L("YJCX"),
                    richText: L("WJZZ_CXDEF"),
                    sizeType: 3
                }).show();
            });

            me.nodes.btn_bd.click(function () {
                G.frame.yingxiong_fight.data({
                    pvType:'wjzz_def',
                    title: L("FSZR"),
                    def: {},
                    save: true,
                    index: me.defCache.length,
                    allDef: me.defCache,
                    callback: function (def, selectArr) {
                        if (selectArr.length < 6) return G.tip_NB.show(L("WJZZ_SZNEED"));
                        me.defCache[me.defCache.length] = def;
                        G.frame.yingxiong_fight.remove();
                        me.setTable();
                    }
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        getDefCache: function () {
            var tanxianCache = X.cacheByUid("fight_tanxian") || {};
            return X.cacheByUid("wjzz_defhero") || [
                {sqid: tanxianCache.sqid || ""},
                {sqid: tanxianCache.sqid || ""},
                {sqid: tanxianCache.sqid || ""},
                {sqid: tanxianCache.sqid || ""},
                {sqid: tanxianCache.sqid || ""}
            ];
        },
        onShow: function () {
            var me = this;
            me.defCache = me.getDefCache();
            me.checkDefCache(me.defCache);
            me.setTable();
        },
        checkDefCache: function (arr) {
            for (var index = 0; index < arr.length; index ++) {
                var obj = arr[index];
                var keys = Object.keys(obj);
                for (var _idx = 0; _idx < keys.length; _idx ++) {
                    var pos = keys[_idx];
                    if (pos != 'sqid') {
                        var tid = obj[pos];
                        if (!G.DATA.yingxiong.list[tid] || G.DATA.yingxiong.list[tid].star < 8) {
                            if (!obj.lack) obj.lack = [];
                            obj.lack.push(pos);
                            obj[pos] = undefined;
                            delete obj[pos];
                        }
                    }
                }
            }
        },
        getMeetDefNum: function (cache) {
            var count = 0;
            var defData = cache || this.defCache;
            for (var index = 0; index < defData.length; index ++) {
                var def = defData[index];
                if (Object.keys(def).length >= 6) count ++;
            }
            return count;
        },
        setTable: function () {
            var me = this;
            var defData = me.defCache;

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                });
                me.table.setData(defData);
                me.table.reloadDataWithScroll(true);
            } else {
                me.noShowLackAni = true;
                me.table.setData(defData);
                me.table.reloadDataWithScroll(false);
            }
            var defMeetNum = me.getMeetDefNum();
            me.nodes.btn_bd.setVisible(defMeetNum >= 5);
            me.nodes.btn_cx.setVisible(defMeetNum >= 1);
            me.table._table.tableView.setTouchEnabled(defMeetNum > 5);
        },
        setItem: function (ui, data, index) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                btn_mj: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.yingxiong_fight.data({
                                pvType:'wjzz_def',
                                title: L("FSZR"),
                                def: data,
                                save: true,
                                index: index,
                                allDef: me.defCache,
                                callback: function (def, selectArr) {
                                    if (selectArr.length < 6) return G.tip_NB.show(L("WJZZ_SZNEED"));
                                    me.defCache[index] = def;
                                    G.frame.yingxiong_fight.remove();
                                    me.setTable();
                                }
                            }).show();
                        }
                    });
                },
                txt_dws: function (node) {
                    node.setString(index + 1 + L("DUI"));
                    X.enableOutline(node, "#ac3337", 2);
                },
                txt_bjm: function (node) {
                    node.setTextColor(cc.color("#2f5719"));
                }
            }, ui.nodes);

            var layArr = [ui.finds("panel_qp"), ui.finds("panel_hp")];
            var lay, herInterval;
            for (var i = 0; i < layArr.length; i++) {
                lay = layArr[i];
                lay.removeAllChildren();
            }
            var list = me.nodes.list_yx;
            var scale = 0.7;
            var width = scale * list.width;
            var num = 0;
            for (var i = 0; i < 6; i++) {
                (function (i) {
                    var item = list.clone();
                    X.autoInitUI(item);

                    if (i < 2) {
                        lay = layArr[0];
                        herInterval = (lay.width - (2 * width));
                    } else {
                        lay = layArr[1];
                        herInterval = (lay.width - (4 * width)) / 3;
                    }

                    if (i == 2) {
                        num = 0;
                    }

                    item.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));
                    num++;
                    lay.addChild(item);
                    item.show();
                    item.nodes.img_renwu.loadTexture("img/wujunzhizhan/img_zdtx" + (i + 1) + ".png", 1);
                    if (data[i + 1]) {
                        var hero = G.class.shero(G.DATA.yingxiong.list[data[i + 1]]);
                        hero.setPosition(item.nodes.panel_yx.width / 2, item.nodes.panel_yx.height / 2);
                        item.nodes.panel_yx.addChild(hero);
                        if(data.sqid) {
                            hero.setArtifact(data.sqid);
                        }
                    }
                    if (!data[i + 1] && X.inArray(data.lack, i + 1)) {
                        G.class.ani.show({
                            addTo: item.nodes.panel_yx,
                            json: "yingxiong_queshi_dh",
                            repeat: true,
                            autoRemove: false
                        });
                        item.nodes.panel_yx.setTouchEnabled(true);
                        item.nodes.panel_yx.click(function () {
                            G.tip_NB.show(L("def_hero_no"));
                        });
                    }
                })(i);
            }
        }
    });
    G.frame[ID] = new fun('wujunzhizhan_fszr.json', ID);
})();