/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-仪器
    var ID = 'kaogu_yq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        initUi:function(){
            var me = this;
        },
        bindBtn:function(){
            var me = this;
            me.nodes.mask.click(function(){
                me.remove();
            });
            me.nodes.btn_gmtpwz.click(function(){
                me.ajax('yjkg_unlock',[],function(str,data){
                    if(data.s == 1){
                        me.DATA.unlockmap = data.d;
                        me.YqBtnstate();
                        me.setContents();
                        G.class.ani.show({
                            json:"ani_kaogu_yiqi_tubiao",
                            addTo:me.nodes.panel_dhs1,
                            repeat:false,
                            autoRemove:true
                        })
                        //刷新地图
                        G.frame.kaogu_map.DATA.unlockmap = data.d;
                        G.frame.kaogu_map.setContents();
                        G.frame.kaogu_map.checkYQredpoint();
                    }
                },500)
            });
            me.nodes.list_rank.finds('btn_gmtp$').click(function(){
                me.ajax('yjkg_upgrade',['speed'],function(str,data){
                    if(data.s == 1){
                        me.DATA.yiqi.speed = data.d.lv;
                        G.frame.kaogu_map.DATA.energe = data.d.energe;
                        G.frame.kaogu_map.DATA.yiqi.speed = data.d.lv;
                        me.showSpeedContents();
                        me.showExpContents();
                        me.showOwn();
                        G.frame.kaogu_map.checkYQredpoint();
                        G.class.ani.show({
                            json:"ani_kaogu_yiqi_kuang",
                            addTo:me.nodes.panel_dhs2,
                            repeat:false,
                            autoRemove:true
                        })
                    }
                })
            },500);
            me.nodes.list_rank1.finds('btn_gmtp$').click(function(){
                me.ajax('yjkg_upgrade',['exp'],function(str,data){
                    if(data.s == 1){
                        me.DATA.yiqi.exp = data.d.lv;
                        G.frame.kaogu_map.DATA.energe = data.d.energe;
                        G.frame.kaogu_map.DATA.yiqi.exp = data.d.lv;
                        me.showExpContents();
                        me.showSpeedContents();
                        me.showOwn();
                        G.frame.kaogu_map.checkYQredpoint();
                        G.class.ani.show({
                            json:"ani_kaogu_yiqi_kuang",
                            addTo:me.nodes.panel_dhs3,
                            repeat:false,
                            autoRemove:true
                        })
                    }
                })
            },500);
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.DATA = G.frame.kaogu_map.DATA;
            //地精勘探一的最大等级
            me.maxlv1 = parseInt(X.keysOfObject(G.gc.yjkg.yiqi.speed)[X.keysOfObject(G.gc.yjkg.yiqi.speed).length - 1]);
            //侏儒放大镜的最大等级
            me.maxlv2 = parseInt(X.keysOfObject(G.gc.yjkg.yiqi.exp)[X.keysOfObject(G.gc.yjkg.yiqi.exp).length - 1]);
        },
        onShow:function(){
            var me = this;
            me.YqBtnstate();
            me.setContents();
            me.showSpeedContents();
            me.showExpContents();
            me.showOwn();
        },
        showOwn:function(){
            var me = this;
            me.nodes.ico_w_token.removeBackGroundImage();
            me.nodes.ico_w_token.setBackGroundImage('img/public/token/token_kgny.png',1);
            me.nodes.txt_w_ico.setString(X.fmtValue(G.frame.kaogu_map.DATA.energe));
        },
        YqBtnstate:function(){
            var me = this;
            //解锁按钮 如果当前全部解锁就置灰显示已满级
            if(me.DATA.unlockmap.length == X.keysOfObject(G.gc.yjkg.map).length){
                me.nodes.btn_gmtpwz.setBtnState(false);
                me.nodes.txet_gmtpwz.setString(L("KAOGU25"));
                me.nodes.txet_gmtpwz.setTextColor(cc.color(G.gc.COLOR.n15));
                me.yqid = X.keysOfObject(G.gc.yjkg.map).length - 1;//显示最后一个仪器的信息
                G.removeNewIco(me.nodes.btn_gmtpwz);
            }else {
                me.nodes.btn_gmtpwz.setBtnState(true);
                me.nodes.txet_gmtpwz.setString(L("KAOGU37"));
                me.nodes.txet_gmtpwz.setTextColor(cc.color(G.gc.COLOR.n13));
                G.setNewIcoImg(me.nodes.btn_gmtpwz);
                me.nodes.btn_gmtpwz.finds('redPoint').setPosition(129,50);
                //当前解锁到了哪个地图
                var arr = [];
                for(var i = 0; i < me.DATA.unlockmap.length; i++){
                    arr.push(parseInt(me.DATA.unlockmap[i]));
                }
                me.yqid = Math.max.apply(Math.max, arr);//第几个仪器
            }
        },
        setContents:function(){
            var me = this;
            var conf = G.gc.yjkg.unlock[me.yqid];
            me.nodes.panel_yq_wp.removeBackGroundImage();
            me.nodes.panel_yq_wp.setBackGroundImage('img/kaogu/' + conf.icon + ".png",1);
            me.nodes.txt_yi_name.setString(conf.name);
            //解锁条件
            var skillnum = X.keysOfObject(me.DATA.skill[me.yqid]).length;//当前已解锁了几个技能
            me.nodes.txt_jstj.setString(X.STR(L("KAOGU35"), G.gc.yjkg.map[me.yqid].name,skillnum,conf.skillnum));
            if(skillnum < conf.skillnum){//解锁条件不足
                me.nodes.btn_gmtpwz.setBtnState(false);
                me.nodes.txet_gmtpwz.setString(L("KAOGU37"));
                me.nodes.txet_gmtpwz.setTextColor(cc.color(G.gc.COLOR.n15));
                G.removeNewIco(me.nodes.btn_gmtpwz);
            }
            //解锁奖励
            me.nodes.txt_jsjl.setString(X.STR(L("KAOGU36"),G.gc.yjkg.map[me.yqid+1].name));
        },
        //辅助仪器
        showSpeedContents:function(){
            var me = this;
            //地精勘探仪
            X.autoInitUI(me.nodes.list_rank);
            var speedlv = me.DATA.yiqi.speed;
            me.nodes.list_rank.nodes.txt_dengfji.setString(X.STR(L("KAOGU38"),speedlv));
            //是否达到最大等级
            if(speedlv >= me.maxlv1){
                me.nodes.list_rank.nodes.txt_jnxx.hide();
                me.nodes.list_rank.nodes.txt_zgss.y = 140;
                me.nodes.list_rank.nodes.btn_gmtp.hide();
                me.nodes.list_rank.nodes.ico_token.hide();
                me.nodes.list_rank.nodes.txt_ico.hide();
                me.nodes.img_ymj1.show();
                G.removeNewIco(me.nodes.list_rank.nodes.btn_gmtp);
                me.nodes.list_rank.nodes.txt_zgss.setString(X.STR(L("KAOGU40"), parseInt(G.gc.yjkg.yiqi.speed[speedlv].add * 100) + "%"));
            }else {
                me.nodes.list_rank.nodes.txt_jnxx.show();
                me.nodes.list_rank.nodes.txt_zgss.y = 150;
                me.nodes.list_rank.nodes.btn_gmtp.show();
                me.nodes.list_rank.nodes.ico_token.show();
                me.nodes.list_rank.nodes.txt_ico.show();
                me.nodes.img_ymj1.hide();
                me.nodes.list_rank.nodes.txt_zgss.setString(X.STR(L("KAOGU40"), parseInt(G.gc.yjkg.yiqi.speed[speedlv].add * 100) + "%"));
                //下一级
                me.nodes.list_rank.nodes.txt_jnxx.setString(X.STR(L("KAOGU39"), parseInt(G.gc.yjkg.yiqi.speed[speedlv+1].add * 100) + "%"));
                me.nodes.list_rank.nodes.ico_token.removeBackGroundImage();
                me.nodes.list_rank.nodes.ico_token.setBackGroundImage('img/public/token/token_kgny.png',1);
                me.nodes.list_rank.nodes.txt_ico.setString(X.fmtValue(G.frame.kaogu_map.DATA.energe) + "/" + X.fmtValue(G.gc.yjkg.yiqi.speed[speedlv+1].need));
                if(G.frame.kaogu_map.DATA.energe >= G.gc.yjkg.yiqi.speed[speedlv+1].need){
                    G.setNewIcoImg(me.nodes.list_rank.nodes.btn_gmtp);
                    me.nodes.list_rank.nodes.btn_gmtp.finds('redPoint').setPosition(125,45);
                }else {
                    G.removeNewIco(me.nodes.list_rank.nodes.btn_gmtp);
                }
            }
        },
        //侏儒放大镜
        showExpContents:function(){
            var me = this;
            X.autoInitUI(me.nodes.list_rank1);
            var explv = me.DATA.yiqi.exp;
            me.nodes.list_rank1.nodes.txt_dengfji.setString(X.STR(L("KAOGU38"),explv));
            //是否达到最大等级
            if(explv >= me.maxlv2){
                me.nodes.list_rank1.nodes.txt_jnxx.hide();
                me.nodes.list_rank1.nodes.txt_zgss.y = 140;
                me.nodes.list_rank1.nodes.btn_gmtp.hide();
                me.nodes.list_rank1.nodes.ico_token.hide();
                me.nodes.list_rank1.nodes.txt_ico.hide();
                me.nodes.img_ymj2.show();
                G.removeNewIco(me.nodes.list_rank1.nodes.btn_gmtp);
                me.nodes.list_rank1.nodes.txt_zgss.setString(X.STR(L("KAOGU41"), parseInt(G.gc.yjkg.yiqi.exp[explv].add * 100) + "%"));
            }else {
                me.nodes.list_rank1.nodes.txt_jnxx.show();
                me.nodes.list_rank1.nodes.txt_zgss.y = 150;
                me.nodes.list_rank1.nodes.btn_gmtp.show();
                me.nodes.list_rank1.nodes.ico_token.show();
                me.nodes.list_rank1.nodes.txt_ico.show();
                me.nodes.img_ymj2.hide();
                me.nodes.list_rank1.nodes.txt_zgss.setString(X.STR(L("KAOGU41"), parseInt(G.gc.yjkg.yiqi.exp[explv].add * 100) + "%"));
                //下一级
                me.nodes.list_rank1.nodes.txt_jnxx.setString(X.STR(L("KAOGU39"), (G.gc.yjkg.yiqi.exp[explv+1].add * 100).toFixed(1) + "%"));
                me.nodes.list_rank1.nodes.ico_token.removeBackGroundImage();
                me.nodes.list_rank1.nodes.ico_token.setBackGroundImage('img/public/token/token_kgny.png',1);
                me.nodes.list_rank1.nodes.txt_ico.setString(X.fmtValue(G.frame.kaogu_map.DATA.energe) + "/" + X.fmtValue(G.gc.yjkg.yiqi.exp[explv+1].need));
                if(G.frame.kaogu_map.DATA.energe > G.gc.yjkg.yiqi.exp[explv+1].need){
                    G.setNewIcoImg(me.nodes.list_rank1.nodes.btn_gmtp);
                    me.nodes.list_rank1.nodes.btn_gmtp.finds('redPoint').setPosition(125,45);
                }else {
                    G.removeNewIco(me.nodes.list_rank1.nodes.btn_gmtp);
                }
            }
        }
    });

    G.frame[ID] = new fun('kaogu_yq.json', ID);
})();