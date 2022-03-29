/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-升星成功
    var ID = 'ui_shengxing';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function(){
                if(!me.isAniOver) return;
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_jinjieshengxing",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2 - 15,
                repeat: true,
                autoRemove: false
            });
            me.curXbId = me.data();
            me.setContents();
        },
        onRemove: function () {
            var me = this;
            me.event.emit("hide");
            G.event.emit("showPackage");
        },
        setContents:function() {
            var me = this;

            var data = G.DATA.yingxiong.list[me.curXbId];

            var oldData = G.DATA.yingxiong.oldData;

            // 头像左
            var widget = G.class.shero(oldData);
            // widget.setScale(0.8);
            widget.setAnchorPoint(0.5,0.5);
            widget.setPosition(cc.p( me.nodes.panel_ico1.width*0.5, me.nodes.panel_ico1.height*0.5 ));
            me.nodes.panel_ico1.addChild(widget);

            // 头像右
            var widget2 = G.class.shero(data);
            // widget2.setScale(0.8);
            widget2.setAnchorPoint(0.5,0.5);
            widget2.setPosition(cc.p( me.nodes.panel_ico2.width*0.5, me.nodes.panel_ico2.height*0.5 ));
            me.nodes.panel_ico2.addChild(widget2);

            if(data.star > 10) {
                me.nodes.panel_jn1.hide();
                me.nodes.panel_jn2.hide();
                me.ui.finds("Text_16").hide();
                me.nodes.img_arrow2.hide();
                me.nodes.txt_sx5_1.show();
                me.nodes.txt_sx5_2.show();
                me.nodes.img_arrow7.show();
                me.nodes.txt_sx5_1.setString(L("DWCC") + (oldData.star - 10));
                me.nodes.txt_sx5_2.setString(data.star - 10);
            }

            // 技能左
            var skill = G.class.hero.getCanUpgradeSkill(data.hid, data.dengjielv-1);
            var jineng = G.class.ui_skill_list(skill, true);
            jineng.setAnchorPoint(0.5,0.5);
            jineng.setPosition(cc.p( me.nodes.panel_jn1.width*0.5, me.nodes.panel_jn1.height*0.5 ));
            me.nodes.panel_jn1.addChild(jineng);

            // 技能右
            skill = G.class.hero.getSkillOne(skill.idx, data.hid, data.dengjielv);
            var jineng2 = G.class.ui_skill_list(skill, true);
            jineng2.setAnchorPoint(0.5,0.5);
            jineng2.setPosition(cc.p( me.nodes.panel_jn2.width*0.5, me.nodes.panel_jn2.height*0.5 ));
            me.nodes.panel_jn2.addChild(jineng2);

            X.setHeroModel({
                parent: me.nodes.panel_shengxingrw,
                data: data,
                callback: function (node) {
                    node.zIndex = 10;
                }
            });

            me.ui.setTimeout(function () {
                G.class.ani.show({
                    json: "fz_jssx",
                    addTo: me.nodes.panel_shengxingrw,
                    x: me.nodes.panel_shengxingrw.width / 2,
                    y: 0,
                    repeat: false,
                    autoRemove: true,
                    onload: function (node) {
                        node.zIndex = 11;
                    }
                });

                G.class.ani.show({
                    json: "fz_jssx_0",
                    addTo: me.nodes.panel_shengxingrw,
                    x: me.nodes.panel_shengxingrw.width / 2,
                    y: 0,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.zIndex = 9;
                        action.playWithCallback("pan_chuxian", false, function () {
                            me.isAniOver = true;
                            action.play("pan_zhuan", true);
                        })
                    }
                });

                G.class.ui_star(me.ui.finds("panel_xx1"), data.star, 5, null, null, 15);
                if(data.star < 10) {
                    me.ui.finds("panel_xx1").children[me.ui.finds("panel_xx1").children.length - 1].hide();
                    G.class.ani.show({
                        json: data.star >= 10 ? "ani_shengxing_xingxing2" : "ani_shengxing_xingxing",
                        addTo: me.ui.finds("panel_xx1"),
                        x: me.ui.finds("panel_xx1").children[me.ui.finds("panel_xx1").children.length - 1].x,
                        y: me.ui.finds("panel_xx1").children[me.ui.finds("panel_xx1").children.length - 1].y,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            node.setAnchorPoint(0.5, 0.5);
                            action.playWithCallback("chuxian", false, function () {
                                action.play("xunhuan", true);
                            })
                        }
                    });
                }
            }, 200);



            me.ui.render({
                // 属性提升左
                txt_sx1_1: L("DJSX") + G.class.herocom.getMaxlv(data.hid,oldData.dengjielv),
                txt_sx2_1: L("XUELIANG") + oldData.hp,
                txt_sx3_1: L("GONGJI") + oldData.atk,
                txt_sx4_1: L("ZANLI") + oldData.zhanli,

                // 属性提升右
                txt_sx1_2: G.class.herocom.getMaxlv(data.hid,data.dengjielv),
                txt_sx2_2: data.hp,
                txt_sx3_2: data.atk,
                txt_sx4_2: data.zhanli
            });
        },
    });

    G.frame[ID] = new fun('ui_shengxing.json', ID);
})();