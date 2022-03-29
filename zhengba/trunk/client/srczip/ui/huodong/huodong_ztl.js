/**
 * Created by 嘿哈 on 2020/3/5.
 */
(function () {
//征讨令
    G.class.huodong_ztl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_ztl.json");
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            //描述
            var rh = X.setRichText({
                parent:me.nodes.panel_title,
                str:L("ZHENGTAOLING1"),
                color:"#fff8e1",
                size:20,
                outline:"#000000"
            });
            me.nodes.btn_bangzhu.click(function(){
                G.frame.help.data({
                    intr:L("TS62")
                }).show();
            })
        },
        onShow:function(){
            var me = this;
            me.refreshPanel();
            me.getNeedExp();
        },
        //求每一档需要的经验
        getNeedExp:function(){
            var me = this;
            me.needconf = {};
            var arr = X.keysOfObject(G.gc.zhengtao.base.exp);
            for(var i = 0; i < arr.length;i++){
                var exp = 0;
                for(var j = 0; j <= i; j++){
                    exp += parseInt(G.gc.zhengtao.base.exp[arr[j]]);
                }
                me.needconf[arr[i]] = exp;
            }
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
                //倒计时
                if(me.DATA.endtime - G.time >24*3600){
                    me.nodes.txt_time.setString(X.moment(me.DATA.endtime - G.time));
                }else {
                    X.timeout(me.nodes.txt_time,me.DATA.endtime);
                }
            });
        },
        setContents:function(){
            var me = this;
            //荣耀值显示
            me.nodes.ico.removeBackGroundImage();
            me.nodes.ico.setBackGroundImage('img/public/token/token_ryz.png',1);
            me.nodes.wz_sz.setString(me.totalexp);
            //判断直接跳到哪个位置,优先级可领取，激活后可领取，激活领取
            var jumpindex = 0;
            for(var i in me.needconf){
                var exp = me.needconf[i];
                if(me.totalexp >= exp && !X.inArray(me.DATA.receive.base,i) && !X.inArray(me.DATA.receive.jinjie,i)){//普通领取
                    jumpindex = i;
                    break;
                }else if(X.inArray(me.DATA.receive.base,i) && !X.inArray(me.DATA.receive.jinjie,i) && me.DATA.jinjie == 1){//激活领取
                    jumpindex = i;
                    break;
                }else if(X.inArray(me.DATA.receive.base,i) && !X.inArray(me.DATA.receive.jinjie,i) && me.DATA.jinjie == 0){//激活后领取
                    jumpindex = i;
                    break;
                }else if(me.totalexp < exp){//不可领取
                    jumpindex = i;
                    break;
                }
            }
            me.nodes.panel_ss.removeBackGroundImage();
            if(me.DATA.jinjie == 0){//进阶征讨令显示
                me.nodes.btn_buy.show();
                me.nodes.btn_txt.setString(L("ZHENGTAOLING3"));
                me.nodes.panel_ss.setBackGroundImage('img/ztl/img_ztl_ztl.png',1);
                me.nodes.btn_buy.click(function(){
                    G.frame.ztl_jinjie.data({
                        type:"jinjie",
                        prize:me.DATA.prize
                    }).show();
                })
            }else if(G.time >= me.DATA.buytime && me.DATA.lv < X.keysOfObject(G.gc.zhengtao.base.exp).length - 1){//购买英勇值显示
                me.nodes.btn_buy.show();
                me.nodes.btn_txt.setString(L("ZHENGTAOLING4"));
                me.nodes.panel_ss.setBackGroundImage('img/ztl/img_ztl_yyz.png',1);
                me.nodes.btn_buy.click(function(){
                    G.frame.ztl_jinjie.data({
                        type:"buy",
                        exp:me.totalexp,
                        prize:me.DATA.prize,
                        conf:me.needconf
                    }).show();
                })
            }else {
                me.nodes.btn_buy.hide();
                me.nodes.panel_ss.setBackGroundImage('img/ztl/img_ztl_ztl.png',1);
            }
            if(G.time>=me.DATA.ctime+G.gc.zhengtao.base.chongzhiday*24*60*60){
                me.nodes.btn_cz.show();
                me.nodes.btn_cz.click(function (sender) {
                    G.frame.alert.data({
                        sizeType: 2,
                        cancelCall: null,
                        okCall: function () {
                            G.ajax.send("zhengtao_reset", [], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    me.DATA=d.d;
                                    me.totalexp =  0;//自己总的经验
                                    for (var i = 0; i <= me.DATA.lv; i ++ ){
                                        me.totalexp += parseInt(G.gc.zhengtao.base.exp[i]);
                                    }
                                    me.totalexp = me.totalexp + me.DATA.exp;
                                    me.setContents();
                                    //倒计时
                                    if(me.DATA.endtime - G.time >24*3600){
                                        me.nodes.txt_time.setString(X.moment(me.DATA.endtime - G.time));
                                    }else {
                                        X.timeout(me.nodes.txt_time,me.DATA.endtime);
                                    }
                                    me.getNeedExp();
                                }
                            })
                        },
                        richText: L("ZHENGTAOLING7"),
                    }).show();
                })
            }else{
                me.nodes.btn_cz.hide();
            }
            var data = X.keysOfObject(me.DATA.prize);
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data,pos) {
                    ui.show();
                    ui.setSwallowTouches(false);
                    me.setItem(ui, data,pos[0]);
                }, null, null, 0, 0);
                table.setData(data);
                table.reloadDataWithScroll(true);
                me.table._table.scrollToCell(jumpindex);//跳到指定位置
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            
        },
        setItem:function(ui,id,index){
            var me = this;
            X.autoInitUI(ui);
            ui.setName('list'+ index);
            var data  = me.DATA.prize[id];
            var needexp = me.needconf[id];

            ui.zIndex = index;
            if(ui.getParent()){
                ui.getParent().zIndex = index;
            }else{
                ui.setTimeout(function(){
                    if(cc.isNode(ui)){
                        ui.getParent().zIndex = index;
                    }
                },20);
            }

            //按钮状态:不能领，可领，进阶领取，已领取
            G.removeNewIco(ui.nodes.btn);
            if(X.inArray(me.DATA.receive.base,index) && me.DATA.jinjie == 0){//只领取了普通奖励，显示进阶领取
                ui.nodes.img_ylq.hide();
                ui.nodes.btn.setBtnState(true);
                ui.nodes.btn.show();
                ui.nodes.btn_txt1.setString(L("ZHENGTAOLING2"));
                ui.nodes.btn.loadTextureNormal("img/public/btn/btn2_on.png",1);
                ui.nodes.btn_txt1.setTextColor(cc.color(G.gc.COLOR.n12));
            }else if(X.inArray(me.DATA.receive.jinjie,index)){//领取了额外奖励，显示已领奖
                ui.nodes.img_ylq.show();
                ui.nodes.btn.hide();
            }else if(index <= me.DATA.lv){//可领取
                ui.nodes.img_ylq.hide();
                ui.nodes.btn.show();
                ui.nodes.btn.setBtnState(true);
                ui.nodes.btn_txt1.setString(L("LQ"));
                ui.nodes.btn.loadTextureNormal("img/public/btn/btn1_on.png",1);
                ui.nodes.btn_txt1.setTextColor(cc.color(G.gc.COLOR.n13));
                G.setNewIcoImg(ui.nodes.btn);
                ui.nodes.btn.finds('redPoint').setPosition(118,45);
            }else {//不可领取
                ui.nodes.img_ylq.hide();
                ui.nodes.btn.show();
                ui.nodes.btn.setBtnState(false);
                ui.nodes.btn_txt1.setString(L("LQ"));
                ui.nodes.btn_txt1.setTextColor(cc.color(G.gc.COLOR.n15));
            }
            ui.nodes.btn.id = id;
            ui.nodes.btn.click(function(sender,type){
                if(me.DATA.jinjie == 1){//已进阶
                    me.ajax("zhengtao_receive", [sender.id,false], function (str, d) {
                        if(d.s == 1) {
                            G.frame.jiangli.data({
                                prize: d.d.prize
                            }).show();
                            if(!X.inArray(me.DATA.receive.base,sender.id)) me.DATA.receive.base.push(sender.id);
                            if(!X.inArray(me.DATA.receive.jinjie,sender.id)) me.DATA.receive.jinjie.push(sender.id);
                            me.setContents();
                            G.hongdian.getData("zhengtao", 1, function () {
                                G.frame.huodong.checkRedPoint();
                            })
                        }
                    });
                }else {
                    if(X.inArray(me.DATA.receive.base,sender.id)){//打开进阶界面
                        G.frame.ztl_jinjie.data({
                            type:"jinjie",
                            prize:me.DATA.prize
                        }).show();
                    }else {//领取普通奖励
                        me.ajax("zhengtao_receive", [sender.id,false], function (str, d) {
                            if(d.s == 1) {
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).show();
                                if(!X.inArray(me.DATA.receive.base,sender.id)) me.DATA.receive.base.push(sender.id);
                                me.setContents();
                                G.hongdian.getData("zhengtao", 1, function () {
                                    G.frame.huodong.checkRedPoint();
                                })
                            }
                        });
                    }
                }
            });

            X.render({
                ico_item1:function(node){
                    var itemarr1 = [];
                    for (var i = 0; i < data.base.length; i++) {
                        var paize = G.class.sitem(data.base[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        paize.setGet(false);
                        if(X.inArray(me.DATA.receive.base,index)){
                            paize.setGet(true,"img_ysq_bg","get");
                        }
                        itemarr1.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, itemarr1,1,10,5);
                },
                ico_item2:function(node){
                    var itemarr2 = [];
                    for (var i = 0; i < data.jinjie.length; i++) {
                        var paize = G.class.sitem(data.jinjie[i]);
                        G.frame.iteminfo.showItemInfo(paize);
                        paize.setGet(false);
                        if(me.DATA.jinjie == 0){//未激活锁住
                            paize.setGet(true,"img_suo","suo");
                            paize.background.loadTexture('img/public/ico/ico_bg_hui.png', 1);
                        }else {
                            paize.background.loadTexture("img/public/ico/ico_bg" + paize.conf.color + '.png', 1);
                            if(X.inArray(me.DATA.receive.jinjie,index)){
                                paize.setGet(true,"img_ysq_bg","get");
                            }
                        }
                        itemarr2.push(paize);
                    }
                    node.setTouchEnabled(false);
                    X.left(node, itemarr2,1,10,5);
                },
                txt_jdwz:needexp,
            },ui.nodes);

            //进度条
            X.enableOutline(ui.nodes.txt_jdwz,"#441D00",2);
            //第一个不显示进度条
            if(index == 0){//第一个 list不放进度条
                ui.nodes.list_jdt1.hide();
                ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian1.png",1);
            }else {
                ui.nodes.list_jdt1.show();
                ui.nodes.list_jdt1.y = 153;
                if(me.DATA.lv < X.keysOfObject(G.gc.zhengtao.base.exp).length - 1){//总进度没满
                    if(index <= me.DATA.lv+1){
                        if(me.totalexp < needexp){//当前阶段的进度未满
                            ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian2.png",1);
                            ui.nodes.img_jdt.setPercent((me.totalexp - me.needconf[index-1] ) / (needexp - me.needconf[index-1]) * 100);
                        }else {
                            ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian1.png",1);
                            ui.nodes.img_jdt.setPercent(me.totalexp / needexp * 100);
                        }
                    }else {
                        ui.nodes.img_jdt.setPercent(0);
                        ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian2.png",1);
                    }
                }else {//进度满了
                    ui.nodes.img_jdt.setPercent(me.totalexp / needexp * 100);
                    ui.nodes.img_jdt_tp.loadTexture("img/ztl/img_dian1.png",1);
                }
            }
            ccui.helper.doLayout(ui.nodes.list_jdt1);
        },
        getData: function(callback){
            var me = this;
            G.ajax.send("zhengtao_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    me.totalexp =  0;//自己总的经验
                    for (var i = 0; i <= me.DATA.lv; i ++ ){
                        me.totalexp += parseInt(G.gc.zhengtao.base.exp[i]);
                    }
                    me.totalexp = me.totalexp + me.DATA.exp;
                    callback && callback();
                }
            }, true);
        },
    });
})();