/**
 * Created by  on 2019//.
 */
(function () {
    //占领奖励
    var ID = 'alaxi_zljl';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = JSON.parse(JSON.stringify(me.data()));
            me.nodes.tip_title.setString(me.DATA.name + L("GONGHUIFIGHT20"));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
            new X.bView('ghz_tip_jdzljl.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
                me.view.nodes.txt_ms.setString(L("GONGHUIFIGHT31"));
                cc.enableScrollBar(me.view.nodes.listview);
                me.setContents();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var data = [].concat(me.DATA.baserankprize);
            data.push([
                [4, 4],
                [me.DATA.luckyprize[0], me.DATA.luckyprize[1]]
            ]);
            me.view.nodes.listview.removeAllChildren();
            for(var i = 0; i < data.length; i++){
                var list = me.view.nodes.list.clone();
                me.setItem(list,data[i],i+1);
                me.view.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function (ui,data,index) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            X.render({
                ico1: function (node) {
                    X.alignItems(node, data[1], 'left', {
                        touch: true
                    });
                },
                ico2: function (node) {
                    node.setTouchEnabled(false);
                    node.removeAllChildren();
                    var tc = G.frame.alaxi_main.DATA.cityinfo[me.DATA.id];
                    var item = G.class.sitem({a: tc.a, t: tc.t, n: index < 4 ? tc['n' + index] : tc.lucky});
                    G.frame.iteminfo.showItemInfo(item);
                    item.setPosition(node.width / 2, node.height / 2);
                    node.addChild(item);
                },
                panel_pm:function (node) {
                    node.removeBackGroundImage();
                    if(index > 3){
                        node.setBackGroundImage('img/gonghui/ghz/wz_xygh.png',1);
                    }else {
                        node.setBackGroundImage('img/public/img_paihangbang_' + index + ".png",1);
                    }
                }
            },ui.nodes);
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();