/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //英雄降临
    G.class.huodong_yxjl = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_yingxiongjianglin.json");
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        getData: function (callback) {
            var me = this;

            G.frame.huodong.getData(me._type.hdid,function(d){
                me.DATA = d;
                callback && callback();
            })
        },
        bindBTN: function() {
            var me = this;

            me.nodes.btn.click(function () {
                G.frame.shop.data({type: "1", name: "yxsd"}).show();
            }, 1000);
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
            me.setBanner();
        },
        setBanner: function () {
            var me = this;

            me.ui.finds("txt_count").setString(L("SHENGYU"));
            if(me._type.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_time.setString(X.moment(me._type.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_time, me._type.etime, function () {
                    X.uiMana.closeAllFrame();
                })
            }

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {
                    hid: me._type.data.hid,
                },
                scale: 1.5
            });
        },
        setContents: function () {
            var me = this;
            var prize = [];

            for(var i = 0; i < me._type.data.arr.length; i ++) {
                prize.push(me._type.data.arr[i].item);
            }

            X.alignItems(me.nodes.ico_item, prize, 0, {
                touch: true,
                callback: function () {
                }
            })
        },
    })
})();