/**
 * Created by wfq on 2018/6/27.
 */
(function () {
    //公会-科技
    var ID = 'gonghui_keji';

    var fun = X.bUi.extend({
        extConf:{
            skillnum:8
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L('GHKJ'));

            me.createMenu();
        },
        bindBtn: function () {
            var me = this;



            var panel = me._view;
            panel.nodes.btn_refresh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                   G.frame.alert_gm.data({
                       title:L('CHONGZHI'),
                       intr:L('GONGHUI_KEJI_TIP1'),
                       need:me.DATA.resetnum[me.curType] ? G.class.gonghui.get().base.kejiresetneed : [{"a":"attr","t":"rmbmoney","n":0}],
                       callback: function () {
                           G.ajax.send('ghkeji_clear',[me.curType],function(d) {
                               if(!d) return;
                               var d = JSON.parse(d);
                               if(d.s == 1) {
                                   G.event.emit("sdkevent", {
                                       event: "ghkeji_clear"
                                   });
                                   // G.tip_NB.show(L('JIESU') + L('SUCCESS'));
                                   if(d.d.prize) {
                                       G.frame.jiangli.data({
                                           prize: d.d.prize
                                       }).show();
                                   }
                                   G.frame.alert_gm.remove();
                                   delete me.idx;
                                   me.getData(function () {
                                       me.setSkillLayout(me.selectPanel, me.curType);
                                   });
                               }
                           },true);
                       }
                   }).show();

                }
            });

            var layout = new ccui.Layout();
            layout.setContentSize(640, 50);
            layout.zIndex = 10;
            layout.setAnchorPoint(0.5, 0.5);
            layout.setName("zz");
            layout.setTouchEnabled(true);
            layout.setPosition(me.ui.width / 2, me.ui.height / 2 + 430);
            me.ui.addChild(layout);

        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
                new X.bView('gonghui_tip2_ghkj2.json', function (view) {
                    me._view = view;
                    me.nodes.panel_nr.removeAllChildren();
                    me.nodes.panel_nr.addChild(view);
                    me.initUi();
                    me.bindBtn();
                    me._view.nodes.btn_zhanshi.triggerTouch(ccui.Widget.TOUCH_ENDED);

                    if(!me._view.nodes.btn_lvup.data) me._view.nodes.btn_lvup.data = [];
                    me._view.nodes.btn_lvup.click(function (sender, type) {
                        me.upLv();
                    }, 1000);

                    me._view.nodes.btn_lvup1.click(function (sender, type) {
                        me.upLv(true);
                    }, 1000);
                });
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onHide: function () {
            var me = this;
        },
        refreshData: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send('ghkeji_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },

        //判断是否到了开服180天
        isReachTime:function(){
            var me = this;
            var isOK = false;
            var kfdate = X.getSeverDay();
            if(kfdate > 180){
                isOK = true;
            }
            return isOK;
        },

        //判断是否满级
        isMaxLv:function(){
          var me = this;
          var conf = G.gc.gonghui.base.skill;
          var isMax = true;
          for (var i in conf){
              var maxlv = conf[i].maxlv;
              if (!me.DATA.kejidata[i] || me.DATA.kejidata[i]<maxlv){
                  isMax = false;
                  break;
              }
          }
          return isMax;
        },
        createMenu: function () {
            var me = this;

            X.radio([me._view.nodes.btn_zhanshi, me._view.nodes.btn_fashi, me._view.nodes.btn_mushi, me._view.nodes.btn_cike, me._view.nodes.btn_youxia], function (sender) {

                var name = sender.getName();
                var name2type = {
                    btn_zhanshi$: "zs",
                    btn_fashi$: "fs",
                    btn_mushi$: "ms",
                    btn_cike$: "ck",
                    btn_youxia$: "yx"
                };

                me.changeType(name2type[name]);
            });

            me.skillLayout = [
                me._view.finds("panel_skill_zs"),
                me._view.finds("panel_skill_fs"),
                me._view.finds("panel_skill_ms"),
                me._view.finds("panel_skill_ck"),
                me._view.finds("panel_skill_yx")
            ];

            me.jobArr = {
                zs: 1,
                fs: 2,
                ms: 3,
                ck: 4,
                yx: 5
            }
        },
        changeType: function (type) {
            var me = this;
            var idx;
            if (me.curType == me.jobArr[type]) return;
            me.curType = me.jobArr[type];

            for (var i in me.skillLayout) {
                var nameArr = me.skillLayout[i].getName().split("_");
                if(nameArr[2] !== type) {
                    me.skillLayout[i].hide();
                }else {
                    idx = i;
                    me.selectPanel = me.skillLayout[i];
                    me.skillLayout[i].show();
                    me.setSkillLayout(me.skillLayout[i], me.jobArr[type]);
                }
            }
        },
        setSkillLayout: function(layout, type) {
            var me = this;
            var isMax = me.isMaxLv();
            var isReachtime = me.isReachTime();
            var skillArr = G.class.gonghui.get().base.keji[type].skill;
            for (var i = 0; i < skillArr.length; i ++) {
                var skillid = skillArr[i];
                var lay = layout.finds("jn" + (i + 1));
                var conf = G.class.gonghui.getSkillConfById(skillid);
                var item = G.class.sskill(conf,me.DATA.kejidata[skillid] || 0, null, i + 1,isMax,isReachtime);
                item.setName('item');
                item.setPosition(cc.p(lay.width / 2,lay.height / 2));
                lay.data = item.data = skillid;
                lay.idx = i + 1;
                me.setItem(item);
                lay.removeAllChildren();
                lay.addChild(item);
                lay.setTouchEnabled(true);
                lay.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        me.setXuanZhong(sender);
                        me.setDetail(sender);
                    }
                });
            }
            if(!me.idx) {
                layout.finds("jn1").triggerTouch(ccui.Widget.TOUCH_ENDED);
            }else {
                layout.finds("jn" + me.idx).triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
        },
        setItem: function (item) {
            var me = this;

            var skillid = item.data;
            var skillArr = G.class.gonghui.get().base.keji[me.curType].skill;
            var idx = X.arrayFind(skillArr,skillid);

            if (!skillArr[idx - 1]) {
                item.setHighLight(true);
            } else if (skillArr[idx - 1] && (me.DATA.kejidata[skillArr[idx - 1]] >= 10)) {
                //上一个存在并且等级大于等于10
                item.setHighLight(true);
            } else {
                item.setHighLight(true);
            }

        },
        setXuanZhong: function (sender) {
            var me = this;

            var panel = me._view;

            var skillArr = G.class.gonghui.get().base.keji[me.curType].skill;
            for (var i = 0; i < skillArr.length; i++) {
                var lay = me.selectPanel.finds("jn" + (i + 1));

                if (lay.data == sender.data) {
                    lay.getChildren()[0].setXuanzhong(true);
                } else {
                    lay.getChildren()[0].setXuanzhong(false);
                }
            }
        },
        setDetail: function (sender) {
            var me = this;
            var panel = me._view;
            var skillid = me.curSkillid = sender.data;
            var lv = me.DATA.kejidata[skillid] || 0;
            var conf = G.class.gonghui.getSkillConfById(skillid);
            var isMax = me.isMaxLv();
            var isReachTime = me.isReachTime();
            me.idx = sender.idx;

            X.render({
                btn_lvup: function (node) {
                    // node.setTouchEnabled(false);
                    // node.setEnableState(false);
                    // node.setTitleColor(cc.color("#6c6c6c"));
                    node.hide();


                    //满级后隐藏按钮
                    if(!isMax){
                        if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
                            node.show();
                        }
                    }else{
                        if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv_1) {
                            node.show();
                        }
                    }
                    // if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
                    //     node.show();
                    // }

                    if (sender.finds('item').isHighLight) {
                        // node.setEnableState(true);
                        // node.setTouchEnabled(true);
                        // node.setTitleColor(cc.color("#2f5719"));
                    }
                },
                btn_lvup1: function (node) {
                    node.hide();


                    //满级后隐藏按钮
                    if(!isMax){
                        if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
                            node.show();
                        }
                    }else{
                        if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv_1) {
                            node.show();
                        }
                    }
                    // if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
                    //     node.show();
                    // }
                },
                txt_lv2: function (node) {
                    if(isMax && isReachTime){
                        var str = lv + '/' + conf.maxlv_1;
                    }else{
                        var str = lv + '/' + conf.maxlv;
                    }
                    node.setString(str);
                },
                txt_now: conf.name,
                show_ico_skill: function (node) {
                    node.removeAllChildren();

                    var conf = G.class.gonghui.getSkillConfById(skillid);
                    var item = G.class.sskill(conf,me.DATA.kejidata[skillid] || 0);
                    item.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(item);
                },
                listview_attribute: function (node) {
                    cc.enableScrollBar(node);
                    node.removeAllChildren();

                    var buffFmt = conf.buff;
                    var buff = {},
                        nextBuff = {};
                    for (var key in buffFmt) {
                        var value = G.class.formula.compute(buffFmt[key],{lv:lv});
                        var nextValue = G.class.formula.compute(buffFmt[key],{lv:lv + 1});
                        buff[key] = value;
                        nextBuff[key] = nextValue;
                    }

                    var buffList =  X.fmtBuff(buff,false,{nofilterZero:true});
                    for (var i = 0; i < buffList.length; i++) {
                        var bl = buffList[i];
                        var item = panel.nodes.panel_attribute.clone();
                        setItem(item,bl);
                        node.pushBackCustomItem(item);
                        item.show();
                    }

                    //等级开放
                    if (!sender.finds('item').isHighLight) {
                        var item = panel.nodes.panel_attribute.clone();
                        setTextWithColor(item.finds('wz1$'),L('GONGHUI_KEJI_OPEN'),G.gc.COLOR[5]);
                        item.finds('wz_dq$').hide();
                        item.finds('Image_32').hide();
                        item.finds('wz_zz$').hide();
                        node.pushBackCustomItem(item);
                        item.show();
                    }

                    function setItem(ui,data) {
                        X.autoInitUI(ui);

                        X.render({
                            wz1:L('JOB_' + me.curType) + L(data.k) + ((data.k == "pvpdpspro" || data.k == "pvpundpspro") ? "" : L('ZENGJIA')),
                            wz_dq:'+' + data.sz,
                            wz_zz: function (node) {
                                var obj = {};
                                obj[data.k] = nextBuff[data.k];
                                var listcmp = X.fmtBuff(obj,false,{nofilterZero:true});

                                node.setString( '+' + listcmp[0].sz);
                                if (lv == conf.maxlv) {
                                    ui.finds('Image_32').hide();
                                    ui.nodes.wz_zz.hide();
                                }
                                // lv == conf.maxlv && ui.finds('panel_numerical').hide();
                            }
                        },ui.nodes);
                    }

                },
                txt_gold: function (node) {
                    // if(!isMax){
                    //     var need = G.class.formula.compute(conf.need[0].n,{lv:me.DATA.kejidata[me.curSkillid] || 0});
                    //     var ownNum = G.class.getOwnNum(conf.need[0].t,conf.need[0].a);
                    // }else{
                    //     var need = G.class.formula.compute(conf.need_1[0].n,{lv:me.DATA.kejidata[me.curSkillid] || 0})
                    //     var ownNum = G.class.getOwnNum(conf.need_1[0].t,conf.need_1[0].a);
                    // }
                    if(isMax && isReachTime){
                            var need = G.class.formula.compute(conf.need_1[0].n,{lv:me.DATA.kejidata[me.curSkillid] || 0})
                            var ownNum = G.class.getOwnNum(conf.need_1[0].t,conf.need_1[0].a);
                    }else{
                            var need = G.class.formula.compute(conf.need[0].n,{lv:me.DATA.kejidata[me.curSkillid] || 0});
                            var ownNum = G.class.getOwnNum(conf.need[0].t,conf.need[0].a);
                    }
                    // var ownNum = G.class.getOwnNum(conf.need[0].t,conf.need[0].a);
                    // var str = X.fmtValue(ownNum) + '/' + X.fmtValue(need);
                    var str = X.fmtValue(need);
                    setTextWithColor(node,str,G.gc.COLOR[ownNum >= need ? 'n4' : 'n16']);
                    if(ownNum < need ) {
                        X.enableOutline(node, cc.color('#740000'), 1);
                    }else{
                        X.disableOutline(node);
                    }
                },
                txt_contribution: function (node) {
                    // if(!isMax){
                    //     var need = G.class.formula.compute(conf.need[1].n, {lv: me.DATA.kejidata[me.curSkillid] || 0});
                    //     var ownNum = G.class.getOwnNum(conf.need[1].t, conf.need[1].a);
                    // }else{
                    //     var need = G.class.formula.compute(conf.need_1[1].n, {lv: me.DATA.kejidata[me.curSkillid] || 0});
                    //     var ownNum = G.class.getOwnNum(conf.need_1[1].t, conf.need_1[1].a);
                    // }
                    if(isMax && isReachTime){
                        var need = G.class.formula.compute(conf.need_1[1].n, {lv: me.DATA.kejidata[me.curSkillid] || 0});
                        var ownNum = G.class.getOwnNum(conf.need_1[1].t, conf.need_1[1].a)
                    }else{
                        var need = G.class.formula.compute(conf.need[1].n, {lv: me.DATA.kejidata[me.curSkillid] || 0});
                        var ownNum = G.class.getOwnNum(conf.need[1].t, conf.need[1].a);
                    }
                    // var need = G.class.formula.compute(conf.need[1].n, {lv: me.DATA.kejidata[me.curSkillid] || 0});
                    // var ownNum = G.class.getOwnNum(conf.need[1].t, conf.need[1].a);
                    // var str = X.fmtValue(ownNum) + '/' + X.fmtValue(need);
                    var str = X.fmtValue(need);
                    setTextWithColor(node, str, G.gc.COLOR[ownNum >= need ? 'n4' : 'n16']);
                    if(ownNum < need ) {
                        X.enableOutline(node, cc.color('#740000'), 1);
                    }else{
                        X.disableOutline(node);
                    }

                }
            },panel.nodes);

            // if(!isMax){
            //     panel.finds("txt_lv").setString(me.DATA.kejidata[skillid] == conf.maxlv ? L('MAX_LV') : L('CUR_LV') + '：');
            // }else{
            //     panel.finds("txt_lv").setString(me.DATA.kejidata[skillid] == conf.maxlv_1 ? L('MAX_LV') : L('CUR_LV') + '：');
            // }
            if(isMax && isReachTime){
                panel.finds("txt_lv").setString(me.DATA.kejidata[skillid] == conf.maxlv_1 ? L('MAX_LV') : L('CUR_LV') + '：');
            }else{
                panel.finds("txt_lv").setString(me.DATA.kejidata[skillid] == conf.maxlv ? L('MAX_LV') : L('CUR_LV') + '：');
            }
            // panel.finds("txt_lv").setString(me.DATA.kejidata[skillid] == conf.maxlv ? L('MAX_LV') : L('CUR_LV') + '：');

            //满级消耗隐藏
            panel.finds('panel_gold').hide();
            panel.finds('panel_contribution').hide();

            // if(!isMax){
            //     if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
            //         panel.finds('panel_gold').show();
            //         panel.finds('panel_contribution').show();
            //     }
            // }else{
            //     if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv_1) {
            //         panel.finds('panel_gold').show();
            //         panel.finds('panel_contribution').show();
            //     }
            // }
            if(isMax && isReachTime){
                if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv_1) {
                            panel.finds('panel_gold').show();
                            panel.finds('panel_contribution').show();
                        }
            }else{
                if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
                            panel.finds('panel_gold').show();
                            panel.finds('panel_contribution').show();
                        }
            }
            // if (!me.DATA.kejidata[skillid] || me.DATA.kejidata[skillid] < conf.maxlv) {
            //     panel.finds('panel_gold').show();
            //     panel.finds('panel_contribution').show();
            // }
        },
        upLv: function (more) {
            var me = this;
            var conf = G.class.gonghui.getSkillConfById(me.curSkillid);
            var isMax = me.isMaxLv();
            var isReachTime = me.isReachTime();
            me.ajax("ghkeji_lvup", [me.curType, me.curSkillid, more], function (str, data) {
                if (data.s == 1) {
                    X.audio.playEffect("sound/kejishengji.mp3");
                    me.DATA.kejidata[me.curSkillid] = data.d;
                    // if(!isMax){
                    //     if (me.DATA.kejidata[me.curSkillid] > conf.maxlv) {
                    //         me.DATA.kejidata[me.curSkillid] = conf.maxlv;
                    //     }
                    // }else{
                    //     if (me.DATA.kejidata[me.curSkillid] > conf.maxlv_1) {
                    //         me.DATA.kejidata[me.curSkillid] = conf.maxlv_1;
                    //     }
                    // }
                    if(isMax && isReachTime){
                        if (me.DATA.kejidata[me.curSkillid] > conf.maxlv_1) {
                            me.DATA.kejidata[me.curSkillid] = conf.maxlv_1;
                        }
                    }else{
                            if (me.DATA.kejidata[me.curSkillid] > conf.maxlv) {
                                me.DATA.kejidata[me.curSkillid] = conf.maxlv;
                            }
                    }
                    // if (me.DATA.kejidata[me.curSkillid] > conf.maxlv) {
                    //     me.DATA.kejidata[me.curSkillid] = conf.maxlv;
                    // }
                    me.setSkillLayout(me.selectPanel, me.curType);
                } else {
                    X.audio.playEffect("sound/dianji.mp3", false);
                }
            });
        }
    });

    G.frame[ID] = new fun('gonghui_tip2.json', ID);
})();