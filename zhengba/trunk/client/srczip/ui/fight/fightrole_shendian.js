G.class.shendianRole = G.class.Role.extend({
    ctor : function(data){
        this._super.apply(this,arguments);
        this.showName(data);
        this.hpBar(data.hp);
        return this;
    },
    showName: function (data) {
        var txt = new ccui.Text(data.name, G.defaultFNT, 22);
        txt.setAnchorPoint(0.5, 0.5);
        txt.setPosition(0, 255);
        X.enableOutline(txt, "#000000", 2);
        this.addChild(txt);
        this.roleName = txt;
        txt.zIndex = 9999;
    },
    hpBar: function (percent, cb) {
        if(!cc.isNode(this.hpJdt)) {
            this.hpbg = new ccui.Layout();
            this.addChild(this.hpbg);
            this.hpbg.setContentSize(100, 20);
            this.hpbg.setBackGroundImage("img/public/jdt/img_sp_jdt_bg.png", 1);
            this.hpbg.setPosition(-50, 220);
            this.hpbg.zIndex = 9998;

            this.hpJdt = new ccui.LoadingBar();
            this.hpbg.addChild(this.hpJdt);
            this.hpJdt.setContentSize(100, 20);
            this.hpJdt.loadTexture("img/public/jdt/img_sp_jdt.png", 1);
            this.hpJdt.setPosition(50, 10);
            this.hpJdt.setDirection(ccui.LoadingBar.TYPE_LEFT);
            this.hpJdt.setPercent(100);
        } else {
            this.hpJdt.setPercent(percent * 20);

            if(percent <= 0) {
                this.hpbg.hide();
                this.roleName.hide();
                this.die();
                this.runActions([
                    cc.fadeOut(0.3),
                    cc.callFunc(function () {
                        cb && cb();
                    })
                ]);
            }
        }
    }
});

G.class.bossRole = G.class.fightRole.extend({//锁血的Boss
    ctor : function(data){
        this._super.apply(this,arguments);
        this.nodes.txt_dj.hide();
        return this;
    },
    f5Bar: function () {
        var that = this;
        that.nodes.jdt_hp.setPercent(100);
        that.nodes.jdt_sp.setPercent(100);
    },
    changeModel: function (model) {
        var me = this;
        var data = this.data;

        me.role.removeFromParent();

        X.spine.show({
            json:'spine/'+ model +'.json',
            addTo : me,
            cache:true,x:0,y:0,z:0,
            autoRemove:false,
            rid : data.rid,
            onload : function(node){
                node.opacity = 0;
                me.role = node;
                me.role.stopAllAni();
                node.setTimeScale(this.__speedVal || 1);
                node.runActions([
                    cc.fadeIn(0.3)
                ]);
                node.setScale(1);
                node.setEndListener(null);
                node.setCompleteListener(null);
                node.setEventListener(null);

                node.setName(node.conf.rid);
                me.wait();

                cc.callLater(function(){
                    me.data.loadRoleOver && me.data.loadRoleOver(node);
                    me.loadRoleOver && me.loadRoleOver(node);
                });
            }
        });
    }
});

G.class.bossRoleHp = G.class.fightRole.extend({//不锁血的Boss
    ctor : function(data){
        this._super.apply(this,arguments);
        this.nodes.txt_dj.hide();
        if (data.issj) this.byatk = function () {};//水晶没有受击
        return this;
    },
    changeModel: function (model) {
        var me = this;
        var data = this.data;

        me.role.removeFromParent();

        X.spine.show({
            json:'spine/'+ model +'.json',
            addTo : me,
            cache:true,x:0,y:0,z:0,
            autoRemove:false,
            rid : data.rid,
            onload : function(node){
                node.opacity = 0;
                me.role = node;
                me.role.stopAllAni();
                node.setTimeScale(this.__speedVal || 1);
                node.runActions([
                    cc.fadeIn(0.3)
                ]);
                node.setScale(1);
                node.setEndListener(null);
                node.setCompleteListener(null);
                node.setEventListener(null);

                node.setName(node.conf.rid);
                me.wait();

                cc.callLater(function(){
                    me.data.loadRoleOver && me.data.loadRoleOver(node);
                    me.loadRoleOver && me.loadRoleOver(node);
                });
            }
        });
    }
});

G.class.dlRole = G.class.Role.extend({
    ctor : function(data){
        this._super.apply(this,arguments);
        this.resetPos();
        return this;
    },
    resetPos : function(ani){
        var data = this.data;
        if(!cc.isNode(this))return;
        this.zIndex = data.zIndex;
        //if(ani){
        //    this.runActions([
        //        cc.moveTo(0.1,cc.p(data.pos))
        //    ]);
        //}else{
            this.x = data.pos.x;
            this.y = data.pos.y;
        //}
    },
    showInfo : function(){
    },
    willLoadRole : function(){
    },
    loadRoleOver : function(node){
        var me = this;
        var data = me.data;
        if(!cc.isNode(node))return;
        node.scale = data.scale;
        node.scaleX *= (data.side==1?-1:1);
    },
});