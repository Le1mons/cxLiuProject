/**
 * Created by wlx on 2019/12/16.
 */
(function () {
    //羁绊信息界面
    var ID = 'jiban_info';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me._super(json, id, {action: true, releaseRes: false});
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
        },
        bindBtn: function () {
            var me = this;
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.btn_fh.click(function () {
                me.remove();
            });
            me.nodes.btn_bz.click(function () {
                G.frame.help.data({
                    intr:L('TS54')
                }).show();
            });
        },
        show:function(){
            var me = this;
            var _super = me._super;
            var arg = arguments;
            me.jibanid = me.data();
            me.getData(function () {
                _super.apply(me,arg);
            });
        },
        onShow: function () {
            var me = this;
            me.showToper();
            me.conf = G.gc.jiban[me.jibanid];
            me.nodes.img_bg.loadTexture("img/bg/img_jiban_bg" + me.conf.img + ".jpg",0);
            me.setContents();
            me.showjibanInfo();
            me.showHeroModel();
        },
        setContents:function(){
            var me = this;
            //召集武将
            var widArr = [];
            var heroarr = [];//存放已经召集的武将
            for(var k in me.DATA.info.uphero){
                heroarr.push(me.DATA.info.uphero[k]);
            }
            //按位置排序
            heroarr.sort(function (a,b) {
                return a.pos < b.pos ? -1:1;
            });
            me.heroPos = {};//上阵武将信息存成一个字典，key是位置
            for(var k = 0; k < heroarr.length; k++){
                me.heroPos[heroarr[k].pos] = heroarr[k];
            }

            for(var i = 0; i < me.DATA.showhero.length; i++ ){
                var heroconf = JSON.parse(JSON.stringify(G.gc.hero[me.DATA.showhero[i]]));
                var heroid = me.DATA.showhero[i];
                var zz = heroconf.zhongzu;
                if(me.heroPos[i]){//已经召集了该武将
                    heroconf = JSON.parse(JSON.stringify(G.gc.hero[me.heroPos[i].hid]));
                    zz = heroconf.zhongzu;
                    heroconf.star = me.heroPos[i].star;
                    var hero = G.class.shero(heroconf,true);
                    X.enableOutline(hero.title, "#000000", 1);
                    hero.hasnum = 1;
                    hero.pinglunid = heroconf.pinglunid;
                    hero.ifchange = true;
                    hero.star = me.heroPos[i].star;
                    if(hero.lv) hero.lv.hide();

                    //是自己的武将还是别人的
                    if(me.heroPos[i].isext == 0){//自己
                        hero.playername = P.gud.name;
                    }else {//其他玩家的
                        hero.playername = me.heroPos[i].name;
                    }
                }else {//还没有召集该武将
                    var hero = G.class.shero(heroconf,true);
                    X.enableOutline(hero.title, "#000000", 1);
                    hero.hasnum = 0;
                    hero.pinglunid = heroconf.pinglunid;
                    hero.playername = heroconf.name;
                    hero.ifchange = false;
                    hero.star = -1;
                    hero.panel_tx.setBright(false);
                    hero.setAdd(true);
                    X.shanshuo(hero.jia);
                }
                //数量
                hero.numNode(true);
                hero.txt_num.setPosition(76,76);
                hero.txt_num.setString(hero.hasnum + "/" + 1);
                if(hero.hasnum >= 1){
                    hero.txt_num.setTextColor(cc.color("#77ef6b"));
                }else {
                    hero.txt_num.setTextColor(cc.color("#ff4222"));
                }
                //名字
                hero.title.setString(hero.playername);
                hero.title.setPosition(50,-22);
                hero.pos = i;
                widArr.push(hero);
                //点击
                hero.setTouchEnabled(true);
                hero.click(function (sender) {
                    G.frame.jiban_jhjb.data({
                        plid:sender.pinglunid,
                        jibanid:me.jibanid,
                        pos:sender.pos,
                        uphero:me.DATA.info.uphero,
                        ifchange:sender.ifchange,
                        star:sender.star,
                    }).show();
                });

                //红点
                if(G.DATA.hongdian.jiban && G.DATA.hongdian.jiban.hd == 1 && G.DATA.hongdian.jiban[me.jibanid] && X.inArray(G.DATA.hongdian.jiban[me.jibanid],i)){
                    G.setNewIcoImg(hero);
                    hero.finds('redPoint').setPosition(87,87);
                }else {
                    G.removeNewIco(hero);
                }
            }
            var num = me.conf.chkhero.length;
            var starpos = (me.nodes.panel_wj_lb.width - (80*num + 20*(num-1)))/2;
            X.left(me.nodes.panel_wj_lb,widArr,.8,20,starpos);
        },
        //武将模型
        showHeroModel:function(){
            var me = this;
            //两个武将还是三个武将
            if(me.conf.chkhero.length == 2){
                me.nodes.panel_rw1.show();
                me.nodes.panel_rw2.hide();
                for(var i = 0; i < me.DATA.showhero.length; i++){
                    if(me.heroPos[i]){//已经召集了
                        X.setHeroModel({
                            parent:me.nodes['img_rw1_0' + (i+1)],
                            data:me.heroPos[i],
                            callback:function (node) {
                                node.setColor(cc.color("#ffffff"));
                            }
                        });
                    }else {
                        X.setHeroModel({
                            parent:me.nodes['img_rw1_0' + (i+1)],
                            data:{},
                            model:me.DATA.showhero[i],
                            callback:function (node) {
                                node.stopAllAni();
                                node.setColor(cc.color("#999999"));
                            }
                        });
                    }
                    me.nodes['img_rw1_0' + (i+1)].setTouchEnabled(true);
                    me.nodes['img_rw1_0' + (i+1)].heroid = me.DATA.showhero[i];
                }
            }else if(me.conf.chkhero.length == 3){
                me.nodes.panel_rw1.hide();
                me.nodes.panel_rw2.show();
                for(var i = 0; i < me.DATA.showhero.length; i++){
                    if(me.heroPos[i]){//已经召集了
                        X.setHeroModel({
                            parent:me.nodes['img_rw2_0' + (i+1)],
                            data:me.heroPos[i],
                            callback:function (node) {
                                node.setColor(cc.color("#ffffff"));
                            }
                        });
                    }else {
                        X.setHeroModel({
                            parent:me.nodes['img_rw2_0' + (i+1)],
                            data:{},
                            model:me.DATA.showhero[i],
                            callback:function (node) {
                                node.stopAllAni();
                                node.setColor(cc.color("#999999"));
                            }
                        });
                    }
                    me.nodes['img_rw2_0' + (i+1)].setTouchEnabled(true);
                    me.nodes['img_rw2_0' + (i+1)].heroid = me.DATA.showhero[i];
                }
            }
        },
        //羁绊属性
        showjibanInfo:function(){
            var me = this;
            me.nodes.listview.removeAllChildren();
            for(var i = 0; i < 4; i++){
                var list = me.nodes.list.clone();
                list.show();
                list.setTouchEnabled(false);
                list.setSwallowTouches(false);
                me.setlistItem(list,i);
                me.nodes.listview.pushBackCustomItem(list);
            }
            me.nodes.listview.setCascadeOpacityEnabled(true);
            X.forEachChild(me.nodes.listview, function(child){
                child.setCascadeOpacityEnabled(true);
            });
        },
        setlistItem:function(ui,index) {
            var me = this;
            X.autoInitUI(ui);
            var num = 0;
            for(var i in me.DATA.info.uphero){
                if(me.DATA.info.uphero[i].star >= me.conf.updata[index].star){
                    num++;
                }
            }
            if(num >= me.conf.chkhero.length){
                var str0 = X.STR(L("WUJIANGLZ_JD1"),num,me.conf.chkhero.length);
                ui.nodes.img_gou.show();
                var color = "#33ac17";
            }else {
                var str0 = X.STR(L("WUJIANGLZ_JD2"),num,me.conf.chkhero.length);
                ui.nodes.img_gou.hide();
                var color = "#a18f87";
            }
            var str = X.STR(me.conf.updata[index].desc,str0);
            var rh = X.setRichText({
                parent:ui.nodes.txt_djf,
                color:"#522a11",
                str:str,
                pos: {x: 0, y: 0},
            });

            var buffdata = me.conf.updata[index].buff;
            var buffkey = X.keysOfObject(buffdata);
            var txt0 = L(buffkey[0]);
            var txt1 = L(buffkey[1]);
            var buffNum0 = buffkey[0].indexOf("pro") != -1 ? + buffdata[buffkey[0]] / 10 + "%" : + buffdata[buffkey[0]];
            var buffNum1 = buffkey[1].indexOf("pro") != -1 ? + buffdata[buffkey[1]] / 10 + "%" : + buffdata[buffkey[1]];
            var txt = txt0 + "+" + buffNum0 + " " + txt1 + "+" + buffNum1;
            var st = X.setRichText({
                parent:ui.nodes.txt_djf1,
                color:color,
                str:txt,
                pos: {x: 0, y: 0},
            });

        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        getData:function (callback) {
            var me = this;
            connectApi('jiban_open',[me.jibanid],function (data) {
                me.DATA = data;
                callback && callback();
            })
        }
    });
    G.frame[ID] = new fun('jiban.json', ID);
})();