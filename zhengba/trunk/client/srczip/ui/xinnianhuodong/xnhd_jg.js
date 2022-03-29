/**
 * Created by
 */
(function () {
    //
    var ID = 'xnhd_jg';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        goToTop: function () {
            this.ui.zIndex = G.frame.xnhd.ui.zIndex + 2;
            this.ui.logicZindex = this.ui.zIndex;
            G.openingFrame[this.ID()] = this.ui.zIndex;
        },
        onOpen: function () {
            var me = this;
            me.action.gotoFrameAndPause(15);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });

            X.radio([me.nodes.btn_jjxs, me.nodes.btn_ttxs], function (sender) {
                me.setTable({
                    btn_jjxs$: 'win',
                    btn_ttxs$: 'lose'
                }[sender.getName()]);
            });
            me.nodes.txt_djgb.hide();
            me.nodes.txt_title.setString(L(me.data().title) + L("JGGS"));
        },
        onShow: function () {
            var me = this;

            me.nodes.btn_jjxs.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        setTable: function (type) {
            var me = this;
            var data = me.data().data[type];

            data.sort(function (a, b) {
                return a.num > b.num ? -1 : 1;
            });
            me.maxNum = data[0].num;
            me.nodes.scrollview.removeAllChildren();
            var table = new X.TableView(me.nodes.scrollview, type == 'win' ? me.nodes.list_lb1 : me.nodes.list_lb2, 1, function (ui, data, pos) {
                me[type + 'Item'](ui, data, pos[0]);
            });
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        winItem: function (ui, data, pos) {
            var me = this;
            var conf = G.frame.xnhd.plObj[data.plid];

            X.autoInitUI(ui);
            X.render({
                sz_phb: pos + 1,
                text_ps: data.num + L("PIAO"),
                img_jdt: (data.num / me.maxNum * 100) || 0,
                text_mz: conf.name,
                panel_tx: function (node) {
                    var hero = G.class.shero(conf);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(hero);
                },
                panel_pm: function (node) {
                    node.setVisible(pos < 3);
                    pos < 3 && node.setBackGroundImage('img/public/img_paihangbang_' + (pos + 1) + '.png', 1);
                    ui.nodes.sz_phb.setVisible(pos > 2);
                }
            }, ui.nodes);
            ui.setTouchEnabled(false);
        },
        loseItem: function (ui, data) {
            var me = this;
            var conf = G.frame.xnhd.plObj[data.plid];

            X.autoInitUI(ui);
            X.render({
                panel_tx2: function (node) {
                    var hero = G.class.shero(conf);
                    hero.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(hero);
                },
                text_mz2: conf.name,
                text_ps2: data.num + L("PIAO")
            }, ui.nodes);
            ui.setTouchEnabled(false);
        }
    });
    G.frame[ID] = new fun('xinnianhuodong_tip_hxjg.json', ID);
})();