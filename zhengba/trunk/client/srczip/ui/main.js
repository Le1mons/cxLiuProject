/**
 * Created by zhangming on 2017-12-21
 */

G.event.on("gift_package", function (d) {
    d = JSON.parse(d);
    if (!d.type) return;
    G.view.mainView.getAysncBtnsData(function () {
        G.view.mainView.allBtns["lefttop"] = [];
        G.view.mainView.setSvrBtns();

        function f() {
            G.frame.xslb.once("willClose", function () {
                G.view.mainView.getAysncBtnsData(function () {
                    G.view.mainView.allBtns["lefttop"] = [];
                    G.view.mainView.setSvrBtns();
                }, false, ["xianshilibao"]);
            }).data(d).show();
        }
        G.event.once("showPackage", function () {
            f();
        });
        if (d.type == "tianshulibao") {
            G.event.emit("showPackage");
        }

    }, false, ["xianshilibao"]);
});

G.event.on("vipChange", function () {
    cc.director.getRunningScene().setTimeout(function () {
        G.view.mainView.checkVip();
    }, 500);
});

G.event.on("uiChange", function (data) {
    if (data.act == "remove") {
        X.audio.stopEffectByType("hero");
    }
});

(function () {
    G.class.mainView = X.bView.extend({
        extConf: {
            city: {
                'maxContleft': 200,
                'maxContRight': -900
            },
            BTN_CONF: {
                righttop: {
                    starPos: { x: 495, y: 121 },
                    offset: { x: -85, y: 0 },
                },
                rightbottom: {
                    starPos: { x: 251, y: 0 },
                    offset: { x: 0, y: -119 },
                }
            }
        },
        ctor: function () {
            var me = this;
            G.view.mainView = me;
            G.event.on('fullScreenChange', me.fullScreenChange, me);

            if (G.tiShenIng) {
                me._super('main_2.json', null, { action: true });
            } else if (G.isHuaWei) {
                me._super('main_3.json', null, { action: true });
            } else {
                me._super('main.json', null, { action: true });
            }
        },
        fullScreenChange: function (topUI) {
            if (topUI != null) {
                cc.log('mainView 自动隐藏 when fullScreenChange');
                if (!G.frame.tanxianFight.isShow && G.frame.tanxianFight.zIndex > 0) this.hide();
                this.event.emit('visiableChangeByFullScreen');
            } else {
                cc.log('mainView 自动显示 when fullScreenChange');
                this.show();
                this.event.emit('visiableChangeByFullScreen');
                //设置底部按钮动画
                cc.director.getRunningScene().setTimeout(function () {
                    G.guidevent.emit("zhucheng_aniOver");
                }, 200);
                G.view.mainMenu.set_fhzc(3);
                this.addTJPAni();
                G.DATA.music = undefined;
                X.audio.playMusic("sound/city.mp3", true);

                if (Object.keys(G.openingFrame).length == 0) {
                    G.class.releaseSkillAni();
                    //X.spine.clearAllCache();

                    var arr = [
                        'zhandou', 'gonghui', 'fuwuqi', 'baoshishengji123', 'mijing', 'gonghui4', 'gonghui5', 'gonghui6', 'tanxian', 'xianshizhaomu', 'xuanshangrenwu',
                        'yingxiongjuanzhou', 'youjian', 'yuejijin', 'zahuodian', 'ztl', 'tanxian', 'shilian', 'shijieshu', 'shouchong', 'pifu', 'meirishouchong', 'mojingzhihuan',
                        'jiban', 'ani_shijieshu3', 'ani_shijieshu2', 'img_sdzl_qxbg2', 'ani_shijieshu5', 'shangdian', 'shangdian2',
                        'ani_yuwaizhengba_changjing', 'ani_yuwaizhenhba_shuaxin', 'ani_jisifazhen', 'ani_shenbing_peidaitexiao03', 'ani_zhihuanyinxiong',
                        'ani_xuyuanchi_10', 'ani_xuyuanchi_15', 'ani_xuyuanchi_12', 'ani_xuyuanchi_11', 'ani_xuyuanchi_9', 'ani_shendianmigong_ty', 'ani_shenchong_shuijing2_dh',
                        'ani_shenchong_shuijing3_dh', 'ani_mijing_shanguang', 'scsj1', 'ani_shenchong_bg_dh', 'ani_shenchong_fuhua2_dh', 'scsj', 'ani_yingxiongzhihuan_xin',
                        'ani_zhihuanyinxionghecheng', 'ani_yingxionghuijuan_shuga', 'ani_yingxionghuijuan_shuzr', 'ani_yingxionghuijuan_aoshu2', 'ani_yingxionghuijuan_shusw',
                        'ani_yingxionghuijuan_shuxn', 'ani_yingxionghuijuan_shusw2', 'ani_xuyuanchi_13', 'ani_yuwaizhengba_jjc', 'ani_diaowen_jinglian02',
                        'diaowen', 'ani_xuyuanchi_7', 'ani_xuyuanchi_4', 'ani_3yinxiong1', 'ck_gz_ht', 'ani_chouka_chongji', 'ani_chouka', 'ani_yingxionghuijuan_shuas',
                        'ani_fanpaidonghua', 'ani_xuyuanchi_5', 'ani_3guo_chengchi', 'ani_boss_dh01', 'ani_boss_dh02', 'ani_boss_dh03', 'buff', 'zhenfa',
                        'ani_shenbing_shengji', 'zhandou2', 'xinshouyindao', 'zhuangbei', 'yuanzheng', 'jingbi', 'tanxian_xz_tx', 'tanxian2', 'jiesuojianzhu', 'yumao', 'ani_tanxian_siwang',
                        'ani_tiaozhan', 'ani_xiaotubiao_renwu', 'ani_jiesuoxinwanfa', 'ani_huangguan'

                    ];
                    cc.each(arr, function (name) {
                        X.releaseResources(name);
                    });
                    X.releaseTexture([
                        'img/bg/bg_gonghui.jpg', 'img/bg/bg_gonghui.jpg', 'img/bg/img_scsj_bg.jpg', 'img/bg/img_scsj_tq_bg.jpg', 'img/bg/img_juewei_bg.jpg',
                        'img/bg/duanzao_rukou.jpg', 'img/bg/bg_butu.jpg', 'img/bg/bg_dwjl.jpg', 'img/bg/bg_duanzhao.jpg', 'img/bg/bg_shilian2.jpg', 'img/bg/bg_shilian3.jpg',
                        'img/bg/bg_shangdian.png', 'img/bg/bg_fzbj.png', 'img/bg/bg_shilianhei.png', 'img/bg/bg_zbsbg.png', 'img/bg/bg_xuyuanchi.png', 'img/bg/scsj_bg1.jpg',
                        'img/bg/bg_shijieshu.jpg', 'img/bg/bg_julongfenye1.jpg', 'ani_vip12zhuanshu', 'img/bg/bg_loading1.jpg', 'img/bg/bg_shijieshu_zhyx.jpg',
                        'img/bg/bg_yxjz.png', 'img/bg/bg_chouka.png', 'img/bg/bg_tip_3.png', 'img/bg/bg_tip_4.png', 'img/bg/bg_sdmw2.png', 'img/bg/bg_zhandou1.png',
                        'img/bg/bg_zhandou2.jpg', 'img/bg/bg_tip_2.png', 'img/bg/bg_wupin.png'
                    ]);
                    for (var index = 1; index < 11; index++) {
                        X.releaseTexture('img/bg/zhandou_' + (index < 10 ? '0' + index : index) + '.jpg');
                        X.releaseResources('ani_tanxian' + index);
                    }
                    for (var index = 1; index < 9; index++) {
                        X.releaseTexture('img/bg/beijing_0' + index + '_q.png');
                        X.releaseTexture('img/bg/beijing_0' + index + '_z.png');
                        X.releaseTexture('img/bg/beijing_0' + index + '_h.png');

                        X.releaseTexture('img/bg/qianjing_0' + index + '.png');
                        X.releaseTexture('img/bg/qianjing_0' + index + '_1.png');
                    }

                    cc.sys.isNative && console.log(cc.textureCache.getCachedTextureInfo());
                }
            }
        },

        //建筑物点击效果
        _buildClickAni: function (aniPanel, type) {
            if (type == ccui.Widget.TOUCH_BEGAN) {
                aniPanel.runActions([
                    cc.scaleTo(0.1, aniPanel._defaultScale - 0.03)
                ]);
            } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                aniPanel.runActions([
                    cc.scaleTo(0.1, aniPanel._defaultScale)
                ]);
            }
        },

        bindBTN: function () {
            var me = this;

            me.setTouchEnabled(true);

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

            //杂货店
            me.nodes.btn_zhd.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_zhd, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.setTimeout(function () {
                        G.frame.shopmain.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            //铁匠铺
            me.nodes.btn_tjp && me.nodes.btn_tjp.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_tjp, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.setTimeout(function () {
                        G.frame.duanzaofang.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            me.nodes.btn_xsrw.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_xsrw, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (P.gud.lv < G.class.opencond.getLvById("xuanshangrenwu")) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("xuanshangrenwu")) + L("XSRW"));
                        return;
                    }
                    me.setTimeout(function () {
                        G.frame.xuanshangrenwu.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            me.nodes.btn_fst.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_fst, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (P.gud.lv < G.class.opencond.getLvById("meirishilian")) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("meirishilian")) + L("FST"));
                        return;
                    }
                    me.setTimeout(function () {
                        G.frame.julongshendian.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            //许愿池
            me.nodes.btn_xyc.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_xyc, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (P.gud.lv < G.class.opencond.getLvById("xuyuanchi")) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("xuyuanchi")) + L("XYC"));
                        return;
                    }
                    me.setTimeout(function () {
                        G.frame.xuyuanchi.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            me.nodes.btn_sjs.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_sjs, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var condType = 'worldtree';
                    var openLv = G.class.opencond.getLvById(condType);
                    if (P.gud.lv < openLv) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("worldtree")) + L("SJS"));
                        return;
                    }

                    me.setTimeout(function () {
                        G.frame.worldtree.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            //英雄祭坛
            me.nodes.panel_yxjt.finds("panel_wz").setTouchEnabled(false);
            me.nodes.btn_yxjt.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_yxjt, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {

                    me.setTimeout(function () {
                        G.frame.chouka.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });
            //竞技场
            me.nodes.btn_jjc.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_jjc, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    var cond = 'zypkjjc';
                    var isOpen = G.class.opencond.getIsOpenById(cond);
                    if (!isOpen) {
                        G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("zypkjjc")) + L("JJC"));
                        return;
                    }

                    me.setTimeout(function () {
                        G.frame.jingjichang.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            //灵魂祭坛
            me.nodes.btn_rhjt.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_rhjt, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {

                    me.setTimeout(function () {
                        G.frame.linghunjitan.show();
                    }, 100);
                }
            }, null, { "touchDelay": 500 });

            //聊天
            me.nodes.btn_lt.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.chat.show();
                }
            }, null, { "touchDelay": 500 });

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
                G.frame.renwu.data({ type: 2 }).show();
            }, 500);

            //邮件
            me.nodes.btn_yj.click(function (sender, type) {
                G.frame.youjian.show();
            }, 500);

            //总排行榜
            if (G.appleDad) me.nodes.btn_ph.hide();
            me.nodes.btn_ph.click(function (sender, type) {
                if (P.gud.lv < G.class.opencond.getLvById("ranklist")) {
                    G.tip_NB.show(X.STR(L("XJKQ"), G.class.opencond.getLvById("ranklist")) + L("ranklist"));
                    return;
                }
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
            if (P.gud.lv < 6) {
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
            me.nodes.btn_hy.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.friend.show();
                }
            }, null, { "touchDelay": 500 });
            //设置
            me.nodes.btn_sz.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.setting.show();
                }
            }, null, { "touchDelay": 500 });
            //限时活动
            me.nodes.btn_xshd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.hongdian.getHongdian(1, function () {
                        G.frame.huodong.data({ type: 1 }).show();
                    });
                }
            }, null, { "touchDelay": 500 });
            //精彩活动
            me.nodes.btn_jchd.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.huodong.data({
                        type: 0
                    }).show();
                }
            }, null, { "touchDelay": 500 });
            //次日登陆
            me.nodes.btn_crdl.click(function () {
                G.frame.yingxiongzhaomu.show();
            }, 500);
            //每日首充
            me.nodes.xsjl_dh.click(function (sender, type) {
                G.frame.zaixianjiangli.show();
            }, 500);

            me.nodes.btn_xszm.click(function () {
                //限时招募
                G.frame.buluozhanqi.show();
            }, 500);

            if (G.tiShenIng) {
                me.nodes.panel_xszm.hide();
                me.nodes.panel_vipguizhu.hide();
                me.nodes.panel_xyc.hide();
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
                var string = G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v;
                // G.owner == 'miquwan'||G.owner == 'miquwansdk'
                if (G.owner.indexOf("miquwan") != -1 ) {
                    G.frame.viplibao3.show();
                }else if (string.split(',').length > 2) {
                    G.frame.viplibao2.show();
                } else {
                    G.frame.viplibao.show();
                }
            }, 500);

            if (G.tiShenIng) return;

            me.nodes.btn_wzds.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_wzds, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.wangzhediaosu.show();
                }

            });

            me.nodes.btn_jsfz.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_jsfz, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    // if (!X.checkIsOpen('juewei')) return G.tip_NB.show("第22天开启爵位功能");
                    G.frame.juewei.show();
                }
            });

            me.nodes.img_shilian_bg.click(function () {
                G.frame.shilianhuodong.show();
            });

            me.nodes.btn_yjxw.click(function () {
                G.frame.yijiexuanwo.show();
                // G.frame.lianhunta.show();
                // X.cacheByUid('showThtRed', 1);
                // G.hongdian.checkLHT();
            });

            if (G.time <= G.OPENTIME + X.getOpenTimeToNight() + 17 * 24 * 3600) {
                me.nodes.panel_scsj.finds("panel_wz").hide();
            }
            me.nodes.btn_scsj.touch(function (sender, type) {
                me._buildClickAni(me.nodes.ani_scsj, type);
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.scsj.show();
                }
            }, null, { "touchDelay": 500 });
        },
        fillSize: function () {
            //外框自适应父控件
            this.setContentSize(cc.director.getWinSize());
            this.ui.setContentSize(this.getContentSize());
            ccui.helper.doLayout(this.ui);
        },
        bindUI: function () {
            var me = this;

            me.nodes.panel_vipguizhu.hide();
            me.nodes.panel_xszm.hide();
            me.nodes.panel_ciridenglu.hide();
            //设置动画坐标,缩放
            var ani = {
                0: 'ani_zhuchengfashita',
                1: 'ani_zhuchengjingjichang',
                // 2:'ani_zhuchengjisifazhen',
                3: 'ani_zhuchengronghejitan',
                4: 'ani_zhucheng_shutan',
                // 5:'ani_zhuchengshizijun',
                6: 'ani_zhuchengtiejiangpu',
                7: 'ani_zhuchengxuanshang',
                8: 'ani_zhuchengxuyuanchi',
                9: 'ani_zhuchengyingxiongjitan',
                10: 'ani_zhuchengzahuodian',
                // 11:'ani_zhuchengshilian',
                // 12: "ani_zhuchengyuwaizhengba",
                // 13: "ani_zhuchengshouwangzemijing",
                14: "ani_zhucheng_yingxiongdiaoxiang",
                15: "ani_zhucheng_juewei",
                16: "ani_shenchong_jianzhu",
                17: 'ani_zhuchenglianhunta',
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
                14: me.nodes.ani_wzds,
                15: me.nodes.ani_jsfz,
                16: me.nodes.ani_scsj,
                17: me.nodes.ani_yjxw
            };
            var ani_y = {
                0: 0,
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
                14: 10,
                15: 10,
                16: 10,
            };
            var ani_x = {
                0: 10,
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
                14: 3,
                15: 3,
                16: 3
            };
            var ani_scale = {
                0: 0.8,
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
                14: 1,
                15: 1,
                16: 1
            };
            for (var i in ani) {
                G.class.ani.show({
                    json: ani[i],
                    addTo: ani_node[i],
                    x: ani_node[i].width / 2 + (ani_x[i] || 0),
                    y: ani_node[i].height / 2 + (ani_y[i] || 0),
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.y -= node.height;
                    }
                });
                if (i == 6) {
                    ani_node[i].setFlippedX(true);
                }
                ani_node[i].setScale(ani_scale[i] || 1);
                ani_node[i]._defaultScale = ani_scale[i] || 1;
            }
            me.BTN_CONF = {
                lefttop: {
                    starPos: { x: 248.91670000000002, y: 234.91199999999998 },
                    offsetX: 0,
                    offsetY: 90,
                    pos2type: { x: 0, y: 1 }
                },
                righttop: {
                    starPos: { x: 580, y: 92 },
                    offsetX: 84,
                    offsetY: 84,
                    pos2type: { x: 1, y: 0 }
                },
                rightbottom: {
                    starPos: { x: 592, y: 288 },
                    offsetX: 84,
                    offsetY: 84,
                    pos2type: { x: 0, y: 1 }
                }
            };
        },

        set_xsjl: function (data) {
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
                    onload: function (node, action) {
                    }
                });
            })
        },

        onOpen: function () {
            var me = this;
            G.DATA.hongdian = {
                artifact: 0,
                chongzhiandlibao: { meiribx: 0, meirisd: 0 },
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
                monthfund: { 170: {}, 180: {} },
                mrsl: 0,
                shizijun: 0,
                shouchonghaoli: {},
                sign: 0,
                succtask: 0,
                tanxian: 0,
                treature: 0,
                watcher: { trader: 0, target: 0 },
                worship: 0,
                yueka_da: 0,
                yueka_xiao: 0,
                zhouchanghuodong: 0,
                jrkh: [],
                title: {},
                return: {}
            };
            G.DATA.asyncBtns = {};
            G.DATA.chatRedPoint = 0; // 聊天数字红点计数
            me.allBtns = {};
            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.ui.finds("panel_left"));
            //me.nodes.scrollview.setBounceEnabled(false);
            if (!cc.isNode(G.view.toper)) {
                new G.class.toper();
                cc.director.getRunningScene().addChild(G.view.toper);
            }
            if (!cc.isNode(G.view.mainMenu)) {
                new G.class.mainMenu();
                cc.director.getRunningScene().addChild(G.view.mainMenu);
            }
            me.nodes.scrollview.jumpToPercentHorizontal(50);
            me.nodes.panel_xszm.hide();
            me.bindBTN();
            me.bindUI();
            me.fillSize();
            me.checkUnlock(); // 建筑解锁
            me.checkYJXW();//异界漩涡
            me.ui.setTimeout(function () {
                G.event.emit('loginOver');
            }, 200);

            me.nodes.panel_back.setSwallowTouches(false);
            me.nodes.panel_front.setSwallowTouches(false);
            me.ui.finds('panel_city').finds('panel_mild2').setSwallowTouches(false);
            me.ui.finds('panel_city').finds('panel_mild').setSwallowTouches(false);
            me.bindMove();


            if (!X.cacheByUid("lastData")) {
                G.event.emit("newDay");
                X.cacheByUid("lastData", G.time);
                X.cacheByUid('showThtRed', 0);
                X.cacheByUid('show_kfkh_bjred', 0);
            } else {
                if (X.getTodayZeroTime() > X.cacheByUid("lastData")) {
                    G.event.emit("newDay");
                    X.cacheByUid("lastData", G.time);
                    X.cacheByUid('showThtRed', 0);
                    X.cacheByUid('show_kfkh_bjred', 0);
                }
            }

            if (G.gc.ifChangeModels()) {
                me.nodes.btn_crdl.loadTextureNormal("img/mainmenu/btn_crdls1.png", 1);
            }
            X.upStarGuide();
        },
        checkYJXW: function () {
            this.nodes.panel_yjxw.setVisible(G.class.opencond.getIsOpenById("yjxw"));
        },
        checkUnlock: function () {
            var me = this;
            me.fistHide = false;
            var functionName = ["xyc", "jjc", "fst", "sjs", "xsrw"];
            var openLv = ["xuyuanchi", "zypkjjc", "meirishilian", "worldtree", "xuanshangrenwu"];
            for (var i = 0; i < openLv.length; i++) {
                var target = me.nodes["panel_" + functionName[i]] || me.ui.finds("panel_" + functionName[i]);
                var open = G.class.opencond.getLvById(openLv[i]);
                if (P.gud.lv < open) {
                    if (G.tiShenIng) {
                        target.finds("bg_wz").loadTexture("img/main2/bg_gonghui_bq.png");
                        target.hide();
                    } else {
                        target.finds("bg_wz").loadTexture("img/mainmenu/bg_gonghui_bqhui.png", 1);
                    }
                    if (!me.fistHide) {
                        target.finds("img_wz").hide();
                        var text = new ccui.Text(X.STR(L("XJKQ"), open), G.defaultFNT, 21);
                        text.setTextColor(cc.color("#979797"));
                        X.enableOutline(text, "#3b3831", 1);
                        text.setName("JKQ");
                        text.setAnchorPoint(0.5, 0.5);
                        text.setPosition(target.finds("img_wz").getPosition());
                        target.finds("panel_wz").addChild(text);
                        target.finds("panel_wz").show();
                        me.fistHide = true;
                    } else {
                        target.finds("panel_wz").hide();
                    }
                } else {
                    while (target.finds("panel_wz").getChildByName("JKQ")) {
                        target.finds("panel_wz").getChildByName("JKQ").removeFromParent();
                    }
                    target.finds("panel_wz").show();
                    target.finds("img_wz").show();

                    if (G.tiShenIng) {
                        target.finds("bg_wz").loadTexture("img/main2/bg_gonghui_bq.png");
                        target.show();
                    } else {
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

            for (var i in G.DATA.asyncBtns) {
                (function (node) {
                    node.removeFromParent(true);
                })(G.DATA.asyncBtns[i]);
            }
            G.DATA.asyncBtns = {};

            var data = G.DATA.asyncBtnsData;
            var panel = me.ui.finds("panel_event");
            var btnsConf = G.gc.btnsConf;
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
                if (btnData < 1 || btnData.act < 1 || btnData.length < 1) {
                    if (key == "meirishouchong" || key == "kaifulibao") {

                    } else {
                        continue;
                    }
                }

                if (key == "meirishouchong") {

                    if ((btnData[0] && btnData[0].receive && btnData[0].receive.length >= 2) || (P.gud.ctime + X.getOpenTimeToNight(P.gud.ctime) + 60 * 60 * 24 * 2) > G.time || P.gud.vip < 1) continue;
                }

                if (key == "kaifulibao") {
                    var daKey = G.DATA.creatToDay = btnData.day;
                    if (!G.gc.kaifulibao[daKey]) continue;
                }
                if (key == 'zslb' && !btnData.act) continue;

                var obj = {};
                cc.mixin(obj, btnCnf, true);
                cc.mixin(obj, btnData, true);

                // var btn = me.nodes.btn_mrrw.clone();
                obj.btnname = key;
                var istime = true;
                if (key == 'yuejijin') {
                    if (btnData[0] && !btnData[0].showtime && btnData[1] && !btnData[1].showtime) {
                        istime = false;
                    }
                }
                if (X.inArray(["meirishouchong", "kaifulibao"], key)) istime = false;
                console.log('obj======', obj);
                //需要等ui将list设计好
                var btn = G.DATA.asyncBtns[key] = G.class.shdbtn(obj, null, null, null,
                    istime ? btnData : (key == "kaifulibao" ? [{ rtime: X.getTodayZeroTime() + 24 * 3600 }] : 1));
                btn.setAnchorPoint(0.5, 0.5);
                panel.addChild(btn);
                me.addBtn(btnCnf.parent, btn, 1);
                var cb = btnCnf.callback;
                cb && cb(btn.finds("btn"));
            }

            G.event.emit("asyncBtnLoadOver");
        },
        //更新按钮位置
        updateBtnsPos: function (posType, isNoShow) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];

            var winsHeight = me.nodes;

            var arr = me.allBtns[posType];
            for (var i = 0; i < arr.length; i++) {
                var btn = arr[i];
                var hei = 0;
                var x = me.BTN_CONF[posType].starPos.x - (i + 1) * me.BTN_CONF[posType].offsetX * me.BTN_CONF[posType].pos2type.x + 3;
                var y = me.BTN_CONF[posType].starPos.y - i * me.BTN_CONF[posType].offsetY;
                btn.setPosition(cc.p(x - 40, y - 30));
                if (!isNoShow) {
                    btn.show();
                }
            }


        },
        //添加按钮
        addBtn: function (posType, btn, idx, isNoShow) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];
            if (X.arrayFind(me.allBtns[posType], btn.name, 'name') != -1) return;


            if (idx == 0) {
                me.allBtns[posType].unshift(btn);
            } else {
                me.allBtns[posType].push(btn);
            }

            me.updateBtnsPos(posType, isNoShow);

        },
        //某按钮是否正在显示
        isBtnShow: function (posType, btn) {
            var me = this;

            var isShow = false;
            if (X.arrayFind(me.allBtns[posType], btn.name, 'name') > -1) {
                isShow = true;
            }

            return isShow;
        },
        //移除按钮
        removeBtn: function (posType, btn, isReload) {
            var me = this;

            me.allBtns[posType] = me.allBtns[posType] || [];

            var idx = X.arrayFind(me.allBtns[posType], btn.name, 'name');
            if (idx != -1) {
                btn.hide();
                me.allBtns[posType].splice(idx, 1);
            }

            if (isReload) {
                me.updateBtnsPos(posType);
            }
        },
        onShow: function () {
            var me = this;
            X.audio.playMusic("sound/city.mp3", true);
            me.doLoginBtnData();
            me.action.play("in", false);
            me.action.play("wait", true);
            cc.sys.isNative && me.nodes.scrollview.scrollToPercentHorizontal(100, 0, false);

            me.ui.setTimeout(function () {
                G.event.emit('mainViewShow');
            }, 50);
            me.checkVip();
            me.checkWZDX();
            me.setOpenTime();
            me.setMainCityAni();
            me.setMainCityBtn();
            me.getMainCityEvent();
            me.showNewChapter();
            me.showSanzounianani();
            me.showZhuchengFengzheng();
            me.showYanHua();
            me.shengdanshu();
            me.setInterval(function () {
                me.updateLeftBtnPos();

            }, 1000);

        },
        updateLeftBtnPos: function () {
            var conf = {
                panel_xsjl: 1,
                panel_dld: 3,
                panel_shilian_ico: 2,
                panel_kaogu: 4,
                panel_2zhounian: 5,
                panel_zhongqiu: 6,
                panel_yuandan: 7,
                panel_yuanxiao: 8,
                panel_xinnian: 9,
                panel_zhishu: 10,
                panel_niudan: 11,
                panel_wuyi: 12,
                panel_duanwu: 13,
                panel_qingdian: 14,
                panel_zsy1: 15,
                panel_jinqiu:16,
                panel_yxyr:17,
                panel_blsl:18,
                panel_sdqx:19,
                panel_cjhd:20,
                panel_xnyx:21,
                panel_xnjc:22,
            };
            var arr = [];
            var me = this;
            var startY = 955;
            cc.each(conf, function (oder, name) {
                if (me.nodes[name].visible) {
                    arr.push(name);
                }
            });
            arr.sort(function (a, b) {
                return conf[a] < conf[b] ? -1 : 1;
            });
            var addY = 0;
            if (X.inArray(arr, 'panel_xsjl') || X.inArray(arr, 'panel_shilian_ico')) addY = 20;
            cc.each(arr, function (name, index) {
                if (name == 'panel_xsjl' || name == 'panel_shilian_ico') {
                    me.nodes[name].y = startY;
                } else {
                    me.nodes[name].y = startY - index * 80 - addY;
                }
            });

        },
        shengdanshu: function () {
            var me = this;
            G.class.ani.show({
                json: 'shengdan_tubiao_dh',
                addTo: me.nodes.panel_sds,
                x: 78,
                y: 58.5,
                repeat: true,
                autoRemove: false,
            });
            me.nodes.panel_sds.setTouchEnabled(true);
            me.nodes.panel_sds.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    // X.audio.playEffect("sound/christmas.mp3");
                    G.ajax.send("christmas_click", [], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.tip_NB.show(L('shengdanjie_txt15'));
                        }
                    });
                }
            }, null, {"touchDelay":1000});
        },
        checkVip: function () {
            var me = this;

            if (G.gameconfig.DATA["vipconfig_" + (G.owner || "")] && G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v) {
                money = parseInt(G.gameconfig.DATA["vipconfig_" + (G.owner || "")].v.split(",")[0]);
                if (P.gud.payexp / 10 >= money) me.nodes.panel_vipguizhu.show();
                else me.nodes.panel_vipguizhu.hide();
            } else {
                me.nodes.panel_vipguizhu.hide()
            }
        },
        checkWZDX: function () {
            var me = this;

            if (G.time < G.OPENTIME + 24 * 3600 * 7) {
                me.nodes.btn_wzds.setTouchEnabled(false);
                me.nodes.panel_wzds.finds("panel_wz").hide();
            }
        },
        onRemove: function () {
            var me = this;
            delete G.view.mainView;
            G.event.removeListener('fullScreenChange', me.fullScreenChange);
        },
        bindMove: function () {
            if (G.tiShenIng) return;

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

            innerContent.update = function (dt) {
                // [0,-1350]
                me.setMax();
                var myx = this.x - 200;
                img0_1.x = myx * 0.58;
                img0_2.x = myx * 0.9;
                img0_3.x = myx * 0.7;
                img1.x = myx * 0.90;
                img1_0.x = myx * 0.9;

                // img2_0.x = (this.x + img2_0_x);
                // img2_1.x = (this.x + img2_1_x);
                img3.x = myx * 1.6;
                img4 = myx * 1.4;
            };
            innerContent.scheduleUpdate();
        },
        setMax: function () {
            var me = this;
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();
            if (innerContent.x > me.extConf.city.maxContleft) {
                innerContent.x = me.extConf.city.maxContleft;
            } else if (innerContent.x < me.extConf.city.maxContRight) {
                innerContent.x = me.extConf.city.maxContRight;
            }
        },
        scrollToBuild: function (name) {
            var me = this;
            //if(me.tishen())return;

            var build = me.nodes[name];
            var scrollview = me.nodes.scrollview,
                innerContent = scrollview.getInnerContainer();

            var x = build.getParent().x + build.getParent().width * 0.5;
            if (name == 'btn_yxjt') {
                //英雄祭坛
                //x+=400; //多层级关系，这里需要适量修正
            }
            if (name == "btn_xsrw") {
                x += 300; //按钮会被活动按钮遮住
            }
            var p = (x - scrollview.width) / (innerContent.width - scrollview.width) * 100;

            cc.sys.isNative && scrollview.scrollToPercentHorizontal(p, 0, true);
            me.ui.setTimeout(function () {
                me.setMax();
                me.ui.setTimeout(function () {
                    G.guidevent.emit('scrollToBuildOver');
                }, 200);
            }, 1);
        },
        //获得异步按钮数据
        getAysncBtnsData: function (callback, is, key) {
            var me = this;
            var val = key || 1;
            if (G.tiShenIng) {
                me.nodes.panel_ciridenglu.hide();
                me.nodes.panel_jchd.hide();
                me.nodes.panel_xshd.hide();
                me.ui.finds('panel_mrsc').hide();
                return;
            }

            G.ajax.send('getayncbtn', [val], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    if (val != 1) {
                        for (var i in d.d) {
                            G.DATA.asyncBtnsData[i] = d.d[i];
                        }
                    } else {
                        G.DATA.asyncBtnsData = d.d;
                    }
                    if (P.gud.lv >= 40) G.DATA.asyncBtnsData.buluozhanqi = 1;
                    G.DATA.asyncBtnsData.xianshi_zhaomu = 0;
                    if (G.DATA.asyncBtnsData.onlineprize == 1) {
                        me.nodes.panel_xsjl.show();
                        me.nodes.xsjl_dh.show();
                        if (is == false) {

                        } else {
                            G.class.ani.show({
                                json: 'ani_xinshoulingqu',
                                addTo: me.nodes.xsjl_dh,
                                y: 0,
                                repeat: false,
                                autoRemove: false,
                                onload: function (node, action) {
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

                    } else {
                        me.nodes.panel_xsjl.hide();
                        me.nodes.xsjl_dh.hide();
                        me.checkKaogu();//限时领奖完成后可出现考古
                    }
                    if (G.DATA.asyncBtnsData.ciridenglu) {
                        me.nodes.panel_ciridenglu.show();
                        // me.setCRDL(G.DATA.asyncBtnsData.ciridenglu);
                    } else {
                        me.nodes.panel_ciridenglu.hide();
                        me.nodes.panel_xszm.setPosition(me.nodes.panel_ciridenglu.getPosition());
                    }

                    if (X.checkIsOpen('blzq')) {
                        me.nodes.panel_xszm.show();
                        me.setXSZM();
                    } else {
                        me.nodes.panel_xszm.hide();
                    }

                    if (!me.nodes.panel_ciridenglu.visible) {
                        if (!me.nodes.panel_xszm.visible) {
                            me.nodes.panel_vipguizhu.setPosition(me.nodes.panel_ciridenglu.getPosition())
                        } else {
                            me.nodes.panel_vipguizhu.setPositionX(-130.5284);
                        }
                    } else {
                        if (!me.nodes.panel_xszm.visible) {
                            me.nodes.panel_vipguizhu.setPositionX(-130.5284);
                        }
                    }

                    me.nodes.txt_wzds.setString(G.DATA.asyncBtnsData.kingstatue);

                    if (G.DATA.asyncBtnsData.crosswz > G.time) {
                        //me.nodes.panel_dld.setPosition(54,855);
                        me.nodes.panel_dld.show();
                        me.nodes.img_xsbg.click(function () {
                            G.frame.wangzherongyao.show();
                        });
                        X.timeout(me.nodes.txt_dld_time, G.DATA.asyncBtnsData.crosswz, function () {
                            me.nodes.panel_dld.hide();
                        });
                    } else {
                        me.nodes.panel_dld.hide();
                    }
                    me.nodes.panel_xshd.show();
                    me.checkSLHD();
                    me.checkKaogu();
                    me.zhouNian();
                    me.checkZQorDouble();
                    me.checkYuanDan();
                    me.checkNewyear3();
                    me.checkJDSD();
                    me.checkYuanXiao();
                    me.checkYuanXiao3();
                    me.checkXinchunjiangchi();
                    me.checkXNHD();
                    me.checkZSJ();
                    me.checkNiuDan();
                    me.checkWuYi();
                    me.checkDuanwu();
                    me.checkHeroreheat();
                    me.checkHerotheme();
                    me.checkChristmas();
                    me.checkXiaqiqingdian(); //夏日庆典
                    me.checkQixi();
                    me.checkZnqyr();
                    me.checkJQHD();
                    me.checkXczf();
                    // me.checkZhongQiu();
                    // me.checkDouble();
                    callback && callback();
                }
            });
        },
        checkXczf:function(){
          var me = this;
            var guideStepInfo = X.cacheByUid('guideStepInfo');
            if(!guideStepInfo){
                if(P.gud && P.gud.lv==1 && P.gud.exp==0 && !X.cacheByUid('jumpGuide')){

                }else {
                    if (G.DATA.asyncBtnsData && G.DATA.asyncBtnsData.newyearwish && G.DATA.asyncBtnsData.newyearwish.act && ! X.cacheByUid('firstLogincjhd')){
                        G.frame.huodong_xczf.show();
                    }
                }
            }
        },
        zhouNian: function () {
            var me = this;
            me.nodes.panel_2zhounian.setVisible(G.DATA.asyncBtnsData.anniversary && P.gud.lv >= 30);
            var btn = me.nodes.img_2zhounian_bg;
            btn.click(function () {
                G.frame.zhounianqing_main.show();
            });
        },
        setCRDL: function (data) {
            var me = this;
            // me.nodes.panel_ciridenglu.finds("wz_djs").show();
            // X.timeout(me.nodes.panel_ciridenglu.finds("wz_djs"), data.time, function () {
            //     me.getAysncBtnsData()
            // });
        },
        setXSZM: function () {
            var me = this;
        },
        setOpenTime: function () {//设置某些功能在开服XX天后开启的时间
            var me = this;
            var conf = G.gc.openSeverTime;

            if (G.OPENTIME >= G.DATA.newSeverOpenTime) {
                for (var i in conf) {
                    var todayZeroTime = X.getTodayZeroTime();
                    var toTime = G.OPENTIME + X.getOpenTimeToNight() + (conf[i].time - 24 * 3600);

                    if (toTime > todayZeroTime) {
                        G.DATA[i] = false;
                    } else {
                        G.DATA[i] = true;
                    }
                }
            } else {
                for (var i in conf) {
                    G.DATA[i] = true;
                }
            }

            var sqConf = {
                openSQTB: {
                    time: 2419200
                },
                openSQJX: {
                    time: 2419200
                }
            };

            if (G.OPENTIME >= 1556899199) {
                for (var i in sqConf) {
                    var todayZeroTime = X.getTodayZeroTime();
                    var toTime = G.OPENTIME + sqConf[i].time;

                    if (toTime - todayZeroTime >= 24 * 3600) {
                        G.DATA[i] = false;
                    } else {
                        G.DATA[i] = true;
                    }
                }
            } else {
                for (var i in sqConf) {
                    G.DATA[i] = true;
                }
            }

            var dfwzConf = {
                openWZDF: {
                    time: 1814400
                },
            };

            if (G.OPENTIME >= 1559664000) {
                for (var i in dfwzConf) {
                    var todayZeroTime = X.getTodayZeroTime();
                    var toTime = G.OPENTIME + dfwzConf[i].time;

                    if (toTime - todayZeroTime >= 24 * 3600) {
                        G.DATA[i] = false;
                    } else {
                        G.DATA[i] = true;
                    }
                }
            } else {
                for (var i in dfwzConf) {
                    G.DATA[i] = true;
                }
            }
        },
        checkSLHD: function () {//试炼活动
            var me = this;
            var btn = me.nodes.panel_shilian_ico;

            if (!X.checkIsOpen("slhd")) return btn.hide();
            if (G.DATA.asyncBtnsData.onlineprize) return btn.hide();

            btn.show();
            me.nodes.img_shilian_bg.loadTexture("img/public/btn_slrk" + X.getSlhdType() + ".png", 1);
            btn.y = G.DATA.asyncBtnsData.crosswz > G.time ? 836 : 945;
            G.frame.shilianhuodong.setEndTime(me.nodes.txt_shilian_time, function () {
                me.checkSLHD();
            });
        },
        checkKaogu: function () {//考古
            var me = this;
            var btn = me.nodes.panel_kaogu;
            if (!X.checkIsOpen('kaogu')) return btn.hide();
            if (G.DATA.asyncBtnsData.onlineprize) return btn.hide();
            btn.show();
            if (G.DATA.asyncBtnsData.yjkg == 0) {
                me.nodes.txt_kaogu_time.setString(L("KAOGU50"));
            } else if (G.DATA.asyncBtnsData.yjkg == 1) {
                me.nodes.txt_kaogu_time.setString(L("KAOGU51"));
            } else {
                me.nodes.txt_kaogu_time.setString(L("KAOGU52"));
            }
            btn.setTouchEnabled(true);
            me.nodes.img_kaogu_bg.setTouchEnabled(false);
            btn.click(function () {
                G.frame.kaogu_main.show();
            })
        },
        checkZQorDouble: function () {
            var me = this;
            if (G.DATA.asyncBtnsData.double11 && G.DATA.asyncBtnsData.double11.act) {
                me.checkDouble();
            } else if (G.DATA.asyncBtnsData.midautumn && G.DATA.asyncBtnsData.midautumn.act && G.DATA.asyncBtnsData.midautumn.data == 'midautumn') {
                me.checkZhongQiu();
            } else {
                me.nodes.panel_zhongqiu.hide();
            }
        },

        checkZhongQiu: function () { // 中秋
            var me = this;
            var btn = me.nodes.panel_zhongqiu;
            btn.show();

            btn.setTouchEnabled(true);
            btn.click(function () {
                G.frame.event_zhongqiu.show();
            });
            me.nodes.img_zhongqiu_bg.setTouchEnabled(false);
        },
        checkJQHD: function () {//十一  金秋活动
            var me = this;
            if (G.DATA.asyncBtnsData.midautumn2 && G.DATA.asyncBtnsData.midautumn2.act) {
                me.nodes.panel_jinqiu.show();
                me.nodes.panel_jinqiu.setTouchEnabled(true);
                me.nodes.panel_jinqiu.click(function (sender) {
                    G.frame.jinqiu_main.show();
                })
            } else {
                me.nodes.panel_jinqiu.hide();
            }
            me.nodes.img_jinqiu_bg.setTouchEnabled(false);
        },
        checkYuanDan: function () {
            var me = this;
            var btn = me.nodes.panel_yuandan;

            if (G.DATA.asyncBtnsData.midautumn && G.DATA.asyncBtnsData.midautumn.act&& G.DATA.asyncBtnsData.midautumn.data == 'newyear') {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.yuandan.show();
                });
                me.nodes.img_yuandan_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        checkNewyear3: function () {
            var me = this;
            var btn = me.nodes.panel_cjhd;

            if (G.DATA.asyncBtnsData.newyear3 && G.DATA.asyncBtnsData.newyear3.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.springfestival.show();
                });
                me.nodes.img_cjhd_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        checkYuanXiao: function () {
            var me = this;
            var btn = me.nodes.panel_yuanxiao;

            if (G.DATA.asyncBtnsData.riddles && G.DATA.asyncBtnsData.riddles.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.yuanxiao.show();
                });
                me.nodes.img_yuanxiao_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        //2022年元宵
        checkYuanXiao3: function () {
            var me = this;
            var btn = me.nodes.panel_xnyx;

            if (G.DATA.asyncBtnsData.yuanxiao3 && G.DATA.asyncBtnsData.yuanxiao3.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.yuanxiao2022.show();
                });
                me.nodes.img_xnyx_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        //新春奖池
        checkXinchunjiangchi: function () {
            var me = this;
            var btn = me.nodes.panel_xnjc;

            if (G.DATA.asyncBtnsData.newyearhongbao && G.DATA.asyncBtnsData.newyearhongbao.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.huodong_xcjc.show();
                });
                me.nodes.img_xnjc_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        checkXNHD: function () {
            var me = this;
            var btn = me.nodes.panel_xinnian;

            if (G.DATA.asyncBtnsData.herohot && G.DATA.asyncBtnsData.herohot.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.xnhd.show();
                });
                me.nodes.img_xinnian_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
            G.frame.xnhd.checkIconState();
        },
        checkZSJ: function () {
            var me = this;
            var btn = me.nodes.panel_zhishu;

            if (G.DATA.asyncBtnsData.planttrees && G.DATA.asyncBtnsData.planttrees.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.zhishujie_main.show();
                });
                me.nodes.img_zhishu_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        checkNiuDan: function () {
            var me = this;
            var btn = me.nodes.panel_niudan;

            if (G.DATA.asyncBtnsData.niudan && G.DATA.asyncBtnsData.niudan.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    btn.firstCheckNumRed = true;
                    G.frame.niudan.show();
                    G.hongdian.checkNiuDan();
                });
                me.nodes.img_niudan_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        checkWuYi: function () {
            var me = this;
            var btn = me.nodes.panel_wuyi;

            if (G.DATA.asyncBtnsData.labour && G.DATA.asyncBtnsData.labour.act) {
                btn.show();
                btn.setTouchEnabled(true);
                btn.click(function () {
                    btn.firstCheckNumRed = true;
                    G.frame.wyhd.show();
                    G.hongdian.checkWuYi();
                });
                me.nodes.img_wuyi_bg.setTouchEnabled(false);
            } else {
                btn.hide();
            }
        },
        //端午节
        checkDuanwu: function () {
            var me = this;
            var btn = me.nodes.panel_duanwu;
            if (G.DATA.asyncBtnsData.longzhou && G.DATA.asyncBtnsData.longzhou.act) {
                btn.show();
                btn.setTouchEnabled(true);
                me.nodes.img_duanwu_bg.setTouchEnabled(false);
                btn.click(function () {
                    G.frame.sailongzhou.show();
                    G.hongdian.checkDuanwu();
                });
            } else {
                btn.hide();
            }
        },
        //部落试炼
        checkHerotheme: function () {
            var me = this;
            var btn = me.nodes.panel_blsl;
            if (G.DATA.asyncBtnsData.herotheme && G.DATA.asyncBtnsData.herotheme.act) {
                btn.show();
                me.nodes.img_blsl_bg.setTouchEnabled(false);
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.yingxiongzhuti.show();
                });
            } else {
                btn.hide();
            }
        },
        //圣诞来袭
        checkChristmas: function () {
            var me = this;
            var btn = me.nodes.panel_sdqx;
            if (G.DATA.asyncBtnsData.christmas && G.DATA.asyncBtnsData.christmas.act) {
                btn.show();
                me.nodes.img_sdqx_bg.setTouchEnabled(false);
                btn.setTouchEnabled(true);
                btn.click(function () {
                    G.frame.shengdanjie.show();
                    G.hongdian.checkHeroreheat();
                });
            } else {
                btn.hide();
            }
        },
        //英雄预热
        checkHeroreheat: function () {
            var me = this;
            var btn = me.nodes.panel_yxyr;
            if (G.DATA.asyncBtnsData.heropreheat && G.DATA.asyncBtnsData.heropreheat.act) {
                btn.show();
                btn.setTouchEnabled(true);
                me.nodes.img_yxyr_bg.setTouchEnabled(false);
                btn.click(function () {
                    G.frame.yingxiongyure.once('close',function(){
                        G.hongdian.checkChristmas();
                    }).show();
                });
            } else {
                btn.hide();
            }
        },
        //夏日庆典
        checkXiaqiqingdian: function () {
            var me = this;
            var btn = me.nodes.panel_qingdian;
            if (G.DATA.asyncBtnsData.xiariqingdian && G.DATA.asyncBtnsData.xiariqingdian.act) {
                btn.show();
                btn.setTouchEnabled(true);
                me.nodes.img_qingdian_bg.setTouchEnabled(false);
                btn.click(function () {
                    G.frame.xiariqingdian.show();
                    // G.hongdian.checkDuanwu();
                });
            } else {
                btn.hide();
            }
        },
        checkQixi: function () {
            var me = this;
            if (G.DATA.asyncBtnsData.qixi && G.DATA.asyncBtnsData.qixi.act) {
                me.nodes.panel_qixi.show();
                me.nodes.panel_zsy1.show();
                me.nodes.panel_qixi.y = 0;
                me.nodes.img_qixi_bg.setTouchEnabled(true);
                me.nodes.img_qixi_bg.click(function () {
                    G.frame.qixi.show();
                    G.hongdian.checkQixi();
                });
            } else {
                me.nodes.panel_zsy1.hide();
                me.nodes.panel_qixi.hide();
            }
        },
        checkZnqyr: function () {
            var me = this;
            if ((G.DATA.asyncBtnsData.zhounian3 && G.DATA.asyncBtnsData.zhounian3.act) ||
                (G.DATA.asyncBtnsData.zhounian_login && G.DATA.asyncBtnsData.zhounian_login.act)
            ) {
                me.nodes.panel_znq.show();
                if (me.nodes.panel_qixi.visible) {
                    me.nodes.panel_znq.y = -110;
                } else {
                    me.nodes.panel_znq.y = -10;
                }
                me.nodes.panel_znq.setTouchEnabled(true);
                me.nodes.panel_znq.removeAllChildren();
                X.spine.show({
                    json: 'spine/btn_znq_dh.json',
                    addTo: me.nodes.panel_znq,
                    x: me.nodes.panel_znq.width / 2,
                    y: me.nodes.panel_znq.height / 2,
                    autoRemove: false,
                    onload: function (node) {
                        if(G.DATA.asyncBtnsData.zhounian3 && G.DATA.asyncBtnsData.zhounian3.act){
                            node.runAni(0, "wait", true);
                        }else{

                            node.runAni(0, "wait2", true);
                        }

                    }
                });
                me.nodes.panel_znq.click(function () {
                    if (G.DATA.asyncBtnsData.zhounian_login && G.DATA.asyncBtnsData.zhounian_login.act) {
                        G.frame.huodong_znqyr.show();
                    } else {

                        G.frame.szn_main.once("close", function () {
                            G.hongdian.getData("zhounian3", 1, function () {
                                G.hongdian.checkzn3();
                            });
                        }).show();
                    }

                });
            } else {
                me.nodes.panel_znq.hide();
            }
        },
        showSanzounianani: function () {
            var me = this;
            var arr  = ["3zn_dg_dx","3zn_lihe_dx","3zn_qq1_dx","3zn_qq2_dx","3zn_qq3_dx","3zn_qq4_dx"] 
            arr.forEach(function name(item,idx) {
                G.class.ani.show({
                    json: item,
                    addTo: me.nodes[item],
                    repeat: true,
                    autoRemove: false,
                    uniqueid: true,
                    onload: function (_node, action) {
                       
                    }
                });
            })
        },
        showZhuchengFengzheng: function () {
            var me = this;
            var node  = me.ui.finds('bg_city_fz');
            node.setTouchEnabled(false);
            X.spine.show({
                json:'spine/zhucheng_fz.json',
                addTo : node,
                repeat:true,
                x:0,
                y:-10,
                autoRemove:false,
                onload : function(node){
                    node.runAni(0, "wait", true);
                }
            });
        },
        showYanHua: function () {
            var me = this;
            if(!cc.sys.isNative)return
            var arr  = ["3zn_ziyh_dx","3zn_hongyh_dx","3zn_lanyh_dx","3zn_lvyh_dx"];
            var time = [500,100,1500,2000];
            var nodeConf = {
                0:[1,2,3],
                1:[1,2],
                2:[1,2,3],
                3:[1,2,3],
            }
            var idx = parseInt( Math.random()*4);
            arr.forEach(function(item,idx){
                var nodestr = item + "_" + X.arrayRand(nodeConf[idx]);
                if(!cc.isNode(me.nodes[nodestr]))debugger
                G.class.ani.show({
                    json: item,
                    addTo: me.nodes[nodestr],
                    repeat: false,
                    autoRemove: true,
                    cache:true,
                    onload: function (_node, action) {
                       
                    }
                });
            })
            me.ui.setTimeout(function(){
                me.showYanHua()
            },time[idx])
        },
        //双十一
        checkDouble: function () {
            var me = this;
            var btn = me.nodes.panel_zhongqiu;
            btn.show();
            me.nodes.img_zhongqiu_bg.loadTexture('img/mainmenu/btn_double11.png', 1);
            btn.setTouchEnabled(true);
            btn.click(function () {
                G.frame.Double11.show()
            });
            me.nodes.img_zhongqiu_bg.setTouchEnabled(false);
        },
        //新的章节
        showNewChapter: function () {
            var me = this;
            if (X.cacheByUid("newchapter") && X.cacheByUid("newchapter").time != X.timetostr(G.time, "y-m-d")) {
                //第二天了状态重置
                var data = {};
                data.time = X.timetostr(G.time, "y-m-d");
                data.state = 0;
                X.cacheByUid("newchapter", data);
            }
            var conf = G.gc.newchapter;
            var openlong = conf.openlong;
            for (var i = 0; i < conf.pianzhang.length; i++) {
                var data = conf.pianzhang[i];
                if (G.time >= G.OPENTIME + X.getOpenTimeToNight() + (data.openday - 2) * 24 * 3600 &&
                    G.time <= G.OPENTIME + X.getOpenTimeToNight() + (data.openday - 2 + openlong) * 24 * 3600) {
                    if (P.gud.lv >= 50 && (!X.cacheByUid("newchapter") || !X.cacheByUid("newchapter").state)) {
                        G.frame.newchapter.data(data).show();
                    }
                }
            }
        },
        //决斗盛典,开服15天且是这个月的最后8天开启
        checkJDSD: function () {
            var me = this;
            if (X.checkIsOpen('jdsd') && G.DATA.asyncBtnsData.gpjjc.act) {
                if (!me.nodes.ani_jdsd.ani) {
                    G.class.ani.show({
                        json: "zhucheng_jz_gpjjc",
                        addTo: me.nodes.ani_jdsd,
                        x: me.nodes.ani_jdsd.width / 2,
                        y: me.nodes.ani_jdsd.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            me.nodes.ani_jdsd.ani = action;
                        }
                    });
                }
                me.nodes.panel_juedou.show();
                me.nodes.btn_jdsd.click(function () {
                    G.frame.juedoushengdian_main.show();
                });
            } else {
                me.nodes.panel_juedou.hide();
            }
        }
    });
})();