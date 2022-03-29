/**
 * Created by LYF on 2019/5/20.
 */
(function () {
    //滚动容器
    G.class.shipin_up = X.bView.extend({
        extConf:{
            shipin:{
                dataSource: function () {
                    return G.frame.beibao.DATA.shipin.list;
                },
                data: function () {
                    var curXbId = G.frame.yingxiong_xxxx.curXbId;
                    var heroData = G.DATA.yingxiong.list[curXbId];
                    var spId = heroData.weardata['5'];
                    var data = G.frame.beibao.DATA.shipin.list;
                    var keys = [];
                    var spArr = [];
                    var needArr = G.gc.shipin[spId].tpneed.shipin;

                    for (var i in data) {
                        if(X.inArray(needArr, data[i].spid.split('_')[0])) {
                            spArr.push(data[i]);
                        }
                    }

                    for (var i = 0; i < spArr.length; i ++) {
                        for (var j = 0; j < spArr[i].num; j ++) {
                            keys.push(spArr[i].tid + "_" + j);
                        }
                    }

                    return keys;
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

            me.selectArr = [];
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

            var scrollview = me.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var scrollview = me.nodes.scrollview;

            var data = me.extConf[me._type].data();
            me.ui.finds('img_zwnr').hide();
            if (data.length < 1) {
                me.ui.finds('img_zwnr').show();
            }

            if(!me.table) {
                var table = me.table = new X.TableView(scrollview,me.nodes.list,5, function (ui, data) {
                    me['setItem_' + me._type](ui, data);
                },null,null,3, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }

        },
        setItem_shipin: function (ui,data) {
            var me = this;

            var wid = G.class.sshipin(G.frame.beibao.DATA.shipin.list[data.split("_")[0]]);
            wid.setPosition(cc.p(ui.width / 2,ui.height / 2));
            wid.num.hide();
            ui.wid = wid;
            ui.removeAllChildren();
            ui.addChild(wid);

            if(X.inArray(me.selectArr, data)) {
                wid.setGou(true);
            } else {
                wid.setGou(false);
            }

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_NOMOVE) {
                    if(X.inArray(me.selectArr, data)) {
                        me.selectArr.splice(X.arrayFind(me.selectArr, data), 1);
                        G.frame.shipin_tupo.panelBottom.num = me.selectArr.length;
                        G.frame.shipin_tupo.panelBottom.setPer();
                        sender.wid.setGou(false);
                    } else {
                        if(me.selectArr.length >= G.frame.shipin_tupo.panelBottom.maxNum) return G.tip_NB.show(L("XZSLYDSX"));

                        me.selectArr.push(data);
                        G.frame.shipin_tupo.panelBottom.num = me.selectArr.length;
                        G.frame.shipin_tupo.panelBottom.setPer();
                        sender.wid.setGou(true);
                        cc.log(me.selectArr);
                    }
                }
            });
        }
    });

})();