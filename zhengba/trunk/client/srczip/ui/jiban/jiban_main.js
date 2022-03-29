/**
 * Created by wlx on 2019/12/15.
 */
(function () {
    //羁绊列表
    var ID = 'jiban_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = G.gc.jiban;
            cc.enableScrollBar(me.nodes.scrollview);
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS54')
                }).show();
            });
            me.nodes.btn_pqwy.click(function () {
                G.frame.jiban_help.show();
            });
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = X.keysOfObject(me.DATA);

            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    ui.setSwallowTouches(false);
                    me.setItem(ui, data);
                }, null,null,8,10);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setSwallowTouches(false);
            ui.nodes.btn_list.loadTextureNormal("img/jiban/img_jiban_kp" + me.DATA[data].img + ".png",0);
            ui.nodes.btn_list.setTouchEnabled(true);
            ui.nodes.btn_list.setSwallowTouches(false);
            ui.nodes.btn_list.data = me.DATA[data];
            ui.nodes.btn_list.id = data;
            ui.data = data;
            ui.nodes.btn_list.setZoomScale(0.01);
            ui.nodes.btn_list.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    G.frame.jiban_info.data(sender.id).show();
                }
            });
            if(G.DATA.hongdian.jiban && G.DATA.hongdian.jiban.hd == 1 && G.DATA.hongdian.jiban[data] && G.DATA.hongdian.jiban[data].length > 0){//有红点
                G.setNewIcoImg(ui.nodes.btn_list);
                ui.nodes.btn_list.finds('redPoint').setPosition(cc.p(580,220));
            }else {
                G.removeNewIco(ui.nodes.btn_list);
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('jiban_fy.json', ID);
})();