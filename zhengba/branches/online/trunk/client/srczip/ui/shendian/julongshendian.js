/**
 * Created by LYF on 2019/1/10.
 */
(function () {
    //巨龙神殿
    var ID = 'julongshendian';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {

                me.remove();
            });

            if(P.gud.lv < G.class.opencond.getLvById("fashita")){
                me.nodes.img_sdzl.setBright(false);
            }
            me.nodes.img_sdzl.setZoomScale(0.05);
            me.nodes.img_sdzl.click(function () {

                if(P.gud.lv < G.class.opencond.getLvById("fashita")){
                    G.tip_NB.show(X.STR(L("XYLVKQ"), G.class.opencond.getLvById("fashita")) + L("FST"));
                    return;
                }
                G.frame.dafashita.show();
            });

            // if(P.gud.lv < 35){
            //     me.nodes.img_qxjj.setBright(false);
            // }
            me.nodes.img_qxjj.setBright(false);
            me.nodes.img_qxjj.setTouchEnabled(false);
            // me.nodes.img_qxjj.click(function () {
            //     G.frame.shendian_qxjj.checkShow();
            // });

            if(P.gud.lv < 45){
                me.nodes.img_sdmw.setBright(false);
            }
            me.nodes.img_sdmw.setZoomScale(0.05);
            me.nodes.img_sdmw.click(function () {
                if(P.gud.lv < 45){
                    G.tip_NB.show(X.STR(L("XYLVKQ"), 45));
                    return;
                }
                G.frame.shendianmowang.checkShow();
            });
        },
        checkRedPoint: function() {
            var me = this;
            var data = G.DATA.hongdian.fashita;
            var valArr = ["fashita", "qyjj", "devil"];
            var btnArr = [me.nodes.img_sdzl, me.nodes.img_qxjj, me.nodes.img_sdmw];

            if(!cc.isNode(me.ui)) return;

            for (var i = 0; i < valArr.length; i ++) {
                if(data[valArr[i]]) {
                    G.setNewIcoImg(btnArr[i], .9);
                    btnArr[i].getChildByName("redPoint").setPosition(590, 202);
                } else {
                    G.removeNewIco(btnArr[i]);
                }
            }
        },
        getData: function(callback){
            var me = this;

            // G.ajax.send("rank_open", [2], function (d) {
            //     if(!d) return;
            //     var d = JSON.parse(d);
            //     if(d.s == 1){
            //         me.DATA = d.d;
            //
            //     }
            // })
            callback && callback();
        },
        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        show: function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;

            me.showToper();
            me.checkRedPoint();
            me.ui.setTimeout(function () {
                G.guidevent.emit("shendianzhiluOpenOver");
            }, 300);
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("fashita", 1);
        },
        setContents: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('shendianzhilu_fy.json', ID);
})();