/**
 * Created by LYF on 2018/10/24.
 */
(function () {
    //每日首充
    var ID = 'meirishouchong';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            var conf = G.class.getConf("meirishouchong");

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.nodes.btn_an.click(function () {
                if(me.DATA.length < 1 || me.DATA[0].v < conf.val) {
                    G.frame.chongzhi.once("hide", function () {
                        me.getData(function () {
                            me.setContents();
                            me.setButton();
                        })
                    }).show();
                    return;
                }
                me.ajax("mrsc_getprize", [], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.once("hide", function () {
                            me.remove();
                        }).data({
                            prize: data.d.prize
                        }).show();
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.getData(function () {
                me.setContents();
                me.setButton();
            });
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("meirishouchong", 1);
            G.view.mainView.getAysncBtnsData(function () {
                G.view.mainView.allBtns["lefttop"] = [];
                G.view.mainView.setSvrBtns();
            }, false, ["meirishouchong"]);
        },
        setContents: function () {
            var me = this;
            var conf = G.class.getConf("meirishouchong");
            var num = me.DATA[0] && me.DATA[0].v || 0;

            X.alignCenter(me.nodes.ico, conf.prize, {
                touch: true,
                mapItem: function (item) {
                    me.setitemani(item);
                }
            });

            me.nodes.wz_sz.setString(conf.val > num ? (conf.val - num) * 10 : 0);
            me.setbtn_ani(me.nodes.bg_mrsc, "ani_meirishouchong");
        },
        setitemani:function(node){
            var me = this;
            G.class.ani.show({
                json: "ani_wupingkuang",
                addTo: node,
                x: 50,
                y: 50,
                repeat: true,
                autoRemove: false,
                onload: function(node, action) {
                }
            });
        },
        getData: function (callback) {
            var me = this;
            G.view.mainView.getAysncBtnsData(function () {
                me.DATA = G.DATA.asyncBtnsData.meirishouchong;
                callback && callback();

            }, false, ["meirishouchong"]);
        },
        setButton: function () {
            var me = this;
            var conf = G.class.getConf("meirishouchong");


            if(me.DATA.length > 0) {
                if(me.DATA[0].receive){
                    // 已领取
                    me.nodes.wz_sz.hide();
                    me.nodes.img_cz.hide();
                    me.nodes.img_lq.show();
                    // me.ui.finds("btn_an").loadTextureNormal("img/shouchong/btn_shouchong_ylq.png", 1);
                    me.nodes.btn_an.setTouchEnabled(false);
                }else if(me.DATA[0].v >= conf.val){
                    // 领取
                    me.nodes.wz_sz.hide();
                    me.nodes.img_cz.hide();
                    me.nodes.img_lq.show();
                    // me.ui.finds("btn_an").loadTextureNormal("img/shouchong/wz_jrsclq.png", 1);
                    me.setbtn_ani(me.nodes.btn_an, "ani_lingqu");
                }else {
                    me.setbtn_ani(me.nodes.btn_an, "ani_woyaohaoli");
                }
            }else{
                me.setbtn_ani(me.nodes.btn_an, "ani_woyaohaoli");
            }
        },
        setbtn_ani:function(node,ani){
            var me = this;
            node.removeAllChildren();
            G.class.ani.show({
                json: ani,
                addTo: node,
                x: node.width / 2,
                y: node.height / 2,
                repeat: true,
                autoRemove: false,
            });
        }
    });
    G.frame[ID] = new fun('jinrishouchong.json', ID);
})();