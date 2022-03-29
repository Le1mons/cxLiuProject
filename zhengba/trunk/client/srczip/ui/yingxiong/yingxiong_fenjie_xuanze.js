/**
 * Created by wfq on 2018/6/2.
 */
(function () {
    //英雄-分解-选择
    G.class.yingxiong_fenjie_xuanze = X.bView.extend({
        extConf:{
            maxnum:10
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('jisifazhen_tip_xzyx.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
            me.setAttr();
            me.setyxsl();
        },
        setAttr: function () {
            var me = this;
            var panel = me.ui;
            var lay1 = panel.finds('panel_xhjy');
            var lay2 = panel.finds('panel_xhhz');

            var txtAttr1 = me.nodes.txt_jysl;
            var imgAttr1 = lay1.finds('token_yxexp');
            var txtAttr2 = me.nodes.txt_hzsl;
            var imgAttr2 = lay2.finds('token_hz');

            var attr1 = 'useexp';
            txtAttr1.setString(X.fmtValue(P.gud['useexp']));
            imgAttr1.loadTexture(G.class.getItemIco(attr1),1);
            var attr2 = '2004';
            txtAttr2.setString(X.fmtValue(G.class.getOwnNum(attr2,'item')));
            imgAttr2.loadTexture(G.class.getItemIco(attr2),1);
        },
        setyxsl:function(){
            var me = this;
            var panel = me.ui;
            var yfr = panel.finds('panel_yfr');
            var frsl = 0;
            var is = false;
            if(G.frame.yingxiong_fenjie.top.selectedData){
                frsl = G.frame.yingxiong_fenjie.top.selectedData.length;
            }
            me.yfr < frsl ? is = true : is = false;
            me.yfr = frsl;
            var str = L('TFRYXSL')+X.STR('{1}/{2}',frsl,me.extConf.maxnum);
            var rh = new X.bRichText({
                size:22,
                maxWidth:yfr.width,
                lineHeight:32,
                color:'#ffffff',
                family:G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node,'#000000',2);
                },
            });
            rh.text(str);
            rh.setPosition(cc.p(yfr.width / 2 - rh.trueWidth() / 2,yfr.height / 2 - rh.trueHeight() / 2));
            yfr.removeAllChildren();
            yfr.addChild(rh);
            if(is){
                var action1 = cc.scaleTo(0.3, 1.1, 1.1);
                var action2 = cc.scaleTo(0.3, 1, 1);
                var seq = cc.sequence(action1, action2);
                rh.stopAllActions();
                rh.runAction(seq);
            }
        },
        bindBTN: function () {
            var me = this;

            me.ui.finds('btn_xysd').click(function (sender, type) {
                // G.frame.shop.data({type: "1", name: "yxsd"}).show();
                G.frame.shopmain.data('1').show();
            }, 1000);

            X.radio([me.nodes.btn_sjs1, me.nodes.btn_zhyx], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_sjs1$:1,
                    btn_zhyx$:2
                };
                me.changeType(name2type[name]);
            });
            if (cc.sys.isNative) {
                if (G.frame.yingxiong_fenjie.data() && G.frame.yingxiong_fenjie.data().cs) {
                    return me.nodes.btn_zhyx.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
                me.nodes.btn_sjs1.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
            else {
                me.ui.setTimeout(function () {
                    if (G.frame.yingxiong_fenjie.data() && G.frame.yingxiong_fenjie.data().cs) {
                        return me.nodes.btn_zhyx.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    }
                    me.nodes.btn_sjs1.triggerTouch(ccui.Widget.TOUCH_ENDED);
                }, 200);
            }

            me.ui.finds('btn_xysd_0').click(function () {
                G.frame.mjzh.show();
            })
        },
        changeType: function (type) {
            var cont= P.gud.lv < 100 ? 10:20;   //不到100级10个 反之20个 
            this.extConf.maxnum = type == 1 ? cont : 1;
            G.frame.yingxiong_fenjie.type = type;
            G.frame.yingxiong_fenjie.top.changeType(type);
            this.setyxsl();
        },
        onOpen: function () {
            var me = this;
            me.yfr = 0;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            G.class.ani.show({
                json: "ani_jisifazhen",
                addTo: me.nodes.panel_dh,
                x: 100,
                y: -113,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    action.play("in", true);
                    G.frame.yingxiong_fenjie.men = action;
                }
            });

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
        },
    });

})();