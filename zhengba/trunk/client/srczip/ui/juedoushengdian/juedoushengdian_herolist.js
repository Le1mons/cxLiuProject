/**
 * Created by  on 2019//.
 */
(function () {
    //决战盛典英雄列表
    var ID = 'juedoushengdian_herolist';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.initZzBtn();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview_zz);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
            //一件配装
            me.nodes.btn_yjpz.click(function () {
                G.frame.alert.data({
                    sizeType: 3,
                    cancelCall: null,
                    okCall: function () {
                        me.ajax('gpjjc_yjwear',[],function (str,data) {
                            if(data.s == 1){
                                G.tip_NB.show(L('JUEDOUSHENGDIAN19'));
                            }
                        })
                    },
                    richText: L("JUEDOUSHENGDIAN18"),
                }).show();
            });
            me.nodes.ico.hide();
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.getHeroData(function () {
                _super.apply(me,arg);
            });
        },
        onShow: function () {
            var me = this;
            me.btnarr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        //种族按钮
        initZzBtn:function(){
            var me = this;
            me.nodes.listview_zz.removeAllChildren();
            me.nodes.zz_list.hide();
            me.btnarr = [];
            for(var i = 1; i < 7; i++){
                var ico = me.nodes.zz_list.clone();
                X.autoInitUI(ico);
                ico.show();
                ico.nodes.panel_pj.removeBackGroundImage();
                ico.nodes.panel_pj.setBackGroundImage('img/public/ico/ico_zz' + (i+1) + '.png', 1);
                ico.nodes.panel_pj.setTouchEnabled(false);
                ico.index = i;
                ico.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        for(var j = 0; j < me.btnarr.length; j++){
                            if(me.btnarr[j].index == sender.index){
                                me.btnarr[j].nodes.img_yuan_xz.show();
                            }else {
                                me.curZhongzu = sender.index;
                                me.setContents(true);
                                me.btnarr[j].nodes.img_yuan_xz.hide();
                            }
                        }
                    }
                });
                me.btnarr.push(ico);
                me.nodes.listview_zz.pushBackCustomItem(ico);
            }
        },
        setContents:function (isTop) {
            var me = this;
            var data = [].concat(me.filterData());
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.ico, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 10, 3);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(isTop || false);
            }
        },
        setItem:function (ui,data) {
            
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setTouchEnabled(false);
            ui.removeAllChildren();
            data.star = 10;
            G.frame.juedoushengdian_main.addSkin(data);
            var hero = G.class.shero(data);
            if(hero.lv) hero.lv.hide();
            if(hero.panel_xx)hero.panel_xx.hide();
            if(X.inArray(G.frame.juedoushengdian_main.DATA.myinfo.lock,data.hid)){//锁定了
                hero.setGou(true, "img_suo");
                hero.gou.setScale(0.8);
                hero.gou.setPosition(80,80);
            }else {
                hero.setGou(false);
            }
            hero.setTouchEnabled(true);
            hero.setSwallowTouches(false);
            hero.setPosition(0,0);
            hero.setAnchorPoint(0,0);
            hero.data = data;
            hero.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    hero.data.star = 10;
                    G.frame.juedoushengdian_heroinfo.once('willClose', function () {
                        me.setContents();
                    }).data(hero.data).show();
                }
            });
            ui.addChild(hero);
        },
        //选出可升为10星的英雄
        getHeroData:function (callback) {
            var me = this;
            me.heroListData = [];
            for(var k in G.gc.hero){
                if(G.gc.hero[k].tenstarico != ""){
                    me.heroListData.push(JSON.parse(JSON.stringify(G.gc.hero[k])));
                }
            }
            callback && callback();
        },
        //根据种族分类
        filterData:function () {
            var me = this;
            if(me.curZhongzu == 0){
                me.heroarr = me.heroListData;
                return me.heroarr;
            }
            me.heroarr = [];
            for(var i = 0; i < me.heroListData.length; i++){
                if(me.heroListData[i].zhongzu == me.curZhongzu){
                    me.heroarr.push(me.heroListData[i]);
                    if (me.heroListData[i].skin) {
                        me.heroListData[i].skin = undefined;
                        delete me.heroListData[i].skin;
                    }
                }
            }
            return me.heroarr;
        }
    });
    G.frame[ID] = new fun('juedoushengdian_tankuang.json', ID);
})();