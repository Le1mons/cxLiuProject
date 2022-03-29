/**
 * Created by wfq on 2018/5/25.
 */
(function () {
    //物品详情
    var ID = 'iteminfo';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('zhuangbei_tip1.json', function (view) {
                me._view = view;

                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.setContents();
                view.setTouchEnabled(true);
                
				me.ui.setTimeout(function(){
					G.guidevent.emit('iteminfoShowOver');
				},300);
            }, {action: true});
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            me.item = me.data();
            me.DATA = me.data().data;
            var wid = G.class.sitem(me.DATA);
            me.conf = wid.conf;
            me.DATA.hcnum = me.conf.hcnum;


            me.setBtns();
            me.setTop();
        },
        setTop: function () {
            var me = this;

            var panel = me._view;
            var conf = me.conf;
            var mask = me.ui.finds('panel_1');
            var btnHqtj = panel.nodes.btn_hqtj;
            var layIco = panel.nodes.panel_1;
            var layBuff = panel.nodes.panel_2;
            var txtName = panel.nodes.text_1;
            var txtType = panel.nodes.text_2;
            var txtHqtj = panel.finds('text_hqtj');
            var layYx = panel.nodes.panel_4;
            var btn_cs = panel.finds.panel_3;
            var fdj = panel.nodes.btn_fdj;

            mask.setBackGroundColorOpacity(255 * 0.7);

            if (conf.usetype == '12' && conf.hchero) {
                fdj.show();
                fdj.click(function () {
                    G.frame.yingxiong_xxxx.data({
                        tid:conf.hchero,
                        list:[conf.hchero],
                        frame:'yingxiong_tujian',
                    }).show();
                });
            }


            layIco.removeAllChildren();
            layBuff.removeAllChildren();
            layYx.removeAllChildren();
            txtHqtj.show();

            //头像
            var wid = G.class.sitem(me.DATA);
            wid.setPosition(cc.p(layIco.width / 2 - 5,layIco.height / 2));
            layIco.addChild(wid);

            wid.num.hide();

            // 名字
            setTextWithColor(txtName,conf.name,G.gc.COLOR[conf.color || 0]);


            // 类型
            txtType.setString(L('DAOJU_TYPE_' + me.DATA.a));

            //介绍
            var str = "";
            if(conf.buff){
                var buffArr;
                if(G.frame.yingxiong_xxxx.isShow && !G.frame.equip_step.isShow && me.DATA.a != "shipin"){
                    var tid = G.frame.yingxiong_xxxx.curXbId;
                    var data = G.DATA.yingxiong.list[tid];
                    var curData = data.weardata[6];
                    var keys = X.keysOfObject(curData);
                    buffArr = X.fmtBuff(conf.buff[curData[keys[0]]]);
                }else{
                    if(me.DATA.key) {
                        buffArr = X.fmtBuff(conf.buff[me.DATA.key]);
                    } else {
                        buffArr = X.fmtBuff(conf.buff);
                    }
                }
                for(var i = 0; i < buffArr.length; i ++){
                    var buff = buffArr[i];
                    if(i == 0){
                        str += buff.tip;
                    }else{
                        str += "<br>" + buff.tip;
                    }
                }
                if(conf.tpbuff && Object.keys(conf.tpbuff).length > 0) {
                    var tpBuff = X.fmtBuff(conf.tpbuff);
                    for (var i = 0; i < tpBuff.length; i++) {
                        var bObj = tpBuff[i];
                        if(i == 0){
                            str += "<br>" + bObj.tip;
                        }else{
                            str += "<br>" + bObj.tip
                        }
                    }
                }
                if(conf.intr){
                    str += "<br>" + conf.intr;
                }
                if(conf.zhongzu){
                    str += '<br><font size=20 color='+ G.gc.COLOR.n10 +'>' + X.STR(L('ZHONGZU_NEED'),L('zhongzu_' + conf.zhongzu)) + '</font>';
                }
                if(conf.zhongzubuff){
                    var buff = X.fmtBuff(conf.zhongzubuff);
                    for(var i = 0; i < buff.length; i ++){
                        str += '<br><font color=' + G.gc.COLOR.n10 + '>' + buff[i].tip + '</font>';
                    }
                }
                if(conf.job){
                    str += '<br><font size=20 color='+ G.gc.COLOR.n10 +'>' + X.STR(L('JOB_NEED'),L('JOB_' + conf.job)) + '</font>';
                }
                if(conf.jobbuff){
                    var buff = X.fmtBuff(conf.jobbuff);
                    for(var i = 0; i < buff.length; i ++){
                        str += '<br><font color=' + G.gc.COLOR.n10 + '>' + buff[i].tip + '</font>';
                    }
                }
                if (me.DATA.spid && G.gc.shipincom.awake.skillList[me.DATA.spid.split("_")[1]]) {
                    str += '<br>' + G.gc.shipincom.awake.skillList[me.DATA.spid.split("_")[1]].intr;
                }
            }else{
                str += conf.intr;
            }
            var rh = new X.bRichText({
                size:22,
                maxWidth:layBuff.width,
                lineHeight:34,
                family:G.defaultFNT,
                color:G.gc.COLOR.n5
            });
            if(!conf.tzid || conf.tzid == ""){
                str += '<br><font size=20>' + ' ' + '</font>';
                rh.text(str);
            }else{
                var tzConf = G.class.equip.getTaozhuangById(conf.tzid);
                var buffArr = G.class.equip.getTzBuffArrById(conf.tzid);

                str += '<br><font size=20 color='+ G.gc.COLOR.n9 + '>' + tzConf.tzname + '（1/' + tzConf.tzid.length + '）' + '</font>';
                buffArr = G.class.equip.getTzBuffArrById(conf.tzid);
                for (var i = 0; i < buffArr.length; i++) {
                    var buffConf = buffArr[i];
                    var buff = X.fmtBuff(buffConf[1]);
                    str += '<br><font color=' + G.gc.COLOR.n10 + '>' + buff[0].tip + '</font>';
                }
                str += '<br><font size=20>' + ' ' + '</font>';
                rh.text(str);
            }

            var offsetY = rh.trueHeight();
            rh.setPosition(cc.p(0,-15));
            // if(!me.DATA.tid){
            //     if(me.conf.usetype == undefined || me.conf.usetype != '2'){
            //         rh.setPosition(cc.p(0,panel.nodes.panel_3.height*(-1)));
            //         // panel.nodes.panel_3.height = 0;
            //     }
            // }
            panel.nodes.panel_bg.setContentSize( cc.size(panel.nodes.panel_bg.width,panel.nodes.panel_bg.height + offsetY + panel.nodes.panel_3.height + 20 - 100));
            ccui.helper.doLayout( panel.nodes.panel_bg);
            if (me.conf.usetype != undefined && me.conf.usetype == '2' || !me.DATA.tid || me.conf.usetype == '7'){
                layBuff.y -= 10;
                panel.finds("bg_1").height -= 60;
            }
            layBuff.y -= 10;
            layBuff.addChild(rh);

            if(!conf.tujing || conf.tujing.length < 1){
                btnHqtj.hide();
                panel.ui.finds("text_hqtj").hide();
                if(conf.itemid == "2016" || X.inArray([13], conf.usetype)) {
                    if(G.frame.beibao.isShow) {
                        var itemData = G.frame.beibao.DATA.item.list;
                        var lasttime;
                        for(var i in itemData) {
                            if(itemData[i].itemid == conf.itemid) {
                                lasttime = itemData[i].etime || itemData[i].lasttime;
                                break;
                            }
                        }
                        panel.ui.finds("text_hqtj").show();
                        panel.ui.finds("text_hqtj").setString("00:00:00");
                        if (lasttime < G.time) {
                            G.ajax.send("item_remove", [conf.itemid], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    X.uiMana.closeAllFrame();
                                }
                            });
                        } else {
                            var toTime = conf.itemid == "2016" ? lasttime + 8 * 24 * 3600 : lasttime;
                            X.timeout(panel.ui.finds("text_hqtj"), toTime, function () {
                                G.ajax.send("item_remove", [conf.itemid], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        X.uiMana.closeAllFrame();
                                    }
                                });
                            });
                        }
                    }
                }
                if(X.inArray([5, 8], conf.usetype)) {
                    if(G.frame.beibao.isShow) {
                        var itemData = G.frame.beibao.DATA.item.list;
                        var lasttime;
                        for(var i in itemData) {
                            if(itemData[i].itemid == conf.itemid) {
                                lasttime = itemData[i].etime;
                                break;
                            }
                        }
                        panel.ui.finds("text_hqtj").show();
                        panel.ui.finds("text_hqtj").setString("00:00:00");
                        if(lasttime < G.time) {
                            G.ajax.send("item_delexpire", [conf.usetype], function (d) {
                                if (!d) return;
                                var d = JSON.parse(d);
                                if (d.s == 1) {
                                    X.uiMana.closeAllFrame();
                                }
                            })
                        }else {
                            X.timeout(panel.ui.finds("text_hqtj"), lasttime, function () {
                                G.ajax.send("item_delexpire", [conf.usetype], function (d) {
                                    if (!d) return;
                                    var d = JSON.parse(d);
                                    if (d.s == 1) {
                                        X.uiMana.closeAllFrame();
                                    }
                                })
                            })
                        }
                    }
                }
            }else{
                btnHqtj.show();
                panel.ui.finds("text_hqtj").show();
            }
            if(me.item.frame && me.item.frame == "xuyuanchi"){
                function f(num){
                    var str = num.toString();
                    var arr = str.split(".");
                    var gl = "";
                    if(arr.length < 2){
                        gl += arr[0] + ".00";
                    }else{
                        var str1 = "";
                        if(arr[1].length < 2){
                            str1 += arr[1] += "0";
                        }else{
                            str1 += arr[1].substring(0, 2);
                        }
                        gl += arr[0] + "." + str1;
                    }
                    return gl;
                }
                btnHqtj.hide();
                panel.ui.finds("text_hqtj").show();
                panel.ui.finds("text_hqtj").setString(X.STR(L("GL"), f(me.item.p / me.item.sum * 100)))
            }
            btnHqtj.click(function (sender, type) {
                sender.setTouchEnabled(false);
                var btn_h = 0;
                if(me.btn_num > 0 && (me.DATA.bagtype == "2" || me.DATA.bagtype == '3')){
                    btn_h = me._view.nodes.panel_3.height + 20;
                }
                var y = offsetY > 150 ? offsetY + 100 : 150;
                var add = 0;
                if(((me.conf.tzid == "" && me.conf.color < 4) || me.conf.usetype == "1") && !G.frame.tiejiangpu.isShow){
                    add = 50;
                }
                if(!me.go){
                    var up = cc.moveBy(0.1, 0, y / 2 + add - 16);
                    var goUp= cc.spawn(up, cc.callFunc(()=>{
                        sender.setTouchEnabled(true);
                        new X.bView("zhuangbei_tip2.json", function (node) {
                            X.autoInitUI(node);
                            me.go = node.nodes.panel_bg.clone();
                            me.go.setAnchorPoint(0.5,1);
                            var bg = me._view.nodes.panel_bg.finds('bg_1');
                            if(G.frame.beibao.isShow && G.frame.beibao._curType != '2'){
                                me.go.setPosition(me._view.nodes.panel_bg.width / 2 + 3,0);
                            }else{
                                me.go.setPosition(me._view.nodes.panel_bg.width / 2 + 3,45);
                            }
                            
                            me._view.nodes.panel_bg.addChild(me.go);
                            me.setGo(conf);

                            var action1 = cc.moveBy(0.3, 0, -14 - btn_h);
                            me.go.runAction(action1);
                        });
                    }));
                    me.nodes.panel_nr.runAction(goUp);
                }else{
                    me.go.removeFromParent(true);
                    delete me.go;
                    var down = cc.moveTo(0.1, cc.p(me.nodes.panel_nr.x, me.ui.height / 2));
                    var goDown= cc.sequence(down, cc.callFunc(()=>{
                        sender.setTouchEnabled(true);
                    }));
                    me.nodes.panel_nr.runAction(goDown);
                }
            })
        },
        setGo: function(conf){
            var me = this;
            var btnArr = [];
            for(var i = 0; i < conf.tujing.length; i ++){
                var btn = G.class.setTZ(conf.tujing[i]);
                btnArr.push(btn);
            }
            btnArr.sort(function (a, b) {
                return a.is > b.is ? -1 : 1;
            });
            X.autoInitUI(me.go);
            me.go.nodes.btn_hqtj.hide();
            X.center(btnArr, me.go.nodes.panel_ico);
        },
        setBtns: function () {
            var me = this;

            // usetype
            // 1 可使用礼包类型道具
            // 2 不可使用道具
            // 3 可合成饰品碎片
            // 4 可合成英雄碎片

            var panel = me._view;
            var layBtns = panel.nodes.panel_3;

            layBtns.removeAllChildren();

            if (!me.DATA.tid) {
                return;
            }
            if (me.conf.back && me.conf.back.prize.length > 0) {
                panel.nodes.btn_cz.show();
                panel.nodes.btn_cz.click(function () {

                    G.frame.shipin_back.data({
                        id: me.conf.id
                    }).show();
                    me.remove();
                });
            }

            if (me.conf.usetype != undefined && (me.conf.usetype == '2' || me.conf.usetype == '7')) {
                return;
            }

            var btnsState = me.getBtnsState();

            var btnArr = [];

            switch (me.DATA.a) {
                case 'equip':
                    btnArr.push(btnsState.chushou());
                    break;
                case 'item':
                    if (X.inArray([1, 6, 11, 13, 14], me.conf.usetype)) {
                        if (me.conf.hcnum) {
                            btnArr.push(btnsState.hecheng());
                        } else {
                            btnArr.push(btnsState.shiyong());
                        }
                    } else if (me.conf.usetype == '3' || me.conf.usetype == '12') {
                        btnArr.push(btnsState.hecheng());
                    } else if (me.conf.usetype == '4') {
                        if (me.conf.hchero) {
                            btnArr.push(btnsState.xiangqing());
                        }
                        btnArr.push(btnsState.hecheng());
                    } else if(me.conf.tiaozhuanid) {
                        btnArr.push(btnsState.qushiyong());
                    }
                    break;
                case 'shipin':
                    btnArr.push(btnsState.chushou());
                    break;
                default:
                    break;
            }
            for (var i = 0; i < btnArr.length; i++) {
                var btn = btnArr[i];
                btn.setTitleFontName(G.defaultFNT);
                btn.setTitleFontSize(24);
                btn.setTitleColor(cc.color(G.gc.COLOR[me.conf.tiaozhuanid ? "n13" : "n12"]));
                var intervalWidth = (layBtns.width - (btnArr.length * btn.width)) / (btnArr.length + 1);
                btn.setPosition(cc.p((intervalWidth + btn.width / 2) * (i + 1) + btn.width / 2 * i, layBtns.height / 2));
                layBtns.addChild(btn);
            }
			me.btn_num = btnArr.length;
			X.autoInitUI(me.ui);
        },
        showItemInfo: function (item) {
            var me = this;

            item.setTouchEnabled(true);
            item.setSwallowTouches(false);
            item.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE){
                    if(item.data && item.data.a == "hero") {
                        G.frame.yingxiong_jianjie.data({
                            id: item.data.t
                        }).show()
                    }else if(item.data && item.data.a == "glyph") {
                        if(item.data.tid) {
                            G.frame.diaowen_dwxq.data({
                                id: item.data.tid
                            }).show();
                        }
                    }else if(item.data && item.data.a == "wuhun"){
                        var conf = G.gc.wuhun[item.data.t][1];
                        G.frame.wuhun_tips.data({
                            data:conf,
                            whid:item.data.t,
                            whlv:1
                        }).show();
                    } else if (!item.data.tid && item.conf && item.conf.usetype == '9') {
                        G.frame.usebox.data(sender.conf).show();
                    }else if (!item.data.tid && item.conf && item.conf.usetype == '15') {
                        G.frame.usebox_new.data(sender).show();
                    }else if (!item.data.tid && item.conf && (item.conf.usetype == '16' || item.conf.usetype == '17')) {
                        G.frame.tip_baoxiang.data({item:item.data, xianshi:true}).show();
                    }else if (item.data.a == "pet") {
                        G.frame.sc_xq.data(item.data).show();
                    }else{
                        if (item.data.spid && item.data.tid && item.data.color == 5 && item.data.star == 6) {
                            G.frame.shipin_jx.data(item.data).show();
                        } else {
                            me.data(item).show();
                        }
                    }

                }
            });
        },
        getBtnsState: function () {
            var me = this;
            var state = {
                chushou: function () {
                    var conf = me.conf;
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn2_on.png';
                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText((me.conf.color == 5 && me.DATA.a == "shipin") ? L("FJ") :
                        (me.conf.color == 5 ? me.conf.star == 6 && !me.conf.colorlv ? L("SHENGJIE") : L("QD") :
                            L('BTN_CHUSHOU')));
                    btn.setName('btn_chushou$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if(me.conf.color == 5  && (me.DATA.a == "shipin" || me.DATA.spid)) {
                                G.frame.shipin_fenjie.data({tid:me.DATA.tid, data:me.DATA}).show();
                            } else {
                                if (me.conf.color == 5) {
                                    if (me.conf.star == 6 && !me.conf.colorlv) {
                                        G.frame.equip_step.data({
                                            id: me.conf.id
                                        }).show();
                                        me.remove();
                                    } else {
                                        me.remove();
                                    }
                                } else {
                                    G.frame.iteminfo_plhandle.data({tid:me.DATA.tid,data:me.DATA}).show();
                                }
                            }
                        }
                    });

                    return btn;
                },
                shiyong: function () {
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn2_on.png';
                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText(L('BTN_SHIYONG'));
                    btn.setName('btn_shiyong$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            G.frame.iteminfo_plhandle.data({tid: me.DATA.tid,data:me.DATA}).show();
                        }
                    });

                    return btn;
                },
                hecheng: function () {
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn2_on.png';
                    var txt = L('BTN_HECHENG');
                    if(me.conf.hchero && me.DATA.num < me.conf.hcnum * 1 && me.conf.star == 5 && P.gud.lv >= 145) {
                        txt = L("zhuanhuan");
                        btn.zh = true;
                    }

                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText(txt);
                    btn.setName('btn_hecheng$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            if(sender.zh) {
                                G.frame.alert.data({
                                    sizeType: 3,
                                    cancelCall: null,
                                    okCall: function () {
                                        me.ajax("item_change", [me.conf.itemid], function (str, data) {
                                            if(data.s == 1) {
                                                G.frame.jiangli.data({
                                                    prize: data.d.prize
                                                }).show();
                                                me.remove();
                                                G.frame.yingxiong._panels && G.frame.yingxiong._panels.refreshPanel && G.frame.yingxiong._panels.refreshPanel();
                                            }
                                        });
                                    },
                                    richText: L("ZHSP"),
                                }).show();

                                return;
                            }

                            me.DATA.sumNum = (me.DATA.num / me.DATA.hcnum) >> 0;
                            if(me.DATA.num < me.DATA.hcnum){
                                G.tip_NB.show(L("SLBZ"));
                                return;
                            }
                            if(parseInt(me.DATA.num / me.DATA.hcnum) == 1){
                                var list = G.DATA.yingxiong.list;
                                var keys = X.keysOfObject(list);
                                if(keys.length + 1 > G.DATA.heroCell.maxnum && me.DATA.usetype == "12"){
                                    G.frame.alert.data({
                                        sizeType: 3,
                                        cancelCall: null,
                                        okCall: function () {
                                            G.frame.yingxiong.btnArr[0].triggerTouch(ccui.Widget.TOUCH_ENDED);
                                        },
                                        richText: L("YXLBYM"),
                                    }).show();
                                }else{
                                    G.ajax.send('item_use',[me.DATA.itemid,1],function(d) {
                                        if(!d) return;
                                        var d = JSON.parse(d);
                                        if(d.s == 1) {
                                            if (d.d.prize) {
                                                G.frame.jiangli.data({
                                                    prize:[].concat(d.d.prize),
                                                    mapItem:function (item) {
                                                        item.txt_num.setString('x'+item.data.n);
                                                    },
                                                    isAni: true
                                                }).once('show', function () {
                                                    me.remove();
                                                    X.audio.playEffect("sound/yingxionghecheng.mp3", false);
                                                    G.frame.yingxiong._panels && G.frame.yingxiong._panels.refreshPanel && G.frame.yingxiong._panels.refreshPanel();
                                                    G.frame.beibao._panels && G.frame.beibao._panels.refreshPanel && G.frame.beibao._panels.refreshPanel();
                                                }).show();
                                            }
                                        }
                                    },true);
                                }
                            }else{
                                me.DATA._type = "3";
                                G.frame.iteminfo_plhandle.data({tid: me.DATA.tid,data:me.DATA}).show();
                            }

                        }
                    });

                    return btn;
                },
                xiangqing: function () {
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn2_on.png';
                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText(L('BTN_XIANGQING'));
                    btn.setName('btn_xiangqing$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {
                            // G.frame.iteminfo_plhandle.data({tid: me.DATA.tid,data:me.DATA}).show();
                            var hid = G.class.getItem(me.DATA.itemid).hchero;
                            G.frame.yingxiong_xxxx.data({
                                // uid: P.gud.uid,
                                tid:hid,
                                list:[],
                                frame:'yingxiong_tujian',
                            }).show();
                        }
                    });

                    return btn;
                },
                qushiyong: function () {
                    var btn = new ccui.Button();
                    var img = 'img/public/btn/btn1_on.png';
                    btn.loadTextures(img, '', '', 1);
                    btn.setTitleText(L('BTN_QSY'));
                    btn.setName('btn_qushiyong$');
                    btn.touch(function (sender, type) {
                        if (type == ccui.Widget.TOUCH_ENDED) {

                            X.tiaozhuan(me.conf.tiaozhuanid);
                            G.frame.iteminfo.remove();
                        }
                    });

                    return btn;
                }
            };

            return state;
        }
    });

    G.frame[ID] = new fun('panel_nr.json', ID);
})();