/**
 * Created by wfq on 2018/6/22.
 */
(function () {
    //玩家信息
    var ID = 'wanjiaxinxi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f3";
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
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

            me.refreshData();
        },
        refreshData: function () {
            var me = this;

            me.setDefaultBtns(true);
            me.setContents();
        },
        onHide: function () {
            var me = this;

        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     headdata:{},
            //     defhero:[]
            // };
            // callback && callback();

            G.ajax.send('user_details', [me.data().pvType,me.data().uid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();
            me.setHero();
            me.setBtns();
        },
        checkShow: function () {
            var me = this;

            me.getData(function () {
                me.show();
            });
        },
        setBaseInfo: function () {
            var me = this;

            var data = me.DATA;

            X.render({
                panel_tx: function (node) {
                    node.removeAllChildren();

                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.addChild(wid);
                },
                text_id:data.headdata.uuid || L('WU'),
                text_gh:data.ghname && data.ghname != '' ? data.ghname : L('WU'),
                text_zdl1:data.zhanli

            },me.nodes);

            me.ui.finds('text_zzke').setString(data.headdata.name);
        },
        setHero: function () {
            var me = this;

            var data = me.DATA;

            var lay = me.nodes.list_zr;
            lay.removeAllChildren();

            //先设置高度，再添加节点
            if (data.defhero.length > 1) {
                me.nodes.panel_wjxx.height += (me.nodes.panel_zr.height + 5) * (data.defhero.length - 1);
            }

            ccui.helper.doLayout(me.nodes.panel_wjxx);

            for (var i = 0; i < data.defhero.length; i++) {
                var d = data.defhero[i];
                var item = me.nodes.panel_zr.clone();
                item.setName(i);
                item.data = d;
                item.idx = i;
                me.setItem(item,i);
                item.setPosition(cc.p(lay.width / 2,lay.height - item.height / 2 - (item.height + 5) * i ));
                lay.addChild(item);
                item.show();
            }
        },
        setItem: function (item,row) {
            var me = this;

            X.autoInitUI(item);

            var data = item.data;

            var leftArr = [],
                rightArr = [];

            var leftLay = item.nodes.panel_yx;
            var rightLay = item.nodes.panel_yx1;
            leftLay.removeAllChildren();
            rightLay.removeAllChildren();

            var wid,
                herInterval,
                lay,
                scale = 1,
                num = 0;
            for (var i = 0; i < 6; i++) {
                var defhero = data[i + 1];

                if (defhero && row < 2) {
                    wid = G.class.shero(defhero);
                    wid.setArtifact(data.sqid || "");
                    wid.data = defhero;
                    me.setShowHeroInfo(wid);
                } else if(row == 2){
                    wid = G.class.shero();
                    var img = new ccui.ImageView('img/jingjichang/img_jjc_wh.png',1);
                    img.setAnchorPoint(0.5,0.5);

                    wid.panel_tx.addChild(img);
                }else{
                    wid = G.class.shero();
                }

                var width = scale * wid.width;

                if (i < 2) {
                    lay = leftLay;
                    herInterval = (lay.width - (2 * width));
                } else {
                    lay = rightLay;
                    herInterval = (lay.width - (4 * width)) / 3;
                }

                if (i == 2) {
                    num = 0;
                }

                wid.setScale(scale);
                wid.setPosition(cc.p(width / 2 + (width + herInterval) * (num % 6),lay.height / 2));
                lay.addChild(wid);

                num++;
            }
        },
        setShowHeroInfo: function(wid) {
            var me = this;

            wid.setTouchEnabled(true);
            wid.click(function (sender) {
                if(!me.heroInfoShow) {
                    var up = cc.moveBy(0.1, 0, me.DATA.defhero.length > 1 ? 200 : 110);
                    var goUp = cc.spawn(up, cc.callFunc(()=>{
                        new X.bView("ronghejitan_yxsx.json", function (view) {
                            me.heroInfoShow = view;
                            me.heroInfoShow.setPosition(43, 170);
                            me.ui.addChild(me.heroInfoShow);

                            me.heroInfoShow.runAction(cc.moveBy(0.1, 0, -30));
                            me.setHeroInfo(sender.data);
                        })
                    }));
                    me.nodes.panel_wjxx.runAction(goUp);
                }else {
                    me.setHeroInfo(sender.data);
                }
            })
        },
        setHeroInfo: function(data) {
            var me = this;
            var head = me.heroInfoShow.nodes.panel_tb;
            var name = me.heroInfoShow.nodes.text_yxm;
            var pinjie = me.heroInfoShow.nodes.panel_pinjie;
            var zl = me.heroInfoShow.nodes.text_zdl;
            var btn = me.heroInfoShow.nodes.btn_tishi;
            var skill = me.heroInfoShow.nodes.panel_jn;
            var buff = ["atk", "def", "hp", "speed"];

            me.heroInfoShow.nodes.btn_pinglun.click(function () {
                if(data.star > 9) {
                    G.frame.yingxiong_pinglun.data(data.hid + "_10").show();
                } else {
                    G.frame.yingxiong_pinglun.data(data.hid).show();
                }

            });

            head.removeAllChildren();
            skill.removeAllChildren();
            skill.setPosition(277, 55);

            var wid = G.class.shero(data);
            wid.setPosition(head.width / 2, head.height / 2);
            head.addChild(wid);

            setTextWithColor(name, wid.conf.name, G.gc.COLOR[wid.conf.color || 1]);

            G.class.ui_pinji(pinjie, data.dengjielv || 0, 0.8, data.star);

            zl.setString(data.zhanli);

            btn.click(function () {
                G.frame.ui_top_xq.data({data : data}).show();
            });

            for (var i = 0; i < buff.length; i ++) {
                var bf = buff[i];
                var txt = me.heroInfoShow.nodes["txt_sx" + (i + 1)];
                txt.setString(data[bf]);
            }

            var skillList = G.class.hero.getSkillList(data.hid, data.dengjielv || 1);

            var interval = 16; // 间隔
            var w = skillList.length * 88 + (skillList.length - 1) * interval; // 星星所占宽度
            var x = (skill.width - w) * 0.5; // 星星初始x
            for (var i = 0; i < skillList.length; i++){
                var p = G.class.ui_skill_list(skillList[i], true, null, 1);
                p.setAnchorPoint(0,0);
                p.x = x;
                p.y = 0;
                skill.addChild(p);

                x += 88 + interval;
            }
        },
        setBtns: function () {
            var me = this;
            //
            if (me.DATA.isshield) {
                me.nodes.btn_pb.finds('text_pb').setString(L('YPB'));
                me.nodes.btn_pb.finds("text_pb").x -= 5;
            }
            X.render({
                btn_jhy: function (node) {
                    //加好友
                    node.hide();
                    if (!me.DATA.isfriend && me.DATA.headdata.uid != P.gud.uid) {
                        node.show();
                    }

                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('friend_apply', [me.DATA.headdata.uid], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    G.tip_NB.show(L('SHENQING') + L('SUCCESS'));
                                    // me.DATA.isfriend = 1;
                                    me.refreshData();
                                }
                            }, true);
                        }
                    });
                },
                btn_shy: function (node) {
                    //删除好友
                    node.hide();
                    if (me.DATA.isfriend) {
                        node.show();
                    }
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.alert.data({
                                sizeType:3,
                                okCall: function () {
                                    G.ajax.send('friend_delete', [me.DATA.headdata.uid], function (d) {
                                        if (!d) return;
                                        var d = JSON.parse(d);
                                        if (d.s == 1) {
                                            me.DATA.isfriend = 0;
                                            if (G.frame.friend.isShow) {
                                                G.frame.friend._panels[1].refreshPanel();
                                            }
                                            me.remove();
                                        }
                                    }, true);
                                },
                                cancelCall:null,
                                richText:L('QRSCHY'),
                            }).show();
                        }
                    });
                },
                btn_pb: function (node) {
                    // var txt = node.finds('text_pb');
                    if(me.DATA.headdata.uid == P.gud.uid) node.hide();
                    
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.ajax.send('friend_shield',[me.DATA.headdata.uid,0],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    if(G.frame.friend.isShow){
                                        if(G.frame.friend.list && G.frame.friend.list.isShow){
                                            G.frame.friend.list.refreshPanel();
                                        }
                                        if(G.frame.friend.qq && G.frame.friend.qq.isShow){
                                            G.ajax.send('friend_refuse', [0, me.DATA.headdata.uid], function(d) {
                                                if (!d) return;
                                                var d = JSON.parse(d);
                                                if (d.s == 1) {
                                                    G.frame.friend.qq.refreshPanel();
                                                }
                                            }, true);
                                        }
                                        if(G.frame.friend.cz && G.frame.friend.cz.isShow){
                                            G.frame.friend.cz.getTuijian(1, function () {
                                                G.frame.friend.cz.setTuijian();
                                            })
                                        }
                                    }
                                    G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                                    me.remove();
                                }
                            },true);
                        }
                    });
                },
                btn_fsyj: function (node) {
                    if(me.DATA.headdata.uid == P.gud.uid) node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.youjian_fs.data({
                                type: 1,
                                data: me.DATA.headdata
                            }).show();
                        }
                    });
                },
                btn_qc: function (node) {
                    if(me.data() && me.data().from == 'gonghui') node.show();
                        else node.hide();
                    if(me.DATA.headdata.uid == P.gud.uid) node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {

                            G.frame.fight.startFight({}, function(node) {
                                var selectedData = node.getSelectedData();
                                G.ajax.send('friend_discuss', [me.data().uid, selectedData], function(d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        X.cacheByUid('fight_hypk', selectedData);
                                        G.frame.fight.data({
                                                pvType: 'pvfriend',
                                                prize: d.d.prize
                                            }).once('show', function() {
                                                G.frame.yingxiong_fight.remove();

                                            }).demo(d.d.fightres);
                                        }
                                }, true);
                            }, "hypk");

                        }
                    });
                },

            },me.nodes);

            var btnsCall = me.data().btnsCall;
            btnsCall && btnsCall(me);
        },
        setdel: function (){
            var me = this;

        },
        setDefaultBtns: function (bool) {
            var me = this;

            var btnPb = me.nodes.btn_pb;
            var btnSend = me.nodes.btn_fsyj;

            btnPb.setVisible(bool);
            btnSend.setVisible(bool);
        }
    });

    G.frame[ID] = new fun('jingjichang_wjxx.json', ID);
})();