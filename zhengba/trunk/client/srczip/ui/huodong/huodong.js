/**
 * Created by wfq on 2018/7/8.
 */
(function () {
    //huodong

    G.event.on('attrchange_over', function () {
        if(G.frame.huodong.isShow){
            G.frame.huodong.updateTop();
        }
    });

    G.event.on('itemchange_over', function () {
        if(G.frame.huodong.isShow){
            G.frame.huodong.updateTop();
        }
    });

    G.event.on('paysuccess', function() {
        if(!G.frame.huodong.isShow) return;
        G.hongdian.getHongdian(1, function () {
            G.frame.huodong.checkRedPoint();
        });
    });

    var ID = 'huodong';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f2";
            me.preLoadRes=['event.png','event.plist'];
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.xsArr = [];
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            //hdType  0= 精彩活动（固定类型活动） 1=限时活动（条件开启的活动）
            me.idx = me.data().idx || 0;
            me.hdType = me.data().type;
            me.firststype = me.data().stype;
            me.refreshPanel();
            me.nodes.list.hide();
        },
        onRemove: function () {
            var me = this;

            X.releaseRes([
               'event.plist','event.png',
                'event_xspf.plist', 'event_xspf.png'
            ]);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.hdType = me.data().type;
            this.getListData(function () {
                _super.apply(me,arguments);
            });
        },
        refreshPanel: function(){
            var me = this;

            me.createMenu();
            if(me.jumpIndex){
                me.nodes.listview.getChildren()[me.jumpIndex] && me.nodes.listview.getChildren()[me.jumpIndex].triggerTouch(ccui.Widget.TOUCH_ENDED);
                cc.callLater(function () {
                    me.nodes.listview.jumpToIdx(me.jumpIndex);
                });
            }else {
                me.nodes.listview.getChildren()[me.idx] && me.nodes.listview.getChildren()[me.idx].triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.nodes.listview.jumpToTop();
            }
            me.checkRedPoint();
            me.setBaseInfo();
        },
        onHide: function () {
            var me = this;
            G.hongdian.getHongdian(1);
            me.emit("hide");
        },
        checkRedPoint: function(){
            var me = this;
            function f1() {
                var data = G.DATA.hongdian;
                var childrenArr = me.nodes.listview.children;

                for (var i in childrenArr) {
                    var chr = childrenArr[i];
                    if(chr.data.redPoint) {
                        if(chr.data.redPoint == 'monthfund'){
                            if(G.DATA.hongdian.monthfund_170 || G.DATA.hongdian.monthfund_180){
                                G.setNewIcoImg(chr);
                                chr.getChildByName("redPoint").setPosition(100, 157);
                            }else {
                                G.removeNewIco(chr);
                            }
                        }else if (chr.data.redPoint == 'stagefund'){
                            if (X.inArray(G.DATA.hongdian.stagefund,'syzc')){
                                G.setNewIcoImg(chr);
                                chr.getChildByName("redPoint").setPosition(100, 157);
                            }else {
                                G.removeNewIco(chr);
                            }
                        } else if(data[chr.data.redPoint]) {
                            G.setNewIcoImg(chr);
                            chr.getChildByName("redPoint").setPosition(100, 157);
                        } else {
                            G.removeNewIco(chr);
                        }
                    }else if(chr.data.stype && G.gc.huodongsort[chr.data.stype] && G.gc.huodongsort[chr.data.stype].redPoint){
                        if(data[G.gc.huodongsort[chr.data.stype].redPoint]){
                            G.setNewIcoImg(chr);
                            chr.getChildByName("redPoint").setPosition(100, 157);
                        }else {
                            G.removeNewIco(chr);
                        }
                    }
                    //xz非要搞一种特殊的红点
                    if(chr.data.redPoint && chr.data.red){
                        if(data[chr.data.redPoint] && data[chr.data.redPoint][chr.data.red]){
                            G.setNewIcoImg(chr);
                            chr.getChildByName("redPoint").setPosition(100, 157);
                        }else {
                            G.removeNewIco(chr);
                        }
                    }
                    //红点key里面又有几个key的情况
                    if(chr.data.redPoint && chr.data.objRed){
                        for(var k in data[chr.data.redPoint]){
                            if(data[chr.data.redPoint][k]){
                                G.setNewIcoImg(chr);
                                chr.getChildByName("redPoint").setPosition(100, 157);
                                break;
                            }
                            G.removeNewIco(chr);
                        }
                    }
                }
            }
            function f2() {
                var data = G.DATA.hongdian.huodong;

                for (var i in me.xsArr) {
                    if(!cc.isNode(me.xsArr[i])) continue;
                    if(X.inArray(data, me.xsArr[i].hdid)) {
                        G.setNewIcoImg(me.xsArr[i]);
                        me.xsArr[i].getChildByName("redPoint").setPosition(100, 157);
                    }else {
                        G.removeNewIco(me.xsArr[i]);
                    }
                }
            }
            me.hdType ? f2() : f1();
        },
        getData: function (hdid, callback) {
            var me = this;

            me.ajax('huodong_open', [hdid], function(str, data){
                if (data.s == 1) {
                    callback && callback(data.d);
                } else {
                    if (me.isShow) me.remove();
                }
            });
        },
        isOpenTodaylibao: function () {
            return X.checkIsOpen("todaylibao") && G.DATA.asyncBtnsData.todaylibao == 1;
        },
        isOpenLvFund: function () {
            if(G.DATA.asyncBtnsData.sdjj && G.DATA.asyncBtnsData.sdjj.djjj == 1){
                return true;
            }else {
                return false;
            }
        },
        isOpenSdjj:function(){
            if(G.DATA.asyncBtnsData.sdjj && G.DATA.asyncBtnsData.sdjj.sdjj == 1){
                return true;
            }else {
                return false;
            }
        },
        getListData: function (callback) {
            var me = this;

            if(me.hdType == 0){
                G.ajax.send('huodong_openlist',[],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        me.xshuodong = d.d;

                        var arr = [];
                        var conf = JSON.parse(JSON.stringify(G.class.menu.get('huodong')));
                        for (var index = 0; index < conf.length; index ++) {
                            var _conf = conf[index];
                            if (_conf.showKey && me[_conf.showKey] && !me[_conf.showKey]()) continue;
                            if (_conf.id == '20'  && !G.class.opencond.getIsOpenById('yjxw')){
                                continue;
                            }
                            arr.push(_conf);
                        }
                        if(X.inArray(G.gc.showOwners, G.owner) || !cc.sys.isNative) {//小蓝盒礼包和公众号礼包
                            if(!G.tiShenIng) {
                                arr.push(G.gc.menu.official_huodong.gzhlb);
                            }
                        }
                        // if(X.inArray(G.gc.showOwners, G.owner) || !cc.sys.isNative) {//抖音礼包
                        //     if(!G.tiShenIng) {
                        //         arr.push(G.gc.menu.official_huodong.dyhl);
                        //     }
                        // }
                        if (X.inArray(['zyfangzhi', 'affzzzbl', 'rsjtios'], G.owner) || !cc.sys.isNative) {//手机绑定礼包
                            arr.push(G.gc.menu.official_huodong.sjbd);
                        }
                       
                        for(var i = 0; i < me.xshuodong.length; i++){
                            if(G.gc.huodongsort[me.xshuodong[i].stype] && G.gc.huodongsort[me.xshuodong[i].stype].ismove && !me.xshuodong[i].isqingdian){
                                arr.push(me.xshuodong[i]);
                            }
                        }
                        var hdArr = [];
                        for (var i = 0; i < arr.length; i ++) {
                            if (arr[i].checkIsOpenId) {
                                if (X.checkIsOpen(arr[i].checkIsOpenId)) hdArr.push(arr[i]);
                            } else {
                                hdArr.push(arr[i]);
                            }
                        }
                        me.hdList = hdArr;
                        G.DATA.hdObj = G.DATA.hdObj || {};
                        cc.each(d.d, function (event) {
                            G.DATA.hdObj[event.hdid] = event;
                        });
                        callback && callback();
                    }
                },true);
            }else{
                G.ajax.send('huodong_openlist',[],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        me.hdList = [];
                        for(var i = 0; i < d.d.length; i++){//把移到精彩活动里面的排除
                            if(!d.d[i].isqingdian && (!G.gc.huodongsort[d.d[i].stype] || !G.gc.huodongsort[d.d[i].stype].ismove)){
                                me.hdList.push(d.d[i]);
                            }
                        }
                        G.DATA.hdObj = G.DATA.hdObj || {};
                        cc.each(d.d, function (event) {
                            G.DATA.hdObj[event.hdid] = event;
                        });
                        callback && callback();
                    }
                },true);
            }
        },
        createMenu: function () {
            var me = this;

            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            // var itemClone = me.nodes.list;
            // itemClone.hide();

            var menuItems = [];

            var menus = [].concat(me.hdList);
            if (me.hdType == 1) {
                menus.sort(function (a, b) {
                    var orderA = G.gc.huodongsort[a.stype] ? G.gc.huodongsort[a.stype].order : 10000;
                    var orderB = G.gc.huodongsort[b.stype] ? G.gc.huodongsort[b.stype].order : 10000;
                    return orderA < orderB ? -1:1;
                });
            }else if(me.hdType == 0){
                menus.sort(function (a, b) {
                    var orderA = a.stype ?  (G.gc.huodongsort[a.stype] ? G.gc.huodongsort[a.stype].order : 10000) : (G.gc.huodongsort[a.id] ? G.gc.huodongsort[a.id].order : 10000);
                    var orderB = b.stype ?  (G.gc.huodongsort[b.stype] ? G.gc.huodongsort[b.stype].order : 10000) : (G.gc.huodongsort[b.id] ? G.gc.huodongsort[b.id].order : 10000);
                    return orderA < orderB ? -1:1;
                });
            }
            cc.log('menus ~~~~', menus);

            for (var i = 0; i < menus.length; i++) {
                var mData = menus[i];
                var item = me.nodes.list.clone();
                me.setItem(item,mData);
                item.hdid = mData.hdid;
                item.data = mData;
                listview.pushBackCustomItem(item);
                me.xsArr.push(item);
                item.show();
                if(me.firststype && (menus[i].id == me.firststype || menus[i].stype == me.firststype)){
                    me.jumpIndex = i;
                }
                menuItems.push(item);
            }

            X.radio(menuItems, function (sender) {
                me.changeType(sender.data);
            },{
                callback1: function (sender) {
                    sender.finds('txt_name$').setOpacity(255);
                    sender.finds("img_light$").setVisible(true);
                    sender.finds("panel_dh$").setVisible(true);
                    sender.finds("ico$").runActions(cc.sequence(cc.scaleTo(0.1, 1.1, 1.1), cc.scaleTo(0.1, 1, 1)));
                },
                callback2: function (sender) {
                    sender.finds('txt_name$').setOpacity(255 * 0.6);
                    sender.finds("img_light$").setVisible(false);
                    sender.finds("panel_dh$").setVisible(false);
                },
                color: ["#FFE8C0", "#FFE8C0"],
            });
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.setName(data.stype || data.id);

            ui.data = data;

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);

            X.render({
                txt_name: function(node){
                    node.setString(data.title || data.name);
                    node.setTextColor(cc.color("#FFE8C0"));
                    X.enableOutline(node, "#2A1C0F", 2);
                },
                ico: function (node) {
                    node.setBackGroundImage('img/event/' + (data.icon) + '.png',0);
                },
                panel_dh: function (node) {
                    G.class.ani.show({
                        json: "ani_meirishilian",
                        addTo: node,
                        x: node.width / 2,
                        y: node.height / 2,
                        repeat: true,
                        autoRemove: false,
                    });
                },
            },ui.nodes);
        },
        changeType: function (data) {
            var me = this;
            var type = data.stype || data.id;

            me.curType = type;

            me.setContents(data);

            G.event.emit('sdkevent',{
                event:'activity',
                data:{
                    checkActivity:data.icon,
                    checkActivityType:me.curType,
                    hdid:data.hdid,
                }
            });
        },
        setContents: function (data) {
            var me = this;
            //type为活动模板
            var type = me.curType;

            var viewConf = {
                "1": G.class.huodong_denglu,//登录奖励
                "2": G.class.huodong_minMonthCard,//小月卡
                "3": G.class.huodong_maxMonthCard,//大月卡
                "4": G.class.huodong_lvFund,//等级基金
                "5": G.class.huodong_weekPrize,//周礼包
                "6": G.class.huodong_monthPrize,//月礼包
                "7": G.class.huodong_yjj,//月基金
                "8": G.class.huodong_yjj,//月基金
                //"9": G.class.huodong_mjzh,//魔镜置换
                "10": G.class.huodong_ztl,//征讨令
                "11" : G.class.huodong_todaylibao,//特惠礼包
                "12" : G.class.huodong_jthl,//积天豪礼
                "13" : G.class.huodong_sdjj,//神殿基金
                "14" : G.class.huodong_zsyk,//终身卡
                "15" : G.class.huodong_yjj,//基金
                "16" : G.class.huodong_fllb,//福利礼包
                "17" : G.class.huodong_ka,//卡集成展示
                "20" : G.class.huodong_sybj,//卡集成展示
                "666": G.class.huodong_fengcefanli,//封测返利
                "10000": G.class.huodong_swlb,//神威礼包
                "10001": G.class.huodong_libao,//等级礼包 || 养成礼包
                "10002": G.class.huodong_libao,//等级礼包 || 养成礼包
                "10003": G.class.huodong_limit,//等级礼包 || 养成礼包
                "10004": G.class.huodong_duihuan,//兑换
                "10005": G.class.huodong_jtfl,//积天返利
                "10006": G.class.huodong_czlb,//超值礼包
                "10007": G.class.huodong_ljcz,//累积充值
                "10008": G.class.huodong_djdr,//周长活动
                "10009": G.class.huodong_djdr,//周长活动
                "10010": G.class.huodong_djdr,//周长活动
                "10011": G.class.huodong_kfcj,//开服冲级
                "10012": G.class.huodong_dbcz,//单笔充值
                "10015": G.class.huodong_dljl,//登陆领奖
                "10016": G.class.huodong_ljxf,//累计消费
                "10017": G.class.huodong_xstg,//限时团购
                "10018": G.class.huodong_yxjl,//英雄降临
                "10021": G.class.huodong_jrdl,//节日掉落
                "10022": G.class.huodong_djdr,//周长活动
                "10023": G.class.huodong_zcjb,//招财进宝
                "10024": G.class.huodong_lchl,//累积豪礼
                "10025": G.class.huodong_yxry,//英雄荣耀
                "10027": G.class.huodong_xszm,//限时招募
                "10028": G.class.huodong_xnjt,//新年积天
                "10029": G.class.huodong_xnrw,//新年任务
                "10030": G.class.huodong_zzlb,//至尊礼包
                "10031": G.class.huodong_zzlb,//勇者礼包
                "10036": G.class.huodong_zjd,//砸金蛋
                "10037": G.class.huodong_gzzk,//贵族折扣
                "10038": G.class.huodong_zxhl,//自选豪礼
                "10039": G.class.huodong_cygj,//财源广进
                "10040": G.class.huodong_jchd,//竞猜活动
                "10041": G.class.huodong_skin,//皮肤
                "10042": G.class.huodong_srpd,//生日派对
                "10045": G.class.huodong_dyhd,//钓鱼活动
                "10046": G.class.huodong_lqsl,//龙骑试炼
                '10047': G.class.huodong_hjkg,//黄金矿工
                "10048": G.class.huodong_xkfb,//虚空风暴
                "10050": G.class.huodong_jssl,//剑圣的试炼
                "10051": G.class.huodong_thlb,//神威礼包
                // "10049": G.class.huodong_baby,//挖宝
                "10013": G.class.huodong_sjmz,//圣剑迷踪
                "10052": G.class.huodong_sjmz,//乌鸦祭坛
                "10054":G.class.huodong_cyhtk,//财运亨通卡
                "10053":G.class.huodong_pfyyl,//皮肤摇摇乐
                "10055":G.class.huodong_zmlb,//周末礼包
                "10099": G.class.huodong_pfsd,//皮肤商店
                "10056": G.class.huodong_xslb,
                "10057": G.class.huodong_csdh,//传说兑换
                "10058": G.class.huodong_zxlb,//自选礼包
                "10026": G.class.huodong_zntz,//周年挑战
                "10032":G.class.huodong_cyhtk,//周年纪念卡
                "10061":G.class.huodong_viplogin,//贵族登录
                '10064': G.class.huodong_pfsc,//纯付费的皮肤商店
                '10065':G.class.huodong_thlb_new,//特惠礼包整合
                '10067': G.class.huodong_dds,//打地鼠
                "10068": G.class.huodong_mrmg,//每日迷宫
                "sjbd": G.class.huodong_sjbd,
                "gzhlb": G.class.huodong_gzhlb,
                "dyhl":G.class.huodong_dyhl,
                "xlhlb": G.class.huodong_xlhlb,
            };
            var newView = new viewConf[type](data);
            ccui.helper.doLayout(newView);
            me.ui.nodes.panel_nr.addChild(newView);

			if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
			}else{
				me._panels = newView;
			}

			if (type == 10047) {
			    me.setBaseInfo({
                    need1: {a:'item',t:'2052'},
                    need2: {a:'attr',t:'rmbmoney'}
                })
            } else me.setBaseInfo();

			if(me.isFirst) {
                X.audio.playEffect("sound/dianji.mp3", false);
            }
            me.isFirst = true;

            me.ui.setTimeout(function(){
            	G.guidevent.emit('huodong_setContents_over');
            },500);
        },
        setBaseInfo: function (obj) {
            var me = this;

            obj = obj || {};

            var attr1 = me.need1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = me.need2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            me.nodes.panel_top.finds("token_jb").loadTexture(G.class.getItemIco(attr1.t), 1);
            me.nodes.panel_top.finds("token_zs").loadTexture(G.class.getItemIco(attr2.t), 1);
            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    if (attr1.t == 'jinbi') node.show();
                    else node.hide();
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.show();
                        }

                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.once("hide", function () {
                                me._panels.refreshView && me._panels.refreshView();
                            }).show();
                        }
                    })
                }
            },me.nodes);
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(me.need1.t,me.need1.a)));
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(me.need2.t,me.need2.a)));
        }
    });

    X.timeCountPanel = function (parent, toTime, args) {
        if (!cc.isNode(parent)) return;

        X.timeout(parent, toTime, function () {
            args.endCall && args.endCall();
        }, function (timeStr) {
            var rh = X.setRichText({
                size: 20,
                str: timeStr,
                parent: parent,
                color: "#2bdf02",
                outline: "#000000"
            });
            rh.setPosition(parent.width / 2 - rh.trueWidth() / 2, parent.height / 2 - rh.trueHeight() / 2);
        }, {
            showStr: args.str
        });
    };

    G.frame[ID] = new fun('event.json', ID);
})();