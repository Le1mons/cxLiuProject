/**
 * Created by zhangming on 2018-05-03
 */
(function(){
 // 背包列表
G.class.beibao_list = X.bView.extend({
    extConf:{
        zhuangbei:{
            data: function (type) {
                var data = G.frame.beibao.DATA.zhuangbei.list;
                var keys = X.keysOfObject(data);

                var arr = [];
                if (type == -1) {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var useNum = d.usenum || 0;
                        if (d.num > useNum) {
                            arr.push(tid);
                        }
                    }
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var useNum = d.usenum || 0;
                        var conf = G.class.equip.getById(d.eid);
                        if (conf.color == type && d.num > useNum) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                var dataA = G.frame.beibao.DATA.zhuangbei.list[a];
                var dataB = G.frame.beibao.DATA.zhuangbei.list[b];
                var confA = G.class.equip.getById(dataA.eid);
                var confB = G.class.equip.getById(dataB.eid);

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return confA.star > confB.star ? -1 : 1;
                }
            }
        },
        item:{
            data: function (type) {
                var data = G.frame.beibao.DATA.item.list;
                var keys = X.keysOfObject(data);

                var arr = [];
                if (type == -1) {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (conf.bagtype == '2') {
                            arr.push(tid);
                        }
                    }
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (conf.bagtype == '2' && conf.color == type) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                var dataA = G.frame.beibao.DATA.item.list[a];
                var dataB = G.frame.beibao.DATA.item.list[b];
                var confA = G.class.getItem(dataA.itemid);
                var confB = G.class.getItem(dataB.itemid);

                if (confA.usetype != confB.usetype) {
                    return confA.usetype * 1 < confB.usetype * 1 ? -1 : 1;
                } else if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return confA.itemid * 1 < confB.itemid * 1 ? -1 : 1;
                }
            }
        },
        suipian:{
            data: function (type) {
                var data = G.frame.beibao.DATA.item.list;
                var keys = X.keysOfObject(data);
                var heroData = [];
                var arr = [];
                if (type == -1) {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (conf.bagtype == '3') {
                            arr.push(tid);
                        }
                    }
                    for(var i = 0; i < keys.length; i ++){
                        heroData.push(G.frame.beibao.DATA.item.list[keys[i]]);
                        if(!heroData[i].tid) heroData[i].tid = keys[i];
                    }
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (conf.bagtype == '3' && conf.color == type) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                var dataA = G.frame.beibao.DATA.item.list[a];
                var dataB = G.frame.beibao.DATA.item.list[b];
                var confA = G.class.getItem(dataA.itemid);
                var confB = G.class.getItem(dataB.itemid);

                var hcheroA = confA.hchero ? 1 : 0;
                var hcheroB = confB.hchero ? 1 : 0;
                var isHcA = dataA.num >= confA.hcnum ? 0 : 1;
                var isHcB = dataB.num >= confB.hcnum ? 0 : 1;
                if (isHcA != isHcB) {
                    return isHcA < isHcB ? -1 : 1;
                } else if (hcheroA != hcheroB) {
                    return hcheroA * 1 < hcheroB * 1 ? -1 : 1;
                } else if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return confA.itemid * 1 < confB.itemid * 1 ? -1 : 1;
                }
            }
        },
        shipin:{
            data: function (type) {
                var data = G.frame.beibao.DATA.shipin.list;
                var keys = X.keysOfObject(data);

                var arr = [];
                if (type == -1) {
                    arr = arr.concat(keys);
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.shipin.getById(d.spid);
                        if (conf.color == type) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                var dataA = G.frame.beibao.DATA.shipin.list[a];
                var dataB = G.frame.beibao.DATA.shipin.list[b];
                var confA = G.class.shipin.getById(dataA.spid);
                var confB = G.class.shipin.getById(dataB.spid);

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return confA.star * 1 > confB.star * 1 ? -1 : 1;
                }
            }
        },
        glyph: {
            data: function (type) {
                var data = G.frame.beibao.DATA.glyph.list;
                var keys = X.keysOfObject(data);

                var arr = [];
                if (type == -1) {
                    for (var i in keys) {
                        if(!data[keys[i]].isuse) arr.push(keys[i]);
                    }
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.glyph.getById(d.gid);
                        if (conf.color == type && !d.isuse) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a, b) {
                var dataA = G.frame.beibao.DATA.glyph.list[a];
                var dataB = G.frame.beibao.DATA.glyph.list[b];
                var confA = G.class.glyph.getById(dataA.gid);
                var confB = G.class.glyph.getById(dataB.gid);

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return dataA.lv * 1 > dataB.lv * 1 ? -1 : 1;
                }
            }
        }
    },
    ctor: function (type) {
        var me = this;
        me._type = type;
        me._super('beibao.json');
    },
    bindBTN:function() {
        var me = this;


    },
    onOpen: function () {
        var me = this;
        me.bindBTN();
    },
    onShow : function(){
        var me = this;


        me.needScroll = true;
        me.createMenu();
    },
    onNodeShow : function(){
        var me = this;
    },
    onRemove: function () {
        var me = this;
    },
    createMenu: function(){
        var me = this;
        me._menus = [];

        var color2png = {
            1:1,
            2:6,
            3:2,
            4:3,
            5:4,
            6:5,
            7:7
        };

        for(var i=1;i<8;i++){
            var panel = me.nodes['panel_' + i];
            var list_ico = me.nodes.list_ico.clone();
            X.autoInitUI(list_ico);
            list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_pj' + color2png[i] + '.png', 1);
            list_ico.nodes.panel_pj.setTouchEnabled(false);
            list_ico.setTouchEnabled(true);
            list_ico.data = i - 2;

            list_ico.click(function(sender, type){
                for(var j=0;j<me._menus.length;j++){
                    var node = me._menus[j];
                    var img = "img/public/ico/ico_pj" + color2png[node.data + 2] + ".png";
                    if(node.data == sender.data){
                        if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                        me.effect = true;
                        img = "img/public/ico/ico_pj" + color2png[node.data + 2] + "_g.png";
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
                        if(node.ani) node.ani.hide();

                    }
                    node.nodes.panel_pj.setBackGroundImage(img, 1);
                }

                G.frame.beibao.curType = sender.data;
                me.needScroll = true;
                me.setContents();
            });

            list_ico.show();
            list_ico.setAnchorPoint(0.5,0.5);
            list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5));
            panel.addChild(list_ico);

            me._menus.push(list_ico);
            list_ico.show();
        }

        var type = G.frame.beibao.curType != undefined ? G.frame.beibao.curType + 1 : 0;
        me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
    },
    refreshPanel: function(){
        var me = this;

        me.needScroll = false;
        me.setContents();
    },
    setContents: function () {
        var me = this;

        var panel = me.ui;
        var scrollview = me.nodes.scrollview;
        cc.enableScrollBar(scrollview);
        scrollview.removeAllChildren();
        me.nodes.list.hide();

        var obj = {
            1:'zhuangbei',
            2:'item',
            3:'suipian',
            4:'shipin',
            5: "glyph"
        };
        var data = me.extConf[obj[me._type]].data(G.frame.beibao.curType);

        cc.isNode(panel.finds('img_zwnr')) && panel.finds('img_zwnr').hide();
        if (data.length < 1) {
            cc.isNode(panel.finds('img_zwnr')) && panel.finds('img_zwnr').show();
            return;
        }

        data.sort(me.extConf[obj[me._type]].sort);

        
        G.frame.beibao._firstItem = null;
        
        var table = me.table = new X.TableView(scrollview,me.nodes.list,4, function (ui, data) {
            me.setItem(ui, data);
        },null,null,me._type == '3' ? 31 : 12 ,5);
        table.setData(data);
        table.reloadDataWithScroll(true);
    },

    setItem: function (ui, data) {
        var me = this;

        if (data == null) {
            ui.hide();
            return;
        }
        var obj = {
            1:{
                type:'zhuangbei',
                a:'equip'
            },
            2:{
                type:'item',
                a:'item'
            },
            3:{
                type:'item',
                a:'item'
            },
            4:{
                type:'shipin',
                a:'shipin'
            },
            5: {
                type: "glyph",
                a: "glyph"
            }
        }
        ;
        var itemData = X.clone(G.frame.beibao.DATA[obj[me._type].type].list[data]);
        X.autoInitUI(ui);
        var layIco = ui.nodes.ico;
        layIco.removeAllChildren();

        itemData.a = obj[me._type].a;
        itemData._type = me._type;
        var widget = G.class.sitem(itemData);
        
        //映射出去便于新手指导
        if(G.frame.beibao._firstItem==null){
        	G.frame.beibao._firstItem = ui;
        }
        
        // widget.setScale(0.8);
        widget.setAnchorPoint(0.5,0.5);
        widget.setPosition(cc.p( layIco.width / 2, layIco.height / 2));
        layIco.addChild(widget);
        layIco.setTouchEnabled(false);

        if (me._type == '3') {
            widget.num.hide();
            var jdtBg = new ccui.Layout();
            jdtBg.setName('jdtBg');
            jdtBg.setBackGroundImage('img/public/jdt/img_sp_jdt_bg.png',1);
            jdtBg.setAnchorPoint(cc.p(0.5,0.5));
            jdtBg.setPosition(cc.p(widget.width / 2,-13));
            widget.addChild(jdtBg);

            var jdt = new ccui.LoadingBar();
            jdt.loadTexture('img/public/jdt/img_sp_jdt2.png',1);
            jdt.setPosition(widget.width / 2,-13);
            jdt.setName('jdt');
            widget.addChild(jdt);

            if (widget.data.num >= widget.conf.hcnum * 1) {
                jdt.setPercent(100);
                jdt.loadTexture('img/public/jdt/img_sp_jdt.png',1);
            } else {
                jdt.setPercent(Math.floor(widget.data.num / widget.conf.hcnum * 100));
            }

            var txtJdt = new ccui.Text('0/0','',14);
            txtJdt.setName('txtJdt');
            txtJdt.setFontName(G.defaultFNT);
            txtJdt.setString(widget.data.num + '/' + widget.conf.hcnum);
            txtJdt.setPosition(cc.p(widget.width / 2,-13));
            txtJdt.setAnchorPoint(cc.p(0.5,0.5));
            X.enableOutline(txtJdt,'#66370e');
            widget.addChild(txtJdt);
        }
        ui.data = itemData;
        ui.id = data;
        
        if(me._type != 5) {
            G.frame.iteminfo.showItemInfo(ui);
        } else {
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.click(function (sender) {
                G.frame.diaowen_sx.data(sender.id).show();
            });
        }
        ui.show();
    },

});

})();