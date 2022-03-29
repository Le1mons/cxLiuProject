(function () {
    //玩家回归

    G.event.on('attrchange_over', function () {
        if(G.frame.playerback_main.isShow){
            G.frame.playerback_main.updateTop();
        }
    });

    G.event.on('itemchange_over', function () {
        if(G.frame.playerback_main.isShow){
            G.frame.playerback_main.updateTop();
        }
    });

    G.event.on('paysuccess', function() {
        if(!G.frame.playerback_main.isShow) return;
        G.hongdian.getHongdian(1, function () {
            G.frame.playerback_main.checkRedPoint();
        });
    });

    var ID = 'playerback_main';

    var fun = X.bUi.extend({

        //四个二级按钮
        btnData:[
            {id:1,icon:"ico_event_hgjl",title:"回归奖励",type:"return"},
            {id:2,icon:"ico_event_dlfl",title:"登录福利",type:"login"},
            {id:3,icon:"ico_event_mrlc",title:"每日累充",type:"daily"},
            {id:4,icon:"ico_event_lcfl",title:"累充返利",type:"recharge"},
        ],

        ctor:function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f2";
            me.preLoadRes=['event.png','event.plist'];
            me._super(json, id,{action:true});
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
            me.xsArr = [];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow:function () {
            var me = this;
            me.getData(function () {
                me.refreshPanel();
            });
        },
        onRemove: function () {
            var me = this;

            X.releaseRes([
                'event.plist','event.png'
            ]);
        },
        refreshPanel:function(){
          var me = this;
          me.creatBtn();
          me.nodes.listview.getChildren()[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
          me.checkRedPoint();
          me.setBaseInfo();
        },
        creatBtn:function () {
            var me = this;
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            var menuItems = [];

            for(var i = 0; i < me.btnData.length; i++){
                var item = me.nodes.list.clone();
                me.setItem(item,me.btnData[i]);
                item.hdid = me.btnData[i].hdid;
                item.data = me.btnData[i];
                listview.pushBackCustomItem(item);
                me.xsArr.push(item);
                item.show();
                menuItems.push(item);
            }
            listview.jumpToTop();

            X.radio(menuItems, function (sender) {
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
        setItem:function (ui,data) {
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
                },
            },ui.nodes);

        },
        changeType: function (data) {
            var me = this;
            var type = data.stype || data.id;

            me.curType = type;
            me.getData(function () {
                me.setContents(data);
            });
        },
        setContents:function (data) {
            var me = this;
            var type = me.curType;

            var viewConf = {
                "1": G.class.back_hgjl,//回归奖励
                "2": G.class.back_dlfl,//登陆福利
                "3": G.class.back_mrlc,//每日累充
                "4": G.class.back_lcfl,//累充返利
            };
            var newView = new viewConf[type](me.DATA);
            ccui.helper.doLayout(newView);
            me.ui.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
            }else{
                me._panels = newView;
            }
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = me.need2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            me.nodes.panel_top.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_top.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.show();
                        }

                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.once("hide", function () {
                                me._panels.refreshView && me._panels.refreshView();
                            }).show();
                        }
                    })
                }
            },me.nodes);
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(me.need1.t,me.need1.a)));
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(me.need2.t,me.need2.a)));
        },
        checkRedPoint:function(){
            var me = this;
            var data = G.DATA.hongdian.return;
            var childrenArr = me.nodes.listview.children;

            for (var i in childrenArr) {
                var chr = childrenArr[i];
                if(data[chr.data.type] > 0){
                    G.setNewIcoImg(chr);
                    chr.getChildByName("redPoint").setPosition(100, 157);
                }else {
                    G.removeNewIco(chr);
                }
            }
        },
        getData:function (callback) {
            var me = this;

            me.ajax('return_open', [], function(str, data){
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        }

    });

    G.frame[ID] = new fun('event.json', ID);
})();