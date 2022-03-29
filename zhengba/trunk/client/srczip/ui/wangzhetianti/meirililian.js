/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'wztt_mrll';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        setContents: function () {
            var me = this;
            var _conf = G.gc.wztt.prize.receive;

            me.nodes.listview.removeAllChildren();
            for (var index = 0; index < _conf.length; index ++) {
                (function (index, conf) {
                    var list = me.nodes.list_rank.clone();
                    var str = conf[0] ? L("JRTZ") : L("JRLS");
                    var nval = conf[0] ? G.frame.wztt.DATA.fight : G.frame.wztt.DATA.win;
                    var pval = conf[0] || conf[1];
                    var canLq = nval >= pval && !X.inArray(G.frame.wztt.DATA.receive, index);
                    X.autoInitUI(list);
                    X.render({
                        img_wp: function (node) {
                            X.alignItems(node, conf[3] ? [].concat(conf[2], {a: "special", t: "ladderstar", n: conf[3]}) : conf[2], 'left', {
                                touch: true,
                                scale: .7
                            });
                        },
                        txt_wzjl: function (node) {
                            var rh = X.setRichText({
                                str: X.STR(str, pval) + "(" + nval + "/" + pval + ")",
                                parent: node,
                                color: "#804326"
                            });
                            rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                        },
                        txet_gmtp: function (node) {
                            node.setString(X.inArray(G.frame.wztt.DATA.receive, index) ? L("YLQ") : L("LQ"));
                            node.setTextColor(cc.color(G.gc.COLOR[canLq ? 'n13' : 'n15']));
                        },
                        btn_gmtp: function (node) {
                            node.setEnableState(canLq);
                            node.click(function () {
                                me.ajax("ladder_receive", [index], function (str, data) {
                                    if (data.s == 1) {
                                        G.frame.jiangli.data({
                                            prize: conf[3] ? [].concat(data.d.prize, {a: "special", t: "ladderstar", n: conf[3]}) : conf[2]
                                        }).show();
                                        G.frame.wztt.DATA.receive.push(index);
                                        G.frame.wztt.getData(function () {
                                            G.frame.wztt.showDan(true);
                                        });
                                        me.setContents();
                                        G.hongdian.getData("ladder", 1, function () {
                                            G.frame.wztt.checkRedPoint();
                                            G.frame.jingjichang.checkRedPoint();
                                        });
                                    }
                                });
                            });
                        }
                    }, list.nodes);
                    list.show();
                    me.nodes.listview.pushBackCustomItem(list);
                })(index, _conf[index]);
            }
        }
    });
    G.frame[ID] = new fun('wztt_mrll.json', ID);
})();