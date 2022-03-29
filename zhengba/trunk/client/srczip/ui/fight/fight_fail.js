/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-失败
    var ID = 'fight_fail';

    var fun = X.bUi.extend({
        setFenXiang: function(ui) {
            var me = this;
            var panel = ui;
            var btns = [];
            X.autoInitUI(panel);

            panel.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    panel.hide();
                }
            });

            var richText = new X.bRichText({
                size: 24,
                maxWidth: panel.nodes.txt_nr.width,
                lineHeight: 24,
                color: '#F6EBCD',
                family: G.defaultFNT,
            });
            richText.text(L('XZFXPD'));
            richText.setPosition(154, 60);
            panel.nodes.txt_nr.addChild(richText);
            var conf = {
                0: '世界',
                1: '跨服',
            };
            var callFunc = {
                0: function () {
                    me.ajax('chat_sendvideo',[2, G.frame.fight.DATA.fightkey, G.frame.friend.fightName, X.cacheByUid("hideVip") ? 1 : 0],function(str,data) {
                        if (data.s === 1) {
                            G.tip_NB.show(L('FXCG'));
                            panel.hide();
                        }
                    });
                },
                1: function () {
                    me.ajax('chat_sendvideo',[4, G.frame.fight.DATA.fightkey, G.frame.friend.fightName, X.cacheByUid("hideVip") ? 1 : 0],function(str,data) {
                        if (data.s === 1) {
                            G.tip_NB.show(L('FXCG'));
                            panel.hide();
                        }
                    });
                }
            };
            var arr = !G.frame.chat.openConfig[4]() ? [0] : [0, 1];
            for (var i in arr) {
                (function (id) {
                    var btn = new ccui.Button();
                    btn.loadTextureNormal('img/public/btn/btn2_on.png', 1);
                    btn.setTitleText(conf[id]);
                    btn.setTitleFontName(G.defaultFNT);
                    btn.setTitleFontSize(24);
                    btn.setTitleColor(cc.color('#7b531a'));
                    btn.click(function () {
                        callFunc[id]();
                    });
                    btns.push(btn);
                })(arr[i]);
            }
            X.center(btns, panel.nodes.panel_top, {
                noRemove: true,
                callback: function (node) {
                    node.y = 68;
                }
            });
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isTouch) return;
                    me.remove();
                    G.frame.fight.remove();
                }
            });

            cc.isNode(me.ui.nodes.btn_zl) && me.ui.nodes.btn_zl.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.fight_datacompare.data(G.frame.fight.DATA || me.DATA).show();
                }
            });

            me.nodes.btn_next2.click(function () {
                if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                    G.frame.dafashita.fightCall();
                } else {
                    me.DATA.callback && me.DATA.callback();
                }
            }, 1000);

            me.nodes.btn_confirm2.click(function () {
                me.remove();
                G.frame.fight.remove();
            });

            me.nodes.btn_confirm.click(function () {
                me.remove();
                G.frame.fight.remove();
            });

            me.nodes.btn.click(function () {
                G.frame.woyaobianqiang.show();
                G.frame.fight.remove();
                me.remove();
            });

            me.nodes.btn_fxlx.click(function () {
                me.fenxiang.show();
                me.fenxiang.action.play("in", false);
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            new X.bView('ui_top3.json', function(view) {
                // me.ui.removeAllChildren();
                me.fenxiang = view;
                me.fenxiang.hide();
                me.ui.addChild(view);
                me.setFenXiang(view);
            }, {action: true});
        },
        onAniShow: function () {
            var me = this;
            me.action.play("wait", true);
        },
        onShow: function () {
            var me = this;
            me.DATA = G.frame.fight.data() || G.frame.fight.DATA ||me.data();
            X.showMvp(me, G.frame.fight.DATA);
            var lose = me.ui.finds("top_sb");
            lose.removeAllChildren();

            if(X.inArray(["shilianfight5","pvghtf", "pvfuben", "pvmw", "mwvideo", "fight_demo", 'lqsl', 'xkfb','wangzhezhaomu','wyhd','newyear_xrtz'], me.DATA.pvType)
                || (X.inArray(['pvwjzz'], me.DATA.pvType) && me.DATA.isSj)){
                X.audio.playEffect("sound/battlewin.mp3");
                me.nodes.btn.hide();
                me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushengli/bg_zhandou_sl.png", 1);
                me.nodes.panel_mvp.finds("Image_1").loadTexture("img/zhandou/img_zhandou_tmd2.png", 1);
                G.class.ani.show({
                    json: "ani_zhandoushengli",
                    addTo: lose,
                    x: lose.width / 2,
                    y: lose.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onload: function(node, action) {
                        node.finds("zi1").setSpriteFrame("img/public/zhandoujieshu.png");
                    },
                    onend: function(node, action) {
                        action.play("changtai", true);
                    }
                });
            }else {
                X.audio.playEffect("sound/battlelose.mp3");
                me.ui.finds("bg_zhandou_sb").loadTexture("img/zhandou/zhandoushibai/bg_zhandou_sb.png", 1);
                G.class.ani.show({
                    json: "ani_zhandoushibai",
                    addTo: lose,
                    x: lose.width / 2,
                    y: lose.height / 2,
                    repeat: false,
                    autoRemove: false,
                    onend: function (node, action) {
                        action.play("xunhuan", true);
                    }
                });
            }
            if(me.DATA.pvType == "pvfuben" || me.DATA.pvType == "pvmw" || me.DATA.pvType == "shilianfight5" || me.DATA.pvType == "pvghtf" || me.DATA.pvType == "wangzhezhaomu" || me.DATA.pvType == "newyear_xrtz"){
                me.setfb();
            }else{
                me.setContents();
            }
            if(me.DATA.pvType == "hybs") {
                me.nodes.panel_btn.show();
            }
            if(me.DATA.pvType == "pvguanqia") {
                if(P.gud.mapid == 10) {
                    if(!X.cacheByUid("yindaotanxian")) {
                        X.cacheByUid("yindaotanxian", false);
                        G.event.emit("needOpenWoYaoBianQiang");
                    }
                }
            }
            if(me.DATA.pvType == "damijing") {
                me.setDMJ();
            }
            if(me.DATA.pvType == "mwvideo" || me.DATA.pvType == "fight_demo") {
                me.setMW();
            }
            if(G.frame.dafashita.isShow && !G.frame.dafashita_jxtg.isShow) {
                me.nodes.btn.hide();
                me.nodes.panel_btn.show();
                me.nodes.btn_next2.setTitleText(L("ZCTZ"));
            }
            if (me.DATA.pvType == "sddl") {
                me.nodes.btn.hide();
                me.nodes.panel_btn.show();
                me.nodes.btn_next2.setTitleText(L("ZCTZ"));
                me.setSDDL();
            }
            if (me.DATA.pvType == "xkfb") {
                me.nodes.btn.hide();
                me.nodes.btn_confirm.show();
                me.setfb();
            }
            if (me.DATA.pvType == 'pvwjzz' && me.DATA.isSj) {
                me.setWJZZ();
            }
            if (me.DATA.pvType == 'pvfriend') {
                me.nodes.btn_fxlx.show();
            }
            if(me.DATA.pvType == 'jdsd'){//决斗盛典
                me.setJDSD();
            }
            me.ui.setTimeout(function () {
                me.event.emit('in_over');
                me.emit("show");
            }, 100);

            me.ui.setTimeout(function () {
                me.isTouch = true;
            }, 200);
        },
        setDMJ: function () {
            var me = this;
            me.nodes.damijing.show();
            me.nodes.btn.hide();
            me.nodes.listview_ico.hide();
            me.ui.finds("img_zhandou_sb2").hide();
            for(var i in me.DATA.pv) {
                var layout = me.nodes["mingji_rw" + i];
                var wid = G.class.shero(me.DATA.pv[i]);
                wid.setAnchorPoint(0.5, 0.5);
                wid.setPosition(layout.width / 2, layout.height / 2);
                i == 1 ? wid.setEnabled(me.DATA.winside ? false : true) : wid.setEnabled(me.DATA.winside ? true : false);
                layout.addChild(wid);
            }
        },
        setMW: function() {
            var me = this;
            me.nodes.btn.hide();
            me.nodes.listview_ico.hide();
            me.ui.finds("img_zhandou_sb2").hide();

            me.nodes.list_fs.show();
            me.nodes.txt_prefix.setString(L("dps"));
            me.nodes.txt_number.setString(me.DATA.dpsbyside[0]);

        },
        setfb: function(){
            var me = this;
            me.ui.finds("img_zhandou_sb2").hide();
            X.alignCenter(me.nodes.panel_nr, me.DATA.prize, {
                touch: true
            });
        },
        onHide: function () {
            var me = this;
            me.emit("hide");
        },
        setContents: function () {
            var me = this;

            if (me.DATA.prize && X.inArray(['lqsl', 'wztt_one', 'wyhd'], me.DATA.pvType)) {
                me.nodes.listview_ico.setItemsMargin(15);
                return X.lengthChangeByPanel(me.DATA.prize, me.nodes.panel_nr, me.nodes.listview_ico, {
                    touch: true
                });
            }
            if (me.DATA.pvType == "xkfb") return;

            var panel = me.ui;
            var listview = panel.nodes.listview_ico;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var list = panel.nodes.list_bqff;
            list.hide();

            // var data = me.DATA.prize;
            var callback = function () {
                cc.isNode(me.ui) && cc.isNode(me.ui.nodes.mask) && me.ui.nodes.mask.triggerTouch(ccui.Widget.TOUCH_ENDED)
            };

            var data = [
                {id:'duanzaofang',callback:callback},
                {id:'yingxiong',callback:callback},
                {id:'chouka',callback:callback}
            ];
            for (var i = 0; i < data.length; i++) {
                var p = data[i];
                var item = list.clone();
                me.setItem(item,p);
                listview.pushBackCustomItem(item);
                item.show();
            }
        },
        setItem: function (ui, data) {
            var wid = G.class.stiaozhuan(data,true);
            wid.setPosition(cc.p(ui.width / 2,ui.height / 2 + 8));
            ui.removeAllChildren();
            ui.addChild(wid);
            wid.setTouchEnabled(false);
            wid.icon.setTouchEnabled(true);
            wid.icon.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var callback = data.callback;
                    callback && callback();
                    X.tiaozhuan(wid.id);
                }
            });
        },
        setWJZZ: function () {
            var me = this;
            me.nodes.listview_ico.hide();

            new X.bView("ui_wujunzhizhan_js.json", function (view) {
                me.nodes.panel_nr.addChild(view);
                X.render({
                    text_mz: L("JPSJ"),
                    text_wz: "+" + X.fmtValue(me.DATA.dpsbyside[0]),
                    panel_tx: function (node) {

                    }
                }, view.nodes);
            }, {action: true});
        },
        setSDDL: function () {
            var me = this;

            me.nodes.btn_next2.click(function () {
                G.DATA.noClick = true;
                me.ajax("dungeon_fight", [me.DATA.idx, me.DATA.hereList], function (str, d) {
                    if (d.s == 1) {
                        d.d.fightres['pvType'] = 'sddl';
                        d.d.fightres.prize = d.d.prize;
                        d.d.fightres.map = me.DATA.map;
                        d.d.fightres.idx = me.DATA.idx;
                        d.d.fightres.hereList = me.DATA.hereList;
                        G.frame.fight.demo(d.d.fightres);
                        me.remove();

                        G.frame.shendian_sddl.getData(function () {
                            G.frame.shendian_sddl.setContents();
                        });
                        G.hongdian.getData("fashita", 1, function () {
                            G.frame.julongshendian.checkRedPoint();
                            G.frame.shendian_sddl.checkRedPoint();
                        });
                        G.DATA.noClick = false;
                    } else {
                        G.DATA.noClick = false;
                    }
                });
            });
        },
        setJDSD:function () {
            var me = this;
            me.nodes.btn.hide();
            me.nodes.listview_ico.hide();
            me.nodes.juedoushenggli.show();
            for(var i = 0; i < me.DATA.headdata.length; i++){
                var str = '';
                var name = me.DATA.headdata[i].name;
                if(me.DATA.winside == i){//赢了
                    var jifenstr = X.STR(L('JUEDOUSHENGDIAN24'),(me.DATA.jifeninfo[i]+1));
                }else {
                    var jifenstr = X.STR(L('JUEDOUSHENGDIAN25'),(me.DATA.jifeninfo[i]-1));
                }
                str += name + '<br>' + jifenstr;
                var rh = X.setRichText({
                    parent:me.nodes['pan_xx' + (i+1)],
                    str:str,
                    anchor: {x: 0, y: 0.5},
                    pos: {x: 0, y: me.nodes['pan_xx' + (i+1)].height / 2},
                    color:"#fff8e1",
                    outline:"#000000",
                    size:22
                })
            }

            var prize = [];
            for(var k in me.DATA.prize){
                if(k == P.gud.uid){
                    for(var j = 0; j < me.DATA.prize[k].length; j++){
                        prize = prize.concat(me.DATA.prize[k][j]);
                    }
                }
            }

            var layout = new ccui.Layout();
            layout.setContentSize(cc.size(150,30));
            layout.setAnchorPoint(0,0);
            me.ui.addChild(layout);
            me.nodes.pan_xx3.removeAllChildren();
            var nodearr = [];
            var inter = 50;
            var starx = (me.nodes.pan_xx3.width - inter*(prize.length-1)-layout.width*prize.length)/2;
            for(var i = 0; i < prize.length; i++){
                var ico = layout.clone();
                var img = new ccui.ImageView(G.class.getItemIco(prize[i].t),1);
                var num = "+" + prize[i].n;
                if(prize[i].t == '2088' && G.frame.juedoushengdian_main.DATA.myinfo.tq){
                    var str = X.STR(L('JUEDOUSHENGDIAN29'), num);
                }else {
                    var str = X.STR(L('JUEDOUSHENGDIAN28'), num);
                }
                var rh = X.setRichText({
                    parent:ico,
                    str:str,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ico.width / 2, y: ico.height / 2},
                    color:"#FFE8C0",
                    size:22,
                    outline:"#000000",
                    node:img
                });
                ico.setPosition(cc.p(starx+(inter + layout.width)*i,0));
                me.nodes.pan_xx3.addChild(ico);
            }
        }
    });

    G.frame[ID] = new fun('zhandoushibai.json', ID);
})();