/**
 * Created by zhy on 2020-8-5
 */
 (function () {
    //英雄信息
    var ID = 'yingxiong_tujian_yl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.needshowMainMenu = true;
            me._super(json, id,{action:true});
        },
        
        bindBTN: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.bindBTN();
        },
        onShow: function () {
            var me = this;
            me.DATA = me.data(); 
            me.initUI();
        },
        initUI:function () {
            var me = this ;
            var heroInfo = me.DATA[0];
            var newHeroArr =[].concat(me.DATA).reverse();
            var widget = G.class.shero(heroInfo);

            widget.setAnchorPoint(0.5,1);
            // widget.setScale(0.9);
            widget.setPosition(cc.p( me.nodes.ico_touxiang1.width*0.5, me.nodes.ico_touxiang1.height));
            me.nodes.ico_touxiang1.removeAllChildren();
            me.nodes.ico_touxiang1.addChild(widget);
            me.nodes.yxmz.setString(heroInfo.name);



            newHeroArr.splice(0,1);
            me.starArr = [];
            var maxstar = 0;
            var minStar = me.DATA[me.DATA.length -1].star;
            var conf = G.gc.herocom.star2day;
            for(var key in conf){
                if(X.getSeverDay() >= conf[key]){
                    maxstar = key;
                }
            };
            if(me.DATA[0].star == 6){
                if(!me.DATA[0].tenstarmodel){
                    maxstar = 9;
                }
            }else if(me.DATA[0].star != 6){
                maxstar = me.DATA[0].star;
            }
            
            me.nodes.wzms.setString(X.STR(L("ZDXJ"),maxstar));
            for(var i = minStar,k = 0 ; i <  maxstar;i++,k++){
                var obj = {};
                obj.star = i;
                obj.hero = newHeroArr[k] || newHeroArr[newHeroArr.length -1];
                if (heroInfo.zhongzu == '7'){
                    if ( obj.star>=10){
                        me.starArr.push(obj);
                    }
                } else {
                    me.starArr.push(obj);
                }

            };
            // for(var k = 0 ; k < newHeroArr.length ;i++ ){
            //     newHeroArr[k].idx = k;
            // }
            cc.enableScrollBar(me.nodes.scrollview,false);
            me.ui.setTimeout(() => {
            
                me.nodes.scrollview.setTouchEnabled(true);
            }, 200);
            me.nodes.scrollview.setSwallowTouches(true);
            var table = me.table = new X.TableView(me.nodes.scrollview,me.nodes.panle1,1, function (ui, data) {
                me.setItem(ui, data);
            }, null, null);
            table.setData( me.starArr);
            table.reloadDataWithScroll(true);
            
        },
        setItem:function (ui,data) {
            var me = this ;
            X.autoInitUI(ui);
            ui.show();
            ui.nodes.wenzishuomin
            X.render({
                wenzishuomin:function (node) {
                    // 文字描述
                     var rh = new X.bRichText({
                        size:20,
                        maxWidth:node.width,
                        lineHeight:24,
                        color:"#f6ebcd",
                        family:G.defaultFNT
                    });
                    rh.text(X.STR(L("SXHC"),data.star+1));
                    rh.setPosition(cc.p(10,node.height - rh.trueHeight()-5));
                    node.removeAllChildren();
                    node.addChild(rh);
                },
                ico_neirong:function (node) {
                    // 物品消耗
                    var star = data.star + 1;
                    var extneed;
                    if(star < 7 && data.hero.zhongzu != 7){
                        var needConf = X.clone(G.class.hero.getHcNeed(data.hero.hid));
                        if(needConf.delhero[1]) {
                            extneed = [needConf.mainhero,needConf.delhero[0],needConf.delhero[1],needConf.chkhero[0]];
                        }else {
                            extneed = [needConf.mainhero,needConf.delhero[0],needConf.chkhero[0],needConf.chkhero[1]];
                        }
                    }else{
                        var conf = G.class.herostarup.getData(data.hero.hid, star);
                        var extneed = conf.extneed;
                        if(conf.need){
                            extneed = extneed.concat(conf.need);
                        }
                    };
                 
                    node.removeAllChildren();
                    var autoLayout = new X.extendLayout(node, extneed.length);
                    autoLayout.setDelegate({
                        cellCount: function () {
                            return 6;
                        },
                        nodeWidth: function () {
                            return 110*0.8;
                        },
                        rowHeight: function () {
                            return 110*0.8;
                        },
                        itemAtIndex: function (index) {
                            var need = extneed[index];
                            
                            // need.showNum = true;
                            
                            if(need.a != "item"){
                                var widget = G.class.shero_extneed(need, {hid:need.t || me.DATA[0].hid});
                            }else{
                                var widget = G.class.sitem(need);
                            }
                            widget.setScale(0.8);

                            var needNum = need.num || need.n;
                            // setTextWithColor(widget.txt_num, X.STR('{1}/{2}', 0, needNum), G.gc.COLOR['n16']);
                            // X.enableOutline(widget.txt_num,cc.color('#740000'),1);
                            // widget.txt_num.setPosition(cc.p(widget.width / 2 ,widget.txt_num.height * (-0.5)));
                            widget.setEnabled(false);
                            widget.setTouchEnabled(true);
                            widget.index = index;
                            widget.need = need;
                            var  text = new ccui.Text(needNum,'',22);
                            widget.addChild(text);
                            text.setPosition(96,83);
                            text.anchorX = 1;
                            X.enableOutline(text,cc.color('#0a1021'),2);
                            widget.num && widget.num.hide();
                            return widget;
                        }
                    });
                    autoLayout.layout();

                },
                
            },ui.nodes)
        },

    });

    G.frame[ID] = new fun('yingxiong_sxyl.json', ID);
})();