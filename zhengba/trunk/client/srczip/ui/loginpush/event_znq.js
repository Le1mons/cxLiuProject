(function () {
    //推送事件
    var ID = 'event_znq';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },

        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;

        },

        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },

    });
    G.frame[ID] = new fun('event_znq.json', ID);
})();