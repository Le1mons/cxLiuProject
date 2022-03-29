/**
 * Created by LYF on 2018/6/25.
 */
(function () {
    //邮件内容
    var ID = 'youjian_nr';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{releaseRes:false,action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.tip_title.setString(L("YOUJIAN"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function (sender, type) {
                me.remove();
            })
        },
        viewBtn: function(){
            var me = this;
            me.view.nodes.btn_lq.click(function (sender, type) {
                G.ajax.send("email_getprize", [me.data().eid], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: me.data().prize
                        }).show();
                        G.frame.youjian.refreshPanel();
                        me.remove();
                    }
                })
            });

            me.view.nodes.btn_hx.click(function (sender, type) {
                G.frame.youjian_fs.data({type: 1, data: me.data()}).show();
            });

            me.view.nodes.btn_pb.click(function () {

                me.ajax("friend_shield", [me.data().senduid, 0], function (str, data) {
                    if(data.s == 1) {
                        G.tip_NB.show(L('SHEZHI') + L('SUCCESS'));
                    }
                });
            });
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

            new X.bView("youjian_yjnr.json", function (node) {
                me.nodes.panel_nr.addChild(node);
                me.view = node;
                me.viewBtn();
                me.setContents();
                cc.enableScrollBar(node.nodes.listview);
            })
        },
        onHide: function () {
            var me = this;

            G.hongdian.getData("email", 1, function () {
                G.frame.youjian.checkRedPoint();
            });
        },
        setContents: function () {
            var me = this;
            var data = me.data();
            var lkr = new ccui.Text();
            var djs = new ccui.Text();
            lkr.setFontName(G.defaultFNT);
            djs.setFontName(G.defaultFNT);
            djs.setString(X.moment(data.passtime - G.time));
            lkr.setFontSize(18);
            djs.setFontSize(18);
            lkr.setTextColor(cc.color(G.gc.COLOR.n4));
            djs.setTextColor(cc.color(G.gc.COLOR[4]));
            lkr.setPosition(500, 150);
            djs.setPosition(500, 120);
            lkr.setAnchorPoint(1, 0.5);
            djs.setAnchorPoint(1, 0.5);
            me.view.addChild(lkr);
            me.view.addChild(djs);

            me.view.nodes.text_bt.setString("");
            me.view.nodes.panel_xx.setString("");

            var rh1 = X.setRichText({
                str: data.title,
                parent: me.view.nodes.text_bt,
                size: 20
            });
            rh1.setPosition(me.view.nodes.text_bt.width / 2 - rh1.trueWidth() / 2,
                me.view.nodes.text_bt.height / 2 - rh1.trueHeight() / 2);

            var rh2 = X.setRichText({
                str: "  " + data.content,
                parent: me.view.nodes.panel_xx,
                size: 20
            });
            rh2.setPosition(me.view.nodes.panel_xx.width / 2 - rh2.trueWidth() / 2,
                me.view.nodes.panel_xx.height - rh2.trueHeight());


            if(data.type == "1"){
                lkr.setString(L("XTGLY"));
                if(data.prize){
                    lkr.setPosition(500, 310);
                    djs.setPosition(500, 280);
                    me.view.nodes.text_xian.show();
                    me.view.nodes.text_lqjl.show();

                    if(data.prize.length > 4) {
                        for (var i in data.prize) {
                            var item = G.class.sitem(data.prize[i]);
                            G.frame.iteminfo.showItemInfo(item);
                            me.view.nodes.listview.pushBackCustomItem(item);
                        }
                    } else {
                        X.alignCenter(me.view.nodes.panel_item, data.prize, {
                            touch: true
                        });
                    }

                    me.view.nodes.panel_item.show();
                    if(data.getprize){
                        me.view.nodes.img_ylq.show()
                        me.view.nodes.btn_lq.hide();
                    }else{
                        me.view.nodes.btn_lq.show();
                        me.view.nodes.img_ylq.hide()
                    }
                }
            }else if(data.type == "3"){
                lkr.setString(data.name || data.binduid);
                me.view.nodes.btn_pb.show();
                me.view.nodes.btn_hx.show();
            }else{
                lkr.setString(L("GHHZ"));
            }
        }
    });
    G.frame[ID] = new fun('youjian2.json', ID);
})();