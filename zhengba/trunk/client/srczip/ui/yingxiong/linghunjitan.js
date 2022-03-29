/**
 * Created by LYF on 2019/1/10.
 */
(function () {
    //巨龙神殿
    var ID = 'linghunjitan';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            
            cc.enableScrollBar(me.nodes.listview);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            me.action.play("wait", true);
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.setContents();
            me.checkRedPoint();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.nodes.img_rhjt.setZoomScale(0.02);
            me.nodes.img_fjjt.setZoomScale(0.02);
            me.nodes.img_yxlz.setZoomScale(0.02);
            me.nodes.img_mjcs.setZoomScale(0.02);

            me.nodes.img_rhjt.click(function () {
                G.frame.yingxiong_hecheng.show();
            });

            me.nodes.img_fjjt.click(function () {
                G.frame.yingxiong_fenjie.show();
            });

            me.nodes.img_yxlz.click(function () {
                if(P.gud.lv >= G.class.opencond.getLvById("jiban")){
                    G.frame.jiban_main.show();
                }else {
                    G.tip_NB.show(L("WUJIANGKAIQI"));
                }
            });

            var conf = {
                "id": "9",
                "icon":"ico_event_mjzh",
                "title": "魔镜重生",
                "scale": 5,
                "checkIsOpenId": "mjzh",
                "order": 9
            };

            me.nodes.img_mjcs.click(function () {
                G.frame.mjzh.show();
            });
        },
        //羁绊红点
        checkRedPoint:function () {
            var me = this;
            if(G.DATA.hongdian.jiban && G.DATA.hongdian.jiban.hd == 1){
                G.setNewIcoImg(me.nodes.img_yxlz);
                me.nodes.img_yxlz.finds('redPoint').setPosition(cc.p(580,163));
            }else {
                G.removeNewIco(me.nodes.img_yxlz);
            }
        }
    });
    G.frame[ID] = new fun('ronghejitan_fy.json', ID);
})();