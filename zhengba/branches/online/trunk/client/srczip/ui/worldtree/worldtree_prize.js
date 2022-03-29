/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //世界树-奖励预览
    var ID = 'worldtree_prize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.setTouchEnabled(true);
            me.ui.click(function (sender) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.curId = me.data();
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.ui.finds("pan1").hide();
            cc.enableScrollBar(me.ui.finds("listview"));
            me.ui.finds("listview").setItemsMargin(10);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        formatData: function(data, star, idx) {
            var obj = {
                arr: [],
                str: ""
            };
            var all = 0;
            var lack = 0;

            for(var i in data) {
                var conf = G.class.getItem(data[i].t);
                if(conf.star == star){
                    obj.arr.push(data[i])
                }
            }
            for (var i in obj.arr) {
                var conf = G.class.getItem(obj.arr[i].t);
                if(conf.hcnum > obj.arr[i].n) lack += obj.arr[i].p;
                else all += obj.arr[i].p
            }

            obj.str = G.class.worldtree.get().base.worldtree[idx][star == 4 ? "four" : "five"];

            return obj;
        },
        setContents: function () {
            var me = this;
            var arr = [];
            var id = G.class.worldtree.get().base.calldlz[me.curId];
            var prize = G.class.diaoluo.getById(id);

            arr.push(me.formatData(prize, 5, me.curId));
            arr.push(me.formatData(prize, 4, me.curId));


            for(var i = 0; i < arr.length; i ++) {
                me.setItem(arr[i]);
            }
        },
        setItem: function (data) {
            var me= this;
            var txt = me.nodes.wz_miaoshu.clone();
            txt.setString(data.str);
            me.ui.finds("listview").pushBackCustomItem(txt);
            var arr = [];
            var all = [];
            for (var i = 0; i < data.arr.length; i ++) {
                arr.push(data.arr[i]);
                if((i + 1) % 4 == 0) {
                    all.push(arr);
                    arr = [];
                }
            }
            if(arr.length > 0) all.push(arr);

            for (var i = 0; i < all.length; i ++) {
                var layout = me.ui.finds("pan1").clone();
                layout.show();
                for (var j = 0; j < all[i].length; j ++) {
                    var ico = layout.finds("ico" + (j + 1));
                    var item = G.class.sitem(all[i][j]);
                    item.setPosition(ico.width / 2, ico.height / 2);
                    G.frame.iteminfo.showItemInfo(item);
                    ico.addChild(item);
                }
                me.ui.finds("listview").pushBackCustomItem(layout);
            }
        }
    });
    G.frame[ID] = new fun('shijieshu_jlyl.json', ID);
})();