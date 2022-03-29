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

            new X.bView("youjian_yjnr.json", function (node) {
                me.nodes.panel_nr.addChild(node);
                me.view = node;
                me.viewBtn();
                me.setContents()
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

            me.view.nodes.text_bt.setString(data.title);
            me.view.nodes.panel_xx.setString("  " + data.content);
            if(data.type == "1"){
                lkr.setString(L("XTGLY"));
                if(data.prize){
                    lkr.setPosition(500, 310);
                    djs.setPosition(500, 280);
                    me.view.nodes.text_xian.show();
                    me.view.nodes.text_lqjl.show();
                    X.alignCenter(me.view.nodes.panel_item, data.prize, {
                        touch: true
                    });
                    me.view.nodes.panel_item.show();
                    if(data.getprize){
                        me.view.nodes.img_ylq.show()
                    }else{
                        me.view.nodes.btn_lq.show();
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