/**
 * Created by LYF on 2018-10-22
 */
(function () {
    // 英雄信息-融魂
    G.class.yingxiong_yxrh = X.bView.extend({
        ctor: function (type) {
            var me = this;
            G.frame.yingxiong_xxxx.rh = me;
            me._type = type;
            me._super('yingxiong_rh.json');
        },
        refreshPanel: function () {
            var me = this;

            me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;
            me.DATA = G.DATA.yingxiong.list[me.curXbId];
            me.hero_lv = me.DATA.lv;
            me.hero_hid = me.DATA.hid;
            G.DATA.yingxiong.oldData = me.DATA;

            me.setContents();
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            var conf = G.class.meltsoul.getById(me.hero_hid);
            var conf_com = G.class.meltsoulcom.get();
            var hero_data = G.class.hero.getById(me.hero_hid);
            var open_lv = G.class.meltsoulcom.getOpenLv();
            G.DATA.yingxiong.oldData = data;
            var dengjie = 1,
                dq_hp = 0,
                dq_atk = 0,
                tp_type,
                dq_tplv;
            dengjie = data.meltsoul || 1;
            if(data.extbuff && data.extbuff.meltsoul){
                for (var i = 0; i < data.extbuff.meltsoul.length; i++) {
                    var meltsoul = data.extbuff.meltsoul[i];
                    if (meltsoul.hp) {
                        dq_hp = meltsoul.hp || 0;
                    } else if (meltsoul.atk) {
                        dq_atk = meltsoul.atk || 0;
                    }
                }
            }
            var max_hp = conf[dengjie].upperlimit.hp;
            var max_atk = conf[dengjie].upperlimit.atk;

            var txt_djz = me.nodes.txt_djz;
            var btn_tishi = me.nodes.btn_tishi;
            var qiu1 = me.nodes.img_qiu1;
            var qiu2 = me.nodes.img_qiu2;
            var qiu1_xz = me.nodes.gj_dian;
            var qiu2_xz = me.nodes.sm_dian;
            var num1 = me.nodes.txt_gj;
            var num2 = me.nodes.txt_sm;

            me.panel_rh = me.nodes.pane_rh;
            me.panel_tp = me.nodes.panel_tp;
            me.dengjie = dengjie;
            me.dq_atk = dq_atk;
            me.dq_hp = dq_hp;

            //判断球的属性满了没
            if(dq_hp < max_hp){
                me.hp_meltsoul = false;
            }else{
                me.hp_meltsoul = true;
            }
            if(dq_atk < max_atk){
                me.atk_meltsoul  = false;
            }else{
                me.atk_meltsoul = true;
            }
            if(me.hp_meltsoul == false && me.atk_meltsoul == true){
                me.qiu_type = "hp";
                qiu1_xz.hide();
                qiu2_xz.show();
            }else if(me.hp_meltsoul == true && me.atk_meltsoul == false){
                me.qiu_type = "atk";
                qiu1_xz.show();
                qiu2_xz.hide();
            }else if(me.qiu_type == "atk"){
                me.qiu_type = "atk";
                qiu1_xz.show();
                qiu2_xz.hide();
            }else if(me.qiu_type == "hp"){
                me.qiu_type = "hp";
                qiu1_xz.hide();
                qiu2_xz.show();
            }else{
                me.qiu_type = "atk";
                qiu1_xz.show();
                qiu2_xz.hide();
            }

            me.setToperAttr(me.qiu_type);

            //判断突破文字显示状态
            btn_tishi.show();

            if (G.class.herostarup.getById(me.hero_hid)) {
                if (G.class.herostarup.getByIdAndDengjie(me.hero_hid, '10')) {
                    var starup = G.class.herostarup.getByIdAndDengjie(me.hero_hid, '10');
                    hero_data.lv = starup.maxlv;
                } else if (G.class.herostarup.getByIdAndDengjie(me.hero_hid, '9')) {
                    var starup = G.class.herostarup.getByIdAndDengjie(me.hero_hid, '9');
                    hero_data.lv = starup.maxlv;
                } else {
                    var data_clone = X.clone(G.class.hero.getById(me.hero_hid));
                    hero_data.lv = G.class.herocom.getMaxlv(me.hero_hid, data_clone.star);
                }
            }else{
                hero_data.lv = 100;
            }
            dq_tplv = G.class.meltsoulcom.getTPlv(dengjie);
            var arr_tplv = G.class.meltsoulcom.get().base.tupo;
            if (hero_data.lv <= open_lv) {
                btn_tishi.hide();
                if (me.hero_lv == open_lv) {
                    tp_type = "1";
                }
            } else if (me.hero_lv >= dq_tplv) {
                tp_type = "2";
            } else {
                if (hero_data.lv == arr_tplv[X.keysOfObject(arr_tplv).length]) {
                    if (me.hero_lv < dq_tplv) {
                        tp_type = "3";
                    } else if (me.hero_lv == arr_tplv[X.keysOfObject(arr_tplv).length]) {
                        tp_type = "5";
                    }
                } else {
                    if (hero_data.lv < dq_tplv) {
                        tp_type = "4";
                    } else if (me.hero_lv < dq_tplv) {
                        tp_type = "3";
                    }

                }
            }

            //设置属性球
            txt_djz.setString(dengjie);
            me.setQiuani(qiu1, dengjie, dq_atk, max_atk, 1);
            num1.setString(dq_atk || " ");
            me.setQiuani(qiu2, dengjie, dq_hp, max_hp, 2);
            num2.setString(dq_hp || " ");
            me.tupo = false;

            //判断打开融魂还是突破
            if((dq_hp == max_hp) && (dq_atk == max_atk)){
                me.Ronghun_show = false;
                me.setTupo(tp_type, dq_tplv);
            }else{
                me.Ronghun_show = true;
                me.setRonghun();
            }
        },
        setRonghun: function() {
            var me = this;

            me.panel_rh.show();
            me.panel_tp.hide();


            var btn_rh = me.nodes.btn_rh;
            var panel_xh = me.nodes.panel_jn;
            var btn_gou = me.nodes.btn_gou;
            var bg_gou = me.nodes.bg_gou;
            var rh_man = me.nodes.panel_man;
            var txt_man = me.nodes.panel_wz;
            var xh1 = me.nodes.txt_xh1;
            var xh2 = me.nodes.txt_xh2;
            var img_xh1 = me.ui.finds('token_1');
            img_xh1.setScale(2.5);
            var item_num = [];
                item_data =[];

            me.quantity = me.quantity || 1;

            var xiaohao;
            if(me.qiu_type == "atk"){
                xiaohao = G.class.meltsoulcom.getAtkneed(me.dengjie);
            }else{
                xiaohao = G.class.meltsoulcom.getHpneed(me.dengjie);
            }
            if(xiaohao){
                var color1 = G.class.getOwnNum(xiaohao[0].t, xiaohao[0].a) < xiaohao[0].n;
                var color2 = G.class.getOwnNum(xiaohao[1].t, xiaohao[1].a) < xiaohao[1].n;
                xh1.setTextColor(cc.color(!color1 ? '#ffffff' : "#ff4e4e"));
                xh2.setTextColor(cc.color(!color2 ? '#ffffff' : "#ff4e4e"));
                X.enableOutline(xh1,cc.color(!color1 ? '#000000' : "#740000"),1);
                X.enableOutline(xh2,cc.color(!color2 ? '#000000' : "#740000"),1);
                xh1.setString(xiaohao[0].n * me.quantity);
                xh2.setString(xiaohao[1].n * me.quantity);
                item_num.push(xh1);
                item_num.push(xh2);
                img_xh1.loadTexture(G.class.getItemImg(xiaohao[0].t), 0);
            }
            // X.alignCenter(panel_xh, xiaohao, {
            //     name: false,
            //     touch: true,
            //     scale: 0.65,
            //     interval: 0.5,
            //     mapItem: function(item) {
            //         item_num.push(item.num);
            //         item_data.push(item.data);
            //         me.quantity && item.num.setString(item.data.n * me.quantity);
            //         var color = G.class.getOwnNum(item.data.t, item.data.a) < item.data.n;
            //         item.num.setTextColor(cc.color(color ? '#ff4e4e' : "#ffffff"));
            //     }
            // })

            if ((me.qiu_type == "hp") && me.hp_meltsoul) {
                me.nodes.btn_rh.setTouchEnabled(false);
                me.nodes.btn_rh.setBright(false);
                rh_man.show();
                me.panel_rh.hide();
                txt_man.setString(L('YXRH_MAN_HP'));
            }else if((me.qiu_type == "atk") && me.atk_meltsoul){
                me.nodes.btn_rh.setTouchEnabled(false);
                me.nodes.btn_rh.setBright(false);
                rh_man.show();
                me.panel_rh.hide();
                txt_man.setString(L('YXRH_MAN_ATK'));
            } else {
                me.nodes.btn_rh.setTouchEnabled(true);
                me.nodes.btn_rh.setBright(true);
                rh_man.hide();
                me.panel_rh.show();
            }

            bg_gou.setTouchEnabled(true);
            btn_gou.setTouchEnabled(false);
            bg_gou.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.quantity == 10) {
                        btn_gou.hide();
                        me.quantity = 1;
                    } else {
                        btn_gou.show();
                        me.quantity = 10;
                    }
                    for(var i=0;i<item_num.length;i++){
                        item_num[i].setString(xiaohao[i].n * me.quantity);
                        var color = G.class.getOwnNum(xiaohao[i].t, xiaohao[i].a) < xiaohao[i].n;
                        item_num[i].setTextColor(cc.color(color ? '#ff4e4e' : "#ffffff"));
                    }
                }
            });
            btn_rh.click(function(sender, type) {
                if (me.atk_meltsoul && me.qiu_type == "atk") {
                    return;
                }else if(me.hp_meltsoul && me.qiu_type == "hp"){
                    return;
                } else {
                    G.ajax.send("hero_meltsoul", [me.qiu_type, me.curXbId, me.quantity], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            if (d.d.hero && d.d.hero[me.curXbId]) {
                                me.DATA = d.d.hero[me.curXbId];
                                me.setUP(me.DATA);
                                me.setUPani(me.DATA, d.d.crit, function(){
                                    me.refreshPanel()
                                });
                                me.setRonghunani(me.qiu_type);
                            }
                        }
                    });
                }
            }, 500);
        },
        setTupo: function(type, dq_tplv) {
            var me = this;

            me.panel_rh.hide();
            me.panel_tp.show();
            me.nodes.panel_man.hide();

            var data = me.DATA;
            var tp_tishi = me.nodes.panel_tpwz;
            var btn_tp = me.nodes.btn_tp;
            tp_tishi.show()
            btn_tp.setTouchEnabled(true);
            btn_tp.setBright(true);
            btn_tp.setTitleColor(cc.color(G.gc.COLOR.n101));
            var text = "";
            if (type == "1") {
                text = L('YXRH_TP1');
                btn_tp.setTouchEnabled(false);
                btn_tp.setBright(false);
                btn_tp.setTitleColor(cc.color(G.gc.COLOR.n15));
            } else if (type == "2") {
                text = X.STR(L('YXRH_TP2'), dq_tplv);
            } else if (type == "3") {
                text = X.STR(L('YXRH_TP3'), dq_tplv,
                    "<font color=#fff71d" + " onclick=G.frame.yingxiong_xxxx.ui.finds('menuBtn4').triggerTouch(ccui.Widget.TOUCH_ENDED)>" + L('YXXX_YXSX') + "</font>");
            } else if (type == "4") {
                text = L('YXRH_TP4');
            }else{
                text = L('YXRH_TP5');
                btn_tp.setTouchEnabled(false);
                btn_tp.setBright(false);
                btn_tp.setTitleColor(cc.color(G.gc.COLOR.n15));
            }
            var rh = new X.bRichText({
                size: 22,
                maxWidth: tp_tishi.width,
                lineHeight: 24,
                color: "#804236",
                family: G.defaultFNT,
                eachText: function (node) {
                    // X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(text);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(tp_tishi.width/2 - rh.trueWidth()/2, tp_tishi.height/2 + rh.trueHeight()/2);
            tp_tishi.removeAllChildren();
            tp_tishi.addChild(rh);

            btn_tp.click(function(sender, type) {
                me.oldData = X.clone(G.DATA.yingxiong.oldData);
                G.ajax.send("hero_mstupo", [me.curXbId], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        if (d.d.hero && d.d.hero[me.curXbId]) {
                            me.DATA = d.d.hero[me.curXbId];
                            // me.setUP(me.DATA);
                            G.frame.ui_rh_jinjie.data({
                                data: me.DATA,
                                tid: me.curXbId,
                                hid: me.hero_hid,
                                oldData: me.oldData,
                                extrabuff: G.class.meltsoul.getById(me.hero_hid)[me.dengjie].extrabuff,
                                callback: function() {
                                    me.tupo = true;
                                    me.refreshPanel();
                                }
                            }).show();
                        }
                    }
                });
            }, 500);
        },
        setUP:function(data){
            var me = this;
            var piaozi = me.nodes.piaozi;
            while (piaozi.getChildren().length > 10) {
                for(var i=0;i<piaozi.getChildren().length - 10;i++){
                    piaozi.getChildren()[i].removeFromParent();
                }
            }
            var oldData = G.DATA.yingxiong.oldData || data;
            var sarr = [L("atk"), L("def"), L("hp"), L("speed")];
            var arr = ["atk", "def", "hp", "speed"];
            var num = 0;
            for (var i = 0; i < arr.length; i++) {
                if (data[arr[i]] !== oldData[arr[i]]) {
                    var is = data[arr[i]] > oldData[arr[i]];
                    var str = sarr[i] + (is ? ("+" + (data[arr[i]] - oldData[arr[i]])) : (data[arr[i]] - oldData[arr[i]]));
                    var shuXingUp = new ccui.Text(str, "fzcyj", 15);
                    (function(shuXingUp) {
                        shuXingUp.setFontName(G.defaultFNT);
                        shuXingUp.setTextColor(cc.color("#3CFF00"));
                        X.enableOutline(shuXingUp, "#000000", 2);
                        shuXingUp.setPosition(piaozi.width / 2 + (me.qiu_type == "atk" ? -120 : 120), piaozi.height/2);
                        num++;
                        piaozi.addChild(shuXingUp);
                        var action2 = cc.fadeOut(0.9);
                        var action3 = cc.moveBy(0.3, cc.p(0, 50));
                        var action4 = cc.spawn(action2, action3);
                        var action5 = cc.sequence(action4, cc.callFunc(() => {
                            shuXingUp.removeFromParent();
                        }));
                        shuXingUp.runAction(action5);
                    })(shuXingUp);
                }
            }
            // if(me.crit > 1){
            //     var baoji = data.meltsoul;
            //     var str = L('baoji') + "X" + me.crit;
            //     var txt = new ccui.Text(str, "fzcyj", 15);
            //     (function(txt) {
            //         txt.setFontName(G.defaultFNT);
            //         txt.setTextColor(cc.color("#ffffff"));
            //         X.enableOutline(txt, "#c80000", 2);
            //         // txt.setPosition(shuXingUp.width / 2, shuXingUp.height / 2);
            //         // shuXingUp.addChild(txt);
            //         txt.setPosition(me.width / 2 - 100, me.height / 2 + 50);
            //         num++;
            //         txt.setTag(888888);
            //         me.addChild(txt);
            //         var action1 = cc.moveBy(0.1, cc.p(100, 0));
            //         var action2 = cc.fadeOut(0.3);
            //         var action3 = cc.moveBy(0.3, cc.p(0, 10));
            //         var action4 = cc.spawn(action2, action3);
            //         var action5 = cc.sequence(action1, action4, cc.callFunc(() => {
            //             txt.hide(false);
            //         }));
            //         txt.runAction(action5);
            //     })(txt);
            // }
        },
        setUPani:function(data, beishu, callback){
            var me = this;
            var up = me.nodes.sm_you;
            var oldData = G.DATA.yingxiong.oldData || data;
            var sarr = [L("atk"), L("def"), L("hp"), L("speed")];
            var tisheng = "";
            var dq_hp = 0,
                dq_atk = 0;
            for (var i = 0; i < data.extbuff.meltsoul.length; i++) {
                var meltsoul = data.extbuff.meltsoul[i];
                if (meltsoul.hp) {
                    dq_hp = meltsoul.hp || 0;
                } else if (meltsoul.atk) {
                    dq_atk = meltsoul.atk || 0;
                }
            }

            if(dq_hp > me.dq_hp){
                var num = dq_hp - me.dq_hp;
                tisheng = L("hp") + "+" + num;
                up = me.nodes.sm_you;
            }else if(dq_atk > me.dq_atk){
                var num = dq_atk - me.dq_atk;
                up = me.nodes.gj_zuo;
                tisheng = L("atk") + "+" + num;
            }
            up.removeAllChildren();
            if(beishu > 1){
                G.class.ani.show({
                    json: "ani_ronghun_baoji2",
                    addTo: up,
                    x: up.width / 2,
                    y: up.height / 2 + 60,
                    repeat: false,
                    autoRemove: true,
                    onload:function(node, action){
                    }
                })
            }
            // G.class.ani.show({
            //     json: "ani_ronghun_shuxingtisheng",
            //     addTo: up,
            //     x: up.width / 2 + 10,
            //     y: up.height / 2,
            //     repeat: false,
            //     autoRemove: true,
            //     onload: function(node, action) {
            //         var text = node.getChildren()[0].getChildren()[0].getChildren()[1];
            //         text.width = 100;
            //         text.setString(tisheng);
            //         text.show();
            //     },
            //     onend: function() {
            //     }
            // });
            callback && callback();
        },
        setQiuani: function(panel, type, dq, max, id) {
            var me = this;
            var color_arr = ["bai","lv","lan","zi","cheng","hong"];
            var baifenbi = (dq / max) > 1 ? 1 : (dq / max) ;
            if (!me.qiu_ani || !me.qiu_ani[id] || me.tupo || me.qiu_ani_id != type) {
                panel.removeAllChildren();
                me.qiu_ani = [];
                G.class.ani.show({
                    json: "ani_ronghun_shui"+color_arr[type - 1],
                    addTo: panel,
                    x: panel.width / 2,
                    y: parseInt(panel.height * baifenbi),
                    repeat: true,
                    autoRemove: false,
                    onload: function(node, action) {
                        me.qiu_ani[id] = node;
                        me.qiu_ani_id = type;
                    }
                })
            } else {
                me.qiu_ani[id].setPositionY(parseInt(panel.height * dq / max));
            }
        },
        setRonghunani:function(id, callback){
            var me = this;
            var panel, ani;
            if(id == "atk"){
                panel = me.nodes.gj_dian;
                ani = "ani_ronghun_qianghua";
            }else{
                panel = me.nodes.sm_dian;
                ani = "ani_ronghun_qianghua_a";
            }
            if (!me.Ronghunani) {
                G.class.ani.show({
                    json: ani,
                    addTo: panel,
                    x: panel.width / 2,
                    y: panel.height / 2 + 10,
                    repeat: false,
                    autoRemove: true,
                    onload: function(node, action) {
                        me.Ronghunani = true;
                        callback && callback();
                    },
                    onend: function(node, action) {
                        me.Ronghunani = false;
                    }
                })
            } else {
                callback && callback();
            }

        },
        bindBTN: function () {
            var me = this;
            var btn_hide = me.nodes.btn_fanhui;
            var btn_tishi = me.nodes.btn_tishi;
            var btn_hp = me.nodes.bg_qiu2;
            var btn_atk = me.nodes.bg_qiu;
            var qiu1_xz = me.nodes.gj_dian;
            var qiu2_xz = me.nodes.sm_dian;

            btn_hide.click(function(sender, type) {
                G.frame.yingxiong_xxxx.remove();
            });

            btn_tishi.click(function(sender, type) {
                G.frame.ui_top_rh.data({
                    hid: me.hero_hid,
                    tid: me.curXbId,
                    dengjie: me.DATA.meltsoul
                }).show();
            });
            btn_hp.setTouchEnabled(true);
            btn_hp.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.qiu_type = "hp";
                    me.setToperAttr(me.qiu_type);
                    qiu1_xz.hide();
                    qiu2_xz.show();
                    me.Ronghun_show && me.setRonghun();
                }
            })
            btn_atk.setTouchEnabled(true);
            btn_atk.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.qiu_type = "atk";
                    me.setToperAttr(me.qiu_type);
                    qiu1_xz.show();
                    qiu2_xz.hide();
                    me.Ronghun_show && me.setRonghun();
                }
            })

        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            // me.curXbId = G.frame.yingxiong_xxxx.curXbId;
            // me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;
            // me.DATA = G.DATA.yingxiong.list[me.curXbId];
            // me.hero_lv = me.DATA.lv;
            // me.hero_hid = me.DATA.hid;
            // G.DATA.yingxiong.oldData = me.DATA;

            me.refreshPanel();
            me.ui.finds("token_2").setScale(2.5);
            me.ui.finds("token_2").loadTexture(G.class.getItemImg("useexp"));

            G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
                if (G.frame.yingxiong_xxxx.getCurType() == me._type) {
                    me.curXbId = G.frame.yingxiong_xxxx.curXbId;
                    me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;
                    me.DATA = G.DATA.yingxiong.list[me.curXbId];
                    me.hero_lv = me.DATA.lv;
                    me.hero_hid = me.DATA.hid;
                    G.DATA.yingxiong.oldData = me.DATA;
                    me.refreshPanel();
                } else {
                    me._needRefresh = true;
                }
            }, me.getViewJson());
        },
        setToperAttr: function(type){
            var me = this;

            if(type == "hp"){
                G.frame.yingxiong_xxxx.changeToperAttr({
                    attr1: {a: 'item', t: '2022'},
                    attr2: {a: 'attr', t: 'useexp'}
                });
            }else{
                G.frame.yingxiong_xxxx.changeToperAttr({
                    attr1: {a: 'item', t: '2021'},
                    attr2: {a: 'attr', t: 'useexp'}
                });
            }
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }

            G.frame.yingxiong_xxxx.changeToperAttr({
                attr2: {a: 'attr', t: 'useexp'}
            });
        },
        onRemove: function () {
            var me = this;
        },
    });

})();
