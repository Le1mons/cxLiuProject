/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    G.class.useJJCHero = function (tid, callback) {
        G.DATA.yingxiong.jjchero.splice(X.arrayFind(G.DATA.yingxiong.jjchero, tid), 1);
        callback && callback();
        connectApi("zypkjjc_retreat", [tid]);
    };
    G.class.useLockHero = function (tid, callback) {
        connectApi("hero_lock", [tid], function (d) {
            G.DATA.yingxiong.list[tid].islock = d.hero[tid].islock;
            callback && callback();
        });
    };

    //英雄信息
    var ID = 'yingxiong_xxxx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me.fullScreen = true;
            me.preLoadRes=['yingxiong_jn.png','yingxiong_jn.plist'];
            // me.needshowMainMenu = true;
            me._super(json, id,{action:true});
        },
        refreshPanel: function(data){
            var me = this;
            if(data && data.tid){
                me.curXbId = data.tid;
            }
            
            for(var i=0;i<me.list.length;i++) {
                if (me.list[i] == me.curXbId) {
                    me.curXbIdx = i;
                    break;
                }
            }

            if (me.from != 'yingxiong_tujian') {
                me.setTopMenu();
                var tiaozhuan = me.topMenu.getBtn(me._curType);
                me.topMenu.changeMenu(tiaozhuan ? me._curType : '1', true);
                me.setMeltSoulAwake();
            } else {
                var type = '1';
                me.nodes.nrirong.removeAllChildren();
                me._panels = me._panels || {};
                me._panels[type] = new G.class.yingxiong_tujian_xq(type);
                me.ui.finds('listview$').hide();
                me.nodes.nrirong.addChild(me._panels[type]);
                me._panels[type].show();
            }
        },
        bindUI: function () {
            var me = this;

            // 关闭
            me.nodes.btn_fanhui.data = [];
            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;
            me.isf = true;
            // setPanelTitle(me.nodes.tip_title, L('UI_TITLE_YXXX'));
            // me.nodes.tip_title.setBackGroundImage(X.getTitleImg('yxxx'),1);

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.curXbId = me.data().tid;
            me.list = me.data().list;
            me.from = me.data().frame;
            me.showToper();
            me.showRw(function () {
                cc.callLater(function () {
                    me.setTopMenu();
                    me.refreshPanel();

                    if (me.from != 'yingxiong_tujian') {
                        me.checkRedPoint();
                    }
                });
            });

            G.frame.yingxiong_xxxx.onnp("updateInfo", function () {
                if (me.from != 'yingxiong_tujian') {
                    me.checkRedPoint();
				}
            })
        },
        checkRedPoint: function(){
            var me = this;
            var isHave = false;
            var heroData = G.frame.yingxiong.getHeroDataByTid(G.frame.yingxiong_xxxx.curXbId);
            for(var i = 1; i < 6; i ++) {
                var comData = [];
                var data = i == 5 ? G.frame.beibao.DATA.shipin.list : G.frame.zhuangbei.getCanUseZbTidArrByType(i);
                if(!cc.isArray(data)){
                    var keys = X.keysOfObject(data);
                    for(var j = 0; j < keys.length; j ++){
                        comData.push(data[keys[j]]);
                    }
                }else{
                    for(var k = 0; k < data.length; k ++){
                        comData.push(G.frame.beibao.DATA.zhuangbei.list[data[k]]);
                    }
                }
                if(heroData.weardata && heroData.weardata[i]){
                    var myConf = i == "5" ? G.class.shipin.getById(heroData.weardata[i]) : G.class.equip.getById(heroData.weardata[i]);
                    for(var l = 0; l < comData.length; l ++){
                        if(comData[l].color > myConf.color || (comData[l].color == myConf.color && comData[l].star > myConf.star)){
                            isHave = true;
                            break;
                        }
                    }
                }
                if(isHave == false && (!heroData.weardata || !heroData.weardata[i])) {
                    if(comData.length > 0 ) {
                        isHave = true;
                        break;
                    }
                }
            }
            if(isHave || me.isChangeWuhun(me.curXbId)) {
                G.setNewIcoImg(me.nodes.listview.getChildren()[1]);
                me.nodes.listview.getChildren()[1].getChildByName("redPoint").x = 106;
                me.nodes.listview.getChildren()[1].getChildByName("redPoint").y = 52;
            }else{
                G.removeNewIco(me.nodes.listview.getChildren()[1]);
            }
        },
        onAniShow: function () {
            var me = this;
            cc.callLater(function(){
            	G.guidevent.emit('yingxiong_xxxxOpenOver');
            });
        },
        onRemove: function () {
            var me = this;

            X.releaseRes([
                'yingxiong_jn.plist','yingxiong_jn.png'
            ]);

            me.changeToperAttr();

            G.hongdian.getData("destiny", 1, function () {
                if (!X.inArray([2, 5], G.frame.yingxiong._curType)) {
                    G.frame.yingxiong.emit('updateInfo');
                }
            });
        },
        changeType: function(sender){
            var me = this;
            if(sender.disable){
                G.tip_NB.show(sender.show);
                return;
            }
            var type = sender.data.id;
            me._curType = type;

            var viewConf = {
                "1": G.class.yingxiong_yxqh,
                "2": G.class.yingxiong_zb,
                "4": G.class.yingxiong_yxsx,
                "3": G.class.yingxiong_yxrh,
                "5": G.class.yingxiong_dw
            };
            me._panels = me._panels || {};
            for (var _type in me._panels) {
                cc.isNode(me._panels[_type]) && me._panels[_type].hide();
            }
            if (!cc.isNode(me._panels[type])) {
                me._panels[type] = new viewConf[type](type);
                me.nodes.nrirong.addChild(me._panels[type]);
            }
            me._panels[type].show();
            me.showWuhun();
            me.setMeltSoulAwake();
            cc.callLater(function(){
            	G.guidevent.emit('yingxiong_xxxxChangeTypeOver');
            });
        },
        getCurType: function(){
            var me = this;
            return me._curType;
        },
        showRw: function(callback){
            var me = this;

            if (me._rwPanel) {
                me._rwPanel.removeFromParent();
                delete me._rwPanel;
            }
            me._rwPanel = new G.class.ui_tip_rw(null, function () {
                callback && callback();
            });
            me.ui.finds('panle_2').addChild(me._rwPanel);
        },
        checkTopMenu: function(conf){
            var me = this;
            var armyinfo = G.DATA.yingxiong.list[me.curXbId];
            var hero_data = G.class.herostarup.getById(armyinfo.hid);
            var key = X.keysOfObject(hero_data);
            var max_dengjie = key[key.length - 1];
            if(!armyinfo) return false;
            if(!conf) return false;

            if(armyinfo.dengjielv >= conf.dengjielv) {
                if(conf.closeLv) {
                    if(armyinfo.dengjielv >= conf.closeLv){
                        return false;
                    }else if(armyinfo.dengjielv >= max_dengjie){
                        return false;
                    }else{
                        if (conf.needDay) {
                            var _conf = G.gc.herocom.star2day;
                            if (_conf[armyinfo.dengjielv + 1]) {
                                if (X.getSeverDay() < _conf[armyinfo.dengjielv + 1]) return false;
                            }
                        }
                        if (conf.needLvDj) {
                            if (armyinfo.dengjielv == conf.needLvDj && P.gud.lv < conf.needLv) return false;
                        }
                        return true;
                    }
                }else if(conf.openlv){
                    if(armyinfo.lv < conf.openlv){
                        if (conf.title == G.class.menu.get('yingxiongxinxi')[2].title) {
                            if (armyinfo.extbuff && armyinfo.extbuff.meltsoul) {
                                return true;
                            }
                        }
                        return false
                    }else{
                        return true;
                    }
                }else return true;
            }else return false;
        },
        setTopMenu: function(){
            var me = this;
            var btns = [];
            var conf = X.clone(G.class.menu.get('yingxiongxinxi'));

            if ( me.from != 'yingxiong_tujian') {
                for(var i=0;i<conf.length;i++){
                    if(!conf[i].dengjielv) {
                        btns.push(conf[i]);
                    }else {
                        var result = me.checkTopMenu(conf[i]);
                        if(result) {
                            btns.push(conf[i]);
                        }
                    }
                }

                me.topMenu = new G.class.topMenu(me,{
                    btns:btns
                });
            }
        },
        getGmAddLv: function () {
            var me = this;
            var thirteenStar = 0;
            var data = G.DATA.yingxiong.list;

            for (var tid in data) if (data[tid].star >= 13) thirteenStar ++;

            if (thirteenStar) return (thirteenStar - 1) * 3;
            return 0;
        },
        showWuhun:function () {
            var me = this;
            var panel = me._rwPanel;
            var herodata = G.DATA.yingxiong.list[me.curXbId];
            var heroconf = G.gc.hero[herodata.hid];
            if(X.checkIsOpen("wztt") && herodata.star > 5 && me.from != 'yingxiong_tujian'){
                panel.nodes.panel_shengwu.show();
            }else {
                panel.nodes.panel_shengwu.hide();
                return;
            }
            me.checkWuhunRedPoint();
            panel.nodes.ico_sw.removeAllChildren();
            if(herodata.wuhun){
                var wuhundata = G.DATA.wuhun[herodata.wuhun];
                var wuhunitem = G.class.wuhun(wuhundata);
                wuhunitem.background.hide();
                wuhunitem.step.hide();
                wuhunitem.setAnchorPoint(0,0);
                panel.nodes.ico_sw.addChild(wuhunitem);
            }
            panel.nodes.panel_shengwu.setTouchEnabled(false);
            panel.nodes.ico_sw.click(function () {
                if(!heroconf.wuhun){//暂未开放
                    G.tip_NB.show(L("WUHUN1"));
                }else {
                    if(herodata.wuhun){//已经穿了武魂，显示武魂详情
                        G.frame.wuhun_info.data({
                            herodata:herodata,
                            whtid : herodata.wuhun,
                            type:"info"
                        }).show();
                    }else {//没有穿戴武魂
                        var wuhunid = [];
                        for(var k in G.DATA.wuhun){
                            if(!G.DATA.wuhun[k].wearer){
                                wuhunid.push(G.DATA.wuhun[k].id);
                            }
                        }
                        if(!X.inArray(wuhunid, G.gc.hero[herodata.hid].wuhun)){//当前无该武将穿戴的武魂
                            G.frame.alert.data({
                                cancelCall: null,
                                okCall: function () {
                                    //跳转到商店
                                    G.frame.shop.data({type:"12"}).show();
                                },
                                richText: X.STR(L("WUHUN5"),herodata.name),
                                sizeType: 3
                            }).show();
                        }else {
                            G.frame.wuhun_change.data(herodata).show();
                        }
                    }
                }
            })
        },
        checkWuhunRedPoint:function(){
            var me = this;
            var panel = me._rwPanel.nodes.panel_shengwu;
            if (!panel.ani) {
                G.class.ani.show({
                    json:"ani_jiahao_dh",
                    addTo:panel,
                    x:panel.width / 2 + 10,
                    y:panel.height /2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node) {
                        node.setScale(0.6);
                        panel.ani = node;
                    }
                });
            }
            if(me.isChangeWuhun(me.curXbId)){
                panel.ani && panel.ani.show();
            }else {
                panel.ani && panel.ani.hide();
            }
        },
        //若对应武将未穿戴武魂，且背包中有未穿戴的对应武将的专属武魂
        isChangeWuhun:function(tid){
            var heroData = G.DATA.yingxiong.list[tid];
            if (!heroData) return false;
            var ifwuhun = false;
            for(var k in G.DATA.wuhun){
                var wuhundata = G.DATA.wuhun[k];
                if(G.gc.hero[heroData.hid].wuhun == wuhundata.id && !wuhundata.wearer){//背包中有可以穿戴的武魂
                    ifwuhun = true;
                    break;
                }
            }
            if(!heroData.wuhun && ifwuhun) return true;
            return false;
        },
        //设置融魂觉醒，12且融魂8阶的英雄达到6个开启融魂觉醒
        setMeltSoulAwake:function () {
            var me = this;
            var panel = me._rwPanel;
            if (me.getCurType()!=3){
                panel.nodes.panel_juexing.hide();
                return;
            }
            var _num=0;
            var data = G.DATA.yingxiong.list;
            for (var i in data){
                if (data[i].meltsoul>=8){
                    _num++;
                }
            }
            if (_num>=6 || P.gud.mswake>0){
                panel.nodes.panel_juexing.show();
            }else {
                panel.nodes.panel_juexing.hide();
            }
            panel.nodes.ico_jx.click(function () {
                G.frame.yingxiong_metlsoulAwake.show();
            })
        }
    });

    G.frame[ID] = new fun('yingxiong_xinjiegou.json', ID);
})();