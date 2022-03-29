
(function () {
    //域外争霸_争霸强者

    var ID = 'yuwaizhengba_zbqz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        getData : function(callback){
            var me = this;
            me.ajax('crosszb_kinglog',[],function(s,data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            },true);
        },
        bindUI: function () {
            var me = this;
            me.ui.nodes.mask.click(function(sender,type){
                me.remove();
            });
            me.nodes.tip_title.setString(L('UI_TITLE_ZBQZ'));
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
        },
        onShow: function () {
            var me = this;
            new X.bView("kfzb_zbqz.json", function (view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.getData(function () {
                    me.setContents();
                });
            });
        },
        setContents:function() {
            var me = this;
            var view = me._view;
            var data = me.DATA;
            var scrollview = view.nodes.scrollview_xuanshangrenwu;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            view.nodes.zwnr.hide();
            if (!data || data.length < 1) {
                view.nodes.zwnr.show();
                return;
            }
            var table = me.table = new X.TableView(scrollview,view.nodes.list_nr,1, function (ui, data,pos) {
                me.setItem(ui, data,pos);
            },null, null,8, 10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem :function(ui,data,pos) {
            var me = this;
            if(!data){
                ui.hide();
                return;
            }
            ui.setTouchEnabled(false);
            X.autoInitUI(ui);
            var nodes = ui.nodes;
            X.render({
                txt_name:data.headdata.name,
                ph_wz:data.rank,
                text_zdl:data.zhanli,
                txt_name1:data.toheaddata.name,
                ph_wz1:data.torank,
                text_zdl1:data.tozhanli,
            },nodes);
            ui.finds('img_dk_0').setColor(cc.color('#EDE4D0'));
            ui.finds('img_dk').setColor(cc.color('#EDE4D0'));
            var ico1 = nodes.panel_tx;
            var wid1 = G.class.shead(data.headdata);
            wid1.setPosition(cc.p(ico1.width / 2,ico1.height / 2));
            ico1.removeAllChildren();
            ico1.addChild(wid1);
            ico1.setTouchEnabled(true);
            ico1.setSwallowTouches(false);
            ico1.data = data.uid;
            ico1.click(function (sender, type) {
                G.frame.wanjiaxinxi.data({
                    pvType: 'zypkjjc',
                    uid: sender.data
                }).checkShow();
            });

            var ico2 = nodes.panel_tx2;
            var wid2 = G.class.shead(data.toheaddata);
            wid2.setPosition(cc.p(ico2.width / 2,ico2.height / 2));
            ico2.addChild(wid2);
            ico2.setTouchEnabled(true);
            ico2.setSwallowTouches(false);
            ico2.data = data.touid;
            ico2.click(function (sender, type) {
                G.frame.wanjiaxinxi.data({
                    pvType: 'zypkjjc',
                    uid: sender.data
                }).checkShow();
            });

            var btn = nodes.btn_huifang;
            btn.setSwallowTouches(false);
            btn.data = data.flogid;
            btn.click(function (sender, type) {
                me.ajax('crosszb_fightreplay',[sender.data], function (s,data) {
                    if (data.s == 1) {
                        data.d.pvType = "video";
                        G.frame.fight.demo(data.d);
                    }
                },true);
            });
            ui.show();
        },
        onAniShow: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_tip7.json', ID);
})();