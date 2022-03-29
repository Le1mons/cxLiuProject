/**
 * Created by LYF on 2018/7/19.
 */
(function () {
    //每日试炼购买次数
    var ID = 'meirishilian_gm';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            // me.nodes.txt_title.setString(L("GM"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
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

            new X.bView('tishi.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                me.view.nodes.text_xian.setString("----------------------------------");
                me.view.nodes.text_ts.setString(L("TSVIP"));
                me.view.nodes.text_ts.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
                me.view.nodes.text_ts.setTextColor(cc.color('#804326'));
                cc.enableScrollBar(me.view.nodes.panel_txt);
                me.setContents();
                me.setButton();
            });
        },
        onHide: function () {
            var me = this;
        },
        setButton: function(){
            var me  = this;
            var btn = new ccui.Button();
            btn.setTouchEnabled(true);
            btn.setAnchorPoint(C.ANCHOR[5]);
            btn.setTitleFontSize(24);
            btn.setTitleColor(cc.color(G.gc.COLOR.n13));
            me.view.nodes.panel_btn.addChild(btn);
            btn.setPosition(me.view.nodes.panel_btn.width / 2, me.view.nodes.panel_btn.height / 2);
            btn.setTitleFontName(G.defaultFNT);
            btn.loadTextureNormal('img/public/btn/btn1_on.png', ccui.Widget.PLIST_TEXTURE);
            btn.setTitleText(L('BTN_OK'));
            btn.click(function () {
                if(me.DATA.maxnum - me.DATA.buynum < 1){
                    G.tip_NB.show(L("GMCSBZ"));
                    return;
                }
                if(P.gud.rmbmoney < G.class.meirishilian.getCon().buyneed[me.DATA.buynum + 1][0].n){
                    G.tip_NB.show(L("ZSBZ"));
                    return;
                }
                G.ajax.send("mrsl_buynum", [me.type], function (d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1){
                        G.event.emit("sdkevent", {
                            event: "mrsl_buynum",
                            data:{
                                mrslType:me.type,
                                consume:me.need,
                            }
                        });
                        G.tip_NB.show(L("GMCG"));
                        G.frame.meirishilian.getData(function () {
                            G.frame.meirishilian.setCS();
                            me.setContents();
                        });
                        G.hongdian.getData("mrsl", 1, function () {
                            G.frame.meirishilian.checkRedPoint();
                        })
                    }
                }, true);
            })
        },
        setContents: function () {
            var me = this;
            me.DATA = G.frame.meirishilian.DATA;
            me.type = G.frame.meirishilian.type;
            var num = new ccui.Text();
            var num1 = me.DATA.maxnum - me.DATA.buynum;
            num.setString(' '+ num1);
            num.setTextColor(cc.color('#78ff2f'));
            num.setFontSize(24);
            num.setFontName(G.defaultFNT);
            var icon = new ccui.ImageView(G.class.getItemIco(G.class.meirishilian.getCon().buyneed[me.DATA.buynum + 1][0].t), 1);
            var str = X.STR(L("GMSLCS"),G.class.meirishilian.getCon().buyneed[me.DATA.buynum + 1][0].n);
            me.need = G.class.meirishilian.getCon().buyneed[me.DATA.buynum + 1];
            var _maxWidth = me.view.nodes.panel_txt.width;
            var rh = new X.bRichText({
                size: 24,
                maxWidth: _maxWidth,
                lineHeight: 26,
                family: G.defaultFNT,
                color: '#804326'
            });
            rh.text(str, [icon,num]);
            if(!str.indexOf('<br>') && rh.trueHeight() <= 26){
                me.view.nodes.panel_txt.x += (me.view.nodes.panel_txt.width/2 - rh.trueWidth()/2);
            }
            me.view.nodes.panel_txt.removeAllChildren();
            me.view.nodes.panel_txt.addChild(rh);
            me.view.nodes.panel_txt.setPositionY(190);
        },
    });
    G.frame[ID] = new fun('ui_tip_tishi.json', ID);
})();