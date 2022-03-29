/**
 * Created by llx on 2018/11/26.
 */
(function (){
    //头像和框
    var ID = 'shejiao';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
            me.topMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('shejiao'))
            });
            me.nodes.listview.setTouchEnabled(true);
        },
        changeType: function (sender) {
            var me = this;
            if(sender.data){
                var type = sender.data.id;
            }else{
                var type = sender;
            }
            if(sender.disable) {
                G.tip_NB.show(sender.show);
                return;
            }
            me.curType = type;
            var viewConf = {
                "1": G.class.touxiang,
                "2": G.class.touxiangkuang,
                "3": G.class.liaotiankuang,
                "4": G.class.zhanshiyingxiong,
                "5": G.class.chenghao
            };

            var newView = new viewConf[type];
            me.ui.nodes.panel_nr.addChild(newView);

            if(cc.isNode(me._panels)){
                me._panels.removeFromParent();
                me._panels = newView;
            }else{
                me._panels = newView;
            }
        },
        bindBtn: function() {
            var me = this;
            me.ui.nodes.mask.click(function(){
                me.remove();
            })
        },

        onOpen:function() {
            var me = this;
            me.fillSize();
            me.bindBtn();
            me.initUi();
        },

        onShow: function() {
            var me = this;
            var type = (me.data() && me.data().tztype) || 1;
            me.topMenu.changeMenu(type);
        },

    });
    G.frame[ID] = new fun('setting.json', ID);
})();