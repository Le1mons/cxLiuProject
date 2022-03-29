/**
 * Created by wfq on 2018/7/5.
 */
(function () {
    //玩家信息
    G.class.setting_player = X.bView.extend({
        ctor: function (type) {
            var me = this;
            G.frame.setting.player = me;
            me._type = type;
            me._super("wanjiaxinxi.json");
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
        },
        setOptions:function(){
            var me = this;

            me._music = X.cache('music');
            me._effect = X.cache('effect');
            me.sl_music.setPercent(me._music);
            me.sl_effect.setPercent(me._effect);

            if (me._music == '0'){
                me._music = 0;
                me.nodes.btn_music.isbright = false;
                me.nodes.btn_music.loadTextureNormal('img/setting/btn_setting_off1.png',1);
            }else{
                if (!me._music) me._music = 100;
                me._music *= 1;
                me.nodes.btn_music.isbright = true;
                me.nodes.btn_music.loadTextureNormal('img/setting/btn_setting_on1.png',1);
            }
            me.sl_music.setPercent(me._music);

            if (me._effect == '0'){
                me._effect = 0;
                me.nodes.btn_sound.isbright = false;
                me.nodes.btn_sound.loadTextureNormal('img/setting/btn_setting_off2.png',1);
            }else{
                if (!me._effect) me._effect = 50;
                me._effect *= 1;
                me.nodes.btn_sound.isbright = true;
                me.nodes.btn_sound.loadTextureNormal('img/setting/btn_setting_on2.png',1);
            }
            me.sl_effect.setPercent(me._effect);
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            // me.setOptions();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var panel = me.ui;
            panel.finds("txt_name$_0").hide();
            X.render({
                bg_gonghui_jdt2: function (node) {
                    var maxExp = G.class.getConf('player')[P.gud.lv].maxexp;
                    var per = Math.floor(P.gud.exp / maxExp * 100);
                    node.setPercent(per);
                    node.removeAllChildren();
                    var text = new ccui.Text(P.gud.exp + " / " + maxExp, G.defaultFNT, 16);
                    text.setTextColor(cc.color(G.gc.COLOR.n8));
                    X.enableOutline(text, '#66370e', 2);
                    text.setAnchorPoint(0.5, 0.5);
                    text.setPosition(node.width / 2, node.height / 2);
                    node.addChild(text);
                }, txt_viplv: P.gud.vip, ico_vip1: function (node) {
                    node.setBackGroundImage(X.getVipIcon(P.gud.vip));
                }, panel_ico: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(P.gud);
                    wid.lv.hide();
                    wid.setPosition(cc.p(node.width / 2, node.height / 2));
                    node.addChild(wid);
                }, txt_name: function (node) {
                    node.setString(P.gud.name);
                    node.setTextColor(cc.color('#804326'));
                    node.setPosition(panel.finds("txt_name$_0").getPosition());
                }, txt_dj: P.gud.lv, txt_bh: function (node) {
                    var str = L('BIANHAO') + '：<font color=' + G.gc.COLOR.n104 + '>' + P.gud.uuid + '</font>';
                    var rh = new X.bRichText({
                        size: 20,
                        maxWidth: node.width,
                        lineHeight: 32,
                        family: G.defaultFNT,
                        color: G.gc.COLOR.n3
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0, node.height - rh.trueHeight()));
                    node.removeAllChildren();
                    node.addChild(rh);
                }, txt_gh: function (node) {
                    var str = L('GONGHUI') + '：<font color=' + G.gc.COLOR.n104 + '>' + (P.gud.ghname || L('WU')) + '</font>';
                    var rh = new X.bRichText({
                        size: 20,
                        maxWidth: node.width,
                        lineHeight: 32,
                        family: G.defaultFNT,
                        color: G.gc.COLOR.n3
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0, node.height - rh.trueHeight()));
                    node.removeAllChildren();
                    node.addChild(rh);
                }, btn_xiugai: function (node) {
                    if (G.time >= 1569859200 && G.time <= 1570464000) return node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            var need = {a: 'attr', t: 'rmbmoney', n: P.gud.isrenamed ? 500 : 0};
                            G.frame.player_gm.data({
                                title: L('XIUGAI') + L('MINGZI'),
                                info: L('PLAYER_NAME_INFO'),
                                placeholder: L('PLAYER_NAME_TIP'),
                                need: need,
                                callback: function (data) {
                                    G.ajax.send('user_rename', [data], function (d) {
                                        if (!d) return;
                                        var d = JSON.parse(d);
                                        if (d.s == 1) {
                                            G.event.emit("sdkevent", {event: "user_rename"});
                                            G.frame.player_gm.remove();
                                            G.view.toper.updateData();
                                        }
                                    }, true);
                                }
                            }).show();
                        }
                    });
                }, btn_gh: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.shejiao.show();
                        }
                    });
                }, btn_duihuan: function (node) {
                    node.click(function (sender, type) {
                        G.frame.lipinduihuan.show();
                    })
                }, btn_change: function (node) {
                    if (G.frame.setting.is_logout) {
                        node.setPosition(cc.p(189, 71));
                    } else {
                        node.setPosition(cc.p(317, 71));
                    }
                    node.click(function () {
                        jsbHelper.callNative(null, null, {act: 'logout'});
                        G.restart();
                    })
                }, btn_zhuxiao: function (node) {
                    if (G.frame.setting.is_logout) {
                        node.show();
                        node.click(function () {
                            G.frame.setting_zhuxiao.show();
                        })
                    } else {
                        node.hide();
                    }
                }
            }, me.nodes);
            var attrArr = ['jinbi', 'rmbmoney', 'useexp', 'jifen', 2001, 2003];
            for (var i = 0; i < attrArr.length; i++) {
                var attr = attrArr[i];
                var txtAttr = me.nodes['txt_sz' + (i + 1)];
                var layAttr = me.nodes['panel_token' + (i + 1)];
                if (i < 4) {
                    txtAttr.setString(X.fmtValue(P.gud[attr]));
                } else {
                    txtAttr.setString(X.fmtValue(G.class.getOwnNum(attr, "item")));
                }
                layAttr.setBackGroundImage(G.class.getItemIco(attr), 1);
            }
        }
    });
})();