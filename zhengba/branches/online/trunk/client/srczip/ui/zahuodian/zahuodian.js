/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    //杂货铺
    var ID = 'zahuodian';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f2";
            me.fullScreen = true;
            // me.needshowMainMenu = true;
            me._super(json, id,{action:true});
        },
        getData : function(callback,port){
            var me = this;
            // me.DATA = {goods:[{name:'XXX',jinbi:222},{name:'VVV',jinbi:555,zk:5}],time:1526994302};
            // callback && callback();
            me.ajax( port || 'zahuopu_open',[],function(str ,data){
                if (data.s === 1) {
                    if(port) me.refresh = 1;
                    me.DATA = data.d;
                    callback && callback();
                }
            },true);
        },
        bindUI: function () {
            var me = this;
            // 关闭
            me.ui.nodes.btn_guanbi.click(function(sender,type){
                me.remove();
            });
            me.ui.nodes.btn_1.click(function(sender,type){
                me.getData(function () {
                    me.setContents();
                },'zahuopu_shuaxin');
            },1000);

            // setPanelTitle(me.nodes.tip_title, L('UI_TITLE_ZHP'));
        },
        setContents:function(bool) {
            var me = this;
            var data = me.DATA.itemlist;
            
            me._firstItem=null;

            if(!bool) {
                for(var idx = 0 ; idx < data.length ; idx++){
                    var list = me.ui.nodes.list.clone();
                    me.ui.nodes['panel_'+(idx+1)].removeAllChildren();
                    me.ui.nodes['panel_'+(idx+1)].addChild(list);
                    me._setItem(list,data[idx],idx);
                }
            }
            if(me.refresh) me.refresh = 0;
            if(me.DATA.num == 0){
                me.ui.nodes.img_zs.show();
                me.ui.nodes.text_2.show();
                me.ui.nodes.text_2.setString(15);
                me.ui.nodes.img_wz.hide();
                me.ui.nodes.img_wz2.show();
                //倒计时隐藏
                me.ui.finds('img_zhong').show();
                me.ui.finds('img_wzbg').show();
                // me.ui.nodes.text_mf.show();
                me.ui.nodes.text_djs.show();

                me._setTime();
            }else {
                me.ui.nodes.img_zs.hide();
                me.ui.nodes.text_2.hide();
                me.ui.nodes.img_wz.show();
                me.ui.nodes.img_wz2.hide();
                me.ui.nodes.img_wz.setString(L("MFSX") + "(" + me.DATA.num + "/" + "5)");
                //倒计时隐藏
                me.ui.finds('img_zhong').hide();
                me.ui.finds('img_wzbg').hide();
                // me.ui.nodes.text_mf.hide();
                if(me.DATA.num != 5) {
                    me.ui.nodes.text_djs.show();
                    me.ui.finds('img_zhong').show();
                    me.ui.finds('img_wzbg').show();
                    me._setTime();
                }
            }
            
            me.ui.setTimeout(function(){
            	G.guidevent.emit('zhahuodian_setContent_over');
            },500);
            
        },
        _setTime:function () {
            var me = this;
            X.timeout(me.nodes.text_djs,me.DATA.freetime,function () {
                me.getData(function () {
                    me.setContents(true);
                })
            },null)//,{showStr: L('SYSJ')})
        },
        _setItem: function (item, data,idx) {
            var me = this;
            
            if(me._firstItem==null){
            	me._firstItem = item;
            }
            
            X.autoInitUI(item);
            var icon = G.class.sitem(data.item,false);
            if(me.refresh) icon.refresh();
            icon.setAnchorPoint(0.5,0.5);
            G.frame.iteminfo.showItemInfo(icon);
            item.nodes.ico_tb.removeAllChildren();
            // item.nodes.ico_tb.setPosition(item.nodes.ico_tb.parent.width/2 - item.nodes.ico_tb.width/2,item.nodes.ico_tb.parent.width/2);
            item.nodes.ico_tb.addChild(icon);
            icon.setPosition(item.nodes.ico_tb.width / 2, data.item.a == "hero"?31:item.nodes.ico_tb.height / 2);
            if(icon.num && data.item.a !== "equip"){
                // icon.num.string = 'x'+' '+icon.num.string;
                //icon.num.setPosition(icon.width*0.9 - icon.num.width,icon.num.height + icon.height*0.05);
                icon.num.string = icon.num.string;
                icon.num.setFontName(G.defaultFNT);
                X.enableOutline(icon.num,'#000000');
            }
            //item.nodes.text_1.setString(icon.conf.name);
            item.nodes.panel_yj.setTouchEnabled(false);
            item.nodes.text_1.setFontSize(18);
            item.nodes.text_1.setTextColor(cc.color(G.gc.COLOR[icon.conf.color || icon.conf.star - 1]));
            item.nodes.text_jinbi3.setString(X.fmtValue(data.need[0].n));
            item.nodes.image_jb.loadTexture(G.class.getItemIco(data.need[0].t), 1);
            item.nodes.img_zkbg.hide();
            if(data.sale < 10){
                item.nodes.img_zkbg.show();
                item.nodes.text_zk.setString(data.sale + L("sale"));
                X.enableOutline(item.nodes.text_zk,'#1d9600',2);
                item.nodes.text_jinbi.setString(X.fmtValue(data.need[0].n * (data.sale / 10)));
                item.nodes.text_jinbi2.setString(X.fmtValue(data.need[0].n));
                item.nodes.text_jinbi3.hide();

            }else{
                item.finds('line').hide();
            }
            !data.buynum && item.nodes.img_ygm.show();
            !data.buynum && item.nodes.text_jinbi3.hide();
            !data.buynum && item.nodes.text_jinbi2.hide();
            !data.buynum && item.nodes.text_jinbi.hide();
            !data.buynum && item.nodes.panel_yj.hide();
            !data.buynum && item.nodes.image_jb.hide();
            item.idx = idx;
            item.click(function (sender, type) {
                if(!data.buynum) {
                    G.tip_NB.show(L("DQSPYGM"));
                    return;
                }
                if(P.gud[data.need[0].t] < data.need[0].n * (data.sale / 10)) {
                    if(data.need[0].t == "rmbmoney") {
                        G.tip_NB.show(L("ZSBZ"));
                    }else {
                        G.tip_NB.show(L("HBBZ"));
                    }
                    return;
                }
                me._buy(sender);
            });
            item.setPosition(0,0);
            item.show();
        },
        _buy:function (item) {
            var me = this;
            G.frame.alert.data({
                cancelCall: null,
                okCall: function () {
                    me.ajax('zahuopu_buy',[item.idx],function(str ,data){
                        if (data.s === 1) {
                            item.nodes.img_ygm.show();
                            item.nodes.image_jb.hide();
                            item.nodes.text_jinbi3.hide();
                            item.nodes.text_jinbi2.hide();
                            item.nodes.text_jinbi.hide();
                            item.nodes.panel_yj.hide();
                            G.frame.jiangli.data({
                                prize:[].concat(data.d.prize)
                            }).show();
                        }
                    },true);
                },
                richText: L("SFGM"),
                sizeType: 3
            }).show();

        },
        onOpen: function () {
            var me = this;
            X.audio.playEffect("sound/openzahuodian.mp3");
            me.bindUI();
            me.ui.nodes.text_mf.hide();
        },
        onShow: function () {
            var me = this;
            me.showToper();

            var rw = me.nodes.panel_rw;
            rw.setFlippedX(true);
            G.class.ani.show({
                json:'ani_choukajuese',
                addTo:rw,
                x:rw.width/2,
                y:rw.height/2,
                repeat:true,
                autoRemove:false,
            });
            me.getData(function () {
                me.setContents();
            });
        },
        // show : function(conf){
        //     var me = this;
        //     var _super = this._super;
        //     this.getData(function () {
        //         _super.apply(me,arguments);
        //     });
        // },
        onAniShow: function () {
            var me = this;

            me.action.play("wait", false);
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');
        },
    });

    G.frame[ID] = new fun('zahuodian.json', ID);
})();