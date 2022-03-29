/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠-详情
    var ID = 'sc_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            var fjBtn = me.ui.finds("btn$_0");
            var qhBtn = me.nodes.btn;
            if(me.DATA.lock){
                me.nodes.img_suo.show();
            }else{
                me.nodes.img_suo.hide();
            }
            if (!me.DATA.tid) {
                fjBtn.hide();
                qhBtn.hide();
                me.nodes.panel_top.height -= 50;
                ccui.helper.doLayout(me.nodes.panel_top);
                me.nodes.btn_fenxian.hide();
            } else {
                qhBtn.setVisible(me.isCanIntensify());
                fjBtn.setVisible(me.conf.color < 4 || (me.conf.color == 4 && P.gud.lv >= 180));
                if (!qhBtn.visible && !fjBtn.visible) {
                    me.nodes.panel_top.height -= 50;
                    ccui.helper.doLayout(me.nodes.panel_top);
                }
                if (!qhBtn.visible) fjBtn.x = me.nodes.panel_top.width / 2;
                if (!fjBtn.visible) qhBtn.x = me.nodes.panel_top.width / 2;
            }
        },
        isCanIntensify: function () {
            if (G.gc.petup[this.petId][this.curLv + 1]) return true;
            return false;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_suo.loadTextureNormal("img/scsj/btn_suoding.png",1);

            me.ui.finds("btn$_0").click(function () {
                G.frame.jiangliyulan.data({
                    prize: G.gc.petup[me.DATA.pid][me.DATA.lv || 0].prize,
                    title: L("FJYL"),
                    btnTxt: L("FJ"),
                    callback: function () {
                        me.ajax("pet_breakdown", [me.DATA.tid], function (str, data) {
                            if (data.s == 1) {
                                G.event.emit('sdkevent',{
                                    event:'pet_fenjie',
                                    data:{
                                        get:data.d.prize
                                    }
                                });

                              
                              
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).once("willClose", function () {
                                    me.remove();
                                    G.frame.scsj.panel.setTable();
                                }).show();
                            }
                        });
                    }
                }).show();
            });
            if(me.DATA.isSuo){
                me.nodes.btn_suo.show();
            }else{
                me.nodes.btn_suo.hide();
            }
            if(me.DATA.lock){
                me.nodes.btn_suo.loadTextureNormal("img/scsj/btn_suoding.png",1);
            }else{
                me.nodes.btn_suo.loadTextureNormal("img/scsj/btn_jiesuo.png",1);
            }
            me.nodes.btn_suo.click(function (sender) {
                me.ajax("pet_lock", [me.DATA.tid], function (str, data) {
                    if (data.s == 1) {
                        me.initUi();
                        me.bindBtn();
                        me.setContents();
                    }
                });
            })
            me.nodes.btn.click(function () {
                G.frame.sc_qh.data(me.DATA).once("show", function () {
                    me.remove();
                }).show();
            });

            
            me.nodes.btn_fenxian.click(function () {
                me.fenxiang.show();
                me.fenxiang.action.play("in", false);
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data() || {};
            me.petId = me.DATA.pid || me.DATA.t || me.DATA;
            me.curLv = me.DATA.lv || 0;
            me.conf = G.gc.pet[me.petId];
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();

            new X.bView('ui_top3.json', function(view) {
                // me.ui.removeAllChildren();
                me.fenxiang = view;
                me.fenxiang.hide();
                me.ui.addChild(view);
                me.setFenXiang(view);
            }, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var pet = G.class.pet(me.DATA);
            pet.setPosition(me.nodes.paneL_sc.width / 2, me.nodes.paneL_sc.height / 2);
            me.nodes.paneL_sc.addChild(pet);

            var lvStr = me.curLv ? " +" + me.curLv : "";
            me.nodes.txt_yl.show();
            setTextWithColor(me.nodes.txt_yl, pet.conf.name + lvStr, G.gc.COLOR[pet.conf.color]);

            var lvConf = G.gc.petup[me.petId][me.curLv];
            var str = X.STR(pet.conf.skilldesc, lvConf.value[0], lvConf.value[1], lvConf.value[2], lvConf.value[3],lvConf.value[4],lvConf.value[5],lvConf.value[6]);
            if(!me.nodes.txt_fhsdj1.children.length){
                var rh = X.setRichText({
                    str: str,
                    parent: me.nodes.txt_fhsdj1,
                    color: G.gc.COLOR.n5,
                    size: 22
                });
                rh.setPosition(0, me.nodes.txt_fhsdj1.height - rh.trueHeight() - 10);
                if (rh.trueHeight() > me.nodes.txt_fhsdj1.height) {
                    me.nodes.panel_top.height += rh.trueHeight() - me.nodes.txt_fhsdj1.height;
                    ccui.helper.doLayout(me.nodes.panel_top);
                    ccui.helper.doLayout(me.nodes.btn_fenxian);
                    me.nodes.btn_suo.y = me.nodes.panel_top.height - 30;
                    me.nodes.btn_fenxian.y = me.nodes.btn_suo.y;
                }
            }
            
            
        },
        setFenXiang: function(ui) {
            var me = this;
            var panel = ui;
            var btns = [];
            X.autoInitUI(panel);

            panel.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    panel.hide();
                }
            });

            var richText = new X.bRichText({
                size: 24,
                maxWidth: panel.nodes.txt_nr.width,
                lineHeight: 24,
                color: '#F6EBCD',
                family: G.defaultFNT,
            });
            richText.text(L('XZFXPD'));
            richText.setPosition(154, 60);
            panel.nodes.txt_nr.addChild(richText);
            var conf = {
                0: '世界',
                1: '跨服',
                2: '公会'
            };
            var callFunc = {
                0: function () {
                    var send = ['1',2,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                        G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    G.frame.chat.sendChat(send,function(){
                        G.tip_NB.show(L('FSCG'));
                        panel.hide();
                    });
                },
                1: function () {
                    var send = ['徐',4,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                        G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    G.frame.chat.sendChat(send,function(){
                        G.tip_NB.show(L('FSCG'));
                        panel.hide();
                    });
                },
                2: function () {
                    var send = ['1',3,'','','',{type: "pet", tid: me.DATA.tid}, X.cacheByUid("hideVip") ? 1 : 0,
                        G.frame.chat.getProvince(), G.frame.chat.getCity()];
                    G.frame.chat.sendChat(send,function(){
                        G.tip_NB.show(L('FSCG'));
                        panel.hide();
                    });
                }
            };
            var arr = G.DATA.closeKf ? [0, 2] : [0, 1, 2];
            for (var i in arr) {
                (function (id) {
                    var btn = new ccui.Button();
                    btn.loadTextureNormal('img/public/btn/btn2_on.png', 1);
                    btn.setTitleText(conf[id]);
                    btn.setTitleFontName(G.defaultFNT);
                    btn.setTitleFontSize(24);
                    btn.setTitleColor(cc.color('#7b531a'));
                    btn.click(function () {
                        callFunc[id]();
                    });
                    btns.push(btn);
                })(arr[i]);
            }
            X.center(btns, panel.nodes.panel_top, {
                noRemove: true,
                callback: function (node) {
                    node.y = 68;
                }
            });
        },
    });

    G.frame[ID] = new fun('scsj_tip_scxq.json', ID);
})();