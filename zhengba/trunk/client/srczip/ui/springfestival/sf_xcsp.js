/**
 * Created by
 */

(function () {
    //新春商铺
    var ID = 'sf_xcsp';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.hide();
            cc.enableScrollBar(me.nodes.listview1,false);
            cc.enableScrollBar(me.nodes.listview2,false);
            cc.enableScrollBar(me.nodes.listview3,false);
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.showAttr();
        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.hide();

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.show();
            });
            me.ui.finds('token_jb').loadTexture(G.class.getItemIco('5106'),1);
            me.nodes.txt_jb.setString(G.class.getOwnNum('5106','item'));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        setContents: function () {
            var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                    var rtime = G.DATA.springfestival.info.etime;
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    if (rtime>G.time){
                        me.timer = X.timeout(node, rtime, function () {
                            G.tip_NB.show(L("HUODONG_HD_OVER"));
                        }, null, {
                            showDay: true
                        });
                    }
                },
            }, me.nodes);
            //
            me.nodes.btn_jrdh.enabled = true;
            me.nodes.btn_jrdh.click(function (sender,type) {
                if (me.curType == 'dh') return;
                sender.setBright(false);
                me.nodes.btn_xslb.setBright(true);
                me.nodes.text_jrdh.setTextColor(cc.color('#ffffff'));
                me.nodes.text_xslb.setTextColor(cc.color('#ffffff'));

                me.setTable('dh');
            });
            //
            me.nodes.btn_xslb.click(function (sender,type) {
                if (me.curType == 'lb' || G.frame.springfestival.getTimebool()) return;
                sender.setBright(false);
                me.nodes.btn_jrdh.setBright(true);
                me.nodes.text_xslb.setTextColor(cc.color('#ffffff'));
                me.nodes.text_jrdh.setTextColor(cc.color('#ffffff'));
                me.setTable('lb');
            });
            me.nodes.btn_jrdh.triggerTouch(2);
        },
        setTable:function (type) {
            var me = this;
            me.curType = type;
            if (type == 'dh'){
                confArr = G.class.newyear3.getdhConf();
                var hornum = G.gc.newyear3.hornum;
            } else {
                confArr = G.class.newyear3.getlbConf();
                var hornum = 3;
            }
            var _last = [];

            var num = Math.ceil(confArr.length/hornum);

            for (var j=1;j<=num;j++){
                var item = [];
                for (var i in confArr){
                    if (j==1){
                        if ((i/hornum)<j){
                            item.push(confArr[i]);
                        }
                    } else {
                        if ((i/hornum)<j && (i/hornum)>=j-1&& j !=1){
                            item.push(confArr[i]);
                        }
                    }

                }
                _last.push(item);
            }
            for (var i=1;i<=3;i++){
                var parent = me.nodes['listview'+i];
                parent.setTouchEnabled(type == 'dh');
                parent.removeAllChildren();
                var dinfo = _last[i-1];
                if (dinfo && dinfo.length>0){
                    for (var k=0;k<dinfo.length;k++){
                        var list = me.nodes.list_sd.clone();
                        X.autoInitUI(list);
                        list.show();
                        me.setItem(list,dinfo[k]);
                        parent.pushBackCustomItem(list);
                    }
                }
            }
        },
        setItem:function (ui,data) {
            var me = this;
            var ygnum = G.DATA.springfestival.myinfo.libao[data.idx]||0;
            var synum = data.buynum - ygnum;
            X.render({
                ico_sdtb:function (node) {
                    if (data.proid){
                        node.setBackGroundImage('ico/itemico/'+data.img+'.png',0);
                        node.setTouchEnabled(true);
                        node.prize = data.prize;
                        node.touch(function (sender,type) {
                           if (type == ccui.Widget.TOUCH_NOMOVE){
                               G.frame.sf_jlyl.data({
                                   prize: sender.prize
                               }).show();
                           }
                        });
                    }else {
                        node.removeAllChildren();
                        node.removeBackGroundImage();
                        node.setTouchEnabled(false);
                        var wid = G.class.sitem(data.prize[0]);
                        wid.setPosition(node.width/2,node.height/2);
                        wid.setTouchEnabled(true);
                        wid.touch(function (sender, type) {
                            if (type == ccui.Widget.TOUCH_NOMOVE){
                                G.frame.iteminfo.data(sender).show();
                            }
                        });
                        node.addChild(wid);
                    }

                    // var conf = wid.conf;
                    // setTextWithColor(ui.nodes.text_sd,conf.name,G.gc.COLOR[conf.color || 0]);
                },
                text_sd:function(node){
                    node.setVisible(!!data.proid);
                    node.setString(data.name);
                },
                wz1:function (node) {
                    node.setString('活动限购:' + synum);
                },
                image_jb:function (node) {
                    if (data.proid){
                        node.hide();
                    } else {
                        node.show();
                        node.loadTexture(G.class.getItemIco(data.need[0].t),1);
                    }

                },
                text_jinbi:function (node) {
                    node.show();
                    if (data.proid){
                        node.setString(data.money/100 + '元');
                        node.x = 76.6;
                    } else {
                        node.setString(data.need[0].n);
                        node.x = 96.6;
                    }
                },
                panel_dazhe:function (node) {
                    node.hide();
                },
                img_ygm1:function (node) {
                    node.setVisible(synum<=0);
                },
                panel_swxb:function (node) {
                    node.hide();
                }
            },ui.nodes);
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.data = data;
            ui.synum = synum;
            ui.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if (sender.synum<=0) return G.tip_NB.show(L('alaxi_tip3'));
                    if (sender.data.proid) {
                        G.event.once('paysuccess', function(arg) {
                            arg && arg.success && G.frame.jiangli.data({
                                prize: sender.data.prize
                            }).show();
                            G.DAO.springfestival.getServerData(function () {
                                me.setTable(me.curType);
                            })
                        });
                        G.event.emit('doSDKPay', {
                            pid:sender.data.proid,
                            logicProid: sender.data.proid,
                            money: sender.data.money,
                        });
                    }else {
                        G.frame.buying.data({
                            num: 1,
                            item: sender.data.prize,
                            need: sender.data.need,
                            maxNum: sender.synum,
                            callback: function (num) {
                                G.DAO.springfestival.libao([sender.data.idx,num],function (dd) {
                                    if (dd.prize && dd.prize.length>0){
                                        G.frame.jiangli.data({
                                            prize: dd.prize
                                        }).show();
                                    }
                                    G.DATA.springfestival.myinfo = dd.myinfo;
                                    me.setTable(me.curType);
                                });
                            }
                        }).show();
                    }
                }
            })
        }
    });
    G.frame[ID] = new fun('chunjie_xcsp.json', ID);
})();