/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典挑战界面
    var ID = 'juedoushengdian_tz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true,releaseRes:false});
        },
        onOpen: function () {
            var me = this;
            me.nodes.zhuangtai1.hide();
            me.nodes.zhuangtai2.show();
            // me.nodes.btn_jdtq.show();
            me.nodes.btn_bangzhu.show();
            cc.enableScrollBar(me.nodes.scrollview);
            me.bindBtn();
            me.DATA = G.frame.juedoushengdian_main.DATA;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            //排名奖励
            me.nodes.btn_pmjl.click(function () {
                G.frame.juedoushengdian_pmjl.show();
            });
            //说明
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L('TS83')
                }).show();
            });
            //匹配
            me.nodes.btn_pp.click(function () {
                me.ajax('gpjjc_pipei',[],function (str,data) {
                    if(data.s == 1){
                        G.class.ani.show({
                            json:"juedou_pp_dh",
                            addTo: me.ui,
                            x: me.ui.width / 2,
                            y: me.ui.height / 2,
                            repeat: true,
                            autoRemove: false,
                            onload:function (node,action) {
                                me.ani = node;
                                node.action = action;
                                X.autoInitUI(node);
                                action.play('wait',true);
                            }
                        });
                        //30S还没匹配到前端刷新状态
                        if (me.ui.timer) {
                            me.ui.clearTimeout(me.ui.timer);
                            delete me.ui.timer;
                        }
                        me.ui.timer = me.ui.setTimeout(function (){
                            if(cc.isNode(me.ani)){
                                me.ani.removeFromParent();
                                G.frame.juedoushengdian_fightplan.show();
                            }
                        },30000);
                        G.event.once('gongpingjjc_pipei',function (d) {
                            me.enemyData = X.toJSON(d);
                            if(me.ani && me.enemyData.state == 2){
                                me.ani.action.play('pipei',false);
                                me.ani.nodes.txt_name.setString(me.enemyData.headdata.name);
                                me.ani.nodes.txt_jsd.setString(X.STR(L('JUEDOUSHENGDIAN22'),me.enemyData.jifen));
                                var head = G.class.shead(me.enemyData.headdata);
                                head.setAnchorPoint(0,0);
                                head.setPosition(0,0);
                                me.ani.nodes.panel_ico.removeAllChildren();
                                me.ani.nodes.panel_ico.addChild(head);
                                X.setHeroModel({
                                    parent: me.ani.nodes.panel_js,
                                    data:{},
                                    model: X.splitStr(me.enemyData.headdata.model) || '6102a',
                                    callback:function (node) {
                                        node.setScale(1.2);
                                    }
                                });
                                me.ui.setTimeout(function () {
                                    me.ani.removeFromParent();
                                    G.frame.juedoushengdian_fightplan.show();
                                    if (me.ui.timer) {
                                        me.ui.clearTimeout(me.ui.timer);
                                        delete me.ui.timer;
                                    }
                                },1000);
                            }
                        })
                    }
                })
            })
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.setTimeEvent();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            me.showTopRank();
            me.setMyinfo();
            me.showRankInfo();
        },
        showTopRank:function () {
            var me = this;
            for(var i = 0; i < 3; i++){
                var list = me.nodes.panel_rw.clone();
                X.autoInitUI(list);
                list.show();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                var rankdata = me.DATA.rankinfo.ranklist[i];
                list.nodes.rw.removeBackGroundImage();
                if(rankdata){//有人
                    X.setHeroModel({
                        parent: list.nodes.rw,
                        data: {},
                        model: X.splitStr(rankdata.headdata.model) || '6102a'
                    });
                    list.nodes.qufu.setString(X.STR(L('YWZB_QF'),rankdata.headdata.svrname));
                    list.nodes.wj_mz.setString(rankdata.headdata.name);
                    list.nodes.wj_jf.setString(L('JF') + ":" + rankdata.val);
                }else {//虚位以待
                    list.nodes.rw.removeAllChildren();
                    list.nodes.rw.setBackGroundImage('img/juedoushendgian/gonghui_smrw.png',1);
                    list.nodes.wj_mz.setString(L('XWYD'));
                    list.nodes.qufu.setString('');
                    list.nodes.wj_jf.setString('');
                }
                X.enableOutline(list.nodes.qufu,cc.color("#000000"));
                X.enableOutline(list.nodes.wj_mz,cc.color("#000000"));
                X.enableOutline(list.nodes.wj_jf,cc.color("#000000"));
                me.nodes['rw' + (i+1)].removeAllChildren();
                me.nodes['rw' + (i+1)].addChild(list);
            }
        },
        //我的信息
        setMyinfo:function () {
            var me = this;
            me.nodes.wodepaiming.setString(L('MY_RANK') + (me.DATA.rankinfo.myrank || L('WRWZ')));
            me.nodes.jifen.setString(X.STR(L('JUEDOUSHENGDIAN8'),me.DATA.rankinfo.myval));
            var maxnum = G.frame.juedoushengdian_main.DATA.myinfo.tq == 1 ? (G.gc.gongpingjjc.maxfightnum + G.gc.gongpingjjc.tqaddfightnum) : G.gc.gongpingjjc.maxfightnum;
            var leftwinnum = (maxnum - me.DATA.todayfightnum) > 0 ? (maxnum - me.DATA.todayfightnum) : 0;
            me.nodes.jrcs.setString(X.STR(L('JUEDOUSHENGDIAN9'),leftwinnum));
        },
        //下部排行榜
        showRankInfo:function () {
            var me = this;
            var data = [];
            for (var i = 3; i < me.DATA.rankinfo.ranklist.length; i++){
                data.push(me.DATA.rankinfo.ranklist[i]);
            }
            me.nodes.zwnr.setVisible(data.length == 0);
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.sz_phb.setString(data.rank);
            var shead = G.class.shead(data.headdata);
            shead.setPosition(0,0);
            shead.setAnchorPoint(0,0);
            ui.nodes.panel_tx.removeAllChildren();
            ui.nodes.panel_tx.addChild(shead);
            ui.nodes.txt_name.setString(data.headdata.name);
            ui.nodes.txt_jf_sz.setString(data.val);
            ui.nodes.txt_qfmz.setString(X.STR(L('YWZB_QF'),data.headdata.svrname));
        },
        //倒计时
        setTimeEvent:function () {
            var me = this;
            var startime = G.DATA.asyncBtnsData.gpjjc.startime;
            //据下次开启
            if(G.time > startime && G.time < startime + 6*24*3600){//1-6天
                if(G.time >= X.getTodayZeroTime() && G.time < X.getTodayZeroTime() + 8*3600){
                    me.ui.finds('sjjs').setString(L('JUEDOUSHENGDIAN10'));
                    X.timeout(me.ui.finds('sjjs_0'),X.getTodayZeroTime() + 8*3600,function () {
                        me.setTimeEvent();
                    })
                }else if(G.time >= X.getTodayZeroTime() + 8*3600 && G.time < X.getTodayZeroTime() + 24*3600){
                    me.open = true;
                    me.ui.finds('sjjs').setString(L('JUEDOUSHENGDIAN11'));
                    X.timeout(me.ui.finds('sjjs_0'),X.getTodayZeroTime() + 24*3600,function () {
                        me.setTimeEvent();
                    })
                }
            }else if(G.time >= startime + 6*24*3600 && G.time <= startime + 7*24*3600){//第七天
                if(G.time >= X.getTodayZeroTime() && G.time < X.getTodayZeroTime() + 8*3600){
                    me.ui.finds('sjjs').setString(L('JUEDOUSHENGDIAN10'));
                    X.timeout(me.ui.finds('sjjs_0'),X.getTodayZeroTime() + 8*3600,function () {
                        me.setTimeEvent();
                    })
                }else if(G.time >= X.getTodayZeroTime() + 8*3600 && G.time < X.getTodayZeroTime() + 22*3600){
                    me.open = true;
                    me.ui.finds('sjjs').setString(L('JUEDOUSHENGDIAN11'));
                    X.timeout(me.ui.finds('sjjs_0'),X.getTodayZeroTime() + 24*3600,function () {
                        me.setTimeEvent();
                    })
                }else {
                    me.ui.finds('sjjs_0').setString(L('JUEDOUSHENGDIAN12'));
                }
            }else {
                me.ui.finds('sjjs_0').setString(L('JUEDOUSHENGDIAN12'));
            }
            me.nodes.btn_pp.setBtnState(me.open);
            me.nodes.btn_pp.setTitleColor(cc.color(me.open ? G.gc.COLOR.n12:G.gc.COLOR.n15));
        },
        //等级提升
        aniLvUp:function () {
            var me = this;
            G.class.ani.show({
                json: "ani_juedousj",
                addTo: me.ui,
                repeat: false,
                autoRemove: true,
                onload:function (node,action) {
                    node.nodes.dengji_1.setString(P.gud.gpjjclv);
                }
            })
            G.frame.juedoushengdian_main.checkPz();
        }
    });
    G.frame[ID] = new fun('juedoushengdian.json', ID);
})();