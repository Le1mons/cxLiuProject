(function () {
    var ID = 'maze_sd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.check1 = me.ui.finds("panel_1").finds("btn_gx1$");
            me.check2 = me.ui.finds("panel_1").finds("btn_gx2$");
            me.check3 = me.ui.finds("panel_2").finds("btn_gx1$");
            me.check4 = me.ui.finds("panel_2").finds("btn_gx2$");
            me.chooseyw = 0;
            me.choosehero = 0;
            me.setContents()
            me.bindBtn()
        },
        setContents: function () {
            var me = this;
            me.check1.setSelected(me.chooseyw == 1);
            me.check2.setSelected(me.chooseyw == 2);
            me.check3.setSelected(me.choosehero == 1);
            me.check4.setSelected(me.choosehero == 2);
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            });
            me.check1.click(function (sender) {
                me.chooseyw = 2;
                sender.setTouchEnabled(false);

                me.check2.setSelected(false);
                me.check2.setTouchEnabled(true);
            })
            me.check2.click(function (sender) {
                me.chooseyw = 1;
                sender.setTouchEnabled(false);
                me.check1.setTouchEnabled(true);

                me.check1.setSelected(false);
                
            })
            me.check3.click(function (sender) {
                me.choosehero = 2;
                sender.setTouchEnabled(false);
                me.check4.setTouchEnabled(true);

                me.check4.setSelected(false);
                
            })
            me.check4.click(function (sender) {
                me.choosehero = 1;
                me.check3.setTouchEnabled(true);
                sender.setTouchEnabled(false);
                me.check3.setSelected(false);
                
            });
            me.nodes.btn.click(function (sender) {
                if(me.choosehero == 0 || me.chooseyw == 0){
                    return
                }
                G.frame.maze.saodang(me.chooseyw- 1 ,me.choosehero-1);
                me.remove();
            })
            me.nodes.btn_bc.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shendianmigong_yjsd.json', ID);
})();