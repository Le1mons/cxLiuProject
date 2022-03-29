/**
 * Created by admin on 2018/1/6.
 */
(function () {
    var ID = 'login_tk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        setContents: function (view) {
            var me = this;

            me.nodes.txt_srzh.setPlaceHolder(X.cache('name') || '');

            var login = function (name,password) {
                if (name.length == 0){
                    G.tip_NB.show(L('QSRYXYHM'));
                    return;
                }
                var _sid = G.frame.login.lastSvr.sid;
                if(isNaN(_sid))_sid=0;

                G.class.loginfun.doLogin(name,X.time(),'7dd3958751c214b9cf64ae50d13bd7ea',_sid,function(){
                    X.cache('name',name);
                    X.cache('password',password);
                    G.frame.login.remove();
                    me.remove(false);
                });
            };
            me.nodes.btn_denglu_dl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(cc.sys.os == cc.sys.OS_ANDROID && G.owner == 'blyinghe'){
                        if(X.cache('ystishi') == 0) return G.tip_NB.show(L("YUEDUGOUXUAN"));
                    }
                    var name = me.nodes.txt_srzh.getString().trim();
                    if (name == '') {
                        name = me.nodes.txt_srzh.getPlaceHolder().trim();
                    }

                    //设置登录过的服务器
                    if(G.frame.login.last_data){
                        var arr = JSON.parse(X.cache('_lastAllServer_'));
                        var idx = X.arrayFind(arr, G.frame.login.last_data.sid, 'sid');
                        if (idx == -1) {
                            arr.unshift(G.frame.login.last_data);
                        }
                        X.cache('_lastAllServer_', JSON.stringify(arr));
                    }

                    var password = me.nodes.txt_srmm.getString();
                    (me._loginLogic || login)(name, password);
                }
            });
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
        bindBtn: function () {
            var me = this;

            me.ui.nodes.btn_guanbi.click(function (sender, type) {
                me.remove(false);
            });
            //
            // me.ui.render({
            //     top_title: L('UI_TITLE_DENGLU')
            // });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        }
    });

    G.frame[ID] = new fun('denglu_tip_zhmm.json', ID);
})();