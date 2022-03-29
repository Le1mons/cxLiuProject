/**
 * Created by wlx on 2019/12/17.
 */
(function () {
    //挖宝
    var ID = 'huodong_baby';
    var fun = X.bUi.extend({
        row: 5,
        line: 7,
        delaytime:{0:0, 1:0.15, 2:0.05, 3:0.2, 4:0.1},
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
            // me._super("tanbao.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.showToper();
            me._data = G.DATA.asyncBtnsData.xldx;
            me.bindBtn();
            me.initUi();
            me.initGrid();
        },
        initUi:function() {
            var me = this;

            G.class.ani.show({
                json: "wabao_lazhu",
                addTo: me.nodes.panel_lazhu,
                repeat: true,
                autoRemove: false,
            });
            me.nodes.panel_lazhu.y = -31;

            if(me._data.rtime - G.time > 24*3600){
                me.nodes.txt_yj.setString(X.moment(me._data.rtime - G.time));
            }else {
                X.timeout(me.nodes.txt_yj, me._data.rtime, function () {
                    me.nodes.txt_yj.setString(L("YJS"));
                });
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            //奖励预览
            me.nodes.btn_jl.click(function () {
                G.frame.baby_jlyl.data(me.DATA).show();
            });
            //礼包
            me.nodes.btn_xllb.click(function () {
                G.frame.baby_libao.data(me.DATA).show();
            });
            //帮助
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS55')
                }).show();
            });
            //选择目标奖励
            me.nodes.panel_jlwp.setTouchEnabled(true);
            me.nodes.panel_jlwp.touch(function (sender,type) {
                G.frame.baby_select.data({
                    step: me.DATA.myinfo.val || 1,
                    hdid:me._data.hdid,
                }).show();
            });
            //去下一层
            me.nodes.btn_qwxyc.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.ajax("huodong_use", [me._data.hdid,3,0], function (str, data) {
                            if (data.s == 1) {
                                me.getData(function () {
                                    me.setContents();
                                });
                            }
                        });
                    },
                    richText: L('xldx_to')
                }).show();
            });
            me.ui.finds("img_di").setTouchEnabled(true);
            me.ui.finds("img_di").click(function (sender) {
                 var cacheBool = X.cacheByUid("huodong_baby");
                 X.cacheByUid("huodong_baby",!cacheBool);
                 me.nodes.ico_gou.setVisible(!cacheBool);
            })
        },
        onShow: function () {
            var me = this;

            if (cc.sys.isNative) {
                me.getData(function () {
                    me.setContents();
                });
            } else {
                me.ui.setTimeout(function () {
                    me.getData(function () {
                        me.setContents();
                    });
                }, 200);
            };
            var cacheBool = X.cacheByUid("huodong_baby");
            me.nodes.ico_gou.setVisible(cacheBool);
            me.showNeedNum();
        },
        setContents: function () {
            var me = this;
            //第几层
            me.nodes.panel_sj2.finds('txt_wz').setString(X.STR(L("XLDX"), X.num2China(me.DATA.myinfo.val)));
            me.setAniState();
            if (me.DATA.myinfo.target) {
                if (me.DATA.myinfo.over) {

                } else {

                }
                me.showGridPrize();
            } else {
                me.showInitPrize();
            }
        },
        showNeedNum:function(){
            var me = this;
            me.nodes.txt_wzs01.setString(G.class.getOwnNum(G.gc.wabao.need[0].t,G.gc.wabao.need[0].a));
        },
        initGrid: function () {
            var me = this;
            var index = 1;

            function addAni(lay) {
                G.class.ani.show({
                    json: "wabao_fanzhaun",
                    addTo: lay,
                    autoRemove: false,
                    onload: function (node, action) {
                        X.autoInitUI(node);
                        node.action = action;
                        lay.ani = node;
                        lay.lay = node.nodes.wp;
                        lay.lay.setTouchEnabled(false);
                        action.gotoFrameAndPause(0);
                    }
                });
                lay.setTouchEnabled(true);
                lay.click(function (sender) {
                    if (!sender.can) return;
                    var need = G.gc.wabao.need[0];
                    if (G.class.getOwnNum(need.t,need.a) < 1) return G.tip_NB.show(L("hd_xlg"));
                    G.frame.loadingIn.show();
                    me.ajax("huodong_use", [me._data.hdid,2, lay.getName()], function (str, data) {
                        if (data.s == 1) {
                            sender.zIndex = 100;
                            var item = G.class.sitem(data.d.prize[0]);
                            item.setScale(.8);
                            item.setPosition(sender.lay.width / 2, sender.lay.height / 2);
                            sender.lay.addChild(item);
                            if( X.cacheByUid("huodong_baby")){
                                me.showNeedNum();
                                sender.zIndex = 1;
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).once("willClose", function () {
                                    if (data.d.good >= 2) {
                                        me.nodes.btn_qwxyc.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                    }
                                }).show();
                                me.getData(function () {
                                    me.setContents();
                                    G.hongdian.getData('xldx',1);
                                });
                                G.frame.loadingIn.remove();
                            }else{
                                G.class.ani.show({
                                    json: ["wabao_wagezi", "wabao_wagezi_gaoji", "wabao_wagezi_gaoji"][data.d.good || 0],
                                    addTo: sender,
                                    onkey: function (n, a, k) {
                                        if (k == "hit") {
                                            sender.ani.action.gotoFrameAndPause(0);
                                        }
                                    },
                                    onend: function () {
                                        me.showNeedNum();
                                        sender.zIndex = 1;
                                        G.frame.jiangli.data({
                                            prize: data.d.prize
                                        }).once("willClose", function () {
                                            if (data.d.good >= 2) {
                                                me.nodes.btn_qwxyc.triggerTouch(ccui.Widget.TOUCH_ENDED);
                                            }
                                        }).show();
                                        me.getData(function () {
                                            me.setContents();
                                            G.hongdian.getData('xldx',1);
                                        });
                                        G.frame.loadingIn.remove();
                                    }
                                });
                            }
                            G.event.emit('sdkevent',{
                                event:'Dig',
                                data:{
                                    consume:G.gc.wabao.need[0],
                                    get:data.d.prize,
                                    nowFloor:me.DATA.myinfo.val,
                                }
                            });
                        } else {
                            G.frame.loadingIn.remove();
                        }
                    });
                });
            }

            me.grid = [];
            for (var row = 0; row < me.row; row ++) {
                me.grid[row] = [];
                for (var line = 0; line < me.line; line ++) {
                    var layout = me.grid[row][line] = me.nodes["panel_list" + index];
                    layout.setName('' + row + line);
                    layout.sPos = layout.getPosition();
                    layout.index = index;
                    layout.zIndex = 1;
                    addAni(layout);
                    index ++;
                }
            }
        },
        //选了目标奖励后
        showGridPrize: function () {
            var me = this;
            me.setState(function (node) {
                node.lay.removeAllChildren();
                var prize = me.DATA.myinfo.trace && me.DATA.myinfo.trace[node.getName()];
                if (prize) {
                    node.can = false;
                    var item = G.class.sitem(prize);
                    item.setScale(.8);
                    item.setPosition(node.lay.width / 2, node.lay.height / 2);
                    node.lay.addChild(item);
                    node.ani.action.gotoFrameAndPause(0);
                } else {
                    node.can = true;
                    node.ani.action.gotoFrameAndPause(13);
                }
            });
        },
        //没有选择目标奖励
        showInitPrize: function () {
            this.setState(function (node) {
                node.can = false;
                node.lay.removeAllChildren();
                node.ani.action.gotoFrameAndPause(0);
                var prize = G.class.sitem(G.gc.wabao.showprize[node.index]);
                prize.setScale(.8);
                if(node.index == 18) prize.num.hide();
                if(prize.num == 0) prize.num.hide();
                prize.setPosition(node.lay.width / 2, node.lay.height / 2);
                node.lay.addChild(prize);
            });
        },
        setState: function (callback) {
            for (var row = 0; row < this.row; row ++) {
                for (var line = 0; line < this.line; line ++) {
                    callback && callback(this.grid[row][line]);
                }
            }
        },
        flayState: function(callback){
            var me = this;
            for (var row = 0; row < this.row; row ++) {
                for(var i = 0; i < 7; i++){
                    var img = new ccui.Layout();
                    me.nodes.panel_wp_list.addChild(img);
                    img.row = row;
                    img.setAnchorPoint(0.5,0.5);
                    img.setBackGroundImage("img/tanbao/img_tanbao_s01.png",1);
                    img.setPosition(-43 -i*100, this.grid[row][0].y + 45);
                    callback && callback(img);
                }
                for (var line = 0; line < this.line; line ++) {
                    var node = this.grid[row][line];
                    node.row = row;
                    callback && callback(node);
                }

            }

        },
        showFlyAni:function(){
            var me = this;
            var prize = G.gc.wabao.target[me.DATA.myinfo.target].prize;
            var node = me.grid[2][3];
            var item = G.class.sitem(prize);
            item.setPosition(node.lay.width / 2, node.height / 2);
            item.setScale(.8);
            node.lay.addChild(item);
            node.ani.action.playWithCallback("in1", false, function () {
                node.lay.removeAllChildren();
                me.showGridAni(me.rollAni());
            });
        },
        //格子动起来
        showGridAni:function(callback){
            var me = this;
            this.setState(function (node) {
                node.can = true;
                if (node.getName() == '23') return;
                node.ani.action.playWithCallback("in",false);
            });
            callback && callback()
        },
        rollAni:function(){
            var me = this;
            me.flayState(function (node) {
                if(node.childrenCount > 0){
                    node.children[0].hide();
                    node.removeBackGroundImage();
                    node.setBackGroundImage("img/tanbao/img_tanbao_s01.png",1);
                }
                node.runAction(cc.sequence(cc.delayTime(me.delaytime[node.row]),cc.moveBy(0.15, cc.p(300,0)),cc.moveBy(0.15, cc.p(-300,0)),cc.callFunc(function () {
                    if(node.childrenCount > 0){
                        node.children[0].show();
                        node.removeBackGroundImage();
                    }
                })));
            });
        },
        //目标奖励状态
        setAniState: function () {
            var me = this;

            me.nodes.panel_jlwp.removeAllChildren();
            me.nodes.panel_jlwp.removeBackGroundImage();
            if(me.DATA.myinfo.target){//已经选择了目标奖励
                if(me.DATA.myinfo.over){//挖到目标奖励
                    me.nodes.btn_qwxyc.show();
                    me.nodes.panel_jlwp.hide();
                }else {//没有挖到目标奖励
                    me.nodes.btn_qwxyc.hide();
                    me.nodes.panel_jlwp.show();
                    var prize = G.gc.wabao.target[me.DATA.myinfo.target].prize;
                    var item = G.class.sitem(prize);
                    item.setPosition(me.nodes.panel_jlwp.width / 2, me.nodes.panel_jlwp.height / 2);
                    me.nodes.panel_jlwp.addChild(item);
                    me.nodes.txt_bcgw.setString(L("WABAOGENGHUAN"));
                }
            }else {//没有选择目标奖励
                me.nodes.btn_qwxyc.hide();
                me.nodes.panel_jlwp.show();
                me.nodes.panel_jlwp.setBackGroundImage("img/public/ico/ico_bg0.png",1);
                var img = new ccui.ImageView("img/public/img_dwjiahao.png",1);
                img.setAnchorPoint(0.5, 0.5);
                img.setPosition(me.nodes.panel_jlwp.width / 2, me.nodes.panel_jlwp.height / 2);
                me.nodes.panel_jlwp.addChild(img);
                img.runAction(cc.sequence(cc.fadeOut(1), cc.fadeIn(1)).repeatForever());
                me.nodes.txt_bcgw.setString(L("WABAOXUANZE"));
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            connectApi('huodong_open',[me._data.hdid],function (d) {
                me.DATA = d;
                G.gc.wabao.target = d.info.target;
                callback && callback();
            });
        },
    });
    G.frame[ID] = new fun('tanbao.json', ID);
})();