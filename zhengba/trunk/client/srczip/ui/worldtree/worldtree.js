/**
 * Created by wfq on 2018/6/8.
 */
(function () {
    //世界树
    var ID = 'worldtree';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            // 返回
            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            //帮助
            me.nodes.btn_bz.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.help.data({
                        intr:L('TS5')
                    }).show();
                }
            });

            X.radio([me.nodes.btn_sjs1,me.nodes.btn_zhyx], function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_sjs1$:1,
                    btn_zhyx$:2
                };

                me.changeType(name2type[name]);
            });

            me.ui.finds("btn_shijieshushangdian").click(function () {
                // G.frame.worldtree_shop.show();
                G.frame.shopmain.data('8').show();
            })
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
        show : function(conf){
        	var me = this;
        	var _super = this._super;
        	this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            // me.showMainMenu();
            me.showToper();

            var type = me.curType || (me.data() && me.data().tztype) || 1;
            //me.getData(function () {
                me.nodes[['','btn_sjs1','btn_zhyx'][type * 1]].triggerTouch(ccui.Widget.TOUCH_ENDED);
            //});
            me.setContents();
            X.audio.playEffect("sound/openworldtree.mp3");
        },
        onHide: function () {
            var me = this;
            me.event.emit('hide');
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send('worldtree_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        changeType: function (type) {
            var me = this;

            if (me.curType && me.curType == type) {
                return;
            }

            me.curType = type;
            if(type == 1) {
                me.ui.finds("text_ms").hide();
                me.ui.finds("Image_17").hide();
            }else {
                me.ui.finds("text_ms").hide();
                me.ui.finds("Image_17").hide();
            }

            var viewConf = {
                "1": G.class.worldtree_tree,
                "2": G.class.worldtree_hero,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
                // me.ui.finds('panel_1').addChild(me._panels[type]);
            }
            me._panels[type].show();
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();
        },
        //设置基础信息
        setBaseInfo: function () {
            var me = this;

            var panel = me.ui;
            var txtAttr1 = panel.nodes.text_gssl;
            var txtAttr2 = panel.nodes.text_jhsl;

            var need1 = G.class.worldtree.get().base.callneed[0];
            txtAttr1.setString(G.class.getOwnNum(need1.t,need1.a));
            var need2 = G.class.worldtree.get().base.swapneed['4'][0];
            txtAttr2.setString(G.class.getOwnNum(need2.t,need2.a));
            panel.nodes.text_jiejin.setString(G.class.getOwnNum(2020, "item"))
        }
    });

    G.frame[ID] = new fun('shijieshu.json', ID);
})();