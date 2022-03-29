/**
 * Created by  on 2019//.
 */
(function () {
    //王者霸业
    G.class.wangzhezhaomu_by = X.bView.extend({
        ctor: function (data) {
            var me = this;
            me.preLoadRes = ["task.png", "task.plist"];
            me._data = data;
            me._super("event_chuanqibaye.json", null, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.scrollview);
            me.nodes.btn_bangzhu.click(function(){
                G.frame.help.data({
                    intr:(L("TS72"))
                }).show();
            });
            me.nodes.btn_jfjl.click(function () {
                G.frame.wangzhezhaomu_byprize.data(me.DATA).show();
            })
        },
        onShow: function () {
            var me = this;
            me.getData(function(){
                me.setContents();
                me.checkRedPoint();
            });
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function(){
            var me = this;
            me.showBox();
            //时间
            me.nodes.txt_count.setString(L("SYSJ"));
            if(me.DATA.info.etime - G.time > 24 * 3600 * 2) {
                me.nodes.txt_time.setString(X.moment(me.DATA.info.etime - G.time));
            }else {
                X.timeout(me.nodes.txt_time,me.DATA.info.etime,function () {
                    me.nodes.txt_time.setString(L("YJS"));
                })
            }
            //总积分
            // me.nodes.txt_jifen.setString(me.DATA.task.alljifen);
            //今日积分
            me.nodes.jifen_sz.setString(me.DATA.task.jifen);

            var data = [];
            me.taskData = me.DATA.info.data.openinfo.task.tasklist;
            for(var i in me.taskData){
                if(X.inArray(me.DATA.task.reclist,i)){//已领
                    me.taskData[i].order = 0;
                }else if(me.DATA.task.taskinfo[i] >= me.taskData[i].pval){
                    me.taskData[i].order = 2;
                }else {
                    me.taskData[i].order = 1;
                }
                data.push(me.taskData[i]);
            }
            data.sort(function(a,b){
                if(a.order != b.order){
                    return a.order > b.order ? -1:1;
                }else {
                    return a.stype*1 < b.stype*1 ? -1:1;
                }
            });
            if (!me.table) {
                me.table = new X.TableView(me.nodes.scrollview, me.nodes.panel_list, 1, function (ui, data) {
                    me.setItem(ui, data);
                });
                me.table.setData(data);
                me.table.reloadDataWithScroll(true);
            } else {
                me.table.setData(data);
                me.table.reloadDataWithScroll(false);
            }
        },
        setItem:function(ui,data){
            var me = this;
            ui.show();
            X.autoInitUI(ui);
            var str1 = X.STR(G.gc.wangzhezhaomu.task[data.stype].desc,data.pval) ;
            var str2 = X.STR('(<font color={1}>{2}</font>/{3})',me.DATA.task.taskinfo[data.taskid] >= data.pval? '#00a41f' : '#f55f46', me.DATA.task.taskinfo[data.taskid], data.pval);
            var rh = X.setRichText({
                parent:ui.nodes.wz_sm,
                str:str1 + str2,
                size:19
            });
            rh.setPosition(0, ui.nodes.wz_sm.height / 2 - rh.trueHeight() / 2);
            X.alignItems(ui.nodes.ico_item1,data.prize,"left",{
                touch:true
            });
            ui.nodes.hd_jf.setString(L("JF") + ":" + data.addjifen);

            //按钮状态
            ui.nodes.btn.setBtnState(true);
            G.removeNewIco(ui.nodes.btn);
            if(X.inArray(me.DATA.task.reclist,data.taskid)){
                ui.nodes.img_ylq.show();
                ui.nodes.btn.hide();
            }else if(me.DATA.task.taskinfo[data.taskid] >= data.pval){
                ui.nodes.img_ylq.hide();
                ui.nodes.btn.show();
                ui.nodes.btn.ifprize = true;
                ui.nodes.btn.loadTextureNormal('img/public/btn/btn1_on.png',1);
                ui.nodes.btn_txt1.setString(L("LQ"));
                ui.nodes.btn_txt1.setTextColor(cc.color(G.gc.COLOR.n13));
                G.setNewIcoImg(ui.nodes.btn);
                ui.nodes.btn.finds('redPoint').setPosition(120,50);
            }else {
                ui.nodes.img_ylq.hide();
                ui.nodes.btn.show();
                ui.nodes.btn.ifprize = false;
                ui.nodes.btn.loadTextureNormal('img/public/btn/btn2_on.png',1);
                ui.nodes.btn_txt1.setString(L("QW"));
                ui.nodes.btn_txt1.setTextColor(cc.color(G.gc.COLOR.n12));
            }
            ui.nodes.btn.id = data.taskid;
            ui.nodes.btn.stype = data.stype;
            ui.nodes.btn.touch(function(sender,type){
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    if(sender.ifprize){
                        me.ajax('wangzhezhaomu_taskprize',[sender.id],function(str,data){
                            if(data.s == 1){
                                G.frame.jiangli.data({
                                    prize:data.d.prize,
                                }).show();
                                me.getData(function(){
                                    me.setContents();
                                    me.checkRedPoint();
                                });
                                G.hongdian.getData('wangzhezhaomu',1,function(){
                                    G.frame.wangzhezhaomu_main.checkRedPoint();
                                })
                            }
                        })
                    }else{
                        X.tiaozhuan(G.gc.wangzhezhaomu.task[sender.stype].tzid);//返回要刷新
                    }
                }
            })
        },
        showBox:function(){
            var me = this;
            for(var i = 0; i < 4; i++){
                var box = me.nodes.ico_list.clone();
                box.show();
                X.autoInitUI(box);
                box.setPosition(0,0);
                box.setAnchorPoint(0,0);
                me.setBoxState(box,me.DATA.info.data.openinfo.task.boxprize[i],i);
                me.nodes['ico' + (i+1)].removeAllChildren();
                me.nodes['ico' + (i+1)].addChild(box);
                //进度条
                if(me.DATA.task.jifen >= me.DATA.info.data.openinfo.task.boxprize[i].val){
                    me.nodes['jindutiao' + (i+1)].setPercent(100);
                }else {
                    if(i > 0){
                        me.nodes['jindutiao' + (i+1)].setPercent((me.DATA.task.jifen-me.DATA.info.data.openinfo.task.boxprize[i-1].val)/(me.DATA.info.data.openinfo.task.boxprize[i].val - me.DATA.info.data.openinfo.task.boxprize[i-1].val) * 100);
                    }else {
                        me.nodes['jindutiao' + (i+1)].setPercent(me.DATA.task.jifen/me.DATA.info.data.openinfo.task.boxprize[i].val * 100);
                    }
                }
            }
        },
        setBoxState:function(ui,data,index){
            var me = this;
            var img = index == 3 ? "img_task_bx1" : "img_task_bx2";
            ui.finds('Text_1').setString(data.val);
            ui.finds('Text_1').setTextColor(cc.color(G.gc.COLOR.n5));
            X.enableOutline(ui.finds('Text_1'),'#4A1D09',2);
            //宝箱状态
            ui.removeBackGroundImage();
            // ui.removeAllChildren();
            if(X.inArray(me.DATA.task.boxreclist,index)){//已领
                ui.setTouchEnabled(false);
                ui.setBackGroundImage("img/task/" + img + "_d.png", 1);
            }else {
                ui.setTouchEnabled(me.DATA.task.jifen >= data.val);
                ui.setTouchEnabled(true);
                if(me.DATA.task.jifen >= data.val){
                    X.addBoxAni({
                        parent: ui,
                        boximg: "img/task/" + img + ".png"
                    });
                    G.setNewIcoImg(ui);
                }else {
                    ui.setBackGroundImage("img/task/" + img + ".png", 1);
                }
            }
            ui.index = index;
            ui.data = data;
            ui.click(function(sender){
                if(me.DATA.task.jifen >= sender.data.val){
                    me.ajax('wangzhezhaomu_taskjifenprize',[sender.index],function(str,data){
                        if(data.s == 1){
                            G.frame.jiangli.data({
                                prize:data.d.prize
                            }).show();
                            me.DATA.task.boxreclist.push(sender.index);
                            me.showBox();
                            G.hongdian.getData('wangzhezhaomu',1,function(){
                                G.frame.wangzhezhaomu_main.checkRedPoint();
                            })
                        }
                    })
                }else {
                    G.frame.jiangliyulan.data({
                        prize:sender.data.prize
                    }).show();
                }
            })
        },
        getData:function(callback){
            var me = this;
            me.ajax('wangzhezhaomu_open', ['task'], function(str, data){
                if (data.s == 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            });
        },
        checkRedPoint:function(){
            var me = this;
            G.removeNewIco(me.nodes.btn_jfjl);
            for(var i = 0; i < me.DATA.info.data.openinfo.task.jifenprize.length; i++){
                if(!X.inArray(me.DATA.task.alljfreclist,i) && me.DATA.task.alljifen >= me.DATA.info.data.openinfo.task.jifenprize[i].val){
                    G.setNewIcoImg(me.nodes.btn_jfjl);
                    break;
                }
            }
        }
    });
})();