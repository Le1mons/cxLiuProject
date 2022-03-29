/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //大厅
    var ID = 'gonghui_dating';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.btn_gl.hide();

            var btnArr = [];
            var power = G.frame.gonghui_main.getMyPower();
            btnArr.push(me.nodes.btn_zy,me.nodes.btn_rz);
            if (power <= G.frame.gonghui_main.extConf.power.guanyuan) {
                btnArr.push(me.nodes.btn_gl);
                me.nodes.btn_gl.show();
            }

            me.nodes.btn_zy.setBright(false);
            me.nodes.txt_zy.setTextColor(cc.color('#fffbd8'));

            X.radio(btnArr, function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_zy$:'1',
                    btn_rz$:'2',
                    btn_gl$:'3'
                };

                me.changeType(name2type[name]);
            }, {
                color: ['#fffbd8', '#5b3110'],
                no_enableOutline: true,
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

            // me.nodes.btn_zy.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.changeType(1);
        },
        onHide: function () {
            var me = this;
            if(P.gud.ghid != ""){
                G.frame.gonghui_main.setDTdata();
            }
        },
        changeType: function (type) {
            var me = this;

            if (me.curType == type) return;

            me.curType = type;

            var viewConf = {
                "1": G.class.gonghui_dating_zy,
                "2": G.class.gonghui_dating_rz,
                "3": G.class.gonghui_dating_gl
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
        setContents: function () {
            var me = this;


        },
        getMemberData: function (callback) {
            var me = this;

            G.ajax.send('gonghui_userlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            },true);
        }

    });

    G.frame[ID] = new fun('gonghui_tip1.json', ID);
})();
