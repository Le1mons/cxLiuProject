/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    // 奖池预览

    var ID = 'jiangchiyulan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview2);
            me.nodes.mask.click(function () {
                me.remove(); 
            });
            me.nodes.btn_xyg.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        G.ajax.send("anniversary_change",[],function(str,data){
                            if(data.s == 1){
                                G.tip_NB.show(L("JIANGCHIcz"))
                                me.remove(); 
                            }
                        })
                    },
                    richText: L("JIANGCHIXY"),
                }).show();
                
            })
        },

        onOpen: function () {
            var me = this;
            
        },
        onAniShow: function () {
            var me = this;
        },
     
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.nodes.panel_dr.setTouchEnabled(false);
            me.bindBtn();
            me.DATA = me.data();
            me.jumpid  =me.DATA.idx;
            me.refreshPanel();
        },
        refreshPanel: function(){
            var me = this;
            me.createMenu();
        },
        createMenu: function () {
            var me = this;
            var shopList = G.frame.zhounianqing_main.conf.prizepool;
            var list = [];
            me.nodes.listview2.removeAllChildren();
            // me.nodes.listview2.setDirection(0);
            cc.enableScrollBar(me.nodes.listview2,false);
            me.btn_arr = [];
            for(var i = 0; i < shopList.length; i++){
                var btn = me.nodes.biaoqian.clone();
                me.setDownItem(btn,i);
                me.btn_arr.push(btn);
                me.nodes.listview2.pushBackCustomItem(btn);
            };
            if(me.btn_arr) me.btn_arr[me.jumpid].triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.nodes.listview2.jumpToPercentHorizontal(parseInt(me.jumpid/(shopList.length-1)*100));
        },
          setDownItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;

            ui.nodes.wz1.setString(X.STR(L("JIANGCHI"),parseInt(data)+1));
            ui.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(me.curType == sender.data)return;
                    for(var j = 0; j < me.btn_arr.length; j++){
                        var button = me.btn_arr[j];
                        if (sender.data== button.data) {
                            sender.setBright(false);
                            button.nodes.wz1.setTextColor(cc.color("#ffe6d0"));
                            X.enableOutline(button.nodes.wz1,"#34221d");
                            me.curType = sender.data;
                            me.setContents(true);
                        } else {
                            button.setBright(true);
                            button.nodes.wz1.setTextColor(cc.color("#af9e89"));
                            X.enableOutline(button.nodes.wz1,"#34221d");
                        }
                    }
                }
            })
        },
        setContents:function(){
            var me = this;
            var conf = G.frame.zhounianqing_main.conf.prizepool[ me.curType];
            var hasBuyConf = me.DATA.data[me.curType];
            prizeArr = [];
            var btnBool = false;
            var maxPool = G.frame.zhounianqing_main.conf.prizepool.length-1;
            for(var i = 0 ;i < conf.length;i++){
                var obj = {};
                obj.buyNum = hasBuyConf ? (hasBuyConf[i] ? hasBuyConf[i]:0)  : 0;
                obj.conf = conf[i];
                prizeArr.push(obj);
                if(conf[i].core == 1 && obj.buyNum  >= conf[i].num && me.curType == me.DATA.pool && maxPool != me.curType){
                    btnBool = true;
                }
            };
            me.nodes.scrollview.removeAllChildren();
            cc.enableScrollBar(me.nodes.scrollview,false);
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_ico2, 5, function (ui, data, pos) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(prizeArr);
            table.reloadDataWithScroll(true);
            me.nodes.btn_xyg.setVisible(btnBool);
        },
        setItem:function (ui,data) {
            var me = this ;
            X.autoInitUI(ui);
            X.render({  
                ico_ylq:function (node) {
                    node.setVisible(data.conf.num <= data.buyNum);
                },
                ico_sl:function (node) {
                    node.setString("");
                    node.setString((data.conf.num - data.buyNum) + "/" + data.conf.num);
                },
                img_hexin:function (node) {
                    node.setVisible(data.conf.core);
                },
                ico_list:function (node) {
                    var item = G.class.sitem(data.conf.prize[0]);
                    item.setPosition(node.width / 2,node.height / 2);
                    G.frame.iteminfo.showItemInfo(item);
                    node.removeAllChildren();
                    node.addChild(item);   
                },
            },ui.nodes)
        },
        getData:function (callback) {
            var me = this ;
            callback && callback();  
        },
        
    });
    G.frame[ID] = new fun('2zhounian_tankuang2.json', ID);
})();


