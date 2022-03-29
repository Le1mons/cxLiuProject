/**
 * Created by  on 2019//.
 */
(function () {
    //双十一任务
    var ID = 'double11_task';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.Double11.DATA;
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS81')
                }).show();
            });
        },
        setEndTime: function () {
            var me = this;
            var timeConf = G.gc.double11.openday.task;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间

            X.timeout(me.nodes.txt_djs, starZeroTime + timeConf[1]*24*3600, function () {
                me.nodes.txt_djs.setString(L("HDYJS"));
            });
        },
        onShow: function () {
            var me = this;
            me.setEndTime();
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var conf = JSON.parse(JSON.stringify(G.gc.double11.task));
            var data = [];
            for(var k in conf){
                conf[k].taskid = k;
                data.push(conf[k]);
            }
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            X.render({
                panle_ico:function (node) {
                    X.alignItems(node,data.prize,'left',{
                        touch: true,
                    })
                },
                txt_title:function (node) {
                    node.setString(X.STR(data.intr,data.pval) + X.STR(L('DOUBLE3'),me.DATA.task[data.taskid] || 0,data.pval));
                    X.enableOutline(node,"#A01E00",2);
                },
                btn:function (node) {
                    node.setVisible(!me.DATA.task[data.taskid] || (me.DATA.task[data.taskid] < data.pval));
                    node.touch(function (sender,type) {
                        if(type == ccui.Widget.TOUCH_NOMOVE){
                            X.tiaozhuan(data.tzid);
                            me.remove();
                            G.frame.Double11.remove();
                        }
                    })
                },
                btn_xyg:function (node) {
                    G.removeNewIco(node);
                    node.setVisible(me.DATA.task[data.taskid] && (me.DATA.task[data.taskid] >= data.pval));
                    if(X.inArray(me.DATA.receive,data.taskid)){//已领取
                        node.setBtnState(false);
                        ui.nodes.text_zd.setString(L("YLQ"));
                        ui.nodes.text_zd.setTextColor(cc.color(G.gc.COLOR.n15));
                    }else {
                        node.setBtnState(true);
                        ui.nodes.text_zd.setString(L("LQ"));
                        ui.nodes.text_zd.setTextColor(cc.color(G.gc.COLOR.n13));
                        G.setNewIcoImg(node);
                        node.finds('redPoint').setPosition(120,50);
                    }
                    node.touch(function (sender,type) {
                        if(type == ccui.Widget.TOUCH_NOMOVE){
                            me.ajax('double11_receive',[data.taskid],function (str,d) {
                                if(d.s == 1){
                                    G.frame.jiangli.data({
                                        prize:d.d.prize
                                    }).show();
                                    me.DATA = d.d.data;
                                    G.frame.Double11.DATA = d.d.data;
                                    me.setContents();
                                    G.hongdian.getData('double11', 1, function () {
                                        G.frame.Double11.checkRedPoint();
                                    });
                                }
                            })
                        }
                    })
                }
            },ui.nodes);
        }
    });
    G.frame[ID] = new fun('event_double11_khrw.json', ID);
})();