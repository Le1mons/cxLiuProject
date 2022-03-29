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

            X.radio([me.nodes.btn_sz1, me.nodes.btn_sz2], function (sender) {
                me.setContents({
                    btn_sz1$: 0,
                    btn_sz2$: 1
                }[sender.getName()]);
                me.setButton();
            });

            me.nodes.btn_an.click(function () {
                if(me.DATA.length < 1 || me.DATA[0].v < conf.data[me.confIndex][me.index].val) {
                    G.frame.chongzhi.data({
                        type:2
                    }).once("hide", function () {
                        me.getData(function () {
                            me.setContents(me.index);
                            me.setButton();
                            G.hongdian.getData("meirishouchong", 1);
                            me.checkRedPoint();
                        })
                    }).show();
                    return;
                }
                me.ajax("mrsc_getprize", [me.index], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.once("hide", function () {
                            // me.remove();
                        }).data({
                            prize: data.d.prize
                        }).show();
                        me.getData(function () {
                            me.setContents(me.index);
                            me.setButton();
                            G.hongdian.getData("meirishouchong", 1);
                            me.checkRedPoint();
                        })
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            var daykey = X.keysOfObject(G.gc.meirishouchong.data);
            if(X.getSeverDay() >= daykey[1]*1){
                me.confIndex = daykey[1];
            }else {
                me.confIndex = daykey[0];
            }
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
                me.nodes.btn_sz1.triggerTouch(ccui.Widget.TOUCH_ENDED);
                me.checkRedPoint();
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
        setContents: function (index) {
            var me = this;
            me.index = index;
            var conf = G.class.getConf("meirishouchong").data[me.confIndex][index];
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
        checkRedPoint:function(){
            var me = this;
            var num = 0;
            if(me.DATA[0]){
                num = me.DATA[0].v || 0
            }
            for(var i = 1; i < 3; i++){
                var conf = G.gc.meirishouchong.data[me.confIndex][i-1];
                if(num >= conf.val && !X.inArray(me.DATA[0].receive, (i-1))){
                    G.setNewIcoImg(me.nodes['btn_sz' + i]);
                    me.nodes['btn_sz' + i].finds('redPoint').setPosition(140,35);
                }else {
                    G.removeNewIco(me.nodes['btn_sz' + i]);
                }
            }
        },
        setButton: function () {
            var me = this;
            var conf = G.class.getConf("meirishouchong");

            me.nodes.btn_an.show();
            me.nodes.btn_ylq.hide();
            G.removeNewIco(me.nodes.btn_an);
            if(me.DATA.length > 0) {
                if(X.inArray(me.DATA[0].receive, me.index)){
                    // 已领取
                    me.nodes.wz_sz.hide();
                    me.nodes.img_cz.hide();
                    me.nodes.img_lq.show();
                    me.nodes.btn_an.hide();
                    me.nodes.btn_ylq.show();
                }else if(me.DATA[0].v >= conf.data[me.confIndex][me.index].val){
                    // 领取
                    me.nodes.wz_sz.hide();
                    me.nodes.img_cz.hide();
                    me.nodes.img_lq.show();
                    me.setbtn_ani(me.nodes.btn_an, "ani_shouchong_lingqu");
                    G.setNewIcoImg(me.nodes.btn_an);
                    me.nodes.btn_an.finds('redPoint').setPosition(155,45);
                }else {
                    me.nodes.wz_sz.show();
                    me.nodes.img_cz.show();
                    me.nodes.img_lq.hide();
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
            me.nodes.btn_an.setScale(0.8);
        }
    });
    G.frame[ID] = new fun('jinrishouchong.json', ID);
})();