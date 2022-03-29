/**
 * Created by wlx on 2019/12/16.
 */
(function () {
    //激活羁绊
    var ID = 'jiban_jhjb';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            });
            me.nodes.btn_tx.click(function () {
                if(!me.selectTid) return G.tip_NB.show(L("WUJIANGLZ_QXZWJ"));
                var newstar = me.selectstar;
                connectApi('jiban_uphero',[me.jibanid,me.pos,me.selectTid,me.uid||""],function () {
                    if(!me.ifchange){
                        G.event.emit('sdkevent',{
                            event:'jiban_Activate',
                            data:{
                                Group:me.jibanid,
                            }
                        });
                    }
                    G.frame.jiban_info.getData(function () {
                        G.hongdian.getData("jiban",1,function () {
                            G.frame.jiban_info.setContents();
                            G.frame.jiban_info.showjibanInfo();
                            G.frame.jiban_info.showHeroModel();
                            if(cc.isNode(G.frame.jiban_main.ui)){
                                G.frame.jiban_main.setContents();
                            };
                            G.frame.linghunjitan.checkRedPoint();
                        });
                    });
                    me.remove();
                    if(!me.ifchange || newstar > me.oldstar) G.tip_NB.show(L("WUJIANGLZ_JBZJ"));
                })

            });
            cc.enableScrollBar(me.nodes.scrollview);
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.plid = me.data().plid;
            me.jibanid = me.data().jibanid;
            me.pos = me.data().pos;
            me.uphero = me.data().uphero;
            me.ifchange = me.data().ifchange;//是增加还是换武将
            me.oldstar = me.data().star;
            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            var data = me.sortHero();
            if(data.length <= 0) return me.nodes.img_zwnr.show();
            me.heroArray = [];
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 5, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 0, 0);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var hero = JSON.parse(JSON.stringify(G.gc.hero[data.hid]));
            hero.lv = data.lv;
            hero.star = data.star;
            var wid = new G.class.shero(hero);
            wid.setAnchorPoint(0,0);
            ui.nodes.ico_wj.addChild(wid);
            if(data.uid == P.gud.uid){//是自己
                ui.nodes.txt_wjmz.setString(P.gud.name);
            }else {//其他玩家
                ui.nodes.txt_wjmz.setString(data.name);
            }
            me.heroArray.push(wid);
            ui.nodes.ico_wj.setTouchEnabled(true);
            ui.nodes.ico_wj.setSwallowTouches(false);
            ui.nodes.ico_wj.data = data;
            ui.nodes.ico_wj.wid = wid;
            ui.data = data;
            ui.nodes.ico_wj.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    for (var i= 0; i < me.heroArray.length; i++) {
                        if (sender.data.tid != me.heroArray[i].data.tid) {
                            me.heroArray[i].setGou(false);
                        }
                    }
                    if(sender.data.tid == me.selectTid){
                        sender.wid.setGou(false);
                        me.selectTid = 0;
                        me.selectstar = -1;
                        me.uid = "";
                    }else {
                        if(sender.data.ext) me.uid = sender.data.uid;
                        sender.wid.setGou(true);
                        me.selectTid = sender.data.tid;
                        me.selectstar = sender.data.star;//选择的武将的品质
                    }
                }
            })

        },
        sortHero:function(){
            var me = this;
            me.DATA.sort(function (a,b) {
                if(a.star != b.star){
                    return a.star > b.star ? -1:1;
                } if(a.color != b.color){
                    return a.color > b.color ? -1:1;
                } else if(a.lv != b.lv){
                    return a.lv > b.lv ? -1:1;
                }
            });
            return me.DATA;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            connectApi('jiban_extlist',[me.plid],function (data) {
                me.DATA = [];
                for(var i in data){
                    me.DATA.push(data[i]);
                }
                callback && callback();
            })
        }
    });
    G.frame[ID] = new fun('jiban_jhjb.json', ID);
})();