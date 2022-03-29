/**
 * Created by LYF on 2018/8/9.
 */
(function () {
    //跳转前往
    var ID = 'qianwang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.setTouchEnabled(true);
            me.ui.click(function (sender, type) {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.nodes.btn_hqtj.hide();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var btnArr = [];
            for(var i = 0; i < me.DATA.length; i ++) {
                var btn = G.class.setTZ(me.DATA[i]);
                btnArr.push(btn);
            }
            btnArr.sort(function (a, b) {
                return a.is > b.is ? -1 : 1;
            });
            X.center(btnArr, me.nodes.panel_ico, {
                callback:function (item) {
                    if(btnArr.length > 5) item.setScale(.8);
                }
            });
        },
    });
    G.frame[ID] = new fun('zhuangbei_tip2.json', ID);
})();