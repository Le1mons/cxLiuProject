/**
 * Created by LYF on 2018/10/19.
 */
(function () {
    //公会-领奖记录
    var ID = 'gonghui_getinfo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.DATA = me.data();
            cc.enableScrollBar(me.nodes.listview_1);
            cc.enableScrollBar(me.nodes.scrollview_);
            me.nodes.scrollview_.hide();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var tx = me.ui.finds("ico_tx");

            var head = G.class.shead(me.DATA.buyer);
            head.setPosition(tx.width / 2, tx.height / 2);
            tx.addChild(head);

            me.nodes.txt_js.setString(me.DATA.buyer.name);
            me.ui.finds("txt_lqwz").setString(L("YLQ") + " " + me.DATA.reclist.length + "/" +10);

            for (var i = 0; i < me.DATA.reclist.length; i ++) {
                if(me.DATA.reclist[i].uid == P.gud.uid){
                    me.nodes.listview_1.pushBackCustomItem(me.setItem(me.DATA.reclist[i], me.DATA.prizelist[i], me.DATA.timelist[i]));
                }
            }
            for (var i = 0; i < me.DATA.reclist.length; i++) {
                if (me.DATA.reclist[i].uid != P.gud.uid) {
                    me.nodes.listview_1.pushBackCustomItem(me.setItem(me.DATA.reclist[i], me.DATA.prizelist[i], me.DATA.timelist[i]));
                }
            }
        },
        setItem: function (data, atn, times) {
            var me = this;
            var list = me.nodes.list_flag.clone();
            X.autoInitUI(list);

            var tx = list.nodes.panel_tx;
            var name = list.finds("txt_name");
            var time = list.finds("txt_sj");
            var item = list.finds("ico_wp");

            var head = G.class.shead(data);
            head.setScale(.5);
            head.setPosition(tx.width / 2, tx.height / 2);
            tx.addChild(head);

            name.setString(data.name);
            if(data.uid == P.gud.uid) {
                name.setTextColor(cc.color("#c80000"));
            }

            time.setString(X.timetostr(times));

            var prize = G.class.sitem(atn);
            prize.setScale(.5);
            prize.setPosition(item.width / 2, item.height / 2);
            item.addChild(prize);

            list.show();
            return list;
        }
    });
    G.frame[ID] = new fun('gonghui_top_bx.json', ID);
})();