(function () {
    //助力相会

    var ID = 'qixi_zlxh';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id,{action:true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow:function(){
            var me=this;
            me.nodes.mask.click(function(){
                me.remove();
            })
            me.setContent();
        },
        setContent: function(){
            var me = this;
            var need=G.gc.qixi.helpneed[0];
            me.maxitem=G.class.getOwnNum(need.t,need.a)
            me.neednum=0;
            if(me.maxitem>0){
                me.neednum=me.maxitem;
            }
            X.render({
                text_2:function(node){
                    node.setString(X.STR(L("qixi_duihuan"),G.gc.item[need.t].name))
                },
                btn_1:function(node){
                    node.click(function(sender){
                        if(me.neednum-1>0){
                            me.neednum--;
                        }
                        me.nodes.textfield_5.setString(me.neednum);
                        me.setNeedText();
                        me.setBtnShow();
                    })
                },
                btn_2:function(node){
                    node.click(function(sender){
                        if(me.neednum+1<=me.maxitem){
                            me.neednum++;
                        }
                        me.nodes.textfield_5.setString(me.neednum);
                        me.setNeedText();
                        me.setBtnShow();
                    })
                },
                btn_jian10:function(node){
                    node.click(function(sender){
                        if(me.neednum-10>0){
                            me.neednum-=10;
                        }else{
                            me.neednum=0;
                        }
                        me.nodes.textfield_5.setString(me.neednum);
                        me.setNeedText();
                        me.setBtnShow();
                    })
                },
                btn_jia10:function(node){
                    node.click(function(sender){
                        if(me.neednum+10<=me.maxitem){
                            me.neednum+=10;
                        }else{
                            me.neednum=me.maxitem;
                        }
                        me.nodes.textfield_5.setString(me.neednum);
                        me.setNeedText();
                        me.setBtnShow();
                    })
                },
                textfield_5:function(node){
                    node.setString(me.neednum)
                },
                btn_zs:function(node){
                    var prize=G.gc.qixi.helpprize[0]
                    node.click(function(){
                        prize.n=me.neednum;
                        if(me.neednum<=0){
                            G.tip_NB.show(L("qixi_bz"));
                            return;
                        }
                        G.ajax.send("qixi_help", [me.neednum], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize:  d.d.prize
                                }).show();
                                G.frame.qixi.setContent();
                                G.frame.qixi.DATA.myinfo=d.d.myinfo;
                                G.frame.qixi.DATA.allval=d.d.allval;
                                me.setContent();
                            }
                        })
                    })
                }
            },me.nodes)
            me.setNeedText();
            me.setBtnShow();
        },
        setBtnShow:function(){
            var me = this;
            var jia1=me.nodes.btn_2;
            var jia10=me.nodes.btn_jia10;
            var jian1=me.nodes.btn_1;
            var jian10=me.nodes.btn_jian10;

            if(me.neednum == me.maxitem){
                me.btntype(jia1,false);
                me.btntype(jia10,false);
                me.btntype(jian1,true);
                me.btntype(jian10,true);
            }else if(me.neednum == 0){
                me.btntype(jian1,false);
                me.btntype(jian10,false);
                me.btntype(jia1,true);
                me.btntype(jia10,true);
            }else{
                me.btntype(jia1,true);
                me.btntype(jia10,true);
                me.btntype(jian1,true);
                me.btntype(jian10,true);
            }


        },
        btntype:function(node,bool){
            node.setTouchEnabled(bool);
            node.setBright(bool);
        },
        setNeedText:function(){
            var me=this;
            var need=G.gc.qixi.helpneed[0];
            
            var str = X.STR(L("qixi_xh"), me.neednum,X.fmtValue(G.class.getOwnNum(need.t,need.a)));
            var img = new ccui.ImageView(G.class.getItemIco(need.t),1);
            me.nodes.panel_xh.removeAllChildren();
            var rh = X.setRichText({
                parent:me.nodes.panel_xh,
                str:str,
                node:img,
                color:"#fff0d8",
                outline:"#000000"
            });
        }
    });
    G.frame[ID] = new fun('qixi_tk1.json', ID);
})();