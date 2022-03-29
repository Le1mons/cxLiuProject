/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄列表, 图鉴列表
    var ID = 'yingxiong';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me.needshowMainMenu = true;
            me._super(json, id,{action:true});

            //仅供查阅
            var zz2idx = {
                5:0, //神圣
                6:1, //暗影
                4:2, //自然
                3:4, //邪能
                2:5, //奥术
                1:6 //亡灵
            };
        },
        changeType: function(sender){
            var me = this;

            var type = sender.data.id;
            me._curType = type;

            if(type == "1") {
                me.nodes.Image_10.show();
            }else {
                me.nodes.Image_10.hide();
            }

            var viewConf = {
                "1": G.class.yingxiong_lb,
                "2": G.class.yingxiong_tujian,
                "3": G.class.yingxiong_tonyu,
            };

            var newView = new viewConf[type];
            newView.setVisible(false);
            me.ui.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)) {
                me.playBookAni(function () {
                    me._panels.removeFromParent();
                    me._panels = newView;
                    me._panels.setVisible(true);
                })
            }else {
                me.playBookAni(function () {
                    me._panels = newView;
                    me._panels.setVisible(true)
                })
            }
        },
        playBookAni: function(callback) {
            var me = this;

            callback && callback();
            // G.class.ani.show({
            //     json: "ani_fanshu",
            //     addTo: me.nodes.panel_fydh,
            //     x: me.nodes.panel_fydh.width / 2,
            //     y: me.nodes.panel_fydh.height / 2,
            //     repeat: false,
            //     autoRemove: true,
            //     onend: function () {
            //
            //     }
            // });
        },
        getCurType: function(){
            var me = this;
            return me._curType;
        },
        //获得指定panel
        getPanel:function(type) {
            var me = this;

            return me._panels[type];
        },
        //获得所有的panel
        getPanels:function() {
            var me = this;

            return me._panels;
        },
        bindUI: function () {
            var me = this;
            var arr = [];
            var btns = G.class.menu.get('yingxiong');
            if(G.tiShenIng){
                btns = [btns[0]];
            }
            for (var i in btns) {
                var btn = me.nodes["page_" + btns[i].id];
                btn.show();
                btn.children[0].setString(btns[i].title);
                if(btns[i].checkLv) {
                    if(P.gud.lv < G.class.opencond.getLvById(btns[i].checkLv)) {
                        btn.checkLv = true;
                        btn.show = X.STR(btns[i].show, G.class.opencond.getLvById(btns[i].checkLv));
                    }
                }
                btn.data = btns[i];
                arr.push(btn);
            }
            X.radio(arr, function (sender) {
                if(sender.disable){
                    G.tip_NB.show(sender.show);
                    return;
                }
                me.changeType(sender);
            }, {
                callback1: function (sender) {
                    sender.children[0].setTextColor(cc.color("#ffffff"));
                    X.enableOutline(sender.children[0], "#001e5b", 2);
                },
                callback2: function (sender) {
                    sender.children[0].setTextColor(cc.color("#af9e89"));
                    X.enableOutline(sender.children[0], "#592e1c", 2);
                }
            });

            me.nodes.btn_bangzhu.show();
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L(me._curType == 1 ? "TS19" : (me._curType == 2 ? "TS20" : "TS21"))
                }).show();
            });

            me.nodes.Image_10.finds("btn_jia$").click(function () {
                var conf = G.class.getConf('herocom').herocell;
                var data = G.DATA.heroCell;
                var need = G.class.formula.compute(conf.need[0].n,{buyednum:data.buynum || 0});
                var str = X.STR(L('YINGXIONG_BUG_CELL'),need,conf.addnum);
                G.frame.alert.data({
                    cancelCall:null,
                    autoClose:false,
                    okCall: function () {
                        G.ajax.send('user_addgezinum',[],function(d) {
                            if(!d) return;
                            var d = JSON.parse(d);
                            if(d.s == 1) {
                                for (var key in d.d) {
                                    G.DATA.heroCell[key] = d.d[key];
                                }
                                G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));
                                me.setHeroCell();
                                var need = G.class.formula.compute(conf.need[0].n,{buyednum:data.buynum || 0});
                                var str = X.STR(L('YINGXIONG_BUG_CELL'),need,conf.addnum);
                                G.frame.alert.data({richText:str,autoClose:false}).setContents();
                            }
                        },true);
                    },
                    sizeType:3,
                    richText:str,
                }).show();
            })
        },
        onOpen: function () {
            var me = this;


            me.nodes.tip_title.setBackGroundImage(X.getTitleImg('yx'),1);
            me.getHeadData();
            me.bindUI();
            me.ui.finds("panel_tip").setTouchEnabled(false);
            me.ui.finds("bg_tip_1").zIndex = -2;
        },
        getHeadData: function(){
            var me = this;
            G.ajax.send('user_avaterlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.headData = d.d.avaterlist;
                }
            },true);
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.showMainMenu();
            var type;
            if(me.data() && me.data().tztype){
                type = me.data().tztype;
            }else{
                type = '1';
            }
            me.nodes["page_" + type].triggerTouch(ccui.Widget.TOUCH_ENDED);

            G.view.mainMenu.set_fhzc(1);
            G.view.mainMenu.checkRedPoint();
            me.setHeroCell();
            // G.frame.yingxiong.getData(function(){
            //     callback && callback();
            // }, me.data());
            me.ui.setTimeout(function () {
                G.guidevent.emit('yingxiongOpenOver');
            }, 500);
            me.checkRedPoint()
        },
        checkRedPoint: function() {
            var me = this;
            if(G.DATA.hongdian.destiny) {
                G.setNewIcoImg(me.nodes.page_3);
                me.nodes.page_3.getChildByName("redPoint").setPosition(80, 70);
            }else G.removeNewIco(me.nodes.page_3);
        },
        setHeroCell: function() {
            var me = this;
            var list = G.DATA.yingxiong.list;
            var keys = X.keysOfObject(list);
            var data = G.DATA.heroCell;
            var ownNum = data.maxnum;

            var chr = me.nodes.Image_10.children[0];
            var str = keys.length + "/" + ownNum;
            var rh = new X.bRichText({
                size: 20,
                lineHeight: 24,
                color: "#f6ebcd",
                maxWidth: chr.width,
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(chr.width / 2, chr.height / 2);
            chr.removeAllChildren();
            chr.addChild(rh);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');
        },
    });

    G.frame[ID] = new fun('ui_tip5.json', ID);
})();