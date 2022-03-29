/**
 * Created by LYF on 2019/6/3.
 */
(function () {
    //战旗奖励
    G.class.buluozhanqi_zjtz = X.bView.extend({
        ctor: function (taskType) {
            var me = this;
            me.taskType = taskType;
            me._super("buluozhanqi_zjtz.json", null, {action: true});
        },
        bindBtn: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        onShow: function () {
            var me = this;

            me.refreshView();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            me.ajax("flag_taskopen", [me.taskType], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        refreshView: function () {
            var me = this;

            me.getData(function () {

                me.setTable();
            });
        },
        setTable: function () {
            var me = this;

            G.frame.buluozhanqi.initScrollView(me.nodes.scrollview, me.nodes.list1, me);
        }
    });
})();