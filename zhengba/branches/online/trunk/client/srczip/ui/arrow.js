/**
 * Created by panda on 16/3/30.
 */
(function () {
    //建筑箭头动画
    //
    // G.event.on('buildDataOver',function(d){
    //     G.handleArrow();
    // });
    // G.handleArrow = function () {
    //     var myJb = P.gud.jinbi;
    //     var myMc = P.gud.dianneng;
    //     var myKs = P.gud.gangtie;
    //     var myLv = P.gud.lv;
    //     var jzData = G.DATA.buildData;
    //
    //     //奇迹
    //     var con = null;
    //     if (myLv >= G.gc.jz.qiji) {
    //         if ( myLv >= (jzData.qiji*2) + 10) {
    //             con = G.class.getConf("qiji")[jzData.qiji];
    //             var needMap = {};
    //             for (var i in con.need){
    //                 needMap[con.need[i]['t']] = con.need[i]['n'];
    //             }
    //             if (needMap.jinbi <= myJb && needMap.dianneng <= myMc && needMap.kuangshi <= myKs) {
    //                 if (jzData.qiji < G.gc.jz.qjMaxLv ) {
    //                     G.event.emit('arrowChange',{tag:'qiji',type:1});
    //                 }
    //             } else {
    //                 G.event.emit('arrowChange',{tag:'qiji',type:0});
    //             }
    //         } else {
    //             G.event.emit('arrowChange',{tag:'qiji',type:0});
    //         }
    //     }
    //
    //     //魔法学院
    //     if (myLv >= G.gc.jz.mofacollege) {
    //         if (jzData.qiji > jzData.mofaxueyuan) {
    //             var jinbi = G.class.formula.compute(G.class.getConf('mfxy_base.upneed.jinbi'), {blv: jzData.mofaxueyuan});
    //             var dianneng = G.class.formula.compute(G.class.getConf('mfxy_base.upneed.dianneng'), {blv: jzData.mofaxueyuan});
    //             var kuangshi = G.class.formula.compute(G.class.getConf('mfxy_base.upneed.kuangshi'), {blv: jzData.mofaxueyuan});
    //             if (jinbi <= myJb && dianneng <= myMc && kuangshi <= myKs) {
    //                 G.event.emit('arrowChange',{tag:'mofaxueyuan',type:1});
    //             } else {
    //                 G.event.emit('arrowChange',{tag:'mofaxueyuan',type:0});
    //             }
    //         } else {
    //             G.event.emit('arrowChange',{tag:'mofaxueyuan',type:0});
    //         }
    //     }
    //
    //     //城堡
    //     if (myLv >= G.gc.jz.chengbao) {
    //         if (jzData.qiji > jzData.chengbao) {
    //             var curLvConf = G.class.chengbao.getById(jzData.chengbao);
    //             var need = curLvConf.need;
    //             var obj = {};
    //             for (var j = 0; j < need.length; j++) {
    //                 obj[need[j].t] = need[j].n;
    //             }
    //             if (obj.jinbi <= myJb && obj.mucai <= myMc && obj.kuangshi <= myKs) {
    //                 G.event.emit('arrowChange',{tag:'chengbao',type:1});
    //             } else {
    //                 G.event.emit('arrowChange',{tag:'chengbao',type:0});
    //             }
    //         } else {
    //             G.event.emit('arrowChange',{tag:'chengbao',type:0});
    //         }
    //     }
    //
    //     //铁匠铺
    //     if (myLv >= G.gc.jz.tiejiangpu) {
    //         if (jzData.qiji > jzData.tiejiangpu) {
    //             var curLvConf = G.class.tiejiangpu.getById(jzData.tiejiangpu);
    //             var need = curLvConf.need;
    //             var obj = {};
    //             for (var j = 0; j < need.length; j++) {
    //                 obj[need[j].t] = need[j].n;
    //             }
    //             if (obj.jinbi <= myJb && obj.mucai <= myMc && obj.kuangshi <= myKs) {
    //                 G.event.emit('arrowChange',{tag:'tiejiangpu',type:1});
    //             } else {
    //                 G.event.emit('arrowChange',{tag:'tiejiangpu',type:0});
    //             }
    //         } else {
    //             G.event.emit('arrowChange',{tag:'tiejiangpu',type:0});
    //         }
    //     }
    // };
    G.event.on('arrowChange', function (d) {

        if (d && d.tag) {
            if (d.type == 1) {
                switch(d.tag) {
                    case 'qiji':
                        G.setNewArrow(G.frame.main.city.ui.finds('wz_qj'),0,getJZPos('wz_qj'));
                        break;
                    case 'mofaxueyuan':
                        G.setNewArrow(G.frame.main.city.ui.finds('wz_mfxy'),0,getJZPos('wz_mfxy'));
                        break;
                    case 'chengbao':
                        G.setNewArrow(G.frame.main.city.ui.finds('wz_cb'),0,getJZPos('wz_cb'));
                        break;
                    case 'tiejiangpu':
                        G.setNewArrow(G.frame.main.city.ui.finds('wz_tjp'),0,getJZPos('wz_tjp'));
                        break;
                    default :
                        break;
                }
            } else {
                switch(d.tag) {
                    case 'qiji':
                        G.removeNewArrow(G.frame.main.city.ui.finds('wz_qj'));
                        break;
                    case 'mofaxueyuan':
                        G.removeNewArrow(G.frame.main.city.ui.finds('wz_mfxy'));
                        break;
                    case 'chengbao':
                        G.removeNewArrow(G.frame.main.city.ui.finds('wz_cb'));
                        break;
                    case 'tiejiangpu':
                        G.removeNewArrow(G.frame.main.city.ui.finds('wz_tjp'));
                        break;
                    default :
                        break;
                }
            }
        }
    });
    function getJZPos(name) {
        var name2pos = {
            wz_tjp:cc.p(0,25),
            wz_mfxy:cc.p(0,25),
            wz_jyh:cc.p(0,0),
            wz_kd:cc.p(0,0),
            wz_cb:cc.p(0,25),
            wz_qj:cc.p(0,25)
        };
        return name2pos[name];
    }
})();