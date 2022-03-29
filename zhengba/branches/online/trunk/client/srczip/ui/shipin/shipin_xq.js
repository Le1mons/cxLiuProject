/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //饰品-详情
    var ID = 'shipin_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.curType = '5';
            me.curId = me.data().id;

            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.conf = G.class.shipin.getById(me.curId);
            me.heroData = G.frame.yingxiong.getHeroDataByTid(me.curXbId);
            //是否需要双显示
            me.state = me.data().state;
            me.ui.nodes.panel_nr.removeAllChildren();

            new X.bView('zhuangbei_tip1.json', function (view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents(view,true);
                view.setTouchEnabled(true);
            });

            if (me.state == 'tihuan') {
                new X.bView('zhuangbei_tip1.json', function (view) {
                    me._view2 = view;
                    var heroData = G.frame.yingxiong.getHeroDataByTid(me.curXbId);
                    var curXBid = heroData && heroData.weardata && heroData.weardata[me.curType];
                    me.conf2 = G.class.shipin.getById(curXBid);
                    me.ui.nodes.panel_nr.addChild(view);
                    me.setContents(view,false);
                    view.setTouchEnabled(true);
                });
            }
        },
        onHide: function () {
            var me = this;
        },
        setContents: function (panel,bool) {
            var me = this;

            panel.nodes.panel_bg.setTouchEnabled(true);

            me.setTop(panel,bool);
            me.setBtns(panel,bool);
        },
        setTop: function (panel,bool) {
            var me = this;

            var conf = bool ? me.conf : me.conf2;

            //var btnHqtj = panel.nodes.btn_hqtj;
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtName = panel.nodes.text_1;
            var txtType = panel.nodes.text_2;
            var txtHqtj = panel.finds('text_hqtj');
            var layYx = panel.nodes.panel_4;

            // btnHqtj.show();
            layIco.removeAllChildren();
            layBuff.removeAllChildren();
            layYx.removeAllChildren();
            layYx.removeBackGroundImage();

            var heroData = me.heroData;
            // // 英雄
            // var hero = G.class.shero(heroData);
            // hero.setPosition(cc.p(layYx.width / 2,layYx.height / 2));
            // layYx.addChild(hero);

            //头像
            var wid = G.class.sshipin(conf);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            // btnHqtj.click(function (sender, type) {
            //     G.frame.shipin_shengji.show();
            // });

            // if (me.state != 'chuandai') {
            //     layYx.setBackGroundImage('img/public/btn/btn1_on.png',1);
            //     var txt = new ccui.Text(L("SHENGJI"), G.defaultFNT, 24);
            //     txt.setTextColor(cc.color("#2f5719"));
            //     txt.setAnchorPoint(0.5, 0.5);
            //     txt.setPosition(layYx.width / 2, layYx.height / 2);
            //     layYx.addChild(txt);
            //     layYx.touch(function (sender, type) {
            //         if (type == ccui.Widget.TOUCH_ENDED) {
            //             G.frame.shipin_shengji.once('show', function () {
            //                 me.remove();
            //             }).show();
            //         }
            //     });
            // }
            if(!conf.upid){
                layYx.hide();
            }
            if(me.state == "tihuan"){
                panel.nodes.panel_4.hide();
            }

            // 名字
            setTextWithColor(txtName,conf.name,G.gc.COLOR[conf.color || 1]);
            // 类型
            txtType.setString(L('ZHUANGBEI_TYPE_' + me.curType));

            // buffar
            var str = '';
            // conf.buff = {
            //     atk:10,
            //     def:10,
            //     hp:20
            // };
            var buffArr = X.fmtBuff(conf.buff);
            for (var i = 0; i < buffArr.length; i++) {
                var bObj = buffArr[i];
                if(i == 0){
                    str += bObj.tip;
                }else{
                    str += "<br>" + bObj.tip
                }
            }
            var offsetY;
            var rh = new X.bRichText({
                size:22,
                maxWidth:layBuff.width,
                lineHeight:34,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT,
            });
            if(conf.intr){
                str += "<br>" + conf.intr;
            }
            if (!conf.zhongzu || conf.zhongzu == '') {
                str += '<br><font size=20>' + ' ' + '</font>';
                rh.text(str);
            } else {
                //种族特性
                var zzBuffArr = X.fmtBuff(conf.zhongzubuff);
                if (me.state != 'tihuan' || (me.state == 'tihuan' && !bool)) {
                    //需要展示是否激活状态
                    var yxZhongzu = me.heroData.zhongzu;
                    var isJihuo = conf.zhongzu == yxZhongzu;

                    str += '<br><font size=20 color='+ G.gc.COLOR[isJihuo ? 'n7' :'n10'] +'>' + X.STR(L('ZHONGZU_NEED'),L('zhongzu_' + conf.zhongzu)) + '</font>';

                    for (var i = 0; i < zzBuffArr.length; i++) {
                        var zzbObj = zzBuffArr[i];
                        str += '<br><font color=' + G.gc.COLOR[isJihuo ? 'n7' :'n10'] + '>' + zzbObj.tip + '</font>';
                    }
                } else {
                    str += '<br><font size=20 color='+ G.gc.COLOR.n10 +'>' + X.STR(L('ZHONGZU_NEED'),L('zhongzu_' + conf.zhongzu)) + '</font>';

                    for (var i = 0; i < zzBuffArr.length; i++) {
                        var zzbObj = zzBuffArr[i];
                        str += '<br><font color=' + G.gc.COLOR.n10 + '>' + zzbObj.tip + '</font>';
                    }
                }
                str += '<br><font size=20>' + ' ' + '</font>';
                rh.text(str);
            }

            // offsetY = rh.trueHeight() + 50;
            // panel.nodes.panel_bg.height += offsetY;
            // ccui.helper.doLayout(panel.nodes.panel_bg);
            var offsetY = rh.trueHeight();
            rh.setPosition(cc.p(0,-15));
            layBuff.addChild(rh);
            if (me.state == 'tihuan') {
                if (!bool) {
                    panel.nodes.panel_3.height = 0;
                }
            }

            // 移动两个panel位置
            if (me.state == 'tihuan') {
                if (bool) {
                    panel.nodes.panel_bg.y = panel.nodes.panel_bg.y + panel.nodes.panel_bg.height / 2 + offsetY / 2 + 5;
                    panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 20));
                    ccui.helper.doLayout( panel.nodes.panel_bg);
                } else {
                    rh.setPosition(cc.p(0,-95));
                    panel.nodes.panel_bg.y = panel.nodes.panel_bg.y - panel.nodes.panel_bg.height / 2 - offsetY / 2 - 30;
                    panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY -20));
                    ccui.helper.doLayout( panel.nodes.panel_bg);
                }
            }else{
                panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 20));
                ccui.helper.doLayout( panel.nodes.panel_bg);
            }
        },
        setBtns: function (panel,bool) {
            var me = this;

            var layBtns = panel.nodes.panel_3;
            var laysj = panel.nodes.panel_4;
            laysj.setTouchEnabled(true);

            layBtns.removeAllChildren();

            var state2num = {
                tihuan:{
                    num:1,
                    btns:[{
                        setBtn: function (item) {
                            item.setTitleText(L('BTN_TIHUAN'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n13));
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
                                    G.ajax.send('hero_wearshipin',[me.curId,me.curXbId],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {

                                            me.remove();
                                            if (G.frame.shipin_xuanze.isShow) {
                                                G.frame.shipin_xuanze.remove();
                                            }
                                            G.tip_NB.show(L('TIHUAN') + L('SUCCESS'));
                                            G.frame.yingxiong_xxxx.emit('updateInfo');
                                            G.class.ani.show({
                                                x: G.frame.yingxiong_xxxx.zb.panel.width / 2,
                                                y: G.frame.yingxiong_xxxx.zb.panel.height / 2,
                                                json: "ani_dianjitexiao",
                                                addTo: G.frame.yingxiong_xxxx.zb.panel,
                                                repeat: false,
                                                autoRemove: true,
                                                onload: function (node) {
                                                    node.zIndex = 10;
                                                }
                                            })
                                        }
                                    },true);
                                }
                            });
                        }
                    }]
                },
                xiexia:{
                    num: me.conf.upid ? 3 : 2,
                    btns:[
                        {
                            setBtn: function (item) {
                                // 脱下
                                item.loadTextureNormal('img/public/btn/btn3_on.png',1);
                                item.setTitleText(L('BTN_TUOXIA'));
                                item.setTitleColor(cc.color(G.gc.COLOR.n14));
                                if(!item.data) item.data = [];
                                item.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {
                                        //卸下
                                        X.audio.playEffect("sound/zhuangbei.mp3");
                                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
                                        G.ajax.send('hero_takeoff',[me.curXbId,'5'],function(d) {
                                            if(!d) return;
                                            var d = JSON.parse(d);
                                            if(d.s == 1) {

                                                me.remove();
                                                G.frame.yingxiong_xxxx.emit('updateInfo');
                                            }
                                        },true);
                                    }
                                });
                            }
                        },
                        {
                            setBtn: function (item) {
                                //替换
                                item.setTitleText(L('BTN_TIHUAN'));
                                item.setTitleColor(cc.color(G.gc.COLOR.n13));
                                item.touch(function (sender, type) {
                                    if (type == ccui.Widget.TOUCH_ENDED) {
                                        // 替换时打开饰品选择界面
                                        G.frame.shipin_xuanze.data({type:1}).once('show', function () {
                                            me.remove();
                                        }).show();
                                    }
                                });
                            }
                        },
                        {
                            setBtn: function (item) {
                                item.setTitleText(L('BTN_SHENGJI'));
                                item.setTitleColor(cc.color(G.gc.COLOR.n13));
                                if(!item.data) item.data = [];
                                item.touch(function () {
                                    G.frame.shipin_shengji.once('show', function () {
                                        me.remove();
                                    }).show();
                                })
                            }
                        }
                    ]
                },
                chuandai:{
                    num:1,
                    btns:[{
                        setBtn: function (item) {
                            //穿上
                            item.setTitleText(L('BTN_CHUANSHANG'));
                            item.setTitleColor(cc.color(G.gc.COLOR.n13));
                            if(!item.data) item.data = [];
                            item.touch(function (sender, type) {
                                if (type == ccui.Widget.TOUCH_ENDED) {
                                    X.audio.playEffect("sound/zhuangbei.mp3");
                                    G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
                                    G.ajax.send('hero_wearshipin',[me.curId,me.curXbId],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {

                                            me.remove();
                                            if (G.frame.shipin_xuanze.isShow) {
                                                G.frame.shipin_xuanze.remove();
                                            }
                                            G.tip_NB.show(L('CHUANSHANG') + L('SUCCESS'));
                                            G.frame.yingxiong_xxxx.emit('updateInfo');
                                            G.class.ani.show({
                                                x: G.frame.yingxiong_xxxx.zb.panel.width / 2,
                                                y: G.frame.yingxiong_xxxx.zb.panel.height / 2,
                                                json: "ani_dianjitexiao",
                                                addTo: G.frame.yingxiong_xxxx.zb.panel,
                                                repeat: false,
                                                autoRemove: true,
                                                onload: function (node) {
                                                    node.zIndex = 10;
                                                }
                                            })
                                        }
                                    },true);
                                }
                            });
                        }
                    }]
                },
            };

            if (bool) {
                var btn = new ccui.Button();
                var img = 'img/public/btn/btn1_on.png';
                btn.loadTextures(img,'','',1);
                btn.setTitleFontName(G.defaultFNT);
                btn.setTitleFontSize(24);
                X.autoLayout_new({
                    parent:layBtns,
                    item:btn,
                    num:state2num[me.state].num,
                    mapItem: function (item) {
                        var idx = item.idx;
                        var btnsConf = state2num[me.state].btns;
                        btnsConf[idx].setBtn(item);
                    }
                });
            }

        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();