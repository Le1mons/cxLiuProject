/**
 * Created by zhangming on 2018-05-14
 */
(function () {
    //点金
    var CONSUME = {1:0,2:20,3:50,4:100};
    var ID = 'dianjin';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            // me.fullScreen = true;//UI要换成弹窗样式
            me.singleGroup = "f3";
            // me.needshowMainMenu = true;
            me._super(json, id,{action:true});
        },
        getData : function(callback){
            var me = this;
            me.ajax('dianjin_open',[],function(str ,data){
                if (data.s === 1) {
                    me.DATA = data.d;
                    callback && callback();
                }
            },true);
        },
        bindUI: function () {
            var me = this;
            // 关闭
            me.ui.opacity = 255 * .7;
            me.ui.finds("panel_ui").click(function(sender,type){
                me.remove();
            });

            // setPanelTitle(me.nodes.tip_title, L('UI_TITLE_ZHP'));
        },
        setContents:function() {
            var me = this;
            var data = me.DATA.prize;
            for(var idx in data){
                me.ui.nodes['text_jb'+idx].setString(data[idx].n + (idx == "4" ? L("JY") : L('jinbi')));
                var list = me.ui.nodes.list.clone();
                me.ui.nodes['panel_'+idx].removeAllChildren();
                me.ui.nodes['panel_'+idx].addChild(list);
                list.setAnchorPoint(0.5,0.5);
                list.setPosition(me.ui.nodes['panel_'+idx].width*0.5,me.ui.nodes['panel_'+idx].height*0.5);
                me._setItem(list,data[idx],idx);
            }
            me._setTime(me.DATA);
            me.setCount();
        },
        setCount: function() {
            var me = this;

            if(me.DATA.huodongtime > 0) {
                for(var i in me.DATA.act) {
                    me.nodes["txt_sy" + i].show();
                    me.nodes["txt_sy" + i].getChildren()[0].setString(me.DATA.act[i]);
                    if(me.DATA.act[i] == 0) {
                        me.nodes["txt_sy" + i].hide();
                    }
                }
            }
        },
        _setTime:function (d) {
            var me = this;
            if(d.cd && d.cd > G.time){
                X.timeout(me.nodes.text_djs,d.cd,function () {
                    //me.nodes.text_mf.setString(L('BCMF'));
                    me.refreshData();
                },null)//,{showStr: L('SYSJ')})
            }
        },
        _setItem: function (item, data,idx) {
            var me = this;
            X.autoInitUI(item);
            var xh = item.nodes.text_1;
            var img_xh = item.nodes.img_zs;
            var btn = item.nodes.btn_1;
            var img_mf = item.nodes.img_wz;
            var img_mf2 = item.nodes.img_wz2;
            img_mf2.hide();
            // btn.setPositionX(114);
            if(idx == 1){
                img_mf.show();
                me.nodes.panel_sxsj.hide();
            }else {
                img_xh.show();
                xh.setString(CONSUME[idx]);
                X.enableOutline(xh,'#2a1c0f',2);
                xh.show();
            }

            item.show();
            btn.show();
            if(me.DATA.act[idx] == 0){
                img_mf.hide();
                if(idx == 1){
                    img_mf2.show();
                    me.nodes.panel_sxsj.show();
                }else{
                    xh.hide();
                    img_xh.hide();
                    img_mf2.show()
                }
                btn.setBright(false);
                btn.setTouchEnabled(false);
                btn.hide();
            }
            btn.idx = idx;
            btn.data = ["noMusic"];
            btn.click(function(sender,type){
                me._buy(sender,img_mf,img_mf2, xh, img_xh);
            },200);
        },
        _buy:function (item,img_mf,img_mf2, xh, img_xh, callback) {
            var me = this;
            me.ajax('dianjin_lingqu',[item.idx],function(str ,data){
                if (data.s === 1) {
                    G.event.emit("sdkevent", {
                        event: "dianjin_lingqu"
                    });
                    X.audio.playEffect("sound/dianjin.mp3", false);
                    if(item.idx == 1){
                        G.hongdian.getData("dianjin", 1);
                    }
                    me.aniArr[parseInt(item.idx) - 1].playWithCallback("out", false , function () {
                        me.aniArr[parseInt(item.idx) - 1].play("wait", true);
                    });
                    var vip = P.gud.vip > 0 ? X.STR(L("GZXJC"), P.gud.vip) : "";
                    G.tip_NB.show(data.d.prize.n + (item.idx == 4 ? L("JY") : L('jinbi')) + vip);
                    me.getData(function () {
                        me.setContents();
                    })
                }else{
                    X.audio.playEffect("sound/dianji.mp3", false);
                }
            },true);
        },
        onOpen: function () {
            var me = this;
            me.bindUI();
        },
        refreshData:function () {
            var me = this;
            me.getData(function () {
                me.setContents();
            });
        },
        onShow: function () {
            var me = this;

            me.aniArr = [];
            for(var i = 0; i < 4; i ++){
                var box = me.ui.finds("img_bx" + (i + 1));
                var bg = me.nodes["panel_dh" + (i + 1)];
                G.class.ani.show({
                    json: "ani_lingqujinbi",
                    addTo: box,
                    x: box.width / 2,
                    y: box.height / 2,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        action.play("wait", true);
                        me.aniArr.push(action);
                    }
                });
            }
            var rw = me.ui.finds('img_rw');
            rw.removeBackGroundImage();
            rw.setFlippedX(true);
            G.class.ani.show({
                json:'ani_choukajuese',
                addTo:rw,
                x:rw.width/2,
                y:rw.height/2,
                repeat:true,
                autoRemove:false,
            });
            me.refreshData();
            me.emit("show");
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
            me.event.emit('hide');
        },
    });

    G.frame[ID] = new fun('dianjin.json', ID);
})();