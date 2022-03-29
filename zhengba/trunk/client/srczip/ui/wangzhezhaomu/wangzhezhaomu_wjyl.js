/**
 * Created by  on 2019//.
 */
(function () {
    //武将预览
    var ID = 'wangzhezhaomu_wjyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.type = me.data().type;
            if(me.type == 'show'){
                me.DATA = me.data().data;
            }else {
                me.DATA = [];
                for(var i = 0; i < me.data().data.length; i++){
                    var data = me.data().data[i];
                    me.DATA.push(data.prize[0].t);
                }
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.list_yulan.hide();
            cc.enableScrollBar(me.ui.finds('scrollview'));
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
            var Layer = new ccui.Layout();
            Layer.setContentSize(cc.size(600,210));
            me.ui.addChild(Layer);
            Layer.setTouchEnabled(true);
            Layer.click(function(){
                me.remove();
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;

            var data = me.DATA;
            if (!me.table) {
                me.table = new X.TableView(me.ui.finds('scrollview'), me.nodes.list_yulan, 1, function (ui, data,pos) {
                    me.setItem(ui, data,pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data,index) {
            var me = this;
            ui.show();
            ui.setTouchEnabled(false);
            X.autoInitUI(ui);
            ui.nodes.di_bg.loadTexture(index == 0? "img/event/yingxiong_yulan1.png":"img/event/yingxiong_yulan2.png",1)
            var conf = X.clone(G.class.hero.getById(data));
            if(conf.tenstarmodel && conf.tenstarmodel != ""){//有10星英雄
                var starup = G.class.herostarup.getByIdAndDengjie(data,'10');
                conf.lv = starup.maxlv;
                conf.dengjielv = '10';
                pro = G.class.herostarup.getByIdAndDengjie(data, conf.dengjielv);
            }else {
                conf.dengjielv = conf.star;
                conf.lv = G.class.herocom.getMaxlv(data, conf.dengjielv);
                pro = G.class.herocom.getHeroJinJieUp(conf.dengjielv);
            }
            if(!pro){
                pro = {"atkpro":2.2,"defpro":1,"hppro":2.2,"speedpro":1.6};
            }
            var herogrowConf = G.class.herogrow.getById(data);
            var buffArr = ['atk','def','hp','speed'];
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                conf[buffType] = herogrowConf[buffType];
            }
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                conf[buffType] = Math.floor((conf[buffType] + (conf.lv - 1) * herogrowConf[buffType + "_grow"]) * pro[buffType + "pro"]);
            }
            //模型
            (function(ui,conf){
                X.setHeroModel({
                    parent: ui.nodes.rw,
                    data: conf,
                    cache:false
                });
            }(ui,conf))
            //名字
            ui.nodes.yingxiong_mz.setString(conf.name);
            ui.nodes.yingxiong_mz.setTextColor(cc.color(index == 0? "#ff7013":"#d7a101"));

            //等级
            ui.nodes.dengjishu.setString(X.STR('{1}/{2}',conf.lv, G.class.herocom.getMaxlv(conf.hid, conf.dengjielv)));
            //属性
            var skillList = G.class.hero.getSkillList(conf.hid, conf.dengjielv);
            var buffPro = me.getBuffPro(skillList);
            X.render({
                gongji_wz:parseInt(conf.atk * (buffPro["atkpro"] ? 1 + buffPro["atkpro"] / 1000 : 1)), // 攻击
                fangyu_wz:parseInt(conf.def * (buffPro["defpro"] ? 1 + buffPro["defpro"] / 1000 : 1)), // 防御
                shengming_wz:parseInt(conf.hp * (buffPro["hppro"] ? 1 + buffPro["hppro"] / 1000 : 1)), // 生命
                sudu_wz:parseInt(conf.speed + (buffPro["speed"] ? buffPro["speed"] : 0)), // 速度
            },ui.nodes);
            //技能
            ui.nodes.ico_jnk.removeAllChildren();
            ui.nodes.ico_jnk.setSwallowTouches(false);
            ui.nodes.btn_1.setSwallowTouches(false);
            ui.nodes.txt_dqxz.setTouchEnabled(false);
            if(me.type == 'show'){
                var skillarr = [];
                for (var i = 0; i < skillList.length; i++) {
                    var p = G.class.ui_skill_list(skillList[i], true, null, null, conf);
                    p.setAnchorPoint(0, 0);
                    skillarr.push(p);
                }
                X.left(ui.nodes.ico_jnk,skillarr,0.8,0,0);
            }else {
                ui.nodes.btn_1.setVisible(data != G.frame.wangzhezhaomu_main.view.DATA.zhaomu.hid);
                ui.nodes.txt_dqxz.setVisible(data == G.frame.wangzhezhaomu_main.view.DATA.zhaomu.hid);
                ui.nodes.btn_1.index = index;
                ui.nodes.btn_1.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        connectApi('wangzhezhaomu_zhaomuchoosehero',[sender.index],function (data) {
                            G.frame.wangzhezhaomu_main.view.DATA.zhaomu = data.zhaomu;
                            me.setContents();
                            G.frame.wangzhezhaomu_main.view.showBox();
                            G.frame.wangzhezhaomu_main.view.setContents();
                        })
                    }
                })
            }
        },
        getBuffPro: function (skillList) {
            var buffPro = {};
            var bdSkillArr = [];

            for (var i = 0; i < skillList.length; i ++) {
                if (skillList[i].skillArr) bdSkillArr = [].concat(bdSkillArr, skillList[i].skillArr);
            }

            var addAttrSkillArr = [];

            for (var i = 0; i < bdSkillArr.length; i ++) {
                var skillConf = G.gc.skill[bdSkillArr[i]];

                if (skillConf.type == 1) addAttrSkillArr.push(skillConf);
            }

            for (var i = 0; i < addAttrSkillArr.length; i ++) {
                var skillConf = addAttrSkillArr[i];

                if (!buffPro[skillConf.attr]) buffPro[skillConf.attr] = skillConf.v;
                else buffPro[skillConf.attr] += skillConf.v;
            }

            return buffPro;
        }
    });
    G.frame[ID] = new fun('event_chuanqizhaomu_yulan.json', ID);
})();