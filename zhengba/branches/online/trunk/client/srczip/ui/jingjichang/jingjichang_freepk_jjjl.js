/**
 * Created by wfq on 2018/6/21.
 */
(function () {
    //竞技场-自由竞技-竞技奖励
    var ID = 'jingjichang_freepk_jjjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.btn_zyjj.finds('text_zzjjc$').setString(L('PMJL'));
            me.nodes.btn_phb.finds('text_zzjjc$').setString(L('SJJL'));
            X.radio([me.nodes.btn_zyjj,me.nodes.btn_phb], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_zyjj$:1,
                    btn_phb$:2
                };

                me.changeType(name2type[name]);
            });
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
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        changeType: function (type) {
            var me = this;

            if (me.curType && me.curType == type) {
                return;
            }

            me.curType = type;

            var viewConf = {
                "1": G.class.jingjichang_pmjl,
                "2": G.class.jingjichang_sjjl,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                if (cc.isNode(me._panels[_type])) {
                    me._panels[_type].removeFromParent();
                    delete me._panels[_type];
                }
            }

            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].show();
        },
    });

    G.frame[ID] = new fun('jingjichang_bg2.json', ID);
})();