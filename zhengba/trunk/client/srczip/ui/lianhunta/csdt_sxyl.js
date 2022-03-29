/**
 * Created by
 */
(function () {
    //传说大厅
    var ID = 'csdt_sxyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        onOpen: function () {
            var me = this;
            me.conf = G.gc.csdt;
            me.heroid = X.keysOfObject(me.conf.herodz)[0];
            me.heroylid = G.gc.hero[me.heroid].voice[1];
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.initUi();
            me.setContents();
            me.showToper();
        },
        initUi: function () {
            var me = this;
            var heroconf = G.gc.hero[me.heroylid];
            X.render({
                txet_1: function (node) {
                    node.setString(L('csdt1'));
                },
                txet_2: function (node) {
                    node.setString(L('csdt6'));
                },
                txet_name: function (node) {
                    node.setString(heroconf.name);
                },
                panel_tb: function (node) {
                    node.setScale(.5);
                    if (heroconf.zhongzu == 7){
                        node.setBackGroundImage('img/public/ico/ico_zz11.png', ccui.Widget.PLIST_TEXTURE);
                    } else {
                        node.setBackGroundImage('img/public/ico/ico_zz' + (heroconf.zhongzu + 1) + '.png', ccui.Widget.PLIST_TEXTURE);
                    }
                },
                panel_xx: function (node) {
                    G.class.ui_star_mask(node, 15, 0.8);
                },
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        model: heroconf.tenstarmodel,
                        scaleNum: 1
                    });
                },
            }, me.nodes);
        },
        bindBtn: function () {
            var me = this;
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
                panel_btn1: function (node) {
                    node.click(function () {
                        G.frame.fight.data({
                            pvType: 'fightplay',
                            isVideo: true,
                            fightData:G.gc.chuanshuofight
                        }).once('show', function() {

                        }).demo(G.gc.chuanshuofight);
                    });
                },
            }, me.nodes);
            me.nodes.btn_lan.setTouchEnabled(false);
        },
        setContents: function () {
            var me = this;
            var pro;
            var data = me.DATA = X.clone(G.class.hero.getById(me.heroylid));
            var starup = G.class.herostarup.getByIdAndDengjie(me.heroylid, '15');
            data.lv = starup.maxlv;
            data.dengjielv = '15';
            pro = G.class.herostarup.getByIdAndDengjie(me.heroylid, data.dengjielv);
          
            if (!pro) {
                pro = { "atkpro": 2.2, "defpro": 1, "hppro": 2.2, "speedpro": 1.6 };
            }
            // 品级
            G.class.ui_pinji(me.nodes.panel_pinjie, data.dengjielv, 0.8, data.star);

            var herogrowConf = G.class.herogrow.getById(me.heroylid);
            var buffArr = ['atk', 'def', 'hp', 'speed'];
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                data[buffType] = herogrowConf[buffType];
            }
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                data[buffType] = Math.floor((data[buffType] + (data.lv - 1) * herogrowConf[buffType + "_grow"]) * pro[buffType + "pro"]);
            }

            me.nodes.txt_1_1.setString(X.STR('{1}/{2}', data.lv, G.class.herocom.getMaxlv(data.hid, data.dengjielv)));

            //技能
            var interval = 16; // 间隔
            var skillList = G.class.hero.getSkillList(data.hid, data.dengjielv);
            var w = skillList.length * 88 + (skillList.length - 1) * interval; // 星星所占宽度
            var x = (me.nodes.panel_jn.width - w) * 0.5; // 星星初始x

            var buffPro = me.getBuffPro(skillList);
            // 属性
            X.render({
                txt_sx1: parseInt(data.atk * (buffPro["atkpro"] ? 1 + buffPro["atkpro"] / 1000 : 1)), // 攻击
                txt_sx2: parseInt(data.def * (buffPro["defpro"] ? 1 + buffPro["defpro"] / 1000 : 1)), // 防御
                txt_sx3: parseInt(data.hp * (buffPro["hppro"] ? 1 + buffPro["hppro"] / 1000 : 1)), // 生命
                txt_sx4: parseInt(data.speed + (buffPro["speed"] ? buffPro["speed"] : 0)), // 速度
            },me.nodes);

            me.nodes.panel_jn.removeAllChildren();
            for (var i = 0; i < skillList.length; i++) {
                var p = G.class.ui_skill_list(skillList[i], true);
                p.setAnchorPoint(0, 0);
                p.x = x;
                p.y = -10;
                me.nodes.panel_jn.addChild(p);

                x += 88 + interval;
            }
            me.nodes.panel_jn.show();
            me.nodes.ico_tb2.setScale(0.5);
            me.nodes.ico_tb2.setBackGroundImage(G.class.hero.getJobIcoById(data.hid), 1);
            me.nodes.txt_1.setString(L('JOB_' + G.class.hero.getById(data.hid).job));
        },
        getBuffPro: function (skillList) {
            var buffPro = {};
            var bdSkillArr = [];
            for (var i = 0; i < skillList.length; i++) {
                if (skillList[i].skillArr) bdSkillArr = [].concat(bdSkillArr, skillList[i].skillArr);
            }
            var addAttrSkillArr = [];
            for (var i = 0; i < bdSkillArr.length; i++) {
                var skillConf = G.gc.skill[bdSkillArr[i]];
                if (skillConf.type == 1) addAttrSkillArr.push(skillConf);
            }
            for (var i = 0; i < addAttrSkillArr.length; i++) {
                var skillConf = addAttrSkillArr[i];
                if (!buffPro[skillConf.attr]) buffPro[skillConf.attr] = skillConf.v;
                else buffPro[skillConf.attr] += skillConf.v;
            }
            return buffPro;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('csdt_sxyl.json', ID);
})();