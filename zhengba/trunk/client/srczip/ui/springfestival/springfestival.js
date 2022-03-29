/**
 * Created by
 */
G.event.on("attrchange_over", function () {
    if(G.frame.springfestival.isShow) {
        G.frame.springfestival.showAttr();
    }
    if(G.frame.sf_xcsp.isShow) {
        G.frame.sf_xcsp.showAttr();
    }
    if(G.frame.sf_xrtz.isShow) {
        G.frame.sf_xrtz.showAttr();
    }
    if(G.frame.sf_xnyh.isShow) {
        G.frame.sf_xnyh.showAttr();
    }
    if(G.frame.sf_xingyuntouzi.isShow) {
        G.frame.sf_xingyuntouzi.showAttr();
    }
    if(G.frame.sf_xnfd.isShow) {
        G.frame.sf_xnfd.showAttr();
    }
});
(function () {
    //春节2022
    var ID = 'springfestival';
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
            me.nodes.btn_xrtz.click(function () {//雪人挑战
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.sf_xrtz.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_xcsp.click(function () {//新春商铺
                G.frame.sf_xcsp.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_xnfd.click(function () {//新年孵蛋
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.sf_xnfd.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_xnyh.click(function () {//新年烟火
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.sf_xnyh.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_xysz.click(function () {//幸运骰子
                if (me.getTimebool())return G.tip_NB.show(L('HUODONG_HD_OVER'));
                G.frame.sf_xingyuntouzi.once('willClose', function(){
                    me.checkHongDian();
                }).show();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS112')
                }).show();
            });
        },
        onShow: function () {
            var me = this;

            G.DAO.springfestival.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
            me.showAttr();
            me.showAni();
        },
        showAni:function(){
            var me = this;

            G.class.ani.show({
                json: "xinnian_fenwei1_dh",
                addTo: me.nodes.panel_dh4,
                y:me.nodes.panel_dh5.height/2+31,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            G.class.ani.show({
                json: "xinnian_fenwei1_dh",
                addTo: me.nodes.panel_dh5,
                y:me.nodes.panel_dh5.height/2+22,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            //2
            G.class.ani.show({
                json: "xinnian_fenwei2_dh",
                addTo: me.nodes.panel_dh1,
                x: me.nodes.panel_dh1.width / 2,
                y: 405,
                cache:true,
                repeat: true,
                autoRemove: false,
                onend: function (node, action) {
                }
            });
            //3
            G.class.ani.show({
                json: "xinnian_fenwei3_dh",
                addTo: me.nodes.bg,
                x: me.nodes.bg.width / 2,
                y:350,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                }
            });

        },
        showAttr: function () {
            var me = this;
            me.nodes.btn_jia1.click(function (sender, type) {
                G.frame.dianjin.show();
            });

            me.nodes.btn_jia2.click(function (sender, type) {
                G.frame.chongzhi.show();
            });
            me.nodes.txt_jb.setString(X.fmtValue(P.gud.jinbi));
            me.nodes.txt_zs.setString(X.fmtValue(P.gud.rmbmoney));
        },
        onAniShow: function () {
            this.action.play('wait', true);
        },
        getWorkShopHD: function(){
            var me = this;
            var cache = X.cacheByUid("yuandanWorkshop");
            if(cache) return false;

            var gfHd = false;
            var work = G.gc.newyear.workshop;
            for(var i=0;i<work.length;i++){
                var needs = work[i].need;
                var maxNum = 0;

                for(var _n=0;_n<needs.length;_n++){
                    var need = needs[_n].n;
                    var has = G.class.getOwnNum(needs[_n].t, needs[_n].a);
                    var num = Math.floor(has / need);

                    if(maxNum == 0 || maxNum >  num){
                        maxNum = num;
                    }
                }
                if(maxNum > 0){
                    gfHd = true;
                    break;
                }
            }
            return gfHd && !cache;
        },
        getTimebool:function(){
            var me = this;
            return X.isHavItem(G.DATA.asyncBtnsData.newyear3) && G.DATA.asyncBtnsData.newyear3.rtime && G.DATA.asyncBtnsData.newyear3.rtime < G.time;
        },
        setContents: function () {
            var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                    if (X.isHavItem(G.DATA.asyncBtnsData.newyear3) && G.DATA.asyncBtnsData.newyear3.rtime){
                        if (G.DATA.asyncBtnsData.newyear3.rtime > G.time){
                            var rtime = G.DAO.springfestival.getRefreshTime();
                            me.nodes.txt_sj1.setString('活动时间:');
                        }else if (G.DATA.asyncBtnsData.newyear3.etime > G.time){
                            var rtime = G.DATA.asyncBtnsData.newyear3.etime;
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
        },
        checkHongDian: function () {
            if(!cc.isNode(this.ui)) return;
            var me = this;

            //雪人
            var ranklist = G.class.newyear3.getpmprize();
            var xrjlhd = 0;
            var rec = G.DATA.springfestival.myinfo.dpsrec;
            var topdps = G.DATA.springfestival.myinfo.topdps;
            for (var i=0;i<ranklist.length;i++){
                if (topdps>=ranklist[i][0][0] && !X.inArray(rec,i)){
                    xrjlhd = 1;
                    break;
                }
            }
            var data = G.DATA.springfestival;
            var synum = G.gc.newyear3.bossnum - data.myinfo.bossnum;
            if((synum>0 || xrjlhd>0)&& !me.getTimebool()){
                G.setNewIcoImg(me.ui.finds('wz_xrtz'),0.8);
            }else {
                G.removeNewIco(me.ui.finds('wz_xrtz'));
            }
            //砸蛋
            var myown = G.class.getOwnNum(G.gc.newyear3.eigneed[0].t,G.gc.newyear3.eigneed[0].a);
            if(myown >= G.gc.newyear3.eigneed[0].n && data.myinfo.eig.length<7 && !me.getTimebool()){
                G.setNewIcoImg(me.ui.finds('wz_xnfd'),0.8);
            }else {
                G.removeNewIco(me.ui.finds('wz_xnfd'));
            }
            //烟花签到
            var day = G.DAO.springfestival.getQiandaoDay();
            var ylnum = G.DATA.springfestival.myinfo.qiandao.length;
            if (ylnum < day && !me.getTimebool()){
                G.setNewIcoImg(me.ui.finds('wz_xnyh'),0.8);
            }else {
                G.removeNewIco(me.ui.finds('wz_xnyh'));
            }
            //掷骰子
            var tznum = G.DATA.springfestival.myinfo.gamenum;
            if (tznum == 0 && !me.getTimebool()){
                G.setNewIcoImg(me.ui.finds('wz_xysz'),0.9);
            }else {
                G.removeNewIco(me.ui.finds('wz_xysz'));
            }
        }
    });
    G.frame[ID] = new fun('chunjie_ghxx.json', ID);
})();