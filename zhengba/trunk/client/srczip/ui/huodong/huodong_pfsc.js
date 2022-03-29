(function(){
    //
    G.class.huodong_pfsc = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me._data = data;
            me._super("event_xspf.json", null, {action: true, releaseRes: false});
        },
        onOpen: function () {
            var me = this;
            var btnArr = [];
            me.txtArr = [
               1, 4, 3, 2, 5
            ];

            for (var index = 0; index < me._data.data.arr.length; index ++) {
                if(me._data.data.arr[index].price && me._data.data.arr[index].price > 0){
                    var btn = me.nodes.btn_price.clone();
                    btn.data = me._data.data.arr[index];
                    btn.index = index;
                    btn.children[0].setString(btn.data.price + L("YUAN"));
                    me.nodes.listview.pushBackCustomItem(btn);
                    btnArr.push(btn);
                }
            }
            X.radio(btnArr, function (sender) {
                me.index = sender.index;
                me.shopData = sender.data;
                if (me.diyici) {
                    me.addItem(false);
                }
                me.diyici = true;
                me.changeType(true);
            }, {
                callback1: function (sender) {
                    sender.setBright(false);
                },
                callback2: function (sender) {
                    sender.setBright(true);
                },
                color: ['#7c162e', '#b42113'],
                no_enableOutline: true,
            });
            btnArr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.nodes.listview);

            G.class.ani.show({
                json: 'event_xspf_jt',
                addTo: me.nodes.panel_jt,
                repeat: true,
                autoRemove: false
            });
            G.class.ani.show({
                json: 'event_xspf_lz',
                addTo: me.nodes.panel_lz,
                autoRemove: false,
                onload: function (node, action) {
                    action.gotoFrameAndPause(0);
                    me.lzAni = node;
                    me.addItem(false);
                }
            });
            // G.class.ani.show({
            //     json: 'event_xspf_jg',
            //     addTo: me.nodes.panel_num,
            //     repeat: true,
            //     autoRemove: false,
            //     onload: function (node, action) {
            //         me.numAni = node;
            //     }
            // });
            me.nodes.btn_gm.click(function () {
                G.event.once('paysuccess', function(arg) {
                    if(arg && arg.success) {
                        G.frame.jiangli.data({
                            prize: me.selectPrize
                        }).show();
                        me.addItem(false);
                        me.changeType();
                    }
                });
                G.event.emit('doSDKPay', {
                    pid: me.shopData.proid,
                    logicProid: me.shopData.proid,
                    money: me.shopData.price * 100,
                });
            }, 5000);
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
            });
            me.action.play('wait', true);
            if(me._data.etime - G.time > 24*3600){
                me.nodes.txt_time.setString(X.moment(me._data.etime - G.time));
            }else{
                X.timeout(me.nodes.txt_time,me._data.etime,function(){
                    me.nodes.txt_time.setString(L("YJS"));
                });
            }
            me.nodes.panel_dot.setBackGroundImage('img/pifushangcheng/img_dot.png', 1);
        },
        getData:function(callback){
            var me = this;
            me.ajax('huodong_open', [me._data.hdid], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        setContents: function () {

        },
        changeType: function (isTop) {
            var me = this;

            me.nodes.panel_jt.setVisible(me.shopData.p.length > 3);
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data, pos) {
                    me.setItem(ui, data, pos[0]);
                }, null, null, 5);
                me.table.setData(me.shopData.p);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.shopData.p);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem: function (ui, data, idx) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                txt_title: function(node){
                    node.setString(me.shopData.name[idx] || '');
                    node.setTextColor(cc.color("#ffe8a5"));
                    X.enableOutline(node,"#a01e00");
                },
                ico_item: function (node) {
                    X.alignItems(node, data, 'left', {
                        touch: true
                    });
                },
                btn: function (node) {
                    node.click(function () {
                        if (me.index + '_' + idx == me.selectStr) {
                            me.addItem(false);
                        } else {
                            me.selectStr = me.index + '_' + idx;
                            me.ajax('huodong_use', [me._data.hdid, me.index, idx], function (str, data) {
                                if (data.s == 1) {
                                    me.idx = idx;
                                    me.selectPrize = me.shopData.p[me.idx];
                                    me.addItem(true);
                                }
                            });
                        }
                        me.changeType();
                    });
                },
                btn_txt: me.index + '_' + idx == me.selectStr ? L("SCHW") : L("JGWC")
            }, ui.nodes);
        },
        addItem: function (bool) {
            var me = this;
            me.nodes.panel_1.setVisible(!bool);
            me.nodes.panel_2.setVisible(bool);
            if (!bool) {
                me.selectStr = '';
                me.idx = undefined;
                cc.each(me.lzAni.nodes, function (node) {
                    node.removeAllChildren();
                });
                me.lzAni.action.gotoFrameAndPause(0);
            } else {
                me.lzAni.action.gotoFrameAndPause(0);
                var prize = me.shopData.p[me.idx];
                for (var _i = 0; _i < 4; _i ++) {
                    var parent = me.lzAni.nodes['panel_ico' + (_i + 1)];
                    parent.removeAllChildren();
                    if (prize[_i]) {
                        var item = G.class.sitem(prize[_i]);
                        item.setPosition(parent.width / 2, parent.height / 2);
                        parent.addChild(item);
                        X.forEachChild(parent, function (chr) {
                            chr.setCascadeOpacityEnabled(true);
                        });
                        me.lzAni.action.gotoFrameAndPlay(0, false);
                    }
                }
                me.nodes.txt_sz.setString(me.shopData.price + L("YUAN"));
                var str = String(me.shopData.price + '00');
                for(var j = 1; j < 6; j++){
                    me.nodes['panel_num' + j].removeBackGroundImage();
                }
                for (var index = 0; index < str.length; index ++) {
                    me.nodes['panel_num' + me.txtArr[index]].setBackGroundImage(
                        'img/pifushangcheng/img_sz' + str[str.length - 1 - index] + '.png', 1
                    );
                }
            }
        }
    });
})();