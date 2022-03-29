/**
 * Created by lsm on 2018/7/7.
 */
(function () {
    //设置
    var ID = 'setting';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            var btns = me.btns;
            X.radio(btns, function (sender) {
                var name = sender.getName();
                var name2type = {
                    0:0,
                    1:1,
                    2:2,
                    3:3,
                };
                me.changeType(name2type[name]);
            });
        },
        bindBtn: function () {
            var me = this;
			
            me.ui.nodes.mask.click(function(){
                //X.cache('music',X.audio.getMusicVolume()*100);
                //X.cache('effect',X.audio.getEffectsVolume()*100);
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initTop();
            me.initUi();
            me.bindBtn();
        },
        initTop:function(){
            var me = this;
            var listview = me.nodes.listview;
            me.btns = [];
            var conf = {
                0:L("WANJIA"),
                1:L('XuanXing'),
                2:L('BangZhu'),
                3:L('FanKui')
            };
            if(G.tiShenIng && cc.sys.os == cc.sys.OS_IOS) {
                conf = {
                    0:L("WANJIA"),
                    1:L('XuanXing'),
                    3:L('FanKui')
                };
            }
            for(var i in conf){
                var list = me.nodes.list.clone();
                setitme(list,conf[i],i);
                listview.pushBackCustomItem(list);
            }
            function setitme(ui,data,idx){
                X.autoInitUI(ui);
                ui.nodes.txt_name.setString(data);
                ui.nodes.btn_1.setName(i);
                ui.setTouchEnabled(true);
                ui.setSwallowTouches(false);
                ui.show();
                me.btns.push(ui.nodes.btn_1);
            }
            for(var i = 0; i < me.btns.length; i ++){
                me.btns[i].getChildren()[0].setTextColor(cc.color("#FFE8C0"));
                X.enableOutline(me.btns[i].getChildren()[0], "#2A1C0F", 2);
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var type = (me.data() && me.data().tztype) || 1;
            if(type == 1){
                me.btns[0].triggerTouch(ccui.Widget.TOUCH_ENDED)
            }else{
                me.changeType(type);  
            }
        },
        onHide: function () {
            var me = this;
        },
        
        setContents: function () {
            var me = this;

        },
        getData: function(callback, errCall) {
            var me = this;
            G.ajax.send('friend_open', [], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                } else {
                    errCall && errCall();
                }
            }, true);
        },
        changeType: function (type) {
            var me = this;

            if (me.curType && me.curType == type) {
                return;
            }

            me.curType = type;

            var viewConf = {
                "0": G.class.setting_player,
                "1": G.class.setting_options,
                "2": G.class.setting_help,
                "3": G.class.setting_feedback,
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

    G.frame[ID] = new fun('setting.json', ID);
})();