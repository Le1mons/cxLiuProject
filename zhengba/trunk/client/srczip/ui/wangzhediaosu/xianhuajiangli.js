/**
 * Created by LYF on 2019/2/18.
 */
(function () {
    //鲜花奖励
    var ID = 'xianhuajiangli';

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
            });
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
            me.prizeArr = G.frame.wangzhediaosu.DATA.reclist;
            me.setContents();
            cc.enableScrollBar(me.nodes.scrollview);
        },
        onHide: function () {
            var me = this;

            G.frame.wangzhediaosu.checkRedPoint();
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.wangzherongyao.num2prize;
            var data = [];

            for (var i in conf) {
                var d = [];
                d.push(i);
                d.push(conf[i]);
                data.push(d);
            }

            var table = me.table = new X.TableView(me.nodes.scrollview,me.ui.finds("list_nr"),1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,1,3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.show();

            ui.nodes.txt_name.setString(X.STR(L("SDXH"), data[0]));
            ui.nodes.sz_zdl.setString("(" + G.frame.wangzhediaosu.DATA.num + "/" + data[0] + ")");

            X.alignItems(ui.nodes.panel_jl, data[1], "left", {
                touch: true,
                scale: .7
            });

            if(!X.inArray(me.prizeArr,  data[0]) && G.frame.wangzhediaosu.DATA.num >= parseInt(data[0])) {
                ui.nodes.btn_lq.setEnableState(true);
                ui.nodes.txt_lq.setTextColor(cc.color("#2f5719"));
            } else {
                ui.nodes.btn_lq.setEnableState(false);
                ui.nodes.txt_lq.setTextColor(cc.color("#6c6c6c"));
            }

            if (X.inArray(me.prizeArr,  data[0])) {
                ui.nodes.txt_lq.setString(L("YLQ"));
            } else {
                ui.nodes.txt_lq.setString(L("LQ"));
            }

            ui.nodes.btn_lq.click(function (sender) {

                me.ajax("wzstatue_recprize", [data[0]], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.prizeArr.push(parseInt(data[0]));
                        G.frame.wangzhediaosu.getData();
                        sender.setEnableState(false);
                        sender.children[0].setTextColor(cc.color("#6c6c6c"));
                        sender.children[0].setString(L("YLQ"));
                    }
                });
            }, 500);
        }
    });
    G.frame[ID] = new fun('gonghui_tip2_xhjl.json', ID);
})();