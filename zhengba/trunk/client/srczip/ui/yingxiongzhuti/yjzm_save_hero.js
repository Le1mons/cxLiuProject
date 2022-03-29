/**
 * Created by LYF on 2018/10/22.
 */
(function () {
    //永杰之门-保存备战阵容
    G.class.yjzm_save_hero = X.bView.extend({
        extConf:{
            maxnum:6,
        },
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super('zhandou_chuzhan.json');
        },
        refreshPanel: function () {
            var me = this;

            me.setContents();
        },
        bindBTN: function () {
            var me = this;
            me.nodes.btn_bc.setTitleText(L('FIGHT'));
            me.nodes.btn_bc.click(function () {
                var arr = me.getSelectedData();
                if(arr.length < 1) {
                    G.tip_NB.show(L('QFRXYBZDYX'));
                    return;
                }

                me.ajax("herotheme_guankafight", [G.frame.yjzm_setDef.DATA.level,me.getObj(arr)], function (str, data) {
                    if(data.s == 1) {
                        G.frame.fight.data({
                            prize:data.d.prize,
                            pvType: 'herothemedoor',
                        }).once('show', function() {
                            G.frame.yjzm_setDef.remove();
                        }).demo(data.d.fightres);
                        if(data.d.fightres.winside == 0){
                            G.frame.yingxiongzhuti.DATA.myinfo.guankarec = data.d.myinfo.guankarec;
                            G.frame.yingxiongzhuti.DATA.myinfo.task = data.d.myinfo.task;
                            G.frame.yxzt_yjzm.DATA.guankarec = data.d.myinfo.guankarec;
                            G.frame.yxzt_yjzm.DATA.task = data.d.myinfo.task;
                            // G.frame.yxzt_yjzm.DATA.guankarec.win.push(G.frame.yjzm_setDef.DATA.level);
                            if(G.frame.yxzt_yjzm.isShow){
                                G.frame.yxzt_yjzm.setContents();
                                G.frame.yxzt_yjzm.xuanzhuan();
                            }
                        }
                    }
                })
            })
        },
        getObj:function(arr){
          var me = this;
          var obj = {};
          for (var i=0;i<arr.length;i++){
              obj[i+1] = arr[i].toString();
          }
          return obj;
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
            me.panel_yx = me.ui.finds("panel_yx");
        },
        onShow: function () {
            var me = this;
            me.fightData = (G.frame.yjzm_setDef.data() && G.frame.yjzm_setDef.data().hero) || [];
            me.refreshPanel();

            me.ui.finds("panel_time").hide();
        },
        onRemove: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.createLayout();
        },
        createLayout: function () {
            var me = this;
            var list = me.nodes.list_yx;

            me.itemArr = [];
            for(var i = 0; i < me.extConf.maxnum; i ++) {
                var item = list.clone();
                item.idx = i;
                item.setName(i);
                item.show();
                me.setItem(item);
                me.itemArr.push(item);
            }
            X.center(me.itemArr, me.panel_yx, {
                scale: .9
            });
        },
        loadCache: function() {
            var me = this;

            for(var i = 0; i < me.itemArr.length; i ++) {
                var item = me.itemArr[i];
                if(me.fightData[i]) {
                    var tid = me.fightData[i].tid;
                    var latIco = item.nodes.panel_yx;
                    var wid = G.class.shero(me.fightData[i]);
                    wid.setAnchorPoint(0.5, 1);
                    wid.setPosition(latIco.width / 2, latIco.height);
                    latIco.addChild(wid);
                    item.data = tid;
                }
            }
            me.setZL();
        },
        setItem: function (item) {
            X.autoInitUI(item);
            var me = this;
            var layIco = item.nodes.panel_yx;
            layIco.setTouchEnabled(false);
            layIco.removeAllChildren();

            item.setTouchEnabled(true);
            item.click(function (sender) {
                if (sender.data) {
                    me.removeItem(sender.data);
                }
            })
        },
        removeItem: function (tid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                var layIco = item.nodes.panel_yx;
                if (item.data && item.data == tid) {
                    var idx = X.arrayFind(G.frame.yjzm_setDef.top.selectedData, tid);
                    if (idx > -1) {
                        G.frame.yjzm_setDef.top.selectedData.splice(idx, 1);
                        G.frame.yjzm_setDef.top.removeGou(tid);
                    }

                    var child = G.frame.yjzm_setDef.top.getChildByTid(tid);
                    if (child) {
                        G.frame.yjzm_setDef.posSelect = G.frame.yjzm_setDef.ui.convertToNodeSpace(child.getParent().convertToWorldSpace(child.getPosition()));
                        G.frame.yjzm_setDef.posSelect.x += child.width / 2;
                    }
                    if (cc.isNode(G.frame.yjzm_setDef.item)) {
                        G.frame.yjzm_setDef.item.stopAllActions();
                        G.frame.yjzm_setDef.item.removeFromParent();
                    }
                    G.frame.yjzm_setDef.playAniType = 'remove';
                    G.frame.yjzm_setDef.posSz = G.frame.yjzm_setDef.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    var itemClone = G.frame.yjzm_setDef.item = layIco.clone();
                    itemClone.setPosition(G.frame.yjzm_setDef.posSz);
                    G.frame.yjzm_setDef.ui.addChild(itemClone);
                    G.frame.yjzm_setDef.playAniMove(itemClone);

                    delete item.data;
                    layIco.removeAllChildren();
                }
            }
            me.setZL();
        },
        addItem: function (hid) {
            var me = this;

            var itemArr = me.itemArr;
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (!item.data) {
                    item.data = hid;
                    var layIco = item.nodes.panel_yx;
                    var wid = G.class.shero(G.frame.yjzm_setDef.DATA.hero[hid]);
                    wid.setAnchorPoint(0.5,1);
                    wid.setPosition(cc.p(layIco.width / 2,layIco.height));
                    layIco.addChild(wid);
                    wid.hide();
                    me.ui.setTimeout(function () {
                        wid.show();
                    }, 180);

                    G.frame.yjzm_setDef.playAniType = 'add';
                    G.frame.yjzm_setDef.posSz = G.frame.yjzm_setDef.ui.convertToNodeSpace(layIco.getParent().convertToWorldSpace(layIco.getPosition()));
                    G.frame.yjzm_setDef.posSz.x -= layIco.width / 2;
                    break;
                }
            }
            me.setZL();
        },
        getSelectedData: function () {
            var me = this;

            var itemArr = me.itemArr;
            var arr = [];
            for (var i = 0; i < itemArr.length; i++) {
                var item = itemArr[i];
                if (item.data) {
                    arr.push(item.data);
                }
            }
            return arr;
        },
        setZL: function () {
            var me = this;
            var num = 0;
            var txt = me.nodes.txt_djs;
            txt.setString('???');
        }
    });

})();