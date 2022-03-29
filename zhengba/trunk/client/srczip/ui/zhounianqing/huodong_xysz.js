/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //幸运骰子
    G.class.huodong_xysz = X.bView.extend({
        ctor: function (type,id) {
            var me = this;
            me._type = type;
            me._super("event_2zhounian1.json",id,{action:true});
        },
        refreshPanel: function () {
            var me = this;
            me.setContents();
        },
       
        bindBTN: function() {
            var me = this;
            me.nodes.btn_1.click(function () {
                me.clickNum = 1;
                me.zhisezi(1);
            })
            me.nodes.btn_2.click(function () {
                me.clickNum = 10;
                me.zhisezi(10);
            })
            me.nodes.btn_bz.click(function () {
                 G.frame.help.data({
                        intr: L('TS75')
                    }).show();
            })
            me.nodes.btn_jcyl.click(function () {
                 G.frame.jiangchiyulan.data({
                        data:me.DATA.prizepool,
                        idx:me.DATA.pool,
                    }).show();
            })
            me.nodes.btn_sz.click(function () {
                 G.frame.gettouzi.once("close",function(){
                     me.initTouziNum();
                 }).data({
                        payInfo:me.DATA.pay,
                    }).show();
            })
        },
        zhisezi:function (num) {
            var me = this ;
            if(me.lock )return;
            // var getFun = function () {
                me.lock  = true;
                 me.oldChess = me.DATA.chess *1;
                G.ajax.send("anniversary_chess",[String(num)],function(str,data){
                    if(data.s == 1){
                        me.initTouziNum();
                        me.prizeArr  = [].concat(data.d.prize);
                        me.parentNode.refreshDataInfo(data.d.data);
                        me.DATA = data.d.data;
                        me.stepArr = data.d.trace;
                        me.isChangePool = data.d.data.change || false;
                        if(me.clickNum == 1 && data.d.trace.length > 1){
                            //单抽抽到跳格子的时候走这个功能

                            me.stepArr2 = [];
                            me.stepArr2 = [].concat(data.d.trace);
                            me.danchou();
                        }else{
                            me.initArr();
                            var toPos = data.d.trace[data.d.trace.length-1];
                            me.initStepNumArr(me.oldChess,toPos);
                            me.initView(num,data.d,toPos);
                        }
                    }else{
                        me.lock  = false;
                    }
                })
            // }
          
        },
        // 检查是否进入到下一奖次
        showCheck:function () {
            var me = this ;  
            var _num = me.checkPrize();
            if(_num == 1){
                // getFun();
            }else if(_num == 2){
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send("anniversary_change",[],function(str,data){
                            if(data.s == 1){
                                G.tip_NB.show(L("JIANGCHIcz"))
                                me.DATA = data.d;
                                me.parentNode.refreshDataInfo(data.d);
                            }
                        })
                    },
                    cancelCall:function () {
                       
                    },
                    richText: L("JIANGCHIXY"),
                }).show();
            }else if(_num == 3){
                G.tip_NB.show(L("NOPRIZE"));
                // getFun();
            };
        },
        // 进入下一奖次的逻辑
        checkPrize:function () {
            var me = this ;
            var maxPool = me.parentNode.conf.prizepool.length-1;
            var conf = me.parentNode.conf.prizepool[me.DATA.pool];
            var poolinfo = me.DATA.prizepool[me.DATA.pool];
            if(me.isChangePool){
                return 3 ;
            };
            if(!poolinfo){
                return 1
            }else{
                // var bool = false;
                // for(var key in conf){
                //     if(poolinfo[key] < conf[key].num){
                //         bool =  true;
                //     };
                // };
                
                for(var key in conf){
                    if(conf[key].core == 1 &&  poolinfo[key] >= conf[key].num){
                        return 2
                    };
                };
            };
            return 1;
            // 1 代表最后一个奖次，可以一直抽  2 代表当前奖次 最终奖励已被抽  3 代表奖次被抽空 4 代表可以抽奖
        },
        
        danchou:function () {
            var me = this ;
            var arr = me.stepArr2.splice(0,1);
            me.StepNumArr = [];
            for(var i = me.oldChess+1; i <= arr[0];i++){
                me.StepNumArr.push(i+1);
            };
            me.nodes.donghua1.show();
            me.nodes.shaizi0.removeBackGroundImage();
            me.nodes.shaizi0.removeAllChildren();
            me.addAni(me.nodes.shaizi0,arr[0]-me.oldChess,true);
            me.oldChess = arr[0];
        },
        // 得到该次走到的位置
        initStepNumArr : function (num1,num2) {
            var me = this ;
            me.StepNumArr = [];
            for(var i = num1+1; i <= num2;i++){
                me.StepNumArr.push(i+1)
            };
            cc.log(me.StepNumArr,num1,num2);
        },
        initView:function (num,data,toPos) {
            var me = this ;
            G.frame.loadingIn.show();
            //  me.initScrollirwPos(100 - (16/25*100));
            if(num == 1){
                var arr = me.saiZiArr.splice(0,1);
                me.nodes.donghua1.show();
                me.nodes.shaizi0.removeBackGroundImage();
                me.nodes.shaizi0.removeAllChildren();
                me.addAni(me.nodes.shaizi0,arr[0],true);
            }else{
                // me.initScrollirwPos(100 - (me.DATA.chess/25*100));
                var arr = me.saiZiArr;
                me.nodes.donghua2.show();
                for(var i = 1;i < 11 ;i++){
                    me.nodes["shaizi"+i].removeAllChildren();
                };
                for(var i = 0 ; i < arr.length ;i++){
                    var node  = me.nodes["shaizi"+(i+1)];
                    node.removeBackGroundImage();
                    node.removeAllChildren();
                    var bool = (i == arr.length-1);
                    (function (node,num,idx,bool) {
                        node.setTimeout(function (){
                            me.addAni(node,num,bool);
                        }, i*100);
                    })(node,arr[i],i,bool)
                }
            }
        },
        // 初始化抽到的点数
        initArr :function () {
            var me = this ;
            me.saiZiArr = [];
            var conf = me.parentNode.conf.grid;
            for(var i = 0 ; i < me.stepArr.length ;i++){
                if(conf[me.stepArr[i]].number && conf[me.stepArr[i]].number.length > 0){
                    continue;
                }else{
                    if(i == 0){
                        me.saiZiArr.push(me.stepArr[i] - me.oldChess);
                    }else{
                        me.saiZiArr.push(me.stepArr[i] - me.stepArr[i-1]);
                    }
                }
            }
        },
        // 骰子的动画
        addAni:function (node,num,bool) {
            var me = this ;  
            G.class.ani.show({
                json: "huodong_qxsz_dh",
                addTo: node,
                repeat: false,
                autoRemove: false,
                onload:function (aninode) {
                    X.autoInitUI(aninode);
                    aninode.nodes.panel_sz.setBackGroundImage("img/2zhounian/shaizi"+num+".png",1);
                },
                onend:function (aninode) {
                    if(bool){
                        me.ui.setTimeout(function () {
                            node.parent.hide();
                            aninode.removeBackGroundImage();
                            me.aniMove();
                        }, 500);
                    };
                }
            });
        },
        // 小人移动的逻辑
        aniMove:function () {
            var me = this ;
            var nodeidx =  me.StepNumArr.splice(0,1);
            var node = me.nodes["zhuangtai"+nodeidx[0]];
            var node2 = me.nodes["zhuangtai"+(nodeidx[0]-1)];
            me.initScrollirwPos(nodeidx);
            var pos = node.getPosition();
            var pos1 = cc.p(pos.x + node.width/2,pos.y+node.height/2);
            var pos3 = node2.getPosition();
            var pos4 = cc.p(pos3.x + node2.width/2,pos3.y+node2.height/2);
            var pos2 = cc.p((pos1.x-pos4.x)/2+pos4.x,pos4.y+100);
            if(pos3.x > pos1.x){
                me.runAniNode.setScaleX(-1);
            }else{
                me.runAniNode.setScaleX(1);
            };
            me.runAniNode.runAni(0, "run", true);
            me.runAniNode.runActions([
                                cc.jumpTo(0.5/me.clickNum, pos1, 50, 1),
                                cc.callFunc(function () {
                                    me.runAniNode.runAni(0, "wait", true);
                                    me.oldPos = me.runAniNode.getPosition();
                                    if(me.StepNumArr.length > 0){
                                        me.aniMove();
                                    }else{
                                        if(me.stepArr2 && me.stepArr2.length > 0){
                                            me.danchou();
                                        }else{
                                            G.frame.jiangli.once("close",function () {
                                                me.showCheck();
                                            }).data({
                                                prize: me.prizeArr
                                            }).show();
                                            me.lock = false;
                                            if(me.DATA.chess == 0){
                                                me.setContents();
                                            }
                                        }
                                        G.frame.loadingIn.remove();
                                    }
                                })
                            ]);
        },
        onOpen: function () {
            var me = this;
            me.nodes.panle1.setTouchEnabled(false);
            cc.enableScrollBar(me.nodes.scrollirw);
            me.isChangePool = false;
            // me.nodes.scrollirw.setTouchEnabled(false);
             me.action.play("wait", true);
            me.DATA = me.parentNode.DATA;
            me.bindBTN();
            me.initUI();
            me.initTouziNum();
            me.refreshPanel();
            me.lock = false;
        },
        onShow: function () {
            var me = this ;
        },
        // 移动视角
        initScrollirwPos:function (pos) {
            var me = this ; 
            me.nodes.scrollirw.jumpToPercentVertical(pos > 13 ? 0 : 100);
        },
        initUI:function () {
            var me = this ;
            var timeNode  = me.ui.finds("txt_sz");
            if(me.DATA.rtime - G.time > 24 * 3600 * 2) {
                timeNode.setString(X.moment(me.DATA.rtime - G.time));
            }else {
                X.timeout(timeNode,me.DATA.rtime, function () {
                    G.tip_NB.show(L("HUODONG_HD_OVER"));
                    me.parentNode.remove();
                })
            };
        },
        onShow: function () {
            var me = this;

        },
        initTouziNum :function () {
            var me = this ;
            var need = me.parentNode.conf.chess.need[0];
            ownNum = G.class.getOwnNum(need.t, need.a);
            me.nodes.text_sl1.setString(ownNum+"/"+need.n);
        },
        // 初始化小人的位置
        setContents: function () {
            var me = this;
            me.initScrollirwPos(me.DATA.chess);
            var node = me.nodes["zhuangtai"+(me.DATA.chess+1)];
            var pos =node.getPosition();
            pos1 = cc.p(pos.x + node.width/2,pos.y+node.height/2);
            me.oldPos = pos1;
            if(me.runAniNode){
                me.runAniNode.setPosition(pos1);
            }else{
                var pos = me.nodes["zhuangtai"+(me.DATA.chess+1)].getPosition();
                // X.addSpine({
                //     model: "11011_run",
                //     parent: me.nodes.scrollirw,
                //     pos: pos1,
                //     callbackNode: function (node) {
                //         node.setScale(0.5);
                //         me.runAniNode = node;
                //         node.runAni(0, "wait", true);
                //     }
                // });
              
                 X.spine.show({
                    json:'spine/ruanniguai_run.json',
                    addTo : me.nodes.scrollirw,
                    cache:true,
                    x:pos1.x,
                    y:pos1.y,
                    autoRemove:false,
                    onload : function(node){
                        // node.setScale(0.5);
                        me.runAniNode = node;
                        node.runAni(0, "wait", true);
                    }
                });
            
            }
        },
    })
})();