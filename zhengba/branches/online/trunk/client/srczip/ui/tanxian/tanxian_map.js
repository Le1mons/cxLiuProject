/**
 * Created by wfq on 2018/5/31.
 */
(function () {
    //探险-大地图
    var ID = 'tanxian_map';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me.fullScreen = true;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.maxGqid = G.class.tanxian.getCurMaxGqid();
            me.maxmapid = P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid;
            var curMaxNandu = G.class.tanxian.getNanduById(me.maxmapid);

            me.nodes.btn_gb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });

            var btns = [me.nodes.btn_nandu0,me.nodes.btn_nandu1,me.nodes.btn_nandu2,me.nodes.btn_nandu3,me.nodes.btn_nandu4,me.nodes.btn_nandu5,me.nodes.btn_nandu6];
            var btnArr = [];
            var no = [];
            var num = [];
            for(var i = 0; i < btns.length; i ++){
                if((i + 1) <= curMaxNandu){
                    btnArr.push(btns[i]);
                }else{
                    num.push(i);
                    no.push(btns[i]);
                }
            }
            for(var i = 0; i < no.length; i ++){
                var level = no[i];
                (function (level) {
                    var suo = new ccui.ImageView("img/tanxian/btn_tanxian_nandu"+ num[i] +"_d.png", 1);
                    suo.setAnchorPoint(0.5, 0.5);
                    suo.setPosition(level.width / 2, level.height / 2);
                    level.addChild(suo);
                    level.setBright(false);
                    level.click(function () {
                        G.tip_NB.show(L("TXNDBG"));
                    })
                })(level)

            }
            X.radio(btnArr, function (sender) {
                var name = sender.getName();

                var name2type = {
                    btn_nandu0$:1,
                    btn_nandu1$:2,
                    btn_nandu2$:3,
                    btn_nandu3$:4,
                    btn_nandu4$:5,
                    btn_nandu5$:6,
                    btn_nandu6$:7
                };
                me.changeType(name2type[name]);
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();

            cc.enableScrollBar(me.nodes.listview);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            // me.maxGqid = G.class.tanxian.getCurMaxGqid();
            // me.maxmapid = P.gud.maxmapid > me.maxGqid ? me.maxGqid : P.gud.maxmapid;
            me.nodes['btn_nandu' + (G.class.tanxian.getNanduById(P.gud.mapid) - 1)].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        changeType: function (type) {
            var me = this;
            me.cur = undefined;
            me.curType = type;
            me.setContents();
        },
        setContents: function () {
            var me = this;

            var curType = me.curType;
            var panel = me.ui;
            var imgSuo = panel.finds('panel_suo');
            imgSuo.hide();

            me.ui.finds('bg_tanxian_map').loadTexture("img/bg/map_tanxian_nandu"+(curType - 1)+".png");

            var mapid = P.gud.mapid;
            var maxmapid = me.maxmapid;

            var curMaxArea = G.class.tanxian.getAreaById(maxmapid);
            var curGjArea = G.class.tanxian.getAreaById(mapid);
            var curMaxNandu = G.class.tanxian.getNanduById(maxmapid);
            var curGjNandu = G.class.tanxian.getNanduById(mapid);

            var areaConf = G.class.tanxian.getExtConf().base.area;
            var keys = X.keysOfObject(areaConf);

            var ani_pos_x = [-20, 0, 0, 15, 20, 25, 20, -15];
            var ani_pos_y = [0, 0, 0, -10, -5, -30, 5, 10];
            var ani_arr = [
                "ani_tanxian_nanduxuanze_PT",
                "ani_tanxian_nanduxuanze_KN",
                "ani_tanxian_nanduxuanze_DY",
                "ani_tanxian_nanduxuanze_EM",
                "ani_tanxian_nanduxuanze_SW",
                "ani_tanxian_nanduxuanze_jw",
            ];
            var ani_x = [34,34,37,34,34,34];
            var ani_y = [30,30,30,30,26,30];
            var ani_scale = [1.1,1.1,1.3,1.3,1.2,1.1];

            var max_btn = me.nodes['btn_nandu' + (curMaxNandu - 1)];
            if(me.curType < curMaxNandu){
                max_btn.removeAllChildren();
                var num = curMaxNandu - 2;
                G.class.ani.show({
                    json: ani_arr[num],
                    addTo:max_btn,
                    x:ani_x[num],
                    y:ani_y[num],
                    repeat:true,
                    autoRemove:false,
                    onload :function (node, action) {
                        node.setScale(ani_scale[num]);
                    }
                });
                G.class.ani.show({
                    json: "ani_tanxian_nanduxuanze",
                    addTo: max_btn,
                    x: max_btn.width / 2,
                    y: max_btn.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setScale(1.1);
                    }
                })
            }else{
                max_btn.removeAllChildren();
            }


            for (var i = 0; i < keys.length; i++) {
                var areaid = keys[i];
                var area = areaConf[areaid];
                var imgArea = panel.nodes["btn_" + area.img.split("_")[1]];
                var pos = G.class.getConf("tanxian_com").mapPosition[i + 1];
                while (imgArea.getChildByTag(999777)) {
                    imgArea.getChildByTag(999777).removeFromParent();
                }
                while (imgArea.getChildByTag(123456)){
                    imgArea.getChildByTag(123456).removeFromParent();
                }
                while (imgArea.getChildByTag(89890)) {
                    imgArea.getChildByTag(89890).removeFromParent();
                }
                if (curMaxNandu * 1 > curType) {
                    imgArea.setBright(true);
                    if (curGjArea * 1 == areaid * 1 && curGjNandu * 1 == curType) {
                        var imgFight = me.nodes.panel_zd.clone();
                        imgFight.removeBackGroundImage();
                        G.class.ani.show({
                            json: 'ani_qicaijian',
                            addTo:imgFight,
                            x:imgFight.width / 2 + ani_pos_x[i],
                            y:imgFight.height / 2 + ani_pos_y[i],
                            repeat:true,
                            autoRemove:false,
                            onload : function (node) {
                                // node.setScale(1.5);
                            }
                        });
                        imgFight.setTag(999777);
                        imgFight.setPosition(cc.p(imgArea.width / 2 - imgFight.width / 2,imgArea.height / 2 - imgFight.height / 2));
                        imgArea.addChild(imgFight);
                        imgFight.show();
                    }
                } else if (curMaxNandu * 1 == curType) {
                    if (curMaxArea * 1 >= areaid * 1) {
                        imgArea.setBright(true);
                        if (curGjArea * 1 == areaid * 1 && curGjNandu * 1 == curType) {
                            var imgFight = me.nodes.panel_zd.clone();
                            imgFight.removeBackGroundImage();
                            G.class.ani.show({
                                json: 'ani_qicaijian',
                                addTo:imgFight,
                                x:imgFight.width / 2 + ani_pos_x[i],
                                y:imgFight.height / 2 + ani_pos_y[i],
                                repeat:true,
                                autoRemove:false,
                                onload : function (node) {
                                    // node.setScale(1.5);
                                }
                            });
                            imgFight.setTag(999777);
                            imgFight.setPosition(cc.p(imgArea.width / 2 - imgFight.width / 2,imgArea.height / 2 - imgFight.height / 2));
                            imgArea.addChild(imgFight);
                            imgFight.show();
                        }
                        if(((curGjArea == curMaxArea && curGjNandu !== curMaxNandu) && (i + 1) == curMaxArea)
                            || ((curGjArea !== curMaxArea && curGjNandu !== curMaxNandu) && (i + 1) == curMaxArea)
                            || ((curGjArea !== curMaxArea && curGjNandu == curMaxNandu) && (i + 1) == curMaxArea)){
                            me.cur = imgArea;!
                            G.class.ani.show({
                                json: "ani_tanxianjiesuo",
                                addTo: imgArea,
                                x: imgArea.width / 2,
                                y: imgArea.height / 2,
                                repeat: false,
                                autoRemove: true,
                                onload: function (node, action) {
                                    action.play("out", false);
                                },
                                onend: function (node, action) {
                                    if(me.cur) {
                                        G.class.ani.show({
                                            json: "ani_xinshou_arrow",
                                            addTo: me.cur,
                                            x: me.cur.width / 2,
                                            y: me.cur.height / 2,
                                            repeat: true,
                                            autoRemove: false,
                                            onload: function (node, action) {
                                                node.setTag(89890);
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    } else {
                        imgArea.setBright(false);
                    }
                } else {
                    imgArea.setBright(false);
                }

                imgArea.data = areaid;
                imgArea.curType = curType;
                imgArea.setTouchEnabled(true);
                imgArea.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_ENDED) {
                        function alert() {
                            G.frame.alert.data({
                                sizeType: 3,
                                cancelCall: null,
                                okCall: function () {
                                    var idsArr = G.class.tanxian.getIdArrByNanduAndArea(me.curType, sender.data);
                                    var newGqid;
                                    if (idsArr[idsArr.length - 1] >= me.maxmapid) {
                                        newGqid = me.maxmapid;
                                    } else if (idsArr[idsArr.length - 1] < me.maxmapid) {
                                        newGqid = idsArr[idsArr.length - 1];
                                    }

                                    G.frame.tanxian.changeGuanqia(newGqid);
                                    me.ui.setTimeout(function () {
                                        me.remove();
                                    }, 300);
                                },
                                richText: L('TANXIAN_MAP_TIP2')
                            }).show();
                        }

                        if (sender.curType > curMaxNandu * 1) {
                            G.tip_NB.show(L('TANXIAN_MAP_TIP_1'));
                        } else if (sender.curType == curMaxNandu * 1) {
                            if (sender.data * 1 > curMaxArea * 1) {
                                G.tip_NB.show(L('TANXIAN_MAP_TIP_1'));
                                return;
                            }

                            if (sender.data == curGjArea && me.curType == G.class.tanxian.getNanduById(P.gud.mapid)) {
                                G.tip_NB.show(L("TANXIAN_MAP_TIP3"));
                                return;
                            }

                            alert();
                        } else {
                            alert();
                        }
                    }

                });
            }

            var maxMapid = maxmapid - 1 ? maxmapid - 1 : 1;
            var isLast = G.class.tanxian.checkIsLastByGqid(maxmapid);
            if (isLast) {
                if (curMaxArea == X.keysOfObject(G.class.tanxian.getExtConf().base.area).length) {
                    //难度的最后一关，需要在下一难度按钮上增加动画
                } else {
                    //本区域的最后一关，需要在当前难度的下一区域上增加动画

                }
            }
        },
    });

    G.frame[ID] = new fun('tanxian_nandu.json', ID);
})();