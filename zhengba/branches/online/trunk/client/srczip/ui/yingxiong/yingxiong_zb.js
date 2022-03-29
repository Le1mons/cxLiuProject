/**
 * Created by zhangming on 2018-05-14
 */
(function(){
 // 英雄信息-装备
G.class.yingxiong_zb = X.bView.extend({
    ctor: function (type) {
        var me = this;
        me._type = type;
        me._super('yingxiong_zb.json');
        G.frame.yingxiong_xxxx.zb = me;
    },
    refreshPanel: function(){
        var me = this;
        me.curXbId = G.frame.yingxiong_xxxx.curXbId;
        me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;

        me.setContents();

        G.frame.yingxiong_xxxx.changeToperAttr({
            attr2:{a:'item',t:'2005'}
        });
    },
    setContents:function() {
        var me = this;

        var heroData = G.frame.yingxiong.getHeroDataByTid(me.curXbId);
        var imgJob = me.ui.finds('zy');
        var txtJob = me.ui.finds('zy_wz');
        imgJob.setBackGroundImage(G.class.hero.getJobIcoById(heroData.hid), 1);
        txtJob.setString(L('JOB_' + heroData.job));

        G.class.ui_pinji(me.nodes.panel_pinjie, heroData.dengjielv, 0.8, heroData.star);
        me.nodes.txt_djz.setString(X.STR('{1}/{2}', heroData.lv, G.class.herocom.getMaxlv(heroData.hid, heroData.dengjielv)));

        var id2obj = {
            1:{
                type:'1',
                item: function (data) {
                    return G.class.szhuangbei({eid:data});
                },
                defimg:'img_wuqi.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        G.frame.zhuangbei_zbxz.data(data).show();
                    } else {
                        G.frame.zhuangbei_xq.data({id:data,state:'xiexia'}).show();
                    }
                }
            }, //武器
            2:{
                type:'3',
                item: function (data) {
                    return G.class.szhuangbei({eid:data});
                },
                defimg:'img_toukui.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        G.frame.zhuangbei_zbxz.data(data).show();
                    } else {
                        G.frame.zhuangbei_xq.data({id:data,state:'xiexia'}).show();
                    }
                }
            }, //头盔
            3:{
                type:'2',
                item: function (data) {
                    return G.class.szhuangbei({eid:data});
                },
                defimg:'img_jiezhi.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        G.frame.zhuangbei_zbxz.data(data).show();
                    } else {
                        G.frame.zhuangbei_xq.data({id:data,state:'xiexia'}).show();
                    }
                }
            }, //戒指
            5:{
                type:'4',
                item: function (data) {
                    return G.class.szhuangbei({eid:data});
                },
                defimg:'img_kuijia.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        G.frame.zhuangbei_zbxz.data(data).show();
                    } else {
                        G.frame.zhuangbei_xq.data({id:data,state:'xiexia'}).show();
                    }
                }
            }, //胸甲
            4:{
                type:'6',
                item: function (data) {
                    var id = X.keysOfObject(data)[0];
                    return G.class.sbaoshi(id);
                },
                defimg:'img_baoshi.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        if (heroData.lv >= 40) {
                            X.audio.playEffect("sound/zhuangbei.mp3");
                            G.ajax.send('baoshi_jihuo',[me.curXbId],function(d) {
                                if(!d) return;
                                var d = JSON.parse(d);
                                if(d.s == 1) {
                                    G.frame.jiangli.data({
                                        prize:[{a:'baoshi',t:'1',n:1}],
                                    }).show();
                                    G.frame.yingxiong_xxxx.emit('updateInfo');
                                }
                            },true);
                        } else {
                            G.tip_NB.show(L("DQYX") + 40 + L('ji') + L('JIHUO'));
                        }
                    } else {
                        G.frame.baoshi_xq.show();
                    }
                },
                //英雄等级
                openneed:['lv',40]
            }, //宝石
            6:{
                type:'5',
                item: function (data) {
                    return G.class.sshipin(data);
                },
                defimg:'img_shipin.png',
                toframe: function (data,isOwn) {
                    if (!isOwn) {
                        G.frame.shipin_xuanze.data({type:1}).show();
                    } else {
                        G.frame.shipin_xq.data({id:data,state:'xiexia'}).show();
                    }
                }
            }  //饰品
        };

        for(var i=1;i<7;i++){
            var panel = me.nodes['panel_' + i];
            panel.removeAllChildren();
            var p,
                obj = id2obj[i],
                type = obj.type;
            if(type != 6) me.checkRedPoint(type, panel);
            if (heroData.weardata && heroData.weardata[type]) {
                p = obj.item(heroData.weardata[type]);
            } else {
                p = G.class.sitem();
                if (obj.openneed) {
                    if (obj.openneed[1] > heroData.lv) {
                        //锁住状态
                        p.icon.loadTextureNormal('img/public/img_suo.png',1);

                        var txt = new ccui.Text(obj.openneed[1] + L('ji'),'',20);
                        txt.setFontName(G.defaultFNT);
                        txt.setPosition(cc.p(p.width / 2,30));
                        txt.setAnchorPoint(cc.p(0.5,0.5));
                        X.enableOutline(txt, "#000000", 2);
                        p.addChild(txt);
                    } else {
                        if (!heroData.weardata || !heroData.weardata[type]) {
                            //宝石已解锁
                            G.class.ani.show({
                                json: "ani_baoshijiesuotishi",
                                addTo: p.icon,
                                x: p.icon.width / 2 + 3,
                                y: p.icon.height / 2 + 3,
                                repeat: true,
                                autoRemove: false,
                                onend: function (node, action) {

                                }
                            })
                        }
                    }
                } else {

                    p.icon.loadTextureNormal('img/public/' + obj.defimg,1);
                    while (p.img_jia){
                        p.img_jia.removeFromParent();
                    }

                    // 加号
                    var data = type == "5" ? G.frame.beibao.DATA.shipin.list : G.frame.zhuangbei.getCanUseZbTidArrByType(type);
                    var isHave = false;
                    if(cc.isObject(data)){
                        if(X.keysOfObject(data).length > 0) isHave = true;
                    }else{
                        if(data.length > 0) isHave = true;
                    }
                    if(isHave){
                        var img_jia = p.img_jia = new ccui.ImageView();
                        img_jia.setName('img_jia');
                        img_jia.loadTexture('img/public/img_jia.png', 1);
                        img_jia.setAnchorPoint(0.5, 0.5);
                        img_jia.setPosition(cc.p(p.width - img_jia.width / 2 - 2, img_jia.height / 2 + 2));
                        p.addChild(img_jia);

                        var act1 = cc.fadeIn(1.5);
                        var act2 = cc.fadeOut(1.5);
                        var action = cc.sequence(act1, act2);
                        img_jia.runAction(cc.repeatForever(action));
                    }
                }
            }

            p.setAnchorPoint(0.5, 0.5);
            p.setPosition(cc.p(panel.width * 0.5, panel.height / 2));

            if(i == 4 || i == 6){
                p.background.loadTexture('img/public/ico/ico_bg'+((p.conf && p.conf.color) || 10)+'.png', 1);
                p.kuang.loadTexture('img/public/ico/ico_spbg' + ((p.conf && p.conf.color) || 0) + '.png',1);
                p.kuang.y = 49;
            }else{
                if(heroData.weardata && heroData.weardata[type]) {

                }else {
                    p.background.loadTexture('img/public/ico/ico_bg' + ((p.conf && p.conf.color) || 10) + '.png',1);
                }
            }

            p.num.hide();
            panel.addChild(p);

            panel.data = heroData.weardata && heroData.weardata[type];
            panel.type = type;
            panel.obj = obj;
            panel.click(function(sender,type){
                if (sender.data) {
                    sender.obj.toframe(sender.data,true);
                    me.panel = sender;
                } else {
                    sender.obj.toframe(sender.type,false);
                    me.panel = sender;
                }
            });
        }
    },
    checkRedPoint: function(type, target){
        G.removeNewIco(target);
        while (target.getChildByTag(987654)) {
            target.getChildByTag(987654).removeFromParent();
        }
        var me = this;
        var comData = [];
        var heroData = G.frame.yingxiong.getHeroDataByTid(me.curXbId);
        if(!heroData) return;
        var data = type == "5" ? G.frame.beibao.DATA.shipin.list : G.frame.zhuangbei.getCanUseZbTidArrByType(type);
        if(!cc.isArray(data)){
            var keys = X.keysOfObject(data);
            for(var i = 0; i < keys.length; i ++){
                comData.push(data[keys[i]]);
            }
        }else{
            for(var i = 0; i < data.length; i ++){
                comData.push(G.frame.beibao.DATA.zhuangbei.list[data[i]]);
            }
        }
        if(heroData.weardata && heroData.weardata[type]){
            var isHave = false;
            var myConf = type == "5" ? G.class.shipin.getById(heroData.weardata[type]) : G.class.equip.getById(heroData.weardata[type]);
            for(var i = 0; i < comData.length; i ++){
                if(comData[i].color > myConf.color || (comData[i].color == myConf.color && comData[i].star > myConf.star)){
                    isHave = true;
                    break;
                }
            }
            if(isHave){
                G.setNewIcoImg(target, .9);
            }else{
                if(type == "5" && myConf.star == 6 && myConf.color == 5){
                    G.class.ani.show({
                        json: "ani_qiandao_1",
                        addTo: target,
                        x: 58,
                        y: 45,
                        repeat: true,
                        autoRemove: false,
                        onload: function (node, action) {
                            node.setTag(987654);
                            node.setScale(1.2);
                        }
                    })
                }
            }
        }
    },
    bindBTN:function() {
        var me = this;

        // 一键穿戴
        if(!me.nodes.btn_1.data) me.nodes.btn_1.data = [];
        me.nodes.btn_1.click(function(){
            X.audio.playEffect("sound/zhuangbei.mp3");
            G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
            G.ajax.send('hero_yjwear',[me.curXbId],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {
                    G.frame.yingxiong_xxxx.emit('updateInfo');

                    cc.callLater(function(){
		            	G.guidevent.emit('yingxiong_zb_yjcd_over');
		            });
                }
            },true);
        });

        // 一键脱装

        if(!me.nodes.btn_2.data) me.nodes.btn_2.data = [];
        me.nodes.btn_2.click(function(){
            X.audio.playEffect("sound/zhuangbei.mp3");
            G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));
            G.ajax.send('hero_yjtakeoff',[me.curXbId],function(d) {
                if(!d) return;
                var d = JSON.parse(d);
                if(d.s == 1) {

                    G.frame.yingxiong_xxxx.emit('updateInfo');
                }
            },true);
        });

		me.nodes.btn_fanhui = me.ui.finds('$btn_fanhui');
        me.ui.finds('$btn_fanhui').click(function(sender,type){
            G.frame.yingxiong_xxxx.remove();
        });
    },
    onOpen: function () {
        var me = this;
        me.bindBTN();
    },
    onShow : function(){
        var me = this;
        me.refreshPanel();

        G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
            if(G.frame.yingxiong_xxxx.getCurType() == me._type){
                me.refreshPanel();
            }else{
                me._needRefresh = true;
            }
        }, me.getViewJson());
    },
    onNodeShow : function(){
        var me = this;

        // if(me._needRefresh){
        //     delete me._needRefresh;
        //     me.refreshPanel();
        // }

        if (cc.isNode(me.ui)) {
            me.refreshPanel();
        }

        G.frame.yingxiong_xxxx.changeToperAttr({
            attr2:{a:'item',t:'2005'}
        });
    },
    onRemove: function () {
        var me = this;
    },
});

})();
