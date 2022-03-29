/**
 * Created by  on 2019//.
 */
 (function () {
    //我的抽奖
    var ID = 'jinqiu_kj';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.DATA.jinqiu ;
            me.setContents();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.ui.finds('mask').click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;

        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            me.nodes.txt_djs1.x=260
            me.nodes.txt_djs1.setString(L("JQHD_16"));
            var data = X.keysOfObject(G.gc.midautumn2.lotteryprize);
            //me.nodes.img_zwnr.setVisible(myReward.length == 0);
            me.nodes.txt_wjmz.width = 500;
            me.nodes.list.setTouchEnabled(false);
            me.nodes.list.hide();
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            var conf = G.gc.midautumn2.lotteryprize[data];
            var prize = conf.prize[0][0];
            var item = G.class.sitem(prize,false);
            X.render({
                panel_ico: function (node) {
                    item.setPosition(ui.nodes.panel_ico.width / 2, ui.nodes.panel_ico.height / 2);
                    item.setScale(0.8);
                    node.addChild(item);
                },
                txt_jlmc: function (node) {
                    node.setString( X.STR(L('JQHD_15'),item.conf.name) );
                },
                panel_wjmz: function (node) {
                    node.setTouchEnabled(false);
                },
                txt_fs: function (node) {
                    node.setString(X.STR(L('JQHD_13'),me.DATA.lotterylog[data].length));                     
                },
                scrollview2: function (node) {
                    var name = me.DATA.lotterylog[data];
                    if(!name || name.length <= 0){
                        name = [0]
                    }
                    node.removeAllChildren();
                    var table = me['table2_' + data] = new X.TableView(node, me.nodes.txt_wjmz, 1, function (ui, data) {
                        me.setName(ui, data);
                    }, null, null, 1, 3);
                    me['table2_' + data].setData(name);
                    me['table2_' + data].reloadDataWithScroll(true);
                },
            },ui.nodes)
          
        },
        setName: function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.removeAllChildren();
            if(data == 0){
                return ;
            }
            var color = data.uid == P.gud.uid ? '#629e00' : '#ebc899';
            var prize = G.class.sitem(data.prize[0],false);
            var str = X.STR(L('JQHD_14'),prize.conf.name,data.prize[0].n);
            var rh = X.setRichText({
                parent:ui,
                str:str,
                color:"#ebc899",
                size:20,
                noRemove:true,
            });
            rh.x=0;
            var str1 = X.STR(L('JQHD_18'),data.name,data.svrname);
            var rh1 = X.setRichText({
                parent:ui,
                str:str1,
                color:color,
                size:20,
                noRemove:true,
            });
            rh1.x=240;
        },
    });
    G.frame[ID] = new fun('event_qiurijiangchi_qrjc.json', ID);
})();