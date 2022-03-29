(function(){
    var ID = 'Double11';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.showTaskTime();
            me.showlibaoTime();
            me.showPrizePoolTime();
            me.bindBtn();
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.getData(function () {
                _super.apply(me,arg);
            });
        },
        setEndTime: function () {
            var me = this;
            var endTime = G.DATA.asyncBtnsData.double11.etime;

            if(endTime - G.time > 24*3600){
                me.nodes.txt_djs.setString(X.moment(endTime - G.time));
            }else {
                X.timeout(me.nodes.txt_djs, endTime, function () {
                    me.nodes.txt_djs.setString(L("YJS"));
                    G.view.mainView.getAysncBtnsData(function () {
                        G.view.mainView.checkZQorDouble();
                    }, false, ["double11"]);
                });
            }
        },
        onShow: function () {
            var me = this;
            me.setEndTime();
            me.checkRedPoint();
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.double11 == 1) {
                G.setNewIcoImg(me.nodes.btn_khrw);
                me.nodes.btn_khrw.redPoint.setPosition(610, 223);
            } else {
                G.removeNewIco(me.nodes.btn_khrw);
            }
            if (G.DATA.hongdian.double11 == 2) {
                G.setNewIcoImg(me.nodes.btn_xyjc);
                me.nodes.btn_xyjc.redPoint.setPosition(610, 223);
            } else {
                G.removeNewIco(me.nodes.btn_xyjc);
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            me.nodes.btn_khrw.click(function () {
                if(me.taskSate == 0) return G.tip_NB.show(X.STR(L('DOUBLE1'),me.taskleftday));
                if(me.taskSate == 1) return G.tip_NB.show(L('DOUBLE2'));
                G.frame.double11_task.show();
            });
            me.nodes.btn_khlb.click(function () {
                if(me.libaoSate == 0) return G.tip_NB.show(X.STR(L('DOUBLE4'),me.libaoleftday));
                if(me.libaoSate == 1) return G.tip_NB.show(L('DOUBLE5'));
                G.frame.double11_libao.show();
            });
            me.nodes.btn_xyjc.click(function () {
                if(me.prizePoolSate == 0) return G.tip_NB.show(X.STR(L('DOUBLE17'),me.prizePoolleftday));
                if(me.prizePoolSate == 1) return G.tip_NB.show(L('DOUBLE18'));

                var starTime = G.DATA.asyncBtnsData.double11.stime;
                var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
                if (G.time < starZeroTime + (G.gc.double11.openday.choujiang[1])*24*3600 + 12 * 3600) {
                    G.frame.double_jiangchi.show();
                } else {
                    G.frame.double_kaijiang.show();
                }
            });
            me.nodes.btn_khdh.click(function () {
                if(me.prizePoolSate == 0) return G.tip_NB.show(X.STR(L('DOUBLE17'),me.prizePoolleftday));
                // if(me.prizePoolSate == 1) return G.tip_NB.show(L('DOUBLE18'));
                G.frame.double11_duihuan.show();
            });

        },
        showTaskTime:function () {
            var me = this;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
            var taskstartime = starZeroTime + (G.gc.double11.openday.task[0]-1)*24*3600;//任务开启时间
            var taskendtime = starZeroTime + (G.gc.double11.openday.task[1]) * 24*3600;//任务结束时间：活动开始的第7天0点
            me.nodes.text_djs1.setString(me.getTime(taskstartime) + "-" + me.getTime(taskendtime-24*3600));
            if(G.time < taskstartime){//没开启
                me.taskSate = 0;
                var leftday = me.taskleftday = Math.ceil((taskstartime - G.time)/86400);
                me.nodes.panel_kq1.show();
                me.nodes.text_ts1.setString(X.STR(L('DOUBLE1'),leftday));
            }else if(G.time > taskendtime){//已结束
                me.taskSate = 1;
                me.nodes.text_ts1.setString(L('DOUBLE2'));
                me.nodes.panel_kq1.show();
            }else {//开启中
                me.taskSate = 2;
                me.nodes.text_ts1.setString("");
                me.nodes.panel_kq1.hide();
            }
        },
        showlibaoTime:function(){
            var me = this;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
            var libaostartime = starZeroTime + (G.gc.double11.openday.libao[0]-1)*24*3600;//礼包开启时间
            var libaoendtime = starZeroTime + (G.gc.double11.openday.libao[1]) * 24*3600;//礼包结束时间：活动开始的第7天0点
            me.nodes.text_djs3.setString(me.getTime(libaostartime) + "-" + me.getTime(libaoendtime-24*3600));
            if(G.time < libaostartime){//没开启
                me.libaoSate = 0;
                var leftday = me.libaoleftday = Math.ceil((libaostartime - G.time)/86400);
                me.nodes.panel_kq3.show();
                me.nodes.text_ts3.setString(X.STR(L('DOUBLE4'),leftday));
            }else if(G.time > libaoendtime){//已结束
                me.libaoSate = 1;
                me.nodes.text_ts3.setString(L('DOUBLE5'));
                me.nodes.panel_kq3.show();
            }else {//开启中
                me.libaoSate = 2;
                me.nodes.text_ts3.setString("");
                me.nodes.panel_kq3.hide();
            }
        },
        showPrizePoolTime: function () {
            var me = this;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间
            var libaostartime = starZeroTime + (G.gc.double11.openday.prizepool[0]-1)*24*3600;//礼包开启时间
            var libaoendtime = starZeroTime + (G.gc.double11.openday.prizepool[1]) * 24*3600;//礼包结束时间：活动开始的第7天0点
            me.nodes.text_djs2.setString(me.getTime(libaostartime) + "-" + me.getTime(libaoendtime-24*3600));
            if (G.time < libaostartime) {
                me.prizePoolSate = 0;
                var leftday = me.prizePoolleftday = Math.ceil((libaostartime - G.time)/86400);
                me.nodes.panel_kq2.show();
                me.nodes.text_ts2.setString(X.STR(L('DOUBLE17'),leftday));
            } else if (G.time > libaoendtime) {
                me.prizePoolSate = 1;
                me.nodes.text_ts2.setString(L('DOUBLE18'));
                me.nodes.panel_kq2.show();
            } else {
                me.prizePoolSate = 2;
                me.nodes.text_ts2.setString("");
                me.nodes.panel_kq2.hide();
            }
        },
        getData:function (callback) {
            var me = this;
            connectApi('double11_open',[false],function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        getTime:function (time) {
            var me = this;
            var d = new Date(time*1000);
            var month = d.getMonth()+1;
            var day = d.getDate();
            var str = X.STR(L('DOUBLE10'),month,day);
            return str;
        }
    });
    G.frame[ID] = new fun("event_double11.json", ID);
})();