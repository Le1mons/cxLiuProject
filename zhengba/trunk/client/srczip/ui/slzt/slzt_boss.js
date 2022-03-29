(function () {
    var ID = 'slzt_boss';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.setContents()
        },
        setContents: function () {
            var me = this;
            if (me.data().type == 1) {

                me.nodes.tip_title.setString(X.STR(L('slzt_tip6'), G.slzt.mydata.layer));
                var conf = G.class.slzt.getById(G.slzt.mydata.layer);
                var defArr = G.gc.npc[conf.boss];
                X.centerLayout(me.nodes.panel_tx, {
                    dataCount: defArr.length,
                    extend: false,
                    delay: false,
                    cellCount: 5,
                    nodeWidth: 75,
                    rowHeight: 50,
                    offY: 10,
                    // interval:10,
                    itemAtIndex: function (index) {
                        var p = defArr[index];

                        var widget = G.class.shero(p);
                        widget.setScale(0.8)
                        return widget;
                    }
                });
                X.alignItems(me.nodes.panel_wpsl, conf.prize, "center", {
                    touch: true
                });
            } else {
                me.nodes.tip_title.setString(L('slzt_tip22'));
                var conf = G.class.slzt.getById(G.slzt.mydata.layer);
                var defArr = G.slzt.mydata.mirror.herolist;
                var arr = [];
                defArr.forEach(function name(item,idx) {
                      if(item.hid){
                        arr.push(item) 
                      }
                })
                X.centerLayout(me.nodes.panel_tx, {
                    dataCount: arr.length,
                    extend: false,
                    delay: false,
                    cellCount: 5,
                    nodeWidth: 75,
                    rowHeight: 50,
                    offY: 10,
                    // interval:10,
                    itemAtIndex: function (index) {
                        var p = arr[index];

                        var widget = G.class.shero(p);
                        widget.setScale(0.8)
                        return widget;
                    }
                });
                X.alignItems(me.nodes.panel_wpsl, conf.prize, "center", {
                    touch: true
                });
            }
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
            me.nodes.btn_qw.click(function (sender) {
                if(me.data().type == 1){

                    G.frame.slzt.fightBoss();
                }else{

                    G.frame.slzt.fightJingxiang();
                }
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk1.json', ID);
})();