/**
 * Created by admin on 2018/1/6.
 */
(function () {
    var ID = 'login_zc';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        setContents: function (view) {
            var me = this;

            //登陆界面的注册按钮
            // view.nodes.btn_zc.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         view.nodes.panel_1.hide();
            //         view.nodes.panel_2.show();
            //         G.frame.login.emit("loginFormChange", {"s": "reg"});
            //     }
            // });
            //已有账号
            // view.nodes.txt_yyzh.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         view.nodes.panel_2.hide();
            //         view.nodes.panel_1.show();
            //         G.frame.login.emit("loginFormChange", {"s": "login"});
            //     }
            // });
            //游客登陆
            // view.nodes.txt_ykdl.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         me._guestLoginLogic && me._guestLoginLogic();
            //     }
            // });
            //注册界面注册按钮
            // view.nodes.btn_zcbks.touch(function (sender, type) {
            //     if (type == ccui.Widget.TOUCH_ENDED) {
            //         var name = view.nodes.txt_zhsr.getString();
            //         var password = view.nodes.txt_mmsr.getString();
            //         me._regLogic && me._regLogic(name, password);
            //     }
            // });
        },
        bindUI: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            var panel_dh = me.ui.finds('panel_dh');
            var bg = panel_dh.finds('bg_denglu_tk');
            me.btn_sj = bg.finds('Button_1');

//          me.ui.nodes.btn_guanbi.click(function (sender, type) {
//              me.remove(false);
//          });

            //创建随机角色名
            var name = me.nodes.txt_srzh;
            name.setString(me.createRandomName()); //L('SMR')
            name.setColor(cc.color(G.gc.COLOR.n4));
            me.btn_sj.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    name.setString(me.createRandomName());
                    X.editbox.create(me.nodes.txt_srzh);
                    X.LOG.add(L('SJQM'), {click: 1});
                }
            });
            //注册名字
            me.ui.nodes.btn_denglu_dl.touch(function (sender, type) {
                if(type === ccui.Widget.TOUCH_BEGAN){
                    var n = name.getString();
                    G.ajax.send('user_register',[n],function(data) {
                        if (!data) return;
                        var data = X.toJSON(data);
                        if (data.s === 1) {
                            G.guidevent.emit('set_player_name');
                            G.event.emit('dologin',{});
                            G.event.emit('createrole',{});
                            me.remove();
                        }
                    },true);
                }
            })

        },
        createRandomName: function () {
            var firstName = _FIRSTNAME;
            // var midName = _MIDNAME;
            var lastName = _LASTNAME;
            var name = X.arrayRand(firstName)+X.arrayRand(lastName);

            return name;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.txt_srzh.setTextVerticalAlignment(1);
            me.nodes.txt_srzh.setTextHorizontalAlignment(0);
        },
        onShow: function () {
            var me = this;
            // me.setContents();
            me.DATA = me.data();
            
            //me.ui.nodes.btn_guanbi.hide();
            X.editbox.create(me.nodes.txt_srzh);
            me.bindUI();
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('inputname.json', ID);
})();