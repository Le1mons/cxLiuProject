/**
 * Created by LYF on 2019/5/20.
 */
(function () {
    //突破界面
    G.class.shipin_down = X.bView.extend({
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
                item: function (data) {
                    return G.class.sshipin(data);
                },
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhuangbei_tunshi.json');
        },
        refreshPanel: function () {
            var me = this;

            me.num = 0;
            me.conf = G.gc.shipin[me.extConf.shipin.data()];
            me.maxNum = me.conf.tpneed.num;
            me.setPer(me.num);
            me.setContents();
        },
        bindBTN: function () {
            var me = this;

            me.nodes.btn_1.click(function () {

                G.frame.shipin_tupo.remove();
            });

            me.nodes.btn_2.click(function (sender) {

                if(me.num < me.maxNum) return G.tip_NB.show(L("SLBZ"));

                var obj = {};
                var selectArr = G.frame.shipin_tupo.panelScrollview.selectArr;

                for (var i in selectArr) {
                    var id = selectArr[i].split("_")[0];
                    var spid = G.frame.beibao.DATA.shipin.list[id].spid;

                    if(!obj[spid]) obj[spid] = 1;
                    else obj[spid] ++;
                }

                G.DATA.noClick = true;
                me.ajax("shipin_tupo", [G.frame.yingxiong_xxxx.curXbId, obj], function (str, data) {
                    if(data.s == 1) {
                        me.nodes.btn_1.setTouchEnabled(false);
                        G.frame.shipin_tupo.nodes.mask.setTouchEnabled(false);
                        G.frame.yingxiong_xxxx.emit('updateInfo');
                        var curXbId = G.frame.yingxiong_xxxx.curXbId;
                        var heroData = G.DATA.yingxiong.list[curXbId];
                        var curId = heroData.weardata['5'];
                        var conf = G.class.shipin.getById(curId);

                        G.class.ani.show({
                            json: "ani_shiping_shengji",
                            addTo: G.frame.shipin_tupo.panelBottom.ui,
                            x: 138,
                            y: 320,
                            repeat: false,
                            autoRemove: true,
                            onload: function(node, action) {
                                node.setScale(0.7);
                            }
                        });

                        G.class.ani.show({
                            json: "ani_shiping_shengji",
                            addTo: G.frame.shipin_tupo.panelBottom.ui,
                            x: 417,
                            y: 320,
                            repeat: false,
                            autoRemove: true,
                            onload: function(node, action) {
                                node.setScale(0.7);
                            },
                            onend: function () {
                                G.frame.shipin_tupo.nodes.mask.setTouchEnabled(true);
                                if (!conf.tpid || conf.tpid == '') {
                                    G.frame.shipin_tupo.remove();
                                    G.tip_NB.show(L("YINGXIONG_TP_MAX"));
                                } else {
                                    G.tip_NB.show(L("TPCG"));
                                    G.frame.shipin_tupo.refreshPanel();
                                }
                                G.frame.jiangli.data({
                                    prize: [].concat([{a: "shipin", t: curId, n: 1}], data.d.prize),
                                }).show();
                                me.nodes.btn_1.setTouchEnabled(true);
                                G.DATA.noClick = false;
                            }
                        });
                    }
                });
            });

            me.nodes.btn_banzhu.show();
            me.nodes.btn_banzhu.setTouchEnabled(true);
            me.nodes.btn_banzhu.click(function () {
                G.frame.help.data({
                    intr:L("TS40")
                }).show();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindBTN();

            me.nodes.btn_2.setTitleText(L("TUPO"));
            me.nodes.txt_wztip.setString(L("XYTPDSP"));
        },
        onShow: function () {
            var me = this;


            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setPer: function() {
            var me = this;

            me.nodes.text_1.setString(me.num + "/" + me.maxNum);
            me.nodes.loadingbar_1.setPercent(me.num / me.maxNum * 100);
        },
        setContents: function () {
            var me = this;
            var layIco1 = me.nodes.panel_tb1;
            var layIco2 = me.nodes.panel_tb2;
            var conf = me.extConf[me._type];
            var data = conf.data();

            var wid1 = conf.item(data);
            wid1.setPosition(cc.p(layIco1.width / 2,layIco1.height / 2));
            layIco1.removeAllChildren();
            layIco1.addChild(wid1);
            wid1.data = {a: "shipin", t: wid1.data};
            G.frame.iteminfo.showItemInfo(wid1);

            var wid2 = conf.item(G.gc.shipin[me.conf.tpid]);
            wid2.setPosition(cc.p(layIco2.width / 2,layIco2.height / 2));
            layIco2.removeAllChildren();
            layIco2.addChild(wid2);
            wid2.data = {a: "shipin", t: me.conf.tpid};
            G.frame.iteminfo.showItemInfo(wid2);

            var lv = me.conf.name.split("+")[1] || 0;

            X.setRichText({
                parent: me.nodes.panel_xx1,
                str: "+" + lv,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: 40, y: 10},
                color: G.gc.COLOR[5],
                size: 20
            });

            X.setRichText({
                parent: me.nodes.panel_xx2,
                str: "+" + (lv * 1 + 1),
                anchor: {x: 0.5, y: 0.5},
                pos: {x: 40, y: 10},
                color: G.gc.COLOR[5],
                size: 20
            });
        },
    });

})();