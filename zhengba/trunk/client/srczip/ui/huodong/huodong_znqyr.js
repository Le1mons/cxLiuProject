(function () {
    var ID = 'huodong_znqyr';

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

        show: function () {
            var me = this;
            var _super = this._super;
            this.getData(function () {
                _super.apply(me,arguments);
            });
        },
        onShow:function(){
            var me=this;
            me.nodes.mask.click(function (sender) {
                me.remove();
            })
            me.setContent();
        },
        setContent: function(){
            var me = this;
            var btnarr1=[];
            var btnarr2=[];
            me.nodes.txt_sj.setString(parseInt((G.DATA.asyncBtnsData.zhounian_login.etime - G.time)/60/60/24));
            for(var i=0;i<me.DATA.info.arr.length;i++){
                var p = G.class.sitem(me.DATA.info.arr[i].p[0]);
                var list=me.nodes.list.clone();
                X.autoInitUI(list);
                p.id=i;
                p.setPosition(cc.p(list.nodes.panel_ico.width/2,list.nodes.panel_ico.height/2))
                list.nodes.panel_ico.addChild(p)
                if(i<3){
                    btnarr1.push(list);
                }else{
                    btnarr2.push(list);
                }
                list.show();
                list.nodes.img_ylq.removeAllChildren();
                if(X.inArray(me.DATA.myinfo.gotarr,i+1)){
                    G.frame.iteminfo.showItemInfo(p);
                    var ylq = new ccui.ImageView("img/public/img_ylq.png", 1);
                    ylq.setAnchorPoint(0.5, 0.5);
                    ylq.setScale(0.8)
                    ylq.setPosition(list.nodes.img_ylq.width / 2, list.nodes.img_ylq.height / 2);
                    ylq.zIndex = 99;
                    list.nodes.img_ylq.addChild(ylq);
                    list.nodes.img_ylq.setPosition(cc.p(me.nodes.panel_ico.x,me.nodes.panel_ico.y));
                    list.nodes.img_ylq.show();
                }else{
                    if(i+1>me.DATA.myinfo.val){
                        G.frame.iteminfo.showItemInfo(p);
                        continue;
                    }
                    G.class.ani.show({
                        json: "ani_qiandao_1",
                        addTo:  list.nodes.panel_ico,
                        repeat: true,
                        x:60,
                        y:44,
                        autoRemove: false,
                        onload :function(node){
                            node.setScale(1.2);
                        }
                    });
                    p.prize=me.DATA.info.arr[i];
                    p.setTouchEnabled(true);
                    p.click(function (sender) {
                        G.ajax.send("huodong_use", [G.DATA.asyncBtnsData.zhounian_login.hdid,1,sender.id], function (d) {
                            if (!d) return;
                            var d = JSON.parse(d);
                            if (d.s == 1) {
                                G.frame.jiangli.data({
                                    prize: sender.prize.p
                                }).show();
                                me.DATA.myinfo.gotarr=d.d.myinfo.gotarr;
                                me.setContent();
                            }
                            
                        })
                    })
                }

            }
            X.center(btnarr1, me.nodes.panel_wp1);
            X.center(btnarr2, me.nodes.panel_wp2);
        },

        getData: function(callback){
            var me = this;
            G.ajax.send("huodong_open", [G.DATA.asyncBtnsData.zhounian_login.hdid], function (d) {
                if (!d) return;
                var d = JSON.parse(d);
                if (d.s == 1) {
                    me.DATA = d.d;
                    callback && callback();
                }
            })
    
        },
        onHide: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('zhounianqing_qdlx.json', ID);
})();