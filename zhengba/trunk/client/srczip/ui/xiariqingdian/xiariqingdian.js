(function () {
    //夏日庆典

    var ID = 'xiariqingdian';

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

            me.nodes.btn_fh.click(function (sender, type) {
                me.remove();
            });

            me.nodes.btn_bz.show();
            me.nodes.btn_bz.click(function (sender, type) {
                G.frame.help.data({
                    intr:L('TS92')
                }).show();
            });


        },

        onOpen: function () {
            var me = this;
            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;

            G.class.ani.show({
                json: "xrhd_tx_bg1",
                addTo: me.nodes.panel_dh,
                x:330,
                y:770,
                repeat: true,
                autoRemove: false
            });
        },
        getData: function(callback){
            var me = this;

            G.ajax.send("xiariqingdian_open", [], function (d) {
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
            me.hongdian();
        },
        setContent: function(){
            var me = this;
            me.nodes.panel_js.removeBackGroundImage();
            X.spine.show({
                json: 'spine/' + 'jsrk_dh' + '.json',
                addTo: me.nodes.panel_js,
                noRemove: true,
                cache: true,
                x: me.nodes.panel_js.width / 2 - 40, y: 35, z: 0,
                autoRemove: false,
                onload: function (node) {
                    node.runAni(0, "wait", true);

                }
            })

            me.nodes.panel_js.setTouchEnabled(true);
            me.nodes.panel_js.click(function () {
                if(me.tiemDay() == 8) return G.tip_NB.show(L("HDYJS"));
                G.frame.xiariqingliang_qiexigua.once("close",function () {
                    me.hongdian();
                }).show();
            });
            me.nodes.panel_xrsp.setTouchEnabled(true);
            me.nodes.panel_xrsp.click(function () {
                G.frame.xiarisd.once("close",function () {
                    me.hongdian();
                }).show();
            });
            me.nodes.panel_xrlb.setTouchEnabled(true);
            me.nodes.panel_xrlb.click(function () {
                if(me.tiemDay() == 8) return G.tip_NB.show(L("HDYJS"));
                G.frame.xiarilibao.once("close",function () {
                    me.hongdian();
                }).show();
            });
            me.nodes.panel_xrhl.setTouchEnabled(true);
            me.nodes.panel_xrhl.click(function () {
                G.frame.xiarihaoli.once("close",function () {
                    me.hongdian();
                }).show();
            });


            me.nodes.txt_cs.clearAllTimers();
            if(G.time >= me.DATA.info.rtime){
                me.nodes.txt_sj.setString(L("HDDJS1"));
                X.timeout(me.nodes.txt_cs, me.DATA.info.etime, function () {
                    G.view.mainView.getAysncBtnsData(null, null, ["xiariqingdian"]);
                    //me.remove();
                }, function (_leftStr, _leftSeconds) {
                    me.nodes.txt_cs.setString( me.passTime(_leftSeconds));
                });
            }else{
                me.nodes.txt_sj.setString(L("HDDJS"));
                X.timeout(me.nodes.txt_cs, me.DATA.info.rtime, function () {
                    me.setContent();
                }, function (_leftStr, _leftSeconds) {
                    me.nodes.txt_cs.setString(me.passTime(_leftSeconds));
                });
            }

        },
        onHide: function () {
            var me = this;
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

        onRemove: function(){
            var me = this;
            G.hongdian.getData("xiariqingdian", 1);
        },

        hongdian: function () {
            var me = this;

            if(me.haoliHD()){
                G.setNewIcoImg(me.nodes.panel_xrhl);
                me.nodes.panel_xrhl.finds('redPoint').setPosition(240,228);
            }else{
                G.removeNewIco(me.nodes.panel_xrhl);
            }

            if(me.shangpuHD()){
                G.setNewIcoImg(me.nodes.panel_xrsp);
                me.nodes.panel_xrsp.finds('redPoint').setPosition(220,220);
            }else{
                G.removeNewIco(me.nodes.panel_xrsp);
            }

            if(me.xiguaHD()){
                G.setNewIcoImg(me.nodes.panel_js);
                me.nodes.panel_js.finds('redPoint').setPosition(175,220);
            }else{
                G.removeNewIco(me.nodes.panel_js);
            }

        },

        //夏日豪礼
        haoliHD: function () {
            var me = this;

           // me.today = me.tiemDay();
            for(var i = 0; i < 7; i++){
                if(!X.inArray(me.DATA.myinfo.qiandao,i) && me.today >= (i + 1) ){ //&& me.today != 8
                    return true;
                }
            }

            return false
        },

        // //夏日礼包
        // libao: function () {
        //     var me = this;
        //
        // }

        //夏日商铺
        shangpuHD: function () {
            var me = this;

            me.today = me.tiemDay();
            if(me.today != 8) return false;

            var conf = G.gc.xiariqingdian.duihuan;
            for(var i in conf){
                var need = conf[i].need;
                var num =  G.class.getOwnNum(need[0].t, need[0].a)

                if(me.DATA.myinfo.duihuan[i] && conf[i].maxnum - me.DATA.myinfo.duihuan[i] > 0 && num >= need[0].n){
                    return true
                }
            }
            return false
        },

        //西瓜
        xiguaHD: function () {
            var me = this;

            me.today = me.tiemDay();
            if(me.today == 8) return false;

            var need = G.gc.xiariqingdian.youxiitemneed;
            var num =  G.class.getOwnNum(need[0].t, need[0].a)
            if(num >= need[0].n){
                return true
            }

            var need1 = G.gc.xiariqingdian.youxizuanshineed;
            var num1 =  G.class.getOwnNum(need1[0].t, need1[0].a)
            if(num1 >= need1[0].n &&  G.gc.xiariqingdian.buynum - me.DATA.myinfo.zuanshinum > 0){
                return true
            }

            return false
        },

        tiemDay: function () {
            var me = this;
            var timestamp = G.time -  me.DATA.info.stime;
            return Math.ceil(timestamp / 60 / 60 /24);
        }

    });
    G.frame[ID] = new fun('xiariqingdian.json', ID);
})();