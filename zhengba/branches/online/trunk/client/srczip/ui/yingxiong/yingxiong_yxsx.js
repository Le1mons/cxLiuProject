/**
 * Created by zhangming on 2018-05-03
 */
(function(){
 // 英雄信息-升星
G.class.yingxiong_yxsx = X.bView.extend({
    ctor: function (type) {
        var me = this;
        me._type = type;
        me._super('yingxiong_yxsx.json');
    },
    refreshPanel: function(){
        var me = this;

        me.curXbId = G.frame.yingxiong_xxxx.curXbId;
        me.curXbIdx = G.frame.yingxiong_xxxx.curXbIdx;
        G.frame.yingxiong_xxxx.selectedData = {};

        me.setContents();
    },
    bindBTN:function() {
        var me = this;

        if(!me.nodes.btn_jx.data) me.nodes.btn_jx.data = [];
        me.nodes.btn_jx.click(function(sender, type){
            // if(!sender.isBright()) return;

            if (me.getSelectedTidArr().length < G.class.herostarup.getExtneedNum(G.DATA.yingxiong.list[me.curXbId].hid,G.DATA.yingxiong.list[me.curXbId].dengjielv + 1)) {
                G.tip_NB.show(L('YX_SX_XZ_TIP_1'));
                return;
            }

            //保存下该英雄的旧数据
            G.DATA.yingxiong.oldData = JSON.parse(JSON.stringify(G.DATA.yingxiong.list[me.curXbId]));

            me.ajax('hero_upstar',[me.curXbId,G.frame.yingxiong_xxxx.selectedData], function (s, rd) {
                if (rd.s == 1){
                    X.audio.playEffect("sound/yingxiongshengxing.mp3");
                    for(var i in G.frame.yingxiong_xxxx.selectedData) {
                        for(var j in G.frame.yingxiong_xxxx.selectedData[i]){
                            G.frame.yingxiong_xxxx.list.splice(X.arrayFind(G.frame.yingxiong_xxxx.list, G.frame.yingxiong_xxxx.selectedData[i][j]), 1);
                        }

                    }
                    G.frame.yingxiong_xxxx.selectedData = {};
                    // G.frame.yingxiong_xxxx.emit('updateInfo');
                    if (rd.d.hero&& rd.d.hero[me.curXbIdx] && rd.d.hero[me.curXbId].dengjielv == 10) {
                        G.frame.yingxiong_xxxx._curType = '1';
                        G.frame.yingxiong_xxxx._panels[G.frame.yingxiong_xxxx._curType]._needRefresh = true;
                        G.frame.yingxiong_xxxx.refreshPanel();
                        G.frame.yingxiong_xxxx.showRw();
                    } else {
                        G.frame.yingxiong_xxxx.updateInfo();
                        G.frame.yingxiong_xxxx.refreshPanel();
                    }
                    var panel = G.frame.yingxiong_xxxx._rwPanel.nodes.panel_rw;
                    var childrenArr = panel.getChildren();
                    for (var i = 1; i < childrenArr.length; i++) {
                        var child = childrenArr[i];
                        child.removeFromParent(true);
                    }
                    G.frame.yingxiong_xxxx.rw.palySkillAni();
                    G.frame.ui_shengxing.once("hide", function () {
                        if (rd.d.length > 0) {
                            G.frame.jiangli.data({
                                prize: rd.d
                            }).show();
                        }
                    }).data(me.curXbId).show();
                }else{
                    X.audio.playEffect("sound/dianji.mp3", false);
                }
            },true);
        });

        me.ui.finds('$btn_fanhui').click(function(sender,type){
            G.frame.yingxiong_xxxx.remove();
        });
    },
    onOpen: function () {
        var me = this;
        me.bindBTN();
    },
    onShow : function(){
        var me = this;

        me.refreshPanel();
        G.frame.yingxiong_xxxx.onnp('updateInfo', function (d) {
            if(G.frame.yingxiong_xxxx.getCurType() == me._type){
                me.refreshPanel();
            }else{
                me._needRefresh = true;
            }
        }, me.getViewJson());
    },
    onNodeShow : function(){
        var me = this;

        // if(me._needRefresh){
        //     delete me._needRefresh;
        //     me.refreshPanel();
        // }

        if (cc.isNode(me.ui)) {
            me.refreshPanel();
        }

        G.frame.yingxiong_xxxx.changeToperAttr({
            attr2:{a:'item',t:'2004'}
        });
    },
    onRemove: function () {
        var me = this;
    },
    setContents:function() {
        var me = this;
        var data = G.DATA.yingxiong.list[me.curXbId];
        var conf = G.class.herostarup.getData(data.hid, data.dengjielv + 1);

        function ten() {
            var skill = G.class.hero.getCanUpgradeSkill(data.hid, data.dengjielv);
            var p1 = G.class.ui_skill_list(skill, true);
            p1.setAnchorPoint(0.5,0.5);
            p1.setPosition(cc.p( me.nodes.panel_jn1.width*0.5, me.nodes.panel_jn1.height*0.5 ));
            me.nodes.panel_jn1.addChild(p1);

            skill = G.class.hero.getSkillOne(skill.idx, data.hid, data.dengjielv+1);
            var p2 = G.class.ui_skill_list(skill, true);
            p2.setAnchorPoint(0.5,0.5);
            p2.setPosition(cc.p( me.nodes.panel_jn2.width*0.5, me.nodes.panel_jn2.height*0.5 ));
            me.nodes.panel_jn2.addChild(p2);

            me.setSx(me.nodes.txt_sx1, X.STR(L('YXXX_DQSX'), (data.star - 6) * 20));
            me.setSx(me.nodes.txt_sx2,
                X.STR(L('YXXX_DQDJ'),
                    G.class.herocom.getMaxlv(data.hid, data.dengjielv)
                )
            );

            me.setSx(me.nodes.txt_sx3, X.STR(L('YXXX_SXTS'), (data.star - 5) * 20));
            me.setSx(me.nodes.txt_sx4,
                X.STR(L('YXXX_DJSX'),
                    G.class.herocom.getMaxlv(data.hid, data.dengjielv+1)
                )
            );
        }
        
        function eleven() {
            me.setSx(me.nodes.txt_tx1, X.STR(L('YXXX_DQSX'), (data.star - 6) * 20));
            me.setSx(me.nodes.txt_tx2,
                X.STR(L('YXXX_DQDJ'),
                    G.class.herocom.getMaxlv(data.hid, data.dengjielv)
                )
            );
            me.setSx(me.nodes.txt_tx5, X.STR(L("YXXX_DQDW"), data.star - 10));

            me.setSx(me.nodes.txt_tx3, X.STR(L('YXXX_SXTS'), (data.star - 5) * 20));
            me.setSx(me.nodes.txt_tx4,
                X.STR(L('YXXX_DJSX'),
                    G.class.herocom.getMaxlv(data.hid, data.dengjielv + 1)
                )
            );
            me.setSx(me.nodes.txt_tx6, X.STR(L("YXXX_DWCC"), data.star - 10 + 1));
        }

        if(data.star < 10) {
            me.nodes.panel_tp10.show();
            me.nodes.panel_tp11.hide();
            ten();
        } else {
            me.nodes.panel_tp10.hide();
            me.nodes.panel_tp11.show();
            eleven();
        }

        G.class.ui_star_mask(me.nodes.panel_xx1, data.dengjielv, 0.8);
        G.class.ui_star_mask(me.nodes.panel_xx2, data.dengjielv + 1, 0.8);

        var need = conf.need[0];
        var have = G.class.getOwnNum(need.t,need.a);
        var xuyao = X.fmtValue(need.n);
        var color = (have >= need.n ? "#ffffff" : "#ff4e4e");
        me.nodes.txt_xh.setString(xuyao);
        me.nodes.txt_xh.setTextColor(cc.color(color));
        have < need.n && X.enableOutline(me.nodes.txt_xh,cc.color("#740000"),1);
        me.nodes.panel_db.setBackGroundImage(G.class.getItemIco(need.t), 1);

        me.nodes.btn_jx.setBright(true);
        me.nodes.btn_jx.setTitleColor(cc.color(G.gc.COLOR.n13));
        var extneed = conf.extneed; 
        me.nodes.panel_xh.removeAllChildren();
        var autoLayout = new X.extendLayout(me.nodes.panel_xh, extneed.length);
        autoLayout.setDelegate({
            cellCount: function () {
                return 3;
            },
            nodeWidth: function () {
                return 110*0.8;
            },
            rowHeight: function () {
                return 110*0.8;
            },
            itemAtIndex: function (index) {
                var need = extneed[index];
				
				need.showNum = true;
                var widget = G.class.shero_extneed(need, data);
                widget.setScale(0.8);
                //widget.lv.hide();

                // var has = G.frame.yingxiong.getFilterHeros(need, me.curXbId).length;
                var needNum = need.num;

                setTextWithColor(widget.txt_num, X.STR('{1}/{2}', 0, needNum), G.gc.COLOR['n16']);
                X.enableOutline(widget.txt_num,cc.color('#740000'),1);
                widget.txt_num.setPosition(cc.p(widget.width / 2 ,widget.txt_num.height * (-0.5)));
                widget.setEnabled(false);
                widget.setTouchEnabled(true);
                widget.index = index;
                widget.need = need;
                widget.click(function(sender,type){
                    var callback = function (d) {
                        //d是数组
                        G.frame.yingxiong_xxxx.selectedData[sender.index] = d;
                        var hav = d.length;
                        setTextWithColor(sender.txt_num, X.STR('{1}/{2}', hav, sender.need.num), G.gc.COLOR[hav >= sender.need.num ? 1 : 'n16']);
                        if(hav < sender.need.num){
                            X.enableOutline(sender.txt_num,cc.color('#740000'),1);
                        }else{
                            X.disableOutline(sender.txt_num);
                            X.enableOutline(sender.txt_num,cc.color('#2a1c0f'),0.1)
                        }
                        sender.setEnabled(hav >= sender.need.num);
                    };
                    G.frame.ui_tip_xuanze.data({
                        need:sender.need,
                        idx:sender.index,
                        IdxData:G.frame.yingxiong_xxxx.selectedData[sender.index],
                        selectedData: G.frame.yingxiong_xxxx.selectedData,
                        callback:callback
                    }).show();
                });

                return widget;
            }
        });
        autoLayout.layout();
    },
    setSx: function(target, text){
        var rt = new X.bRichText({
            size: 18,
            lineHeight: 24,
            color: '#804326',
            maxWidth: target.width,
            family: G.defaultFNT,
        });
        rt.text(text);
        rt.setAnchorPoint(0, 0.5);
        rt.setPosition( cc.p(0, target.height / 2) );
        target.removeAllChildren();
        target.addChild(rt);
    },
    //获得所有被选择的英雄的数组
    getSelectedTidArr: function () {
        var me = this;

        // selectedData分了位置
        var data = G.frame.yingxiong_xxxx.selectedData;
        var arr = [];
        if (!data) {
            return arr;
        }

        for (var pos in data) {
            var dd = data[pos];
            arr = arr.concat(dd);
        }

        return arr;
    },
});

})();