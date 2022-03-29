(function(){
    // 角色
    G.class.shiyuanzhanchang_player = G.class.mapRole.extend({
        ctor : function(data){
            var me = this;
            this._super(data);
        },

        syncWalkInfo : function(grid, callback){
            var me = this;
            var node = me.map.get( me.map.gridToId(grid) );

            G.DAO.shiyuanzhanchang.walk(node.data.idx,function(){
                callback && callback();
            });
        },

        // 打开周围迷雾, 并同步
        moveToGrid : function(grid){
            var me = this;
            me.map.lightGrids(grid);

            // if(me.map.isSameGrid(grid, me.data.moveTargetGrid)){
            //     me.map.syncFog();
            // }
            me.setDirection( me.data.fx );
        },
        //走格子失败，传送到复活点位置
        moveTofuhuodian:function(){
            var me = this;
            var gid = X.keysOfObject(G.DATA.shiyuanzhanchang.eventdata['34'])[0];
            var grid = G.frame.shiyuanzhanchang_map.indexToPosition(gid);
            G.frame.shiyuanzhanchang_map.myRole.flashTo(grid,true);
            G.DAO.shiyuanzhanchang.walk(gid);
        },
        setBody : function(hid){
            var me = this;

            while(me.getChildByTag(456456456)){
                me.getChildByTag(456456456).removeFromParent();
            }
            var teamid = G.frame.shiyuanzhanchang_floor.currerentT;
            var state = G.frame.shiyuanzhanchang_floor.getTheteamState(teamid);
            var newRole = new G.class.syzcModel({
                'type':'me',
                'model':hid,
                'scale':0.5,
                'nowhp':state.nowhp,
                'maxhp':state.maxhp
            });
            newRole.setTag(456456456);
            newRole.setPosition(76, 104);
            newRole.hideH5bar();
            newRole.f5Bar();
            me.role = newRole;
            me.addChild(newRole);
        },
    });
})();
G.class.syzcModel = ccui.Layout.extend({
    ctor: function (data) {
        this.data = data;
        this.type = this.data.type;
        this.model = this.data.model;
        this.nowhp = this.data.nowhp;
        this.maxhp = this.data.maxhp;
        this.dead = false;
        this._super.apply(this,arguments);
        this.initThis();
        this.initShijian();
        if (this.type == 'me') {
            this.addTouch();
            this.refreShiyuanshi();
        }
        return this;
    },
    initThis: function () {
        this.setAnchorPoint(0.5, 0);
        this.setContentSize(80, 100);
        this.showRole();
    },
    initShijian:function(){
        if (!cc.isNode(this)) return;
        this.shijian = new ccui.Layout();
        this.shijian.setName('shijian');
        this.shijian.setContentSize(50, 50);
        this.shijian.setAnchorPoint(cc.p(0.5,0.5));
        this.shijian.setPosition(cc.p(55,140));
        this.shijian.setLocalZOrder(1000);
        this.shijian.setScale(1);
        this.addChild(this.shijian);
    },
    atk: function (num,idx,type,callback) {
        var me = this;

        me.setAct('atk',false,function(){
            me.nowhp-=num;
            if (me.nowhp<=0) {
                me.dead = true;
                me.die();
            } else {
                me.spine.runAni(0,'wait',true);
            }
            me.spine.runAni(0,'wait',true);
            callback && callback(idx,type);
        });
    },
    wait:function(){
        var me = this;
        me.spine && me.spine.runAni(0,'wait',true);
    },
    die:function(callback){
      var me = this;
        me.setAct('die',false,function(){
            callback && callback();
        });
    },
    setAct : function(actName,repeat,callback){
        var me = this;
        me.spine.stopAllAni();
        me.spine.setEventListener(null);
        me.spine.setEventListener(function(traceIndex,event){
            cc.log(event.data.name);
            if(event.data.name == 'hit'){
                callback && callback.call(me);
            }
        });
        me.spine.runAni(0,actName,repeat);
        return true;
    },
    hmpChange : function(data){
        if(!cc.isNode(this))return;
        if(!this.getParent()) return;
        var that = this;
        var label;
        var aniType=1; //1=常规伤害 2=暴击 3=加血
        var num = parseInt(data);
        if(num>0){
            label = new cc.LabelBMFont("+"+ num, "img/fnt/sz_zd5.fnt"); //加血
            aniType=3;
        }else{
            var showNum = Math.abs(num) >= 1000000 ? parseInt(num /10000) + "w" : num;
            label = new cc.LabelBMFont(showNum, "img/fnt/sz_zd1.fnt"); //普通攻击
            aniType=1;
        }
        label.y = this.y  + X.rand(80,100);
        label.x = this.x + X.rand(-30,30);
        label.zIndex = 1400;
        that.getParent().addChild(label);

        var xfx=1;

        if(aniType==1){
            label.runActions([
                cc.jumpBy(0.3,cc.p(
                    X.rand(30,50) * xfx,
                    X.rand(20,60)
                ), 50, 1),

                cc.jumpBy(0.15,cc.p(
                    20 * xfx,
                    10
                ), 10, 1),

                cc.fadeOut(0.7),
                cc.removeSelf()
            ]);
        }else if(aniType==3){
            label.x = this.x + X.rand(-60,60);
            label.y = this.y  + X.rand(80,150);
            label.opacity = 0;
            label.setScale(0.1);
            label.runActions([
                [
                    cc.fadeIn(0.2),
                    cc.scaleTo(0.2,1,1),
                    cc.moveBy(.2,cc.p(that.data.side==1?40:-40,40))
                ],
                cc.moveBy(.4,cc.p(0,10)),
                cc.callFunc(function(){
                    label.runActions([
                        [
                            cc.fadeOut(0.2),
                            cc.scaleTo(0.2,0.1,0.1),
                            cc.moveBy(.2,cc.p(0,40))
                        ],
                        cc.removeSelf()
                    ]);
                })
            ]);
        }
    },
    f5Bar : function(reduceHp){
        var that = this;
        if (!cc.isNode(that.info.nodes.jdt_hp)) {
            return;
        }

        // if (!that.nowhp || !that.maxhp){
        //     per = 0;
        // }else {
        var nowhp = that.nowhp - (reduceHp||0);
           var per =  parseInt(parseInt(nowhp)/parseInt(that.maxhp)*100);
        if (!per && per!=0) per = 0;
        // }
        if (that.nowhp<=0)that.dead = true;
        //刷新血条
        // cc.log('现在血量'+that.nowhp);
        // cc.log('最大血量'+that.maxhp);
        // cc.log('进度——————————'+per);
        // that.info.nodes.jdt_hp_d.setPercentAni(per);
        that.info.nodes.jdt_hp.setPercent(per);
        that.info.nodes.jdt_sp.hide();
        that.info.finds('panel_bg_jdt').hide();
    },
    showRole: function () {
        var me = this;
        X.setHeroModel({
            parent: me,
            data: {},
            model: me.data.model,
            scaleNum: me.data.scale || 1,
            direction: 1,
            noParentRemove: true,
            callback:function () {
                me.wait();
                if (me.type == 'me') {
                    me.setChangeBody();
                    me.setHeroNowState();
                }
            }
        });
        me.willLoadRole && me.willLoadRole();
    },
    willLoadRole : function(){
        var me = this;
        this.info = G.frame.shiyuanzhanchang_floor.nodes.list_gw.clone();
        this.info.show();
        if (this.type=='boss'){
            this.info.setPosition(30,230);
        } else {
            this.info.setPosition(15,130);
        }
        this.addChild(this.info);
        X.autoInitUI(this.info);
        this.info.nodes.txt_dj.setString('');
        // me.nodes.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (me.data.zhongzu + 1) + '_s.png', 1);
        this.info.nodes.panel_zz.hide();
    },
    zhiliaoani:function(callback){
        var me = this;
        G.class.ani.show({
            json: "ani_shiyuanzczhiliao_dh",
            addTo: me,
            repeat: false,
            autoRemove: true,
            onend: function (node) {
                callback && callback();
            }
        })
    },
    fuhuoani:function(callback){
        var me = this;
        G.class.ani.show({
            json: "ani_shiyuanzcfuhuo_dh",
            addTo: me,
            repeat: false,
            autoRemove: true,
            onend: function (node) {
                callback && callback();
            }
        })
    },
    showH5bar:function(){
        var me = this;
        me.info.show();
    },
    hideH5bar:function(){
        var me = this;
        me.info.hide();
    },
    refreShiyuanshi:function(){
      this.shijian.removeAllChildren();
      this.shijian.removeBackGroundImage();
      var jiequ = G.DATA.shiyuanzhanchang.shiyuanshi.jiequ;
      var sjid = X.keysOfObject(jiequ)[0];
      var eventinfo = G.gc.syzccom.eventinfo[sjid];
      if (X.isHavItem(jiequ)){
          var bg = new ccui.Layout();
          bg.setName('bg');
          bg.setContentSize(50, 50);
          bg.setAnchorPoint(cc.p(0.5,0.5));
          bg.setPosition(cc.p(25,25));
          bg.setLocalZOrder(1);
          bg.setScale(.4);
          bg.setBackGroundImage('img/shiyuanzhanchang1/img_shs'+eventinfo.image +'.png',1);
          this.shijian.addChild(bg);
          this.shijian.setBackGroundImage('img/shiyuanzhanchang/img_fg.png',1);

      }
    },
    setChangeBody:function(){
        var me = this;
        var data = G.DATA.shiyuanzhanchang;
        if (data.yunshu && data.yunshu.jiequ){
            me.setScaleX(1);
            me.spine && me.spine.hide();
            if (me.getChildByTag(4546123)){
                me.getChildByTag(4546123).removeFromParent();
            }
            // else {
                var dximg = {
                    '1':'2',
                    '2':'1',
                    '3':'4',
                    '4':'3',
                    '5':'5',
                };
                G.class.ani.show({
                    json: "ani_shiyuanzcfeiting_dh",
                    addTo:me,
                    repeat: true,
                    x:45,
                    y:30,
                    cache:true,
                    autoRemove: false,
                    onload: function (ysnode, action) {
                        ysnode.setTag(4546123);
                        action.play('wait2',true);
                        ysnode.finds('feiting_'+dximg[G.DATA.shiyuanzhanchang.eventdata['27'][data.yunshu.jiequ].graph]).show();
                        ysnode.setScale(.6);
                        me.yscNode = ysnode;
                        X.autoInitUI(ysnode);
                        ysnode.zIndex = 100;
                        ysnode.nodes.anniu_.setBackGroundImage('img/shiyuanzhanchang/btn_xc.png',1);
                        ysnode.nodes.anniu_.click(function (sender,type) {
                            //如果是当前所站的格子市终点，但不是这条船的终点，就不能下车
                            if (G.DATA.shiyuanzhanchang.eventgzid[G.DATA.shiyuanzhanchang.nowgzid] && G.DATA.shiyuanzhanchang.eventgzid[G.DATA.shiyuanzhanchang.nowgzid] == '28'){
                                return G.tip_NB.show(L('syzc_17'));
                            }
                            //点击下车,随机附近八个格子的一个没有事件的位置，走到上边
                            var togrid = G.frame.shiyuanzhanchang_map.getYscGroudgz();
                            var oldgzid = G.DATA.shiyuanzhanchang.nowgzid;
                            G.DAO.shiyuanzhanchang.event(G.DATA.shiyuanzhanchang.yunshu.jiequ,false,{'xiache':togrid},function () {
                                G.frame.shiyuanzhanchang_map.myRole.role.setChangeBody();
                                //传送到这个格子上
                                G.frame.shiyuanzhanchang_map.refreshGrids(oldgzid);
                                var grid = G.frame.shiyuanzhanchang_map.indexToPosition(togrid);
                                G.frame.shiyuanzhanchang_map.myRole.flashTo(grid);
                                G.frame.shiyuanzhanchang_map.refreshGrids(togrid);
                            },null);
                        });
                    },
                });
            // }
        } else {
            me.spine && me.spine.show();
            if (me.getChildByTag(4546123)){
                me.getChildByTag(4546123).removeFromParent();
            }
            me.yscNode = undefined;
            delete me.yscNode;
        }
    },
    setHeroNowState:function(){
        var me = this;
        var siwang = G.frame.shiyuanzhanchang_floor.getAllherostate();
        if (!siwang){
            me.removeBackGroundImage();
            return;
        }
        me.spine.hide();
        me.setBackGroundImage('ico/syzc/img_zk0.png',0);
    }
    ,
    addTouch: function () {
        var me = this;
    }
});
