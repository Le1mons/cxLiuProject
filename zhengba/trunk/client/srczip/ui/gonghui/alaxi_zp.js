/**
 * Created by  on 2019//.
 */
(function () {
    //阿拉希转盘
    var ID = 'alaxi_zp';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        show: function () {
            var me = this;
            var args = arguments;
            var _super = me._super;
            me.getData(function () {
                _super.apply(me, args);
            });
        },
        onOpen: function () {
            var me = this;
            me.showToper();
            me.changeToperAttr({
                attr1: {a: 'item', t: '2086'}
            });
            me.bindBtn();
            me.prize = [];
            me.ui.finds('txt_1').setString(L('GONGHUI35'));
            me.ui.finds('txt_2').setString(L('GONGHUI36'));
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_1.click(function () {
                me.ajax("gonghuisiege_zhuanpan", [1], function (str, data) {
                    if (data.s == 1) {
                        G.frame.loadingIn.show();
                        me.playAni(data.d.idx, function () {
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            G.frame.loadingIn.remove();
                            me.showNeed();
                            me.getData(function () {
                                me.showLog();
                            });
                        });
                    }
                });
            });
            me.nodes.btn_2.click(function () {
                me.ajax("gonghuisiege_zhuanpan", [10], function (str, data) {
                    if (data.s == 1) {
                        G.frame.loadingIn.show();
                        me.playAni(data.d.idx[data.d.idx.length-1], function () {
                            G.frame.jiangli.data({
                                prize: data.d.prize
                            }).show();
                            G.frame.loadingIn.remove();
                            me.showNeed();
                            me.getData(function () {
                                me.showLog();
                            });
                        });
                    }
                });
            });
        },
        onShow: function () {
            var me = this;
            me.showLog();
            me.showNeed();
            me.initPrize();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        initPrize: function () {
            var me = this;

            for (var index = 0; index < G.gc.gonghuisiege.zhuanpan.length; index ++) {
                var list = me.prize[index] = me.nodes.list.clone();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                var parent = me.nodes["panel_" + (index + 1)];
                var data = G.gc.gonghuisiege.zhuanpan[index];
                list.setPosition(0, 0);
                list.show();
                parent.addChild(list);
                X.autoInitUI(list);
                X.render({
                    ico: function (node) {
                        var prize = G.class.sitem(data.prize[0]);
                        G.frame.iteminfo.showItemInfo(prize);
                        prize.setPosition(node.width / 2, node.height / 2);
                        node.addChild(prize);
                    },
                    txt_name: function (node) {
                        var conf = G.class.getItem(data.prize[0].t, data.prize[0].a);
                        setTextWithColor(node, conf.name, G.gc.COLOR[conf.color]);
                    },
                    img_bg_hh:function (node) {
                        node.setVisible(data.jipin);
                    },
                    panel_xz:function (node) {
                        // node.setBackGroundImage('img/gonghui/ghz/list_xz.png',1);
                        G.class.ani.show({
                            addTo:node,
                            json:'gonghui_ghzp_xztx',
                            x: node.width / 2,
                            y: node.height / 2,
                            repeat:false,
                            autoRemove:true,
                            onload:function (nodes,action) {
                                action.playWithCallback('wait');
                                X.autoInitUI(nodes);
                                nodes.action = action;
                                node.ani = nodes;
                            },
                        });
                    }
                }, list.nodes);
            }
        },
        showNeed: function () {
            var me = this;
            // var conf = G.gc.gonghuisiege.zhuanpanneed[0];
            var need = {a:"item",t:"2086",n:1};
            me.ui.finds('panel_db1').removeBackGroundImage();
            me.ui.finds('panel_db1').setBackGroundImage(G.class.getItemIco(need.t),1);
            me.ui.finds('panel_db2').setBackGroundImage(G.class.getItemIco(need.t),1);
            me.nodes.txt_xh1.setString(need.n);
            me.nodes.txt_xh2.setString(need.n*10);
            // var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            // var str = X.STR(L("GONGHUIFIGHT26"),G.class.getOwnNum(need.t, need.a),need.n);
            // var rh = X.setRichText({
            //     parent:me.nodes.panel_zs,
            //     node:img,
            //     str:str,
            //     anchor: {x: 0.5, y: 0.5},
            //     pos: {x: me.nodes.panel_zs.width / 2, y: me.nodes.panel_zs.height / 2},
            //     color:"#FFF6DD",
            //     outline:"#2D1400"
            // });
        },
        playAni: function (idx, callback) {
            var me = this;
            var startIdx;
            var arr = [];
            while (startIdx == undefined || startIdx == idx) {
                startIdx = X.rand(0, 7);
            }
            for (var index = startIdx; index < 8; index ++) arr.push(index);
            for (var index = 0; index < startIdx; index ++) arr.push(index);
            var forArr = [];
            for (var index = 0; index < 4; index ++) {
                forArr.push([].concat(arr));
            }
            var length = forArr.length - 1;
            var _length = forArr[length].length - 1;
            if (forArr[length][_length] == idx) forArr.push([].concat(arr));
            else {
                var _arr = [];
                var val = forArr[length][_length];
                if (val == 7) {
                    _arr.push(0);
                } else {
                    val ++;
                    _arr.push(val);
                }
                while (_arr[_arr.length - 1] != idx) {
                    var _val = arr[_arr.length - 1];
                    if (_val == 7) {
                        _arr.push(0);
                    } else {
                        _val ++;
                        _arr.push(_val);
                    }
                }
                forArr.push(_arr);
            }
            function play(arr) {
                if (arr.length < 1){
                    return callback && callback();
                }
                var aniArr = arr.shift();
                var time = arr.length == 0 ? 0.2 : 0.05;

                function ani(_aniArr) {
                    if (_aniArr.length < 1) {
                        return play(arr);
                    }
                    var idx = _aniArr.shift();
                    me.prize[idx].nodes.panel_xz.show();
                    if(arr.length < 1 && _aniArr.length < 1){
                        me.prize[idx].nodes.panel_xz.ani.action.playWithCallback('xuanzhong',false,function () {
                            me.prize[idx].nodes.panel_xz.hide();
                            me.prize[idx].nodes.panel_xz.ani.action.playWithCallback('wait');
                            ani(_aniArr);
                        });
                    }else {
                        me.ui.setTimeout(function () {
                            me.prize[idx].nodes.panel_xz.hide();
                            ani(_aniArr);
                        }, 1000 * time);
                    }
                }
                ani(aniArr);
            }
            play(forArr);
        },
        showLog: function () {
            var me = this;
            me.nodes.img_zwnr.setVisible(me.DATA.zhuanpanlog.length < 1);
            me.nodes.listview.removeAllChildren();
            me.DATA.zhuanpanlog.sort(function (a, b) {
                return a.time > b.time ? -1 : 1;
            });
            for (var index = 0; index < me.DATA.zhuanpanlog.length; index ++) {
                var log = me.DATA.zhuanpanlog[index];
                var list = me.nodes.list_lb.clone();
                X.autoInitUI(list);
                X.render({
                    txt_sj: X.moment(log.time - G.time),
                    panel_wz1: function (node) {
                        var itemconf = G.class.getItem(log.prize[0].t,log.prize[0].a);
                        var str = X.STR(L("GONGHUIFIGHT27"),log.name,G.gc.COLOR[itemconf.color], itemconf.name , log.prize[0].n);
                        var rh = X.setRichText({
                            parent:node,
                            str:str,
                            anchor: {x: 0, y: 0.5},
                            pos: {x: 0, y: node.height / 2},
                            color:"#9D6F55",
                        });
                    },
                    bg_list1: function (node) {
                        node.setVisible(G.gc.gonghuisiege.zhuanpan[log.idx].jipin == 1);
                    },
                    bg_list2:function (node) {
                        node.setVisible(G.gc.gonghuisiege.zhuanpan[log.idx].jipin != 1);
                    }
                }, list.nodes);
                list.show();
                me.nodes.listview.pushBackCustomItem(list);
            }
        },
        getData: function (callback) {
            var me = this;
            connectApi("gonghuisiege_zhuanpanlog", [], function (data) {
                me.DATA = data;
                callback && callback();
            });
        },
    });
    G.frame[ID] = new fun('gonghui_alxzp.json', ID);
})();