(function () {
    var ID = 'slzt_hw';
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
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.nodes.tip_title.setString(X.STR(L('slzt_tip6'), G.slzt.mydata.layer));
            var conf = G.class.slzt.getById(G.slzt.mydata.layer);
            var defArr = G.gc.npc[conf.defboss];
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
            X.alignItems(me.nodes.panel_wpsl, conf.defprize, "center", {
                touch: true
            });
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
                me.remove();
            })
            me.nodes.btn_qw.click(function (sender) {
                G.frame.yingxiong_fight.data({
                    pvType: 'slzt' +(me.data().idx+3),
                    norepeat: G.frame.slzt.getUsed(),
                    title: L('slzt_tip7'),
                    callback: function (cache) {
                        // cc.log(cache.getSelectedData())
                        selectedData = cache.getSelectedData();
                        G.ajax.send('shilianzt_event', [me.data().idx, selectedData], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.slzt.DATA.mydata = d.d.mydata; 
                                X.cacheByUid('slzt' + (me.data().idx + 3), selectedData);
                                d.d.fightres.fightkey = d.d.fightkey;
                                // G.frame.friend.fightName = me.DATA.headdata.name;
                                G.frame.fight.data({
                                    pvType: 'slzt',
                                    prize: d.d.prize
                                }).once('show', function () {
                                    G.frame.yingxiong_fight.remove();
                                    me.remove()
                                }).demo(d.d.fightres);
                            }
                        }, true);
                    },
                }).show();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk1.json', ID);
})();