/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //神兵选择
    var ID = 'shenqi_xuanze';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;

            me.nodes.txt_title.setString(L("SQCD"));
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.sqid = me.data() && me.data().sqid || "";
            me.curId = me.sqid;
            me.callback = me.data() && me.data().callback || undefined;
            me.callback1 = me.data() && me.data().callback1 || undefined;
            me.sqidArr = me.data() && me.data().sqArr || undefined;
            me.idx = me.data() && me.data().idx;
            me.ui.finds("listview").show();
            cc.enableScrollBar(me.ui.finds("listview"));
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('artifact_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            
            new X.bView("shenbing_chuandai.json", function (node) {
                me.ui.addChild(node);
                node.hide();
                me.list = node.finds("list1");
                me.setContents();
            })
        },
        onHide: function () {
            var me = this;

            if(me.sqid !== me.curId) {
                me.callback && me.callback(me.curId);
            }else {
                me.callback1 && me.callback1();
            }
        },
        setContents: function () {
            var me = this;
            var conf = G.class.shenqi.get();
            var keys = X.keysOfObject(conf);

            me.ui.finds("listview").removeAllChildren();

            for(var i = 0; i < keys.length; i ++) {
                me.setItem(conf[keys[i]], i + 1);
            }
        },
        setItem: function (conf, sqid) {
            var me = this;
            var list = me.list.clone();

            list.finds("shenbing").x += 38;
            list.finds("shenbing").y += 25;
            list.finds("shenbing").zIndex = 888;
            // list.finds("btn1").loadTextureNormal("img/shenbing/shenbing_diban" + sqid + ".png", 1);
            list.finds("btn1").loadTextures("img/shenbing/shenbing_diban" + sqid + ".png","img/shenbing/shenbing_diban" + sqid + ".png",'img/shenbing/shenbing_diban_hui.png',1);
            if(P.gud.artifact < sqid || !P.gud.artifact) {
                list.finds("btn1").setBright(false);
                list.finds("btn2").hide();
                list.finds("btn3").hide();
                list.finds("btn4").hide();
                var img_sb = list.finds("shenbing");
                img_sb.setPosition(0,0);
                // img_sb.setScale(0.5);
                img_sb.setBackGroundImage("img/shenbing/shenbing_wq_0" + sqid + ".png", 0);
                list.finds("btn4").click(function () {
                    G.frame.shenqi.show();
                    me.remove();
                })
                // G.class.ani.show({
                //     json: "shenbing_0" + sqid,
                //     addTo: img_sb,
                //     x: img_sb.width / 2,
                //     y: img_sb.height / 2,
                //     repeat: true,
                //     autoRemove: false,
                //     onload: function(node, action) {
                //         action.gotoFrameAndPause(0);
                //         // X.forEachChild(node,function(n){
                //         //     if(n instanceof cc.Sprite ){
                //         //         n.setColor(cc.color('#666666'));
                //         //     }
                //         // })
                //     }
                // });
            }else {
                list.finds("btn1").setBright(true);
                list.finds("btn2").show();
                list.finds("btn3").hide();
                var img_sb = list.finds("shenbing");
                // img_sb.setScale(0.5);
                img_sb.setPosition(0,0);
                img_sb.setBackGroundImage("img/shenbing/shenbing_wq_0" + sqid + ".png", 0);
                G.class.ani.show({
                    json: "ani_shenbing_peidaitexiao0" + sqid,
                    addTo: list.finds("btn1"),
                    x: list.finds("btn1").width / 2,
                    y: list.finds("btn1").height / 2,
                    repeat: true,
                    autoRemove: false,
                });
                // var act1 = cc.moveBy(1, 0, 10);
                // var act2 = cc.moveBy(1, 0, -10);
                // var act = cc.sequence(act1, act2);
                // img_sb.runAction(act.repeatForever());
                // G.class.ani.show({
                //     json: "shenbing_0" + sqid,
                //     addTo: img_sb,
                //     x: img_sb.width / 2,
                //     y: img_sb.height / 2,
                //     repeat: true,
                //     autoRemove: false,
                //     onload: function(node, action) {
                //         var act1 = cc.moveBy(1, 0, 10);
                //         var act2 = cc.moveBy(1, 0, -10);
                //         var act = cc.sequence(act1, act2);
                //         node.setTag(7456);
                //         node.runAction(act.repeatForever());
                //     }
                // });
                if(me.sqidArr) {
                     if(X.inArray(me.sqidArr, sqid) && me.sqidArr[me.idx] !== sqid) {
                         list.finds("yzb").show();
                         list.finds("btn2").show();
                         // G.class.ani.show({
                         //     json: "ani_shenbing_peidaitexiao0" + sqid,
                         //     addTo: list.finds("btn1"),
                         //     x: list.finds("btn1").width / 2,
                         //     y: list.finds("btn1").height / 2,
                         //     repeat: true,
                         //     autoRemove: false
                         // });
                         // list.finds("btn3").show();
                         // list.finds("btn3").getChildren()[0].setString(L("XX"));
                         list.finds("btn2").click(function () {
                             G.tip_NB.show(L("BKXXQTDWSQ"));
                         })
                     }else {
                         if(sqid == me.curId) {
                             list.finds("yzb").show();
                             list.finds("btn2").show();
                             // list.finds("btn3").hide();
                             list.finds("btn2").click(function () {
                                 me.curId = "";
                                 me.setContents();
                             })
                         }else {
                             list.finds("yzb").hide();
                             list.finds("btn3").show();
                             list.finds("btn3").click(function () {
                                 me.curId = sqid;
                                 // me.setContents();
                                 me.remove();
                             });
                         }
                     }
                }else {
                    if(sqid == me.curId) {
                        list.finds("yzb").show();
                        
                        list.finds("btn2").show();
                        list.finds("btn3").hide();
                        // list.finds("btn3").getChildren()[0].setString(L("XX"));
                        list.finds("btn2").click(function () {
                            me.curId = "";
                            me.setContents();
                        })
                    }else {
                        list.finds("yzb").hide();
                        list.finds("btn2").hide();
                        list.finds("btn3").show();
                        list.finds("btn3").click(function () {
                            me.curId = sqid;
                            // me.setContents();
                            me.remove();
                        });
                    }
                }
            }
            list.finds("btn_xqdi").click(function () {
                var artifact = me.DATA.artifact[sqid];
                if(!artifact) {
                    artifact = {
                        lv: 1,
                        djlv: 0
                    }
                }
                if(artifact.lv > 1){
                    G.frame.shenqi_xq.data({
                        id: sqid,
                        jh: true,
                        lv: artifact.lv,
                        djlv: artifact.djlv,
                    }).show();
                }else{
                    G.frame.shenqi_xq1.data({
                        id: sqid,
                    }).show();
                }
            });
            list.finds('btn_xq').click(function(){
                var artifact = me.DATA.artifact[sqid];
                if(!artifact) {
                    artifact = {
                        lv: 1,
                        djlv: 0
                    }
                }
                if(artifact.lv > 1){
                    G.frame.shenqi_xq.data({
                        id: sqid,
                        jh: true,
                        lv: artifact.lv,
                        djlv: artifact.djlv,
                    }).show();
                }else{
                    G.frame.shenqi_xq1.data({
                        id: sqid,
                    }).show();
                }
            });
            me.ui.finds("listview").pushBackCustomItem(list);
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();