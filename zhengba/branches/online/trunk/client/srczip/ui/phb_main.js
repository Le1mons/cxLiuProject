/**
 * Created by LYF on 2018/9/11.
 */
(function () {
    //总排行榜
    var ID = 'phb_main';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('rank'))
            }, null, me.nodes.listview_phb);
            me.nodes.listview_phb.setTouchEnabled(true);
        },
        changeType: function(sender) {
            var me = this;
            var type = sender.data.id;

            if(sender.disable) {
                G.tip_NB.show(sender.show);
                return;
            }

            me.type = type;

            me.setContents();
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();

            me.title = {
                1: L("PHB_GQ"),
                11: L("PHB_ZL"),
                3: L("PHB_JF"),
                10: L("PHB_DJ"),
                2: L("PHB_CS"),
                14: L("PHB_TJ"),
                17: L("PHB_CJ")
            };
            me.idx = {
                1: 0,
                11: 1,
                3: 2,
                10: 3,
                2: 4,
                14: 5,
                17: 6
            };
            me.menu = {
                0: 1,
                1: 11,
                2: 3,
                3: 10,
                4: 2,
                5: 14,
                6: 17
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();

            new X.bView("zhuui_paihangbang.json", function (node) {
                me.ui.finds("p_nr").addChild(node);
                me.view = node;
                cc.enableScrollBar(me.view.nodes.scrollview);
                cc.enableScrollBar(me.view.nodes.listview);

                me.view.finds("btn_mobai").click(function () {
                    G.ajax.send('rank_worship', [me.idx[me.type]], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            me.worship.push(me.idx[me.type]);
                            me.setBtnState();
                            G.frame.jiangli.data({
                                prize: d.d.prize
                            }).show();
                            me.jumpList();
                            G.hongdian.getData("worship", 1, function () {
                                me.checkRedPoint();
                            })
                        }
                    }, true);
                });

                X.viewCache.getView('ui_list6.json', function (node) {
                    me.list = node.nodes.list_rank;
                    me.topMenu.changeMenu(me.type);
                    me.setTime();
                });

            })
        },
        jumpList: function() {
            var me = this;

            for(var i = 0; i < me.nodes.listview_phb.getChildren().length; i ++) {
                if(!X.inArray(me.worship, i)) {
                    if(me.nodes.listview_phb.getChildren()[i].btn.disable) {
                        continue;
                    }else {
                        me.topMenu.changeMenu(me.menu[i]);
                        if(i > 3) {
                            me.nodes.listview_phb.jumpToRight();
                        } else {
                            me.nodes.listview_phb.jumpToLeft();
                        }
                    }
                    break;
                }
            }
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.worship;
            var child = me.nodes.listview_phb.getChildren();

            if(!data) return;

            for(var i in child) {
                if(!X.inArray(data, me.idx[child[i].name])) {
                    if(!child[i].btn.disable) {
                        G.setNewIcoImg(child[i], .85);
                        child[i].getChildByName("redPoint").setPosition(140, 39);
                    }
                }else {
                    G.removeNewIco(child[i]);
                }
            }
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.type = (me.data() && me.data().type) || 1;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('rank_open', [1, 2, 3, 10, 11, 14, 17], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.allDATA = d.d;
                    me.worship = d.d.worship;
                    callback && callback();
                }
            }, true);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.DATA = me.allDATA.rankinfo[me.type];
            me.setMB();
            me.setMyRank();
            me.setRankList();
        },
        setBtnState: function() {
            var me = this;

            if(!X.inArray(me.worship, me.idx[me.type])) {
                me.view.finds("btn_mobai").setBright(true);
                me.view.finds("btn_mobai").setTouchEnabled(true);
                me.view.finds("txt_lq").setTextColor(cc.color("#2f5719"));
                G.setNewIcoImg(me.view.finds("btn_mobai"), .95);
            }else {
                me.view.finds("btn_mobai").setBright(false);
                me.view.finds("btn_mobai").setTouchEnabled(false);
                me.view.finds("txt_lq").setTextColor(cc.color("#6c6c6c"));
                G.removeNewIco(me.view.finds("btn_mobai"));
            }
        },
        setMB: function () {
            var me = this;
            var data = me.DATA.ranklist[0];

            me.view.finds("btn_mobai").setBright(false);
            me.view.finds("btn_mobai").setTouchEnabled(false);
            me.view.finds("txt_lq").setTextColor(cc.color("#6c6c6c"));
            me.view.nodes.panel_tx.removeAllChildren();

            if(!data) {
                me.view.nodes.txt_name.setString("");
                me.view.nodes.txt_wz2.setString("");
            }else {
                if(me.type == 10) {
                    me.view.nodes.txt_name.setString(data.name);
                    me.view.nodes.txt_wz2.setString(me.title[me.type] + ": " + data.lv);

                    var img = new ccui.ImageView(G.class.gonghui.getFlagImgById(data.flag), 1);
                    img.setScale(.6);
                    img.setAnchorPoint(0.5, 0.5);
                    img.setPosition(me.view.nodes.panel_tx.width / 2, me.view.nodes.panel_tx.height / 2);
                    me.view.nodes.panel_tx.addChild(img);
                    me.view.nodes.txt_wz1.setString(X.STR(L('PHB_MAIN_HZ_1'),data.boss ? data.boss : ''));
                }else {
                    me.view.nodes.txt_name.setString(data.headdata.name);
                    if(me.type == 3) {
                        me.view.nodes.txt_wz2.setString(me.title[me.type] + ": " + me.getVal(data, null, null, "jifen"));
                    }else {
                        me.view.nodes.txt_wz2.setString(me.title[me.type] + ": " + me.getVal(data));
                    }
                    me.view.nodes.txt_wz1.setString(X.STR(L('PHB_MAIN_GH_1'),data.headdata.guildname == '' ? L('PHB_MAIN_JRGH') : data.headdata.guildname));
                    var head = G.class.shead(data.headdata);
                    head.setPosition(me.view.nodes.panel_tx.width / 2, me.view.nodes.panel_tx.height / 2);
                    me.view.nodes.panel_tx.removeAllChildren();
                    me.view.nodes.panel_tx.addChild(head);
                    head.data = data.headdata;
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
                }


                me.setBtnState();
            }
        },
        setMyRank: function () {
            var me = this;

            me.view.finds("txt_level").setString(me.title[me.type]);

            if(me.DATA.myrank > 0) {
                me.view.nodes.fnt_player.setString(me.DATA.myrank);
                me.view.finds("wsb_player").hide();

                if(me.type == 3) {
                    me.view.finds("txt_level_0").setString(me.DATA.jifen);
                }else if(me.type == 11) {
                    me.view.finds("txt_level_0").setString(P.gud.maxzhanli);
                }else if(me.type == 1){
                    me.view.finds("txt_level_0").setString(P.gud.maxmapid);
                } else if(me.type == 10){
                    me.view.finds("txt_level_0").setString(me.DATA.lv);
                } else if(me.type == 17){
                    me.view.finds("txt_level_0").setString(P.gud.success);
                }else {
                    me.view.finds("txt_level_0").setString(me.DATA.val);
                }
            }else {
                me.view.finds("wsb_player").show();
                me.view.nodes.fnt_player.setString("");
                me.view.finds("txt_level_0").setString("");
            }
        },
        setRankList: function  () {
            var me = this;

            var scrollView = me.view.nodes.scrollview;
            scrollView.removeAllChildren();

            var data = X.clone(me.DATA.ranklist);
            data.splice(0, 1);

            if(data.length < 1) {
                me.view.nodes.img_zwnr.show();
                return;
            } else me.view.nodes.img_zwnr.hide();

            for(var i = 0; i < data.length; i ++) {
                data[i].rank = i + 2;
            }

            var table = me.table = new X.TableView(scrollView, me.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 8, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
            scrollView.getChildren()[0].getChildren()[0].x = 4;
        },
        setItem: function(ui, data) {
            X.autoInitUI(ui);
            var me = this;
            var layPh = ui.nodes.img_rank;
            var txtPh = ui.nodes.sz_phb;
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txtGuanqia = ui.nodes.txt_number;
            var txt_wz = ui.nodes.txt_wz;
            ui.nodes.txt_title.setString(me.title[me.type]);
            layPh.hide();
            txtPh.setString('');
            layIco.removeAllChildren();
            if (data.rank < 0) {
                txtPh.setString(0);
            } else if (data.rank < 4) {
                layPh.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                layPh.show();
            } else {
                txtPh.setString(data.rank);
                txtPh.show();
            }

            if(me.type == 10) {
                var img = new ccui.ImageView(G.class.gonghui.getFlagImgById(data.flag), 1);
                img.setScale(.6);
                img.setAnchorPoint(0.5, 0.5);
                img.setPosition(layIco.width / 2, layIco.height / 2);
                layIco.addChild(img);
                txtName.setString(data.name);
                txtGuanqia.setString(data.lv);
                txt_wz.setString(X.STR(L('PHB_MAIN_HZ'),data.boss ? data.boss : ''));
            }else {
                var head = G.class.shead(data.headdata);
                head.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
                layIco.addChild(head);
                head.data = data.headdata;
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
                txtName.setString(data.headdata.name);
                txtGuanqia.setString(me.type == 3 ? me.getVal(data, null, null, "jifen") : me.getVal(data));
                txt_wz.setString(X.STR(L('PHB_MAIN_GH'),data.headdata.guildname == '' ? L('PHB_MAIN_JRGH') : data.headdata.guildname));
            }

            ui.setTouchEnabled(false);
            layIco.setTouchEnabled(false);
            layPh.setTouchEnabled(false);
        },
        getVal: function (obj, val, val1, val2) {
            var me = this;

            val = val || "uid";
            val1 = val1 || "uid";

            if(!cc.isArray(obj)) {
                var keys = X.keysOfObject(obj);
                for(var i in keys) {
                    if(keys[i] == "headdata") {
                        keys.splice(i, 1);
                        break;
                    }
                }
                return val2 ? obj[val2] : obj[keys[0]];
            } else {
                if(val !== "uid") {
                    for(var i in obj) {
                        if(obj[i][val] == P.gud[val1]) {
                            return obj[i].lv;
                        }
                    }
                }else {
                    for(var i in obj) {
                        if(obj[i].headdata[val] == P.gud[val1]) {
                            return me.getVal(obj[i], val, val1, val2);
                        }else{
                            if(me.type == 1){
                                val2 = 0;
                                return val2;
                            }
                        }
                    }
                }
            }
        },
        setTime: function () {
            var me = this;
            var timeTxt = new ccui.Text();
            X.timeout(timeTxt, X.getTodayZeroTime() + 24 * 3600,function () {
                G.hongdian.getData("worship", 1, function () {
                    me.checkRedPoint();
                    me.getData(function () {
                        me.setBtnState();
                    })
                })
            });
        }
    });
    G.frame[ID] = new fun('ui_xinphb.json', ID);
})();