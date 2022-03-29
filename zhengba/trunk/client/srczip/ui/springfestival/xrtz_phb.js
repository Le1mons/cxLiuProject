
(function () {
    //排行榜
    var ID = 'xrtz_phb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.btn_bz.hide();

        },
        changeType: function (type) {
            var me = this;
            me.curType = type;
            var viewConf = {
                "pm": G.class.xrtz_phb_zs,
                "jl": G.class.xrtz_phb_jlyl,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].isShow = true;
            for(var i in me._panels){
                if(i != type){
                    me._panels[i].isShow = false;
                }
            }
            me._panels[type].show();
        },
        bindBtn: function () {
            var me = this;
            me.ui.nodes.mask.click(function(){
                me.remove();
            });
            me.nodes.btn_wzpm.click(function (sender,type) {
                if (me.curType == 'pm') return;
                sender.setBright(false);
                me.nodes.btn_sjjl.setBright(true);
                me.changeType('pm');
            });
            //
            me.nodes.btn_sjjl.click(function (sender,type) {
                if (me.curType == 'jl') return;
                sender.setBright(false);
                me.nodes.btn_wzpm.setBright(true);
                me.changeType('jl');
            });
            me.nodes.btn_sjjl.getChildByName('text_zzjjc$').setString('伤害奖励');
            me.nodes.btn_wzpm.triggerTouch(2);
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.refreshRedPoint();
        },
        refreshRedPoint:function(){
            var me = this;
            var ranklist = G.class.newyear3.getpmprize();
            var hd = 0;
            var rec = G.DATA.springfestival.myinfo.dpsrec;
            var topdps = G.DATA.springfestival.myinfo.topdps;
            for (var i=0;i<ranklist.length;i++){
                if (topdps>=ranklist[i][0][0] && !X.inArray(rec,i)){
                    hd = 1;
                    break;
                }
            }
            if (hd == 1){
                G.setNewIcoImg(me.nodes.btn_sjjl);
                me.nodes.btn_sjjl.finds('redPoint').setPosition(20,36);
            } else {
                G.removeNewIco(me.nodes.btn_sjjl);
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },
    });

    G.frame[ID] = new fun('shendianzhilu_tip_bg.json', ID);
})();
(function() {
    //排名展示
    G.class.xrtz_phb_zs = X.bView.extend({
        ctor: function() {
            var me = this;
            me._super('shendianzhilu_pmzs.json');
        },
        bindBTN: function() {
            var me = this;
        },
        onOpen: function() {
            var me = this;
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.setContents();
            me.setMyrank();
        },
        setMyrank:function(){
          var me = this;
            me.nodes.txt_dw.setString(G.DATA.springfestival.rank.myval);
            me.ui.finds('txt_level_0').setString(G.DATA.springfestival.rank.myrank<0?'未上榜':G.DATA.springfestival.rank.myrank);
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;
            var arr = JSON.parse(JSON.stringify(G.DATA.springfestival.rank.ranklist));
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar( me.nodes.scrollview,false);
            if (arr.length<1){
                me.nodes.img_zwnr.show();
                return;
            }
            me.nodes.img_zwnr.hide();
            for (var i=0;i<arr.length;i++){
                arr[i].rank  = i+1;
            }
            var table = me.table = new X.TableView( me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 10, 5);
            table.setData(arr);
            table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.nodes.sz_phb.setString(data.rank);

            var head = G.class.shead(data.headdata);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.removeAllChildren();
            ui.nodes.panel_tx.addChild(head);
            ui.nodes.txt_name.setString(data.headdata.name);
            ui.nodes.txt_number.setString(data.val);
            ui.nodes.text_zdl2.setString(data.headdata.maxzhanli);
            ui.nodes.btn_lx.uid = data.headdata.uid;
            ui.nodes.btn_lx.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    G.ajax.send('newyear3_fightlog', [sender.uid], function(d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            d.d.fightres.prize = [];
                            G.frame.fight.data({
                                pvType: 'newyear_xrtz',
                                isVideo: true,
                                fightData:d.d,
                            }).once('show', function() {

                            }).demo(d.d.fightres);
                        }
                    }, true);
                }
            })
        },
    });
})();
(function() {
    //奖励预览
    G.class.xrtz_phb_jlyl = X.bView.extend({
        ctor: function() {
            var me = this;
            me._super('chunjie_xrtz_tk.json');
        },
        bindBTN: function() {
            var me = this;
            me.ui.finds('Text_1').hide();
            me.nodes.btn_lq.click(function (sender,type) {
               G.ajax.send('newyear3_dpsprize',[],function (dd) {
                   var d = JSON.parse(dd);
                   if (d.s == 1){
                       G.frame.jiangli.data({
                           prize: d.d.prize
                       }).show();
                       G.DATA.springfestival.myinfo = d.d.myinfo;
                       me.setContents();
                       G.hongdian.getData('newyear3',1);
                        G.frame.xrtz_phb.refreshRedPoint();
                   }
               })
            });
        },
        onOpen: function() {
            var me = this;
            me.bindBTN();
        },
        onShow: function() {
            var me = this;
            me.setContents();
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;
            var last = me.getData();
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_rank,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(last);
            table.reloadDataWithScroll(true);
        },
        getData:function(){
            var me = this;
            var ranklist = JSON.parse(JSON.stringify(G.class.newyear3.getpmprize()));
            var last = [];
            for (var i in ranklist){
                var item = {};
                item.data = ranklist[i];
                item.idx = i;
                last.push(item);
            }
            last.sort(function (a,b) {
                return a.data[0][0] - b.data[0][0]<1?-1:1;
            });
            var arr1 = [];
            var arr2 = [];
            var rec = G.DATA.springfestival.myinfo.dpsrec;
            for (var i=0;i<last.length;i++){
                if (X.inArray(rec,last[i].idx)){
                    arr2.push(last[i]);
                } else {
                    arr1.push(last[i]);
                }
            }
            return arr1.concat(arr2);
        },
        setItem: function(ui, data) {
            var me = this;
            X.autoInitUI(ui);
            var layPm = ui.nodes.sz_phb;
            //排名
            var dpsinfo = data.data[0];
            layPm.setString(Math.ceil(dpsinfo[0]/10000)+'W');
            var prize = data.data[1];
            ui.nodes.img_wp.removeAllChildren();
            X.alignItems(ui.nodes.img_wp,prize,'left',{
                touch:true
            });
            var idx = data.idx;
            var rec = G.DATA.springfestival.myinfo.dpsrec;
            ui.nodes.panel_mc.setTouchEnabled(false);
            ui.nodes.panel_mc.setVisible(X.inArray(rec,idx));
        },
    });
})();