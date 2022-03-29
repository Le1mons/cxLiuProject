/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
    //帮助界面
    var ID = 'kaogu_main';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            X.radio([me.nodes.page1, me.nodes.page2, me.nodes.page3], function(sender) {
                var name = sender.getName();
                var name2type = {
                    page1$: 1,
                    page2$: 2,
                    page3$: 3
                };
                me.changeType(name2type[name]);
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_gb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.ajax('getayncbtn',[['yjkg']],function(str,data){
                        if(data.d.yjkg == 0){
                            G.view.mainView.nodes.txt_kaogu_time.setString(L("KAOGU50"));
                        }else if(data.d.yjkg == 1){
                            G.view.mainView.nodes.txt_kaogu_time.setString(L("KAOGU51"));
                        }else {
                            G.view.mainView.nodes.txt_kaogu_time.setString(L("KAOGU52"));
                        }
                        me.remove();
                    });
                }
            });
            //效果总缆
            me.nodes.btn_xgzl.click(function(){
                G.frame.kaogu_xgzl.show();
            });
            //文物背包
            me.nodes.btn_wwbb.click(function(){
                if(X.keysOfObject(G.DATA.wenwu).length > 0){
                    G.frame.wenwu_bag.show();
                }else {
                    G.tip_NB.show(L("KAOGU31"));
                }
            });
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getDisplayData(function () {
                _super.apply(me, arg);
            });
        },
        onOpen: function () {
            var me = this;
            me.showToper();
            me.initUi();
            me.bindBtn();

            //me.getWenwuData();
        },
        changeType:function(type){
            var me = this;
            if (me.curType && me.curType == type) {
                return;
            }
            me.curType = type;
            var viewConf = {
                "1": G.class.kaogu_map,
                "2": G.class.kaogu_display,
                "3": G.class.kaogu_shop
            };
            //var _panels = new viewConf[type];
            //me.nodes.panel_nr.addChild(_panels);
            //cc.isNode(me._panelsview) && me._panels.removeFromParent();
            //me._panels = _panels;
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].isShow = true;
            for(var i in me._panels){
                if(i != type){
                    me._panels[i].isShow = false;
                }
            }
            me._panels[type].show();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.page1.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        getWenwuData: function (callback) {
            var me = this;
            G.ajax.send('wenwu_getlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    G.DATA.wenwu = d.d;
                    callback && callback();
                }
            });
        },
        getWenwuNumByPid: function(id){
            var me = this;
            var num = 0;
            for(var k in G.DATA.wenwu){
                if(G.DATA.wenwu[k].wid == id){
                    num += G.DATA.wenwu[k].num;
                }
            }
            return num;
        },
        getWenwuMaxstar:function(id){
            var me = this;
            var maxstar = X.keysOfObject(G.gc.wenwu[id])[X.keysOfObject(G.gc.wenwu[id]).length-1];
            return parseInt(maxstar);
        },
        //展览馆文物数据
        getDisplayData:function(callback){
            var me = this;
            G.ajax.send("exhibition_open",[],function(str,data){
                if(data.s == 1){
                    me.wwDATA = data.d;
                    callback && callback();
                }
            })
        },
        showzhanlichange:function(powerNum, newPowerNum){
            var me = this;
            var addPower = powerNum;
            if(cc.sys.isObjectValid(G.powerAniNode)) {
                var node = G.powerAniNode;
                node.action.pause();
                node.nodes.txt_zlts.clearAllTimers();
                var index = 1;
                node.nodes.txt_zlts.setTimeout(function () {
                    var n = parseInt(addPower / 10) < 1 ? 1 : parseInt(addPower / 10);
                    node.nodes.txt_zlts.setString("+" + index * n);
                    index ++;
                    if(index * n >= addPower) node.nodes.txt_zlts.setString("+" + addPower);
                }, 75, 11);
                node.nodes.fnt.setString(L("ZDL") + ":" + newPowerNum);
                node.action.playWithCallback("xunhuan", false, function () {
                    node.action.playWithCallback("out", false, function () {
                        node.removeFromParent(true);
                        delete G.powerAniNode;
                    });
                });
            } else {
                G.class.ani.show({
                    json: "ani_zhandouli_bianhua",
                    addTo: cc.director.getRunningScene(),
                    x: C.WS.width / 2,
                    y: C.WS.height / 2 + (C.WS.height / 2) / 2 + 50,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        X.autoInitUI(node);
                        node.action = action;
                        G.powerAniNode = node;
                        node.nodes.fnt.setString(L("ZDL") + ":" + newPowerNum);
                        node.nodes.txt_zlts.setString("+" + 0);
                        var index = 1;
                        node.nodes.txt_zlts.setTimeout(function () {
                            var n = parseInt(addPower / 10) < 1 ? 1 : parseInt(addPower / 10);
                            node.nodes.txt_zlts.setString("+" + index * n);
                            index ++;
                            if(index * n >= addPower) node.nodes.txt_zlts.setString("+" + addPower);
                        }, 75, 11);
                        action.playWithCallback("in", false, function () {
                            action.playWithCallback("xunhuan", false, function () {
                                action.playWithCallback("out", false, function () {
                                    node.removeFromParent(true);
                                    G.powerAniNode = undefined;
                                });
                            });
                        });
                    }
                });
            }
        }
    });

    G.frame[ID] = new fun('kaogu_bg.json', ID);
})();