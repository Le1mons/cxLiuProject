/**
 * Created by yaosong on 2018-10-24
 */
(function () {
    //英雄信息-进阶成功
    var ID = 'ui_rh_jinjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id);
        },
        setContents:function() {
            var me = this;

            var data = me.data().data;
            var hid = me.data().hid;
            // var conf = G.class.hero.getById(data.hid);
            var oldData = me.data().oldData;
            var extrabuff_name = X.keysOfObject(me.extrabuff)[0];
            var extrabuff_num = me.extrabuff[extrabuff_name];
            var callback = me.data().callback;
            var old_hero = G.class.meltsoul.getById(hid)[oldData.meltsoul].upperlimit;
            var hero = G.class.meltsoul.getById(hid)[data.meltsoul].upperlimit;

            G.class.ani.show({
                json: "ani_ronghuntupo",
                addTo: me.ui.finds("panel_dh"),
                x: 274,
                y: 339,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    node.nodes.sz1.setString(oldData.meltsoul);
                    node.nodes.jh_sz1.setString(data.meltsoul);
                    node.nodes.sz2.setString(old_hero.atk);
                    node.nodes.jh_sz2.setString(hero.atk);
                    node.nodes.sz3.setString(old_hero.hp);
                    node.nodes.jh_sz3.setString(hero.hp);
                    node.nodes.jh_sz4.setString(L(extrabuff_name) + "+"
                        + (extrabuff_name.indexOf("pro") != -1 ? extrabuff_num / 10 + "%" : extrabuff_num));
                    action.playWithCallback('in', false, function () {
                        me.nodes.mask.setTouchEnabled(true);
                        action.play('wait', true);
                        me.nodes.mask.click(function(){
                            me.remove();
                        });
                        callback && callback();
                    });
                },
            });
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
            me.extrabuff = me.data().extrabuff;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
            me.event.emit("hide");
            // if(me.skill) {
            //     G.frame.yingxiong_xxxx.qh.skillMove(me.skill.clone());
            // }
        },
    });

    G.frame[ID] = new fun('ui_jingjie.json', ID);
})();
