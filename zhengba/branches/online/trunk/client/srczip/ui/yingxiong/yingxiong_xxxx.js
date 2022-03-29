/**
 * Created by zhangming on 2018-05-03
 */
(function () {
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
            } else {
                var type = '1';
                me.nodes.nrirong.removeAllChildren();
                me._panels = me._panels || {};
                me._panels[type] = new G.class.yingxiong_tujian_xq(type);
                me.ui.finds('listview$').hide();
                me.nodes.nrirong.addChild(me._panels[type]);
                me._panels[type].show();
            }
            // me.ui.finds('listview$').setPositionY(me.ui.finds('panle_1').height +  me.ui.finds('listview$').height/8 - 100);
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

            // me.showMainMenu();
            me.showToper();

            me.curXbId = me.data().tid;
            me.list = me.data().list;
            // me.curXbIdx = me.data().idx;
            // me.curZhongzu = me.data().zhongzu;
            me.from = me.data().frame;

            me.setTopMenu();
            me.refreshPanel();
            me.showRw();
            if (me.from != 'yingxiong_tujian') {
                me.checkRedPoint();
            }

            // G.frame.yingxiong_xxxx.getData(function(){
            //     callback && callback();
            // }, me.data());
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
            if(isHave) {
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

            if (me.from != 'yingxiong_tujian') {
                G.frame.yingxiong.emit('updateInfo');
            }

            me.changeToperAttr();
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
            
            cc.callLater(function(){
            	G.guidevent.emit('yingxiong_xxxxChangeTypeOver');
            });
        },
        getCurType: function(){
            var me = this;
            return me._curType;
        },
        showRw: function(){
            var me = this;

            if (me._rwPanel) {
                me._rwPanel.removeFromParent();
                delete me._rwPanel;
            }
            me._rwPanel = new G.class.ui_tip_rw();
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
                        return true;
                    }
                }else if(conf.openlv){
                    if(armyinfo.lv < conf.openlv){
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
    });

    G.frame[ID] = new fun('yingxiong_xinjiegou.json', ID);
})();