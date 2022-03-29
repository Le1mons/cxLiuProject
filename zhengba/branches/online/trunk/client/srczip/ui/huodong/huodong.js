/**
 * Created by wfq on 2018/7/8.
 */
(function () {
    //huodong

    G.event.on('currencyChange', function () {
        if(G.frame.huodong.isShow){
            G.frame.huodong.updateTop();
        }
    });

    G.event.on('paysuccess', function() {
        if(!G.frame.huodong.isShow) return;
        G.hongdian.getHongdian(1, function () {
            G.frame.huodong.checkRedPoint();
        })
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
            me.refreshPanel();
            me.nodes.list.hide();
        },
        onRemove: function () {
            var me = this;

            X.releaseRes([
               'event.plist','event.png'
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
            me.nodes.listview.getChildren()[me.idx] && me.nodes.listview.getChildren()[me.idx].triggerTouch(ccui.Widget.TOUCH_ENDED);
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
                var arr = ["sign", "yueka_xiao", "yueka_da", "dengjiprize"];
                for(var i = 0; i < arr.length; i ++){
                    if(G.DATA.hongdian[arr[i]] > 0){
                        G.setNewIcoImg(me.nodes.listview.getChildren()[i]);
                        me.nodes.listview.getChildren()[i].getChildByName("redPoint").setPosition(100, 157);
                    }else{
                        G.removeNewIco(me.nodes.listview.getChildren()[i]);
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
                }else if(data.s!=-105) {
                    G.frame.huodong.remove();
                }
            });
        },
        getListData: function (callback) {
            var me = this;

            if(me.hdType == 0){
                me.hdList = G.class.menu.get('huodong');
                callback && callback();
            }else{
                G.ajax.send('huodong_openlist',[],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        me.hdList = d.d;
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

                menuItems.push(item);
            }

            listview.jumpToTop();

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
        },
        setContents: function (data) {
            var me = this;
            //type为活动模板
            var type = me.curType;

            var viewConf = {

                "10001": G.class.huodong_libao,
                "10002": G.class.huodong_libao,
                "10003": G.class.huodong_limit,
                "10004": G.class.huodong_duihuan,
                "10005": G.class.huodong_jtfl,
                "10006": G.class.huodong_czlb,
                "10007": G.class.huodong_ljcz,
                "10008": G.class.huodong_djdr,
                "10009": G.class.huodong_djdr,
                "10010": G.class.huodong_djdr,
                "10022": G.class.huodong_djdr,
                "10011": G.class.huodong_kfcj,
                "10012": G.class.huodong_dbcz,
                "10015": G.class.huodong_dljl,
                "10016": G.class.huodong_ljxf,
                "10017": G.class.huodong_xstg,
                "10018": G.class.huodong_yxjl,
                "10021": G.class.huodong_jrdl,
                "10023": G.class.huodong_zcjb,
                "10024": G.class.huodong_lchl,
                "10025": G.class.huodong_yxry,
                "10026": G.class.huodong_mjzh,
                "1": G.class.huodong_denglu,
                "2": G.class.huodong_minMonthCard,
                "3": G.class.huodong_maxMonthCard,
                "4": G.class.huodong_lvFund,
                "5": G.class.huodong_weekPrize,
                "6": G.class.huodong_monthPrize,
                "666": G.class.huodong_fengcefanli,
                "10028": G.class.huodong_xnjt,
                "10029": G.class.huodong_xnrw,
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

            var attr1 = obj.need1 || {a:'attr',t:'jinbi'};
            var attr2 = obj.need2 || {a:'attr',t:'rmbmoney'};

            X.render({
                txt_jb:X.fmtValue(G.class.getOwnNum(attr1.t,attr1.a)),
                txt_zs:X.fmtValue(G.class.getOwnNum(attr2.t,attr2.a)),
                btn_jia1: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.dianjin.show();
                        }

                    });
                },
                btn_jia2: function (node){
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.chongzhi.show();
                        }
                    })
                }
            },me.nodes);
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        }
    });

    G.frame[ID] = new fun('event.json', ID);
})();