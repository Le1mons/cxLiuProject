/**
 * Created by LYF on 2018/9/25.
 */
(function () {
    //月基金-奖励预览
    var ID = 'yjj_jlyl';

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
            me.ui.finds("listview").setItemsMargin(3);
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
        setContents: function () {
            var me = this;

            me.setItem(me.data().data)
        },
        setItem: function (data) {
            var me= this;
            var arr = [];
            var all = [];
            for (var i = 0; i < data.length; i ++) {
                arr.push(data[i]);
                if((i + 1) % 4 == 0) {
                    all.push(arr);
                    arr = [];
                }
            }
            if(arr.length > 0) all.push(arr);

            for (var i = 0; i < all.length; i ++) {
                var layout = new ccui.Layout;
                var itemArr = [];
                layout.setContentSize(cc.size(me.ui.finds("listview").width, 140));
                for (var j = 0; j < all[i].length; j ++) {
                    var item = G.class.sitem(all[i][j].p[0]);
                    if(X.inArray(me.data().texiao, all[i][j].val - 1)) {
                        G.class.ani.show({
                            json: "ani_viptouxiang",
                            addTo: item,
                            x: item.width / 2,
                            y: item.height / 2,
                            repeat: true,
                            autoRemove: false
                        })
                    }
                    var list = me.data().list.clone();
                    item.setPosition(list.finds("ico").width / 2, list.finds("ico").height / 2);
                    G.frame.iteminfo.showItemInfo(item);
                    list.finds("ico").addChild(item);

                    var str = X.STR(L("LJJT"), all[i][j].val);
                    var rh = new X.bRichText({
                        size: 18,
                        maxWidth: list.finds("wz").width,
                        lineHeight: 32,
                        color: "#b55222",
                        family: G.defaultFNT,
                    });
                    rh.text(str);
                    rh.setAnchorPoint(0.5, 0.5);
                    rh.setPosition(list.finds("wz").width / 2, list.finds("wz").height / 2);
                    list.finds("wz").addChild(rh);
                    list.setAnchorPoint(0.5, 0.5);
                    list.show();

                    itemArr.push(list);
                }
                if(itemArr.length < 4) {
                    var inter = (layout.width - 4 * itemArr[0].width) / 4;
                    for (var n = 0; n < itemArr.length; n ++) {
                        itemArr[n].setScale(.9);
                        itemArr[n].setPosition(itemArr[n].width / 2 + 3.2 + n * itemArr[n].width + n * inter, layout.height / 2);
                        layout.addChild(itemArr[n]);
                    }
                }else {
                    X.center(itemArr, layout, {
                        scale: .9
                    });
                }
                me.ui.finds("listview").pushBackCustomItem(layout);
            }
            var kong = new ccui.Layout;
            kong.setContentSize(me.ui.finds("pan1").width, 20);
            me.ui.finds("listview").pushBackCustomItem(kong);
        }
    });
    G.frame[ID] = new fun('shijieshu_jlyl.json', ID);
})();