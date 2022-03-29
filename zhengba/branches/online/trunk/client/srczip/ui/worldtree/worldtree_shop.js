/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //世界树-商店
    var ID = 'worldtree_shop';

    var fun = X.bUi.extend({
        extConf:{
            maxnum:3
        },
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.ui.nodes.tip_title.setString(L("sjssd"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            // for(var i = 0; i < 7; i ++) {
            //     var icon = me.nodes.list_ico.clone();
            //
            // }
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.shopConf = G.class.shop.getById(me.curType);
            me.curAttr = me.shopConf.need[0];
            me.showAttr = me.shopConf.show[0];
            cc.isNode(me.nodes["zhuangshi_" + me.curType]) && me.nodes["zhuangshi_" + me.curType].show();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.curType = 8;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.needScroll = true;
            me.createMenu();
            me._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        createMenu: function(){
            var me = this;

            me._menus = [];

            //图标
            for(var i=0;i<7;i++){
                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(me.nodes["panel_" + (i + 1)].width / 2, me.nodes["panel_" + (i + 1)].height / 2);
                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.zz = sender.data;
                            if(!me.table) {
                                me.setContents();
                            }else {
                                me.refreshPanel();
                            }
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;
                                    }
                                })
                            }
                        }else{
                            node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });
                me._menus.push(list_ico);
                me.nodes["panel_" + (i + 1)].addChild(list_ico);
            }
        },
        onHide: function () {
            var me = this;
            G.frame.worldtree.setBaseInfo();
            me.event.emit('hide');
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('shop_open', [me.curType], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        refreshData: function () {
            var me = this;

            me.needScroll = false;
            me.getData(function () {
                me.setContents();
            });
        },
        refreshPanel: function () {
            var me = this;

            //刷新界面显示
            var data = me.filterData();
            me.table.setData(data);
            me.table.reloadDataWithScroll(true);
            if(me.refresh) me.refresh = 0;

            me.setRefreshBtn();
            me.setAttr();
        },
        setContents: function () {
            var me = this;

            var scrollview = me.nodes.scrollview_sp;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            var list = me.getNewItem();

            var data = me.filterData();
            var table = me.table = new X.TableView(scrollview,list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1);
            table.setData(data);
            table.reloadDataWithScroll(me.needScroll);
            if(me.refresh) me.refresh = 0;

            me.setRefreshBtn();
            me.setAttr();
        },
        // 设置每行
        setItem: function (ui,data) {
            var me = this;

            for (var i = 0; i < 3; i++) {
                var parent = ui.finds('panel_wp' + (i + 1) + '$');
                var child = parent.getChildren()[0];
                child.hide();
                var dd = data[i];
                if (dd) {
                    me.setChildItem(child,dd);
                    child.show();
                }
            }

            ui.setTouchEnabled(false);
            ui.show();
        },
        //设置一行的子项
        setChildItem: function (ui,data) {
            var me = this;

            X.autoInitUI(ui);
            var imgKapian = ui.nodes.img_kapian1;
            var layIco = ui.nodes.ico_tb;
            // var txtName = ui.nodes.text_1;
            var imgAttr = ui.nodes.image_jb;
            var txtAttr = ui.nodes.text_jinbi;
            var imgZhekou = ui.nodes.img_zkbg;
            var txtZhekou = ui.nodes.text_zk;
            var imgYgm = ui.nodes.img_ygm;
            //倒计时
            var panelDjs = ui.nodes.panel_djs;
            var txtDjs = ui.nodes.txt_djs;
            // 限购次数
            // var panelXg = ui.nodes.panel_xgcs;
            // var txtXg = ui.nodes.txt_xgsl;

            panelDjs.hide();
            // panelXg.hide();
            layIco.removeAllChildren();
            imgZhekou.hide();
            txtZhekou.setString('');
            imgYgm.hide();

            // 道具
            var wid = G.class.sitem(data.item);
            if(me.refresh) wid.refresh();
            wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
            layIco.addChild(wid);

            G.frame.iteminfo.showItemInfo(wid);
            wid.setTouchEnabled(true);
            wid.setSwallowTouches(true);

            //设置名字
            // setTextWithColor(txtName,wid.conf.name,G.gc.COLOR[wid.conf.color || 1]);

            // 消耗货币
            imgAttr.loadTexture(G.class.getItemIco(data.need[0].t),1);
            txtAttr.setString(data.need[0].n);

            //折扣
            if (data.sale != 10) {
                imgZhekou.show();
                txtZhekou.setString(data.sale + 'z');
                X.enableOutline(txtZhekou,'#1d9600',2);
            }

            //是否显示限购
            if (data.buynum == 0) {
                imgYgm.show();
                txtAttr.hide();
                imgAttr.hide();
            }else{
                imgYgm.hide();
                txtAttr.show();
                imgAttr.show();
            }

            if(data.buynum > 0) {
                ui.finds("xiangou").show();
                ui.finds("wz1").setString(X.STR(L("XG"), data.buynum));
            }else {
                ui.finds("xiangou").hide();
            }

            //限购倒计时
            if (panelDjs.timer) {
                panelDjs.clearTimeout(panelDjs.timer);
                delete panelDjs.timer;
            }

            if (data.buynum > 0 && data.buytime && data.buytime > G.time) {
                panelDjs.show();
            }

            //整个卡牌除道具显示区域外可点击购买
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    if (sender.data.buynum == 0) {
                        G.tip_NB.show(L('SHOP_ITEM_OVER'));
                        return;
                    }
                    if(G.class.getOwnNum(me.showAttr.t,me.showAttr.a) < data.need[0].n){
                        var name;
                        if(me.showAttr.a == "attr"){
                            name = G.class.attricon.getById(me.showAttr.t).name;
                        }else{
                            name = G.class.getItem(me.showAttr.t).name;
                        }
                        G.tip_NB.show(name  + L("BUZU"));
                        return;
                    }
                    if (G.class.shop.checkIsShowAlert(me.curType)) {
                        var str = L('SHOP_NEED_BUY');
                        G.frame.alert.data({
                            sizeType:3,
                            cancelCall:null,
                            okCall: function () {
                                me.buy({
                                    prize: data.item,
                                    idx:sender.data.idx,
                                    num:1
                                });
                            },
                            autoClose:true,
                            richText:str
                        }).show();
                    } else {
                        me.buy({
                            prize: data.item,
                            idx:sender.data.idx,
                            num:1
                        });
                    }
                }
            });
        },
        // 获得组合后的新模板
        getNewItem: function () {
            var me = this;

            var list = me.nodes.list_mb;
            var list2 = me.nodes.list;

            // var interval = (list.width - me.extConf.maxnum * list2.width) / (me.extConf.maxnum - 1);
            for (var i = 0; i < me.extConf.maxnum; i++) {
                var lay = list.finds('panel_wp' + (i + 1) + '$');
                lay.setTouchEnabled(false);
                lay.removeAllChildren();
                var item = list2.clone();
                item.setAnchorPoint(cc.p(0.5,0.5));
                item.setPosition(cc.p(lay.width / 2,lay.height / 2));
                lay.addChild(item);
                // item.setPosition(cc.p(item.width / 2 + (item.width + interval) * i,list.height / 2));
                // list.addChild(item);
            }

            return list;
        },
        //组合成需要显示的数据
        filterData: function () {
            var me = this;

            var data = me.DATA.shop.shopitem;

            if(me.zz != 0) {
                var zzArr = [];
                for(var i = 0; i < data.length; i ++) {
                    var conf = G.class.getItem(data[i].item.t);
                    if(conf.zhongzu == me.zz) zzArr.push(data[i]);
                }
                data = zzArr;
            }


            var newData = [],
                arr=[];
            for (var i = 0; i < data.length; i++) {
                var d = data[i];
                //if (i % me.extConf.maxnum == 0) {
                //    arr = [];
                //}
                arr.push(d);
                if ((i + 1) % me.extConf.maxnum == 0) {
                    newData.push(arr);
                    arr = [];
                }
            }
            if(arr.length > 0) {
                newData.push(arr);
            }

            return newData;
        },
        // 设置场景动画
        setAni: function () {
            var me = this;

            var layLeft = me.nodes.panel_zs1;
            var layRight = me.nodes.panel_zs2;
        },
        // 设置刷新按钮
        setRefreshBtn: function () {
            var me = this;

            var btnRe = me.nodes.btn_1;
            var imgAttr = me.nodes.img_zs;
            var txtAttr = me.nodes.text_2;
            var imgMf = me.nodes.img_wz;
            var imgSx = me.nodes.img_wz2;
            var conf = me.shopConf;
            var data = me.DATA;

            if(me.curType == "1" || me.curType == "5") imgSx.setString(L("CZ"));

            imgAttr.hide();
            txtAttr.hide();
            imgMf.hide();
            imgSx.hide();
            //如果商店不需要刷新，隐藏刷新按钮
            var freeTime = data.shop.freetime;
            if (conf.rseconds == -1 && conf.need.length < 1) {
                btnRe.hide();
                return;
            }else if(conf.rseconds == -1 && conf.need.length > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                if(conf.need[0].n == 20000){
                    conf.need[0].n = '2万';
                }
                txtAttr.setString(conf.need[0].n);
                imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
            }else if (conf.rseconds !== -1 && freeTime - G.time < 0) {
                imgMf.show();
            }else if(conf.rseconds !== -1 && freeTime - G.time > 0){
                imgSx.show();
                imgAttr.show();
                txtAttr.show();
                if(conf.need[0].n == 20000){
                    conf.need[0].n = '2万';
                }
                txtAttr.setString(conf.need[0].n);
                imgAttr.loadTexture(G.class.getItemIco(conf.need[0].t),1);
            }

            btnRe.setTouchEnabled(true);
            btnRe.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(G.class.getOwnNum(conf.need[0].t, conf.need[0].a) < conf.need[0].n){
                        var name;
                        if(conf.need[0].a == "attr"){
                            name = G.class.attricon.getById(conf.need[0].t).name;
                        }else{
                            name = G.class.getItem(conf.need[0].t).name;
                        }
                        G.tip_NB.show(name + L("BUZU"));
                        return;
                    }
                    G.ajax.send('shop_shuaxin',[me.curType],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            me.refresh = 1;
                            G.tip_NB.show(L('SHUAXIN') + L('SUCCESS'));
                            me.DATA.shop = d.d.shopinfo;
                            me.refreshPanel();
                        }
                    },true);
                }
            });
        },
        // 设置货币信息
        setAttr: function () {
            var me = this;
            var imgAttr = me.nodes.token_lhs;
            var txtAttr = me.nodes.txt_sl;

            imgAttr.loadTexture(G.class.getItemIco(me.showAttr.t), 1);
            txtAttr.setString(X.fmtValue(G.class.getOwnNum(me.showAttr.t,me.showAttr.a)));
        },
        buy: function (args) {
            var me = this;

            var num = args.num;
            var idx = args.idx;
            var shopid = me.curType;

            G.ajax.send('shop_buy',[shopid,idx],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {

                    me.DATA.shop = d.d.shopinfo;

                    // G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));
                    G.frame.jiangli.data({
                        prize:[].concat(args.prize)
                    }).show();

                    me.refreshPanel();
                }
            },true);
        }

    });

    G.frame[ID] = new fun('shangdian2.json', ID);
})();