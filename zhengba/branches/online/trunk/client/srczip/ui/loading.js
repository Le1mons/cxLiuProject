// (function () {
//     var ID ='loading';
	
//     var fun = X.bUi.extend({
//         ctor: function (json,id) {
//             var me = this;
//             me._super(json,id, {action:true}); // , cache:true
//         },
//         onOpen: function () {
//             var me = this;
//         },
//         onShow: function () {
//             var me = this;
//             me.action.gotoFrameAndPlay(0,true);

//             if(me.timer){
//                 me.ui.clearTimeout(me.timer);
//                 delete me.timer;
//             }
//             me.timer = me.ui.setTimeout(function(){
//                 me.remove();
//             },5000);
//         },
//         onRemove: function () {
//             var me = this;
//         },
//     });
    
//     G.frame[ID] = new fun('loading.json', ID);
// })();