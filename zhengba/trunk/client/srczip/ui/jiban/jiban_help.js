/**
 * Created by wlx on 2019/12/16.
 */
(function () {
    //我的派遣
    var ID = 'jiban_help';
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
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            //派遣数量
            me.nodes.txt_szwy.setString(X.keysOfObject(me.heroinfo).length + "/" + 6);

            var data = me.DATA;
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_rank, 1, function (ui, data) {
                    ui.setSwallowTouches(false);
                    me.setItem(ui, data);
                }, null,null,8,10);
                table.setData(data);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.setSwallowTouches(false);
            ui.nodes.txt_name1.setTouchEnabled(false);
            ui.nodes.txt_xzwz.setTouchEnabled(false);
            ui.tid = data.tid;
            ui.nodes.panel_wp1.removeAllChildren();
            if(data){//有武将
                ui.nodes.panel_sj01.show();
                ui.nodes.panel_sj02.hide();
                var heroconf = G.DATA.yingxiong.list[data.tid];
                var heroico = G.class.shero(heroconf);
                heroico.setTouchEnabled(true);
                heroico.tid = data.tid;
                heroico.touch(function (sender,type) {
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        G.frame.jiban_select.data(sender.tid).show();
                    }
                });
                heroico.setAnchorPoint(0,0);
                ui.nodes.panel_wp1.addChild(heroico);
                //名字品级
                var color = G.gc.hero[heroconf.hid].color;
                if(heroconf.star && heroconf.star >= 6){
                    var strpj = X.STR(L("WUJIANGLZ_XING"),heroconf.star);
                }else {
                    var strpj = L("SAMECOLOR_"+color);
                }
                ui.nodes.txt_name1.removeAllChildren();
                var rh = X.setRichText({
                    str:heroconf.name + "<font color=#e86222>·" + strpj + "</font>",
                    parent:ui.nodes.txt_name1,
                });

                //是否被别的玩家召集了
                if(X.keysOfObject(data.uidinfo).length > 0){
                    var st =  X.setRichText({
                        parent:ui.nodes.txt_xzwz,
                        str:X.STR(L("WUJIANGLZ_HELP"),data.uidinfo[X.keysOfObject(data.uidinfo)[0]]),
                        color:"#522a11",
                        size:18,
                    })
                }else {
                    var st =  X.setRichText({
                        parent:ui.nodes.txt_xzwz,
                        str:L("WUJIANGLZ_NOHELP"),
                        color:"#522a11",
                        size:18,
                    })
                }
                //移除
                ui.nodes.btn_anw.tid = data.tid;
                ui.nodes.btn_anw.click(function (sender) {
                    connectApi('jiban_delpaiqian',[sender.tid],function () {
                        me.getData(function () {
                            me.setContents();
                        })
                    })
                })

            }else {
                ui.nodes.panel_sj02.show();
                ui.nodes.panel_sj01.hide();
                //选择武将
                ui.nodes.btn_jia.setTouchEnabled(true);
                ui.nodes.btn_jia.click(function () {
                    G.frame.jiban_select.show();
                },1000);
            }
        },
        getData:function (callback) {
           var me = this;
            connectApi('jiban_mypaiqian',[],function (data) {
                me.heroinfo = data;
                me.DATA = [];
                for(var k in data){
                    me.DATA.push(data[k]);
                    me.DATA.sort(function (a,b) {
                        return a.star > b.star ? -1:1;
                    })
                }
                if(me.DATA.length < 6){
                    for(var i = me.DATA.length; i < 6; i++){
                        me.DATA.push(0);
                    }
                }
                callback && callback();
            });
        },
    });
    G.frame[ID] = new fun('jiban_pqwy.json', ID);
})();