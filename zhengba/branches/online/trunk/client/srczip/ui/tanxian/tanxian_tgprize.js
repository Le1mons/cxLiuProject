/**
 * Created by wfq on 2018/6/4.
 */
(function () {
    //探险-通关奖励
    var ID = 'tanxian_tgprize';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            me.ui.nodes.tip_title.setString(L("TGJL"));
        },
        bindBtn: function () {
            var me = this;

            me.ui.nodes.btn_guanbi.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.ui.nodes.mask.touch(function (sender, type) {
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

            // G.frame.tanxian.DATA.passprizeidx = [0,1];
            // P.gud.maxmapid = 60;

            new X.bView('tongguanjiangli.json', function (view) {
                me._view = view;
                me._view.nodes.panel_tgjl.show();
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                X.viewCache.getView('tongguanjiangli_list.json', function (node) {
                    me.list = node.finds('list_nr');
                    me.setContents();
                    me.ui.setTimeout(function(){
                    	G.guidevent.emit('tanxian_tgprize_showover');
                    },500);
                });
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var panel = me._view;
            var prize = [].concat(G.class.tanxian.getTgprize());
            me.gotarr = G.frame.tanxian.DATA.passprizeidx;
            me.sortData(prize);

            var scrollview = panel.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            me.list.hide();
			
			me.nodes._firstLQBtn=null;
            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8, 10);
            table.setData(prize);
            table.reloadDataWithScroll(true);
            // scrollview.getChildren()[0].getChildren()[0].setPositionX(7);
        },
        setItem: function(ui, data) {
            var me = this;

            X.autoInitUI(ui);
            // var prize = [].concat(G.class.tanxian.getTgprize());
            var txtName = ui.nodes.wz_title;
            var layWp = ui.nodes.ico_jlwp;
            var btnLq = ui.nodes.btn1_on;
            var layXs = ui.nodes.bg_xuanshangrenwu_jdt;
            var ylq = ui.nodes.img_ylq;
            var maxGqid = G.class.tanxian.getCurMaxGqid();
            var maxmapid = P.gud.maxmapid > maxGqid ? maxGqid : P.gud.maxmapid;

            layWp.removeAllChildren();
            btnLq.hide();
            layXs.hide();
            data[3] ? ylq.show() : ylq.hide();
            var dqgk = maxmapid - 1;
            txtName.setString(X.STR(L('TANXIAN_TXDQ_CENG'),data[0],maxmapid - 1,data[0]));
            X.alignItems(layWp,data[1],'left',{
                touch:true,
                interval:15
            });


            if (!X.inArray(me.gotarr, data[2]) && maxmapid - 1 >= data[0]) {
                btnLq.show();
            }
            
            //第一个领奖按钮映射出去，方便新手指导
            if(me.nodes._firstLQBtn==null){
            	me.nodes._firstLQBtn = btnLq;
            }

            layWp.setTouchEnabled(false);
            ui.setTouchEnabled(false);

            btnLq.data = data[2];
            btnLq.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('tanxian_recpassprize',[sender.data],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.frame.jiangli.data({
                                prize:[].concat(d.d.prize)
                            }).show();
                            G.frame.tanxian.getData(function () {
                                me.setContents();
                                G.frame.tanxian.checkRedPoint();
                            });
                        }
                    },true);
                }
            });
        },
        sortData: function (data) {
            for (var i = 0; i < data.length; i++) {
                var p = data[i];
                p[2] = i;
                if (X.inArray(G.frame.tanxian.DATA.passprizeidx, i)) {
                    p[3] = 1;
                } else {
                    p[3] = 0;
                }
            }

            //2是索引，3是是否领取
            data.sort(function (a,b) {
                if (a[3] != b[3]) {
                    return  a[3] < b[3] ? -1 : 1;
                } else {
                    a[2] < b[2] ? -1 : 1;
                }
            });
        }
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();