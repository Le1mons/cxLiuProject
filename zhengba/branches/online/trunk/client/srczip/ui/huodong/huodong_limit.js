/**
 * Created by wfq on 2018/7/8.
 */
(function () {
    //等级礼包 || 养成礼包
    G.class.huodong_limit = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('event_limit.json');
        },
        refreshPanel:function () {
            var me = this;
            me.getData(function(){
                me.setContents();
            })
        },
        onOpen: function () {
            var me = this;
            me.initUi();
        },
        initUi:function(){
            var me = this;
            me.nodes.panel_bg.setBackGroundImage('img/bg/bg_gift3.png',0);
            me.nodes.wz_title.setBackGroundImage('img/event/wz_event_title2.png',1);
            me.nodes.img_card.removeAllChildren();
            G.class.ani.show({
                addTo: me.nodes.img_card,
                json: 'ani_huodong_yueka',
                repeat: true,
                autoRemove: false,
                onload: function (node) {
                    node.nodes.kapai.setBackGroundImage("img/event/img_event_card3.png", 1);
                    // node.setTag(12345);
                }
            });
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;
            G.frame.huodong.getData(me._type.hdid,function(d){
                me.DATA = d;
                callback && callback();
            })
        },
        setContents: function () {
            var me = this;
            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_time.setString(X.moment(me.DATA.info.etime - G.time, {
                    d: "{1}天"
                }));
            }else {
                X.timeout(me.nodes.txt_time, me.DATA.info.etime,function () {
                    G.ajax.send("item_remove", [conf.itemid], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            X.uiMana.closeAllFrame();
                        }
                    })
                },null,null);
            }
            var text = new ccui.Text(X.STR(L("YYSL"), G.class.getOwnNum(2016, "item")), G.defaultFNT, 18);
            X.enableOutline(text, "#000000", 1);
            text.setAnchorPoint(0.5, 0.5);
            text.setPosition(me.nodes.txt_info1.width / 2, me.nodes.txt_info1.height / 2);
            me.nodes.txt_info1.addChild(text);
        }
    });

})();