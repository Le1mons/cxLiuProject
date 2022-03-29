/**
 * Created by wfq on 2018/6/1.
 */

G.event.on('herochange_over', function () {
    G.hongdian.checkRongHe();
    if(G.frame.yingxiong_hecheng.isShow) {
        G.frame.yingxiong_hecheng.checkzzRedPoint();
    }
});

(function () {
    //融合祭坛-英雄合成
    var ID = 'yingxiong_hecheng';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;

            // me.ui.nodes.tip_title.setBackGroundImage(X.getTitleImg('rhjt'),1);
        },
        bindBTN: function () {
            var me = this;

            // me.ui.finds('$btn_fanhui').click(function(sender,type){
            //     G.frame.yingxiong_xxxx.remove();
            // });
            

        },
        onOpen: function () {
            var me = this;
            me.curzz = 0;
            X.audio.playEffect("sound/openjitan.mp3");
            me.fillSize();
            me.initUi();
            me.bindBTN();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.showToper();
            // me.showMainMenu();
            new X.bView('ronghejitan.json', function (view) {
                me._view = view;

                // me.ui.removeAllChildren();
                me.ui.addChild(view);
                me._view.finds("btn_bangzhu").click(function () {
                    G.frame.help.data({
                        intr:L("TS15")
                    }).show();
                });
                me.selectedData = {};
                me.YXZ = {};
                G.class.ani.show({
                    addTo:me._view.finds("ditu"),
                    x:me._view.finds("ditu").width / 2,
                    y:me._view.finds("ditu").height / 2,
                    json:"ani_ronghejitan_hecheng",
                    repeat:true,
                    autoRemove:false,
                    onload: function (node, action) {
                        me.action = action;
                        action.play("daiji", true);
                    }
                });
                me.createMenu();
                me.setContents();
                me.checkzzRedPoint();
                view.nodes.Panel_dj.show();
                view.action.playWithCallback("ronghe_jinru", false, function () {
                    view.ui.finds("img_zzzbg").hide();
                    view.nodes.btn_tishi.loadTextureNormal('img/zhuangbei/btn_laiyuan.png',1);
                    me.table._table.tableView.getChildren()[0].getChildren()[0].getChildren()[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                    view.action.playWithCallback("wait", false);
                });
            }, {action: true});
        },
        checkzzRedPoint: function(){
            var me = this;
            var isHave = false;
            var redArr = G.hongdian.checkRongHe();
            for(var i = 0; i < redArr.length; i ++){
                if(redArr[i]) {
                    G.setNewIcoImg(me._view.nodes.listview_zz.getChildren()[i + 1]);
                }else {
                    G.removeNewIco(me._view.nodes.listview_zz.getChildren()[i + 1]);
                }
            }
            for(var i in redArr) {
                if(redArr[i]) {
                    isHave = true;
                    break;
                }
            }
            if(isHave) {
                G.setNewIcoImg(me._view.nodes.listview_zz.getChildren()[0]);
            }else {
                G.removeNewIco(me._view.nodes.listview_zz.getChildren()[0]);
            }
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("hecheng", 1);
        },
        setContents: function () {
            var me = this;

            var type = me.curType || 0;
            me._menus[type].triggerTouch(ccui.Widget.TOUCH_ENDED);
        },
        refreshData: function () {
            var me = this;

            me.setContents();
        },
        createMenu: function(){
            var me = this;

            var view = me._view;
            view.nodes.listview_zz.removeAllChildren();
            cc.enableScrollBar(view.nodes.listview_zz);
            me._menus = [];

            //图标
            for(var i=0;i<7;i++){
                var panel = view.nodes.listview_zz;
                view.nodes.list_ico.setScale(0.95);
                var list_ico = view.nodes.list_ico.clone();
                X.autoInitUI(list_ico);
                list_ico.nodes.panel_zz.setTouchEnabled(false);
                list_ico.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (i + 1) + '.png', 1);
                list_ico.show();
                list_ico.setAnchorPoint(0.5,0.5);

                list_ico.data = i;
                list_ico.setTouchEnabled(true);

                list_ico.click(function(sender, type){
                    for(var j=0;j<me._menus.length;j++){
                        var node = me._menus[j];
                        var img = 'img/public/ico/ico_zz' + (node.data + 1) + '.png';
                        if(node.data == sender.data){
                            if(me.effect) X.audio.playEffect("sound/dianji.mp3", false);
                            me.effect = true;
                            me.curType = sender.data;
                            me.fmtItemList(sender.data);
                            img = 'img/public/ico/ico_zz' + (node.data + 1) + '_g.png';
                            if(sender.ani) {
                                sender.ani.show();
                            }else {
                                G.class.ani.show({
                                    json: "ani_guangbiaoqiehuan",
                                    addTo: sender,
                                    x: sender.width / 2,
                                    y: sender.height / 2,
                                    repeat: true,
                                    autoRemove: false,
                                    onload: function (node) {
                                        sender.ani = node;
                                    }
                                })
                            }
                        }else{
                            //node.nodes.img_yuan_xz.hide();
                            if(node.ani) node.ani.hide();
                        }
                        node.nodes.panel_zz.setBackGroundImage(img,1);
                    }
                });
                view.nodes.btn_fanhui.click(function(sender, type){
                    me.remove();
                });

                me._menus.push(list_ico);
                panel.pushBackCustomItem(list_ico);
            }
        },
        fmtItemList: function (type) {
            var me = this;

            var panel = me._view;
            var scrollview = panel.nodes.scrollview_1;
            scrollview.removeAllChildren();
            cc.enableScrollBar(scrollview);
            panel.nodes.list.hide();

            var data = me.filterData();
            me.sortData(data);

            var table = me.table = new X.TableView(scrollview,panel.nodes.list,5, function (ui, data) {
                me.setItem(ui, data);
            }, null, null, 1, 5);
            table.setData(data);
            table.reloadDataWithScroll(true);


            //第一次默认指定
            if (me.curzz != type) {
                me.curzz = type;
                me.table._table.tableView.getChildren()[0].getChildren()[0].getChildren()[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
            } else {
                if(me.curItem) {
                    me.curItem.triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                }else {
                    me.table._table.tableView.getChildren()[0].getChildren()[0].getChildren()[0].triggerTouch(ccui.Widget.TOUCH_NOMOVE);
                }
            }
        },
        filterData: function () {
            var me = this;

            var curType = me.curType;
            var data = G.class.hero.getCanHcHerosByZhongzu(curType);

            return data;
        },
        sortData: function (data) {
            var me = this;

            data.sort(function (a,b) {
                var confA = G.class.hero.getById(a);
                var confB = G.class.hero.getById(b);

                if (confA.star != confB.star) {
                    return confA.star < confB.star ? -1 : 1;
                } else if (confA.zhongzu != confB.zhongzu) {
                    return confA.zhongzu < confB.zhongzu ? -1 : 1;
                }
            });
        },
        setItem: function (ui, data) {
            var me = this;

            ui.removeAllChildren();

            var wid = G.class.shero(data);
            wid.setName('wid');
            wid.setPosition(cc.p(ui.width / 2,ui.height / 2));
            wid.setScale(.9);
            ui.addChild(wid);

            me.checkRedPoint(data, wid);

            me.handleHeros(me.curId);

            ui.data = data;
            ui.heroData = wid;
            ui.setTouchEnabled(true);
            ui.setSwallowTouches(false);
            ui.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_NOMOVE) {
                    // if(sender.data == me.curId) return;
                    me.curItem = sender;
                    me.curId = sender.data;
                    me.curHero = sender.heroData;
                    me.selectedData = {};
                    me.handleHeros(me.curId);
                    me.setTop();
                }
            });
        },
        checkRedPoint: function(hid, wid){
            if(X.checkRongHe(hid)) {
                G.setNewIcoImg(wid, .9);
                G.class.ani.show({
                    json: "ani_shengxingzhunbei",
                    addTo: wid,
                    x: wid.width / 2,
                    y: wid.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setTag(998877);
                        // node.setScale(.9);
                    }
                })
            }
            else {
                G.removeNewIco(wid);
                while (wid.getChildByTag(998877)) {
                    wid.getChildByTag(998877).removeFromParent();
                }
            }
        },
        handleHeros: function (id) {
            var me = this;

            var parent = me.table._table.tableView.getChildren()[0];
            for (var i = 0; i < parent.getChildren().length; i++) {
                var children = parent.getChildren()[i];
                for (var j = 0; j < children.getChildren().length; j++) {
                    var child = children.getChildren()[j];
                    cc.isNode(child.finds('wid')) && child.finds('wid').setGou(child.data == id);
                }
            }
        },
        setTop: function () {
            var me = this;

            me.setRwBg();

            var panel = me._view;
            me.btnHc = panel.nodes.btn_hc;
            var lay0 = panel.nodes.panel_9;
            var lay1 = panel.nodes.panel_10;
            var lay2 = panel.nodes.panel_11;
            var lay3 = panel.nodes.panel_12;
            var btnTs = panel.nodes.Panel_dj;
            var layRw = panel.nodes.panel_rw;
            var curId = me.curId;
            var conf = G.class.hero.getById(curId);
            //layRw.setOpacity(255 * 0.5);

            me.btnHc.setBtnState(false);
            me.btnHc.setTitleColor(cc.color(G.gc.COLOR.n15));

            //设置材料
            var needConf = X.clone(G.class.hero.getHcNeed(curId));
            // var needConf = {
            //     mainhero:{a:'hero',t:'25075',n:2},
            //     delhero:[{a:'hero',t:'25075',n:2},{a:'hero',t:'25075',n:2}],
            //     chkhero:[{samezhongzu:1,star:6,num:2}]
            // };
            me.needNum = 0;
            var extNeed;
            if(needConf.delhero[1]) {
                extNeed = [needConf.mainhero,needConf.delhero[0],needConf.delhero[1],needConf.chkhero[0]];
            }else {
                extNeed = [needConf.mainhero,needConf.delhero[0],needConf.chkhero[0],needConf.chkhero[1]];
            }
            me.layArr = [lay0,lay1,lay2,lay3];
            me.extArr = [];
            me.extNeed = extNeed;
            for (var i = 0; i < me.layArr.length; i++) {
                var lay = me.layArr[i];
                lay.removeAllChildren();
                me.setMaterial(lay,extNeed[i],i);
                me.needNum += (extNeed[i].n || extNeed[i].num)
            }

            //设置任务造型
            X.setHeroModel({
                parent:layRw,
                data:conf
            });

            //合成
            if(!me.btnHc.data) me.btnHc.data = [];
            me.btnHc.click(function (sender, type) {
                var obj = {
                    main:me.selectedData[0][0],
                    delhero: [].concat(me.selectedData[1], me.selectedData[2], me.selectedData[3])
                };
                me._view.nodes.btn_fanhui.setTouchEnabled(false);
                G.ajax.send('hero_hecheng',[me.curId,obj],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        X.audio.playEffect("sound/yingxionghecheng.mp3");
                        me.action.playWithCallback("hecheng", false, function () {
                            me.nodes.panel_rw.setOpacity(255);
                            layRw.getChildren()[0].runAni(0, "atk", false);
                            layRw.getChildren()[0].addAni(0, "wait", true, 0);
                            me.ui.setTimeout(function(){
                                G.frame.jiangli.once('close', function () {
                                    if (d.d.itemprize.length > 1) {
                                        G.frame.jiangli.data({
                                            prize:[].concat(d.d.itemprize || [])
                                        }).show();
                                    }
                                }).data({
                                    prize:[].concat(d.d.heroprize)
                                }).show();
                                me._view.nodes.btn_fanhui.setTouchEnabled(true);
                                me.refreshData();
                            },1500);
                            me.action.play("daiji", true);
                        });
                    }else{
                        me._view.nodes.btn_fanhui.setTouchEnabled(true);
                        X.audio.playEffect("sound/dianji.mp3", false);
                    }
                },true);
            }, 1500);
            //提示
            btnTs.touch(function (sender, type) {

                if (type == ccui.Widget.TOUCH_ENDED) {
                    G.frame.yingxiong_jianjie.data({
                        data:me.curData
                    }).show();
                }
            });
        },
        setMaterial: function (parent,need,idx) {
            var me = this;

            var widget = G.class.shero_extneed(need, {hid:need.t || me.curId});
            widget.setPosition(cc.p(parent.width / 2,parent.height / 2));
            widget.setEnabled(false);
            parent.addChild(widget);
            me.extArr.push(widget);

            need.num = need.num || need.n;

            var yx_num1 = need.samezhongzu && G.DATA.yingxiong.star2num[need.star];
            var yx_num2 = G.DATA.yingxiong.hid2num[need.t];
            if( yx_num1 && yx_num1 >= need.num){
                widget.setjia(false);
            }else if(yx_num2 && yx_num2 >= need.num){
                widget.setjia(false);
            }

            var needNum = need.num;
            widget.txt_num.setFontSize(24);
            widget.txt_num.setTextColor(cc.color("#ffffff"));
            X.enableOutline(widget.txt_num, "#000000", 2);
            widget.txt_num.setString(X.STR('{1}/{2}', 0, needNum));
            widget.txt_num.setPosition(cc.p(widget.width - widget.txt_num.width/2 -5, widget.height - widget.txt_num.height/2 - 5));
            //widget.lv.hide();

            widget.setTouchEnabled(true);
            widget.index = idx;
            widget.need = need;
            widget.click(function(sender,type){
                var callback = function (d, d1) {
                    //d是数组
                    me.selectedData[sender.index] = d;
                    var hav = d.length;
                    sender.txt_num.setString(X.STR('{1}/{2}', hav, sender.need.num));
                    sender.setEnabled(hav >= sender.need.num);

                    var shengyu_num = me.set_jia(me.extNeed);
                    for(var i=0; i<me.extArr.length; i++){
                        if(shengyu_num[i] > 0){
                            me.extArr[i].setjia(false);
                        }else{
                            me.extArr[i].setjia(true);
                        }
                    }

                    if(hav >= sender.need.num){
                        sender.setjia(true);
                    }else{
                        if(d1 && d1 >= sender.need.num) {
                            sender.setjia(false);
                        }else{
                            sender.setjia(true);
                        }
                    }

                    if (me.getSelectedTidArr().length >= me.needNum) {
                        me.btnHc.setBtnState(true);
                        me.btnHc.setTitleColor(cc.color(G.gc.COLOR.n12));
                    }

                    for (var i in me.extArr) {
                        var tar = me.extArr[i];
                        var arr = tar.txt_num.getString().split("/");

                        if(arr[0] * 1 >= arr[1] * 1) {
                            tar.setjia(true);
                        }
                    }
                };
                G.frame.ui_tip_xuanze.data({
                    need:sender.need,
                    idx:sender.index,
                    hid:me.curId,
                    IdxData:me.selectedData[sender.index],
                    selectedData: me.selectedData,
                    callback:callback
                }).show();
            });
        },
        //获得所有被选择的英雄的数组
        getSelectedTidArr: function () {
            var me = this;

            // selectedData分了位置
            var data = me.selectedData;
            var arr = [];
            if (!data) {
                return arr;
            }

            for (var pos in data) {
                var dd = data[pos];
                arr = arr.concat(dd);
            }

            return arr;
        },

        //
        set_jia: function(need){
            var me = this;
            var heroList = G.DATA.yingxiong.list;
            var keys = X.keysOfObject(heroList);

            var shengyu = [];

            for(var j = 0; j<need.length; j++){
                for(var i = 0; i < me.getSelectedTidArr().length; i ++){
                    if(!X.inArray(me.idxData, me.getSelectedTidArr()[i])){
                        keys.splice(X.arrayFind(keys, me.getSelectedTidArr()[i]), 1);
                    }
                }

                var num = 0;
                if(need[j].t){
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        if (heroList[tid].hid == need[j].t) {
                            ++num;
                        }
                    }
                }else if(need[j].star){
                    var needStar = need[j].star;
                    for (var i = 0; i < keys.length; i++) {
                        var tid = keys[i];
                        if (heroList[tid].zhongzu == G.class.hero.getById(me.curId).zhongzu && heroList[tid].star == needStar) {
                            ++num;
                        }
                    }
                }
                shengyu.push(num);
            }
            return shengyu;
        },


        setname: function(target, text, zz) {
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
        setRwBg: function () {
            var me = this;
            me.ui.finds("panel_top").finds("panel_zz$").setScale(.66);
            me.ui.finds("panel_top").finds("panel_zz$").setBackGroundImage('img/public/ico/ico_zz' + (me.curHero.conf.zhongzu + 1) + '.png', 1);
            G.class.ui_star(me.nodes.panel_xx, me.curHero.conf.star, 0.8, null, true);
            me.setname(me.nodes.txt_name,me.curHero.conf.name,me.ui.finds("panel_top").finds("panel_zz$"));


            var data = G.class.hero.getById(me.curId);
            var star = G.class.hero.getById(me.curId).star;
            var maxlv = G.class.herocom.getMaxlv(me.curId, star);
            var herogrowConf = G.class.herogrow.getById(me.curId);
            var zhanli = G.class.herocom.getZhanli(me.curId,maxlv);
            var buffArr = ['atk','def','hp','speed'];
            var pro = G.class.herocom.getHeroJinJieUp(star);
            data.dengjielv = star;
            data.lv = maxlv;
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                data[buffType] = herogrowConf[buffType];
            }
            for (var i = 0; i < buffArr.length; i++) {
                var buffType = buffArr[i];
                data[buffType] = Math.floor((data[buffType] + (data.lv - 1) * herogrowConf[buffType + "_grow"]) * pro[buffType + "pro"]);
            }
            data.zhanli = parseInt(data.atk + data.def + data.hp / 6);
            me.curData = data;

            var buff = ["atk", "def", "hp", "speed"];
            for (var i = 0; i < buff.length; i ++) {
                var bf = buff[i];
                var txt = me._view.nodes["txt_sx" + (i + 1)];
                txt.setString(data[bf]);
            }
            me._view.ui.finds("txt_djmsz").setString(data.lv);
        }
    });

    G.frame[ID] = new fun('ui_tip6.json', ID);
})();