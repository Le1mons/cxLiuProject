/**
 * Created by LYF on 2018-12-26
 */
(function () {
    var _fun = {
        getGlyphArr: function () {
            var arr = [];
            var keys = X.keysOfObject(G.frame.beibao.DATA.glyph.list);

            for (var i in keys) {
                if(!G.frame.beibao.DATA.glyph.list[keys[i]].isuse) arr.push(keys[i]);
            }

            return arr;
        },
        getGlyphArrBySort: function () {
            var arr = this.getGlyphArr();

            arr.sort(function (a, b) {
                var dataA = G.frame.beibao.DATA.glyph.list[a];
                var dataB = G.frame.beibao.DATA.glyph.list[b];
                var confA = G.class.glyph.getById(dataA.gid);
                var confB = G.class.glyph.getById(dataB.gid);

                if (confA.color != confB.color) {
                    return confA.color > confB.color ? -1 : 1;
                } else {
                    return dataA.lv * 1 > dataB.lv * 1 ? -1 : 1;
                }
            });

            return arr;
        },
        getGlyphArrByTs: function (color, gid) {
            var colorArr = [];
            var arr = this.getGlyphArrBySort();
            var data = G.frame.beibao.DATA.glyph.list[gid];

            for (var i in arr) {
                var conf = G.class.glyph.getById(G.frame.beibao.DATA.glyph.list[arr[i]].gid);
                if(conf.color == color && arr[i] != gid && data.type == conf.type) {
                    colorArr.push(arr[i]);
                }
            }

            return colorArr;
        },
        getGlyphArrByMin: function () {
            var arr = this.getGlyphArr();

            arr.sort(function (a, b) {
                var dataA = G.frame.beibao.DATA.glyph.list[a];
                var dataB = G.frame.beibao.DATA.glyph.list[b];
                var confA = G.class.glyph.getById(dataA.gid);
                var confB = G.class.glyph.getById(dataB.gid);

                if (confA.color != confB.color) {
                    return confA.color < confB.color ? -1 : 1;
                } else {
                    return dataA.lv * 1 < dataB.lv * 1 ? -1 : 1;
                }
            });

            return arr;
        },
        getNoInArr: function (arr) {
            var list = this.getGlyphArrByMin();
            var ken = [];

            for (var i in list) {
                if(!X.inArray(arr, list[i])) ken.push(list[i]);
            }

            return ken;
        },
        getNoInArrByRed: function (arr) {
            var list = this.getGlyphArrByMin();
            var ken = [];

            for (var i in list) {
                if(!X.inArray(arr, list[i]) && G.frame.beibao.DATA.glyph.list[list[i]].color != 5) ken.push(list[i]);
            }

            return ken;
        }
    };

    G.frame.diaowen = G.frame.diaowen || {};

    for (var key in _fun) {
        G.frame.diaowen[key] = _fun[key];
    }
})();