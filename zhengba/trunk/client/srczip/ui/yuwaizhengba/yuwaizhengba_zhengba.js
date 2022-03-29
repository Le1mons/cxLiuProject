/**
 * Created by zm on 2018-09-26.
 */
(function () {

    //争霸赛
    var ID = 'yuwaizhengba_zhengba';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
			me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        getData: function (callback) {
            var me = this;

            me.ajax('crosszb_zhengbamain',[], function (str,data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    // me.resetStatus(true);
                    callback && callback();
                }
            },true);
        },
        setContents:function() {
            var me = this;
            var data = me.DATA;

            me.ui.setTimeout(function () {
                me.setJiangli();
            },500);

            me.setTop();
            // me.setBuff();
            me.setTzCs();

            // if (me.isGetNew[1] || me.isGetNew[2]) {
                me.setCenter();
            // }

            me.nodes.bg_cm.setTouchEnabled(me.DATA.pkdata && me.DATA.pkdata.length > 0);
        },
        setTop: function(){
            var me = this;
            var data = me.DATA;

            me.ui.finds("jssj").setString(data.status == 1 ? L("JSSJ") : L("KSSJ"));

            X.render({
                // sz_dqjf:G.frame.yuwaizhengba.DATA.jifen,
                sz_dqjf:function(node){
                    node.setString('');
                    var str = '';
                    if (me.DATA.myrank == 0) {
                        str = L('ZWJL');
                    } else {
                        var rankPrize = G.class.kuafuzhan.getByRank(me.DATA.myrank);
                        var fmt = "{1}<font color=" + G.gc.COLOR.n34 + ">*{2}</font> ";
                        var kkk = 0;
                        for (var i in rankPrize){
                            kkk++;
                            str += X.STR(fmt, G.class.getItem(rankPrize[i].t,rankPrize[i].a).name,rankPrize[i].n);
                        }
                    }
                    var rt = new X.bRichText({
                        size: 20,
                        maxWidth: node.width,
                        lineHeight: 24,
                        color: '#ffb200'
                    });
                    rt.text(str);
                    rt.setAnchorPoint(0,1);
                    rt.setPosition(0,node.height - 3);
                    node.removeAllChildren();
                    node.addChild(rt);
                },
                sz_paihang: data.myrank == 0 ? L('WSB') : data.myrank,
                djs:function(node){
                    if (node.timer) {
                        node.clearTimeout(node.timer);
                        delete node.timer;
                    }
                    node.timer = X.timeout(node, G.frame.yuwaizhengba.DATA.zhengbacd, function () {
                        me.getData(function () {
                            G.frame.yuwaizhengba.getData(function () {
                                me.setContents();
                            });
                        });
                    });
                },
                text_gssl:X.fmtValue(G.class.getOwnNum(2019,'item'))
            }, me.nodes);
        },
        setCenter:function() {
            var me = this;
            // me.isGetNew[me.curType] = false;

            var data = me.DATA;
            var list = [];


            // if(me.curType != me._lastType){
            //     me._lastType = me.curType;
                var clone = me.nodes[ {'1':'bg_1', '2':'bg_2'}[me.curType] ].clone();
                clone.show();
                me.nodes.scrollview.removeAllChildren();
                me.nodes.scrollview.setInnerContainerSize( clone.getContentSize() );
                me.nodes.scrollview.addChild(clone);
                // me.nodes.scrollview.hide();
                me._list = [];
            // }

            if (me.curType == 1) {
                list = data['top10'];
            } else {
                list = data['pkdata'];
            }

            var panel = clone.finds('pan1');
            panel.removeAllChildren();
            var anis = me.curType == 1 ? [1,1,3] : [1,1];
            var y = me.curType == 1 ? [1260*0.5, 1260+1260*0.5-460, 2*1260+1260*0.5-460*2-200] : [1260*0.5, 1260+1260*0.5-460];
            for(var i=0;i<anis.length;i++){
                G.class.ani.show({
                    json:'ani_yuwaizhengba_shuijing' + anis[i],
                    addTo:panel,
                    x:panel.width*0.5,
                    y:y[i], // i*1260+1260*0.5 - (i > 0 ? i*460 : 0)
                    z:10 - i,
                    repeat:true,
                    autoRemove:false
                });
            }

            var num = ['',10,4][me.curType];

            // if(!list || list.length == 0){
                // me.nodes.scrollview.show();
                // return;
            // }

            var btnType;
            var j = 0;
            me.ui.setTimeout(function () {
                var d = list[j];
                var ui = me.nodes.scrollview.finds('p' + (j + 1));
                ui.idx = j;
                // if (me.curType == 2) {
                //     ui.setPosition(me.nodePos[me.myDir][j]);
                // }

                if(!ui.data || d.uid != ui.data.uid){
                    ui.removeAllChildren();

                    if (d != undefined) {
                        if (me.curType == 1) {
                            btnType = 'qd';
                        } else {
                            btnType = 'tz';
                        }

                        d['btnType'] = btnType;
                        var item = me.nodes.list.clone();
                        me.setItem(ui,item,d,j);
                        me._list.push(item);
                        item.show();
                    } else {
                        // var img = new ccui.ImageView('img/zbs/rw_xwyd.png',1);
                        // img.setPosition(cc.p(ui.width / 2,ui.height / 2));
                        // ui.addChild(img);
                        // img.setFlippedX(j % 2);
                        G.class.ani.show({
                            json: "ani_yuwaizhengba_xuweiyidai",
                            addTo: ui,
                            x: ui.width / 2,
                            y: ui.height / 2,
                            cache: true,
                            repeat: true,
                            autoRemove: false
                        })
                    }
                    ui.show();
                }
                j++;
            },50,num - 1);
        },
        setItem:function(ui,item,d,index) {
            var me = this;
            X.autoInitUI(item);

            var rw = item.finds('rw3');
            me.setQz(d.rank,item,ui.idx+1);
            item.nodes.liaotian.hide();

            X.render({
                text_zdl1: d.zhanli,
                wanjiaming: function(node){
                    setTextWithColor(node, d.headdata.name, d.uid == P.gud.uid ? G.gc.COLOR.n34 : G.gc.COLOR.n1);
                },
                quming: d.servername,
            }, item.nodes);

            if (d && d.headdata && d.headdata.chenghao) {
                item.nodes.panel_ch.setBackGroundImage("img/public/chenghao_" + d.headdata.chenghao + ".png", 1);
            }

            X.setHeroModel({
                parent: rw,
                model: G.class.hero.getModel(d.headdata),
                scaleNum:0.8,
                callback:function (node) {
                    // rw.setFlippedX((index + me.myDir + 1) % 2);
                    var gud = d;
                    gud.index = index;
                    ui.data = gud;

                    if (gud.uid == P.gud.uid) {
                        // gud.btnType = 'qd';
                        me.myNode = ui;
                        // me.scrollByRank(gud.rank);
                    }

                    // item.data = gud;
                    item.setTouchEnabled(true);
                    item.setSwallowTouches(false);
                    item.touch(function (sender, type) {
                        if (type === ccui.Widget.TOUCH_NOMOVE) {
                            // 挑战区不能点击自己
                            if (gud.uid == P.gud.uid && me.curType == 2) {
                                G.tip_NB.show(L('YWZB_PK_ME'));
                                return;
                            }

                            if (gud.uid != P.gud.uid) {
                                me.enemyNode = ui;
                            }

                            // me.setAllHeroInfoVisible(false);
                            // delete me['_init_' + me.curType + '_' + me.myNode.data.index];
                            // me.jumpOutScreen(sender, gud.rank, function(){
                            //     me.goUpAni(function () {
                            //         me.enemyNode.data = me.myNode.data;
                            //         delete me.myNode.data;
                            //         me.getData(function () {
                            //             me.setLaysStatus(me.curType, function () {
                            //                 me.setContents();
                            //             });
                            //         });
                            //     });
                            // });
                            // return;

                            G.frame.yuwaizhengba_drxx.data({
                                pvType:'pvywzbzb',
                                data:gud,
                                jifen:0,
                                rank:me.DATA.myrank,
                                btnName:me.curType == 1 ? 'QUEDIN' : '',
                                uid:gud.uid,
                                callback:function(dd){
                                    if (dd.s == 1) {
                                        if (dd.d.fightres.winside == 0) {
                                            G.event.emit('sdkevent',{
                                                event:'waiyu_tiaozhan',
                                                data:{
                                                    waiyu_rank:me.DATA.myrank,
                                                    waiyu_score:0,
                                                    get:dd.d.prize,
                                                }
                                            });
                                            if(me.myNode.data.rank > me.enemyNode.data.rank){
                                                // 战胜比自己排名高的对手
                                                me.setAllHeroInfoVisible(false);
                                                delete me['_init_' + me.curType + '_' + me.myNode.data.index];
                                                // 飞到屏幕外面
                                                me.jumpOutScreen(sender, gud.rank, function(){
                                                    // 玩家快速滑入到被击败对手的位置
                                                    me.goUpAni(function () {
                                                        // 更新新位置的数据
                                                        me.enemyNode.data = me.myNode.data;
                                                        // 删除旧数据
                                                        delete me.myNode.data;
                                                        G.event.emit('freshKFZ');
                                                        me.getData(function () {
                                                            me.setLaysStatus(me.curType, function () {
                                                                me.setContents();
                                                                me.setAllHeroInfoVisible(true);
                                                            });
                                                            me.setTzCs();
                                                        });
                                                    });
                                                });
                                            }else{
                                                me.getData(function () {

                                                    me.setTzCs();
                                                });
                                            }
                                        } else {
                                            G.event.emit('freshKFZ');
                                        }
                                        G.hongdian.getData("crosszbjifen", 1, function () {
                                            G.frame.yuwaizhengba.checkRedPoint();
                                        });
                                    } else if(dd.s == -6) {
                                        me.getData(function () {
                                            me.setContents();
                                        });
                                    }
                                }
                            }).checkShow();
                        }
                    });
                }
            });

            item.setPosition(cc.p(ui.width / 2,ui.height / 2));
            item.setAnchorPoint(cc.p(.5,.5));

            if(!me['_init_' + me.curType + '_' + index]){
                me['_init_' + me.curType + '_' + index] = true;
                G.class.ani.show({
                    json:'ani_yuwaizhengba_shuaxin',
                    addTo:ui,
                    x:ui.width*0.5,
                    y:20,
                    repeat:false,
                    autoRemove:true
                });
            }

            ui.addChild(item);
        },
        refreshAni: function(){
            var me = this;

            cc.each(me._list,function(item, index){
            });
        },
        goUpAni: function(callback) {
            var me = this;

            var myMod = me.myNode.data.index % 2;
            var enemyMod = me.enemyNode.data.index % 2;
            // 不是同一边, 才翻转
            if(myMod != enemyMod){
                me.myNode.finds('rw3').setFlippedX( enemyMod == 0);
            }
            // me.myAction.play('run',true);
            me.enemyNode.setLocalZOrder(10);
            me.myNode.runActions([
                [
                    // cc.moveTo(0.45,me.enemyNode.getPosition()),
                    cc.jumpTo(0.45, me.enemyNode.getPosition(), 100, 1),
                    cc.callFunc(function() {
                        me.ui.setTimeout(function () {
                            G.class.ani.show({
                                json:'ani_yuwaizhengba_yanwu',
                                addTo:me.enemyNode,
                                x:me.enemyNode.width*0.5,
                                y:20,
                                repeat:false,
                                autoRemove:true
                            });
                        },400);
                    })
                ],
                cc.delayTime(0.15),
                cc.callFunc(function() {
                    callback && callback();
                })
            ]);
        },
        // 英雄跳出屏幕
        jumpOutScreen: function(item, rank, callback){
            var me = this;
            var start = item.getPosition();
            var x = rank % 2 != 0 ? -1 * C.WS.width*0.5 : C.WS.width + C.WS.width*0.5;
            var end = item.convertToNodeSpace(cc.p(x, C.WS.height*0.5));
            end.y = start.y;

            item.finds('yjb_dh').show();
            G.class.ani.show({
                addTo: item.finds('yjb_dh'),
                json: 'ani_yuwaizhengba_beida',
                // x: item.finds('yjb_dh').width / 2,
                // y: item.finds('yjb_dh').height / 2,
                repeat: false,
                autoRemove: true,
                onend: function (node, action) {
                    item.runActions([
                        cc.bezierTo(0.45, [
                            start,
                            cc.p((end.x - start.x)*0.5, start.y + 150),
                            end
                        ]),
                        cc.callFunc(function() {
                            item.removeFromParent();
                            callback && callback();
                        })
                    ]);
                }
            });


            // item.runActions([
            //     cc.jumpTo(3000, cc.p(C.WS.width*0.5, C.WS.height*0.5), 150, 1),
            //     cc.callFunc(function() {
            //         item.removeFromParent();
            //     })
            // ]);
        },
        setAllHeroInfoVisible: function(val){
            var me = this;

            cc.each(me._list,function(item, index){
                item.nodes.qizi.setVisible(val);
                item.nodes.qizi2.setVisible(val);
                item.nodes.img_sb.setVisible(val);
                item.nodes.text_zdl1.setVisible(val);
                item.nodes.wanjiaming.setVisible(val);
                item.nodes.quming.setVisible(val);

                if(!val && item.timer){
                    item.clearTimeout(item.timer);
                    delete item.timer;
                    item.nodes.liaotian.setVisible(val);
                }

                item.finds('img_zdlbg').setVisible(val);
                item.finds('img_zdl').setVisible(val);
            });
        },
        // 显示气泡
        // @param msg string or array
        // @param repeat bool 是否循环提示
        // @param last 上条消息
        showQiPao : function(item, msg, repeat, callback, last){
            var me = this;
            if(!cc.isNode(item)){
                return;
            }

            if(cc.isString(msg)){
                msg = [msg];
            }

            var show = function(){
                item.nodes.wz.setString(val);
                item.nodes.liaotian.show();

                item.setTimeout(function () {
                    item.nodes.liaotian.hide();
                    callback && callback();
                },3000);
            };

            var val = X.arrayRand(msg);
            if(msg.length > 1 && val == last){
                // 和上条相同则重新随机
                me.showQiPao(item, msg, repeat, callback, val);
                return;
            }

            if(item.timer){
                item.clearTimeout(item.timer);
                delete item.timer;
            }

            if(repeat){
                // 文字泡每隔7-13S, 40%概率放一个文字泡
                item.timer = item.setTimeout(function () {
                    if(X.rand(0, 100) <= 40){
                        show();
                    }
                    me.showQiPao(item, msg, repeat, callback, val);
                },X.rand(7, 13)*1000);
            }else{
                show();
            }
        },
        setQz:function(rank,item, idx) {
            var me = this;

            item.nodes.qizi.hide();
            item.nodes.qizi2.hide();

            var qizi = idx % 2 != 0 ? item.nodes.qizi : item.nodes.qizi2;
            qizi.show();

            qizi.finds('sz').setString(rank);
            X.enableOutline(qizi.finds('sz'), cc.color('#000000'),2);
            if (rank < 4) {
                qizi.setBackGroundImage('img/zbs/p' + rank + '.png', 1);
            } else {
                qizi.setBackGroundImage('img/zbs/p_tongyong.png', 1);
            }
        },
        setTzCs:function() {
            var me = this;
            var data = me.DATA;

            X.render({
                sycs1: data.pknum || 0,
            }, me.nodes);
        },
        setJiangli:function() {
            var me = this;
            var data = me.DATA;

            if (data.rankprize) {
                G.frame.jiangli.data({
                    prize:data.rankprize,
                }).once('show', function () {
                    me.ajax('crosszb_zbrecrankprize',[], function (s, d) {
                        if (d.s == 1) {
                            // G.tip_NB.show(X.createPrizeInfo(data.rankprize,0,1));
                        }
                    },true);
                }).show();
            }
        },
        // resetStatus:function(v) {
        //     var me = this;

        //     me.isGetNew = me.isGetNew || {};
        //     for(var j=0;j<2;j++) {
        //         me.isGetNew[j+1] = v;
        //     }
        // },
        setRefresh:function(bool) {
            var me = this;

            // var data = me.DATA;
            // me.nodes.tiaozhan.hide();
            me.nodes.btn_sx.hide();

            if (bool) {
                me.nodes.btn_sx.show();
            }
        },
        setCDTime:function(bool) {
            var me = this;
            var data = me.DATA;
            me.nodes.bg_kz_1.hide();

            if (me.cdTimer) {
                me.ui.clearTimeout(me.cdTimer);
                delete me.cdTimer;
            }

            if (bool && data.cdtime - G.time > 0) {
                me.cdTimer = X.timeout(me.nodes.sz9, data.cdtime, function () {
                    me.setCDTime(false);
                });
                me.nodes.bg_kz_1.show();
            }
        },
        buyTimes : function(callback){
            //购买BOSS战斗次数
            var me = this;
            G.frame.alert.data({
                cancelCall:null,
                ok:{wz:L('BTN_OK')},
                okCall: function(){
                    me.ajax('crosszb_zbbuypknum',[], function (str, data) {
                        if (data.s == 1){
                            G.event.emit("sdkevent", {
                                event: "crosszb_zbbuypknum"
                            });
                            cc.mixin(me.DATA,data.d,true);
                            me.setTzCs();
                            callback && callback();
                            me.buyTimes(callback);
                            G.hongdian.getData("crosszbjifen", 1, function () {
                                G.frame.yuwaizhengba.checkRedPoint();
                            });
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
        setLaysStatus:function(type,callback) {
            var me = this;

            var data = me.DATA;
            // me.nodes.scrollview.hide();
            me.nodes.tiaozhan.hide(); // 挑战次数
            me.nodes.btn_sx.hide(); // 刷新对手
            me.nodes.lay_wzzd.hide();
            me.nodes.lay_wzzd2.hide();
            me.setCDTime(false);

            if (type == 1) {
                if (data.status == 1) {
                    me.nodes.lay_wzzd2.show();
                }
                me.nodes.scrollview.jumpToTop();
                // me.nodes.scrollview.show();
            } else {
                if (data.status == 1) {
                    me.nodes.lay_wzzd.show();
                    me.setRefresh(true);
                }
                if (data.cdtime) {
                    me.setCDTime(true);
                }
                me.nodes.scrollview.jumpToTop();
                // me.nodes.scrollview.show();
                me.nodes.tiaozhan.show(); // 挑战次数
            }

            callback && callback();
        },
        // scrollByRank: function(rank, ani){
        //     var me = this;
        //     // rank 0 未上榜,显示到顶部
        //     var percent = [0, 0, 0, 0, 17, 30, 50, 65, 82, 100, 100][rank];
        //     percent = percent || 0;

        //     if(ani){
        //         me.nodes.scrollview.scrollToPercentVertical(percent, 0.1, true);
        //     }else{
        //         me.nodes.scrollview.jumpToPercentVertical(percent);
        //     }
        //     me.nodes.scrollview.show();
        // },
        bindUI: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            me.nodes.jia.click(function (sender, type) {
                me.buyTimes(function () {
                    // me.setTop();
                });
            });

            me.nodes.btn_zdrz.click(function () {
                G.frame.yuwaizhengba_zdrz.show();
            });

            // me.nodes.btn_zbqz.click(function () {
            //     G.frame.yuwaizhengba_zbqz.show();
            // });

            me.nodes.btn_wysd.click(function () {
                G.frame.shop.data({
                    type: "7",
                    name: "ywsd"
                }).show();
            });

            me.nodes.btn_jifen.click(function () {
                G.frame.yuwaizhengba_zbphb.show();
            });

            function refresh() {
                me.ajax('crosszb_refzbpk',[], function (str, data) {
                    if (data.s == 1) {
                        for(var k in data.d) {
                            me.DATA[k] = data.d[k];
                        }
                        // me.resetStatus(true);
                        G.tip_NB.show(L('SX') + L('SUCCESS'));
                        me.setContents();
                        me.setRefresh(true);
                    }
                    me.ui.setTimeout(function () {
                        me.nodes.btn_sx.setTouchEnabled(true);
                    },50);
                },true);
            }

            me.nodes.btn_sx.click(function (sender, type) {
                sender.setTouchEnabled(false);
                if (me.DATA.refnum > 0) {
                    refresh();
                } else {
                    sender.setTouchEnabled(true);
                    G.tip_NB.show(L('KFZ_ZB_REF_TIP'));
                }
            });

            me.nodes.lay_wzzd.click(function () {
                me.nodes.lay_wzzd.hide();
                me.nodes.lay_wzzd2.show();
                me.curType = 1;
                me.setLaysStatus(1,function () {
                    me.setContents();
                });
            });

            me.nodes.lay_wzzd2.click(function () {
                me.nodes.lay_wzzd.show();
                me.nodes.lay_wzzd2.hide();
                me.curType = 2;
                me.setLaysStatus(2,function () {
                    me.setContents();
                });
            });

            me.nodes.bg_cm.setSwallowTouches(false);
            me.nodes.bg_cm.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    me.bPos = sender.getTouchBeganPosition();
                } else if (type == ccui.Widget.TOUCH_MOVED) {
                } else if (type === ccui.Widget.TOUCH_ENDED) {
                    var ePos = sender.getTouchEndPosition();
                    // if (me.DATA.status == 1) {
                        if (ePos.x - me.bPos.x > 120) {
                            if (me.curType == 2) {
                                return;
                            }
                            me.curType = 2;
                            me.setLaysStatus(2,function () {
                                me.setContents();
                            });
                        } else if (ePos.x - me.bPos.x < -120) {
                            if (me.curType == 1) {
                                return;
                            }
                            me.curType = 1;
                            me.setLaysStatus(1,function () {
                                me.setContents();
                            });

                        }
                    // }
                }
            });

            G.class.ani.show({
                json:'ani_yuwaizhengba_jiantou',
                addTo:me.nodes.lay_wzzd,
                repeat:true,
                autoRemove:false
            });

            G.class.ani.show({
                json:'ani_yuwaizhengba_jiantou2',
                addTo:me.nodes.lay_wzzd2,
                repeat:true,
                autoRemove:false
            });
        },
        setBgAni:function(){
            var me = this;
            var node = me.ui.nodes.bg_dh;
            node.removeAllChildren();
            G.class.ani.show({
                addTo: node,
                json: 'ani_yuwaizhengba_beijing',
                x: node.width / 2,
                y: node.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
        },
        onOpen: function () {
            var me = this;
            me.myDir = 0;
            // me.isGetNew = {};

            me.bindUI();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.setBgAni();

            me.nodes.bg_1.hide();
            me.nodes.bg_2.hide();

            me.DATA = me.data();
            if (me.DATA.status != 1) {
                me.curType = 1; // 强者区
            } else {
                me.curType = 2; // 挑战区
            }
            // me.resetStatus(true);
            if(me.curType == 1) {
                me.nodes.lay_wzzd.hide();
                me.nodes.lay_wzzd2.show();
            }else {
                me.nodes.lay_wzzd.show();
                me.nodes.lay_wzzd2.hide();
            }
            me.setLaysStatus(me.curType,function () {
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('kfzb_zbs.json', ID);
})();