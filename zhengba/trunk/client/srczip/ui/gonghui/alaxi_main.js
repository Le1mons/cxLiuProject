/**
 * Created by  on 2019//.
 */
(function () {
    //阿拉希战场
    var ID = 'alaxi_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
            me.preLoadRes = ["task.png", "task.plist"];
        },
        onOpen: function () {
            var me = this;
            me.showToper();
            me.changeToperAttr({
                attr2: {a: 'attr', t: 'rmbmoney'}
            });
            me.bindBtn();
            me.conf = JSON.parse(JSON.stringify(G.gc.gonghuisiege));
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.scrollview.setBounceEnabled(false);
            G.class.ani.show({
                addTo: me.nodes.panel_dh,
                x:me.nodes.panel_dh.width/2,
                y:me.nodes.panel_dh.height/2,
                json:'ghz_ditu_bgtx',
                repeat: true,
                autoRemove: false,
            })
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            //转盘
            me.nodes.btn_zczp.click(function () {
                G.frame.alaxi_zp.once('willClose',function () {
                    me.changeToperAttr({
                        attr2: {a: 'attr', t: 'rmbmoney'}
                    });
                }).show();
            });
            //公会排行
            me.nodes.btn_ghph.click(function () {
                G.frame.alaxi_bzghph.show();
            });
            //战场日志
            me.nodes.btn_zcrz.click(function () {
                G.frame.alaxi_gcrz.show();
            });
            //集火设置
            me.nodes.btn_jhsz.setVisible(P.gud.ghpower < 3);
            me.nodes.btn_jhsz.click(function () {
                G.frame.alaxi_jhsz.show();
            });
            //个人排行
            me.nodes.btn_grph.click(function () {
                G.frame.alaxi_grph.show();
            });
            //帮助
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L("TS74")
                }).show();
            })
        },
        onShow: function () {
            var me = this;
            if(me.DATA.assisted && P.gud.ghpower != 0){//跑马灯
                G.frame.chat.addPMD({"pmd": "1", "m": "公会会长发布军令，全体成员优先进攻<font color=#eb3a3a>" + G.gc.gonghuisiege.cityinfo[me.DATA.assisted].name +"</font>", "t": 2, "pmdargs": []})
            }
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
            me.showCity();
            me.setEventTime();
            me.showBoxPrize();
        },
        showBoxPrize:function(){
            var me = this;
            //胜场进度
            var taskArr = me.conf.task;
            for (var index = 0; index < taskArr.length; index ++) {
                (function (index) {
                    var _conf = taskArr[index];
                    me.nodes['txt_cs' + (index + 1)].setString(me.DATA.winnum + "/" + _conf.pval + L('CI'));
                    me.nodes['btn_bx' + (index + 1)].click(function () {
                        G.frame.alaxi_boxprize.data({
                            index: index,
                            conf: _conf,
                            nval: me.DATA.winnum
                        }).show();
                    });
                    me.nodes['panel_bxtx' + (index + 1)].removeAllChildren();
                    me.nodes['btn_bx' + (index + 1)].loadTextureNormal('img/task/img_task_bx1.png',1);
                    if (me.DATA.winnum >= _conf.pval && !X.inArray(me.DATA.winprize, index)) {
                        G.setNewIcoImg(me.nodes['btn_bx' + (index + 1)]);
                        me.nodes['btn_bx' + (index + 1)].redPoint.setPosition(58, 48);
                        G.class.ani.show({
                            addTo:me.nodes['panel_bxtx' + (index + 1)],
                            json:'ani_baoxianglingqu',
                            x:me.nodes['btn_bx' + (index + 1)].width/2,
                            y:me.nodes['btn_bx' + (index + 1)].height/2,
                            repeat:true,
                            autoRemove:false
                        })
                    } else {
                        G.removeNewIco(me.nodes['btn_bx' + (index + 1)]);
                        if(X.inArray(me.DATA.winprize, index)){//已领取
                            me.nodes['btn_bx' + (index + 1)].loadTextureNormal('img/task/img_task_bx1_d.png',1);
                        }
                    }
                })(index);
            }
            me.nodes.img_ghz_jdt.setPercent(me.DATA.winnum / taskArr[1].pval * 100);
        },
        //倒计时
        setEventTime:function(){
            var me = this;
            var str = '';
            var toDayZeroTime = X.getLastMondayZeroTime();
            me.toTime = G.time;
            me.eventEnd = true;
            //挑战期间
            if (G.time >= toDayZeroTime + 10 * 3600 && G.time <= toDayZeroTime + 6 * 24 * 3600 + 20 * 3600) {
                str = L("HDDJS");
                me.eventEnd = false;
                me.toTime = toDayZeroTime + 6 * 24 * 3600 + 20 * 3600;
            } else {//非挑战期间
                if (G.time < toDayZeroTime + 10 * 3600) {
                    str = L("XLKQSJ");
                    me.toTime = toDayZeroTime + 10 * 3600;
                } else {
                    str = L("XLKQSJ");
                    me.toTime = toDayZeroTime + 7 * 24 * 3600 + 10 * 3600;
                }
            }
            X.timePanel(me.nodes.panel_sysj,me.toTime,18,'right',function () {
                me.setEventTime();
            },{
                desc:str
            });
        },
        showCity:function(){
            var me = this;
            for(k in me.conf.cityinfo){
                var list = me.nodes.list.clone();
                me.conf.cityinfo[k].id = k;
                me.initCity(list,me.conf.cityinfo[k]);
                me.nodes['panel_' + k].removeAllChildren();
                me.nodes['panel_' + k].addChild(list);
            }
        },
        initCity:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.setPosition(0,0);
            ui.setAnchorPoint(0,0);
            //特效
            ui.nodes.panel_jz.removeAllChildren();
            G.class.ani.show({
                addTo:ui.nodes.panel_jz,
                json:data.ani,
                repeat:true,
                autoRemove:false,
                x:ui.nodes.panel_jz.width/2,
                y:ui.nodes.panel_jz.height/2,
            });
            // ui.nodes.panel_jz.removeBackGroundImage();
            // ui.nodes.panel_jz.setBackGroundImage('img/gonghui/ghz/' + data.img + '.png',1);
            ui.nodes.panel_wz.removeBackGroundImage();
            ui.nodes.panel_wz.setBackGroundImage('img/gonghui/ghz/' + data.titleimg + '.png',1);
            ui.nodes.panel_jh.setVisible(me.DATA.assisted == data.id);
            var item = G.class.sitem(me.DATA.cityinfo[data.id]);
            item.setPosition(ui.nodes.ico.width / 2, ui.nodes.ico.height / 2);
            G.frame.iteminfo.showItemInfo(item);
            ui.nodes.ico.removeAllChildren();
            ui.nodes.ico.addChild(item);
            ui.nodes.panel_jz.setTouchEnabled(true);
            ui.nodes.panel_jz.setSwallowTouches(false);
            ui.nodes.panel_jz.data = data;
            ui.nodes.panel_jz.touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if (me.eventEnd) return G.tip_NB.show(X.STR(L("GONGHUIFIGHT9"),
                        X.moment(me.toTime - G.time)));
                    G.frame.alaxi_city.data(sender.data).show();
                }
            });
        },
        checkShow:function(){
            var me = this;
            me.getData(function () {
                me.show();
            })
        },
        getData:function(callback){
            var me = this;
            if(G.DATA.yingxiong.jjchero.length <= 0){//弹防守阵容
                G.tip_NB.show(L('GONGHUIFIGHT8'));
            }else {
                connectApi("gonghuisiege_open", [], function (data) {
                    me.DATA = data;
                    callback && callback();
                });
            }
        },
        onHide:function () {
            var me = this;
            if(G.frame.gonghuizf_main.isShow){
                G.hongdian.getData("gonghui", 1, function () {
                    G.frame.gonghuizf_main.checkRedPoint();
                });
            }
        },
    });
    G.frame[ID] = new fun('gonghui_alxzc.json', ID);
})();