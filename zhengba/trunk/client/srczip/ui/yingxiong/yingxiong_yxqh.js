/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    // 英雄信息-强化
    G.class.yingxiong_yxqh = X.bView.extend({
        ctor: function (type) {
            var me = this;
            G.frame.yingxiong_xxxx.qh = me;
            me._type = type;
            me._super('yingxiong_yxqh.json');
        },
        refreshPanel: function (bool) {
            var me = this;
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;

            me.setContents(bool);
        },
        playJjAni: function() {
            var me = this;
            var img;
            var data = G.DATA.yingxiong.list[me.curXbId];

            for (var i = 0; i < me.nodes.panel_pinjie.children.length; i ++) {
                var chr = me.nodes.panel_pinjie.children[i];
                if(chr.ani) {
                    img = chr;
                    break;
                }
            }
            if(img) {
                G.class.ani.show({
                    json: "ani_jinjie_xingxing",
                    addTo: img,
                    x: img.width / 2,
                    y: img.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onkey: function (node, action, event) {
                        if(event == "chuxian") {
                            G.class.ui_pinji(me.nodes.panel_pinjie, data.dengjielv, 0.8, data.star);
                        }
                    }
                })
            } else {
                G.class.ui_pinji(me.nodes.panel_pinjie, data.dengjielv, 0.8, data.star);
            }

        },
        setContents: function (bool) {
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];
            // if(me.Timer){
            //     me.ui.clearInterval(me.Timer);
            //     delete me.Timer;
            // }
            // 品级
            if(!G.frame.yingxiong_xxxx.checkAniId || G.frame.yingxiong_xxxx.checkAniId != me.curXbId) {
                G.class.ui_pinji(me.nodes.panel_pinjie, data.dengjielv, 0.8, data.star);
                G.frame.yingxiong_xxxx.checkAniId = me.curXbId;
            }

            var conf = G.class.hero.getById(data.hid);

            me.render({
                txt_sx1: data.atk, // 攻击
                txt_sx2: data.def, // 防御
                txt_sx3: data.hp, // 生命
                txt_sx4: data.speed, // 速度
            });
            me.nodes.txt_sx1.setTextColor(cc.color("#804326"));
            me.nodes.txt_sx2.setTextColor(cc.color("#804326"));
            me.nodes.txt_sx3.setTextColor(cc.color("#804326"));
            me.nodes.txt_sx4.setTextColor(cc.color("#804326"));

            // 是否能升阶
            me.nodes.panel_gmtp.hide();
            me.nodes.panel_sjqh.show();
            if (data.lv >= G.class.herocom.getMaxlv(data.hid, data.dengjielv)) {
                me.nodes.img_ymj.show();
                me.showShengjie();
                if(me.Timer){
                    me.ui.clearInterval(me.Timer);
                    delete me.Timer;
                }
            } else {
                me.nodes.img_ymj.hide();
                me.showShengji();
            }
            if (data.star >= 13) {
                G.class.ui_pinji(me.nodes.panel_x_pinjie, data.dengjielv, 0.8, data.star);
                var addLv = 300 + G.frame.yingxiong_xxxx.getGmAddLv();
                me.nodes.txt_djz.setString(X.STR('{1}/{2}', data.lv, addLv > 400 ? 400 : addLv));
            } else {
                me.nodes.txt_djz.setString(X.STR('{1}/{2}', data.lv, G.class.herocom.getMaxlv(data.hid, data.dengjielv)));
            }


            //职业
            var imgJob = me.ui.finds('zy');
            var txtJob = me.ui.finds('zy_wz');
            imgJob.setBackGroundImage(G.class.hero.getJobIcoById(data.hid), 1);
            txtJob.setString(L('JOB_' + conf.job));
        },
        showShengji: function () {
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];
            var needUseExp;
            var need;

            me.nodes.panel_xh.show();
            me.nodes.img_zgdj.hide();
            var num;
            if(data.lv < 60) {
                num = 5;
                me.nodes.btn_up1.show();
                me.nodes.btn_up.hide();
            } else {
                me.sustain = false;
                me.up_shengji && clearTimeout(me.up_shengji);
                num = 1;
                me.nodes.btn_up.show();
                me.nodes.btn_up1.hide();
            }
            me.nodes.btn_up_jj.hide();
            
            for (var i = 0; i < num; i ++) {
                if(!need) {
                    need = X.clone(G.class.herocom.getHeroLvUp(data.lv + i).need);
                } else {
                    need[0].n += G.class.herocom.getHeroLvUp(data.lv + i).need[0].n;
                }
                if(!needUseExp) {
                    needUseExp = [{a: 'attr', t: 'useexp', n: G.class.herocom.getHeroLvUp(data.lv + i).maxexp}];
                } else {
                    needUseExp[0].n += G.class.herocom.getHeroLvUp(data.lv + i).maxexp
                }
            }
            need = need.concat(needUseExp);
            

            var txt = [me.nodes.txt_xh1, me.nodes.txt_xh2];
            var imgArr = [me.ui.finds('token_jb'), me.ui.finds('token_jy')];
            var cailiao_bool;
            for (var i = 0; i < txt.length; i++) {
                if (i < need.length) {
                    var str = need[i].n;
                    imgArr[i].show();
                    cailiao_bool = G.class.getOwnNum(need[i].t, need[i].a) < need[i].n;
                    setTextWithColor(txt[i], X.fmtValue(str), G.gc.COLOR[cailiao_bool ? 'n16' : 'n8']);
                    X.enableOutline(txt[i], cc.color(cailiao_bool ? '#740000' : "#000000"), 1);
                } else {
                    imgArr[i].hide();
                    txt[i].setString('');
                }
            }
        },
        showShengjie: function () {
            var me = this;

            me.nodes.panel_xh.hide();
            me.nodes.img_zgdj.hide();
            me.nodes.btn_up.hide();
            me.nodes.btn_up1.hide();

            var btnJj = me.nodes.btn_up_jj;
            btnJj.hide();
            G.removeNewIco(btnJj);

            var heroData = G.DATA.yingxiong.list[me.curXbId];
            if (heroData.dengjielv < heroData.star) {
                btnJj.show();

                var data = G.DATA.yingxiong.list[me.curXbId];
                var need = G.class.herocom.getHeroJinJieUp(data.dengjielv).need;

                if (G.class.getOwnNum(need[0].t, need[0].a) >= need[0].n && G.class.getOwnNum(need[1].t, need[1].a) >= need[1].n) {
                    G.setNewIcoImg(btnJj, .9);
                }
            }else {
                me.nodes.img_ymj.hide();
                me.nodes.img_zgdj.show();

                if (heroData.star >= 13 && heroData.lv < 300 + G.frame.yingxiong_xxxx.getGmAddLv()) {
                    me.nodes.panel_sjqh.hide();
                    me.nodes.panel_gmtp.show();
                    me.nodes.btn_gmtp.setBright(heroData.lv < 400);
                    me.nodes.txet_gmtp.setTextColor(cc.color(heroData.lv >= 400 ? '#6c6c6c' : '#2f5719'));
                    var need1 = G.class.herocom.getHeroLvUp(heroData.lv).need;
                    var need = [].concat(need1, {a: "attr", "t": "useexp", n: G.class.herocom.getHeroLvUp(heroData.lv).maxexp});
                    var sortObj = {
                        attr: 1,
                        item: 2
                    };
                    need.sort(function (a, b) {
                        return sortObj[a.a] < sortObj[b.a] ? -1 : 1;
                    });

                    var txt = [me.nodes.txt_xxh1, me.nodes.txt_xxh2, me.nodes.txt_xxh3];
                    var imgArr = [me.nodes.token_xwp1, me.nodes.token_xwp2, me.nodes.token_xwp3];
                    var cailiao_bool;
                    for (var i = 0; i < txt.length; i++) {
                        if (i < need.length) {
                            var str = need[i].n;
                            txt[i].show();
                            imgArr[i].show();
                            imgArr[i].loadTexture(G.class.getItemIco(need[i].t), 1);
                            cailiao_bool = G.class.getOwnNum(need[i].t, need[i].a) < need[i].n;
                            setTextWithColor(txt[i], X.fmtValue(str), G.gc.COLOR[cailiao_bool ? 'n16' : 'n8']);
                            X.enableOutline(txt[i], cc.color(cailiao_bool ? '#740000' : "#000000"), 1);
                        } else {
                            imgArr[i].hide();
                            txt[i].setString('');
                        }
                    }

                    // X.alignItems(me.nodes.panel_gmwp, need2, "left", {
                    //     touch: true,
                    //     scale: .8,
                    //     mapItem: function (node) {
                    //         if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                    //             node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    //         }
                    //     }
                    // });
                }
            }
        },
        upLv: function() {
            var me = this;
            G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
            me.ajax('hero_lvup', [me.curXbId], function (s, rd) {
                if (rd.s == 1) {
                    X.audio.playEffect("sound/yingxiongshengji.mp3");
                    var panel = G.frame.yingxiong_xxxx._rwPanel.nodes.panel_rw;
                    var childrenArr = panel.getChildren();
                    //我一直在想，每次都清空了要重建角色会不会卡……结果，尼玛，这里是从1开始……
                    //角色正常情况下应该在索引0
                    for (var i = 1; i < childrenArr.length; i++) {
                        var child = childrenArr[i];
                        child.removeFromParent(true);
                    }
                    G.class.ani.show({
                        json: "ani_jinjie",
                        addTo: panel,
                        x: panel.width / 2 - 20,
                        y: panel.height / 2 - 100,
                        repeat: false,
                        cache: true,
                        autoRemove: true
                    });
                    G.frame.yingxiong_xxxx.updateInfo();
                    me.nodes.txt_sx1.runActions([
                        cc.scaleTo(0.1, 1.2, 1.2),
                        cc.scaleTo(0.1, 1, 1)
                    ]);

                    me.nodes.txt_sx2.runActions([
                        cc.scaleTo(0.1, 1.2, 1.2),
                        cc.scaleTo(0.1, 1, 1)
                    ]);

                    me.nodes.txt_sx3.runActions([
                        cc.scaleTo(0.1, 1.2, 1.2),
                        cc.scaleTo(0.1, 1, 1)
                    ]);

                    me.nodes.txt_sx4.runActions([
                        cc.scaleTo(0.1, 1.2, 1.2),
                        cc.scaleTo(0.1, 1, 1)
                    ]);

                    me.ui.setTimeout(function () {
                        G.guidevent.emit('hero_lvup_over');
                    }, 100);
                } else {
                    X.audio.playEffect("sound/dianji.mp3", false);
                    me.ui.clearAllTimers();
                }
            }, true);
        },
        bindBTN: function () {
            var me = this;
            
            function f() {

                me.Timer = me.ui.setInterval(function(){
                    me.upLv();
                    cc.log("+++++++++++++++++++++");
                }, 200);
            }
            
            // 升级
            if (!me.nodes.btn_up.data) me.nodes.btn_up.data = [];
            me.nodes.btn_up.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    me.upLv();
                } else if (type == ccui.Widget.LONG_TOUCH) {
                    f();
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if(me.Timer){
                        me.ui.clearInterval(me.Timer);
                        delete me.Timer;
                    }
                    if (G.guide.view) {
                        me.upLv();
                    }
                }
            }, null, {emitLongTouch: true});

            if (!me.nodes.btn_up1.data) me.nodes.btn_up.data = [];
            me.nodes.btn_up1.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    me.upLv();
                } else if (type == ccui.Widget.LONG_TOUCH) {
                    f();
                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    if(me.Timer){
                        me.ui.clearInterval(me.Timer);
                        delete me.Timer;
                    }
                }
            }, null, {emitLongTouch: true});

            me.nodes.btn_gmtp.click(function (sender) {
                if (!sender.isBright()) {
                    return G.tip_NB.show(L("lv_max"));
                }
                me.upLv(false);
            });

            // 进阶
            me.nodes.btn_up_jj.click(function () {
                G.frame.yingxiong_tip_jj.data({tid: me.curXbId}).show();
            });

            // 感叹号提示
            me.nodes.btn_tishi.click(function () {
                G.frame.ui_top_xq.data({tid: me.curXbId}).show();
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.nodes.panel_jn.zIndex = 999;
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();

            G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
                if (G.frame.yingxiong_xxxx.getCurType() == me._type) {
                    me.refreshPanel(true);
                } else {
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }

            G.frame.yingxiong_xxxx.changeToperAttr({
                attr2: {a: 'attr', t: 'useexp'}
            });
        },
        onRemove: function () {
            var me = this;
            me.up_shengji && clearTimeout(me.up_shengji);
            G.frame.yingxiong_xxxx.checkAniId = undefined;
        },
    });

})();