(function () {
    var ID = 'shengdanjie_sdjb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },

        initUi: function () {
            var me = this;
            G.class.ani.show({
                json: "shengdan_jiantou_dx",
                addTo: me.nodes.panel_jt,
                repeat: true,
                autoRemove: false
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_lan.click(function () {
                me.gameType = 1;
                me.startGame();
            });
            me.nodes.btn_h.click(function () {
                me.gameType = 2;
                me.startGame();
            });
        },
        onOpen: function () {
            var me = this;

            if(G.DATA.hongdian.christmas && G.DATA.hongdian.christmas.game){
                X.cacheByDay(P.gud.uid, "sdj_game", {});
            };
        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var sdj = G.gc.christmas.gameprize;
            me.setBaseInfo();
            me.initGame();
            me.setRankList();
            me.setGameNum();
            me.nodes.panel_jt.show();
            for (var i = 0; i < sdj.length; i++) {
                var widget = G.class.sitem(sdj[i]);
                widget.setAnchorPoint(0.5, 0.5);
                widget.setPosition(cc.p(me.nodes["panel_wp" + (i + 1)].width * 0.5, me.nodes["panel_wp" + (i + 1)].height * 0.5));
                me.nodes["panel_wp" + (i + 1)].removeAllChildren();
                me.nodes["panel_wp" + (i + 1)].addChild(widget);
                G.frame.iteminfo.showItemInfo(widget);
            }
        },
        setGameNum:function(){
            var me = this;
            var num = G.gc.christmas.gamenum - G.frame.shengdanjie.DATA.myinfo.gamenum;
            X.setRichText({
                parent:me.nodes.txt_cs,
                str:X.STR(L("shengdanjie_txt14"),num),
                anchor: {x: 0.5, y: 0.5},
                pos: {x: me.nodes.txt_cs.width/2, y: me.nodes.txt_cs.height / 2},
                color:"#552400",
                size:18,
            });

            if(num == 0){
                me.nodes.btn_lan.setBright(false);
                me.nodes.btn_lan.setTouchEnabled(false);
                me.nodes.txet_lan.setTextColor(cc.color("#6c6c6c"));
            }else{
                me.nodes.btn_lan.setBright(true);
                me.nodes.btn_lan.setTouchEnabled(true);
                me.nodes.txet_lan.setTextColor(cc.color("#2F5719"));
            }

            if (num > 0) {
                G.setNewIcoImg(me.nodes.panel_btn1);
                me.nodes.panel_btn1.finds('redPoint').setPosition(125, 45);
            } else {
                G.removeNewIco(me.nodes.panel_btn1);
            }
        },
        setRankList:function(){
            var me = this;
            var myrank = G.frame.shengdanjie.DATA.myrank;
            var myval = G.frame.shengdanjie.DATA.myval;
            var str1 = X.STR(L("shengdanjie_txt1"),myrank != -1 ? myrank : L("WSB"));
            var str2 = X.STR(L("shengdanjie_txt6"),myval != -1 ? myval + "s" : L("WCY"));
            X.setRichText({
                parent:me.nodes.txt_wj1,
                str:str1,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: me.nodes.txt_wj1.height / 2},
                color:"#ffffff",
                size:20,
            });
            X.setRichText({
                parent:me.nodes.txt_ys1,
                str:str2,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: me.nodes.txt_ys1.height / 2},
                color:"#ffffff",
                size:18,
            });

            var arr = JSON.parse(JSON.stringify(G.frame.shengdanjie.DATA.ranklist));

            for(var i = 0 ; i < 3 ;i++){
                if(!arr[i]){
                    arr.push({zanwu:true});
                }
                arr[i].idx = (i+1);
            }

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_wjbs, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(arr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(arr);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            ui.show();
            X.autoInitUI(ui);

            var str1 = X.STR(L("shengdanjie_txt2"),data.idx,!data.zanwu ? data.headdata.name:L("XWYD"));
            var str2 = data.gamerecord ? data.gamerecord+"s" : "";
            X.setRichText({
                parent:ui.nodes.txt_wj,
                str:str1,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: ui.nodes.txt_wj.height / 2},
                color:"#ffffff",
                size:20,
            });
            var rt = X.setRichText({
                parent:ui.nodes.txt_ys,
                str:str2,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: 0, y: ui.nodes.txt_ys.height / 2},
                color:"#2ada13",
                size:20,
            });
            rt.setPositionX(ui.nodes.txt_ys.width - rt.trueWidth());

        },
        initGame: function () {
            var me = this;
            me.jindu = 1;
            me.gameTime = 0;
            for (var i = 1; i < 20; i++) {
                me.nodes["xian" + i].hide();
                me.nodes["panel_dian" + i].setTouchEnabled(true);
                me.nodes["panel_dian" + i].idx = i;
                me.nodes["panel_dian" + i].touch(function (sender, type) {
                    if(me.start){
                        if (type == ccui.Widget.TOUCH_BEGAN) {
                            if (sender.idx == me.jindu) {
                                if (!me.shutiao) {
                                    me.shutiao = new ccui.ImageView('img/shengdanjie/img_xian.png', 1);
                                    me.shutiao.hide();
                                    me.nodes.panel_s.addChild(me.shutiao);
                                    if (!me.fromNode) me.fromNode = sender;
                                }
                            }
                        } else if (type == ccui.Widget.TOUCH_MOVED) {
                            if (!me.shutiao) {
                                return;
                            }
                            var mPos = me.endPos = me.nodes.panel_s.convertToNodeSpace(sender.getTouchMovePosition());
                            me.arrowLine(me.fromNode.getPosition(), mPos);
                            if(me.nodes["panel_dian" + (me.jindu + 1)]){
                                if (me.checkRectangleCrash(me.nodes["panel_dian" + (me.jindu + 1)].getPosition(), mPos, cc.size(20, 20))) {
                                    me.nodes["xian" + me.jindu].show();
                                    me.jindu++;
                                    me.fromNode = me.nodes["panel_dian" + me.jindu];
                                }
                            }else{
                                if (me.checkRectangleCrash(me.nodes["panel_dian1"].getPosition(), mPos, cc.size(20, 20))) {
                                    me.nodes["xian" + me.jindu].show();
                                    me.jindu++;
                                    me.shutiao.removeFromParent();
                                    me.shutiao && delete me.shutiao;
                                    me.gameOver();
                                }
                            }
                        } else if (type == ccui.Widget.TOUCH_ENDED) {
                            if (me.shutiao) {
                                me.shutiao.removeFromParent();
                                me.shutiao && delete me.shutiao;
                            }
                        }
                    }
                })
            }
        },
        checkRectangleCrash: function (pos, curPos, size) {
            if (curPos.x >= pos.x - size.width / 2 &&
                curPos.x <= pos.x + size.width / 2 &&
                curPos.y >= pos.y - size.height / 2 &&
                curPos.y <= pos.y + size.height / 2) {
                return true;
            } else {
                return false;
            }
        },
        arrowLine: function (from, to) {
            var me = this;
            if (!cc.isNode(me.shutiao)) return;
            var dis = cc.pDistance(from, to); //两点之间的距离
            me.shutiao.show();
            me.shutiao.setAnchorPoint(0, 0);
            me.shutiao.setScaleX(dis / me.shutiao.width);
            var cha = 0;
            me.shutiao.setPosition(from.x + cha, from.y);
            //旋转
            var _vec = cc.pSub(to, from),
                _angle = cc.pToAngle(_vec);
            // me.shutiao.setRotation(cc.radiansToDegrees(-1 * _angle));
            me.shutiao.setRotationX(cc.radiansToDegrees(-1 * _angle));
            me.shutiao.setRotationY(cc.radiansToDegrees(-1 * _angle));
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || {a: 'attr', t: 'jinbi'};
            var attr2 = me.need2 = obj.need2 || {a: 'attr', t: 'rmbmoney'};

            me.nodes.panel_up.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_up.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb: X.fmtValue(G.class.getOwnNum(attr1.t, attr1.a)),
                txt_zs: X.fmtValue(G.class.getOwnNum(attr2.t, attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.once("hide", function () {
                                me.setContents();
                            }).show();
                        }

                    });
                },
                btn_jia2: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.once("hide", function () {
                                me.setContents();
                            }).show();
                        }
                    })
                }
            }, me.nodes);
        },
        startGame:function(){
            var me = this;
            me.useTime = 0;
            me.start = true;
            me.nodes.panel_btn1.hide();
            me.nodes.panel_btn2.hide();
            me.ui.setInterval(function(){
                me.useTime++;
            }, 1000);
            me.initGame();
            me.nodes.panel_jt.hide();
        },
        gameOver:function () {
            var me = this;
            me.ui.clearAllTimers();
            me.start = false;
            if(me.gameType == 1){
                G.ajax.send("christmas_gamefinish", [me.useTime], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.shengdanjie.DATA.myinfo = d.d.myinfo;
                        G.frame.shengdanjie.DATA.myrank = d.d.myrank;
                        G.frame.shengdanjie.DATA.myval = d.d.myval;
                        G.frame.shengdanjie.DATA.ranklist = d.d.ranklist;
                        if(d.d.prize){
                            G.frame.jiangli.data({
                                prize:d.d.prize
                            }).show();
                        }
                        me.nodes.panel_btn1.show();
                        me.nodes.panel_btn2.show();
                        me.nodes.panel_jt.show();
                        me.setRankList();
                        me.setGameNum();
                    }else{
                        me.nodes.panel_btn1.show();
                        me.nodes.panel_btn2.show();
                        me.nodes.panel_jt.show();
                    }
                });
            }else{
                me.nodes.panel_btn1.show();
                me.nodes.panel_btn2.show();
                me.nodes.panel_jt.show();
            }
        }
    });
    G.frame[ID] = new fun('shengdanjiangbing.json', ID);
})();