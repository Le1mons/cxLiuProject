/**
 * Created by LYF on 2019/3/13.
 */
(function () {
    //至尊礼包
    G.class.huodong_zzlb = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.data = data;
            me._super("event_zhizunlibao.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_zzlbbtn.click(function () {
                G.event.once('paysuccess', function() {
                    me.refreshPanel();
                });
                G.event.emit('doSDKPay', {
                    pid:me.DATA.info.proid,
                    logicProid: me.DATA.info.proid,
                    money: me.DATA.info.unitPrice,
                });
            });

            me.nodes.btn.click(function () {

                me.ajax('huodong_use', [me.data.hdid,1,me.DATA.myinfo.val - 1], function (str, dd) {
                    if (dd.s == 1){
                        G.frame.jiangli.data({
                            prize: me.data.data.arr[me.DATA.myinfo.val - 1]
                        }).show();
                        me.refreshPanel();
                    }
                },true);
            }, 2000);
        },
        refreshPanel: function() {
            var me = this;

            me.getData(function () {
                me.setViewInfo();
                if(me.data.stype == '10030'){
                    G.hongdian.getData("zzlb", 1, function () {
                        G.frame.huodong.checkRedPoint();
                    });
                }else {
                    G.hongdian.getData("yzlb", 1, function () {
                        G.frame.huodong.checkRedPoint();
                    });
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.img_lb_biaoqian.loadTexture(me.data.stype == 10030 ? "img/zzlb/zzlb_fl1.png" : "img/zzlb/zzlb_fl2.png", 1);
            me.nodes.img_litp.loadTexture(me.data.stype == 10030 ? "img/zzlb/zzlb_wzbg.png" : "img/zzlb/yzli_wzbg.png", 1);
            if(me.data.stype == 10030) {
                me.ui.finds("Panel_10").setBackGroundImage("img/bg/zzyzlb_bg2.jpg");
            }
            me.list = new ccui.Layout();
            me.list.setContentSize(100, 100);
            me.ui.addChild(me.list);
            me.nodes.panel_list.hide();
            me.nodes.panel_yzlb.hide();
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me.data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me.data.hdid,function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var allArr = [];
            var arr = [];
            var nu = [];
            var line = [];
            var prize = [];
            var obj = {};

            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.txt_yuanshu.setString(me.DATA.info.showmoney + L("YUAN"));
            
            for (var i in me.DATA.info.arr) {
                for (var j in me.DATA.info.arr[i]) {
                    prize.push(me.DATA.info.arr[i][j])
                }
            }

            for (var i in prize) {
                if(obj[prize[i].t]) {
                    obj[prize[i].t].n += prize[i].n;
                } else {
                    obj[prize[i].t] = {n: prize[i].n, a: prize[i].a};
                }
            }

            for (var i in obj) {
                var item = {};
                item.a = obj[i].a;
                item.t = i;
                item.n = obj[i].n;
                arr.push(item);
            }

            
            // for (var i in arr) {
            //     nu.push(arr[i]);
            //     if(nu.length == 4) {
            //         line.push(nu);
            //         nu = [];
            //     }
            // }
            // if(nu.length > 0) line.push(nu);
            // for (var i in line) {
            //     var layout = new ccui.Layout();
            //     layout.setContentSize(400, 100);
            //
            //     for (var j = 0; j < line[i].length; j ++) {
            //         var item = G.class.sitem(line[i][j]);
            //         G.frame.iteminfo.showItemInfo(item);
            //         item.setScale(.8);
            //         item.setPosition(50 + j * 85, 50);
            //         layout.addChild(item);
            //     }
            //
            //     // me.nodes.listview_wp.addChild(layout);
            // }

            var table = new X.TableView(me.nodes.scrollview, me.list, 4, function (ui, data) {
                (function (node, dd) {
                    var prize = G.class.sitem(dd);
                    prize.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(prize);
                    prize.setScale(.7);
                    G.frame.iteminfo.showItemInfo(prize);
                })(ui, data)
            });
            table.setData(arr);
            table.reloadDataWithScroll(true);
            table._table.tableView.setTouchEnabled(false);

            me.ui.finds("Button_2").click(function () {

                G.frame.zzlb_prize.data(me.DATA.info.arr).show();
            });

            me.setViewInfo();
        },
        setViewInfo: function () {
            var me = this;

            if(me.DATA.myinfo.val) {
                me.nodes.panel_list.show();
                me.nodes.panel_yzlb.hide();

                X.setRichText({
                    str: X.STR(L("DJTKLQ"), me.DATA.myinfo.val, 7),
                    parent: me.nodes.txt,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: me.nodes.txt.width / 2, y: me.nodes.txt.height / 2},
                    color: "#fff8e1"
                });

                X.alignItems(me.nodes.ico_item, me.data.data.arr[me.DATA.myinfo.val - 1], "left", {
                    touch: true
                });

                if(X.inArray(me.DATA.myinfo.gotarr, me.DATA.myinfo.val - 1)) {
                    me.nodes.btn.setEnableState(false);
                    me.nodes.btn_txt.setString(L("YLQ"));
                    me.nodes.btn_txt.setTextColor(cc.color("#6c6c6c"));
                    G.removeNewIco(me.nodes.btn);
                } else {
                    G.setNewIcoImg(me.nodes.btn);
                    me.nodes.btn.getChildByName("redPoint").setPosition(122, 52);
                }
            } else {
                me.nodes.panel_list.hide();
                me.nodes.panel_yzlb.show();
                me.nodes.txt_yuanshul.setString(me.DATA.info.money + L("YUAN"));

                X.timeout(me.nodes.txt_djs, me.data.rtime);
            }
        }
    });
})();