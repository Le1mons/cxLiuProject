/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典配装
    var ID = 'juedoushengdian_peizhuang';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.ui.finds('jia').hide();
            me.nodes.list_shipin_jy.hide();
            me.bindBtn();
            me.type = me.data().type;
            me.DATA = me.data().data;
            me.spstate = 2;//1是查看 2是详情
            me.baoshiOpen = G.frame.juedoushengdian_main.baoshiOpen;//宝石装备的开放等级
            me.shipinOpen = G.frame.juedoushengdian_main.shipinOpen;//饰品装备的开放等级
            if(me.type == 'baoshi'){
                me.nodes.btn_zyjj.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }else {
                me.nodes.btn_phb.triggerTouch(ccui.Widget.TOUCH_ENDED);
            }
            me.nodes.btn_qiehuan.setTouchEnabled(true);
            me.nodes.btn_qiehuan.loadTexture('img/juedoushendgian/' + (me.spstate == 1 ? 'btn_chakan' : 'btn_xiangqing') + '.png',1);
        },
        bindBtn: function () {
            var me = this;
            me.ui.finds('panel_zsy').setTouchEnabled(true);
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.mask.click(function () {
                me.remove();
            });
            //宝石配装
            me.nodes.btn_zyjj.click(function () {
                me.nodes.btn_zyjj.setBright(false);
                me.nodes.btn_phb.setBright(true);
                me.changeType('baoshi');
            });
            //饰品配装
            me.nodes.btn_phb.click(function () {
                me.nodes.btn_zyjj.setBright(true);
                me.nodes.btn_phb.setBright(false);
                me.changeType('shipin');
            });
            me.nodes.btn_qiehuan.click(function () {
                if(me.spstate == 1){
                    me.showShipinInfo();
                }else {
                    me.showShipinContent();
                }
            })
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        changeType:function (type) {
            var me = this;
            if(type == 'baoshi'){
                me.showBaoshiContent();
            }else if(type == 'shipin'){
                me.showShipinInfo();
            }
        },
        showBaoshiContent:function () {
            var me = this;
            var bsitem = G.class.sbaoshi('20');//固定显示最大的宝石
            bsitem.setPosition(0,0);
            bsitem.setAnchorPoint(0,0);
            me.nodes.ico_sp.removeAllChildren();
            me.nodes.ico_sp.addChild(bsitem);

            me.nodes.btn_qiehuan.hide();
            me.nodes.txt_biaoti.setString(L('JUEDOUSHENGDIAN13'));
            var data = [].concat(X.keysOfObject(G.gc.baoshi[20].buff));
            data.sort(function (a,b) {
                var orderA = me.baoshiOpen[a];
                var orderB = me.baoshiOpen[b];
                if(orderA != orderB){
                    return orderA < orderB ? -1:1;
                }
            });
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_bs, 1, function (ui, data) {
                me.setBSItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setBSItem:function(ui,id){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var data = G.gc.baoshi[20].buff[id];
            ui.nodes.wz_sx1.setString('');
            ui.nodes.wz_sx2.setString('');
            ui.nodes.wz_sx3.setString('');
            for(var i = 0; i < X.keysOfObject(data).length; i++){
                var key = X.keysOfObject(data)[i];
                if(key.indexOf("pro") != -1){
                    var value = data[key]/10 + "%";
                }else {
                    var value = data[key];
                }
                ui.nodes['wz_sx' + (i+1)].setString(L(key) + "  " + value);
            }
            //宝石装备状态
            if(id == me.DATA.heroinfo.baoshi){//当前装备
                ui.nodes.wz_tiaojian.hide();
                ui.nodes.btn_zb.show();
                ui.nodes.btn_zb.setTitleText(L('JUEDOUSHENGDIAN15'));
                ui.nodes.btn_zb.setBright(true);
                ui.nodes.btn_zb.setTouchEnabled(false);
                ui.nodes.btn_zb.setTitleColor(cc.color(G.gc.COLOR.n13));
            }else {
                if(P.gud.gpjjclv >= me.baoshiOpen[id]){//已经解锁
                    ui.nodes.wz_tiaojian.hide();
                    ui.nodes.btn_zb.show();
                    ui.nodes.btn_zb.setBtnState(true);
                    ui.nodes.btn_zb.setTitleColor(cc.color(G.gc.COLOR.n13));
                    ui.nodes.btn_zb.setTitleText(L('JUEDOUSHENGDIAN16'));
                }else {//未解锁
                    ui.nodes.wz_tiaojian.show();
                    ui.nodes.btn_zb.hide();
                    ui.nodes.wz_tiaojian.setString(X.STR(L('JUEDOUSHENGDIAN17'),me.baoshiOpen[id]));
                    ui.nodes.btn_zb.setBtnState(false);
                    ui.nodes.btn_zb.setTitleColor(cc.color(G.gc.COLOR.n15));
                    ui.nodes.btn_zb.setTitleText(X.STR(L('JUEDOUSHENGDIAN17'),me.baoshiOpen[id]));
                }
            }
            ui.nodes.btn_zb.id = id;
            ui.nodes.btn_zb.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax('gpjjc_wear',[me.DATA.heroinfo.hid,{'baoshi': sender.id}],function (str,data) {
                        if(data.s == 1){
                            G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                            me.DATA.heroinfo.baoshi = sender.id;
                            me.showBaoshiContent();
                            G.frame.juedoushengdian_heroinfo.getData(function () {
                                G.frame.juedoushengdian_heroinfo.setDowmContent();
                            });
                        }
                    })
                }
            })
        },
        showShipinContent:function () {
            var me = this;
            me.spstate = 1;
            me.nodes.btn_qiehuan.show();
            me.nodes.btn_qiehuan.loadTexture('img/juedoushendgian/btn_chakan.png',1);
            var spitem = G.class.sshipin(me.DATA.heroinfo.shipin);
            spitem.setAnchorPoint(0,0);
            spitem.setPosition(0,0);
            me.nodes.ico_sp.removeAllChildren();
            me.nodes.ico_sp.addChild(spitem);
            me.nodes.txt_biaoti.setString(L('JUEDOUSHENGDIAN14'));
            var data = X.keysOfObject(me.shipinOpen);
            data.sort(function (a,b) {
                var lvA = me.shipinOpen[a];
                var lvB = me.shipinOpen[b];
                return lvA < lvB ? -1:1;
            });
            me.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.nodes.scrollview, me.nodes.list_shipin_jy, 5, function (ui, data) {
                me.setSPItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setSPItem:function(ui,id){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            var spico = G.class.sshipin(id);
            spico.setPosition(0,0);
            spico.setAnchorPoint(0,0);
            ui.nodes.ico_sp2.removeAllChildren();
            ui.nodes.ico_sp2.addChild(spico);
            ui.nodes.ico_sp2.setTouchEnabled(false);
            if(me.DATA.heroinfo.shipin == id){//已装备
                ui.nodes.shipin_yzb2.show();
                ui.nodes.zhhezhao.hide();
            }else {
                ui.nodes.shipin_yzb2.hide();
                if(P.gud.gpjjclv >= me.shipinOpen[id]){//已解锁
                    ui.nodes.zhhezhao.hide();
                    ui.nodes.ico_sp2.setTouchEnabled(true);
                }else {
                    ui.nodes.zhhezhao.show();
                    ui.nodes.wenzi_tiaojian.setString(X.STR(L('JUEDOUSHENGDIAN17'),me.shipinOpen[id]));
                }
            }
            ui.setTouchEnabled(false);
            ui.nodes.ico_sp2.setSwallowTouches(false);
            ui.nodes.ico_sp2.id = id;
            ui.nodes.ico_sp2.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax('gpjjc_wear',[me.DATA.heroinfo.hid,{'shipin': sender.id}],function (str,data) {
                        if(data.s == 1){
                            G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                            me.DATA.heroinfo.shipin = sender.id;
                            me.showShipinContent();
                            G.frame.juedoushengdian_heroinfo.getData(function () {
                                G.frame.juedoushengdian_heroinfo.setDowmContent();
                                G.frame.juedoushengdian_heroinfo.changeShiPin();
                            });
                        }
                    })
                }
            })
        },
        showShipinInfo:function () {
            var me = this;
            me.spstate = 2;
            var spitem = G.class.sshipin(me.DATA.heroinfo.shipin);
            spitem.setAnchorPoint(0,0);
            spitem.setPosition(0,0);
            me.nodes.ico_sp.removeAllChildren();
            me.nodes.ico_sp.addChild(spitem);
            me.nodes.txt_biaoti.setString(L('JUEDOUSHENGDIAN14'));
            me.nodes.btn_qiehuan.show();
            me.nodes.btn_qiehuan.loadTexture('img/juedoushendgian/btn_xiangqing.png',1);
            var data = X.keysOfObject(me.shipinOpen);
            data.sort(function (a,b) {
                var lvA = me.shipinOpen[a];
                var lvB = me.shipinOpen[b];
                return lvA < lvB ? -1:1;
            });
            me.nodes.scrollview.removeAllChildren();
            if (!me.layout) {
                var layout = me.layout = new ccui.Layout();
                layout.setContentSize(me.nodes.list_shipin_xx.getSize());
                me.ui.addChild(layout);
            }

            var table = me.table = new X.TableView(me.nodes.scrollview, me.layout, 2, function (ui, data, pos) {
                me.setSPInfoItem(ui, data, pos[1]);
            }, null, null, 9, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setSPInfoItem:function(layout, id, pos){
            var me = this;
            var ui = me.nodes.list_shipin_xx.clone();
            ui.show();
            X.autoInitUI(ui);
            var conf = G.gc.shipin[id];
            ui.nodes.zhhezhao2.setTouchEnabled(false);
            var spico = G.class.sshipin(id);
            spico.setPosition(0,0);
            spico.setAnchorPoint(0,0);
            ui.nodes.ico_sp3.removeAllChildren();
            ui.nodes.ico_sp3.addChild(spico);
            ui.setTouchEnabled(false);
            ui.nodes.wz1_sx1.setString(conf.name);
            if(me.DATA.heroinfo.shipin == id){//已装备
                ui.nodes.shipin_yzb.show();
                ui.nodes.zhhezhao2.hide();
            }else {
                ui.nodes.shipin_yzb.hide();
                if(P.gud.gpjjclv >= me.shipinOpen[id]){//已解锁
                    ui.nodes.zhhezhao2.hide();
                    ui.setTouchEnabled(true);
                }else {
                    ui.nodes.zhhezhao2.show();
                    ui.nodes.wenzi_tiaojian2.setString(X.STR(L('JUEDOUSHENGDIAN17'),me.shipinOpen[id]));
                }
            }
            //属性显示
            var str = '';
            var str1 = '';
            var buffArr = X.fmtBuff(conf.buff);
            for (var i = 0; i < buffArr.length; i++) {
                var bObj = buffArr[i];
                if(i == 0){
                    str += bObj.tip;
                }else{
                    str += "<br>" + bObj.tip
                }
            }
            if(conf.tpbuff && Object.keys(conf.tpbuff).length > 0) {
                var tpBuff = X.fmtBuff(conf.tpbuff);
                for (var i = 0; i < tpBuff.length; i++) {
                    var bObj = tpBuff[i];
                    if(i == 0){
                        str += "<br>" + bObj.tip;
                    }else{
                        str += "<br>" + bObj.tip
                    }
                }
            }
            if(conf.intr){
                str += "<br>" + conf.intr;
            }
            if (!conf.zhongzu || conf.zhongzu == '') {
                str += '<br>' + ' ';
            }else {
                var zzBuffArr = X.fmtBuff(conf.zhongzubuff);
                str1 +=  X.STR(L('ZHONGZU_NEED'),L('zhongzu_' + conf.zhongzu));
                str1 += '<br>' + ' '
                for (var i = 0; i < zzBuffArr.length; i++) {
                    var zzbObj = zzBuffArr[i];
                    str1 += zzbObj.tip;
                }
            }
            var rh = X.setRichText({
                parent:ui.nodes.wz1_sx2,
                str:str,
                size:20,
                color:"#1c9700",
            });
            rh.setPosition(cc.p(0,ui.nodes.wz1_sx2.height - rh.trueHeight()));
            var rt = X.setRichText({
                parent:ui.nodes.wz1_sx3,
                str:str1,
                size:20,
                color:"#7b531a",
            });
            rt.setPosition(cc.p(0,ui.nodes.wz1_sx3.height - rh.trueHeight()));

            ui.setSwallowTouches(false);
            ui.id = id;
            ui.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.ajax('gpjjc_wear',[me.DATA.heroinfo.hid,{'shipin': sender.id}],function (str,data) {
                        if(data.s == 1){
                            G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                            me.DATA.heroinfo.shipin = sender.id;
                            me.showShipinInfo();
                            me.changeShiPin();
                            G.frame.juedoushengdian_heroinfo.getData(function () {
                                G.frame.juedoushengdian_heroinfo.setDowmContent();
                                G.frame.juedoushengdian_heroinfo.changeShiPin();
                            });
                        }
                    })
                }
            });
            layout.removeAllChildren();
            ui.setPosition(pos == 0 ? 8 : -8, 0);
            layout.addChild(ui);
        },
        //更换饰品
        changeShiPin:function(){
            var me = this;
            var spitem = G.class.sshipin(me.DATA.heroinfo.shipin);
            spitem.setAnchorPoint(0,0);
            spitem.setPosition(0,0);
            me.nodes.ico_sp.removeAllChildren();
            me.nodes.ico_sp.addChild(spitem);
        },
    });
    G.frame[ID] = new fun('juedou3.json', ID);
})();