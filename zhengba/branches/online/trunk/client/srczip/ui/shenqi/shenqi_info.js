    /**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //神器信息
    var ID = 'shenqi_info';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.shenbing.click(function(sender, type){
                G.frame.shenqi_xq1.data({
                    id: me.curId,
                }).show();
            });

            me.nodes.btn_wz.touch(function(sender, type){
                if(type == ccui.Widget.TOUCH_ENDED){
                 G.frame.shenqi_xq1.data({
                    id: me.curId,
                }).show();                   
               }
           });

            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.ui.finds('btn_tulong').click(function(){
                G.frame.shenqi.show();
                // me.remove();
            });
            me.ui.finds("btn_tanxian").click(function () {
                G.frame.tanxian.show();
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.defNr2 = me.ui.finds("bg2").getSize();  
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.isActive = 0;
            me.curId = me.data().id;
            me.DATA = G.frame.shenqi.DATA.task;
            me.conf = G.class.shenqi.getComById(me.curId);
            me.task = G.class.shenqi.getTaskById(me.curId);
            me.setContents();
            me.ui.setTimeout(function () {
                G.guidevent.emit("shenqi_infoOpenOver");
            }, 300);
            me.ui.finds("shenbing").getChildByTag(7456) && me.ui.finds("shenbing").getChildByTag(7456).removeFromParent();
            G.class.ani.show({
                json: "ani_shenbing_bg",
                addTo: me.ui.finds("shenbing"),
                x: me.ui.finds("shenbing").width / 2,
                y: 102,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.zIndex = -20;
                    node.setTag(7456);
                }
            })
        },
        onHide: function () {
            var me = this;
            G.hongdian.getData("artifact", 1);
        },
        setContents: function () {
            var me = this;

            me.setSkill();
            me.setJDT();
            me.setTask();
            me.showToper();
            if(P.gud.artifact >= me.curId) {
                me.nodes.liebiao_neirong.hide();
                me.nodes.liebiao_neirong2.show();
                me.nodes.shenbingwz.loadTexture("img/shenbing/wz6.png", 1);
                me.nodes.panel_hx1.finds("txt_sz1$").setString(L("atk") + "+" + G.class.shenqi.getBuffByIdAndLv(me.curId, 1).buff.atk);
                me.ui.finds("panel_hx1$_0").finds("txt_sz1$").setString(L("hp") + "+" + G.class.shenqi.getBuffByIdAndLv(me.curId, 1).buff.hp);
            }else {
                me.nodes.shenbingwz.loadTexture("img/shenbing/wz"+ me.curId +".png", 1);
                me.nodes.liebiao_neirong.show();
                me.nodes.liebiao_neirong2.hide();
            }
        },
        setSkill: function () {
            var me = this;
            var conf = G.class.shenqi.getSkillByIdAndDj(me.curId, 0);
            var str1 = "<font node=1></font>  " + conf.skillname;
            var img = new ccui.ImageView("ico/skillico/" + conf.skillico + ".png", 0);
            var btn_wz = me.nodes.btn_wz;
            var wz = btn_wz.getChildren()[0];
            wz.setTouchEnabled(false);
            img.setScale(.44);
            var str2 = conf.intr;
            var str = '<font color=#ffe983>' + me.conf.name + '</font>';        
            me.createRh(str,wz);

            var rh1 = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.neirong1.width,
                lineHeight: 31,
                color: "#ffeae0",
                family: G.defaultFNT
            });
            rh1.text(str1, [img]);
            rh1.setAnchorPoint(0, 0.5);
            rh1.setPosition(2, me.nodes.neirong1.height / 2 - 5);
            me.nodes.neirong1.removeAllChildren();
            me.nodes.neirong1.addChild(rh1);

            var rh2 = new X.bRichText({
                size: 20,
                maxWidth: me.nodes.neirong2.width,
                lineHeight: 15,
                color: "#ffd2b0",
                family: G.defaultFNT
            });
            rh2.text(str2);
            rh2.setAnchorPoint(0, 1);
            rh2.setPosition(0, me.nodes.neirong2.height);
            me.nodes.neirong2.removeAllChildren();
            me.nodes.neirong2.addChild(rh2);
            me.ui.finds("bg2").setContentSize(me.defNr2);
            if(rh2.height > me.nodes.neirong2.height) {
                me.ui.finds("bg2").setContentSize(cc.size(me.ui.finds("bg2").width,me.ui.finds("bg2").height + (rh2.height - me.nodes.neirong2.height)));
            }
            me.nodes.shenbing.getChildByTag(7456) && me.nodes.shenbing.getChildByTag(7456).removeFromParent();
            G.class.ani.show({
                json: "shenbing_0" + me.curId,
                addTo: me.nodes.shenbing,
                x: me.nodes.shenbing.width / 2,
                y: me.nodes.shenbing.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    var act1 = cc.moveBy(1, 0, 10);
                    var act2 = cc.moveBy(1, 0, -10);
                    var act = cc.sequence(act1, act2);
                    node.setTag(7456);
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
        setJDT: function () {
            var me = this;
            var isOk = 0;
            var data = me.DATA;
            var task = me.task;
            var keys = X.keysOfObject(task);

            if(P.gud.artifact < me.curId || !P.gud.artifact) {
                for(var i = 0; i < keys.length; i ++) {
                    if(data[keys[i]] && data[keys[i]].finish == me.curId){
                        isOk ++;
                    }
                }
                me.isActive = isOk;
                me.nodes.txt2.setString(isOk + "/" + keys.length);
                me.nodes.jdt.setPercent(isOk / keys.length * 100);
            }else {
                if(me.isActive == keys.length - 1) {
                    me.nodes.txt2.setString(keys.length + "/" + keys.length);
                    me.nodes.jdt.setPercent(100);
                    if(me.curId == 5) {
                        //所有神器激活动画
                        G.frame.jiangli.once("hide", function () {
                            G.class.ani.show({
                                json: "ani_shenbing_jihuo",
                                addTo: me.ui,
                                x: me.ui.width / 2 - 40,
                                y: me.ui.height / 2,
                                repeat: false,
                                autoRemove: true,
                                onload: function(node, action) {
                                    node.setTag(7456);
                                    node.finds("shenqi").setBackGroundImage("img/shenbing/shenbing_wq_0" + me.curId + ".png", 0);
                                },
                                onend: function (node, action) {
                                    G.frame.shenqi_list.show();
                                    me.ui.setTimeout(function () {
                                        me.remove();
                                    }, 1000);

                                }
                            });
                        });
                    }else {
                        //神器激活动画
                        G.frame.jiangli.once("hide", function () {
                            G.class.ani.show({
                                json: "ani_shenbing_jihuo",
                                addTo: me.ui,
                                x: me.ui.width / 2 - 40,
                                y: me.ui.height / 2,
                                repeat: false,
                                autoRemove: true,
                                onload: function (node, action) {
                                    node.zIndex = 999;
                                    node.finds("shenqi").setBackGroundImage("img/shenbing/shenbing_wq_0" + me.curId + ".png", 0);

                                    if(P.gud.artifact >= me.curId) {
                                        me.nodes.liebiao_neirong.hide();
                                        me.nodes.liebiao_neirong2.show();
                                        me.nodes.shenbingwz.loadTexture("img/shenbing/wz6.png", 1);
                                        me.nodes.panel_hx1.finds("txt_sz1$").setString(L("atk") + "+" + G.class.shenqi.getBuffByIdAndLv(me.curId, 1).buff.atk);
                                        me.ui.finds("panel_hx1$_0").finds("txt_sz1$").setString(L("atk") + "+" + G.class.shenqi.getBuffByIdAndLv(me.curId, 1).buff.hp);
                                    }else {
                                        me.nodes.shenbingwz.loadTexture("img/shenbing/wz"+ me.curId +".png", 1);
                                        me.nodes.liebiao_neirong.show();
                                        me.nodes.liebiao_neirong2.hide();
                                    }
                                },
                            });
                        });
                    }
                }else if(me.isActive == 0){
                    me.nodes.txt2.setString(L("yjh"));
                    me.nodes.jdt.setPercent(100);
                }
            }
        },
        setTask: function() {
            var me = this;
            var data = me.DATA;
            var task = me.task;
            var keys = X.keysOfObject(task);
            var arr = [];

            for(var i = 0; i < keys.length; i ++) {
                var taskclone = X.clone(task[keys[i]]);
                taskclone['typeid'] = keys[i];
                arr.push(taskclone);
            }

            arr.sort(function (a, b) {
                return a.p > b.p;
            });

            for(var i = 0; i < arr.length; i ++) {
                var curtask = arr[i];
                me.setItem(curtask, data[curtask.typeid], curtask.typeid, i);
            }
        },
        setItem: function (conf, data, index, idx) {
            var me = this;
            var list = me.nodes.list.clone();

            X.autoInitUI(list);

            var item = G.class.sitem(conf.prize[0]);
            item.setPosition(list.finds("ico").width / 2, list.finds("ico").height / 2);
            list.finds("ico").addChild(item);

            if(P.gud.artifact >= me.curId) {
                list.finds("Text_27").setString(X.STR(conf.title, conf.val, conf.val));
                list.nodes.btn1_on.show();
                list.nodes.btn2_on.hide();
                list.nodes.btn1_on.setBright(false);
                list.nodes.btn1_on.setTouchEnabled(false);
                list.nodes.btn1_on.finds("txt1").setTextColor(cc.color("#6c6c6c"));
            }else {
                list.finds("Text_27").setString(X.STR(conf.title,
                    data ? (data.val > conf.val ? conf.val : data.val) : 0, conf.val));
                if(!data){
                    data = {};
                    data.val = 0;
                }
                if(data.val >= conf.val) {
                    list.nodes.btn1_on.show();
                    list.nodes.btn2_on.hide();
                    G.setNewIcoImg(list.nodes.btn1_on, .95);
                    list.nodes.btn1_on.setBright(data.finish == me.curId ? false : true);
                    list.nodes.btn1_on.setTouchEnabled(data.finish == me.curId ? false : true);
                    data.finish == me.curId ? G.removeNewIco(list.nodes.btn1_on) : G.setNewIcoImg(list.nodes.btn1_on, .95);
                    list.nodes.btn1_on.finds("txt1").setTextColor(cc.color(data.finish == me.curId ? "#6c6c6c" : "#2f5719"));
                }else {
                    list.nodes.btn1_on.hide();
                    list.nodes.btn2_on.show();
                }
            }

            list.nodes.btn2_on.click(function () {
                X.tiaozhuan(conf.toid);
                me.remove();
                G.frame.shenqi.remove();
            });

            if(idx == 0) G.frame.shenqi_info.nodes.btnfirst = list.nodes.btn1_on;
            if(index == "maxmap") G.frame.shenqi_info.nodes.btn_tanxian = list.nodes.btn2_on;

            list.nodes.btn1_on.click(function () {

                G.ajax.send('artifact_receive', [index, me.curId], function (d) {
                    if (!d) return;
                    var d = JSON.parse(d);
                    if (d.s == 1) {
                        G.frame.jiangli.data({
                            prize: d.d.prize
                        }).show();
                        G.frame.shenqi.getData(function () {
                            me.DATA = G.frame.shenqi.DATA.task;
                            me.setJDT();
                            me.setItem(conf, me.DATA[index], index, idx);
                        });
                    }
                }, true);
            });
            list.show();
            list.setPosition(0, 0);
            me.nodes["liebiao" + (idx + 1)].removeAllChildren();
            me.nodes["liebiao" + (idx + 1)].addChild(list);
        }
    });
    G.frame[ID] = new fun('shenbing_2.json', ID);
})();