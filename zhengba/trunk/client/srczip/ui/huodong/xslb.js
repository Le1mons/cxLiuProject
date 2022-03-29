/**
 * Created by  on 2019//.
 */
(function () {
    //
    var ID = 'xslb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            me.nodes.panel_rw.removeBackGroundImage();
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            me.typeBtn = {};
            var data = G.DATA.asyncBtnsData.xianshilibao;
            for (var index = 0; index < data.length; index ++) {
                var dd = data[index];
                var btn = me.nodes.btn_lb_a.clone();
                btn.data = dd;
                btn.children[0].setString(dd.name || L("ZW"));
                btn.show();
                me.nodes.listview.pushBackCustomItem(btn);
                if (!me.typeBtn[dd.ctype]) me.typeBtn[dd.ctype] = {};
                me.typeBtn[dd.ctype][dd.key] = btn;
            }
            X.radio(me.nodes.listview.children, function (sender) {
                me.DATA = sender.data;
                me.setContents();
            }, {
                callback1: function (sender) {
                    sender.children[0].setTextColor(cc.color("#ffffff"));
                    X.enableOutline(sender.children[0], "#b25800", 2);
                },
                callback2: function (sender) {
                    sender.children[0].setTextColor(cc.color("#e394ed"));
                    X.enableOutline(sender.children[0], "#9c3aab", 2);
                }
            });
            var _data = me.data();
            if (_data) {
                var _btn = null;
                if (_data.type && _data.key && me.typeBtn[_data.type] && me.typeBtn[_data.type][_data.key]) {
                    _btn = me.typeBtn[_data.type][_data.key];
                }
                if (_btn) {
                    _btn.triggerTouch(ccui.Widget.TOUCH_ENDED);
                    var idx = 0;
                    for (var index = 0; index < me.nodes.listview.children.length; index ++) {
                        var chr = me.nodes.listview.children[index];
                        if (chr == _btn) {
                            idx = index;
                            break;
                        }
                    }
                    cc.callLater(function () {
                        me.nodes.listview.jumpToIdx(idx);
                    });
                } else {
                    me.nodes.listview.children[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
                }
            } else {
                me.nodes.listview.children[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            }

            me.nodes.btn_an.click(function () {
                G.event.once('paysuccess', function(arg) {
                    arg && arg.success && G.frame.jiangli.data({
                        prize: [].concat(me.DATA.prize)
                    }).show();
                    me.DATA.buynum --;
                    me.setContents();
                });
                G.event.emit('doSDKPay', {
                    pid: me.DATA.chkkey,
                    logicProid: me.DATA.chkkey,
                    money: me.DATA.money,
                    pname: me.DATA.name
                });
            }, 3000);
        },
        onOpen: function () {
            var me = this;

            me.initUi();
            me.bindBtn();
        },
        onShow: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;

            X.alignCenter(me.nodes.ico, data.prize, {
                touch: true
            });

            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: data.hid || '52013',
                scaleNum:data.scale || 1,
                direction:data.turnover
            });

            X.timeout(me.nodes.txt_sysj, data.rtime, function () {
                me.nodes.txt_sysj.setString(L("YJS"));
            });

            var imgName = "img/xslb/" + data.img + ".png";
            cc.spriteFrameCache.getSpriteFrame(imgName) && me.nodes.bg_mrsc.setBackGroundImage(imgName, 1);
            var picName = "img/xslb/" + data.pic + ".png";
            cc.spriteFrameCache.getSpriteFrame(picName) && me.nodes.img_cz.loadTexture(picName, 1);
            me.nodes.txt_cs.setString(data.buynum);
            me.nodes.btn_ygm.setVisible(data.buynum < 1);
            me.nodes.btn_an.setVisible(data.buynum > 0);
            me.nodes.txt_an_wz.setString(data.btnshow + L("YUAN"));
            me.nodes.btn_an.setEnableState(data.buynum > 0 && G.time < data.rtime);
            me.nodes.txt_an_wz.setTextColor(cc.color(data.buynum > 0 && G.time < data.rtime ? "#2f5719" : "#6c6c6c"));
        }
    });
    G.frame[ID] = new fun('xslb.json', ID);
})();