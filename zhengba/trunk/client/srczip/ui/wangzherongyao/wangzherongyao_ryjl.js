/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀-荣耀奖励
    var ID = 'wangzherongyao_ryjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUI: function () {
            var me = this;

            X.radio([me.ui.nodes.btn_dld,me.ui.nodes.btn_zss,me.ui.nodes.btn_wzs], function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_dld$: '1',
                    btn_zss$: '2',
                    btn_wzs$: '3',
                };

                me.changeType(name2type[name]);
            });
        },
        bindUI: function () {
            var me = this;

            me.ui.finds('ui').click(function (sender, type) {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUI();
            me.bindUI();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            var btn = [
                "btn_dld",
                "btn_zss",
                "btn_wzs"
            ]

           me.ui.nodes[btn[(me.data() && me.data().tztype ? me.data().tztype : '1') - 1]].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        changeType: function (type) {
            var me = this;

            me.curType = type;
            me.setContents();
        },
        setContents: function() {
            var me = this;

            var panel = me.ui;

            me.ui.finds("bg_jjc").setTouchEnabled(true);

            var scrollview = me.ui.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            var txtIntr = me.ui.nodes.txt_tip;
            txtIntr.setString(L('WZRY_RYJL_' + (me.curType)));

            var prizes = G.class.wangzherongyao.getPrizes();

            var type2name = {
                1:'dld',
                2:'zuanshi',
                3:'wangzhe'
            };

            var table = me.table = new X.TableView(scrollview, panel.nodes.list_rank, 1, function(ui, data) {
                me.setItem(ui, data);
            }, null, null, 0, 2);
            table.setData(prizes[type2name[me.curType]]);
            table.reloadDataWithScroll(true);
        },
        setContents1: function () {
            var me = this;

            var txtIntr = me.ui.nodes.txt_tip;
            txtIntr.setString(L('WZRY_RYJL_' + (me.curType)));

            var prizes = G.class.wangzherongyao.getPrizes();

            var type2name = {
                1:'dld',
                2:'zuanshi',
                3:'wangzhe'
            };
            me.listview.removeAllChildren();

            for(var j=0;j<prizes[type2name[me.curType]].length;j++) {
                var pCnf = prizes[type2name[me.curType]][j];

                var item = me.list.clone();
                item.data = pCnf;
                item.idx = j;
                me.setItem(item);
                me.listview.pushBackCustomItem(item);
                item.show();
            }
            me.listview.jumpToTop();
        },
        setItem: function (item,data) {
            var me = this;

            // var data = item.data;
            var idx = item.idx;

            X.autoInitUI(item);

            var imgBg = item.nodes.bg_list;
            var txtIntr = item.nodes.txt_wzjl;
            var ico = item.nodes.img_wp;
            txtIntr.setString(data.intr);

            X.alignItems(ico,data.p,'left',{
                touch:true,
                scale:0.7,
            });


            // if (idx < 1) {
            //     imgBg.loadTexture('img/public/bg_25.png', 1);
            // } else {
            //     imgBg.loadTexture('img/public/bg_jiugongge24.png', 1);
            // }
        }
    });

    G.frame[ID] = new fun('wangzherongyao_ryjl.json', ID);
})();
