/**
 * Created by zhangming on 2020-09-21
 */
(function () {
    // 嫦娥奔月
    var ID = 'event_zhongqiu_ceby';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            var obj = {};
            obj['txt_cs'] = function(node){ // 倒计时
                var rtime = G.DAO.zhongqiu.getRefreshTime();

                if(me.timer) {
                    node.clearTimeout(me.timer);
                    delete me.timer;
                }

                me.timer = X.timeout(node, rtime, function () {
                    G.tip_NB.show(L("HUODONG_HD_OVER"));
                });
            };

            obj['panel_ce'] = function(node){ // 嫦娥
                if(node.getChildrenCount() > 0) return;

                X.spine.show({
                    json: 'spine/change.json',
                    addTo: node,
                    x:node.width*0.5,
                    y:0,
                    autoRemove: false,
                    noRemove:true,
                    onload: function (spNode) {
                        spNode.stopAllAni();
                        spNode.runAni(0, "run", true);
                    }
                });
            };

            var moonConf = G.gc.midautumn.toTheMoon.moon;
            var step = G.DAO.zhongqiu.getMoonStep();

            for(var i=0;i<moonConf.length;i++){
                (function(idx){
                    var isFinish = idx <= step;
                    obj['panel_' + (idx+1)] = function(node){ // 云
                        if(idx != moonConf.length -1){
                            // 云
                            node.removeAllChildren();
                            var list = me.nodes.panel_list.clone();
                            X.autoInitUI(list);

                            X.render({
                                txt_sz: function(node){ // 进度
                                    node.setString(moonConf[idx][0]);
                                    X.enableOutline(node,cc.color('#3C53A9'), 2);
                                },
                                panel_dh: function(node){
                                    node.hide();
                                },
                                panel_yun: function(node){
                                    node.setVisible(idx > step);
                                    // node.removeBackGroundImage();
                                    // node.removeAllChildren();
                                },
                                panel_jd: function(node){
                                    node.setVisible(!isFinish);
                                },
                            }, list.nodes);

                            list.setAnchorPoint(0.5,0.5);
                            list.setPosition(cc.p(node.width*0.5, node.height*0.5));
                            list.show();

                            node.list = list;
                            node.removeAllChildren();
                            node.addChild(list);
                        }else{
                            // 月亮
                        }

                        node.setTouchEnabled(!isFinish);
                        node.click(function(sender, type){
                            G.frame.jiangliyulan.data({
                                prize: moonConf[idx][1]
                            }).show();
                        });
                    };
                })(i);
            }

            // 月亮
            obj['txt_jd6'] = function(node){ // 进度
                node.setString(moonConf[moonConf.length - 1][0]);
                X.enableOutline(node,cc.color('#3C53A9'), 2);
            };
            obj['panel_bx'] = function(node){
                node.setVisible(step != 5);
            };
            obj['panel_jd6'] = function(node){
                node.setVisible(step != 5);
            };

            X.render(obj, me.nodes);

            me.toNextStep();
            me.setTaskList();
        },
        toNextStep: function(cloudPrize){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            var step = G.DAO.zhongqiu.getMoonStep();
            var isCloud = step != 5;

            if(step != -1){
                var toNode = me.nodes['panel_' + (step+1)];
                var topos;

                if(isCloud){
                    // 云
                    var p = toNode.list.nodes.panel_dh.getPosition();
                    topos = toNode.list.nodes.panel_dh.convertToWorldSpaceAR(p);
                    topos.x -= 40;
                    topos.y -= 53;
                }else{
                    // 月亮
                    var p = me.nodes.panel_bx.getPosition();
                    topos = me.nodes.panel_bx.convertToWorldSpaceAR(p);
                    topos.x -= 10;
                    topos.y -= 79;
                }

                if(cloudPrize){
                    me.nodes.panel_ce.runActions([
                        cc.jumpTo(1, topos, 50, 1),
                        cc.callFunc(function(){
                            G.frame.jiangli.data({
                                prize: cloudPrize
                            }).show();

                            if(isCloud){
                                var panel_yun = toNode.list.nodes.panel_yun;
                                panel_yun.removeBackGroundImage();
                                toNode.list.nodes.panel_jd.hide();

                                G.class.ani.show({
                                    json:'zhongqiu_yun_tx',
                                    addTo:panel_yun,
                                    repeat:false,
                                    autoRemove:true,
                                    onend:function() {
                                        cc.isNode(panel_yun) && panel_yun.hide();
                                    }
                                });
                            }else{
                                me.nodes.panel_bx.hide();
                                me.nodes.panel_jd6.hide();
                            }
                        })
                    ]);
                }else{
                    me.nodes.panel_ce.setPosition(topos);
                }
            }
        },
        setTaskList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var task = G.class.midautumn.getTask();
            var taskData = G.DATA.zhongqiu.task;

            X.render({
                txt_zjd: G.DATA.zhongqiu.moon, // 进度
                panel_rw: function(node){
                    node.removeAllChildren();
                    X.newExtendLayout(node, {
                        dataCount:task.length,
                        extend:false,
                        delay:false,
                        cellCount:2,
                        nodeWidth:me.nodes.list.width,
                        rowHeight:me.nodes.list.height,
                        // interval:10,
                        itemAtIndex: function (index) {
                            var taskid = X.keysOfObject( task[index] )[0];
                            var p = task[index][taskid];

                            var nval = taskData.data[taskid] || 0;
                            var isFinish = X.inArray(taskData.rec, taskid);
                            var canGet = nval >= p.pval && !isFinish;

                            var list = me.nodes.list.clone();
                            list.setName('list' + index);
                            X.autoInitUI(list);

                            X.render({
                                txt_rw: function(node){
                                    setTextWithColor(node, X.STR(p.intr, nval, p.pval), '#A01E00');
                                },
                                txt_jd: function(node){
                                    setTextWithColor(node, X.STR(L('zhongqiu_task_title'), p.exp), '#7B531A');
                                },
                                panel_wp: function(node){
                                    X.alignItems(node, p.prize,'center',{
                                        touch: !canGet,
                                        interval:16,
                                        // scale:0.7,
                                        // callback: function (node) {
                                        //     node.y += 5;
                                        // }
                                    });
                                },
                                panel_ywc: function(node){
                                    node.setVisible(isFinish);
                                },
                                panel_wwc: function(node){
                                    node.setVisible(!canGet);
                                },
                            }, list.nodes);

                            if(canGet){
                                list.setTouchEnabled(true);
                                list.click(function(sender, type){
                                    cc.log(taskid);
                                    G.DAO.zhongqiu.receive(taskid, function(data){
                                        G.frame.jiangli.once('show', function(){
                                            me.refreshPanel();
                                        }).once('close', function(){
                                            if(data.other){
                                                me.toNextStep(data.other);
                                            }
                                        }).data({
                                            prize: data.prize
                                        }).show();
                                    });
                                });
                            }else{
                                list.setTouchEnabled(false);
                            }

                            list.show();
                            return list;
                        }
                    });
                },
            }, me.nodes);
        },
        refreshPanel: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            G.DAO.zhongqiu.getServerData(function(){
                me.setTaskList();
            });
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.txt_title.setString(L('zhongqiu_title1'));

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
        },
        onOpen: function () {
            var me = this;

            me.bindUI();
        },
        onShow: function () {
            var me = this;

            me.setContents();
        },
        onAniShow: function () {
            var me = this;

            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_zhongqiu_ceby.json', ID);
})();