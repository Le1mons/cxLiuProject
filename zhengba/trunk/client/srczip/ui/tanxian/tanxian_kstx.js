/**
 * Created by wfq on 2018/5/29.
 */
(function () {
    //探险-快速探险
    var ID = 'tanxian_kstx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_qianwang.click(function () {
                G.frame.chongzhi.data({type:3}).show();
            });
            me.nodes.btn_kstx.click(function () {
                me.clickChange();
            });
            me.nodes.btn_gm.click(function () {
                me.clickChange();
            });
            me.nodes.bg_top.setTouchEnabled(true);
        },
        clickChange:function(){
            var me = this;
            var dq_jifen = P.gud.jifen;
            G.ajax.send('tanxian_fasttx',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    G.event.emit("sdkevent", {
                        event: "tanxian_fasttx"
                    });
                    G.frame.tanxian.checkRedPoint();
                    G.frame.tanxian.getData();
                    G.view.mainView.getMainCityEvent();
                    G.class.ani.show({
                        json: "ani_kuaisutiaozhan",
                        addTo: G.frame.tanxian.ui,
                        repeat: false,
                        autoRemove: true,
                        onload: function(node, action){
                            X.audio.playEffect("sound/kuaisu.mp3", false);
                            G.DATA.tanxianAni = true;
                        },
                        onend: function (node, action) {
                            G.frame.tanxian_hdjl.data({
                                time: 7200,
                                prize: d.d.prize,
                            }).show();
                            G.DATA.tanxianAni = false;
                            G.event.emit("aniEnd");
                            for(var jf in d.d.prize){
                                if(d.d.prize[jf].t == 'jifen'){
                                    G.frame.tanxian.yuan_jdl(dq_jifen,d.d.prize[jf].n);
                                    continue;
                                }
                            }
                        }
                    });

                    me.remove();
                }
            },true)
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.list = new ccui.Layout();
            me.list.setContentSize(100,100);
            me.ui.addChild(me.list);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var data = G.frame.tanxian.DATA;
            // me.setContents();
            me.showInfo();
            if((data.maxbuytxnum - data.txnum) < 1 && !data.isadventure){
                G.frame.alert.data({
                    title: L("GM"),
                    cancelCall: null,
                    okCall: function () {
                        G.frame.chongzhi.data({type: 3}).once('willClose', function () {
                            G.frame.tanxian.getData();
                        }).show();
                        me.remove();
                    },
                    richText: L("GMTXTQ"),
                    sizeType: 3
                }).show();
            }
        },
        onHide: function () {
            var me = this;
        },
        showInfo:function(){
            var me = this;
            var conf = G.gc.tanxian[P.gud.mapid];
            var fasttxprize = G.frame.tanxian.DATA['2h'];
            //两小时收益
            var itemarr = [];
            for(var i = 0; i < X.keysOfObject(fasttxprize).length; i++){
                var icoid = X.keysOfObject(fasttxprize)[i];
                var item = me.nodes.list_sy.clone();
                X.autoInitUI(item);
                item.show();
                item.nodes.img_sy.loadTexture(G.class.getItemIco(icoid),1);
                item.nodes.text_sy.setString(X.fmtValue(fasttxprize[icoid]));
                itemarr.push(item);
            }
            X.left(me.nodes.panel_sy,itemarr,1,-15,0);
            //关卡掉落,把奖励合并起来
            var prize = [];
            for (var i = 0; i < conf.randgroup.length; i++) {
                var rand = conf.randgroup[i];
                prize = prize.concat(G.class.diaoluo.getById(rand));
            }
            // var prizeobj = {};
            // for(var j = 0; j < conf.randgroup.length; j++){
            //     for(var k in G.gc.diaoluo[conf.randgroup[j]]){
            //         var prize = G.gc.diaoluo[conf.randgroup[j]][k];
            //         if(prize.n > 0){
            //             if(!prizeobj[prize.t + prize.a]){
            //                 prizeobj[prize.t + prize.a] = prize;
            //             }else {
            //
            //                 prizeobj[prize.t + prize.a].n += prize.n;
            //             }
            //         }
            //     }
            // }
            // var prizearr = [];
            // for(var k in prizeobj){
            //     prizearr.push(prizeobj[k]);
            // }
            var data = prize;
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.list, 5, function (ui, data) {
                    me.setItem(ui, data);
                },null,null);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

            var data = G.frame.tanxian.DATA;
            var need = G.class.tanxian.getKstxNeed(data.txnum);
            if (data.freetxnum > 0) {
                me.nodes.btn_gm.hide();
                me.nodes.btn_kstx.show();
                var str = L('FREENUM') + data.freetxnum;
                var rh = X.setRichText({
                    parent:me.nodes.txt_mfcs,
                    str:str
                });
                rh.setAnchorPoint(0.5,0);
                rh.x = me.nodes.txt_mfcs.width / 2;
            } else {
                me.nodes.btn_gm.show();
                me.nodes.btn_kstx.hide();
                me.nodes.img_zs.loadTexture(G.class.getItemIco(need[0].t));
                me.nodes.text_sl.setString(need[0].n);
                var str = L('LEFTNUM') + (data.maxbuytxnum - data.txnum);
                var rh = X.setRichText({
                    parent:me.nodes.txt_gmcs,
                    str:str
                });
                rh.setAnchorPoint(0.5,0);
                rh.x = me.nodes.txt_gmcs.width / 2;
            }
            //特权状态
            if (data.tqpasstime > G.time) {
                me.nodes.btn_qianwang.hide();
                X.timePanel(me.nodes.txt_tqjh,data.tqpasstime,18,'center',function () {
                    G.frame.tanxian.getData(function () {
                        me.showInfo();
                    })
                },{
                    desc:' '
                });
            }else {
                me.nodes.btn_qianwang.show();
                var str = L("WJH");
                var rh = X.setRichText({
                    parent:me.nodes.txt_tqjh,
                    str:str
                })
            }

            me.ui.setTimeout(function(){
                G.guidevent.emit('tanxian_kstx_showover');
            },500);
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.removeAllChildren();
            ui.setTouchEnabled(false);
            var prize = G.class.sitem(data,true);
            prize.setScale(0.88);
            G.frame.iteminfo.showItemInfo(prize);
            prize.setPosition(0,0);
            prize.setAnchorPoint(0,0);
            prize.setSwallowTouches(false);
            prize.num.hide();
            prize.title.hide();
            ui.addChild(prize);
        },
        setContents: function () {
            var me = this;

            var data = G.frame.tanxian.DATA;

            var panel = me.ui;
            var txtName = panel.nodes.txt_title;
            var layMf = panel.nodes.txt_nr;
            var layZs = panel.nodes.txt_nr1;
            var panelBtn = panel.nodes.panel_btn;

            panelBtn.removeAllChildren();
            panelBtn.removeBackGroundImage();
            layMf.removeAllChildren();
            layZs.removeAllChildren();

            //名称
            txtName.setString(L('UI_TITLE_' + me.ID()));

            // 消耗
            var str1 = '';
            if (data.freetxnum > 0) {
                str1 = L('TANXIAN_KSTX_1')  + '<br><br>' + X.STR(L('TANXIAN_KSTX_2'),data.freetxnum);

            } else {
                var need = G.class.tanxian.getKstxNeed(data.txnum);
                str1 = L('TANXIAN_KSTX_1')  + '<br>' + X.STR(L('TANXIAN_KSTX_3'),data.maxbuytxnum - data.txnum,need[0].n,P.gud.rmbmoney);
            }
            var rh1 = new X.bRichText({
                size:18,
                maxWidth:layMf.width,
                lineHeight:30,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT
            });
            rh1.text(str1);
            rh1.setAnchorPoint(0,1);
            rh1.setPosition(cc.p(0,layMf.height - 5));
            layMf.addChild(rh1);

            //特权
            var str2 = X.STR(L('TANXIAN_KSTX_4'), data.zchuodong ? 13 : 8);
            var tq = "<br>" + (data.isadventure ? X.STR(L("TQYJH"), parseInt((data.tqpasstime - G.time) / (24 * 3600))) : L("TQZTWJH"));
            str2 += tq;
            var rh2 = new X.bRichText({
                size:18,
                maxWidth:layZs.width,
                lineHeight:30,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT
            });
            rh2.text(str2);
            rh2.setAnchorPoint(0,1);
            rh2.setPosition(cc.p(0,layZs.height - 20));
            layZs.addChild(rh2);

            var btn = me.nodes.btn_kstx = new ccui.Button();
            var img = 'img/public/btn/btn1_on.png';
            btn.loadTextures(img,'','',1);
            btn.setTitleText(L('BTN_KSTX'));
            btn.setTitleFontSize(24);
            btn.setTitleFontName(G.defaultFNT);
            btn.setTitleColor(cc.color(G.gc.COLOR.n13));


            btn.setPosition(cc.p(panelBtn.width / 2,panelBtn.height / 2));
            panelBtn.addChild(btn);

            btn.click(function () {
                var dq_jifen = P.gud.jifen;
                G.ajax.send('tanxian_fasttx',[],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        G.event.emit("sdkevent", {
                            event: "tanxian_fasttx"
                        });
                        G.frame.tanxian.checkRedPoint();
                        G.frame.tanxian.getData(function () {
                            G.class.ani.show({
                                json: "ani_kuaisutiaozhan",
                                addTo: G.frame.tanxian.ui,
                                repeat: false,
                                autoRemove: true,
                                onload: function(node, action){
                                    X.audio.playEffect("sound/kuaisu.mp3", false);
                                    G.DATA.tanxianAni = true;
                                },
                                onend: function (node, action) {
                                    G.frame.tanxian_hdjl.data({
                                        time: 7200,
                                        prize: d.d.prize,
                                    }).show();
                                    G.DATA.tanxianAni = false;
                                    G.event.emit("aniEnd");
                                    for(var jf in d.d.prize){
                                        if(d.d.prize[jf].t == 'jifen'){
                                            G.frame.tanxian.yuan_jdl(dq_jifen,d.d.prize[jf].n);
                                            continue;
                                        }
                                    }
                                }
                            });
                        });
                        G.view.mainView.getMainCityEvent();
                        me.remove();
                    }
                },true)
            }, 2000);


            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            

        },
    });

    G.frame[ID] = new fun('ui_top4.json', ID);
})();