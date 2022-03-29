/**
 * Created by LYF on 2019/3/5.
 */
(function () {
    //神殿地牢
    var ID = 'shendian_sddl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            this.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS33')
                }).show();
            });

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.btn_lcb.click(function () {

                G.frame.shendian_sddl_lcb.show();
            });

            me.nodes.btn_tzph.click(function () {

                G.frame.shendian_sddl_phb.show();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            X.autoInitUI(me.nodes.list1);
            X.autoInitUI(me.nodes.list2);
            X.autoInitUI(me.nodes.list3);

            var ani = {
                1: "",
                2: "ani_shendiandilao_huo",
                3: "ani_shendiandilao_bing"
            };

            for (var i in ani) {
                (function (idx) {
                    if(ani[idx]) {
                        G.class.ani.show({
                            json: ani[idx],
                            addTo: me.nodes["list" + idx].nodes.img_ptjs,
                            repeat: true,
                            autoRemove: false
                        });
                    }
                    G.class.ani.show({
                        y: 0,
                        json: "ani_shendiandilao_dilao",
                        addTo: me.nodes["list" + idx].nodes.panel_men,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            action.play("km", true);
                            me.nodes["list" + idx].ani = action;
                        }
                    });
                })(i)
            }
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("dungeon_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        getLayerPath: function(path) {
            var me = this;
            var data = me.DATA.data;
            data.layer = data.layer || {};
            return data.layer[path] || 1;
        },
        getPrizeIdx: function(path) {
            var me = this;
            var data = me.DATA.data;

            data.recdict = data.recdict || {};

            return data.recdict[path] || 0;
        },
        show: function(){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        checkRedPoint: function() {
            var me = this;
            if(!me.nodes || !cc.isNode(me.nodes.btn_lcb))return;

            if(G.DATA.hongdian.fashita.dungeon && G.DATA.hongdian.fashita.dungeon == 2) {
                G.setNewIcoImg(me.nodes.btn_lcb, .8);
            } else {
                G.removeNewIco(me.nodes.btn_lcb);
            }
        },
        onShow: function () {
            var me = this;
            me.layer = {};
            me.fightPanel = {};

            G.class.ani.show({
                json: "ani_shendiandilao_01",
                addTo: me.nodes.list1.nodes.panel_che1,
                repeat: true,
                autoRemove: false,
                y: 20,
                x: 86
            });

            G.class.ani.show({
                json: "ani_shendiandilao_01",
                addTo: me.nodes.list1.nodes.panel_che2,
                repeat: true,
                autoRemove: false,
                y: 20,
                x: 26
            });

            G.class.ani.show({
                json: "ani_shendiandilao_ding",
                addTo: me.nodes.panel_top_dh,
                repeat: true,
                autoRemove: false,
            });
            me.nodes.list1.nodes.panel_che1.setTouchEnabled(false);
            me.nodes.list1.nodes.panel_che2.setTouchEnabled(false);

            me.addBgAni(me.nodes.list1.nodes.panel_bg_dh);
            me.addDtAni(me.nodes.list1.nodes.ditie);
            me.setPanelFunc(me.nodes.list1.nodes.panel_zd);
            me.setPanelFunc(me.nodes.list2.nodes.panel_zd);
            me.setPanelFunc(me.nodes.list3.nodes.panel_zd);
            me.showToper();
            me.setContents();
            me.checkRedPoint();
            me.setAddBuff();
        },
        addDtAni: function(node) {
            node.removeBackGroundImage();
            var ditie1 = new ccui.ImageView("img/julongshendian/tiegui.png", 1);
            ditie1.setAnchorPoint(0, 0);
            ditie1.setPosition(-18, 0);

            var ditie2 = new ccui.ImageView("img/julongshendian/tiegui.png", 1);
            ditie2.setAnchorPoint(0, 0);
            ditie2.setPosition(742, 0);

            var b = new ccui.Layout();
            b.setContentSize(ditie1.width * 2, ditie1.height);
            b.setAnchorPoint(0, 0);
            b.addChild(ditie1);
            b.addChild(ditie2);
            node.addChild(b);

            b.scheduleUpdate();
            b.update = function (dt) {
                b.x -= 1;
                if(b.x <= -866) b.x = 0;
            };
            //
            // ditie2.scheduleUpdate();
            // ditie2.update = function (dt) {
            //     ditie2.x -= 1;
            //     if(ditie2.x <= -782) ditie2.x = 742;
            // };
        },
        addBgAni: function(node) {
            var img = new ccui.ImageView("img/bg/xunhuan.png");
            img.setAnchorPoint(0, 0);
            node.addChild(img);
            img.scheduleUpdate();
            img.update = function (dt) {
                img.x -= 1;
                if(img.x < -640) img.x = 0;
            };
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("fashita", 1, function () {
                G.frame.julongshendian.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            if(!G.gc.sddlcom)return;

            var conf = me.conf = G.gc.sddlcom.base;
            me.nodes.txt_bs.setString(me.DATA.num + "/" + conf.actnum);

            for (var i in conf.road) {
                me.layer[i] = me.nodes["list" + i];
                me.layer[i].zhiyue = conf.road[i].zhiyue;
                me.layer[i].layer = me.getLayerPath(i);
            }

            me.nodes.list1.nodes.panel_zd.clearAllTimers();
            me.nodes.list2.nodes.panel_zd.clearAllTimers();
            me.nodes.list3.nodes.panel_zd.clearAllTimers();
            me.nodes.list1.nodes.panel_zd.removeAllChildren();
            me.nodes.list2.nodes.panel_zd.removeAllChildren();
            me.nodes.list3.nodes.panel_zd.removeAllChildren();

            //me.ui.setTimeout(function () {

            me.setPath(me.nodes.list1, conf.road[1], 1);
            me.setPath(me.nodes.list2, conf.road[2], 2);
            me.setPath(me.nodes.list3, conf.road[3], 3);

            //}, 200);
        },
        setAddBuff: function () {
            var me = this;
            var theyDay = X.getTodayIsWhatDay();

            X.render({
                ico_zzjc: function (node) {
                    var img = theyDay == 7 ? 1 : theyDay + 1;
                    node.setBackGroundImage("img/public/ico/ico_zz" + img + ".png", 1);
                },
                txt_zzjcs: function (node) {
                    var add = theyDay == 7 ? "+10%" : "+20%";
                    node.setString(L("atk") + add + " " + L("hp") + add);
                }
            }, me.nodes);
        },
        setPath: function (node, conf, idx) {
            var me = this;
            var state = "can";
            var layerConf = G.gc.sddl[10000 * idx + node.layer];

            var fightPanel = node.nodes.panel_zd;
            fightPanel.roleList = {};
            fightPanel._fightPanel = fightPanel;

            me.fightPanel[idx] = fightPanel;
            node.nodes.text_mz.setString(conf.name);
            node.nodes.panel_qbdh1.removeAllChildren();

            var arr = [];
            for (var i = 0; i < conf.zhongzu.length; i ++) {
                var img = new ccui.ImageView("img/public/ico/ico_zz" + (conf.zhongzu[i] + 1) + ".png", 1);
                img.setScale(.8);
                arr.push(img);
            }
            X.left(node.nodes.panel_dl, arr, .7);


            if(me.DATA.num <= 0) {
                state = "nonum";
                node.nodes.btn_goji.setBright(false);
            } else {
                node.nodes.btn_goji.setBright(true);
            }

            var canLayer = parseInt((me.layer[node.zhiyue].layer - 1) / 10) * 10 + 60;

            if(node.layer > canLayer) {
                state = "zhiyue";
            }

            node.nodes.panel_qbdh1.setTouchEnabled(false);
            if(state == "zhiyue") {
                node.zyq = true;
                node.ani.play("gm", false);
                node.nodes.btn_goji.hide();
                node.nodes.text_gk.setString(L("YDZD"));
                G.class.ani.show({
                    json: "ani_shendiandilao_paizi",
                    addTo: node.nodes.panel_qbdh1,
                    autoRemove: false,
                    onload: function (ani) {
                        ani.finds("guanka$").show();
                        ani.finds("wz_1$").show();
                        ani.finds("guanka$").setString(me.conf.road[node.zhiyue].name);
                        ani.finds("wz_1$").setString(me.getLayerPath(node.zhiyue) - 1 + "/" + (me.getZYNeed(node.layer) - 1));
                    }
                });
                node.nodes.panel_qbdh1.setTouchEnabled(true);
                node.nodes.panel_qbdh1.click(function () {
                    G.tip_NB.show(X.STR(L("SDDLZY"), me.conf.road[node.zhiyue].name, (me.getZYNeed(node.layer) - 1)));
                });
            } else {
                node.nodes.panel_qb1.hide();
                node.nodes.btn_goji.show();
                if(node.zyq) {
                    G.frame.fight.once("hide", function () {
                        if(!cc.isNode(node))return;
                        node.zyq = false;
                        node.ani.playWithCallback("kaimeng", false, function () {
                            node.ani.play("km", true)
                        });
                    });
                }
            }
            if(layerConf) {
                node.nodes.text_gk.setString(X.STR(L("DJG"), node.layer - 1));
            } else {
                node.nodes.btn_goji.hide();
                node.nodes.text_gk.setString(L("YDZD"));
                node.ani.play("gm", false);
                G.class.ani.show({
                    json: "ani_shendiandilao_paizi",
                    addTo: node.nodes.panel_qbdh1,
                    autoRemove: false,
                    onload: function (ani) {
                        ani.finds("img_ytg$").show();
                    }
                })
            }


            node.nodes.btn_goji.click(function () {
                if(state == "nonum") {
                    return G.tip_NB.show(L("XDDBZ"));
                }
                if(state == "zhiyue") {
                    return G.tip_NB.show(X.STR(L("SDDLZY"), me.conf.road[node.zhiyue].name, (me.getZYNeed(node.layer) - 1)));
                }
                var obj = {
                    conf: conf,
                    path: idx,
                    layer: node.layer,
                    bossConf: layerConf
                };
                G.frame.shendian_dsxx.data(obj).show();
            });

            if(X.cacheByUid("sddl_" + idx)) {
                var keys = X.keysOfObject(X.cacheByUid("sddl_" + idx));
                var tid = X.cacheByUid("sddl_" + idx)[keys[0]];
                if(G.DATA.yingxiong.list[tid]) {
                    var role0Data = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[tid]));
                    role0Data.skin = undefined;
                    me.initRoleData(role0Data, 0);
                    var role0 = new G.class.dlRole(role0Data);
                    fightPanel.addChild(role0);
                    fightPanel.role0 = role0;
                    fightPanel.roleList["role0"] = role0;
                }
            }

            if(state != "zhiyue" && layerConf) {
                var role1Data = G.gc.hero[layerConf.model];
                me.initRoleData(role1Data, 1);
                var role1 = new G.class.dlRole(role1Data);
                fightPanel.addChild(role1);
                fightPanel.role1 = role1;
                fightPanel.roleList["role1"] = role1;
            }

            if(X.keysOfObject(fightPanel.roleList).length == 2) {
                me.startFight(fightPanel);
            }
        },
        initRoleData: function (roleData, direction) {
            roleData.side = direction;
            roleData.scale = .5;
            roleData.pos = direction ? {x: 523, y: 14} : {x: 124, y: 14};
            roleData.zIndex = 1400 - roleData.pos.y;
            roleData.rid = "role" + direction.toString();
        },

        getZYNeed: function (layer) {
            var num = 1;
            while (parseInt((num - 1) / 10) * 10 + 60 < layer) {
                num ++
            }
            return num;
        }
    });
    G.frame[ID] = new fun('shendianzhilu_sddl.json', ID);
})();