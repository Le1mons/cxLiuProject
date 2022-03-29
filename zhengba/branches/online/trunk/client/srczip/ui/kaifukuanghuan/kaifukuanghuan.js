/**
 * Created by LYF on 2018/7/10.
 */
(function () {

    G.event.on("attrchange_over", function () {
        if(G.frame.kaifukuanghuan.isShow) {
            G.frame.kaifukuanghuan.updateAttr();
        }
    });

    //开服狂欢
    var ID = 'kaifukuanghuan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        updateAttr: function() {
            var me = this;
            var jinbi = me.nodes.txt_jb;
            var rmb = me.nodes.txt_zs;
            jinbi.setString(X.fmtValue(G.class.getOwnNum('jinbi','attr')));
            rmb.setString(X.fmtValue(G.class.getOwnNum('rmbmoney','attr')));
        },
        initUi: function () {
            var me = this;
            var arr = [];
            var menu = G.class.menu.get("kaifukuanghuan");
            var rw = me.nodes.panel_rw;
            var jinbi = me.nodes.txt_jb;
            var rmb = me.nodes.txt_zs;
            jinbi.setString(X.fmtValue(G.class.getOwnNum('jinbi','attr')));
            rmb.setString(X.fmtValue(G.class.getOwnNum('rmbmoney','attr')));

            me.nodes.btn_jia1.click(function () {
                G.frame.dianjin.show();
                G.frame.dianjin.once("hide", function () {
                    jinbi.setString(X.fmtValue(G.class.getOwnNum('jinbi','attr')));
                });
            });

            me.nodes.btn_jia2.click(function () {
                G.frame.chongzhi.show();
                G.frame.chongzhi.once("hide", function () {
                    rmb.setString(X.fmtValue(G.class.getOwnNum('rmbmoney','attr')));
                    me.getData(me._curDay, function () {
                        me.changeType(me._curType);
                        me.checkRedPoint();
                        me.checkRedPoint1();
                    });
                })
            });

            if(me.nodes.btn_ph) {
                me.nodes.btn_ph.hide();
            }

            // me.nodes.btn_ph.click(function () {
            //     G.frame.kaifukuanghuan_phb.show();
            // });

            for(var i = 0; i < menu.length; i ++){
                var btn = me.nodes.btn_1.clone();
                btn.setName("btn" + menu[i].id);
                btn.getChildren()[0].setString(menu[i].title);
                btn.show();
                arr.push(btn);
                me.nodes.listview.addChild(btn);
            }
            X.radio(arr, function (sender) {
                me.changeType({btn1: 1, btn2: 2, btn3: 3, btn4: 4}[sender.getName()]);
            },{
                callback1: function (sender) {
                    X.enableOutline(sender.finds('txt_name$'), cc.color('#34221d'),2);
                },
                callback2: function (sender) {
                    X.enableOutline(sender.finds('txt_name$'), cc.color('#34221d'),2);
                },
            });
            G.class.ani.show({
                json:'ani_choukajuese',
                addTo:rw,
                x:rw.width/2,
                y:rw.height/2,
                repeat:true,
                autoRemove:false,
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            X.radio([me.nodes.btn_day1, me.nodes.btn_day2, me.nodes.btn_day3, me.nodes.btn_day4,
                me.nodes.btn_day5, me.nodes.btn_day6, me.nodes.btn_day7], function(sender){
                    me.changDay({
                        btn_day1$: 1,
                        btn_day2$: 2,
                        btn_day3$: 3,
                        btn_day4$: 4,
                        btn_day5$: 5,
                        btn_day6$: 6,
                        btn_day7$: 7,
                    }[sender.getName()]);
                })
        },
        changeType: function(type){
            var me = this;
            me.nodes.listview1.removeAllChildren();
            me._curType = type;
            me.setContents();
        },
        changDay: function(type){
            var me = this;
            me.getData(type, function () {
                me.checkRedPoint1();
                me.nodes.listview.getChildren()[me._curType - 1].triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
        },
        getData: function(type, callback){
            var me = this;
            G.ajax.send("kfkh_open", type ? [type] : [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me._curDay = d.d.sday;
                    me._openDay = d.d.oday;
                    if (!me.DATA){
                        me.initData(d.d.sday);
                    }
                    if (!type){
                        me.nodes["btn_day" + d.d.sday].triggerTouch(ccui.Widget.TOUCH_ENDED);
                    }
                    me.DATA = d.d;
                    callback && callback();
                }else{
                    me.remove();
                }
            })
        },
        getFirstData: function(type, callback){
            var me = this;

            G.ajax.send("kfkh_open", type ? [type] : [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me._curDay = d.d.sday;
                    me._openDay = d.d.oday;
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        initData: function () {
            var me = this;
            var time = new Date((G.DATA.asyncBtnsData.kaifukuanghuan.kfkhetime + 7 * 24 * 60 * 60) * 1000);
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            time.setMilliseconds(0);
            time = time.getTime()/1000;
            if (G.DATA.asyncBtnsData.kaifukuanghuan.kfkhetime > G.time){
                var rh = new X.bRichText({
                    size: 20,
                    maxWidth: me.ui.nodes.txt_number.width,
                    lineHeight: 34,
                    color: G.gc.COLOR.n34,
                    family: G.defaultFNT,
                    eachText: function (node) {
                        X.enableOutline(node,'#000000',1);
                    },
                });
                rh.text(X.moment(G.DATA.asyncBtnsData.kaifukuanghuan.kfkhetime - G.time));
                rh.setAnchorPoint(0, 0.5);
                rh.setPosition(0, me.ui.nodes.txt_number.height/2 + 4);
                me.ui.nodes.txt_number.addChild(rh);
            }else {
                // X.timeout(me.ui, me.ui.nodes.txt_number, time - G.time, function () {
                //     me.remove();
                // });
            }
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.bindBtn();
            me._curType = 1;
            cc.enableScrollBar(me.nodes.listview1);
            cc.enableScrollBar(me.nodes.listview_bx);
        },
        onAniShow: function () {
            var me = this;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getFirstData(null, function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.initUi();
            me.initData(me.DATA.sday);
            me.nodes["btn_day" + me.DATA.sday].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.checkRedPoint();
            me.nodes.listview1.setItemsMargin(-3);
        },
        checkRedPoint: function(){
            var me = this;
            var data = G.DATA.hongdian.kfkh;
            for(var i in data){
                if(data[i] > 0){
                    G.setNewIcoImg(me.nodes["btn_day" + i]);
                    me.nodes["btn_day" + i].getChildByName("redPoint").setPosition(100, 44);
                }else{
                    G.removeNewIco(me.nodes["btn_day" + i]);
                }
            }
        },
        checkRedPoint1: function(){
            var me = this;
            var redArr = [false, false, false];
            var typeArr = [1, 2, 3];
            for(var i = 0; i < 3; i ++){
                var data = me.getTypeData(typeArr[i]);
                for(var j = 0; j < data.length; j ++){
                    if(i == 0){
                        if(data[j].day == me._openDay && data[j].nval >= data[j].pval && data[j].finish != 1 && data[j].hdid != 1){
                            redArr[i] = true;
                            break;
                        }else{
                            if(data[j].nval >= data[j].pval && data[j].finish != 1){
                                redArr[i] = true;
                                break;
                            }
                        }
                    }else{
                        if(data[j].nval >= data[j].pval && data[j].finish != 1){
                            redArr[i] = true;
                            break;
                        }
                    }
                }
            }
            for(var i = 0; i < redArr.length; i ++){
                if(redArr[i]) {
                    G.setNewIcoImg(me.nodes.listview.getChildren()[i]);
                    me.nodes.listview.getChildren()[i].getChildByName("redPoint").x = 108;
                }
                else G.removeNewIco(me.nodes.listview.getChildren()[i]);
            }
        },
        getTypeData: function(type){
            var me = this;
            var arr = [];
            var data = me.DATA.data;
            for (var i = 0; i < data.length; i ++){
                if(data[i].tab == type){
                    arr.push(data[i]);
                }
            }
            return arr;
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("kfkh", 1);
        },
        setContents: function () {
            var me = this;
            var data = me.setData(me.DATA.data);

            for(var i = 0; i < data.length; i ++){
                me.setItem(data[i]);
            }
            me.setBox();
        },
        setItem: function(data){
            var me = this;
            var list = me.nodes.list1.clone();
            var conf = G.class.getConf("kaifukuanghuan")[me._curDay][data.hdid];
            X.autoInitUI(list);

            var str = X.STR(conf.title + " ({1}/{2})", data.nval, data.pval);
            var rh = new X.bRichText({
                size: 22,
                maxWidth: list.nodes.txt_title.width,
                lineHeight: 34,
                family: G.defaultFNT,
                color: (data.nval >= data.pval && !data.finish) ? G.gc.COLOR.n7 : G.gc.COLOR.n4
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0.5);
            rh.setPosition(0, list.nodes.txt_title.height / 2);
            list.nodes.txt_title.addChild(rh);
            
            X.alignItems(list.nodes.panel_item, conf.p, "left",{
                touch: true,
                callback: function () {

                }
            });

            function buy(curDay, hdid) {
                // if(me._openDay < me._curDay){
                //     G.tip_NB.show(L("HDZWKQ"));
                //     return;
                // }
                G.ajax.send("kfkh_getprize", [curDay, hdid], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: conf.p,
                        }).show();
                        me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum('jinbi','attr')));
                        me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum('rmbmoney','attr')));
                        me.getData(me._curDay, function () {
                            me.changeType(me._curType);
                            G.hongdian.getData("kfkh", 1, function () {
                                me.checkRedPoint();
                                me.checkRedPoint1();
                            })
                        });
                    }
                });
            }

            if(data.tab == 4){
                list.nodes.btn_receive.hide();
                list.nodes.img_received.hide();
                list.nodes.txt_number1.setString(conf.need[0].n);
                list.nodes.txt_buy.setString(parseInt(conf.need[0].n * (conf.needsale / 10)));
                list.nodes.txt_buy.setTextColor(cc.color(G.gc.COLOR.n12));
                if(data.finish){
                    list.nodes.btn_buy.setTouchEnabled(false);
                    list.nodes.txt_buy.setTextColor(cc.color(G.gc.COLOR.n15));
                    list.nodes.btn_buy.setBright(false);
                }
                list.nodes.btn_buy.click(function(sender, type){
                    buy(me._curDay, data.hdid);
                })
            }else{
                list.nodes.btn_buy.hide();
                list.nodes.btn_receive.show();
                list.finds("panel_price1").hide();
                if(data.nval < data.pval){
                    G.removeNewIco(list.nodes.btn_receive);
                    list.nodes.btn_receive.setTouchEnabled(false);
                    list.nodes.btn_receive.setBright(false);
                    list.nodes.btn_receive.setTitleColor(cc.color(G.gc.COLOR.n15));
                }else{
                    if(data.finish){
                        list.nodes.btn_receive.hide();
                        list.nodes.img_received.show();
                        G.removeNewIco(list.nodes.btn_receive);
                    }else{
                        G.setNewIcoImg(list.nodes.btn_receive, .9);
                        list.nodes.btn_receive.click(function (sender, type) {
                            buy(me._curDay, data.hdid);
                        });
                    }
                }
            }
            list.show();
            me.nodes.listview1.pushBackCustomItem(list);
        },
        setBox: function(){
            var me = this;
            var boxConf = G.class.getConf("kaifukuanghuan_jdt").base.stageprize;

            me.nodes.jdt100.setPercent(me.DATA.finipro);
            me.ui.finds("txt_rw").setString(L("WCRWGS") + me.DATA.finipro);

            for(var i = 0; i < boxConf.length; i ++){
                var type = boxConf[i][0] < boxConf[2][0] ? 1 : (boxConf[i][0] < boxConf[4][0] ? 2 : 3);
                var box = me.nodes["list_bx" + (i + 1)];
                (function (box, i) {
                    var state = "yulan";
                    X.autoInitUI(box);
                    box.nodes.panel_bx.removeAllChildren();
                    box.nodes.panel_bx.removeBackGroundImage();
                    box.nodes.text_cs2.setString(boxConf[i][0]);
                    if(me.DATA.finipro < boxConf[i][0]){
                        box.nodes.panel_bx.setBackGroundImage("img/jingjichang/img_jjc_bx" + type + ".png", 1);
                    }else{
                        if(X.inArray(me.DATA.recprize, i)){
                            box.nodes.panel_bx.setBackGroundImage("img/jingjichang/img_jjc_bx" + type + "_d.png", 1);
                            box.nodes.panel_bx.removeAllChildren();
                            box.nodes.img_ylq.show();
                            box.nodes.img_klq.hide();
                            state = "chakan";
                        }else{
                            box.nodes.panel_bx.removeBackGroundImage();
                            box.nodes.img_klq.show();
                            X.addBoxAni({
                                parent: box.nodes.panel_bx,
                                boximg: "img/jingjichang/img_jjc_bx" + type + ".png"
                            });
                            state = "lq";
                        }
                    }
                    if(state == "lq") G.setNewIcoImg(box, .8);
                    else G.removeNewIco(box);
                    box.nodes.panel_bx.setTouchEnabled(true);
                    box.nodes.panel_bx.touch(function (sender, type) {
                        if(type == ccui.Widget.TOUCH_ENDED){
                            if(state == "lq"){
                                G.ajax.send("kfkh_recproprize", [i], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: boxConf[i][1],
                                        }).show();
                                        me.getData(me._curDay, function () {
                                            me.changeType(me._curType);
                                        });
                                    }
                                });
                            }else{
                                G.frame.jiangliyulan.data({
                                    title: state == 'yulan' ? L('JLYL') : L('JLCK'),
                                    prize: boxConf[i][1]
                                }).show();
                            }
                        }
                    });
                    box.show();
                })(box, i);
            }
        },
        setData: function(data){
            var me = this;
            var typeArr = [];
            for(var i = 0; i < data.length; i ++){
                if(me._curType == data[i].tab){
                    typeArr.push(data[i]);
                }
            }
            for(var i = 0; i < typeArr.length; i ++){
                if(typeArr[i].nval < typeArr[i].pval){
                    typeArr[i].rank = 2;
                }else{
                    if(typeArr[i].finish){
                        typeArr[i].rank = 3;
                    }else{
                        typeArr[i].rank = 1;
                    }
                }
            }
            typeArr.sort(function(a, b){
                if(a.rank !== b.rank){
                    return a.rank < b.rank ? -1 : 1;
                }else{
                    return a.hdid < b.hdid ? -1 : 1;
                }
            });
            return typeArr;
        }
    });
    G.frame[ID] = new fun('carnival.json', ID);
})();