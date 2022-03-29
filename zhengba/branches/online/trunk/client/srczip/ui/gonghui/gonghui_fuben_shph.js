/**
 * Created by wfq on 2018/6/27.
 */
(function () {
    //公会-副本-伤害排行
    var ID = 'gonghui_fuben_shph';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            setPanelTitle(me.nodes.text_zdjl, L('UI_TITLE_SHPH'));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
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

            new X.bView('gonghui_shph.json', function (view) {
                me._view = view;

                me.nodes.panel_nr.removeAllChildren();
                me.nodes.panel_nr.addChild(view);
                me._view.nodes.panel_show.hide();
                me.initUi();
                me.bindBtn();

                me.getData(function () {
                    me.setContents();
                });
            });
        },
        onHide: function () {
            var me = this;
        },
        getData: function (callback) {
            var me = this;

            // me.DATA = {
            //     ranklist:[
            //         {maxzhanli:10000,dps:1000000,showhead:P.gud,prize:[{a:'attr',t:'rmbmoney',n:100}]}
            //     ]
            // };
            // callback && callback();

            G.ajax.send('gonghuifuben_fbdata', [me.data().fbid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        setContents: function () {
            var me = this;

            me.setTable();
            me.setMyRank();
        },
        setTable: function () {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview_rank;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);

            //高度自适应调整
            panel.nodes.panel_listview.height = 615;
            ccui.helper.doLayout(panel.nodes.panel_listview);

            panel.nodes.panel_listview.show();

            var data = [].concat(me.DATA.ranklist);

            if (data.length < 1) {
                panel.nodes.img_zwnr.show();
                return;
            } else {
                panel.nodes.img_zwnr.hide();
            }

            for (var i = 0; i < data.length; i++) {
                var dd = data[i];
                dd.rank = i + 1;
                if (i == 0) {
                    me.maxAtk = dd.dps;
                }
            }

            var table = me.table = new X.TableView(scrollview,panel.nodes.list_rank1,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem: function (ui, data) {
            var me = this;

            ui.setTouchEnabled(false);

            X.autoInitUI(ui);
            X.render({
                panel_tx: function (node) {
                    var wid = G.class.shead(data.showhead);
                    wid.setPosition(cc.p(node.width / 2,node.height / 2));
                    node.removeAllChildren();
                    node.addChild(wid);
                    wid.setTouchEnabled(true);
                    wid.data = data;
                    wid.click(function (sender, type) {
                        G.frame.wanjiaxinxi.data({
                            pvType: 'zypkjjc',
                            uid: sender.data.showhead.uid,
                        }).checkShow();
                    })
                },
                txt_player_name:data.showhead.name,
                panel_jdt: function (node) {
                    node.show();

                },
                img_jdt: function (node) {
                    node.setPercent(Math.floor(data.dps / me.maxAtk * 100));
                    X.enableOutline(ui.finds('txt_time$'),'#66370e',2);
                },
                // txt_time:Math.floor(data.dps / me.maxAtk * 100) + '%',
                txt_time:X.fmtValue(data.dps),
                //排名
                wz_fnt: function (node) {
                    node.hide();
                    if (data.rank > 3) {
                        node.setString(data.rank);
                        node.show();
                    }
                },
                panel_pm: function (node) {
                    node.hide();
                    if (data.rank < 4) {
                        node.setBackGroundImage('img/public/img_paihangbang_' + data.rank + '.png',1);
                        node.show();
                    }
                },
                ico_item: function (node) {
                    node.hide();
                },
                panel_item: function (node) {
                    node.show();
                    node.setTouchEnabled(false);

                    var prize = G.class.gonghui.getPMPrizeByRank(me.data().fbid,data.rank);
                    X.alignItems(node,prize,'left',{
                        touch:true,
                        scale:0.8
                    })
                }
            },ui.nodes);
        },
        setMyRank: function () {
            var me = this;
            var is = false;
            var wsb = me._view.finds("wsb_player");
            var rank = me._view.nodes.fnt_player;
            var dps = me._view.finds("txt_level_0");
            var data = me.DATA.ranklist;

            for(var i = 0; i < data.length; i ++) {
                if(data[i].showhead.uid == P.gud.uid) {
                    rank.setString(i + 1);
                    dps.setString(X.fmtValue(data[i].dps));
                    is = true;
                    break;
                }
            }

            if(!is) {
                rank.hide();
                wsb.show();
            }
        }
    });

    G.frame[ID] = new fun('jingjichang_bg3.json', ID);
})();