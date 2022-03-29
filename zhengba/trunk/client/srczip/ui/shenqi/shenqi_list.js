/**
 * Created by LYF on 2018/9/13.
 */
(function () {
    //神器列表
    var ID = 'shenqi_list';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.lvUpPanel = me.ui.nodes.shenbing_shengji;
            me.sjUpPanel = me.ui.nodes.shenbing_jinjie;
            me.jxUpPanel = me.ui.nodes.shenbing_shenbingjuexing2;
            X.autoInitUI(me.jxUpPanel);
            me.lvUpPanel.setTouchEnabled(false);
            me.sjUpPanel.setTouchEnabled(false);
            var data = me.DATA.artifact;
            var keys = X.keysOfObject(data);
            cc.enableScrollBar(me.nodes.listview1,false);
            function setBtn(conf,sqid) {
                var list = me.nodes.list1.clone();
                X.autoInitUI(list);
                list.show();
                list.nodes.txt_name.setString(conf.name);
                list.setName(sqid);
                list.nodes.ico.setBackGroundImage("img/shenbing/" + conf.shenqiicon + ".png", 0);
                list.setTouchEnabled(true);
                me.nodes.listview1.pushBackCustomItem(list);
                G.class.ani.show({
                    json: "ani_meirishilian",
                    addTo: list.nodes.panel_dh,
                    x: list.nodes.panel_dh.width / 2,
                    y: list.nodes.panel_dh.height / 2,
                    repeat: true,
                    autoRemove: false,
                });
                me.topBtns.push(list);
            }

            var len = keys.length == 5 ? 6 : keys.length;
            if(!G.DATA.openSQTB) len = 5;
            for(var i = 0; i < len; i ++) {
                setBtn(G.class.shenqi.getComById(i + 1), i + 1);
            }

            X.radio(me.topBtns, function (sender) {
                me.topChangeType({
                    1: 1,
                    2: 2,
                    3: 3,
                    4: 4,
                    5: 5,
                    6: 6
                }[sender.getName()])
            }, {
                callback1: function (sender) {
                    sender.finds('txt_name$').setOpacity(255);
                    sender.finds("img_light$").setVisible(true);
                    sender.finds("panel_dh$").setVisible(true);
                    sender.finds("ico$").runActions(cc.sequence(cc.scaleTo(0.1, 1.1, 1.1), cc.scaleTo(0.1, 1, 1)));
                    X.enableOutline(sender.finds('txt_name$'),'#000000');
                },
                callback2: function (sender) {
                    sender.finds('txt_name$').setOpacity(255 * 0.6);
                    sender.finds("img_light$").setVisible(false);
                    sender.finds("panel_dh$").setVisible(false);
                    X.enableOutline(sender.finds('txt_name$'),'#000000');
                },
                color: ["#FFE8C0", "#FFE8C0"],
            });
            me.setDownMenu();


            me.nodes.btn_up_jj.touch(function (sender, type) {
                if(me.click_shengji){
                    return;
                }
                if (type == ccui.Widget.LONG_TOUCH) {
                    me.updata_shengji(false);
                    me.updata_sj = true;
                }
                if(type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    me.updata_shengji(true);
                    if(me.updata_sj){
                        me.updata_sj = false;
                        return;
                    }
                    me.click_shengji = false;
                    me.ajax('artifact_lvup', [me.type,'lv'], function(str, data) {
                        if (data.s == 1) {
                            me.ui.setTimeout(function () {
                                me.click_shengji = false;
                            }, 10);
                            me.DATA.artifact[me.type] =  data.d;
                            G.class.ani.show({
                                json: 'ani_shenbing_shengji',
                                addTo: me.ui.finds('shenbing'),
                                x: me.ui.finds('shenbing').width / 2,
                                y: me.ui.finds('shenbing').height / 2 + 20,
                                repeat: false,
                                autoRemove: true
                            });
                            me.downMenu.changeMenu(me.curIdx);
                        } else {
                            me.up_shengji && clearTimeout(me.up_shengji);
                            return;
                        }
                    });
                }
            }, null, {emitLongTouch: true});

            me.jxUpPanel.nodes.btn_up_jx.touch(function (sender, type) {
                if(me.click_juexing){
                    return;
                }
                if (type == ccui.Widget.LONG_TOUCH) {
                    me.updata_juexing(false);
                    me.updata_jx = true;
                }
                if(type == ccui.Widget.TOUCH_ENDED || type == ccui.Widget.TOUCH_CANCELED) {
                    me.updata_juexing(true);
                    if(me.updata_jx){
                        me.updata_jx = false;
                        return;
                    }
                    me.click_juexing = false;
                    var sqdata = me.DATA.artifact[me.type];
                    var rank = sqdata.rank|| 0;
                    var wakeRank= G.gc.shenqicom.wakerank[rank];
                    var nextWakeRank = G.gc.shenqicom.wakerank[rank + 1];
                    var curLv = sqdata.jxlv || 0;
                    var nextLv = curLv + 1;
                    var conf = G.gc.shenqicom.shenqi[me.type];
                    var wakeCon = G.gc.shenqicom.base.wake[conf.waketype];
                    var curCon = wakeCon[curLv];
                    var nextCon = wakeCon[curLv + 1];
                    if(curCon.rank != nextCon.rank && rank != nextCon.rank) {
                        G.DATA.noClick = true;
                        me.ajax("artifact_lvup", [me.type, 'rank'], function (str, data) {
                            if(data.s == 1) {
                                me.ui.setTimeout(function () {
                                    me.click_juexing = false;
                                }, 10);
                                me.DATA.artifact[me.type] =  data.d;
                                G.frame.shenqi_jxcg.data({type: me.type, curLv: curLv, rank: rank + 1}).show();
                                me.downMenu.changeMenu(me.curIdx);
                            }else {
                                me.updata_jx && clearTimeout(me.updata_jx);
                                return;
                            }
                        });
                    } else {
                        me.ajax("artifact_lvup", [me.type, 'jxlv'], function (str, data) {
                            if(data.s == 1) {
                                me.ui.setTimeout(function () {
                                    me.click_juexing = false;
                                }, 10);
                                me.DATA.artifact[me.type] =  data.d;
                                G.class.ani.show({
                                    json: 'ani_shenbing_shengji',
                                    addTo: me.ui.finds('shenbing'),
                                    x: me.ui.finds('shenbing').width / 2,
                                    y: me.ui.finds('shenbing').height / 2 + 20,
                                    repeat: false,
                                    autoRemove: true,
                                });
                                if(nextLv % 10 == 0) {
                                    me.updata_jx && clearTimeout(me.updata_jx);
                                    G.class.ani.show({
                                        json: "ani_yingxiongjinjie_1",
                                        addTo: me.ui,
                                        x: me.ui.width / 2,
                                        y: me.ui.height / 2,
                                        autoRemove: false,
                                        onload: function (node, action) {
                                            X.autoInitUI(node);
                                            me.showJxStar(node.nodes.xx1, nextLv - 9, "left");
                                            me.showJxStar(node.nodes.xx2, nextLv, "left");
                                            X.render({
                                                g1: "+" + (wakeCon[nextLv - 10].buff.atk + wakeRank.buff.atk),
                                                g2: "+" + (nextCon.buff.atk + wakeRank.buff.atk),
                                                s1: "+" + (wakeCon[nextLv - 10].buff.hp + wakeRank.buff.hp),
                                                s2: "+" + (nextCon.buff.hp + wakeRank.buff.hp),
                                                jn1: conf.keytitle[4] + "+" + (((wakeCon[nextLv - 10].shenqidpspro + wakeRank.shenqidpspro) / 10 + "%")),
                                                jn2: conf.keytitle[4] + "+" + (((nextCon.shenqidpspro + wakeRank.shenqidpspro) / 10 + "%"))
                                            }, node.nodes);
                                            action.playWithCallback("in", false, function () {
                                                node.finds("h").click(function () {
                                                    node.removeFromParent()
                                                });
                                                action.play("wait", true);
                                            });
                                            me.downMenu.changeMenu(me.curIdx);
                                        }
                                    });
                                } else {
                                    me.downMenu.changeMenu(me.curIdx);
                                }
                            } else {
                                me.updata_jx && clearTimeout(me.updata_jx);
                                return;
                            }
                        });
                    }
                }

            }, null, {emitLongTouch: true});

            me.nodes.btn_buff.click(function () {
                G.frame.help.data({
                    intr:L("TS46")
                }).show();
            });
        },
        updata_juexing: function(end){
            var me = this;
            if(end) {
                me.updata_jx && clearTimeout(me.updata_jx);
            } else {
                function timedCount_up() {
                    var sqdata = me.DATA.artifact[me.type];
                    var rank = sqdata.rank|| 0;
                    var wakeRank= G.gc.shenqicom.wakerank[rank];
                    var nextWakeRank = G.gc.shenqicom.wakerank[rank + 1];
                    var curLv = sqdata.jxlv || 0;
                    var nextLv = curLv + 1;
                    var conf = G.gc.shenqicom.shenqi[me.type];
                    var wakeCon = G.gc.shenqicom.base.wake[conf.waketype];
                    var curCon = wakeCon[curLv];
                    var nextCon = wakeCon[curLv + 1];
                    if(curCon.rank != nextCon.rank && rank != nextCon.rank) {
                        me.ajax("artifact_lvup", [me.type, 'rank'], function (str, data) {
                            if(data.s == 1) {
                                me.ui.setTimeout(function () {
                                    me.click_juexing = false;
                                }, 10);
                                me.DATA.artifact[me.type] =  data.d;
                                G.frame.shenqi_jxcg.data({type: me.type, curLv: curLv, rank: rank + 1}).show();
                                me.downMenu.changeMenu(me.curIdx);
                            }else {
                                me.updata_jx && clearTimeout(me.updata_jx);
                                return;
                            }
                        });
                    } else {
                        me.ajax("artifact_lvup", [me.type, 'jxlv'], function (str, data) {
                            if(data.s == 1) {
                                me.ui.setTimeout(function () {
                                    me.click_juexing = false;
                                }, 10);
                                me.DATA.artifact[me.type] =  data.d;
                                G.class.ani.show({
                                    json: 'ani_shenbing_shengji',
                                    addTo: me.ui.finds('shenbing'),
                                    x: me.ui.finds('shenbing').width / 2,
                                    y: me.ui.finds('shenbing').height / 2 + 20,
                                    repeat: false,
                                    autoRemove: true,
                                });
                                if(nextLv % 10 == 0) {
                                    me.updata_jx && clearTimeout(me.updata_jx);
                                    G.class.ani.show({
                                        json: "ani_yingxiongjinjie_1",
                                        addTo: me.ui,
                                        x: me.ui.width / 2,
                                        y: me.ui.height / 2,
                                        autoRemove: false,
                                        onload: function (node, action) {
                                            X.autoInitUI(node);
                                            me.showJxStar(node.nodes.xx1, nextLv - 9, "left");
                                            me.showJxStar(node.nodes.xx2, nextLv, "left");
                                            X.render({
                                                g1: "+" + (wakeCon[nextLv - 10].buff.atk + wakeRank.buff.atk),
                                                g2: "+" + (nextCon.buff.atk + wakeRank.buff.atk),
                                                s1: "+" + (wakeCon[nextLv - 10].buff.hp + wakeRank.buff.hp),
                                                s2: "+" + (nextCon.buff.hp + wakeRank.buff.hp),
                                                jn1: conf.keytitle[4] + "+" + (((wakeCon[nextLv - 10].shenqidpspro + wakeRank.shenqidpspro) / 10 + "%")),
                                                jn2: conf.keytitle[4] + "+" + (((nextCon.shenqidpspro + wakeRank.shenqidpspro) / 10 + "%"))
                                            }, node.nodes);
                                            action.playWithCallback("in", false, function () {
                                                node.finds("h").click(function () {
                                                    node.removeFromParent()
                                                });
                                                action.play("wait", true);
                                            });
                                            me.downMenu.changeMenu(me.curIdx);
                                        }
                                    });
                                } else {
                                    me.downMenu.changeMenu(me.curIdx);
                                }
                            } else {
                                me.updata_jx && clearTimeout(me.updata_jx);
                                return;
                            }
                        });
                    }
                    me.updata_jx = setTimeout(function () {
                        timedCount_up();
                    }, 400);

                }
                timedCount_up();
            }
        },
        updata_shengji: function(end) {
            var me = this;
            if(end) {
                me.up_shengji && clearTimeout(me.up_shengji);
            } else {
                function timedCount_up() {
                    me.ajax('artifact_lvup', [me.type,'lv'], function(str, data) {
                        if (data.s == 1) {
                            me.DATA.artifact[me.type] =  data.d;
                            G.class.ani.show({
                                json: 'ani_shenbing_shengji',
                                addTo: me.ui.finds('shenbing'),
                                x: me.ui.finds('shenbing').width / 2,
                                y: me.ui.finds('shenbing').height / 2 + 20,
                                repeat: false,
                                autoRemove: true
                            });
                            me.downMenu.changeMenu(me.curIdx);
                        } else {
                            me.up_shengji && clearTimeout(me.up_shengji);
                            return;
                        }
                    }, true);
                    me.up_shengji = setTimeout(function () {
                        timedCount_up();
                    }, 200);
                }
                timedCount_up();
            }
        },
        topChangeType: function(type) {
            var me = this;

            if(me.type == type) return;
            G.DATA.sqid = type - 1;
            me.type = type;

            if(me.isFrist) {
                me.setContents();
            }else {
                me.getData(function () {
                    me.setContents();
                });
            }
        },
        changeType:function(sender){
            var me = this; 
            me.curIdx = sender.data.id;
            if(me.curIdx == 1){
                me.setLvUpInfo(me.type);
            }else if(me.curIdx == 2){
                me.setSjUpInfo(me.type);
            }else {
                me.setJxUpInfo(me.type);
            }
            me.setShenqi(me.type);
            me.setSQmiaoshu(me.type);
            me.setChongZhu();
            me.setTopZy();
        },
        setTopZy:function(){
            var me = this;
            var txt_jb = me.nodes.txt_jb;
            var txt_zs = me.nodes.txt_zs;
            var btn_jia1 = me.nodes.btn_jia1;
            var token_zs = me.nodes.panel_top.finds('panel_db2').finds('token_zs');
            var token_jb = me.nodes.panel_top.finds('panel_db1').finds('token_jb');
            if(me.curIdx == 1){
                btn_jia1.show();
                txt_jb.setString(X.fmtValue(P.gud.jinbi));
                txt_zs.setString(X.fmtValue(G.class.getOwnNum(2017,'item')));
                token_zs.loadTexture(G.class.getItemIco(2017),1);
                token_jb.loadTexture(G.class.getItemIco("jinbi"), 1);
            }else if(me.curIdx == 2){
                btn_jia1.show();
                txt_jb.setString(X.fmtValue(P.gud.jinbi));
                txt_zs.setString(X.fmtValue(G.class.getOwnNum(2018,'item')));
                token_zs.loadTexture(G.class.getItemIco(2018),1);
                token_jb.loadTexture(G.class.getItemIco("jinbi"), 1);
            } else {
                var conf = G.gc.shenqicom.shenqi[me.type];
                txt_jb.setString(X.fmtValue(G.class.getOwnNum(conf.needitem,'item')));
                txt_zs.setString(X.fmtValue(G.class.getOwnNum(2033,'item')));
                token_zs.loadTexture(G.class.getItemIco(2033),1);
                token_jb.loadTexture(G.class.getItemIco(conf.needitem), 1);
                btn_jia1.hide();
            }

            btn_jia1.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.dianjin.show();
                    G.frame.dianjin.once("hide", function() {
                        txt_jb.setString(P.gud.jinbi);

                        me.downMenu.changeMenu(me.curIdx);
                    });
                }
            });
        },
        setLvUpInfo:function(type){
            var me = this;
            me.lvUpPanel.show();
            me.sjUpPanel.hide();
            me.jxUpPanel.hide();
            var panel = me.lvUpPanel;
            X.autoInitUI(panel);
            var jbneed = panel.nodes.txt_xh1;
            var jtneed = panel.nodes.txt_xh2;
            var btn_lvup = panel.nodes.btn_up_jj;
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var upneed = G.class.shenqi.getUpLvNeedByLv(data.lv, conf.lvuptype);
            var sqbuff = G.class.shenqi.getBuffByIdAndLv(type,data.lv).buff;

            btn_lvup.setTitleText(L("SHENGJI"));
            btn_lvup.setTitleColor(cc.color("#2f5719"));

            if(data.lv >= conf.maxlv + me.getAddLv()) {
                btn_lvup.hide();
                jbneed.hide();
                jtneed.hide();
                panel.finds("bg_xinxi1").hide();
                panel.finds("bg_xinxi1_0").hide();
                panel.finds("token_jb").hide();
                panel.finds("token_jy").hide();
                panel.finds("txt_dj$_0_0").hide();
                panel.nodes.panel_jnwp.hide();
            }else {
                btn_lvup.show();
                jbneed.show();
                jtneed.show();
                panel.finds("bg_xinxi1").show();
                panel.finds("bg_xinxi1_0").show();
                panel.finds("token_jb").show();
                panel.finds("token_jy").show();
                panel.finds("txt_dj$_0_0").show();
                panel.nodes.panel_jnwp.show();
            }

            panel.finds("token_jy").loadTexture(G.class.getItemIco(upneed[1].t), 1);
            setTextWithColor(jbneed,X.fmtValue(P.gud.jinbi) + '/' + X.fmtValue(upneed[0].n),P.gud.jinbi < upneed[0].n ? '#ff4e4e' : '#ffffff');
            setTextWithColor(jtneed,X.fmtValue(G.class.getOwnNum(upneed[1].t,upneed[1].a)) + '/' + X.fmtValue(upneed[1].n),G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n ? '#ff4e4e' : '#ffffff');
            if(P.gud.jinbi < upneed[0].n){
                X.enableOutline(jbneed,'#740000');
            }else{
                X.enableOutline(jbneed,'#000000');
            }
            if(G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n){
                X.enableOutline(jtneed,'#740000');
            }else{
                X.enableOutline(jtneed,'#000000');
            }
            X.alignItems(panel.nodes.panel_jnwp, upneed, 'left', {
                touch: true,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    }
                }
            });
            me.nodes.txt_gj.setString(X.STR(L('SHENQI_atk'),sqbuff.atk));
            me.nodes.txt_xl.setString(X.STR(L('SHENQI_hp'),sqbuff.hp));
        },
        setLvupSx:function(sqbuff){
            var me = this;
            var panel = me.lvUpPanel;
            var xinxi_neirong = panel.finds('xinxi_neirong');
            var pos = [cc.p(40,80),cc.p(40,30),cc.p(310,30)];
            var str = [];
            str.push(L('SHENQI_JBJC'));
            str.push(X.STR(L('SHENQI_atk'),sqbuff.atk));
            str.push(X.STR(L('SHENQI_hp'),sqbuff.hp));
            xinxi_neirong.removeAllChildren();
            for(var i = 0; i<pos.length; i++){
                var lay = new ccui.Layout();
                lay.setContentSize(cc.size(570,50));
                lay.setPosition(pos[i]);
                me.createSxRh(str[i],lay);
                xinxi_neirong.addChild(lay);
            }
        },
        createSxRh:function(str,lay,color){
            var rh = new X.bRichText({
                size: 24,
                maxWidth: lay.width,
                lineHeight: 36,
                family: G.defaultFNT,
                color: '#804326'
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0);
            rh.setPosition(0, (lay.height - rh.height) / 2);
            lay.removeAllChildren();
            lay.addChild(rh);
        },
        showJxStar: function(parent, lv, type, scale) {
            var starArr = [];
            var perArr = [];
            var imgType = 0;
            var starBg = "img/shenbing/bg_xingxing.png";
            var starImg = "";

            if(lv <= 100) imgType = 1;
            else if(lv <= 200) imgType = 2;
            else if(lv <= 300) imgType = 3;
            else if(lv <= 400) imgType = 4;
            else imgType = 5;
            starImg = "img/shenbing/xingxing_" + imgType + ".png";
            if(lv == 0) perArr.push(0);
            else {
                var curLv = lv - (imgType - 1) * 100;
                var num = parseInt(curLv / 20);
                for (var i = 0; i < num; i ++)  perArr.push(1);
                if(parseInt(curLv / 20) < curLv / 20) {
                    if(curLv / 20 - parseInt(curLv / 20) < 0.5) perArr.push(0);
                    else perArr.push(0.5);
                }
            }

            for (var i = 0; i < 5; i ++) {
                var per = perArr[i] || 0;
                var bg = new ccui.ImageView(starBg, 1);
                var starPer = new ccui.LoadingBar();
                starPer.setAnchorPoint(0.5, 0.5);
                starPer.setPosition(bg.width / 2, bg.height / 2);
                starPer.loadTexture(starImg, 1);
                starPer.setDirection(ccui.LoadingBar.TYPE_LEFT);
                starPer.setPercent(per * 100);
                bg.addChild(starPer);
                starArr.push(bg);
            }
            if(type == "left") X.left(parent, starArr, 1, 5);
            else X.center(starArr, parent, {
                scale: scale || 1
            });
        },
        setJxUpInfo: function(type) {
            var me = this;

            me.lvUpPanel.hide();
            me.sjUpPanel.hide();
            me.jxUpPanel.show();
            var data = me.DATA.artifact[type];
            var sqlv = data.lv;

            //读取配置觉醒rank
            var rank = data.rank|| 0;
            var wakeRank= G.gc.shenqicom.wakerank[rank];
            var nextWakeRank = G.gc.shenqicom.wakerank[rank + 1];

            var curLv = data.jxlv || 0;
            var nextLv = curLv + 1;
            var conf = G.gc.shenqicom.shenqi[type];
            var wakeCon = G.gc.shenqicom.base.wake[conf.waketype];
            var maxLv = X.keysOfObject(wakeCon).length - 1;
            var curCon = wakeCon[curLv];
            var nextCon = wakeCon[curLv + 1];
            var btn = me.jxUpPanel.nodes.btn_up_jx;
            var needTxt = me.jxUpPanel.nodes.txt_djcz;

            if(!G.DATA.openSQJX) btn.hide();

            //在原先的基础上加上wakerank的值
            var all_atk = wakeRank.buff.atk + curCon.buff.atk;
            var all_hp = wakeRank.buff.hp + curCon.buff.hp;
            var all_pvpdpspro = wakeRank.buff.pvpdpspro + curCon.buff.pvpdpspro;
            var all_pvpundpspro = wakeRank.buff.pvpundpspro +  curCon.buff.pvpundpspro;
            var all_shenqidpspro = wakeRank.shenqidpspro + curCon.shenqidpspro;


            X.render({
                panel_xx1: function (node) {
                    if(curLv < maxLv && rank == nextCon.rank && curLv != 0 && curLv % 100 == 0) {
                        me.showJxStar(node, nextLv, "left");
                    }else {
                        me.showJxStar(node, curLv, "left");
                    }
                },
                txt_sx1: function (node) {
                    me.setStr(conf.keytitle[0] + "+" + all_atk, node.finds("wz_shuxingzhi$"));
                },
                txt_sx2: function (node) {
                    me.setStr(conf.keytitle[1] + "+" + all_hp, node.finds("wz_shuxingzhi$"));
                },
                txt_sx3: function (node) {
                    me.setStr(conf.keytitle[2] + "+" + (all_pvpdpspro / 10 + "%"), node.finds("wz_shuxingzhi$"));
                },
                txt_sx4: function (node) {
                    me.setStr(conf.keytitle[3] + "+" + (all_pvpundpspro / 10 + "%"), node.finds("wz_shuxingzhi$"));
                },
                txt_sx5: function (node) {
                    me.setStr(conf.keytitle[4] + "+" + (all_shenqidpspro / 10 + "%"), node.finds("wz_shuxingzhi$"));
                },
            }, me.jxUpPanel.nodes);
            if(curLv < maxLv) {
                me.jxUpPanel.nodes.neirong_xiaohao.show();
                me.jxUpPanel.nodes.wz_xx.setString(curLv % 10 + "/" + 10);
                var per = me.jxUpPanel.nodes.jdt_xxjd.getPercent();
                var curPer = curLv % 10 / 10 * 100;
                me.jxUpPanel.nodes.jdt_xxjd.setPercent(curPer);

                needTxt.hide();
                if(curCon.rank == nextCon.rank || (curCon.rank != nextCon.rank && rank == nextCon.rank)) {
                    btn.setEnableState(true);
                    btn.setTitleColor(cc.color(G.gc.COLOR.n13));
                    btn.setTitleText(L("PEIYANG"));
                    me.jxUpPanel.nodes.panel_jxp2.hide();
                    me.jxUpPanel.nodes.panel_jxp1.show();
                    var needArr = [].concat({a: "item", t: conf.needitem, n: nextCon.itemnum}, nextCon.need[0]);
                    X.alignItems(me.jxUpPanel.finds("img_xh"), needArr, "left", {
                        touch: true,
                        mapItem: function (node) {
                            if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                                node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                            }
                        }
                    });
                } else {
                    me.jxUpPanel.nodes.panel_jxp2.show();
                    me.jxUpPanel.nodes.panel_jxp1.hide();
                    btn.setTitleText(L("JUEXING"));
                    var needLv = G.gc.shenqicom.wakerank[rank + 1];
                    if(sqlv < needLv.lv) {
                        btn.setEnableState(false);
                        btn.setTitleColor(cc.color(G.gc.COLOR.n15));
                        needTxt.show();
                        needTxt.setString(X.STR(L("NEEDSQLV"), needLv.lv));
                    } else {
                        btn.setEnableState(true);
                        btn.setTitleColor(cc.color(G.gc.COLOR.n13));
                    }
                    var needArr = [].concat({a: "item", t: conf.needitem, n: nextWakeRank.itemnum}, nextWakeRank.need[0]);
                    X.alignItems(me.jxUpPanel.finds("img_xh"), needArr, "left", {
                        touch: true,
                        mapItem: function (node) {
                            if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                                node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                            }
                        }
                    });
                }
            } else {
                me.jxUpPanel.nodes.neirong_xiaohao.hide();
                me.jxUpPanel.nodes.wz_xx.setString(L("YMJ"));
                me.jxUpPanel.nodes.jdt_xxjd.setPercent(100);
            }
        },
        setStr: function(str, parent) {
            X.setRichText({
                str: str,
                parent: parent,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: parent.height / 2},
                size: 17
            });
        },
        setSqStar: function() {

        },
        setSjUpInfo:function(type){
            var me = this;
            me.lvUpPanel.hide();
            me.sjUpPanel.show();
            me.jxUpPanel.hide();
            var panel = me.sjUpPanel;
            X.autoInitUI(panel);
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var skillconf = G.class.shenqi.getSkillByIdAndDj(type,data.djlv);
            var upneed = G.class.shenqi.getUpDjNeedByDj(data.djlv > conf.maxdengjie - 1 ? conf.maxdengjie - 1 : data.djlv, conf.lvuptype);
            var skillname = panel.nodes.txt_dj;
            var skillico = panel.nodes.ico_jn;
            var skillintr = panel.nodes.txt_jnm;
            var jbneed = panel.nodes.txt_xh1;
            var jtneed = panel.nodes.txt_xh2;
            var btn_sjup = panel.nodes.btn_up;

            if(data.djlv >= conf.maxdengjie) {
                btn_sjup.hide();
                jbneed.hide();
                jtneed.hide();
                panel.finds("bg_xinxi1").hide();
                panel.finds("bg_xinxi1_0").hide();
                panel.finds("token_jb").hide();
                panel.finds("token_jt").hide();
                panel.nodes.txt_huizi.hide();
                panel.nodes.panel_sjwp.hide();
                panel.nodes.txt_sjsxxh.hide();
            }else {
                btn_sjup.show();
                jbneed.show();
                jtneed.show();
                panel.finds("bg_xinxi1").show();
                panel.finds("bg_xinxi1_0").show();
                panel.finds("token_jb").show();
                panel.finds("token_jt").show();
                me.nodes.txt_huizi.show();
                panel.nodes.panel_sjwp.show();
                panel.nodes.txt_sjsxxh.show();
            }

            X.alignItems(panel.nodes.panel_sjwp, upneed, 'left', {
                touch: true,
                mapItem: function (node) {
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    }
                }
            });

            panel.finds("token_jt").loadTexture(G.class.getItemIco(upneed[1].t), 1);
            skillname.setString(skillconf.skillname + '+' + data.djlv);
            skillico.setBackGroundImage('ico/skillico/' + skillconf.skillico + '.png',0);
            skillintr.setFontSize(18);
            var inter = "";
            var interArr = skillconf.intr.split("$");

            if(!data.rank) {
                for (var i in interArr) {
                    inter += interArr[i];
                }
            } else {
                var wakeRank = G.gc.shenqicom.wakerank[data.rank];
                var addPro = G.class.shenqi.getSqJxDps(type, data.jxlv);
                var val = "(+" + parseInt(parseInt(interArr[1]) * ((addPro + wakeRank.shenqidpspro) / 1000)) + ")";
                interArr[1] += val;
                for (var i in interArr) {
                    inter += interArr[i];
                }
            }
            skillintr.setString(inter);
            setTextWithColor(jbneed,X.fmtValue(P.gud.jinbi) + '/' + X.fmtValue(upneed[0].n),P.gud.jinbi < upneed[0].n ? '#ff4e4e' : '#ffffff');
            setTextWithColor(jtneed,X.fmtValue(G.class.getOwnNum(upneed[1].t,upneed[1].a)) + '/' + X.fmtValue(upneed[1].n),G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n ? '#ff4e4e' : '#ffffff');
            if(P.gud.jinbi < upneed[0].n){
                X.enableOutline(jbneed,'#680000');
            }else{
                X.enableOutline(jbneed,'#000000');
            }
            if(G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n){
                X.enableOutline(jtneed,'#680000');
            }else{
                X.enableOutline(jtneed,'#000000');
            }
            var step = (data.djlv + 1) * 5;
            if(data.lv < step){
                // me.nodes.txt_huizi.show();
                me.nodes.txt_huizi.setString(X.STR(L('SHENQI_XXJ'),step));
                me.nodes.txt_huizi.setTextColor(cc.color("#6c6c6c"));
                btn_sjup.setBright(false);
                btn_sjup.setTouchEnabled(false);
            }else{
                me.nodes.txt_huizi.setString(L("SHENGJI"));
                me.nodes.txt_huizi.setTextColor(cc.color("#2f5719"));
                btn_sjup.setBright(true);
                btn_sjup.setTouchEnabled(true);
            }

            btn_sjup.click(function(sender, type) {
                G.ajax.send('artifact_lvup', [me.type,'djlv'], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.class.ani.show({
                            json: 'ani_shenbing_jinjie',
                            addTo: me.ui.finds('shenbing'),
                            x: me.ui.finds('shenbing').width / 2,
                            y: me.ui.finds('shenbing').height / 2 + 20,
                            repeat: false,
                            autoRemove: true
                        });
                        me.getData(function () {
                            me.downMenu.changeMenu(me.curIdx);
                            me.setGmUiVisible();
                        });
                    }
                });
            }, 200);
        },
        //设置神器技能描述(时间紧，数值都是程序算的)
        setSQmiaoshu:function(type){
            var me = this;
            var data = me.DATA.artifact[type];
            var lay1 = me.ui.nodes.neirong1;
            var lay2 = me.ui.nodes.neirong2;
            var bg = me.ui.finds('shenbing_miaoshu').finds('bg2');
            bg.height = 170;
            bg.width = 230;
            bg.setAnchorPoint(0.5, 1);
            bg.x = bg.width / 2;
            lay1.x = bg.width / 2;
            lay2.x = bg.width / 2;
            me.ui.finds('shenbing_miaoshu').x = 0;
            var rh = new X.bRichText({
                size: 18,
                maxWidth: bg.width,
                lineHeight: 20,
                family: G.defaultFNT,
                color: '#fbc647'
            });
            rh.text(L('SHENQI_JNJC_NAME'));
            rh.setAnchorPoint(0.5, 0);
            rh.setPosition(0, (lay1.height - rh.height) / 2);
            lay1.removeAllChildren();
            lay1.addChild(rh);

            var rh1 = new X.bRichText({
                size: 18,
                maxWidth: bg.width,
                lineHeight: 20,
                family: G.defaultFNT,
            });
            var str1 = '';
            var skillbuff = G.class.shenqi.getComById(type).skillbuff;
            for(var i in skillbuff){
                var skillbuff_name = X.keysOfObject(skillbuff[i]);
                // var shenqi_killbuff = i <= data.djlv ? L('SHENQI_KILLBUFF1') : L('SHENQI_KILLBUFF1_H');
                var shenqi_jndj = i <= data.djlv ? L('SHENQI_JNDJ1') : L('SHENQI_JNDJ1_H');

                if(skillbuff_name == "speed"){
                    str_buff = X.STR(shenqi_jndj, '+'+i, L(skillbuff_name), skillbuff[i][skillbuff_name]);
                    str_kongge = "";
                }else{
                    str_buff =  X.STR(shenqi_jndj, i < 10 ? ('  +'+i) : '+'+i , L(skillbuff_name), (skillbuff[i][skillbuff_name] / 10) + '%');
                    str_kongge = "";
                }
                str1 += "<br>  " + str_buff;
                // str1 += str_kongge;
            }
            rh1.text(str1);
            rh1.setAnchorPoint(0.5, 0);
            rh1.setPosition(10, (lay2.height - rh1.height) / 2 + 5);
            lay2.removeAllChildren();
            lay2.addChild(rh1);
        },
        setShenqi:function(type){
            var me = this;
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var panel = me.nodes.panel_top.finds('shenbing');
            var btn_wz = me.nodes.btn_wz;
            var wz = btn_wz.getChildren()[0];
            wz.setTouchEnabled(false);
            // var shenqi_img = me.nodes.shenbing;
            var shenqilv = me.nodes.wz_dj;
            shenqilv.setString(L('dengji') + ' ' +  data.lv);
            // shenqi_img.setBackGroundImage('img/shenbing/shenbing_wq_0' + type + '.png',0);
            var str = '<font color=#ffe983>' + conf.name + '</font>' + '<font color=#ffb47d>+' + data.djlv + '</font>';        
            me.createRh(str,wz);

            me.sqlv = conf.maxlv;
            me.sqdjlv = conf.maxdengjie;
            me.jxlv = conf.maxjx;

            if(me.sqid != type) {
                me.nodes.shenbing.removeAllChildren();
                G.class.ani.show({
                    json: "shenbing_0" + type,
                    addTo: me.nodes.shenbing,
                    x: me.nodes.shenbing.width / 2,
                    y: me.nodes.shenbing.height / 2 - 50,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        var act1 = cc.moveBy(1, 0, 10);
                        var act2 = cc.moveBy(1, 0, -10);
                        var act = cc.sequence(act1, act2);
                        node.runAction(act.repeatForever());
                    }
                });
            }
            me.sqid = type;

            me.setSqStar();
        },
        setJH: function () {
            var me = this;
            var type = me.type;
            var conf = G.class.shenqi.getComById(type);
            me.nodes.shenbing_jihuo2.show();
            me.sqid = type;
            me.sqlv = conf.maxlv;
            me.sqdjlv = conf.maxdengjie;
            me.jxlv = conf.maxjx;
            me.nodes.xingxingx.removeAllChildren();
            me.nodes.shenbing.removeAllChildren();
            G.class.ani.show({
                json: "shenbing_0" + type,
                addTo: me.nodes.shenbing,
                x: me.nodes.shenbing.width / 2,
                y: me.nodes.shenbing.height / 2 - 50,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    var act1 = cc.moveBy(1, 0, 10);
                    var act2 = cc.moveBy(1, 0, -10);
                    var act = cc.sequence(act1, act2);
                    node.runAction(act.repeatForever());
                }
            });

            var btn_wz = me.nodes.btn_wz;
            var wz = btn_wz.getChildren()[0];
            var shenqilv = me.nodes.wz_dj;
            shenqilv.setString("");
            var str = '<font color=#ffe983>' + conf.name + '</font>';
            me.createRh(str,wz);
            var skillconf = G.class.shenqi.getSkillByIdAndDj(type, 0);
            var lay1 = me.ui.nodes.neirong1;
            var lay2 = me.ui.nodes.neirong2;
            var bg = me.ui.finds('shenbing_miaoshu').finds('bg2');
            bg.height = 170;
            bg.width = 230;
            bg.setAnchorPoint(0.5, 1);
            bg.x = bg.width / 2;
            lay1.x = bg.width / 2;
            lay2.x = bg.width / 2;
            me.ui.finds('shenbing_miaoshu').x = 0;

            var img = new ccui.ImageView('ico/skillico/' + skillconf.skillico + '.png',0);
            img.setScale(.45);
            img.setAnchorPoint(0.5, 0.5);
            var str1 = "<font node=1></font>  " + skillconf.skillname;
            X.setRichText({
                str: str1,
                parent: lay1,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: 0, y: lay1.height / 2 - 10},
                node: img,
                color: '#fbc647'
            });

            lay2.removeAllChildren();
            var intr = "";
            var intrArr = skillconf.intr.split("$");
            for (var i in intrArr) {
                intr += intrArr[i];
            }
            var rh = X.setRichText({
                str: intr,
                parent: lay2,
                anchor: {x: 0.5, y: 0},
                pos: {x: 0, y: 0},
                color: '#fbc647',
                maxWidth: 210
            });
            if(rh.height > lay2.height) {
                var bg = me.ui.finds('shenbing_miaoshu').finds('bg2');
                bg.height += rh.height - lay2.height;
                rh.y -= rh.height - lay2.height + 5;
            }

            var wakeCon = G.gc.shenqicom.base.actneed[type][0];
            X.alignItems(me.nodes.ico_suipian, [{a: "item", t: conf.needitem, n: wakeCon.n}], "center", {
                touch: true,
                mapItem: function (node) {
                    node.num.setString(G.class.getOwnNum(node.data.t, node.data.a) + "/" + node.data.n);
                    if(G.class.getOwnNum(node.data.t, node.data.a) < node.data.n) {
                        node.num.setTextColor(cc.color(G.gc.COLOR.n16));
                    }
                }
            });

            if(G.class.getOwnNum(conf.needitem, "item") < wakeCon.itemnum) {
                me.nodes.btn_up.setEnableState(false);
                me.nodes.txt_sj1.setTextColor(cc.color(G.gc.COLOR.n15));
            }

            me.nodes.btn_up.click(function () {

                me.ajax("artifact_act", [me.type], function (str, data) {
                    if(data.s == 1) {
                        me.getData(function () {
                            me.setContents();
                        });
                    }
                });
            });
        },
        createRh:function(str,lay,color){
            var rh = new X.bRichText({
                size: 24,
                maxWidth: lay.width,
                lineHeight: 32,
                family: G.defaultFNT,
                eachText: function(node){
                    X.enableOutline(node,'#000000');
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0);
            rh.setPosition((lay.width - rh.width) / 2, (lay.height - rh.height) / 2);
            lay.removeAllChildren();
            lay.addChild(rh);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.shenbing.click(function(){
                G.frame.shenqi_xq.data({
                    id: me.sqid,
                    jh: true,
                    lv: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) && G.DATA.openSQJX ? 153 : me.sqlv,
                    djlv: me.sqdjlv,
                    jxlv: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) ? 500 : 0,
                    rank: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) ? 5 : 0
                }).show();
            });

            me.nodes.btn_wz.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_ENDED){
                    G.frame.shenqi_xq.data({
                        id: me.sqid,
                        jh: true,
                        lv: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) && G.DATA.openSQJX ? 153 : me.sqlv,
                        djlv: me.sqdjlv,
                        jxlv: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) ? 500 : 0,
                        rank: (me.DATA.artifact[me.type] && me.DATA.artifact[me.type].lv >= 50) ? 5 : 0
                    }).show();
                }
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.topBtns = [];
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.nodes.btn_jia2.hide();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('artifact_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    G.DATA.shenqi = d.d;
                    G.DATA.artifact = d.d.artifact;
                    callback && callback();
                }
            }, true);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.isFrist = true;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            X.autoInitUI(me.nodes.shenbing_shenbingjuexing2);
            me.topBtns[G.DATA.sqid || 0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.setGmUiVisible();
        },
        onHide: function () {
            var me = this;
        },
        setDownMenu:function(){
            var me = this;
            me.nodes.list.hide();
            var view = me.nodes.down_shengjijinjie;
            X.autoInitUI(view);
            me.downMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('shenqi'))
            },view);
        },
        setChongZhu:function(){
            var me = this;
            var btn_czsq = me.ui.finds('btn_czsq');
            var data = me.DATA.artifact[me.type];
            if(data.lv > 1){
                btn_czsq.show();
            }else{
                btn_czsq.hide();
            }
            if(data.lv >= 50 && G.DATA.openSQJX) {
                me.nodes.listview.children[2].show();
            } else {
                me.nodes.listview.children[2].hide();
            }
            var chongzhu = function(){
                G.ajax.send('artifact_recast', [me.type], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        me.DATA.artifact[me.type] = d.d.artifact[me.type];
                        me.downMenu.changeMenu(me.curIdx == 3 ? 1 : me.curIdx);
                        if(d.d.prize) {
                            G.frame.jiangli.data({
                                prize: d.d.prize
                            }).show();
                        }
                        me.setGmUiVisible();
                    }
                });
            };
            btn_czsq.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var str = L('SHENQICHONGZHU');
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function() {
                            chongzhu();
                        },
                        richText: str
                    }).show();
                }
            });
        },
        setContents: function () {
            var me = this;
            if(!me.DATA.artifact[me.type]) {
                me.nodes.down_jihuo.show();
                me.nodes.down_shengjijinjie.hide();
                me.setJH();
            } else {
                me.nodes.down_jihuo.hide();
                me.nodes.down_shengjijinjie.show();
                me.downMenu.changeMenu(1);
            }
        },
        setGmUiVisible: function () {
            var me = this;
            me.nodes.panel_hhs.setVisible(me.checkGm());

            var rh = X.setRichText({
                parent: me.nodes.txt_hhs,
                str: "<font color=#fecb00>" + L("SQGM") + "</font>" + L("SQDJSXZJ") + me.getAddLv(),
                color: "#f6ebcd",
            });
            rh.setPosition(0, me.nodes.txt_hhs.height / 2 - rh.trueHeight() / 2);
        },
        checkGm: function () {
            var me = this;

            return me.DATA.isresonance == 1;
        },
        getAddLv: function () {
            var me = this;

            if (!me.checkGm()) return 0;

            var allLv = 0;
            for (var i in me.DATA.artifact) {
                allLv += me.DATA.artifact[i].djlv || 0;
            }

            if (allLv - 48 <= 0) return 0;
            return parseInt((allLv - 48) / 4);
        }
    });
    G.frame[ID] = new fun('shenbing3.json', ID);
})();