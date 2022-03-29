/**
 * Created by LYF on 2019/7/16.
 */
(function () {
    //皮肤-选择
    var ID = 'skin_change';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_title.setString(L("XZPF"));
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

            new X.bView("pifu_tip_xq.json", function (view) {

                me.view = view;
                me.nodes.panel_nr.addChild(view);

                cc.enableScrollBar(view.nodes.scrollview_txk);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.curTid = G.frame.yingxiong_xxxx.curXbId;
            me.setTable();
        },
        getData: function () {
            var me = this;
            var data = [];
            var curSkinId = me.data();
            var allSkinData = G.DATA.skin.list;
            var skinArr = [].concat(curSkinId);

            for (var index = 0; index < skinArr.length; index ++) {
                var skinId = skinArr[index];
                for (var i in allSkinData) {
                    if (allSkinData[i].id == skinId) data.push(i);
                }
            }

            return data;
        },
        setTable: function () {
            var me = this;
            var data = me.getData();

            if (!me.table) {
                me.table = new X.TableView(me.view.nodes.scrollview_txk, me.view.nodes.list_txk, 1, function (ui, data) {

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
            var skinData = G.DATA.skin.list[data];
            var skinConf = G.gc.skin[skinData.id];

            X.autoInitUI(ui);
            X.render({
                txt_txkwz1: skinConf.name,
                btn: function (node) {

                    node.setVisible(skinData.wearer != me.curTid);

                    node.click(function () {

                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curTid]));
                        me.ajax("skin_wear", [me.curTid, data], function (str, dd) {

                            if (dd.s == 1) {

                                G.frame.yingxiong_xxxx.rw.changeSkin = true;
                                G.frame.yingxiong_xxxx.emit("updateInfo");
                                me.remove();
                            }
                        });
                    });
                },
                btn_xq: function (node) {
                    node.setVisible(skinData.wearer == me.curTid);

                    node.click(function () {
                        G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curTid]));
                        me.ajax("skin_down", [me.curTid], function (str, dd) {

                            if (dd.s == 1) {

                                me.setTable();
                                G.frame.yingxiong_xxxx.rw.changeSkin = true;
                                G.frame.yingxiong_xxxx.emit("updateInfo");
                                me.remove();
                            }
                        });
                    });
                },
                txt_yj: skinData.expire > 0 ? X.moment(skinData.expire - G.time, {
                    d: "{1}天",
                    h: "{1}小时",
                    mm: "{1}分钟"
                }) : L("YJ"),
                panel_tx: function (node) {
                    node.removeAllChildren();

                    var hero = G.class.shero(G.DATA.yingxiong.list[skinData.wearer]);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.addChild(hero);
                },
                txt_txkwz2: me.showBuff(skinConf.buff),
                img_bjditu: "img/pifu/chuandai/img_pf_" + skinData.id + ".png"
            }, ui.nodes);

            ui.nodes.txt_txkwz2.setTextColor(cc.color("#fbffd3"));
            X.enableOutline(ui.nodes.txt_txkwz2, "#2f2a24", 2);
            X.enableOutline(ui.nodes.txt_yj, "#2f2a24", 2);
            X.enableOutline(ui.nodes.txt_txkwz1, "#2f2a24", 2);
            X.enableOutline(ui.nodes.txt_yxq, "#2f2a24", 2);
            X.enableOutline(ui.nodes.txt_dqcd, "#2f2a24", 2);
        },
        showBuff: function (buff) {

            var str = '';

            var index = 0;
            for (var i in buff) {

                if (index != 0) str += " ";
                str += L(i) + " +";
                str += i.indexOf("pro") != -1 ? buff[i] / 10 + "%" : buff[i];
                index ++;
            }

            return str;
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();