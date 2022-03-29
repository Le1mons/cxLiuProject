/**
 * Created by
 */

(function () {
    //幸运骰子
    var ID = 'sf_xingyuntouzi';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.isAni = false;
            me.myNum = 6;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS116')
                }).show();
            });
            me.nodes.Panel_hhks.hide();
            me.nodes.Panel_bangzhu.setTouchEnabled(false);
            me.ui.finds('Image_bz').hide();
        },
        initUI:function(){
            var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                     var rtime = X.getTodayZeroTime() + 24*3600;
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.DAO.springfestival.getServerData(function () {
                            me.remove();
                        });
                    }, null, {
                        showDay: true
                    });
                },
                txt_sj1:'重置时间:',
                txt_sj4:6,
                btn_lan:function (node) {
                    node.click(function (sender,type) {
                        if (me.nowType == 'me' && me.myNum<=0 && !sender.state)return;
                        if (me.isAni) return;
                        me.nowType = 'me';
                        if (sender.state){
                            if (sender.state=='gameend'){
                                me.gameEnd();
                            } else if (sender.state=='reset') {
                                me.resetGame();
                            }
                        } else {
                            me.touZiRandAniMe(me.myNum);
                            me.myNum -- ;
                            me.nodes.txt_sj4.setString(me.myNum);
                        }
                    },500)
                },
                Panel_bangzhu:function (node) {
                  node.click(function (sender,type) {
                     me.ui.finds('Image_bz').hide();
                      me.nodes.Panel_bangzhu.setTouchEnabled(false);
                  });
                },
                btn_gz:function (node) {
                    node.click(function (sender,type) {
                        if ( me.ui.finds('Image_bz').visible){
                            me.ui.finds('Image_bz').hide();
                            me.nodes.Panel_bangzhu.setTouchEnabled(false);
                        } else {
                            me.ui.finds('Image_bz').show();
                            me.nodes.Panel_bangzhu.setTouchEnabled(true);
                        }
                    });
                },
                btn_lan1:function (node) {
                    //再来一次
                    node.click(function (sender,type) {
                        me.nodes.Panel_hhks.hide();
                        me.resetGame();
                    });
                },
                btn_lan2:function (node) {
                    //退出
                    node.click(function (sender,type) {
                        me.remove();
                    });
                }
            }, me.nodes);
            if (!X.cacheByUid('openteheGz')){
                me.nodes.btn_gz.triggerTouch(2);
                X.cacheByUid('openteheGz',1);
            }
        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.show();
            });
            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        onShow: function () {
            var me = this;
            me.myTzNumArr = {
                '1':0,
                '2':0,
                '3':0,
                '4':0,
                '5':0,
            };
            me.otherTzNumArr = {
                '1':0,
                '2':0,
                '3':0,
                '4':0,
                '5':0,
            };
            me.nodes.btn_lan.setTouchEnabled(false);
            me.showAttr();
            me.initUI();
            me.initTz();
            me.guochangLay('1',1,false,function () {
                me.nowType = 'other';
                me.otherStart();
            });
        },
        guochangLay:function(code,time,showbtn,callback){
            var me = this;
            var img = {
                '1':'img_wdhhsb',//敌方回合
                '2':'img_wdhhks',//wode回合
                '3':'img_hhsb',//回合失败
                '4':'img_hhsl',//回合胜利
            };
            me.nodes.Panel_hhks.show();
            me.nodes.Panel_bg1.setBackGroundImage('img/chunjiehuodong/'+img[code]+'.png',1);
            me.nodes.panel_btn2.setVisible(showbtn);
            me.nodes.panel_btn2.setTouchEnabled(false);
            me.nodes.panel_btn3.setVisible(showbtn);
            me.nodes.panel_btn3.setTouchEnabled(false);
            me.nodes.Panel_hhks.clearAllTimers();
            if (me.nodes.Panel_hhks.timer){
                me.nodes.Panel_hhks.clearTimeout(me.nodes.Panel_hhks.timer);
                delete me.nodes.Panel_hhks.timer;
            }
            if (time>0){
                me.nodes.Panel_hhks.timer  =  me.nodes.Panel_hhks.setTimeout(function () {
                    me.nodes.Panel_hhks.hide();
                    callback&&callback();
                },time*1000) ;
            }

        },
        initTz:function(){
          var me = this;
          me.otherArr = [];
            me.myTzArr = [];
            for (var i=0;i<5;i++){
                var list = me.nodes.list_wp.clone();
                list.idx = i+1;
                X.autoInitUI(list);
                list.show();
                list.setTouchEnabled(false);
                list.tznum = 0;
                list.nodes.panel_sz1.removeBackGroundImage();
                me.otherArr.push(list);
            }
            X.center(me.otherArr,me.nodes.panel_wp1);
            //我自己的
            for (var i=0;i<5;i++){
                var list = me.nodes.list_wp.clone();
                list.idx = i+1;
                X.autoInitUI(list);
                list.show();
                list.tznum = 0;
                list.setTouchEnabled(true);
                list.nodes.panel_sz1.removeBackGroundImage();
                list.click(function (sender,type) {
                    if (me.myTzNumArr[sender.idx] == 0 || me.isAni || me.gameOver || me.myNum<=0)return;
                    sender.nodes.panel_sz1.removeBackGroundImage();
                    sender.tznum = 0;
                    me.myTzNumArr[sender.idx] = 0;
                    me.gameClickEnd();
                });
                me.myTzArr.push(list);
            }
            X.center(me.myTzArr,me.nodes.panel_wp2);
        },

        otherStart:function(){
            var me = this;
            me.touziRandAniOther(6);

        },
        /**
         * 对面的回合，如果次数完了就可以到我的回合
         * 对面的回合，但是五个数已经全随机出来了，结束，到我的回合
         * 我的回合，但是五个色子都选完了，次数没完，结束到比大小
         * 我的回合，但是没次数了，最后一次就自动选上去，剩余的，然后比较大小
         */
        touziRandAniOther:function(csnum){
            var me = this;
            var moveidx = 0;
            me.needAniNode = [];//需要去移动的中间的骰子
            if (csnum<1){
                me.guochangLay('2',1,false,function () {
                    me.nodes.btn_lan.setTouchEnabled(true);//结束
                });
            }else {
                var synum = 0;
                for (var i in me.otherTzNumArr){
                    if (me.otherTzNumArr[i] == 0){
                        synum++;
                    }
                }
                if (synum == 0){
                    //对方结束了
                    me.guochangLay('2',1,false,function () {
                        me.nodes.btn_lan.setTouchEnabled(true);//结束
                    });
                    return;
                }
                var randArr = [X.rand(1,6),X.rand(1,6),X.rand(1,6),X.rand(1,6),X.rand(1,6)];
                var samearr = me.same(randArr);
                for (var i=1;i<=5;i++){
                    if (me.otherTzNumArr[i]<1){
                        if (csnum==1){
                            //最后一次随机
                            me.needAniNode.push(me.nodes['panel_szdh'+i]);
                        }else {
                            if (samearr.length > 0 && X.inArray(samearr,i)){
                                me.needAniNode.push(me.nodes['panel_szdh'+i]);
                            }
                        }
                    }
                    (function (idx) {
                        var node = me.nodes['panel_szdh'+idx];
                        node.idx = idx;
                        node.tznum = randArr[idx-1];
                        node.removeAllChildren();
                        node.removeBackGroundImage();
                        node.setTouchEnabled(false);
                        if (me.otherTzNumArr[idx]<1) {
                            node.show();
                            G.class.ani.show({
                                addTo:node,
                                json:'xinnian_touzi_dh',
                                cache:true,
                                repeat:false,
                                autoRemove:false,
                                onload:function(aninode,action){
                                    aninode.setScale(.55);
                                },
                                onend:function () {
                                    moveidx++;
                                    node.removeAllChildren();
                                    node.setBackGroundImage('img/chunjiehuodong/sz'+(randArr[idx-1])+'.png',1);
                                    if (moveidx == synum){
                                        me.ui.setTimeout(function () {
                                            me.touziCloneMove(csnum);
                                        },300);
                                    }
                                }
                            });
                        }else {
                            node.hide();
                        }
                    })(i)
                }
            }
        },
        touZiRandAniMe:function(csnum){
          var me = this;
          if(me.gameOver)return;
          var moveidx = 0;
          me.needAniNode = [];//需要去移动的中间的骰子
          if (csnum<1){
              me.nodes.btn_lan.setTouchEnabled(false);
              //比大小
              me.gameClickEnd();
          } else {
              var synum = 0;
              for (var i in me.myTzNumArr){
                  if (me.myTzNumArr[i] == 0){
                      synum++;
                  }
              }
              if (synum == 0){
                  //我方结束了
                  me.nodes.btn_lan.setTouchEnabled(false);
                  //比大小
                  me.gameClickEnd();
                  return;
              }
              me.isAni = true;
              var randArr = [X.rand(1,6),X.rand(1,6),X.rand(1,6),X.rand(1,6),X.rand(1,6)];
              for (var i=1;i<=5;i++){
                  if (me.myTzNumArr[i]<1){
                      if (csnum==1){
                          //说明是最后一次随机,不用自己选，需要选择一样的弄上去
                          if (me.myTzNumArr[i]<1){
                              me.needAniNode.push(me.nodes['panel_szdh'+i]);
                          }
                      }
                  }
                  (function (idx) {
                      var node = me.nodes['panel_szdh'+idx];

                      node.idx = idx;
                      node.tznum = randArr[idx-1];
                      node.removeAllChildren();
                      node.removeBackGroundImage();
                      node.click(function (sender,type) {
                          if (me.isAni)return;
                          sender.hide();
                          var itemClone = sender.clone();
                          itemClone.idx = sender.idx;
                          itemClone.show();
                          var pos = node.getWorldPosition();
                          itemClone.setPosition(pos);
                          itemClone.tznum = sender.tznum;
                          me.ui.addChild(itemClone);
                          me.playAniMove(itemClone,function () {
                              //如果我的五个搞完了，比赛结束
                              var __synum = 0;
                              for (var k in me.myTzNumArr){
                                  if (me.myTzNumArr[k] == 0){
                                      __synum++;
                                  }
                              }
                              if (__synum == 0){
                                  me.gameClickEnd();
                              }
                          });
                      });
                      if (me.nowType == 'me' && me.myTzNumArr[idx]<1) {
                          node.show();
                          G.class.ani.show({
                              addTo:node,
                              json:'xinnian_touzi_dh',
                              repeat:false,
                              cache:true,
                              autoRemove:false,
                              onload:function(aninode,action){
                                  aninode.setScale(.55);
                              },
                              onend:function () {
                                  moveidx++;
                                  node.setTouchEnabled(true);
                                  node.removeAllChildren();
                                  node.setBackGroundImage('img/chunjiehuodong/sz'+(randArr[idx-1])+'.png',1);
                                  if (moveidx == synum){
                                      me.isAni = false;
                                      if (csnum == 1){
                                          //最后一次自动上
                                          me.ui.setTimeout(function () {
                                              me.touziCloneMove(csnum);
                                          },300);
                                      }
                                  }
                              }
                          });
                      }else {
                          node.hide();
                      }
                  })(i)
              }
          }
        },
        touziCloneMove:function(csnum){
          var me = this;
          var needarr = me.needAniNode;
          var synum = needarr.length;
          if (synum<1){
              csnum--;
              if (me.nowType == 'other'){
                  me.touziRandAniOther(csnum);
              }
          }
          for (var i=0;i<needarr.length;i++){
              (function (idx) {
                  var node = needarr[idx];
                  node.hide();
                  var itemClone = node.clone();
                  itemClone.idx = node.idx;
                  itemClone.show();
                  var pos = node.getWorldPosition();
                  itemClone.setPosition(pos);
                  itemClone.tznum = node.tznum;
                  me.ui.addChild(itemClone);
                  me.playAniMove(itemClone,function () {
                      synum--;
                      if (synum==0){
                          csnum--;
                          if (me.nowType == 'other'){
                              me.touziRandAniOther(csnum);
                          }else {
                              //比大小
                                me.gameClickEnd();
                          }
                      }
                  });
              })(i)
          }
        },
        same:function(arr,end){
            var me = this;
            //每次随机之后，比对，相同数字最多的，排出来，如果不是第一次，需要和已经筛来的色子比对
            var old = 0;
            if (me.nowType == 'other' && !end){
                for (var i in  me.otherTzNumArr){
                    if (me.otherTzNumArr[i]!=0){
                        old = me.otherTzNumArr[i];
                        break;
                    }
                }
            }
            var obj = {
                '1':[],
                '2':[],
                '3':[],
                '4':[],
                '5':[],
                '6':[],
            };
            for (var i=0;i<arr.length;i++){
                if (old>0 && arr[i] == old){
                    //说明已经随机过几次了
                    obj[old].push(i+1);
                }else {
                    obj[arr[i]].push(i+1);
                }
            }
            if (old>0){
                return obj[old];
            } else {
                var max = 0;
                for (var i in obj){
                    if (obj[i].length>max){
                        max = obj[i].length;
                    }
                }
                if (max==1) return [];
                for (var i in obj){
                    if (obj[i].length == max){
                        return obj[i];
                        break;
                    }
                }
            }
        },
        playAniMove: function (node,callback) {
            var me = this;
            var posEnd;
            if (me.nowType == 'other') {
                var enArr = me.otherArr;
                me.otherTzNumArr[node.idx] = node.tznum;
            } else {
                var enArr = me.myTzArr;
                me.myTzNumArr[node.idx] = node.tznum;
            }
            posEnd = enArr[node.idx-1];
            cc.isNode(node) && node.runActions([
                cc.moveTo(0.2, posEnd.getWorldPosition()),
                cc.callFunc(function () {
                    cc.isNode(node) && node.removeFromParent();
                    posEnd.nodes.panel_sz1.setBackGroundImage('img/chunjiehuodong/sz'+node.tznum+'.png',1);
                    callback && callback();
                })
            ]);
        },
        gameClickEnd:function(){
            var me = this;
            var num = 0;
            for (var i in me.myTzNumArr){
                if (me.myTzNumArr[i]>0){
                    num++
                }
            }
            if (num==5 || me.myNum<1){
                me.nodes.btn_lan.state = 'gameend';
                me.nodes.txet_lan.setString('游戏结束');
            }else {
                me.nodes.btn_lan.state = '';
                me.nodes.txet_lan.setString('投掷');
            }

        },
        //比大小
        gameEnd: function () {
            var me = this;
            me.gameOver = true;
            me.nodes.txt_sj4.setString(0);
            var mysamenum = 0;
            if (me.getMytzColorNoSame()){
                mysamenum = 6;
            } else {
                var myarr = [];
                for (var i in me.myTzNumArr){
                    myarr.push(me.myTzNumArr[i]);
                }
                 mysamenum = me.same(myarr,true).length;
            }

            var otherarr = [];
            for (var i in me.otherTzNumArr){
                otherarr.push(me.otherTzNumArr[i]);
            }
            var  othersamenum = me.same(otherarr,true).length;
            if ((mysamenum==6 && othersamenum==5)  || (mysamenum >= othersamenum && mysamenum!=6)){
                if (G.DATA.springfestival.myinfo.gamenum<1){
                    //今天第一次胜利且今天没玩过
                    G.DAO.springfestival.xiaoyouxi(function (dd) {
                        if (dd.prize && dd.prize.length>0){
                            G.frame.jiangli.data({
                                prize: dd.prize,
                                type:'touzi'
                            }).show();
                        }
                    });
                }else {
                    me.guochangLay('4',0,true);
                }
            } else {
                me.guochangLay('3',0,true);
            }
            me.nodes.btn_lan.state = 'reset';
            me.nodes.txet_lan.setString('再来一次');
        },
        //我的五个花色都不一样
        getMytzColorNoSame:function(){
          var me = this;
            var myarr = [];
            for (var i in me.myTzNumArr){
              if (!X.inArray(myarr,me.myTzNumArr[i])){
                  myarr.push(me.myTzNumArr[i]);
              }
            }
            return myarr.length==5;
        },
        resetGame:function () {
            var me = this;
            me.myTzNumArr = {
                '1':0,
                '2':0,
                '3':0,
                '4':0,
                '5':0,
            };
            me.otherTzNumArr = {
                '1':0,
                '2':0,
                '3':0,
                '4':0,
                '5':0,
            };
            me.myNum = 6;
            me.nodes.txt_sj4.setString(me.myNum);
            me.nowType = 'other';
            me.gameOver = false;
            me.isAni = false;
            me.nodes.btn_lan.state = '';
            me.nodes.btn_lan.setTouchEnabled(false);
            me.nodes.txet_lan.setString('投掷');
            for (var i=0;i<me.otherArr.length;i++){
                me.otherArr[i].nodes.panel_sz1.removeBackGroundImage();
            }
            for (var i=0;i<me.myTzArr.length;i++){
                me.myTzArr[i].nodes.panel_sz1.removeBackGroundImage();
            }
            me.guochangLay('1',1,false,function () {
                me.otherStart();
            });
        }
    });
    G.frame[ID] = new fun('chunjie_xysz.json', ID);
})();