/**
 * Created by LYF on 2019/7/16.
 */
(function () {
    //皮肤-里程碑
    var ID = 'skin_target';

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

            me.nodes.btn_rcjl.click(function () {

                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();

            me.cur = G.frame.yingxiong.getSkinActiveNum();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.skincom.base.landmark;


            for (var i in conf) {

                me.nodes.listview.pushBackCustomItem(me.setItem(me.nodes.list.clone(), conf[i], conf[i].num));
            }
        },
        setItem: function (ui, data, target) {
            var me = this;
            var buffKeys = Object.keys(data.buff);

            var color = me.cur > target ? "#f6ebcd" : (me.cur == target ? "#15bc20" : "#615547");

            ui.show();
            X.autoInitUI(ui);
            X.render({
                img_dqzt: function (node) {

                    node.setVisible(me.cur == target);
                },
                img_bq: function (node) {

                    node.setVisible(me.cur == target);
                },
                txt_name: X.STR(L("YJJHXGPF"), target) + "(" + me.cur + "/" + target + ")",
                txt_gj: L(buffKeys[0]) + "+" + (buffKeys[0].indexOf("pro") != -1 ? data.buff[buffKeys[0]] / 10 + "%" : data.buff[buffKeys[0]]),
                txt_sm: L(buffKeys[1]) + "+" + (buffKeys[1].indexOf("pro") != -1 ? data.buff[buffKeys[1]] / 10 + "%" : data.buff[buffKeys[1]]),
            }, ui.nodes);

            ui.nodes.txt_name.setTextColor(cc.color(color));
            ui.nodes.txt_gj.setTextColor(cc.color(color));
            ui.nodes.txt_sm.setTextColor(cc.color(color));

            return ui;
        }
    });
    G.frame[ID] = new fun('pifu_lichengbei.json', ID);
})();