/**
 * Created by wlx on 2019/12/16.
 */
(function () {
    //剑圣的试炼
    G.class.huodong_jssl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_jssl.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            X.setHeroModel({
                parent: me.nodes.panel_js,
                data: {},
                model: "31115",
                scaleNum: 1.3,
            });
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
        bindBtn: function () {
            var me = this;
            //奖励预览
            me.nodes.btn_szq.click(function () {
                G.frame.jssl_jlyl.data({
                    val:me.DATA.myinfo.val,
                    arr:me.DATA.info.arr,
                    gotarr:me.DATA.myinfo.gotarr,
                    hdid:me._data.hdid,
                }).show();
            });
            //帮助
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS53')
                }).show();
            });
        },
        onShow: function () {
            var me = this;
            me.getData(function () {
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            //活动倒计时
            if(me._data.rtime - G.time > 24*3600){
                me.nodes.text_sj2.setString(X.moment(me._data.rtime - G.time));
            }else {
                X.timeout(me.nodes.text_sj2,me._data.rtime,function () {
                    me.nodes.text_sj2.setString(L("YJS"));
                })
            }
            //恢复点
            if(me.DATA.myinfo.recovertime > 0){
                me.nodes.panel_sj1.show();
                X.timeout(me.nodes.text_sj1,me.DATA.myinfo.recovertime + me.DATA.info.refreshtime,function () {
                    me.nodes.panel_sj1.hide();
                });
            }else {
                me.nodes.panel_sj1.hide();
            }

            me.hasnext = false;
            me.index = me.DATA.info.arr.length - 1;
            //下阶奖励
            for(var k = 0; k < me.DATA.info.arr.length; k++){
                if(!X.inArray(me.DATA.myinfo.gotarr,k)){
                    var item = new G.class.sitem(me.DATA.info.arr[k].prize[0]);
                    item.setAnchorPoint(0,0);
                    me.hasnext = true;
                    me.index = k;//第几阶奖励
                    break;
                }
            }
            me.nodes.panel_jl.removeAllChildren();
            if(me.hasnext){
                if(me.DATA.myinfo.val >= me.DATA.info.arr[me.index].needval && !X.inArray(me.DATA.myinfo.gotarr,me.index)){
                    item.setTouchEnabled(true);
                    G.setNewIcoImg(item);
                    item.finds('redPoint').setPosition(85,85);
                    item.touch(function (sender,type) {
                        if(type == ccui.Widget.TOUCH_NOMOVE){//点击奖励领奖
                            me.ajax("huodong_use",[me._data.hdid,1,me.index],function (str,data) {
                                if(data.s == 1){
                                    G.frame.jiangli.data({
                                        prize:data.d.prize
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
                        }
                    })
                }else {//点击奖励看详情
                    G.removeNewIco(item);
                    G.frame.iteminfo.showItemInfo(item);
                }
                me.nodes.panel_jl.addChild(item);
            }else {//奖励全都领过了
                var pitem = G.class.sitem(me.DATA.info.arr[me.DATA.info.arr.length - 1].prize[0]);
                pitem.setGet(true);
                pitem.setAnchorPoint(0,0);
                me.nodes.panel_jl.addChild(pitem);
            }
            //进度
            me.nodes.img_jdt.setPercent(me.DATA.myinfo.val / me.DATA.info.arr[me.index].needval * 100);
            me.nodes.txt_jdt_wz.setString(me.DATA.myinfo.val + "/" + me.DATA.info.arr[me.index].needval);
            //挑战次数
            me.nodes.txt_sytz.setString(me.DATA.myinfo.num + "/" + me.DATA.info.maxnum);
            for(var i = 0; i < me.DATA.info.npcdata.length; i++){
                var list =  me.nodes["panel_list" + (i+1)];
                X.autoInitUI(list);
                list.nodes.txt_jf.setString(me.DATA.info.npcdata[i].addval);
                list.nodes.btn_tz.data = me.DATA.info.npcdata[i];
                list.nodes.btn_tz.index = i;
                list.nodes.btn_tz.setTouchEnabled(true);
                list.nodes.btn_tz.click(function (sender) {
                    if(me.DATA.myinfo.num == 0){
                        G.tip_NB.show(L("JSSLTZCSBZ"))
                    }else {
                        G.frame.jssl_tiaozhan.data({
                            diff:sender.index,
                            npc:sender.data.npc,
                            prize:[{a: "item", t: "fightjifen", n: sender.data.addval}],
                            zhanli:sender.data.zhanli,
                            prizenum:sender.data.addval,
                            hdid: me._data.hdid
                        }).show();
                        // G.frame.yingxiong_fight.data({
                        //     pvType: "syzlb",
                        //     data: {
                        //         enemy: sender.data.npc,
                        //         isNpc: true
                        //     },
                        //     hdid: me._data.hdid,
                        //     index: sender.index,
                        //     prizenum:sender.data.addval,
                        //     zhanli: sender.data.zhanli,
                        //     from:me,
                        // }).show();
                    }
                })
            }
            },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
})();