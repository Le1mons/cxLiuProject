/**
 * Created by lsm on 2018/6/27
 */
(function() {
    //好友列表
    G.class.setting_options = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('setting_option.json');
        },
        refreshPanel: function() {
            var me = this;
            me.setOptions();
            me.setContents();
        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_change.click(function(){
                var code = me.nodes.text_lpmmc.getString();
                if(code.trim() == "") {
                    G.tip_NB.show(L("QSRDHM"));
                    return;
                }
                X.ajax.get(
                    X.STR(G.check_card_url, P.gud.uid, encodeURIComponent(P.gud.name), code, G.owner||""), {},
                    function (txt) {
                        var d = X.toJSON(txt);
                        if(d.result == 0) {
                            G.ajax.send("user_getcard", [d.code], function (data) {
                                data = X.toJSON(data);
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize: data.d
                                    }).show();
                                }
                            });
                        }else{
                            G.tip_NB.show(d.result);
                        }
                    }
                )
            }, 1500);

            me.nodes.btn_music.zIndex = 9999;
            me.nodes.btn_music.click(function(sender){
                if (!sender.isbright){
                    sender.isbright = true;
                    sender.loadTextureNormal('img/setting/btn_setting_on1.png',1);

                    var _musicVal = X.cache("music")
                    if(_musicVal==null)_musicVal=50;
                    me.setMusicVol(_musicVal);

                    //X.audio.setMusicVolume(me._music / 100 || 50 / 100);
                    //me.sl_music.setPercent(me._music || 50);
                }else{
                    sender.isbright = false;
                    sender.loadTextureNormal('img/setting/btn_setting_off1.png',1);
                    //X.audio.setMusicVolume(0);
                    //me.sl_music.setPercent(0);
                    me.setMusicVol(0);
                }
            });
            me.nodes.btn_sound.zIndex = 9999;
            me.nodes.btn_sound.click(function(sender){
                if (!sender.isbright){
                    sender.isbright = true;
                    sender.loadTextureNormal('img/setting/btn_setting_on2.png',1);
                    //X.audio.setEffectsVolume(me._effect / 100 || 50 / 100);
                    //me.sl_effect.setPercent(me._effect || 50);
                    //X.cache("effect", me._effect || 50);
                    var _musicVal = X.cache("effect")
                    if(_musicVal==null)_musicVal=50;
                    me.setEffVol(_musicVal);
                }else{
                    sender.isbright = false;
                    sender.loadTextureNormal('img/setting/btn_setting_off2.png',1);
                    //X.audio.setEffectsVolume(0);
                    //me.sl_effect.setPercent(0);
                    //X.cache("effect", 0);
                    me.setEffVol(0);
                }
            });

            me.sliderHandler = function (sender,type) {
                if (type == ccui.Slider.EVENT_PERCENT_CHANGED){
                    var t = sender.type,
                        percent = sender.getPercent();
                    if (t == 'effect'){
                        //X.audio.setEffectsVolume(percent/100);
                        //X.cache("effect", percent);
                        //me._effect = percent;
                        me.setEffVol(percent);

                        if (percent == 0){
                            me.nodes.btn_sound.isbright = false;
                            me.nodes.btn_sound.loadTextureNormal('img/setting/btn_setting_off2.png',1);
                        }else if (percent > 0 && !me.nodes.btn_sound.isbright){
                            me.nodes.btn_sound.isbright = true;
                            me.nodes.btn_sound.loadTextureNormal('img/setting/btn_setting_on2.png',1);
                        }
                    }else if (t == 'music'){
                        //X.audio.setMusicVolume(percent/100);
                        //X.cache("music", percent);
                        //me._music = percent;

                        me.setMusicVol(percent);
                        if (percent == 0){
                            me.nodes.btn_music.isbright = false;
                            me.nodes.btn_music.loadTextureNormal('img/setting/btn_setting_off1.png',1);
                        }else if (percent > 0 && !me.nodes.btn_music.isbright){
                            me.nodes.btn_music.isbright = true;
                            me.nodes.btn_music.loadTextureNormal('img/setting/btn_setting_on1.png',1);
                        }
                    }
                }
            };

            me.sl_music =  me.nodes.img_slider1;
            me.sl_effect =  me.nodes.img_slider2;
            me.sl_music.type = 'music';
            me.sl_effect.type = 'effect';
            me.sl_music.addEventListener(me.sliderHandler,me);
            me.sl_effect.addEventListener(me.sliderHandler,me);

            me.setJumpFightAni();
            me.nodes.btn_dh.click(function () {
                if (X.cacheByUid("setJumpFightAni")) X.cacheByUid("setJumpFightAni", 0);
                else X.cacheByUid("setJumpFightAni", 1);

                me.setJumpFightAni();
            });
            me.setHideVip();
            me.nodes.btn_vip.click(function () {
                G.ajax.send("user_showvip",[],function(data){
                    var d = X.toJSON(data);
                    if(d.s != 1)return;
                    me.setHideVip();
                    G.view.toper.updateData();
                })
            });
        },
        setJumpFightAni: function () {
            var me = this;
            var state = X.cacheByUid("setJumpFightAni") || 0;

            if (state) {
                me.nodes.btn_dh.loadTextureNormal("img/setting/btn_setting_off3.png", 1);
                me.nodes.txt_gbjwdh.setString(L("CLOSE_FIGHT_ANI"));
            } else {
                me.nodes.btn_dh.loadTextureNormal("img/setting/btn_setting_on3.png", 1);
                me.nodes.txt_gbjwdh.setString(L("OPEN_FIGHT_ANI"));
            }
        },
        setHideVip:function(){
          var me = this;
            var state = P.gud.showvip || 0;

            if (!state) {
                me.nodes.btn_vip.setBright(false);
                me.nodes.txt_vip.setString(L("OPEN_VIP"));
            } else {
                me.nodes.btn_vip.setBright(true);
                me.nodes.txt_vip.setString(L("CLOSE_VIP"));
            }
        },
        //0~100
        setEffVol : function(num){
            var me = this;
            X.audio.setEffectsVolume(num/100*1.0);
            cc.isNode(me.sl_effect) && me.sl_effect.setPercent(num*1);
            X.cache("effect", num+"");
        },
        setMusicVol : function(num){
            var me = this;
            X.audio.setMusicVolume(num/100*1.0);
            cc.isNode(me.sl_music) && me.sl_music.setPercent(num*1);
            X.cache("music", num+"");
        },

        onOpen: function() {
            var me = this;
            me.bindBTN();

            me.nodes.text_lpmmc.setTextVerticalAlignment(1);
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();

            if(G.tiShenIng || G.appleDad) {

                me.ui.finds("img_bg").hide();
                me.nodes.btn_change.hide();
                me.ui.finds("wz_bg_db2").hide();
                me.nodes.btn_duihuan.hide();
                me.nodes.text_lpmmc.setString("");
                me.nodes.text_lpmmc.hide();
                me.ui.finds("Image_1").hide();
            } else {
                X.editbox.create(me.nodes.text_lpmmc);

            }
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;
            me.setUserInfo();
        },
        onNodeShow: function() {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
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
        setUserInfo:function(){
            var me = this;
            var tx = me.nodes.panel_tx;
            var name = me.nodes.txt_name;
            var id = me.nodes.txt_id;

            var head = G.class.shead(P.gud);
            head.setAnchorPoint(0,0);
            tx.addChild(head);
            name.setString(P.gud.name);

            var rt =new X.bRichText({
                size: 22,
                maxWidth:id.width,
                lineHeight:36,
                family: G.defaultFNT,
                color:'#804326'
            });
            rt.text(X.STR(L('UUID'),P.gud.uuid));
            // rt.setAnchorPoint(0,0);
            id.addChild(rt);
        }
    });
})();