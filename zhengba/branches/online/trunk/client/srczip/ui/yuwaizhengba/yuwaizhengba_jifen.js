/**
 * Created by LYF on 2018/7/10.
 */
(function () {

    G.frame.chongzhi.on("hide", function () {
        if(G.frame.yuwaizhengba_jifen.isShow) {
            G.frame.yuwaizhengba_jifen.getData();
        }
    });

    //积分赛
    var ID = 'yuwaizhengba_jifen';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        getData: function (callback) {
            var me = this;
            // var data = X.toJSON('{"s": 1, "d": {"status": 1, "enemy": [{"body": "03", "head": "1003", "pzid": "1", "army": [["2010", 68, "90001"], ["1003", 68, "90005"], ["2004", 68, "90005"], ["3005", 68, "90005"], ["1006", 68, "90001"], ["2007", 68, "90001"]], "zhongzu": "2", "weapon": "01", "npcid": 232, "headborder": "4", "sex": 1, "lv": 68, "ext_servername": "天赐神兵", "zhanli": 1004106, "vip": 0, "uid": "ROBOT_0_232", "skill": [["1001", 1], ["1001", 1]], "horse": "03", "jifen": 30, "name": "奥利弗詹姆斯"}, {"body": "01", "head": "1004", "pzid": "1", "army": [["1003", 69, "90001"], ["2004", 69, "90005"], ["3005", 69, "90005"], ["1006", 69, "90005"], ["2007", 69, "90001"], ["3008", 69, "90001"]], "zhongzu": "2", "weapon": "01", "npcid": 233, "headborder": "5", "sex": 0, "lv": 69, "ext_servername": "龙眼指环", "zhanli": 1038498, "vip": 0, "uid": "ROBOT_1_233", "skill": [["1001", 1], ["1001", 1]], "horse": "04", "jifen": 30, "name": "亚伦福斯特"}, {"body": "02", "head": "1002", "pzid": "1", "army": [["1010", 67, "90001"], ["2010", 67, "90005"], ["1003", 67, "90005"], ["2004", 67, "90005"], ["3005", 67, "90001"], ["1006", 67, "90001"]], "zhongzu": "1", "weapon": "01", "npcid": 231, "headborder": "3", "sex": 0, "lv": 67, "ext_servername": "天使项链", "zhanli": 970443, "vip": 0, "uid": "ROBOT_2_231", "skill": [["1001", 1], ["1001", 1]], "horse": "02", "jifen": 30, "name": "安海明威"}], "freerefnum": 15, "rank": 1, "jifen": 0, "pknum": 15, "buynum": 50, "cd": 1538146800, "buyneed": 10}}');
            // me.DATA = data.d;
            // callback && callback();
            me.ajax('crosszb_jfopen', [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            }, true);
        },

        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.ui.nodes.btn_jifen.click(function (sender, type) {
                G.frame.yuwaizhengba_phb.show();
            });
            me.ui.nodes.btn_scjl.click(function (sender, type) {
                G.frame.yuwaizhengba_jiangli.show();
            });
            me.ui.nodes.btn_wysd.click(function (sender, type) {
                G.frame.shop.data({
                    type: "7",
                    name: "ywsd"
                }).show();
            });
            me.ui.finds("img_di").setTouchEnabled(true);
            me.ui.finds("img_di").click(function () {
                if(X.cacheByUid("jumpJiFenSai")) {
                    X.cacheByUid("jumpJiFenSai", 0);
                } else {
                    X.cacheByUid("jumpJiFenSai", 1);
                }
                me.checkJumpFight();
            });

            function refresh(callback) {
                me.ajax('crosszb_jfrefmatch', [], function (str, data) {
                    if (data.s == 1) {
                        for (var k in data.d) {
                            me.DATA[k] = data.d[k];
                        }
                        G.tip_NB.show(L('SX') + L('SUCCESS'));
                        me.setContents(true);
                        callback && callback();
                    }
                }, true);
            }

            me.ui.nodes.btn_sx.click(function (sender, type) {
                if (me.DATA.freerefnum > 0) {
                    refresh();
                } else {
                    var str = L('KFZ_JF_refreshEnemy');
                    G.frame.alert.data({
                        sizeType: 3,
                        okCall: function () {
                            refresh();
                        },
                        autoClose: true,
                        richText: str
                    }).show();
                }
            });
        },
        checkJumpFight: function() {
            var me = this;
            if(X.cacheByUid("jumpJiFenSai")) {
                if(me.DATA.status != 2)
                me.ui.finds("ico_gou").show();
            } else {
                me.ui.finds("ico_gou").hide();
            }
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
            me.setBgAni();
        },
        setBgAni: function () {
            var me = this;
            var bg = me.ui.nodes.bg_2;
            bg.removeAllChildren();
            G.class.ani.show({
                addTo: bg,
                json: 'ani_yuwaizhengba_beijing',
                x: bg.width / 2,
                y: bg.height / 2,
                cache: true,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
            var node = me.ui.nodes.img_bg;
            node.removeAllChildren();
            G.class.ani.show({
                addTo: node,
                json: 'ani_yuwaizhengba_shuijing2',
                x: node.width / 2,
                y: node.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.getData(function () {
                me.setContents(true);
            });
            me.checkRedPoint();
        },
        checkRedPoint: function() {
            var me = this;

            if(G.DATA.hongdian.crosszbjifen > 0) {
                G.setNewIcoImg(me.nodes.btn_scjl);
            }else {
                G.removeNewIco(me.nodes.btn_scjl);
            }
        },
        setJiangli: function () {
            var me = this;
            var data = me.DATA;

            if (data.rankprize) {

                G.frame.jiangli.data({
                    prize: [].concat(data.rankprize)
                }).show();

                // function callback() {
                //     me.ajax('crosszb_jfrecrankprize', [], function (s, d) {
                //         if (d.s == 1) {
                //             G.tip_NB.show(X.createPrizeInfo(data.rankprize, 0, 1));
                //             G.frame.jiangli.hide();
                //             G.event.emit('freshKFZ');
                //         }
                //     }, true);
                // }
                //
                // G.frame.jiangli.data({
                //     frame:'jifen_lq',
                //     data:data.rankprize,
                //     callback:callback
                // }).show();
            }
        },
        setContents: function (showani) {
            var me = this;

            me.ui.setTimeout(function () {
                me.setJiangli();
            }, 500);

            if(me.DATA.status == 2) {
                me.ui.finds("img_di").hide();
                me.ui.finds("ico_gou").hide();
                me.ui.finds("txt_tgzd").hide();
            } else {
                me.ui.finds("img_di").show();
                me.ui.finds("ico_gou").show();
                me.ui.finds("txt_tgzd").show();
            }

            me.setTop();
            me.setCenter(showani);
            me.setTzCs();
            me.checkJumpFight();
        },
        setTop: function () {
            var me = this;
            var data = me.DATA;
            var nodes = me.ui.nodes;
            nodes.sz_paihang.setString((data.rank <= 300 ? data.rank || 0 : "300+"));
            nodes.sz_dqjf.setString(data.jifen || 0);
            nodes.text_gssl.setString(X.fmtValue(G.class.getOwnNum(2019, 'item')));
            if (data.status == 1) {
                if (me.jifenTimer) {
                    me.ui.clearTimeout(me.jifenTimer);
                    delete me.jifenTimer;
                }
                me.jifenTimer = X.timeout(nodes.djs, data.cd, function () {
                    me.getData(function () {
                        me.setContents();
                    });
                });
            } else if (data.status == 2) {
                nodes.djs.setString(L('YJS'));
            }
        },
        setCenter: function (showani) {
            var me = this;
            var nodes = me.ui.nodes;
            var data = me.DATA;
            var listArr = me.listArr = [nodes.p1, nodes.p2, nodes.p3];

            // nodes.sxcs.hide();
            nodes.sxcs1.hide();
            if (data.status == 1) {
                nodes.sxcs1.setString(data.freerefnum || 0);
                // nodes.sxcs.show();
                nodes.sxcs1.show();
            }

            for (var i = 0; i < 3; i++) {
                listArr[i].data = data.enemy[i];
                me.setItem(listArr[i], i , showani);
            }
            // var j = 0;
            // me.ui.setTimeout(function () {
            //
            //     listArr[j].data = data.enemy[j];
            //     me.setItem(listArr[j],j);
            //     j++;
            // },50,listArr.length - 1);
        },
        setAni:function (ui,showani){
            if(showani){
                G.class.ani.show({
                addTo: ui,
                json: 'ani_yuwaizhengba_shuaxin',
                x: ui.width / 2,
                y: ui.height / 2,
                repeat: false,
                autoRemove: true,
                onload: function (node, action) {

                }
            });
            }
        },
        setItem: function (ui, index , showani) {
            var me = this;

            var item = me.ui.nodes.list.clone();
            item.setPosition(0, 0);
            ui.removeAllChildren();
            me.setAni(ui,showani);
            ui.addChild(item);
            X.autoInitUI(item);
            item.setTouchEnabled(false);
            item.nodes.img_yjb.setTouchEnabled(false);
            var data = me.DATA;
            var nodes = item.nodes;

            var gud = ui.data;

            if (!X.isHavItem(gud)) return;
            if (gud.winside != undefined) {
                gud.model = '11011_jia';
            }

            X.setHeroModel({
                parent: nodes.rw3,
                data: (gud.herolist[0] && gud.herolist[0].sqid) ? (gud.herolist[1] ? gud.herolist[1] : gud.headdata) : gud.herolist[0],
                model:G.class.hero.getModel(gud.headdata),
                scaleNum:0.8,
                callback: function (node) {
                    item.nodes.rw3.setFlippedX(index % 2);
                    nodes.qizi.x = (index % 2==0?-90:140);

                    if (data.status == 1) {
                        nodes.qizi.hide();
                        if (gud.winside != undefined) {
                            //胜利
                            nodes.wjnr.hide();
                            nodes.wz.hide();
                            if (gud.winside == 0) {
                                node.runAni(0, "yuwai_shenli", true);
                                nodes.tupian.loadTexture('img/zbs/shengli.png',1);
                                nodes.tupian.show();
                            } else {
                                // 失败
                                node.runAni(0, "yuwai_shibai", true);
                                nodes.tupian.loadTexture('img/zbs/shibai.png',1);
                                nodes.tupian.show();
                            }
                        } else {
                            nodes.wjnr.show();
                            nodes.wz.show();
                            nodes.tupian.hide();
                            X.render({
                                text_zdl1: gud.zhanli || 0,
                                wanjiaming: gud.headdata.name,
                                quming: gud.headdata.ext_servername,
                                jg: gud.jifen || 0
                            }, nodes);
                        }
                    } else if (data.status == 2) {
                        // item.finds('pm').show();
                        nodes.wz.hide();
                        nodes.tupian.hide();
                        nodes.qizi.show();
                        nodes.qizi.setBackGroundImage('img/zbs/p' + (index+1) + '.png',1);
                        nodes.qizi_sz.setString(index+1);
                        X.render({
                            text_zdl1: gud.zhanli || 0,
                            wanjiaming: gud.headdata.name,
                            quming: gud.headdata.ext_servername,
                        }, nodes);
                    }

                    X.enableOutline(item.finds('jbhd'));
                    X.enableOutline(nodes.jg);
                    X.enableOutline(nodes.quming);
                }
            });

            gud.index = index;
            ui.gud = gud;
            ui.click(function (sender, type) {

                function callback(dd) {
                    if (dd.s == 1) {


                        // //胜场奖励红点
                        // if (dd.d.scjl) {
                        //     G.event.emit('hdchange', {type: 1, tag: 'kfzb_scjl'});
                        //     G.event.emit('hdchange', {type: 1, tag: 'kfzb_jfs'});
                        //     G.event.emit('hdchange', {type: 1, tag: 'zhengzhan_kfzb'});
                        //     G.event.emit('hdchange', {type: 1, tag: 'zhengzhan'});
                        // }
                        G.event.emit('freshKFZ');
                        me.getData(function () {
                            G.class.ani.show({
                                addTo: sender,
                                json: 'ani_yuwaizhengba_yanwu',
                                x: sender.width / 2,
                                y: sender.height / 2,
                                cache: true,
                                repeat: false,
                                autoRemove: true,
                                onend: function (node, action) {
                                    me.setContents();
                                }
                            });
                        });
                    }
                }

                if (sender.gud.winside != undefined) {
                    if (sender.gud.winside == 0) {
                        G.tip_NB.show(L('KFZ_JF_SL'));
                    } else {
                        // 失败
                         G.tip_NB.show(L('KFZ_JF_SB'));
                    }
                    return;
                }

                G.frame.yuwaizhengba_drxx.data({
                    pvType: 'pvywzbjf',
                    data: sender.gud,
                    btnName:me.DATA.status == 2 ? 'QUEDIN': '',
                    callback: callback
                }).checkShow();
            });
            item.show();
        },
        setTzCs: function () {
            var me = this;
            if (me.DATA.status == 2) {
                me.ui.nodes.wz_di.hide();
                return;
            }
            me.ui.nodes.wz_di.show();
            me.ui.nodes.sycs1.setString(me.DATA.pknum);
            me.ui.nodes.jia.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    if (me.DATA.status == 2) {
                        G.tip_NB.show(L('KFZ_ADD_TIP'));
                        return;
                    }
                    me.buyTimes();
                }
            });
        },
        buyTimes: function (callback) {

            var me = this;
            G.frame.alert.data({
                cancelCall:null,
                ok:{wz:L('BTN_OK')},
                okCall: function(){
                    me.ajax('crosszb_jfbuypknum',[], function (str, data) {
                        if (data.s == 1){
                            cc.mixin(me.DATA,data.d,true);
                            me.setTzCs();
                            callback && callback();
                            me.buyTimes(callback);
                        }
                    },true);
                },
                autoClose: false,
                richNodes:[
                    new cc.Sprite('#'+G.class.getItemIco('rmbmoney'))
                ],
                richText: X.STR(L('BUYBOSSNUM_2'),me.DATA.buyneed[0].n, P.gud.vip,me.DATA.buynum)
            }).show();
        },
    });
    G.frame[ID] = new fun('kfzb_jfs.json', ID);
})();