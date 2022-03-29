/**
 * Created by
 */
(function () {
    //
    var ID = 'yuandan_fp';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });

            // 开始
            me.nodes.btn_zs.click(function(sender,type){
                sender.hide();
                me.nodes.txt_tz.hide();
                me.nodes.panel_cj.hide();
                me._sumStep = 0;
            });

            // 更多排行
            me.curListViewHeight = me.nodes.paihangxinxi.height;
            me.nodes.btn_dianjigengduo.setTouchEnabled(true);
            me.nodes.btn_dianjigengduo.click(function(sender,type){
                if(!me.zk) {
                    me.zk = true;
                    me.nodes.paihangxinxi.height += 7 * me.nodes.list.height + 5;
                    sender.loadTexture("img/xianshizhaomu/btn_fanhui.png", 1);
                } else {
                    me.zk = false;
                    me.nodes.paihangxinxi.height = me.curListViewHeight;
                    sender.loadTexture("img/xianshizhaomu/btn_xianshizhaomu.png", 1);
                }
                ccui.helper.doLayout(me.nodes.paihangxinxi);
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
        setContents: function() {
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_cs: function(node){ // 倒计时
                    var rtime = G.DAO.yuandan.getRefreshTime();

                    if(me.timer) {
                        node.clearTimeout(me.timer);
                        delete me.timer;
                    }

                    me.timer = X.timeout(node, rtime, function () {
                        G.tip_NB.show(L("HUODONG_HD_OVER"));
                    }, null, {
                        showDay: true
                    });
                },
                txt_tz: function(node){  // 今日尚未挑战
                    node.setVisible(!G.DATA.yuandan.xixi);
                },
                panel_jl: function(node){
                    var prize = G.gc.newyear.xixishow;
                    node.removeAllChildren();
                    X.newExtendLayout(node, {
                        dataCount:prize.length,
                        extend:false,
                        delay:false,
                        cellCount:3,
                        nodeWidth:100,
                        rowHeight:110,
                        // interval:10,
                        itemAtIndex: function (index) {
                            var p = prize[index];

                            var widget = G.class.sitem(p);
                            G.frame.iteminfo.showItemInfo(widget);
                            return widget;
                        }
                    });
                },

            }, me.nodes);


            me.setRankList();

            if(G.DATA.yuandan.xixi == true){
                me.setXixiNum(G.DATA.yuandan.xixinum);
                me.gameOver();
            }else{
                me.setCardList();
            }
        },
        setCardList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var randData = me.getRandCard();

            X.render({
                panel_fp: function(node){ // 倒计时
                    node.removeAllChildren();
                    X.newExtendLayout(node, {
                        dataCount:randData.length,
                        extend:false,
                        delay:false,
                        cellCount:4,
                        nodeWidth:me.nodes.panel_list.width,
                        rowHeight:me.nodes.panel_list.height + 10,
                        // interval:10,
                        itemAtIndex: function (index) {
                            var list = me.nodes.panel_list.clone();
                            X.autoInitUI(list);
                            list.setName('card_' + index);
                            me.nodes['card_' + index] = list;

                            me.setCardItem(list, randData[index], index);
                            list.show();
                            return list;
                        }
                    });
                },
            }, me.nodes);
        },
        setCardItem: function(ui, data, idx){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            ui.removeAllChildren();
            G.class.ani.show({
                json:'event_yuandan_ytxx_list',
                addTo:ui,
                x:0,
                y:0,
                repeat:false,
                autoRemove:false,
                onload:function(aniNode, action){
                    ui.aniNode = aniNode;
                    action.play('wait1', true);

                    aniNode.nodes.ico.loadTexture('ico/itemico/' + data + '.png', 0);
                }
            });

            ui.fanpai = function(){
                var that = this;

                that.setTouchEnabled(false);
                that.aniNode.action.playWithCallback('fankai', false, function () {
                    that.aniNode.action.play('wait2', true);
                });
            };

            ui.fanhui = function(){
                var that = this;

                that.aniNode.action.playWithCallback('fanhui', false, function(){
                    that.aniNode.action.play('wait1', true);
                    that.setTouchEnabled(true);
                });
            };

            ui.xiaoshi = function(callback){
                var that = this;

                that.aniNode.action.playWithCallback('xiaochu', false, function(){
                    that.removeFromParent();
                    callback && callback();
                });
            };

            ui.data = data;
            ui.idx = idx;
            ui.setTouchEnabled(true);
            ui.click(function(sender, type){
                if(me._sumStep == null) return;
                cc.log('step', me._sumStep);
                if(me._lastCard && me._lastCard.idx == sender.idx) return;
                me.delayCallFunc();

                cc.callLater(function(){
                    if(X.isHavItem(me._lastCard)){
                        var lastNode = me.nodes['card_' + me._lastCard.idx];
                        if(me._lastCard.data == sender.data){
                            // 相同, 消失
                            sender.fanpai();

                            me.delayCallFunc(1000, function (){
                                delete me._lastCard;

                                sender.xiaoshi(function(){
                                    me.ui.setTimeout(function (){
                                        me.checkGameOver();
                                    },10);
                                });
                                if( cc.isNode(lastNode) ){
                                    lastNode.xiaoshi();
                                }
                            });
                        }else{
                            // 不相同, 翻回去
                            sender.fanpai();

                            me.delayCallFunc(1000, function (){
                                delete me._lastCard;

                                sender.fanhui();
                                if( cc.isNode(lastNode) ){
                                    lastNode.fanhui();
                                }
                            });
                        }
                        me._sumStep += 1;
                        me.setXixiNum(me._sumStep);
                    }else{
                        me._lastCard = {data: sender.data, idx: sender.idx};
                        sender.fanpai();
                    }
                }, me.ui);
            });
        },
        delayCallFunc: function(delay, callback){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            if(me._timer){
                me.ui.clearTimeout(me._timer);
                delete me._timer;
            }

            if(delay != null){
                me._callFunc = callback;

                me._timer = me.ui.setTimeout(function (){
                    me._callFunc && me._callFunc();
                    delete me._callFunc;
                }, delay);
            }else{
                me._callFunc && me._callFunc();
                delete me._callFunc;
            }
        },
        checkGameOver: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if( me.nodes.panel_fp.getChildrenCount() != 0 ) return;

            G.DAO.yuandan.xixi(me._sumStep, function(data){
                G.frame.jiangli.once('show', function(){
                    G.DAO.yuandan.getServerData(function(){
                        me.setRankList();
                        me.gameOver();
                    });
                }).data({
                    prize:[].concat(data.prize)
                }).show();
            });
        },
        setXixiNum: function(num){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            me.nodes.panel_cj.show();
            me.nodes.txt_fs.setString(X.STR(L('yuandan_step'), num));
        },
        gameOver: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            delete me._sumStep;
            me.nodes.btn_zs.hide();
            me.nodes.txt_tz.hide();
            me.nodes.panel_ywc.show();
        },
        setRankList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            var listview = me.nodes.listview;
            listview.setScrollBarEnabled && listview.setScrollBarEnabled(false);
            listview.removeAllItems();
            var rank = G.DATA.yuandan.xixirank;

            for(var i=0;i<5;i++){
                var list = me.nodes.list.clone();
                list.setName('item_' + i);
                if(!list.nodes) X.autoInitUI(list);
                list.idx = i;
                me.setRankItem(list, rank[i], i);
                list.show();
                listview.pushBackCustomItem(list);
            }
        },
        setRankItem: function(ui, data, rank){
            var me = this;
            if(!cc.isNode(me.ui)) return;

            X.render({
                txt_mc: (rank+1) + '',
                txt_name: function (node){
                    node.setString(data ? data.name : L('XWYD'));
                    node.setTextColor(cc.color(data ? "#FFFFFF" : "#A2938C"));
                },
                txt_jf: data ? X.STR(L('yuandan_step'), data.num) : '',
            }, ui.nodes);
        },
        getRandCard: function(){
            var cards = G.gc.newyear.card;
            var result = [];
            for(var i=0;i<cards.length;i++){
                result.push(cards[i]);
                result.push(cards[i]);
            }

            return X.arrayShuffle(result);
        },
    });
    G.frame[ID] = new fun('event_yuandan_ytxx.json', ID);
})();