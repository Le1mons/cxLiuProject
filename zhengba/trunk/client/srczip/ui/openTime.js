(function () {
    var creatTime = function () {
        return P.gud.ctime;
    };
    var newPlayerTime = 1566230400;
    var config = {
        blzq: function () {
            return G.time > P.gud.ctime + X.getOpenTimeToNight(P.gud.ctime) + 6 * 24 * 3600;
        },
        mjzh: function () {
            return true;
        },
        mrsc: function () {
            if (creatTime() < newPlayerTime) return true;
            return (P.gud.ctime + 7 * 24 * 3600) - X.getTodayZeroTime() < 24 * 3600 && P.gud.vip >= 1;
        },
        libao: function () {
            if (creatTime() < newPlayerTime) return true;
            return P.gud.vip >= 2;
        },
        sdmw: function () {
            var time = 1569549600;
            if (G.OPENTIME < time) return 1;

            return (G.OPENTIME + 7 * 24 * 3600) - X.getTodayZeroTime() < 24 * 3600;
        },
        sddl: function () {
            var time = 1569549600;
            if (G.OPENTIME < time) return 1;

            return (G.OPENTIME + 13 * 24 * 3600) - X.getTodayZeroTime() < 24 * 3600;
        },
        slhd: function () {
            var time = 1569637800;
            var addTime = X.getOpenTimeToNight();

            return G.OPENTIME >= time && (G.OPENTIME + addTime + 27 * 24 * 3600) > X.getTodayZeroTime();
        },
        slyd: function () {
            var time = 1569549600;
            var addTime = X.getOpenTimeToNight(time);

            if (G.OPENTIME < time) return false;

            return G.OPENTIME < time + addTime + 27 * 24 * 3600;
        },
        juewei: function () {
            var addTime = X.getOpenTimeToNight();
            return (G.OPENTIME + addTime + 20 * 24 * 3600) < G.time;
        },
        pet: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 24 * 3600 * 17;
        },
        wjzz: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 33 * 24 * 3600 && P.gud.lv >= 100;
        },
        ztl:function(){
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 6 * 24 * 3600;
        },
        wztt: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 13 * 24 * 3600 && P.gud.lv >= 65;
        },
        kaogu:function(){
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 28 * 24 * 3600
        },
        yuanjun: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 29 * 24 * 3600 && P.gud.lv >= 75;
        },
        dwjl: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 29 * 24 * 3600;
        },
        todaylibao: function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 2 * 24 * 3600;
        },
        zsk:function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 1 * 24 * 3600;
        },
        //决斗盛典
        jdsd:function () {
            return G.time >= G.OPENTIME + X.getOpenTimeToNight() + 13 * 24 * 3600;
        },
        lht: function () {
            return G.time < X.getMonthEndTimeByDay(15) && G.time >= G.OPENTIME + X.getOpenTimeToNight() + 43 * 24 * 3600;
        }
    };
    
    X.checkIsOpen = function (id) {
        if (!config[id]) return false;
        else return config[id]();
    };

    X.getMonthEndTimeByDay = function (day) {
        var zoneOffset = 8;
        var offset = new Date().getTimezoneOffset() * 60 * 1000;
        var time = new Date(G.time * 1000 + offset + zoneOffset * 60 * 60 * 1000);
        var month = time.getMonth() + 1;
        var year = time.getFullYear();

        var str = '' + year + '/' + month + '/' + 1 + ' 00:00:00';
        return new Date(str).getTime() / 1000 + day * 24 * 3600;
    };
    
    X.getSlhdType = function () {
        var todayZeroTime = X.getTodayZeroTime();
        var addTime = X.getOpenTimeToNight();

        for (var i = 1; i < 5; i ++) {
            if (todayZeroTime < G.OPENTIME + addTime + (i * 7 - 1) * 24 * 3600) return i;
        }

        return 4;
    };
})();