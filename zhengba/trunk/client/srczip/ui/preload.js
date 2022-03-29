(function(){

var ID = 'preload';

var fun = X.bUi.extend({
    ctor: function(json,id){
        //this.cacheFrame = true;
        this._super(json,id);
    },
    show : function(task,callback){
        /*
         {
             taskType:'loadFight',
             taskList:taskList,
             endCall : function(){
             }
         }
        * */
        var me = this;
        if(typeof(task)=='object'){
            me.DATA = task;
        }else{
            me.DATA = {
                taskList:[],
                taskType:task,
                endCall : callback
            }
        }

        var _super = me._super;
        X.ccui(this._json,function(loader){
            _super.call(me);
        });
    },
    onOpen : function(){
        var me = this;

        // me.text = me.ui.nodes.txt_nr;
        me.text = me.ui.nodes.txt_loading_jdt;
        me.jdt = me.ui.nodes.img_loading_jdt;
        me.imgBg2 = me.ui.nodes.bg_denglu;
        me.imgBg2.removeBackGroundImage();
    },

    setProgPercent : function(v){
        if(v==null || isNaN(v))v=99;
        this.jdt.setPercent(v);
        this.ui.finds("Image_5").setVisible(true);
    },
    setProgText : function(v,v1){
        this.text.setString((v + v1) || '');
    },
    doTaskList : function(callback){
        var me = this;
        me.DATA.taskIndex = 0;
        me.DATA.taskMax = me.DATA.taskList.length;

        X.async( me.DATA.taskList ,function(){
            me.DATA.taskIndex = me.DATA.taskMax = 0;
            me.DATA.endCall && me.DATA.endCall.call(me);
            callback && callback();
            //me.hide();
        },0);
    },
    f5Prog : function(){
        var me = this;
        me.DATA.taskIndex ++ ;
        var v = parseInt(me.DATA.taskIndex/me.DATA.taskMax * 100,10);
        me.setProgPercent( v  +  14);
    },
    onShow: function () {
        var me = this;

        me.setProgPercent(0);
        me.ui.finds("Image_5").setVisible(false);
        me.setProgText(L('load'),L('loadingRes'));

        me.ui.setTimeout(function(){
            me['task_'+ me.DATA.taskType] && me['task_'+ me.DATA.taskType]();
        },20);

        me.changeBgImg();
    },

    task_reconn : function(){
        var me = this;
        me.setProgText(L('RECONNSVR'),'');
        me.setProgPercent(0);
    },

    task_loadres : function(){
        var me = this;
        var res = (R && R.preload) || [];
        if(cc.sys.isNative){
            me.setProgPercent(99);
            me.ui.setTimeout(function(){
                me.DATA.endCall && me.DATA.endCall.call(me);
            },200);
        }else{
            cc.loader.load(res,function (result, count, loadedCount) {
                var percent = parseInt(((loadedCount+1) / count * 100) | 0);
                me.setProgText(L('load'),X.STR(L('loadingbase'),percent));
                me.setProgPercent(percent);
            }, function () {
                me.DATA.endCall && me.DATA.endCall.call(me);
            });
        }
    },
    task_loadJSON : function(){
        var me = this;
        var jsonList = {
            //"city":{"file":folder+"samejson/city.json",onload:function(json){
            //    G.gc.cityIndex=[];
            //    for(var k in json){
            //        G.gc.cityIndex[ json[k].idx ] = k;
            //    }
            //}},

            "extservers": {"file": "json/extservers.json"},
            "menu": {"file": "json/menu.json"},
            "skillani": {
                "file": "json/skillani.json"
            },
            "skill": {
                "file": "samejson/skill.json"
            },
            "tiaozhuan": {
                "file": "json/tiaozhuan.json"
            },
            "loading": {
                "file": "json/loading.json"
            },
            "hero": {"file": "samejson/hero.json"},
            "buff": {"file": "samejson/buff.json"},
            "equip": {"file": "samejson/equip.json"},
            "equiptz": {"file": "samejson/equiptz.json"},
            "herocom": {"file": "samejson/herocom.json"},
            "herostarup": {"file": "samejson/herostarup.json"},
            "attricon": {"file": "samejson/attricon.json"},
            "baoshi": {"file": "samejson/baoshi.json"},
            "item": {"file": "samejson/item.json"},
            "shipin": {"file": "samejson/shipin.json"},
            "shipincom": {"file": "samejson/shipincom.json"},
            "tanxian": {"file": "samejson/tanxianmap.json"},
            "tanxian_com": {"file": "samejson/tanxiancom.json"},
            "diaoluo": {"file": "samejson/diaoluo.json"},
            "zaoxing": {"file": "samejson/zaoxing.json"},
            "herogrow": {"file": "samejson/herogrow.json"},
            "herohecheng": {"file": "samejson/herohecheng.json"},
            "xstask": {"file": "samejson/xstask.json"},
            "xscom": {"file": "samejson/xstaskcom.json"},
            "shop": {"file": "samejson/shop.json"},
            "shopitem": {"file": "samejson/shopitem.json"},
            'opencond':{'file':'samejson/opencond.json'},
            'worldtree':{'file':'samejson/worldtree.json'},
            "dafashita": {
                "file": "samejson/fashita.json"
            },
            "anniversary": {
                "file": "samejson/anniversary.json"
            },
            "zypkjjccom": {
                "file": "samejson/zypkjjccom.json"
            },
            "tongguanprize": {
                "file": "samejson/fashitacom.json"
            },
            "fightcom": {
                "file": "samejson/fightcom.json"
            },
            "xuyuanchi": {"file": "samejson/xuyuanchi.json"},
            "npc": {"file": "samejson/npc.json"},
            "mrsl": {"file": "samejson/meirishilian.json"},
            "mrslcon": {"file": "samejson/meirishiliancon.json"},
            "chouka": {"file": "samejson/jitan.json"},
            "yuanzheng_xx": {"file":"samejson/shizhijun_xx.json"},
            "yuanzheng_conf": {"file": "samejson/shizijun.json"},
            "gonghui": {"file": "samejson/gonghui.json"},
            "gonghui_fuben": {"file": "samejson/gonghui_fuben.json"},
            "guide": {"file": "json/guide.json"},
            'championtrial':{"file": "samejson/championtrial.json"},
            "task": {"file":"samejson/task.json"},
            "friend": {"file":"samejson/friend.json"},
            "vip": {"file":"samejson/vip.json"},
            "vip_tequan": {"file":"samejson/vip_tequan.json"},
            "kuafuzhan":{"file":"samejson/crosszb.json"},
            "chongzhihd": {
                "file": "samejson/chongzhihd.json"
            },
            "player": {
                "file": "samejson/playerlv.json"
            },
            "shouchong": {
                "file": "samejson/shouchong.json"
            },
            "xiaoyueka": {
                "file": "samejson/yuka.json"
            },
            "weekmonth": {
                "file": "samejson/weekmonthlibao.json"
            },
            "support" :{
                "file": "samejson/support.json"
            },
            "kaifukuanghuan": {
                "file": "samejson/kaifukuanghuan.json"
            },
            "kaifukuanghuan_jdt": {
                "file": "samejson/kaifukuanghuan_extend.json"
            },
            "open": {
                "file": "samejson/open.json"
            },
            "shilianzt": {
                "file": "samejson/shilianzt.json"
            },
            "shilianztcom": {
                "file": "samejson/shilianztcom.json"
            },
            "shilianztbuff": {
                "file": "samejson/shilianztbuff.json"
            },
            "sanzhounian": {
                "file": "samejson/zhounian3.json"
            },
            "woyaobianqiang": {
                "file": "samejson/woyaobianqiang.json"
            },
            "shenqicom": {
                "file": "samejson/shenqicom.json"
            },
            "shenqitask": {
                "file": "samejson/shenqitask.json"
            },
            "shenqibuff": {
                "file": "samejson/shenqibuff.json"
            },
            "shenqiskill": {
                "file": "samejson/shenqiskill.json"
            },
            "yuwaizhengba": {
                "file": "samejson/crosszb.json"
            },
            "ciridenglu": {
                "file": "samejson/giverarepet.json"
            },
            "special": {
                "file": "samejson/special.json"
            },
            "watchercom": {
                "file": "samejson/watchercom.json"
            },
            "meltsoul": {
                "file": "samejson/meltsoul.json"
            },
            "meltsoulcom": {
                "file": "samejson/meltsoulcom.json"
            },
            "meirishouchong": {
                "file": "samejson/meirishouchong.json"
            },
            "watcher": {
                "file": "samejson/watcher.json"
            },
            "tongyu": {
                "file": "samejson/tongyu.json"
            },
            "gonghuizhengfeng": {
                "file": "samejson/guildcompeting.json"
            },
            "glyph": {
                "file": "samejson/glyph.json"
            },
            "glyphcom": {
                "file": "samejson/glyphcom.json"
            },
            "glyphextra": {
                "file": "samejson/glyphextra.json"
            },
            "wangzherongyao": {
                "file": "samejson/crosswz.json"
            },
            "shendianmowang": {
                "file": "samejson/shendianmowang.json"
            },
            "qyjj": {
                "file": "samejson/tuanduifuben.json"
            },
            "xianshizhaomu": {
                "file": "samejson/xianshi_zhaomu.json"
            },
            "xinnianrenwu": {
                "file": "samejson/newyear_task.json"
            },
            "ghrw": {
                "file": "samejson/gonghui_teamtask.json"
            },
            "stagefund": {
                "file": "samejson/stagefund.json"
            },
            "zbfm": {
                "file": "samejson/equip_enchant.json"
            },
            "sddlcom": {
                "file": "samejson/dungeoncom.json"
            },
            "sddl": {
                "file": "samejson/dungeon.json"
            },
            "monthfund": {
                "file": "samejson/monthfund.json"
            },
            "fbzc": {
                "file": "samejson/storm.json"
            },
            "skipFight": {
                "file": "json/skipFight.json"
            },
            "openSeverTime": {
                "file": "json/openSeverTime.json"
            },
            "mjzh": {
                "file": "samejson/mjzh.json"
            },
            "flag": {
                "file": "samejson/flag.json"
            },
            "kaifulibao": {
                "file": "samejson/kaifulibao.json"
            },
            "defhero": {
                "file": "json/defaulthero.json"
            },
            "skin": {
                "file": "samejson/accessories.json"
            },
            "skincom": {
                "file": "samejson/accessoriescom.json"
            },
            "maze": {
                "file": "samejson/maze.json"
            },
            "mazecom": {
                "file": "samejson/mazecom.json"
            },
            "mazerelic": {
                "file": "samejson/mazerelic.json"
            },
            "longqishilian": {
                "file": "samejson/dragonknight.json"
            },
            "hjkg": {
                "file": "samejson/goldminer.json"
            },
            "slhd": {
                "file": "samejson/trial.json"
            },
            "slhd1": {
                "file": "samejson/trial1.json"
            },
            "juewei": {
                "file": "samejson/title.json"
            },
            "jueweicom": {
                "file": "samejson/titlecom.json"
            },
            "getResources": {
                "file": "samejson/getResources.json"
            },
            "comProblem": {
                "file": "samejson/comProblem.json"
            },
            "xkfb": {
                "file": "samejson/voidstorm.json"
            },
            "dianjin": {
                "file": "samejson/dianjin.json"
            },
            "pet": {
                "file": "samejson/pet.json"
            },
            "petcom": {
                "file": "samejson/petcom.json"
            },
            "petup": {
                "file": "samejson/petupgrade.json"
            },
            "scsj": {
                "file": "samejson/crystal.json"
            },
            "returnhome": {
                "file": "samejson/returnhome.json"
            },
            "qwcj": {
                "file": "samejson/qwcj.json"
            },
            "event": {
                "file": "samejson/event.json"
            },
            "jiban": {
                "file": "samejson/jiban.json"
            },
            "wabao": {
                "file": "samejson/find_dragon.json"
            },
            "wjzz": {
                "file": "samejson/five_army.json"
            },
            "pfyyl": {
                "file": "samejson/pifu_lottery.json"
            },
            'equipstep': {
                "file": "json/equipshengjie.json"
            },
            'zhengtao': {
                "file": "samejson/zhengtao.json"
            },
            'chuanshuofight': {
                "file": "samejson/chuanshuofight.json"
            },
            "csdt": {
                "file": "samejson/csdt.json"
            },
            "yjkg": {
                "file": "samejson/yjkg.json"
            },
            "yjkgskill": {
                "file": "samejson/yjkgskill.json"
            },
            "wenwuinfo": {
                "file": "samejson/wenwuinfo.json"
            },
            "wenwu": {
                "file": "samejson/wenwu.json"
            },
            "wztt": {
                "file": "samejson/ladder.json"
            },
            "yijiroute": {
                "file": "samejson/yijiroute.json"
            },
            "newchapter": {
                "file": "samejson/newchapter.json"
            },
            "wuhun" : {
                "file": "samejson/wuhun.json"
            },
            "wuhuncom" : {
                "file": "samejson/wuhuncom.json"
            },
            "todaylibao": {
                "file": "samejson/todaylibao.json"
            },
            "jthl": {
                "file": "samejson/jthl.json"
            },
            "wangzhezhaomu": {
                "file": "samejson/wangzhezhaomu.json"
            },
            "shoplist": {
                "file": "json/shoplist.json"
            },
            "gonghuisiege": {
                "file": "samejson/gonghuisiege.json"
            },
            "huodongsort": {
                "file": "json/fulihuodongsort.json"
            },
            "djjj": {
                "file": "samejson/djjj.json"
            },
            "sdjj": {
                "file": "samejson/sdjj.json"
            },
            "lifetimecard": {
                "file": "samejson/lifetimecard.json"
            },
            "midautumn": {
                "file": "samejson/midautumn.json"
            },
            "wjtf": {
                "file": "samejson/wujintafang.json"
            },
            "newyear": {
                "file": "samejson/newyear.json"
            },
            "double11": {
                "file": "samejson/double11.json"
            },
            "herotheme": {
                "file": "samejson/herotheme.json"
            },
            "mjhj": {
                "file": "samejson/mjhj.json"
            },
            "gpjjcplayerlv": {
                "file": "samejson/gpjjcplayerlv.json"
            },
            "gongpingjjc": {
                "file": "samejson/gongpingjjc.json"
            },
            "yuanxiao": {
                "file": "samejson/riddles.json"
            },
            "xnhd": {
                "file": "samejson/herohot.json"
            },
            "zhishujie": {
                "file": "samejson/planttrees.json"
            },
            'niudan': {"file": "samejson/niudan.json"},
            "jgsw": {"file": "samejson/jgsw.json"},
            "openforshow": {"file": "samejson/openforshow.json"},
            "wyhd": {"file": "samejson/labour.json"},
            "lht": {"file": "samejson/lianhunta.json"},
            "lhtcom": {"file": "samejson/lianhuntacom.json"},
            "xyx": {"file": "samejson/xiaoyouxi.json"},
            "xyx_level": {"file": "samejson/xiaoyouxi_level.json"},
            "longzhou": {"file": "samejson/longzhou.json"},
            "xiariqingdian": {"file": "samejson/xiariqingdian.json"},
            "qixi":{"file": "samejson/qixi.json"},
            "baoshijinglian":{"file":"samejson/baoshijinglian.json"},
            "midautumn2":{"file":"samejson/midautumn2.json"},
            "syzccom":{"file":"samejson/syzccom.json"},
            "syzcmapinfo":{"file":"samejson/syzcmapinfo.json"},
            "symap1":{"file":"samejson/symap1.json"},
            "symap2":{"file":"samejson/symap2.json"},
            "symap3":{"file":"samejson/symap3.json"},
            "symap4":{"file":"samejson/symap4.json"},
            "symap5":{"file":"samejson/symap5.json"},
            "symap6":{"file":"samejson/symap6.json"},
            "symap7":{"file":"samejson/symap7.json"},
            "symap8":{"file":"samejson/symap8.json"},
            "symap9":{"file":"samejson/symap9.json"},
            "symap10":{"file":"samejson/symap10.json"},
            "symap11":{"file":"samejson/symap11.json"},
            "symap12":{"file":"samejson/symap12.json"},
            "syevent":{"file":"samejson/syevent.json"},
            "christmas":{"file":"samejson/christmas.json"},
            "newyear3":{"file":"samejson/newyear3.json"},
            "yuanxiao2022":{"file":"samejson/yuanxiao3.json"},
        };

        for(var k in jsonList){
            (function(key){
                me.DATA.taskList.push(function(callback){
                    //me.setProgText(L('load')+L('loadConfig'),key);
                    me.setProgText(L('load'),L('loadConfig'));
                    //me.setProgText(L('loadConfig'));
                    me.f5Prog();

                    X.loadJSON(jsonList[key].file , function(err,json){
                        G.gc[key] = json;
                        jsonList[key].onload && jsonList[key].onload(G.gc[key]);
                        callback && callback();
                    });
                });
            })(k);
        }
        me.doTaskList(function () {
            G.gc.sp = JSON.parse(JSON.stringify(G.gc.shipin));

            Object.defineProperty(G.gc, 'shipin', {
                get: function () {
                    if (!G.gc.getSp) {
                        G.gc.getSp = new Proxy({}, {
                            get: function (target, k) {
                                k = k.split('_')[0];
                                if (G.gc.sp[k]) {
                                    return G.gc.sp[k];
                                } else {
                                    cc.warn('shipin.json 找不到 ', k);
                                }
                            }
                        });
                    }
                    return G.gc.getSp;
                }
            });

            // G.gc.hr = G.gc.hero;
            // Object.defineProperty(G.gc, 'hero', {
            //     get: function () {
            //         if (!G.gc.getHr) {
            //             G.gc.getHr = new Proxy({}, {
            //                 get: function (target, k) {
            //                     k = k.split('_')[0];
            //                     if (G.gc.hr[k]) {
            //                         return JSON.parse(JSON.stringify(G.gc.hr[k]));
            //                     } else {
            //                         cc.warn('hero.json 找不到 ', k);
            //                     }
            //                 }
            //             });
            //         }
            //         return G.gc.getHr;
            //     }
            // });
            G.gc.shipincom.awake.skillList = {};
            cc.each(G.gc.shipincom.awake.skill, function (skill, index) {
                G.gc.shipincom.awake.skillList[skill.id] = skill;
            });
        });
    },
    task_loadView : function(){
        var me = this;
        var viewList = [
            // 'zzsys_jn_item',
        ];

        for(var i=0;i<viewList.length;i++){
            (function(key){
                me.DATA.taskList.push(function(callback){
                    me.setProgText(L('load'),L('loadConfig'));
                    me.f5Prog();
                    if(cc.sys.isNative){
                        //客户端view是同步加载的，无需预加载，按需即可
                        return callback && callback();
                    }

                    G.class[key].loadJson(function(){
                        callback && callback();
                    });
                });
            })(viewList[i]);
        }

        me.doTaskList();
    },
    task_loadbaseData : function(){
        var me = this;
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadYingXiong'));
            me.f5Prog();
            G.frame.yingxiong.getData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadBeiBao'));
            me.f5Prog();
            G.frame.beibao.getData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadZhuangBei'));
            me.f5Prog();
            G.frame.beibao.getZbData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.beibao.getShipinData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadGlyph'));
            me.f5Prog();
            G.frame.beibao.getGlyphData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.yingxiong.getHeroCellData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.yingxiong.getSkin(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.zhuangbeifumo.getData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.scsj.getData(1, function(){
                for (var pid in G.DATA.pet) G.DATA.pet[pid].tid = pid;
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            X.getMyCity(function () {
                callback && callback();
            });
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.chat.getDBPB(function () {
                callback && callback();
            });
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.chat.getChatData(function () {
                callback && callback();
            });
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.tanxian.getFriendList(function () {
                callback && callback();
            });
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.frame.shenqi.getData(function () {
                callback && callback();
            });
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadShipin'));
            me.f5Prog();
            G.class.yingxiong_lb.prototype.getHeroCell(function () {
                callback && callback();
            });
        });
        if(X.checkIsOpen('kaogu')){
            me.DATA.taskList.push(function(callback){
                me.setProgText(L('load'),L('loadWenwu'));
                me.f5Prog();
                G.frame.kaogu_main.getWenwuData(function(){
                    callback && callback();
                },true);
            });
        }
        me.DATA.taskList.push(function(callback){
            X.ccui('btn_list.json', function (loader){
                G._hdBtnNode = new ccui.Layout();
                G._hdBtnNode.setContentSize(cc.size(80, 80));
                G._hdBtnNode.setAnchorPoint(C.ANCHOR[5]);

                var btn = new ccui.Button;
                btn.setAnchorPoint(0.5, 0.5);
                btn.setName("btn");
                btn.setPosition(G._hdBtnNode.width / 2, G._hdBtnNode.height / 2);
                G._hdBtnNode.addChild(btn);


                var txt = new ccui.Text("", G.defaultFNT, 18);
                btn.txt = txt;
                txt.setName("wz_djs");
                txt.setColor(cc.color("#2BDF02"));
                X.enableOutline(txt, "#000000", 2);
                txt.setAnchorPoint(0.5, 0.5);
                txt.setPosition(G._hdBtnNode.width / 2, -5);
                G._hdBtnNode.addChild(txt);
                G._hdBtnNode.retain();

                callback && callback();
            });
        });
		me.DATA.taskList.push(function(callback){
            me.f5Prog();
            G.serverconfig.getData(function(){
                callback && callback();
            },true);
        });
        me.DATA.taskList.push(function(callback){
            me.setProgText(L('load'),L('loadWuhun'));
            me.f5Prog();
            G.frame.beibao.getWuhunData(function(){
                callback && callback();
            },true);
        });
        me.doTaskList();
    },
    // task_prepare : function(){
    //     var me = this;
    //     var list = [
    //         'loading',
    //         // 'liaotian',
    //         // 'youjian',
    //         // 'zhuangbei',
    //         // 'shichang',
    //         // 'jingjichang',
    //         // 'beibao',
    //         // 'huishou',
    //         // 'meiriqiandao'
    //     ];

    //     for(var i=0;i<list.length;i++){
    //         (function(index){
    //             var name = list[index];

    //             me.DATA.taskList.push(function(callback){
    //                 //var percent = parseInt((((index+1) / list.length).toFixed(1) * 100) | 0);
    //                 //me.setProgText(X.STR(L('loadingbase'),percent));

    //                 me.setProgText(L('load'),L('loadModule'));
    //                 me.f5Prog();
    //                 G.frame[name].prepare(function(){
    //                     callback && callback();
    //                 });
    //             });
    //         })(i);
    //     }
    //     me.doTaskList();
    // },

    task_doTaskList : function(data){
        var me = this;
        me.doTaskList();
    },

    onRemove: function () {
        var me = this;
        // me.releaseRes(['img/denglu030.png']);
    },
    changeBgImg: function (type) {
        var me = this;

        var arr = ['toMap', 'toZhucheng'];

        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGB565;
        if (X.inArray(arr, type)) {
            me.imgBg2.show();
            me.imgBg2.find('img_bg').setBackGroundImage(G.class.loading.getOneConf().img, 0);
        } else {
            me.imgBg2.setBackGroundImage('img/bg/bg_denglu.jpg', 0);
            //loading界面不要加动画，这里会预加载大量资源，帧率不高，动画会导致界面看起来很卡顿
            //load部分动画
            //var bg = me.imgBg2;
            //G.class.ani.show({
            //    json:'beijing',
            //    addTo:bg,
            //    x:bg.width/2,
            //    y:bg.height/2,
            //    repeat:true,
            //    autoRemove:false,
            //    onload: function(node, action){
            //        X.forEachChild(node,function(node){
            //            var _action = node.getActionByTag(node.getTag());
            //            if(_action)_action.gotoFrameAndPlay(0,true);
            //        });
            //        G.class.ani.show({
            //            json: "ani_denglu",
            //            addTo: node.finds("niutourongqil_2"),
            //            x: 0,
            //            y: 0,
            //            repeat: true,
            //            autoRemove: false,
            //        })
            //    }
            //});
        }
        cc.Texture2D.defaultPixelFormat = cc.Texture2D.PIXEL_FORMAT_RGBA8888;
    }
});
G.frame[ID] = new fun('loading.json',ID);

})();
