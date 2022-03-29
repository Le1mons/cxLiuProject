// // 悬壶济世, 恢复所有英雄一半的血量和怒气
// (function(){
//     G.class.mapGrid8 = G.class.controlGrid.extend({
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
//                 me.gotoEvent();
//             }, true);
//         },
//         gotoEvent: function(){
//             var me = this;
//
//             G.frame.shishihuilang_tip_ffnp.data({
//                 title: L('yxzd_event5'),
//                 desc: L('yxzd_title_event5'),
//                 canGoto:me.canGoto(),
//                 open: function(){
//                     me.checkPlot('before');
//                     var conf = G.gc.jqevent[me.data.custom.event];
//                     G.plotevent.emit('grid' + conf.type + '_open');
//                 },
//                 callback: function(){
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         me.checkPlot('after');
//                         G.plotevent.emit('grid8_over');
//                         me.map.refreshGrids();
//                     });
//                 }
//             }).show();
//         },
//     });
// })();
//
//
