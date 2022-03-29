/**
 * Created by wfq on 2018/6/1.
 */
(function () {
    //英雄祭坛 - 抽卡
    var ID = 'yingxiong_jitan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('yingxiong_jitan.json', ID);
})();