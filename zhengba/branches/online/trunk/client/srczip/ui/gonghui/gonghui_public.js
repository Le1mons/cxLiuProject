/**
 * Created by wfq on 2018/6/26.
 */
(function() {
    var me = G.frame.gonghui_main;

    var fun = {
        extConf: {
            power: {
                huizhang: 0,
                guanyuan: 1,
                chengyuan: 3
            }
        },
        //获得官职等级
        getMyPower: function() {
            var me = this;

            return P.gud.ghpower;
        },
        sortData: function(data) {
            var me = this;

            var func = function(a, b) {
                if (a.power != b.power) {
                    return a.power < b.power ? -1 : 1;
                } else if (a.hearttime != b.hearttime) {
                    return a.hearttime > b.hearttime ? -1 : 1;
                } else if (a.headdata.lv != b.headdata.lv) {
                    return a.headdata.lv > b.headdata.lv ? -1 : 1;
                } else {
                    return a.headdata.uuid * 1 < b.headdata.uuid * 1 ? -1 : 1;
                }
            };

            data.sort(func);

            return data;
        },
        //申请公会
        gonghuiApply: function(ghid,callback){
            var me = this;
            G.ajax.send('gonghui_apply', [ghid], function(d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    G.tip_NB.show(L('SHENQING') + L('SUCCESS'));
                    callback && callback();
                }
            }, true);
        }
    };

    cc.mixin(me, fun, true);
})();