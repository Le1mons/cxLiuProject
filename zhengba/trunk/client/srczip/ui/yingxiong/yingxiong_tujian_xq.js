/**
 * Created by wfq on 2018/5/22.
 */
(function () {
    //
    G.class.yingxiong_tujian_xq = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('yingxiong_yxqh.json');
        },
        refreshPanel: function () {
            var me = this;

            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

            // 感叹号提示
            me.nodes.btn_tishi.click(function(){
                G.frame.ui_top_xq.data({tid:me.curXbId}).show();
            });
            var heroArr = G.class.hero.getHeroByPinglun(me.DATA.pinglunid);
            me.nodes.btn_sxyl.setVisible(heroArr.length > 1);
            me.nodes.btn_sxyl.click(function(){
                G.frame.yingxiong_tujian_yl.data(heroArr).show();
            });
        },
        onOpen: function () {
            var me = this;

        },
        onShow: function () {
            var me = this;

            me.refreshPanel();

            
            G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
                me.refreshPanel();
            }, me.getViewJson());
            me.bindBTN();
        },
        onRemove: function () {
            var me = this;
        },
        onNodeShow: function () {
            var me = this;

            // me.refreshPanel();
        },
        setContents: function () {
            var me = this;
            var pro;
            var arr = me.curXbId.split('_');
            var data = me.DATA =  X.clone(G.class.hero.getById(arr[0]));
            if (arr.length > 1) {
                var starup = G.class.herostarup.getByIdAndDengjie(arr[0],'10');
                data.lv = starup.maxlv;
                data.dengjielv = '10';
                pro = G.class.herostarup.getByIdAndDengjie(arr[0], data.dengjielv);
            } else {
                data.dengjielv = data.star;
                data.lv = G.class.herocom.getMaxlv(arr[0], data.dengjielv);
                pro = G.class.herocom.getHeroJinJieUp(data.dengjielv);
            }
            if(!pro){
                pro = {"atkpro":2.2,"defpro":1,"hppro":2.2,"speedpro":1.6};
            }
            // 品级
            G.class.ui_pinji(me.nodes.panel_pinjie, data.dengjielv, 0.8 ,data.star);

            // 等级
            me.nodes.panel_xh.hide();
            me.nodes.img_zgdj.show();

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

            me.nodes.txt_djz.setString(X.STR('{1}/{2}',data.lv, G.class.herocom.getMaxlv(data.hid, data.dengjielv)));

            //技能
            var interval = 16; // 间隔
            var skillList = G.class.hero.getSkillList(data.hid, data.dengjielv);
            var w = skillList.length * 88 + (skillList.length - 1) * interval; // 星星所占宽度
            var x = (me.nodes.panel_jn.width - w) * 0.5; // 星星初始x

            var buffPro = me.getBuffPro(skillList);
            // 属性
            me.render({
                txt_sx1:parseInt(data.atk * (buffPro["atkpro"] ? 1 + buffPro["atkpro"] / 1000 : 1)), // 攻击
                txt_sx2:parseInt(data.def * (buffPro["defpro"] ? 1 + buffPro["defpro"] / 1000 : 1)), // 防御
                txt_sx3:parseInt(data.hp * (buffPro["hppro"] ? 1 + buffPro["hppro"] / 1000 : 1)), // 生命
                txt_sx4:parseInt(data.speed + (buffPro["speed"] ? buffPro["speed"] : 0)), // 速度
            });

            me.nodes.panel_jn.removeAllChildren();
            for (var i = 0; i < skillList.length; i++){
                var p = G.class.ui_skill_list(skillList[i], true);
                p.setAnchorPoint(0,0);
                p.x = x;
                p.y = -10;
                me.nodes.panel_jn.addChild(p);

                x += 88 + interval;
            }
            var imgJob = me.ui.finds('zy');
            var txtJob = me.ui.finds('zy_wz');

            imgJob.setBackGroundImage(G.class.hero.getJobIcoById(data.hid),1);
            txtJob.setString(L('JOB_' + G.class.hero.getById(data.hid).job));
            me.nodes.btn_up.hide();
            me.nodes.btn_tishi.hide();
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

})();