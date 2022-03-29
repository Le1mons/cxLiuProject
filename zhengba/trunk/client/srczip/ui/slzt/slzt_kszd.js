(function () {
    var ID = 'slzt_kszd';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            this.preLoadRes = ['zhandou.plist', 'zhandou.png'];
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.setContents();
            me.bindBtn();
        },
        setContents: function () {
            var me = this;
            var listarr = [1, 2, 3, 4, 5, 6]; // 塔主  镜像 事件 1 2 3 4；


            cc.enableScrollBar(me.nodes.scrollview, false);

            me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data, pos) {
                me.setItem(ui, data, pos[0]);
            });
            me.table.setData(listarr);
            me.table.reloadDataWithScroll(true);

        },
        setItem: function (ui, data) {
            var me = this;
            X.autoInitUI(ui);
            X.render({
                txt_name: function (node) {
                    var getName = function (id) {
                        var str = ""
                        switch (id * 1) {
                            case 1:
                                str = L('slzt_tip18') + L('slzt_tip14')
                                break;
                            case 2:
                                str = L('slzt_tip16')
                                break;
                            case 3:
                                str = L('slzt_tip15')
                                break;
                            case 4:
                                str = L('slzt_tip17')
                                break;

                            default:
                                break;
                        }
                        return str
                    }
                    switch (data) {
                        case 1:
                            node.setString(L('slzt_tip18') + L('slzt_tip13'));
                            break;
                        case 2:
                            node.setString(L('slzt_tip18') + L('slzt_tip12'));
                            break;
                        case 3:
                            node.setString(getName(G.slzt.mydata.eventdata[0].eid));

                            break;
                        case 4:
                            node.setString(getName(G.slzt.mydata.eventdata[1].eid));

                            break;
                        case 5:
                            node.setString(getName(G.slzt.mydata.eventdata[2].eid));

                            break;
                        case 6:
                            node.setString(getName(G.slzt.mydata.eventdata[3].eid));

                            break;

                        default:
                            break;
                    }
                },
                img_item: function (node) {

                    var cache = X.cacheByUid('slzt' + data) || {};
                    var arr = [];
                    for (var i = 1; i < 7; i++) {
                        var clnode = me.nodes.list.clone();
                        X.autoInitUI(clnode);
                        arr.push(clnode);
                        clnode.setTouchEnabled(false);
                        clnode.show()
                        clnode.nodes.ico.setBackGroundImage("img/public/ico/ico_bg0.png", 1);
                        if (cache[i] && G.DATA.yingxiong.list[cache[i]]) {
                            var shero = G.class.shero(G.DATA.yingxiong.list[cache[i]])
                            clnode.nodes.ico.addChild(shero);
                            shero.setAnchorPoint(0, 0);
                        } else {
                            clnode.setBackGroundImage("img/zhandou/img_zdtx" + (i) + ".png", 1);
                            clnode.nodes.img_jh.show()
                            // var img = new ccui.ImageView("img/shilianzhita/img_jh2.png", 1);
                            // img.setPosition(clnode.width / 2, clnode.height / 2);
                            // clnode.addChild(img);
                        }
                        clnode.nodes.ico.setTouchEnabled(true);
                        clnode.nodes.ico.setSwallowTouches(false);
                        clnode.nodes.ico.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE) {
                                G.frame.yingxiong_fight.data({
                                    pvType: 'slzt' + data,
                                    title: L('slzt_tip7'),
                                    norepeat: G.frame.slzt.getUsed(),
                                    kztitle:L("BAOCUN"),
                                    callback: function (cache) {
                                        cc.log(cache.getSelectedData())
                                        selectedData = cache.getSelectedData();
                                        G.frame.yingxiong_fight.remove();
                                        X.cacheByUid('slzt' + data, selectedData);
                                        me.table.reloadDataWithScroll(false);
                                    },
                                }).show();
                            }
                        })
                    }
                    X.center(arr, node);
                 
                    
                },
                bg_list: function (node) {
                    node.setColor(cc.color("#000000"))
                    node.setOpacity(125)
                },
                txt_tzcg: function (node) {
                    X.enableOutline(node,"#295700",2)
                },
                panel_tzcg: function (node) {
                    switch (data) {
                        case 1:
                            node.setVisible(G.slzt.mydata.killboss == 1);
                            break;
                        case 2:
                            node.setVisible(G.slzt.mydata.killmirror == 1);

                            break;
                        case 3:
                            node.setVisible(X.inArray(G.slzt.mydata.finishevent, 0));

                            break;
                        case 4:
                            node.setVisible(X.inArray(G.slzt.mydata.finishevent, 1));

                            break;
                        case 5:
                            node.setVisible(X.inArray(G.slzt.mydata.finishevent, 2));

                            break;
                        case 6:
                            node.setVisible(X.inArray(G.slzt.mydata.finishevent, 3));

                            break;

                        default:
                            break;
                    }

                },
            }, ui.nodes)
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
            me.nodes.btn_1.click(function (sender) {
                if (!G.frame.slzt.getNext()) {
                    G.tip_NB.show(L("slzt_tip19"))
                    return
                };
                G.frame.slzt.nextLayer();
                me.remove()
            })
            me.nodes.btn_2.click(function (sender) {
                me.callArr = [];
                // for (var k = 1; k < 7; k++) {
                //     if (!X.cacheByUid('slzt' + k)) {
                //         G.tip_NB.show(L("slzt_tip20"))
                //         return
                //     }
                // }
                if (!G.slzt.mydata.killboss && X.cacheByUid('slzt1')) {
                    me.callArr.push({ key: "boss", call: "boss" })
                }
                if (X.isHavItem(G.slzt.mydata.mirror) && !G.slzt.mydata.killmirror && X.cacheByUid('slzt2')) {
                    me.callArr.push({ key: "linghun", call: "linghun" })

                }
                for (var i = 0; i < G.slzt.mydata.eventdata.length; i++) {
                    if (G.slzt.mydata.eventdata[i].eid == 1 && !X.inArray(G.slzt.mydata.finishevent,i) && X.cacheByUid('slzt' + (i+3))) {
                        me.callArr.push({ key: i, call: "huwei" })
                    }
                }
                if (me.callArr.length < 1) {
                    return;
                }
                me.prize = [];
                
                me.showTip = false;
                
                me.getAllPrize();
            })

        },
        getAllPrize: function () {
            var me = this;
            var call = me.callArr.splice(0, 1)[0];
            me[call.call](function () {
                if (me.callArr.length > 0) {
                    me.getAllPrize();
                } else {
                    me.table.reloadDataWithScroll(false);
                    if(me.prize.length  > 0){
                        G.frame.jiangli.once("close",function(){
                            me.showTip &&  G.tip_NB.show(L('slzt_tip27'))

                        }).data({
                            prize: me.prize
                        }).show();
                    }else{
                       me.showTip &&  G.tip_NB.show(L('slzt_tip27'))
                    }
               
                }
            },call);
        },
        huwei: function (callback,data) {
            var me = this;
            selectedData = X.cacheByUid('slzt' +(data.key +3));
            if(!selectedData)return callback && callback();
            G.ajax.send('shilianzt_event', [data.key, selectedData], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    G.frame.slzt.DATA.mydata = d.d.mydata;
                    if (d.d.fightres.winside == 0) {
                        me.prize = me.prize.concat(d.d.prize);
                    }else{
                        me.showTip = true;
                    }
                    callback && callback();
                }
            }, true);
        },
        boss: function (callback) {
            var me = this;
            selectedData = X.cacheByUid('slzt1');
            G.ajax.send('shilianzt_fight', [1, selectedData], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
             
                    G.frame.slzt.DATA.mydata = d.d.mydata;
                    G.frame.slzt.setContents()
                    if (d.d.fightres.winside == 0) {
                        me.prize = me.prize.concat(d.d.prize);
                    }else{
                        me.showTip = true;
                    }
                    callback && callback();
                }
            }, true);
        },
        linghun: function (callback) {
            var me = this;
            selectedData = X.cacheByUid('slzt2');
            G.ajax.send('shilianzt_fight', [2, selectedData], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                  
                    G.frame.slzt.DATA.mydata = d.d.mydata;
                    G.frame.slzt.setContents()
                    if (d.d.fightres.winside == 0) {
                        me.prize = me.prize.concat(d.d.prize);
                    }else{
                        me.showTip = true;
                    }
                    callback && callback();
                }
            }, true);
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk9.json', ID);
})();