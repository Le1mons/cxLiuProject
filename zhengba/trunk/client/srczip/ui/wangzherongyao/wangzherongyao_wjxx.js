/**
 * Created by wfq on 2016/7/13.
 */
(function () {
    //玩家信息-挑战
    var ID = 'wangzherongyao_wjxx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f7";
            me._super(json, id, {action: true});
        },
        showXinXi: function () {
            var me = this;
            var d = me.DATA.data;

            var sj = G.frame.wangzherongyao.DATA.status;

            if(sj == 7 || sj == 8) {
                me.sj = 0;
            } else if(sj == 5){
                me.sj = 1;
            } else  {
                me.sj = 3;
            }


            me.ui.nodes.panel_tx.removeAllChildren();
            var tx = G.class.shead(d.headdata,false);
            tx.setAnchorPoint(0,0);
            me.ui.nodes.panel_tx.addChild(tx);
            me.ui.nodes.txt_name.setString(d.headdata.name);
            me.ui.nodes.txt_zl.setString(d.headdata.zhanli || "");
            me.ui.nodes.txt_wjxx.setString(d.headdata.guildname || L("ZW"));
            if(d.headdata.ext_servername){
                me.ui.nodes.txt_qf.setString(d.headdata.ext_servername);
            }else{
                me.ui.nodes.txt_qf.setString('');
            }
            if(me.DATA.frame == 'wangzherongyao_dld'){
                me.ui.nodes.txt_tz.setString(L("TIAOZHAN"));
            }else{
                me.ui.nodes.txt_tz.setString(L("QUEDIN"));
            }

            var fight_data = d.fightdata;
            for (var i = 0; i < fight_data.length; i++) {
                var panel = me.ui.nodes["panel_zr" + (i + 1)];
                var list = me.ui.nodes.panel_zr.clone();
                list.data = fight_data[i];
                list.idx = i;
                me.setItem(list, i);
                panel.removeAllChildren();
                list.setPosition(cc.p(0,panel.height/2));
                panel.addChild(list);
                list.show();
            }

        },
        setItem: function (item,row) {
            var me = this;

            X.autoInitUI(item);

            var data = item.data;

            var leftArr = [],
                rightArr = [];

            var leftLay = item.nodes.panel_yx;
            var rightLay = item.nodes.panel_yx1;
            leftLay.removeAllChildren();
            rightLay.removeAllChildren();

            var wid,
                herInterval,
                lay,
                scale = 1,
                num = 0;
            for (var i = 0; i < 6; i++) {
                var defhero = data[i + 1];

                if (defhero) {
                    if(row < me.sj) {
                        wid = G.class.shero(defhero);
                        wid.setArtifact(data.sqid || "");
                        wid.data = defhero;
                    } else {
                        wid = G.class.shero();
                        wid.panel_tx.loadTextureNormal("img/wangzherongyao/img_wzry_wh.png", 1);
                    }
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
                if(!me.heroInfoShow) {
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

            head.removeAllChildren();
            skill.removeAllChildren();
            skill.setPosition(277, 55);

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
        },
        initUI: function () {
            var me = this;

            // me.ui_mask_xinxi = me.ui.finds('mask_xinxi');
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.mask.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    me.remove();
                }
            });

            me.btn_qd = me.ui.nodes.btn_tz;

            me.btn_qd.touch(function(sender,type){
                if(type==ccui.Widget.TOUCH_ENDED){
                    if(me.DATA.frame == 'wangzherongyao_dld'){
                        if(!G.frame.wangzherongyao.isDLDtime) {
                            G.tip_NB.show(L("BZTZSJ"));
                            return;
                        }
                        if(G.frame.wangzherongyao_dld.DATA.myinfo.remainnum < 1) {
                            G.tip_NB.show(L("TZCSBZ"));
                            return;
                        }
                        var callback = me.DATA.callback;
                        callback && callback();
                    }else{                        
                        me.remove();
                    }
                }
            });

            // me.btn_tz = me.ui_mask_xinxi.finds('btn_tz');
            // me.btn_tz.touch(function(sender,type){
            //     if(type==ccui.Widget.TOUCH_ENDED){
            //         var callback = me.DATA.callback;
            //         if (callback) callback && callback();
            //     }
            // });
        },
        onOpen: function () {
            var me = this;
            // if(me.data().data.headdata.lv < G.DAO.budui.openLvArr[6]){
            //     G.frame.wanjiaxinxi_tiaozhan2.data(me.data()).show();
            // }
            me.fillSize();
            me.initUI();
            me.bindUI();
        },
        onAniShow:function() {
            var me = this;
        },
        onShow: function () {
            var me = this;
            // if (me.data().data.headdata.lv < G.DAO.budui.openLvArr[6]) {
            //     me.hide(false);
            //     return;
            // }
            me.DATA = me.data();
            me.showXinXi();
        },
        onHide: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('rongyaowangzhe_wjxx.json', ID);
})();
