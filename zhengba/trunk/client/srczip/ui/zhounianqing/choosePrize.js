/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    // 选择奖励

    var ID = 'choosePrize';

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
            });
            me.nodes.btn_zd.click(function () {
                if(me.chooseIdx == -1){
                    return G.tip_NB.show(L("XUANZHEJIANGLI"))
                };
                 G.frame.iteminfo.data(me.chooseNode).show();
            });
            me.nodes.btn_xyg.click(function () {
                if(me.chooseIdx == -1){
                    return G.tip_NB.show(L("XUANZHEJIANGLI"))
                };
                me.data().callback && me.data().callback(me.dayIdx,me.chooseIdx);
                me.remove();
            });

        },

        onOpen: function () {
            var me = this;
            me.initUi();
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
            me.chooseIdx = -1;
            var conf = G.frame.zhounianqing_main.conf.sign;
            me.dayIdx = conf.length -1;
            me.prizeArr = conf[me.dayIdx].choose;
            me.refreshPanel();
        },
        getData:function (callback) {
            var me = this ;
            callback && callback();  
        },
        refreshPanel: function () {
            var me = this;
            me.prizeArr.forEach(function (item,idx) {
                item.idx = idx;
            });
            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_ico2, 6, function (ui, data) {
                    me.setItem(ui, data);
            }, null, null, 10, 10);
            me.table.setData(me.prizeArr);
            me.table.reloadDataWithScroll(true);
            
        },
        setItem:function (ui,data) {
            var me = this ;
            var item = G.class.sitem(data);
            item.setPosition(ui.width / 2,ui.height / 2);
            ui.removeAllChildren();
            ui.addChild(item);
            ui.setTouchEnabled(false);
            item.setTouchEnabled(true);
            item._data = data;
            if(data.idx ==Number(me.data().choosePrizeIdx)){
                item.setGou(true);
                me.chooseNode = item;
                me.chooseIdx = data.idx;
            };
            item.click(function (sender) {
                me.chooseNode && me.chooseNode.setGou(false);
                sender.setGou(true);
                me.chooseNode = sender;
                me.chooseIdx = sender.data.idx;
            })  
        },
    });
    G.frame[ID] = new fun('2zhounian_tankuang1.json', ID);
})();


