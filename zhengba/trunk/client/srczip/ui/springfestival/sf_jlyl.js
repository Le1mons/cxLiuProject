/**
 * Created by
 */

(function () {
    //奖励预览
    var ID = 'sf_jlyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.nodes.txt_sj1.setString(me.DATA.title?me.DATA.title:'礼包预览');
            X.alignItems( me.nodes.panel_wp, me.DATA.prize, "center",{
                touch:true
            });
        },
    });
    G.frame[ID] = new fun('chunjie_tk1.json', ID);
})();