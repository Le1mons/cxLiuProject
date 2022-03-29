// // G.class.yingxiong_zhongzu_xuanze.prototype.setItem = function (ui, data) {var me = this;if (me._headUI.length < 6) {me._headUI.push(ui);}X.autoInitUI(ui);var heroData;if (me.fightData.pvType == "pvmaze") {heroData = me.getHeroData(data);} else if (me.fightData.pvType && me.fightData.pvType.indexOf("sznfight") != -1) {heroData = me.getHeroData2(data);} else heroData = me.heroList[data];ui._tid = data;ui.setName(heroData.hid);var widget = G.class.shero(heroData, G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp, null, me.heroList[data] ? false : true);var hp = 100;var pl = false;if (G.frame.yingxiong_fight.top && G.frame.yingxiong_fight.top.showHelp) {widget.title.setFontSize(20);widget.title.y = -18;widget.title.setString(me.getHelpNam(data));widget.title.setTextColor(cc.color('#ffffff'));}widget.setName('widget');widget.setAnchorPoint(0.5, 1);widget.setPosition(cc.p(ui.nodes.panel_ico.width * 0.5, ui.nodes.panel_ico.height));if (X.inArray(["pvshizijun", "pvmaze", 'pvwjzz'], me.fightData.pvType)) {widget.setScale(0.9);if (X.inArray(me.inStatus, data)) {if (me.status[data].maxhp != undefined) {hp = me.status[data].hp <= 0 ? 0 : me.status[data].hp / me.status[data].maxhp * 100;} else {hp = me.status[data].hp;}widget.setHP(hp, true);} else {widget.setHP(hp, true);}} else {widget.setScale(0.9);}if (me.fightData.pvType == "pvwjzz") {pl = me.getPl(data) >= 5;widget.setNQ((5 - me.getPl(data)) / 5 * 100, true);}if (me.fightData.pvType == "wjzz_def") {var isOther = me.getIsOther(data);widget.setEnabled(!isOther);ui.isOther = isOther;ui.queue = me.getQueue(data);ui.nodes.img_suo.setVisible(isOther);}if (me.fightData.norepeat) {ui.nodes.img_suo.setVisible(X.inArray(me.fightData.norepeat, data) && !X.inArray(me.selectedData, ui._tid));ui.nodes.img_suo.setTouchEnabled(true);}ui.heroData = heroData;ui.nodes.panel_ico.removeAllChildren();ui.nodes.panel_ico.addChild(widget);ui.nodes.panel_ico.setTouchEnabled(false);ui.nodes.panel_ico.show();var imgRwz = ui.nodes.img_rwz;imgRwz.hide();var imgFsz = ui.nodes.img_fsz;if (heroData.fyz) imgFsz.show(); else imgFsz.hide();ui.setTimeout(function () {if (X.inArray(me.selectedData, ui._tid)) {var yuanjunImg = G.frame.yingxiong_fight.top.itemArr[6].data == ui._tid;widget.setGou(true, yuanjunImg ? "img_yuan" : "");}}, 100);if (hp <= 0) {ui.nodes.img_yzw.show();ui.nodes.img_yzw.setScale(.9);ui.nodes.img_yzw.y += 4;widget.setEnabled(false);} else {if (pl) {widget.setEnabled(false);}ui.nodes.img_yzw.hide();}ui.data = data;ui.setTouchEnabled(true);ui.setSwallowTouches(false);ui.touch(function (sender, type) {if (type == ccui.Widget.TOUCH_NOMOVE) {if (G.frame.yingxiong_fight.isHelp && G.frame.yingxiong_fight.top.showHelp && G.frame.yingxiong_fight.DATA.borrownum <= 0) {return G.tip_NB.show(L('lht_zjmax'));}G.frame.yingxiong_fight.posSelect = G.frame.yingxiong_fight.ui.convertToNodeSpace(sender.getParent().convertToWorldSpace(sender.getPosition()));if (sender.isOther) {return G.tip_NB.show(X.STR(L("SZYXD"), sender.queue + 1));}if (sender.heroData.fyz) return G.tip_NB.show(L("YXFSZ"));var plidarr = [];for (var k=0;k<me.selectedData.length;k++){if (G.DATA.yingxiong.list[me.selectedData[k]] && G.DATA.yingxiong.list[me.selectedData[k]].zhongzu==7){plidarr.push(G.DATA.yingxiong.list[me.selectedData[k]].pinglunid);}}var plid = G.DATA.yingxiong.list[sender.data]?G.DATA.yingxiong.list[sender.data].pinglunid:0;if (X.inArray(plidarr,plid) && !X.inArray(me.selectedData, sender.data)){return  G.tip_NB.show('传说种族同名英雄只可以上阵一个');}if (X.inArray(me.selectedData, sender.data)) {G.frame.yingxiong_fight.posSelect.x += sender.width / 2;sender.finds('widget').setGou(false);me.selectedData.splice(X.arrayFind(me.selectedData, sender.data), 1);G.frame.yingxiong_fight.top.removeItem(sender.data);} else {if (G.frame.yingxiong_fight.isHelp && G.frame.yingxiong_fight.top.showHelp) {var helpTid;for (var tid of me.selectedData) {if (!G.DATA.yingxiong.list[tid]) {helpTid = tid;break;}}if (helpTid) {G.frame.yingxiong_fight.top.removeItem(helpTid, true);}}if (hp <= 0) {G.tip_NB.show(L("YX_YZW"));return;}if (pl) return G.tip_NB.show(L("hero_pl"));var num = 0;var item = G.frame.yingxiong_fight.top.itemArr;for (var index = 0; index < 6; index++) {if (item[index].data) num++;}if (num >= G.frame.yingxiong_fight.top.extConf.maxnum && !G.frame.yingxiong_fight.top.yj) {G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));return;}if (G.frame.yingxiong_fight.top.yj && item[6].data) {G.tip_NB.show(L('YX_FIGHT_XZ_FULL'));return;}me.selectedData.push(sender.data);sender.finds('widget').setGou(true, G.frame.yingxiong_fight.top.yj ? "img_yuan" : "");G.frame.yingxiong_fight.top.addItem(sender.data);if (cc.isNode(G.frame.yingxiong_fight.item)) {G.frame.yingxiong_fight.item.stopAllActions();G.frame.yingxiong_fight.item.removeFromParent();}var itemClone = G.frame.yingxiong_fight.item = sender.clone();itemClone.finds('gou') && itemClone.finds('gou').hide();itemClone.setPosition(G.frame.yingxiong_fight.posSelect);G.frame.yingxiong_fight.ui.addChild(itemClone);G.frame.yingxiong_fight.playAniMove(itemClone);}}}, null, { "touchDelay": G.DATA.touchHeroHeadTimeInterval });ui.show();};
// G.frame.sf_xingyuntouzi.initUI = function(){
//     var me = this;
//     X.render({
//         txt_sj2: function(node){
//             var rtime = X.getTodayZeroTime() + 24*3600;
//             if(me.timer) {
//                 node.clearTimeout(me.timer);
//                 delete me.timer;
//             }
//             me.timer = X.timeout(node, rtime, function () {
//                 G.DAO.springfestival.getServerData(function () {
//                     me.remove();
//                 });
//             }, null, {
//                 showDay: true
//             });
//         },
//         txt_sj1:'重置时间:',
//         txt_sj4:6,
//         btn_lan:function (node) {
//             node.click(function (sender,type) {
//                 if (me.nowType == 'me' && me.myNum<=0 && !sender.state)return;
//                 if (me.isAni) return;
//                 me.nowType = 'me';
//                 if (sender.state){
//                     if (sender.state=='gameend'){
//                         me.gameEnd();
//                     } else if (sender.state=='reset') {
//                         me.resetGame();
//                     }
//                 } else {
//                     me.touZiRandAniMe(me.myNum);
//                     me.myNum -- ;
//                     me.nodes.txt_sj4.setString(me.myNum);
//                 }
//             },500)
//         },
//         Panel_bangzhu:function (node) {
//             node.click(function (sender,type) {
//                 me.ui.finds('Image_bz').hide();
//                 me.nodes.Panel_bangzhu.setTouchEnabled(false);
//             });
//         },
//         btn_gz:function (node) {
//             node.click(function (sender,type) {
//                 if ( me.ui.finds('Image_bz').visible){
//                     me.ui.finds('Image_bz').hide();
//                     me.nodes.Panel_bangzhu.setTouchEnabled(false);
//                 } else {
//                     me.ui.finds('Image_bz').show();
//                     me.nodes.Panel_bangzhu.setTouchEnabled(true);
//                 }
//             });
//         },
//         btn_lan1:function (node) {
//             node.click(function (sender,type) {
//                 me.nodes.Panel_hhks.hide();
//                 me.resetGame();
//             });
//         },
//         btn_lan2:function (node) {
//             node.click(function (sender,type) {
//                 me.remove();
//             });
//         }
//     }, me.nodes);
//     if (!X.cacheByUid('openteheGz')){
//         me.nodes.btn_gz.triggerTouch(2);
//         X.cacheByUid('openteheGz',1);
//     }
// };
G.frame.huodong_xcjc.onOpen =  function () {
    var me = this;
    me.nodes.btn_fh.click(function () {
        me.remove();
    });
    me.nodes.panel_btn1.setAnchorPoint(0.5,0.5);
    me.nodes.panel_btn1.setPositionY(190);
};








