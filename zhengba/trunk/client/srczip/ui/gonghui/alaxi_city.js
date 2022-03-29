/**
 * Created by  on 2019//.
 */
(function () {
    //据点详情
    var ID = 'alaxi_city';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        show: function () {
            var me = this;
            var args = arguments;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me, args);
            });
        },
        onOpen: function () {
            var me = this;
            me.cityData = me.data();
            me.showToper();
            me.bindBtn();
            G.class.ani.show({
                addTo: me.nodes.panel_dh,
                x:me.nodes.panel_dh.width/2,
                y:me.nodes.panel_dh.height/2,
                json:'ghz_ditu_bgtx1',
                repeat: true,
                autoRemove: false,
            })
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            //查看占领奖励
            me.nodes.panel_jl.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.alaxi_zljl.data(me.cityData).show();
                }
            });
            //刷新对手
            me.nodes.btn_sx.click(function () {
                function f() {
                    me.ajax("gonghuisiege_refresh", [me.cityData.id], function (str, data) {
                        if (data.s == 1) {
                            cc.mixin(me.DATA, data.d, true);
                            G.tip_NB.show(L("GONGHUIFIGHT19"));
                            me.showRefreshNum();
                            me.showEnemyList(true);
                        }
                    });
                }

                if (me.DATA.freerefnum < G.gc.gonghuisiege.freenum) {
                    f();
                } else {
                    if (!X.cacheByUid("alaxi_fresh")) {
                        return G.frame.hint.data({
                            callback: function () {
                                f();
                            },
                            cacheKey: "alaxi_fresh",
                            txt: L('GONGHUIFIGHT18')
                        }).show();
                    }else {
                        f();
                    }
                }
            });
            //一键扫荡
            me.nodes.btn_sd.click(function () {
                if (G.frame.alaxi_city.DATA.recoverinfo.num <= 0) return G.tip_NB.show(L("TZCSBZ"));
                G.frame.yingxiong_fight.data({
                    pvType: "alaxi_sd",
                    callback: function (frame) {
                        var selectedData = frame.getSelectedData();
                        X.cacheByUid('alaxi_sd', selectedData);
                        G.frame.yingxiong_fight.remove();
                        G.ajax.send('gonghuisiege_saodang', [me.data().id, selectedData], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.alaxi_sdjg.once('show',function () {
                                    me.getData(function () {
                                        me.setContents();
                                    });
                                    G.frame.alaxi_main.getData(function () {
                                        G.frame.alaxi_main.showBoxPrize();
                                    });
                                }).data({
                                    data:d.d
                                }).show();
                            }
                        }, true);
                    },
                }).show();
            });
        },
        onShow: function () {
            var me = this;
            me.showRefreshNum();
            me.setContents();
        },
        setContents:function(){
            var me = this;
            me.setMainCity();
            me.showEnemyList();
            me.showRankList();
            me.showFightNum();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            connectApi("gonghuisiege_getcityinfo", [me.data().id], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        setMainCity:function () {
            var me = this;
            //特效
            me.nodes.panel_jz.removeAllChildren();
            G.class.ani.show({
                addTo:me.nodes.panel_jz,
                json:me.cityData.ani,
                repeat:true,
                autoRemove:false,
                x:me.nodes.panel_jz.width/2,
                y:me.nodes.panel_jz.height/2,
            });
            // me.nodes.panel_jz.removeBackGroundImage();
            // me.nodes.panel_jz.setBackGroundImage('img/gonghui/ghz/' + me.cityData.img + '.png',1);
            me.nodes.panel_wz.removeBackGroundImage();
            me.nodes.panel_wz.setBackGroundImage('img/gonghui/ghz/' + me.cityData.titleimg + '.png',1);
            var item = G.class.sitem(G.frame.alaxi_main.DATA.cityinfo[me.cityData.id]);
            item.setPosition(me.nodes.ico.width / 2, me.nodes.ico.height / 2);
            me.nodes.ico.removeAllChildren();
            me.nodes.ico.addChild(item);
        },
        showEnemyList: function (iffresh) {
            var me = this;
            var data = me.DATA.challengeinfo;

            for (var index = 0; index < data.pklist.length; index ++) {
                (function (index) {
                    var conf = data.pklist[index];
                    var parent = me.nodes["panel_" + (index + 1)];
                    var list = me.nodes.list.clone();
                    if (conf.uid == 'NPC') {
                        conf.headdata.ghname = L("GONGHUIFIGHT11");
                        conf.headdata.name = L("GONGHUIFIGHT10");
                    }
                    X.autoInitUI(list);
                    X.render({
                        txt_ghmc: conf.headdata.ghname || conf.headdata.guildname || L('ZW'),
                        txt_name: conf.headdata.name,
                        txt_zdl: X.fmtValue(conf.zhanli || 0),
                        shengli:function(node){
                            node.setVisible(X.inArray(data.passlist, index));
                        },
                        panel_js: function (node) {
                            node.removeAllChildren();
                            var model = conf.headdata.model || '11011';
                            X.setHeroModel({
                                parent:node,
                                model:X.splitStr(model),
                                scaleNum:0.5,
                                cache:false,
                                callback:function (node) {
                                    if(X.inArray(data.passlist, index)){
                                        node.setTimeScale(0);
                                        // node.stopAllAni();
                                        node.setColor(cc.color("#999999"));
                                    }
                                }
                            });
                            if (X.inArray(data.passlist, index)) {
                                list.nodes.txt_ghmc.hide();
                                list.nodes.txt_name.hide();
                                list.nodes.txt_zdl.hide();
                                list.nodes.wz_zdl_bg.hide();
                            }else {
                                list.nodes.txt_ghmc.show();
                                list.nodes.txt_name.show();
                                list.nodes.txt_zdl.show();
                                list.nodes.wz_zdl_bg.show();
                            }
                            if(iffresh){
                                G.class.ani.show({
                                    addTo:node,
                                    json:'ani_yuwaizhengba_shuaxin',
                                    repeat:false,
                                    autoRemove:true
                                })
                            }
                            node.setTouchEnabled(true);
                            node.click(function () {
                                if (X.inArray(data.passlist, index)) return G.tip_NB.show(L("GONGHUIFIGHT12"));
                                G.frame.alaxi_playerinfo.data({
                                    data: conf,
                                    index: index,
                                    city: me.data().id
                                }).checkShow();
                            })
                        }
                    }, list.nodes);
                    list.show();
                    list.setPosition(parent.width / 2, parent.height/2);
                    parent.removeAllChildren();
                    parent.addChild(list);
                })(index);
            }
        },
        showRankList: function () {
            var me = this;
            X.render({
                txt_wdsl: L("GONGHUIFIGHT14"),
                txt_wdpm: function (node) {
                    var str = me.DATA.cityrank.myrank != -1 ? X.STR(L("GONGHUIFIGHT30"), me.DATA.cityrank.myrank) : L("WSB");
                    var rh = X.setRichText({
                        parent: node,
                        str:str,
                        color:"#FFF6DD",
                    });
                    rh.setAnchorPoint(0,0.5);
                    rh.setPosition(0,node.height/2);
                },
                txt_wdjf:function(node){
                    node.setString(X.fmtValue(me.DATA.cityrank.myval));
                    // node.setVisible(me.DATA.cityrank.myrank != -1);
                }
            }, me.nodes);

            for (var index = 0; index < 3; index ++) {
                var data = me.DATA.cityrank.ranklist[index];
                me.nodes['txt_gh_name' + (index+1)].setString(data ? data.ghname : L("XWYD"));
                me.nodes['txt_jf' + (index+1)].setString(data ? X.fmtValue(data.jifen) : '');
            }
        },
        //免费刷新次数
        showRefreshNum: function () {
            var me = this;
            var leftnum = G.gc.gonghuisiege.freenum - me.DATA.freerefnum;
            if(leftnum > 0){//还有免费次数
                me.nodes.txt_sxds.show();
                me.nodes.panel_zssl.hide();
                me.nodes.panel_symf.show();
                var str = X.STR(L("GONGHUIFIGHT15"),leftnum);
                var rh = X.setRichText({
                    parent:me.nodes.panel_symf,
                    str:str,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: me.nodes.panel_symf.width / 2, y: me.nodes.panel_symf.height / 2},
                    color:"#FFF6DD",
                    outline:"#2D1400"
                });
            }else {
                me.nodes.panel_symf.hide();
                me.nodes.txt_sxds.hide();
                me.nodes.panel_zssl.show();
                var img = new ccui.ImageView(G.class.getItemIco('rmbmoney'),1);
                var rh = X.setRichText({
                    parent:me.nodes.panel_zssl,
                    str:L('GONGHUIFIGHT32'),
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: me.nodes.panel_zssl.width / 2, y: me.nodes.panel_zssl.height / 2-5},
                    color:"#2D1400",
                    node:img,
                    size:20
                });
            }

        },
        //倒计时
        showFightNum: function () {
            var me = this;
            if (me.DATA.recoverinfo.recovertime > G.time) {//有倒计时
                var str1 = X.STR(L("GONGHUIFIGHT16"),me.DATA.recoverinfo.num,G.gc.gonghuisiege.fight_num.maxnum);
                X.timeout(me.nodes.panel_sycs, me.DATA.recoverinfo.recovertime, function () {
                    me.getData(function () {
                        me.showFightNum();
                    });
                },function (str) {
                    var rh = X.setRichText({
                        parent:me.nodes.panel_sycs,
                        str:str,
                        anchor: {x: 0.5, y: 0.5},
                        pos: {x: me.nodes.panel_sycs.width / 2, y: me.nodes.panel_sycs.height / 2},
                        color:"#FFF6DD",
                        outline:"#2D1400"
                    })
                },{
                    showStr:str1+L("GONGHUIFIGHT17")
                });
            } else {
                if(me.nodes.panel_sycs.__timeoutTimer){
                    me.nodes.panel_sycs.clearTimeout(me.nodes.panel_sycs.__timeoutTimer);
                    delete me.nodes.panel_sycs.__timeoutTimer;
                }
                var str1 = X.STR(L("GONGHUIFIGHT16"),me.DATA.recoverinfo.num,G.gc.gonghuisiege.fight_num.maxnum);
                var rh = X.setRichText({
                    parent:me.nodes.panel_sycs,
                    str:str1,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: me.nodes.panel_sycs.width / 2, y: me.nodes.panel_sycs.height / 2},
                    color:"#FFF6DD",
                    outline:"#2D1400"
                })
            }
        }
    });
    G.frame[ID] = new fun('gonghui_alxzc_dz.json', ID);
})();