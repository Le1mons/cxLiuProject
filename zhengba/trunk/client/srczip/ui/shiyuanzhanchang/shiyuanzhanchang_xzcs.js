/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-选择层数
    var ID = 'shiyuanzhanchang_xzcs';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.cs = me.data().cs;
            me.clickId = false;
            me.fillSize();
            me.initUi();
            me.bindBtn();
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
            me.nodes.btn_1.hide();
            me.nodes.btn_2.hide();
            me.nodes.btn_3.hide();
            var csinfo = G.gc.syzccom.huituicengshu;
            var gdinfo = G.gc.syzccom.gudingcengshu;
            var maxcs = G.gc.syzccom.maxcengshu;
            var itemarr = [];
            for (var i=0;i<csinfo.length;i++){
                me.nodes['panel_'+(i+1)].removeAllChildren();
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                list.show();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                if (csinfo[i]==0){
                    list.nodes.txt_cs.setString('留在当前层');
                } else {
                    list.nodes.txt_cs.setString('回退'+Math.abs(csinfo[i])+'层');
                }
                list._id = i+1;
                list.nodes.panel_zz.setVisible(false);
                me.nodes['btn_'+(i+1)]._id = i+1;
                list.nodes.gou.hide();
                list.setTouchEnabled(false);
                itemarr.push(list);
                me.nodes['panel_'+(i+1)].addChild(list);
            }
            if (me.cs>Math.abs(csinfo[1]) && me.cs<=Math.abs(csinfo[2])){
                me.nodes.btn_1.show();
                me.nodes.btn_2.show();
            }else if (me.cs>Math.abs(csinfo[2]) && me.cs<(maxcs-gdinfo[0])){
                //三个都显示
                me.nodes.btn_1.show();
                me.nodes.btn_2.show();
                me.nodes.btn_3.show();
            }else {
                me.nodes.btn_3.show();
            }
            me.nodes.btn_1.click(function (sender) {
               if (me.clickId){
                   return
               }
                me.clickId = true;
                itemarr[sender._id-1].nodes.gou.show();
                cc.log('层数'+csinfo[sender._id-1]);
                me.ui.setTimeout(function () {
                    me.data().callback && me.data().callback(sender._id-1);
                    me.remove();
                },200);


            });
            me.nodes.btn_2.click(function (sender) {
                if (me.clickId){
                    return
                }
                me.clickId = true;
                itemarr[sender._id-1].nodes.gou.show();
                cc.log('层数'+csinfo[sender._id-1]);
                me.ui.setTimeout(function () {
                    me.data().callback && me.data().callback(sender._id-1);
                    me.remove();
                },200);

            });
            me.nodes.btn_3.click(function (sender) {
                if (me.clickId){
                    return
                }
                me.clickId = true;
                itemarr[sender._id-1].nodes.gou.show();
                cc.log('层数'+csinfo[sender._id-1]);
                me.ui.setTimeout(function () {
                    me.data().callback && me.data().callback(sender._id-1);
                    me.remove();
                },200);

            });
        },
    });
    G.frame[ID] = new fun('shiyuan_tk8.json', ID);
})();