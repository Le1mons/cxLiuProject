/**
 * Created by  on 2019//.
 */
(function () {
    //皮肤摇摇乐
    G.class.huodong_pfyyl = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_zp.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(false);
            //倒计时
            X.timeCountPanel(me.nodes.txt_sj_wt, me._data.rtime, {
                str: "<font color=#fff8e1>剩余时间：</font>" + (me._data.rtime - G.time > 24 * 3600 * 2 ? X.moment(me._data.rtime - G.time) : "{1}")
            });
            me.action.play('wait', true);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS59")
                }).show();
            });
            me.nodes.btn_jpdh.click(function () {
                G.frame.pfyyl_prize.data({
                    prize:me.DATA.info.duihuan,
                    _data:me._data,
                    gotarr:me.DATA.myinfo.gotarr,
                }).show();
            });
            me.nodes.btn_zzlbbtn.click(function () {
                me.ajax('huodong_use',[me._data.hdid,1,0],function (str,data) {
                    if(data.s == 1){
                        me.nodes.btn_zzlbbtn.setTouchEnabled(false);
                        me.prize = data.d.prize;
                        me.gettype = data.d.type;
                        me.action.play('wait2', true);
                        me.startRun();
                    }
                });
            },2000);
        },
        startRun:function(){
            var me = this;
            me._spaceY = 5;//每个item的间距
            me._state = 0;
            me._jump = false;
            me._initspeed = 0.08;//初始移动时间间隔/100，不能在duration做小数的--，会有精度问题
            me._maxspeed = 0.7;//最大速度间隔
            me.rollstype = 1;
            me.speedup = 1;//达到最大速度后转了几圈
            me.ifonce = 1;
            me.run();
        },
        refreshPanel:function () {
            var me = this;

            me.getData(function(){
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            me.nodes.ico_token.removeBackGroundImage();
            me.nodes.ico_token.setBackGroundImage(G.class.getItemIco('2060'),1);
            me.nodes.txt_pdwzlb.setString(G.class.getOwnNum('2060','item'));
            me.nodes.txt_sycs.setString(me.DATA.info.num - me.DATA.myinfo.val + "/" + me.DATA.info.num);//剩余次数
            me.nodes.btn_zzlbbtn.setTouchEnabled(me.DATA.info.num > me.DATA.myinfo.val);
            if(me.DATA.info.num <= me.DATA.myinfo.val){
                me.nodes.btn_zzlbbtn.loadTextureNormal("img/event/btn_zp_add2.png",1);
            }else {
                me.nodes.btn_zzlbbtn.loadTextureNormal("img/event/btn_zp_add.png",1);
                me.nodes.btn_zzlbbtn.loadTextureDisabled("img/event/btn_zp_add1.png",1)
            }

            var prizearr = [];
            for(var k = 0; k < G.gc.pfyyl.list.target.length; k++){
                var key = G.gc.pfyyl.list.target[k];
                prizearr.push(X.arrayRand(G.gc.pfyyl.showprize[key]));
            }

            me.nodes.listview.removeAllChildren();
            for(var i = 0; i < prizearr.length; i++){
                var list = me.nodes.list_t.clone();
                me.setItem(list,prizearr[i]);
                me.nodes.listview.pushBackCustomItem(list);
            }
            me.nodes.listview.setItemsMargin(5);
            me._initListY = me.nodes.listview.y;
            for(var i = 0;  i < me.nodes.listview.children.length; i++){
                var node = me.nodes.listview.children[i];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
            }

            me.listview1 = me.nodes.listview.clone();
            me.nodes.panel_list.addChild(me.listview1);
            me.listview1.setPosition(me.nodes.listview.x, me.nodes.listview.y + me.nodes.listview.height + 5);
            me.listview1.setName('listview1');
            me.listview1.removeAllChildren();
            me.listview1.setTouchEnabled(false);
            for(var i = 0; i < prizearr.length; i++){
                var list = me.nodes.list_t.clone();
                me.setItem(list,prizearr[i]);
                me.listview1.pushBackCustomItem(list);
            }
            me.listview1.setItemsMargin(5);
        },
        refreshInfo:function(){
            var me = this;
            me.nodes.txt_sycs.setString(me.DATA.info.num - me.DATA.myinfo.val + "/" + me.DATA.info.num);//剩余次数
            me.nodes.txt_pdwzlb.setString(G.class.getOwnNum('2060','item'));
            me.nodes.btn_zzlbbtn.setTouchEnabled(me.DATA.info.num > me.DATA.myinfo.val);
            if(me.DATA.info.num <= me.DATA.myinfo.val){
                me.nodes.btn_zzlbbtn.loadTextureNormal("img/event/btn_zp_add2.png",1);
            }else {
                me.nodes.btn_zzlbbtn.loadTextureNormal("img/event/btn_zp_add.png",1);
                me.nodes.btn_zzlbbtn.loadTextureDisabled("img/event/btn_zp_add1.png",1)
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            X.render({
                panel_wp:function (node) {
                    var item = G.class.sitem(data);
                    item.setPosition(node.width/2, node.height/2);
                    node.removeAllChildren();
                    node.addChild(item);
                    G.frame.iteminfo.showItemInfo(item);
                },
                txt_jl_wz:function (node) {
                    var rh = X.setRichText({
                        str:G.class.getItem(data.t).name,
                        parent:node,
                        size:22,
                    });
                }
            },ui.nodes);
        },
        //特别模糊
        specialBg:function(){
            var me = this;
            for(var i = 0;  i < me.nodes.listview.children.length; i++){
                var node = me.nodes.listview.children[i];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_mh2.png',1);
            }
            for(var j = 0;  j < me.listview1.children.length; j++){
                var node = me.listview1.children[j];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_mh2.png',1);
            }
        },
        //模糊背景
        changeBg:function(){
            var me = this;
            for(var i = 0;  i < me.nodes.listview.children.length; i++){
                var node = me.nodes.listview.children[i];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_mh1.png',1);
            }
            for(var j = 0;  j < me.listview1.children.length; j++){
                var node = me.listview1.children[j];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_mh1.png',1);
            }
        },
        //正常背景
        normalBg:function(){
            var me = this;
            for(var i = 0;  i < me.nodes.listview.children.length; i++){
                var node = me.nodes.listview.children[i];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
            }
            for(var j = 0;  j < me.listview1.children.length; j++){
                var node = me.listview1.children[j];
                node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
            }
        },
        run:function(){
            var me = this;
            //变速控制
            if(me._state == 0){//加速
                me._initspeed -= 0.08;
                if(me._initspeed <= 0){
                    if (me.speedup >= 15){
                        me._state = -1;
                        me._jump = true;
                        me.changeData();
                    }else {
                        me._initspeed = 0.08;
                        me.speedup++;
                        me.specialBg();
                    }
                }
            }else if(me._state == -1){//减速

                me._initspeed += 0.025*me.rollstype;
                me.rollstype += 2;
                if(me.rollstype <= 11){
                    me.changeBg();
                }else {
                    me.normalBg();
                }
                if(me._initspeed >= me._maxspeed){
                    me._state = -2;
                }
            }else{//停止
                me.nodes.btn_zzlbbtn.setTouchEnabled(true);
                me.ui.setTimeout(function () {
                    G.frame.jiangli.data({//转完了之后再飘奖励
                        prize:[].concat(me.prize),
                    }).show();
                    me.getData(function () {
                        me.refreshInfo();
                    });
                    me.action.play('wait', true);
                }, 500);
            }

            //滚动逻辑
            if(me._state != -2){
                me.nodes.listview.runAction(cc.sequence(
                    cc.moveBy(me._initspeed, cc.p(0, -me.nodes.listview.height-me._spaceY)),
                    cc.callFunc(function(){
                        if(me.nodes.listview.y <= me._initListY-me.nodes.listview.height){
                            me.nodes.listview.setPositionY(me._initListY + me.nodes.listview.height + me._spaceY)
                        }
                    }, this)
                ));
                me.listview1.runAction(cc.sequence(
                    cc.moveBy(me._initspeed, cc.p(0, -me.listview1.height-me._spaceY)),
                    cc.callFunc(function(){
                        if(me.listview1.y <= me._initListY-me.listview1.height){
                            me.listview1.setPositionY(me._initListY + me.listview1.height + me._spaceY)
                        }
                    }, this),
                    cc.callFunc(function(){
                        setTimeout(me.run.bind(this));
                    },this)
                ))
            }else {
                me.nodes.listview.stopAllActions();
                me.nodes.listview.runAction(cc.sequence(
                    //cc.moveBy(1, cc.p(0, -50)),
                    //cc.moveBy(1, cc.p(0, 50)),
                    cc.callFunc(function () {
                        me.ui.setTimeout(function () {
                            me.nodes.btn_zzlbbtn.setTouchEnabled(true);
                            G.frame.jiangli.data({//转完了之后再飘奖励
                                prize:[].concat(me.prize),
                            }).show();
                            me.getData(function () {
                                me.refreshInfo();
                            });
                            me.action.play('wait', true);
                        }, 500);
                    })
                ));
                return;
            }

        },
        changeData:function(){
            var me = this;
            var prizechange = [];
            for(var k = 0; k < G.gc.pfyyl.list[me.gettype].length; k++){
                var key = G.gc.pfyyl.list[me.gettype][k];
                if(k == 2){
                    prizechange.push(me.prize[1]);
                }else {
                    prizechange.push(X.arrayRand(G.gc.pfyyl.showprize[key]));
                }
            }
            for(i = 0; i < me.nodes.listview.childrenCount; i++){
                var data = prizechange[i];
                var node = me.nodes.listview.children[i];
                var item = G.class.sitem(data);
                item.setPosition(node.nodes.panel_wp.width/2, node.nodes.panel_wp.height/2);
                node.nodes.panel_wp.removeAllChildren();
                node.nodes.panel_wp.addChild(item);
                G.frame.iteminfo.showItemInfo(item);
                var rh = X.setRichText({
                    str:item.conf.name,
                    parent:node.nodes.txt_jl_wz,
                    size:22,
                });
            }
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
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