/**
 * Created by LYF on 2018/12/5.
 */
(function () {
    //公会-赛区排行
    var ID = 'gonghui_sqph';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("GHZ_DW" + me.DATA.segment) + L("ZPM"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;


            me.bindBtn();
            me.fillSize();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView("gonghui_ghzfpm.json", function (node) {
                me.view = node;
                me.nodes.panel_nr.addChild(node);
                cc.enableScrollBar(me.view.nodes.scrollview);
                me.getData(function () {
                    me.setContents();
                    me.initUi();
                });
            });
        },
        getData: function (callback) {
            var me = this;

            me.ajax("rank_open", [19], function (str, data) {
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

            me.setTable();
        },
        setPlayer: function () {
            var me = this;

            if(me.DATA.segment == 4) {
                me.view.nodes.txt_dw.setString(L("GHZ_DW" + me.DATA.segment) + L("ZU"));
            } else {
                me.view.nodes.txt_dw.setString(L("GHZ_DW" + me.DATA.segment) + L("JJ_" + me.state));
            }
            me.view.finds("txt_level_0").setString(me.DATA.myrank);
        },
        setTable: function () {
            var me = this;
            var data = me.DATA.ranklist;

            if(me.DATA.ranklist.length < 1) {
                me.view.nodes.img_zwnr.show();
            } else {
                me.view.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < data.length; i ++) {
                data[i].rank = i + 1;
            }
            var state = 1;
            var conf  = G.class.getConf("gonghuizhengfeng").base.segment[me.DATA.segment].jinji;

            for (var i = 0; i < conf.length; i ++) {
                if(conf[i].length > 0) {
                    for (var j in data) {
                        if (data[j].rank >= conf[i][0] && data[j].rank <= conf[i][1]) {
                            data[j].state = state;
                            if(data[j].name == P.gud.ghname) {
                                me.state = state;
                            }
                        }
                    }
                }
                state --;
            }

            me.setPlayer();

            var table = new X.TableView(me.view.nodes.scrollview, me.view.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            X.autoInitUI(ui);
            ui.show();
            ui.nodes.panel_tx.setScale(.6);
            ui.nodes.panel_tx.setBackGroundImage(G.class.gonghui.getFlagImgById(data.flag), 1);
            ui.nodes.txt_name.setString(data.name);
            ui.nodes.txt_number.setString(data.jifen);
            ui.nodes.text_zdl2.setString(data.zhanli);
            ui.nodes.sz_phb.setString(data.rank);
            if(data.rank > 3) {
                ui.nodes.img_rank.hide();
                ui.nodes.sz_phb.show();
            }else {
                ui.nodes.img_rank.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png', 1);
                ui.nodes.img_rank.show();
                ui.nodes.sz_phb.hide();
            }
            if(me.DATA.segment == 4) {
                ui.nodes.panel_qw.hide();
            }
            if(data.state == 1) {
                ui.nodes.panel_qw.setBackGroundImage("img/gonghui/img_ghzf_jjq.png", 1);
            } else if(data.state == 0) {
                ui.nodes.panel_qw.setBackGroundImage("img/gonghui/img_ghzf_bjq.png", 1);
            } else {
                ui.nodes.panel_qw.setBackGroundImage("img/gonghui/img_ghzf_jjq1.png", 1);
            }
        }
    });
    G.frame[ID] = new fun('gonghui_tip2.json', ID);
})();