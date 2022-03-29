(function () {
    var AniFunc = {
        setMainCityAni: function () {
            this.addTJPAni();
        },
        addTJPAni: function () {
            var me = this;
            var parent = me.nodes.panel_dati04;
            var aniFile = "zhucheng_xiaodonghua_tiejiang_dh";
            if (G.time >= X.getTodayZeroTime() + 20 * 3600 || G.time <= X.getTodayZeroTime() + 8 * 3600) {
                aniFile = "zhucheng_xiaodonghua_tiejiang2_dh";
            }
            parent.removeAllChildren();
            G.class.ani.show({
                json: aniFile,
                addTo: parent,
                repeat: true,
                autoRemove: false
            });
        },
        initAnswerView: function (eventType) {
            var self = this;
            var question = G.gc.event.topic[X.arrayRand(Object.keys(G.gc.event.topic))];
            var answerArr = [].concat(question.option);
            answerArr.sort(function () {
                return Math.random()>.5 ? -1 : 1;
            });
            var answerA = G.gc.event.option[answerArr[0]];
            var answerB = G.gc.event.option[answerArr[1]];

            function btnState(btn, btn2) {
                var isCorrect = X.arrayFind(question.option, btn.val) == 0;
                if (isCorrect) {
                    btn.loadTextureNormal("img/dati/img_dt_bg02.png", 1);
                    btn.children[0].setTextColor(cc.color("#678724"));
                } else {
                    btn.children[0].setTextColor(cc.color("#ac4e38"));
                    btn2.children[0].setTextColor(cc.color("#678724"));
                    btn.loadTextureNormal("img/dati/img_dt_bg03.png", 1);
                    btn2.loadTextureNormal("img/dati/img_dt_bg02.png", 1);
                }
                btn.setTouchEnabled(false);
                btn2.setTouchEnabled(false);
                G.view.mainView.getEventPrize(1, btn.val);
            }

            X.render({
                mask: function (node) {
                    node.click(function () {
                        self.removeFromParent();
                    });
                },
                panel_rw: function (node) {
                    X.setHeroModel({
                        parent: node,
                        data: {},
                        model: "63025",
                        noRelease: true,
                        cache: false
                    });
                },
                txt_title: question.title,
                btn_dati1: function (node) {
                    node.val = answerArr[0];
                    node.children[0].setString(answerA.intr);
                    node.setZoomScale(0.01);
                    node.click(function (sender) {
                        btnState(sender, self.nodes.btn_dati2);
                    });
                },
                btn_dati2: function (node) {
                    node.val = answerArr[1];
                    node.children[0].setString(answerB.intr);
                    node.setZoomScale(0.01);
                    node.click(function (sender) {
                        btnState(sender, self.nodes.btn_dati1);
                    });
                }
            }, this.nodes);
        },
        setMainCityBtn: function () {
            var me = this;

            me.nodes.panel_js_rw.setTouchEnabled(true);
            me.nodes.panel_js_rw.click(function (sender) {
                if (sender.has) {
                    if(me.eventData.jugg){
                        //G.tip_NB.show(L("SHENGJIANLEILE"));
                        G.frame.xiaoyouxi.show();
                    }else {
                        var jindu = me.eventData.jindu || 0;
                        G.guide.show('31115' + (jindu + 1));
                    }
                } else {
                    G.frame.xiaoyouxi.show();
                }
            });

            me.nodes.panel_dati01.setTouchEnabled(true);
            me.nodes.panel_dati01.click(function (sender) {
                if (sender.has) {
                    new X.bView("ui_dati.json", function (view) {
                        view.zIndex = 3;
                        view.action.play("in", false);
                        cc.director.getRunningScene().addChild(view);
                        cc.sys.isNative && view.fillSize(cc.director.getWinSize());
                        me.initAnswerView.call(view, 1);
                    }, {action: true});
                }
            });

            me.nodes.panel_dati02.setTouchEnabled(true);
            me.nodes.panel_dati02.click(function (sender) {
                if (sender.has) {
                    sender.spine.runAni(0, 'die', false);
                    sender.spine.setEndListener(function () {
                        G.view.mainView.getEventPrize(3, G.gc.event.event[3].option[0]);
                    });
                }
            });

            me.nodes.panel_dati03.setTouchEnabled(true);
            me.nodes.panel_dati03.click(function (sender) {
                if (sender.has) {
                    G.view.mainView.getEventPrize(4, G.gc.event.event[4].option[0]);
                }
            });
        },
        getEventPrize: function (event, option) {
            var me = this;

            me.ajax("event_answer", [event, option], function (str, data) {
                if (data.s == 1) {
                    if (data.d.prize && data.d.prize.length > 0) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                    }
                    me.getMainCityEvent();
                }
            });
        },
        getMainCityEvent: function (callback) {
            var me = this;

            me.ajax("event_open", [], function (str, data) {
                if (data.s == 1) {
                    me.eventData = data.d;
                    var conf = G.gc.event.event;
                    for (var type in conf) {
                        me["eventAni" + type] && me["eventAni" + type](type);
                    }
                    cc.log("mainCityEventData =========== ", data);
                    callback && callback();
                }
            });
        },
        eventAni1: function (event) {//先知
            var me = this;

            if (X.inArray(me.eventData.topic, event)) {
                me.nodes.panel_dati01.has = true;
                if (me.nodes.panel_dati01.children.length == 0) {
                    X.setHeroModel({
                        parent: me.nodes.panel_dati01,
                        data: {},
                        model: "shijian_xianzhi",
                        noRelease: true,
                        cache: false
                    });
                }
            } else {
                me.nodes.panel_dati01.has = false;
                me.nodes.panel_dati01.removeAllChildren();
            }
        },
        eventAni2: function (event) {//剑圣
            var me = this;

            if (X.inArray(me.eventData.topic, event)) {
                me.nodes.panel_js_rw.has = true;
                if (me.nodes.panel_js_rw.children.length == 0) {
                    G.class.ani.show({
                        json: "zhucheng_xiaodonghua_jiansheng_dh",
                        addTo: me.nodes.panel_js_rw,
                        repeat: true,
                        autoRemove: false,
                        y: 0
                    });
                }
            } else {
                me.nodes.panel_js_rw.has = false;
                if (me.nodes.panel_js_rw.children.length == 0) {
                    G.class.ani.show({
                        json: "zhucheng_xiaodonghua_jiansheng_dh",
                        addTo: me.nodes.panel_js_rw,
                        repeat: true,
                        autoRemove: false,
                        y: 0
                    });
                }
            }
        },
        eventAni3: function (event) {
            var me = this;

            if (X.inArray(me.eventData.topic, event)) {
                me.nodes.panel_dati02.has = true;
                if (me.nodes.panel_dati02.children.length == 0) {
                    X.setHeroModel({
                        parent: me.nodes.panel_dati02,
                        data: {},
                        model: "shijian_shitou",
                        noRelease: true,
                        cache: false
                    });
                }
            } else {
                me.nodes.panel_dati02.has = false;
                me.nodes.panel_dati02.removeAllChildren();
            }
        },
        eventAni4: function (event) {
            var me = this;

            if (X.inArray(me.eventData.topic, event)) {
                me.nodes.panel_dati03.has = true;
                if (me.nodes.panel_dati03.children.length == 0) {
                    G.class.ani.show({
                        json: "zhucheng_xiaodonghua_feiting_dh",
                        addTo: me.nodes.panel_dati03,
                        repeat: true,
                        autoRemove: false
                    });
                }
            } else {
                me.nodes.panel_dati03.has = false;
                me.nodes.panel_dati03.removeAllChildren();
            }
        },
    };

    cc.mixin(G.class.mainView.prototype, AniFunc);
})();