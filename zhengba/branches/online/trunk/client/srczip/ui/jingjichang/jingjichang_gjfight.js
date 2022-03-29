/**
 * Created by lsm on 2018/6/23
 */
(function() {
    //英雄-出战
    var ID = 'jingjichang_gjfight';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function() {
            var me = this;

            if(G.frame.jingjichang_guanjunshilian.isShow) {
                if (me.DATA && me.DATA.type == 'defend') {
                    setPanelTitle(me.ui.nodes.txt_title, L('UI_TITLE_' + me.ID() + '_defend'));
                } else {
                    setPanelTitle(me.ui.nodes.txt_title, L('UI_TITLE_' + me.ID()));
                }
            } else {
                if(me.DATA.def) {
                    setPanelTitle(me.ui.nodes.txt_title, L("GHZX"));
                }else if(me.DATA.type == "pvwz"){
                    setPanelTitle(me.ui.nodes.txt_title, L("UI_TITLE_jingjichang_gjfight"));
                }
            }

        },
        bindBtn: function() {
            var me = this;

            me.ui.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.DATA = me.data();
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function() {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("artifact_open", [], function (d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    G.DATA.artifact = d.d.artifact;
                    callback && callback();
                }
            });
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function() {
            var me = this;

            me.setContents();
        },
        onHide: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;
            me.ui.finds('panel_tip').finds('txt_djgb').hide();
            me.setBottom();
            me.setXia();
        },
        setXia: function() {
            var me = this;

            if (!me.top) {
                me.top = new G.class.jingjichang_gjkaizhan('fight');
                me.nodes.panel_nr2.removeAllChildren();
                me.nodes.panel_nr2.addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function() {
            var me = this;

            if (!me.bottom) {
                me.bottom = new G.class.jingjichang_gjxuanzhe('fight');
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
        }
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();