/**
 * Created by zhangming on 2020-09-21
 */
 (function () {
    // 金秋活动
    var ID = 'jinqiu_jqxb';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;
            me.DATA = G.DATA.jinqiu;
            if(me.DATA.myinfo.gamenum <= 0){
                me.nodes.txt_tz.show();
                me.nodes.txt_tz.setString(L("JQHD_12"));
            }else{
                me.nodes.txt_tz.hide();
            }        
            me.nodes.panel_ft.setTouchEnabled(false);
            me.ui.finds('Panel_1').hide();  
            X.render({
                txt_djs2: function(node){ // 倒计时
                    if(G.time < G.DATA.asyncBtnsData.midautumn2.etime){
                        X.timeout(node, G.time + X.getOpenTimeToNight(G.time), function () {
                            me.setContents();
                        });
                    }else{
                        G.tip_NB.show(L("HDJS"));
                    }
                },
            }, me.nodes);
            me.setRankList();
            me.setBxjl();
            if(G.DATA.jinqiu.gamenum > 0){
                me.gameOver();
            }else{
                me.setCardList();
            }
                  
        },
        setBxjl: function () {
            var me = this;
            var conf = G.gc.midautumn2.gameprize;
            for(var i = 0 ; i < conf.length ; i++){
                var node = me.nodes['panel_bsjl'+(i+1)];
                node.removeAllChildren();
                var list = me.nodes.list_bsjl.clone();
                X.autoInitUI(list);
                var prize = G.class.sitem(conf[i].prize[0],false);
                prize.setPosition(list.nodes.img_wp.width / 2, list.nodes.img_wp.height / 2);
                prize.setScale(0.8);
                list.nodes.img_wp.addChild(prize);
                var str = conf[i].val[0];
                var str1 = conf[i].val[1];
                var str2 = X.STR(L('JQHD_9'),str + '~' + str1);
                list.nodes.txt_bsjl.setString(str2);
                X.enableOutline(list.nodes.txt_bsjl, "#000000", 2);
                // var rh = X.setRichText({
                //     str: str2,
                //     parent: list.nodes.txt_bsjl,
                //     color: '#d44f21',
                // });
                //rh.setPosition(0, list.nodes.txt_bsjl.width/2 - rh.trueHeight() / 2);
                list.setPosition(node.width / 2,node.height / 2);
                list.show();
                node.addChild(list);
            }
        },
        checkHongDian: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
        },
        getRandCard: function(){
            var cards = [1,2,3,4,5,6,7,8];
            var result = [];
            for(var i=0;i<cards.length;i++){
                result.push(cards[i]);
                result.push(cards[i]);
            }
            return X.arrayShuffle(result);
        },
        setCardList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var randData = me.getRandCard();

            X.render({
                panel_ft: function(node){ 
                    node.removeAllChildren();
                    X.newExtendLayout(node, {
                        dataCount:randData.length,
                        extend:false,
                        delay:false,
                        cellCount:4,
                        nodeWidth:me.nodes.list.width,
                        rowHeight:me.nodes.list.height ,
                        itemAtIndex: function (index) {
                            var list = me.nodes.list.clone();
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
        bindUI: function () {
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.btn_ks.show();
            me.nodes.btn_fh.click(function(sender,type){
                me.remove();
            });
            me.nodes.btn_ks.click(function (sender) {
                sender.hide();
                me._sumStep = 0;
                me.count=8;
            })
        },
        onOpen: function () {
            var me = this;
            
            me.bindUI();
        },
        setCardItem: function(ui, data, idx){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            ui.removeAllChildren();
            G.class.ani.show({
                json:'zhongqiu_fanpai_dh',
                addTo:ui,
                x:94,
                y:45,
                repeat:false,
                autoRemove:false,
                
                onload:function(aniNode, action){
                    ui.aniNode = aniNode;
                    var info = action.getAnimationInfo('in2');
                    action.gotoFrameAndPause(info.endIndex);
                    aniNode.nodes.wp.setTouchEnabled(false);
                    aniNode.nodes.wp.setBackGroundImage('img/jinqiu/img_jq' + data + '.png', 1);
                    aniNode.nodes.wp.show();
                }
            });

            ui.fanpai = function(){
                var that = this;

                that.setTouchEnabled(false);
                that.aniNode.action.play('in', false);
                me.isfanpai=false;
            };

            ui.fanhui = function(){
                var that = this;

                that.aniNode.action.playWithCallback('in2', false, function(){
                    that.setTouchEnabled(true);
                });
            };

            ui.xiaoshi = function(callback){
                var that = this;

                that.aniNode.action.playWithCallback('xiaoshi', false, function(){
                    that.removeFromParent();
                    callback && callback();
                });
            };

            ui.data = data;
            ui.idx = idx;
            ui.setTouchEnabled(true);
            ui.click(function(sender, type){
                if(me.isfanpai)return;
                if(me._sumStep == null) return;
                if(me._lastCard && me._lastCard.idx == sender.idx) return;
                me.delayCallFunc();

                cc.callLater(function(){
                    if(X.isHavItem(me._lastCard)){
                        var lastNode = me.nodes['card_' + me._lastCard.idx];
                        if(me._lastCard.data == sender.data){
                            // 相同, 消失
                            me.isfanpai=true;
                            sender.fanpai();

                            me.delayCallFunc(1000, function (){
                                delete me._lastCard;
                                me.count--;
                                if(me.count <= 0){
                                    me.ui.setTimeout(function (){
                                        me.checkGameOver();
                                    },10);
                                }
                                // if( cc.isNode(lastNode) ){
                                //     lastNode.xiaoshi();
                                // }
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
        checkGameOver: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            if( me.count > 0) return;

            G.DAO.jinqiu.xixi(me._sumStep, function(data){
                if(data.prize.length <= 0){
                    G.tip_NB.show(L("JQHD_7"));
                    me.gameOver();
                }else{
                    G.frame.jiangli.once('show', function(){
                        G.DAO.jinqiu.getServerData(function(){
                            me.gameOver();
                        });
                    }).data({
                        prize:[].concat(data.prize)
                    }).show();
                }
            },me);
        },
        setRankList: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            var rank = G.DATA.jinqiu.rank.ranklist;
            if(G.DATA.jinqiu.rank.myrank>0){
                var str = X.STR(L('JQHD_5'),G.DATA.jinqiu.rank.myrank,P.gud.name);
                var rh = new X.setRichText({
                    parent: me.nodes.txt_wj,
                    str: str,
                    size: 20,
                    color:"#ffffed",
                });
                me.nodes.txt_bs1.show();
            }else{
                var str = L('JQHD_6');
                var rh = new X.setRichText({
                    parent: me.nodes.txt_wj,
                    str: str,
                    size: 20,
                    color:"#ffffed",
                });
                if(G.DATA.jinqiu.rank.myval){
                    me.nodes.txt_bs1.show();
                }else{
                    me.nodes.txt_bs1.hide();
                }
            }
            
            rh.setPosition(0, me.nodes.txt_wj.height / 2 - rh.trueHeight() / 2);
            me.nodes.txt_bs1.setString(G.DATA.jinqiu.rank.myval);
            me.count=0;
            G.DATA.jinqiu.rank.ranklist.sort(function (a,b) {
                return a.val-b.val;
            })
            var rank = G.DATA.jinqiu.rank.ranklist;
            if(!me.table){
                var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.list_wjbs,1, function (ui, data) {
                    me.setItem(ui,data);
                },null,null,5);
            }
            me.table.setData(rank);
            me.table.reloadDataWithScroll(true);
                
        },
        setItem: function (ui,data) {
            var me = this;
            X.autoInitUI(ui);
            ui.setTouchEnabled(false);
            ui.show();
            var str = X.STR(L('JQHD_5'),G.DATA.jinqiu.rank.ranklist.indexOf(data)+1,data.headdata.name);
            var rh = new X.setRichText({
                parent: ui.nodes.txt_wj,
                str: str,
                size: 20,
                color:"#ffffed",

            });
          
            rh.x=0;
            ui.nodes.txt_bs1.setString(data.val);
            ui.nodes.txt_bs1.show();
        },
       
        gameOver: function(){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            delete me._sumStep;
            me.nodes.btn_ks.show();
            me.setContents();
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
        setXixiNum: function(num){
            var me = this;
            if(!cc.isNode(me.ui)) return;
            me.nodes.txt_bs2.setString(num);
        },
        onShow: function () {
            var me = this;

            G.DAO.jinqiu.getServerData(function(){
                me.setContents();
                me.checkHongDian();
            });
        },
        onAniShow: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onRemove: function () {
            var me = this;
        },
    });

    G.frame[ID] = new fun('event_jinqiuxunbao.json', ID);
})();