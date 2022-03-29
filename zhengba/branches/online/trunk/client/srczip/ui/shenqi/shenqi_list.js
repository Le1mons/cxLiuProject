/**
 * Created by LYF on 2018/9/13.
 */
(function () {
    //神器列表
    var ID = 'shenqi_list';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
            me.lvUpPanel = me.ui.nodes.shenbing_shengji;
            me.sjUpPanel = me.ui.nodes.shenbing_jinjie;
            me.lvUpPanel.setTouchEnabled(false);
            me.sjUpPanel.setTouchEnabled(false);
            var data = me.DATA.artifact;
            var keys = X.keysOfObject(data);
            cc.enableScrollBar(me.nodes.listview1,false);
            function setBtn(conf,sqid) {
                var list = me.nodes.list1.clone();
                X.autoInitUI(list);
                list.show();
                list.nodes.txt_name.setString(conf.name);
                list.setName(sqid);
                list.nodes.ico.setBackGroundImage("img/shenbing/" + conf.shenqiicon + ".png", 0);
                list.setTouchEnabled(true);
                me.nodes.listview1.pushBackCustomItem(list);
                G.class.ani.show({
                    json: "ani_meirishilian",
                    addTo: list.nodes.panel_dh,
                    x: list.nodes.panel_dh.width / 2,
                    y: list.nodes.panel_dh.height / 2,
                    repeat: true,
                    autoRemove: false,
                });
                me.topBtns.push(list);
            }

            for(var i = 0; i < keys.length; i ++) {
                setBtn(G.class.shenqi.getComById(keys[i]),keys[i]);
            }

            X.radio(me.topBtns, function (sender) {
                me.topChangeType({
                    1: 1,
                    2: 2,
                    3: 3,
                    4: 4,
                    5: 5
                }[sender.getName()])
            }, {
                callback1: function (sender) {
                    sender.finds('txt_name$').setOpacity(255);
                    sender.finds("img_light$").setVisible(true);
                    sender.finds("panel_dh$").setVisible(true);
                    sender.finds("ico$").runActions(cc.sequence(cc.scaleTo(0.1, 1.1, 1.1), cc.scaleTo(0.1, 1, 1)));
                    X.enableOutline(sender.finds('txt_name$'),'#000000');
                },
                callback2: function (sender) {
                    sender.finds('txt_name$').setOpacity(255 * 0.6);
                    sender.finds("img_light$").setVisible(false);
                    sender.finds("panel_dh$").setVisible(false);
                    X.enableOutline(sender.finds('txt_name$'),'#000000');
                },
                color: ["#FFE8C0", "#FFE8C0"],
            });
            me.setDownMenu();
        },
        topChangeType: function(type) {
            var me = this;

            if(me.type == type) return;
            G.DATA.sqid = type - 1;
            me.type = type;

            if(me.isFrist) {
                me.setContents()
            }else {
                me.getData(function () {
                    me.setContents();
                })
            }
        },
        changeType:function(sender){
            var me = this; 
            me.curIdx = sender.data.id;
            if(me.curIdx == 1){
                me.setLvUpInfo(me.type);
            }else{
                me.setSjUpInfo(me.type);
            }
            me.setShenqi(me.type);
            me.setSQmiaoshu(me.type);
            me.setChongZhu();
            me.setTopZy();
        },
        setTopZy:function(){
            var me = this;
            var txt_jb = me.nodes.txt_jb;
            var txt_zs = me.nodes.txt_zs;
            var btn_jia1 = me.nodes.btn_jia1;
            var btn_jia2 = me.nodes.btn_jia2;
            var token_zs = me.nodes.panel_top.finds('panel_db2').finds('token_zs');
            var url;
            var num;
            if(me.curIdx == 1){
                url = G.class.getItemIco(2017);
                num = G.class.getOwnNum(2017,'item');
            }else{
                url = G.class.getItemIco(2018);
                num = G.class.getOwnNum(2018,'item');
            }
            txt_jb.setString(X.fmtValue(P.gud.jinbi));
            token_zs.loadTexture(url,1);
            txt_zs.setString(X.fmtValue(num));
            btn_jia1.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.dianjin.show();
                    G.frame.dianjin.once("hide", function() {
                        txt_jb.setString(P.gud.jinbi);

                        me.downMenu.changeMenu(me.curIdx);
                    });
                }
            });
        },
        setLvUpInfo:function(type){
            var me = this;
            me.lvUpPanel.show();
            me.sjUpPanel.hide();
            var panel = me.lvUpPanel;
            X.autoInitUI(panel);
            var jbneed = panel.nodes.txt_xh1;
            var jtneed = panel.nodes.txt_xh2;
            var btn_lvup = panel.nodes.btn_up_jj;
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var upneed = G.class.shenqi.getUpLvNeedByLv(data.lv);
            var sqbuff = G.class.shenqi.getBuffByIdAndLv(type,data.lv).buff;

            btn_lvup.setTitleText(L("SHENGJI"));
            btn_lvup.setTitleColor(cc.color("#2f5719"));

            if(data.lv == conf.maxlv) {
                btn_lvup.hide();
                jbneed.hide();
                jtneed.hide();
                panel.finds("bg_xinxi1").hide();
                panel.finds("bg_xinxi1_0").hide();
                panel.finds("token_jb").hide();
                panel.finds("token_jy").hide();
            }else {
                btn_lvup.show();
                jbneed.show();
                jtneed.show();
                panel.finds("bg_xinxi1").show();
                panel.finds("bg_xinxi1_0").show();
                panel.finds("token_jb").show();
                panel.finds("token_jy").show();
            }

            panel.finds("token_jy").loadTexture(G.class.getItemIco(upneed[1].t), 1);
            setTextWithColor(jbneed,X.fmtValue(P.gud.jinbi) + '/' + X.fmtValue(upneed[0].n),P.gud.jinbi < upneed[0].n ? '#ff4e4e' : '#ffffff');
            setTextWithColor(jtneed,X.fmtValue(G.class.getOwnNum(upneed[1].t,upneed[1].a)) + '/' + X.fmtValue(upneed[1].n),G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n ? '#ff4e4e' : '#ffffff');
            if(P.gud.jinbi < upneed[0].n){
                X.enableOutline(jbneed,'#740000');
            }else{
                X.enableOutline(jbneed,'#000000');
            }
            if(G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n){
                X.enableOutline(jtneed,'#740000');
            }else{
                X.enableOutline(jtneed,'#000000');
            }
            // me.setLvupSx(sqbuff);
            me.nodes.txt_gj.setString(X.STR(L('SHENQI_atk'),sqbuff.atk));
            me.nodes.txt_xl.setString(X.STR(L('SHENQI_hp'),sqbuff.hp));
            btn_lvup.click(function(sender, type) {
                G.ajax.send('artifact_lvup', [me.type,'lv'], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        me.DATA.artifact[me.type] =  d.d;
                        G.class.ani.show({
                            json: 'ani_shenbing_shengji',
                            addTo: me.ui.finds('shenbing'),
                            x: me.ui.finds('shenbing').width / 2,
                            y: me.ui.finds('shenbing').height / 2 + 20,
                            repeat: false,
                            autoRemove: true,
                            onend:function(){
                                me.downMenu.changeMenu(me.curIdx);
                            }
                        });
                    }
                });
            }, 500);
        },
        setLvupSx:function(sqbuff){
            var me = this;
            var panel = me.lvUpPanel;
            var xinxi_neirong = panel.finds('xinxi_neirong');
            var pos = [cc.p(40,80),cc.p(40,30),cc.p(310,30)];
            var str = [];
            str.push(L('SHENQI_JBJC'));
            str.push(X.STR(L('SHENQI_atk'),sqbuff.atk));
            str.push(X.STR(L('SHENQI_hp'),sqbuff.hp));
            xinxi_neirong.removeAllChildren();
            for(var i = 0; i<pos.length; i++){
                var lay = new ccui.Layout();
                lay.setContentSize(cc.size(570,50));
                lay.setPosition(pos[i]);
                me.createSxRh(str[i],lay);
                xinxi_neirong.addChild(lay);
            }
        },
        createSxRh:function(str,lay,color){
            var rh = new X.bRichText({
                size: 24,
                maxWidth: lay.width,
                lineHeight: 36,
                family: G.defaultFNT,
                color: '#804326'
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0);
            rh.setPosition(0, (lay.height - rh.height) / 2);
            lay.removeAllChildren();
            lay.addChild(rh);
        },
        setSjUpInfo:function(type){
            var me = this;
            me.lvUpPanel.hide();
            me.sjUpPanel.show();
            var panel = me.sjUpPanel;
            X.autoInitUI(panel);
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var skillconf = G.class.shenqi.getSkillByIdAndDj(type,data.djlv);
            var upneed = G.class.shenqi.getUpDjNeedByDj(data.djlv > 23 ? 23 : data.djlv);
            var skillname = panel.nodes.txt_dj;
            var skillico = panel.nodes.ico_jn;
            var skillintr = panel.nodes.txt_jnm;
            var jbneed = panel.nodes.txt_xh1;
            var jtneed = panel.nodes.txt_xh2;
            var btn_sjup = panel.nodes.btn_up;

            if(data.djlv == conf.maxdengjie) {
                btn_sjup.hide();
                jbneed.hide();
                jtneed.hide();
                panel.finds("bg_xinxi1").hide();
                panel.finds("bg_xinxi1_0").hide();
                panel.finds("token_jb").hide();
                panel.finds("token_jt").hide();
                panel.nodes.txt_huizi.hide();
            }else {
                btn_sjup.show();
                jbneed.show();
                jtneed.show();
                panel.finds("bg_xinxi1").show();
                panel.finds("bg_xinxi1_0").show();
                panel.finds("token_jb").show();
                panel.finds("token_jt").show();
                me.nodes.txt_huizi.show();
            }

            panel.finds("token_jt").loadTexture(G.class.getItemIco(upneed[1].t), 1);
            skillname.setString(skillconf.skillname + '+' + data.djlv);
            skillico.setBackGroundImage('ico/skillico/' + skillconf.skillico + '.png',0);
            skillintr.setFontSize(18);
            skillintr.setString(skillconf.intr);
            setTextWithColor(jbneed,X.fmtValue(P.gud.jinbi) + '/' + X.fmtValue(upneed[0].n),P.gud.jinbi < upneed[0].n ? '#ff4e4e' : '#ffffff');
            setTextWithColor(jtneed,X.fmtValue(G.class.getOwnNum(upneed[1].t,upneed[1].a)) + '/' + X.fmtValue(upneed[1].n),G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n ? '#ff4e4e' : '#ffffff');
            if(P.gud.jinbi < upneed[0].n){
                X.enableOutline(jbneed,'#680000');
            }else{
                X.enableOutline(jbneed,'#000000');
            }
            if(G.class.getOwnNum(upneed[1].t,upneed[1].a) < upneed[1].n){
                X.enableOutline(jtneed,'#680000');
            }else{
                X.enableOutline(jtneed,'#000000');
            }
            var step = (data.djlv + 1) * 5;
            if(data.lv < step){
                // me.nodes.txt_huizi.show();
                me.nodes.txt_huizi.setString(X.STR(L('SHENQI_XXJ'),step));
                me.nodes.txt_huizi.setTextColor(cc.color("#6c6c6c"));
                btn_sjup.setBright(false);
                btn_sjup.setTouchEnabled(false);
            }else{
                me.nodes.txt_huizi.setString(L("SHENGJI"));
                me.nodes.txt_huizi.setTextColor(cc.color("#2f5719"));
                btn_sjup.setBright(true);
                btn_sjup.setTouchEnabled(true);
            }
            btn_sjup.click(function(sender, type) {
                G.ajax.send('artifact_lvup', [me.type,'djlv'], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        me.DATA.artifact[me.type] =  d.d;
                        G.class.ani.show({
                            json: 'ani_shenbing_jinjie',
                            addTo: me.ui.finds('shenbing'),
                            x: me.ui.finds('shenbing').width / 2,
                            y: me.ui.finds('shenbing').height / 2 + 20,
                            repeat: false,
                            autoRemove: true,
                            onend: function() {
                                me.downMenu.changeMenu(me.curIdx);
                            }
                        });
                    }
                });
            }, 500);
        },
        //设置神器技能描述(时间紧，数值都是程序算的)
        setSQmiaoshu:function(type){
            var me = this;
            var data = me.DATA.artifact[type];
            var lay1 = me.ui.nodes.neirong1;
            var lay2 = me.ui.nodes.neirong2;
            var bg = me.ui.finds('shenbing_miaoshu').finds('bg2');
            bg.height = 170;
            bg.width = 230;
            bg.setAnchorPoint(0.5, 1);
            bg.x = bg.width / 2;
            lay1.x = bg.width / 2;
            lay2.x = bg.width / 2;
            me.ui.finds('shenbing_miaoshu').x = 0;
            var rh = new X.bRichText({
                size: 18,
                maxWidth: bg.width,
                lineHeight: 20,
                family: G.defaultFNT,
                color: '#fbc647'
            });
            rh.text(L('SHENQI_JNJC_NAME'));
            rh.setAnchorPoint(0.5, 0);
            rh.setPosition(0, (lay1.height - rh.height) / 2);
            lay1.removeAllChildren();
            lay1.addChild(rh);

            var rh1 = new X.bRichText({
                size: 18,
                maxWidth: bg.width,
                lineHeight: 20,
                family: G.defaultFNT,
            });
            var str1 = '';
            var skillbuff = G.class.shenqi.getComById(type).skillbuff;
            for(var i in skillbuff){
                var skillbuff_name = X.keysOfObject(skillbuff[i]);
                // var shenqi_killbuff = i <= data.djlv ? L('SHENQI_KILLBUFF1') : L('SHENQI_KILLBUFF1_H');
                var shenqi_jndj = i <= data.djlv ? L('SHENQI_JNDJ1') : L('SHENQI_JNDJ1_H');

                if(skillbuff_name == "speed"){
                    str_buff = X.STR(shenqi_jndj, '+'+i, L(skillbuff_name), skillbuff[i][skillbuff_name]);
                    str_kongge = "";
                }else{
                    str_buff =  X.STR(shenqi_jndj, i < 10 ? ('  +'+i) : '+'+i , L(skillbuff_name), (skillbuff[i][skillbuff_name] / 10) + '%');
                    str_kongge = "";
                }
                str1 += "<br>  " + str_buff;
                // str1 += str_kongge;
            }
            rh1.text(str1);
            rh1.setAnchorPoint(0.5, 0);
            rh1.setPosition(10, (lay2.height - rh1.height) / 2 + 5);
            lay2.removeAllChildren();
            lay2.addChild(rh1);
        },
        setShenqi:function(type){
            var me = this;
            var conf = G.class.shenqi.getComById(type);
            var data = me.DATA.artifact[type];
            var panel = me.nodes.panel_top.finds('shenbing');
            var btn_wz = me.nodes.btn_wz;
            var wz = btn_wz.getChildren()[0];
            wz.setTouchEnabled(false);
            // var shenqi_img = me.nodes.shenbing;
            var shenqilv = me.nodes.wz_dj;
            shenqilv.setString(L('dengji') + ' ' +  data.lv);
            // shenqi_img.setBackGroundImage('img/shenbing/shenbing_wq_0' + type + '.png',0);
            var str = '<font color=#ffe983>' + conf.name + '</font>' + '<font color=#ffb47d>+' + data.djlv + '</font>';        
            me.createRh(str,wz);
            me.sqid = type;
            me.sqlv = conf.maxlv;
            me.sqdjlv = conf.maxdengjie;

            me.nodes.shenbing.removeAllChildren();

            G.class.ani.show({
                json: "shenbing_0" + type,
                addTo: me.nodes.shenbing,
                x: me.nodes.shenbing.width / 2,
                y: me.nodes.shenbing.height / 2 - 50,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    var act1 = cc.moveBy(1, 0, 10);
                    var act2 = cc.moveBy(1, 0, -10);
                    var act = cc.sequence(act1, act2);
                    node.runAction(act.repeatForever());
                }
            })

        },
        createRh:function(str,lay,color){
            var rh = new X.bRichText({
                size: 24,
                maxWidth: lay.width,
                lineHeight: 32,
                family: G.defaultFNT,
                eachText: function(node){
                    X.enableOutline(node,'#000000');
                }
            });
            rh.text(str);
            rh.setAnchorPoint(0, 0);
            rh.setPosition((lay.width - rh.width) / 2, (lay.height - rh.height) / 2);
            lay.removeAllChildren();
            lay.addChild(rh);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.shenbing.click(function(){
                // if(me.sqlv > 1){
                //     G.frame.shenqi_xq.data({
                //         id: me.sqid,
                //         jh: true,
                //         lv: me.sqlv,
                //         djlv: me.sqdjlv,
                //     }).show();
                // }else{
                //     G.frame.shenqi_xq1.data({
                //         id: me.sqid,
                //     }).show();
                // }
                G.frame.shenqi_xq.data({
                    id: me.sqid,
                    jh: true,
                    lv: me.sqlv,
                    djlv: me.sqdjlv,
                }).show();
            });

            me.nodes.btn_wz.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_ENDED){
                    // if(me.sqlv > 1){
                    //     G.frame.shenqi_xq.data({
                    //         id: me.sqid,
                    //         jh: true,
                    //         lv: me.sqlv,
                    //         djlv: me.sqdjlv,
                    //     }).show();
                    // }else{
                    //     G.frame.shenqi_xq1.data({
                    //         id: me.sqid,
                    //     }).show();
                    // }
                    G.frame.shenqi_xq.data({
                        id: me.sqid,
                        jh: true,
                        lv: me.sqlv,
                        djlv: me.sqdjlv,
                    }).show();
                }
            });

            me.nodes.btn_fh.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.topBtns = [];
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.nodes.btn_jia2.hide();
        },
        onAniShow: function () {
            var me = this;
        },
        getData: function(callback) {
            var me = this;

            G.ajax.send('artifact_open', [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            }, true);
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            me.isFrist = true;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;

            me.topBtns[G.DATA.sqid || 0].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        onHide: function () {
            var me = this;
        },
        setDownMenu:function(){
            var me = this;
            me.nodes.list.hide();
            var view = me.nodes.down_shengjijinjie;
            X.autoInitUI(view);
            me.downMenu = new G.class.topMenu(me, {
                btns: X.clone(G.class.menu.get('shenqi'))
            },view);
        },
        setChongZhu:function(){
            var me = this;
            var btn_czsq = me.nodes.down_shengjijinjie.finds('btn_czsq');
            var data = me.DATA.artifact[me.type];
            if(data.lv > 1){
                btn_czsq.show();
            }else{
                btn_czsq.hide();
            }
            var chongzhu = function(){
                G.ajax.send('artifact_recast', [me.type], function(d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        me.DATA.artifact[me.type] = d.d.artifact[me.type];
                        me.downMenu.changeMenu(me.curIdx);
                    }
                });
            };
            btn_czsq.touch(function(sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    var str = L('SHENQICHONGZHU');
                    G.frame.alert.data({
                        sizeType: 3,
                        cancelCall: null,
                        okCall: function() {
                            chongzhu();
                        },
                        richText: str
                    }).show();
                }
            });
        },
        setContents: function () {
            var me = this;
            me.downMenu.changeMenu(1);
        },
        setShenqiXiangQin:function(){
            var me = this;

        }
    });
    G.frame[ID] = new fun('shenbing3.json', ID);
})();