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
                } else if (confA.colorlv != confB.colorlv) {
                    return confA.colorlv > confB.colorlv ? -1 : 1;
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
                        if (conf && conf.bagtype == '2') {
                            arr.push(tid);
                        }
                    }
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (conf && conf.bagtype == '2' && conf.color == type) {
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
                } else if (confA.colorlv != confB.colorlv) {
                    return confA.colorlv > confB.colorlv ? -1 : 1;
                } else {
                    return confA.itemid * 1 < confB.itemid * 1 ? -1 : 1;
                }
            }
        },
        suipian:{
            data: function (type) {
                var isHero = G.frame.yingxiong.isShow;
                var data = G.frame.beibao.DATA.item.list;
                var keys = X.keysOfObject(data);
                var heroData = [];
                var arr = [];
                if (type == -1 || (isHero && type == 0)) {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.getItem(d.itemid,'item');
                        if (isHero) {
                            if (conf.bagtype == '3' && conf.usetype == '12') {
                                arr.push(tid);
                            }
                        } else {
                            if (conf.bagtype == '3' && conf.usetype != '12') {
                                arr.push(tid);
                            }
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
                        if (isHero) {
                            if (conf.bagtype == '3' && conf.zhongzu == type && conf.usetype == '12') {
                                arr.push(tid);
                            }
                        } else {
                            if (conf.bagtype == '3' && conf.color == type && conf.usetype != '12') {
                                arr.push(tid);
                            }
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
                // 饰品碎片
                var data = G.frame.beibao.DATA.item.list;
                var keys = X.keysOfObject(data);
                var arr = [];

                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    var d = data[tid];
                    var conf = G.class.getItem(d.itemid,'item');
                    if (conf && conf.bagtype == '4' && (type == -1 || conf.color == type) ) {
                        arr.push({a:'item', t:d.itemid, n:d.num, tid:tid});
                    }
                }

                // 饰品
                var data = G.frame.beibao.DATA.shipin.list;
                var keys = X.keysOfObject(data);

                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    var d = data[tid];
                    var conf = G.class.shipin.getById(d.spid);
                    if (type == -1 || conf.color == type) {
                        arr.push({a:'shipin', t:d.spid, n:d.num, tid:tid});
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                if(a.a != b.a){
                    return a.a == 'item' ? -1 : 1;
                }else{
                    if(a.a == 'item'){
                        var dataA = G.frame.beibao.DATA.item.list[a.tid];
                        var dataB = G.frame.beibao.DATA.item.list[b.tid];
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
                    }else{
                        var dataA = G.frame.beibao.DATA.shipin.list[a.tid];
                        var dataB = G.frame.beibao.DATA.shipin.list[b.tid];
                        var confA = G.class.shipin.getById(dataA.spid);
                        var confB = G.class.shipin.getById(dataB.spid);

                        if(!confA) {
                            cc.log(dataA.spid + "+++++++++++" + confA);
                        }
                        if(!confB) {
                            cc.log(dataB.spid + "+++++++++++" + confB)
                        }

                        if (confA.color != confB.color) {
                            return confA.color > confB.color ? -1 : 1;
                        } else {
                            return confA.star * 1 > confB.star * 1 ? -1 : 1;
                        }
                    }
                }
            }
        },
        shipintujian: {
            data: function (type) {
                var data = G.gc.sp;
                var keys = [];

                for (var i in data) if ((data[i].color == 4 || data[i].color == 5)
                    && i.toString().length == 4 && i.toString()[i.toString().length - 1] == 6) keys.push(i);

                var arr = [];
                if (type == -1) {
                    arr = arr.concat(keys);
                } else {
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        var d = data[tid];
                        var conf = G.class.shipin.getById(d.id);
                        if (conf.color == type) {
                            arr.push(tid);
                        }
                    }
                }

                return arr;
            },
            sort: function (a,b) {
                var confA = G.class.shipin.getById(a);
                var confB = G.class.shipin.getById(b);

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return confA.id * 1 > confB.id * 1 ? -1 : 1;
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
                } else if (confA.colorlv != confB.colorlv) {
                    return confA.colorlv > confB.colorlv ? -1 : 1;
                } else {
                    return dataA.lv * 1 > dataB.lv * 1 ? -1 : 1;
                }
            }
        },
        wuhun: {
            data: function (type) {
                var data = G.DATA.wuhun;
                var arr = [];
                if (type == -1) {
                    for (var i in data) {
                        data[i].tid = i;
                        data[i].type = "wuhun";
                        if(!data[i].wearer){
                            arr.push(i);
                        }
                    }
                } else {
                    for(var i in data){
                        var conf = G.gc.wuhun[data[i].id][data[i].lv];
                        if(conf.zhongzu == type+1 && !data[i].wearer){
                            arr.push(i)
                        }
                    }
                }
                return arr;
            },
            sort: function (a, b) {
                var dataA = G.DATA.wuhun[a];
                var dataB = G.DATA.wuhun[b];
                if(dataA.lv != dataB.lv){
                    return dataA.lv > dataB.lv ? -1:1;
                }else {
                    return dataA  .id * 1 > dataB.id * 1 ? -1:1;
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

        X.radio([me.nodes.btn_zyjj, me.nodes.btn_phb], function (sender) {
            var obj = {
                btn_zyjj$: "",
                btn_phb$: "tujian"
            };
            me.changeType(obj[sender.getName()]);
        });
    },
    changeType: function(str) {
        var me = this;

        me.str = str;
        me.createMenu();
    },
    onOpen: function () {
        var me = this;
        me.bindBTN();
    },
    onShow : function(){
        var me = this;


        me.needScroll = true;
        if(me._type != 4) {
            if (G.frame.beibao.isShow) me.createMenu();
            else me.createHeroMenu();
        }
        else me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);

        if(me._type == 4) {
            me.nodes.scrollview_sp.show();
            me.nodes.panel_sptj.show();
        }

        cc.enableScrollBar(me.nodes.scrollview_sp);
        cc.enableScrollBar(me.nodes.scrollview);
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
        me._heromenu = []
        me.nodes.panel_pz.setVisible(me._type!=6);
        me.nodes.panel_zz.setVisible(me._type==6);
        var color2png = {
            1:1,
            2:2,
            3:3,
            4:4,
            5:5,
            6:6,
            7:7
        };
        var color3png = {
            1:1,
            2:6,
            3:2,
            4:3,
            5:4,
            6:5,
            7:7
        };
        if (me._type == 6){
            for (var i = 1; i <= 8; i++) {
                var panel = me.nodes['panel_zz' + i];
                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_pj.setTouchEnabled(false);

                if (i==8){
                    list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz11.png', 1);
                } else {
                    list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz' + i + '.png', 1);
                }
                list_ico.show();

                list_ico.data = i - 1;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._heromenu.length;j++){
                        var node = me._heromenu[j];
                        if(node.data == 7){
                            var img = 'img/public/ico/ico_zz11.png';
                        }else {
                            var img = 'img/public/ico/ico_zz' + (node.data+1) + '.png';
                        }
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            if(node.data == 7){
                                var img = 'img/public/ico/ico_zz11_g.png';
                            }else {
                                var img = 'img/public/ico/ico_zz' + (node.data+1) + '_g.png';
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
                            if(node.ani) node.ani.hide();

                        }
                        node.nodes.panel_pj.setBackGroundImage(img, 1);
                    }

                    G.frame.beibao.curType = sender.data-1;
                    me.needScroll = true;
                    me.setContents();
                });

                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5));
                panel.removeAllChildren();
                panel.addChild(list_ico);

                me._heromenu.push(list_ico);
                list_ico.show();
            }
        }else {
            for(var i=1;i<8;i++){
                var panel = me.nodes['panel_' + i];
                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                if(me._type == 6){
                    list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz' + color2png[i] + '.png', 1);
                }else {
                    list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_pj' + color3png[i] + '.png', 1);
                }
                list_ico.nodes.panel_pj.setTouchEnabled(false);
                list_ico.setTouchEnabled(true);
                list_ico.data = i - 2;

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        if(me._type == 6){
                            var img = 'img/public/ico/ico_zz' + color2png[node.data + 2] + '.png';
                        }else {
                            var img = "img/public/ico/ico_pj" + color3png[node.data + 2] + ".png";
                        }
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            if(me._type ==  6){
                                img = 'img/public/ico/ico_zz' + color2png[node.data + 2] + '_g.png';
                            }else {
                                img = "img/public/ico/ico_pj" + color3png[node.data + 2] + "_g.png";
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
                panel.removeAllChildren();
                panel.addChild(list_ico);

                me._menus.push(list_ico);
                list_ico.show();
            }
        }
        var type = G.frame.beibao.curType != undefined ? G.frame.beibao.curType + 1 : 0;
        if (me._heromenu[type]){
            me._heromenu[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        }else {
            if (me._menus[type]){
                me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
            } else {
                me._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
        }
    },
    createHeroMenu: function () {
        var me = this;
        me._menus = [];

        //图标中，1指的是全部
        for(var i=0;i<7;i++){
            var panel = me.nodes['panel_' + (i+1)];

            var list_ico = me.nodes.list_ico.clone();
            X.autoInitUI(list_ico);
            list_ico.nodes.panel_pj.setTouchEnabled(false);
            list_ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
            list_ico.show();
            list_ico.setAnchorPoint(0.5,0.5);
            list_ico.setPosition(cc.p(panel.width*0.5, panel.height*0.5 + 2));

            list_ico.data = i;
            list_ico.setTouchEnabled(true);

            list_ico.click(function(sender, type){
                for(var j=0;j<me._menus.length;j++){
                    var node = me._menus[j];
                    var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                    if(node.data == sender.data){
                        if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                        me.effect = true;
                        me.curType = sender.data;
                        me.setContents();
                        img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
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
                    node.nodes.panel_pj.setBackGroundImage(img,1);
                }
                //sender.nodes.img_yuan_xz.show();
            });

            me._menus.push(list_ico);
            if(G.frame.yingxiong.isShow){
                var offset = {
                    '0': [4, 2],
                    '1': [3, 2],
                    '2': [3, 2],
                    '3': [2, 2],
                    '4': [1, 2],
                    '5': [1, 2],
                    '6': [0, 2],
                }[i];

                panel.x += offset[0];
                panel.y -= offset[1];
            }
            panel.addChild(list_ico);
        }
        me._menus[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
    },
    refreshPanel: function(){
        var me = this;

        me.needScroll = false;
        me.setContents();
    },
    setContents: function () {
        var me = this;

        var panel = me.ui;
        var scrollview = me._type == '4' ? me.nodes.scrollview_sp : me.nodes.scrollview;
        scrollview.removeAllChildren();
        me.nodes.list.hide();

        var obj = {
            1:'zhuangbei',
            2:'item',
            3:'suipian',
            4:'shipin',
            5: "glyph",
            6: "wuhun"
        };
        var type = [obj[me._type]] + (me.str || '');
        var cutType = G.frame.beibao.curType != undefined? G.frame.beibao.curType: me.curType;
        var data = me.extConf[type].data(cutType);

        cc.isNode(panel.finds('img_zwnr')) && panel.finds('img_zwnr').hide();
        if (data.length < 1) {
            cc.isNode(panel.finds('img_zwnr')) && panel.finds('img_zwnr').show();
            return;
        }

        data.sort(me.extConf[type].sort);

        G.frame.beibao._firstItem = null;

        var table = me.table = new X.TableView(scrollview,me.nodes.list,4, function (ui, data) {
            me.setItem(ui, data);
        }, null, null, X.inArray(['3', '4'], me._type) && me.str != 'tujian' ? 31 : 12, 5);
        table.setData(data);
        table.reloadDataWithScroll(true);

        me.ui.setTimeout(function () {
            G.guidevent.emit("beibaoChangeTypeOver");
        }, 200);
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
            },
            6: {
                type: "wuhun",
                a: "wuhun"
            }
        }
        ;
        var itemData;
        var tid;
        if(me._type == 6){//武魂
            itemData = X.clone(G.DATA.wuhun[data] || {a: obj[me._type].type, t: data});
            itemData.a = obj[me._type].a;
            tid = data;
            itemData._type = me._type;
        }else if(me._type != 4 || me.str == 'tujian'){
            itemData = X.clone(G.frame.beibao.DATA[obj[me._type].type].list[data] || {a: obj[me._type].type, t: data});
            itemData.a = obj[me._type].a;
            tid = data;
            itemData._type = me._type;
        }else{
            if(data.a == 'item'){
                // 碎片
                itemData = X.clone(G.frame.beibao.DATA.item.list[data.tid] || {a: 'item', t: data.tid});
                itemData._type = 3;
            }else{
                // 饰品
                itemData = X.clone(G.frame.beibao.DATA.shipin.list[data.tid] || {a: 'shipin', t: data.tid});
                itemData._type = me._type;
            }
            itemData.a = data.a;
            tid = data.tid;
        }
        X.autoInitUI(ui);
        var layIco = ui.nodes.ico;
        layIco.removeAllChildren();


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

        if (X.inArray([1, 6, 11, 9], itemData.usetype) && !X.cacheByUid("showToDayUseItemRedPoint")) {
            G.setNewIcoImg(widget, .88);
        } else G.removeNewIco(widget);

        // 碎片
        if (me._type == '3' || (me._type == '4' && data.a == 'item')) {
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
        ui.data = widget.data;
        ui.conf = widget.conf;
        ui.id = tid;
        ui.setTouchEnabled(true);
        ui.setSwallowTouches(false);
        if(me._type != 5) {
            if(itemData.usetype == 9) {
                ui.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.usebox.data(sender.data).show();
                    }
                });
            } else if (itemData.usetype == 15) {
                ui.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.usebox_new.data(sender).show();
                    }
                });
            }else if(itemData.usetype == 16 || itemData.usetype == 17){
                ui.touch(function (sender,type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.tip_baoxiang.data({item:sender.data,type:"bag"}).show();
                    }
                });
            } else if(itemData.a == "wuhun"){//武魂
                ui.touch(function (sender,type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.wuhun_info.data({
                            whtid:sender.id,
                            type:"recycle"
                        }).show();
                    }
                });
            } else{
                G.frame.iteminfo.showItemInfo(ui);
            }
        } else {
            ui.click(function (sender) {
                G.frame.diaowen_sx.data(sender.id).show();
            });
        }
        ui.show();
    },

});

})();