/**
 * Created by wfq on 2018/6/22.
 */
(function () {
    //阿拉希对手详情
    var ID = 'alaxi_playerinfo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            X.radio([me.nodes.btn_yingxiong, me.nodes.btn_shenchong], function (sender) {
                var name = sender.getName();
                me.nodes.panel_qh_yx.setVisible(name == "btn_yingxiong$");
                me.nodes.panel_qh_sc.setVisible(name == "btn_shenchong$");

                if (name == "btn_shenchong$") {
                    if (cc.isNode(me.heroInfoShow)) {
                        G.DATA.noClick = true;
                        me.heroInfoShow.removeFromParent();
                        delete me.heroInfoShow;

                        me.nodes.panel_wjxx.runActions([
                            cc.moveBy(0.1, 0, -110),
                            cc.callFunc(function () {
                                G.DATA.noClick = false;
                            })
                        ]);
                    }
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

            me.refreshData();
        },
        refreshData: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;

        },
        getData: function (callback) {
            var me = this;
            me.DATA = me.data().data;
            me.DATA.defhero = [];
            me.DATA.defhero.push(me.DATA.herolist);
            callback && callback();
        },
        setContents: function () {
            var me = this;
            me.setBaseInfo();
            me.setBtns();
            if (me.DATA.defhero.length == 1) {
                me.nodes.panel_zr1.show();
                me.nodes.list_zr.hide();
                me.nodes.btn_yingxiong.triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.setOneHero();
                me.setPet();
            } else {
                me.nodes.panel_zr1.hide();
                me.setHero();
            }
        },
        checkShow: function () {
            var me = this;

            me.getData(function () {
                me.show();
            });
        },
        setBaseInfo: function () {
            var me = this;

            var data = me.DATA;
            X.render({
                text_jf:X.STR(L('GONGHUIFIGHT13'),data.alljifen),
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                },
                text_gh:data.headdata.guildname || data.headdata.ghname || L('WU'),
                text_zdl1:X.fmtValue(data.zhanli),
                text_kf_name:function(node){
                    var extname = data.headdata.ext_servername || L('WU');
                    node.setString(X.STR(L('YWZB_QF'),extname));
                }
            },me.nodes);

            me.ui.finds('text_zzke').setString(data.headdata.name);
        },
        setOneHero: function () {
            var me = this;
            var data = me.DATA;
            me.setOneItem(data.defhero[0]);
        },
        setPet: function () {
            var me = this;
            var data = me.DATA;
            var allPetData = me.getPetData(data.defhero[0]);

            if (Object.keys(allPetData).length == 0) return;

            for (var pos in allPetData) {
                var dd = allPetData[pos];
                var lay = me.nodes["panel_list" + pos];
                var chr = lay.children[0];
                lay.children[1].hide();
                var pet = G.class.pet(dd);
                pet.setPosition(chr.width / 2, chr.height / 2);
                chr.addChild(pet);
                pet.setTouchEnabled(true);
                pet.click(function (sender) {
                    G.frame.sc_xq.data({
                        t: sender.data.pid,
                        lv: sender.data.lv
                    }).show();
                });
            }
        },
        setHero: function () {
            var me = this;

            var data = me.DATA;

            var lay = me.nodes.list_zr;
            lay.removeAllChildren();

            //先设置高度，再添加节点
            if (data.defhero.length > 1) {
                me.nodes.panel_wjxx.height += (me.nodes.panel_zr.height + 5) * (data.defhero.length - 1);
            }

            ccui.helper.doLayout(me.nodes.panel_wjxx);

            for (var i = 0; i < data.defhero.length; i++) {
                var d = data.defhero[i];
                var item = me.nodes.panel_zr.clone();
                item.setName(i);
                item.data = d;
                item.idx = i;
                me.setItem(item,i);
                item.setPosition(cc.p(lay.width / 2,lay.height - item.height / 2 - (item.height + 5) * i ));
                lay.addChild(item);
                item.show();
            }
        },
        getSqId: function (data) {
            for (var index in data) {
                if (index == 'sqid') return data[index];
                if (data[index].sqid) return data[index].sqid;
            }

            return "";
        },
        getPosData: function (pos, data) {

            for (var index in data) {
                if (data[index].pos == pos && data[index].hid) return data[index];
            }

            return null;
        },
        getPetData: function (data) {
            var obj = {};

            for (var pos in data) {
                if (data[pos].pid) {
                    obj[data[pos].pos] = data[pos];
                }
            }

            return obj;
        },
        setOneItem: function (data) {
            var me = this;
            var leftLay = me.nodes.panel_yx_qh;
            var rightLay = me.nodes.panel_yx1_qh;

            var wid,
                herInterval,
                lay,
                scale = 1,
                num = 0,
                sqid = me.getSqId(data);
            for (var i = 0; i < 6; i++) {
                var defhero = me.getPosData(i + 1, data);
                if (defhero) {
                    wid = G.class.shero(defhero);
                    wid.setArtifact(sqid);
                    wid.data = defhero;
                    me.setShowHeroInfo(wid);
                } else{
                    wid = G.class.shero();
                }

                var width = scale * wid.width;

                if (i < 2) {
                    lay = leftLay;
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = rightLay;
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                wid.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));
                lay.addChild(wid);
                num++;
            }
        },
        setItem: function (item,row) {
            var me = this;

            X.autoInitUI(item);

            var data = item.data;
            var leftLay = item.nodes.panel_yx;
            var rightLay = item.nodes.panel_yx1;
            leftLay.removeAllChildren();
            rightLay.removeAllChildren();

            var wid,
                herInterval,
                lay,
                scale = 1,
                num = 0,
                sqid = me.getSqId(data);
            for (var i = 0; i < 6; i++) {
                var defhero = me.getPosData(i + 1, data);
                if(row == 2 || (row == 1 && me.data().isHideTwo)){
                    wid = G.class.shero();
                    var img = new ccui.ImageView('img/jingjichang/img_jjc_wh.png',1);
                    img.setAnchorPoint(0.5,0.5);
                    img.setPosition(30, 30);
                    wid.panel_tx.addChild(img);
                } else if (defhero && row < 2) {
                    wid = G.class.shero(defhero);
                    wid.setArtifact(sqid);
                    wid.data = defhero;
                    me.setShowHeroInfo(wid);
                } else{
                    wid = G.class.shero();
                }

                var width = scale * wid.width;

                if (i < 2) {
                    lay = leftLay;
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = rightLay;
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                wid.setScale(scale);
                wid.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));
                lay.addChild(wid);

                num++;
            }
        },
        setShowHeroInfo: function(wid) {
            var me = this;

            wid.setTouchEnabled(true);
            wid.click(function (sender) {
                if (!sender.data.zhanli) return;//跨服英雄存在没有战力 点击头像不弹英雄详情信息
                if (!me.heroInfoShow) {
                    var up = cc.moveBy(0.1, 0, me.DATA.defhero.length > 1 ? 200 : 110);
                    var goUp = cc.spawn(up, cc.callFunc(()=>{
                        new X.bView("ronghejitan_yxsx.json", function (view) {
                            me.heroInfoShow = view;
                            me.heroInfoShow.setPosition(43, 170);
                            me.ui.addChild(me.heroInfoShow);

                            me.heroInfoShow.runAction(cc.moveBy(0.1, 0, -30));
                            me.setHeroInfo(sender.data);
                        })
                    }));
                    me.nodes.panel_wjxx.runAction(goUp);
                }else {
                    me.setHeroInfo(sender.data);
                }
            })
        },
        setHeroInfo: function(data) {
            var me = this;
            var head = me.heroInfoShow.nodes.panel_tb;
            var name = me.heroInfoShow.nodes.text_yxm;
            var pinjie = me.heroInfoShow.nodes.panel_pinjie;
            var zl = me.heroInfoShow.nodes.text_zdl;
            var btn = me.heroInfoShow.nodes.btn_tishi;
            var skill = me.heroInfoShow.nodes.panel_jn;
            var buff = ["atk", "def", "hp", "speed"];

            me.heroInfoShow.nodes.btn_pinglun.click(function () {
                if(data.star > 9) {
                    G.frame.yingxiong_pinglun.data(data.hid + "_10").show();
                } else {
                    G.frame.yingxiong_pinglun.data(data.hid).show();
                }
            });

            X.radio([me.heroInfoShow.nodes.btn_yxsx, me.heroInfoShow.nodes.btn_yxzb], function (sender) {
                if(sender.getName() == "btn_yxsx$") {
                    me.heroInfoShow.nodes.panel_jssx.show();
                    me.heroInfoShow.nodes.panel_jszb.hide();
                } else {
                    me.heroInfoShow.nodes.panel_jssx.hide();
                    me.heroInfoShow.nodes.panel_jszb.show();
                }
            });
            me.heroInfoShow.nodes.btn_yxsx.triggerTouch(ccui.Widget.TOUCH_ENDED);

            head.removeAllChildren();
            skill.removeAllChildren();
            skill.setPosition(225, 55);

            var wid = G.class.shero(data);
            wid.setPosition(head.width / 2, head.height / 2);
            head.addChild(wid);

            setTextWithColor(name, wid.conf.name, G.gc.COLOR[wid.conf.color || 1]);

            G.class.ui_pinji(pinjie, data.dengjielv || 0, 0.8, data.star);

            zl.setString(data.zhanli);

            btn.click(function () {
                G.frame.ui_top_xq.data({data : data}).show();
            });

            for (var i = 0; i < buff.length; i ++) {
                var bf = buff[i];
                var txt = me.heroInfoShow.nodes["txt_sx" + (i + 1)];
                txt.setString(data[bf]);
            }

            var skillList = G.class.hero.getSkillList(data.hid, data.dengjielv || 1);

            var interval = 16; // 间隔
            var w = skillList.length * 88 + (skillList.length - 1) * interval; // 星星所占宽度
            var x = (skill.width - w) * 0.5; // 星星初始x
            for (var i = 0; i < skillList.length; i++){
                var p = G.class.ui_skill_list(skillList[i], true, null, 1);
                p.setAnchorPoint(0,0);
                p.x = x;
                p.y = 0;
                skill.addChild(p);

                x += 88 + interval;
            }

            me.showEquips(data);
        },
        showEquips: function(data) {
            var me = this;
            var equipData = data.weardata || {};
            var equipCallFunc = {
                panel_zb1$: function () {
                    if(equipData[1]) {
                        var equip = G.class.szhuangbei(equipData[1]);
                        equip.data = {};
                        equip.data.a = "equip";
                        equip.data.t = equipData[1];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
                panel_zb2$: function () {
                    if(equipData[3]) {
                        var equip = G.class.szhuangbei(equipData[3]);
                        equip.data = {};
                        equip.data.a = "equip";
                        equip.data.t = equipData[3];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
                panel_zb3$: function () {
                    if(equipData[6]) {
                        var equip = G.class.sbaoshi(Object.keys(equipData[6])[0]);
                        equip.data = {};
                        equip.data.a = "baoshi";
                        equip.data.t = Object.keys(equipData[6])[0];
                        equip.data.key = equipData[6][Object.keys(equipData[6])[0]];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
                panel_zb4$: function () {
                    if(equipData[2]) {
                        var equip = G.class.szhuangbei(equipData[2]);
                        equip.data = {};
                        equip.data.a = "equip";
                        equip.data.t = equipData[2];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
                panel_zb5$: function () {
                    if(equipData[4]) {
                        var equip = G.class.szhuangbei(equipData[4]);
                        equip.data = {};
                        equip.data.a = "equip";
                        equip.data.t = equipData[4];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
                panel_zb6$: function () {
                    if(equipData[5]) {
                        var equip = G.class.sshipin(equipData[5]);
                        equip.data = {};
                        equip.data.a = "shipin";
                        equip.data.t = equipData[5];
                        G.frame.iteminfo.showItemInfo(equip);
                        return equip;
                    }
                    return undefined;
                },
            };
            for (var i = 1; i < 7; i ++) {
                var lay = me.heroInfoShow.nodes["panel_zb" + i];
                if(equipCallFunc[lay.getName()]()) {
                    var equip = equipCallFunc[lay.getName()]();
                    equip.setPosition(lay.width / 2, lay.height / 2);
                    lay.removeAllChildren();
                    lay.addChild(equip);
                } else {
                    lay.removeAllChildren();
                }
            }
        },
        setBtns: function () {
            var me = this;
            me.nodes.btn_pb.hide();
            me.nodes.btn_jhy.hide();
            me.nodes.btn_swgy.show();
            me.nodes.btn_swgy.setTitleText(L("TIAOZHAN"));
            me.nodes.btn_swgy.click(function () {
                if (G.frame.alaxi_city.DATA.recoverinfo.num <= 0) return G.tip_NB.show(L("TZCSBZ"));
                G.frame.yingxiong_fight.data({
                    pvType: "alaxi",
                    data: {
                        enemy: true,
                        isNpc: true
                    },
                    index: me.data().index,
                    city: me.data().city
                }).once("hide",function () {
                    me.remove();
                }).show();
            })
        },
    });

    G.frame[ID] = new fun('jingjichang_wjxx.json', ID);
})();