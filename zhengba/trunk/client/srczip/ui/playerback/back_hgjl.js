/**
 * Created by WLX on 2019/10/26.
 */
(function () {
    //回归奖励
    G.class.back_hgjl = X.bView.extend({
        extConf: {

        },
        ctor: function (data) {
            var me = this;
            me.DATA = data;
            me.type = "return";
            me._super("event_huigui.json");
        },
        bindBtn: function () {
            var me = this;
            //一倍奖励
            me.nodes.btn_1.click(function () {
                me.ajax('return_receive', [me.type, me.keyarr[0]], function (str, dd) {
                    if(dd.s == 1){
                        G.frame.jiangli.data({
                            prize: dd.d.prize
                        }).show();
                        //刷新当前界面状态
                        me.refreshPanel();
                        //刷新数据
                        G.frame.playerback_main.getData();
                        G.frame.playerback_main.updateTop();
                        //刷新红点
                        G.removeNewIco(me.nodes.btn_1);
                        G.hongdian.getData("return", 1, function () {
                            G.frame.playerback_main.checkRedPoint();
                        })
                    }
                })
            });
            //二倍奖励
            me.nodes.btn_2.click(function () {
                me.ajax('return_receive', [me.type, me.keyarr[1]], function (str, dd) {
                    if(dd.s == 1){
                        G.frame.jiangli.data({
                            prize: dd.d.prize
                        }).show();
                        //刷新当前界面状态
                        me.refreshPanel();
                        //刷新数据
                        G.frame.playerback_main.getData();
                        G.frame.playerback_main.updateTop();
                        //刷新红点
                        G.removeNewIco(me.nodes.btn_1);
                        G.hongdian.getData("return", 1, function () {
                            G.frame.playerback_main.checkRedPoint();
                        })
                    }
                })
            });
        },
        refreshPanel:function(){
          var me = this;
            me.ajax('return_open', [], function(str, data){
                if(data.s == 1) {
                    me.DATA = data.d;
                    me.setContents();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.conf = G.gc.returnhome;
            me.keyarr = X.keysOfObject(me.conf[me.type]);

            //活动时间
            // if(me.DATA.v - G.time > 24 * 3600){
            //     me.nodes.txt_hdsj.setString(X.moment(me.DATA.v - G.time));
            //     me.nodes.txt_hdsj.setFontSize(20);
            // }else {
            //     X.timeout(me.nodes.txt_hdsj, me.DATA.v, function () {
            //         me.setContents();
            //     });
            // }
            X.timeout(me.nodes.txt_hdsj, me.DATA.v, function () {
                me.setContents();
            },null,conf = {"timeLeftStr":"h:mm:s","showStr":"剩余时间:{1}"});

            //消耗
            me.nodes.txt_jss.setString(me.conf.return[2].need[0].n);
            me.nodes.panel_zs.removeBackGroundImage();
            me.nodes.panel_zs.setBackGroundImage(G.class.getItemIco(me.conf.return[2].need[0].t),1);

            //显示奖励
            var prize = me.DATA.prize[1];//只显示1倍的奖励
            var prize1 = [];
            var prize2 = [];
            if(prize.length > 4){//有两排奖励
                //第一排奖励
                for(var i = 0; i < 4; i++){
                    prize1.push(prize[i]);
                }
                //第二排奖励
                for(var i = 4; i < prize.length; i++){
                    prize2.push(prize[i]);
                }
                X.alignCenter(me.nodes.panel_jl2, prize2, {
                    touch: true
                });

            }else if(prize.length <= 4){
                prize1 = prize;
            }

            X.alignCenter(me.nodes.panel_jl1, prize1, {
                touch: true
            });

            //按钮状态
            if(me.DATA.receive.return == 1){//已领取
                me.nodes.btn_1.setEnableState(false);
                me.nodes.btn_1.setBright(false);
                me.nodes.btn_2.setEnableState(false);
                me.nodes.btn_2.setBright(false);
                me.nodes.img_ylqjl.show();
                me.nodes.panel_yingcang.hide();
                G.removeNewIco(me.nodes.btn_1);
            }else {
                me.nodes.btn_1.setEnableState(true);
                me.nodes.btn_1.setBright(true);
                me.nodes.btn_2.setEnableState(true);
                me.nodes.btn_2.setBright(true);
                me.nodes.img_ylqjl.hide();
                me.nodes.panel_yingcang.show();
                //只在免费领取上打红点
                G.setNewIcoImg(me.nodes.btn_1, .9);
            }

        },
    })
})();