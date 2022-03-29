/**
 * Created by  on 2019/3/30.
 */
(function () {
    //风暴战场-战斗日志
    var ID = 'fbzc_zdrz';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.nodes.text_zdjl, L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            G.ajax.send("storm_getlog", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            });
        },
        show : function(){
            var me = this;
            var _super = this._super;
            me.area = 1;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            new X.bView('fengbaozhanchang_lishijilu.json', function(view) {
                me._view = view;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
            });
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview;
            panel.nodes.list_lb.hide();
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            var data = me.DATA;

            if (data.length < 1) {
                cc.sys.isObjectValid(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.show();
                return;
            } else {
                cc.sys.isObjectValid(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.hide();
            }

            var table = new X.TableView(scrollview, panel.nodes.list_lb, 1, function(ui, data) {
                me.setItem(ui, data);
            }, null, null, 8,10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.img_sl.hide();
            ui.nodes.img_sb.hide();

            if(data.win_uid == P.gud.uid) ui.nodes.img_sl.show();
            if(data.win_uid != P.gud.uid) ui.nodes.img_sb.show();

            var head = G.class.shead(data.headdata);
            head.setAnchorPoint(0.5, 0.5);
            head.setPosition(ui.nodes.panel_tx.width / 2, ui.nodes.panel_tx.height / 2);
            ui.nodes.panel_tx.removeAllChildren();
            ui.nodes.panel_tx.addChild(head);
            ui.nodes.text_sj.setString(X.timetostr(data.ctime));

            ui.nodes.text_xinxi.setTouchEnabled(false);
            X.setRichText({
                str: data.desc,
                parent: ui.nodes.text_xinxi,
                anchor: {x: 0, y: 1},
                pos: {x: 0, y: ui.nodes.text_xinxi.height},
                size: 20
            });
        }
    });
    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();