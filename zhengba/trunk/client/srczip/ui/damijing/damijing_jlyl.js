/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //通关奖励
    var ID = 'damijing_jlyl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.ui.nodes.tip_title.setString(L('MBJL'));
        },
        bindBtn: function () {
            var me = this;

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
            new X.bView('tongguanjiangli.json', function (view) {
                me._view = view;
                me._view.nodes.panel_tgjl.show();
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);

                X.viewCache.getView('tongguanjiangli_list.json', function (node) {
                    me.list = node.finds('list_nr');
                    me.setContents();
                });
            });
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("watcher", 1, function () {
                G.frame.damijing.checkRedPoint();
            })
        },
        setContents: function () {
            var me = this;
            var panel = me._view;
            var prize = [];
            var conf = G.class.watchercom.get().base.prize;
            var scrollview = panel.nodes.scrollview;

            G.frame.damijing.DATA.target = [6, 12, 18, 24, 30];

            for(var i = 0; i < conf.length; i ++) {
                var obj = {
                    prize: conf[i],
                    idx: i,
                    target: G.frame.damijing.DATA.target[i]
                };
                prize.push(obj);
            }

            prize = me.sortData(prize);

            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            me.list.hide();

            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8,10);
            table.setData(prize);
            table.reloadDataWithScroll(true);
        },
        setItem: function(ui, data){
            X.autoInitUI(ui);
            ui.setTouchEnabled(false);
            var me = this;
            var txtName = ui.nodes.wz_title;
            var layWp = ui.nodes.ico_jlwp;
            var btnLq = ui.nodes.btn1_on;
            var ylq = ui.nodes.img_ylq;
            ylq.hide();
            btnLq.hide();

            X.alignItems(layWp, data.prize, "left", {
                touch: true
            });

            if(G.frame.damijing.DATA.winnum >= data.target && !X.inArray(G.frame.damijing.DATA.reclist, data.target)) {
                btnLq.show();
            }

            if(X.inArray(G.frame.damijing.DATA.reclist, data.target)) {
                ylq.show();
            }
            txtName.setString(X.STR(L('DDCENG'),data.target, G.frame.damijing.DATA.winnum,data.target));

            btnLq.idx = data.target;
            btnLq.click(function (sender) {
                me.ajax("watcher_getprize", [sender.idx], function (str, data) {
                    if(data.s == 1) {
                        G.event.emit('sdkevent',{
                            event:'mj_lingjiang',
                            data:{
                                mj_boxNum:sender.idx,
                                get:data.d.prize
                            }
                        });
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        sender.hide();
                        ylq.show();
                        G.frame.damijing.DATA.reclist = data.d.reclist;
                    }
                })
            })
        },
        sortData: function (data) {
            var reclist = G.frame.damijing.DATA.reclist || [];
            var tar = G.frame.damijing.DATA.winnum;
            var arr = [];

            for (var i = 0; i < data.length; i ++) {
                if(data[i].target <= tar) {
                    if(!X.inArray(reclist, data[i].target)) {
                        data[i].rank = 1;
                    }else{
                        data[i].rank = 3;
                    }
                }else {
                    data[i].rank = 2;
                }
                arr.push(data[i]);
            }

            arr.sort(function (a, b) {
                if(a.rank != b.rank) {
                    return a.rank < b.rank ? -1 : 1;
                }else {
                    return a.target > b.target;
                }
            });

            return arr;
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();