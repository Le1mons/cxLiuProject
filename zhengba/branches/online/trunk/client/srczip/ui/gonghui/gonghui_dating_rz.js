/**
 * Created by wfq on 2018/6/25.
 */
(function () {
    //公会-大厅-日志
    G.class.gonghui_dating_rz = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('gonghui_sqlb.json');
        },
        refreshPanel: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            cc.enableScrollBar(me.nodes.scrollview);
            me.bindBTN();
        },
        onShow: function () {
            var me = this;

            me.refreshPanel();
        },
        onRemove: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     list:[
            //         {ctype:1,args:['w'],ctime:G.time - 10}
            //     ]
            // };
            // callback && callback();

            G.ajax.send('gonghui_loglist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            },true);
        },
        setContents: function () {
            var me = this;

            var panel = me;
            var scrollview = me.nodes.scrollview;
            scrollview.removeAllChildren();
            var listview = me.nodes.listview;
            cc.enableScrollBar(listview);
            cc.enableScrollBar(scrollview);

            var data = me.DATA.list;

            if (data.length < 1) {
                cc.isNode(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.show();
                return;
            } else {
                cc.isNode(panel.nodes.img_zwnr) && panel.nodes.img_zwnr.hide();
            }

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_lb2,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,8);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);

            ui.setTouchEnabled(false);
            X.render({
                txt_join_year1: X.timetostr(data.ctime,'y-m-d'),
                txt_join_time2: X.timetostr(data.ctime,'h:mm'),
                txt_content: function (node) {
                    node.setTouchEnabled(false);
                    var conf = G.class.gonghui.getRizhiConfById(data.ctype);
                    var str = X.STR(conf.intr,data.args);
                    var rh = new X.bRichText({
                        size:18,
                        maxWidth:node.width,
                        lineHeight:32,
                        color:G.gc.COLOR.n4,
                        family:G.defaultFNT
                    });
                    rh.text(str);
                    rh.setPosition(cc.p(0,node.height - rh.trueHeight()));
                    node.removeAllChildren();
                    node.addChild(rh);
                }
            },ui.nodes);
        }
    });

})();