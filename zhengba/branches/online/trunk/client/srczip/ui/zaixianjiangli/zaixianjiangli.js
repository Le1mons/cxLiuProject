/**
 * Created by LYF on 2018/7/12.
 */
(function () {
    //在线奖励
    var ID = 'zaixianjiangli';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
            me.preLoadRes = ["shouchong.png", "shouchong.plist"];
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.panel_mask.click(function () {
                me.remove();
            });
            
            me.nodes.txt_djgb.setTouchEnabled(true);
            me.nodes.txt_djgb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
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
        getData: function(callback){
            var me = this;

            G.ajax.send("onlineprize_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
        },
        onShow: function () {
            var me = this;

            me.getData(function () {
                me.setContents();
                me.ui.setTimeout(function(){
                	G.guidevent.emit('zaixianjiangli_openOver');
                },500);
            });

            G.class.ani.show({
                json: "ani_shouchonghanbingfashi",
                addTo: me.nodes.penel_rw,
                x: 365,
                y: 135,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setScale(0.82);
                    node.setFlippedX(true);
                }
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var arr = [];
            var prize = [];

            me.nodes.txt_time.show();
            me.nodes.panel_item.hide();
            
            me._firstItem = null;

            for(var i = 0; i < me.DATA.prize.length; i ++){
                me.DATA.prize[i].idx = i;
                arr.push(me.DATA.prize[i]);
                if((i + 1) % 4 == 0){
                    prize.push(arr);
                    arr = [];
                }
            }
            for(var i = 0; i < prize.length; i ++){
                X.alignCenter(me.nodes["panel_item" + (i + 1)], prize[i], {
                    mapItem: function (item) {
                    	
                    	//映射出去方便新手引导
                        if(me.DATA.num == item.data.idx) {
                            me.curItem = item;
                            if(me._firstItem==null){
                                me._firstItem = item;
                            }
                        }
                        if(me.DATA.num > item.data.idx){
                            item.setHighLight && item.setHighLight();
                            var ylq = new ccui.ImageView("img/shouchong/img_xb_ylq.png", 1);
                            ylq.setScale(.8);
                            ylq.setPosition(40, 62);
                            item.addChild(ylq);
                        }
                        item.setTouchEnabled(true);
                        item.touch(function (sender, type) {
                            if(type == ccui.Widget.TOUCH_ENDED){
                                if(item.loop){
                                    G.ajax.send("onlineprize_getprize", [item.data.idx], function (d) {
                                        if (!d) return;
                                        var d = JSON.parse(d);
                                        if (d.s == 1) {
                                            G.frame.jiangli.data({
                                                prize: [].concat(item.data)
                                            }).show();
                                            if(d.d.num == me.DATA.prize.length){
                                                G.view.mainView.getAysncBtnsData(function () {
                                                    me.remove();
                                                });
                                            }else{
                                                me.getData(function () {
                                                    me.setContents();
                                                })
                                            }

                                        }
                                    })
                                }else{
                                    G.frame.iteminfo.data(item).show();
                                }
                            }
                        });
                    }
                })
            }
            me.nodes.txt_time.removeAllChildren();
            var str = new ccui.Text(L("XDJL"), G.defaultFNT, 22);
            var time = new ccui.Text("", G.defaultFNT, 22);
            str.setAnchorPoint(1, 0.5);
            time.setAnchorPoint(0, 0.5);
            str.setTextColor(cc.color("#ffffff"));
            time.setTextColor(cc.color("#2bdf02"));
            X.enableOutline(str, "#000000", 2);
            X.enableOutline(time, "#000000", 2);
            str.setPosition(me.nodes.txt_time.width / 2, me.nodes.txt_time.height / 2);
            time.setPosition(me.nodes.txt_time.width / 2, me.nodes.txt_time.height / 2);
            me.nodes.txt_time.addChild(str);
            me.nodes.txt_time.addChild(time);
            X.timeout(time, me.DATA.cd, function () {
                me.nodes.txt_time.hide();
                G.class.ani.show({
                    json: "ani_wupingkuang",
                    addTo: me.curItem,
                    x: 50,
                    y: 50,
                    repeat: true,
                    autoRemove: false,
                    onload :function(node,action){
                        me.curItem.loop = node;
                    }
                });
            });
            G.view.mainView.set_xsjl(me.DATA);
        },
    });
    G.frame[ID] = new fun('newbie.json', ID);
})();