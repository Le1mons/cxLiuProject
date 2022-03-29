/**
 * Created by LYF on 2018/6/27.
 */
(function () {
    //任务 & 成就
    var ID = 'renwu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
            // me.preLoadRes = ["jingjichang.png", "jingjichang.plist"];
        },
        initUi: function () {
            var me = this;
            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('renwu'))
            });
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender, type) {
                me.remove();
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
            me.type = me.data().type;

            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.topMenu.changeMenu(me.type);
            me.checkRedPoint();
        },
        changeType: function(sender) {
            var me = this;
            var type = sender.data.id;
            me.type = type;

            if(sender.disable) {
                G.tip_NB.show(sender.show);
                return;
            }
            me.setPanel(me.type);
        },
        setPanel:function(type){
            var me = this;
            var viewConf = {
                "1":G.class.renwu_same,
                "2":G.class.renwu_same,
                "3":G.class.renwu_funny,//趣味成就
            };
            var panel = new viewConf[type](me.type);
            me.ui.finds("p_nr").addChild(panel);
            if(me.panle) me.panle.removeFromParent();
            me.panle = panel;
        },
        setContents:function(){
            var me = this;
            me.setPanel(me.type);
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("task_open", [me.type], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },


        checkRedPoint: function() {
            var me = this;
            var tag = ["dailytask", "succtask", "qwcj"];
            var isHave = [false, false];
            var data = G.DATA.hongdian;

            for(var i in tag) {
                if(data[tag[i]] > 0) {
                    isHave[i] = true;
                }
            }

            for(var i = 0; i < me.nodes.listview.getChildren().length; i ++) {
                var ch = me.nodes.listview.getChildren()[i];
                if(isHave[i] > 0) {
                    G.setNewIcoImg(ch);
                    ch.getChildByName("redPoint").setPosition(108, 60);
                }else {
                    G.removeNewIco(ch);
                }
            }

        },
        onHide: function () {
            var me = this;
            var tag = ["succtask", "dailytask", "qwcj"];
            me.event.emit('hide');
            G.hongdian.getData(tag, 1);
        },
    });
    G.frame[ID] = new fun('ui_tip10.json', ID);
})();