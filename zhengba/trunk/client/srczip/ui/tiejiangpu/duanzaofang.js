/**
 * Created by LYF on 2019-03-4
 */

(function () {
    //锻造坊
    var ID = 'duanzaofang';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            me.nodes.img_sdzl.setZoomScale(0.05);
            me.nodes.img_sdmw.setZoomScale(0.05);
            me.nodes.img_dwjl.setZoomScale(0.05);

            // if(P.gud.lv < 80) me.nodes.img_sdmw.setBright(false);
            //和神殿地牢相同的开启条件
            if((X.checkIsOpen('sddl') === 1 && P.gud.lv < 80) || !X.checkIsOpen('sddl')) {
                me.nodes.img_sdmw.setBright(false);
            }else {
                me.nodes.img_sdmw.setBright(true);
            }

            me.nodes.img_sdzl.click(function () {

                G.frame.tiejiangpu.show();
            }, 500);


            me.nodes.img_sdmw.click(function () {
                var isOpen = X.checkIsOpen('sddl');
                if (isOpen === 1) {
                    if(P.gud.lv < 80) {
                        return G.tip_NB.show(X.STR(L("XJKQ"), 80) + L("ZBFM"));
                    }
                    G.frame.zhuangbeifumo.show();
                } else {
                    if(!isOpen){
                        return G.tip_NB.show(L("ZBFMKAIQI"));
                    }
                    G.frame.zhuangbeifumo.show();
                }
            }, 500);

            // if(P.gud.lv < 75) me.nodes.img_dwjl.setBright(false);
            //和11星相同开启条件
            if(!X.checkIsOpen('dwjl')) me.nodes.img_dwjl.setBright(false);

            me.nodes.img_dwjl.click(function () {

                if(!X.checkIsOpen('dwjl')) return G.tip_NB.show(X.STR(L("KQXTHKQ"), 31) + L("DWJL"));

                G.frame.diaowen_tisheng.show();
            }, 500);
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
            X.audio.playEffect("sound/opentiejiangpu.mp3");
        },
        onShow: function () {
            var me = this;
            me.showToper();

            G.class.ani.show({
                json: "ani_tiejiangpu_fenwei",
                addTo: me.nodes.dh,
                repeat: true,
                autoRemove: false
            });

            me.checkRedPoint();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        checkRedPoint: function () {
            var me = this;

            if (G.DATA.hongdian.glyph) {
                G.setNewIcoImg(me.nodes.img_dwjl);
                me.nodes.img_dwjl.redPoint.setPosition(591, 144);
            } else {
                G.removeNewIco(me.nodes.img_dwjl);
            }
        }
    });

    G.frame[ID] = new fun('duanzhao_fy.json', ID);
})();