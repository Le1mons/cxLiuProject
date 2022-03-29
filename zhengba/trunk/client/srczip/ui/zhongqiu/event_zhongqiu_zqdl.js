/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 中秋掉落
    var ID = 'event_zhongqiu_zqdl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_cs: function(node){ // 倒计时
                    var rtime = G.DAO.zhongqiu.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    });
                },
                panel_ceby: function(node){ // 嫦娥
                    X.spine.show({
                        json: 'spine/change.json',
                        addTo: node,
                        x:node.width*0.5,
                        y:0,
                        z:-1,
                        autoRemove: false,
                        noRemove:true,
                        onload: function (spNode) {
                            spNode.stopAllAni();
                            spNode.runAni(0, "wait", true);
                        }
                    });
                },
                panel_jl: function(node){ // 掉落
                    var prize = G.class.midautumn.getDrop();
                    node.removeAllChildren();
                    X.newExtendLayout(node, {
                        dataCount:prize.length,
                        extend:true,
                        delay:false,
                        cellCount:4,
                        nodeWidth:100,
                        rowHeight:110,
                        // interval:10,
                        itemAtIndex: function (index) {
                            var p = prize[index];

                            var widget = G.class.sitem(p);
                            widget.setAnchorPoint(0.5,0.5);
                            G.frame.iteminfo.showItemInfo(widget);

                            return widget;
                        }
                    });
                },
            }, me.nodes);
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            me.nodes.btn_zs.click(function(sender,type){
                X.tiaozhuan(1)
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu_zqdl.json', ID);
})();