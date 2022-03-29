/**
 * Created by LYF on 2018/7/5.
 */
(function () {
    //首冲
    var ID = 'shouchong';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            });

            // X.radio([me.nodes.btn_1, me.nodes.btn_2, me.nodes.btn_3], function (sender) {
            //     var name = sender.getName();
            //     var name2type = {
            //         btn_1$: 1,
            //         btn_2$: 2,
            //         btn_3$: 3
            //     };
            //
            //     me.changeType(name2type[name]);
            // })
            var btn_arr = [me.nodes.btn_1, me.nodes.btn_2, me.nodes.btn_3];
            me.nodes.btn_1.setEnabled(true);
            me.nodes.btn_1.setBright(false);
            me.nodes.btn_1.click(function (sender, type) {
                me.changeType(1);
                setbtn(1);
            });
            me.nodes.btn_2.click(function (sender, type) {
                me.changeType(2);
                setbtn(2);
            });
            me.nodes.btn_3.click(function (sender, type) {
                me.changeType(3);
                setbtn(3);
            });
            var setbtn = function (type) {
                for (var i = 0; i < 3; i++) {
                    if (type == i + 1) {
                        btn_arr[i].setBright(false);
                        btn_arr[i].finds('txt_wz').setTextColor(cc.color("#ffffff"));
                        X.enableOutline(btn_arr[i].finds('txt_wz'), "#B25800", 2);
                    } else {
                        btn_arr[i].setBright(true);
                        btn_arr[i].finds('txt_wz').setTextColor(cc.color("#AFC9E1"));
                        X.disableOutline(btn_arr[i].finds('txt_wz'));
                    }
                }
            }


        },
        changeType: function (type) {
            var me = this;

            if (me.type && me.type == type) return;

            me.type = type;
            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send("shouchong_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    me.typeData = me.DATA.shouchong[me.type];
                    callback && callback();
                }
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();

            me.nodes.btn_1.hide();
            me.nodes.btn_2.hide();
            me.nodes.btn_3.hide();
            me.setContents();
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;
            var data = G.DATA.hongdian.shouchonghaoli;
            for (var i in data) {
                if (data[i] > 0) {
                    G.setNewIcoImg(me.nodes["btn_" + i], .95);
                } else {
                    G.removeNewIco(me.nodes["btn_" + i]);
                }
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.btn_shouchong_qcz.opacity = 0;
            me.nodes.btn_shouchong_lq.opacity = 0;
        },
        show: function (conf) {
            var me = this;
            var _super = this._super;
            me.type = 1;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onHide: function () {
            var me = this;
            me.bg_action.play("out", false);
            G.hongdian.getData("shouchonghaoli", 1);
        },
        setContents: function () {
            var me = this;
            var config = G.class.getConf("shouchong");
            var conf = config[me.type];
            var isFinish = true;
            // me.nodes.panel_dh.removeAllChildren();
            if (me.type == 1) {
                me.nodes.txt_sx1.setString("2310");
                me.nodes.txt_sx2.setString("664");
                me.nodes.txt_sx3.setString("22410");
                me.nodes.txt_sx4.setString("606");
                me.nodes.Panel_dj.finds("txt_djmsz").setString("100");
                me.nodes.Panel_dj.show();
            } else {
                me.nodes.Panel_dj.hide();
            }
            me.nodes.panel_dh.removeAllChildren();
            G.class.ani.show({
                json: "ani_shouchong" + me.type,
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    var hid_arr = ['41065', '43023', '52025'];
                    var rw = node.finds("rw$");
                    rw.removeBackGroundImage();
                    rw.removeAllChildren();
                    X.setHeroModel({
                        parent: rw,
                        data: {
                            hid: hid_arr[me.type - 1]
                        },
                        scaleNum: me.type == 0 ? 1.2 : 1
                    });
                    rw.setAnchorPoint(0.95, -0.03);
                    rw.setFlippedX(true);
                    rw.setScale(1.2);

                    
                    if (me.type == "1" && !me.bg_action) {
                        action.playWithCallback("in", false, function() {
                            action.play("xunhuan", true);
                        })
                    }else{
                        action.play("xunhuan", true);
                    }
                    me.bg_action = action;
                }
            });
            for (var i in me.DATA.shouchong) {
                var pz = G.class.getConf("shouchong")[i];
                if (me.DATA.shouchong[i].rec.length !== pz.prize.length) {
                    isFinish = false;
                    break;
                }
            }
            if (isFinish) {
                G.view.mainView.ui.finds("shouchong").hide();
                me.remove();
                return;
            }
            me.ui.finds("txt_ycz").setString(X.STR(L("YCY"), me.DATA.paynum));
            for (var i in me.DATA.shouchong) {
                if (me.DATA.shouchong[i].show) {
                    me.nodes["btn_" + i].show();
                }
            }
            var islq = true;
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var list_x = (listview.width - me.nodes.list.width * 3) / 2;
            listview.setItemsMargin(list_x);
            for (var i = 0; i < conf.prize.length; i++) {
                var list = me.nodes.list.clone();
                var prize = conf.prize[i];
                X.autoInitUI(list);
                X.alignCenter(list.nodes.panel_ico, prize, {
                    touch: true,
                    mapItem: function (item) {
                        item.setScale(.8);
                    }
                });
                if (me.typeData.rec.length > i) {
                    list.nodes.img_xb_ylq.show();
                }
                list.nodes.txt_ts.setString(X.STR(L("DJT"), i + 1));
                list.show();
                listview.pushBackCustomItem(list);
            }
            if(me.typeData.rec.length == conf.prize.length) {
                me.nodes.img_ylq.show();
            }else {
                me.nodes.img_ylq.hide();
            }
            while (me.ui.finds("ui").getChildByTag(777777)) {
                me.ui.finds("ui").getChildByTag(777777).removeFromParent();
            }
            if (me.DATA.paynum < conf.paynum) {
                me.nodes.btn_shouchong_lq.hide();
                me.nodes.btn_shouchong_qcz.show();
                G.class.ani.show({
                    json: "ani_shouchong_quchongzhi",
                    addTo: me.ui.finds("ui"),
                    x: me.nodes.btn_shouchong_qcz.x,
                    y: me.nodes.btn_shouchong_qcz.y,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setTag(777777);
                    }
                })
            } else {

                me.nodes.btn_shouchong_qcz.hide();
                me.nodes.btn_shouchong_lq.show();
                var idx = me.typeData.rec.length;
                if (me.typeData.rec.length == conf.prize.length || G.time < me.typeData.chkrectime[idx]) {
                    me.nodes.btn_shouchong_lq.setBright(false);
                    islq = false;
                    if(me.typeData.rec.length == conf.prize.length) {
                        me.nodes.btn_shouchong_lq.hide();
                    }
                    // me.nodes.btn_shouchong_lq.setTouchEnabled(false);
                } else {
                    G.class.ani.show({
                        json: "ani_shouchong_lingqu",
                        addTo: me.ui.finds("ui"),
                        x: me.nodes.btn_shouchong_lq.x,
                        y: me.nodes.btn_shouchong_lq.y,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            node.setTag(777777);
                        }
                    });
                    me.nodes.btn_shouchong_lq.setBright(true);
                    me.nodes.btn_shouchong_lq.setTouchEnabled(true);
                }
            }
            me.nodes.btn_shouchong_qcz.click(function (sender, type) {
                G.frame.chongzhi.show();
                me.remove();
            });
            me.nodes.btn_shouchong_lq.click(function (sender, type) {
                if (!islq) return;
                G.ajax.send("shouchong_recprize", [me.type, idx], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        me.getData(function () {
                            me.setContents();
                        });
                        G.hongdian.getData("shouchonghaoli", 1, function () {
                            me.checkRedPoint();
                        })
                    }
                })
            });
        },
    });
    G.frame[ID] = new fun('shouchong.json', ID);
})();