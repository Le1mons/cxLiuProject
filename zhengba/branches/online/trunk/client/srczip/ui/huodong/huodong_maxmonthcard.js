/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //大月卡
    G.class.huodong_maxMonthCard = X.bView.extend({
        extConf: {

        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_card.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                X.loadPlist(['event.plist', 'event.png'],function() {
                    me.setContents();
                });
            });
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.type = "da";
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("yueka_open", [me.type], function (d) {
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

            me.setBanner();
            me.setView();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        setBanner: function () {
            var me = this;

            me.nodes.wz_title.setBackGroundImage("img/event/wz_event_card2.png", 1);
            me.nodes.wz_info.setBackGroundImage("img/event/wz_event_info2.png", 1);
            me.nodes.panel_bg.setBackGroundImage("img/bg/bg_card2.png", 0);
            me.nodes.img_card.removeAllChildren();
            G.class.ani.show({
                addTo: me.nodes.img_card,
                json: 'ani_huodong_yueka',
                repeat: true,
                autoRemove: false,
                onload: function (node) {
                    node.nodes.kapai.setBackGroundImage("img/event/img_event_card2.png", 1);
                    // node.setTag(12345);
                }
            });
            me.nodes.btn_fdj.show();
            me.nodes.btn_fdj.click(function () {
                G.frame.chongzhi.data({'isDykTz':true}).show();
                G.frame.huodong.remove();
            })
        },
        setView: function () {
            var me = this;
            var conf = G.class.getConf("xiaoyueka")[me.type];

            if(me.DATA.rmbmoney / 100 >= conf.maxmoney / 100){
                me.ui.finds("panel_2").show();
                me.ui.finds("panel_1").hide();

                var rh = new X.bRichText({
                    size: 22,
                    maxWidth: me.nodes.txt_info2.width,
                    lineHeight: 34,
                    family: G.defaultFNT,
                    color: "#ececd3",
                    eachText: function (node) {
                        node.enableOutline && X.enableOutline(node, "#000000", 2);
                    }
                });

                if(me.DATA.nt + 30 * 24 * 3600 - G.time > 24 * 3600) {
                    var str = X.STR(L("DYKSY"), parseInt(((me.DATA.nt + 30 * 24 * 3600) - G.time) / (24 * 3600)));
                    rh.text(str);
                } else {
                    var txt = new ccui.Text("", G.defaultFNT, 22);
                    txt.setTextColor(cc.color("#1c9700"));
                    X.enableOutline(txt, "#000000", 2);
                    X.timeout(txt, me.DATA.nt + 30 * 24 * 3600, function () {
                        me.refreshPanel();
                    });
                    var str = L("DYKSSY") + "<font node=1></font>";
                    rh.text(str, [txt]);
                }

                rh.setPosition(me.nodes.txt_info2.width / 2 - rh.trueWidth() / 2, me.nodes.txt_info2.height / 2);
                me.nodes.txt_info1.removeAllChildren();
                me.nodes.txt_info2.removeAllChildren();
                me.nodes.txt_info2.addChild(rh);

                if(!me.DATA.act){
                    G.removeNewIco(me.nodes.btn_receive);
                }else{
                    G.setNewIcoImg(me.nodes.btn_receive, .9);
                }

                me.nodes.btn_receive.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                me.nodes.btn_receive.setTitleColor(cc.color("#2f5719"));

                me.nodes.btn_receive.setBright(me.DATA.act == 0 ? false : true);
                me.nodes.btn_receive.bright == false && me.nodes.btn_receive.setTitleColor(cc.color('#6c6c6c'));
                me.nodes.btn_receive.setTouchEnabled(me.DATA.act == 0 ? false : true);
                me.nodes.btn_receive.click(function (sender, type) {

                    G.ajax.send("yueka_getprize", [me.type], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.frame.jiangli.data({
                                prize: conf.prize
                            }).show();
                            me.refreshPanel();
                            G.frame.huodong.updateTop();
                            G.hongdian.getData("yueka_da", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            })
                        }
                    }, true);
                })

            }else{
                me.ui.finds("panel_1").show();
                me.nodes.img_jdt.setPercent(me.DATA.rmbmoney / conf.maxmoney * 100);
                me.nodes.txt_jdt.setString(X.STR(L("DQCZ"), me.DATA.rmbmoney / 100, conf.maxmoney / 100));

                var str = X.STR(L("LJCZ"), conf.maxmoney / 100);
                var rh = new X.bRichText({
                    size: 22,
                    maxWidth: me.nodes.txt_info1.width,
                    lineHeight: 34,
                    family: G.defaultFNT,
                    color: "#ececd3",
                    eachText: function (node) {
                        node.enableOutline && X.enableOutline(node, "#000000", 2);
                    }
                });
                rh.text(str);
                rh.setPosition(me.nodes.txt_info1.width / 2 - rh.trueWidth() / 2, me.nodes.txt_info1.height / 2);
                me.nodes.txt_info1.removeAllChildren();
                me.nodes.txt_info2.removeAllChildren();
                me.nodes.txt_info1.addChild(rh);

                me.nodes.btn_activate.click(function (sender, type) {
                    G.frame.chongzhi.show();
                    G.frame.chongzhi.once("hide", function () {
                        me.refreshPanel();
                        G.hongdian.getHongdian(1, function () {
                            G.frame.huodong.checkRedPoint();
                        })
                    })
                })
            }
        }
    })
})();
