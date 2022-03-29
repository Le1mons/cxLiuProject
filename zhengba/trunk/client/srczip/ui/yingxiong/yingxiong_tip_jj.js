/**
 * Created by zhangming on 2018-05-03
 */
(function () {
    //英雄信息-进阶界面
    var ID = 'yingxiong_tip_jj';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id,{action:true});
        },
        bindUI: function () {
            var me = this;
            setPanelTitle(me.nodes.tip_title, L('UI_TITLE_JINJIE'));

            me.nodes.mask.click(function(){
                me.remove();
            });

            if(!me.nodes.btn_xjj.data) me.nodes.btn_xjj.data = [];
            me.nodes.btn_xjj.click(function(){
                G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));

                me.ajax('hero_jinjie',[me.curXbId], function (s, rd) {
                    if (rd.s == 1){
                        X.audio.playEffect("sound/yingxiongjinjie.mp3");
                        var panel = G.frame.yingxiong_xxxx._rwPanel.nodes.panel_rw;
                        G.class.ani.show({
                            json: "ani_jinjieqianghua",
                            addTo: panel,
                            x: panel.width / 2,
                            y: panel.height / 2 - 100,
                            repeat: false,
                            autoRemove: true
                        });
                        G.frame.yingxiong_xxxx.emit('updateInfo');
                        var heroData = G.DATA.yingxiong.list[me.curXbId];
                        if (heroData.dengjielv == 6) {
                            G.frame.yingxiong_xxxx.topMenu.addItem(G.class.menu.get('yingxiongxinxi')[2]);
                        }
                        if(me.isSkill) G.frame.yingxiong_xxxx.rw.palySkillAni();
                        G.frame.yingxiong_xxxx.updateInfo();
                        G.frame.yingxiong_xxxx.qh.playJjAni();
                        me.remove();
                    }else{
                        X.audio.playEffect("sound/dianji.mp3", false);
                    }
                },true);
            }, 1500);
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;
            me.curXbId = me.data().tid;

            G.frame.yingxiong_xxxx.changeToperAttr({
                attr2: {a: 'item', t: '2004'}
            });

            G.frame.yingxiong_xxxx.getNextBuff('dengjielv', me.curXbId, function(buff){
                me.setContents(buff);
            });
        },
        onRemove: function () {
            var me = this;

            G.frame.yingxiong_xxxx.changeToperAttr({
                attr2: {a: 'attr', t: 'useexp'}
            });
        },
        setContents:function(buff) {
            var me = this;
            var view = me.ui;
            var data = G.DATA.yingxiong.list[me.curXbId];
            var need = G.class.herocom.getHeroJinJieUp(data.dengjielv).need;

            X.render({
                txt_sl1: X.fmtValue(need[0].n),
                txt_sl2: X.fmtValue(need[1].n),
            }, me.nodes);

            if(G.class.getOwnNum(need[0].t,need[0].a) < need[0].n){
                me.nodes.txt_sl1.setTextColor(cc.color(G.gc.COLOR.n16));
                X.enableOutline(me.nodes.txt_sl1,cc.color('#740000'),1);
            }
            if(G.class.getOwnNum(need[1].t,need[1].a) < need[1].n){
                me.nodes.txt_sl2.setTextColor(cc.color(G.gc.COLOR.n16));
                X.enableOutline(me.nodes.txt_sl2,cc.color('#740000'),1);
            }

            X.setHeroModel({
                parent: me.nodes.xjinjie_rw,
                data: data
            });

            me.ui.finds("Image_8").loadTexture(G.class.getItemIco(need[0].t), 1);
            me.ui.finds("Image_9").loadTexture(G.class.getItemIco(need[1].t), 1);

            var str = "<font node=1></font> " + data.name;
            var img = new ccui.ImageView('img/public/ico/ico_zz' + (data.zhongzu + 1) + '.png', 1);
            img.setScale(.6);
            var rh = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.xjinjie_name.width,
                lineHeight: 32,
                color: "#ffffff",
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node, "#000000", 2);
                }
            });
            rh.text(str, [img]);
            rh.setAnchorPoint(0.5, 0.5);
            rh.setPosition(me.nodes.xjinjie_name.width / 2, 35);
            me.nodes.xjinjie_name.addChild(rh);

            var setItem = function(target, obj, color){
                var arr = ["lvmax", "atk", "hp", "speed"];
                G.class.ui_pinji(target.children[1], obj.dengjielv, .8, obj.star);

                for(var i = 0; i < arr.length; i ++) {
                    var lay = target.children[i + 2];
                    var str = X.STR(("<font color=#804326>{1}：</font>" + obj[arr[i]]), L(arr[i]));
                    var rh = new X.bRichText({
                        size: 20,
                        color: color,
                        family: G.defaultFNT,
                        maxWidth: lay.width,
                        lineHeight: 32,
                    });
                    rh.text(str);
                    rh.setAnchorPoint(0, 0.5);
                    rh.setPosition(0, lay.height / 2);
                    lay.addChild(rh);
                }
            };

            var obj = buff.buff[me.curXbId];

            setItem(me.ui.finds("bg_xjjdi"), {
                lvmax: G.class.herocom.getMaxlv(data.hid, data.dengjielv),
                atk: data.atk,
                hp: data.hp,
                speed: data.speed,
                star: data.star,
                dengjielv: data.dengjielv
            }, "#804326");

            setItem(me.ui.finds("bg_xjjdi1"), {
                lvmax: G.class.herocom.getMaxlv(data.hid, data.dengjielv + 1),
                atk: obj.atk,
                hp: obj.hp,
                speed: obj.speed,
                star: data.star,
                dengjielv: data.dengjielv + 1
            }, "#249714");

            me.showNewSkill();
        },
        showNewSkill: function(){
            var me = this;
            var data = G.DATA.yingxiong.list[me.curXbId];
            var conf = G.class.hero.getById(data.hid);
            var lay = me.ui.finds("Panel_21");

            var idx = X.arrayFind(conf.bdskillopendjlv, data.dengjielv+1);
            if( idx > -1 ){

                var skill = G.class.hero.getSkillOne(idx+1, data.hid, data.dengjielv);
                var p = G.class.ui_skill_list(skill, true, null, null, data);
                p.setAnchorPoint(0.5,0.5);
                p.setPosition(cc.p( lay.width*0.5, lay.height*0.5 ));
                p.ico_jn.setBright(true);
                lay.addChild(p);
                me.isSkill = true;
            }else{
                me.nodes.jinjie_bg.hide();
            }
        },
    });

    G.frame[ID] = new fun('ui_xinjingjie.json', ID);
})();