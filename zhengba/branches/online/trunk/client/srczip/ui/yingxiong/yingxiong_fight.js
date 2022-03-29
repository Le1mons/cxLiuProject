/**
 * Created by wfq on 2018/6/5.
 */
(function () {
    //英雄-出战
    var ID = 'yingxiong_fight';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
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
        onAniShow: function () {
            var me = this;
			G.guidevent.emit('yingxiong_fightOpenOver');
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            me.setContents();

            var mask = me.mask = new ccui.Layout;
            mask.setContentSize(cc.director.getWinSize());
            mask.setTouchEnabled(true);
            mask.setAnchorPoint(0, 0);
            me.ui.finds("panel_ui").addChild(mask);
            me.mask.hide();
        },
        onHide: function () {
            var me = this;
            me.top.selectedData = [];
        },
        setContents: function () {
            var me = this;
            me.ui.finds('panel_tip').finds('txt_djgb').show();
            me.setBottom();
            me.setTop();
        },
        setTop: function () {
            var me = this;

            if (!me.top) {
                me.top = new G.class.yingxiong_kaizhan('fight');
                me.nodes.panel_nr2.removeAllChildren();
                me.nodes.panel_nr2.addChild(me.top);
            } else {
                me.top.refreshPanel();
            }
        },
        setBottom: function () {
            var me = this;

            if (!me.bottom) {
                me.bottom = new G.class.yingxiong_zhongzu_xuanze('fight');
                me.nodes.panel_nr1.removeAllChildren();
                me.nodes.panel_nr1.addChild(me.bottom);
            } else {
                me.bottom.refreshPanel();
            }
			me.ui.setTimeout(function(){
				G.guidevent.emit('yingxiong_zhongzu_xuanze_over');
			},300);
        },
        playAniMove: function (node) {
            var me = this;
            me.mask.show();
            var posSz = G.frame.yingxiong_fight.posSz;
            var posSelect = G.frame.yingxiong_fight.posSelect;
            var type = G.frame.yingxiong_fight.playAniType;

            var posEnd;
            if (type == 'remove') {
                posEnd = posSelect || cc.p(310,800);
            } else {
                posEnd = posSz;
            }

            cc.isNode(me.item) && me.item.runActions([
                cc.moveTo(0.2, posEnd),
                cc.callFunc(function () {
                    cc.isNode(me.item) && me.item.removeFromParent();
                    me.mask.hide();
                    cc.callLater(function(){
                    	G.guidevent.emit('yingxiong_fight_playAniMove_over');
                    });
                })
            ]);
        }
    });

    G.frame[ID] = new fun('ui_tip3.json', ID);
})();