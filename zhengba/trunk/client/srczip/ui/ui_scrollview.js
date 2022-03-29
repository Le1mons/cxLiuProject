/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //滚动容器
    G.class.ui_scrollview = X.bView.extend({
        extConf:{
            shipin:{
                dataSource: function () {
                    return G.frame.beibao.DATA.shipin.list;
                },
                data: function () {
                    var data = G.frame.beibao.DATA.shipin.list;
                    var keys = X.keysOfObject(data);

                    return keys;
                },
                sort: function (a,b) {
                    var dataA = G.frame.beibao.DATA.shipin.list[a];
                    var dataB = G.frame.beibao.DATA.shipin.list[b];
                    var confA = G.class.shipin.getById(dataA.spid);
                    var confB = G.class.shipin.getById(dataB.spid);

                    if (confA.color != confB.color) {
                        return confA.color > confB.color ? -1 : 1;
                    } else if (confA.star != confB.star) {
                        return confA.star * 1 > confB.star * 1 ? -1 : 1;
                    } else {
                        return confA.id * 1 > confB.id * 1 ? -1 : 1;
                    }
                }
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhuangbei_zbxz.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            
            var data = me.extConf[me._type].data();
            me.ui.finds('img_zwnr').hide();
            if (data.length < 1) {
                me.ui.finds('img_zwnr').show();
                return;
            }

            data.sort(me.extConf[me._type].sort);

            var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                me['setItem_' + me._type](ui, data);
            },null,null,3, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem_shipin: function (ui,data) {
            var me = this;

            var itemData = X.clone(me.extConf[me._type].dataSource()[data]);
            itemData.a = 'shipin';
            var wid = G.class.sitem(itemData);
            wid.setPosition(cc.p(ui.width / 2,ui.height / 2));
            if(G.frame.shipin_shengji.selectedData && G.frame.shipin_shengji.selectedData[wid.data.spid]) {
                wid.num.setString(itemData.num - G.frame.shipin_shengji.selectedData[wid.data.spid]);
            } else {
                wid.num.setString(itemData.num);
            }
            ui.removeAllChildren();
            ui.addChild(wid);
            ui.setTouchEnabled(false);

            wid.setTouchEnabled(true);
            wid.setSwallowTouches(false);
            wid.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var callback = function (obj) {
                        G.frame.shipin_shengji.selectedData = G.frame.shipin_shengji.selectedData || {};
                        var tid = obj.id;
                        var spid = obj.spid;
                        var num = obj.num;

                        if (!G.frame.shipin_shengji.selectedData[spid]) {
                            G.frame.shipin_shengji.selectedData[spid] = num;
                        } else {
                            G.frame.shipin_shengji.selectedData[spid] += num;
                        }

                        if (G.frame.shipin_shengji.selectedData[spid] > G.frame.beibao.DATA.shipin.list[tid].num) {
                            G.frame.shipin_shengji.selectedData[spid] = G.frame.beibao.DATA.shipin.list[tid].num;
                        }
                        if (G.frame.shipin_shengji.selectedData[spid] <= 0) {
                            delete G.frame.shipin_shengji.selectedData[spid];
                        }
                        G.frame.shipin_shengji.panelBottom.refreshPanel();
                    };
                    G.frame.shipin_tunshixuanze.data({item:sender,callback:callback}).show();
                }
            });
        }
    });

})();