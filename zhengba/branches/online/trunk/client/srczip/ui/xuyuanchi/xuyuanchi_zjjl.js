/**
 * Created by LYF on 2018/6/11.
 */
(function () {
    //许愿池-中奖纪录
    var ID = 'xuyuanchi_zjjl';

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

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            })
        },
        onHide: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("xuyuanchi_jilu", [G.frame.xuyuanchi.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d[G.frame.xuyuanchi.type];
                    callback && callback();
                }
            })
        },
        setContents: function () {
            var me = this;
            me.nodes.listview_zjjl.removeAllChildren();
            if(me.DATA.length < 1) {
                me.ui.finds("img_zw").show();
            }
            for(var i = 0; i < me.DATA.length; i ++){
                var list = me.nodes.list_zjjl.clone();
                X.autoInitUI(list);
                var conf = G.class.sitem(me.DATA[i].prize).conf;
                var name = new ccui.Text(me.DATA[i].username, "fzcyj", 20);
                var hd = new ccui.Text("获得", "fzcyj", 20);
                var item = new ccui.Text(conf.name, "fzcyj", 20);
                var num = new ccui.Text("x" + me.DATA[i].prize.n, "fzcyj", 20);
                name.setFontName(G.defaultFNT);
                hd.setFontName(G.defaultFNT);
                item.setFontName(G.defaultFNT);
                num.setFontName(G.defaultFNT);
                name.setTextColor(cc.color("#ffffff"));
                hd.setTextColor(cc.color("#edbb82"));
                item.setTextColor(cc.color(G.gc.COLOR[conf.color || conf.star - 1]));
                num.setTextColor(cc.color("#25891c"));
                X.enableOutline(name, "#2a1c0f", 2);
                list.nodes.txt_zjjl.addChild(name);
                list.nodes.txt_zjjl.addChild(hd);
                list.nodes.txt_zjjl.addChild(item);
                list.nodes.txt_zjjl.addChild(num);
                name.setAnchorPoint(0, 0.5);
                hd.setAnchorPoint(0, 0.5);
                item.setAnchorPoint(0, 0.5);
                num.setAnchorPoint(0, 0.5);
                name.setPosition(5, list.height / 2);
                hd.setPosition(135, list.height / 2);
                item.setPosition(191, list.height / 2);
                num.setPosition(370, list.height / 2);
                list.show();
                me.nodes.listview_zjjl.pushBackCustomItem(list)
            }
        },
    });
    G.frame[ID] = new fun('xuyuanchi_top_zjjl.json', ID);
})();