(function () {
    //神宠水晶-进阶详情
    var ID = 'scsj_jinjie';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn:function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents:function () {
            var me = this;
            me.conf = G.gc.petcom.base.crystalrank;
            var datalist = X.keysOfObject(me.conf);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.removeAllChildren();
            if(!me.table){
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 0,0);
                table.setData(datalist);
                table.reloadDataWithScroll(true);
                me.table._table.scrollToCell(me.DATA);
            }else {
                me.table.setData(datalist);
                me.table.reloadDataWithScroll(false);
            }

        },
        setItem:function (ui,data) {
            var me = this;
                X.autoInitUI(ui);
                ui.setName("list" + data);
                ui.nodes.txt_name.setString(X.STR(L("pettip7"),data));//名字
                ui.nodes.txt_gj.setString(me.conf[data].intro);
                ui.nodes.txt_jl.setString(me.conf[data].buff.speed);//速度

                //当前的等阶
                if(me.DATA == parseInt(data)){
                    ui.nodes.img_bq.show();
                    ui.nodes.img_dqzt.show();
                    ui.nodes.txt_name.setTextColor(cc.color("#15bc20"));
                    ui.nodes.txt_gj.setTextColor(cc.color("#15bc20"));
                    ui.nodes.txt_jl.setTextColor(cc.color("#15bc20"));
                    ui.nodes.img_jy.setBackGroundImage('img/public/ico/ico_sd.png',1);

                }else if(me.DATA > parseInt(data)){
                    ui.nodes.img_bq.hide();
                    ui.nodes.img_dqzt.hide();
                    ui.nodes.txt_name.setTextColor(cc.color("#e7c05b"));
                    ui.nodes.txt_gj.setTextColor(cc.color("#f6ebcd"));
                    ui.nodes.txt_jl.setTextColor(cc.color("#f6ebcd"));
                    ui.nodes.img_jy.setBackGroundImage('img/public/ico/ico_sd.png',1);
                }else {
                    ui.nodes.img_bq.hide();
                    ui.nodes.img_dqzt.hide();
                    ui.nodes.txt_name.setTextColor(cc.color("#615547"));
                    ui.nodes.txt_gj.setTextColor(cc.color("#615547"));
                    ui.nodes.txt_jl.setTextColor(cc.color("#615547"));
                    ui.nodes.img_jy.setBackGroundImage('img/public/ico_sd_hui.png',1);
                }
        },
    });
    G.frame[ID] = new fun('scsj_top_jjyl.json', ID);
})();