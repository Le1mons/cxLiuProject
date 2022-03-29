(function(){
    var ID = 'yxjz';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            this._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.scrollview);
            cc.enableScrollBar(me.nodes.listview_zz);

            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS79')
                }).show();
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("mjhj_getlist", [], function (str, data) {
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        show : function(args){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me, args);
            });
        },
        onShow: function () {
            var me = this;

            me.createMenu();
            me.refreshRedPoint();
            var type = me.curType || 0;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        createMenu: function(){
            var me = this;
            me._menus = [];

            //图标中，1指的是全部
            for(var i=0;i<7;i++){
                var list_ico = me.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);
                list_ico.data = i;
                list_ico.setTouchEnabled(true);
                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList(true);
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani){
                                sender.ani.show();
                            }else{
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function(node){
                                        sender.ani = node;
                                    }
                                })
                            }
                        }else{
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });

                me._menus.push(list_ico);
                me.nodes.listview_zz.pushBackCustomItem(list_ico);
            }
        },
        getHeroByZhongzuAndColor:function(zz){
            var me = this;
            var lastarr = [];
            var allhero = G.gc.hero;
            if (zz==0){
                for (var i in allhero){
                    if (allhero[i].color == 4){
                        lastarr.push(i);
                    }
                };
            } else {
                for (var i in allhero){
                    if (allhero[i].zhongzu == zz && allhero[i].color == 4){
                        lastarr.push(i);
                    }
                };
            }
            lastarr.sort(function (a,b) {
                var codea = me.thisHeroCan(a);
                var codeb = me.thisHeroCan(b);
                return codea - codeb>0?-1:1;
            });
            return lastarr;
        },
        thisHeroCan:function(hid){
            var me = this;
            var plid = G.gc.hero[hid].pinglunid;
            var mjhjconf = G.gc.mjhj.upinfo;
            var code = 0;
            var data = me.DATA.info;
            if (data[plid]){
                //说明已经抽到过此英雄
                if (data[plid].lv==0){
                    if (data[plid].getnum >= mjhjconf[data[plid].lv].getnum){
                        code=1;//可激活
                    }
                }else if (data[plid].lv>0){
                    if (mjhjconf[data[plid].lv] && data[plid].getnum>=mjhjconf[data[plid].lv].getnum){
                        code=2;//可升级
                    }else {
                        code = data[plid].lv*0.1;
                    }
                } else {
                    code = 0;
                }
            }
            return code;
        },
        setTotalBuff:function () {
            var me = this;
            var arr = me.getHeroByZhongzuAndColor(0);
            var mjhjconf = G.gc.mjhj;
            var buff = {
                'eatk':0,
                'ehp':0
            }
            var data =  me.DATA.info;
            for (var i in arr){
                var heroJson = G.gc.hero[arr[i]];
                var plid = heroJson.pinglunid;
                if (data[plid]){
                    var hjbuff = mjhjconf['buffinfo'][heroJson.huijuantype][data[plid].lv];
                    buff.eatk += hjbuff.atk;
                    buff.ehp += hjbuff.hp;
                }

            }
            me.nodes.txt_sz1.setString('+' + buff.eatk);
            me.nodes.txt_sz2.setString('+' + buff.ehp);
        },
        fmtItemList: function (isTop) {
            var me = this;
            var lastArr = me.getHeroByZhongzuAndColor(me.curType);

            if (!me.table) {
                me.nodes.scrollview.removeAllChildren();
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.list, 2, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(lastArr);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(lastArr);
                me.table.reloadDataWithScroll(isTop || false);
            }
            me.setTotalBuff();
        },
        setItem: function (ui, data) {
            var me = this;
            var heroJson = G.gc.hero[data];
            var herocode = me.thisHeroCan(data);
            var herolv = me.DATA.info[heroJson.pinglunid] ? me.DATA.info[heroJson.pinglunid].lv : 0;

            X.autoInitUI(ui);
            X.render({
                txt_mz: heroJson.name,
                panel_yx: function (node) {
                    node.removeAllChildren();
                    X.setHeroModel({
                        cache: false,
                        parent: node,
                        data: heroJson,
                        model: heroJson.model,
                        noParentRemove: true,
                        callback: function (spine) {
                            spine.runAni(0, herolv == 0 ? 'shihua' : "wait", true);
                        }
                    });
                    // if (herocode == 2) {
                    //     G.class.ani.show({
                    //         json: 'yxjz_tx_ksj',
                    //         addTo: node,
                    //         repeat: true,
                    //         autoRemove: false
                    //     });
                    // }
                },
                panel_xx: function (node) {
                    node.setVisible(herolv != 0);
                    if (herolv != 0) {
                        G.class.ui_star(node, herolv, 1, {interval:5}, null, 10);
                    }
                },
                img_jh: function (node) {
                    node.setVisible(herocode >= 1 && herolv < 3);
                    node.removeAllChildren();
                    node.setBackGroundImage('img/yingxiongjuanzhou/img_' + (herocode == 1 ? 'kjh':'ksj') + '.png', 1);
                    G.class.ani.show({
                        json: herocode == 1 ? 'yxjz_tx_kjh':'yxjz_tx_ksj',
                        addTo: node,
                        repeat: true,
                        autoRemove: false
                    });
                },
                img_wjh: function (node) {
                    node.setBackGroundImage('img/yingxiongjuanzhou/img_' + (herocode == 0 ? 'wjh' : 'kjh') + '.png', 1);
                    node.setVisible(herocode == 0);
                }
            }, ui.nodes);

            ui.finds('panel_xx$_0').setVisible(false);
            ui.setTouchEnabled(herocode != 0);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    G.frame.mjhj_uplv.data({
                        lv: herolv,
                        hid: data,
                        num: me.DATA.info[heroJson.pinglunid].getnum
                    }).show();
                }
            });
        },
        refreshRedPoint:function () {
            var me = this;

            for (var btn of me._menus) {
                var zhongzu = btn.data;
                var heros = me.getHeroByZhongzuAndColor(zhongzu);
                var isRedPoint = false;
                for (var hid of heros) {
                    if (me.thisHeroCan(hid) >= 1) {
                        isRedPoint = true;
                        break;
                    }
                }
                if (isRedPoint) {
                    G.setNewIcoImg(btn);
                } else {
                    G.removeNewIco(btn);
                }
            }
        },
    });
    G.frame[ID] = new fun("yingxiongjuanzhou.json", ID);
})();