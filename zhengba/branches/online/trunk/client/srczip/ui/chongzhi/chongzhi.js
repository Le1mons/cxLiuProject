/**
 * Created by lsm on 2018/6/29.
 */
(function () {
    //充值
    var ID = 'chongzhi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id,{action:true});
            me.preLoadRes = ["sale.png", "sale.plist"]
        },
        initUi: function () {
            var me = this;
            me.nodes.btn_quota.getChildren()[0].setString(L("MRXG"));
            var bntns = [me.nodes.btn_topup,me.nodes.btn_quota,me.nodes.btn_giftbag,me.nodes.btn_dailystore];
            me.nodes.btn_topup.setEnabled(true);
            me.ui.nodes.panel_nr.setTouchEnabled(true);
            X.radio(bntns, function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_topup$:'1',
                    btn_quota$:'2',
                    btn_giftbag$:'3',
                    btn_dailystore$:'4',
                };
                for(var i in bntns){
                    if(cc.isNode(bntns[i].getChildByName("redPoint"))){
                        bntns[i].getChildByName("redPoint").show();
                    }
                }
                if(cc.isNode(sender.getChildByName("redPoint"))){
                    sender.getChildByName("redPoint").hide();
                }
                me.changeType(name2type[name]);
            },{
                callback1: function(sender) {
                    sender.getChildren()[0].setTextColor(cc.color('#FFFFFF'));
                    X.enableOutline(sender.getChildren()[0],cc.color('#0a1021'),2);
                }
                //callback2: function (sender) {
                //    btns[j].title.setTextColor(cc.color('#A79682'));
                //    X.enableOutline(btns[j].title,cc.color('#44281d'),2);
                //}
            });

            if(G.tiShenIng){
                cc.each(bntns,function(btn){
                    btn.hide();
                });
            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function(){
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
        show: function(conf) {
            var me = this;
            var _super = this._super;
            this.getData(function() {
                _super.apply(me, arguments);
            })
        },
        onShow: function () {
            var me = this;
            var data = me.data() || {};
            var idx = data.type || 1;
            var btns = [me.nodes.btn_topup, me.nodes.btn_quota, me.nodes.btn_giftbag, me.nodes.btn_dailystore][idx - 1];
            btns.triggerTouch(ccui.Widget.TOUCH_ENDED);
            me.checkRedPoint();

            if(G.tiShenIng){
                var _img = new ccui.ImageView();
                _img.loadTexture("img/main2/bg_im2.png");
                _img.setAnchorPoint(cc.p(0.5,0.5));
                me.ui.finds('bg_sale2').addChild(_img);
                _img.x = me.ui.finds('bg_sale2').width/2;
                _img.y = me.ui.finds('bg_sale2').height/2;
            }
        },
        checkRedPoint: function(){
            var me = this;
            var redData = G.DATA.hongdian.chongzhiandlibao;
            if(redData.meiribx > 0){
                G.setNewIcoImg(me.nodes.btn_quota);
                me.nodes.btn_quota.getChildByName("redPoint").setPosition(110, 60);
            }else{
                G.removeNewIco(me.nodes.btn_quota);
            }
            if(redData.meirisd > 0){
                G.setNewIcoImg(me.nodes.btn_dailystore);
                me.nodes.btn_dailystore.getChildByName("redPoint").setPosition(110, 60);
            }else{
                G.removeNewIco(me.nodes.btn_dailystore);
            }
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("chongzhiandlibao", 1);
            me.emit("hide");
        },
        getData: function (callback) {
            var me = this;
            G.ajax.send('chongzhi_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    if(G.tiShenIng) {
                        for (var i in me.DATA.paylist) {
                            me.DATA.paylist[i].img = i * 1 + 1;
                        }
                    }
                    callback && callback();
                }
            }, true);
        },
        changeType: function (type) {
            var me = this;

            if (me.curType == type) return;

            me.curType = type;

            var viewConf = {
                "1": G.class.chongzhi_vip,
                "2": G.class.chongzhi_mrxg,
                "3": G.class.chongzhi_czlb,
                "4": G.class.chongzhi_mrsc,
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                cc.log('type...',type);
                me._panels[type] = new viewConf[type](type);
                me.ui.nodes.panel_nr.addChild(me._panels[type]);
            }
            me._panels[type].show();
        },
    });

    G.frame[ID] = new fun('sale.json', ID);
})();