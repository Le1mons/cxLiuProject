(function () {
    var ID = 'maze_chooseHero';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = JSON.parse(JSON.stringify(G.frame.maze.DATA.herolist));
            me.setContents()
        },
        setContents: function () {
            var me = this;
            var data = me.initDATA(me.DATA);
            me.nodes.list_tx.setPosition(-100,0);
            if (!me.table) {
                cc.enableScrollBar(me.nodes.scrollview, false);
                me.nodes.list_lb.setTouchEnabled(false);
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_lb, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 5);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        initDATA: function (data) {
            var me = this;
            me.chosoeData = {};
            var _data = [];
            data.forEach(function name(item, idx) {
                me.chosoeData[idx] = 99;
                var obj = {}
                obj.key = idx;
                obj.herolist = item;
                _data.push(obj)
            });
            return _data
        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            for (var i = 0; i < data.herolist.length; i++) {
                var node = ui.nodes["panel_tx" + (i + 1)];
                node.removeAllChildren();
                var clnode = me.nodes.list_tx.clone();
                node.addChild(clnode);
                clnode.setPosition(node.width / 2, node.height / 2);
                X.autoInitUI(clnode);
                var shero = G.class.shero(data.herolist[i]);
                shero.setGou(me.chosoeData[data.key] == i);
                clnode.nodes.txt_mz.setString(data.herolist[i].name);
                clnode.nodes.ico_tx.addChild(shero);
                shero.setPosition(clnode.nodes.ico_tx.width / 2, clnode.nodes.ico_tx.height / 2);
                clnode.nodes.ico_tx.key = i;
                clnode.nodes.ico_tx.setSwallowTouches(false);
                clnode.nodes.ico_tx.click(function (sender) {
                    if (me.chosoeData[data.key] == sender.key) return;
                    me.chosoeData[data.key] = sender.key;
                    me.table.reloadDataWithScroll(false);
                })
            }
        },
        onShow: function () {
            var me = this;
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_qw.click(function (sender) {
                var arr = [];
                for(var k in me.chosoeData){
                    if( me.chosoeData[k] == 99){
                        G.tip_NB.show(L('maze_sw10'))
                        return
                    }
                    arr.push(me.chosoeData[k]);
                }
                G.frame.maze.getSaoDang("herolist",arr,function(){
                    G.tip_NB.show(L("maze_sw13"))
                    me.remove();
                });
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shendianmigong_xzyx.json', ID);
})();