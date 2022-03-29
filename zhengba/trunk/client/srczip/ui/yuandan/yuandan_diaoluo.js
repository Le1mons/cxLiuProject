/**
 * Created by
 */
(function () {
    //
    var ID = 'yuandan_dl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            me.nodes.btn_zs.click(function(sender,type){
                X.tiaozhuan(1);
            });
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_cs: function(node){ // 倒计时
                    var rtime = G.DAO.yuandan.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    }, null, {
                        showDay: true
                    });
                },
                panel_jl: function(node){ // 掉落
                    var prize = G.class.newyear.getDrop();
                    node.removeAllChildren();
                    // X.centerLayout(node, {
                    //     dataCount:prize.length,
                    //     extend:true,
                    //     delay:false,
                    //     cellCount:1,
                    //     nodeWidth:100,
                    //     rowHeight:110,
                    //     // interval:10,
                    //     itemAtIndex: function (index) {
                    //         var p = prize[index];
                    //
                    //         var widget = G.class.sitem(p);
                    //         widget.setAnchorPoint(0.5,0.5);
                    //         G.frame.iteminfo.showItemInfo(widget);
                    //
                    //         return widget;
                    //     }
                    // });
                    var widget = G.class.sitem(prize[0]);
                    widget.setPosition(node.width / 2, node.height / 2);
                    node.addChild(widget);
                    G.frame.iteminfo.showItemInfo(widget);
                    node.setTouchEnabled(false);
                },
            }, me.nodes);
        },
    });
    G.frame[ID] = new fun('event_yuandan_zqdl.json', ID);
})();