/**
 * Created by zhangming on 2018-05-03
 */
(function(){
 // 英雄列表
G.class.yingxiong_lb = X.bView.extend({
    ctor: function (type) {
        var me = this;
        me._type = type;
        me._super('yingxiong.json');
    },
    refreshPanel: function(){
        var me = this;
        me.setContents();
    },
    bindBTN:function() {
        var me = this;
        
    },
    onOpen: function () {
        var me = this;
        me.nodes.btn_jia.hide();
        me.nodes.scrollview1.hide();
        me.bindBTN();
    },
    onShow : function(){
        var me = this;
        
        me.createMenu();
        me.refreshPanel();
        
        G.frame.yingxiong.onnp('updateInfo', function (d) {
            me.setContents();
        }, me.getViewJson());
    },
    getHeroCell: function(callback) {
        var me = this;
        connectApi('user_getgezinum', [], function (data) {
            G.DATA.heroCell = data;
            callback && callback();
        }, function () {
            G.DATA.heroCell = {};
            callback && callback();
        });
    },
    onRemove: function () {
        var me = this;
    },
    //英雄格子数量
    setHeroCell: function () {
        var me = this;

        var list = G.DATA.yingxiong.list;
        var keys = X.keysOfObject(list);
        var conf = G.class.getConf('herocom').herocell;
        var data = G.DATA.heroCell;
        var ownNum = data.maxnum;

        if(keys.length == 0){
            me.ui.finds("img_zwnr").show();
        }

        me.render({
            txt_sl: function (node) {
                var btn = me.nodes.btn_jia.clone();
                btn.show();
                btn.click(function (sender, type) {
                    buy();
                });
                var str = X.STR(L("{1}/{2}   <font node=1></font> "), keys.length, ownNum);
                var rh = new X.bRichText({
                    size: 20,
                    lineHeight: 24,
                    color: G.gc.COLOR.n4,
                    maxWidth: node.width,
                    family: G.defaultFNT
                });
                rh.text(str, [btn]);
                rh.setAnchorPoint(0.5, 0.5);
                rh.setPosition(node.width / 2, 5);
                node.removeAllChildren();
                node.addChild(rh);
            }, // 数量

        });

        function buy() {
            var need = G.class.formula.compute(conf.need[0].n,{buyednum:data.buynum || 0});
            var str = X.STR(L('YINGXIONG_BUG_CELL'),need,conf.addnum);
            G.frame.alert.data({
                cancelCall:null,
                autoClose:false,
                okCall: function () {
                    G.ajax.send('user_addgezinum',[],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.event.emit("sdkevent", {
                                event: "user_addgezinum"
                            });
                            for (var key in d.d) {
                                G.DATA.heroCell[key] = d.d[key];
                            }
                            G.tip_NB.show(L('GOUMAI') + L('SUCCESS'));
                            me.setHeroCell();
                            var need = G.class.formula.compute(conf.need[0].n,{buyednum:data.buynum || 0});
                            var str = X.STR(L('YINGXIONG_BUG_CELL'),need,conf.addnum);
                            G.frame.alert.data({richText:str,autoClose:false}).setContents();
                        }
                    },true);
                },
                sizeType:3,
                richText:str,
            }).show();
        }
    },
    setContents:function() {
        var me = this;

        var type = me.curType || 0;
        me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
    },
    fmtItemList: function () {
        var me = this;

        if (!cc.isNode(me.ui)) return;
        G.frame.yingxiong._firstItem = null;
        
        cc.enableScrollBar( me.nodes.scrollview);
        me.nodes.scrollview.removeAllChildren();
        var table = new cc.myTableView({
            rownum: 4,
            type: 'fill',
            lineheight: me.nodes.list.height+12,
            paddingTop: 4
        });
        me.ui_table = table;
        table.setDelegate(this);
        this.setTableViewData();
        table.bindScrollView(me.nodes.scrollview);
        // me.ui_table.tableView.reloadData();
        // me.nodes.scrollview.getChildren()[0].getChildren()[0].x += 1;

        cc.callLater(function () {
            G.guidevent.emit("yingxiongLoadOver");
        })
    },
    setTableViewData: function () {
        var me = this;

        me._tidArr = G.frame.yingxiong.getTidArr(me.curType);
        var zz2idx = {
            5:1, //神圣
            6:0, //暗影
            4:2, //自然
            3:4, //邪能
            2:5, //奥术
            1:6, //亡灵
            7:7 //传说
        };

        me._tidArr.sort(function (a,b) {
            var dA = G.frame.yingxiong.getHeroDataByTid(a);
            var dB = G.frame.yingxiong.getHeroDataByTid(b);

            if(dA.star != dB.star) {
                return dA.star > dB.star ? -1 : 1;
            } else if(dA.lv != dB.lv) {
                return dA.lv > dB.lv ? -1 : 1;
            } else if(dA.zhongzu != dB.zhongzu) {
                return zz2idx[dA.zhongzu] < zz2idx[dB.zhongzu] ? -1 : 1;
            } else if(dA.hid != dB.hid) {
                return dA.hid * 1 > dB.hid ? -1 : 1;
            } else {
                return dA.zhanli > dB.zhanli ? -1 : 1;
            }
        });

        var table = me.ui_table;
        table.data(me._tidArr);
    },
    /**
     * 数据模板
     * @returns {*}
     */
    cellDataTemplate: function () {
        var me = this;
        return me.nodes.list.clone();
    },
    /**
     * 数据初始化
     * @param ui
     * @param data
     */
    cellDataInit: function (ui, data, pos) {
        var me = this;
        if (data == null) {
            ui.hide();
            return;
        }
        // ui.setName(pos[0]*1 + pos[1]);
        X.autoInitUI(ui);
        var d = G.DATA.yingxiong.list[data];
        ui.setName(d.hid);
        
        //映射出去便于新手指导
        if(G.frame.yingxiong._firstItem==null){
        	G.frame.yingxiong._firstItem = ui;
        }

        var widget = G.class.shero(d);
        // widget.setScale(0.9);
        widget.setAnchorPoint(0.5,0.5);
        widget.setPosition(cc.p( ui.nodes.ico.width*0.5, ui.nodes.ico.height*0.5));
        ui.nodes.ico.removeAllChildren();
        ui.nodes.ico.addChild(widget);

        if(G.DATA.heroPoint[data]) G.setNewIcoImg(widget, .9);
        else G.removeNewIco(widget);

        ui.data = data;
        ui.setTouchEnabled(true);
        ui.setSwallowTouches(false);
        ui.touch(function (sender, type) {
            if (type == ccui.Widget.TOUCH_NOMOVE){
                G.frame.yingxiong_xxxx.data({
                    // uid: P.gud.uid,
                    tid:sender.data,
                    // idx:pos[0]*1 + pos[1],
                    // zhongzu:me.curType,
                    list:me._tidArr,
                    frame:'yingxiong',
                }).show();
            }
        });
        ui.show();
    },
    createMenu: function(){
        var me = this;
        me._menus = [];

        //图标中，1指的是全部
        for(var i=0;i<8;i++){
            var panel = me.nodes['panel_' + (i+1)];

            var list_ico = me.nodes.list_ico.clone();
            X.autoInitUI(list_ico);
            list_ico.nodes.panel_zz.setTouchEnabled(false);
            if (i == 7){
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
            } else {
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
            }

            list_ico.show();
            list_ico.setAnchorPoint(0.5,0.5);
            list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5 + 2));

            list_ico.data = i;
            list_ico.setTouchEnabled(true);

            list_ico.click(function(sender, type){
                for(var j=0;j<me._menus.length;j++){
                    var node = me._menus[j];
                    if(node.data == 7){
                        //第八种族
                        var img = 'img/public/ico/ico_zz11.png';
                    }else {
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                    }

                    if(node.data == sender.data){
                        if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                        me.effect = true;
                        me.curType = sender.data;
                        me.fmtItemList();
                        if (node.data == 7){
                            img = 'img/public/ico/ico_zz11_g.png';
                        } else {
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                        }
                        if (sender.data == 0) {
                            me.nodes.txt_zzwzsl.setString(L("QB") + L("zhongzu"));
                        } else {
                            me.nodes.txt_zzwzsl.setString(L("zhongzu_" + sender.data) + L("zhongzu"));
                        }
                        if(sender.ani){
                            sender.ani.show();
                        }else{
                            G.class.ani.show({
                                json: "ani_guangbiaoqiehuan",
                                addTo: sender,
                                x: sender.width / 2,
                                y: sender.height / 2,
                                repeat: true,
                                autoRemove: false,
                                onload: function(node){
                                    sender.ani = node;
                                }
                            })
                        }
                    }else{
                        //node.nodes.img_yuan_xz.hide();
                        if(node.ani) node.ani.hide();
                    }
                    node.nodes.panel_zz.setBackGroundImage(img,1);
                }
                //sender.nodes.img_yuan_xz.show();
            });

            me._menus.push(list_ico);
            panel.addChild(list_ico);
        }
    },
});

})();