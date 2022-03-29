/**
 * Created by lcx on
 */
(function () {
    //噬渊战场-老萨满对话
    var ID = 'shiyuanzhanchang_lsmdh';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.ui.finds('img_di2').zIndex = 2;
            me.ui.finds('ty_di5').zIndex = 2;
            me.nodes.img_1.zIndex = 2;
            me.nodes.img_2.zIndex = 2;
            me.nodes.txt_ms.zIndex = 2;
            me.nodes.btn_qy.zIndex = 2;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.ui.setTouchEnabled(false);
            me.nodes.panel_ui.setTouchEnabled(false);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.eventconf =  me.DATA.conf;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            me.nodes.panel_rw2.show();
            var duihua = G.gc.syzccom.duihua[me.eventconf.duihua];
            var xs = duihua.xianshi;
            for (var i=0;i<xs.length;i++){
                var hid = xs[i];
                if (hid==1){
                    me.xianshi = i+1;
                    hid = X.cacheByUid('mydzid');
                    me.nodes['txt_'+(i+1)].setString(P.gud.name);
                }else {
                    me.nodes['txt_'+(i+1)].setString(me.getmingzi(duihua));
                }
                me.nodes['panel_js'+(i+1)].removeAllChildren();
                X.setHeroModel({
                    parent: me.nodes['panel_js'+(i+1)],
                    data: {
                    },
                    model: hid,
                    callback:function (node) {

                        if (hid == X.cacheByUid('mydzid')){
                            node.setScale(1);
                            node.setPosition(140,95);
                        }else {
                            node.setScale(1);
                            node.setPosition(135,40);
                        }
                    }
                });
            }
            if (me.xianshi == 1){
                me.other = 2;
            } else {
                me.other = 1;
            }
            me.setDuihua(1);
        },
        setDuihua:function(idx){
            var me = this;
            me.nodes.zz3.show();
            me.nodes.zz3.setTouchEnabled(false);
            var duihua = G.gc.syzccom.duihua[me.eventconf.duihua];
            var nr = duihua[idx];
            if (!nr){
                G.frame.shiyuanzhanchang_lsmxz.once('show',function () {
                    me.remove();
                }).data({
                    idx:  me.DATA.idx,
                    conf:me.eventconf,
                    map:me.DATA.map
                }).show();
                return;
            }
            if (nr.lihui == 1){
                //是我自己说话
                me.nodes['panel_rw'+me.xianshi].zIndex = 1;
                me.nodes['panel_rw'+me.other].zIndex = -1;
                me.nodes['img_'+me.xianshi].show();
                me.nodes['img_'+me.other].hide();
            } else {
                me.nodes['panel_rw'+me.xianshi].zIndex = -1;
                me.nodes['panel_rw'+me.other].zIndex = 1;
                me.nodes['img_'+me.xianshi].hide();
                me.nodes['img_'+me.other].show();
            }
            var rh = X.setRichText({
                parent: me.nodes.txt_ms,
                str:nr.neirong,
                anchor: {x: 0, y: 0.5},
                pos: {x: 0, y: me.nodes.txt_ms.height-20},
                color:"#804326",
                size:22
            });
            me.nodes.txt_ms.setTouchEnabled(true);
            me.nodes.txt_ms.click(function (sender,type) {
                me.setDuihua(idx+1);
            });
            me.nodes.btn_qy.click(function (sender,type) {
               me.setDuihua(idx+1);
            });
        },
        getmingzi:function (duihua) {
            var me = this;
            for (var i in duihua){
                if (duihua[i].mingzi){
                    return duihua[i].mingzi;
                    break;
                }
            }
        }
    });
    G.frame[ID] = new fun('shiyuan_tk3.json', ID);
})();