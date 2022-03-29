/**
 * Created by  on 2019//.
 */
(function () {
    //圣剑迷踪，乌鸦祭坛的通用界面
    G.class.huodong_sjmz = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_hdjs.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            //页面区别
            me.nodes.panel_pifu_bg.removeBackGroundImage();
            me.nodes.panel_wz.removeBackGroundImage();
            me.nodes.panel_js.removeAllChildren();
            if(me._data.stype == 10052){//圣剑迷踪
                me.nodes.panel_pifu_bg.setBackGroundImage("img/bg/img_jssl_bg01.jpg",0);
                me.nodes.panel_wz.setBackGroundImage("img/event/img_hd_czwz01.png",1);
                X.setHeroModel({
                    parent: me.nodes.panel_js,
                    data: {},
                    model: "31115"
                });
            }else if(me._data.stype == 10013){//乌鸦祭坛
                me.nodes.panel_pifu_bg.setBackGroundImage("img/bg/img_jssl_bg02.jpg",0);
                me.nodes.panel_wz.setBackGroundImage("img/event/img_hd_czwz02.png",1);
                X.setHeroModel({
                    parent: me.nodes.panel_js,
                    data: {},
                    model: "52055"
                });
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_bz.click(function () {
                if(me._data.stype == 10052){
                    str = L("TS57");
                }else if(me._data.stype == 10013){
                    str = L("TS58");
                }
                G.frame.help.data({
                    intr: str
                }).show();
            });
            //去充值
            me.nodes.btn_up1.click(function () {
                G.frame.chongzhi.once("willClose",function () {
                    me.getData(function () {
                        me.setContents();
                    })
                }).show();
            });
            //领取当天奖励
            me.nodes.btn_1.click(function () {
                me.ajax('huodong_use', [me._data.hdid,1,me.today], function (str,data) {
                    if (data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        if(G.frame.zhounianqing_main.isShow){
                            G.hongdian.getData("qingdian", 1, function () {
                                G.frame.zhounianqing_main.checkRedPoint();
                            });
                        }else {
                            G.hongdian.getData("huodong", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            });
                        }
                        // G.hongdian.getData("huodong", 1, function(){
                        //     G.frame.huodong.checkRedPoint();
                        // });
                        me.getData(function () {
                            me.setContents();
                        })
                    }
                })
            });
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        refreshView: function () {
            var me = this;
            me.refreshPanel();
        },
        setContents:function(){
            var me = this;
            //今日获得
            var today = me.today = me.DATA.myinfo.idx;//今天是第几天
            var todayprize = G.class.sitem(me.DATA.info.arr[today][0]);
            todayprize.setAnchorPoint(0,0);
            me.nodes.ico_dlwp.removeAllChildren();
            me.nodes.ico_dlwp.addChild(todayprize);
            var str1 = X.STR('<font color={1}>{2}</font>/{3}',me.DATA.myinfo.val >= me.DATA.info.needval?'#57d82f':'#f24c2c',me.DATA.myinfo.val,me.DATA.info.needval);
            var st = X.setRichText({
                str:str1,
                parent:me.nodes.txt_wzsz,
                size:20,
                color:"#ffffff",
                outline:"#200b02",
            });
            //判断今天有没有充值
            if(me.DATA.myinfo.gotarr[today] == 0){//可领,打红点
                me.nodes.btn_up1.hide();
                me.nodes.btn_1.show();
                G.setNewIcoImg(me.nodes.btn_1);
                me.nodes.btn_1.finds('redPoint').setPosition(116,45);
            }else if(me.DATA.myinfo.gotarr[today] == 1){//已领
                me.nodes.btn_1.show();
                me.nodes.btn_up1.hide();
                me.nodes.btn_1.setEnableState(false);
                me.nodes.txt_js.setString(L("YLQ"));
                me.nodes.txt_js.setTextColor(cc.color("#5a5a5a"));
                G.removeNewIco(me.nodes.btn_1);
            }else {//不可领取
                me.nodes.btn_up1.show();
                me.nodes.btn_1.hide();
                G.removeNewIco(me.nodes.btn_1);
            }
            todayprize.setGet(me.DATA.myinfo.gotarr[today] == 1);
            todayprize.setTouchEnabled(!me.DATA.myinfo.gotarr[today] == 1);

            //只显示第2，4，7天的奖励，默认可领取的奖励
            var prizeinfo = {};
            for(var i = 0; i < me.DATA.info.arr.length; i++) {
                if (i == 0 || i == 2 || i == 4 || i == 7) {
                    prizeinfo[i] = me.DATA.info.arr[i];
                }

            }
            var prizearr = [];
            for(var j in prizeinfo){
                var list = me.nodes.list_wp.clone();
                X.autoInitUI(list);
                list.show();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);

                X.enableOutline(list.nodes.txt_wp_wzh,"#000000",2);
                var pprize = G.class.sitem(prizeinfo[j][0]);
                if(j == 0 && me.DATA.myinfo.gotarr[j] == 0){
                    G.setNewIcoImg(pprize);
                    pprize.finds('redPoint').setPosition(85,85);
                }else {
                    G.removeNewIco(pprize);
                }
                if(j == 0 && me.DATA.myinfo.gotarr[j] != 1){
                    list.nodes.txt_wp_wzh.setString(L("SJMZTITLE0"));
                }else {
                    list.nodes.txt_wp_wzh.setString(X.STR(L("SJMZTITLE" ), j-(X.keysOfObject(me.DATA.myinfo.gotarr).length-1)));
                }
                list.nodes.txt_wp_wzh.setVisible(me.DATA.myinfo.gotarr[j] != 1);
                pprize.setGet(me.DATA.myinfo.gotarr[j] == 1);
                pprize.setTouchEnabled(!me.DATA.myinfo.gotarr[j] == 1);
                pprize.setAnchorPoint(0,0);
                pprize.prize = prizeinfo[j];
                pprize.index = parseInt(j);
                //奖励状态
                pprize.click(function (sender) {
                    if(me.DATA.myinfo.gotarr[sender.index] == 0 && sender.index == 0) {//默认奖励可领奖
                        me.ajax('huodong_use', [me._data.hdid,1,sender.index], function (str,data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                                if(G.frame.zhounianqing_main.isShow){
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }
                                // G.hongdian.getData("huodong", 1, function(){
                                //     G.frame.huodong.checkRedPoint();
                                // });
                                me.getData(function () {
                                    me.setContents();
                                })
                            }
                        })
                    }else {
                        G.frame.jiangliyulan.data({prize: sender.prize}).show();
                    }
                });
                list.nodes.ico_wp.addChild(pprize);
                prizearr.push(list);

            }
            for(var k = 0; k < prizearr.length; k++){
                me.nodes['img_wp0' + (k+1)].removeAllChildren();
                me.nodes['img_wp0' + (k+1)].addChild(prizearr[k]);
            }
            //进度条
            var chargeday = X.keysOfObject(me.DATA.myinfo.gotarr).length - 1;//累计冲了多少天
            var jdt = X.keysOfObject(prizeinfo);//[0,2,4,7]
            for(var i = 1; i < jdt.length; i++){
                var fenzi = chargeday - jdt[i-1];
                var fenmu = jdt[i] - jdt[i-1];
                me.nodes['img_jdt'+i].setPercent(fenzi / fenmu *100);
            }
            // me.nodes.img_jdt.setPercent(chargeday / (me.DATA.info.arr.length - 1) * 100);
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
            // G.frame.huodong.getData(me._data.hdid, function(d){
            //     me.DATA = d;
            //     callback && callback();
            // });
        },
    });
})();