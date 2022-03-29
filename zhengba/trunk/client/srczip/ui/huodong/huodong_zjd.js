/**
 * Created by LYF on 2019/5/21.
 */
(function () {
    //砸金蛋
    G.class.huodong_zjd = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_zajindan.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onRemove: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.nodes.txt_wzsm.setString(me._data.intr);
            var img = me._data.data.mode == "rmbmoney" ? 'img_cygj_yxf' : 'img_zjd_di1';
            me.nodes.panel_cz.setBackGroundImage('img/zajindan/' + img + '.png', 1);
            me.setEndTime();
            me.refreshPanel();
        },
        refreshView: function() {
            var me = this;

            me.refreshPanel();
        },
        setEndTime: function() {
            var me = this;

            X.render({
                txt_sj: function (node) {
                    if(me._data.etime - G.time > 24 * 3600 * 2) {
                        node.setString(X.moment(me._data.etime - G.time));
                    }else {
                        X.timeout(node, me._data.etime, function () {
                            me.timeout = true;
                        });
                    }
                },
            },me.nodes);
        },
        refreshPanel:function () {
            var me = this;
            me.getData(function(){
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
        setContents: function () {
            var me = this;

            me.showRmbMoney();
            me.setHammer();
            me.showPrize();
            me.showAgg();
        },
        showRmbMoney: function () {
            var me = this;
            var val = me._data.data.mode == "rmbmoney" ? me.DATA.myinfo.val : me.DATA.myinfo.val / 10;
            me.nodes.txt_czyuan.setString(val);
        },
        setHammer: function () {
            var me = this;
            var data = me.DATA.myinfo;
            var canNum = data.num - data.usenum;

            for (var i = 1; i <= 10; i ++) {
                var lay = me.nodes["panel_cz" + i];
                var hammer = me.nodes.list_cz.clone();

                if(canNum >= i) {
                    hammer.children[0].show();
                    hammer.children[1].hide();
                } else {
                    hammer.children[1].show();
                    hammer.children[0].hide();
                }

                if(data.num < i) {
                    hammer.children[1].setBackGroundImage("img/zajindan/img_zjd_cz3.png", 1);
                }

                hammer.show();
                hammer.setPosition(lay.width / 2, lay.height / 2);
                lay.removeAllChildren();
                lay.addChild(hammer);
            }
        },
        showPrize: function () {
            var me = this;
            var prize = JSON.parse(JSON.stringify(me.DATA.info.arr));

            for (var i = 0; i < prize.length; i ++) {
                prize[i].p[0].index = i;
            }

            X.alignCenter(me.nodes.panel_jlwp, [].concat(prize[0].p, prize[1].p, prize[2].p, prize[3].p, prize[4].p), {
                scale: .8,
                touch: true,
                mapItem: function (node) {
                    if(node.conf.color >= 5) {
                        G.class.ani.show({
                            json: "ani_qiandao_1",
                            addTo: node,
                            x: 59,
                            y: 44,
                            repeat: true,
                            autoRemove: false,
                            onload :function(node){
                                node.setScale(1.2);
                                node.zIndex = 50;
                            }
                        });
                    }
                    if(X.inArray(me.DATA.myinfo.gotarr, node.data.index)) {
                        var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                        ylq.setAnchorPoint(0.5, 0.5);
                        ylq.setPosition(node.width / 2, node.height / 2);
                        ylq.zIndex = 99;
                        node.addChild(ylq);
                    }
                }
            });

            X.alignCenter(me.nodes.panel_jlwp1, [].concat(prize[5].p, prize[6].p, prize[7].p, prize[8].p, prize[9].p), {
                scale: .8,
                touch: true,
                mapItem: function (node) {
                    if(node.conf.color >= 5) {
                        G.class.ani.show({
                            json: "ani_qiandao_1",
                            addTo: node,
                            x: 59,
                            y: 44,
                            repeat: true,
                            autoRemove: false,
                            onload :function(node){
                                node.setScale(1.2);
                                node.zIndex = 50;
                            }
                        });
                    }
                    if(X.inArray(me.DATA.myinfo.gotarr, node.data.index)) {
                        var ylq = new ccui.ImageView("img/public/img_zdylq.png", 1);
                        ylq.setAnchorPoint(0.5, 0.5);
                        ylq.setPosition(node.width / 2, node.height / 2);
                        ylq.zIndex = 99;
                        node.addChild(ylq);
                    }
                }
            });
        },
        showAgg: function () {
            var me = this;

            for (var i = 0; i < 10; i ++) {
                me.setAgg(i);
            }
        },
        setAgg: function (index) {
            var me = this;
            var aggList = me.nodes.list_dan.clone();
            var aggLayout = me.nodes["panel_dan" + (index + 1)];
            X.autoInitUI(aggList);

            aggList.show();
            aggList.index = index;
            aggList.isZ = X.inArray(me.DATA.myinfo.zjdarr, index);

            if(aggList.isZ) {
                aggList.nodes.img_dan_h.hide();
                aggList.nodes.img_dan_s.show();
            } else {
                aggList.nodes.img_dan_h.show();
                aggList.nodes.img_dan_s.hide();
            }

            aggList.setPosition(0, 0);
            aggLayout.removeAllChildren();
            aggLayout.addChild(aggList);

            aggList.click(function (sender) {
                if(sender.isZ) return;

                if(me.DATA.myinfo.num - me.DATA.myinfo.usenum < 1) return G.tip_NB.show(L("ZDCSYYW"));

                me.ajax("huodong_use", [me._data.hdid, 1, sender.index], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "activity",
                            data:{
                                joinActivityType:me._data.stype,
                                consume:[],
                                get:data.d.prize,
                            }
                        });
                        G.class.ani.show({
                            json: "ani_huodong_zajindan",
                            addTo: G.frame.huodong.ui,
                            x: G.frame.huodong.ui.width / 2,
                            y: G.frame.huodong.ui.height / 2,
                            onend: function () {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                if(me._data.isqingdian){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                                me.refreshPanel();
                            }
                        });
                    }
                });
            }, 2000);
        }
    });
})();