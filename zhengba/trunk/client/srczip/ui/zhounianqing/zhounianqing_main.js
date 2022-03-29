/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
    //

    G.event.on('attrchange_over', function () {
        if(G.frame.zhounianqing_main.isShow){
            G.frame.zhounianqing_main.updateTop();
        }
    });

    G.event.on('itemchange_over', function () {
        if(G.frame.zhounianqing_main.isShow){
            G.frame.zhounianqing_main.updateTop();
        }
    });

    G.event.on('paysuccess', function() {
        if(G.frame.zhounianqing_main.isShow){
            G.frame.zhounianqing_main.updateTop();
        }
    });

    var ID = 'zhounianqing_main';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.preLoadRes=['2zhounian.png','2zhounian.plist'];

            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            X.radio([me.nodes.page1, me.nodes.page2, me.nodes.page3], function(sender) {
                var name = sender.getName();
                var name2type = {
                    page1$: 1,
                    page2$: 2,
                    page3$: 3
                };
                me.changeType(name2type[name]);
            });
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                _super.apply(me, arg);
            });
        },

        onOpen: function () {
            var me = this;
            me.fillSize();
            me.bindBtn();
        },
        getData:function (callback) {
            var me = this ;
            G.ajax.send("anniversary_open",[],function(str,data){
                if(data.s == 1){
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        checkRedPoint:function () {
            var me = this ;
            // var node = me.nodes.listview.children[1];
          
            var taskInfo = me.DATA.task;
            for(var key in me.nodes.listview.children){
                if(me.nodes.listview.children[key].redKey){
                    if(me.nodes.listview.children[key].redKey == "signreceive"){
                        if(me.DATA.signreceive){
                            G.setNewIcoImg(me.nodes.listview.children[key]);
                        }else{
                            G.removeNewIco(me.nodes.listview.children[key]);
                        }
                    }else if(me.nodes.listview.children[key].redKey == "task"){
                            G.removeNewIco(me.nodes.listview.children[key]);
                            for(var _key in taskInfo){
                                if(!me.DATA.receive[_key]){
                                G.setNewIcoImg(me.nodes.listview.children[key]);
                                }
                            };
                    
                    }else if(me.nodes.listview.children[key].redKey == "tuozi"){
                            var need = me.conf.chess.need[0];
                            ownNum = G.class.getOwnNum(need.t, need.a);
                            if(ownNum >= need.n){
                                G.setNewIcoImg(me.nodes.listview.children[key]);
                            }else{
                                G.removeNewIco(me.nodes.listview.children[key]);
                            }
                    }
                }
            }
         
            G.hongdian.getData('anniversary',1);

            if(!G.DATA.hongdian.qingdian) return;
            var data = G.DATA.hongdian.qingdian;
            for (var i in me.nodes.listview.children) {
                if(!cc.isNode(me.nodes.listview.children[i])) continue;
                if(me.nodes.listview.children[i].data.isqingdian){
                    if(X.inArray(data, me.nodes.listview.children[i].hdid)) {
                        G.setNewIcoImg(me.nodes.listview.children[i]);
                        me.nodes.listview.children[i].getChildByName("redPoint").setPosition(100, 157);
                    }else {
                        G.removeNewIco(me.nodes.listview.children[i]);
                    }
                }
            };

        },
         createMenu: function () {
            var me = this;

            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();

            var menuItems = [];
            var zhouNian = [];
            if(X.isHavItem(me.DATA)){
                var menuConf =JSON.parse(JSON.stringify(G.gc.menu.zhounianqing))  ;
                for(var key in menuConf){
                    if(me.DATA.hdinfo.data[menuConf[key].checkKey]){
                        zhouNian.push(menuConf[key])
                    }
                };
            };
            var menus = [].concat(zhouNian,me.hdList);
        
            for (var i = 0; i < menus.length; i++) {
                var mData = menus[i];
                var item = me.nodes.list.clone();
                me.setItem(item,mData);
                item.hdid = mData.hdid;
                item.data = mData;
                item.redKey = mData.redPoint || false;
                listview.pushBackCustomItem(item);
                item.show();
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
                    if(data.isqingdian){
                        node.setBackGroundImage('img/event/' + (data.icon) + '.png',0);
                    }else {
                        node.setBackGroundImage('img/2zhounian/' + (data.icon) + '.png',1);
                    }
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
          refreshPanel: function(){
            var me = this;

            me.getListData(function () {
                me.createMenu();
                me.nodes.listview.getChildren()[me.idx || 0] && me.nodes.listview.getChildren()[me.idx || 0].triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.checkRedPoint();
            });
        },
        getListData:function(callback){
            var me = this;
            G.ajax.send('huodong_openlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.hdList = [];
                    for(var i = 0; i < d.d.length; i++){//拿出庆典活动
                        if(d.d[i].isqingdian){
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
        },
        changeType:function(data){
            var me = this;
           
            var type = data.stype || data.id;

            me.curType = type;

            me.setContents(data);
        },
        setContents:function (data) {
            var me = this ;
            var type = me.curType;

            var viewConf = {
                "1": G.class.huodong_xysz,//幸运骰子
                "2": G.class.huodong_zxzf,//自选祝福
                "3": G.class.huodong_zjrw,//终极任务
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
                '10065':G.class.huodong_thlb_new,//特惠礼包整合
                '10067': G.class.huodong_dds,//打地鼠
            };
            var newView = new viewConf[type](data);
            newView.parentNode = G.frame.zhounianqing_main;
            ccui.helper.doLayout(newView);
            me.ui.nodes.panel_nr.addChild(newView);
             me.setBaseInfo();
			if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
			}else{
				me._panels = newView;
			}
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
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            if(X.isHavItem(me.DATA)){
                me.conf = JSON.parse(JSON.stringify(me.DATA.hdinfo.data));
                var _conf = G.gc.anniversary;
                for(var key in _conf){
                    if(!me.conf[key]){
                        me.conf[key] = _conf[key];
                    }
                }
            }
            me.refreshPanel();

        },
        refreshDataInfo:function (data) {
            var me = this ;  
            for(var key in data){
                me.DATA[key] = data[key];
            };
            me.checkRedPoint();
        },
        onHide: function () {
            var me = this;
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(me.need1.t,me.need1.a)));
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(me.need2.t,me.need2.a)));
        }
     
    });

    G.frame[ID] = new fun('event.json', ID);
})();