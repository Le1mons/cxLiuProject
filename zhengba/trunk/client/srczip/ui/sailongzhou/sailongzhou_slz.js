/**
 * Created by
 */
(function () {
    //赛龙舟-赛龙舟游戏
    //todo
    /*
    下方助威设置,如果我没有助威,显示助威按钮
    如果已经助威,但是点击的船和我的船不一样,只显示每轮比赛只可以选一个船助威
    00点-22:00是助威时间,期间可以选择小船助威
    22:00- 22:15是比赛时间,比赛途中不可以助威,点击小船无效
    22:15以前点击奖励预览可以看昨日比赛奖励结果,今日显示问号
    22:15以后是展示时间,此时比赛结束,进游戏之后仅有重播按钮显示,可以查看比赛重播
    此时可以看到今日比赛结果,显示奖励,
    每天0点刷新
    */
    var ID = 'sailongzhou_slz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.preLoadRes = ["julongshendian6.png", "julongshendian6.plist"]
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            //奖励预览
            me.nodes.btn_jl.click(function (sender, type) {
                me.getTimeState();
                    //不显示今天结果
                G.frame.sailongzhou_bsjl.data({
                    type:me.timeType
                }).show();
            });
            //重播
            me.nodes.btn_cb.click(function (sender, type) {
                me.isChongbo = true;
                me.setBtn();
                me.gameStart();
            });
            //退出
            me.nodes.btn_tc.click(function (sender, type) {
                me.ruchangAni && me.ruchangAni.action.playWithCallback('chuchang',false,function () {
                    me.remove();
                });
            });
            //助威按钮
            var toupiaoneed = me.conf.toupiaoneed;
            var myown = G.class.getOwnNum(toupiaoneed[0].t,toupiaoneed[0].a);
            me.nodes.btn_zw.click(function (sender,type) {
                if (myown<1){
                        return G.tip_NB.show(L('slz_tip15'));
                }else {
                    f();
                }
            });
            function f() {
                G.frame.slz_zwsl.data({
                    buy:toupiaoneed[0],
                    num: 1,
                    maxNum: myown,
                    callback: function (num) {
                        if (num>0){
                            if (me.DATA.myinfo.select){
                                //已经选择过了
                                me.ajax("longzhou_toupiao", [num], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize:data.d.prize
                                        }).show();
                                        G.frame.sailongzhou.DATA.myinfo = data.d.myinfo;
                                        me.DATA = G.frame.sailongzhou.DATA;
                                        me.setBottom(G.frame.sailongzhou.DATA.myinfo.select || 1);
                                    }
                                });
                            }else {
                                G.ajax.send("longzhou_select", [me.selectId], function (d) {
                                    var d = JSON.parse(d);
                                    if (d.s == 1){
                                        var child = me.nodes.panel_lz.getChildByName('longzhou' + d.d.myinfo.select);
                                        if (cc.isNode(child)){
                                            child.setZhuweiQz && child.setZhuweiQz(d.d.myinfo.select);
                                        }
                                        me.ajax("longzhou_toupiao", [num], function (str, data) {
                                            if (data.s == 1) {
                                                G.frame.jiangli.data({
                                                    prize:data.d.prize
                                                }).show();
                                                G.frame.sailongzhou.DATA.myinfo = data.d.myinfo;
                                                me.DATA = G.frame.sailongzhou.DATA;
                                                me.setBottom(G.frame.sailongzhou.DATA.myinfo.select || 1);
                                            }
                                        });
                                    }
                                })
                            }
                        }

                    }
                }).show();
            }
        },
        setBtn:function(){
            var me = this;
            if (me.isChongbo){
                me.nodes.btn_cb.hide();
                me.nodes.btn_tc.show();
            }else {
                me.nodes.btn_cb.show();
                me.nodes.btn_tc.hide();
            }
        },
        onOpen: function () {
            var me = this;
            G.event.on('dayChange', function () {
                if(G.frame.sailongzhou.isShow && G.frame.sailongzhou_slz.isShow) {
                    G.frame.sailongzhou.getData(function () {
                        me.refreshPanel();
                    });
                }
            });
            me.initUi();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.isChongbo = false;//是否正在重播
            me.movebg = true;//是否已经开始移动
            me.isUpdate = false;//是否停止检测碰撞
            me.lzObsItem = {};
            me.lzItems = {};
            me.conf = G.gc.longzhou;
            me.longzhouconf = me.conf.longzhouinfo;
            me.refreshPanel();
            me.bindBtn();
        },
        refreshPanel:function(){
          var me = this;
            me.getTimeState();
            me.setContents();
        },
        getTimeState:function(){
          var me = this;
          var zero = X.getTodayZeroTime();
          var nine55 = zero + 21*3600 + 55*60;//晚上9.55
          var ten00 = zero + 22*3600;//晚上十点整
          var ten05 = zero + 22*3600 + 5*60;//晚上10.5
          if(G.time>zero && G.time<ten00){
                me.timeType = 'djs';
          } else if (G.time>ten00 && G.time<ten05){
                me.timeType = 'game';
          }else {
              me.timeType = 'result';//结果展示时间
          }
        },
        setContents: function () {
            var me = this;
            me.DATA = G.frame.sailongzhou.DATA;
            me.setBottom(me.DATA.myinfo.select || 1);
            me.ui.finds('Image_4').zIndex = 1;
           if (me.timeType == "djs"){
                //此时可以助威
                me.ui.finds('Text_5').show();
                me.nodes.txt_cs.show();
                //显示倒计时
               var time = X.getTodayZeroTime() + 22 * 3600;
               if (me.timer) {
                   me.timer.clearAllTimers();
                   delete me.timer;
               }
               if (G.time < time){
                   me.timer = X.timeout(me.nodes.txt_cs, time, function () {
                       me.ui.finds('Text_5').hide();
                       me.nodes.txt_cs.hide();
                       //比赛开始
                       G.frame.sailongzhou.getData(function () {
                           me.refreshPanel();
                       });
                   });
                   me.nodes.img_zd.hide();
                   me.nodes.panel_xia.show();
                   me.initLongzhou();
               }
                // me.updateBgByWait();
            }else if (me.timeType == 'game'){
                //游戏时间
               if (me.isstart)return;
                me.ui.finds('Text_5').hide();
                me.nodes.txt_cs.hide();
                me.nodes.panel_xia.hide();
                me.nodes.btn_tc.hide();
                // me.nodes.img_bg.unscheduleUpdate();
                //开始比赛
                if (!X.cacheByUid('lookGameVideo')){
                    me.isstart = true;
                    //且今天没有看过
                    me.nodes.btn_cb.hide();
                    X.cacheByUid('lookGameVideo',1);
                    //开始比赛
                    me.gameStart();
                }else {
                    me.nodes.btn_cb.show();
                    me.setLongzhouEnd(me.DATA.myinfo.select);
                }
            }else {
                //过了这个时间或者今天已经看过
                me.ui.finds('Text_5').hide();
                me.nodes.txt_cs.hide();
                me.nodes.panel_lz.show();//显示终点
                me.nodes.panel_jd.hide();
                me.nodes.btn_tc.hide();
                me.nodes.panel_xia.hide();
                //设置四条龙舟排名
               // me.updateBgByWait();
               if (X.isHavItem(me.DATA.jieguo)){
                   me.setLongzhouEnd(me.DATA.myinfo.select);
                   me.nodes.btn_cb.show();
               }
            }
        },
        setBottom:function(idx){
          var me = this;
          //每次默认选择第一个
            var surprize = me.getSurprize(idx);
            me.nodes.panel_wp.removeAllChildren();
            X.alignItems(me.nodes.panel_wp,surprize, 'left', {
                touch: true,
                // mapItem: function (node) {
                //     node.num.hide();
                // }
            });
            var lzinfo = me.conf.longzhouinfo[idx];
            me.nodes.txt_rs.setString(X.STR(L('slz_tip10'),lzinfo.basenum));
            me.nodes.txt_jl.setString(X.STR(L('slz_tip11'),lzinfo.maxnum*2));
            me.nodes.txt_2.setString(L('slz_tip12'));
            //每个龙舟的助威人数
            var allnum = me.DATA.allnum[idx]||0;
            me.nodes.txt_zwrs.setString(X.STR(L('slz_tip13'),allnum));

            var toupiaoneed = me.conf.toupiaoneed[0];
            me.nodes.ico_token.setBackGroundImage(G.class.getItemIco(toupiaoneed.t),1);
            me.nodes.txt_zws.setString(me.DATA.myinfo.num||0);
            var myhave = G.class.getOwnNum(toupiaoneed.t,toupiaoneed.a);
            var ico = new ccui.ImageView(G.class.getItemIco(toupiaoneed.t), 1);
            ico.scale = .8;
            me.nodes.panel_zs.removeAllChildren();
            X.setRichText({
                str: '剩余:<font node=1></font>' +' X '+ X.fmtValue(myhave),
                parent: me.nodes.panel_zs,
                node: ico,
                color: '#7b531a',
                size: 20,
                maxWidth: me.nodes.panel_zs.width
            });
            if (me.DATA.myinfo.select){
                //我已经选择
                if (me.DATA.myinfo.select == idx){
                    //点的和我已经选的一样
                    me.nodes.panel_kszw.show();
                    me.nodes.panel_ks.hide();
                    me.nodes.panel_zs.show();
                    if (me.timeType == 'djs'){
                        //可以助威
                        me.nodes.btn_zw.show();
                        me.nodes.panel_yjs.hide();
                    }else {
                        me.nodes.btn_zw.hide();
                        me.nodes.panel_yjs.hide();
                    }
                }else {
                    //点的和我已经选的不一样
                    me.nodes.panel_ks.show();
                    me.nodes.panel_kszw.hide();
                    me.nodes.panel_zs.hide();
                }
            } else {
                me.selectId = idx;
                //我还没有选择
                me.nodes.panel_kszw.show();
                me.nodes.panel_ks.hide();
                if (me.timeType == 'djs') {
                    //可以助威
                    me.nodes.btn_zw.show();
                    me.nodes.panel_yjs.hide();
                } else {
                    me.nodes.btn_zw.hide();
                    me.nodes.panel_yjs.show();
                }
            }
        },
        getSurprize:function (id) {
            var me = this;
            var extprize = me.conf.extprize[id];
            var arr = [];
            for (var i=0;i<extprize.length;i++){
                arr.push(extprize[i][1][0]);
            }
            return arr;
        }
    });
    G.frame[ID] = new fun('duanwu_slz.json', ID);
})();