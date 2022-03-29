/**
 * Created by
 */
(function () {
    //
    var ID = 'zslb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_sj.setString(X.moment(me.DATA.info.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_sj, me.DATA.info.etime, function () {
                    me.eventEnd = true;
                });
            }


            cc.each(me.DATA.info.data, function (event, index) {
                var btn = me.nodes.btn_lb.clone();
                btn.show();
                btn.index = index;
                btn.data = event;
                me.nodes.listview.pushBackCustomItem(btn);
            });
            X.radio(me.nodes.listview.children, function (sender) {
                me.index = sender.index;
                me.setView();
            }, {
                callback1: function (sender) {
                    var txt = new ccui.Text(sender.data.name || sender.data.proid, G.defaultFNT, 22);
                    txt.setTextColor(cc.color('#ffffff'));
                    txt.setAnchorPoint(0.5, 0.5);
                    X.enableOutline(txt, '#b25800', 2);
                    txt.setPosition(sender.children[0].width / 2, sender.children[0].height / 2);
                    sender.children[0].removeAllChildren();
                    sender.children[0].addChild(txt);
                },
                callback2: function (sender) {
                    var txt = new ccui.Text(sender.data.name || sender.data.proid, G.defaultFNT, 22);
                    txt.setTextColor(cc.color('#ff8b8b'));
                    txt.setAnchorPoint(0.5, 0.5);
                    txt.setPosition(sender.children[0].width / 2, sender.children[0].height / 2);
                    sender.children[0].removeAllChildren();
                    sender.children[0].addChild(txt);
                }
            });
            me.nodes.listview.children[0].triggerTouch(ccui.Widget.TOUCH_ENDED);

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_gm.click(function () {
                if (me.eventEnd) return G.tip_NB.show(L("HDYJS"));

                G.event.once('paysuccess', function(arg) {
                    var data = me.DATA.info.data[me.index];
                    arg && arg.success && G.frame.jiangli.data({
                        prize: data.prize
                    }).show();
                    if (!me.DATA.myinfo.gotarr[data.proid])me.DATA.myinfo.gotarr[data.proid] = 0;
                    me.DATA.myinfo.gotarr[data.proid] ++;
                    me.setView();
                });
                G.event.emit('doSDKPay', {
                    pid:me.DATA.info.data[me.index].proid,
                    logicProid: me.DATA.info.data[me.index].proid,
                    money: me.DATA.info.data[me.index].money,
                });
            });
        },
        getData: function (callback) {
            var me = this;

            connectApi('huodong_open', [G.DATA.asyncBtnsData.zslb.hdid], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        show: function () {
            var me = this;
            var _super = me._super;

            me.getData(function () {
                _super.apply(me);
            });
        },
        onShow: function () {
            var me = this;
        },
        setView: function () {
            var me = this;
            var data = me.DATA.info.data[me.index];
            var buyNum = me.DATA.myinfo.gotarr[data.proid] || 0;

            X.render({
                ico: function (node) {
                    X.alignCenter(node, data.prize, {
                        touch: true
                    });
                },
                txt_zk: data.sale ? data.sale + L("sale") : 5 + L('sale'),
                txt_lb: data.name || data.proid,
                txt_xg: X.STR(L("XG"), data.maxnum - buyNum),
                btn_gm: function (node) {
                    node.setEnableState(buyNum < data.maxnum);
                },
                txt_sz: function (node) {
                    node.setString(data.money / 100 + L("YUAN"));
                    node.setTextColor(cc.color(buyNum < data.maxnum ? '#2f5719' : '#6c6c6c'));
                }
            }, me.nodes);
        }
    });
    G.frame[ID] = new fun('zhuanshulibao.json', ID);
})();