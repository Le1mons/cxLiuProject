/**
 * Created by LYF on 2018/10/10.
 */
(function () {
    //自选祝福
    G.class.huodong_zxzf = X.bView.extend({
        ctor: function (type) {
            var me = this;
            me._type = type;
            me._super("event_2zhounian2.json");
        },
        refreshPanel: function () {
            var me = this;

        },
        bindBTN: function() {
            var me = this;
            me.nodes.btn_1.click(function () {
                if(me.checkCanGet())return;
                me.ajax('anniversary_receive', [], function (str, data) {
                    if (data.s == 1){
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        me.parentNode.refreshDataInfo(data.d.data);
                        me.parentNode.checkRedPoint();
                        me.DATA = data.d.data;
                        me.setChosePrize();
                        me.setContents();
                        me.setBtnState();
                    }
                },true);
            });
            me.nodes.panel2.setTouchEnabled(false);
            me.ui.finds("btn_genghuan").click(function () {
                if(me.checkIsgetAll())return;
                G.frame.choosePrize.data({
                    choosePrizeIdx:me.choosePrizeIdx || -1,
                    callback:function (dayIdx,prizeIdx) {
                        me.chosePrize(dayIdx,prizeIdx);
                    }
                }).show();
            });
            me.nodes.ico_tubiao.click(function () {
                if(me.checkIsgetAll())return;
                G.frame.choosePrize.data({
                    choosePrizeIdx:me.choosePrizeIdx || -1,
                    callback:function (dayIdx,prizeIdx) {
                        me.chosePrize(dayIdx,prizeIdx);
                    }
                }).show();
            });
           
        },
        checkIsgetAll:function () {
            var me = this ;
            if(me.DATA.sign >=  me.parentNode.conf.sign.length){
                G.tip_NB.show(L("JIANGLIGET"));
                return true;
            };
            return false;
        },
        checkCanGet:function () {
            var me = this ;
            if(X.keysOfObject(me.DATA.choose).length < 0 && me.parentNode.conf.sign.length <= me.DATA.sign){
                G.tip_NB.show(L("请先选择自选祝福奖励哦"));
                return true;
            };
            return false;
        },
        chosePrize:function (dayIdx,prizeIdx) {
            var me = this ;  
            G.ajax.send("anniversary_choose",[dayIdx,prizeIdx],function(str,data){
                if(data.s == 1){
                    me.parentNode.refreshDataInfo(data.d);
                    me.setChosePrize();
                    me.setContents();
                }
            })
        },
        onOpen: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.choosePrize  = [];
            me.DATA = me.parentNode.DATA;
            me.setBtnState();
            me.bindBTN();
            me.setChosePrize();
            me.setContents();
            me.initUI();
        },
        setContents: function () {
            var me = this;
            var idx = me.DATA.sign >=  me.parentNode.conf.sign.length ?  me.parentNode.conf.sign.length -1 :  me.DATA.sign;
            var prizeConf = me.parentNode.conf.sign[idx];
            var prize = me.choosePrize.concat(prizeConf.prize);
            
            // var data = me.parentNode.conf.sign[2].prize;
            me.nodes.txt.setString(X.STR(L("YILING"),me.DATA.sign,me.DATA.sign,me.parentNode.conf.sign.length));
            for(var i = 0 ; i <3 ;i++){
                var idx = i+1;
                if(!prize[i]){
                    me.nodes["ico"+idx].hide();
                }else{
                    var item = G.class.sitem(prize[i]);
                    var node = me.nodes["ico"+idx];
                    node.show();
                    item.setPosition(node.width / 2,node.height / 2);
                    G.frame.iteminfo.showItemInfo(item);
                    node.removeAllChildren();
                    node.addChild(item);   
                }
            };
            
        },
        initUI:function () {
            var me = this ;  
            var timeNode  = me.ui.finds("txt_sz");
            if(me.DATA.rtime - G.time > 24 * 3600 * 2) {
                // me.nodes.txt_count.hide();
                timeNode.setString(X.moment(me.DATA.rtime - G.time));
            }else {
                X.timeout(timeNode,me.DATA.rtime, function () {
                    G.tip_NB.show(L("HUODONG_HD_OVER"));
                    me.parentNode.remove();
                })
            };
            G.class.ani.show({
                json: "huodong_qxtx_xz",
                addTo: me.nodes.panel2_dh,
                repeat: true,
                autoRemove: false,
                
            });
            
        },
        setBtnState:function () {
            var me = this ;
            me.nodes.btn_1.setBright(me.DATA.signreceive);
            me.nodes.btn_1.setTouchEnabled(me.DATA.signreceive);
            me.nodes.panle1.finds('txt_sx').setTextColor(cc.color(me.DATA.signreceive ? G.gc.COLOR.n13 : G.gc.COLOR.n15));
            me.ui.finds("txt_sx2").setString(me.DATA.signreceive ? L('LQ') : L('YLQ'));
        },
        setChosePrize:function () {
            var me = this ; 
            var key = X.keysOfObject(me.DATA.choose)[0];
            if(key){
                var prize  = me.parentNode.conf.sign[key].choose[me.DATA.choose[key]];
                me.choosePrizeIdx = me.DATA.choose[key] +"";
            
                var item = G.class.sitem(prize);
                var node = me.nodes.ico_tubiao;
                item.setPosition(node.width / 2,node.height / 2);
                node.removeAllChildren();
                node.addChild(item); 
                if(me.DATA.sign >= key){
                    me.choosePrize =[prize];
                };
                //  X.setRichText({
                //     str: item.conf.name,
                //     parent: me.nodes.ico_wenzi,
                //     size:20,
                //     pos: {x: me.nodes.ico_wenzi.width/2, y: me.nodes.ico_wenzi.height / 2},
                //     color: G.gc.COLOR[item.conf.color],
                //     outline: "#2D1400"
                // });
                 var rh = new X.bRichText({
                    size: 20,
                    maxWidth: me.nodes.ico_wenzi.width,
                    lineHeight: 34,
                    color: G.gc.COLOR[item.conf.color],
                    eachText: function (node) {
                        node.enableOutline && X.enableOutline(node, "#2D1400", 2);
                    }
        
                });
                rh.text(item.conf.name);
                rh.setPosition(me.nodes.ico_wenzi.width / 2 - rh.trueWidth() / 2, 0);
                me.nodes.ico_wenzi.removeAllChildren();
                me.nodes.ico_wenzi.addChild(rh);
                var maxDay = me.parentNode.conf.sign.length;
                var str = maxDay -  me.DATA.day > 0 ? X.STR(L("ZAIDENGLU"), maxDay -  me.DATA.day ) :""
                me.nodes.wz_10.setString(str);
            }

        }
    })
})();