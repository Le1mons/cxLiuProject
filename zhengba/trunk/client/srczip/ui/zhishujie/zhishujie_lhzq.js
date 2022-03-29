/**
 * Created by
 */
(function () {
    //
    var ID = 'zhishujie_lhzq';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            cc.enableScrollBar(me.nodes.scrollview);
            X.timeout(me.nodes.txt_cs, G.DATA.asyncBtnsData.planttrees.rtime, function () {
                me.nodes.txt_cs.setString(L("YJS"));
            }, null, {
                showDay: true
            });

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS86')
                }).show();
            });
            X.enableOutline(me.nodes.txt_jd, '#2A160B', 2);
            G.class.ani.show({
                json: 'zhishujie_fenwei_dh',
                addTo: me.nodes.img_bg,
                autoRemove: false,
                repeat: true
            });
        },
        onShow: function () {
            var me = this;

            me.setPer();
            me.setTable();

            var index;
            var val = G.frame.zhishujie_main.DATA.allval;
            var conf = G.gc.zhishujie.commonprize;
            for (var i = 0; i < conf.length; i ++) {
                var con = conf[i];
                if (val >= con.val && (!conf[i + 1] || val < conf[i + 1].val)) {
                    index = i;
                    break;
                }
            }
            index != undefined && me.nodes.img_bg.setBackGroundImage('img/bg/bg_zhj_zq' + conf[index].img + '.png');
        },
        setPer: function () {
            this.nodes.img_jdt.setPercent(G.frame.zhishujie_main.DATA.allval / G.gc.zhishujie.commonval * 100);
            this.nodes.txt_jd.setString(G.frame.zhishujie_main.DATA.allval + '/' + G.gc.zhishujie.commonval);
        },
        setTable: function () {
            var me = this;
            var data = [];
            var conf = JSON.parse(JSON.stringify(G.gc.zhishujie.commonprize));

            cc.each(conf, function (obj, index) {
                obj.index = index;
                obj.ylq = X.inArray(G.frame.zhishujie_main.DATA.myinfo.commonprize, index);
                data.push(obj);
            });
            data.sort(function (a, b) {
                if (a.ylq != b.ylq) {
                    return a.ylq < b.ylq ? -1 : 1;
                } else {
                    return a.val < b.val ? -1 : 1;
                }
            });

            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 2, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            X.render({
                panel_wp: function (node) {
                    X.alignCenter(node, data.p, {
                        touch: true,
                        mapItem: function (node) {
                            node.setGou(data.ylq);
                        }
                    });
                },
                txt_rw: L("LHLDD") + data.val
            }, ui.nodes);

            ui.setTouchEnabled(!data.ylq && G.frame.zhishujie_main.DATA.allval >= data.val);
            ui.noMove(function () {

                me.ajax('planttrees_getcommonprize', [data.index], function (str, _data) {
                    if (_data.s == 1) {
                        G.frame.jiangli.data({
                            prize: _data.d.prize
                        }).show();
                        G.frame.zhishujie_main.DATA.myinfo.commonprize.push(data.index);
                        me.setTable();
                        G.hongdian.getData('planttrees', 1, function () {
                            G.frame.zhishujie_main.checkRedPoint();
                        });
                    }
                });
            });
        }
    });
    G.frame[ID] = new fun('zhishujie_lhzq.json', ID);
})();