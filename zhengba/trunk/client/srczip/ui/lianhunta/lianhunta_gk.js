/**
 * Created by
 */
(function () {
    //
    var ID = 'lianhunta_gk';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });

            me.nodes.btn_zjyx.click(function () {
                G.frame.lianhunta_help.show();
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L("TS89")
                }).show();
            });

            me.tNodes = [];
            cc.each(me.CONF.layerinfo, function (val, index) {
                var idx = index + 1;
                var node = me.nodes['panel_gk' + idx];
                var conf = G.gc.lht[val];
                node.id = val;
                node.idx = idx;
                node.index = index;
                node.conf = conf;
                X.autoInitUI(node);
                node.nodes['txt_sw' + idx].setString(conf.name);
                node.setTouchEnabled(true);
                node.click(function (sender) {
                    if (!sender.isOpen) {
                        return G.tip_NB.show(node.nodes['txt_tj' + idx].getString());
                    }
                    G.frame.lianhunta_tz.data({
                        data: me.DATA[val],
                        id: val,
                        conf: conf
                    }).show();
                });
                me.tNodes.push(node);
            });
        },
        onOpen: function () {
            var me = this;

            me.id = me.data().id;
            me.CONF = G.gc.lhtcom.guanka[me.id];
            me.bindBtn();
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax('lianhunta_guankainfo', [me._extData.id], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        onShow: function () {
            var me = this;

            me.nodes.txt_ta.setString(me.CONF.name);
            me.refreshBtn();
        },
        refreshBtn: function () {
            var me = this;

            cc.each(me.tNodes, function (node) {
                var lastId = me.CONF.layerinfo[node.index - 1];
                var isOpen = node.isOpen = !lastId || (G.frame.lianhunta.DATA.layerstar[lastId] && G.frame.lianhunta.DATA.layerstar[lastId].length > 0);
                node.nodes['panel_xx' + node.idx].setVisible(isOpen);
                node.nodes['panel_tj' + node.idx].setVisible(!isOpen);
                if (isOpen) {
                    var starNodeArr = [];
                    for (var id = 1; id < 4; id ++) {
                        var imgPath = 'img_xx2';
                        if (G.frame.lianhunta.DATA.layerstar[node.id] && X.inArray(G.frame.lianhunta.DATA.layerstar[node.id], id)) {
                            imgPath = 'img_xx';
                        }
                        var img = new ccui.ImageView('img/lianhunta/' + imgPath + '.png', 1);
                        img.setAnchorPoint(0.5, 0.5);
                        starNodeArr.push(img);
                    }
                    X.center(starNodeArr, node.nodes['panel_xx' + node.idx]);
                } else {
                    node.nodes['txt_tj' + node.idx].setString(L('lht_layerNeed') + G.gc.lht[lastId].name);
                }
            });
        },
        getCondShow: function (conf) {
            conf = conf || {};
            var str = G.gc.lhtcom.condintr[conf.key] || '';
            var args = [];
            var cond = conf.cond || [];
            switch (conf.key) {
                case 'zhongzu':
                    args.push(conf.num || 0);
                    cc.each(cond, function (zhongzu) {
                        args.push(L("zhongzu_" + zhongzu));
                    });
                    break;
                case "zhongzu3":
                    cc.each(cond, function (zhongzu) {
                        args.push(L("zhongzu_" + zhongzu));
                    });
                    break;
                case "turn":
                    args.push(conf.num || 0);
                    break;
                case "job":
                    args.push(conf.num || 0);
                    cc.each(cond, function (job) {
                        args.push(L("JOB_" + job));
                    });
                    break;
                case "nojob":
                    cc.each(cond, function (job) {
                        args.push(L("JOB_" + job));
                    });
                    break;
                case "dead":
                    args.push(conf.num || 0);
                    break;
            }
            return X.STR(str, args);
        }
    });
    G.frame[ID] = new fun('lianhunta_gk.json', ID);
})();