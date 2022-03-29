/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //升级界面
    G.class.ui_shengji = X.bView.extend({
        extConf:{
            shipin:{
                data: function () {
                    var curXbId = G.frame.yingxiong_xxxx.curXbId;
                    var heroData = G.DATA.yingxiong.list[curXbId];
                    var curId = heroData.weardata['5'];

                    return curId;
                },
                conf: function (data) {
                    return G.class.shipin.getById(data);
                },
                data2: function (data) {
                    return G.class.shipin.getById(data).upid;
                },
                needExp: function (data) {
                    return G.class.shipin.getById(data).upexp;
                },
                item: function (data) {
                    return G.class.sshipin(data);
                },
                getExp: function (spid) {
                    var conf = G.class.shipin.getById(spid);
                    return conf.tgexp;
                },
                cancelCall: function (node) {
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.shipin_shengji.refreshPanel();
                        }
                    });
                },
                okCall: function (node, act) {
                    var me = this;
                    node.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if(me.ani) return;
                            G.ajax.send('shipin_upstar',[G.frame.yingxiong_xxxx.curXbId,G.frame.shipin_shengji.selectedData],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    me.ani = true;
                                    G.frame.shipin_shengji.nodes.mask.setTouchEnabled(false);
                                    var curXbId = G.frame.yingxiong_xxxx.curXbId;
                                    var heroData = G.DATA.yingxiong.list[curXbId];
                                    var curId = heroData.weardata['5'];
                                    var conf = G.class.shipin.getById(curId);
                                    G.class.ani.show({
                                        json: "ani_shiping_shengji",
                                        addTo: G.frame.shipin_shengji.panelBottom.ui,
                                        x: 279,
                                        y: 348,
                                        repeat: false,
                                        autoRemove: true,
                                        onend: function () {
                                            G.frame.shipin_shengji.nodes.mask.setTouchEnabled(true);
                                            if (!conf.upid || conf.upid == '') {
                                                G.frame.shipin_shengji.remove();
                                                G.tip_NB.show(X.STR(L('YINGXIONG_UP_MAX'),L('SHIPIN')));
                                            } else {
                                                G.frame.shipin_shengji.refreshPanel();
                                            }
                                            if (d.d) {
                                                G.frame.jiangli.data({
                                                    prize:[].concat(d.d.prize)
                                                }).show();
                                            }
                                            G.frame.yingxiong_xxxx.emit('updateInfo');
                                            me.ani = false;
                                        }
                                    });
                                }
                            },true);
                        }
                    });
                }
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhuangbei_tunshi.json');
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

            var layIco1 = me.nodes.panel_tb1;
            var layIco2 = me.nodes.panel_tb2;
            var jdt = me.nodes.loadingbar_1;
            var txtJdt = me.nodes.text_1;
            var btnQx = me.nodes.btn_1;
            var btnSj = me.nodes.btn_2;

            layIco1.removeAllChildren();
            layIco2.removeAllChildren();
            me.percent = 0;

            // 头像
            var conf = me.extConf[me._type];
            var data = conf.data();
            var data2 = conf.data2(data);

            var wid1 = conf.item(data);
            wid1.setPosition(cc.p(layIco1.width / 2,layIco1.height / 2));
            layIco1.addChild(wid1);
            wid1.data = {a: "shipin", t: wid1.data};
            G.frame.iteminfo.showItemInfo(wid1);

            var wid2 = conf.item(data2);
            wid2.setPosition(cc.p(layIco2.width / 2,layIco2.height / 2));
            layIco2.addChild(wid2);
            wid2.data = {a: "shipin", t: wid2.data};
            G.frame.iteminfo.showItemInfo(wid2);

            G.class.ui_star(me.nodes.panel_xx1, wid1.conf.star, null, null, null, 3);
            G.class.ui_star(me.nodes.panel_xx2, wid2.conf.star, null, null, null, 3);

            //进度条
            var selectedData = G.frame.shipin_shengji.selectedData;
            var needExp = conf.needExp(data);
            if (selectedData) {
                var allExp = 0;
                for (var spid in selectedData) {
                    var exp = conf.getExp(spid);
                    var num = selectedData[spid];
                    allExp += exp * num;
                }
                var percent = me.percent = Math.floor(allExp / needExp * 100) > 100 ? 100 : Math.floor(allExp / needExp * 100);

                jdt.setPercent(percent);
                txtJdt.setString(allExp + '/' + needExp);
            } else {
                jdt.setPercent(0);
                txtJdt.setString('0/' + needExp);
            }

            //按钮
            btnSj.data = {
                percent:me.percent
            };
            conf.cancelCall(btnQx);
            conf.okCall(btnSj, layIco2);
        },
    });

})();