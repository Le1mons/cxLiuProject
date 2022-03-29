/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //许愿池-奖励
    var ID = 'xuyuanchi_jl';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender, type) {
                if(!me.isAniOver) return;
                me.remove();
            });
            me.nodes.btn_qr.click(function (sender, type) {
                me.remove();
            });
            var conf = me.data().prize.length > 1?G.frame.xuyuanchi.conf.tenneed[0]:G.frame.xuyuanchi.conf.oneneed[0];
            me.nodes.btn_zzyc.finds('img_zs$').loadTexture(G.class.getItemIco(conf.t), 1);
            me.nodes.text_2.setString(conf.n);
            me.ui.finds("txt_sx").setString(me.data().prize.length + L("Ci"));
            me.nodes.btn_zzyc.click(function (sender, type) {
                G.frame.xuyuanchi.lottery(me.data().prize.length, true, 0, true);
                me.remove();
            }, 1000)
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.nodes.btn_qr.hide();
            me.nodes.btn_zzyc.hide();
            me.DATA = me.data();
        },
        onAniShow: function () {
            var me = this;
			
			me.ui.setTimeout(function(){
            	G.guidevent.emit('xuyuanchi_hdjl_one_over');
            },200);
        },
        onShow: function () {
            var me = this;
            me.idx = 0;
            me.setContents();
            cc.enableScrollBar(me.nodes.listview_ico);
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA.prize;
            var itemArr = [];
            me.nodes.txt_djgb.hide();
            if(data.length == 10) me.nodes.listview_ico.y = 96;
            if(data){
                if(data.length > 5){
                    var arr = [];
                    var panel = me.nodes.listview_ico;
                    panel.removeAllChildren();
                    panel.y -= -7;
                    panel.setItemsMargin(9);
                    for (var i = 0; i < data.length; i ++) {
                        if(arr.length == 5) {
                            var panel1 = me.nodes.panle_tb2.clone();
                            X.alignCenter(panel1, arr, {
                                name: "",
                                touch: true,
                                mapItem: function (item) {
                                    item.hide();
                                    itemArr.push(item);
                                }
                            });
                            panel.pushBackCustomItem(panel1);
                            arr = [];
                        }
                        arr.push(data[i]);
                    }
                    if(arr.length == 5) {
                        var panel1 = me.nodes.panle_tb2.clone();
                        X.alignCenter(panel1, arr, {
                            name: "",
                            touch: true,
                            mapItem: function (item) {
                                item.hide();
                                itemArr.push(item);
                            }
                        });
                        panel.pushBackCustomItem(panel1);
                        arr = [];
                    }
                }else{
                    X.alignCenter(me.nodes.panle_tb2, data, {
                        name: "",
                        touch: true,
                        mapItem: function (item) {
                            item.hide();
                            itemArr.push(item);
                        }
                    });
                }
            }
            me.ani(itemArr);
        },
        ani: function (itemArr) {
            var me = this;
            if(!itemArr[me.idx]) {
                if(me.data().isSuper) {
                    me.isAniOver = true;
                } else {
                    me.nodes.btn_qr.show();
                    me.nodes.btn_zzyc.show();
                    me.isAniOver = true;
                }
                return;
            }
            X.audio.playEffect("sound/jianglichuxian.mp3", false);
            itemArr[me.idx].refresh(false, function () {
                if(itemArr[me.idx].data.isjilu) {
                    G.class.ani.show({
                        json: "ani_qiandao",
                        addTo: itemArr[me.idx],
                        x: 58,
                        y: 42,
                        repeat: true,
                        autoRemove: false,
                        onload :function(node,action){
                            node.setScale(1.2);
                        }
                    });
                }
                me.idx ++;
                me.ani(itemArr);
            }, 1.5);
        }
    });
    G.frame[ID] = new fun('ui_hdwp2.json', ID);
})();