/**
 * Created by wfq on 2018/6/1.
 */
(function () {
    //英雄-简介
    var ID = 'yingxiong_jianjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            // setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
            if (me.data().hideBtn) {
                me.nodes.btn_yxsx.hide();
                me.nodes.btn_yxzb.hide();
                me.nodes.panel_jssx.x += 34;
                me.ui.finds("Panel_3").x += 34;
            }
        },
        bindBtn: function () {
            var me = this;

            me.ui.setTouchEnabled(true);
            me.ui.click(function () {
                me.remove();
            });

            me.nodes.btn_pinglun.click(function () {
                G.frame.yingxiong_pinglun.data(me.data().id || me.data().data.hid).show();
            });


            X.radio([me.nodes.btn_yxsx, me.nodes.btn_yxzb], function (sender) {
                if(sender.getName() == "btn_yxsx$") {
                    me.nodes.panel_jssx.show();
                    me.nodes.panel_jszb.hide();
                } else {
                    me.nodes.panel_jssx.hide();
                    me.nodes.panel_jszb.show();
                }
            });
            me.nodes.btn_yxsx.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.ui.finds("p1").setPosition(cc.director.getWinSize().width / 2, cc.director.getWinSize().height / 2);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            me.curId = me.data().id || me.data().data.hid;
            me.conf = G.class.hero.getById(me.curId);
            me._view = me.ui;
            me.setContents();
            me.showEquips();
        },
        onHide: function () {
            var me = this;
        },
        showEquips: function() {
            var me = this;
            var data = me.DATA.data;
            var equipData = (data && data.weardata) || {};
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
                var lay = me.nodes["panel_zb" + i];
                if(equipCallFunc[lay.getName()]()) {
                    var equip = equipCallFunc[lay.getName()]();
                    equip.setPosition(lay.width / 2, lay.height / 2);
                    lay.addChild(equip);
                }
            }
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var layIco = panel.nodes.panel_tb;
            var txtName = panel.nodes.text_yxm;
            var layPinjie = panel.nodes.panel_pinjie;
            var txtZl = panel.nodes.text_zdl;
            var btnTs = panel.nodes.btn_tishi;
            var layJn = panel.nodes.panel_jn;
            var buff = ['atk','def','hp','speed'];
            // txt_sx1
            var data = me.data().data;
            layIco.removeAllChildren();
            layPinjie.removeAllChildren();
            layJn.removeAllChildren();

            if(me.data().islv){
                var data = G.class.hero.getById(me.curId);
                var star = G.class.hero.getById(me.curId).star;
                var herogrowConf = G.class.herogrow.getById(me.curId);
                var lv = me.data().islv;
                var zhanli = G.class.herocom.getZhanli(me.curId,lv);
                var buffArr = ['atk','def','hp','speed'];
                var pro = G.class.herocom.getHeroJinJieUp(star);
                me.buff_sx = [];
                for (var i = 0; i < buffArr.length; i++) {
                    var buffType = buffArr[i];
                    data[buffType] = herogrowConf[buffType];
                }
                for (var i = 0; i < buffArr.length; i++) {
                    var buffType = buffArr[i];
                    data[buffType] = Math.floor((data[buffType] + (lv - 1) * herogrowConf[buffType + "_grow"]) * pro[buffType + "pro"]);
                    me.buff_sx[buffType] = data[buffType];
                }
                data.zhanli = parseInt(data.atk + data.def + data.hp / 6);
                data.dengjielv = me.data().isdjlv;
                me.curData = data;
            }


            //头像
            var wid = (data && G.class.shero(data)) || (me.curId && G.class.shero(me.curId)) || G.class.shero(data.hid) ;
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);
            //名字
            setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color || 1]);
            //品阶
            G.class.ui_pinji(layPinjie, (data && data.dengjielv) || 0, 0.8, me.conf.star);
            //战力
            txtZl.setString((data && data.zhanli) || (me.curId && G.class.herocom.getZhanli(me.curId,1)));
            //提示
            btnTs.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(me.data().id && !me.data().data && !me.data().islv){
                        G.frame.ui_top_xq.data({id: me.curId}).show();
                    }else{
                        G.frame.ui_top_xq.data({data : data}).show();  
                    }
                    
                }
            });
            //属性
            for (var i = 0; i < buff.length; i++) {
                var bName = buff[i];
                var txt = panel.nodes['txt_sx' + (i + 1)];
                txt.setString( (me.data().data && me.data().data[bName] || me.data().islv && me.buff_sx[bName]) || (G.class.herogrow.getById(me.curId) && G.class.herogrow.getById(me.curId)[bName]));
            }
            // 技能
            var heroMaxStar = G.class.hero.getMaxStar(me.curId || data.hid);
            var curStar = (data && data.dengjielv) || (me.conf && me.conf.dengjielv) || 1;
            if (curStar > heroMaxStar) curStar = heroMaxStar;
            var skillList = G.class.hero.getSkillList(me.curId || data.hid, curStar);

            var interval = 16; // 间隔
            var w = skillList.length * 88 + (skillList.length - 1) * interval; // 星星所占宽度
            var x = (layJn.width - w) * 0.5; // 星星初始x
            for (var i = 0; i < skillList.length; i++){
                var p = G.class.ui_skill_list(skillList[i], true, null, 1);
                p.setAnchorPoint(0,0);
                p.x = x;
                p.y = 0;
                layJn.addChild(p);

                x += 88 + interval;
            }
        },
    });

    G.frame[ID] = new fun('ronghejitan_yxsx.json', ID);
})();