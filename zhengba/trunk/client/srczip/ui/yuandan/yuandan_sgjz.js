/**
 * Created by
 */
(function () {
    //
    var ID = 'yuandan_sgjz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.txt_title.setString(L('yuandan_title2'));
            cc.enableScrollBar(me.nodes.scrollview, false);
            cc.enableScrollBar(me.nodes.scrollview1, false);

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            me.nodes.btn_zz.click(function(sender,type){
                var work = G.gc.newyear.workshop[me._curIdx];
                var needs = work.need;
                var maxNum = 0;

                for(var i=0;i<needs.length;i++){
                    var need = needs[i].n;
                    var has = G.class.getOwnNum(needs[i].t, needs[i].a);
                    var num = Math.floor(has / need);

                    if(maxNum == 0 || maxNum >  num){
                        maxNum = num;
                    }
                }

                var realNum = G.gc.newyear.workshop[me._curIdx].num - (G.DATA.yuandan.workshop[me._curIdx] || 0);
                if(realNum <= 0){
                    G.tip_NB.show(L('yuandan_nocount'));
                    return;
                }

                if(maxNum > realNum) maxNum = realNum;

                G.frame.event_zhongqiu_tip1.data({
                    prize: work.prize[0],
                    maxNum: maxNum,
                    callback: function(num){
                        G.DAO.yuandan.workshop(me._curIdx, num, function(data){
                            G.frame.jiangli.once('show', function(){
                                G.DAO.yuandan.getServerData(function(){
                                    me.setBeibao();
                                    me.fmtItemList();
                                });
                            }).data({
                                prize: data.prize
                            }).show();
                        });
                    },
                    title: L("yuandan_title3")
                }).show();
            });
        },
        onShow: function () {
            var me = this;

            me._curIdx = 0;
            me.setContents();
            X.cacheByUid("yuandanWorkshop", 1);
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.ui.finds('txt_1').hide();
            X.render({
                txt_cs: function(node){
                    var rtime = G.DATA.asyncBtnsData.midautumn.etime;

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    }, null, {
                        showDay: true
                    });
                },
            }, me.nodes);

            me.setBeibao();
            me.fmtItemList(true);
        },
        setBeibao: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (!me.bag_table) {
                me.nodes.scrollview1.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
                var table = new cc.myTableView({
                    rownum: 1,
                    type: 'fill',
                    lineheight: 100,
                    // paddingTop: 10
                });
                table.setCellSize(-1, cc.size(110, 100));
                me.bag_table = table;
                this.setBeibaoViewData();
                table.setDelegate(me.beibao_delegate);
                table.bindScrollView(me.nodes.scrollview1);
            }else {
                this.setBeibaoViewData();
            }
            me.bag_table.reloadDataWithScroll(true);
        },
        setBeibaoViewData: function () {
            var me = this;
            var show = JSON.parse(JSON.stringify(G.gc.newyear.workshopshow));
            var data = [];

            for(var i=0;i<show.length;i++){
                show[i].n = G.class.getOwnNum(show[i].t, show[i].a);
                if(show[i].n > 0){
                    data.push(show[i]);
                }
            }

            var table = me.bag_table;
            table.data(data);
        },
        beibao_delegate: {
            cellDataTemplate: function () {
                var me = this;
                if(!cc.isNode(G.frame.yuandan_sgjz.ui)) return;
                var lay = new ccui.Layout();
                lay.setContentSize(cc.size(100, 100));
                return lay;
            },
            cellDataInit: function (ui, data, pos) {
                var me = this;
                if(!cc.isNode(G.frame.yuandan_sgjz.ui)) return;
                if (data == null) {
                    ui.hide();
                    return;
                }
                ui.setName('item_' + ui.idx);
                if(!ui.nodes) X.autoInitUI(ui);
                var widget = G.class.sitem(data);
                widget.setPosition(ui.width / 2, ui.height / 2);
                ui.removeAllChildren();
                ui.addChild(widget);
                G.frame.iteminfo.showItemInfo(widget);
                // item.setSwallowTouches(true);

                ui.show();
            },
        },
        fmtItemList: function (toTop) {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if (!me.ui_table) {
                var table = new cc.myTableView({
                    rownum: 1,
                    type: 'fill',
                    lineheight: me.nodes.list.height,
                    // paddingTop: 10
                });
                me.ui_table = table;
                this.setTableViewData();
                table.setDelegate(this);
                table.bindScrollView(me.nodes.scrollview);
            }else {
                this.setTableViewData();
            }
            me.ui_table.reloadDataWithScroll(toTop);
        },
        setTableViewData: function () {
            var me = this;
            var data = G.gc.newyear.workshop;

            var table = me.ui_table;
            table.data(data);
        },
        cellDataTemplate: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            return me.nodes.list.clone();
        },
        cellDataInit: function (ui, data, pos) {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if (data == null) {
                ui.hide();
                return;
            }
            ui.setName('item_' + ui.idx);
            if(!ui.nodes) X.autoInitUI(ui);

            ui.refresh = function(){
                var that = this;
                X.render({
                    img_xz: function(node){ // 选中
                        node.setVisible(me._curIdx == that.idx);
                    },
                    text_sl: data.num - (G.DATA.yuandan.workshop[that.idx] || 0), // 限购数量
                }, that.nodes);
            };
            ui.refresh();

            var prize = data.prize[0];
            var prizeConf = G.class.getItem(prize.t, prize.a);
            var obj = {
                txt_yb: function(node){
                    setTextWithColor(node, prizeConf.name, '#FFE8A5');
                    X.enableOutline(node,cc.color('#A01E00'), 2);
                },
                panel_yb: function(node){ // 月饼
                    node.removeAllChildren();
                    var need = data.need[0];
                    if(need){
                        var widget = G.class.sitem(need);
                        widget.setPosition(node.width / 2, node.height / 2);
                        node.addChild(widget);
                        G.frame.iteminfo.showItemInfo(widget);
                        widget.setPropagateTouchEvents(true);
                        node.setTouchEnabled(false);
                    }

                },
                btn_jlyl: function(node){ // 奖励预览
                    // node.setVisible(prizeConf.dlp && prizeConf.dlp.length > 0);
                    node.setVisible(false);
                    node.setSwallowTouches(false);
                    node.setPropagateTouchEvents(true);
                    node.touch(function (sender, type) {
                        if (type === ccui.Widget.TOUCH_NOMOVE) {
                            G.frame.event_zhongqiu_tip2.data({
                                prize: prize,
                            }).show();
                        }
                    });
                },
                panel_cl1:function (node) {
                    var widget = G.class.sitem(prize);
                    widget.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(widget);
                    G.frame.iteminfo.showItemInfo(widget);
                    widget.setPropagateTouchEvents(true);
                    node.setTouchEnabled(false);
                }
            };

            for(var i=0;i<3;i++){
                (function(idx){
                    var need = idx < data.need.length ? data.need[idx] : null;
                    var index = idx+1;
                    obj['text_cl' + index] = function(node){
                        if(need){
                            setTextWithColor(node, G.class.getItem(need.t, need.a).name, '#884825');
                        }else{
                            node.setString('');
                        }
                    };
                    obj['img_add' + index] = function(node){
                        node.setVisible(idx < data.need.length - 1);
                    };
                })(i);
            }
            ui.nodes.panel_cl2.hide();
            ui.nodes.panel_cl3.hide();
            X.render(obj, ui.nodes);

            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.setPropagateTouchEvents(true);
            ui.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_NOMOVE) {
                    me._curIdx = sender.idx;
                    me.ui_table.forEachChild(function(child){
                        child.refresh && child.refresh();
                    });
                }
            });
            ui.show();
        },
    });
    G.frame[ID] = new fun('event_yuandan_ybgf.json', ID);
})();