/**
 * Created by
 */
(function () {
    //异界漩涡
    var ID = 'yijiexuanwo';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, { action: true });
        },
        bindBtn: function () {
            var me = this;
            X.render({
                btn_fh: function (node) {
                    node.click(function () {
                        me.remove();
                    });
                },
            }, me.nodes);
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.showToper();
        },
        onShow: function () {
            var me = this;
            var timestr = 1640131200;
            X.cacheByUid('showThtRed', 1);
            var btns = G.class.menu.get('yijiexuanwo');
            var aniArr = ['ani_chuanshuodatingxg_dh', 'ani_lianhuntaxg_dh', 'ani_shiyuanzcxg_dh'];
            for (var i = 0; i < 3; i++) {
                var btn = btns[i];
                var list = me.nodes.list1.clone();
                list.show();
                X.autoInitUI(list);
                list.nodes.panel_gq.removeBackGroundImage();
                G.class.ani.show({
                    json: aniArr[i],
                    addTo: list.nodes.panel_gq,
                    repeat: true,
                    autoRemove: false,
                });

                // list.nodes.panel_gq.setBackGroundImage('img/bg/img_m' + (i + 1) + '.png');
                list.nodes.txt_mz.setString(btn.title);
                list.nodes.panel_gq.setTouchEnabled(false);
                list.setTouchEnabled(true);
                list.btn = btn;
                list.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        if (sender.btn.frame == 'shiyuanzhanchang_floor') {
                            // if (G.time<timestr){
                            //     return G.tip_NB.show('该功能将于2021年12月22日8点开放');
                            // }
                            me.setSyzc();
                        }else if (sender.btn.frame == 'csdt_main'){
                            //传说大厅
                            // if (G.time<timestr){
                            //     return G.tip_NB.show('该功能将于2021年12月22日8点开放');
                            // }
                            G.frame[sender.btn.frame].show();
                        } else {
                            G.frame[sender.btn.frame].show();
                        }
                    }
                });
                list.setPosition(cc.p(me.nodes['panel_' + (i + 1)].width / 2, me.nodes['panel_' + (i + 1)].height / 2));
                me.nodes['panel_' + (i + 1)].removeAllChildren();
                me.nodes['panel_' + (i + 1)].addChild(list);
                me.nodes['panel_' + (i + 1)].setTouchEnabled(false);
            }
            me.refreshRedPoint();
        },
        setSyzc: function () {
            var me = this;
            var heros = G.DATA.yingxiong.list;
            var iscan = false;
            for (var i in heros) {
                if (heros[i].star >= 10) {
                    iscan = true;
                    break;
                }
            }
            if (!iscan) {
                return G.tip_NB.show(L('syzc_3'));
            }
            G.frame.shiyuanzhanchang_floor.show();
        },
        refreshRedPoint:function(){
          var me = this;
          var data = G.DATA.hongdian.syzc;
            if (data || X.inArray(G.DATA.hongdian.stagefund,'syzc')){
                G.setNewIcoImg(me.nodes.panel_3,0.8);
            }else {
                G.removeNewIco(me.nodes.panel_3);
            }
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('chuangshuodating.json', ID);
})();