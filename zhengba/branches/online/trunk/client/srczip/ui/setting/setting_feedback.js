/**
 * Created by lsm on 2018/6/27
 */
(function() {
    //反馈
    G.class.setting_feedback = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('setting_feedback.json');
        },
        refreshPanel: function() {
            var me = this;
            me.setContents();
        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_commit.click(function(){
                G.frame.setting.remove();
            });
        },
        onOpen: function() {
            var me = this;
            me.bindBTN();
            me.nodes.txtfield.getVirtualRenderer().setLineHeight(40);
        },
        onShow: function() {
            var me = this;
            me.refreshPanel();
        },
        onRemove: function() {
            var me = this;

        },
        setContents: function() {
            var me = this;
            me.nodes.txtfield.setString(L("FK"));
        }
    });
})();