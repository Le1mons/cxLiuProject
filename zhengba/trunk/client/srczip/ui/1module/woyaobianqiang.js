/**
 * Created by LYF on 2018/8/14.
 */
(function () {
    //我要变强
    var ID = 'woyaobianqiang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.ui.nodes.mask.click(function(sender,type){
                me.remove();
            });

            me.nodes.tip_title.setString(L('UI_TITLE_WYBQ'));
        },
        bindBtn: function () {
            var me = this;

            X.radio([me.nodes.btn_czzy, me.nodes.btn_czzy1,me.nodes.btn_czzy2,me.nodes.btn_czzy3], function (sender) {
                var nameType = {
                    btn_czzy$: 1,
                    btn_czzy1$: 2,
                    btn_czzy2$:3,
                    btn_czzy3$:4,
                };
                me.changeType(nameType[sender.getName()]);
            });
        },
        changeType: function(type) {
            var me = this;
            var views = {
                1: G.class.rmzy,
                2: G.class.zrtj,
                3:G.class.hqzy,
                4:G.class.cjwt
            };

            var view = new views[type];
            me.nodes.panel_nr.addChild(view);

            if (me.view) me.view.removeFromParent();
            me.view = view;
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_czzy1.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.ui.setTimeout(function () {
                G.guidevent.emit("woyaobainqiangOpenOver");
            }, 300);
        },
        onHide: function () {
            var me = this;
        },
        showTujing: function (target, idx) {
            G.frame.qianwang.data(target.tconf[idx]).show();
        }
    });
    G.frame[ID] = new fun('ui_tip7.json', ID);
})();

(function () {
    G.class.rmzy = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("woyaobianqiang.json");
        },
        initUi: function () {
            var me = this;

            me.nodes.scrollview_xuanshangrenwu.hide();
            cc.enableScrollBar(me.nodes.listview_xuanshangrenwu);
            cc.enableScrollBar(me.nodes.scrollview_xuanshangrenwu);
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("woyaobianqiang_list.json", function (node) {
                me.list = node.finds("list_nr");
                me.setContents();
                me.ui.setTimeout(function(){
                    G.guidevent.emit('woyaobainqiangOpenOver');
                },200);
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.class.getConf("woyaobianqiang");
            var keys = X.keysOfObject(conf);

            for(var i = 0; i < keys.length; i ++) {
                if(conf[keys[i]].checkLv) {
                    if(P.gud.lv < conf[keys[i]].checkLv) {
                        keys.splice(i, 1);
                        break;
                    }
                }
            }

            for(var i = 0; i < keys.length; i ++) {
                me.nodes.listview_xuanshangrenwu.pushBackCustomItem(me.setItem(conf[keys[i]], me.list.clone(), i));
            }
        },
        setItem: function(data, ui, idx) {
            X.autoInitUI(ui);

            var me = this;

            ui.nodes.tubiao.loadTexture("img/woyaobianqiang/" + data.img, 1);
            ui.finds("Image_2").loadTexture("img/woyaobianqiang/" + data.typeimg, 1);
            ui.finds("wz_biaoti").setString(data.title);

            var text = "";
            if(data.touchText.length > 1) {
                text = X.STR(data.content,
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,0)>" + data.touchText[0] +"</font>",
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,1)>" + data.touchText[1] +"</font>")
            }else {
                text = X.STR(data.content,
                    "<font color=#324cae" + " onclick=G.frame.woyaobianqiang.showTujing(this,0)>" + data.touchText[0] +"</font>");
            }

            var rh = new X.bRichText({
                size: 24,
                maxWidth: ui.nodes.wz_neirong.width,
                lineHeight: 32,
                color: "#be5e30",
                family: G.defaultFNT
            });
            rh.tconf = data.Texttujing;
            rh.text(text);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, ui.nodes.wz_neirong.height);
            ui.nodes.wz_neirong.addChild(rh);

            if(idx == 0) {
                //映射引导按钮
                G.frame.woyaobianqiang.btn_on = ui.nodes.btn2_on;
            }
            ui.nodes.btn2_on.click(function () {
                G.frame.woyaobianqiang.remove();
                X.tiaozhuan(data.tujing);
            });

            return ui;
        },
    });
})();

(function () {
    G.class.zrtj = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("woyaobianqiang.json");
        },
        initUi: function () {
            var me = this;

            me.nodes.scrollview_xuanshangrenwu.hide();
            cc.enableScrollBar(me.nodes.listview_xuanshangrenwu);
            cc.enableScrollBar(me.nodes.scrollview_xuanshangrenwu);
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            X.viewCache.getView("woyaobianqiang_list1.json", function (node) {
                me.list = node.finds("list_nr$");
                me.setContents();
            });
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.defhero;

            for(var i = 0; i < conf.length; i ++) {
                me.nodes.listview_xuanshangrenwu.pushBackCustomItem(me.setItem(conf[i], me.list.clone()));
            }
        },
        setItem: function(data, ui) {
            X.autoInitUI(ui);

            X.render({
                wz_liupai: data.name,
                wz_jnms: data.info,
                wz_neirong: function (node) {

                    var hero = [];

                    for (var i = 0; i < data.hero.length; i ++) {
                        var wid = G.class.shero(G.gc.hero[data.hero[i]]);
                        wid.setTouchEnabled(true);
                        wid.click(function (sender) {
                            // G.frame.yingxiong_jianjie.data({
                            //     data: sender.data
                            // }).show();

                            G.frame.iteminfo.data({
                                data: {
                                    a: "item",
                                    t: sender.data.hid
                                }
                            }).show();
                        });
                        hero.push(wid);
                    }

                    X.left(node, hero, .7, -15);
                }
            }, ui.nodes);

            return ui;
        },
    });
})();

(function () {
    G.class.hqzy = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("changjianwenti.json");
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.oldClick = null;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.getResources;
            for(var i = 0 ; i< conf.length;i++){
                conf[i].idx = i;
                conf[i].isfold = false;
            }
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_hqzy,1,function (ui,data) {
                me.setItem(ui,data)
            },null,null,0,0);
            me.table.setData(conf);
            me.table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me =this;
            ui.show();
            X.autoInitUI(ui);
            ui.idx = data.idx;
            ui.data = data;
            ui.nodes.txt_title1.setString(data.name);
            ui.nodes.txt_wzms1.setString(data.info);

            ui.nodes.panel_name1.removeAllChildren();
            // var wid = G.class.sitem(data.icon);
            var wid = new ccui.ImageView('ico/itemico/'+data.img,0);
            var color = data.color;
            ui.nodes.panel_name1.setBackGroundImage('img/public/ico/ico_bg' + color + '.png', 1);
            wid.setPosition(cc.p(ui.nodes.panel_name1.width / 2,ui.nodes.panel_name1.height / 2));
            ui.wid = wid;
            ui.nodes.panel_name1.addChild(wid);
            //物品图片点击详情
            // G.frame.iteminfo.showItemInfo(wid);
            var tujingData = data.tujing;
            ui.nodes.listview.removeAllChildren();
            cc.enableScrollBar(ui.nodes.listview,false);
            ui.nodes.listview.setSwallowTouches(false);
            for(var i = 0 ; i < tujingData.length;i++){
                var list = me.nodes.list_clai.clone();
                X.autoInitUI(list);
                list.show();
                list.idx = i;
                list.data = tujingData[i];
                list.nodes.btn.data = tujingData[i];

                // var icon = G.class.sitem(tujingData[i].icon);
                var icon = new ccui.ImageView('ico/itemico/'+tujingData[i].img,0);
                var color = tujingData[i].color;
                list.nodes.panel_name2.setBackGroundImage('img/public/ico/ico_bg' + color + '.png', 1);

                icon.setPosition(cc.p(list.nodes.panel_name2.width / 2,list.nodes.panel_name2.height / 2));
                list.nodes.panel_name2.addChild(icon);
                list.nodes.txt_title2.setString(tujingData[i].name);
                list.nodes.txt_wzms2.setString(tujingData[i].info);
                //前往点击事件  
                list.nodes.btn.click(function (sender,type) {
                    X.tiaozhuan(sender.data.tiaozhuan);
                    G.frame.woyaobianqiang.remove();
                });
                ui.nodes.listview.pushBackCustomItem(list);
            }
            if(!data.isfold){
                me.unfoldUi(ui);
            }else {
                me.foldUi(ui);
            }
            ui.nodes.btn_on.data = data;
            ui.nodes.btn_on.idx = data.idx;
            ui.nodes.btn_on.click(function(sender,type) {
                if(me.curcell) {
                    me.curcell.isfold = false;
                    me.table._table._cellSize[me.curcell.idx] = {w: sender.parent.parent.width, h: sender.parent.parent.height};
                }
                if (!sender.data.isfold) {
                    me.curcell = sender.data;
                    me.foldUi(sender.parent.parent);

                } else {
                    me.unfoldUi(sender.parent.parent);
                }
                var a = me.nodes.scrollview.getChildren()[0].getContainer().y;
                me.nodes.scrollview.getChildren()[0].getContainer().y = a - ui.nodes.listview.height;
                me.table._table.reloadDataWithScroll(false);

            });
            ui.nodes.btn_off.click(function(sender,type) {
                me.oldClick = null;
                me.unfoldUi(sender.parent.parent);
                var a = me.nodes.scrollview.getChildren()[0].getContainer().y;
                me.nodes.scrollview.getChildren()[0].getContainer().y = a + ui.nodes.listview.height;
                me.table.reloadDataWithScroll(false);
            });


        },

        unfoldUi:function(item){
            var me =this;
            item.data.isfold = false;
            X.autoInitUI(item);
            item.nodes.img_tplb.loadTexture("img/public/bg_xuanshangrenwu_list.png",1);
            item.nodes.btn_off.hide();
            item.nodes.btn_on.show();
            item.nodes.listview.hide();
            me.table._table._cellSize[item.data.idx] = {w: item.width, h: item.height };
        },
        foldUi:function(item){
            var me =this;
            item.data.isfold = true;
            X.autoInitUI(item);
            item.nodes.img_tplb.loadTexture("img/tanxian/tanxian_zydi1.png",1);
            item.nodes.btn_on.hide();
            item.nodes.btn_off.show();
            item.nodes.listview.show();
            item.nodes.listview.height = me.nodes.list_clai.height * item.data.tujing.length;
            me.table._table._cellSize[item.data.idx] = {w: item.width, h: item.height+ item.nodes.listview.height};

        },
    });
})();

(function () {
    G.class.cjwt = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("changjianwenti.json");
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
            me.oldClick = null;
            me.setContents();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.conf = G.gc.comProblem;
            for(var i = 0 ; i< me.conf.length;i++){
                me.conf[i].idx = i;
                me.conf[i].isfold = false;
            }
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list,1,function (ui,data) {
                me.setItem(ui,data)
            },null,null,0,0);
            me.table.setData(me.conf);
            me.table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me =this;
            ui.show();
            X.autoInitUI(ui);
            ui.idx = data.idx;
            ui.data = data;
            ui.nodes.txt_title.setString(data.title);
            ui.nodes.txt_title.setColor(cc.color("#FFF2DA"));
            X.enableOutline(ui.nodes.txt_title,cc.color('#7B531A'),2);
            ui.nodes.img_arrow_off.show();
            if(!data.isfold){
                me.unfoldUi(ui);
            }else {
                me.foldUi(ui);
            }
            ui.nodes.btn_list.data = data;
            ui.nodes.btn_list.idx = data.idx;
            ui.nodes.btn_list.setSwallowTouches(false);
            ui.nodes.btn_list.click(function (sender,type) {
                if (me.curcell) {
                    me.curcell.isfold = false;
                    me.table._table._cellSize[me.curcell.idx] = {w: sender.parent.width, h: sender.parent.height};
                }
                if (me.curcell && me.curcell.idx == sender.idx) {
                    delete me.curcell;
                    me.table.reloadDataWithScroll(false);
                    return;
                }
                if (!sender.data.isfold) {
                    me.curcell = sender.data;
                    me.foldUi(sender.parent);

                } else {
                    me.unfoldUi(sender.parent);
                }
                var a = me.nodes.scrollview.getChildren()[0].getContainer().y;
                me.nodes.scrollview.getChildren()[0].getContainer().y = a - ui.nodes.panel_info.height;
                me.table.reloadDataWithScroll(false);
            })



        },

        unfoldUi:function(item){
            var me =this;
            item.data.isfold = false;
            X.autoInitUI(item);
            item.nodes.img_arrow_off.hide();
            item.nodes.img_arrow_on.show();
            // item.nodes.panel_info.removeAllChildren();
            item.nodes.panel_info.hide();
            me.table._table._cellSize[item.data.idx] = {w: item.width, h: item.height };

        },
        foldUi:function(item){
            var me =this;
            item.data.isfold = true;
            X.autoInitUI(item);
            item.nodes.img_arrow_off.show();
            item.nodes.img_arrow_on.hide();
            item.nodes.panel_info.show();
            item.nodes.panel_info.removeAllChildren();
            var idx = item.idx;
            var data = me.conf[idx];
            var rt =new X.bRichText({
                size: 22,
                maxWidth:item.nodes.btn_list.width - 30,
                lineHeight:36,
                color:'#804326',
                family: G.defaultFNT
            });
            rt.text(data.content);
            var richHeight = rt.trueHeight() + 30;
            rt.setAnchorPoint(0,0);
            rt.y = 15;
            rt.x = 10;
            item.nodes.panel_info.addChild(rt);
            item.nodes.panel_info.setSwallowTouches(false);
            item.nodes.panel_info.setContentSize(cc.size(item.nodes.btn_list.width - 10, richHeight));
            item.nodes.panel_info.setBackGroundImage('img/public/bg_xinxi12.png',1);
            me.table._table._cellSize[item.data.idx] = {w: item.width, h: item.height+ item.nodes.panel_info.height};
            // item.nodes.btn_on.hide();
            // item.nodes.btn_off.show();
            // item.nodes.listview.show();
            // // item.nodes.listview.setSwallowTouches(false);
            // item.nodes.listview.height = me.nodes.list_clai.height * item.data.tujing.length;


        },
    });
})();