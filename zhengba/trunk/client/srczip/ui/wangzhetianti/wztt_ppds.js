/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wztt_ppds';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.preLoadRes = ["event4.png","event4.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            G.frame.loadingIn.show();
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            G.frame.loadingIn.remove();
        },
        onShow: function () {
            var me = this;
            var data = me.data().headdata[1];
            //
            X.render({
                txt_name: "???",
                panel_rw: function (node) {
                    var head = G.class.shead(data);
                    head.setPosition(node.width / 2, node.height / 2);
                    node.addChild(head);
                },
                txt_wzs: function (node) {
                    var conf = G.class.getDan(data.star);
                    node.setBackGroundImage("img/wztt/img_tt_jd" + conf.dan + "-" + conf.step + ".png", 1);
                }
            }, me.nodes);

            // me.ui.setTimeout(function () {
            //     me.remove();
            // }, 1500);
            me.setContents();
        },
        setContents:function () {
            var me  = this ;
            me.nodes.listview.removeAllChildren();

            var txtArr  = ["sousuo_txt1","sousuo_txt3","sousuo_txt2","sousuo_txt1","sousuo_txt3","sousuo_txt2"];
            for(var i = 0; i < txtArr.length; i++){
                var list = me.nodes.list_t.clone();
                me.setItem(list,txtArr[i]);
                me.nodes.listview.pushBackCustomItem(list);
            }
            me.nodes.listview.setItemsMargin(5);
            me._initListY = me.nodes.listview.y;
            // for(var i = 0;  i < me.nodes.listview.children.length; i++){
            //     var node = me.nodes.listview.children[i];
            //     node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
            // }

            me.listview1 = me.nodes.listview.clone();
            me.nodes.panel_list.addChild(me.listview1);
            me.listview1.setPosition(me.nodes.listview.x, me.nodes.listview.y + me.nodes.listview.height + 5);
            me.listview1.setName('listview1');
            me.listview1.removeAllChildren();
            me.listview1.setTouchEnabled(false);
            for(var i = 0; i < txtArr.length; i++){
                var list = me.nodes.list_t.clone();
                me.setItem(list,txtArr[i]);
                me.listview1.pushBackCustomItem(list);
            }
            me.listview1.setItemsMargin(5);
            me.startRun();
        },
        startRun:function(){
            var me = this;
            me._spaceY = 5;//每个item的间距
            me._state = 0;
            me._jump = false;
            me._initspeed = 0.12;//初始移动时间间隔/100，不能在duration做小数的--，会有精度问题
            me._maxspeed = 1;//最大速度间隔
            me.rollstype = 1;
            me.speedup = 1;//达到最大速度后转了几圈
            me.ifonce = 1;
            me.run();
        },
        run:function(){
            var me = this;
            //变速控制
            if(me._state == 0){//加速
                me._initspeed -= 0.12;
                if(me._initspeed <= 0){
                    if (me.speedup >= 3){
                        me._state = -1;
                        me._jump = true;
                    }else {
                        me._initspeed = 0.12;
                        me.speedup++;
                        // me.specialBg();
                    }
                }
            }else if(me._state == -1){//减速

                me._initspeed += 0.025*me.rollstype;
                me.rollstype += 2;
                // if(me.rollstype <= 11){
                //     me.changeBg();
                // }else {
                //     me.normalBg();
                // }
                if(me._initspeed >= me._maxspeed){
                    me._state = -2;
                }
            }else{//停止
                me.changeData();
                me.ui.setTimeout(function () {
                   me.remove();
                }, 1000);
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
                me.changeData();
                me.nodes.listview.stopAllActions();
                me.nodes.listview.runAction(cc.sequence(
                    //cc.moveBy(1, cc.p(0, -50)),
                    //cc.moveBy(1, cc.p(0, 50)),
                    cc.callFunc(function () {
                        me.ui.setTimeout(function () {
                            me.remove()       ;
                        }, 1000);
                    })
                ));
                return;
            }

        },
        // //特别模糊
        // specialBg:function(){
        //     var me = this;
        //     for(var i = 0;  i < me.nodes.listview.children.length; i++){
        //         var node = me.nodes.listview.children[i];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_mh2.png',1);
        //     }
        //     for(var j = 0;  j < me.listview1.children.length; j++){
        //         var node = me.listview1.children[j];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_mh2.png',1);
        //     }
        // },
        // //模糊背景
        // changeBg:function(){
        //     var me = this;
        //     for(var i = 0;  i < me.nodes.listview.children.length; i++){
        //         var node = me.nodes.listview.children[i];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_mh1.png',1);
        //     }
        //     for(var j = 0;  j < me.listview1.children.length; j++){
        //         var node = me.listview1.children[j];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_mh1.png',1);
        //     }
        // },
        // //正常背景
        // normalBg:function(){
        //     var me = this;
        //     for(var i = 0;  i < me.nodes.listview.children.length; i++){
        //         var node = me.nodes.listview.children[i];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
        //     }
        //     for(var j = 0;  j < me.listview1.children.length; j++){
        //         var node = me.listview1.children[j];
        //         node.nodes.panel_diban.setBackGroundImage('img/event/img_zp_bg3.png',1);
        //     }
        // },
        setItem:function (ui,data) {
            var me =this ;
            X.autoInitUI(ui);
            ui.show();
            X.render({
                txt_jl_wz:function (node) {
                    var rh = X.setRichText({
                        str:L(data),
                        parent:node,
                        size:22,
                    });
                    rh.x = node.width/2 - rh.width/2;
                    rh.y = -5;
                }
            },ui.nodes);
        },
        changeData:function () {
            var me = this;
            me.nodes.txt_name.setString(me.data().headdata[1].name || "");
        }
    });
    G.frame[ID] = new fun('wztt_zp.json', ID);
})();