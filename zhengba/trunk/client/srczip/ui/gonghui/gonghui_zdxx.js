/**
 * Created by LYF on 2018/12/5.
 */
(function () {
    //公会-段位宝箱
    var ID = 'gonghui_zdxx';

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
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
            cc.enableScrollBar(me.nodes.listview_zdxx);
        },
        getData: function(callback) {
            var me = this;

            me.ajax("ghcompeting_fightinfo", [], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            for (var i in [me.nodes.btn_jgxx, me.nodes.btn_fsxx]) {
                [me.nodes.btn_jgxx, me.nodes.btn_fsxx][i].click(function (sender) {
                    var type = {
                        btn_jgxx$: "mygh",
                        btn_fsxx$: "rival"
                    };
                    me.changeType(type[sender.getName()]);
                })
            }
            me.nodes.btn_jgxx.triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        changeType: function (type) {
            var me = this;

            me.type = type;

            if(type == "mygh") {
                me.nodes.btn_jgxx.setBright(true);
                me.nodes.btn_jgxx.setTouchEnabled(true);
                me.nodes.btn_jgxx.children[0].setTextColor(cc.color("#7b531a"));

                me.nodes.btn_fsxx.setBright(false);
                me.nodes.btn_fsxx.setTouchEnabled(true);
                me.nodes.btn_fsxx.children[0].setTextColor(cc.color("#6c6c6c"));
            } else {
                me.nodes.btn_fsxx.setBright(true);
                me.nodes.btn_fsxx.setTouchEnabled(true);
                me.nodes.btn_fsxx.children[0].setTextColor(cc.color("#7b531a"));

                me.nodes.btn_jgxx.setBright(false);
                me.nodes.btn_jgxx.setTouchEnabled(true);
                me.nodes.btn_jgxx.children[0].setTextColor(cc.color("#6c6c6c"));
            }

            me.setListView();
        },
        setListView: function () {
            var me = this;
            var data = me.DATA[me.type];
            var listView = me.nodes.listview_zdxx;

            if(data.length < 1) {
                me.ui.finds("img_zw").show();
            } else {
                me.ui.finds("img_zw").hide();
            }

            listView.removeAllChildren();
            for (var i = 0; i < data.length; i ++) {
                listView.pushBackCustomItem(me.setList(data[i]));
            }
        },
        setList: function (data) {
            var me = this;
            var list = me.nodes.list_zdxx.clone();

            X.autoInitUI(list);

            var str = X.STR(L(me.type), data.name, data.rival_name, data.dps) + (data.winside == 0 ?
                (me.type == "mygh" ? X.STR(L(me.type + "_win"), data.jifen) : L(me.type + "_win")) : "");
            var rh = new X.bRichText({
                size: 20,
                lineHeight: 32,
                color: "#f6ebcd",
                family: G.defaultFNT,
                maxWidth: list.nodes.txt_zdxx.width
            });
            rh.text(str);
            rh.setAnchorPoint(0, 1);
            rh.setPosition(0, list.nodes.txt_zdxx.height);
            list.nodes.txt_zdxx.addChild(rh);

            list.nodes.txt_sj.setString(X.timetostr(data.ctime));

            list.show();
            list.finds("pan1").show();

            return list;
        }
    });
    G.frame[ID] = new fun('gonghui_ghzf_zdxx.json', ID);
})();