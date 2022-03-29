/**
 * Created by
 */
(function () {
    //
    var ID = 'shipin_jx';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = id == 'shipin_jx' ? "f5" : 'f10';
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me._id == 'shipin_jx' && me.ui.finds('panel_1').click(function () {
                me.remove();
            });
            me.DATA = me.data() || {};
            me.state = me.DATA.state;
            me.conf = G.gc.shipin[me.DATA.spid];
        },
        getAwake: function () {
            var spid = this.DATA.spid;
            G.frame.beibao.DATA.shipin.awake = G.frame.beibao.DATA.shipin.awake || {};
            if (G.frame.beibao.isShow) {
                for (var id in G.frame.beibao.DATA.shipin.awake) {
                    if (id == spid && !G.frame.beibao.DATA.shipin.awake[id].hero) return G.frame.beibao.DATA.shipin.awake[id];
                }
            } else {
                for (var id in G.frame.beibao.DATA.shipin.awake) {
                    if (id == spid && G.frame.beibao.DATA.shipin.awake[id].hero == G.frame.yingxiong_xxxx.curXbId) return G.frame.beibao.DATA.shipin.awake[id];
                }
            }
            return null;
        },
        onShow: function () {
            var me = this;

            new X.bView('shipin.json', function (view) {
                me.nodes.panel_nr.addChild(view);
                me.view = view;
                me.view.y = -1 * me.nodes.panel_nr.height / 2;
                me.view.x = -22;
                if (me._id == 'shipin_jx') {
                    me.view.nodes.zhuangtai3.hide();
                    me.setContents();
                    me.setJxInfo();
                    if (me.getAwake()) {
                        G.frame.shipin_jx1.data(me.DATA).show();
                    }
                    me.view.nodes.btn_bangzhu.click(function () {
                        G.frame.help.data({
                            intr: L('TS84')
                        }).show();
                    });
                } else {
                    me.view.nodes.zhuangtai1.hide();
                    me.showJx();
                    me.view.nodes.btn_bangzhu.hide();
                    me.view.nodes.btn_yulan.hide();
                }
            });
        },
        showJx: function () {
            var me = this;
            var curSkillId = me.DATA.spid.split("_")[1];
            var newSkillId = G.frame.beibao.DATA.shipin.awake[me.DATA.spid].id;
            me.view.nodes.zhuangtai3.show();
            X.render({
                panel_sp_wz4: G.gc.shipincom.awake.skillList[curSkillId].intr,
                panel_sp_wz3: G.gc.shipincom.awake.skillList[newSkillId].intr,
                btn_h: function (node) {
                    node.show();
                    node.setTitleText(L("QX"));
                    node.x = me.view.nodes.panel_bg.width / 2 - 150;
                    node.click(function () {
                        me.ajax('shipin_save', [me.DATA.spid, me.getAwake().hero || '', true], function (str, data) {
                            if (data.s == 1) {
                                G.frame.beibao.DATA.shipin.awake = data.d.awake;
                                me.remove();
                                G.frame.shipin_jx.setJxInfo();
                            }
                        });
                    });
                },
                btn_l: function (node) {
                    node.show();
                    node.setTitleText(L("QD"));
                    node.x = me.view.nodes.panel_bg.width / 2 + 150;
                    node.click(function () {
                        me.ajax('shipin_save', [me.DATA.spid, me.getAwake().hero || '', false], function (str, data) {
                            if (data.s == 1) {
                                if (G.frame.beibao.isShow) {
                                    G.frame.beibao._panels && G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                }
                                if (G.frame.yingxiong_xxxx.isShow) {
                                    G.frame.yingxiong_xxxx.emit('updateInfo');
                                }
                                G.frame.beibao.DATA.shipin.awake = data.d.awake;
                                if (data.d.tid) G.frame.shipin_jx.DATA = G.frame.beibao.DATA.shipin.list[data.d.tid];
                                if (data.d.spid) G.frame.shipin_jx.DATA = {spid: data.d.spid};
                                G.frame.shipin_jx.setJxInfo(true);
                                me.remove();
                            }
                        });
                    });
                },
               
            }, me.view.nodes);
        },
        setJxInfo: function (isAni) {
            var me = this;
            var need = G.gc.shipincom.awake.need[0];
            var have = G.class.getOwnNum(need.t, need.a);
            var skillId = me.DATA.spid.split("_")[1] || "";
            var str = "<font color=" + (have < need.n ? "#ff4e4e" : '#f6ebcd') + ">" + X.fmtValue(have) + '</font>/' + need.n;
            me.view.nodes.zhuangtai1.setVisible(me.DATA.spid.split("_")[1] == undefined);
            me.view.nodes.zhuangtai2.setVisible(me.DATA.spid.split("_")[1] != undefined);
            me.curView = me.DATA.spid.split("_")[1] == undefined ? me.view.nodes.zhuangtai1 : me.view.nodes.zhuangtai2;

            X.autoInitUI(me.curView);
            X.render({
                panel_sp_wz: skillId ? G.gc.shipincom.awake.skillList[skillId].intr : L("SWJX"),
                panel_sp_wz2: skillId ? G.gc.shipincom.awake.skillList[skillId].intr : L("SWJX"),
                daibi1: function (node) {
                    cc.spriteFrameCache.getSpriteFrame(G.class.getItemIco(need.t)) && node.setBackGroundImage(G.class.getItemIco(need.t), 1);
                },
                daibi2: function (node) {
                    cc.spriteFrameCache.getSpriteFrame(G.class.getItemIco(need.t)) && node.setBackGroundImage(G.class.getItemIco(need.t), 1);
                },
                daibi_wz1: function (node) {
                    var rh = X.setRichText({
                        str: str,
                        parent: node,
                        color: '#f6ebcd'
                    });
                    rh.x = 0;
                },
                daibi_wz2: function (node) {
                    var rh = X.setRichText({
                        str: str,
                        parent: node,
                        color: '#f6ebcd'
                    });
                    rh.x = 0;
                },
                btn_tp1: function (node) {
                    node.setTitleText(skillId ? L("xl") : L("JUEXING"));
                    node.click(function () {
                        me.ajax('shipin_awake', me.getArgs(), function (str, data) {
                            if (data.s == 1) {
                                if (G.frame.beibao.isShow) {
                                    G.frame.beibao._panels && G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                }
                                if (G.frame.yingxiong_xxxx.isShow) {
                                    G.frame.yingxiong_xxxx.emit('updateInfo');
                                }
                                if (data.d.tid) me.DATA = G.frame.beibao.DATA.shipin.list[data.d.tid];
                                if (data.d.spid) me.DATA = {spid: data.d.spid};
                                me.setJxInfo(true);
                            }
                        });
                    });
                },
                btn_tp2: function (node) {
                    node.setTitleText(skillId ? L("xl") : L("JUEXING"));
                    node.click(function () {
                        me.ajax('shipin_awake', me.getArgs(), function (str, data) {
                            if (data.s == 1) {
                                if (G.frame.beibao.isShow) {
                                    G.frame.beibao._panels && G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                }
                                if (G.frame.yingxiong_xxxx.isShow) {
                                    G.frame.yingxiong_xxxx.emit('updateInfo');
                                }
                                G.frame.beibao.DATA.shipin.awake = G.frame.beibao.DATA.shipin.awake || {};
                                cc.mixin(G.frame.beibao.DATA.shipin.awake, data.d.awake, true);
                                G.frame.shipin_jx1.data(me.DATA).show();
                            }
                        });
                    });
                },

            }, me.curView.nodes);

            isAni && G.class.ani.show({
                json: 'shipin_tx_jx',
                addTo: me.curView,
            });
        },
        getArgs: function () {
            if (G.frame.beibao.isShow) {
                return ['shipin', this.DATA.spid];
            } else return ['hero', G.frame.yingxiong_xxxx.curXbId];
        },
        setContents: function () {
            var me = this;
            var conf = me.conf;
            var layBtns = me.view.nodes.btn_neirong;

            var wid = G.class.sshipin(me.DATA);
            wid.setPosition(cc.p(me.view.nodes.panel_1.width / 2,me.view.nodes.panel_1.height / 2));
            me.view.nodes.panel_1.addChild(wid);
            setTextWithColor(me.view.nodes.panel_sp_mz, wid.conf.name, G.gc.COLOR[wid.conf.color]);

            me.view.nodes.btn_yulan.click(function (sender) {
                G.frame.shipin_yl.show();
            })
            if (G.frame.beibao.isShow) {
                var btnArr = [];
                btnArr.push(G.frame.iteminfo.getBtnsState.call(me).chushou());
                for (var i = 0; i < btnArr.length; i++) {
                    var btn = btnArr[i];
                    btn.setTitleFontName(G.defaultFNT);
                    btn.setTitleFontSize(24);
                    btn.setTitleColor(cc.color(G.gc.COLOR[me.conf.tiaozhuanid ? "n13" : "n12"]));
                    var intervalWidth = (layBtns.width - (btnArr.length * btn.width)) / (btnArr.length + 1);
                    btn.setPosition(cc.p((intervalWidth + btn.width / 2) * (i + 1) + btn.width / 2 * i, layBtns.height / 2));
                    layBtns.addChild(btn);
                }
            } else {
                me.state && me.setBtns();
            }

            if (wid.conf.back && wid.conf.back.prize.length > 0) {
                me.view.nodes.btn_cz.show();
                me.view.nodes.btn_cz.click(function () {
                    G.frame.shipin_back.data({
                        id: me.DATA.spid,
                        wear: G.frame.yingxiong_xxxx.isShow
                    }).show();
                    me.remove();
                });
            }


            var str = '';
            var buffArr = X.fmtBuff(conf.buff);
            for (var i = 0; i < buffArr.length; i++) {
                var bObj = buffArr[i];
                if(i == 0){
                    str += bObj.tip;
                }else{
                    str += "<br>" + bObj.tip
                }
            }
            if(conf.tpbuff && Object.keys(conf.tpbuff).length > 0) {
                var tpBuff = X.fmtBuff(conf.tpbuff);
                for (var i = 0; i < tpBuff.length; i++) {
                    var bObj = tpBuff[i];
                    if(i == 0){
                        str += "<br>" + bObj.tip;
                    }else{
                        str += "<br>" + bObj.tip
                    }
                }
            }
            var rh = new X.bRichText({
                size:20,
                maxWidth:me.view.nodes.sp_sm.width,
                lineHeight:20,
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
                if (G.frame.yingxiong_xxxx.isShow) {
                    //需要展示是否激活状态
                    var yxZhongzu = G.DATA.yingxiong.list[G.frame.yingxiong_xxxx.curXbId].zhongzu;
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
            rh.setPosition(cc.p(0,me.view.nodes.sp_sm.height - rh.trueHeight()));
            me.view.nodes.sp_sm.addChild(rh);
        },
        setBtns: function () {
            var me = this;

            var layBtns = me.view.nodes.btn_neirong;

            
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
                    num: me.conf.upid ? 3 : (me.conf.tpid ? 3 : 2),
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
                                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[G.frame.yingxiong_xxxx.curXbId]));
                                        G.ajax.send('hero_takeoff',[G.frame.yingxiong_xxxx.curXbId,'5'],function(d) {
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
                                item.setTitleText(me.conf.upid ? L('BTN_SHENGJI') : L("TUPO"));
                                item.setTitleColor(cc.color(G.gc.COLOR.n13));
                                if(!item.data) item.data = [];
                                item.click(function () {
                                    if(me.conf.upid) {
                                        G.frame.shipin_shengji.once('show', function () {
                                            me.remove();
                                        }).show();
                                    } else {
                                        G.frame.shipin_tupo.once('show', function () {
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

            var btn = new ccui.Button();
            var img = 'img/public/btn/btn1_on.png';
            btn.loadTextures(img,'','',1);
            btn.setTitleFontName(G.defaultFNT);
            btn.setTitleFontSize(24);
            layBtns.width = 640;
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
    });
    G.frame[ID] = new fun('panel_nr.json', ID);
    G.frame['shipin_jx1'] = new fun('panel_nr.json', 'shipin_jx1');
})();