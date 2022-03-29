/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-技能详情
    var ID = 'kaogu_skill_tips';

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
            me.nodes.btn_gmtp.click(function(sender){
                me.ajax('yjkg_skill',[me.mapid,sender.skillid],function(str,data){
                    if(data.s == 1){
                        G.tip_NB.show(L("KAOGU44"));
                        me.remove();
                        G.ajax.send('yjkg_open', [], function(d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.kaogu_map.DATA = d.d;
                                G.frame.kaogu_skill.unlockSkill(sender.skillid);
                                G.frame.kaogu_map.checkYQredpoint();
                            }
                        });
                    }
                })
            })
        },
        onOpen:function(){
            var me = this;
            me.bindBtn();
            me.skillconf = me.data().conf;
            me.skillid = me.data().id;
            me.mapid = me.data().mapid;
            me.nodes.btn_gmtp.skillid = me.skillid;
        },
        onShow:function(){
            var me = this;
            me.setContents();
        },
        setContents:function(){
            var me = this;
            me.nodes.text_1.setString(me.skillconf.name);//名字
            //描述
            if(me.skillconf.type == 1){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr,me.skillconf.num));
            }else if(me.skillconf.type == 2){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, G.gc.yjkg.map[me.mapid].yiji[me.skillconf.yiji].name,parseInt(me.skillconf.pro / 10) + "%", X.fmtValue(me.skillconf.prize[0].n), G.class.getItem(me.skillconf.prize[0].t,me.skillconf.prize[0].a).name));
            }else if(me.skillconf.type == 3){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, G.gc.yjkg.map[me.mapid].yiji[me.skillconf.yiji].name, me.skillconf.num));
            }else if(me.skillconf.type == 4){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, parseInt(me.skillconf.pro / 10) + "%"));
            }else if(me.skillconf.type == 5){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, parseInt(me.skillconf.pro / 10) + "%"));
            }else if(me.skillconf.type == 6){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, G.gc.yjkg.map[me.mapid].yiji[me.skillconf.yiji].name, parseInt(me.skillconf.pro / 10) + "%", X.fmtValue(me.skillconf.prize[0].n), G.class.getItem(me.skillconf.prize[0].t,me.skillconf.prize[0].a).name));
            }else if(me.skillconf.type == 7){
                me.nodes.txt_ms.setString(X.STR(me.skillconf.intr, parseInt(me.skillconf.pro / 10) + "%"));
            }
            me.nodes.panel_1.removeBackGroundImage();
            me.nodes.panel_1.setBackGroundImage('ico/kaogu/' + me.skillconf.icon + ".png",0);
            //是否已学习
            if(X.inArray(G.frame.kaogu_map.DATA.skill[me.mapid],me.skillid)){//已学习
                me.nodes.btn_gmtp.hide();
                me.nodes.panel_xh.hide();
                me.nodes.img_yxx.show();
            }else if(!me.skillconf.preskill || X.inArray(G.frame.kaogu_map.DATA.skill[me.mapid],me.skillconf.preskill)){//前置技能已学习或不需要前置技能
                me.nodes.btn_gmtp.show();
                me.nodes.btn_gmtp.setBtnState(true);
                me.nodes.txet_gmtp.setString(L("KAOGU43"));
                me.nodes.txet_gmtp.setTextColor(cc.color(G.gc.COLOR.n13));
                me.nodes.panel_xh.show();
            }else {//前置技能未学习
                me.nodes.btn_gmtp.show();
                me.nodes.btn_gmtp.setBtnState(false);
                me.nodes.txet_gmtp.setString(L("KAOGU42"));
                me.nodes.txet_gmtp.setTextColor(cc.color("#5E5E5E"));
                me.nodes.panel_xh.show();
            }
            //消耗
            var img = new ccui.ImageView('img/public/token/token_kgjy.png',1);
            var rh = X.setRichText({
                parent:me.nodes.panel_xh,
                str: X.STR(L("KAOGU45"),X.fmtValue(G.frame.kaogu_map.DATA.exp), me.skillconf.exp),
                color:"#d9ccb1",
                size:22,
                node:img
            });
            rh.setPosition(me.nodes.panel_xh.width/2-rh.trueWidth()/2, me.nodes.panel_xh.height/2-rh.trueHeight()/2);
        }
    });

    G.frame[ID] = new fun('kaogu_jnxq.json', ID);
})();