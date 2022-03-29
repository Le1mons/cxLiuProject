(function () {
    var ID = 'slzt_rank';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
            me.getData(function () {
                me.setContents()
            })
        },
        setContents: function () {
            var me = this;
            me.setMyrank();
            me.setRanklist();
        },
        setRanklist: function () {
            var me = this;
            if (me.DATA.ranklist.length < 1) {
                
                me.nodes.img_zwnr.show();
                return
            };
            cc.enableScrollBar(me.nodes.scrollview, false);
            me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_lb, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]);
            });
            me.table.setData(me.DATA.ranklist);
            me.table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            ui.setTouchEnabled(false);
            X.render({
                panel_pm: function (node) {
                    if (data.rank < 4) {
                        node.show();
                        node.setBackGroundImage("img/public/img_paihangbang_" + data.rank + ".png", 1);
                    } else {
                        node.hide()
                    }

                },
                panel_tx: function (node) {
                    node.removeAllChildren();
                    var wid = G.class.shead(data.headdata);
                    wid.setPosition(cc.p(node.width / 2, node.height / 2));
                    node.addChild(wid);
                    node.setTouchEnabled(true);
                    node.setSwallowTouches(false);
                    node.data = data.headdata.uid;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.wanjiaxinxi.data({
                                pvType: 'zypkjjc' ,
                                uid: sender.data,
                                isHideTwo: G.time >= X.getLastMondayZeroTime() + 6 * 24 * 3600 + 21 * 3600 + 1800
                            }).checkShow();
                        }
                    });
                },
                text_mz: data.headdata.name,
                text_ghmz:data.headdata.guildname || L('slzt_tip3'),
                text_jf: data.val,
                sz_phb: function (node) {
                    node.setVisible(data.rank >= 4);
                    node.setString(data.rank);   
                },
            }, ui.nodes)
        },
        setMyrank: function () {
            var me = this;
            me.nodes.txt_wdpm.setString(X.STR(L("slzt_tip1"), me.DATA.myrank > -1 ? me.DATA.myrank : L('WSB')))
            me.nodes.txt_tgcs.setString(X.STR(L("slzt_tip2"), me.DATA.myval));
        },
        getData: function (callback) {
            var me = this;

            me.ajax('rank_open', [32], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });

        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk6.json', ID);
})();