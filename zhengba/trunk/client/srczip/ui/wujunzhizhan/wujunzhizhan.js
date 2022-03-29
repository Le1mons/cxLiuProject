(function () {
    G.frame.wujunzhizhan = {
        show: function () {
            var me = this;

            me.getData(function () {
                me.showView();
            });
        },
        getData: function (callback) {
            var me = this;

            connectApi("wjzz_open", [], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
        showView: function () {
            var me = this;
            var data = me.DATA;
            var state = me.getState() || {};

            if (X.inArray(['apply', 'applyEnd'], state.state) || !data.signup || data.signnum < G.gc.wjzz.base.open) {
                G.frame.wujunzhizhan_apply.show();
            } else {
                G.frame.wujunzhizhan_main.show();
            }
        },
        getState: function () {
            var curTime = G.time;
            var thisWeekZeroTime = X.getLastMondayZeroTime();
            //报名期：周六00:00 至 周一22:00
            var applyTime = [thisWeekZeroTime + 5 * 24 * 3600, thisWeekZeroTime + 22 * 3600];
            //报名结束，准备开始本轮活动：周一22:00 至 周一24:00
            var applyEndTime = [thisWeekZeroTime + 22 * 3600, thisWeekZeroTime + 24 * 3600];
            //活动期：周二00:00 至 周五22:00
            var eventTime = [thisWeekZeroTime + 24 * 3600, thisWeekZeroTime + 4 * 24 * 3600 + 22 * 3600];
            //活动结束、发放奖励，准备开始下轮报名：周五20:00 至 周五24:00
            var eventEndTime = [thisWeekZeroTime + 4 * 24 * 3600 + 22 * 3600, thisWeekZeroTime + 5 * 24 * 3600];

            if (curTime >= applyTime[0] || curTime < applyTime[1]) {
                return {
                    state: 'apply',
                    time: applyTime
                }
            }
            if (curTime >= applyEndTime[0] && curTime < applyEndTime[1]) {
                return {
                    state: 'applyEnd',
                    time: applyEndTime
                }
            }
            if (curTime >= eventTime[0] && curTime < eventTime[1]) {
                return {
                    state: 'event',
                    time: eventTime
                }
            }
            if (curTime >= eventEndTime[0] && curTime < eventEndTime[1]) {
                return {
                    state: 'eventEnd',
                    time: eventEndTime
                }
            }
        }
    };
})();