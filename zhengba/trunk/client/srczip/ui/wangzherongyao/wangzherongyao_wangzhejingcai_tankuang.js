/**
 * Created by yaosong on 2018/12/29.
 */
(function () {
    //王者荣耀-竞猜弹框
    var ID = 'wangzherongyao_wangzhejingcai_tankuang';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            // new X.bView("wangzherongyao_tip3.json", function(view) {
            //     me._view = view;
            //     me.ui.nodes.panel_nr.removeAllChildren();
            //     me.ui.nodes.panel_nr.addChild(view);
            // }, {action: true});

            me.fillSize();

            me.initUI();
            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.setData();
        },
        onHide: function () {
            var me = this;

        },
        initUI: function () {
            var me = this;
        },
        bindUI: function () {
            var me = this;

            me.ui.nodes.btn_qx.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            me.ui.finds("mask_rz").click(function () {
                me.remove();
            })
        },
        setData: function () {
            var me = this;
            var conf = G.class.getConf('wangzherongyao.base.guess');
            var keys = X.keysOfObject(conf);
            keys.sort(function (a, b) {
                return a*1 - b*1;
            });
            var listItem = me.ui.nodes.list;
            var autoLayout = new X.autoLayout(me.ui.nodes.panel,1);
            autoLayout.setDelegate({
                //所有item数量
                countOfAllItems:function(){return keys.length;},
                //某行item数量
                countOfItemsAtRow:function(rowIndex){return 1;},
                //某行某列所在item
                itemAtIndex:function(rowIndex,colIndex,uiIndex){
                    var item = listItem.clone();
                    X.autoInitUI(item);
                    var key = keys[uiIndex];
                    var c = conf[key];
                    item.nodes.img_bg.loadTexture("img/wangzherongyao/img_jcdi" + (uiIndex + 1) + ".png", 1);
                    item.nodes.img_di.loadTexture("img/wangzherongyao/img_tmzs" + (uiIndex + 1) + ".png", 1);
                    var p = G.class.sitem(c.prize[0],false);
                    p.setAnchorPoint(0,0);
                    p.setScale(.9);
                    item.nodes.pb.addChild(p);
                    item.nodes.pb.setTouchEnabled(true);
                    item.nodes.pb.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED){
                            G.frame.iteminfo.data(p).show();
                        }
                    });
                    item.nodes.shijian.setString(c.addmoney);
                    item.nodes.mc.setString(c.name.split("_")[0]);
                    item.nodes.mc.setTextColor(cc.color(uiIndex == 0 ? "#11880b" : (uiIndex == 1 ? "#039ba5" : "#e76a0e")));
                    item.nodes.vip.setString(c.name.split("_")[1]);
                    item.nodes.nr.setString(c.intr);
                    item.nodes.but_jc.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED){
                            if (c.needvip > P.gud.vip){
                                G.tip_NB.show(L('WZRY_GUESS'));
                                return;
                            }
                            G.ajax.send('crosswz_guess',[me.data(),key],function (rd) {
                                rd = X.toJSON(rd);
                                if (rd.s == 1){
                                    G.event.emit("sdkevent", {
                                        event: "crosswz_guess"
                                    });
                                    G.class.ani.show({
                                        json: "ani_wzry_jincai",
                                        addTo: item,
                                        x: item.width / 2,
                                        y: item.height / 2,
                                        repeat: false,
                                        autoRemove: false,
                                        onload: function (node, action) {
                                            G.tip_NB.show(L('WZRY_GUESS_SUCC'));
                                            G.tip_NB.show(X.createPrizeInfo(c.prize[0]));
                                            me.remove();
                                            G.frame.wangzherongyao_jcwz.isShow && G.frame.wangzherongyao_jcwz.reloadData();
                                        }
                                    });
                                }
                            });
                        }
                    });
                    item.show();
                    return item;
                },
                //某行的高
                rowHeight:function(index){return listItem.height + 9;}
            });
            autoLayout.layout();
        }
    });

    G.frame[ID] = new fun('wangzherongyao_tip3.json', ID);
})();
