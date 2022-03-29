/**
 * Created by LYF on 2018/12/5.
 */
(function () {
    //公会-排名奖励
    var ID = 'gonghui_pmjl';

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

            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS7")
                }).show();
            });

            X.radio([me.nodes.btn_wzpm, me.nodes.btn_sjjl], function (sender) {
                var type = {
                    btn_wzpm$: 1,
                    btn_sjjl$: 2
                };
                me.changeType(type[sender.getName()]);
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

            me.panles = {};
            if(G.frame.gonghui_zhengfeng.DATA.hadking) {
                me.nodes.btn_wzpm.triggerTouch(ccui.Widget.TOUCH_ENDED);
            } else {
                me.nodes.btn_sjjl.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }

        },
        onHide: function () {
            var me = this;
        },
        changeType: function (type) {
            var me = this;
            var view = {
                2: G.class.wzpm,
                1: G.class.sjjl
            };

            for (var i in me.panles) {
                me.panles[i].hide();
            }

            if(!me.panles[type]) {
                me.panles[type] = new view[type];
                me.nodes.panel_nr.addChild(me.panles[type]);
            } else {
                me.panles[type].show();
            }
        }
    });
    G.frame[ID] = new fun('gonghui_ghzf_bg.json', ID);
})();

(function () {
    G.class.wzpm = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("gonghui_ghzf_wzpm.json");
        },
        setData: function(conf) {
            var arr = [];
            var keys = X.keysOfObject(conf);

            keys.sort(function (a, b) {
                return a > b ? -1 : 1;
            });

            for (var i = 0; i < keys.length; i ++) {
                for (var j = 0; j < conf[keys[i]].length; j ++) {
                    var con = conf[keys[i]][j];
                    con.push(keys[i]);
                    arr.push(con);
                }
            }

            return arr;
        },
        onShow: function () {
            var me = this;
            var conf = G.class.getConf("gonghuizhengfeng").base.season_prize;
            var data = me.setData(conf);

            cc.enableScrollBar(me.nodes.scrollview);

            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            X.autoInitUI(ui);

            X.alignItems(ui.nodes.img_wp, data[1], "left", {
                touch: true,
                scale: .6
            });

            var info = data[2] == 4 ? (data[0][1] >= 201 ?
                X.STR(L("GHZ_QB"), data[0][0]) :
                (data[0][0] == data[0][1] ? X.STR(L("GHZ_PMJL"), L("DI") + data[0][0]) : X.STR(L("GHZ_PMJL"),data[0][0] + "-" + data[0][1]))) :
                X.STR(L("GHZ_YH"), L("QB"));
            var str = L("GHZ_DW" + data[2]) + info;

            ui.nodes.txt_wzjl.setString(str);

            ui.show();
        }
    });
})();

(function () {
    G.class.sjjl = X.bView.extend({
        ctor: function () {
            var me = this;
            me._super("gonghui_ghzf_sjjl.json");
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            })
        },
        getData: function (callback) {
            var me = this;

            me.ajax("rank_open", [18], function (str, data) {
                if(data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
        setContents: function () {
            var me = this;

            me.setPlayer();
            me.setTable();
        },
        setPlayer: function () {
            var me = this;

            me.nodes.txt_dw.setString(L("GHZ_DW" + G.frame.gonghui_zhengfeng.DATA.segmentdata.segment));
            if(me.DATA.myrank > 0) {
                me.ui.finds("txt_level_0").setString(me.DATA.myrank);
            } else {
                me.ui.finds("txt_level_0").setString(L("WRWZ"));
            }
        },
        setTable: function () {
            var me = this;

            if(me.DATA.ranklist.length < 1) {
                me.nodes.img_zwnr.show();
            } else {
                me.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < me.DATA.ranklist.length; i ++) {
                me.DATA.ranklist[i].rank = i + 1;
            }

            var data = me.DATA.ranklist;
            var table = new X.TableView(me.nodes.scrollview, me.nodes.list_sjjl, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            ui.setName("ui_" + data.rank);
            X.autoInitUI(ui);
            ui.nodes.panel_tx.setScale(.6);
            ui.nodes.panel_tx.setBackGroundImage(G.class.gonghui.getFlagImgById(data.flag), 1);
            ui.nodes.txt_name.setString(data.name);
            if(P.gud.ghname == data.name) {
                ui.nodes.txt_name.setTextColor(cc.color("#25891c"));
            } else {
                ui.nodes.txt_name.setTextColor(cc.color("#804326"));
            }
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
        }
    });
})();