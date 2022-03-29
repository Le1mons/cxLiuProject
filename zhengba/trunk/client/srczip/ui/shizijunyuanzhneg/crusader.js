/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //十字军远征
    var ID = 'shizijunyuanzheng';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes=['yuanzheng.png','yuanzheng.plist',"jingjichang.png","jingjichang.plist"];
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_sc.click(function (sender, type) {
                // G.frame.shop.data({
                //     type: "3",
                //     name: "yzsd"
                // }).show();
                G.frame.shopmain.data('3').show();
            });

            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS7")
                }).show();
            });

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openyuanzheng.mp3");
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.levelConf = G.class.shizijunyuanzheng.getLevel();
            me.CONF = G.class.shizijunyuanzheng.getConf();
            me.nodes.Img_djgbj.hide();
        },
        onAniShow: function () {
            var me = this;
            if(!me.DATA.difficult) return G.frame.shizijun_difficult.show();
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("shizijun_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    me.iszchd = d.d.iszchd > 0 ? d.d.iszchd / 100 : 1;
                    callback && callback();
                }
            })
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.nodes.panel_bx.hide();
            me.nodes.panel_gq.hide();
            me.setContents();
            me.nodes.panel_bg.setBackGroundImage("img/bg/bg_yuanzheng.jpg", 0);
            me.nodes.panel_bg.setPositionX(479);
            me.nodes.scrollview_dt.innerWidth = me.nodes.panel_bg.width - 1;
            me.nodes.scrollview_dt.setBounceEnabled(true);
            me.setMax();
            me.setTime();
            me.ui.setTimeout(function(){
                G.guidevent.emit('shizijunyuanzhengOpenOver');
            },200);
        },
        setMax: function() {
            var me = this;
            var scrollview = me.nodes.scrollview_dt,
                innerContent = scrollview.getInnerContainer();

            innerContent.update = function (dt) {
                if(innerContent.x > 124) {
                    innerContent.x = 124;
                }else if(innerContent.x < -442) {
                    innerContent.x = -442;
                }
            };
            innerContent.scheduleUpdate();
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getData("shizijun", 1);
            G.frame.julongshendian.checkRedPoint();
        },
        setContents: function () {
            var me = this;
            var level = me.levelConf.level;
            var keys = X.keysOfObject(level);
            var boxPosition = me.levelConf.prizeBox;
            var keys1 = X.keysOfObject(boxPosition);

            me.nodes.panel_bg.removeAllChildren();
            G.class.ani.show({
                json: "ani_shizijun",
                addTo: me.nodes.panel_bg,
                x: me.nodes.panel_bg.width/2 + 2,
                y: me.nodes.panel_bg.height/2 - 20,
                repeat: true,
                autoRemove: false,
            });

            for(var i = 0; i < keys.length; i ++){
                me.setLevel(level[keys[i]].position, i);
            }
            for(var i = 0; i < keys1.length; i ++){
                me.setBox(boxPosition[keys1[i]].position, i);
            }
            me.setSupply();
        },
        setSupply: function() {
            var me = this;
            var supply = [];
            var conf = G.class.shizijunyuanzheng.getSupply();

            me.nodes.lview.removeAllChildren();

            for (var i in conf) {
                var item = G.class.shizijun_supply(i, conf[i], (me.DATA.supply && me.DATA.supply[i]) || 0);
                supply.push(item);
            }
            X.center(supply, me.nodes.lview, {});
        },
        setBox: function(position,idx){
            var me = this;
            var box = me.nodes.panel_bx.clone();
            var prize = me.CONF.base.boxprize[me.DATA.difficult || 1][idx];

            box.show();
            box.removeBackGroundImage();
            

            if (me.DATA.passlist.length >= prize[0]) {
                if (X.inArray(me.DATA.prizelist, idx) == false) {
                    //可领取
                    X.addBoxAni({
                        parent:box,
                        boximg:"img/yuanzheng/img_yz_bx.png"
                    });
                } else {
                    //已领取
                    box.setBackGroundImage("img/yuanzheng/img_yz_bx_d.png", 1);
                }
            } else {
                // 未达成
                box.setBackGroundImage("img/yuanzheng/img_yz_bx.png", 1);
            }
            box.setPosition(position.x, position.y);
            me.nodes.panel_bg.addChild(box);
            box.zIndex = 999999;
            box.setTouchEnabled(true);
            box.getChildren()[0].touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    if(me.DATA.passlist.length >= prize[0] && X.inArray(me.DATA.prizelist, idx) == false){
                        G.ajax.send("shizijun_getprize", [idx], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.event.emit('sdkevent',{
                                    event:'szj_lingjiang',
                                    data:{
                                        szj_boxNum:idx,
                                        get:d.d.prize
                                    }
                                });
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).show();
                                me.getData(function () {
                                    me.setContents();
                                })
                            }
                        })
                    }else{
                        var prizeArr = X.clone(prize[1]);
                        for(var i in prizeArr) {
                            prizeArr[i].n = parseInt(prizeArr[i].n * me.iszchd);
                        }
                        prizeArr.push({a: "item", t: "shenmi"});
                        G.frame.jiangliyulan.data({
                            prize: prizeArr
                        }).show();
                    }
                }
            })
        },
        setLevel: function (conf, idx) {
            var me = this;
            var isOK = false;
            var level = me.nodes.panel_gq.clone();
            level.show();
            X.autoInitUI(level);

            level.zIndex = 999999;
            level.nodes.text_gq.setString(idx + 1);
            level.nodes.text_gq.setTextColor(cc.color("#F6EBCD"));
            X.enableOutline(level.nodes.text_gq, "#74391C", 2);
            level.setPosition(conf.x, conf.y);
            me.nodes.panel_bg.addChild(level);
            if(me.DATA.passlist.length == idx){
                // level.nodes.panel_gq1.setBackGroundImage("img/yuanzheng/img_yz_gq1.png", 1);
                // level.nodes.panel_qp.setBackGroundImage("img/yuanzheng/img_yz_gq2.png", 1);
                level.nodes.text_gq.hide();
                G.class.ani.show({
                    json: "ani_shizijun_shan",
                    addTo: level.nodes.panel_dh,
                    x: level.nodes.panel_dh.width/2,
                    y: level.nodes.panel_dh.height/2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.finds("Text_1").setString(idx + 1);
                    }
                });
            }else if(me.DATA.passlist.length > idx){
                level.nodes.panel_gq1.setBackGroundImage("img/yuanzheng/img_yz_gq1.png", 1);
                level.nodes.panel_qp.setBackGroundImage("img/yuanzheng/img_yz_gq2.png", 1);
            }else{
                level.nodes.panel_gq1.setBackGroundImage("img/yuanzheng/img_yz_gq1.png", 1);
                // level.nodes.panel_qp.setBackGroundImage("img/yuanzheng/img_yz_gq2_h.png", 1);
                level.nodes.text_gq.setString("");
                // level.nodes.panel_gq1.setBackGroundImage("img/yuanzheng/img_yz_gq1.png", 1);
            }
            if(me.DATA.passlist.length > idx) isOK = true;
            level.nodes.panel_qp.setTouchEnabled(true);
            level.nodes.panel_btn.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(idx > me.DATA.passlist.length){
                        G.tip_NB.show(L("QTGSYGQ"));
                        return;
                    }
                    var conf = me.DATA.rival[idx.toString()];
                    G.frame.sizijunyuanzheng_dsxx.data({conf: conf, idx: idx, isOk: isOK, difficult: me.DATA.difficult}).show();
                }
            })
        },
        setTime: function () {
            var me = this;
            var timeTxt = new ccui.Text();
            // timeTxt.setTextColor(cc.color(G.gc.COLOR[5]));
            // timeTxt.setFontName(G.defaultFNT);
            // timeTxt.setFontSize(40);
            // me.ui.addChild(timeTxt);
            // timeTxt.setPosition(300, 400);
            X.timeout(timeTxt, X.getTodayZeroTime() + 24 * 3600,function () {
                // if(G.frame.yingxiong_fight.isShow) G.frame.yingxiong_fight.remove();
                // if(G.frame.sizijunyuanzheng_dsxx.isShow) G.frame.sizijunyuanzheng_dsxx.remove();
                // me.remove();
                if(G.frame.fight.isShow){
                    G.frame.fight.once("hide", function () {
                        X.uiMana.closeAllFrame();
                    })
                }else{
                    X.uiMana.closeAllFrame();
                }
            });
        }
    });
    G.frame[ID] = new fun('yuanzheng.json', ID);
})();