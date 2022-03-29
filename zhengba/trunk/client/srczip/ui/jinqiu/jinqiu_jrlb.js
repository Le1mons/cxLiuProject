/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_jrlb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            me.nodes.list_lb.setTouchEnabled(false);

            me.nodes.txt_fh1.hide();
            me.nodes.txt_fh2.hide();
            var data = X.keysOfObject(G.gc.midautumn2.libao);


            var _a = [];
            var _b = [];
            for(var i = 0 ;i < data.length ; i++){
                if(me.DATA.myinfo.libao[data[i]] >= G.gc.midautumn2.libao[data[i]].buynum){
                    _a.push(data[i]);//领完
                }else {
                    _b.push(data[i]);
                }
            }
            data = _b.concat(_a);

            if(!me.table){
                var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_lb,1, function (ui, data) {
                    me.setItem(ui,data);
                },null,null,10);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }

        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;


        },
        setItem: function (ui,data) {
            var me = this;
            var conf = G.gc.midautumn2.libao[data];
            X.autoInitUI(ui);
            ui.show();
            var leftnum = conf.buynum - (me.DATA.myinfo.libao[data] || 0);
            ui.nodes.panel_wp.setTouchEnabled(false);
            X.alignItems(ui.nodes.panel_wp,conf.prize,'left',{
                touch:true,
                scale:0.8,
            });
            ui.nodes.img_bg1.loadTexture('img/jinqiu/img_jjlb_bg' + (conf.img) + ".png",1);
            ui.nodes.img_bg2.loadTexture('img/jinqiu/img_jjlb_tab' + (conf.img) + ".png",1);
            ui.nodes.txt_lb.setString(conf.name);
            ui.nodes.txt_sy.setString(X.STR(L('DOUBLE8'),leftnum));
            X.enableOutline(ui.nodes.txt_sy, '#084d0c', 1);
            ui.nodes.btn_lu.setBtnState(leftnum > 0);
            ui.nodes.txt_1.removeAllChildren();
            if(conf.need.length>0){
                var str1=X.STR(L('DOUBLE7'),conf.money);
                var color = leftnum > 0 ? G.gc.COLOR.n12:G.gc.COLOR.n15;
                var img = new ccui.ImageView(G.class.getItemIco('rmbmoney'),1);
                var st = X.setRichText({
                    parent:ui.nodes.txt_1,
                    str:str1,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ui.nodes.txt_1.width / 2, y: ui.nodes.txt_1.height / 2},
                    color:color,
                    node:img,
                    size:22
                });
                ui.nodes.txt_1.setString("");
            }else{
                ui.nodes.txt_1.setString(X.STR(L('DOUBLE9'),conf.money/100));

            }
            ui.nodes.btn_lu.data = conf;
            ui.nodes.btn_lu.key=data;
            ui.nodes.btn_lu.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.data.proid != ""){
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: sender.data.prize
                            }).show();
                            G.DAO.jinqiu.getServerData(function () {
                                me.DATA = G.DATA.jinqiu;
                                me.setContents();
                            })
                        });
                        G.event.emit('doSDKPay', {
                            pid:sender.data.proid,
                            logicProid: sender.data.proid,
                            money: sender.data.money,
                        });
                    }
                    else {
                        me.ajax('midautumn2_libao',[sender.key],function (str,d) {
                            if(d.s == 1){
                                G.frame.jiangli.data({
                                    prize:d.d.prize
                                }).show();
                                me.DATA.myinfo = d.d.myinfo;
                                me.setContents();
                            }
                        })
                    }
                }
            })
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            G.DAO.jinqiu.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
        },
        onAniShow: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_jijielibao.json', ID);
})();