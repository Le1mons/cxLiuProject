/**
 * Created by LYF on 2018/10/18.
 */
(function () {
    //公会-宝箱
    var ID = 'gonghui_box';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.preLoadRes = ["gonghui1.png", "gonghui1.plist"]
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("GHBK"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
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
        getData: function(callback){
            var me = this;

            G.ajax.send("gonghui_baokuopen", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    if(me.DATA.buynum < 0) {
                        me.DATA.buynum = 0;
                    }
                    callback && callback();
                }
            })
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            new X.bView('gonghui_gubk.json', function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.addChild(view);
                me._view.nodes.list.setTouchEnabled(false);
                me._view.nodes.panel_list.setTouchEnabled(false);
                me._view.nodes.panel_list.finds("img_shelf").setTouchEnabled(false);
                me._view.nodes.panel_1.setTouchEnabled(false);
                me._view.nodes.panel_2.setTouchEnabled(false);
                me._view.nodes.panel_3.setTouchEnabled(false);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.setTop();
            me.setBottom();
            me.setBoxNum();
        },
        setBoxNum: function() {
            var me = this;
            var text = me._view.finds("txt_geshu");

            var str = X.STR(L("GHBXSY"), me.DATA.buynum);
            var rh = new X.bRichText({
                size: 18,
                maxWidth: text.width,
                lineHeight: 32,
                color: "#ffffff",
                family: G.defaultFNT
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(text.width / 2, text.height / 2);
            text.removeAllChildren();
            text.addChild(rh);

            me._view.nodes.btn_vip.setTouchEnabled(me.DATA.buynum ? true : false);
            me._view.nodes.btn_vip.setBright(me.DATA.buynum ? true : false);

            G.hongdian.getData("gonghui", 1, function() {
                G.frame.gonghui_main.checkRedPoint();
            });
        },
        setTop: function () {
            var me = this;
            var arr = [];
            // var box = G.class.sitem({a: "item", t: "box"});
            // arr.push(box);

            X.alignItems(me._view.nodes.listv1, [{ a: "item", t: "box" }],'left', {
                scale: .7,
                touch:true,
                callback: function (node) {
                    var box = G.class.sitem({ a: "item", t: "box" });
                    node.data = box.data;
                    node.children[0].icon.setTouchEnabled(true);
                    node.children[0].icon.setSwallowTouches(false);
                    node.click(function () {
                        G.frame.iteminfo.showItemInfo(box);
                    })
                }
            });
            X.alignCenter(me._view.nodes.listv, G.class.gonghui.get().base.boxbuyprize, {
                touch: true,
                scale: .7
            });

            me._view.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS17")
                }).show();
            });
            
            me._view.nodes.btn_vip.click(function () {
                G.event.once('paysuccess', function() {
                    me.getData(function () {
                        me.setBoxNum();
                        me.setBottom();
                    })
                });
                G.event.emit('doSDKPay', {
                    pid: me.DATA.con.proid,
                    logicProid: me.DATA.con.proid,
                    money: me.DATA.con.unitPrice,
                });
            }, 3000)
        },
        setBottom: function () {
            var me = this;
            var arr = [];
            var data = me.DATA.boxdata;

            me.setData(data);

            me._view.nodes.listview.removeAllChildren();
            cc.enableScrollBar(me._view.nodes.listview);
            var data_length = 6;
            if(data.length < 6){
                data_length = 6;
            }else{
                data_length = data.length;
            }

            for (var i = 0; i < data_length; i++) {
                arr.push(me.setItem(me._view.nodes.panel_list.clone(), data[i], i < data.length ? false : true));
                if ((i + 1) % 3 == 0) {
                    var layout = me._view.nodes.list.clone();
                    me.addItem(layout, arr);
                    me._view.nodes.listview.pushBackCustomItem(layout);
                    arr = [];
                }
            }
            if(arr.length > 0) {
                var layout = me._view.nodes.list.clone();
                me.addItem(layout, arr);
                me._view.nodes.listview.pushBackCustomItem(layout);
            }
        },
        setItem: function(item, data, fake) {
            var me = this;
            var suo = item.finds("img_suo");
            var bg = item.finds("img_shelf");
            var name = item.finds("txt_name$");
            var box = item.finds("panel_treasure$");
            var time = item.finds("txt_shijian$");
            var light = item.finds("bg_hei");
            var img_wz = item.finds("img_ygq$");
            var state;

            light.hide();
            item.setAnchorPoint(0.5, 0.5);
            if (fake) {
                var bg = item.finds("img_shelf");
                var suo = item.finds("img_suo");
                var time = item.finds("txt_shijian$");
                item.setAnchorPoint(0.5, 0.5);
                bg.setBackGroundImage("img/gonghui/bg_baoxiang3.png", 1);
                time.setString(L("WJH"));
                bg.show();
                suo.show();
                return item;
            }

            suo.hide();
            if(!data) {
                suo.show();
                time.setString(L("BXW"));
                bg.setBackGroundImage("img/gonghui/bg_baoxiang3.png", 1);
                return item;
            }

            data.uidArr = [];

            for (var i = 0; i < data.reclist.length; i ++) {
                data.uidArr.push(data.reclist[i].uid);
            }

            name.setString(data.buyer.name);

            if(data.ctime + 24 * 3600 < G.time) {
                //已过期
                light.show();
                img_wz.show();
                img_wz.loadTexture("img/gonghui/img_ygq.png", 1);
                time.setString(L("BXYGQ"));
                // time.setTextColor(cc.color(G.gc.COLOR.n1));
                // X.enableOutline(time, '#9d3b10', 2);
                bg.setBackGroundImage("img/gonghui/bg_baoxiang3.png", 1);
            }else if(X.inArray(data.uidArr, P.gud.uid)) {
                //已领取
                state = "get";
                time.setString(L("YLQ"));
                light.show();
                img_wz.hide();
                time.setTextColor(cc.color(G.gc.COLOR.n1));
                X.enableOutline(time, '#008103', 2);
                bg.setBackGroundImage("img/gonghui/bg_baoxiang4.png", 1);
            }else if(!X.inArray(data.uidArr, P.gud.uid) && data.uidArr.length < 10) {
                //可领取
                state = "can";
                bg.setBackGroundImage("img/gonghui/bg_baoxiang.png", 1);
                X.timeout(time, data.ctime + 24 * 3600, function () {
                    me.setItem(item, data);
                })
            }else {
                //被领完
                state = "all";
                light.show();
                img_wz.show();
                img_wz.loadTexture("img/gonghui/img_yqw.png", 1);
                bg.setBackGroundImage("img/gonghui/bg_baoxiang2.png", 1);
                time.setString(L("YQW"));
                time.setTextColor(cc.color(G.gc.COLOR.n1));
                X.enableOutline(time, '#9d3b10', 2);
            }

            if(state == "can") {
                box.setBackGroundImage("img/gonghui/ico_gonghui_bx3.png", 1);
            }else {
                box.setBackGroundImage("img/gonghui/ico_gonghui_bx2.png", 1);
            }
            data.state = state;
            box.setTouchEnabled(true);
            box.click(function () {
                if(!state || state == "get") {
                    G.frame.gonghui_getinfo.data(data).show();
                }else {
                    G.frame.gonghui_openbox.data(data).show();
                }
            });
            return item;
        },
        setData: function (data) {

            for (var i = 0; i < data.length; i ++) {
                data[i].uidArr = [];
                for (var j = 0; j < data[i].reclist.length; j++) {
                    data[i].uidArr.push(data[i].reclist[j].uid);
                }
                if(data[i].uidArr.length < 10 && !X.inArray(data[i].uidArr, P.gud.uid) && (data[i].ctime + 24 * 3600 > G.time)) {
                    data[i].rank = 1;
                }else {
                    data[i].rank = 2;
                }
            }
            data.sort(function (a, b) {
                if(a.rank != b.rank) {
                    return a.rank < b.rank ? -1 : 1;
                }else {
                    return a.ctime > b.ctime ? -1 : 1;
                }
            })
        },
        addItem: function (target, arr) {
            for (var i = 0; i < arr.length; i ++) {
                arr[i].setPosition(target.children[i].width - target.children[i].width / 2, target.children[i].height / 2);
                target.children[i].addChild(arr[i]);
            }
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();