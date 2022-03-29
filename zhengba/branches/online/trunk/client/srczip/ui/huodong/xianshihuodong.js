(function () {

    G.event.on("currencyChange", function () {
        if(G.frame.xianshilibao.isShow) {
            G.frame.xianshilibao.updateAttr();
        }
    });

    //异步按钮活动
    var ID = 'xianshilibao';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f2";
            me._super(json, id,{action:true});
            me.preLoadRes = ["event3.png", "event3.plist"]
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.hdList = me.data();
            me.redPointArr = [];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
            me.checkRedPoint();
        },
        checkRedPoint: function() {
            var me = this;

            for (var i in me.redPointArr) {
                if(cc.isNode(me.redPointArr[i])) {
                    if(G.DATA.hongdian.monthfund[me.redPointArr[i].data.htype] && G.DATA.hongdian.monthfund[me.redPointArr[i].data.htype].canlq) {
                        G.setNewIcoImg(me.redPointArr[i]);
                        me.redPointArr[i].getChildByName("redPoint").setPosition(100, 157);
                    }else {
                        G.removeNewIco(me.redPointArr[i]);
                    }
                }
            }
        },
        refreshPanel: function(){
            var me = this;

            me.createMenu();
            me.nodes.listview.getChildren()[0] && me.nodes.listview.getChildren()[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.setBaseInfo();
        },
        onHide: function () {
            var me = this;
            if(G.frame.xianshilibao.yjj) {
                G.hongdian.getData("monthfund", 1);
            }else {
                G.view.mainView.getAysncBtnsData(function(){
                    G.view.mainView.allBtns["lefttop"] = [];
                    G.view.mainView.setSvrBtns();
                }, false);
            }

        },
        getData: function (hdid, callback) {
            var me = this;

            me.ajax('huodong_open', [hdid], function(str, data){
                if (data.s == 1) {
                    callback && callback(data.d);
                }
            });
        },
        getListData: function (callback) {
            var me = this;

        },
        createMenu: function () {
            var me = this;

            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            // var itemClone = me.nodes.list;
            // itemClone.hide();

            var menuItems = [];

            var menus = me.hdList;

            menus.sort(function (a, b) {
                return a.stype * 1 > b.stype * 1;
            });

            cc.log('menus ~~~~', menus);

            for (var i = 0; i < menus.length; i++) {
                var mData = menus[i];
                var item = me.nodes.list.clone();
                item.data = mData;
                me.setItem(item,mData);
                if (G.DATA.hongdian.monthfund[mData.htype]) {
                    me.redPointArr.push(item);
                }
                listview.pushBackCustomItem(item);
                item.show();

                menuItems.push(item);
            }

            listview.jumpToTop();

            X.radio(menuItems, function (sender) {
                // var name = sender.getName();
                me.changeType(sender.data);
            },{
                callback1: function (sender) {
                    sender.finds('txt_name$').setOpacity(255);
                    sender.finds("img_light$").setVisible(true);
                    sender.finds("panel_dh$").setVisible(true);
                    sender.finds("ico$").runActions(cc.sequence(cc.scaleTo(0.1, 1.1, 1.1), cc.scaleTo(0.1, 1, 1)));
                },
                callback2: function (sender) {
                    sender.finds('txt_name$').setOpacity(255 * 0.6);
                    sender.finds("img_light$").setVisible(false);
                    sender.finds("panel_dh$").setVisible(false);
                },
                color: ["#FFE8C0", "#FFE8C0"],
            });
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.setName(data.stype || data.id);

            ui.data = data;

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);

            X.render({
                txt_name: function(node){
                    node.setString(data.title || data.name);
                    node.setTextColor(cc.color("#FFE8C0"));
                    X.enableOutline(node, "#2A1C0F", 2);
                },
                ico: function (node) {
                    node.setBackGroundImage('img/event/' + (data.icon) + '.png',0);
                },
                panel_dh: function (node) {
                    G.class.ani.show({
                        json: "ani_meirishilian",
                        addTo: node,
                        x: node.width / 2,
                        y: node.height / 2,
                        repeat: true,
                        autoRemove: false,
                    });
                }
            },ui.nodes);
        },
        changeType: function (data) {
            var me = this;
            var type = data.stype || data.id;

            me.curType = type;

            me.setContents(data);
        },
        setContents: function (data) {
            var me = this;
            //type为活动模板
            var type = me.curType;

            var viewConf = {
                "10001": G.class.huodong_libao,
                "10002": G.class.huodong_libao,
                "10019": G.class.huodong_yjj,
                "10020": G.class.huodong_yjj
            };
            var newView = new viewConf[type](data);
            ccui.helper.doLayout(newView);
            me.ui.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
            }else{
                me._panels = newView;
            }


            //me._panels.show();
            if(me.isFirst) {
                X.audio.playEffect("sound/dianji.mp3", false);
            }
            me.isFirst = true;

            me.ui.setTimeout(function(){
                G.guidevent.emit('huodong_setContents_over');
            },500);
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.show();
                        }
                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.show();
                        }
                    })
                }
            },me.nodes);

            // me.ui.finds('token_jb').loadTexture(G.class.getItemIco(attr1.t),0);
            // me.ui.finds('token_zs').loadTexture(G.class.getItemIco(attr2.t),0);
        },
        updateAttr: function () {
            var me = this;
            X.render({
                txt_jb:X.fmtValue(P.gud.jinbi),
                txt_zs:X.fmtValue(P.gud.rmbmoney),
            },me.nodes);
        }
    });

    G.frame[ID] = new fun('event.json', ID);
})();