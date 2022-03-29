(function () {
// ui_item_wp

// 英雄信息界面的英雄图标
G.class.shero = function (data,showName, item) {
    item = item || new G.class.sheroTemp();
    if (!data) return item;
    
    var conf = G.class.hero.getById(data.hid || data.t || data.head || data) || data;
    item.data = data;
    item.conf = conf;

    item.reuse(conf.color);

    //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
    var tx = (data.star || conf.star) > 9 ? conf.tenstarico : conf.heroico;
    if(data.fakemodel) tx = data.fakemodel;
    item.panel_tx.loadTextureNormal('ico/itemico/' + G.class.fmtItemICON(tx) + '.png', 0);
    //cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
	
    var color = conf.color;
    
    //名称
    item.titleNode(showName);
    if (showName) {
        setTextWithColor(item.title, conf.name, G.gc.COLOR[conf.star - 1]);
    }
    //等级
    item.lvNode(data.lv);
    if (data.lv) {
        item.lv.setString(data.lv);
        X.enableOutline(item.lv, "#2a1c0f", 2);
    }
    
	//数量
	item.numNode(data.showNum || data.n > 1);
    if(data.n > 1){
        item.txt_num.setString(data.n);
        item.txt_num.show();
        item.txt_num.setPosition(86, 17);
    }
    
    item.setEnabled(true);
    if(G.frame.yingxiong_fight.isShow || G.frame.jingjichang_gjfight.isShow) item.zyNode(conf.hid);
    return item;
};

G.class.shero_extneed = function (data, armyinfo, item) {
    var n;
    var color_n;
    var conf = G.class.hero.getById(armyinfo.hid);
    if(data.sxhero){
        n = false;
        color_n = -1;
    }else{
        n = true;
        color_n = data.samezhongzu ? -1 : 0;
    }

    item = item || new G.class.sheroTemp();
	item.numNode(true);




    var heroico, zhongzu, dengjielv;
    var ownNum;

    if(data.star){
        item.reuse(data.star >= 6 ? 5 : data.star + color_n);
    }else{
        item.reuse(conf.color + color_n);
    }


    if(data.samezhongzu){
        heroico = 'hero_' + (data.star >= 6?6:data.star);
        zhongzu = conf.zhongzu;
        dengjielv = data.star;
        ownNum = G.frame.yingxiong.getHeroNumByZzAndStar(conf.zhongzu,dengjielv);
    }else{
        if( data.t){
            heroico = conf.heroico;
            zhongzu = conf.zhongzu;
            dengjielv = G.class.hero.getById(data.t).star;
        }else if(data.sxhero){
            heroico = G.class.hero.getById(conf.sxhid).heroico;
            zhongzu = conf.zhongzu;
            dengjielv =5;
        }else{
            heroico = 'hero_' + (data.star >= 6?6:data.star);
            zhongzu = 0;
            dengjielv = data.star;
        }
        if(data.sxhero){
            ownNum = G.frame.yingxiong.getHeroNumByHid(conf.sxhid);
        }else{
            if(G.frame.yingxiong_xxxx.isShow){
                ownNum = G.frame.yingxiong.getHeroNumByStar(dengjielv, armyinfo);
            }else{
                ownNum = G.frame.yingxiong.getHeroNumByStar(dengjielv);
            }
        }
    }

    cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
    // item.icon.loadTexture('item/'+conf.img, ccui.Widget.LOCAL_TEXTURE);
    item.panel_tx.loadTextureNormal('ico/itemico/' + G.class.fmtItemICON(heroico) + '.png', 0);
    cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    //item.panel_tx.setPositionY(300);
    
    
    var img_jia = item.img_jia = new ccui.ImageView();
    img_jia.setName('img_jia');
    img_jia.loadTexture('img/public/img_jia.png',1);
    img_jia.setAnchorPoint(0.5, 0.5);
    img_jia.setPosition(cc.p(item.width - img_jia.width / 2 - 2, img_jia.height / 2 + 2));
    item.addChild(img_jia);
    img_jia.zIndex = 100;
    img_jia.hide();

    item.setjia = function(v){
        if(v) {
            item.img_jia.hide();
        }else{
            if (ownNum >= (data.num || data.n)) {
                var act1 = cc.fadeIn(1.5);
                var act2 = cc.fadeOut(1.5);
                var action = cc.sequence(act1, act2);
                item.img_jia.runAction(cc.repeatForever(action));
                item.img_jia.show();
            }
        }
    };
    
    
    item.setEnabled = function (v) {
    	this.zzNode();
    	this.xxNode();
        if(v){
            item.panel_tx.setBright(true);
            // item.img_jia.hide();
            dengjielv && G.class.ui_star(item.panel_xx, dengjielv, 0.7, {interval:-4});
            zhongzu && item.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
        }else{
            item.panel_tx.setBright(false);
            dengjielv && G.class.ui_star(item.panel_xx, dengjielv, 0.7, {interval:-4, ico:'img_xing_h'});
            zhongzu && item.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
        }
    };

    return item;
};

G.class.new_shero_extneed = function(data, conf, item) {
    item = item || new G.class.sheroTemp();
    item.numNode(true);

    var n;
    var color_n;
    var heroico, zhongzu, dengjielv;
    var ownNum;
    if(data.sxhero){
        n = false;
        color_n = 0;
    }else{
        n = true;
        color_n = data.samezhongzu ? -1 : 0;
    }
    if(data.star){
        item.reuse(data.star >= 6 ? 5 : data.star + color_n);
    }else{
        item.reuse(conf.color );
    }
    if(data.samezhongzu) {
        heroico = 'hero_' + (data.star >= 6?6:data.star);
        zhongzu = conf.zhongzu;
        dengjielv = data.star;
        ownNum = G.frame.yingxiong.getHeroNumByZzAndStar(conf.zhongzu,dengjielv);
    }else {
        heroico = G.class.hero.getById(conf.hid).heroico;
        zhongzu = conf.zhongzu;
        dengjielv =5;
        ownNum = G.frame.yingxiong.getHeroNumByHid(conf.hid);
    }


    cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA4444;
    item.panel_tx.loadTextureNormal('ico/itemico/' + G.class.fmtItemICON(heroico) + '.png', 0);
    cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;

    var img_jia = item.img_jia = new ccui.ImageView();
    img_jia.setName('img_jia');
    img_jia.loadTexture('img/public/img_jia.png',1);
    img_jia.setAnchorPoint(0.5, 0.5);
    img_jia.setPosition(cc.p(item.width - img_jia.width / 2 - 2, img_jia.height / 2 + 2));
    item.addChild(img_jia);
    img_jia.zIndex = 100;
    img_jia.hide();

    item.setjia = function(v){
        if(v) {
            item.img_jia.hide();
        }else{
            if (ownNum >= (data.num || data.n)) {
                var act1 = cc.fadeIn(1.5);
                var act2 = cc.fadeOut(1.5);
                var action = cc.sequence(act1, act2);
                item.img_jia.runAction(cc.repeatForever(action));
                item.img_jia.show();
            }
        }
    };


    item.setEnabled = function (v) {
        this.zzNode();
        this.xxNode();
        if(v){
            item.panel_tx.setBright(true);
            dengjielv && G.class.ui_star(item.panel_xx, dengjielv, 0.7, {interval:-4});
            zhongzu && item.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
        }else{
            item.panel_tx.setBright(false);
            dengjielv && G.class.ui_star(item.panel_xx, dengjielv, 0.7, {interval:-4, ico:'img_xing_h'});
            zhongzu && item.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + (conf.zhongzu + 1) + '_s.png', 1);
        }
    };

    return item;
};

G.class.sheroTemp = ccui.Layout.extend({
	ctor : function(){
		this._super.apply(this,arguments);
		this.reuse(0);
	},
	reuse : function(color){
		// 底图
		this.setAnchorPoint(0.5, 0.5);
    	this.setContentSize(100, 100);
    	this.scale = 1;
    	this.opacity = 255;
		this.setBackGroundImage('img/public/ico/ico_bg'+ color +'.png', 1);
		
		// 头像按钮
		if(!cc.isNode(this.panel_tx)){
			this.panel_tx = new ccui.Button();
			this.panel_tx.setName('panel_tx');
			this.addChild(this.panel_tx);
		}
		var panel_tx = this.panel_tx;
	    panel_tx.setAnchorPoint(0.5, 0.5);
	    panel_tx.setPosition(cc.p(this.width / 2, this.height / 2));
	    panel_tx.setTouchEnabled(false);
	},
    txNode: function(){
        if(!cc.isNode(this.panel_tx)){
            this.panel_tx = new ccui.Button();
            this.panel_tx.setName('panel_tx');
            this.addChild(this.panel_tx);
        }
        var panel_tx = this.panel_tx;
        panel_tx.setAnchorPoint(0.5, 0.5);
        panel_tx.setPosition(cc.p(this.width / 2, this.height / 2));
        panel_tx.setTouchEnabled(false);
    },
	titleNode : function(show){
		//名字
		if(!show){
			cc.isNode(this.title) && this.title.hide();
		}else{
			if(!cc.isNode(this.title)){
				this.title = new ccui.Text('','',24);
				this.title.setName('title');
				this.addChild(this.title);
			}
			var txtName = this.title;
			txtName.setFontName(G.defaultFNT);
	    	txtName.setPosition(cc.p(this.width / 2,15));
	    	txtName.setAnchorPoint(cc.p(0.5,0.5));
	    	txtName.show();
		}
	},
	lvNode : function(show){
		//等级
		if(!show){
			cc.isNode(this.lv) && this.lv.hide();
		}else{
			if(!cc.isNode(this.lv)){
				this.lv = new ccui.Text('1','',22);
				this.lv.setName('lv');
				this.addChild(this.lv);
			}
			var lv = this.lv;
			lv.setAnchorPoint(cc.p(1, 0.5));
	    	lv.setPosition(cc.p(this.width - lv.width / 2, this.height - lv.height / 2 - 5));
	    	lv.setFontName(G.defaultFNT);
	    	X.enableOutline(lv,'#2a1c0f',2);
            lv.zIndex = 10;
	    	lv.show();
		}
	},
	numNode : function(show){
		//数量
		if(!show){
			cc.isNode(this.txt_num) && this.txt_num.hide();
		}else{
			if(!cc.isNode(this.txt_num)){
				this.txt_num = new ccui.Text();
				this.txt_num.setName('txt_num');
				this.addChild(this.txt_num);
			}
			var txt_num = this.txt_num;
			txt_num.setContentSize(100, 30);
		    txt_num.setAnchorPoint(0.5, 0.5);
		    txt_num.setFontSize(24);
		    txt_num.setFontName(G.defaultFNT);
		    txt_num.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
		    txt_num.setTextColor(cc.color('#ffffff'));
		    X.enableOutline(txt_num, "#000000", 2);
            txt_num.zIndex = 10;

	    	txt_num.show();
		}
	},
	
	setHighLight : function (bool) {
		//兼容原逻辑
		var item = this;
        if (bool) {
            cc.isNode(item.black) && item.black.hide();
        } else {
        	if(!cc.isNode(this.black)){
				this.black = new ccui.Layout();
				this.black.setName('black');
				this.addChild(this.black);
			}
        	var black = this.black;
		    black.setAnchorPoint(0.5, 0.5);
		    black.setContentSize(100, 100);
		    black.setPosition(this.width / 2, this.height / 2);
		    
            black.setBackGroundColor(cc.color(G.gc.COLOR['n15']));
            black.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            black.setOpacity(188);
            
            black.show();
        }
    },
    
    zzNode : function(){
		if(!cc.isNode(this.panel_zz)){
			this.panel_zz = new ccui.Layout();
			this.panel_zz.setName('panel_zz');
			this.addChild(this.panel_zz);
		}
		this.panel_zz.setAnchorPoint(0.5, 0.5);
	    this.panel_zz.setContentSize(32, 32);
	    this.panel_zz.setPosition(this.panel_zz.width / 2, this.height - this.panel_zz.height / 2);
	},

    zyNode : function(hid) {
	    if(!cc.isNode(this.panel_zy)) {
	        this.panel_zy = new ccui.ImageView();
	        this.panel_zy.setName("panel_zy");

        }
        this.panel_zy.loadTexture(G.class.hero.getJobIcoByIdX(hid), 1);
        // this.panel_zy.setScale(.55);
        this.panel_zy.setAnchorPoint(0.5, 0.5);
        this.panel_zy.setPosition(16, this.height - 46);
        this.addChild(this.panel_zy);
    },
	
	xxNode : function(){
		if(!cc.isNode(this.panel_xx)){
			this.panel_xx = new ccui.Layout();
			this.panel_xx.setName('panel_xx');
			this.addChild(this.panel_xx);
		}
		this.panel_xx.setAnchorPoint(0.5, 0.5);
	    this.panel_xx.setContentSize(30, 16);
	    this.panel_xx.setPosition(this.width / 2, this.panel_xx.height);
	},
	
    setEnabled : function (v) {
    	this.zzNode();
    	this.xxNode();
        if(v){
        	this.panel_tx.setBright(true);
            G.class.ui_star(this.panel_xx, this.data.star || this.data.dengjielv || this.conf.star, .7, {interval:-4});
            this.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + ((this.conf.zhongzu * 1) + 1) + '_s.png', 1);
        }else{
        	this.panel_tx.setBright(false);
            this.panel_tx.setTouchEnabled(false);
            G.class.ui_star(this.panel_xx, this.data.star || this.data.dengjielv || this.conf.star, .7, {interval:-4, ico:'img_xing_h'});
            this.panel_zz.setBackGroundImage('img/public/ico/ico_zz' + ((this.conf.zhongzu * 1) + 1) + '_sh.png', 1);
            this.setBackGroundImage('img/public/ico/ico_bg_hui.png', 1);
        }
    },
    
    //对勾设置
    setGou : function (show) {
    	if(!show){
			cc.isNode(this.gou) && this.gou.hide();
		}else{
			if(!cc.isNode(this.gou)){
				this.gou = new ccui.ImageView('img/public/img_gou.png',1);
				this.gou.setName('gou');
                this.gou.setAnchorPoint(cc.p(0.5,0.5));
                this.gou.setPosition(cc.p(this.width / 2,this.height / 2));
                this.gou.setLocalZOrder(1000);
				this.addChild(this.gou);
                //var imgGou = this.gou;
			}else{
			    this.gou.show();
            }
            //imgGou.show();
		}
    },

    fuse: function(node) {
        G.class.ani.show({
            json: "ani_yingxionghecheng_posui",
            addTo: this.getParent(),
            x: this.x,
            y: this.y,
            cache: true,
            repeat: false,
            autoRemove: true,
            onend: function () {
                node.show();
            }
        })
    },
    
    setHP : function(v,show){
    	if(!show){
			cc.isNode(this.hpbg) && this.hpbg.hide();
			cc.isNode(this.hp) && this.hp.hide();
		}else{
			if(!cc.isNode(this.hpbg)){
				this.hpbg = new ccui.Layout();
				this.addChild(this.hpbg);
                this.hpbg.setContentSize(100, 20);
                this.hpbg.setBackGroundImage("img/public/jdt/img_sp_jdt_bg.png", 1);
                this.hpbg.setPosition(0, -20);
			}
			if(!cc.isNode(this.hp)){
				this.hp = new ccui.LoadingBar();
				this.hpbg.addChild(this.hp);
                this.hp.setContentSize(100, 20);
                this.hp.loadTexture("img/public/jdt/img_sp_jdt.png", 1);
                this.hp.setPosition(50, 10);
                this.hp.setDirection(ccui.LoadingBar.TYPE_LEFT);
			}
			var hp = this.hp;
            hp.setPercent(v);
            
            this.hpbg.show();
            this.hp.show();
		}
    },

    setNQ : function(v, show) {
	    if(!show) {
            cc.isNode(this.nqbg) && this.nqbg.hide();
            cc.isNode(this.nq) && this.nq.hide();
        }else {
            if(!cc.isNode(this.nqbg)){
                this.nqbg = new ccui.Layout();
                this.addChild(this.nqbg);
                this.nqbg.setContentSize(100, 15);
                this.nqbg.setBackGroundImage("img/public/jdt/img_sp_jdt_bg.png", 1);
                this.nqbg.setPosition(1, -24);
            }
            if(!cc.isNode(this.nq)){
                this.nq = new ccui.LoadingBar();
                this.nqbg.addChild(this.nq);
                this.nq.setContentSize(100, 15);
                this.nq.loadTexture("img/public/jdt/img_sp_jdt1.png", 1);
                this.nq.setPosition(50, 5);
                this.nq.setDirection(ccui.LoadingBar.TYPE_LEFT);
            }
            var hp = this.nq;
            hp.setPercent(v);

            this.nqbg.show();
            this.nq.show();
        }
    },
    
    refresh : function(isLoop, callback, speed){
        while (this.getChildByTag(20180711)) {
            this.getChildByTag(20180711).removeFromParent();
        }
        G.class.ani.show({
            json: "ani_shangpinshuaxin",
            addTo: this,
            x: this.width / 2,
            y: this.height / 2,
            repeat: false,
            cache:true,
            autoRemove: true,
            onload: function (node, action) {
                speed && action.setTimeSpeed(speed);
                callback && this.show();
                node.setTag(20180711);
                node.getChildren()[0].getChildren()[1].setScale(1.55);
                item.loop = node;
            },
            onend: function (node, action) {
                callback && callback();
            }
        })
    },
    
    setBlue : function(){
    	var me = this;
        G.class.ani.show({
            json: "ani_chouka_chuxian",
            addTo: this,
            x: 54,
            y: -38,
            repeat: false,
            cache:true,
            autoRemove: true,
            onload: function (node, action) {
                action.gotoFrameAndPause(0);
                me.bule = action;
            }
        })
    },

    setSelected: function() {
	    //选中特效
        if(cc.isNode(this.getChildByName("selected"))) return;
        G.class.ani.show({
            json: "ani_mijing_yingxiongman",
            addTo: this,
            x: this.width / 2,
            y: this.height / 2,
            repeat: false,
            cache:true,
            autoRemove: true,
            onload: function (node) {
                node.setName("selected");
            },
        })
    },

    setArtifact: function(id, isBuffAni) {
	    //神兵加身动画
        var that = this;

        while (this.getChildByName("artifact")) {
            this.getChildByName("artifact").removeFromParent();
        }

        this.sqid = id;
	    if(!id) return;

        G.class.ani.show({
            json: "shenbing_ico_0" + id,
            addTo: this,
            x: 54,
            y: 50,
            cache: true,
            repeat: true,
            autoRemove: false,
            onload: function (node, action) {
                node.setName("artifact");
                node.setScale(1);
            }
        });

        if(G.DATA.artifact && G.DATA.artifact[id] && isBuffAni && !G.DATA.isPiao) {
            G.DATA.isPiao = true;
            var conf = G.class.shenqi.getBuffByIdAndLv(id, G.DATA.artifact[id].lv);
            var keys = X.keysOfObject(conf.buff);
            var arr = [];

            for (var i in keys) {
                var key = keys[i];
                var img = new ccui.ImageView("img/public/ico/ico_" + (key == "atk" ? "gj" : "sm") + ".png", 1);
                var str = "<font node=1></font>" + "+" + conf.buff[key];
                var rh = new X.bRichText({
                    size: 20,
                    maxWidth: 300,
                    lineHeight: 10,
                    color: key == "atk" ? "#fff720" : "#00ff30",
                    family: G.defaultFNT
                });
                rh.text(str, [img]);
                rh.setAnchorPoint(0.5, 0.5);
                arr.push(rh);
            }
            var bg = new ccui.ImageView("img/public/jy_2.png", 1);
            bg.setAnchorPoint(0.5, 0.5);
            bg.setScale9Enabled(true);
            bg.setContentSize(400, 50);
            ccui.helper.doLayout(bg);
            X.center(arr, bg, {
                callback: function (node) {
                    node.setPositionY(12);
                }
            });
            bg.zIndex = 99999;
            if(G.frame.yingxiong_fight.isShow) G.frame.yingxiong_fight.ui.addChild(bg);
            else G.frame.jingjichang_gjfight.ui.addChild(bg);
            bg.setPosition(C.WS.width/2, C.WS.height / 2);
            bg.runActions([
                cc.moveBy(0.9, 0, 0),
                cc.spawn(cc.scaleTo(0.4, 0.1, 0.1), cc.fadeOut(0.4)),
                cc.callFunc(function () {
                    G.DATA.isPiao = false;
                }),
                cc.removeSelf()
            ]);
        }
    },
	
	onExit : function(){
		this._super.apply(this,arguments);
		//G.class.sheroTempCache.push(this);
	}
});

})();