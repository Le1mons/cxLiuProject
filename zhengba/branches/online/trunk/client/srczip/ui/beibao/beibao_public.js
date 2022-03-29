/**
 * Created by wfq on 2018/5/23.
 */
(function () {
    var _fun = {
        // 背包数据
        getData: function (callback) {
            var me = this;

            G.ajax.send('item_getlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = {};
                    me.DATA.item = d.d;
                    me.setItemid2num(d.d.list,'item');
                    callback && callback();
                }
            });
        },
        //装备数据
        getZbData: function (callback) {
            var me = this;

            G.ajax.send('equip_getlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = me.DATA || {};
                    me.DATA.zhuangbei = d.d;
                    me.setItemid2num(d.d.list,'zhuangbei');
                    callback && callback();
                }
            });
        },
        //饰品数据
        getShipinData: function (callback) {
            var me = this;
            
            G.ajax.send('shipin_getlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = me.DATA || {};
                    me.DATA.shipin = d.d;
                    me.setItemid2num(d.d.list,'shipin');
                    callback && callback();
                }
            });
        },
        getGlyphData: function(callback) {
            var me = this;

            G.ajax.send('glyph_getlist',[],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    me.DATA = me.DATA || {};
                    me.DATA.glyph = d.d;
                    for (var i in me.DATA.glyph.list) {
                        me.DATA.glyph.list[i].tid = i;
                    }
                    callback && callback();
                }
            });
        },
        getItemInfo: function (tid) {
            var me = this;

            return me.DATA.item.list[tid];
        },
        //通过itemid对应的数量
        setItemid2num: function (d,type) {
            var me = this;

            var obj = {
                zhuangbei:'eid',
                item:'itemid',
                shipin:'spid',
                glyph: "glyphid"
            };
            me.DATA.item2num = me.DATA.item2num || {};
            me.DATA.item2num[type] = me.DATA.item2num[type] || {};

            for (var tid in d) {
                var data = d[tid];
                me.DATA.item2num[type][data[obj[type]]] = data.num;
            }
        },
        getItemNum: function (id) {
            var me = this;

            var a = me.getItemInfo(id);
            return a ? a.num : 0;
        },
        getItemNumByTypeid: function (id,type) {
            var me = this;

            type = type || 'item';

            return me.DATA.item2num[type][id];
        }
    };

    for (var key in _fun) {
        G.frame.beibao[key] = _fun[key];
    }
})();