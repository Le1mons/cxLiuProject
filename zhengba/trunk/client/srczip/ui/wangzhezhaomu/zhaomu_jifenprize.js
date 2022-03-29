/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'zhaomu_jifenprize';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.prize = me.data().prize;
            me.jifenprizearr = me.data().jifenprizearr;
            me.jifenreclist = me.data().jifenreclist;
            me.showindex = me.data().showindex;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            X.alignItems(me.nodes.ico_wp,me.prize,'center',{
                touch:true,
            });
            if(me.jifenprizearr.length == me.jifenreclist.length){
                me.nodes.text_zdjl.setString(L('YLQ'));
            }else {
                me.nodes.text_zdjl.setString(X.STR(L("WANZGHEZHAOMU26"),me.jifenprizearr[me.showindex].val));
            }
        }
    });
    G.frame[ID] = new fun('event_chuanqizhaomu_jfhl.json', ID);
})();