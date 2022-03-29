/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-老萨满选择游戏
    var ID = 'shiyuanzhanchang_lsmxz';

    var fun = X.bUi.extend({
        extConf:{
            1:'太阳',
            2:'星星',
            3:'月亮',
        },
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
            // me.nodes.panel_ui.setTouchEnabled(false);
            // me.nodes.ui.setTouchEnabled(false);
            me.nodes.mask.click(function () {
               return;
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.eventconf = me.DATA.conf;
            me.ljcs = 0;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.defaultpos = [me.nodes.panel_kp1.x,me.nodes.panel_kp2.x,me.nodes.panel_kp3.x];
            // var saman = G.gc.syzccom.saman;
            me.nodes.img_rw2.show();
            // me.nodes.panel_rw2.removeBackGroundImage();
            // me.nodes.panel_rw2.removeAllChildren();
            me.nodes.txt_1.setString(L('syzc_12'));
            // X.setHeroModel({
            //     parent: me.nodes.panel_rw2,
            //     data: {
            //     },
            //     model: saman.lihui,
            //     callback:function (node) {
            //         node.setScale(0.6);
            //         node.y = 40;
            //     }
            // });
            me.nodes.txt_tip.setString(L('syzc_8'));
            me.ready();
        },
        ready:function () {
          var me = this;
            me.itemarr = [];
            var saman = G.gc.syzccom.saman;
            me.nodes.txt_ms.setString(saman.hua0);
            me.nodes.panel_btn2.hide();
            me.nodes.panel_btn1.hide();
            me.nodes.btn_h.hide();
            me.nodes.btn_lan.hide();
            me.nodes.panel_tip.hide();
            me.nodes.panel_1.hide();
            var arr = [1,2,3];
            X.arrayShuffle(arr);
            for (var i =1; i <= 3; i++){
                me.nodes['panel_kp'+i].removeAllChildren();
                me.nodes['panel_kp'+i].setPositionX(me.defaultpos[i-1]);
                var list = me.nodes.list.clone();
                list.show();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                X.autoInitUI(list);
                list.nodes.panel_kp.removeBackGroundImage();
                list.nodes.panel_kp.setBackGroundImage('img/shiyuanzhanchang/img_kp'+arr[i-1]+'.png',1);
                me.nodes['panel_kp'+i].code = arr[i-1];
                me.nodes['panel_kp'+i].setTouchEnabled(false);
                me.itemarr.push(me.nodes['panel_kp'+i]);
                me.nodes['panel_kp'+i].addChild(list);
            }
            me.nodes.btn_lan.show();
            me.nodes.txet_lan.setString('开始');
            me.nodes.btn_lan.click(function (sender) {
                me.nodes.panel_tip.show();
                me.nodes.panel_1.show();
                me.randomX = X.rand(1,3);
                me.nodes.txt_2.setString(X.STR(G.gc.syzccom.saman.hua1,me.extConf[ me.randomX]));
                sender.setTouchEnabled(false);
                me.ui.setTimeout(function () {
                    me.start();
                    sender.setTouchEnabled(true);
                },1500);
            });
            me.xiaohao();
        },
        xiaohao:function(shibai,max){
          var me = this;
            var img = new ccui.ImageView(G.class.getItemIco(me.eventconf.prize[0].t), 1);
            if (me.ljcs == 0 || shibai){
                var ljnum = 0;
            } else {
                var num =0;
                for (var i=0;i<me.ljcs;i++){
                   num+=G.gc.syzccom.saman.beishu[i];1
                }
                var ljnum = me.eventconf.prize[0].n*num;
            }
            if (max){
                me.nodes.txt_lj.hide();
                me.nodes.txt_hd.hide();
                me.nodes.txt_lj1.show();
                var str = X.STR(L("syzc_11"), ljnum);
                me.nodes.txt_lj1.removeAllChildren();
                var rh = X.setRichText({
                    parent:me.nodes.txt_lj1,
                    str:str,
                    anchor: {x: 0, y: 0.5},
                    color:"#804326",
                    node:img,
                    size:20,
                });
                rh.setPosition(me.nodes.txt_lj1.width/2-rh.trueWidth()/2,me.nodes.txt_lj1.height/2-rh.trueHeight()/2);
            } else {
                me.nodes.txt_lj.show();
                me.nodes.txt_hd.show();
                me.nodes.txt_lj1.hide();
                var str = X.STR(L("syzc_6"), ljnum);
                me.nodes.txt_lj.removeAllChildren();
                var rh = X.setRichText({
                    parent:me.nodes.txt_lj,
                    str:str,
                    anchor: {x: 0, y: 0.5},
                    color:"#804326",
                    node:img,
                    size:20,
                });
                rh.setPosition(me.nodes.txt_lj.width/2-rh.trueWidth()/2,me.nodes.txt_lj.height/2-rh.trueHeight()/2);
                //右边
                var img1 = new ccui.ImageView(G.class.getItemIco(me.eventconf.prize[0].t), 1);
                var str1 = X.STR(L("syzc_7"),me.eventconf.prize[0].n * G.gc.syzccom.saman.beishu[me.ljcs]);
                me.nodes.txt_hd.removeAllChildren();
                var rh1 = X.setRichText({
                    parent:me.nodes.txt_hd,
                    str:str1,
                    anchor: {x: 0, y: 0.5},
                    color:"#804326",
                    node:img1,
                    size:20,
                });
                rh1.setPosition(me.nodes.txt_hd.width/2-rh1.trueWidth()/2,me.nodes.txt_hd.height/2-rh1.trueHeight()/2);
            }
        },
        start:function () {
            var me = this;
            me.nodes.panel_tip.hide();
            me.nodes.btn_lan.hide();
            for (var i=0;i<me.itemarr.length;i++){
                me.itemarr[i].getChildren()[0].nodes.panel_kp.removeBackGroundImage();
                me.itemarr[i].getChildren()[0].nodes.panel_kp.setBackGroundImage('img/shiyuanzhanchang/img_kpbg.png',1);
            }
            var posarr = [me.itemarr[0].x,me.itemarr[1].x,me.itemarr[2].x];
            var arr = [[3,1,2],[2,3,1],[1,2,3],[3,1,2],[1,2,3],[3,1,2],[1,2,3],[2,3,1],[3,1,2],[2,3,1]];
            var move = function (num) {
                var movearr = arr[num];
                if (!movearr){
                    me.xuanze();
                    return;
                }
                for (var i=0;i<3;i++){
                    (function (idx) {
                        cc.isNode(me.itemarr[idx]) && me.itemarr[idx].runActions([
                            cc.moveTo(0.6, cc.p(posarr[movearr[idx]-1],me.itemarr[idx].y)),
                            cc.callFunc(function () {
                                if (idx==2){
                                    move(num+1);
                                }
                            })
                        ]);
                    })(i)
                }
            };
            move(0);
        },
        xuanze:function () {
            var me = this;
            me.nodes.txt_2.setString(G.gc.syzccom.saman.hua2);
            for (var i=0;i<me.itemarr.length;i++){
                me.itemarr[i].setTouchEnabled(true);
                me.itemarr[i].click(function (sender,type) {
                   if (sender.code == me.randomX){
                       sender.getChildren()[0].nodes.panel_kp.setBackGroundImage('img/shiyuanzhanchang/img_kp'+sender.code+'.png',1);
                       sender.getChildren()[0].nodes.img_gou.show();
                       //猜对了
                       me.success();
                   }else {
                       sender.getChildren()[0].nodes.panel_kp.setBackGroundImage('img/shiyuanzhanchang/img_kp'+sender.code+'.png',1);
                       sender.getChildren()[0].nodes.img_cha.show();
                        me.lose();
                        me.xiaohao(true);
                   }
                });
            }
        },
        success:function () {
            var me = this;
            for (var i=0;i<me.itemarr.length;i++){
                me.itemarr[i].setTouchEnabled(false);
            };

            me.ljcs+=1;
            if (me.ljcs>=3){
                me.nodes.txt_2.setString(G.gc.syzccom.saman.hua5);
                //说明已到最大
                me.xiaohao(false,true);
                me.nodes.panel_btn2.show();
            }else {
                me.xiaohao();
                me.nodes.txt_2.setString(G.gc.syzccom.saman.hua3);
                me.nodes.panel_btn1.show();
                me.nodes.btn_h.show();
            }
            //领取并离开
            me.nodes.btn_lan2.click(function () {
                me.leave();
            });
            me.nodes.btn_lan1.click(function () {
                me.leave();
            });
            me.nodes.btn_h.click(function () {
               me.ready();
            });
        },
        lose:function () {
            var me = this;
            me.ljcs = 0;
            me.nodes.txt_2.setString(G.gc.syzccom.saman.hua4);
            for (var i=0;i<me.itemarr.length;i++){
                me.itemarr[i].setTouchEnabled(false);
            };
            me.nodes.btn_lan.show();
            me.nodes.txet_lan.setString('离开');
            me.nodes.btn_lan.click(function () {
                me.leave();
            })
        },
        leave:function () {
            var me = this;
            G.DAO.shiyuanzhanchang.event(me.data().idx, false,{"winnum":me.ljcs}, function(dd){
                //
                if (dd.prize && dd.prize.length>0){
                    G.frame.jiangli.data({
                        prize: dd.prize
                    }).show();
                }
                me.DATA.map.refreshGrids(me.data().idx);
                me.ui.setTimeout(function(){
                  me.remove();
                  }, 100);
            },null, me);
        }
    });
    G.frame[ID] = new fun('shiyuan_tk5.json', ID);
})();