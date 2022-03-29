/**
 * Created by Zhangming on 2018-03-14
 */
(function () {
    //通用奖励预览
    var ID = 'ui_tip_prize';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        setContents: function () {
            var me = this;

            var data = this.data();
            me.ui.render({
                // 标题, (查看奖励, 领取奖励)
                top_title: data.title || L('showPrizeTxt'),
            });

            // 奖励描述
            me.setRT(me.view.nodes.panel_title, data.intr || '');
            
            var prize = [].concat(data.prize || []);
            var listView = me.view.nodes.listview;
            listView.removeAllChildren();
            for (var i = 0; i < prize.length; i++){
                var p = G.class.sitem(prize[i], true);
                p.setScale(0.8);
                // p.setPosition(cc.p(ui.width / 2, ui.height / 2));
                p.setTouchEnabled(true);
                p.setSwallowTouches(false);
                p.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.iteminfo.data(sender).show();
                    }
                });
                listView.pushBackCustomItem(p);
            }
        },
        setRT: function(lay, str){
            var me = this;

            var rt = new X.bRichText({
                size: 24,
                maxWidth: lay.width,
                lineHeight: 24,
                color:G.gc.COLOR.n5
            });
            rt.text(str);
            rt.setPosition(cc.p( (lay.width-rt.trueWidth())*0.5, lay.height - rt.trueHeight() ));
            lay.removeAllChildren();
            lay.addChild(rt);
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_gb.click(function () {
                me.remove();
            });

            var btns = me.data().btns || {
                count:1,
                colors:['btn_lan.png'],
                titles:[L('BTN_OK')],
                funs:[
                  function(){
                    me.remove();
                  }
                ]
            };
            if(btns){
                X.addBtn(me.view.nodes.panel_btn, {
                    count: btns.count,
                    texture: btns.colors, // ['btn_lan.png', 'btn_hong.png']
                    title: btns.titles, // [L('BTN_OK')],
                    callback: btns.funs
                });
            }
        },
        onOpen: function () {
            var me = this;

            new X.bView('ui_tip_tishi3.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
                me.bindUI();
                me.setContents();
            })
        },
    });

    G.frame[ID] = new fun('ui_tip1.json', ID);
})();