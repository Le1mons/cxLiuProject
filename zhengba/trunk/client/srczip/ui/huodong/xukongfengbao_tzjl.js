/**
 * Created by LYF on 2019/9/24.
 */
(function () {
    //虚空魔王-挑战奖励
    var ID = 'xukongfengbao_tzjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
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
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.from = me.data();
            me.win = me.from.DATA.myinfo.boss || 0;
            if (me.from.DATA.myinfo.over) me.win ++;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var bossConf = G.gc.xkfb.challengesort;

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 10);
                me.table.setData(bossConf);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(bossConf);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;
            var bossData = G.gc.xkfb.mowang[data];
            var index = data * 1 - 1;
            var prize = G.gc.xkfb.prize[index];
            var isLq = X.inArray(me.from.DATA.myinfo.reclist, index);
            var canLq = !isLq && me.win > index;
            X.autoInitUI(ui);
            X.render({
                panel_wz: function (node) {
                    var rh = X.setRichText({
                        parent: node,
                        str: X.STR(L("DXMW"), X.num2Cn(data * 1)) + "  <font color=#804326>" + bossData.headdata.name + "</font>",
                        color: "#be5e30"
                    });
                    rh.setPosition(0, node.height / 2 - rh.trueHeight() / 2);
                    node.setTouchEnabled(false);
                },
                panel_item: function (node) {
                    X.alignItems(node, prize.win, "left", {
                        touch: true
                    });
                },
                txt_cis1: function (node) {
                    node.setString(isLq ? L("YLQ") : L("LQ"));
                    node.setTextColor(cc.color(canLq ? "#2f5719" : "#6c6c6c"));
                },
                but_jc1: function (node) {
                    node.setEnableState(canLq);
                    node.click(function () {
                        me.ajax("huodong_use", [me.from._data.hdid, 0, index], function (str, data) {
                            if (data.s == 1) {
                                G.frame.jiangli.data({
                                    prize: prize.win
                                }).show();
                                me.from.DATA.myinfo.reclist = me.from.DATA.myinfo.reclist || [];
                                me.from.DATA.myinfo.reclist.push(index);
                                me.setContents();
                                me.from.checkRedPoint();
                                if(G.frame.huodong.isShow){
                                    G.hongdian.getData("huodong", 1, function () {
                                        G.frame.huodong.checkRedPoint();
                                    });
                                }else {
                                    G.hongdian.getData("qingdian", 1, function () {
                                        G.frame.zhounianqing_main.checkRedPoint();
                                    });
                                }
                            }
                        });
                    });
                }
            }, ui.nodes);
        }
    });
    G.frame[ID] = new fun('xukomowang_jl.json', ID);
})();