/**
 * Created by yaosong on 2018/12/28.
 */
(function() {
    //王者荣耀-乱斗排行
    var ID = 'wangzherongyao_dld_ph';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('wangzhe_getdldrank', [], function(data) {
                if (!data) return;
                var data = X.toJSON(data);
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            }, true);


        },
        initUI: function() {
            var me = this;

            me.nodes.tip_title.setString(L(ID));
        },
        bindUI: function() {
            var me = this;

            me.ui.nodes.mask.touch(function(sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function() {
            var me = this;
            me.fillSize();

            me.initUI();
            me.bindUI();
        },
        onAniShow: function() {
            var me = this;
        },
        onShow: function() {
            var me = this;
            new X.bView('wangzherongyao_ldph.json', function(view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.addChild(view);
                view.setTouchEnabled(true);

                me.scrollview = view.nodes.scrollview;
                cc.enableScrollBar(me.scrollview);
                me.list = view.nodes.list_sjjl;
                me.list.hide();

                me.getData(function() {
                    me.setContents();
                });
            });

        },
        onHide: function() {
            var me = this;
        },
        setContents: function() {
            var me = this;

            me.setBaseInfo();
            me.setTable();
        },
        setBaseInfo: function() {
            var me = this;
            var view = me._view;

            var txtScore = view.nodes.txt_dw;
            var txtRank = view.finds("txt_level_0");
            var data = me.DATA;

            txtScore.setString(data.jifen || 0);
            var str = '';
            if (!data.rank || (data.rank && data.rank > G.class.wangzherongyao.getOpenNum())) {
                str = X.STR(L('X_rank'), G.class.wangzherongyao.getOpenNum())
            } else {
                str = data.rank;
            }
            txtRank.setString(str);

            if(me.DATA.zhanli) {
                view.nodes.panel_y.show();
                view.nodes.panel_w.hide();
                view.nodes.text_mzl.setString(me.DATA.zhanli);
            } else {
                view.nodes.panel_y.hide();
                view.nodes.panel_w.show();
            }
        },
        setTable: function() {
            var me = this;
            var view = me._view;

            var data = me.DATA;

            me.scrollview.removeAllChildren();
            if (data.ranklist.length < 1) {
                view.nodes.img_zwnr.show();
                return
            } else {
                view.nodes.img_zwnr.hide();
            }

            var table = me.table = new cc.myTableView({
                rownum: 1,
                type: 'fill',
                lineheight: me.list.height + 1
            });
            me.setTableViewData(data.ranklist);
            table.setDelegate(me);
            table.bindScrollView(me.scrollview);
            table.tableView.reloadData();

            if (me._scrollviewup) {
                me._scrollviewup = false;
                if (!me.action.isPlaying()) {
                    me.action.play('scrollviewup', false);
                }
                me.scrollview.show();
            }
        },
        setTableViewData: function(data) {
            var me = this;

            var table = me.table;
            for (var j = 0; j < data.length; j++) {
                var d = data[j];
                d['idx'] = j + 1;
            }
            table.data(data);
        },
        /**
         * 数据模板
         * @returns {*}
         */
        cellDataTemplate: function() {
            var me = this;

            return me.list.clone();
        },
        /**
         * 数据初始化
         * @param ui
         * @param data
         * @param pos [row,col]
         */
        cellDataInit: function(ui, data, pos) {
            var me = this;

            if (!data) {
                ui.hide();
                return;
            }
            X.autoInitUI(ui);
            ui.setTouchEnabled(false);
            var layIco = ui.nodes.panel_tx;
            var txtName = ui.nodes.txt_name;
            var txtScore = ui.nodes.txt_jf;
            var txtZl = ui.nodes.text_zdl2;
            var txtLv = ui.nodes.txt_title;
            var txtVip = ui.nodes.txt_number;
            var layPm = ui.nodes.img_rank;
            var txtPm = ui.nodes.sz_phb;

            layPm.hide();
            txtPm.hide();
            txtPm.setString('');
            if (data.idx < 4) {
                layPm.show();
                layPm.setBackGroundImage('img/public/img_paihangbang_' + data.idx + '.png', 1);
            } else {
                txtPm.setString(data.idx);
                txtPm.show();
            }

            var p = G.class.shead(data);
            p.setPosition(cc.p(layIco.width / 2, layIco.height / 2));
            layIco.removeAllChildren();
            layIco.addChild(p);
            txtName.setString(data.name || L('NO_NAME'));
            txtLv.setString(X.STR(L("DW_DJ"),data.lv));
            txtScore.setString((data.jifen || 0));
            txtVip.setString(X.STR(L('GUIZU'),data.vip));
                if(data.showvip == 0){
                    txtVip.setVisible(false);
                }else if(data.showvip == 1){
                    txtVip.setVisible(true);
                }else{
                    txtVip.setVisible(P.gud.showvip!=0);
                }
            txtZl.setString(data.zhanli || 0);

            layIco.data = data;
            layIco.setTouchEnabled(true);
            layIco.setSwallowTouches(false);
            layIco.touch(function(sender, type) {
                if (type === ccui.Widget.TOUCH_NOMOVE) {
                    if(sender.data.sid && sender.data.sid != P.gud.sid) {
                        G.tip_NB.show(L("LZWY"));
                        return;
                    }
                    var uid = sender.data.uid;
                    G.ajax.send('crosswz_userdetails', [uid, 1], function(data) {
                        var d = X.toJSON(data);
                        if (d.s == 1) {
                            G.frame.wangzherongyao_wjxx.data({frame:me.ID(), data: d.d}).show();
                        }
                    }, true);
                }
            });

            ui.show();
        },
    });
    G.frame[ID] = new fun('ui_tip4.json', ID);
})();
