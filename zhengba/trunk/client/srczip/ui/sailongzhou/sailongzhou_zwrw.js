/**
 * Created by
 */
(function () {
    //赛龙舟-助威任务
    var ID = 'sailongzhou_zwrw';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.nodes.img_banner.setBackGroundImage('img/duanwu/img_banner1.png',1);
            me.nodes.txt_title.setString(L('slz_tip1'));
            X.timeout(me.nodes.txt_sj, X.getTodayZeroTime() + 24 * 3600, function () {
                G.frame.sailongzhou.getData(function () {
                    G.tip_NB.show(L('slz_tip5'));
                    me.setContents();
                })
            }, null, {showStr: L("slz_tip4")});
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onHide: function () {
            var me = this;
        },
        onAniShow: function () {
        },
        onShow: function () {
            var me = this;
            me.conf = G.gc.longzhou;

            me.setContents();
        },
        setContents: function () {
            var me = this;
            me.taskData = G.frame.sailongzhou.DATA.myinfo.task;
            var task = me.conf.task;
            var keys = X.keysOfObject(task);
            keys.sort(function (a,b) {
               var ta =  me.conf.task[a];
                var tb =  me.conf.task[b];
                var orderA = X.inArray(me.taskData.rec,a)?0:((me.taskData.data[a]||0 >= ta.pval)?2:1);
                var orderB =  X.inArray(me.taskData.rec,b)?0:((me.taskData.data[b]||0 >= tb.pval)?2:1);
                return orderA > orderB ? -1:1;
            });
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.nodes.scrollview.removeAllChildren();
            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao1, 1, function (ui, data) {
                me.setItem(ui, data);
            },null, null, 10, 0);
            me.table.setData(keys);
            me.table.reloadDataWithScroll(true);
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            var conf = me.conf.task[data];
            ui.nodes.txt_name.setString(conf.desc);
            ui.nodes.txt_name.setTextColor(cc.color('#804326'));
            var fenzi = me.taskData.data[data]||0;
            var jdt = fenzi/conf.pval*100;
            ui.nodes.img_jdt.setPercent(jdt);
            ui.nodes.txt_jdt.setString(fenzi+'/'+conf.pval);
            X.enableOutline(ui.nodes.txt_jdt,'#584115',2);
            X.alignItems(ui.nodes.img_item, conf.prize, 'left', {
                touch: true,
            });

            var state = '';
            if (!X.inArray(me.taskData.rec,data)){
                ui.nodes.btn_dh.setBright(true);
                ui.nodes.btn_dh.setTouchEnabled(true);
                if (fenzi>=conf.pval){
                    //可领取
                    state = 'klq';
                    ui.nodes.btn_receive.show();
                    ui.nodes.btn_dh.hide();
                }else {
                    state = 'qw';
                    ui.nodes.btn_receive.hide();
                    ui.nodes.btn_dh.show();
                    if (conf.tiaozhuan){
                        ui.nodes.btn_dh.setTitleText(L('BTN_QW'));
                    } else {
                        ui.nodes.btn_dh.setTitleText(L('BTN_OK'));
                    }
                }
            }else {
                    state = 'ylq';
                ui.nodes.btn_receive.hide();
                ui.nodes.btn_dh.show();
                ui.nodes.btn_dh.setTitleText(L('BTN_YLQ'));
                ui.nodes.btn_dh.setBright(false);
                ui.nodes.btn_dh.setTouchEnabled(false);
            }
            ui.nodes.btn_dh.state = state;
            ui.nodes.btn_dh.key = data;
            ui.nodes.btn_dh.data = conf;
            ui.nodes.btn_dh.click(function (sender,type) {
                if (sender.state == 'qw') {
                        if (sender.data.tiaozhuan){
                            X.tiaozhuan(sender.data.tiaozhuan);
                            me.remove();
                            G.frame.sailongzhou.remove();
                        }
                }else {
                    G.tip_NB.show('slz_tip7');
                }
            });
            ui.nodes.btn_receive.key = data;
            ui.nodes.btn_receive.data = conf;
            ui.nodes.btn_receive.click(function (sender,type) {
                    me.ajax('longzhou_receive', [sender.key], function(str, data){
                        if (data.s == 1) {
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            G.frame.sailongzhou.DATA.myinfo = data.d.myinfo;
                            me.setContents();
                            G.hongdian.getData('longzhou',1,function () {
                                G.frame.sailongzhou.checkRedPoint();
                            })
                        }
                    });
            })
        }
    });
    G.frame[ID] = new fun('duanwu_tk2.json', ID);
})();