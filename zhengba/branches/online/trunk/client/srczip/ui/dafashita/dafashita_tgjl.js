/**
 * Created by LYF on 2018/6/8.
 */
(function () {
    //通关奖励
    var ID = 'dafashita_tgjl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
            me.ui.nodes.tip_title.setString(L('TGJL'));
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
            me.bx = me.data();
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
        },
        setContents: function () {
            var me = this;
            var panel = me._view;
            var prize = [];
            var conf = G.class.dafashita.getPrize().passprize;
            var scrollview = panel.nodes.scrollview;
            var keys = X.keysOfObject(conf);
            for(var i = 0; i < keys.length; i ++){
                conf[keys[i]].push(i);
                prize.push(conf[keys[i]]);
            }

            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();

            me.sortData(prize);
            me.list.hide();

            var table = me.table = new X.TableView(scrollview,me.list,1, function (ui, data) {
                me.setItem(ui, data);
            },null,null,8, 10);
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

            var dqgk = G.frame.dafashita.DATA.layernum;
            txtName.setString(X.STR(L('FST_TADQ_CENG'),data[0],G.frame.dafashita.DATA.passlist.length,data[0]));
            X.alignItems(layWp,data[1],'left',{
                touch:true
            });
            if(G.frame.dafashita.DATA.passlist.length >= data[0] && !(X.inArray(G.frame.dafashita.DATA.prizelist, data[0]))){
                btnLq.show();
                ylq.hide();
            }
            if(G.frame.dafashita.DATA.passlist.length >= data[0] && (X.inArray(G.frame.dafashita.DATA.prizelist, data[0]))){
                ylq.show();
                btnLq.hide();
            }
            btnLq.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    sender.setTouchEnabled(false);
                    G.ajax.send("fashita_getprize", [data[0]], function (d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            G.frame.jiangli.data({
                                prize: d.d.prize
                            }).show();
                            G.frame.dafashita.getData(function () {
                                me.setContents();
                            });
                            if(me.bx && me.bx.id == data[0]) {
                                me.bx.target.setBackGroundImage("img/fashita/img_fst_bx2.png", 1);
                                me.bx.target.setTouchEnabled(false);
                            }
                        }
                    })
                }
            })
        },
        sortData: function (data) {
            var passArr = G.frame.dafashita.DATA.passlist;
            var prizeArr = G.frame.dafashita.DATA.prizelist;
            for(var i = 0; i < data.length; i ++){
                if(passArr.length >= data[i][0] && !X.inArray(prizeArr, data[i][0])){
                    data[i].push(1);
                }else if(passArr.length >= data[i][0] && X.inArray(prizeArr,data[i][0])){
                    data[i].push(3);
                }else{
                    data[i].push(2);
                }
            }

            data.sort(function (a, b) {
                if(a[a.length - 1] !== b[b.length - 1]){
                    return a[a.length - 1] < b[b.length - 1] ? -1 : 1;
                }else{
                    return a[0] < b[0] ? -1 : 1;
                }
            })
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();