/**
 * Created by zhangming on 2017-12-21
 */

G.event.on("gift_package", function (d) {
    var d = JSON.parse(d);
    G.view.mainView.getAysncBtnsData(function(){
        G.view.mainView.allBtns["lefttop"] = [];
        G.view.mainView.setSvrBtns();
        G.DATA.isfirst = true;
        if(d.star) {
            G.DATA.star = d.star;
            G.frame.chouka_hdyx.once("aniOver", function () {
                if(!G.DATA.isfirst) return;
                if(G.guide.view) return;
                G.DATA.isfirst = false;
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function () {
                        G.frame.xianshilibao.data(G.DATA.asyncBtnsData.xianshilibao).show();
                    },
                    richText: X.STR(L("JHLB"), G.DATA.star),
                    sizeType: 3
                }).show()
            });
            G.frame.jiangli.once("hide", function () {
                if(!G.DATA.isfirst) return;
                if(G.guide.view) return;
                G.DATA.isfirst = false;
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function () {
                        G.frame.xianshilibao.data(G.DATA.asyncBtnsData.xianshilibao).show();
                    },
                    richText: X.STR(L("JHLB"), G.DATA.star),
                    sizeType: 3
                }).show()
            });
            G.frame.ui_shengxing.once("hide", function () {
                if(!G.DATA.isfirst) return;
                if(G.guide.view) return;
                G.DATA.isfirst = false;
                G.frame.alert.data({
                    cancelCall: null,
                    okCall: function () {
                        G.frame.xianshilibao.data(G.DATA.asyncBtnsData.xianshilibao).show();
                    },
                    richText: X.STR(L("JHLB"), G.DATA.star),
                    sizeType: 3
                }).show()
            })
        }
    }, false);
});

G.event.on("vipChange", function () {
    cc.director.getRunningScene().setTimeout(function () {
        G.view.mainView.checkVip();
    }, 500);
});

(function () {
    G.class.mainView = X.bView.extend({
        extConf:{
            city:{
                'maxContleft':200,
                'maxContRight':-1350
            },
            BTN_CONF:{
                righttop:{
                    starPos:{x:495,y:121},
                    offset:{x:-85,y:0},
                },
                rightbottom:{
                    starPos:{x:251,y:0},
                    offset:{x:0,y:-119},
                }
            }
        },
        ctor: function () {
            var me = this;
            G.view.mainView = me;
            G.event.on('fullScreenChange',me.fullScreenChange,me);

            if(G.tiShenIng){
                me._super('main_2.json', null, {action: true});
            }else{
                me._super('main.json', null, {action: true});
            }
        },
        fullScreenChange : function(topUI){
            if(topUI!=null){
                cc.log('mainView 自动隐藏 when fullScreenChange');
                this.hide();
                this.event.emit('visiableChangeByFullScreen');
            }else{
                cc.log('mainView 自动显示 when fullScreenChange');
                this.show();
                this.event.emit('visiableChangeByFullScreen');
                //设置底部按钮动画
                cc.director.getRunningScene().setTimeout(function () {
                    G.guidevent.emit("zhucheng_aniOver");
                }, 200);
                // G.view.mainView.action.playWithCallback("in", false, function () {
                //
                // });
                G.view.mainMenu.set_fhzc(3);
            }
        },
        
        //建筑物点击效果
        _buildClickAni : function(aniPanel,type){
        	if(type == ccui.Widget.TOUCH_BEGAN){
//      		X.forEachChild(aniPanel,function(node){
//      			if(node instanceof cc.Sprite){
//      				node.setBlendFunc(cc.ONE, cc.ONE);
//      			}
//					//node.color = cc.color('#eeeeee');
//				});
            	aniPanel.runActions([
            		cc.scaleTo(0.1,aniPanel._defaultScale-0.03)
            	]);
            }else if(type == ccui.Widget.TOUCH_ENDED || type==ccui.Widget.TOUCH_CANCELED){
//          	X.forEachChild(aniPanel,function(node){
//					//node.color = cc.color('#ffffff');
//					if(node instanceof cc.Sprite){
//      				node.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
//      			}
//				});
            	aniPanel.runActions([
            		cc.scaleTo(0.1,aniPanel._defaultScale)
            	]);
            }
        },
        
        bindBTN: function () {
            var me = this;

            if (cc.isNode(me.nodes.btn_py)) {
                me.nodes.btn_py.click(function (sender, type) {
                    G.frame.huodong.data({
                        type: 0
                    }).show();
                });
            }

            //首充按钮

            me.nodes.btn_sc.click(function (sender, type) {
                G.frame.shouchong.show();
            });
            if (P.shouchongfinish) {
                me.nodes.btn_sc.hide();
            } else {
                me.nodes.btn_sc.show();
            }
            // 公告
            // me.nodes.btn_gg.click(function () {
            //     G.frame.gonggao.show();
            // });
            //杂货店
            me.nodes.btn_zhd.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_zhd,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                	me.setTimeout(function(){
                    	G.frame.zahuodian.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            //铁匠铺
            me.nodes.btn_tjp && me.nodes.btn_tjp.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_tjp,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.setTimeout(function(){
                    	G.frame.tiejiangpu.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            me.nodes.btn_xsrw.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_xsrw,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("xuanshangrenwu")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("xuanshangrenwu")) + L("XSRW"));
                        return;
                    }
                    me.setTimeout(function(){
                    	G.frame.xuanshangrenwu.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            me.nodes.btn_fst.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_fst,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("fashita")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("fashita")) + L("FST"));
                        return;
                    }
                    me.setTimeout(function(){
                    	G.frame.julongshendian.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            //许愿池
            me.nodes.btn_xyc.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_xyc,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("xuyuanchi")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("xuyuanchi")) + L("XYC"));
                        return;
                    }
                    me.setTimeout(function(){
                    	G.frame.xuyuanchi.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            me.nodes.btn_sjs.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_sjs,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var condType = 'worldtree';
                    var openLv = G.class.opencond.getLvById(condType);
                    if (P.gud.lv < openLv) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("worldtree")) + L("SJS"));
                        return;
                    }
					
					me.setTimeout(function(){
	                    G.frame.worldtree.show();
	                },100);
                }
            }, null, {"touchDelay":500});

            //英雄祭坛
            me.nodes.panel_yxjt.finds("panel_wz").setTouchEnabled(false);
            me.nodes.btn_yxjt.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_yxjt,type);
                if(type == ccui.Widget.TOUCH_NOMOVE){
                	
                	me.setTimeout(function(){
	                    G.frame.chouka.show();
	                },100);
                }
            }, null, {"touchDelay":500});
            //竞技场
            me.nodes.btn_jjc.touch(function (sender,type) {
            	me._buildClickAni(me.nodes.ani_jjc,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var cond = 'zypkjjc';
                    var isOpen = G.class.opencond.getIsOpenById(cond);
                    if (!isOpen) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("zypkjjc")) + L("JJC"));
                        return;
                    }
					
					me.setTimeout(function(){
	                    G.frame.jingjichang.show();
	                  },100);
                }
            }, null, {"touchDelay":500});

            me.nodes.ani_szjyz.setTouchEnabled(false);
            me.nodes.btn_szjyz.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_szjyz,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("shizijun")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("shizijun")) + L("SZJYZ"));
                        return;
                    }
                    
                    me.setTimeout(function(){
                    	G.frame.shizijunyuanzheng.show();
                    },100);
                }
            }, null, {"touchDelay":500});

            //融合祭坛
            me.nodes.btn_rhjt.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_rhjt,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                	
                	me.setTimeout(function(){
	                    G.frame.yingxiong_hecheng.show();
	                  },100);
                }
            }, null, {"touchDelay":500});

            //祭祀法阵
            me.nodes.btn_jsfz.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_jsfz,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                	
                	me.setTimeout(function(){
	                    G.frame.yingxiong_fenjie.show();
	                  },100);
                }
            }, null, {"touchDelay":500});

            //大秘境
            me.nodes.btn_dmj.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_dmj,type);
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("watcher")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("watcher")) + L("SWZMJ"));
                        return;
                    }
                    me.setTimeout(function(){
                        G.frame.damijing.checkShow();
                    },100);
                }
            }, null, {"touchDelay":500});

            //域外争霸
            me.nodes.btn_zbs.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_zbs,type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if(P.gud.lv < G.class.opencond.getLvById("crosszb")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("crosszb")) + L("WYZB"));
                        return;
                    }
                    me.setTimeout(function(){
                        G.frame.yuwaizhengba.checkShow();
                    },100);
                }
            }, null, {"touchDelay":1000});

            //每日试炼
            me.nodes.btn_mrsl.touch(function (sender, type) {
            	me._buildClickAni(me.nodes.ani_mrsl,type);
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(P.gud.lv < G.class.opencond.getLvById("meirishilian")){
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("meirishilian")) + L("MRSL"));
                        return;
                    }
                    
                    me.setTimeout(function(){
                    	G.frame.meirishilian.show();
                    },100);
                }
            }, null, {"touchDelay":500});
            //聊天
            me.nodes.btn_lt.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.liaotian.show();
                }
            }, null, {"touchDelay":500});

            // 每日任务
            G.class.ani.show({
                json: "ani_xiaotubiao_renwu",
                addTo: me.nodes.btn_mrrw,
                x: me.nodes.btn_mrrw.width / 2,
                y: me.nodes.btn_mrrw.height / 2,
                repeat: true,
                autoRemove: false
            });
            me.nodes.btn_mrrw.click(function (sender, type) {
                G.frame.renwu.data({type: 2}).show();
            }, 500);

            //邮件
            me.nodes.btn_yj.click(function (sender, type) {
                G.frame.youjian.show();
            }, 500);

            //总排行榜
            me.nodes.btn_ph.click(function (sender, type) {
                G.frame.phb_main.show();
            }, 500);

            //神器
            G.class.ani.show({
                json: "ani_xiaotubiao_shenqi",
                addTo: me.ui.finds("btn_sq"),
                x: me.ui.finds("btn_sq").width / 2,
                y: me.ui.finds("btn_sq").height / 2,
                repeat: true,
                autoRemove: false
            });
            if(P.gud.lv < 6) {
                me.ui.finds("btn_sq").hide();
            }
            me.ui.finds("btn_sq").click(function () {
                G.frame.shenqi.checkShow();
            }, 500);

            //充值
            G.class.ani.show({
                json: "ani_xiaotubiao_chongzhi",
                addTo: me.ui.finds("btn_cz"),
                x: me.ui.finds("btn_cz").width / 2,
                y: me.ui.finds("btn_cz").height / 2,
                repeat: true,
                autoRemove: false
            });
            me.ui.finds("btn_cz").click(function () {
                G.frame.chongzhi.show();
            }, 500);

            //充值
            // me.ui.finds('btn_cz').click(function(){
            //     G.frame.chongzhi.show();
            // });
            //好友
            me.nodes.btn_hy.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.friend.show();
                }
            }, null, {"touchDelay":500});
            //设置
            me.nodes.btn_sz.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.setting.show();
                }
            }, null, {"touchDelay":500});
            //限时活动
            me.nodes.btn_xshd.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.hongdian.getHongdian(1, function () {
                        G.frame.huodong.data({type:1}).show();
                    });
                }
            }, null, {"touchDelay":500});
            //精彩活动
            me.nodes.btn_jchd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.huodong.data({
                        type: 0
                    }).show();
                }
            }, null, {"touchDelay":500});
            //次日登陆
            me.nodes.btn_crdl.click(function () {
                G.frame.ciridenglu.show();
            }, 500);
            //每日首充
            me.nodes.xsjl_dh.click(function (sender, type) {
                G.frame.zaixianjiangli.show();
            }, 500);

            me.nodes.btn_xszm.click(function () {
                //限时招募
                G.frame.xianshizhaomu.show();
            }, 500);

            if(G.tiShenIng) {
                me.nodes.panel_xszm.hide();
                me.nodes.panel_vipguizhu.hide();
            }

            G.class.ani.show({
                json: "ani_vipkefu",
                addTo: me.nodes.btn_vipguizhu,
                x: me.nodes.btn_vipguizhu.width / 2,
                y: me.nodes.btn_vipguizhu.height / 2,
                repeat: true,
                autoRemove: false
            });
            me.nodes.btn_vipguizhu.click(function () {
                //vip礼包
                G.frame.viplibao.show();
            }, 500);

            me.nodes.btn_wzds.click(function () {
                G.frame.wangzhediaosu.show();
            });
        },
        fillSize : function(){
            //外框自适应父控件
            this.setContentSize( cc.director.getWinSize() );
            this.ui.setContentSize( this.getContentSize() );
            ccui.helper.doLayout( this.ui );
        },
        bindUI: function(){
            var me = this;
            //设置动画坐标,缩放
            var ani = {
                0:'ani_zhuchengfashita',
                1:'ani_zhuchengjingjichang',
                2:'ani_zhuchengjisifazhen',
                3:'ani_zhuchengronghejitan',
                4:'ani_zhucheng_shutan',
                5:'ani_zhuchengshizijun',
                6:'ani_zhuchengtiejiangpu',
                7:'ani_zhuchengxuanshang',
                8:'ani_zhuchengxuyuanchi',
                9:'ani_zhuchengyingxiongjitan',
                10:'ani_zhuchengzahuodian',
                11:'ani_zhuchengshilian',
                12: "ani_zhuchengyuwaizhengba",
                13: "ani_zhuchengshouwangzemijing",
                14: "ani_zhucheng_yingxiongdiaoxiang"
            };
            var ani_node = {
                0: me.nodes.ani_fst,
                1: me.nodes.ani_jjc,
                2: me.nodes.ani_jsfz,
                3: me.nodes.ani_rhjt,
                4: me.nodes.ani_sjs,
                5: me.nodes.ani_szjyz,
                6: me.nodes.ani_tjp,
                7: me.nodes.ani_xsrw,
                8: me.nodes.ani_xyc,
                9: me.nodes.ani_yxjt,
                10: me.nodes.ani_zhd,
                11: me.nodes.ani_mrsl,
                12: me.nodes.ani_zbs,
                13: me.nodes.ani_dmj,
                14: me.nodes.ani_wzds
            };
            var ani_y = {
                0 : 0,
                1: -30,
                2: -165,
                3: -35,
                4: -50,
                5: -45,
                6: -30,
                7: -30,
                8: -15,
                9: -20,
                10: -50,
                11: -30,
                12: 10,
                13: -60,
                14: 10
            };
            var ani_x = {
                0 : 10,
                1: 0,
                2: 5,
                3: 5,
                4: 10,
                5: 0,
                6: 0,
                7: 8,
                8: 5,
                9: -10,
                10: -10,
                11: 0,
                12: 5,
                13: -150,
                14: 3
            };
            var ani_scale = {
                0 : 0.8,
                1: 0.8,
                2: 0.78,
                3: 0.8,
                4: 0.8,
                5: 0.8,
                6: 0.8,
                7: 0.9,
                8: 0.8,
                9: 0.8,
                10: 0.8,
                11: 0.7,
                12: 0.7,
                13: 0.3,
                14: 1
            };
            for(var i=0; i< 15; i++ ){
                G.class.ani.show({
                    json: ani[i],
                    addTo: ani_node[i],
                    x: ani_node[i].width/2 + ani_x[i],
                    y: ani_node[i].height/2 + ani_y[i],
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.y -= node.height;
                    }
                });
                if(i == 6){
                    ani_node[i].setFlippedX(true);
                }
                ani_node[i].setScale(ani_scale[i]);
                ani_node[i]._defaultScale = ani_scale[i];
            }
            me.BTN_CONF = {
                lefttop:{
                    starPos:{x:248.91670000000002,y:234.91199999999998},
                    offsetX:0,
                    offsetY:90,
                    pos2type:{x:0,y:1}
                },
                righttop:{
                    starPos:{x:580,y:92},
                    offsetX:84,
                    offsetY:84,
                    pos2type:{x:1,y:0}
                },
                rightbottom:{
                    starPos:{x:592,y:288},
                    offsetX:84,
                    offsetY:84,
                    pos2type:{x:0,y:1}
                }
            };
        },

        set_xsjl:function(data){
            var me = this;
            me.nodes.txt_time.removeAllChildren();
            me.nodes.txt_time.show();
            G.removeNewIco(me.nodes.panel_xsjl);
            while (me.nodes.panel_xsjl.getChildByName("prize")) {
                me.nodes.panel_xsjl.getChildByName("prize").removeFromParent();
            }
            var prize = G.class.sitem(data.prize[data.num]);
            prize.setPosition(44, 43);
            prize.setScale(.65);
            prize.setName("prize");
            me.nodes.panel_xsjl.addChild(prize);

            var time = new ccui.Text("", G.defaultFNT, 20);
            time.setAnchorPoint(0.5, 0.5);
            time.setTextColor(cc.color("#2bdf02"));
            X.enableOutline(time, "#000000", 2);
            time.setPosition(me.nodes.txt_time.width / 2 - 3, me.nodes.txt_time.height / 2);
            me.nodes.txt_time.setString("");
            me.nodes.txt_time.setPositionY(-13);
            me.nodes.txt_time.addChild(time);


            me.xsjl = X.timeout(time, data.cd, function () {
                me.nodes.txt_time.hide();
                G.setNewIcoImg(me.nodes.panel_xsjl, .8);
                time.removeFromParent(true);
                G.class.ani.show({
                    json: "ani_waikuang",
                    addTo: prize,
                    x: 51,
                    y: 52,
                    repeat: true,
                    autoRemove: false,
                    onload :function(node,action){
                    }
                });
            })
        },

        onOpen: function () {
            var me = this;
            G.DATA.hongdian = {
                artifact: 0,
                chongzhiandlibao: {meiribx: 0, meirisd: 0},
                crosszbjifen: 0,
                dailytask: 0,
                dengjiprize: 0,
                dianjin: 0,
                email: 0,
                fashita: 0,
                friend: 0,
                gonghui: 0,
                guajitime: 0,
                hecheng: 0,
                herojitan: 0,
                huodong: 0,
                jitianfanli: 0,
                kfkh: {},
                leijichongzhi: 0,
                meirishouchong: 0,
                monthfund: {170: {}, 180: {}},
                mrsl: 0,
                shizijun: 0,
                shouchonghaoli: {},
                sign: 0,
                succtask: 0,
                tanxian: 0,
                treature: 0,
                watcher: {trader: 0, target: 0},
                worship: 0,
                yueka_da: 0,
                yueka_xiao: 0,
                zhouchanghuodong: 0,
            };
            G.DATA.chatRedPoint = 0; // 聊天数字红点计数
            me.allBtns = {};
            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.ui.finds("panel_left"));
            //me.nodes.scrollview.setBounceEnabled(false);
            if(!cc.isNode(G.view.toper)){
                new G.class.toper();
                cc.director.getRunningScene().addChild( G.view.toper );
            }
            if(!cc.isNode(G.view.mainMenu)){
                new G.class.mainMenu();
                cc.director.getRunningScene().addChild( G.view.mainMenu );
            }
            me.nodes.scrollview.jumpToPercentHorizontal(50);
            me.bindBTN();
            me.bindUI();
            me.fillSize();
            me.checkUnlock(); // 建筑解锁
            me.ui.setTimeout(function(){
                G.event.emit('loginOver');
            },200);
            // G.event.onnp('loginOver',function () {
            //     me.ui.setTimeout(function(){
            //         me.nodes.panel_sc.hide();
            //         me.nodes.panel_sc.removeAllChildren();
            //         if (P.gud.shouchong == 1) {
            //             G.class.ani.show({
            //                 json:'huodong_shouchong',
            //                 addTo:me.nodes.panel_sc,
            //                 repeat:true,
            //                 autoRemove:false
            //             });
            //             G.view.mainView.addBtn('righttop', me.nodes.panel_sc, 0);
            //         } else {
            //             // G.frame.shouchong.checkShow();
            //         }
            //         G.frame.gonggao.checkShow(function () {});
            //     },200);
            // });
            me.nodes.panel_back.setSwallowTouches(false);
            me.nodes.panel_front.setSwallowTouches(false);
            me.ui.finds('panel_city').finds('panel_mild2').setSwallowTouches(false);
            me.ui.finds('panel_city').finds('panel_mild').setSwallowTouches(false);
            me.bindMove();
        },
        checkUnlock: function(){
            var me = this;
            var functionName = ["xyc", "jjc", "mrsl", "fst", "sjs", "xsrw", "szjyz", "zbs", "dmj"];
            var openLv = ["xuyuanchi", "zypkjjc", "meirishilian", "fashita", "worldtree", "xuanshangrenwu", "shizijun", "crosszb", "watcher"];
            for(var i = 0; i < openLv.length; i ++){
                var target = me.nodes["panel_" + functionName[i]] || me.ui.finds("panel_" + functionName[i]);
                var open = G.class.opencond.getLvById(openLv[i]);
                if(P.gud.lv < open){
                    if(G.tiShenIng){
                        target.finds("bg_wz").loadTexture("img/main2/bg_gonghui_bq.png");
                        target.hide();
                    }else{
                        target.finds("bg_wz").loadTexture("img/mainmenu/bg_gonghui_bqhui.png", 1);
                    }
                    target.finds("img_wz").hide();
                    var text = new ccui.Text(X.STR(L("XJKQ"), open), G.defaultFNT, 21);
                    text.setTextColor(cc.color("#979797"));
                    X.enableOutline(text, "#3b3831", 1);
                    text.setName("JKQ");
                    text.setAnchorPoint(0.5, 0.5);
                    text.setPosition(target.finds("img_wz").getPosition());
                    target.finds("panel_wz").addChild(text);
                }else{
                    while (target.finds("panel_wz").getChildByName("JKQ")) {
                        target.finds("panel_wz").getChildByName("JKQ").removeFromParent();
                    }
                    target.finds("img_wz").show();

                    if(G.tiShenIng){
                        target.finds("bg_wz").loadTexture("img/main2/bg_gonghui_bq.png");
                        target.show();
                    }else{
                        target.finds("bg_wz").loadTexture("img/mainmenu/bg_gonghui_bq.png", 1);
                    }
                }
            }
        },
        //处理login时的按钮数据
        doLoginBtnData: function () {
            var me = this;

            // var data = G.loginAllData;
        },
        //设置服务器传输的按钮数据
        setSvrBtns: function () {
            var me = this;

            var data = G.DATA.asyncBtnsData;
            var panel = me.ui.finds("panel_event");
            var btnsConf = G.gc.btnsConf;
            while (panel.getChildByName("shouchong")) {
                panel.getChildByName("shouchong").removeFromParent();
            }
            while (panel.getChildByName("kaifukuanghuan")) {
                panel.getChildByName("kaifukuanghuan").removeFromParent();
            }
            while (panel.getChildByName("xianshilibao")) {
                panel.getChildByName("xianshilibao").removeFromParent();
            }
            while (panel.getChildByName("yuejijin")) {
                panel.getChildByName("yuejijin").removeFromParent();
            }
            while (panel.getChildByName("meirishouchong")) {
                panel.getChildByName("meirishouchong").removeFromParent();
            }
            var keys = X.keysOfObject(data);
            keys.sort(function (a, b) {
                return a.substr(0, 1) < b.substr(0, 1) ? -1 : 1;
            });


            for (var i in keys) {
                var key = keys[i];
                var btnData = data[key];
                var btnCnf = btnsConf[key];
                if (!btnCnf) {
                    console.log('不存在该配置======', key);
                    continue;
                }
                if(btnData < 1 || btnData.act < 1 || btnData.length < 1){
                    if(key == "meirishouchong") {

                    }else {
                        continue;
                    }
                }

                if(key == "meirishouchong") {
                    if(btnData[0] && btnData[0].receive) continue;
                }

                var obj = {};
                cc.mixin(obj,btnCnf,true);
                cc.mixin(obj,btnData,true);

                // var btn = me.nodes.btn_mrrw.clone();
                obj.btnname = key;
                var istime = true;
                if (key == 'yuejijin'){
                    if (btnData[0] && !btnData[0].showtime && btnData[1] && !btnData[1].showtime){
                        istime = false;
                    }
                }
                if(X.inArray(["meirishouchong"], key)) istime = false;
                console.log('obj======', obj);
                //需要等ui将list设计好
                var btn = G.class.shdbtn(obj, null, null, null, istime ? btnData:1);
                btn.setAnchorPoint(0.5, 0.5);
                panel.addChild(btn);
                me.addBtn(btnCnf.parent,btn,1);
                var cb = btnCnf.callback;
                cb && cb(btn.finds("btn"));
            }
        },
        // hideUI : function(){
        //     //隐藏UI 用于新手指引时
        //     var me = this;
        //     cc.each(me._uiBtns||[],function(name){
        //         var node = me.ui.finds(name);
        //         if(cc.sys.isObjectValid(node) && node.__oldvisible==null){
        //             if (node.getName() == 'Button_shouchong') node.visible = true;
        //             node.__oldvisible = node.visible;
        //             node.hide();
        //         }
        //     });
        // },
        // resetUI : function(){
        //     var me = this;
        //     cc.each(me._uiBtns || [],function(name){
        //         var node = me.ui.finds(name);
        //         if(cc.sys.isObjectValid(node) && node.__oldvisible!=null){
        //             node.visible = node.__oldvisible;
        //             delete node.__oldvisible;
        //         }
        //     });
        // },
        //更新按钮位置
        updateBtnsPos: function (posType,isNoShow) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];

            var winsHeight = me.nodes;

            var arr = me.allBtns[posType];
            for (var i = 0; i < arr.length; i++) {
                var btn = arr[i];
                var hei = 0;
                var x = me.BTN_CONF[posType].starPos.x - (i + 1) * me.BTN_CONF[posType].offsetX * me.BTN_CONF[posType].pos2type.x + 3;
                var y = me.BTN_CONF[posType].starPos.y - i * me.BTN_CONF[posType].offsetY;
                btn.setPosition(cc.p(x - 40,y - 30));
                if (!isNoShow) {
                    btn.show();
                }
            }



        },
        //添加按钮
        addBtn: function (posType,btn, idx,isNoShow) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];
            if (X.arrayFind(me.allBtns[posType], btn.name, 'name') != -1) return;


            if (idx == 0) {
                me.allBtns[posType].unshift(btn);
            } else {
                me.allBtns[posType].push(btn);
            }

            me.updateBtnsPos(posType,isNoShow);
        },
        //某按钮是否正在显示
        isBtnShow: function (posType,btn) {
            var me = this;

            var isShow = false;
            if (X.arrayFind(me.allBtns[posType], btn.name, 'name')  > -1) {
                isShow = true;
            }

            return isShow;
        },
        //移除按钮
        removeBtn: function (posType,btn,isReload) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];

            var idx = X.arrayFind(me.allBtns[posType],btn.name,'name');
            if (idx != -1) {
                btn.hide();
                me.allBtns[posType].splice(idx, 1);
            }

            if (isReload) {
                me.updateBtnsPos(posType);
            }
        },
        onShow: function(){
            var me = this;
            X.audio.playMusic("sound/city.mp3", true);
            me.doLoginBtnData();
            me.action.play("in", false);
            me.action.play("wait", true);

            me.ui.hide();
            me.setTimeout(function(){
                me.ui.show();
                G.event.emit('mainViewShow');

                if(G.tiShenIng){
                    //如果是特殊提审服的话，直接随机打开一个界面
                    var __randVal = X.rand(1,4);
                    if(__randVal==1){
                        G.frame.shenqi.checkShow();
                    }else if(__randVal==2){
                        G.frame.tanxian.show();
                    }else if(__randVal==3){
                        G.frame.chongzhi.show();
                    }else if(__randVal==4){
                        G.frame.chouka.show();
                    }
                }
            },10);

            if(G.tiShenIng){
                me.finds('panel_left').hide();
                me.nodes.btn_yxjt.show();
                me.nodes.btn_rhjt.show();
                me.nodes.btn_zhd.show();

                me.ui.finds('bg_zhucheng_1').hide();
                me.ui.finds('panel_back2').hide();
                me.ui.finds('panel_back$').hide();
                me.ui.finds('panel_mild2').hide();
                me.ui.finds('panel_mild').hide();
                me.ui.finds('panel_front$').hide();

            }
            me.checkVip();
            me.checkWZDX();
        },
        checkVip: function() {
            var me = this;
            if(G.gameconfig.DATA["vipconfig_" + (G.owner || "")] && G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v) {
                money = parseInt(G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v.split(",")[0]);
                if(P.gud.payexp / 10 >= money) me.nodes.panel_vipguizhu.show();
                else me.nodes.panel_vipguizhu.hide();
            }else {
                me.nodes.panel_vipguizhu.hide()
            }
        },
        checkWZDX: function() {
            var me = this;

            if(G.time < G.OPENTIME + 24 * 3600 * 7) {
                me.nodes.btn_wzds.setTouchEnabled(false);
                me.nodes.panel_wzds.finds("panel_wz").hide();
            }
        },
        onRemove: function () {
            var me = this;
            delete G.view.mainView;
            G.event.removeListener('fullScreenChange',me.fullScreenChange);
        },
        bindMove : function(){
            if(G.tiShenIng)return;

            var me = this;
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();

            scrollview.setSwallowTouches(false);
            scrollview.setBounceEnabled(true);
            scrollview.innerWidth -= 450;

//          scrollview.addCCSEventListener(function(sender,type) {
//              if (type === ccui.ScrollView.EVENT_SCROLLING) {
//                  me.setMax();
//              }
//          });

            var img0_1 = me.ui.finds('bg_zhucheng'),
                img0_2 = me.ui.finds('bg_zhucheng_1'),
                img0_3 = me.ui.finds('panel_back2'),
                img1 = me.nodes.panel_back,
                img1_0 = me.ui.finds('panel_mild2'),

                img2 = me.nodes.panel_city,

                // img2_0 = me.ui.finds('cloud'),
                // img2_1 = me.ui.finds('cloud5'),
                

                img3 = me.nodes.panel_front,
                img4 = me.ui.finds('img_city_you');
            // var img2_0_x = img2_0.x - this.x,
            //     img2_1_x = img2_1.x - this.x;


            //img2.x = -me.extConf.city.maxContleft;
			
            innerContent.update = function(dt){
                // [0,-1350]
                me.setMax();
				var myx = this.x-200;
				img0_1.x = myx*0.58;
				img0_2.x = myx*0.9;
				img0_3.x = myx*0.7;
				img1.x = myx*0.90;
				img1_0.x = myx*0.9;

                // img2_0.x = (this.x + img2_0_x);
                // img2_1.x = (this.x + img2_1_x);
				img3.x = myx*1.6;
				img4 = myx*1.4;
            };
            innerContent.scheduleUpdate();
        },
        setMax: function () {
            var me = this;
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();
            if(innerContent.x> me.extConf.city.maxContleft ){
                innerContent.x = me.extConf.city.maxContleft;
            }else if(innerContent.x < me.extConf.city.maxContRight){
                innerContent.x = me.extConf.city.maxContRight;
            }
        },
        scrollToBuild: function (name) {
            var me = this;
            //if(me.tishen())return;

            var build = me.nodes[name];
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();
            
            var x = build.getParent().x+build.getParent().width*0.5;
            if(name=='btn_yxjt'){
            	//英雄祭坛
            	//x+=400; //多层级关系，这里需要适量修正
            }
            if(name == "btn_xsrw") {
                x += 300; //按钮会被活动按钮遮住
            }
            var p = ( x - scrollview.width) / (innerContent.width - scrollview.width) * 100;
           
            cc.sys.isNative && scrollview.scrollToPercentHorizontal(p,0,true);
            me.ui.setTimeout(function () {
                me.setMax();
                me.ui.setTimeout(function () {
                	G.guidevent.emit('scrollToBuildOver');
                },200);
            },1);

        },
        //获得异步按钮数据
        getAysncBtnsData: function (callback, is, key) {
            var me = this;
            var val = key || 1;
            if(G.tiShenIng){
                me.nodes.panel_ciridenglu.hide();
                me.nodes.panel_jchd.hide();
                me.nodes.panel_xshd.hide();
                me.ui.finds('panel_mrsc').hide();
                return;
            }

            G.ajax.send('getayncbtn',[val],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    if(val != 1) {
                        for(var i in d.d) {
                            G.DATA.asyncBtnsData[i] = d.d[i];
                        }
                    }else {
                        G.DATA.asyncBtnsData = d.d;
                    }
                    if(G.DATA.asyncBtnsData.onlineprize == 1){
                        me.nodes.panel_xsjl.show();
                        me.nodes.xsjl_dh.show();
                        if(is == false){

                        }else{
                            G.class.ani.show({
                                json:'ani_xinshoulingqu',
                                addTo:me.nodes.xsjl_dh,
                                y:0,
                                repeat:false,
                                autoRemove:false,
                                onload : function (node, action) {
                                    action.play("changtai", true);
                                    node.hide();
                                    me.lingqu_node = node;
                                    me.lingqu_act = action;
                                    G.ajax.send("onlineprize_open", [], function (data) {
                                        if (!data) return;
                                        var data = JSON.parse(data);
                                        if (data.s == 1) {
                                            me.set_xsjl(data.d);
                                        }
                                    })

                                }
                            });
                        }

                    }else{
                        me.nodes.panel_xsjl.hide();
                        me.nodes.xsjl_dh.hide();
                    }

                    if(G.DATA.asyncBtnsData.ciridenglu && G.DATA.asyncBtnsData.ciridenglu.time > G.time && G.DATA.asyncBtnsData.ciridenglu.gotarr && G.DATA.asyncBtnsData.ciridenglu.gotarr.length < 4) {
                        me.nodes.panel_ciridenglu.show();
                        me.setCRDL(G.DATA.asyncBtnsData.ciridenglu);
                    }else {
                        me.nodes.panel_ciridenglu.hide();
                        me.nodes.panel_xszm.setPosition(me.nodes.panel_ciridenglu.getPosition());

                    }

                    if(G.DATA.asyncBtnsData.xianshi_zhaomu > 0) {
                        me.nodes.panel_xszm.show();
                        me.setXSZM();
                    } else {
                        me.nodes.panel_xszm.hide();
                    }

                    if(!me.nodes.panel_ciridenglu.visible) {
                        if(!me.nodes.panel_xszm.visible) {
                            me.nodes.panel_vipguizhu.setPosition(me.nodes.panel_ciridenglu.getPosition())
                        } else {
                            me.nodes.panel_vipguizhu.setPosition(-85.6, 251.7);
                        }
                    } else {
                        if(!me.nodes.panel_xszm.visible) {
                            me.nodes.panel_vipguizhu.setPosition(-85.6, 251.7);
                        }
                    }

                    me.nodes.txt_wzds.setString(G.DATA.asyncBtnsData.kingstatue);

					/*
                    if(d.d.xianshihuodong.length == 0){
                        me.nodes.panel_xshd.hide();
                    }else{
                        me.nodes.panel_xshd.show();
                    }
					*/
					//正常外网运营的区，极低可能性没有活动，如果都没有活动了，玩家打开一个空界面也没啥影响
					me.nodes.panel_xshd.show();

                    callback && callback();
                }
            });
        },
        setCRDL: function (data) {
            var me = this;
            me.nodes.panel_ciridenglu.finds("wz_djs").show();
            X.timeout(me.nodes.panel_ciridenglu.finds("wz_djs"), data.time, function () {
                me.getAysncBtnsData()
            });
        },
        setXSZM: function () {
            var me = this;
            me.nodes.panel_xszm.finds("wz_djs").show();

            if(G.DATA.asyncBtnsData.xianshi_zhaomu - G.time > 24 * 3600) {
                me.nodes.panel_xszm.finds("wz_djs").setString(X.moment(G.DATA.asyncBtnsData.xianshi_zhaomu - G.time));
            } else {
                X.timeout(me.nodes.panel_xszm.finds("wz_djs"), G.DATA.asyncBtnsData.xianshi_zhaomu, function () {
                    me.nodes.panel_xszm.hide();
                });
            }

        }
    });

    //start
})();