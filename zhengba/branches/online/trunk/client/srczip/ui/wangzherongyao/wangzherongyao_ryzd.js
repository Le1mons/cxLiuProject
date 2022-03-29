/**
 * Created by yaosong on 2018/12/28.
 */
(function () {
    //王者荣耀-荣耀之巅
    var ID = 'wangzherongyao_ryzd';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        getData: function (type,callback) {
            var me = this;

            var type = type || -1;
            G.DATA.wangzheph = G.DATA.wangzheph || {};
            if (G.DATA.wangzheph[type]) {
                me.DATA = {};
                me.DATA = cc.mixin(me.DATA, G.DATA.wangzheph[type],true);
                callback && callback();
                return;
            }
            G.ajax.send('wangzhe_wzzhidian',[type], function (data) {
                if (!data) return;
                var data = X.toJSON(data);
                if (data.s == 1) {
                    me.DATA = data.d;
                    G.DATA.wangzheph = G.DATA.wangzheph || {};
                    G.DATA.wangzheph[data.d.round] = data.d;
                    callback && callback();
                }
            },true);


            // me.DATA = {
            //    round:38,
            //    ranklist:[]
            // };
            // for(var j=0;j<4;j++) {
            //    var o = {};
            //    o = cc.mixin(o, P.gud,true);
            //    me.DATA.ranklist.push(o);
            // }
            // callback && callback();
        },
        initUI: function () {
            var me = this;

            // me.scrollview = me.ui.finds('scrollview');
            // cc.enableScrollBar(me.scrollview);
            me.list = me.ui.nodes.list;
            me.list.hide();
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_fanhui.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.btnLeft = me.ui.nodes.but1;
            me.btnLeft.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    var type = me.DATA.round;
                    type--;
                    me.getData(type, function () {
                        me.setContents();
                    });
                }
            });

            me.btnRight = me.ui.nodes.but2;
            me.btnRight.touch(function (sender, type) {
                if (type === ccui.Widget.TOUCH_ENDED) {
                    var type = me.DATA.round;
                    type++;
                    me.getData(type, function () {
                        me.setContents();
                    });
                }
            });
        },
        onOpen: function () {
            var me = this;

            me.fillSize();

            me.initUI();
            me.bindUI();
            // me.playAni(me.ui.finds('rongyaotx'));
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.newRound = me.DATA.round;
            me.setContents();
            me.showToper();
        },
        onHide: function () {
            var me = this;

            // me.releaseRes(['plist_rylong.plist','plist_rylong.png','plist_rongyaotx.plist','plist_rongyaotx.png','img/bg_zbs.png']);
        },
        checkShow: function () {
            var me = this;

            me.getData(-1,function () {
                if (!X.isHavItem(me.DATA)) {
                    G.tip_NB.show(L('WZRY_RYZD_tip_1'));
                } else{
                    me.show();
                }
            });
        },
        setContents: function () {
            var me = this;

            me.setRound();
            me.setCenter();
        },
        setRound: function () {
            var me = this;

            var txtRound = me.ui.nodes.wz_qi;

            var data = me.DATA;
            txtRound.setString(X.STR(L('WZRY_RYZD_X_RANK'),data.round));

            if (data.round <= 1) {
                me.btnLeft.setTouchEnabled(false);
                me.btnLeft.setBright(false);
            } else {
                me.btnLeft.setTouchEnabled(true);
                me.btnLeft.setBright(true);
            }

            if (data.round >= me.newRound) {
                me.btnRight.setTouchEnabled(false);
                me.btnRight.setBright(false);
            } else {
                me.btnRight.setTouchEnabled(true);
                me.btnRight.setBright(true);
            }
        },
        setCenter: function () {
            var me = this;

            //var scrollview = me.scrollview;
            var panel = me.ui;

            var data = me.DATA;
            for(var j=0;j<10;j++) {
                var layYx = panel.nodes["renwu" + (j + 1)];
                if (!layYx) continue;
                layYx.removeAllChildren();
                if (!data.ranklist[j]) continue;

                var item = me.list.clone();
                item.data = data.ranklist[j];
                item.idx = j;
                me.setItem(item);
                item.setPosition(cc.p(0,0));
                layYx.addChild(item);
                item.show();
            }
        },
        setItem: function (item) {
            var me = this;

            X.autoInitUI(item);

            var data = item.data;
            var idx = item.idx;

            var layYx = item.nodes.rw3;
            var txtZl = item.nodes.sl_ls;
            var txtServer = item.nodes.qf;
            var txtName = item.nodes.name;
            var img1 = item.nodes.ch;
            var img2 = item.nodes.yj;
            var img3 = item.nodes.sq;

            img1.hide();
            img2.hide();
            img3.hide();
            item.nodes.wz.show();

            img3.show();
            if(idx == 0) {
                img3.setBackGroundImage("img/wangzherongyao/ch_d1.png", 1);
            } else if(idx == 1) {
                img3.setBackGroundImage("img/wangzherongyao/ch_d2.png", 1);
            } else {
                img3.setBackGroundImage("img/wangzherongyao/ch_d3.png", 1);
            }


            txtName.setString(data.name);
            X.enableOutline(txtName, "#000000", 2);
            X.enableOutline(txtServer, "#000000", 2);
            txtServer.setString(data.ext_servername || '');
            txtZl.setString(data.zhanli || 0);
            X.setHeroModel({
                parent: layYx,
                data: data,
                scaleNum: .85
            });
            // X.setRWZaoXing(layYx,data, function (node, action) {
            //     node.setScale(0.7);
            //     layYx.setFlippedX(idx % 2 == 1 ? 1 : 0);
            //     layYx.setTouchEnabled(false);
            // });
        },
        playAni: function (lay) {
            var me = this;

            if (lay.getChildByTag(20170217)) {
                lay.getChildByTag(20170217).remove();
            }

            G.class.ani.show({
                addTo:lay,
                json:'ani_rongyaotx',
                x:lay.width / 2,
                y:lay.height / 2,
                repeat:true,
                autoRemove:false,
                onload: function (node, action) {
                    node.setTag(20170217);
                }
            });
        }
    });

    G.frame[ID] = new fun('wangzherongyao_ryzd.json', ID);
})();
