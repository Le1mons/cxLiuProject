/**
 * Created by 嘿哈 on 2020/4/21.
 */
(function () {
//挑战积分
    var ID = 'qqtx_tzjf';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.nodes.text_zdjl.setString(L("WANZGHEZHAOMU20"));
        },
        onShow:function(){
            var me = this;
            new X.bView("event_chuanqitiaozhan_tiaozhanjiangli.json", function (view) {
                me.view = view;
                me.nodes.panel_nr.addChild(view);
                cc.enableScrollBar(me.view.nodes.scrollview);
                cc.enableScrollBar(me.view.nodes.listview);
                me.setContents();
            });
        },
        setContents:function(){
            var me = this;
            var data = me.DATA =[].concat(me.data().prize);

            if (!me.table) {
                me.table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data,pos) {
                    me.setItem(ui, data,pos[0]);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data,index){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            if(index == me.DATA.length-1){
                ui.nodes.shuzhi.setString(L("WANZGHEZHAOMU17"));
            }else{
                ui.nodes.shuzhi.setString(X.STR(L("WANZGHEZHAOMU12"),index > 0 ? me.fmtnum(me.DATA[index - 1].val):0,me.fmtnum(data.val)));
            }
            var addprize = [{a: "item", t: "sjjf", n: data.addjifen}];
            var prize =data.prize.concat(addprize);
            X.alignItems(ui.nodes.panel_tx1,prize,"left",{
                touch:true,
                scale:0.8
            })
        },
        fmtnum:function(data) {
            var str = '';
            data = parseInt(data);
            if(data < 100000) {
                str = data;
            } else if(data < 100000000) {
                str = (data / 10000).toFixed(0) +  L("w");
            } else {
                str = (data / 100000000).toFixed(0) + L("YI");
            }
            return str;
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();