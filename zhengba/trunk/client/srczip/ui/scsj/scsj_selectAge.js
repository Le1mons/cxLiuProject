/**
 * Created by LYF on 2019/10/12.
 */
(function () {
    //神宠水晶-选择神宠之卵
    var ID = 'scsj_selectAge';

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
            var y = me.nodes.panel_top.y - me.nodes.panel_top.height / 2;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_bc.click(function () {
                if (G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum <= 0) {
                    return G.tip_NB.show(L("JRGMCSBZ"));
                }
                G.frame.iteminfo_plgm.data({
                    add: true,
                    buy: G.gc.petcom.base.daily_goods.prize[0],
                    num: 1,
                    buyneed: G.gc.petcom.base.daily_goods.need[G.frame.scsj.DATA.buynum],
                    buyConf: G.gc.petcom.base.daily_goods.need,
                    buyIndex: G.frame.scsj.DATA.buynum,
                    buyNum: G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum,
                    str: X.STR(L("JRHKGMXC"), G.gc.petcom.base.daily_goods.num - G.frame.scsj.DATA.buynum),
                    callback: function (num) {
                        me.ajax("pet_buyegg", [num], function (str, data) {
                            if (data.s == 1) {
                                G.frame.scsj.DATA.buynum += num;
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                me.showAgeNum();
                            }
                        });
                    }
                }).show();
            });
            me.nodes.btn_hqtj.click(function (sender) {
                if(!me.go){
                    me.nodes.panel_top.runActions([
                        cc.moveBy(0.1, 0, 17)
                    ]);
                    new X.bView("zhuangbei_tip2.json", function (node) {
                        X.autoInitUI(node);
                        me.go = node.nodes.panel_bg.clone();
                        me.go.setAnchorPoint(0.5,1);
                        me.ui.addChild(me.go);
                        me.go.setPosition(320, y + 20);
                        me.setGo(G.gc.petcom.base);
                        me.go.runActions([
                            cc.moveBy(0.1, 0, -20)
                        ]);
                    });
                }else{
                    me.go.removeFromParent(true);
                    delete me.go;
                    me.nodes.panel_top.runActions([
                        cc.moveBy(0.1, 0, -17)
                    ]);
                }
            });
            me.nodes.btn.click(function () {
                me.ajax("pet_inbucation", [me.selectId, me.id], function (str, data) {
                    if (data.s == 1) {
                        me.remove();
                        G.frame.scsj.getData(0, function () {
                            G.frame.scsj.panel.setRoomState();
                        });
                    }
                });
            });
        },
        setGo: function(conf){
            var me = this;
            var btnArr = [];
            for(var i = 0; i < conf.tujing.length; i ++){
                var btn = G.class.setTZ(conf.tujing[i]);
                btnArr.push(btn);
            }
            btnArr.sort(function (a, b) {
                return a.is > b.is ? -1 : 1;
            });
            X.autoInitUI(me.go);
            me.go.nodes.btn_hqtj.hide();
            X.center(btnArr, me.go.nodes.panel_ico);
        },
        onOpen: function () {
            var me = this;
            me.room=G.frame.scsj.panel.room;
            me.conf = {
                1:[1,2,3],
                2:[4,5,6],
                3:[7,8,9],
            }
            me.id=me.conf[me.room][me.data()] ;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.items = [];
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setDataTime: function (key,time) {
            var me = this;
            var allData = G.frame.scsj.DATA.crystal.data;
            for(var i=me.conf[me.room][0];i<=me.conf[me.room][2];i++){
                if(allData[i]){
                    if(i != key && allData[i].time < time ){
                        me.lastTime = allData[i].time;
                    }
                }
            }
        },
        setContents: function () {
            var me = this;
            me.nodes.panbel_wp.removeAllChildren();
            me.xzbtn = [];
            var allData = G.frame.scsj.DATA.crystal.data;
            for(var i=me.conf[me.room][0];i<=me.conf[me.room][2];i++){
                var data = allData[i];
                me.lastTime=0;

                if(data){
                    var list=new ccui.Layout();
                    item=G.class.sitem(data.id);
                    var text=new ccui.Text();
                    me.setDataTime(i,data.time);
                    if(me.lastTime == 0){
                        X.timeout(text,data.time)
                    }else{
                        var time = data.time - me.lastTime;
                        text.setString(X.timeLeft(time,"h:mm:s"));
                    }

                    text.y=-35
                    list.addChild(item);
                    list.addChild(text);

                }else{
                    var list=new ccui.Layout();
                    list.setBackGroundImage("img/public/head_di.png",1);
                    
                    var list1=new ccui.Layout();
                    list1.setBackGroundImage("img/public/img_dwjiahao.png",1);
                    list.addChild(list1);
                    list.click(function(sender){
                        
                    })
                }
                me.xzbtn.push(list)
            }
            X.center(me.xzbtn,me.nodes.panbel_wp);
            me.xzbtn[me.data()].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.showAge();
            me.showAgeNum();
        },
        showAgeNum: function () {
            var me = this;

            for (var i in me.items) {
                var item = me.items[i];
                item.num.setString(G.class.getOwnNum(item.data.t, "item"));
            }
        },
        showAge: function () {
            var me = this;
            var conf = G.gc.petcom.base.egg;
            var keys = Object.keys(conf);

            keys.sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });
            var item = [];
            for (var i = 0; i < keys.length; i ++) {
                item.push({a: "item", t: keys[i], n: G.class.getOwnNum(keys[i], "item")});
            }
            X.alignCenter(me.nodes.panbel_jlwp, item, {
                mapItem: function (node) {
                    me.items.push(node);
                    node.num.show();
                    node.setTouchEnabled(true);
                    node.click(function (sender) {
                        if (me.lastNode) me.lastNode.setGou(false);
                        sender.setGou(true);
                        me.lastNode = sender;
                        me.selectId = sender.data.t;
                        me.setState();
                    });
                }
            });
            me.items[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setState: function () {
            var me = this;
            var conf = G.gc.petcom.base.egg[me.selectId];
            me.nodes.btn_bc.setVisible(me.selectId == "2056");

            var rh = X.setRichText({
                str: conf.intro,
                parent: me.nodes.txt_jl,
                size: 14
            });
            rh.setPosition(me.nodes.txt_jl.width - rh.trueWidth(), me.nodes.txt_jl.height / 2 - rh.trueHeight() / 2);
        }
    });

    G.frame[ID] = new fun('scsj_top_xzsczn.json', ID);
})();