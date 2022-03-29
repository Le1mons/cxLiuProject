/**
 * Created by 嘿哈 on 2020/4/7.
 */
(function () {
//考古-技能
    var ID = 'kaogu_skill';

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
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.mask.click(function(){
                me.remove();
            });
        },
        onOpen:function(){
            var me = this;
            me.initBtn();
            me.bindBtn();
            me.nodes.listview.children[0].nodes.btn_an.triggerTouch(ccui.Widget.TOUCH_ENDED);
            //玩家拥有的考古经验
            me.nodes.ico_w_token.removeBackGroundImage();
            me.nodes.ico_w_token.setBackGroundImage('img/public/token/token_kgjy.png',1);
            me.nodes.txt_w_ico.setString(G.frame.kaogu_map.DATA.exp ? parseInt(G.frame.kaogu_map.DATA.exp) : 0);
        },
        initBtn:function(){
            var me = this;
            me.nodes.listview.removeAllChildren();
            var btnarr = X.keysOfObject(G.gc.yjkg.map);
            for(var i = 0; i < btnarr.length; i++){
                var k = btnarr[i];
                var btn = me.nodes.list_rank1.clone();
                btn.show();
                X.autoInitUI(btn);
                btn.nodes.btn_an.id = k;
                if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,btn.nodes.btn_an.id)){
                    btn.nodes.btn_an.loadTextureNormal('img/kaogu/btn_kg_jn2.png',1);
                    btn.nodes.btn_an.loadTextureDisabled('img/kaogu/btn_kg_jn3.png',1);
                    btn.nodes.btn_an.loadTexturePressed('img/kaogu/btn_kg_jn3.png',1);
                    btn.nodes.txt_kgcs.setTextColor(cc.color("#7b452c"));
                }else {
                    btn.nodes.btn_an.loadTextureNormal('img/kaogu/btn_kg_jn1.png',1);
                    btn.nodes.btn_an.loadTextureDisabled('img/kaogu/btn_kg_jn1.png',1);
                    btn.nodes.btn_an.loadTexturePressed('img/kaogu/btn_kg_jn1.png',1);
                    btn.nodes.txt_kgcs.setTextColor(cc.color("#6a6a6a"));
                }
                btn.nodes.txt_kgcs.setString(G.gc.yjkg.map[k].name);
                me.nodes.listview.pushBackCustomItem(btn);
            }
            for(var i = 0; i < me.nodes.listview.children.length; i++){
                var btn = me.nodes.listview.children[i].nodes.btn_an;
                btn.touch(function(sender,type){
                    if(type == ccui.Widget.TOUCH_NOMOVE){
                        if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,sender.id)){//是否解锁了
                            for(var j = 0; j < me.nodes.listview.children.length; j++){
                                if(me.nodes.listview.children[j].nodes.btn_an.id == sender.id){
                                    if(me.mapid != sender.id){
                                        me.mapid = sender.id;
                                        me.nodes.listview.children[j].nodes.btn_an.setBright(true);
                                        me.nodes.listview.children[j].nodes.txt_kgcs.setTextColor(cc.color("#7b452c"));
                                        me.showSkill(me.mapid);
                                    }
                                }else if(X.inArray(G.frame.kaogu_map.DATA.unlockmap,me.nodes.listview.children[j].nodes.btn_an.id)){
                                    me.nodes.listview.children[j].nodes.btn_an.setBright(false);
                                    me.nodes.listview.children[j].nodes.txt_kgcs.setTextColor(cc.color("#7b452c"));
                                }
                            }
                        }else {
                            G.tip_NB.show(L("KAOGU1"));
                        }
                    }
                })
            }
        },
        onShow:function(){
            var me = this;
        },
        showSkill:function(type){
            var me = this;
            var skillconf = G.gc.yjkgskill[type];
            me.nodes.panel_jn1.setVisible(G.gc.yjkg.map[type].skilltype == 1);
            me.nodes.panel_jn2.setVisible(G.gc.yjkg.map[type].skilltype == 2);
            X.autoInitUI(me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype]);
            var skillarr = X.keysOfObject(skillconf);
            for(var i = 0; i < skillarr.length; i++){
                var skillid = skillarr[i];//技能id
                var data = skillconf[skillid];
                var skillico = me.nodes.list_jn.clone();
                X.autoInitUI(skillico);
                skillico.nodes.panel_jn.setBright(false);
                me.setSkillItem(skillico,data,skillid,type);
                me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype].nodes['list_jn' + data.skillnum].removeAllChildren();
                me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype].nodes['list_jn' + data.skillnum].addChild(skillico);
            }
        },
        setSkillItem:function(ui,data,skillid,type){
            var me = this;
            ui.show();
            ui.setPosition(0,0);
            ui.setAnchorPoint(0,0);
            var skillstate = G.frame.kaogu_map.DATA.skill[type];//技能的学习情况
            ui.nodes.panel_jn.loadTextureNormal('ico/kaogu/' + data.icon + ".png",0);
            me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype].nodes['list_jn' + data.skillnum].btn = ui.nodes.panel_jn;
            ui.nodes.panel_jn.id = skillid;
            ui.nodes.panel_jn.data = data;
            //前置技能学习了就亮
            ui.nodes.panel_jn.setBright(X.inArray(skillstate,skillid));
            if(X.inArray(skillstate, G.gc.yjkgskill[type][skillid].preskill)){//已经学习了的技能
                if(data.skillnum > 1){
                    me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype].nodes['img_x' + data.skillnum].show();
                }
            }else {
                if(data.skillnum > 1){
                    me.nodes['panel_jn' + G.gc.yjkg.map[type].skilltype].nodes['img_x' + data.skillnum].hide();
                }
            }
            ui.nodes.panel_jn.click(function(sender){
                G.frame.kaogu_skill_tips.data({
                    conf:sender.data,
                    id:sender.id,
                    mapid:type
                }).show();
            });
        },
        showline:function(){
            var  me = this;
            var skillstate = G.frame.kaogu_map.DATA.skill[me.mapid];//技能的学习情况
            for(var k in G.gc.yjkgskill[me.mapid]){
                if(G.gc.yjkgskill[me.mapid][k].preskill != ""){
                    var skillid = k;
                    var conf = G.gc.yjkgskill[me.mapid][k];
                    if(X.inArray(skillstate, G.gc.yjkgskill[me.mapid][skillid].preskill)){//已经学习了的技能
                        me.nodes['panel_jn' + G.gc.yjkg.map[me.mapid].skilltype].nodes['img_x' + conf.skillnum].show();
                    }else {
                        me.nodes['panel_jn' + G.gc.yjkg.map[me.mapid].skilltype].nodes['img_x' + conf.skillnum].hide();
                    }
                }
            }
        },
        //技能解锁成功
        unlockSkill:function(skillid){
            var me = this;
            var data = G.gc.yjkgskill[me.mapid][skillid];
            var skillindex = G.gc.yjkgskill[me.mapid][skillid].skillnum;
            //线亮
            me.showline();
            //if(skillindex > 1){
            //    me.nodes['panel_jn' + G.gc.yjkg.map[me.mapid].skilltype].nodes['img_x' + skillindex].show();
            //}
            //技能亮
            me.nodes['panel_jn' + G.gc.yjkg.map[me.mapid].skilltype].nodes['list_jn' + data.skillnum].btn.setBright(true);
            G.class.ani.show({
                json:'kaogu_jnsj_tx',
                addTo:me.nodes['panel_jn' + G.gc.yjkg.map[me.mapid].skilltype].nodes['list_jn' + skillindex],
                repeat: false,
                autoRemove: true,
            });
            me.nodes.txt_w_ico.setString(G.frame.kaogu_map.DATA.exp ? parseInt(G.frame.kaogu_map.DATA.exp) : 0);
        }
    });
    G.frame[ID] = new fun('kaogu_jineng.json', ID);
})();