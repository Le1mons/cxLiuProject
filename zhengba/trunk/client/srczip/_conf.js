G.gc={};
//以下模型id需要替换为new
G.gc.changeModels = "14024,14025,14026,52045,52046,5204a,41065,41066,4106a,45045,45046,4504a,41013,21034,21035,21036,43034,43035,33024,33025,33026,33014,33015,32044,32045,32046,31044,31045,34025,34026,3402a,61025,61026,6102a,43054,43055,43056,52034,52035,13023,15024,15025,22012,25033,25023,21024,21025,21045,21046,2104a,32011,31012,35023,31023,35045,35046,3504a,32055,32056,3205a,31085,31086,3108a,31075,31076,3107a,43023,45013,42015,42016,4201a,61014,61015,52013".split(',');
G.gc.ifChangeModels = function(){
    if(G.owner == 'blyinghe' || G.owner=='zhengba3' || G.owner=='zhengba4'){
        return true;
    }
    return false;
};
//格式化物品icon
G.class.fmtItemICON = function(pngName){
    pngName = pngName.toString();
    var _noExt = pngName.replace('.png','');
    if(G.gc.ifChangeModels() && X.inArray(G.gc.changeModels,_noExt)){
        return 'new'+pngName;
    }
    return pngName;
};
//增加按包名去判断小游戏是否开启
G.gc.noShowTdGame = ["fzzbaz_jq"];

//新区和老区之间的分隔时间戳 某些功能需要在新区的开服xx天后才开启 不影响老区 只对新区生效
G.DATA.newSeverOpenTime = 1556467200;

//英雄头像点击太快有BUG 设置点击时间间隔
G.DATA.touchHeroHeadTimeInterval = 400;

//某些渠道显示的活动
G.gc.showOwners = ["zhengba", "zhengbaios", " lgblzh", "blzhsios","zhengba2","playbl","shourenllbl","zhengba3","zhengba4","zhengba5","zhengbaiosa","fzxxios","fzzbbl","zbjqios","fzzbjq"];
G.gc.gzhPrize = [{a: "attr", t: "jinbi", n: 100000},{a: "attr", t: "rmbmoney", n: 200},{a: "item", t: "2007", n: 2}];
G.gc.xlhPrize = [{a: "attr", t: "jinbi", n: 100000},{a: "attr", t: "rmbmoney", n: 200},{a: "item", t: "2010", n: 1}];
G.gc.sjbdPrize = [{"a":"attr","t":"jinbi","n":100000},{"a":"attr","t":"rmbmoney","n":100},{"a":"item","t":"2012","n":10}];

G.gc.COLOR = {
    0: "#ffffff",
    // 1: "#98f673", // 绿 n6
    // 2: "#7bbfff", // 蓝 n7
    // 3: "#d97eff", // 紫 n8
    // 4:'#ff7a3f', // 橙 n9
    // 5:'#ff3d23', // 红 n10

    1:'#25891c',  //绿色物品名称
    2:'#0d93df',  //蓝色物品名称
    3:'#aa05ba',  //紫色物品名称
    4:'#e85911',  //橙色物品名称
    5:'#c80000',  //红色物品名称
    10: "#7F7F7F",

    n1:'#ffffff', // 弹框标题, 字号 24
    n1_1:'#3c53a9', //弹框描边
    n2:'#edbb82', // 切页标签（未选中） 24
    n3:'#804326', // 切页标签（选中） 24
    n4:'#804326', // 浅色底文本内容 22
    n5:'#f6ebcd', // 深色底文本内容    描边 #F6EBCD
    n6:'#fff71d', //战斗力 20
    n7:'#1c9700', //增长数值
    n8:'#ffffff', //进度条文字       描边 #66370e
    n9:'#fdd464', //装备套装名称
    n10:'#63584a', //灰色色值
    n11:'#E6D3B6', //输入框占位文字
    n12:'#7b531a',   //黄色按钮内的文字
    n13:'#2f5719',   //绿色按钮内的文字
    n14:'#712d13',   //红色按钮内的文字

    n15:'#6c6c6c',  //灰态按钮内的文字

    n16:'#ff4e4e',   //材料不足红色文字      描边 #680000
    n24:'#ffffff',  //背包英雄小头像等级，物品数量    字号16    描边 #2a1c0f

    n34:'#30ff01',   //深色底板区分色...
    n36:'#eb3a3a',   //浅色底板区分色
    n101:'#7b531a', //黄色按钮文字 24
    n102:'#2f5719', //绿色按钮文字 24
    n103:'#712d13', //红色按钮文字 24
    n104: "#be5e30",

    'white':'#ffffff',//白色
    'hui':'#999999',

    yw1: "#ffffff",
    yw2: "#53d0ff",
    yw3: "#e153ff",
    yw4: "#ffc853",
    yw5: "#ffffff"
};

G.gc.zIndex = {
    mainmenu:1,
    toper:0.5,
    tipsmanager:100,
};

//动态按钮配置
G.gc.btnsConf = {
    shouchong:{
        name:'首充',
        img:'img/mainmenu/btn_schl.png',
        parent:'lefttop',
        order:1,
        ani: "ani_xiaotubiao_shouchonghaoli",
        callback: function (node) {
            node.touch(function (sender, type) {
                // if((G.OPENTIME + X.getOpenTimeToNight(G.OPENTIME)+60*60*24*7) < G.time){
                //     G.frame.chongzhi.data({'type':2}).show();
                // }else{
                    G.frame.shouchong.show();
                // }
            });
        }
    },
    kaifukuanghuan:{
        name:'开服狂欢',
        img:'img/mainmenu/btn_kfkh.png',
        parent:'lefttop',
        order:2,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.kfkh.show();
            });
        }
    },
    xianshilibao:{
        name: "限时礼包",
        img: "img/mainmenu/btn_xslb.png",
        parent: "lefttop",
        order: 0,
        ani: "ani_xiaotubiao_xianshilibao",
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.xslb.once("willClose", function () {
                    G.view.mainView.getAysncBtnsData(function () {
                        G.view.mainView.allBtns["lefttop"] = [];
                        G.view.mainView.setSvrBtns();
                    }, false, ["xianshilibao"]);
                }).show();
            });
        }
    },
    meirishouchong: {
        name: "每日首充",
        img: "img/mainmenu/btn_mrsc.png",
        parent: "lefttop",
        order: 0,
        ani: "ani_xiaotubiao_meirishouchong",
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.meirishouchong.show();
            });
        }
    },
    kaifulibao: {
        name: "开服礼包",
        img: "img/mainmenu/btn_mxxg.png",
        parent: "lefttop",
        order: 0,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.kaifulibao.show();
            });
        }
    },
    jrkh: {
        name: "节日狂欢",
        img: "img/mainmenu/btn_jrqd.png",
        parent: "lefttop",
        order: 0,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.jierikuanghuan.show();
            });
        }
    },
    kingsreturn: {
        name:"王者归来",
        img:"img/mainmenu/btn_wzgl.png",
        parent: "lefttop",
        order: 0,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.playerback_main.show();
            });
        }
    },
    wangzhezhaomu: {
        name:"勇者招募",
        img:"img/mainmenu/btn_cqzm.png",
        parent: "lefttop",
        order: 0,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.wangzhezhaomu_main.show();
            });
        }
    },
    xldx: {
        name:"秘境考古",
        img:"img/mainmenu/btn_mjkg.png",
        parent: "lefttop",
        order: 0,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.huodong_baby.show();
            });
        }
    },
    zslb: {
        name:"专属礼包",
        img:"img/mainmenu/btn_zslb.png",
        parent: "lefttop",
        order: 6,
        ani: "btn_zslb_tx",
        noHide: true,
        callback: function (node) {
            node.click(function (sender, type) {
                G.frame.zslb.once("willClose", function () {
                    G.view.mainView.getAysncBtnsData(function () {
                        G.view.mainView.allBtns["lefttop"] = [];
                        G.view.mainView.setSvrBtns();
                    }, false, ["zslb"]);
                }).show();
            });
        }
    }
};

G.gc.sortBuff = function (arr) {
    var val = {
        atk: 1,
        hp: 2,
        atkpro: 3,
        hppro: 4,
        pvpdpspro: 5,
        pvpundpspro: 6
    };

    arr.sort(function (a, b) {
        var aa = val[a] || 99999;
        var bb = val[b] || 99999;
        return aa < bb ? -1 : 1;
    });
};

G.gc.middleX = 640 / 2;
G.gc.middleY = 1136 / 2;
G.gc.posConf = {
    'side0pos2':{x:G.gc.middleX - 80,y:G.gc.middleY + 210,z:3,s:0.8},
    'side0pos1':{x:G.gc.middleX - 80,y:G.gc.middleY + 70,z:5,s:0.85},
    'side0pos3':{x:G.gc.middleX - 180,y:G.gc.middleY + 0,z:6,s:0.85},
    'side0pos4':{x:G.gc.middleX - 250,y:G.gc.middleY + 80,z:4,s:0.8},
    'side0pos5':{x:G.gc.middleX - 250,y:G.gc.middleY + 200,z:2,s:0.75},
    'side0pos6':{x:G.gc.middleX - 180,y:G.gc.middleY + 280,z:1,s:0.7},
    'side0pos7':{x:G.gc.middleX - 305,y:G.gc.middleY + 30,z:2,s:0.65},

    'side1pos2':{x:G.gc.middleX + 80,y:G.gc.middleY + 210,z:3,s:0.8},
    'side1pos1':{x:G.gc.middleX + 80,y:G.gc.middleY + 70,z:5,s:0.85},
    'side1pos3':{x:G.gc.middleX + 180,y:G.gc.middleY + 0,z:6,s:0.85},
    'side1pos4':{x:G.gc.middleX + 250,y:G.gc.middleY + 80,z:4,s:0.8},
    'side1pos5':{x:G.gc.middleX + 250,y:G.gc.middleY + 200,z:2,s:0.75},
    'side1pos6':{x:G.gc.middleX + 180,y:G.gc.middleY + 280,z:1,s:0.7},
    'side1pos7':{x:G.gc.middleX + 335,y:G.gc.middleY,z:2,s:0.65},
};