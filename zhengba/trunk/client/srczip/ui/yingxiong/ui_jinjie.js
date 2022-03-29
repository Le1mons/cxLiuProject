/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-进阶成功
    var ID = 'ui_jinjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id);
        },
        setContents:function() {
            var me = this;

            var data = G.DATA.yingxiong.list[me.curXbId];
            var conf = G.class.hero.getById(data.hid);
            var oldData = G.DATA.yingxiong.oldData;


            G.class.ani.show({
                json: "ani_yingxiongjinjie",
                addTo: me.ui.finds("panel_dh"),
                x: 274,
                y: 339,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    node.nodes.sz1.setString(G.class.herocom.getMaxlv(data.hid,oldData.dengjielv));
                    node.nodes.jh_sz1.setString(G.class.herocom.getMaxlv(data.hid,data.dengjielv));
                    node.nodes.sz2.setString(oldData.atk);
                    node.nodes.jh_sz2.setString(data.atk);
                    node.nodes.sz3.setString(oldData.def);
                    node.nodes.jh_sz3.setString(data.def);
                    node.nodes.sz4.setString(oldData.hp);
                    node.nodes.jh_sz4.setString(data.hp);
                    node.nodes.sz5.setString(oldData.speed);
                    node.nodes.jh_sz5.setString(data.speed);
                    action.playWithCallback('in', false, function () {
                        me.nodes.mask.setTouchEnabled(true);
                        action.play('wait', true);
                        me.nodes.mask.click(function(){
                            me.remove();
                        });
                    });
                },
            });
            me.showNewSkill();
            // 换了结构
            // var setItem = function(target, title, oval, nval){
                // var item = me.nodes.list.clone();
                // X.autoInitUI(item);
                // X.render({
                //     txt_1: title,
                //     txt_2: oval,
                //     txt_3: nval
                // }, item.nodes);
                //
                // item.setAnchorPoint(0,0);
                // item.setPosition(cc.p(-500, 0));
                // item.show();
                // target.removeAllChildren();
                // target.addChild(item);
                // var actby = cc.moveBy(0.25,cc.p(500,0));
                // // var seq = cc.sequence(actby, cc.callFunc(function () {
                // //     me.nodes.mask.setTouchEnabled(true);
                // // }));
                // item.runAction(actby);
            //     G.class.ani.show({
            //         json: "ani_yingxiongjinjie",
            //         addTo: target,
            //         x: 100,
            //         y: 10,
            //         repeat: false,
            //         autoRemove: true,
            //         onend : function (node, action) {
            //             switch (n){
            //                 case 0 :
            //                     setItem(me.nodes.panel_2, '攻击力：', oldData.atk, data.atk);
            //                     ++n;
            //                     break;
            //                 case 1 :
            //                     setItem(me.nodes.panel_3, '防御：', oldData.def, data.def);
            //                     ++n;
            //                     break;
            //                 case 2 :
            //                     setItem(me.nodes.panel_4, '生命：', oldData.hp, data.hp);
            //                     ++n;
            //                     break;
            //                 case 3 :
            //                     setItem(me.nodes.panel_5, '速度：', oldData.speed, data.speed);
            //                     ++n;
            //                     me.nodes.mask.setTouchEnabled(true);
            //         fight_win_battle            break;
            //             }
            //         }
            //     });
            // };
            // setItem(me.nodes.panel_1, '等级上限：', G.class.herocom.getMaxlv(data.hid,oldData.dengjielv), G.class.herocom.getMaxlv(data.hid,data.dengjielv));
        },
        showNewSkill: function(){
            var me = this;

            var view = me._view;
            var data = G.DATA.yingxiong.list[me.curXbId];
            var conf = G.class.hero.getById(data.hid);

            var idx = X.arrayFind(conf.bdskillopendjlv, data.dengjielv);
            if( idx > -1 ){
                me.nodes.txt_4.show();

                // G.class.ani.show({
                //     json: "ani_yingxiongjinjie_guangxiao",
                //     addTo: me.nodes.panel_jn,
                //     x: me.nodes.panel_jn.width / 2,
                //     y: me.nodes.panel_jn.height / 2,
                //     repeat: true,
                //     autoRemove: false
                // });

                var skill = G.class.hero.getSkillOne(idx+1, data.hid, data.dengjielv);
                var p = G.class.ui_skill_list(skill, true, null, null, data);
                p.setAnchorPoint(0.5,0.5);
                p.setPosition(cc.p( me.nodes.panel_jn.width*0.5, me.nodes.panel_jn.height*0.5 ));
                me.skill = p;
                me.nodes.panel_jn.addChild(p);
                p.zIndex = 999;
            }else{
                me.nodes.txt_4.hide();
            }
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.setTouchEnabled(true);
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
        },
        onShow: function () {
            var me = this;
            var ani = me.ui.finds("panel_dh");
            G.class.ani.show({
                json: "ani_yingxiongjinjie2",
                addTo: me.ui.finds("panel_bg"),
                x: 277,
                y: 349,
                repeat: true,
                autoRemove: false
            });
            me.nodes.txt_4.hide();
            me.curXbId = me.data().tid;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
            me.event.emit("hide");
        },
    });

    G.frame[ID] = new fun('ui_jingjie.json', ID);
})();