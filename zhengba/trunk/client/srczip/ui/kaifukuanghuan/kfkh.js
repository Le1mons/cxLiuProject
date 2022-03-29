/**
 * Created by
 */
(function () {
    //
    var ID = 'kfkh';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.ui.finds('panel_bg').setTouchEnabled(false);

            me.nodes.panel_1.setTouchEnabled(true);
            me.nodes.panel_1.click(function () {
                G.frame.kfkh_qd.show();
            });
            me.nodes.panel_2.setTouchEnabled(true);
            me.nodes.panel_2.click(function () {
                G.frame.kfkh_sl.show();
            });
            me.nodes.panel_3.setTouchEnabled(true);
            me.nodes.panel_3.click(function () {
                G.frame.kfkh_bj.show();
                X.cacheByUid('show_kfkh_bjred', 1);
                me.checkRedPoint();
            });
            me.nodes.panel_4.setTouchEnabled(true);
            me.nodes.panel_4.click(function () {
                G.frame.kfkh_rw.show();
            });

            //me.nodes.panel_down.show();
        },
        getData: function (type, callback) {
            var me = this;

            me.ajax('kfkh_open', type ? [type] : [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    if (me.DATA.sday > 7) me.DATA.sday = 7;
                    callback && callback();
                }
            });
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(null, function () {
                _super.apply(me,arguments);
            });
        },
        onHide: function () {
            G.hongdian.getData("kfkh", 1)
        },
        onShow: function () {
            var me = this;

            me.checkRedPoint();

            X.timeout(me.nodes.txt_cs, G.DATA.asyncBtnsData.kaifukuanghuan.kfkhetime, function () {

            }, null, {
                showDay: true
            });
        },
        getDayTaskBuyTabAndHType: function (day, tab, hType) {
            day = [].concat(day);
            tab = [].concat(tab);
            hType = hType ? [].concat(hType) : [];
            var taskList = [];

            cc.each(day, function (d) {
                cc.each(G.gc.kaifukuanghuan[d], function (task, id) {
                    if (X.inArray(tab, task.tab)) {
                        if (hType.length > 0 && X.inArray(hType, task.htype)) {
                            var _task = JSON.parse(JSON.stringify(task));
                            _task.day = d;
                            _task.hdid = id;
                            taskList.push(_task);
                        }
                        if (hType.length == 0) {
                            var _task = JSON.parse(JSON.stringify(task));
                            _task.day = d;
                            _task.hdid = id;
                            taskList.push(_task);
                        }
                    }
                });
            });

            return taskList;
        },
        checkRedPoint: function () {
            var me = this;

            if (me.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 1, 1)) {
                G.setNewIcoImg(me.nodes.panel_1);
                me.nodes.panel_1.redPoint.setPosition(605, 250);
            } else {
                G.removeNewIco(me.nodes.panel_1);
            }
            if (me.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 2) || me.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 3)) {
                G.setNewIcoImg(me.nodes.panel_2);
                me.nodes.panel_2.redPoint.setPosition(605, 250);
            } else {
                G.removeNewIco(me.nodes.panel_2);
            }
            if (me.getTaskRedPointByDay([1, 2, 3, 4, 5, 6, 7], 1, 2) || !X.cacheByUid('show_kfkh_bjred')) {
                G.setNewIcoImg(me.nodes.panel_3);
                me.nodes.panel_3.redPoint.setPosition(299, 247);
            } else {
                G.removeNewIco(me.nodes.panel_3);
            }

            var val = me.DATA.finipro;
            var conf = G.gc.kaifukuanghuan_jdt.base.stageprize;
            var isHave = false;
            for (var index = 0; index < conf.length; index ++) {
                var d = conf[index];
                if (val >= d[0] && !X.inArray(me.DATA.recprize, index)) {
                    isHave = true;
                    break;
                }
            }
            if (isHave) {
                G.setNewIcoImg(me.nodes.panel_4);
                me.nodes.panel_4.redPoint.setPosition(299, 247);
            } else {
                G.removeNewIco(me.nodes.panel_4);
            }

            me.showTaskPrize();
        },
        getTaskRedPointByDay: function (day, tab, hType) {
            var me = this;
            var taskList = me.getDayTaskBuyTabAndHType(day, tab, hType);

            for (var task of taskList) {
                var taskData = G.frame.kfkh.DATA.data[task.hdid];
                if (taskData && taskData.nval >= taskData.pval && !taskData.finish) return true;
            }

            return false;
        },
        showTaskPrize: function () {
            var me = this;
            var val = me.DATA.finipro;
            var conf = G.gc.kaifukuanghuan_jdt.base.stageprize;

            var data;
            for (var d of conf) {
                if (val < d[0]) {
                    data = d;
                    break;
                }
            }
            if (data) {
                me.ui.finds('panel_4$_0').show();
                var ico = new ccui.ImageView(G.class.getItemIco('rmbmoney'), 1);
                ico.scale = .7;
                var rh = X.setRichText({
                    str: X.STR(L("kfkh_task_prize"), data[0] - val, data[1][0].n),
                    parent: me.ui.finds('panel_4$_0'),
                    maxWidth: me.ui.finds('panel_4$_0').width + 100,
                    color: '#f5efe0',
                    node: ico,
                    outline: '#250604',
                    size: 20
                });
                rh.x = 0;
            } else {
                me.ui.finds('panel_4$_0').hide();
            }
        }
    });
    G.frame[ID] = new fun('kaifukuanghuan.json', ID);
})();