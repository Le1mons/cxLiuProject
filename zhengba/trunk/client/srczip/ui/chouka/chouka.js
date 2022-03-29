/**
 * Created by LYF on 2018/6/13.
 */
(function () {
    //抽卡
    var ID = 'chouka';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
            me.preLoadRes = ["ani_chouka.plist", "ani_chouka_png", "ani_chouka_taizi.plist", "ani_chouka_taizi.png",
                "ani_chouka_chongji.png", "ani_chouka_chongji.plist", "ck_gz_ht.png", "ck_gz_ht.plist", "chouka2.png", "chouka2.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L('TS1')
                }).show();
            });

            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.once("hide", function () {
                    me.setAttr();
                }).show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.once("hide", function () {
                    me.setAttr();
                    me.setNewList();
                }).show();
            });

            me.nodes.btn_yxjz.click(function () {
                G.frame.yxjz.show();
            });
        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openzhaohuan.mp3");
            me.ftime = ['putong','gaoji'];
            me.bgArr = ["pt", "gj", "yq"];
            me.nodes.loadingbar.setPercent(0);
            me.aniNode = [];
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
			G.guidevent.emit('choukaOpenOver');
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("jitan_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.nodes.panel_kp.hide();
            G.class.ani.show({
                json: "ani_choukajuese",
                x: me.nodes.ani_rw.width / 2,
                y: me.nodes.ani_rw.height / 2,
                addTo: me.nodes.ani_rw,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {

                }
            });
            G.class.ani.show({
                json: "ani_mofashu",
                x: me.nodes.ani_mfs.width / 2,
                y: 0,
                addTo: me.nodes.ani_mfs,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setAnchorPoint(0.5, 0);
                }
            });
            G.class.ani.show({
                json: "ani_lazhu",
                x: me.nodes.ani_lz.width / 2,
                y: 0,
                addTo: me.nodes.ani_lz,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setAnchorPoint(0.5, 0);
                }
            });
            G.class.ani.show({
                json: "chouka_light",
                x: me.nodes.ani_light.width / 2,
                y: me.nodes.ani_light.height / 2,
                addTo: me.nodes.ani_light,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setAnchorPoint(0.5, 0);
                }
            });
            G.class.ani.show({
                json: "ani_chuanghuguang",
                x: me.nodes.ani_light.width / 2 - 20,
                y: me.nodes.ani_light.height / 2 + 40,
                addTo: me.nodes.ani_light,
                repeat: true,
                autoRemove: false,
            });
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.mjhj) {
                G.setNewIcoImg(me.nodes.btn_yxjz);
            } else {
                G.removeNewIco(me.nodes.btn_yxjz);
            }
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
            G.hongdian.getData("herojitan", 1);
        },
        //倒计时，7天一个轮回
        showTimeOut:function(node){
            var me = this;
            var time = 1589731200;//更新0点时间戳
            var day = parseInt((G.time - time) / 86400);
            if(day < 0) day = 0;
            var index = parseInt(day / 7);//第几轮
            var endtime = time + (index+1)*7*24*60*60;
            X.timeout(node,endtime,function(){
                me.showTimeOut(node);
            },null,{showDay:true});
            node.setTextColor(cc.color("#77ef6b"));
            X.enableOutline(node,"#3b5741");
        },
        setContents: function () {
            var me = this;
            me.setItem();
            me.setAttr();
        },
        setItem: function () {
            var me = this;
            var conf = G.class.getConf("chouka");
            var keys = X.keysOfObject(conf);
            var num = parseInt(keys.length / 2);
            var isFree = true;
            var arr = [];
            me.nodes.list.hide();
            me.nodes.listview.setTouchEnabled(true);
            me.nodes.listview.removeAllChildren();
            cc.enableScrollBar(me.nodes.listview);
            for(var i = 0; i < num; i++){
                fun(i)
            }
            function fun(idx) {
                var list = me.nodes.list.clone();
                list.setName('list'+idx);
                var leftConf = conf[(idx + 1) * 2 - 1];
                var rightConf = conf[(idx + 1) * 2];
                var num = G.class.getOwnNum(rightConf.need[0].t, rightConf.need[0].a);
                list.show();
                X.autoInitUI(list);

                //倒计时
                if(idx == 1){
                    list.nodes.img_xssl.show();
                    me.showTimeOut(list.nodes.txt_sjs);
                }else {
                    list.nodes.img_xssl.hide();
                }
                
                //将祭祀中的免费召唤按钮映射出去方便新手指导中配置
                if(idx==0){
                	me.nodes.ptjs_btn_1 = list.nodes.btn_1;
                }else if(idx==1){
                	me.nodes.gjjs_btn_1 = list.nodes.btn_1;
                }
                list.nodes.btn_1.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                list.finds("text_mfsx").setTextColor(cc.color(G.gc.COLOR.n13));
                list.finds("text_yc").setTextColor(cc.color(G.gc.COLOR.n12));
                list.finds("text_sc").setTextColor(cc.color(G.gc.COLOR.n12));
                if(me.bgArr[idx] == "yq") list.nodes.text_mf.hide();
                if(me.DATA[me.ftime[idx]] && me.DATA[me.ftime[idx]].freenum < 1 && me.DATA[me.ftime[idx]].freecd && me.DATA[me.ftime[idx]].freecd - G.time > 0){
                    while (list.nodes.btn_1.getChildByTag(999)) {
                        list.nodes.btn_1.getChildByTag(999).removeFromParent();
                    }
                    X.timeout(list.nodes.text_djs, me.DATA[me.ftime[idx]].freecd, function () {
                        G.setNewIcoImg(list.nodes.btn_1, .95);
                        G.class.ani.show({
                            json: "ani_mianfeizhaohuan",
                            addTo: list.nodes.btn_1,
                            x: list.nodes.btn_1.width / 2,
                            y: list.nodes.btn_1.height / 2,
                            repeat: true,
                            autoRemove: false,
                            onload: function (node) {
                                node.setScale(1.2);
                                node.setTag(999);
                            }
                        });
                        isFree = false;
                        list.finds("text_mfsx").show();
                        list.nodes.btn_1.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                        list.nodes.text_mf.hide();
                        list.nodes.btn_ptyj1.hide();
                        list.nodes.text_sl1.hide();
                        list.finds("text_yc").hide();
                    })
                }else if(me.DATA[me.ftime[idx]] && me.DATA[me.ftime[idx]].freenum > 0){
                    G.setNewIcoImg(list.nodes.btn_1, .95);
                    G.class.ani.show({
                        json: "ani_mianfeizhaohuan",
                        addTo: list.nodes.btn_1,
                        x: list.nodes.btn_1.width / 2,
                        y: list.nodes.btn_1.height / 2,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node) {
                            node.setScale(1.2);
                            node.setTag(999);
                        }
                    });
                    isFree = false;
                    list.nodes.btn_1.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                    list.finds("text_mfsx").show();
                    list.nodes.text_mf.hide();
                    list.nodes.btn_ptyj1.hide();
                    list.nodes.text_sl1.hide();
                    list.finds("text_yc").hide();
                }
                list.nodes.img_ptjs.loadTexture("img/chouka/img_ck_" + me.bgArr[idx] + "js.png", 1);
                list.nodes.panel_dh.show();

                list.nodes.img_ptyj.loadTexture(G.class.getItemIco(rightConf.need[0].t), 1);
                if(me.bgArr[idx] == "gj"){
                    if(num < leftConf.need[0].n){
                        list.nodes.btn_ptyj1.loadTexture(G.class.getItemIco(leftConf.rmbmoney[0].t), 1);
                        list.nodes.text_sl1.setString(leftConf.rmbmoney[0].n);
                    }else{
                        list.nodes.btn_ptyj1.loadTexture(G.class.getItemIco(leftConf.need[0].t), 1);
                        list.nodes.text_sl1.setString(leftConf.need[0].n);
                    }
                    if(num < rightConf.need[0].n){
                        me.isRmbMoney = num < 1;
                        list.nodes.btn_ptyj2.loadTexture(G.class.getItemIco(rightConf.rmbmoney[0].t), 1);
                        list.nodes.text_sl2.setString(rightConf.rmbmoney[0].n - G.class.getOwnNum(2010, 'item') * 200);
                    }else{
                        list.nodes.btn_ptyj2.loadTexture(G.class.getItemIco(rightConf.need[0].t), 1);
                        list.nodes.text_sl2.setString(rightConf.need[0].n);
                    }
                }else{
                    list.nodes.btn_ptyj1.loadTexture(G.class.getItemIco(rightConf.need[0].t), 1);
                    list.nodes.btn_ptyj2.loadTexture(G.class.getItemIco(rightConf.need[0].t), 1);
                    list.nodes.text_sl1.setString(leftConf.need[0].n);
                    list.nodes.text_sl2.setString(rightConf.need[0].n);
                }
                list.nodes.btn_1.chouType = (idx + 1) * 2 - 1;
                list.nodes.btn_2.chouType = (idx + 1) * 2;
                var txtNum1 = list.nodes.btn_1.finds('text_sl1$');
                var txtNum2 = list.nodes.btn_2.finds('text_sl2$');

                X.enableOutline(txtNum1,'#000000');
                X.enableOutline(txtNum2,'#000000');

                list.nodes.text_sl.setString(num);
                if(!list.nodes.btn_1.data) list.nodes.btn_1.data = [];
                list.nodes.btn_1.click(function (sender, type) {
                    if(isFree){
                        if(me.bgArr[idx] == "gj"){
                            if(num < leftConf.need[0].n){
                                if(P.gud.rmbmoney < leftConf.rmbmoney[0].n){
                                    G.tip_NB.show(L("ZSBZ"));
                                    return;
                                }
                            }
                        }else{
                            // if(num < leftConf.need[0].n){
                            //     G.tip_NB.show(L("YJBZ"));
                            //     return;
                            // }
                        }
                    }
                    me.chou(list.nodes.btn_1.chouType, leftConf);
                });
                if(!list.nodes.btn_2.data) list.nodes.btn_2.data = [];
                list.nodes.btn_2.click(function (sender, type) {
                    if(me.bgArr[idx] == "gj"){
                        if(num < rightConf.need[0].n){
                            if (P.gud.rmbmoney < rightConf.rmbmoney[0].n - G.class.getOwnNum(2010, 'item') * 200) {
                                return G.tip_NB.show(L("ZSBZ"));
                            } else {
                                if (!X.cacheByUid("chouka1_hint") && num > 0 && num < 10) {
                                    return G.frame.hint.data({
                                        callback: function () {
                                            me.chou(list.nodes.btn_2.chouType, rightConf);
                                        },
                                        cacheKey: "chouka1_hint",
                                        txt: X.STR(L("CHOUKA_TS1"), G.class.getOwnNum(2010, 'item'),
                                            (10 - G.class.getOwnNum(2010, 'item')) * 200)
                                    }).show();
                                }
                            }
                        }
                    }
                    me.chou(list.nodes.btn_2.chouType, rightConf);
                });
                arr.push(list);
            }
            var temp = arr[1];
            arr[1] = arr[2];
            arr[2] = temp;
            for (var i = 0; i < arr.length; i ++) {
                me.nodes.listview.pushBackCustomItem(arr[i]);
            }
            var newList = me.nodes.list.clone();
            newList.show();
            newList.finds("img_ptyj$").loadTexture("img/public/token/token_yhsp.png", 1);
            newList.finds("btn_ptyj1$").loadTexture("img/public/token/token_yhsp.png", 1);
            newList.finds("btn_ptyj2$").loadTexture("img/public/token/token_yhsp.png", 1);
            newList.finds("btn_2$").hide();
            newList.finds("text_mf$").hide();
            newList.finds("text_sl1$").setString(999);
            X.enableOutline(newList.finds("text_sl1$"), "#000000", 1);
            me.nodes.listview.pushBackCustomItem(newList);
            arr.push(newList);
            me.setNewList();
            me.addListAni(arr);
        },
        addListAni: function(arr) {
            var obj = {
                0: 2,
                1: 1,
                2: 3,
                3: 4
            };

            for (var i = 0; i < arr.length; i ++) {
                G.class.ani.show({
                    json: "ani_yingxiongjitan_" + obj[i],
                    addTo: arr[i].finds("panel_dh$"),
                    x: 308,
                    y: 102,
                    repeat: true,
                    autoRemove: false
                });
            }
        },
        setNewList: function() {
            var me = this;
            var list = me.nodes.listview.children[3];
            X.autoInitUI(list);
            if(P.gud.vip < 3) {
                list.nodes.img_ptjs.loadTexture("img/chouka/img_ck_csjs2.png", 1);
                list.nodes.img_ptjs.setTouchEnabled(true);
                list.nodes.img_wjsdi.show();
                list.nodes.btn_1.hide();
                list.nodes.img_ptjs.click(function () {
                    G.tip_NB.show(L("GZJSCSJS"))
                })
            }else {
                list.nodes.btn_1.show();
                list.nodes.img_wjsdi.hide();
                list.nodes.img_ptjs.loadTexture("img/chouka/img_ck_csjs.png", 1);
            }
            list.nodes.text_sl.setString(me.DATA.jifen);
            list.nodes.txt_wjswz.setString("999");
            
            list.nodes.btn_1.click(function () {
                me.ajax("jitan_duihuan", [], function (str, data) {
                    if(data.s == 1) {
                        X.audio.playEffect("sound/zhaohuan.mp3");
                        if(G.frame.chouka_hdyx.isShow){
                            G.frame.chouka_hdyx.nodes.ico_yx.removeAllChildren();
                            for(var i = 0; i < 10; i ++){
                                G.frame.chouka_hdyx.nodes["ico_" + (i + 1)].removeAllChildren();
                            }
                        }
                        G.frame.chouka_hdyx.data({
                            hero:data.d.prize
                        }).show();
                        me.getData(function () {
                            me.setContents();
                            if (G.frame.chouka_hdyx.isShow) {
                                G.frame.chouka_hdyx.bindBtn();
                            }
                        });
                        try {
                            G.event.emit("leguXevent", {
                                type: 'track',
                                event: 'summon',
                                data: {
                                    summon_genre: '传说祭祀',
                                    summon_type: 1,
                                    summon_cost_num: 999,
                                    summon_cost_type: '积分',
                                    item_list: X.arrPirze(data.d.prize),
                                }
                            });
                        } catch (e) {
                            cc.error(e);
                        }
                    }else {
                        X.audio.playEffect("sound/dianji.mp3", false);
                    }
                })
            })
        },
        chou: function (type, data, bool) {
            var me = this;
            var num = type % 2 == 0? 10 : 1;
            var list = G.DATA.yingxiong.list;
            var keys = X.keysOfObject(list);
            cc.log('type, data, bool',type, data, bool);
            if(keys.length + num > G.DATA.heroCell.maxnum){
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        G.frame.yingxiong.show();
                    },
                    richText: L("YXLBYM"),
                }).show();
            }else{
                if(type == 4 && me.isRmbMoney && !X.cacheByUid("chouka1_hint") && !G.frame.hint.isShow) {
                    G.frame.hint.data({
                        callback: function () {
                            G.ajax.send("jitan_chouka", [type], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    G.event.emit("sdkevent", {
                                        event: "lottery",
                                        data:{
                                            lotteryType:data.name,
                                            consume:data.need,
                                            get:d.d.prize
                                        }
                                    });
                                    if(G.frame.chouka_hdyx.isShow){
                                        G.frame.chouka_hdyx.nodes.ico_yx.removeAllChildren();
                                        for(var i = 0; i < 10; i ++){
                                            G.frame.chouka_hdyx.nodes["ico_" + (i + 1)].removeAllChildren();
                                        }
                                    } else {
                                        X.audio.playEffect("sound/zhaohuan.mp3");
                                    }
                                    G.frame.chouka_hdyx.data({
                                        hero: d.d.prize,
                                        data: data,
                                        type: type,
                                        jifen: d.d.jifen,
                                        bool: bool
                                    }).show();
                                    me.getData(function () {
                                        me.setContents();
                                        if (G.frame.chouka_hdyx.isShow) {
                                            G.frame.chouka_hdyx.bindBtn();
                                        }
                                    });
                                }else{
                                    X.audio.playEffect("sound/dianji.mp3", false);
                                }
                            });
                        },
                        cacheKey: "chouka1_hint",
                        txt: X.STR(L("CHOUKA_TS1"), G.class.getOwnNum(2010, 'item'),
                        (10 - G.class.getOwnNum(2010, 'item')) * 200)
                    }).show();
                } else {
                    G.DATA.noClick = true;
                    G.ajax.send("jitan_chouka", [type], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.event.emit("sdkevent", {
                                event: "lottery",
                                data:{
                                    lotteryType:data.name,
                                    consume:data.need,
                                    get:d.d.prize
                                }
                            });
                            if(G.frame.chouka_hdyx.isShow){
                                G.frame.chouka_hdyx.nodes.ico_yx.removeAllChildren();
                                for(var i = 0; i < 10; i ++){
                                    G.frame.chouka_hdyx.nodes["ico_" + (i + 1)].removeAllChildren();
                                }
                            } else {
                                X.audio.playEffect("sound/zhaohuan.mp3");
                            }
                            G.frame.chouka_hdyx.data({
                                hero: d.d.prize,
                                data: data,
                                type: type,
                                jifen: d.d.jifen,
                                bool: bool
                            }).show();
                            me.getData(function () {
                                me.setContents();
                                if (G.frame.chouka_hdyx.isShow) {
                                    G.frame.chouka_hdyx.bindBtn();
                                }
                            });
                            G.DATA.noClick = false;
                        }else{
                            G.DATA.noClick = false;
                            X.audio.playEffect("sound/dianji.mp3", false);
                        }
                    });
                }
            }
        },
        setAttr: function () {
            var me = this;

            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        }
    });
    G.frame[ID] = new fun('chouka.json', ID);
})();