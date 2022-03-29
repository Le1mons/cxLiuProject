/**
 * Created by LYF on 2018/10/11.
 */
(function () {
    //英雄评论
    var ID = 'yingxiong_pinglun';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.preLoadRes = ["yingxiong_pinglun.png", "yingxiong_pinglun.plist"]
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_dianzan.click(function (sender, type) {
                me.ajax("hero_comment", [me.hid, 2], function (str, data) {
                    if(data.s == 1) {
                        var str = me.nodes.wz_dianzan.getString();

                        me.nodes.wz_dianzan.setString(str == "9999+" ? str : (str == 9999 ? "9999+" : str * 1 + 1));

                        var txt = new ccui.Text("+1", G.defaultFNT, 20);
                        txt.setTextColor(cc.color("#30ff01"));
                        txt.setAnchorPoint(0.5, 0.5);
                        txt.setPosition(sender.x + 10, sender.y + 170);
                        X.enableOutline(txt, "#000000", 2);
                        me.ui.addChild(txt);
                        txt.runAction(cc.sequence(cc.moveBy(0.5, 0, 50), cc.callFunc(function(){
                            txt.removeFromParent();
                        })));
                    }
                })
            });

            me.nodes.btn_send.click(function () {
                var str = me.nodes.txtfield.getString();
                if(str.length < 1) {
                    G.tip_NB.show(L("QSRNR"));
                    return;
                }
                me.nodes.txtfield.setString("");
                X.editbox.create(me.nodes.txtfield);
                
                if(P.gud.lv >= 60 || P.gud.vip >= 2) {

                }else {
                    G.tip_NB.show(L("VANDDJ"));
                    return;
                }
                me.ajax("hero_comment", [me.hid, 1, str], function (str, data) {
                    if(data.s == 1) {
                        G.tip_NB.show(L("PLCG"));
                        if(!me.DATA.comment) {
                            me.DATA.comment = [];
                            me.DATA.comment.push(data.d);
                        }else {
                            me.DATA.comment.push(data.d);
                        }
                        if(!me.table) {
                            me.setChat();
                        }else {
                            me.table.setData(me.DATA.comment);
                            me.table.reloadDataWithScroll(true);
                        }
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.nodes.list_lb.hide();
            cc.enableScrollBar(me.nodes.scrollview_chat);
            me.fillSize();
            me.initUi();
            me.bindBtn();
            X.editbox.create(me.nodes.txtfield);
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("hero_getcomment", [me.hid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.hid = me.data().toString().split("_")[0];
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.setChat();
        },
        onHide: function () {
            var me = this;

            if(G.frame.yingxiong_xxxx.isShow && G.frame.yingxiong_xxxx.from == "yingxiong_tujian" && G.frame.yingxiong_xxxx.rw) {
                G.frame.yingxiong_xxxx.rw.setPinLun();
            }
        },
        setContents: function () {
            var me = this;
            var conf = X.clone(G.class.hero.getById(me.hid));
            if(me.data().toString().split("_").length > 1) {
                var starup = G.class.herostarup.getByIdAndDengjie(me.hid, '10');
                conf.lv = starup.maxlv;
                conf.dengjielv = '10';
                conf.star = 10;
            }

            var hero = G.class.shero(conf);
            hero.setPosition(me.nodes.panel_tx1.width / 2, me.nodes.panel_tx1.height / 2);
            hero.lv && hero.lv.hide();
            me.nodes.panel_tx1.addChild(hero);

            me.nodes.txt_wjmz.setString(conf.name);
            me.nodes.wz_dianzan.setString(me.DATA.like ? (me.DATA.like > 9999 ? "9999+" : me.DATA.like) : 0);

            var skillList = G.class.hero.getSkillList(conf.hid, conf.star);
            for (var i = 0; i < skillList.length; i++){
                var p = G.class.ui_skill_list(skillList[i], true, null, 1);
                p.setAnchorPoint(0,0);
                p.setScale(.6);
                p.setPosition(0 + i * p.width / 2, 0);
                p.x += i * 15;
                me.nodes.jn.addChild(p);
            }
        },
        setChat: function () {
            var me = this;

            if(!me.DATA.comment || me.DATA.comment.length < 1) {
                me.nodes.img_zwnr.show();
                return;
            }else {
                me.nodes.img_zwnr.hide();
            }

            var table = me.table = new X.TableView(me.nodes.scrollview_chat, me.nodes.list_lb, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0] + pos[1]);
            }, null, null, 8, 5);
            table.setData(me.DATA.comment);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data, pos) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.panel_tx.removeAllChildren();

            var head = G.class.shead(data.headdata);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.addChild(head);
            head.setTouchEnabled(true);
            head.icon.setTouchEnabled(false);
            head.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.wanjiaxinxi.data({
                        pvType: 'zypkjjc',
                        uid: sender.data.uid
                    }).checkShow();
                }
            });
            ui.nodes.txt_player_neirong.setString(data.content);
            ui.nodes.txt_player_name.setString(data.headdata.name);
            ui.nodes.txt_send_time.setString(X.timetostr(data.ctime, '[m-d h:mm]'));

            if(!data.isdone) {
                ui.finds("aixintu_ax").setPercent(0);
            }else {
                ui.finds("aixintu_ax").setPercent(100);
            }
            
            ui.finds("aixin_ax").click(function () {
                me.ajax("hero_comment", [me.hid, 4, data.id], function (str, data) {
                    if(data.s == 1) {
                        ui.finds("wz_1").setString(ui.finds("wz_1").getString() == "9999+" ? ui.finds("wz_1").getString()
                            : (ui.finds("wz_1").getString() * 1 + 1 > 9999 ? "9999+" : ui.finds("wz_1").getString() * 1 + 1));
                        me.DATA.comment[pos].jiaxin += 1;
                        me.DATA.comment[pos].isdone = 1;
                        G.class.ani.show({
                            json: "ani_dianzan",
                            addTo: ui.finds("aixin_ax"),
                            x: 32,
                            y: 29,
                            repeat: false,
                            autoRemove: true,
                            onend: function () {
                                var txt = new ccui.Text("+1", G.defaultFNT, 20);
                                txt.setTextColor(cc.color("#30ff01"));
                                txt.setAnchorPoint(0.5, 0.5);
                                txt.setPosition(ui.finds("aixin_ax").x + 30, ui.finds("aixin_ax").y + 35);
                                X.enableOutline(txt, "#000000", 2);
                                ui.addChild(txt);
                                txt.runAction(cc.sequence(cc.moveBy(0.5, 0, 50), cc.callFunc(function(){
                                    txt.removeFromParent();
                                })));
                                ui.finds("aixintu_ax").setPercent(100);
                            }
                        })
                    }
                })
            });

            ui.finds("wz_1").setString(data.jiaxin ? (data.jiaxin > 9999 ? "9999+" : data.jiaxin) : 0);
        }
    });
    G.frame[ID] = new fun('yingxiong_pinglun.json', ID);
})();