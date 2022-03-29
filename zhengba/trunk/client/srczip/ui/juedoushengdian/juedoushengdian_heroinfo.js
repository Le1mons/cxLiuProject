/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典英雄信息
    var ID = 'juedoushengdian_heroinfo';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.heroSkinData = G.frame.juedoushengdian_main.heroSkinData;
            me.bindBtn();
            me.initUI();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.btn_fanhui.click(function () {
                me.remove();
            });
            me.ui.finds('dibu').setTouchEnabled(false);
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.heroDATA = me.data();
            me.herolist = G.frame.juedoushengdian_herolist.heroarr;
            me.curIndex = X.arrayFind(me.herolist,me.heroDATA);
            me.getData(function () {
                _super.apply(me, arg);
            });
        },
        onShow: function () {
            var me = this;
            me.showToper();
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        initTopUI:function(){
            var me = this;
            me.topview.nodes.panel_shengwu.hide();
            me.topview.nodes.panel_shengwu.y = -50;
            me.topview.nodes.panel_jn.show();
            me.topview.nodes.juedou.show();
            me.topview.nodes.btn_fenxiang.hide();
            me.topview.nodes.btn_pinlun.hide();
            me.topview.nodes.btn_bi.hide();
            me.topview.finds('Image_1').hide();
            me.topview.finds('Image_1_0_0').hide();
            me.topview.nodes.img_bi_di.hide();
            me.topview.nodes.btn_pifu.setPosition(cc.p(me.topview.nodes.btn_fenxiang.getPosition()));
            me.topview.nodes.img_mut1.setPosition(cc.p(me.topview.finds('Image_1_0_0').getPosition()));
        },
        initUI:function () {
            var me = this;
            new X.bView("ui_tip_rw.json", function (node) {
                me.ui.finds('panle_2').removeAllChildren();
                me.ui.finds('panle_2').addChild(node);
                me.topview = node;
                me.initTopUI();
                me.bindTopBtn();
                me.setTopContent();
            });
            new X.bView("juedou2.json", function (node) {
                me.nodes.nrirong.removeAllChildren();
                me.nodes.nrirong.addChild(node);
                me.downview = node;
                cc.enableScrollBar(me.downview.nodes.scrollview);
                me.setDowmContent();
            });
        },
        bindTopBtn:function(){
            var me = this;
            //皮肤按钮
            me.topview.nodes.btn_pifu.click(function () {
                G.frame.juedoushengdian_skin.data({
                    skinList:me.heroSkinData[me.heroDATA.hid],
                    curhid:me.heroDATA.hid,
                }).show();
            });
            //锁定
            me.topview.nodes.btn_suo.click(function () {
                me.ajax('gpjjc_lock',[me.heroDATA.hid],function (str,data) {
                    if(data.s == 1){
                        G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                        G.frame.juedoushengdian_herolist.setContents();
                        me.topview.nodes.btn_jiesuo.show();
                        me.topview.nodes.btn_suo.hide();
                    }
                })
            });
            //解锁
            me.topview.nodes.btn_jiesuo.click(function () {
                me.ajax('gpjjc_lock',[me.heroDATA.hid],function (str,data) {
                    if(data.s == 1){
                        G.frame.juedoushengdian_main.DATA.myinfo = data.d.myinfo;
                        G.frame.juedoushengdian_herolist.setContents();
                        me.topview.nodes.btn_suo.show();
                        me.topview.nodes.btn_jiesuo.hide();
                    }
                })
            });
            //后翻
            me.topview.nodes.panel_arrow2.click(function () {
                me.curIndex = me.curIndex+1;
                me.heroDATA = me.herolist[me.curIndex];
                me.getData(function () {
                    me.changeHero();
                });
            });
            //前翻
            me.topview.nodes.panel_arrow1.click(function () {
                me.curIndex = me.curIndex-1;
                me.heroDATA = me.herolist[me.curIndex];
                me.getData(function () {
                    me.changeHero();
                });
            });
            //宝石装备
            me.topview.nodes.panle_sp.setTouchEnabled(false);
            me.topview.nodes.ico_sp.click(function () {
                G.frame.juedoushengdian_peizhuang.data({
                    type:'baoshi',
                    data:me.DATA,
                }).show();
            });
            //饰品装备
            me.topview.nodes.panle_bs.setTouchEnabled(false);
            me.topview.nodes.ico_bs.click(function () {
                G.frame.juedoushengdian_peizhuang.data({
                    type:'shipin',
                    data:me.DATA,
                }).show();
            });
            
        },
        //切换英雄
        changeHero:function(){
            var me = this;

            me.setTopContent();
            me.setDowmContent();
        },
        setTopContent:function(){
            var me = this;
            me.topview.nodes.btn_pifu.setVisible(me.heroSkinData[me.heroDATA.hid]);
            me.topview.nodes.img_mut1.setVisible(me.heroSkinData[me.heroDATA.hid]);
            me.topview.nodes.btn_jiesuo.setVisible(!X.inArray(G.frame.juedoushengdian_main.DATA.myinfo.lock,me.heroDATA.hid));
            me.topview.nodes.btn_suo.setVisible(X.inArray(G.frame.juedoushengdian_main.DATA.myinfo.lock,me.heroDATA.hid));
            me.topview.nodes.panel_arrow2.setVisible(me.curIndex < me.herolist.length-1);
            me.topview.nodes.panel_arrow1.setVisible(me.curIndex > 0);
            //固定显示最大的宝石
            me.topview.nodes.panle_sp.finds('jia').hide();
            var bsitem = G.class.sbaoshi('20');
            bsitem.setPosition(0,0);
            bsitem.setAnchorPoint(0,0);
            me.topview.nodes.ico_sp.removeAllChildren();
            me.topview.nodes.ico_sp.addChild(bsitem);
            //饰品
            me.topview.nodes.panle_bs.finds('jia').hide();
            var spitem = G.class.sshipin(me.DATA.heroinfo.shipin);
            spitem.setPosition(0,0);
            spitem.setAnchorPoint(0,0);
            me.topview.nodes.ico_bs.removeAllChildren();
            me.topview.nodes.ico_bs.addChild(spitem);
            me.setRwBg(me.heroDATA.zhongzu);
            me.setHero();
            me.setSkillIcon();

            //圣器
            me.topview.nodes.panel_shengwu.setVisible(G.gc.wuhun[me.heroDATA.hid] != undefined);
            if (G.gc.wuhun[me.heroDATA.hid]) {
                me.topview.nodes.ico_sw.click(function () {
                    G.frame.wuhun_tips.data({
                        data:G.gc.wuhun[me.heroDATA.hid][50],
                        whid:me.heroDATA.hid,
                        whlv:50,
                        left: true
                    }).show();
                });
                var wuhundata = {id: me.heroDATA.hid, lv: 50};
                var wuhunitem = G.class.wuhun(wuhundata);
                wuhunitem.background.hide();
                wuhunitem.step.hide();
                wuhunitem.setAnchorPoint(0,0);
                me.topview.nodes.ico_sw.removeAllChildren();
                me.topview.nodes.ico_sw.addChild(wuhunitem);
            }
        },
        setHero:function(){
            var me = this;
            G.class.ui_star(me.topview.nodes.panel_xx, me.DATA.heroinfo.star, 0.8, null, true);
            me.setname(me.topview.nodes.txt_name,me.heroDATA.name,me.topview.nodes.panel_zz);
            // 种族图标
            me.topview.nodes.panel_zz.setScale(.66);
            me.topview.nodes.txt_zdl.setString(X.fmtValue(me.DATA.heroinfo.zhanli));
            X.setHeroModel({
                parent: me.topview.nodes.panel_rw,
                data: {},
                model:me.heroDATA.tenstarmodel,
                skin:G.frame.juedoushengdian_main.DATA.myinfo.skin[me.heroDATA.hid] ? G.frame.juedoushengdian_main.DATA.myinfo.skin[me.heroDATA.hid] : false,
            });
        },
        setRwBg: function (zz) {
            var me = this;
            //相同种族时，不做切换
            if (me.curZhongzu == zz) {
                return;
            }
            me.curZhongzu = zz;
            var layBg = me.topview.finds('ditu');
            layBg.removeAllChildren();
            var conf = G.class.herocom.getZhongzuById(zz);
            G.class.ani.show({
                addTo:layBg,
                x:layBg.width / 2 + 3, //位置偏移临时修改
                y:layBg.height /  2,
                json:conf.ani,
                repeat:true,
                autoRemove:false,
                cache:true,
                onload: function (node, action) {

                }
            });
        },
        setname:function(target, text, zz){
            var rt = new X.bRichText({
                size: 20,
                lineHeight: 24,
                color: G.gc.COLOR.n1,
                maxWidth: target.width,
                family: G.defaultFNT,
                eachText: function (node) {
                    X.enableOutline(node,'#34221d');
                },
            });
            rt.text(text);
            rt.setAnchorPoint(0, 0.5);
            rt.setPosition( cc.p((target.width - rt.trueWidth())*0.5 + 15, target.height*0.5) );
            target.removeAllChildren();
            target.addChild(rt);
            var rt_w = rt.trueWidth();
            var rt_h = rt.trueHeight();
            zz.setAnchorPoint(0,0.5);
            zz.setPosition(cc.p(target.x - rt_w/2 - zz.width + 10 + 15, target.y + target.height*0.5 - rt_h/2))
        },
        setSkillIcon: function () {
            var me = this;
            var interval = 16;
            var conf = me.heroDATA;
            var skillList = G.class.hero.getSkillList(me.heroDATA.hid, 10);
            var w = skillList.length * 88 + (skillList.length - 1) * interval;
            var x = (me.topview.nodes.panel_jn.width - w) * 0.5;
            var btn_num = 0;
            for (var i = 0; i < conf.bdskillopendjlv.length; i++) {
                if (10 >= conf.bdskillopendjlv[i]) {
                    ++btn_num;
                }
            }

            me.topview.nodes.panel_jn.removeAllChildren();

            for (var i = 0; i < skillList.length; i++) {
                var p = G.class.ui_skill_list(skillList[i], true, null, null, me.heroDATA);
                p.setAnchorPoint(0, 0);
                p.x = x;
                p.y = -9;
                me.topview.nodes.panel_jn.addChild(p);
                x += 88 + interval;
                if (i > btn_num) {
                    p.ishui = true;
                    p.ico_jn.setBright(false);
                }
            }
        },
        setDowmContent:function(){
            var me = this;
            //职业
            me.downview.finds('zy').setBackGroundImage(G.class.hero.getJobIcoById(me.heroDATA.hid), 1);
            me.downview.finds('zy_wz').setString(L('JOB_' + me.heroDATA.job));
            me.downview.nodes.txt_djz.setString(me.DATA.heroinfo.lv + '/' + me.DATA.heroinfo.lv);

            //属性
            var keys = ['atk','def','hp','speed','jingzhunpro','gedangpro','undpspro','dpspro','skilldpspro','baoshangpro','baojipro',"unbaojipro",'miankongpro','pojiapro',"pvpdpspro","pvpundpspro", 'undotdpspro'];
            var data = [];
            var arr = [];
            for(var i = 0; i < keys.length; i++){
                if(arr.length < 2){
                    arr.push(keys[i]);
                }else {
                    data.push(arr);
                    arr = [];
                    arr.push(keys[i])
                }
            }
            if(arr.length > 0) data.push(arr);
            me.downview.nodes.scrollview.removeAllChildren();
            var table = me.table = new X.TableView(me.downview.nodes.scrollview, me.downview.nodes.sx_list, 1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 3);
            table.setData(data);
            table.reloadDataWithScroll(true);
        },
        setItem:function(ui,data){
            var me = this;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.txt_sx1.setString('');
            ui.nodes.txt_sx2.setString('');
            for(var i = 0; i < data.length; i++){
                if(data[i].indexOf("pro") != -1){
                    var value = me.DATA.heroinfo[data[i]]/10 + "%";
                }else {
                    var value =  me.DATA.heroinfo[data[i]];
                }
                ui.nodes['txt_sx' + (i+1)].setString(L(data[i]) + "  " + value);
            }
            ui.finds('bg_xinxi3_0').loadTexture('img/public/bg_xinxi.png', 1);
            ui.finds('bg_xinxi3_0_0').loadTexture('img/public/bg_xinxi.png', 1);
        },
        //更换饰品
        changeShiPin:function(){
            var me = this;
            var spitem = G.class.sshipin(me.DATA.heroinfo.shipin);
            spitem.setPosition(0,0);
            spitem.setAnchorPoint(0,0);
            me.topview.nodes.ico_bs.removeAllChildren();
            me.topview.nodes.ico_bs.addChild(spitem);
        },
        //穿脱皮肤
        changeSkin:function(){
            var me = this;
            X.setHeroModel({
                parent: me.topview.nodes.panel_rw,
                data: {},
                model:me.heroDATA.tenstarmodel,
                skin:G.frame.juedoushengdian_main.DATA.myinfo.skin[me.heroDATA.hid] ? G.frame.juedoushengdian_main.DATA.myinfo.skin[me.heroDATA.hid] : false,
            });
        },
        getData:function (callback) {
            var me = this;
            G.ajax.send('gpjjc_getheroinfo',[me.heroDATA.hid],function (str,data) {
                if(data.s == 1){
                    me.DATA = data.d;
                    callback && callback();
                }
            })
        },
    });
    G.frame[ID] = new fun('yingxiong_xinjiegou.json', ID);
})();