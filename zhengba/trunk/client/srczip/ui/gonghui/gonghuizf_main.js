/**
 * Created by  on 2019//.
 */
(function () {
    //公会争锋主界面
    var ID = 'gonghuizf_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.showToper();
            me.changeToperAttr({
                attr2: {a: 'item', t: '2003'}
            });
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.checkRedPoint();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            me.nodes.panel_alxzc.setBright(G.class.opencond.getIsOpenById('alaxizhanchang'));
            me.nodes.panel_hz1.setBright(G.class.opencond.getIsOpenById('alaxizhanchang'));
            me.nodes.panel_ghzf.setBright(G.DATA.openGHZ);
            me.nodes.panel_hz2.setBright(G.DATA.openGHZ);
            var monday = X.getLastMondayZeroTime();
            //阿拉希战场，开服四天开放
            if(G.class.opencond.getIsOpenById('alaxizhanchang')){
                //周一0-10点，显示为（赛季准备中：）
                // 周一10点-周日20点，显示为（赛季倒计时：）
                // 周日20点-周一0点，显示为（新赛季倒计时：）
                if(G.time > monday && G.time < monday+10*3600){
                    var endtime = monday+10*3600;
                    var str = L("GONGHUIFIGHT5");
                }else if(G.time > monday+10*3600 && G.time < monday + 6*24*3600 + 20*3600){
                    var endtime = monday + 6*24*3600 + 20*3600;
                    var str = L("GONGHUIFIGHT6");
                }else {
                    var endtime = monday + 7*24*3600 + 10 * 3600;
                    var str = L("GONGHUIFIGHT7");
                }
                X.timePanel(me.nodes.panel_djs1,endtime,18,"right",function () {
                    me.setContents();
                },{
                    desc:str
                });
                me.nodes.panel_alxzc.click(function () {
                    //7月20日0点才能进
                    if(G.time > 1595174400){
                        G.frame.alaxi_main.once('willClose',function () {
                            me.changeToperAttr({
                                attr2: {a: 'item', t: '2003'}
                            });
                        }).checkShow();
                    }else {
                        G.tip_NB.show(L("GONGHUIFIGHT33"));
                    }
                });
            }else {
                var rh = X.setRichText({
                    parent:me.nodes.panel_djs1,
                    str:L("GONGHUIFIGHT1"),
                    color:"#FFF6DD",
                });
                rh.setAnchorPoint(1,0);
                rh.setPosition(me.nodes.panel_djs1.width,0);
                me.nodes.panel_alxzc.click(function () {
                    G.tip_NB.show(L("GONGHUIFIGHT2"));
                });
            }
            //公会争锋，开服一周显示
            if(G.DATA.openGHZ){
                me.nodes.panel_ghzf.click(function () {
                    G.frame.gonghui_zhengfeng.checkShow();
                });
            }else {
                var rh = X.setRichText({
                    parent:me.nodes.panel_djs2,
                    str:L("GONGHUIFIGHT4"),
                    color:"#FFF6DD",
                });
                rh.setAnchorPoint(1,0);
                rh.setPosition(me.nodes.panel_djs1.width,0);
                me.nodes.panel_ghzf.click(function () {
                    G.tip_NB.show(X.STR(L("KFJTHKQ_GHZ"), G.gc.openSeverTime.openGHZ.time / (24 * 3600)));
                });
            }
        },
        onHide:function () {
            var me = this;
            G.hongdian.getData("gonghui", 1, function () {
                G.frame.gonghui_main.checkRedPoint();
            });
        },
        checkRedPoint:function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if(G.DATA.hongdian.gonghui.siege){
                G.setNewIcoImg(me.nodes.panel_alxzc);
                me.nodes.panel_alxzc.finds('redPoint').setPosition(572,156);
            }else {
                G.removeNewIco(me.nodes.panel_alxzc);
            }
            if(G.DATA.hongdian.gonghui.competing){
                G.setNewIcoImg(me.nodes.panel_ghzf);
                me.nodes.panel_ghzf.finds('redPoint').setPosition(572,156);
            }else {
                G.removeNewIco(me.nodes.panel_ghzf);
            }
        },
    });
    G.frame[ID] = new fun('gonghui_ghz.json', ID);
})();