(function () {
    //七夕

    var ID = 'qixi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = true;
            me.singleGroup = "f2";
            me._super(json, id,{action:true});
            // me.preLoadRes = ["youjian.png", "youjian.plist"];
        },
        initUi: function () {
            var me = this;

        },
        bindBtn: function () {
            var me = this;
        },

        onOpen: function () {
            var me = this;
            me.action.play('wait', true);
        },
        onAniShow: function () {
            var me = this;

        },
        getData: function(callback){
            var me = this;
            G.ajax.send("qixi_open", [], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
    
        },
        show : function(conf){
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow: function () {
            var me = this;
            me.setContent();
            if(me.DATA.allval>=G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val){
                G.class.ani.show({
                    json: "qixi_ax_tx",
                    repeat: false,
                    autoRemove: true,
                    onload: function (node, action) {
                        action.play('wait', true);
                    }
                });
            }
            me.checkHongdian();
        },
        passTime : function (senconds) {
            var me = this;

            if( senconds <= 24* 60 * 60 ){
                // 小于24小时显示：h:mm:s
                return X.timeLeft(senconds, 'h:mm:s');
            }else{
                // 倒计时大于24小时显示： X天h:mm:s
                return X.STR('{1}天{2}', Math.floor(senconds/(3600*24)), X.timeLeft( senconds%(3600*24) , 'h小时'));
            }
        },
        setContent: function(){
            var me = this;
            X.render({
                txt_sj:function(node){
                    node.width=130
                    if(G.time<G.frame.qixi.DATA.info.rtime){
                        node.setString(L("qixi_hddjs"));
                    }else {
                        node.setString(L("qixi_dhdjs"));
                    }
                },
                txt_cs:function(node){
                    if(G.time < me.DATA.info.rtime){
                        X.timeout(node, me.DATA.info.rtime, function () {
                            me.setContent();
                        }, function (_leftStr, _leftSeconds) {
                            me.nodes.txt_cs.setString(me.passTime(_leftSeconds));
                        });
                    }else{
                        X.timeout(node,me.DATA.info.etime, function () {
                            me.setContent();
                        }, function (_leftStr, _leftSeconds) {
                            me.nodes.txt_cs.setString(me.passTime(_leftSeconds));
                        });
                    }
                },
                panel_qgdh:function(node){
                    node.setTouchEnabled(true)
                    node.click(function(){
                        G.frame.qixi_qgdh.show();
                    })
                },
                panel_gahl:function(node){
                    node.setTouchEnabled(true)

                    node.click(function(){
                        if(G.time>G.frame.qixi.DATA.info.rtime){
                            G.tip_NB.show(L("HDYJS"));
                            return 
                        }
                        G.frame.qixi_gahl.show();
                    })
                },
                panel_zlxy:function(node){
                    node.setTouchEnabled(true)
                    node.click(function(){
                        if(G.time>G.frame.qixi.DATA.info.rtime){
                            G.tip_NB.show(L("HDYJS"));
                            return 
                        }
                        G.frame.qixi_zlxy.show();
                    })
                },
                btn_phb:function(node){
                    node.click(function(sender){
                        G.frame.qixi_phb.show();
                    })
                },
                btn_fh:function(node){
                    node.click(function(){
                        me.remove();
                    })
                },
                btn_receive:function(node){
                    node.click(function(){
                        if(G.time>G.frame.qixi.DATA.info.rtime){
                            G.tip_NB.show(L("HDYJS"));
                            return 
                        }
                        G.frame.qixi_zlxh.show();
                    })
                },
                btn_bz:function(node){
                    node.click(function(){
                        G.frame.help.data({
                            intr: L('TS93')
                        }).show();
                    })
                },
                panel_xh:function(node){
                    var need=G.gc.qixi.helpneed[0];
                    var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
                    var str = X.STR(L("qixi_zlxy1"), G.class.getOwnNum(need.t,need.a));
                    node.removeAllChildren();
                    var rh = X.setRichText({
                        parent: node,
                        str:str,
                        node:img,
                        color:"#fff0d8",
                        outline:"#000000"
                    });
                }
            },me.nodes)
            me.setJdtShow();
           
            me.setRwmove();
        },
        setRwmove:function(){
            var me=this;
            var nr=180;
            var lr=340;
            var snr=0;
            var slv=520;
            var maxzhi=G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val;
            var percent=G.frame.qixi.DATA.allval/maxzhi
            if(percent>=1){
                percent=1;
            }
            me.nodes.panel_rw1.x=snr + percent*nr;
            me.nodes.panel_rw2.x=slv - (slv - lr)*percent;
        },
        setJdtShow:function(){
            var me = this;
            var conf=G.gc.qixi.commonprize;
            for(var i=0;i<conf.length;i++){
                var node = me.nodes["panel_"+(i+1)];
                var list = me.nodes.list.clone();
                X.autoInitUI(list);
                node.removeAllChildren();
                var item=new G.class.sitem(conf[i].p[0]);
                list.nodes.ico.addChild(item);
                item.setPosition(cc.p(50,50))
                list.setPosition(cc.p(35,43))
                list.nodes.txt_sz.setString(conf[i].val);
                list.id=i;
                list.setTouchEnabled(true);

                if(G.frame.qixi.DATA.allval < G.gc.qixi.commonprize[list.id].val) {
                    G.frame.iteminfo.showItemInfo(item);
                }else{
                    list.click(function(sender){
                        G.ajax.send("qixi_getcommonprize", [sender.id], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize:  d.d.prize
                                }).show();
                                G.frame.qixi.DATA.myinfo=d.d.myinfo;
                                me.setContent();
                            }
                        })
                    })
                }
                if(X.inArray(me.DATA.myinfo.commonprize,i)){
                    list.nodes.wz_ylq.show();
                    list.nodes.wz_ylq.setTouchEnabled(true);
                }
                list.show();
                G.class.ani.show({
                    json: "ani_qiandao_1",
                    addTo: item,
                    x: 58,
                    y: 45,
                    repeat: true,
                    autoRemove: false,
                    onload: function (node, action) {
                        node.setTag(987654);
                        node.setScale(1.2);
                    }
                })
                node.addChild(list);

            }
            if(G.frame.qixi.DATA.allval>G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val){
                G.frame.qixi.DATA.allval=G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val;
            }
            me.nodes.img_jdt.percent=(G.frame.qixi.DATA.allval/G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val)*100
            var str=G.frame.qixi.DATA.allval+ "/" +G.gc.qixi.commonprize[G.gc.qixi.commonprize.length-1].val
            var rh = X.setRichText({
                parent: me.nodes.img_jdt,
                str:str,
                color: "#ffffff",             
            });
            X.enableOutline(rh.children[0].children[0],'#000000', 2);
        },
        onRemove: function(){
            var me = this;
            G.hongdian.getData("qixi", 1,function () {
                G.hongdian.checkQixi();
            });
        },
        checkHongdian: function () {
            var me = this;
            var need=G.gc.qixi.helpneed[0];
            me.maxitem=G.class.getOwnNum(need.t,need.a)
            G.hongdian.getData("qixi", 1, function () {
                // if(me.maxitem){
                //     G.setNewIcoImg(me.nodes.btn_receive);
                // }else{
                //     G.removeNewIco(me.nodes.btn_receive);
                // }
                if(G.time>G.frame.qixi.DATA.info.rtime){
                    var dh=X.keysOfObject(G.gc.qixi.duihuan);
                    var need1=G.class.getOwnNum(G.gc.qixi.duihuanNeed[0].t,G.gc.qixi.duihuanNeed[0].a)
                    for(var i=0;i<dh.length;i++){
                        var maxnum=G.gc.qixi.duihuan[dh[i]].maxnum;
                        var num=me.DATA.myinfo.duihuan[dh[i]]? me.DATA.myinfo.duihuan[dh[i]]: 0;
                        if(maxnum-num>0 && need1>=G.gc.qixi.duihuan[dh[i]].need[0].n){
                            G.setNewIcoImg(me.nodes.panel_qgdh);
                            break;
                        }else{
                            G.removeNewIco(me.nodes.panel_qgdh);
                        }
                    }
                }
                if(G.DATA.hongdian.qixi&&G.DATA.hongdian.qixi.task){
                    G.setNewIcoImg(me.nodes.panel_zlxy);
                }else{
                    G.removeNewIco(me.nodes.panel_zlxy);
                }
            })

            
        },

    });
    G.frame[ID] = new fun('qixi.json', ID);
})();