/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    // 奖池预览

    var ID = 'gettouzi';

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
            me.nodes.mask.click(function () {
                me.remove();
            })
        },

        onOpen: function () {
            var me = this;
            me.bindBtn();
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
            me.DATA = me.data();
            me.setContents();
        },
        setContents:function () {
            var me = this ;
            var conf = G.frame.zhounianqing_main.conf.pay;
            var keyArr = X.keysOfObject(conf);
            for(var i = 1 ; i < 4 ;i++){
                var obj = {};
                obj.conf =conf[keyArr[i-1]];
                obj.buyNum = me.DATA.payInfo[keyArr[i-1]] || 0;
                obj.proid = keyArr[i-1];
                var node = me.nodes.liebiao_list.clone();
                var parNode = me.nodes["liebiao"+i];
                parNode.removeAllChildren();
                parNode.addChild(node);
                node.setPosition(0,0);
                me.setItem(node,obj);
            };
        },
        setItem:function (ui,data) {
            var me = this ;
            X.autoInitUI(ui);
            ui.show();
            ui.data = data;
            for(var i = 0 ; i < data.conf.prize.length ;i++){
                var item = G.class.sitem(data.conf.prize[i]);
                item.setPosition(ui.nodes["ico"+(i+1)].width / 2,ui.nodes["ico"+(i+1)].height / 2);
                ui.nodes["ico"+(i+1)].removeAllChildren();
                ui.nodes["ico"+(i+1)].addChild(item);
                // ui.setTouchEnabled(false);
                item.setTouchEnabled(true);
                G.frame.iteminfo.showItemInfo(item);
            };
            var canBuy  = data.conf.num - data.buyNum;
            ui.nodes.wz_sysl.setString(X.STR(L("BUYTOUZI"),canBuy));
            ui.nodes.btn_goumai.setBright(canBuy);
            ui.nodes.btn_goumai.setTouchEnabled(canBuy);
            ui.nodes.wz_1.setString(data.conf.unitprize/100+L("YUAN"));
            if(!canBuy){
                ui.nodes.wz_1.setTextColor(cc.color("#6c6c6c"));
            }
            ui.nodes.btn_goumai.click(function () {
                        G.event.once('paysuccess', function(arg) {
                            try {
                                //G.tip_NB.show(X.createPrizeInfo(data.p,0, 1));
                                arg && arg.success && G.frame.jiangli.data({
                                    prize: data.conf.prize
                                }).show();
                                // me.DATA.payInfo[data.proid]++;
                                G.frame.zhounianqing_main.getData(function () {
                                     me.DATA.payInfo = G.frame.zhounianqing_main.DATA.pay;
                                     me.setContents();
                                });
                               
                            } catch (e) {}
                        });
                        G.event.emit('doSDKPay', {
                            pid: data.proid,
                            logicProid: data.proid,
                            money: data.conf.unitprize,
                            pname: ''
                        });
            })
        },
        getData:function (callback) {
            var me = this ;
            callback && callback();  
        },
        
    });
    G.frame[ID] = new fun('2zhounian_tankuang3.json', ID);
})();


