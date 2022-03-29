/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    //发送邮件
    //调界面时传一个type值 1玩家 2工会 如果是玩家 请带上玩家的数据 data: playData
    var ID = 'youjian_fs';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{releaseRes:false,action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("YOUJIAN"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
        },
        viewBtn: function(){
            var me = this;
            me.view.nodes.btn_fs.click(function (sender, type) {
                var str1 = me.btString;
                var str2 = me.view.nodes.text_yjnr.getString();
                if(str1 == ""){
                    G.tip_NB.show(L("BTBNWK"));
                    return;
                }
                if(str2 == "" || str2 == L("DJBJ")){
                    G.tip_NB.show(L("NRBNWK"));
                    return;
                }
                if(me.type == 2){
                    G.ajax.send("email_sendghemail", [str2, str1, me.type, me.data().data.uid], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.tip_NB.show(L("FSCG"));
                            me.remove();
                        }
                    })
                }else{
                    G.ajax.send("email_sendemail", [str2, str1, me.type, me.data().data.senduid || me.data().data.uid], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.tip_NB.show(L("FSCG"));
                            me.remove();
                        }
                    })
                }

            }, 1000)
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView("youjian_fsyj.json", function (node) {
                me.nodes.panel_nr.addChild(node);
                me.view = node;
                me.viewBtn();
                me.setContents()
            })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.type = me.data().type;
            me.sjr = me.data().data.name || me.data().data.binduid || L("QTGHCY");
            me.view.nodes.text_sjr.setString(L("SJR") + me.sjr);
            me.view.nodes.text_yjbt.setTextVerticalAlignment(1);
            me.view.nodes.text_yjbt.setString("");
            me.view.nodes.text_yjnr.setString(L("DJBJ"));
            me.view.nodes.text_yjbt.ft = me;
            me.view.nodes.text_yjnr.ft = me;
            me.view.nodes.text_yjbt.addEventListener(me.bt, me.view.nodes.text_yjbt);
            me.view.nodes.text_yjnr.addEventListener(me.nr, me.view.nodes.text_yjnr);

            me.view.nodes.text_yjnr.setTextColor(cc.color('#804326'));

            me.str = me.type == 2? L("GH") : L("WJ");
            var str1 = (me.type == 2? L("GHTZ"): L("SLYJ")) + me.str;
            me.btString = (me.type == 2? L("GHTZ"): L("SLYJ"));
            var rh = new X.bRichText({
                size: 22,
                maxWidth: me.view.nodes.panel_yjbt2.width,
                lineHeight: 34,
                family: G.defaultFNT,
                color: G.gc.COLOR[0]
            });
            rh.text(str1);
            rh.setAnchorPoint(0, 0.5);
            rh.setPosition(0, me.view.nodes.panel_yjbt2.height / 2);
            me.view.nodes.panel_yjbt2.removeAllChildren();
            me.view.nodes.panel_yjbt2.addChild(rh);

        },
        bt: function (sender, type) {
            var me = this;
            switch (type){
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                    me.ft.view.nodes.panel_yjbt2.hide();
                    me.opacity = 255;
                    break;
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                    if(me.getString() !== ""){
                        var str = me.getString() + me.ft.str;
                        var rh = new X.bRichText({
                            size: 22,
                            maxWidth: me.ft.view.nodes.panel_yjbt2.width,
                            lineHeight: 34,
                            family: G.defaultFNT,
                            color: G.gc.COLOR[0]
                        });
                        rh.text(str);
                        rh.setAnchorPoint(0, 0.5);
                        rh.setPosition(0, me.ft.view.nodes.panel_yjbt2.height / 2);
                        me.ft.view.nodes.panel_yjbt2.removeAllChildren();
                        me.ft.view.nodes.panel_yjbt2.addChild(rh);
                        me.ft.view.nodes.panel_yjbt2.show();
                        me.ft.btString = me.getString();
                        if(me.getString() == "私聊邮件(玩家)") {
                            me.setString("");
                        }else{
                            me.opacity = 0;
                        }
                    }
                    break;
                default:
                    break;
            }
        },
        nr: function (sender, type) {
            var me = this;
            switch (type){
                case ccui.TextField.EVENT_ATTACH_WITH_IME:
                    if(me.getString() == "请输入文字") {
                        me.setString("");
                    }
                    break;
                case ccui.TextField.EVENT_DETACH_WITH_IME:
                    break;
                default:
                    break;
            }
        }
    });
    G.frame[ID] = new fun('youjian2.json', ID);
})();