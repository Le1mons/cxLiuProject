/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//文物-获得物品
    var ID = 'wenwu_getprize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            me.nodes.mask.click(function(){
                me.remove();
            });
            me.nodes.btn_ckww.click(function(){
                G.frame.wenwu_bg.data(me.type).show();
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.nodes.btn_ckww.show();
            me.nodes.txt_djgb.hide();
            me.nodes.btn_zzyc.hide();
            me.nodes.btn_qr.hide();
        },
        onShow:function(){
            var me = this;
            me.type = me.data().type;
            me.prize = me.data().prize;
            me.ui.setTimeout(function () {
                me.setContents();
            }, 200);
        },
        onAniShow: function () {
            var me = this;
            me.action.play("wait", true);
        },
        setContents:function(){
            var me = this;
            var prizearr = [];
            for(var i = 0; i < me.prize.length; i++){
                var item = G.class.sitem(me.prize[i]);
                G.frame.iteminfo.showItemInfo(item);
                prizearr.push(item);
            }
            X.center(prizearr,me.nodes.panel_ico);
        }
    });

    G.frame[ID] = new fun('ui_hdwp2.json', ID);
})();