 (function () {
     var ID ='loading';
     var fun = X.bUi.extend({
         ctor: function (json,id) {
             var me = this;
             me._super(json,id);
         },
         onOpen: function () {
             var me = this;
         },
         onShow: function () {
             var me = this;
             me.nodes.bg_denglu.hide();
             me.ui.finds('panel_dltm').hide();
             me.ui.finds('txt_loading_jdt$').hide();
             me.ui.finds('mask$').hide();
             me.ui.finds('Image_5').hide();
             me.ui.zIndex = 9999;

             if(me.timer){
                 me.ui.clearTimeout(me.timer);
                 delete me.timer;
             }
             me.timer = me.ui.setTimeout(function(){
                 me.remove();
             },5000);
         },
         onRemove: function () {
             var me = this;
         },
     });
    
     G.frame[ID] = new fun('loading.json', ID);
 })();

 G.frame.loadingIn = {
     show: function (times) {
         var me = this;
         if (!cc.isNode(this.ui)) {
             this.ui = new ccui.Layout();
             this.ui.setContentSize(cc.director.getWinSize());
             this.ui.setTouchEnabled(true);
             cc.director.getRunningScene().addChild(this.ui);
             this.ui.zIndex = 110000;

             me.ui.setTimeout(function () {
                 me.remove();
             }, times || 6000);
         }
     },
     remove: function () {
         cc.isNode(this.ui) && this.ui.removeFromParent();
         this.ui && delete this.ui;
     }
 };