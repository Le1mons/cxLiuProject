/**
 * Created by zhangming on 2018-05-03
 */
(function() {
    // 英雄信息-角色面板
    G.class.ui_tip_rw = X.bView.extend({
        ctor: function(type) {
            var me = this;
            G.frame.yingxiong_xxxx.rw = me;
            me._type = type;
            me._super('ui_tip_rw.json');
        },
        refreshPanel: function() {
            var me = this;
            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;

            me.setContents();
            me.setPinLun();
            new X.bView('ui_top3.json', function(view) {
                // me.ui.removeAllChildren();
                me.fenxiang = view;
                me.fenxiang.hide();
                if (G.frame.yingxiong_xxxx.ui.getChildByTag(666)) {
                    G.frame.yingxiong_xxxx.ui.getChildByTag(666).removeFromParent();
                }
                view.setTag(666);
                G.frame.yingxiong_xxxx.ui.addChild(view);
                me.setFenXiang(view);
            }, {action: true});
        },
        setPinLun: function() {
            var me = this;
            if(G.frame.yingxiong_xxxx.from == "yingxiong_tujian") {
                me.nodes.p_dianzan.show();
                me.nodes.p_dianzan.setBackGroundImage("img/public/img_dianzan.png", 1);

                me.ajax("hero_getcomment", [me.curXbId.split("_")[0]], function (str, data) {
                    if(data.s == 1) {
                        // me.nodes.p_dianzan.removeAllChildren();
                        // var img = new ccui.ImageView("img/public/img_dianzan.png", 1);
                        // var str = "<font node=1></font> {1}";
                        // var rh = new X.bRichText({
                        //     size: 18,
                        //     maxWidth: me.nodes.p_dianzan.width,
                        //     lineHeight: 32,
                        //     color: "#30FF01",
                        //     family: G.defaultFNT,
                        // });
                        me.nodes.txt_dzwz.setString(data.d.like ? (data.d.like > 9999 ? "9999+" : data.d.like) : 0);
                        // rh.text(X.STR(str, data.d.like ? (data.d.like > 9999 ? "9999+" : data.d.like) : 0), [img]);
                        // rh.setAnchorPoint(0.5, 0.5);
                        // rh.setPosition(me.nodes.p_dianzan.width / 2, me.nodes.p_dianzan.height / 2);
                        // me.nodes.p_dianzan.addChild(rh);
                    }
                });
            }
        },
        setContents: function() {
            var me = this;

            var frame = G.frame.yingxiong_xxxx.from,
                data, conf;
            if (frame != 'yingxiong_tujian') {
                data = G.DATA.yingxiong.list[me.curXbId];
                conf = G.class.hero.getById(data.hid);
                // 种族图标
                me.nodes.panel_zz.setScale(.66);
                me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '.png', ccui.Widget.PLIST_TEXTURE);

                me.render({
                    txt_zdl: data.zhanli, // 战力
                });
                var str = conf.name;
                // + X.STR('<font color=#ffc85d>{1}/{2}</font>','('+data.lv, G.class.herocom.getMaxlv(data.hid, data.dengjielv)+')');
                me.setname(me.nodes.txt_name,str,me.nodes.panel_zz);

                if(data.islock){
                    me.nodes.btn_jiesuo.hide();
                    me.nodes.btn_suo.show();
                }else{
                    me.nodes.btn_suo.hide();
                    me.nodes.btn_jiesuo.show();
                }

                while (me.getChildByTag(999999)){
                    me.getChildByTag(999999).removeFromParent();
                }
                var oldData = G.DATA.yingxiong.oldData;
                if (oldData && me.curHeroId && me.curHeroId == me.curXbId && G.frame.yingxiong_xxxx.isf) {
                    if(data.zhanli !== oldData.zhanli){
                        var scaleMax = cc.scaleTo(0.1, 1.25, 1.25);
                        var scaleMin = cc.scaleTo(0.1, 1, 1);
                        var action = cc.sequence(scaleMax, scaleMin);
                        me.nodes.txt_zdl.runAction(action);
                    }
                    var sarr = [L("atk"), L("def"), L("hp"), L("speed")];
                    var arr = ["atk", "def", "hp", "speed"];
                    var num = 0;
                    for(var i = 0; i < arr.length; i ++){
                        if (data[arr[i]] !== oldData[arr[i]]) {
                            var is = data[arr[i]] > oldData[arr[i]];
                            var shuXingUp = new ccui.ImageView;
                            (function (shuXingUp) {
                                var str = sarr[i] + (is ? ("+" + (data[arr[i]] - oldData[arr[i]])) : (data[arr[i]] - oldData[arr[i]]));
                                var txt = new ccui.Text(str, "fzcyj", 20);
                                txt.setFontName(G.defaultFNT);
                                txt.setTextColor(cc.color(is ? "#3cff00" : "#ff3000"));
                                X.enableOutline(txt, "#000000", 2);
                                txt.setPosition(shuXingUp.width / 2, shuXingUp.height / 2);
                                shuXingUp.addChild(txt);
                                shuXingUp.setPosition(me.width / 2 - 100, 130 - num * 30);
                                num ++;
                                shuXingUp.setTag(999999);
                                me.addChild(shuXingUp);
                                var action1 = cc.moveBy(0.1, cc.p(100, 0));
                                var action2 = cc.fadeOut(0.3);
                                var action3 = cc.moveBy(0.3, cc.p(0, 10));
                                var action4 = cc.spawn(action2, action3);
                                var action5 = cc.sequence(action1, action4, cc.callFunc(()=>{
                                    shuXingUp.hide(false);
                                }));
                                shuXingUp.runAction(action5);
                            })(shuXingUp);
                        }
                    }
                }
                me.setRwBg(conf.zhongzu);
            } else {
                var pro;
                var arr = me.curXbId.split('_');

                data = X.clone(G.class.hero.getById(arr[0]));
                if (arr.length > 1) {
                    var starup = G.class.herostarup.getByIdAndDengjie(arr[0], '10');
                    data.lv = starup.maxlv;
                    data.dengjielv = '10';
                    data.star = 10;
                    pro = G.class.herostarup.getByIdAndDengjie(arr[0], data.dengjielv);
                } else {
                    data.dengjielv = data.star;
                    data.lv = G.class.herocom.getMaxlv(arr[0], data.dengjielv);
                    pro = G.class.herocom.getHeroJinJieUp(data.dengjielv);
                }
                if(!pro){
                    pro = {"atkpro":2.2,"defpro":1,"hppro":2.2,"speedpro":1.6};
                }
                var herogrowConf = G.class.herogrow.getById(arr[0]);
                var buffArr = ['atk','def','hp','speed'];
                for (var i = 0; i < buffArr.length; i++) {
                    var buffType = buffArr[i];
                    data[buffType] = herogrowConf[buffType];
                }
                for (var i = 0; i < buffArr.length; i++) {
                    var buffType = buffArr[i];
                    data[buffType] = Math.floor((data[buffType] + (data.lv - 1) * herogrowConf[buffType + "_grow"]) * pro[buffType + "pro"]);
                }
                var zl = parseInt(data.atk + data.def + data.hp / 6);
                // 种族图标
                me.nodes.panel_zz.setScale(.66);
                me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (data.zhongzu + 1) + '.png', ccui.Widget.PLIST_TEXTURE);

                me.render({
                    txt_zdl: zl // 战力
                });
                var str = data.name;
                // + X.STR('<font color=#ffc85d>{1}/{2}</font>',data.lv, G.class.herocom.getMaxlv(data.hid, data.dengjielv));
                me.setname(me.nodes.txt_name,str,me.nodes.panel_zz);

                me.nodes.btn_fenxiang.hide();
                me.nodes.btn_jiesuo.hide();
                me.nodes.btn_suo.hide();
                me.ui.finds("Image_1_0_0").hide();
                me.ui.finds("Image_1_0").hide();

                me.setRwBg(data.zhongzu);
            }
            if(!G.frame.yingxiong_xxxx.newSkill || G.frame.yingxiong_xxxx.newSkill != me.curXbId) {
                me.setSkillIcon(data);
                G.frame.yingxiong_xxxx.newSkill = me.curXbId;
            }
            me.curHeroId = me.curXbId;
            G.class.ui_star(me.nodes.panel_xx, data.star, 0.8, null, true);


            // 角色形象
            //me.nodes.panel_rw
            if (!me.id || me.id != me.curXbId || data.star!=me._oldStar) {
                X.setHeroModel({
                    parent: me.nodes.panel_rw,
                    data: data
                });
            }
            me.nodes.panel_rw.setTouchEnabled(true);
            me.nodes.panel_rw.click(function() {
                me.nodes.panel_rw.getChildren()[0].runAni(0, "atk", false);
                me.nodes.panel_rw.getChildren()[0].addAni(0, "wait", true, 0);
            });
            me.hid = data.hid;
            me.id = me.curXbId;
            me._oldStar = data.star;
        },
        setname:function(target, text, zz){
            var rt = new X.bRichText({
                size: 20,
                lineHeight: 24,
                color: G.gc.COLOR.n1,
                maxWidth: target.width,
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node,'#34221d');
                },
            });
            rt.text(text);
            rt.setAnchorPoint(0, 0.5);
            rt.setPosition( cc.p((target.width - rt.trueWidth())*0.5 + 15, target.height*0.5) );
            target.removeAllChildren();
            target.addChild(rt);
            var rt_w = rt.trueWidth();
            var rt_h = rt.trueHeight();
            zz.setAnchorPoint(0,0.5);
            zz.setPosition(cc.p(target.x - rt_w/2 - zz.width + 10 + 15, target.y + target.height*0.5 - rt_h/2))

        },

        // 左右滑动
        bindSlide: function() {
            var me = this;
            var tidArr = G.frame.yingxiong_xxxx.list;


            var getNewArmy = function(direction) {
                var renwu = me.nodes.renwu.clone();
                renwu.setPosition(cc.p(direction == 'left' ? C.WS.width + 200 : -200, me._defaultPos.y));
                me.nodes.panel_cf.addChild(renwu);
                return renwu;
            };

            var showNewArmy = function(army) {
                var tid = tidArr[me.curXbIdx];
                G.frame.yingxiong_xxxx.updateInfo({
                    tid: tid
                }, function() {});
            };

            var changeArmy = function(direction) {
                showNewArmy();
            };

            var reset = function(node) {
                node = node || me._curYx;
                node.runActions([
                    cc.moveTo(0.3, me._defaultPos)
                ]);
            };

            var cutPage = function(v) {
                if (v > 0) {
                    if (me.curXbIdx < G.frame.yingxiong_xxxx.list.length - 1) {
                        me.curXbIdx++;
                        changeArmy('left');
                        checkButtonState();
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    if (me.curXbIdx > 0) {
                        me.curXbIdx--;
                        changeArmy('right');
                        checkButtonState();
                        return true;
                    } else {
                        return false;
                    }
                }
            };


            var checkButtonState = function() {

                if (!G.frame.yingxiong_xxxx.list || G.frame.yingxiong_xxxx.list.length < 1) {
                    me.nodes.panel_arrow1.hide();
                    me.nodes.panel_arrow2.hide();
                } else {
                    if (me.curXbIdx == 0) {
                        me.nodes.panel_arrow1.hide();
                    } else {
                        me.nodes.panel_arrow1.show();
                    }
                    if (me.curXbIdx == G.frame.yingxiong_xxxx.list.length - 1) {
                        me.nodes.panel_arrow2.hide();
                    } else {
                        me.nodes.panel_arrow2.show();
                    }
                }

            };
            checkButtonState();
            me.nodes.panel_arrow1.setTouchEnabled(true);
            me.nodes.panel_arrow1.click(function() {
                cutPage(-1);
            },300);

            me.nodes.panel_arrow2.setTouchEnabled(true);
            me.nodes.panel_arrow2.click(function() {
                cutPage(1);
            },300);

            var sPos;
            me.ui.finds("panel_tp").setTouchEnabled(true);
            me.ui.finds("panel_tp").touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_BEGAN) {
                    sPos = sender.getTouchBeganPosition();
                } else if (type == ccui.Widget.TOUCH_MOVED) {

                } else if (type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    var ePos = sender.getTouchEndPosition();
                    if (ePos.x - sPos.x < -10) {
                        cutPage(1);
                    } else if (ePos.x - sPos.x > 10) {
                        cutPage(-1);
                    }
                }
            })
        },
        bindBTN: function() {
            var me = this;
            me.bindSlide();

            // 锁
            //me.nodes.btn_suo.setTouchEnabled(true);
            // me.nodes.btn_suo.setEnabled(true);
            me.nodes.btn_suo.click(function(sender, type) { //hero_lock：
                me.ajax('hero_lock', [me.curXbId], function(s, rd) {
                    if (rd.s == 1) {
                        // G.tip_NB.show(L("JSCG"));
                        G.DATA.yingxiong.list[me.curXbId].islock = rd.d.hero[me.curXbId].islock;
                        // sender.setBright(rd.d.hero[me.curXbId].islock ? true : false);
                        me.nodes.btn_suo.hide();
                        me.nodes.btn_jiesuo.show();
                    }
                }, true);
            });
            //解锁
            me.nodes.btn_jiesuo.click(function(sender, type) { //hero_lock：
                me.ajax('hero_lock', [me.curXbId], function(s, rd) {
                    if (rd.s == 1) {
                        // G.tip_NB.show(L("SDCG"));
                        G.DATA.yingxiong.list[me.curXbId].islock = rd.d.hero[me.curXbId].islock;
                        // sender.setBright(rd.d.hero[me.curXbId].islock ? true : false);
                        me.nodes.btn_jiesuo.hide();
                        me.nodes.btn_suo.show();
                    }
                }, true);
            });

            // 分享
            me.nodes.btn_fenxiang.click(function() {
                me.fenxiang.show();
                me.fenxiang.action.play("in", false);
            });

            me.nodes.btn_pinlun.click(function () {
                if(G.frame.yingxiong_xxxx.from == "yingxiong_tujian") {
                    var hid = me.curXbId;
                    G.frame.yingxiong_pinglun.data(hid).show();
                }else {
                    if(G.DATA.yingxiong.list[me.curXbId].star > 9) {
                        var hid = G.DATA.yingxiong.list[me.curXbId].hid + "_10";
                        G.frame.yingxiong_pinglun.data(hid).show();
                    }else {
                        G.frame.yingxiong_pinglun.data(G.DATA.yingxiong.list[me.curXbId].hid).show();
                    }
                }

            })
        },
        setFenXiang: function(ui) {
            var me = this;
            var panel = ui;
            var btns = [];
            X.autoInitUI(panel);
            // panel.nodes.mask.setContentSize(cc.director.getWinSize());
            panel.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    panel.hide();
                }
            });
            // panel.nodes.panel_top.setPositionX(295);
            var richText = new X.bRichText({
                size: 24,
                maxWidth: panel.nodes.txt_nr.width,
                lineHeight: 24,
                color: '#F6EBCD',
                family: G.defaultFNT,
            });
            richText.text(L('XZFXPD'));
            richText.setPosition(118, 60);
            panel.nodes.txt_nr.addChild(richText);
            var conf = {
                0: '世界',
                1: '公会'
            };
            for (var i = 0; i < 2; i++) {
                var btn = new ccui.Button();
                panel.nodes.panel_top.addChild(btn);
                btn.loadTextureNormal('img/public/btn/btn2_on.png', 1);
                btn.setPosition(115 + (i * 310), 90);
                btn.setTitleText(conf[i]);
                btn.setTitleFontName(G.defaultFNT);
                btn.setTitleFontSize(24);
                btn.setTitleColor(cc.color('#7b531a'));
                btns.push(btn);
            }
            //世界
            btns[0].touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {;
                    var send = ['1',2,'','','',G.DATA.yingxiong.list[me.curXbId].tid];
                    G.frame.liaotian.sendMsgToServ(send,function(){
                        G.tip_NB.show(L('FSCG')); 
                        panel.hide();
                    });
                }
            });
            //公会
            btns[1].touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var send = ['1',3,'','','',G.DATA.yingxiong.list[me.curXbId].tid];
                    G.frame.liaotian.sendMsgToServ(send,function(){
                        G.tip_NB.show(L('FSCG'));
                        panel.hide();
                    });
                }
            })
        }, 
        onOpen: function() {
            var me = this;
            me.refreshPanel();
            me.bindBTN();
            me.nodes.panel_jn.show();
        },
        onShow: function() {
            var me = this;


            G.frame.yingxiong_xxxx.onnp('updateInfo', function(d) {
                me.refreshPanel();
            }, me.getViewJson());
        },
        onRemove: function() {
            var me = this;
        },
        setRwBg: function (zz) {
            var me = this;

            //相同种族时，不做切换
            if (me.curZhongzu == zz) {
                return;
            }

            me.curZhongzu = zz;

            var layBg = me.ui.finds('ditu');
            layBg.removeAllChildren();
            
            var conf = G.class.herocom.getZhongzuById(zz);
            G.class.ani.show({
                addTo:layBg,
                x:layBg.width / 2,
                y:layBg.height / 2,
                json:conf.ani,
                repeat:true,
                autoRemove:false,
                cache:true,
                onload: function (node, action) {
                    
                }
            });
        },
        setSkillIcon: function (data) {
            var me = this;
            var interval = 16;
            var conf = G.class.hero.getById(data.hid);
            var skillList = G.class.hero.getSkillList(data.hid, data.dengjielv);
            var w = skillList.length * 88 + (skillList.length - 1) * interval;
            var x = (me.nodes.panel_jn.width - w) * 0.5;
            var btn_num = 0;
            for (var i = 0; i < conf.bdskillopendjlv.length; i++) {
                if (data.dengjielv >= conf.bdskillopendjlv[i]) {
                    ++btn_num;
                }
            }

            me.nodes.panel_jn.removeAllChildren();

            for (var i = 0; i < skillList.length; i++) {
                var p = G.class.ui_skill_list(skillList[i], true, null, null, data);
                p.setAnchorPoint(0, 0);
                p.x = x;
                p.y = -9;
                me.nodes.panel_jn.addChild(p);
                x += 88 + interval;
                if (i > btn_num) {
                    p.ishui = true;
                    p.ico_jn.setBright(false);
                }
            }
        },
        palySkillAni: function () {
            var me = this;
            var skill;

            for (var i in me.nodes.panel_jn.children) {
                if(me.nodes.panel_jn.children[i].ishui) {
                    skill = me.nodes.panel_jn.children[i];
                    break;
                }
            }

            if(skill) {
                G.class.ani.show({
                    json: "ani_jinenghuode",
                    addTo: skill,
                    x: skill.width / 2,
                    y: skill.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onend: function () {
                        me.setSkillIcon(G.DATA.yingxiong.list[me.curXbId]);
                    }
                })
            }else {
                me.setSkillIcon(G.DATA.yingxiong.list[me.curXbId]);
            }
        }
    });

})();