/**
 * Created by wfq on 2018/7/10.
 */
 (function () {
    //tiejiangpu_top
    G.class.tiejiangpu_top = X.bView.extend({
        ctor: function (conf) {
            var me = this;
            me.conf = conf;
            me._super('zhuangbei_hecheng.json');
        },
        refreshData :function (data,type) {
            var me = this;

            me._type=type;
            me.DATA = data;
        },
        getIdxData:function (data,type) {
            var me = this;
            me._curData = data;
            if(me._type != type)return;
            me.isShow && me._curData !== undefined && me.setContents();

        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            if(!data) return;
            var all = G.frame.tiejiangpu.bViewUp.tableView.getAllChildren();
            var widget = G.class.szhuangbei(me._curData);
            widget.setAnchorPoint(0.5,0.5);
            widget.setPosition(me.nodes.panel_tb3.width / 2, me.nodes.panel_tb3.height / 2 - 4);
            me.nodes.panel_tb3.removeAllChildren();
            me.nodes.panel_tb3.addChild(widget);
            widget.data.a = 'equip';
            G.frame.iteminfo.showItemInfo(widget);

            var need = me._curData.need;
            var widget2 = G.class.szhuangbei(need[0], null, null, false);
            widget2.setAnchorPoint(0.5,0.5);
            widget2.setPosition(me.nodes.panel_tb2.width / 2, me.nodes.panel_tb2.height / 2);
            me.nodes.panel_tb2.removeAllChildren();
            me.nodes.panel_tb2.addChild(widget2);
            G.frame.iteminfo.showItemInfo(widget2);

            var jdtBg = new ccui.Layout();
            jdtBg.setName('jdtBg');
            jdtBg.setBackGroundImage('img/public/jdt/img_sp_jdt_bg.png',1);
            jdtBg.setAnchorPoint(cc.p(0.5,0.5));
            jdtBg.setPosition(cc.p(widget.width / 2,-14));
            widget2.addChild(jdtBg);
            var jdt = me.jdt = new ccui.LoadingBar();
            jdt.loadTexture('img/public/jdt/img_sp_jdt2.png',1);
            jdt.setPosition(widget.width / 2,-14);
            jdt.setName('jdt');
            widget2.addChild(jdt);
            var txtJdt = me.txtjdt  = new ccui.Text('0/0','',14);
            txtJdt.setName('txtJdt');
            txtJdt.setFontName(G.defaultFNT);
            txtJdt.setPosition(cc.p(widget.width / 2,-14));
            txtJdt.setAnchorPoint(cc.p(0.5,0.5));
            X.enableOutline(txtJdt,'#66370e');
            widget2.addChild(txtJdt);

            for(var i in all){
                if(all[i].data.id == me._curData.id){
                    me.target = all[i];
                    break;
                }
            }

            me._buy();
            me.setBtns();
        },
        _buy:function (str, is) {
            var me = this;

            var widget = me.nodes.textfield_sl;
            var text = me.nodes.text_jb;
            var need = me._curData.need;
            var max = 0;

            if(need[0] && need[0].t && me.DATA[need[0].t]){
                max = me.DATA[need[0].t].num - me.DATA[need[0].t].usenum;
            }
            var maxNum = me.maxNum = (max/need[0].n) >> 0;

            var s = widget.getString();
            if(!str){
                widget.setString(maxNum);
                me.curNum = maxNum;
                text.setString(X.fmtValue(need[1].n * maxNum));
            }else if(((s > 0 || str == '+1') && ( s < maxNum || str == '-1')) && !is){
                var num = eval(s + str);
                widget.setString(num);
                me.curNum = num;
                text.setString(X.fmtValue(need[1].n * eval(s + str)));
            }else {
                str = str > maxNum ? maxNum : str;
                widget.setString(str);
                me.curNum = str;
                text.setString(X.fmtValue(need[1].n * str));
            }
            text.setTextColor(cc.color(G.gc.COLOR.n1));
            widget.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            if(me.jdt){
                if (maxNum > 0) {
                    me.jdt.setPercent(100);
                    me.jdt.loadTexture('img/public/jdt/img_sp_jdt.png',1);
                } else {
                    me.jdt.setPercent(Math.floor(max / need[0].n * 100));
                }
                me.txtjdt && me.txtjdt.setString(max + '/' + need[0].n);
            }

        },
        bindBtn:function () {
            var me = this;

            var btn_jia = me.nodes.btn_jia;
            // btn_jia.loadTextureNormal('img/public/btn/btn_jia2.png', 1);
            btn_jia.click(function () {

                me._buy('+1');
                me.setBtns();
            });
            var btn_jian = me.nodes.btn_jian;
            // btn_jian.loadTextureNormal('img/public/btn/btn_jian.png', 1);
            btn_jian.click(function () {
                me._buy('-1');
                me.setBtns();
            });
            if(!me.nodes.btn_hc.data) me.nodes.btn_hc.data = [];
            me.nodes.btn_hc.click(function () {
                if(!me.DATA[me._curData.need[0].t] || me.DATA[me._curData.need[0].t].num < me._curData.need[0].n){
                    G.tip_NB.show(L("HCCLBZ"));
                    return;
                }
                if(P.gud[me._curData.need[1].t] < me._curData.need[1].n) {
                    G.tip_NB.show(L("jinbi") + L("BUZU"));
                    return;
                }
                var str = me.nodes.textfield_sl.getString();
                if(str > me.maxNum){
                 str = me.maxNum;
                 me.nodes.textfield_sl.setString(str);
             }else if(str < 0){
                 str = 0;
                 me.nodes.textfield_sl.setString(0);
             }
             var eid = me._curData.id;
             me.ajax('equip_hecheng',[eid,str], function (s, d) {
                if(d.s == 1){
                        me._buy();
                        X.audio.playEffect("sound/hechengzhuangbei.mp3");
                        me.action.playWithCallback("ronghe", false, function () {
                            me.DATA = G.frame.tiejiangpu.getData(me._type);
                            me.setBtns();
                            G.class.ani.show({
                                json: "ani_tiejiangpuhecheng",
                                addTo: me.ui,
                                x: 317,
                                y: 213,
                                repeat: false,
                                autoRemove: true,
                                onend: function (node, action) {
                                    G.frame.jiangli.data({
                                        prize: [{a: "equip", t: eid, n: str}]
                                    }).show();
                                }
                            });
                            me.checkAllRedPoint();
                            me.action.play("dengdai", true)
                        });
                    }else{
                        X.audio.playEffect("sound/dianji.mp3", false);
                    }
                });
         });

        },
        checkAllRedPoint: function() {
            var me = this;
            var children = G.frame.tiejiangpu.bViewUp.tableView.getAllChildren();

            for(var i = 0; i < children.length; i ++) {
                var child = children[i];
                G.frame.tiejiangpu.bViewUp.checkRedPoint(child.getChildren()[0]);
            }
        },
        onOpen: function () {
            var me = this;
        },
        onShow : function(){
            var me = this;
            me.bindBtn();
            me.isShow = this;
            X.setInput(me.nodes.textfield_sl, function () {
                me._buy(me.nodes.textfield_sl.getString(), true);
                me.setBtns();
            });
            G.class.ani.show({
                json: "ani_tiejiangpu_beijing",
                addTo: me.nodes.panel_dh,
                x: me.nodes.panel_dh.width / 2,
                y: me.nodes.panel_dh.height / 2,
                repeat: true,
                autoRemove: false,
                onload: function (node, action) {
                    node.setTag(998877);
                    node.zIndex = -100;
                    me.action = action;
                    action.play("dengdai", false);
                }
            });
        },
        onNodeShow : function(){
            var me = this;

        },
        setBtns: function () {
            var me = this;

            var btnAdd = me.nodes.btn_jia;
            var btnPlus = me.nodes.btn_jian;

            btnAdd.setTouchEnabled(false);
            btnAdd.setEnableState(false);
            btnPlus.setTouchEnabled(false);
            btnPlus.setEnableState(false);

            if (me.curNum > 1) {
                btnPlus.setTouchEnabled(true);
                btnPlus.setEnableState(true);
            }
            if (me.curNum < me.maxNum) {
                btnAdd.setTouchEnabled(true);
                btnAdd.setEnableState(true);
            }
        }
    });

})();