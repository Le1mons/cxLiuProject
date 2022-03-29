// // 可获得大量奖励
// // 石堆   可使海眼变成可行走的沼泽地
// (function(){
//     G.class.mapGrid9 = G.class.controlGrid.extend({
//         ctor: function (data, node) {
//             var me = this;
//             data.barrier = '0';
//             me._super.apply(this,arguments);
//         },
//         doEvent: function(){
//             var me = this;
//             me._super.apply(this,arguments);
//
//             me.map.myRole.findWayAndMoveTo(me.grid, function(){
//                 if(!me.getConf().prize || me.getConf().prize.length == 0){
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         me.map.refreshGrids();
//                         me.gotoEvent();
//                     });
//                 }else{
//                     me.gotoEvent();
//                 }
//             }, true);
//         },
//         gotoEvent: function(){
//             var me = this;
//
//             if(me['gotoEvent' + me.data.custom.event]){
//                 me['gotoEvent' + me.data.custom.event]();
//             }else{
//                 me.getPrize();
//                 me.checkPlot('after');
//             }
//             G.plotevent.emit('grid9_over');
//         },
//         gotoEvent26: function(){
//             var me = this;
//             me.getPrize();
//
//             // 第一次拾取石头, 触发引导
//             if(me.map.isFirstTouch(me.data.custom.event)){
//                 me.checkPlot('after');
//             }
//         },
//         getPrize: function(){
//             var me = this;
//
//             G.frame.priceTip.data({
//                 type:0,
//                 data:me.getConf().prize,
//                 callback: function(){
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         G.frame.shishihuilang_chapter.setMyShitou();
//                         me.map.refreshGrids();
//                     });
//                 },
//             }).show();
//         },
//     });
// })();
//
//
