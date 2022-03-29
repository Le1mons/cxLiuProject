/**
 * Created by wfq on 2018/7/8.
 */
(function() {
    //等级礼包 || 养成礼包
    G.class.huodong_libao = X.bView.extend({
        ctor: function(type) {
            var me = this;
            me._type = type;
            me._super('event_gift.json');
        },
        bindUI: function() {
            var me = this;
            var view = me._view;
            var data = me.DATA;

            view.nodes.btn_txt.setString(data.btnshow + L('YUAN'));
            if (data.buynum < 1) {
                view.nodes.btn.setBright(false);
                view.nodes.btn.setTouchEnabled(false);
            } else {
                view.nodes.btn.setBright(true);
                view.nodes.btn.setTouchEnabled(true);
            }
            view.nodes.btn.click(function(sender, type) {
                if (me.timeout) {
                    G.tip_NB.show(L("LBGQ"));
                    return;
                }
                G.event.once('paysuccess', function() {
                    G.frame.jiangli.data({
                        prize: [].concat(data.prize)
                    }).show();
                    me.DATA.buynum --;
                    me.setContents();
                });
                G.event.emit('doSDKPay', {
                    pid: data.chkkey,
                    logicProid: data.chkkey,
                    money: data.money,
                    pname: data.name
                });
            }, 5000);
        },
        refreshPanel: function() {
            var me = this;
            me.getData(function() {

                me.setContents();
            });
        },
        onOpen: function() {
            var me = this;

        },
        onShow: function() {
            var me = this;

            X.viewCache.getView('event_list1.json', function(view) {
                me._view = view;
                // X.autoInitUI(view);
                me.nodes.panel_list.removeAllChildren();
                me.nodes.panel_list.addChild(view);
                me.refreshPanel();
            });
        },
        onRemove: function() {
            var me = this;
        },
        getData: function(callback) {
            var me = this;
            me.DATA = me._type;
            callback && callback();
        },
        setContents: function() {
            var me = this;
            me.setBaseInfo();
            me.bindUI();
            me.setTime();
        },
        onNodeShow: function() {
            var me = this;

            if (cc.isNode(me.ui)) {
                me.refreshPanel();
            }
        },
        setBanner: function() {
            var me = this;

            X.render({
                panel_bg: function(node) {
                    if (me.DATA.stype == 10002) {
                        node.setBackGroundImage('img/bg/bg_gift1.png', 0);
                    } else {
                        node.setBackGroundImage('img/bg/bg_gift2.png', 0);
                    }

                }
            }, me.nodes);
        },
        setTime: function() {
            var me = this;
            X.timeout(me.nodes.txt_time, me.DATA.rtime, function() {
                me.timeout = true;
                X.uiMana.closeAllFrame();
                G.view.mainView.getAysncBtnsData(function(){
                    G.view.mainView.allBtns["lefttop"] = [];
                    G.view.mainView.setSvrBtns();
                }, false);
            }, null, {
                showStr: L('HD_timeDown')
            });
        },
        setBaseInfo: function() {
            var me = this;
            var alldata = me.DATA;
            var data = me.DATA;
            if (alldata.stype == 10001) {
                me.nodes.panel_title1.setBackGroundImage('img/event/wz_event_title' + (
                    (data.val == 5 || data.val == 6) ? (data.val == 5 ? 0 : 1) : (data.val - 1)) +'.png', 1);
                me.nodes.panel_title1.show();
            } else {
                me.nodes.panel_title2.show();
                me.nodes.sz_vipgift.setString(data.val);
            }
            me.nodes.panel_list.show();
            me.nodes.txt_time.show();
            X.render({
                txt: function(node){

                    var str = new ccui.Text(X.STR(L('XGX'), data.buynum), G.defaultFNT, 18);
                    str.setAnchorPoint(0.5, 0.5);
                    str.setTextColor(cc.color(G.gc.COLOR.n4));
                    str.setPosition(node.width / 2, node.height / 2);
                    node.removeAllChildren();
                    node.addChild(str);
                }
            }, me._view.nodes);

            var rw = me.nodes.panel_rw;
            me.ui.setTimeout(function () {
                X.setHeroModel({
                    parent: rw,
                    data: {
                        hid: data.hid
                    }
                });
                rw.setPositionY(300);
                rw.setScale(1.5);
            }, 100);

            // rw.setFlippedX(true);
            // G.class.ani.show({
            //     json:'ani_choukajuese',
            //     addTo:rw,
            //     x:rw.width/2,
            //     y:rw.height/2,
            //     repeat:true,
            //     autoRemove:false,
            // });
            X.alignItems(me._view.nodes.ico_item, data.prize, 'left', {
                touch: true
            });
        }
    });

})();