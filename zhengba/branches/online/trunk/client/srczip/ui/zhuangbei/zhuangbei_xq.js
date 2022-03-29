/**
 * Created by wfq on 2018/5/23.
 */
(function () {
    //装备-详情
    var ID = 'zhuangbei_xq';

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

            me.curId = me.data().id;
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;

            me.conf = G.class.equip.getById(me.curId);
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
                    var curXBid = heroData && heroData.weardata && heroData.weardata[me.conf.type];
                    me.conf2 = G.class.equip.getById(curXBid);
                    me.ui.nodes.panel_nr.addChild(view);
                    me.setContents(view,false);
                    view.setTouchEnabled(true);
                });
            }
            // me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function (panel,bool) {
            var me = this;


            me.setTop(panel,bool);
            me.setBtns(panel,bool);
        },
        setTop: function (panel,bool) {
            var me = this;

            var conf = bool ? me.conf : me.conf2;

            var btnHqtj = panel.nodes.btn_hqtj;
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtName = panel.nodes.text_1;
            var txtType = panel.nodes.text_2;
            var txtHqtj = panel.finds('text_hqtj');
            var layYx = panel.nodes.panel_4;

            layIco.removeAllChildren();
            layBuff.removeAllChildren();
            layYx.removeAllChildren();

            if((me.state != 'tihuan' && bool)||(me.state == 'tihuan' && !bool)){
                var heroData = G.DATA.yingxiong.list[me.curXbId];
                // 英雄
                var hero = G.class.shero(heroData);
                hero.setScale(.92);
                hero.setAnchorPoint(0.5, 1);
                hero.setPosition(cc.p(layYx.width / 2, layYx.height - 3));
                layYx.addChild(hero);
            }


            //头像
            var wid = G.class.szhuangbei(conf);
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            // 名字
            setTextWithColor(txtName,conf.name,G.gc.COLOR[conf.color]);
            // 类型
            txtType.setString(L('ZHUANGBEI_TYPE_' + conf.type));

            // buff
            var str = "";
            var buff = X.fmtBuff(conf.buff);
            for(var i = 0; i < buff.length; i ++){
                if(i > 0){
                    str += "<br>" + buff[i].tip;
                }else{
                    str += buff[i].tip;
                }
            }
            var rh = new X.bRichText({
                size:22,
                maxWidth:layBuff.width,
                lineHeight:34,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            if (!conf.tzid || conf.tzid == '') {
                str += '<br><font size=10>' + ' ' + '</font>';
                rh.text(str);
            } else {
                //套装

                var tzConf = G.class.equip.getTaozhuangById(conf.tzid);
                var buffArr = G.class.equip.getTzBuffArrById(conf.tzid);
                if (me.state != 'tihuan' || (me.state == 'tihuan' && !bool)) {
                    //需要展示是否激活状态
                    var ownNum = 0;
                    var wearData = heroData.weardata || {};
                    for (var i = 0; i < tzConf.tzid.length; i++) {
                        var eid = tzConf.tzid[i];
                        var eConf = G.class.equip.getById(eid);
                        if (wearData[eConf.type] && (wearData[eConf.type] == eid || wearData[eConf.type] == me.curId)) {
                            ownNum++;
                        }
                    }
                    // for (var type in wearData) {
                    //     var id = wearData[type];
                    //     if (typeof id == 'string' && X.inArray(tzConf.tzid, id)) {
                    //         ownNum++;
                    //     }
                    // }

                    str += '<br><font size=20 color='+ G.gc.COLOR.n9 + '>' + tzConf.tzname + '（' + ownNum + '/' +tzConf.tzid.length + '）' + '</font>';


                    for (var i = 0; i < buffArr.length; i++) {
                        var buffConf = buffArr[i];
                        var buff = X.fmtBuff(buffConf[1]);
                        str += '<br><font color=' + G.gc.COLOR[ownNum >= buffConf[0] * 1 ? 1 : 'n10'] + '>' + buff[0].tip + '</font>';
                    }
                } else {
                    str += '<br><font size=20 color='+ G.gc.COLOR.n9 + '>' + tzConf.tzname + '（' + tzConf.tzid.length + '）' + '</font>';

                    buffArr = G.class.equip.getTzBuffArrById(conf.tzid);
                    for (var i = 0; i < buffArr.length; i++) {
                        var buffConf = buffArr[i];
                        var buff = X.fmtBuff(buffConf[1]);
                        str += '<br><font color=' + G.gc.COLOR.n10 + '>' + buff[0].tip + '</font>';
                    }
                }
                str += '<br><font size=10>' + ' ' + '</font>';
                rh.text(str);
            }

            // var offsetY = rh.trueHeight();
            // // console.log('offsety======', offsetY);
            // panel.nodes.panel_bg.height = panel.nodes.panel_bg.height + offsetY + 50;
            // ccui.helper.doLayout(panel.nodes.panel_bg);
            var offsetY = rh.trueHeight();
            rh.setPosition(cc.p(0,-15));
            layBuff.addChild(rh);


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
                                    G.ajax.send('hero_wearequip',[me.curId,me.curXbId],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {
                                            me.remove();
                                            if (G.frame.zhuangbei_zbxz.isShow) {
                                                G.frame.zhuangbei_zbxz.remove();
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
                                        }else if(d.s == -2) {
                                            if (G.frame.zhuangbei_zbxz.isShow) {
                                                G.frame.zhuangbei_zbxz.remove();
                                            }
                                            me.remove();
                                        }
                                    },true);
                                }
                            });
                        }
                    }]
                },
                xiexia:{
                    num:2,
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
                                        G.ajax.send('hero_takeoff',[me.curXbId,me.conf.type],function(d) {
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
                                        // 替换时打开装备选择界面
                                        G.frame.zhuangbei_zbxz.data(me.conf.type).once('show', function () {
                                            me.remove();
                                        }).show();
                                    }
                                });
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
                                    G.ajax.send('hero_wearequip',[me.curId,me.curXbId],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {
                                            me.remove();
                                            if (G.frame.zhuangbei_zbxz.isShow) {
                                                G.frame.zhuangbei_zbxz.remove();
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
                }
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
                        var a = state2num[me.state].num;
                        btnsConf[idx].setBtn(item);
                    }
                });
            }

        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();