/**
 * Created by wfq on 2018/6/8.
 */
(function () {
    //世界树-置换英雄
    G.class.worldtree_hero = X.bView.extend({
        extConf:{
            data: function (zhongzu) {
                var data = G.DATA.yingxiong.list;
                var keys = X.keysOfObject(data);

                var arr = [];
                var needZhongzu = [1,2,3,4];
                for (var i = 0; i < keys.length; i++) {
                    var tid = keys[i];
                    var heroData = data[tid];
                    if (zhongzu == 0) {
                        if ((heroData.star == 4 || heroData.star == 5) && X.inArray(needZhongzu,heroData.zhongzu)) {
                            arr.push(tid);
                        }
                    } else {
                        if (zhongzu == heroData.zhongzu && (heroData.star == 4 || heroData.star == 5) && X.inArray(needZhongzu,heroData.zhongzu)) {
                            arr.push(tid);
                        }
                    }

                }

                return arr;
            },
            getSort: function (arr, str1, str2, str3, str4) {
                var data = [];
                var heroData = [];
                var hidData = [];
                var sortArr = [];

                for(var i = 0; i < arr.length; i ++){
                    heroData.push(G.DATA.yingxiong.list[arr[i]]);
                    if(!heroData[i].tid) heroData[i].tid = arr[i];
                }
                for(var i = 0, j = heroData.length; i < j; i += 1){
                    var conf = heroData[i];
                    var q = conf[str1];
                    var w = conf[str2];
                    var e = conf[str3];
                    var r = conf[str4];
                    if(!sortArr[q]){
                        sortArr[q] = [];
                    }
                    if(!sortArr[q][w]){
                        sortArr[q][w] = [];
                    }
                    if(!sortArr[q][w][e]){
                        sortArr[q][w][e] = [];
                    }
                    if(!sortArr[q][w][e][r]){
                        sortArr[q][w][e][r] = [];
                    }
                    sortArr[q][w][e][r].push(heroData[i]);
                }
                var index = heroData.length - 1;
                for(var i in sortArr){
                    for(var j in sortArr[i]){
                        for (var k in sortArr[i][j]){
                            for(var l in sortArr[i][j][k]){
                                for(var m in sortArr[i][j][k][l]){
                                    data[index --] = sortArr[i][j][k][l][m];
                                }
                            }
                        }
                    }
                }
                for(var i = 0; i < data.length; i ++){
                    hidData.push(data[i].tid);
                }
                return hidData;
            }
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('shijieshu_zhyx.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();

        },
        bindBTN: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;

            me.bindBTN();
            me.isOne = true;
            if(X.cacheByUid('worldtree_heroTid')){
                cc.log('---------------->worldtree_heroTid',X.cacheByUid('worldtree_heroTid'));
                me.cacheTid = X.cacheByUid('worldtree_heroTid');
            }
            me.showHero();
        },
        showHero: function(){
            var me = this;
            var data = G.DATA.yingxiong.list;

            for(var i in data){
                if(data[i].star == 4 || data[i].star == 5 && data[i].zhongzu !== 5 && data[i].zhongzu !== 6){
                    me.isHaveHero = true;
                    break;
                }
            }
            if(me.isHaveHero){
                me.ui.setTimeout(function () {
                    new X.bView('shijieshu_zzxz.json', function (view) {
                        me._view = view;
                        me.nodes.panel_zzxz.setTouchEnabled(false);
                        me.nodes.panel_zzxz.setClippingEnabled(true);
                        me.nodes.panel_zzxz.addChild(view);
                        me.setZzBtns();
                    });
                }, 100)
            }
        },
        onShow: function () {
            var me = this;
            me.refreshPanel();

            G.class.ani.show({
                json: "ani_shijieshuzhihuan",
                addTo: me.ui,
                x: me.ui.width / 2,
                y: me.ui.height / 2 - 315,
                repeat: true,
                autoRemove: false
            });

            me.nodes.panel_zzxz.zIndex = 999;
            me.nodes.panel_xh.setTouchEnabled(false);
        },
        onRemove: function () {
            var me = this;
            if(me.cacheTid && me.isZHIHUAN){
                X.cacheByUid('worldtree_heroTid', me.cacheTid);
            }
        },
        setContents: function () {
            var me = this;

            me.setBaseInfo();
            me.setCenter();
            me.setAttr(4);
            me.nodes.text_fryx.hide();
        },
        setCenter: function () {
            var me = this;

            var obj = {
                0:{
                    havData:{
                        type:'setItem_hero'
                    },
                    noData:{
                        type:'setItem_in'
                    }
                },
                1:{
                    zhData:{
                        type:'setItem_hero'
                    },
                    havData:{
                        type:'setItem_question'
                    },
                    noData:{
                        type:'setItem_default'
                    }
                }
            };

            var panelLeft = me.nodes.panel_1;
            var panelRight = me.nodes.panel_2;
            var list = me.ui.finds('list');
            list.hide();

            panelLeft.removeAllChildren();
            panelRight.removeAllChildren();

            // 左侧区域
            var item = list.clone();
            // item.setPosition(cc.p(panelLeft.width / 2,panelRight.height / 2));
            item.setPosition(cc.p(0,0));
            item.setTouchEnabled(false);
            if (me.selectedData) {
                // item.data = null;
                me[obj[0].havData.type](item);
                // if(me.CANCEL){
                //     me[obj[0].noData.type](item);
                //     me.CANCEL = false;
                // }
            } else {
                me[obj[0].noData.type](item);
            }

            panelLeft.addChild(item);
            item.show();
            // panelLeft.setZOrder(9999);
            panelLeft.setTouchEnabled(true);
            panelLeft.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(!me.isHaveHero) {
                        G.tip_NB.show(L("ZWKZHYX"));
                        return;
                    }
                    var data = G.DATA.yingxiong.list[me.cacheTid];
                    cc.log('------------------->data',data);
                    if(data){
                        G.frame.yingxiong_jianjie.data({
                            id: data.hid,
                            islv: data.lv,
                            isdjlv: data.dengjielv
                        }).show();
                    }
                    // if (me.curState != 'baocun') {
                    //     if (!cc.isNode(me._view)) {
                    //         new X.bView('shijieshu_zzxz.json', function (view) {
                    //             me._view = view;
                    //             me.nodes.panel_zzxz.addChild(view);
                    //             me.setZzBtns();
                    //         });
                    //     } else {
                    //         if (!me.willGetData) {
                    //             me._view.show();
                    //             me._menus[me.curZhongzu].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                    //         }
                    //         if(me.nodes.panel_zzxz.visible == false){
                    //             me.nodes.panel_zzxz.show();
                    //         }
                    //     }

                    // }
                }
            });
            panelRight.click(function(sender){
                cc.isNode(me.btnTishi) && me.btnTishi.triggerTouch(ccui.Widget.TOUCH_ENDED);
            });
            //右侧区域
            var item2 = list.clone();
            item2.setPosition(cc.p(0,0));
            // me.setItem_default(item2);
            item2.setTouchEnabled(false);

            if (me.willGetData) {
                item2.data = me.willGetData;
                me[obj[1].zhData.type](item2);
            } else if (me.selectedData) {
                item2.data = me.selectedData;
                me[obj[1].havData.type](item2);
            } else {
                me[obj[1].noData.type](item2);
            }
            panelRight.addChild(item2);
            item2.show();

            //显示选择英雄栏

        },
        setItem_default: function (item) {
            var me = this;

            X.autoInitUI(item);
            var layTexiao = me.nodes.panel_tx;
            var layWenhao = me.nodes.panel_wh;
            var layHero = item.nodes.panel_rw;
            var layZz = item.nodes.panel_zz;
            var txtLv = item.nodes.text_yxdj;
            var txtName = item.nodes.text_yxmc;
            var layStar = item.nodes.panel_xing;
            var btnTishi = item.nodes.btn_tishi;
            X.enableOutline(txtLv,'#2A1C0F',2);
            X.enableOutline(txtName,'#2A1C0F',2);
            txtLv.setTextColor(cc.color('#F6EBCD'));
            txtName.setTextColor(cc.color('#ffffff'));

            layTexiao.show();
            // layWenhao.hide();
            layHero.hide();
            layZz.hide();
            txtLv.setString('');
            txtName.setString('');
            txtName.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            txtName.setPositionX(item.finds('img_qz_$_0').x);
            layStar.removeAllChildren();
            btnTishi.hide();


        },
        setItem_in: function (item) {
            var me = this;

            me.setItem_default(item);
            var layTexiao = me.nodes.panel_tx;
            layTexiao.show();
            layTexiao.removeAllChildren();
            G.class.ani.show({
                json: "ani_zhihuanyinxiong",
                addTo: layTexiao,
                x: 101,
                y: 55,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setTag(890);
                    action.play("in", true);
                    me.guang = node;
                },
            });

        },
        setItem_question: function (item) {
            var me = this;

            me.setItem_default(item);

            var layWenhao = me.nodes.panel_wh;
            var layZz = item.nodes.panel_zz;
            var txtLv = item.nodes.text_yxdj;
            var layStar = item.nodes.panel_xing;
            var txtName = item.nodes.text_yxmc;

            layWenhao.show();
            layWenhao.removeAllChildren();
            while (layWenhao.getChildByTag(999999)){
                layWenhao.getChildByTag(999999).removeFromParent();
            }
            G.class.ani.show({
                json: "ani_zhihuanyinxiongwenhao",
                addTo: layWenhao,
                x: -217,
                y: 56,
                repeat: false,
                autoRemove: false,
                onload: function (node, action) {
                    me.wenhao = action;
                    node.setTag(999999);
                    action.play('wait', true);
                }
            });
            layZz.show();

            var data = me.selectedData;
            var heroData = G.DATA.yingxiong.list[data];
            var conf = G.class.hero.getById(heroData.hid);
            txtName.setString('????');
            txtName.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            txtName.setPositionX(item.finds('img_qz_$_0').x + layZz.width/2);
            layZz.setScale(.56);
            layZz.setBackGroundImage(G.class.hero.getZhongzuIcoById(heroData.hid),1);
            layZz.setPosition(txtName.getPositionX() - txtName.getAutoRenderSize().width/2 - layZz.width,  layZz.getPositionY() + 10)
            txtLv.setString(heroData.lv);

            G.class.ui_star(layStar, heroData.star || heroData.dengjielv || conf.star, 0.5, {interval:-4,}, true);
        },
        setItem_hero: function (item) {
            var me = this;

            me.setItem_default(item);

            me.panel_gx = item.nodes.panel_sx;
            var layHero = item.nodes.panel_rw;
            var layZz = item.nodes.panel_zz;
            var txtLv = item.nodes.text_yxdj;
            var txtName = item.nodes.text_yxmc;
            var layStar = item.nodes.panel_xing;
            var btnTishi = me.btnTishi = item.nodes.btn_tishi;
            X.enableOutline(txtLv,'#2A1C0F',2);
            X.enableOutline(txtName,'#2A1C0F',2);
            txtLv.setTextColor(cc.color('#F6EBCD'));
            txtName.setTextColor(cc.color('#ffffff'));

            layZz.show();
            layHero.show();

            var data = me.selectedData;
            var heroData = G.DATA.yingxiong.list[data];

            txtLv.setString(heroData.lv);

            G.class.ui_star(layStar, heroData.star || heroData.dengjielv || conf.star, 0.5, {interval:-4}, true);
            //G.class.ui_star(layStar, heroData.star || heroData.dengjielv || conf.star, 0.5, {interval:-4, ico:'img_xing_h'});
            if (item.data) {
                var conf = G.class.hero.getById(item.data.t);
                btnTishi.show();
                //设置英雄模型
                X.setHeroModel({parent: layHero, data: {hid:item.data.t}});
            } else {
                var conf = G.class.hero.getById(heroData.hid);
                //设置英雄模型
                X.setHeroModel({parent: layHero, data: heroData});
            }
            txtName.setString(conf.name);
            txtName.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            txtName.setPositionX(item.finds('img_qz_$_0').x + layZz.width/2);
            layZz.setScale(.56);
            layZz.setBackGroundImage(G.class.hero.getZhongzuIcoById(heroData.hid),1);
            layZz.setPosition(txtName.getPositionX() - txtName.getAutoRenderSize().width/2 - layZz.width, layZz.getPositionY() + 10)
            btnTishi.setTouchEnabled(true);
            btnTishi.hide();
            btnTishi.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if(item.data && item.data.t){
                        G.frame.yingxiong_jianjie.data({
                            id: item.data.t,
                            islv: heroData.lv,
                            isdjlv: heroData.dengjielv
                        }).show();
                    }
                }
            });

        },
        setBaseInfo: function () {
            var me = this;

            me.btnZh = me.nodes.btn_zh;
            me.btnQx = me.nodes.btn_qx;
            me.btnBc = me.nodes.btn_bc;


            me.btnZh.zIndex = 9999;
            me.btnQx.zIndex = 9999;
            me.btnBc.zIndex = 9999;
            me.btnQx.hide();
            me.btnBc.hide();
            me.btnZh.hide();
            me.isZHIHUAN = false;

            if (me.willGetData) {
                me.btnQx.show();
                me.btnBc.show();
                me.isZHIHUAN = true;
            } else if (me.selectedData) {
                me.btnZh.show();
            }

            me.btnZh.data = [];
            me.btnZh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    sender.setTouchEnabled(false);
                    G.ajax.send('worldtree_swap',[me.selectedData],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            X.audio.playEffect("sound/zhihuan.mp3", false);
                            var layTexiao = me.nodes.panel_tx;
                            var layTexiao1 = me.nodes.panel_wh;
                            layTexiao.removeAllChildren();
                            layTexiao1.removeAllChildren();
                            layTexiao.show();
                            layTexiao1.show();
                            G.class.ani.show({
                                json: "ani_zhihuanyinxionghecheng2",
                                addTo: layTexiao1,
                                x: 258,
                                y: 35,
                                repeat: false,
                                autoRemove: false,
                                onload :function(node,action){
                                    node.setScale(1.25);
                                    node.show();

                                },
                                onend :function (node, action) {
                                    var n1 = node;
                                    G.class.ani.show({
                                        json: "ani_zhihuanyinxionghecheng",
                                        addTo: layTexiao1,
                                        x: 258,
                                        y: 35,
                                        repeat: true,
                                        autoRemove: false,
                                        onload :function(node,action){
                                            node.setScale(1.25);
                                            node.show();
                                            n1.hide();
                                        }
                                    });
                                }
                            });
                            G.class.ani.show({
                                json: "ani_zhihuanyinxionghecheng",
                                addTo: layTexiao,
                                x: 258,
                                y: 35,
                                repeat: true,
                                autoRemove: false,
                                onload :function(node,action){
                                    node.setScale(1.25);
                                    node.show();
                                }
                            });
                            me.willGetData = d.d.hero;
                            me.setBaseInfo();
                            me.setCenter();
                            me._view.hide();
                            G.frame.worldtree.setBaseInfo();
                            sender.setTouchEnabled(true);
                        }else{
                            X.audio.playEffect("sound/dianji.mp3", false);
                            sender.setTouchEnabled(true);
                        }
                    },true);
                }
            });

            me.btnQx.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    if (me.willGetData) delete me.willGetData;
                    // if (me.selectedData) delete me.selectedData;
                    me.CANCEL = true;
                    me.setCenter();
                    me.setBaseInfo();
                    me._view.show();
                    me._view.show();
                }
            });

            me.btnBc.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.ajax.send('worldtree_save',[me.selectedData],function(d) {
                        if(!d) return;
                        var d = JSON.parse(d);
                        if(d.s == 1) {
                            me.sender = undefined;
                            me.nodes.panel_tx.removeAllChildren();
                            me.nodes.panel_wh.removeAllChildren();
                            G.tip_NB.show(L('BAOCUN') + L('SUCCESS'));
                            if (me.willGetData) delete me.willGetData;
                            if (me.selectedData) delete me.selectedData;
                            me._menus[me.curZhongzu].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                            delete me.btnTishi;
                            me.setCenter();
                            me.setBaseInfo();
                            me._view.show();
                            if(d.d.prize && d.d.prize.length > 0) {
                                G.frame.jiangli.data({
                                    prize: d.d.prize
                                }).show();
                            }
                        }
                    },true);
                }
            });

        },
        setAttr: function (star) {
            var me = this;
            var txtAttr = me.nodes.text_sl;
            var txtAttr1 = me.nodes.text_xh;
            var need = G.class.worldtree.getChangeNeedByStar(star);

            txtAttr.setString(need[0].n);
            txtAttr1.setString(need[1].n);
        },
        //绑定种族按钮事件
        setZzBtns: function () {
            var me = this;

            var panel = me._view;

            var listview = panel.nodes.listview_zz;
            cc.enableScrollBar(listview);
            listview.removeAllChildren();
            var list = panel.nodes.list_ico;
            list.hide();

            me._menus = [];

            for (var i = 0; i < 5; i++) {
                var item = list.clone();
                item.data = i;
                setItem(item);
                listview.pushBackCustomItem(item);
                item.show();
            }

            function setItem(item) {
                X.autoInitUI(item);

                var layIco = item.nodes.panel_zz;
                var imgXz = item.nodes.img_yuan_xz;

                imgXz.hide();
                layIco.setTouchEnabled(false);
                layIco.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);

                item.setTouchEnabled(true);
                item.setSwallowTouches(false);
                item.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        for(var j=0;j<me._menus.length;j++){
                            var node = me._menus[j];
                            var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                            if(node.data == sender.data){
                                //node.nodes.img_yuan_xz.show();
                                // curType即为种族
                                if(me.zzMusic)X.audio.playEffect("sound/dianji.mp3", false);
                                me.zzMusic = true;
                                me.curType = sender.data;
                                me.changeType2(sender.data);
                                img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                                if(sender.ani) {
                                    sender.ani.show();
                                }else {
                                    G.class.ani.show({
                                        json: "ani_guangbiaoqiehuan",
                                        addTo: sender,
                                        x: sender.width / 2,
                                        y: sender.height / 2,
                                        repeat: true,
                                        autoRemove: false,
                                        onload: function (node) {
                                            sender.ani = node;
                                        }
                                    })
                                }
                            }else{
                                //node.nodes.img_yuan_xz.hide();
                                if(node.ani) node.ani.hide();
                            }
                            node.nodes.panel_zz.setBackGroundImage(img,1);
                        }
                    }
                });
                me._menus.push(item);
            }

            if(me.isOne){
                me._menus[me.curZhongzu ? me.curZhongzu : 0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
            }
        },
        //种族的切换
        changeType2: function (type) {
            var me = this;

            me.curZhongzu = type;

            me.setHeroListview();
        },
        setHeroListview: function () {
            var me = this;

            var panel = me._view;
            panel.nodes.mask.setTouchEnabled(false);
            var scrollview = panel.nodes.scrollview;
            cc.enableScrollBar(scrollview);
            scrollview.removeAllChildren();
            var list = panel.nodes.list_yx;
            list.hide();

            var data = me.extConf.data(me.curZhongzu);
            if (data.length < 1) {
                cc.isNode(me._view.finds('img_zwnr$')) && me._view.finds('img_zwnr$').show();
                return;
            } else {
                cc.isNode(me._view.finds('img_zwnr$')) && me._view.finds('img_zwnr$').hide();
            }

            data = me.filterData(data);

            // for (var i = 0; i < data.length; i++) {
            //     var tid = data[i];
            //     var item = list.clone();
            //     item.data = {
            //         tid:tid,
            //         idx:i
            //     };
            //     setItem(item);
            //     listview.pushBackCustomItem(item);
            //     item.show();
            // }

            //tableview横版时lineheight需根据该list的锚点设置，改变的tableview的宽度大小
            scrollview.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
            // scrollview.setInnerContainerSize(cc.size(566,110));

            var table = me.table = new X.TableView(scrollview,list,1, function (ui, data) {
                setItem(ui,data);
            },cc.size(110,0),null,1);
            table.setData(data);
            table.reloadDataWithScroll(true);
            if(me.cacheIdx != undefined){
                table.scrollToCell(me.cacheIdx);
                var cell = table.cellByName(me.cacheTid);
                cell && cell[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
            function setItem(item,d) {
                X.autoInitUI(item);


                item.data = {
                    tid:d
                };

                var layIco = item.nodes.panel_yx;
                var imgGou = item.nodes.img_gou;
                var imgSuo = item.nodes.img_suo;

                item.setScale(.9);
                item.setName(d);
                layIco.setTouchEnabled(false);
                layIco.removeAllChildren();
                imgGou.hide();
                cc.isNode(imgSuo) && imgSuo.hide();

                var data = item.data;
                var heroData = G.DATA.yingxiong.list[data.tid];
                var jjcLockData = G.frame.yingxiong.getLockHeros();

                var wid = G.class.shero(heroData);
                wid.setPosition(cc.p(layIco.width / 2,layIco.height / 2));
                layIco.addChild(wid);

                if (me.selectedData == data.tid) {
                    imgGou.show();
                }

                wid.setHighLight(true);
                if (X.inArray(jjcLockData, data.tid) || heroData.islock) {
                    cc.isNode(imgSuo) && imgSuo.show();
                    wid.setEnabled(false);
                }
                item.star = heroData.star;
                item.setTouchEnabled(true);
                item.setSwallowTouches(false);
                item.touch(function (sender, type) {
                    if (type == ccui.Widget.TOUCH_NOMOVE) {
                        //已在竞技场上阵，不可选择
                        X.audio.playEffect("sound/dianji.mp3", false);
                        if(me.sender == sender) return;
                        me.sender = sender;
                        if (X.inArray(jjcLockData,sender.data.tid)) {
                            G.tip_NB.show(X.STR(L('YX_X_LOACKING'),L('jingjichang')));
                            return;
                        }

                        //已被锁定，不可选择
                        if (G.DATA.yingxiong.list[sender.data.tid].islock) {
                            G.tip_NB.show(L('YX_LOCKING'));
                            return;
                        }
                        me.cacheTid = sender.data.tid;
                        me.handleItems(sender);
                        if(cc.isNode(me.guang)){
                            me.guang.hide();
                        }
                        if(me.shuaxin_true){
                            me.panel_gx.removeAllChildren();
                            G.class.ani.show({
                                json: "ani_shijieshushuaxin",
                                addTo: me.panel_gx,
                                x: me.panel_gx.width / 2,
                                y: me.panel_gx.height / 2,
                                repeat: false,
                                autoRemove: true,
                            });
                        }else{
                            me.shuaxin_true = true;
                        }
                    }
                });
            }
        },
        handleItems: function (item) {
            var me = this;

            var childs = me.table.getAllChildren();

            for (var i = 0; i < childs.length; i++) {
                var child = childs[i];
                if (child.data.tid == item.data.tid) {
                    me.selectedData = child.data.tid;
                    child.nodes.img_gou.show();
                    me.setAttr(G.DATA.yingxiong.list[child.data.tid].star);
                } else {
                    child.nodes.img_gou.hide();
                }
            }

            me.setCenter();
            me.setBaseInfo();
        },
        filterData: function (d) {
            var me = this;


            var jjcLockData = G.frame.yingxiong.getLockHeros();
            var heroData = G.DATA.yingxiong.list;

            //对材料分类，分类依据：加锁与未加锁
            var canUseArr = [],
                lockArr = [];
            for (var i = 0; i < d.length; i++) {
                var tid = d[i];
                var data = heroData[tid];
                if (X.inArray(jjcLockData,tid) || data.islock) {
                    lockArr.push(tid);
                } else {
                    canUseArr.push(tid);
                }
            }

            canUseArr = me.extConf.getSort(canUseArr, "star", "zhongzu", "hid", "lv");
            lockArr = me.extConf.getSort(lockArr, "star", "zhongzu", "hid", "lv");


            var list = [].concat(canUseArr,lockArr);
            for(var i =0; i< list.length; i++){
                if(list[i] == me.cacheTid){
                    me.cacheIdx = i;
                    break;
                }
            }
            return list;
        }
    });

})();
