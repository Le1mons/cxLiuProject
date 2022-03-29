/**
 * Created by  on 2019//.
 */
(function () {
    //决斗礼包
    var ID = 'juedoushengdian_libao';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            cc.enableScrollBar(me.nodes.scrollview);
            me.maxlv = parseInt(X.maxOf(X.keysOfObject(G.gc.gpjjcplayerlv)));//决斗最大等级
            me.DATA = [];
            for (var i = 0; i < G.gc.gongpingjjc.libao.length; i++){
                if(P.gud.gpjjclv >= me.maxlv){//达到最大等级不显示决斗加速礼包
                    if(G.gc.gongpingjjc.libao[i].money > 0){
                        me.DATA.push(G.gc.gongpingjjc.libao[i]);
                        me.DATA[i].index = i;
                    }
                }else {
                    me.DATA.push(G.gc.gongpingjjc.libao[i]);
                    me.DATA[i].index = i;
                }

            }
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
               me.remove();
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
        setContents:function () {
            var me = this;
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_liebiao, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
                table.setData(me.DATA);
                table.reloadDataWithScroll(true);
            } else {
                me.table.setData(me.DATA);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.ico_list.setTouchEnabled(false);
            ui.nodes.ico_nr.setTouchEnabled(false);
            //限购
            var leftnum = data.buynum-(G.frame.juedoushengdian_main.DATA.libao[data.index] || 0);
            ui.nodes.libao_mz.setString(data.name);
            X.alignItems(ui.nodes.ico_nr,data.prize,'left',{
                touch:true
            });
            if(leftnum > 0){
                if(data.money > 0){//花钱购买
                    ui.nodes.daibi_xh.hide();
                    ui.nodes.btn_gm.setTitleText(data.money + L('YUAN'));
                    ui.nodes.btn_gm.setTitleColor(cc.color(G.gc.COLOR.n13));
                }else {//花道具购买
                    var need = data.need[0];
                    ui.nodes.daibi_xh.show();
                    ui.nodes.ico_zs.removeBackGroundImage();
                    ui.nodes.ico_zs.setBackGroundImage(G.class.getItemIco(need.t),1);
                    ui.nodes.zs_wz.setString(need.n);
                }
            }else {
                ui.nodes.daibi_xh.hide();
                ui.nodes.btn_gm.setTitleText(L('BTN_YSQ'));
                ui.nodes.btn_gm.setTitleColor(cc.color(G.gc.COLOR.n15));
            }
            ui.nodes.wz_xg.setString(X.STR(L('XG'),(leftnum)));
            ui.nodes.btn_gm.setBtnState(leftnum > 0);
            ui.nodes.btn_gm.data = data;
            ui.nodes.btn_gm.touch(function (sender) {
                if(sender.data.money > 0){
                    G.event.once('paysuccess', function(arg) {
                        arg && arg.success && G.frame.jiangli.data({
                            prize: [].concat(sender.data.prize)
                        }).show();
                        if(G.frame.juedoushengdian_main.DATA.libao[sender.data.index]){
                            G.frame.juedoushengdian_main.DATA.libao[sender.data.index] += 1;
                        }else {
                            G.frame.juedoushengdian_main.DATA.libao[sender.data.index] = 1
                        }
                        me.setContents();
                    });
                    G.event.emit('doSDKPay', {
                        pid:sender.data.proid,
                        logicProid: sender.data.proid,
                        money: sender.data.money,
                    });
                }else {
                    if(P.gud.rmbmoney < sender.data.need[0].n){
                        G.frame.chongzhi.show();
                        G.tip_NB.show(L('JUEDOUSHENGDIAN3'));
                        return;
                    }
                    me.ajax('gpjjc_buylibao',[sender.data.index],function (str,data) {
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            G.frame.juedoushengdian_main.DATA.libao = data.d.libao;
                            me.setContents();
                        }
                    })
                }
            },null,{touchDelay:500});
        }
    });
    G.frame[ID] = new fun('juedoushengdian_tankuang3.json', ID);
})();