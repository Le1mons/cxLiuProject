/**
 * Created by zhangming on 2018-05-03
 */
G.event.once("loginOver", function () {
    G.DATA.heroPoint = {};
    var cache = X.cacheByUid('fight_tanxian');
    if(cache && Object.keys(cache).length > 0) {
        for (var i in cache) {
            G.DATA.heroPoint[cache[i]] = 0;
        }
    }
});

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
            // me.nodes.btn_bangzhu.setVisible(me._curType != 5);

            me.nodes.btn_bangzhu.show();
            me.nodes.Image_10.show();
            if(type == "1") {
                me.setHeroCell();
            }

            var viewConf = {
                "1": G.class.yingxiong_lb,
                "2": G.class.yingxiong_tujian,
                "3": G.class.yingxiong_skin,
                "4": G.class.yingxiong_tonyu,
                "5": G.class.yingxiong_sp,
            };

            var newView = new viewConf[type](sender.data.type);
            me.ui.nodes.panel_nr.addChild(newView);
            if (me._panels) me._panels.removeFromParent();
            me._panels = newView;
        },
        getCurType: function(){
            var me = this;
            return me._curType;
        },
        _skin: function () {
            return P.gud.lv >= 35 || P.gud.isskin != undefined;
        },
        _tongyu: function () {
            return P.gud.lv >= 60;
        },
        bindUI: function () {
            var me = this;
            var arr = me.btnArr = [];
            var btns = G.class.menu.get('yingxiong');
            if(G.tiShenIng){
                btns = [btns[0]];
            }
            var btnArr = [];
            for (var i = 0; i < btns.length; i ++) {
                if (btns[i].checkFunc) {
                    if (me[btns[i].checkFunc]()) btnArr.push(btns[i]);
                } else btnArr.push(btns[i]);
            }
            for (var i = 0; i < 5; i ++) {

                var btn = me.nodes["page_" + (i + 1)];
                btn.setSwallowTouches(false);
                var btnData = btnArr[i];
                if (btn && btnData) {
                    btn.show();
                    btn.data = btnData;
                    btn.children[0].setString(btnData.title);
                    if(btnData.checkLv) {
                        if(P.gud.lv < G.class.opencond.getLvById(btnData.checkLv)) {
                            btn.checkLv = true;
                            btn.show = X.STR(btns[i].show, G.class.opencond.getLvById(btnData.checkLv));
                        }
                    }
                    arr.push(btn);
                    if (btnData.redPoint) me.redBtn[btnData.redPoint] = btn;
                }  else {
                    btn.hide();
                }
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

            var ts = {
                1: L("TS19"),
                2: L("TS20"),
                3: L("TS42"),
                4: L("TS21"),
                5: L("TS19"),
            };

            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr: ts[me._curType]
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
                                G.event.emit("sdkevent", {
                                    event: "user_addgezinum"
                                });
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
            });
        },
        onOpen: function () {
            var me = this;

            me.redBtn = {};
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

            if(G.tiShenIng){
                me.ui.finds('panel_tip').hide();
                me.ui.finds('bg_tip_1').loadTexture('img/main2/bg_wupin.png');
            }

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
                if (cc.isNode(G.view.mainMenu.nodes.btn_yingxiong.getChildByName("redPoint"))) {
                    G.view.mainMenu.nodes.btn_yingxiong.getChildByName("redPoint").hide();
                }
            }, 500);
            me.checkRedPoint();
        },
        checkRedPoint: function() {
            var me = this;

            if(G.DATA.hongdian.destiny && me.redBtn[4]) {
                G.setNewIcoImg(me.redBtn[4]);
                me.redBtn[4].redPoint.setPosition(80, 70);
            }else G.removeNewIco(me.redBtn[4]);

            if (G.hongdian.checkSuiPian('hero')) {
                G.setNewIcoImg(me.redBtn[5]);
                me.redBtn[5].redPoint.setPosition(80, 70);
            } else G.removeNewIco(me.redBtn[5]);
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
            if (cc.isNode(G.view.mainMenu.nodes.btn_yingxiong.getChildByName("redPoint"))) {
                G.view.mainMenu.nodes.btn_yingxiong.getChildByName("redPoint").show();
            }
        },
    });

    G.frame[ID] = new fun('ui_tip5.json', ID);
})();