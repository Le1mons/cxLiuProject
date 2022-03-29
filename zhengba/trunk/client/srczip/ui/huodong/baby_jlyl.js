/**
 * Created by wlx on 2019/12/17.
 */
(function () {
    //挖宝-奖励预览
    var ID = 'baby_jlyl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.initUi();
            me.DATA = me.data();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents: function () {
            var me = this;
            var they = me.DATA;
            var conf = G.gc.wabao.dlz[G.gc.wabao.step[they.myinfo.val - 1]] || [];
            var data = [];

            if (they.myinfo.target) {
                data.push(they.info.target[they.myinfo.target]);
            }
            for (var id in conf) {
                data.push(conf[id]);
            }
            var table = new X.TableView(me.nodes.scrollview, me.nodes.list, 5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 20);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                panel_wj: function (node) {
                    node.setTouchEnabled(false);
                    node.removeAllChildren();
                    var item = G.class.sitem(data.prize, true);
                    G.frame.iteminfo.showItemInfo(item);
                    item.title.hide();
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                },
                txt_ico: function (node) {
                    var haveNum = data.step ? 1 : data.num;
                    var useNum = data.step ? (me.DATA.myinfo.over ? 1 : 0) : (me.DATA.myinfo.gotarr[data.id] || 0);
                    node.setString((haveNum - useNum) + "/" + haveNum);
                }
            }, ui.nodes);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },

    });
    G.frame[ID] = new fun('tanbao_top_jlyl.json', ID);
})();