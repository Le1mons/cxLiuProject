(function(){
    var _fun = {
        _initEvent: function(when){
            var me = this;
            me.gridContent.removeAllChildren();
            if(me.data.conf.typeid == 0) return; // 清除事件
            var conf = G.gc.syzccom.eventinfo[me.data.conf.typeid];
            if (!conf) return;
            var gray = me.gridStatus.fog;
            // cc.log(me.data.conf);

            if (X.inArray([4,5,6,7,8,9,10,11,13,15,25,37,44,50,51,52,53,54],me.data.conf.typeid)) {
                //英雄形象，头上顶着个事件指示
                me.initEvent_enemy(when);
                return;
            };
            //委托战斗事件
            if (X.inArray([12,14],me.data.conf.typeid)) {
                //英雄形象，头上顶着个事件指示
                me.initEvent_weituoenemy(when);
                return;
            };
            if (X.inArray([19,20],me.data.conf.typeid)) {
                //奖励事件，是物品格子
                me.initEvent_prize(when);
                return;
            };
            //宝箱
            if (X.inArray([16,17,18],me.data.conf.typeid)) {
                me.initEvent_box(when);
                return;
            };
            //路障
            if (X.inArray([21,22,23],me.data.conf.typeid)) {
                me.initEvent_shibei(when);
                return;
            };
            //噬渊石
            if (X.inArray([29,30,31,32,43],me.data.conf.typeid)) {
                me.initEvent_shiyuanshi(when);
                return;
            };
            //飞艇物资运送
            if (X.inArray([27],me.data.conf.typeid)) {
                me.initEvent_feiting(when);
                return;
            };
            if(me['initEvent' + me.data.conf.typeid]){
                me['initEvent' + me.data.conf.typeid](when);
                return;
            };
            if(!me.data.custom.eventImg) return;
            var _spriteFile = gray ? me.data.custom.eventGrayImg : me.data.custom.eventImg;
            var sprite = me.createSprite(_spriteFile);
            sprite.setPosition(me.gridContent.width*0.5, me.gridContent.height*0.5);
            me.gridContent.addChild(sprite);
        },
        // 再次重绘
        againRender: function(){
            var me = this;
            var eid = me.data.conf.typeid;
            // 清除事件
            if(!eid){
                cc.isNode(me.gridContent) && me.gridContent.removeAllChildren();
                cc.isNode(me.titleSprite) && me.titleSprite.removeAllChildren();
                return;
            }
            me._initEvent('change');
        },
        initEvent2: function(){
            var me = this;
            //是小怪形象
            var hid = me.data.conf.typename.hero;
            var state = G.frame.shiyuanzhanchang_floor.getTheEnemyState(me.data.conf.eventdata.herolist);
            var newRole = new G.class.syzcModel({
                'type':'enemy',
                'model':hid,
                'scale':0.6,
                'nowhp':state.nowhp,
                'maxhp':state.maxhp});
            newRole.setPosition(80, 15);
            newRole.wait();
            newRole.showH5bar();
            newRole.f5Bar();
            me.enemyRole = newRole;
            me.gridContent.addChild(newRole);
        },
        initEvent3: function(){
            var me = this;
            //boss占四个格子
            var hid = me.data.conf.typename.hero;
            // 16-5  ,16-7
            // 16-5  ,15-5
            // 16-5  ,16-3
            // 16-5  ,17-5
            var pos = G.frame.shiyuanzhanchang_map.getBossPosOffset(me.data.gx,me.data.gy);
            var state = G.frame.shiyuanzhanchang_floor.getTheEnemyState(me.data.conf.eventdata.herolist);
            var newRole = new G.class.syzcModel({
                'type':'boss',
                'model':hid,
                'scale':1,
                'nowhp':state.nowhp,
                'maxhp':state.maxhp});
            newRole.setPosition(pos);
            newRole.wait();
            newRole.showH5bar();
            newRole.f5Bar();
            me.enemyRole = newRole;
            me.gridContent.addChild(newRole);
        },
        initEvent_weituoenemy:function(){
            var me = this;
            var hid = me.data.conf.typename.hero;
            var state = G.frame.shiyuanzhanchang_floor.getTheEnemyState(me.data.conf.eventdata.herolist);
            var newRole = new G.class.syzcModel({
                'type':'enemy',
                'model':hid,
                'scale':0.6,
                'nowhp':state.nowhp,
                'maxhp':state.maxhp});
            newRole.setPosition(80, 15);
            newRole.wait();
            newRole.showH5bar();
            newRole.f5Bar();
            me.enemyRole = newRole;
            me.gridContent.addChild(newRole);
        },
        initEvent_enemy: function(){
            var me = this;
            var hid = me.data.conf.typename.hero;
            X.spine.show({
                json:'spine/'+ hid +'.json',
                addTo : me.gridContent,
                noRemove: true,
                x:80,
                y:15,
                z:1000,
                autoRemove:false,
                onload : function(aniNode,action){
                    aniNode.setScale(.6);
                    aniNode.setVisible(true);
                    aniNode.action = action;
                    me.enemyRole = aniNode;
                    aniNode.runAni(0,'wait',true);
                    me.aniNode = aniNode;
                }
            });
        },
        initEvent_prize: function(){
            var me = this;
            var eventdata = me.data.conf.eventdata;
            //奖励事件
            G.class.ani.show({
                json: "ani_shiyuanzcfazhen_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                cache:true,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                    X.autoInitUI(aniNode);
                    var wid = G.class.sitem(eventdata[0]);
                    wid.background && wid.background.hide();
                    wid.num.hide();
                    wid.setPosition(cc.p(aniNode.nodes.daoju_.width / 2,aniNode.nodes.daoju_.height / 2));
                    aniNode.nodes.daoju_.setTouchEnabled(false);
                    aniNode.nodes.daoju_.removeAllChildren();
                    aniNode.nodes.daoju_.addChild(wid);
                }
            });
        },
        initEvent_box: function(){
            var me = this;
            var conf = me.data.conf.typename;
            //宝箱
            G.class.ani.show({
                json: "ani_shiyuanzcbx"+conf.image+"_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                cache:true,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                    action.gotoFrameAndPause(0);
                }
            });
        },
        initEvent_shibei:function(){
            var me = this;
            var conf = me.data.conf.typename;
            G.class.ani.show({
                json: "ani_shiyuanzcshibei_dh",
                addTo:me.gridContent,
                x:80,
                y:85,
                repeat: true,
                autoRemove: false,
                cache:true,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                    action.play('wait',true);
                    X.autoInitUI(aniNode);
                    aniNode.nodes.shibei1_.setBackGroundImage('img/shiyuanzhanchang1/img_p'+conf.image+'.png',1);
                    //左边按钮
                    var need1 = conf.needinfo['1'][0];
                    var color1 = G.class.getOwnNum(need1.t,need1.a)>=need1.n?'#ffffff':'#c80000';
                    var wid1 = G.class.sitem(need1);
                    wid1.setScale(.8);
                    wid1.background && wid1.background.hide();
                    wid1.num.setTextColor(cc.color(color1));
                    wid1.setPosition(cc.p(13,35));
                    aniNode.nodes.anniu1_.hide();
                    aniNode.nodes.anniu_.hide();
                    aniNode.nodes.anniu1_.setBackGroundImage('img/shiyuanzhanchang/img_qiu.png',1);
                    aniNode.nodes.anniu1_.removeAllChildren();
                    aniNode.nodes.anniu1_.addChild(wid1);
                    aniNode.nodes.anniu1_.setPositionY(100);
                    aniNode.nodes.anniu1_.key = 1;
                    aniNode.nodes.anniu1_.click(function (sender,type) {
                        var key = sender.key.toString();
                        G.DAO.shiyuanzhanchang.event(me.data.idx, false,{'id':key}, function(dd){
                            action.playWithCallback('hit',false,function () {
                                me.map.refreshGrids(me.data.idx);
                            });
                        },null);
                    });
                    //右边按钮
                    var need2 = conf.needinfo['2'][0];
                    var color2 = G.class.getOwnNum(need2.t,need2.a)>=need2.n?'#ffffff':'#c80000';
                    var wid2 = G.class.sitem(need2);
                    wid2.background && wid2.background.hide();
                    wid2.num.setTextColor(cc.color(color2));
                    wid2.setScale(.8);
                    wid2.setPosition(cc.p(13,35));
                    aniNode.nodes.anniu_.removeAllChildren();
                    aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/img_qiu.png',1);
                    aniNode.nodes.anniu_.addChild(wid2);
                    aniNode.nodes.anniu_.setPositionY(100);
                    aniNode.nodes.anniu_.key = 2;
                    aniNode.nodes.anniu_.click(function (sender,type) {
                        var key = sender.key.toString();
                        G.DAO.shiyuanzhanchang.event(me.data.idx, false,{'id':key}, function(dd){
                            action.playWithCallback('hit',false,function () {
                                me.map.refreshGrids(me.data.idx);
                            });
                        },null);
                    });
                }
            });
        },
        //羊皮纸效果
        initEvent24 : function () {
            var me = this;
            //奖励事件
            G.class.ani.show({
                json: "ani_shiyuanzcyangpizhi_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                }
            });
        },
        //瞭望塔效果
        initEvent26 : function () {
            var me = this;
            var eventdata = me.data.conf.eventdata;

            G.class.ani.show({
                json: "ani_shiyuanzcliaowangta_dh",
                addTo:me.gridContent,
                x:85,
                y:105,
                repeat: true,
                cache:true,
                autoRemove: false,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                    X.autoInitUI(aniNode);
                    action.play('wait',true);
                    aniNode.nodes.ta_.setTouchEnabled(false);
                    aniNode.nodes.ta_.setBackGroundImage('img/shiyuanzhanchang1/img_dl'+eventdata.graph +'.png',1);
                    aniNode.nodes.anniu_.eventdata = eventdata;
                    aniNode.nodes.anniu_.hide();
                    aniNode.nodes.anniu_.setScale(.6);
                    aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_ch.png',1);
                    aniNode.nodes.anniu_.click(function (sender,type) {
                        var liaowangta = G.DATA.shiyuanzhanchang.liaowangta;
                        if (liaowangta+1 == sender.eventdata.order){
                            //说明是当前的顺序
                            G.DAO.shiyuanzhanchang.event(me.data.idx, false,{}, function(dd){
                                action.playWithCallback('hit',false,function () {
                                    if (dd.prize && dd.prize.length>0){
                                        G.frame.jiangli.data({
                                            prize: dd.prize
                                        }).show();
                                    }
                                    if (G.DATA.shiyuanzhanchang.liaowangta == X.keysOfObject(G.DATA.shiyuanzhanchang.eventdata['26']).length){
                                        //说明所有的塔都成功解锁
                                        G.class.ani.show({
                                            json: "ani_shiyuanzcbx4_dh",
                                            addTo: cc.director.getRunningScene(),
                                            x:320,
                                            y:568,
                                            repeat: false,
                                            autoRemove: true,
                                            onload: function (node,action) {
                                                action.playWithCallback('chuxian',false,function () {
                                                    node.removeFromParent();
                                                    me.map.refreshGrids(me.data.idx);
                                                    me.map.refreshGrids(G.DATA.shiyuanzhanchang.nowgzid);
                                                });
                                            }
                                        })
                                    }else {
                                        me.map.refreshGrids(me.data.idx);
                                    }
                                });
                            },null);
                        }else {
                            //不是当前的顺序
                            G.tip_NB.show(L('syzc_15'));
                        }
                    });
                }
            });
        },
        //噬渊石效果
        initEvent_shiyuanshi:function () {
            var me = this;
            var conf = me.data.conf.typename;
            me.gridContent.removeAllChildren();
            G.class.ani.show({
                json: "ani_shiyuanzcbaoshi_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                onload: function (aniNode, action) {
                    me.aniNode = aniNode;
                    X.autoInitUI(aniNode);
                    aniNode.nodes.baoshi_.removeAllChildren();
                    if (G.DATA.shiyuanzhanchang.shiyuanshi.jiequ[me.data.conf.typeid] && G.DATA.shiyuanzhanchang.shiyuanshi.jiequ[me.data.conf.typeid] == me.data.idx){
                        //说明接取了这个事件
                        if (aniNode.nodes.baoshi_.getChildByTag('123456789')) {
                            aniNode.nodes.baoshi_.getChildByTag('123456789').show();
                        }else {
                            G.class.ani.show({
                                json: "ani_shiyuanbaoshijh_dh",
                                addTo:aniNode.nodes.baoshi_,
                                repeat: true,
                                autoRemove: false,
                                onload: function (node, action) {
                                    X.autoInitUI(node);
                                    node.setTag('123456789');
                                    node.nodes.baoshi_.setTouchEnabled(false);
                                }
                            });
                        }
                    }
                    aniNode.nodes.baoshi_.setOpacity(255);
                    aniNode.nodes.baoshi_.setBackGroundImage('img/shiyuanzhanchang1/img_shs'+conf.image +'.png',1);
                    aniNode.nodes.anniu_.hide();
                    aniNode.nodes.anniu_.height = 50;
                    aniNode.nodes.anniu_.setScale(.6);
                    aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_jh.png',1);
                    aniNode.nodes.anniu_.idx = me.data.idx;
                    aniNode.nodes.anniu_.click(function (sender,type) {
                        var oldjiequ = G.DATA.shiyuanzhanchang.shiyuanshi.jiequ;
                        G.DAO.shiyuanzhanchang.event(sender.idx, false,{}, function(dd){
                            if (X.isHavItem(oldjiequ)){
                                //说明已经接取了一个
                                if (oldjiequ[me.data.conf.typeid] && oldjiequ[me.data.conf.typeid]!=sender.idx){
                                    //共振成功
                                    G.class.ani.show({
                                        json: "ani_shiyuanbaoshigzcg_dh",
                                        addTo: G.frame.shiyuanzhanchang_floor.nodes.ui,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function (cgnode, action) {
                                            X.autoInitUI(cgnode);
                                            cgnode.finds('l').finds('baoshi_$').setBackGroundImage('img/shiyuanzhanchang1/img_shs'+conf.image +'.png',1);
                                            cgnode.finds('r').finds('baoshi_$').setBackGroundImage('img/shiyuanzhanchang1/img_shs'+conf.image +'.png',1);
                                        },
                                        onend:function (node) {
                                            G.frame.shiyuanzhanchang_gzjg.once('willClose',function () {
                                                var sjarr = [29,30,31,32];
                                                var finish = 0;
                                                var thesjarr = [];
                                                for (var i=0;i<sjarr.length;i++){
                                                    if (G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                                        finish++;
                                                        for (var k in G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                                            thesjarr.push(k);
                                                        }
                                                    }
                                                }
                                                if (G.DATA.shiyuanzhanchang.shiyuanshi.finish == finish){
                                                    //说明已经完成了所有事件。可以获得噬渊宝箱
                                                    G.class.ani.show({
                                                        json: "ani_shiyuanzcbx4_dh",
                                                        addTo: cc.director.getRunningScene(),
                                                        x:320,
                                                        y:568,
                                                        repeat: false,
                                                        autoRemove: true,
                                                        onload: function (node,action) {
                                                            action.playWithCallback('chuxian',false,function () {
                                                                node.removeFromParent();
                                                                for (var i=0;i<thesjarr.length;i++){
                                                                    me.map.refreshGrids(thesjarr[i]);
                                                                }
                                                                me.map.refreshGrids(G.DATA.shiyuanzhanchang.nowgzid);
                                                            });
                                                        }
                                                    })
                                                }else {
                                                    for (var i=0;i<thesjarr.length;i++){
                                                        me.map.refreshGrids(thesjarr[i]);
                                                    }
                                                }
                                            }).data(1).show();
                                        }
                                    });
                                }else {
                                    //共振失败
                                    G.class.ani.show({
                                        json: "ani_shiyuanbaoshigzsb_dh",
                                        addTo: G.frame.shiyuanzhanchang_floor.nodes.ui,
                                        repeat: false,
                                        autoRemove: true,
                                        onload: function (sbnode, action) {
                                            X.autoInitUI(sbnode);
                                            var olsjid = X.keysOfObject(oldjiequ)[0];
                                            sbnode.finds('left').finds('baoshi_$').setBackGroundImage('img/shiyuanzhanchang1/img_shs'+conf.image +'.png',1);
                                            sbnode.finds('right').finds('baoshi_$').setBackGroundImage('img/shiyuanzhanchang1/img_shs'+G.gc.syzccom.eventinfo[olsjid].image +'.png',1);
                                        },
                                        onend:function (node) {
                                            G.frame.shiyuanzhanchang_gzjg.once('willClose',function () {
                                                var sjarr = [29,30,31,32];
                                                var thesjarr = [];
                                                for (var i=0;i<sjarr.length;i++){
                                                    if (G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                                        for (var k in G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                                            thesjarr.push(k);
                                                        }
                                                    }
                                                }
                                                for (var i=0;i<thesjarr.length;i++){
                                                    me.map.refreshGrids(thesjarr[i]);
                                                }
                                            }).data(0).show();
                                        }
                                    });
                                }
                            }else {
                                //刷新所有的该事件格子
                                var sjarr = [29,30,31,32];
                                var thesjarr = [];
                                for (var i=0;i<sjarr.length;i++){
                                    if (G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                        for (var k in G.DATA.shiyuanzhanchang.eventdata[sjarr[i]]){
                                            thesjarr.push(k);
                                        }
                                    }
                                }
                                for (var i=0;i<thesjarr.length;i++){
                                    me.map.refreshGrids(thesjarr[i]);
                                }
                            }
                            //说明是第一次激活
                            G.frame.shiyuanzhanchang_map.myRole.role.refreShiyuanshi();
                        },null);
                    });
                }
            });
        },
        //运输船效果
        initEvent_feiting:function () {
          var me = this;
            var eventdata = me.data.conf.eventdata;
            var dximg = {
                '1':'2',
                '2':'1',
                '3':'4',
                '4':'3',
                '5':'5',
            };
            G.class.ani.show({
                json: "ani_shiyuanzcfeiting_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                cache:true,
                onload: function (aniNode, action) {
                    action.play('wait1',true);
                    for (var i =1;i<=8;i++){
                        aniNode.finds('feiting_'+i) && aniNode.finds('feiting_'+i).hide();
                    }
                    aniNode.finds('feiting_'+dximg[eventdata.graph]).show();
                    me.aniNode = aniNode;
                    X.autoInitUI(aniNode);
                    aniNode.setScale(.6);
                    aniNode.nodes.anniu_.hide();
                    aniNode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_ys.png',1);
                    aniNode.nodes.anniu_.click(function (sender,type) {
                        var jiequ = G.DATA.shiyuanzhanchang.yunshu;
                        if (jiequ.jiequ && jiequ.finish==0){
                            //如果有其他的运输船，就不上车
                            return G.tip_NB.show(L('syzc_16'));
                        }
                        G.DAO.shiyuanzhanchang.event(me.data.idx,false,{},function () {
                            G.frame.shiyuanzhanchang_map.refreshGrids(me.data.idx);
                            var _grid = G.frame.shiyuanzhanchang_map.indexToPosition(me.data.idx);
                            G.frame.shiyuanzhanchang_map.myRole.flashTo(_grid);
                            G.DAO.shiyuanzhanchang.walk(me.data.idx);
                            G.frame.shiyuanzhanchang_map.myRole.role.setChangeBody();
                        },null);
                    });
                }
            });
        },
        //运输船终点，阻挡，不可点击
        initEvent61:function () {
            var me = this;
            G.class.ani.show({
                json: "ani_shiyuanzcfeiting_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                cache:true,
                onload: function (aniNode, action) {
                    action.play('wait1',true);
                    me.aniNode = aniNode;
                    aniNode.finds('feiting_6').show();
                    X.autoInitUI(aniNode);
                    aniNode.setScale(.6);

                    aniNode.nodes.anniu_.hide();
                }
            });
        },
        //事件宝箱
        initEvent33:function () {
            var me = this;
            G.class.ani.show({
                json: "ani_shiyuanzcbx4_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                onload: function (aniNode,action) {
                    me.aniNode = aniNode;
                    action.gotoFrameAndPause(0);
                }
            })
        },
        //传送门
        initEvent55:function () {
            var me = this;
            G.class.ani.show({
                json: "ani_shiyuanzccsm_dh",
                addTo:me.gridContent,
                x:80,
                y:45,
                repeat: true,
                autoRemove: false,
                onload: function (aniNode,action) {
                    me.aniNode = aniNode;
                }
            })
        },
    };
    cc.each(_fun,function(v,k){
        G.class.renderGrid.prototype[ k ] = v;
    });
})();