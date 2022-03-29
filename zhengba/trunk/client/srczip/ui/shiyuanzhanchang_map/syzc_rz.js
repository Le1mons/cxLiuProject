(function () {
    var ID = 'syzc_rz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.getData(function () {
                me.setContents()
            })
        },
        getData: function (callback) {
            var me = this;
            me.ajax("syzc_loglist", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback()
                }
            });
        },
        setContents: function () {
            var me = this;
            if (me.DATA.loglist.length<1){
                me.nodes.img_zwnr1.show();
            } else {
                me.nodes.img_zwnr1.hide();
            }
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 5);
            me.DATA.loglist.sort(function (a,b) {
                return a.ctime > b.ctime?-1:1;
            });
            table.setData(me.DATA.loglist);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                ico_tb: function (node) {
                    if (data.winside == 0) {
                        node.setBackGroundImage("img/shiyuanzhanchang/ico_zs.png", 1);
                    } else {
                        node.setBackGroundImage("img/shiyuanzhanchang/ico_zb.png", 1);
                    }
                },
                txt_ms: function (node) {
                    var str = "";
                    if (data.winside == 0) {
                        str = G.gc.syzccom.log.win;
                        var rh1 = X.setRichText({
                            str: X.STR(str, data.layer, G.gc.syzccom.eventinfo[data.eid].mingzi),
                            parent: node,
                            color: '#804326',
                            size: 20
                        });
                    } else {
                        str = G.gc.syzccom.log.lost;
                        var rh1 = X.setRichText({
                            str: X.STR(str, 1),
                            parent: node,
                            color: '#804326',
                            size: 20
                        });
                    };
                },
                txt_sj: X.timetostr(data.ctime),
                btn_luxiang: function (node) {
                    node.click(function (sender) {
                        me.ajax("syzc_watch", [data.tid], function (str, data) {
                            if (data.s == 1) {
                                G.frame.fight.data({
                                    pvType: 'syzc',
                                    isVideo: true,
                                    fightData: data.d
                                }).once('show', function () {
                                }).demo(data.d[0].fightres);
                            }
                        });
                    })
                },
            }, ui.nodes)
        },
        onShow: function () {
            var me = this;
            me.bindBtn()
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
    G.frame[ID] = new fun('shiyuan_tk11.json', ID);
})();