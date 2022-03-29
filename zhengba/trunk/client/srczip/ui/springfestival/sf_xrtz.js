/**
 * Created by
 */

(function () {
    //雪人挑战
    var ID = 'sf_xrtz';
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
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr: L('TS114')
                }).show();
            });
            me.nodes.btn_ph.click(function (sender,type) {
                G.frame.xrtz_phb.show();
            });
        },
        initUI:function(){
          var me = this;
            X.render({
                txt_sj2: function(node){ // 倒计时
                    var rtime = X.getTodayZeroTime() + 24*3600;
                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }
                    me.timer = X.timeout(node, rtime, function () {
                        G.DAO.springfestival.getServerData(function () {
                            me.setContents();
                            me.initPhb();
                        });
                    }, null, {
                        showDay: true
                    });
                },
                txt_sj1:'重置时间:'
            }, me.nodes);
            me.nodes.list_wjpm.hide();
        },
        onShow: function () {
            var me = this;
            me.setContents();
            me.showAttr();
            me.initUI();
            me.initPhb();
            me.refreshRedPoint();
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
        initPhb:function(){
            var me = this;
            X.render({
                txt_wjmz1: function(node){ // 排名
                    node.setString(G.DATA.springfestival.rank.myrank<0?'未上榜':G.DATA.springfestival.rank.myrank);
                },
                txt_fs1: function(node){ // 伤害
                    node.setString(X.fmtValue(G.DATA.springfestival.rank.myval));
                },
                scrollview: function(node){ // 伤害
                    var arr = JSON.parse(JSON.stringify(G.DATA.springfestival.rank.ranklist));
                    for (var i=0;i<arr.length;i++){
                        arr[i].rank  = i+1;
                    }
                    node.removeAllChildren();
                    cc.enableScrollBar(node,false);
                    var table = me.table = new X.TableView(node, me.nodes.list_wjpm, 1, function (ui, data) {
                        me.setItem(ui, data);
                    }, null, null, 1, 5);
                    table.setData(arr);
                    table.reloadDataWithScroll(true);
                },
            }, me.nodes);
        },
        setItem:function(ui,data){
          var me = this;
          X.autoInitUI(ui);
            X.render({
                txt_mc: function(node){ // 排名
                    node.setString(data.rank+'.');
                },
                txt_wjmz: function(node){ // 伤害
                    node.setString(data.headdata.name);
                },
                txt_fs: function(node){ // 伤害
                    node.setString(X.fmtValue(data.val));
                },
            }, ui.nodes);
        },
        setContents: function () {
            var me = this;
            var conf = G.gc.newyear3.boss;
            //技能
            var skillArr = [];
            for (var i = 0; i < conf.intr.length; i ++) {
                var skillIco = G.class.bossInfo(null, null, conf.intr[i]);
                skillArr.push(skillIco);
            }
            if (G.DATA.springfestival.extskill && X.isHavItem(G.DATA.springfestival.extskill)){
                var skillIco1 = G.class.bossInfo(null, null, G.DATA.springfestival.extskill);
                skillArr.push(skillIco1);
            }
            me.nodes.panel_jn.removeAllChildren();
            X.center(skillArr, me.nodes.panel_jn);
            var synum = G.gc.newyear3.bossnum - G.DATA.springfestival.myinfo.bossnum;
            me.nodes.txt_sj4.setString(synum+'/'+G.gc.newyear3.bossnum);
            me.nodes.panel_btn1.setTouchEnabled(false);
            me.nodes.btn_lan.click(function () {
                if (synum<1) return G.tip_NB.show(L('newyear_tip1'));
                G.frame.yingxiong_fight.data({
                    pvType: 'newyear_xrtz',
                    from: me
                }).show();
            });
        },
        refreshRedPoint:function(){
            var me = this;
            var ranklist = G.class.newyear3.getpmprize();
            var hd = 0;
            var rec = G.DATA.springfestival.myinfo.dpsrec;
            var topdps = G.DATA.springfestival.myinfo.topdps;
            for (var i=0;i<ranklist.length;i++){
                if (topdps>=ranklist[i][0][0] && !X.inArray(rec,i)){
                    hd = 1;
                    break;
                }
            }
            if (hd == 1){
                G.setNewIcoImg(me.nodes.btn_ph,.8);
            } else {
                G.removeNewIco(me.nodes.btn_ph);
            }
        },
    });
    G.frame[ID] = new fun('chunjie_xrtz.json', ID);
})();