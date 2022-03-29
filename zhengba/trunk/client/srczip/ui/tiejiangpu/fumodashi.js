/**
 * Created by LYF on 2019-03-4
 */

(function () {
    //附魔大师
    var ID = 'fumodashi';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.nodes.list.hide();
            me.setViewInfo();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getLv: function(idx) {

            return G.frame.zhuangbeifumo.getLv(idx);
        },
        setViewInfo: function () {
            var me = this;
            var len = 0;
            var data = G.frame.zhuangbeifumo.DATA;
            var type = G.frame.zhuangbeifumo.type;
            var nextLv = parseInt(me.getLv(3) / 10) * 10 + 10;
            var maxLv = G.class.equip.getFMMaxLv() - 1;

            if(nextLv >= maxLv) nextLv = maxLv;

            var data1 = {curLv: me.getLv(1), idx: 1, img: "4"};
            var data2 = {curLv: me.getLv(4), idx: 4, img: "3"};
            var data3 = {curLv: me.getLv(2), idx: 2, img: "1"};
            var data4 = {curLv: me.getLv(3), idx: 3, img: "2"};

            me.nodes.txt_tips.setString(nextLv == maxLv ? L("FMMJ") : X.STR(L("JOBFMDXJ"), nextLv));

            X.layout_adaption({
                list: me.nodes.list,
                parent: me.nodes.panel_fumo,
                line: 2,
                listInterval: 0,
                topPoint: 55,
                dataArr: [[data1, data3], [data2, data4]],
                callbackArr: [function (node, data) {
                    X.autoInitUI(node);
                    node.show();
                    node.nodes.panel_wp.setBackGroundImage("img/fumo/fumo_wp" + data.img + ".png", 1);
                    node.nodes.panel_wp.setScale(.85);
                    node.nodes.txt_name.setString(L("ZHUANGBEI_TYPE_" + data.idx) + L("FM"));
                    node.nodes.jdt.setPercent(data.curLv / nextLv * 100);
                    node.nodes.txt_wz.setString(data.curLv + "/" + nextLv);
                    X.enableOutline(node.nodes.txt_wz, "#69421A", 2);
                }, function (node, data) {
                    X.autoInitUI(node);
                    node.show();
                    node.nodes.panel_wp.setBackGroundImage("img/fumo/fumo_wp" + data.img + ".png", 1);
                    node.nodes.panel_wp.setScale(.85);
                    node.nodes.txt_name.setString(L("ZHUANGBEI_TYPE_" + data.idx) + L("FM"));
                    node.nodes.jdt.setPercent(data.curLv / nextLv * 100);
                    node.nodes.txt_wz.setString(data.curLv + "/" + nextLv);
                    X.enableOutline(node.nodes.txt_wz, "#69421A", 2);
                }]
            });

            var dslv = G.frame.zhuangbeifumo.getDsLv();
            var maxdslv = X.keysOfObject(G.gc.zbfm.base.master).length - 1;
            var nextdslv = G.frame.zhuangbeifumo.getDsLv() >= maxdslv ? maxdslv : G.frame.zhuangbeifumo.getDsLv() + 1;

            me.nodes.txt_jcsxjc1.setString(dslv);
            me.nodes.txt_jcsxjc2.setString("+" + me.getBuff(dslv, 1).pro / 10 + "%");
            me.nodes.txt_jcsxjc3.setString("+" + me.getBuff(dslv, 4).pro / 10 + "%");
            me.nodes.txt_jcsxjc4.setString("+" + me.getBuff(dslv, 3).pro / 10 + "%");
            me.nodes.txt_jcsxjc5.setString("+" + me.getBuff(dslv, 2).pro / 10 + "%");

            me.nodes.txt_djjcda1.setString(nextdslv);
            me.nodes.txt_djjcda2.setString("+" + me.getBuff(nextdslv, 1).pro / 10 + "%");
            me.nodes.txt_djjcda3.setString("+" + me.getBuff(nextdslv, 4).pro / 10 + "%");
            me.nodes.txt_djjcda4.setString("+" + me.getBuff(nextdslv, 3).pro / 10 + "%");
            me.nodes.txt_djjcda5.setString("+" + me.getBuff(nextdslv, 2).pro / 10 + "%");

            if(dslv == maxdslv) {
                me.nodes.txt_djjcda1.hide();
                me.nodes.txt_djjcda2.hide();
                me.nodes.txt_djjcda3.hide();
                me.nodes.txt_djjcda4.hide();
                me.nodes.txt_djjcda5.hide();

                me.nodes.txt_djjc1.hide();
                me.nodes.txt_djjc2.hide();
                me.nodes.txt_djjc3.hide();
                me.nodes.txt_djjc4.hide();
                me.nodes.txt_djjc5.hide();

                me.nodes.txt_dashiz1.hide();
                me.nodes.txt_dashiz2.hide();
                me.nodes.txt_dashiz3.hide();
                me.nodes.txt_dashiz4.hide();
                me.nodes.txt_dashiz5.hide();

                me.nodes.txt_ds1.hide();
                me.nodes.txt_ds2.hide();
                me.nodes.txt_ds3.hide();
                me.nodes.txt_ds4.hide();
                me.nodes.txt_ds5.hide();


            }

            me.nodes.txt_fmdsjc2.setString(L("ZHUANGBEI_TYPE_" + 1) + ":");
            me.nodes.txt_fmdsjc3.setString(L("ZHUANGBEI_TYPE_" + 4) + ":");
            me.nodes.txt_fmdsjc4.setString(L("ZHUANGBEI_TYPE_" + 3) + ":");
            me.nodes.txt_fmdsjc5.setString(L("ZHUANGBEI_TYPE_" + 2) + ":");

            me.nodes.txt_dashiz2.setString(L("ZHUANGBEI_TYPE_" + 1) + ":");
            me.nodes.txt_dashiz3.setString(L("ZHUANGBEI_TYPE_" + 4) + ":");
            me.nodes.txt_dashiz4.setString(L("ZHUANGBEI_TYPE_" + 3) + ":");
            me.nodes.txt_dashiz5.setString(L("ZHUANGBEI_TYPE_" + 2) + ":");

            me.nodes.txt_dashi1.setString(dslv);
            me.nodes.txt_ds1.setString(nextdslv);

            var buffkey1 = me.getKeyIndex(me.getBuff(dslv, 1).buff, 0);
            var buffkey2 = me.getKeyIndex(me.getBuff(dslv, 4).buff, 0);
            var buffkey3 = me.getKeyIndex(me.getBuff(dslv, 3).buff, 0);
            var buffkey4 = me.getKeyIndex(me.getBuff(dslv, 2).buff, 0);


            me.nodes.txt_dashi2.setString("+" + (parseFloat(me.getBuff(dslv, 1).buff[buffkey1]) / 10) + "%" + L(buffkey1));
            me.nodes.txt_dashi3.setString("+" + (parseFloat(me.getBuff(dslv, 4).buff[buffkey2]) / 10) + "%" + L(buffkey2));
            me.nodes.txt_dashi4.setString("+" + (parseFloat(me.getBuff(dslv, 3).buff[buffkey3]) / 10) + "%" + L(buffkey3));
            me.nodes.txt_dashi5.setString("+" + (parseFloat(me.getBuff(dslv, 2).buff[buffkey4]) / 10) + "%" + L(buffkey4));

            me.nodes.txt_ds2.setString("+" + (parseFloat(me.getBuff(nextdslv, 1).buff[buffkey1]) / 10) + "%" + L(buffkey1));
            me.nodes.txt_ds3.setString("+" + (parseFloat(me.getBuff(nextdslv, 4).buff[buffkey2]) / 10) + "%" + L(buffkey2));
            me.nodes.txt_ds4.setString("+" + (parseFloat(me.getBuff(nextdslv, 3).buff[buffkey3]) / 10) + "%" + L(buffkey3));
            me.nodes.txt_ds5.setString("+" + (parseFloat(me.getBuff(nextdslv, 2).buff[buffkey4]) / 10) + "%" + L(buffkey4));

            if(parseFloat(me.getBuff(dslv, 1).buff[buffkey1]) / 10 <= 0 && parseFloat(me.getBuff(nextdslv, 1).buff[buffkey1]) / 10 <= 0) {
                me.nodes.txt_fmdsjc2.hide();
                me.nodes.txt_dashiz2.hide();
                me.nodes.txt_dashi2.hide();
                me.nodes.txt_ds2.hide();
            }
            if(parseFloat(me.getBuff(dslv, 4).buff[buffkey2]) / 10 <= 0 && parseFloat(me.getBuff(nextdslv, 4).buff[buffkey2]) / 10 <= 0) {
                me.nodes.txt_fmdsjc3.hide();
                me.nodes.txt_dashiz3.hide();
                me.nodes.txt_dashi3.hide();
                me.nodes.txt_ds3.hide();
                len ++;
            }
            if(parseFloat(me.getBuff(dslv, 3).buff[buffkey3]) / 10 <= 0 && parseFloat(me.getBuff(nextdslv, 3).buff[buffkey3]) / 10 <= 0) {
                me.nodes.txt_fmdsjc4.hide();
                me.nodes.txt_dashiz4.hide();
                me.nodes.txt_dashi4.hide();
                me.nodes.txt_ds4.hide();
                len ++;
            }
            if(parseFloat(me.getBuff(dslv, 2).buff[buffkey4]) / 10 <= 0 && parseFloat(me.getBuff(nextdslv, 2).buff[buffkey4]) / 10 <= 0) {
                me.nodes.txt_fmdsjc5.hide();
                me.nodes.txt_dashiz5.hide();
                me.nodes.txt_dashi5.hide();
                me.nodes.txt_ds5.hide();
                len ++;
            }

            if(me.getBuff(nextdslv, 1).buff[buffkey1] <= 0) {
                me.nodes.txt_ds2.setTextColor(cc.color("#FFEFD1"));
            }
            if(me.getBuff(nextdslv, 4).buff[buffkey2] <= 0) {
                me.nodes.txt_ds3.setTextColor(cc.color("#FFEFD1"));
            }
            if(me.getBuff(nextdslv, 3).buff[buffkey3] <= 0) {
                me.nodes.txt_ds4.setTextColor(cc.color("#FFEFD1"));
            }
            if(me.getBuff(nextdslv, 2).buff[buffkey4] <= 0) {
                me.nodes.txt_ds5.setTextColor(cc.color("#FFEFD1"));
            }

            if(len) {
                me.nodes.bg_top.height -= len * 40;
            }

        },
        getKeyIndex: function (obj, idx) {
            var arr = X.keysOfObject(obj);

            return arr[idx];
        },
        getBuff: function (lv, idx) {

            return G.frame.zhuangbeifumo.getDsBuff(lv, idx);
        }
    });

    G.frame[ID] = new fun('fumo_top1.json', ID);
})();