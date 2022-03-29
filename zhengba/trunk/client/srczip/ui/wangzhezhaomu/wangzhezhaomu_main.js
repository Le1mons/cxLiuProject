/**
 * Created by  on 2019//.
 */
(function () {
    //
    G.event.on('attrchange_over', function () {
        if(G.frame.wangzhezhaomu_main.isShow){
            G.frame.wangzhezhaomu_main.updateTop();
        }
    });
    G.event.on('paysuccess', function() {
        if(G.frame.wangzhezhaomu_main.isShow){
            G.frame.wangzhezhaomu_main.updateTop();
        }
    });
    var ID = 'wangzhezhaomu_main';
    var fun = X.bUi.extend({
        btnName:{
            "zhouka":L("WANZGHEZHAOMU1"),
            "task":L("WANZGHEZHAOMU2"),
            "libao":L("WANZGHEZHAOMU3"),
            "zhaomu":L("WANZGHEZHAOMU4"),
            "boss":L("WANZGHEZHAOMU5"),
            "peiyang":L("WANZGHEZHAOMU6"),
        },
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        refreshPanel:function(){
            var me = this;
            me.createMenu();
            me.nodes.listview.getChildren()[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.checkRedPoint();
            me.setBaseInfo();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        createMenu: function () {
            var me = this;
            var menuItems = [];
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var btnarr = X.keysOfObject(me.list);
            for (var i = 0; i < btnarr.length; i++) {
                var item = me.nodes.list.clone();
                item.show();
                var data = btnarr[i];
                item.data = data;
                item.type = data;
                me.setItem(item,data);
                listview.pushBackCustomItem(item);
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
            ui.setName(data);
            ui.data = data;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);

            X.render({
                txt_name: function(node){
                    node.setString(me.btnName[data]);
                    node.setTextColor(cc.color("#FFE8C0"));
                    X.enableOutline(node, "#2A1C0F", 2);
                },
                ico: function (node) {
                    node.setBackGroundImage('img/event/ico_event_' + data + ".png",0);
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
        changeType:function (type){
            var me = this;
            if(me.type == type) return;
            me.type = type;
            var viewConf = {
                "zhouka":G.class.wangzhezhaomu_zmk,//王者招募卡
                "task":G.class.wangzhezhaomu_by,//王者霸业
                "libao":G.class.wangzhezhaomu_shop,//王者商城
                "peiyang": G.class.wangzhezhaomu_starup,//王者升星
                "zhaomu": G.class.wangzhezhaomu_zhaomu,//王者招募
                "boss": G.class.wangzhezhaomu_qqtx//前倾天下
            };
            var view = new viewConf[type];
            me.nodes.panel_nr.addChild(view);
            cc.isNode(me.view) && me.view.removeFromParent();
            me.view = view;
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
        checkRedPoint:function(){
            var me = this;
            for(var i = 0; i < me.nodes.listview.children.length; i++){
                var btn = me.nodes.listview.children[i];
                if(X.inArray(G.DATA.hongdian.wangzhezhaomu,btn.data)){
                    G.setNewIcoImg(btn);
                    btn.finds('redPoint').setPosition(100,150);
                }else {
                    G.removeNewIco(btn);
                }
            }
        },
        getData:function(callback){
            var me = this;
            G.ajax.send('wangzhezhaomu_open',[],function(str,data){
                if(data.s == 1){
                    me.list = data.d.info.data.openinfo;
                    callback && callback();
                }
            })
        },
        updateTop: function () {
            var me = this;
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(me.need1.t,me.need1.a)));
            me.nodes.txt_zs.setString(X.fmtValue(G.class.getOwnNum(me.need2.t,me.need2.a)));
        },
    });
    G.frame[ID] = new fun('event.json', ID);
})();