/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-列表界面
    var ID = 'gonghui_list';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me._super(json, id,{action:true});
            me.preLoadRes = ['jingjichang.plist','jingjichang.png'];
        },
        initUi: function () {
            var me = this;

            X.render({
                btn_zyjj: function (node) {
                    node.finds('text_zzjjc$').setString(L('LIEBAO'));
                    node.finds('img_zyjjc$').loadTexture('img/jingjichang/img_jjc_pmjl.png',1);

                },
                btn_phb:function (node) {
                    node.finds('text_zzjjc$').setString(L('CHUANGJIAN'));
                    node.finds('img_zyjjc$').loadTexture('img/gonghui/img_gonghui_jlgh.png',1);
                }
            },me.nodes);
            X.radio([me.nodes.btn_zyjj,me.nodes.btn_phb], function (sender) {
                var name = sender.getName();
                var name2type = {
                    btn_zyjj$:1,
                    btn_phb$:2
                };

                me.changeType(name2type[name]);
            });

            me.ui.finds("bg2").setBackGroundImage("img/bg/bg_gonghui22.png", 0);
        },
        bindBtn: function () {
            var me = this;

            //返回
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                    G.removeNewIco(G.view.mainMenu.nodes.btn_haoyou);
                    G.view.mainMenu.checkGonghuiRed();
                    G.view.mainMenu.set_fhzc(3);
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
        // setContents: function () {
        //     var me = this;
        //
        //
        // },
        changeType: function (type) {
            var me = this;

            if (me.curType && me.curType == type) {
                return;
            }

            me.curType = type;

            var viewConf = {
                "1": G.class.gonghui_ghph,
                "2": G.class.gonghui_create,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
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