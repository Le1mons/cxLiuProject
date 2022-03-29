/**
 * Created by LYF on 2019/2/18.
 */
(function () {
    //王者雕塑
    var ID = 'wangzhediaosu';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
            me.fullScreen = true;
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            if(P.gud.uid != me.DATA.king_uid) me.nodes.btn_xhjl.hide();

            me.nodes.btn_xhjl.click(function () {

                G.frame.xianhuajiangli.show();
            });

            me.nodes.btn_bz.click(function () {

                G.frame.help.data({
                    intr:L('TS31')
                }).show();
            });

            me.nodes.btn_fanhui.click(function () {

                me.remove();
            });

            me.btn.click(function () {

                me.ajax("wzstatue_gift", [], function (str, data) {
                    if(data.s == 1) {
                        G.class.ani.show({
                            json: "ani_kuaisutiaozhan",
                            addTo: me.ui,
                            repeat: false,
                            autoRemove: true,
                            onend: function (node, action) {
                                G.frame.jiangli.data({
                                    prize: data.d.prize
                                }).show();
                            }
                        });

                        me.getData(function () {
                            me.setContents();
                        });
                    }
                })
            });
        },
        onOpen: function () {
            var me = this;

            me.btn = me.ui.finds("btn_baoming");
            me.fillSize();
            me.initUi();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("wzstatue_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if(d.s == 1){
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        show: function (conf) {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.bindBtn();
            me.showToper();
            me.setContents();
            me.nodes.txt_name.setString(G.DATA.asyncBtnsData.kingstatue);
            me.nodes.txt_wjqf.setString(G._SERVERNAME || "");
            me.checkRedPoint();

            G.class.ani.show({
                json: "ani_yingxiongdiaoxiang",
                addTo: me.nodes.panel_dh,
                repeat: true,
                autoRemove: false,
            });

            X.setRichText({
                str: X.STR(L("WZDSXX"), G.DATA.asyncBtnsData.kingstatue, me.DATA.season, me.DATA.groupid, Math.pow(2, 8 - me.DATA.deep)),
                parent: me.nodes.panel_mzwz,
                anchor: {x: 0.5, y: 0.5},
                pos: {x: me.nodes.panel_mzwz.width / 2, y: me.nodes.panel_mzwz.height / 2 - 8},
                size: 22,
                color: "#fdff54",
                outline: "#000000"
            });
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("kingstatue", 1);
        },
        setContents: function () {
            var me = this;

            me.nodes.txt_sz.setString(me.DATA.num);

            if(me.DATA.gift) {
                G.setNewIcoImg(me.btn, .8);
                me.btn.setEnableState(true);
            } else {
                me.btn.setEnableState(false);
                me.ui.finds("wz_baoming").setTextColor(cc.color("#6c6c6c"));
                G.removeNewIco(me.btn);
            }
        },
        checkRedPoint: function () {
            var me = this;
            var isHave = false;

            if (P.gud.uid != me.DATA.king_uid) return;

            var conf = G.gc.wangzherongyao.num2prize;
            var arr = [];

            for (var i in conf) {
                if(me.DATA.num >= i * 1) arr.push(i);
            }

            if(arr.length > me.DATA.reclist.length) isHave = true;

            if(isHave) G.setNewIcoImg(me.nodes.btn_xhjl);
            else G.removeNewIco(me.nodes.btn_xhjl);

        }
    });
    G.frame[ID] = new fun('wangzhediaoshu.json', ID);
})();