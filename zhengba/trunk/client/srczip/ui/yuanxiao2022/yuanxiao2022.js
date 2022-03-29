/**
 * Created by
 */
(function () {
    //
    var ID = 'yuanxiao2022';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        onOpen: function () {
            var me = this;
            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });
            me.nodes.btn_bangzhu.click(function (sender, type) {
                G.frame.help.data({
                    intr:L("TS118")
                }).show();
            });
        },
        onShow: function () {
            var me = this;
            G.DAO.yuanxiao2022.getServerData(function () {
                me.setContents();
                me.showIteminfo();
                me.checkRedPoint();
                me.bindBtn();
            });
            X.render({
                txt_sj2: function(node){ // 倒计时
                    if (X.isHavItem(G.DATA.asyncBtnsData.yuanxiao3) && G.DATA.asyncBtnsData.yuanxiao3.rtime){
                        if (G.DATA.asyncBtnsData.yuanxiao3.rtime > G.time){
                            var rtime = G.DAO.yuanxiao2022.getRefreshTime();
                            me.nodes.txt_sj1.setString('活动时间:');
                        }else if (G.DATA.asyncBtnsData.yuanxiao3.etime > G.time){
                            var rtime = G.DATA.asyncBtnsData.yuanxiao3.etime;
                            me.nodes.txt_sj1.setString('兑换时间:');
                        }
                    }
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                        G.view.mainView.getAysncBtnsData(function () {
                            me.remove();
                        }, false);
                    }, null, {
                        showDay: true
                    });
                }
            }, me.nodes);
            // var etime = G.DATA.asyncBtnsData.yuanxiao3.etime;
            // if(etime - G.time > 24 * 3600 * 2) {
            //     me.nodes.txt_sj2.setString(X.moment(etime - G.time));
            // }else {
            //
            //     X.timeout(me.nodes.txt_sj2, etime, function () {
            //         me.eventEnd = true;
            //     });
            // }

            me.showAni();
        },
        showAni:function(){
          var me = this;
            G.class.ani.show({
                json: "xinnian_fenwei3_dh",
                addTo: me.ui.finds('bg'),
                x: me.ui.finds('bg').width / 2,
                y: 200,
                cache:true,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "ani_chunjie_yuanxiao_dh",
                addTo: me.ui.finds('bg'),
                x: me.ui.finds('bg').width / 2,
                y: 470,
                cache:true,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    me.AniNode = node;
                    action.play('wait',true);
                }
            });
        },
        bindBtn:function(){
          var me = this;
            //元宵福利
            me.nodes.panel_yxfl_l.setTouchEnabled(false);
            me.nodes.panel_mwsj_l.setTouchEnabled(false);
            me.nodes.panel_mrrw_l.setTouchEnabled(false);
            me.nodes.panel_gxdz_l.setTouchEnabled(false);

            me.nodes.panel_yxfl.click(function (sender,type) {
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                me.nodes.panel_yxfl_l.show();
                me.nodes.panel_mwsj_l.hide();
                me.nodes.panel_mrrw_l.hide();
                me.nodes.panel_gxdz_l.hide();
                G.frame.yuanxiao2022_yxfl.once('willClose',function () {
                    if (cc.isNode(me.ui)) {
                        me.checkRedPoint();
                        me.nodes.panel_yxfl_l.hide();
                    }
                }).show();
            });
            //美味升级
            me.nodes.panel_mwsj.click(function (sender,type) {
                me.nodes.panel_yxfl_l.hide();
                me.nodes.panel_mwsj_l.show();
                me.nodes.panel_mrrw_l.hide();
                me.nodes.panel_gxdz_l.hide();
                G.frame.yuanxiao2022_mwsj.once('willClose',function () {
                    if (cc.isNode(me.ui)) {
                        me.checkRedPoint();
                        me.nodes.panel_mwsj_l.hide();
                    }
                }).show();
            });
            //每日任务
            me.nodes.panel_mrrw.click(function (sender,type) {
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                me.nodes.panel_yxfl_l.hide();
                me.nodes.panel_mwsj_l.hide();
                me.nodes.panel_mrrw_l.show();
                me.nodes.panel_gxdz_l.hide();
                G.frame.yuanxiao2022_mrrw.once('willClose',function () {
                    if (cc.isNode(me.ui)) {
                        me.checkRedPoint();
                        me.nodes.panel_mrrw_l.hide();
                    }
                }).show();
            });
            //个性定制
            me.nodes.panel_gxdz.click(function (sender,type) {
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                me.nodes.panel_yxfl_l.hide();
                me.nodes.panel_mwsj_l.hide();
                me.nodes.panel_mrrw_l.hide();
                me.nodes.panel_gxdz_l.show();
                G.frame.yuanxiao2022_gxdz.once('willClose',function () {
                    if (cc.isNode(me.ui)) {
                        me.checkRedPoint();
                        me.nodes.panel_gxdz_l.hide();
                    }
                }).show();
            });
        },
        getTimebool:function(){
            var me = this;
            return X.isHavItem(G.DATA.asyncBtnsData.yuanxiao3) && G.DATA.asyncBtnsData.yuanxiao3.rtime && G.DATA.asyncBtnsData.yuanxiao3.rtime < G.time;
        },
        setContents:function(){
          var me = this;
          me.yxconf = G.gc.yuanxiao2022;
            var need = JSON.parse(JSON.stringify(me.yxconf.lotteryneed));
            var pic1 = new ccui.ImageView(G.class.getItemIco(need[0].t), 1);
            var pic2 = new ccui.ImageView(G.class.getItemIco(need[0].t), 1);
            me.nodes.txt_1.removeAllChildren();
            me.nodes.txt_2.removeAllChildren();
            var rh1 = X.setRichText({
                parent:me.nodes.txt_1,
                str:L('newyear_tip3'),
                anchor: {x: 0, y: 0.5},
                color:"#fed099",
                node:pic1,
                size:20,
            });
            rh1.setPosition(me.nodes.txt_1.width/2-rh1.trueWidth()/2,me.nodes.txt_1.height/2-rh1.trueHeight()/2+10);
            //
            var rh2 = X.setRichText({
                parent:me.nodes.txt_2,
                str:L('newyear_tip4'),
                anchor: {x: 0, y: 0.5},
                color:"#fed099",
                node:pic2,
                size:20,
            });
            rh2.setPosition(me.nodes.txt_2.width/2-rh2.trueWidth()/2,me.nodes.txt_2.height/2-rh2.trueHeight()/2+10);
            //一次
            me.nodes.btn_1.click(function () {
                me.AniNode && me.AniNode.action.playWithCallback('out',false,function () {

                    G.DAO.yuanxiao2022.lotty(1,function (dd) {
                        me.AniNode.action.play('wait',true);
                        me.showIteminfo();
                        if (dd.prize && dd.prize.length>0){
                            G.frame.jiangli.data({
                                prize:dd.prize,
                            }).show();
                            // G.frame.yuanxiao2022_hddx.data({
                            //     prize: dd.prize,
                            //     need: need,
                            //     type: 1,
                            //     bool: false
                            // }).show();
                        }
                    });
                });
            });
            //十次
            me.nodes.btn_2.click(function () {
                me.AniNode && me.AniNode.action.playWithCallback('out',false,function () {

                    G.DAO.yuanxiao2022.lotty(10,function (dd) {
                        me.AniNode.action.play('wait',true);
                        me.showIteminfo();
                        if (dd.prize && dd.prize.length>0){
                            G.frame.jiangli.data({
                                prize:dd.prize,
                            }).show();
                            // G.frame.yuanxiao2022_hddx.data({
                            //     prize: dd.prize,
                            //     need: [{'a':need[0].a,'t':need[0].t,'n':need[0].n*10}],
                            //     type: 10,
                            //     bool: false
                            // }).show();
                        }
                    });
                });
            });
            var txt = new ccui.Text(need[0].n, G.defaultFNT, 18);
            txt.setAnchorPoint(0.5, 0.5);
            txt.setPosition(50,7);
            txt.setTextColor(cc.color('#ffffff'));
            X.enableOutline(txt,'#000000',2);
            me.nodes.btn_1.addChild(txt);
            var txt2 = new ccui.Text(need[0].n*10, G.defaultFNT, 18);
            txt2.setAnchorPoint(0.5, 0.5);
            txt2.setPosition(50,7);
            txt2.setTextColor(cc.color('#ffffff'));
            X.enableOutline(txt2,'#000000',2);
            me.nodes.btn_2.addChild(txt2);
        },
        showIteminfo:function(){
            var me = this;
            //下边的五个物品
            var showWp = JSON.parse(JSON.stringify(me.yxconf.lotteryshow));
            for (var i =0;i<showWp.length;i++){
                var parent = me.nodes['panel_wp' + (i+1)];
                parent.removeAllChildren();
                var item = showWp[i];
                item.n = G.class.getOwnNum(item.t,item.a);
                var wid = G.class.sitem(item);
                wid.setPosition(parent.width/2,parent.height/2);
                parent.addChild(wid);
                wid.setTouchEnabled(true);
                wid.click(function (sender,type) {
                    if (sender.data.n>0) {
                        G.frame.yuanxiao_tipbox.data({item:sender.data}).show();
                    }else {
                        G.frame.iteminfo.data(sender).show();
                    }
                });
            };
            var need = me.yxconf.lotteryneed;
            me.ui.finds('token_jb').loadTexture(G.class.getItemIco(need[0].t), 1);
            me.nodes.txt_jb.setString(X.fmtValue(G.class.getOwnNum(need[0].t,need[0].a)));
            me.nodes.txt_jb.setTextHorizontalAlignment(1);
            me.ui.finds('bg_toper_jg').setPositionX(88);
        },
        onHide: function () {
            G.hongdian.getData('yuanxiao3', 1);
        },
        checkRedPoint: function () {
            var me = this;
            if (!cc.isNode(me.ui))return;
            if (me.getTimebool())return;
            //元宵福利
            var qdday = G.DAO.yuanxiao2022.getQiandaoDay();
            var _qiandao = G.gc.yuanxiao2022.qiandao;
            var qdhd = 0;
            for (var i=0;i<_qiandao.length;i++){
                if (qdday>=(i+1) && !X.inArray(G.DATA.yuanxiao2022.myinfo.qiandao,i)){
                     qdhd = 1;
                     break;
                }
            }
            if (qdhd>0 && !me.getTimebool()) {
                G.setNewIcoImg(me.nodes.panel_1,0.9);
            } else {
                G.removeNewIco(me.nodes.panel_1);
            }
            //任务hd
            var taskhd = 0;
            var _task = G.gc.yuanxiao2022.task;

            var taskdata = G.DATA.yuanxiao2022.myinfo.task;
            for (var i in _task){
                var taskinfo = G.gc.yuanxiao2022.task[i];
                var nval = taskdata.data[i]||0;
                if (!X.inArray(taskdata.rec,i) && nval >= taskinfo.pval){
                        taskhd = 1;
                        break;
                }
            }
            if (taskhd>0 && !me.getTimebool()){
                G.setNewIcoImg(me.nodes.panel_3,0.9);
            } else {
                G.removeNewIco(me.nodes.panel_3);
            }
        }
    });
    G.frame[ID] = new fun('yuanxiao.json', ID);
})();