/**
 * Created by zhangming on 2018-05-03
 */
(function(){
 // 碎片列表
G.class.yingxiong_sp = X.bView.extend({
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
    },
    onRemove: function () {
        var me = this;
    },
    setContents:function() {
        var me = this;

        var type = me.curType || 0;
        me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
    },
    fmtItemList: function () {
        var me = this;

        cc.enableScrollBar( me.nodes.scrollview);
        G.frame.beibao._firstItem = null;
        me.nodes.scrollview.removeAllChildren();
        var table = new cc.myTableView({
            rownum: 4,
            type: 'fill',
            lineheight: me.nodes.list.height+31,
            paddingTop: 4
        });
        me.ui_table = table;
        table.setDelegate(this);
        this.setTableViewData();
        table.bindScrollView(me.nodes.scrollview);

        me.ui.setTimeout(function () {
            G.guidevent.emit("beibaoChangeTypeOver");
        }, 300);
    },
    setTableViewData: function () {
        var me = this;

        var data = G.frame.beibao.DATA.item.list;
        var keys = X.keysOfObject(data);

        var ownNum = data.maxnum;
        var heroData = [];
        var arr = [];
        if (me.curType == 0) {
            for (var i = 0; i < keys.length; i++) {
                var tid = keys[i];
                var d = data[tid];
                var conf = G.class.getItem(d.itemid,'item');
                if (conf.bagtype == '3' && conf.usetype == '12') {
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
                if (conf.bagtype == '3' && conf.zhongzu == me.curType && conf.usetype == '12') {
                    arr.push(tid);
                }
            }
        }
        me._tidArr = arr;
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
        // var zz2idx = {
        //     5:1, //神圣
        //     6:0, //暗影
        //     4:2, //自然
        //     3:4, //邪能
        //     2:5, //奥术
        //     1:6 //亡灵
        // };

        me._tidArr.sort(function (a,b) {
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
        var d = X.clone(G.frame.beibao.DATA.item.list[data] || {a: 'item', t: data});
        d.a = 'item';
        d._type = '3';
        // ui.setName(d.hid);
        if (!G.frame.beibao._firstItem) {
            G.frame.beibao._firstItem = ui;
        }

        var widget = G.class.sitem(d);
        // widget.setScale(0.9);
        widget.setAnchorPoint(0.5,0.5);
        widget.setPosition(cc.p( ui.nodes.ico.width*0.5, ui.nodes.ico.height*0.5));
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
        ui.nodes.ico.removeAllChildren();
        ui.nodes.ico.addChild(widget);

        ui.data = d;
        ui.setTouchEnabled(true);
        ui.setSwallowTouches(false);
        // ui.touch(function (sender, type) {
        //     if (type == ccui.Widget.TOUCH_NOMOVE){
        //         G.frame.yingxiong_xxxx.data({
        //             // uid: P.gud.uid,
        //             tid:sender.data,
        //             // idx:pos[0]*1 + pos[1],
        //             // zhongzu:me.curType,
        //             list:me._tidArr,
        //             frame:'yingxiong',
        //         }).show();
        //     }
        // });
        G.frame.iteminfo.showItemInfo(ui);
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