/**
 * Created by
 */
(function () {
    //
    var ID = 'yuandan_rw';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.txt_title.setString(L('yuandan_title1'));

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
            me.ui.finds('Text_5_0').setString(L("yuandan_task_1"));
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
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            me.setTaskList();
            me.toNextStep();
        },
        toNextStep: function(cloudPrize){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            var moonConf = G.gc.newyear.toTheMoon.moon;
            var step = G.DAO.yuandan.getMoonStep();
            var obj = {};
            for(var i=0;i<moonConf.length;i++){
                (function(idx){
                    var isFinish = idx <= step;
                    obj['btn_dl' + (idx+1)] = function(node){ // 云
                        node.children[0].setVisible(!isFinish);
                        node.setTouchEnabled(!isFinish);
                        node.click(function(sender, type){
                            G.frame.jiangliyulan.data({
                                prize: moonConf[idx][1]
                            }).show();
                        });
                        if (isFinish) {
                            G.class.ani.show({
                                json: 'yuandan_denglong_dh',
                                addTo: node,
                                z:1,
                                repeat: true,
                                autoRemove: false,
                                uniqueid: true
                            });
                        }
                    };
                    obj['denglong_wz' + (idx+1)] = function(node){
                        node.zIndex = 2;
                        node.setString(moonConf[idx][0]);
                    }
                })(i);
            }
            X.render(obj, me.nodes);
        },
        playAni: function (prize, callback) {
            var me = this;
            var step = G.DAO.yuandan.getMoonStep();
            var obj = {};
            obj['btn_dl' + (step+1)] = function(node){ // 云
                G.frame.loadingIn.show();
                node.children[0].runActions([
                    cc.fadeOut(0.9),
                    cc.callFunc(function () {
                        G.frame.jiangli.data({
                            prize: prize
                        }).show();
                        callback && callback();
                        G.frame.loadingIn.remove();
                    })
                ]);
            };
            X.render(obj, me.nodes);
        },
        setTaskList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var task = G.class.newyear.getTask();
            var taskData = G.DATA.yuandan.task;

            X.render({
                txt_zjd: G.DATA.yuandan.moon, // 进度
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
                                    setTextWithColor(node, X.STR(L('yuandan_task_title'), p.exp), '#7B531A');
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
                                    G.DAO.yuandan.receive(taskid, function(data){
                                        G.frame.jiangli.once('show', function(){
                                            me.refreshPanel();
                                        }).once('close', function(){
                                            if(data.other){
                                                me.playAni(data.other, function () {
                                                    me.toNextStep();
                                                });
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

            G.DAO.yuandan.getServerData(function(){
                me.setTaskList();
            });
        },
    });
    G.frame[ID] = new fun('event_yuandan_ceby.json', ID);
})();