/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_qrjc';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            me.type = 1;
            me.nodes.panel_top.setTouchEnabled(false);
            me.showLog();
            me.initPrizePool();
            me.showNeedNum();
            me.setState();
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            
            
        },
        setState: function () {
            var me = this;
            var etime = G.DATA.asyncBtnsData.midautumn2.etime;
            var rtime = G.DATA.asyncBtnsData.midautumn2.rtime;
            if(G.time < rtime){
                me.nodes.txt_djs1.setString(L("JQHD_11"));
                X.timeout(me.nodes.txt_djs2,rtime, function () {
                    //me.setState();
                });
            }else if(G.time < etime){
                me.nodes.txt_djs1.setString(L("JQHD_10"));
                X.timeout(me.nodes.txt_djs2,etime - 12 * 60 *60, function () {
                    me.nodes.txt_djs1.hide();
                    me.nodes.txt_djs2.hide();
                    //me.setState();
                });
            }
            if(G.time > rtime + 12 * 60 *60){
                if(X.keysOfObject(me.DATA.lotterylog).length>0){
                    G.frame.jinqiu_kj.show();
                }else{
                    G.tip_NB.show(L("ZWXX"));
                }
            }
        },

        showNeedNum: function () {
            var me = this;
            var need = G.gc.midautumn2.lotteryneed[0];
            var str = X.STR(L("JQHD_1"),G.class.getOwnNum(need.t,need.a),need.n);
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            
            var rh = X.setRichText({
                parent:me.nodes.txt_dq2,
                str:str,
                color:"#d44f21",
                node:img,
                size:22,
            });
            rh.x=0;
            rh.y=0;
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS104')
                }).show();
            });
            //我的抽奖
            var need = G.gc.midautumn2.lotteryneed[0];
            var num=X.fmtValue(G.class.getOwnNum(need.t, need.a));
            if(G.time > G.DATA.asyncBtnsData.midautumn2.rtime){
                
                me.nodes.txt_cj.setTextColor(cc.color("#6c6c6c"));
                me.nodes.btn_cj.setBtnState(false);
            }else{
                me.nodes.btn_cj.setBtnState(true);
                me.nodes.txt_cj.setTextColor(cc.color("#2f5719"));
            }
            me.nodes.btn_cj.click(function () {
                if(num > 0){
                    G.frame.jinqiu_jqjc_tk.once('close',function(){
                        if(G.frame.jinqiu_qrjc.cjCallback && G.frame.jinqiu_jqjc_tk.isdx){
                            me.action.playWithCallback("out1", false, function () {
                                G.frame.jinqiu_qrjc.cjCallback();
                            })
                        }
                    }).show();
                   
                }else{
                    G.tip_NB.show(L("JQHD_8"));
                }
            });
            me.nodes.btn_wdcj.click(function (sender) {
                G.frame.jinqiu_myjc.show();
            })
        },
        initPrizePool: function () {
            var me = this;
            var conf = G.gc.midautumn2.lotteryprize;
            var data = X.keysOfObject(conf);
            me.nodes.panel_dx.setTouchEnabled(false);
            if(!me.table){
                me.nodes.scrollview1.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
                var table = me.table = new X.TableView(me.nodes.scrollview1,me.nodes.list_jc,1, function (ui, data) {
                    me.setPrize(ui,data);
                },me.nodes.list_jc.getSize(),null,1);
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            }else{
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
            me.selectPrize(me.selectIndex ? me.selectIndex : 1);
        },
        showLog: function () {
            var me = this;
            me.nodes.panel_wznr.setTouchEnabled(false);
            var data=me.DATA.log;
            if(!me.table2){
                var table = me.table2 = new X.TableView(me.nodes.scrollview2,me.nodes.panel_wznr,1, function (ui, data) {
                    me.setLog(ui,data);
                },me.nodes.list_jc.getSize(),null,1);
                me.table2.setData(data);
                me.table2.reloadDataWithScroll(true);
            }else{
                me.table2.setData(data);
                me.table2.reloadDataWithScroll(false);
            }
          
        },
        setLog: function (ui,data) {
            var me = this;
            var id=G.gc.midautumn2.lotteryprize[data[0]].prize[0][0].t;
            var item = G.gc.midautumn2.lotteryprize[data[0]].prize[0][0].a
            var rh = X.setRichText({
                str: X.STR(L("JQHD_4"), data[2], data[1], G.gc[item][id].name),
                parent: ui,
                color: '#fcfbfc',
            });
            rh.setPosition(0, ui.height / 2 - rh.trueHeight() / 2);
            return ui;
        },
        setPrize: function (ui, data) {
            var me = this;
            var conf = G.gc.midautumn2.lotteryprize[data];
            ui.index = data;
            X.autoInitUI(ui);
            X.render({
                panel_ico1: function (node) {
                    node.setTouchEnabled(false);
                    node.removeAllChildren();
                    var prize = G.class.sitem(conf.prize[0][0],false);
                    prize.setPosition(node.width / 2, node.height / 2);
                    prize.setScale(0.8);
                    node.addChild(prize);
                },
                txt_jc: function (node) {
                    var num = me.DATA.lotterynum[ui.index] || 0;
                    node.setString(X.STR(L("double_jclj"),parseInt(num / G.gc.midautumn2.lotteryprize[ui.index].needval)));
                },
                panel_dx: function (node) {
                    if(me.selectIndex && me.selectIndex == data){
                        G.class.ani.show({
                            json: "ani_qiandao",
                            addTo: node,
                            x: 48,
                            y: 40,
                            cache: true,
                            repeat: true,
                            autoRemove: false,
                            onload :function(node,action){
                                node.setScale(1.2);
                            }
                        });
                    }else{
                        node.removeAllChildren();
                    }
                },
            }, ui.nodes);
            me.prizePool[data] = ui;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender,type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    me.selectPrize(sender.index);
                }
            })
            ui.show();
            return ui;
        },
        selectPrize: function (index) {
            var me = this;
            var pool = me.DATA.myinfo.lottery || {};
            var num = me.DATA.lotterynum[index] || 0;
            var conf = G.gc.midautumn2.lotteryprize[index];
            if(me.selectIndex){
                me.prizePool[me.selectIndex].nodes.panel_dx.removeAllChildren();
            }
            me.selectIndex = index;
            X.alignCenter(me.nodes.panel_jlmc, [].concat(conf.prize[0], conf.prize[1]), {
                touch: true,
                scale: 0.8
            });
            me.nodes.txt_ms.width = 500;
            var rh = X.setRichText({
                str: X.STR(L("JQHD_17"), conf.needval),
                parent: me.nodes.txt_ms,
                color: '#fff8e1',
                outline: '#000000'
            });
            me.nodes.txt_ms.x=166;
            rh.setPosition(0,
                me.nodes.txt_ms.height / 2 - rh.trueHeight() / 2);

            var rh1 = X.setRichText({
                str: X.STR(L("double_myjoin"), pool[index] || 0),
                parent: me.nodes.txt_cycs,
                color: '#fff8e1',
            });
            rh1.setPosition(me.nodes.txt_cycs.width / 2 - rh1.trueWidth() / 2,
                me.nodes.txt_cycs.height / 2 - rh1.trueHeight() / 2);

            me.nodes.loadingbar.setPercent(num % conf.needval / conf.needval * 100);
            me.table.reloadDataWithScroll(false);

            //me.nodes.txt_jd.setString((num % conf.needval) + '/' + conf.needval);
        },
        // showLog: function () {
        //     var me = this;
        //     for (var index = 0; index < me.DATA.log.length; index ++) {
        //         me.nodes.scrollview2.pushBackCustomItem(me.setLog(me.nodes.list_wz.clone(), me.DATA.log[index]));
        //     }
        // },
        onOpen: function () {
            var me = this;
            me.prizePool = {};
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

    G.frame[ID] = new fun('event_qiurijiangchi.json', ID);
})();