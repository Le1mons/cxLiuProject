/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //招财进宝

    G.frame.chongzhi.on("hide", function () {
        if(G.frame.huodong.zcjb) {
            G.frame.huodong.zcjb.refreshPanel();
        }
    });

    G.class.huodong_zcjb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_zhaocaijingbao.json");
            G.frame.huodong.zcjb = me;
        },
        setContents: function () {
            var me = this;

            me.setBanner();
            me.setTable();
        },
        setBanner: function () {
            var me = this;
            var nr = me.ui.finds("Panel_15");
            var day = me.nodes.txt_tx;
            nr.removeAllChildren();
            day.removeAllChildren();

            var str = me._data.intr;
            var rh = new X.bRichText({
                size: 20,
                maxWidth: nr.width,
                lineHeight: 32,
                color: "#fff6c5",
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, nr.height);
            nr.addChild(rh);

            if(8 - me.DATA.daynum * 1 > 1) {
                var str1 = X.STR(L("SYXT"), 8 - me.DATA.daynum * 1);
                var rh1 = new X.bRichText({
                    size: 22,
                    maxWidth: day.width,
                    lineHeight: 32,
                    color: "#ffffff",
                    family: G.defaultFNT,
                    eachText: function (node) {
                        X.enableOutline(node, "#000000", 2);
                    }
                });
                rh1.text(str1);
                rh1.setAnchorPoint(0.5, 0.5);
                rh1.setPosition(day.width / 2, day.height / 2);
                day.addChild(rh1);
            }else {
                var str2 = L("SYXS");
                var txt1 = new ccui.Text("", G.defaultFNT, 16);
                txt1.setTextColor(cc.color("#2bdf02"));
                X.enableOutline(txt1, "#000000", 2);
                X.timeout(txt1, me._data.etime, function () {
                    X.uiMana.closeAllFrame();
                });
                var rh2 = new X.bRichText({
                    size: 22,
                    maxWidth: day.width,
                    lineHeight: 32,
                    color: "#ffffff",
                    family: G.defaultFNT,
                    eachText: function (node) {
                        X.enableOutline(node, "#000000", 2);
                    }
                });
                rh2.text(str2, [txt1]);
                rh2.setAnchorPoint(0.5, 0.5);
                rh2.setPosition(day.width / 2, day.height / 2);
                day.addChild(rh2);
            }


        },
        setTable: function () {
            var me = this;

            for(var i = 1; i < 8; i ++) {
                var list = me.ui.finds("list").clone();
                list.show();
                list.setPosition(0, -40);
                list.finds("ts1").y = 195;
                var str = X.STR(L("DXT"), i);
                var rh = new X.bRichText({
                    size: 22,
                    maxWidth: list.finds("ts1").width,
                    lineHeight: 32,
                    color: "#ffffff",
                    family: G.defaultFNT,
                    eachText: function (node) {
                        X.enableOutline(node, "#000000", 2);
                    }
                });
                rh.text(str);
                rh.setAnchorPoint(0.5, 0.5);
                rh.setPosition(list.finds("ts1").width / 2, list.finds("ts1").height / 2 - 40);
                list.finds("ts1").addChild(rh);

                if(!me.DATA.myinfo.val[i]) {
                    list.finds("ico").setBackGroundImage("img/zhaocaijingbao/ico_zcjb_bx1.png", 1);
                    list.finds("jy1").hide();
                    list.finds("img_jryc").hide();
                    list.finds("zs").hide();
                    list.finds("sz_1").hide();
                }else {
                    list.finds("wz1").hide();
                    list.finds("ico").setBackGroundImage("img/zhaocaijingbao/ico_zcjb_bx2.png", 1);
                    list.finds("sz_1").setString(me.DATA.myinfo.val[i])
                }

                me.nodes["list" + i].removeAllChildren();
                me.nodes["list" + i].addChild(list);
            }

            if(me.DATA.daynum * 1 < 8) {
                me.nodes.btn_qwcz.show();
                me.nodes.btn_cz.hide();
            }else {
                me.nodes.btn_qwcz.hide();
                me.nodes.btn_cz.show();
            }

            if(me.DATA.myinfo.finish) {
                me.nodes.btn_cz.setBright(false);
                me.nodes.btn_cz.setTouchEnabled(false);
            }

            for(var i = 0; i < me.DATA.info.fanli.length; i ++) {
                var data = me.DATA.info.fanli[i];
                var text = me.nodes["zt" + (i + 1)];
                if(!text) break;
                var str2 = X.STR(L("VIPFL"), data[0], data[1], parseInt(me.DATA.sum * (data[1] / 100)));
                var img = new ccui.ImageView(G.class.getItemIco("rmbmoney"), 1);
                var color = P.gud.vip >= data[0] ? (me.DATA.info.fanli[i + 1] ?
                    (P.gud.vip >= me.DATA.info.fanli[i + 1][0] ? "#ffffff" : "#30ff01")
                    :"#30ff01") : "#ffffff";
                var rh3 = new X.bRichText({
                    size: 16,
                    maxWidth: text.width,
                    lineHeight: 32,
                    color: color,
                    family: G.defaultFNT,
                });
                rh3.text(str2, [img]);
                rh3.setAnchorPoint(0, 0.5);
                rh3.setPosition(0, text.height / 2);
                text.removeAllChildren();
                text.addChild(rh3);
            }
        },
        refreshPanel: function () {
            var me = this;

            G.frame.huodong.getData(me._data.hdid, function (data) {
                me.DATA = data;
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_qwcz.click(function () {
                G.frame.chongzhi.show();
            });
            me.nodes.btn_cz.click(function (sender) {
                me.ajax('huodong_use', [me._data.hdid, 1, 1], function (str, dd) {
                    if (dd.s == 1){
                        sender.setBright(false);
                        sender.setTouchEnabled(false);
                        G.frame.jiangli.data({
                            prize: dd.d.prize
                        }).show();
                        G.hongdian.getData("huodong", 1, function () {
                            G.frame.huodong.checkRedPoint();
                        });
                    }
                },true);
            }, 6000);
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.ui.finds("list").hide();
            me.refreshPanel();
        },
        onNodeShow: function () {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        onRemove: function () {
            var me = this;
            G.frame.huodong.zcjb = undefined;
        },
    })
})();