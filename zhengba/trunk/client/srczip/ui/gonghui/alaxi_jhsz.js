/**
 * Created by  on 2019//.
 */
(function () {
    //集火设置
    var ID = 'alaxi_jhsz';
    var fun = X.bUi.extend({
        titleimg:['ico_ghz_sl','ico_ghz_kd','ico_ghz_tjp','ico_ghz_fmc','ico_ghz_nc'],
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.tip_title.setString(L("GONGHUIFIGHT25"));
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onShow: function () {
            var me = this;
            new X.bView('ghz_tip_jhsz.json', function (view) {
                me.view = view;
                me.ui.nodes.panel_nr.addChild(view);
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
            var cityArr = [];
            for (var id in G.gc.gonghuisiege.cityinfo) {
                if (G.gc.gonghuisiege.cityinfo[id].isopen) {
                    cityArr.push(G.gc.gonghuisiege.cityinfo[id]);
                }
            }
            cityArr.sort(function (a, b) {
                return a.id * 1 < b.id * 1 ? -1 : 1;
            });
            me.view.nodes.listview.removeAllChildren();
            me.view.nodes.img_zwnr.setVisible(cityArr.length == 0);
            for(var i = 0; i < cityArr.length ;i++){
                var list = me.view.nodes.list.clone();
                me.setItem(list,cityArr[i],i);
                me.view.nodes.listview.pushBackCustomItem(list);
            }
        },
        setItem:function (ui,data,index) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            data.id = index+1;
            X.render({
                panel_ico_jz:function (node) {
                    node.removeBackGroundImage();
                    node.setBackGroundImage('img/gonghui/ghz/' + me.titleimg[index] + ".png",1);
                },
                ico: function (node) {
                    var prize = G.class.sitem(G.frame.alaxi_main.DATA.cityinfo[data.id]);
                    G.frame.iteminfo.showItemInfo(prize);
                    prize.setPosition(node.width / 2, node.height / 2);
                    node.addChild(prize);
                },
                btn_jh: function (node) {
                    node.setVisible(G.frame.alaxi_main.DATA.assisted != data.id);
                    node.click(function () {
                        me.ajax("gonghuisiege_assisted", [data.id], function (str, _data) {
                            if (_data.s == 1) {
                                G.frame.alaxi_main.DATA.assisted = data.id;
                                G.frame.alaxi_main.showCity();
                                me.remove();
                            }
                        });
                    });
                },
                wz_jhgdz:function (node) {
                    node.setVisible(G.frame.alaxi_main.DATA.assisted == data.id);
                }
            },ui.nodes);
        }
    });
    G.frame[ID] = new fun('ui_tip1.json', ID);
})();