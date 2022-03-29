// (function(){
//     // 直接访问的动作类型, 按了做什么
//
//     var _fun = {
//         doEvent: function(){
//             var me = this;
//             G.class.controlGrid.prototype.doEvent.apply(this,arguments);
//
//             me.map.myRole.findWayAndMoveTo(me.grid, function(){
//                 me['gotoEvent' + me.data.custom.event] && me['gotoEvent' + me.data.custom.event]();
//             }, true);
//         },
//         // 吊桥机关
//         gotoEvent7: function(){
//             var me = this;
//             var conf = G.gc.jqevent[me.data.custom.event];
//
//             G.frame.alert.data({
//                 cancelCall:null,
//                 open: function(){
//                     me.checkPlot('before');
//                     G.plotevent.emit('grid' + conf.type + '_open');
//                 },
//                 okCall: function () {
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         G.plotevent.emit('grid' + conf.type + '_over');
//                         if(!me.checkPlot('after')){
//                             me.map.refreshGrids();
//                         }
//                     });
//                 },
//                 sizeType:3,
//                 close:true,
//                 closeCall:null,
//                 richText:me.getConf().gzvalu.say
//             }).show();
//         },
//         // 告示牌
//         gotoEvent27: function(){
//             var me = this;
//             var conf = G.gc.jqevent[me.data.custom.event];
//
//             G.frame.alert.data({
//                 cancelCall:null,
//                 open: function(){
//                     me.checkPlot('before');
//                     G.plotevent.emit('grid' + conf.type + '_open');
//                 },
//                 okCall: function () {
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         if(!me.checkPlot('after')){
//                             me.map.refreshGrids();
//                         }
//                     });
//                 },
//                 sizeType:3,
//                 close:true,
//                 closeCall:null,
//                 richText:me.getConf().gzvalu.say
//             }).show();
//         },
//         // 祭坛
//         gotoEvent33: function(){
//             var me = this;
//             var conf = G.gc.jqevent[me.data.custom.event];
//
//             G.frame.alert.data({
//                 cancelCall:null,
//                 open: function(){
//                     me.checkPlot('before');
//                     G.plotevent.emit('grid' + conf.type + '_open');
//                 },
//                 okCall: function () {
//                     G.DAO.shishihuilang.walk([me.data.idx], function(){
//                         G.plotevent.emit('grid' + conf.type + '_over');
//                         if(!me.checkPlot('after')){
//                             me.map.refreshGrids();
//                         }
//                     });
//                 },
//                 sizeType:3,
//                 close:true,
//                 closeCall:null,
//                 richText:me.getConf().gzvalu.say || ''
//             }).show();
//         },
//         // 青石板机关
//         gotoEvent53: function(){
//             var me = this;
//             var conf = G.gc.jqevent[me.data.custom.event];
//
//             G.DAO.shishihuilang.walk([me.data.idx], function(){
//                 G.plotevent.emit('grid' + conf.type + '_over');
//                 if(!me.checkPlot('after')){
//                     me.map.refreshGrids();
//                 }
//             });
//         },
//     };
//
//     cc.each(_fun,function(v,k){
//         G.class.mapGrid10.prototype[ k ] = v;
//     });
// })();