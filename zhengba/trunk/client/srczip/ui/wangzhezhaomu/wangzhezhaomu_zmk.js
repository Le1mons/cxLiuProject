/**
 * Created by  on 2019//.
 */
(function () {
    //王者招募卡
    G.class.wangzhezhaomu_zmk = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_chuanqizhouka.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.ui.finds('ico_zs').loadTexture(G.class.getItemIco('5049'),1);
            me.ui.finds('Text_1').setString(L("WANZGHEZHAOMU24"));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_bangzhu.click(function(){
                G.frame.help.data({
                    intr:(L("TS70"))
                }).show();
            });
        },
        onShow: function () {
            var me = this;
            me.getData(function(){
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            me.nodes.zs_wz.setString(G.gc.wangzhezhaomu.zhouka.getnum);
            X.timeCountPanel(me.nodes.txt_hfsj, me.DATA.info.etime, {
                str: "<font color=#fff8e1>剩余时间：</font>" + (me.DATA.info.etime - G.time > 24 * 3600 * 2 ? X.moment(me.DATA.info.etime - G.time) : "{1}")
            });
            me.nodes.panel_wp.removeAllChildren();
            G.removeNewIco(me.nodes.btn_szq);
            if(me.DATA.zhouka.buy == 0){//未购买,显示购买获得的固定奖励
                me.nodes.btn_szq.setBtnState(true);
                me.nodes.txt_szq.setString(G.gc.wangzhezhaomu.zhouka.money / 100 + L("YUAN"));
                me.nodes.txt_szq.setTextColor(cc.color(G.gc.COLOR.n12));
                var addprize = [{a: "item", t: "tequan_4", n: 1}];
                var prize = me.prize = addprize.concat(me.DATA.info.data.openinfo.zhouka.buyprize);
                X.alignItems(me.nodes.panel_wp,prize,"center",{
                    touch:true
                });
            }else {//已购买，显示每天的奖励
                X.alignItems(me.nodes.panel_wp,me.DATA.info.data.openinfo.zhouka.arr[me.DATA.zhouka.idx],"center",{
                    touch:true
                });
                if(X.inArray(me.DATA.zhouka.reclist,me.DATA.zhouka.idx)){//今天是否领奖
                    me.nodes.btn_szq.setBtnState(false);
                    me.nodes.txt_szq.setString(L("YLQ"));
                    me.nodes.txt_szq.setTextColor(cc.color(G.gc.COLOR.n15));
                }else {
                    me.nodes.btn_szq.setBtnState(true);
                    me.nodes.txt_szq.setString(L("LQ"));
                    G.setNewIcoImg(me.nodes.btn_szq);
                    me.nodes.btn_szq.finds('redPoint').setPosition(120,50);
                    me.nodes.txt_szq.setTextColor(cc.color(G.gc.COLOR.n12));
                }
            }

            me.nodes.btn_szq.click(function(){
                if(me.DATA.zhouka.buy == 0){
                    G.event.once('paysuccess', function(data) {
                        if(data.success){
                            G.frame.jiangli.data({
                                prize:me.prize
                            }).show();
                            me.DATA.zhouka.buy = 1;
                            me.setContents();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            })
                        }
                    });
                    G.event.emit('doSDKPay', {
                        pid:G.gc.wangzhezhaomu.zhouka.proid,
                        logicProid:G.gc.wangzhezhaomu.zhouka.proid,
                        money: G.gc.wangzhezhaomu.zhouka.money,
                    });
                }else{
                    me.ajax("wangzhezhaomu_zhoukaprize",[],function(str,data){
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.DATA.zhouka.reclist.push(me.DATA.zhouka.idx);
                            if(me.DATA.zhouka.idx >= 6){//最后一天
                                G.frame.wangzhezhaomu_main.getData(function(){
                                    G.frame.wangzhezhaomu_main.refreshPanel();
                                })
                            }else {
                                me.setContents();
                            }
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            })
                        }
                    })
                }
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open', ['zhouka'], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        }
    });
})();