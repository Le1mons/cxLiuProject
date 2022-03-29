/**
 * Created by LYF on 2018/8/11.
 */
(function () {
    X.checkSuiPian = function (itemId) {
        var isHave = false;
        var conf = G.class.getItem(itemId);
        var data = G.frame.beibao.DATA.item.list;

        for(var i in data) {
            if(data[i].itemid == itemId) {
                data = data[i];
                break;
            }
        }

        if(conf.hcnum && (data.num >= conf.hcnum)) isHave = true;

        return isHave;
    };
    X.checkHeCheng = function (need) {
        var isHave = false;

        var data = G.frame.beibao.DATA.zhuangbei.list;
        var keys = X.keysOfObject(data);
        for(var i = 0; i < keys.length; i ++) {
            var conf = data[keys[i]];
            if(conf.eid == need[0].t) {
                var haveNum = conf.usenum ? conf.num - conf.usenum : conf.num;
                if(haveNum >= need[0].n && P.gud[need[1].t] >= need[1].n) {
                    isHave = true;
                    break;
                }
            }
        }
        return isHave;
    };
    X.checkRongHe = function (hid) {
        var isHave = true;

        function setHeroArr(conf, heroConf) {
            var arr = [];
            var one = conf.mainhero;
            var two = conf.delhero[0];
            var three = conf.chkhero[0];
            var four = conf.chkhero[1] ? conf.chkhero[1] : conf.delhero[1];

            function f(config) {
                for(var i = 0; i < config.n; i ++){
                    var obj = {
                        a: "hero",
                        t: config.t,
                    };
                    arr.push(obj);
                }
            }

            f(one);
            f(two);

            if(four.t) {
                f(four);
            }else {
                for(var i = 0; i < four.num; i ++){
                    var obj = {
                        zz: four.samezhongzu == 1 ? heroConf.zhongzu : 0,
                        star: four.star
                    };
                    arr.push(obj);
                }
            }

            for(var i = 0; i < three.num; i ++){
                var obj = {
                    zz: three.samezhongzu == 1 ? heroConf.zhongzu : 0,
                    star: three.star
                };
                arr.push(obj);
            }

            return arr;
        }


        var idx = 0;
        var inArr = [];
        var conf = G.class.hero.getHcNeed(hid);
        var heroConf = G.class.hero.getById(hid);
        var heroList = G.DATA.yingxiong.list;
        var keys = X.keysOfObject(heroList);
        var need = setHeroArr(conf, heroConf);

        function f() {
            var is = false;
            if(idx == need.length) return;
            for(var i = 0; i < keys.length; i ++){
                if(need[idx].t){
                    if(heroList[keys[i]].hid == need[idx].t && !X.inArray(inArr, keys[i])){
                        idx ++;
                        is = true;
                        inArr.push(keys[i]);
                        break;
                    }
                }else{
                    if((need[idx].zz / heroList[keys[i]].zhongzu == 0 || heroList[keys[i]].zhongzu == need[idx].zz)
                        && heroList[keys[i]].star == need[idx].star
                        && !X.inArray(inArr, keys[i]))
                    {
                        idx ++;
                        is = true;
                        inArr.push(keys[i]);
                        break;
                    }
                }
            }
            if(is) f();
            else {
                isHave = false;
                return;
            }
        }

        f();

        return isHave;
    }
})();