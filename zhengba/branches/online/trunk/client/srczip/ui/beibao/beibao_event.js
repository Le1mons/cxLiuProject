/**
 * Created by wfq on 2018/5/24.
 */
G.event.on('itemchange',function(d){
    var o = X.toJSON(d);
    var tips = [];

    var type = 'item';
    var data = G.frame.beibao.DATA[type];
    G.frame.beibao.oldDATA = G.frame.beibao.oldDATA || {};
    G.frame.beibao.oldDATA[type] = JSON.parse(JSON.stringify(data));

    for(var k in o){
        var d = o[k];
        data.list[k] = data.list[k] || {num:0,n:0,itemid:k};
        if (typeof d == 'object') {
            for(var val in d) {
                data.list[k][val] = d[val];
            }
        } else {
            data.list[k].num = o[k]*1;
            data.list[k].n = o[k]*1;
            data.list[k].itemid = k;
        }

        if (data.list[k].num == 0){
            o[k].itemid = data.list[k].itemid;
            delete data.list[k];
        }
        if (o[k]*1 != 0){
            tips.push(G.gc.COLOR[o[k]*1 > 0 ? 1 : 5] + '|' + (L(k) || G.class.getItem(k).name) + num2str(o[k]*1));
        }
    }

    G.frame.beibao.setItemid2num(o,'item');

    G.frame.beibao.DATA[type] = data;

    G.event.emit('itemchange_over', o);
});

G.event.on("glyphchange", function (d) {
    var o = X.toJSON(d);
    var data = G.frame.beibao.DATA.glyph.list;

    for (var i in o) {
        var d = o[i];

        if(d.num == 0) {
            delete data[i];
        } else {
            if(!data[i]) {
                data[i] = d;
            } else {
                for (var j in d) {
                    data[i][j] = d[j];
                }
            }
            data[i].tid = i;
        }
    }

    G.event.emit('glyphchange_over');
});

G.event.on('shipinchange',function(d){
    var o = X.toJSON(d);
    var tips = [];

    var type = 'shipin';
    var data = G.frame.beibao.DATA[type];
    G.frame.beibao.oldDATA = G.frame.beibao.oldDATA || {};
    G.frame.beibao.oldDATA[type] = JSON.parse(JSON.stringify(data));

    for(var k in o){
        var d = o[k];
        data.list[k] = data.list[k] || {num:0,n:0,spid:k};
        if (typeof d == 'object') {
            for(var val in d) {
                data.list[k][val] = d[val];
            }
        } else {
            data.list[k].num = o[k]*1;
            data.list[k].n = o[k]*1;
            data.list[k].spid = k;
        }

        if(isNaN(data.list[k].num)) {
            data.list[k].num = 0;
        }

        if (data.list[k].num == 0){
            o[k].spid = data.list[k].spid;
            delete data.list[k];
        }
        if (o[k]*1 != 0){
            tips.push(G.gc.COLOR[o[k]*1 > 0 ? 1 : 5] + '|' + (L(k) || G.class.getItem(k,'shipin').name) + num2str(o[k]*1));
        }
    }

    G.frame.beibao.setItemid2num(o,'shipin');
    G.frame.beibao.DATA[type] = data;

    G.event.emit('shipinchange_over');
});

G.event.on('equipchange',function(d){
    var o = X.toJSON(d);
    var tips = [];

    var type = 'zhuangbei';
    var data = G.frame.beibao.DATA[type];
    G.frame.beibao.oldDATA = G.frame.beibao.oldDATA || {};
    G.frame.beibao.oldDATA[type] = JSON.parse(JSON.stringify(data));

    for(var k in o){
        var d = o[k];
        data.list[k] = data.list[k] || {num:0,n:0,eid:k};
        if (typeof d == 'object') {
            for(var val in d) {
                data.list[k][val] = d[val];
            }
            data.list[k].tid = k;
        } else {
            // data.list[k].num = o[k]*1;
            // data.list[k].n = o[k]*1;
            // data.list[k].eid = k;
        }

        if (data.list[k].num == 0){
            o[k].eid = data.list[k].eid;
            delete data.list[k];
        }
        if (o[k]*1 != 0){
            tips.push(G.gc.COLOR[o[k]*1 > 0 ? 1 : 5] + '|' + (L(k) || G.class.getItem(k,'equip').name) + num2str(o[k]*1));
        }
    }

    G.frame.beibao.setItemid2num(o,'zhuangbei');
    G.frame.beibao.DATA[type] = data;

    G.event.emit('equipchange_over');
});

