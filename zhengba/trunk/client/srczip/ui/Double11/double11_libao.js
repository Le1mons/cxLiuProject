/**
 * Created by  on 2019//.
 */
(function () {
    //双十一礼包
    var ID = 'double11_libao';
    var fun = X.bUi.extend({
        color:["#e8858b","#bde885","#ffd16e","#6fe2ff","#ff9b52",],
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.Double11.DATA;
            me.refreshPanel();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS82')
                }).show();
            });
            cc.enableScrollBar(me.nodes.scrollview);
        },
        refreshPanel:function(){
            var me = this;
            me.showInfo();
            me.setContents();
        },
        onShow: function () {
            var me = this;
            me.setEndTime();
        },
        setEndTime: function () {
            var me = this;
            var timeConf = G.gc.double11.openday.libao;
            var starTime = G.DATA.asyncBtnsData.double11.stime;
            var starZeroTime = starTime - (24*3600 - X.getOpenTimeToNight(starTime));//活动开启当天0点的时间

            X.timeout(me.nodes.txt_djs, starZeroTime + timeConf[1]*24*3600, function () {
                me.nodes.txt_djs.setString(L("HDYJS"));
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            var data = [].concat(G.gc.double11.libao);
            for(var i = 0; i < data.length; i++){
                data[i].index = i;
            }
            if(!me.table) {
                var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setItem(ui, data);
                }, null, null, 1, 3);
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
            ui.show();
            ui.nodes.panel_item.setTouchEnabled(false);
            X.alignItems(ui.nodes.panel_item,data.prize,'left',{
                touch:true
            });
            ui.nodes.bg_list.removeBackGroundImage();
            ui.nodes.bg_list.setBackGroundImage('img/double11/img_bg0' + (data.index+1) + ".png",1);
            ui.nodes.panel_lb.removeBackGroundImage();
            ui.nodes.panel_lb.setBackGroundImage('img/double11/img_lb0' + (data.index+1) + ".png",1);
            //剩余数量
            ui.finds('xiangou').show();
            var leftnum = data.num - (me.DATA.libao[data.index] || 0);
            ui.finds('wz1').setString(X.STR(L('DOUBLE8'),leftnum));
            X.enableOutline(ui.finds('wz1'), '#084d0c', 1);
            //津贴和返还的相关显示
            var ownAllowance = G.class.getOwnNum(G.gc.double11.allowance,'item');
            var needAllowance = data.allowance;
            if(ownAllowance == 0){
                ui.nodes.txt.hide();
            }else {
                var showAllowance = ownAllowance >= needAllowance ? needAllowance : ownAllowance;//津贴数量
                var returnmoney = showAllowance * data.pro * data.rmbmoney / 100;//反钻
                ui.nodes.txt.setVisible(showAllowance > 0);
                var ico = new ccui.ImageView(G.class.getItemIco('rmbmoney'),1);
                ico.setScale(0.8);
                var str = X.STR(L('DOUBLE6'),me.color[data.index],showAllowance,me.color[data.index],returnmoney);
                var rh = X.setRichText({
                    parent:ui.nodes.txt,
                    str:str,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ui.nodes.txt.width / 2, y: ui.nodes.txt.height / 2},
                    color:"#ffffff",
                    node:ico,
                    size:20,
                    outline:"#000000",
                });
            }
            if(data.unitprize == 0){
                ui.nodes.btn1.loadTextureNormal("img/public/btn/btn1_on.png", 1);
                var img = new ccui.ImageView(G.class.getItemIco('rmbmoney'),1);
                var str1 = X.STR(L('DOUBLE7'),data.needrmbmoney);
                var color = leftnum > 0 ? G.gc.COLOR.n12:G.gc.COLOR.n15;
                var st = X.setRichText({
                    parent:ui.nodes.txt_xh,
                    str:str1,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ui.nodes.txt_xh.width / 2, y: ui.nodes.txt_xh.height / 2},
                    color:color,
                    node:img,
                    size:22
                });
            }else {
                ui.nodes.btn1.loadTextureNormal("img/public/btn/btn2_on.png", 1);
                var str1 = X.STR(L('DOUBLE9'),data.unitprize);
                var color = leftnum > 0 ? G.gc.COLOR.n12:G.gc.COLOR.n15;
                var st = X.setRichText({
                    parent:ui.nodes.txt_xh,
                    str:str1,
                    anchor: {x: 0.5, y: 0.5},
                    pos: {x: ui.nodes.txt_xh.width / 2, y: ui.nodes.txt_xh.height / 2},
                    color:color,
                    size:22
                });
            }
            ui.nodes.btn1.setBtnState(leftnum > 0);
            ui.nodes.btn1.data = data;
            ui.nodes.btn1.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.data.proid != ""){
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: sender.data.prize
                            }).show();
                            me.refreshPanel();
                            G.frame.Double11.getData(function () {
                                me.DATA = G.frame.Double11.DATA;
                                me.refreshPanel();
                            })
                        });
                        G.event.emit('doSDKPay', {
                            pid:sender.data.proid,
                            logicProid: sender.data.proid,
                            money: sender.data.unitprize*100,
                        });
                    }else {
                        me.ajax('double11_libao',[sender.data.index],function (str,d) {
                            if(d.s == 1){
                                G.frame.jiangli.data({
                                    prize:d.d.prize
                                }).show();
                                me.DATA = d.d.data;
                                G.frame.Double11.DATA = d.d.data;
                                me.refreshPanel();
                            }
                        })
                    }
                }
            })
        },
        showInfo:function () {
            var me = this;
            me.nodes.txt_sz.setString(X.fmtValue(G.class.getOwnNum(G.gc.double11.allowance,'item')));//拥有津贴
            var getreturn = 0;//返还的钻石
            for(var k in me.DATA.allowance){
                getreturn += me.DATA.allowance[k]*G.gc.double11.libao[k].rmbmoney*5/100;
            }
            me.nodes.text_zs.setString(X.fmtValue(getreturn));
        }
    });
    G.frame[ID] = new fun('event_double11_khlb.json', ID);
})();