/**
 * Created by LYF on 2018/7/8.
 */
(function () {
    //周长活动
    G.class.huodong_djdr = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me._super("event_scrollview.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBtn: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.img = {
                10010: {
                    bg: "img_event_banner9.png",
                    icon: "token_jb.png",
                },
                10008: {
                    bg: "img_event_banner10.png",
                    icon: "token_baoxiang.png",
                },
                10009: {
                    bg: "img_event_banner11.png",
                    icon: "token_xsjf.png",
                },
                10022: {
                    bg: "img_event_banner16.png",
                    icon: "token_kstx.png"
                }
            }
        },
        onShow: function () {
            var me = this;
            me.nodes.panel_banner2.show();
            me.nodes.Image_5.show();
            me.nodes.wz_title.removeAllChildren();

            var tt = new X.bRichText({
                size: 19,
                maxWidth: me.nodes.wz_title.width,
                lineHeight: 32,
                color: "#efe4c7",
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            tt.text(me.DATA.intr);
            tt.setAnchorPoint(0, 1);
            tt.setPosition(0, me.nodes.wz_title.height);
            me.nodes.wz_title.addChild(tt);

            me.nodes.panel_banner2.setBackGroundImage("img/event/" + me.img[me.DATA.stype].bg,0);

            var str = "<font node=1></font>" + me.DATA.buff;
            var img = new ccui.ImageView("img/public/token/" + me.img[me.DATA.stype].icon, 1);
            img.setScale(.8);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: me.ui.finds("wz_xg").width,
                lineHeight: 32,
                color: "#fff8e1",
                family: G.defaultFNT,
            });
            rh.text(str, [img]);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, me.ui.finds("wz_xg").height);
            me.ui.finds("wz_xg").addChild(rh);

            me.nodes.panel_txt3.show();
            me.nodes.panel_txt2.show();
            me.ui.finds("btn_phjl").show();
            me.ui.finds("btn_phjl").click(function () {
                G.frame.huodong_phb.data(me.DATA).show();
            });
            me.nodes.btn_jlyl.show();
            me.nodes.btn_jlyl.click(function () {
                G.frame.huodong_jlyl.data(me.DATA.data.rankprize).show();
            });
            me.nodes.btn_buy2.hide();
            me.nodes.txt_count2.show();
            me.nodes.txt_count2.setString(L("JLJS"));
            me.nodes.txt_time2.show();

            var time = me.DATA.etime - 5 * 60;

            if(G.time > me.DATA.rtime && G.time < me.DATA.etime) {
                me.nodes.txt_count2.hide();
                me.nodes.txt_time2.setString(L("已截止"));
                me.nodes.txt_time2.setTextColor(cc.color("#ffffff"))
            }else {
                if(time - G.time > 24 * 3600 * 2) {
                    me.nodes.txt_count2.hide();
                    me.nodes.txt_time2.setString(X.moment(time - G.time));
                }else {
                    X.timeout(me.nodes.txt_time2, time, function () {
                        X.uiMana.closeAllFrame();
                    });
                }
            }



            X.setHeroModel({
                parent: me.nodes.panel_hero,
                data: {hid: me.DATA.model},
                // scaleNum: .5,
                // direction: -.5
            });

            if(me.DATA.stype == 10010) {
                G.frame.dianjin.once("hide", function () {
                    if(!G.frame.huodong.isShow) return;
                    G.hongdian.getData("zhouchanghuodong" ,1, function () {
                        G.frame.huodong.checkRedPoint();
                    });
                    me.refreshData();
                })
            }

            X.viewCache.getView("event_list3.json", function (node) {
                me.list = node.nodes.panel_list;
                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("huodong_open", [me.DATA.hdid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.data = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            // me.setBanner();
            cc.enableScrollBar(me.nodes.scrollview);
            me.setTable();
            //me.setBaseInfo();
        },
        refreshData: function () {
            var me = this;
            me.getData(function () {
                me.setTable();
            });
        },
        setTable: function () {
            var me = this;
            var scrollview = me.nodes.scrollview;
            var data = me.data.info.arr;

            for(var i = 0; i < data.length; i ++){
                data[i].idx = i;
            }
            for(var i = 0; i < data.length; i ++){
                if(X.inArray(me.data.myinfo.gotarr, data[i].val)){
                    data[i].rank = 2;
                }else{
                    data[i].rank = 1;
                }
            }
            data.sort(function (a, b) {
                if(a.rank != b.rank){
                    return a.rank < b.rank ? -1 : 1;
                }else{
                    return a.val < b.val ? -1 : 1;
                }

            });

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview, me.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
                table._table.tableView.setBounceable(false);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }


        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                txt_jdt: function(node){
                    node.setString(me.data.myinfo.val + "/" + data.val);
                    X.enableOutline(node,'#66370e',2);
                },
                txt_title: function (node) {
                    node.removeAllChildren();

                    var txt = new ccui.Text(X.STR(me.DATA.tips, data.val), G.defaultFNT, 22);
                    txt.setFontName(G.defaultFNT);
                    txt.setTextColor(cc.color(G.gc.COLOR.n4));
                    txt.setAnchorPoint(0,0.5);
                    txt.setPosition(0, node.height / 2 + 3);
                    node.addChild(txt);
                },
                img_jdt: function (node) {
                    node.setPercent(me.data.myinfo.val / data.val * 100);
                },
                ico_item: function (node) {
                    node.removeAllChildren();
                    X.alignItems(node, data.p, 'left', {
                        touch: true,
                        mapItem: function (item) {
                        }
                    })
                },
                btn_txt: function (node) {
                    node.setString(X.inArray(me.data.myinfo.gotarr, data.val) ? L("YLQ") : L("LQ"));
                    if( me.data.myinfo.val >= data.val) {
                        node.setTextColor(cc.color(X.inArray(me.data.myinfo.gotarr, data.val) ? G.gc.COLOR.n15 : G.gc.COLOR.n13));
                    }else {
                        node.setTextColor(cc.color(G.gc.COLOR.n15));
                    }
                },
                btn: function (node) {
                    node.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    var is = X.inArray(me.data.myinfo.gotarr, data.val) ? false : true;
                    if(is && me.data.myinfo.val >= data.val){
                        G.setNewIcoImg(node, .9);
                    }else{
                        G.removeNewIco(node);
                    }
                    if( me.data.myinfo.val >= data.val) {
                        node.setTouchEnabled(is);
                        node.setBright(is);
                    }else {
                        //node.setTouchEnabled(false);
                        node.setBright(false);
                    }
                    node.click(function (sender, type) {
                        if(me.data.myinfo.val < data.val){
                            G.tip_NB.show(L("WDDLQTJ"));
                            return;
                        }
                        G.ajax.send("huodong_use", [me.DATA.hdid, 1, data.idx], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.p
                                }).show();
                                me.refreshData();
                                // G.frame.huodong.updateTop();
                                G.hongdian.getData("huodong", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            }
                        }, true)
                    })
                }
            }, ui.nodes);
            ui.show();
        }
    })
})();