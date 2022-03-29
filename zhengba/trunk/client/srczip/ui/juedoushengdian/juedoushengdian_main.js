/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典主界面
    var ID = 'juedoushengdian_main';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true,releaseRes:false});
            this.preLoadRes = ['juedoushengdian2.plist','juedoushengdian2.png'];
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.nodes.zhuangtai1.show();
            me.nodes.zhuangtai2.hide();
            me.nodes.btn_bangzhu.show();
            me.getBSOpenState();
            me.getSPOpenState();
            me.getHeroSkin();
            me.checkPz();
        },
        checkPz: function () {
            var me = this;

            me.nodes.kaifang_dj.setVisible(P.gud.gpjjclv < 2);
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            //特权
            me.nodes.btn_fllb.click(function () {
                G.frame.juedoushengdian_tq.show();
            });
            //决斗币兑换
            me.nodes.btn_jddh.click(function () {
                G.frame.shopmain.data('15').show();
            });
            //英雄配装
            me.nodes.btn_yxpz.click(function () {
                G.frame.juedoushengdian_herolist.show();
            });
            //开始挑战
            me.nodes.btn_kstz.click(function () {
               G.frame.juedoushengdian_tz.show();
            });
            //排名奖励
            me.nodes.btn_pmjl.click(function () {
                G.frame.juedoushengdian_pmjl.show();
            });
            //说明
            me.nodes.btn_bangzhu.click(function () {
                G.frame.help.data({
                    intr:L('TS83')
                }).show();
            });

        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;

            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        onShow: function () {
            var me = this;
            X.cacheByUid('jdsdhd',1);//每次登陆有红点，进入功能后红点消失
            G.hongdian.checkJdsdHd();
            X.cacheByUid('jdshopOpen',1);//进过一次后决斗商店才开
            me.setContents();
            if(me.DATA.pipeiinfo && me.DATA.pipeiinfo.state){
                if(me.DATA.pipeiinfo.state == 5 && me.DATA.pipeiinfo.isfight == 1){
                    G.frame.juedoushengdian_fightplan.starFight();
                }else {
                    G.frame.juedoushengdian_fightplan.show();
                }
            }
            if(G.DATA.asyncBtnsData && !G.DATA.asyncBtnsData.gpjjc.shop){
                me.ajax('getayncbtn',[['gpjjc']]);
            }

        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            X.releaseRes(['juedoushengdian2.plist','juedoushengdian2.png']);
        },
        getData:function (callback) {
            var me = this;
            G.ajax.send('gpjjc_open', [], function (data) {
                if (!data) return;
                var data = JSON.parse(data);
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }else if(s == -205){
                    G.frame.juedoushengdian_main.show();
                }
            }, true);
        },
        setContents:function(){
            var me = this;
            me.showRank();
            me.setTimeEvent();
            me.setMyinfo();
        },
        //前三排行榜
        showRank:function () {
            var me = this;
            for(var i = 0; i < 3; i++){
                var list = me.nodes.panel_rw.clone();
                X.autoInitUI(list);
                list.show();
                list.setAnchorPoint(0,0);
                list.setPosition(0,0);
                var rankdata = me.DATA.rankinfo.ranklist[i];
                list.nodes.rw.removeBackGroundImage();
                if(rankdata){//有人
                    X.setHeroModel({
                        parent: list.nodes.rw,
                        data: {},
                        model: X.splitStr(rankdata.headdata.model) || '6102a'
                    });
                    list.nodes.qufu.setString(X.STR(L('YWZB_QF'),rankdata.headdata.svrname));
                    list.nodes.wj_mz.setString(rankdata.headdata.name);
                    list.nodes.wj_jf.setString(L('JF') + ":" + rankdata.val);
                }else {//虚位以待
                    list.nodes.rw.removeAllChildren();
                    list.nodes.rw.setBackGroundImage('img/juedoushendgian/gonghui_smrw.png',1);
                    list.nodes.wj_mz.setString(L('XWYD'));
                    list.nodes.qufu.setString('');
                    list.nodes.wj_jf.setString('');
                }
                X.enableOutline(list.nodes.qufu,cc.color("#000000"));
                X.enableOutline(list.nodes.wj_mz,cc.color("#000000"));
                X.enableOutline(list.nodes.wj_jf,cc.color("#000000"));
                me.nodes['rw' + (i+1)].removeAllChildren();
                me.nodes['rw' + (i+1)].addChild(list);
            }
        },
        //倒计时
        setTimeEvent:function () {
            var me = this;
            var endTime = G.DATA.asyncBtnsData.gpjjc.closetime - 24*3600-2*3600;//第七天22点前是可挑战时间
            if(G.time < endTime){
                X.timeout(me.ui.finds('sjjs_0'),endTime,function () {
                    me.ui.finds('sjjs_0').setString(L('JUEDOUSHENGDIAN12'));
                },null,{
                    showDay:true
                })
            }else {
                me.ui.finds('sjjs_0').setString(L('JUEDOUSHENGDIAN12'));
            }
        },
        //我的信息
        setMyinfo:function () {
            var me = this;
            var head = G.class.shead(P.gud);
            head.setAnchorPoint(0,0);
            head.setPosition(0,0);
            me.nodes.ico.removeAllChildren();
            me.nodes.ico.addChild(head);
            me.nodes.paihan.setString(L('MY_RANK') + (me.DATA.rankinfo.myrank || L('WRWZ')));
            me.nodes.dangqianjifen.setString(X.STR(L('JUEDOUSHENGDIAN1'),me.DATA.rankinfo.myval));
            if(P.gud.gpjjclv >= G.gc.gongpingjjc.maxlv){
                me.nodes.juedoudengji.setString(X.STR(L('JUEDOUSHENGDIAN30'),P.gud.gpjjclv));
            }else {
                me.nodes.juedoudengji.setString(X.STR(L('JUEDOUSHENGDIAN2'),P.gud.gpjjclv,X.fmtValue(G.gc.gpjjcplayerlv[P.gud.gpjjclv].maxexp-P.gud.gpjjcexp)));
            }
        },
        //宝石装备开放状态
        getBSOpenState:function () {
            var me = this;
            me.baoshiOpen = {};
            for(var k in G.gc.gpjjcplayerlv){
                var baoshi = G.gc.gpjjcplayerlv[k].baoshi;
                for(var i = 0; i < baoshi.length; i++){
                    var bsid = baoshi[i];
                    me.baoshiOpen[bsid] = parseInt(k);
                }
            }
        },
        //饰品装备开放状态
        getSPOpenState:function () {
            var me = this;
            me.shipinOpen = {};
            for(var k in G.gc.gpjjcplayerlv){
                var shipin = G.gc.gpjjcplayerlv[k].shipin;
                for(var i = 0; i < shipin.length; i++){
                    var spid = shipin[i];
                    me.shipinOpen[spid] = parseInt(k);
                }
            }
        },
        //获得英雄的皮肤数据
        getHeroSkin:function () {
            var me = this;
            me.heroSkinData = {};
            for(var k in G.gc.skin){
                var hid = G.gc.skin[k].hid[1];
                if(!me.heroSkinData[hid]){
                    var skinarr = [];
                    skinarr.push(k);
                    me.heroSkinData[hid] = skinarr;
                }else {
                    me.heroSkinData[hid].push(k);
                }
            }
        },
        addSkin: function (data) {
            if (this.DATA.myinfo.skin && this.DATA.myinfo.skin[data.hid]) {
                data.skin = {
                    sid: this.DATA.myinfo.skin[data.hid]
                };
            }
        }
    });
    G.frame[ID] = new fun('juedoushengdian.json', ID);
})();