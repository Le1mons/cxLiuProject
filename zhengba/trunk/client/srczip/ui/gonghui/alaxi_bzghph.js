/**
 * Created by  on 2019//.
 */
(function () {
    //本周公会排行
    var ID = 'alaxi_bzghph';
    var fun = X.bUi.extend({
        titleimg:['wz_shoulian1','wz_kuangdong1','wz_tiejiangpu1','wz_famuchang1','wz_nongchang1'],
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.tip_title.setString(L('GONGHUIFIGHT22'));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;
            connectApi("gonghuisiege_cityrank", [], function (data) {
                me.DATA = data;
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;
            new X.bView('ghz_tip_ghpm.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.listview);
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var arr = Object.keys(me.DATA).sort(function (a, b) {
                return a * 1 < b * 1 ? -1 : 1;
            });
            me.view.nodes.listview.removeAllChildren();
            for(var i = 0; i < arr.length; i++){
                var list = me.view.nodes.list.clone();
                me.setItem(list,arr[i],i);
                me.view.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function (ui,id,index) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var data = me.DATA[id];
            var conf = G.gc.gonghuisiege.cityinfo[id];
            ui.nodes.panel_mc.removeBackGroundImage();
            ui.nodes.panel_mc.setBackGroundImage('img/gonghui/ghz/' + me.titleimg[index] + ".png",1);
            for(var i = 0; i < 4; i++){
                ui.nodes['txt_gh_xwyd' + (i+1)].setVisible(!data[i]);
                ui.nodes['txt_gh_name' + (i+1)].setVisible(data[i]);
                ui.nodes['panel_jf' + (i+1)].setVisible(data[i]);
                if(data[i]){
                    ui.nodes['txt_gh_name' + (i+1)].setString(data[i].ghname);
                    var str = X.STR(L('GONGHUIFIGHT21'),data[i].jifen || 0);
                    var rh = X.setRichText({
                        parent:ui.nodes['panel_jf'+(i+1)],
                        str:str,
                        pos:{x:ui.nodes['panel_jf'+(i+1)].width/2, y:ui.nodes['panel_jf'+(i+1)].height/2},
                        anchor: {x: 0.5, y: 0.5},
                    });
                }
            }
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();