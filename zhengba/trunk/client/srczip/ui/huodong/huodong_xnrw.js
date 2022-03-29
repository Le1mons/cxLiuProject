/**
 * Created by LYF on 2019-01-25
 */
(function () {
    //新年任务
    G.class.huodong_xnrw = X.bView.extend({
        ctor: function (data) {
            var me = this;
            G.frame.huodong.xnrw = me;
            me._data = data;
            me._super("event_xinnianrenwu.json");
        },
        setContents: function () {
            var me = this;

            me.setBanner();
        },
        setBanner: function () {
            var me = this;

            for (var i in G.gc.xinnianrenwu.data) {
                (function (idx, data) {
                    var list = me.nodes.list.clone();
                    var lay = me.nodes["list" + idx];
                    var cur = me.DATA.myinfo.val[idx] ? me.DATA.myinfo.val[idx] : 0;
                    var klq = false;
                    list.show();
                    X.autoInitUI(list);
                    list.setAnchorPoint(0.5, 0.5);
                    list.setPosition(lay.width / 2, lay.height / 2);
                    list.nodes.img_dltp.zIndex = -2;
                    list.nodes.txt_rwmz.setString(data.desc);
                    list.nodes.txt_wz1.setString(cur + "/" + data.val);
                    list.nodes.txt_wz1.setTextColor(cc.color(cur >= data.val ? "#009016" : "#E11919"));

                    if(cur >= data.val && !X.inArray(me.DATA.myinfo.gotarr, idx)) {
                        klq = true;
                        G.setNewIcoImg(list, .8);
                        G.class.ani.show({
                            json: "ani_xinnianrenwu_denglong",
                            addTo: list,
                            x: 87,
                            y: 88,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node) {
                                node.zIndex = -1;
                            }
                        });
                    } else {
                        G.removeNewIco(list);
                    }

                    if(X.inArray(me.DATA.myinfo.gotarr, idx)) {
                        list.nodes.img_dltp.loadTexture("img/xinnianhuodong/img_xnrw_dl1.png", 1);
                        list.nodes.panel_yl.show();
                    }

                    list.click(function () {
                        if(klq) {
                            me.ajax("huodong_use", [me._data.hdid, 1, idx], function (str, data) {
                                if(data.s == 1) {
                                    G.frame.jiangli.data({
                                        prize: data.d.myinfo
                                    }).show();
                                    me.refreshPanel();
                                    if(me._data.isqingdian){
                                        G.hongdian.getData("qingdian", 1, function () {
                                            G.frame.zhounianqing_main.checkRedPoint();
                                        });
                                    }else {
                                        G.hongdian.getData("huodong", 1, function () {
                                            G.frame.huodong.checkRedPoint();
                                        });
                                    }
                                }
                            });
                        } else {
                            G.frame.jiangliyulan.data({
                                prize: data.p
                            }).show();
                        }
                    });

                    lay.removeAllChildren();
                    lay.addChild(list);

                })(i, G.gc.xinnianrenwu.data[i]);
            }
        },
        refreshPanel: function () {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    me.setContents();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function (data) {
            //     me.DATA = data;
            //     me.setContents();
            // });
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;

            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.nodes.txt_tx.setString(L("HDSJ")
                + X.timetostr(me._data.stime, "y-m-d").split(" ")[0]
                + L("ZHI") + X.timetostr(me._data.rtime, "m-d").split(" ")[0]);
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
    });

})();
