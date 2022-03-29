/**
 * Created by  on 2019//.
 */
(function () {
    //决斗盛典神器
    var ID = 'juedoushengdian_sq';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.fullScreen = false;
            me._super(json, id, {action: true});
        },
        onOpen: function () {
            var me = this;
            me.cursqid = G.frame.juedoushengdian_fightplan.curSqId || 1;
            me.nodes.txt_title.setString(L("SQCD"));
            me.ui.finds("listview").show();
            cc.enableScrollBar(me.ui.finds('listview'));
            me.bindBtn();
            me.fillSize();
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function () {
                me.remove();
            })
        },
        onShow: function () {
            var me = this;
            new X.bView("shenbing_chuandai.json", function (node) {
                me.ui.addChild(node);
                node.hide();
                me.list = node.finds("list1");
                me.setContents();
            })
        },
        onAniShow: function () {
            var me = this;
        },
        onRemove: function () {
            var me = this;
        },
        setContents:function () {
            var me = this;
            me.ui.finds("listview").removeAllChildren();
            var conf = G.class.shenqi.get();
            var keys = X.keysOfObject(conf);
            for(var i = 0; i < 6; i ++) {
                me.setItem(conf[keys[i]], i + 1);
            }
        },
        setItem:function (conf,sqid) {
            var me = this;
            var ui = me.list.clone();
            X.autoInitUI(ui);
            ui.show();
            ui.finds('btn1').show();
            ui.finds('btn2').hide();
            ui.finds('btn3').hide();
            ui.finds('yzb').hide();
            ui.finds("shenbing").x += 38;
            ui.finds("shenbing").y += 25;
            ui.finds("shenbing").zIndex = 888;

            ui.finds('btn1').loadTextureNormal("img/shenbing/shenbing_diban" + sqid + ".png",1);
            var img_sb = ui.finds("shenbing");
            img_sb.setPosition(0,0);
            img_sb.setBackGroundImage("img/shenbing/shenbing_wq_0" + sqid + ".png", 0);
            G.class.ani.show({
                json: "ani_shenbing_peidaitexiao0" + sqid,
                addTo: ui.finds("btn1"),
                x: ui.finds("btn1").width / 2,
                y: ui.finds("btn1").height / 2,
                repeat: true,
                autoRemove: false,
            });
            if(sqid == me.cursqid){//正在穿戴
                ui.finds('btn2').show();
                ui.finds('yzb').show();
            }else {
                ui.finds('btn3').show();
            }

            //卸下
            ui.finds('btn2').touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.cursqid = null;
                    G.frame.juedoushengdian_fightplan.curSqId = 1;
                    sender.hide();
                    sender.getParent().finds('btn3').show();
                    sender.getParent().finds('yzb').hide();
                }
            });
            //穿戴
            ui.finds('btn3').sqid = sqid;
            ui.finds('btn3').touch(function (sender,type) {
                if(type == ccui.Widget.TOUCH_NOMOVE){
                    me.cursqid = sender.sqid;
                    if(G.frame.juedoushengdian_fightplan.isShow){
                        G.frame.juedoushengdian_fightplan.curSqId = me.cursqid;
                        G.frame.juedoushengdian_fightplan.addShenQi();
                    }
                    me.setContents();
                }
            });

            ui.finds("btn_xqdi").click(function () {
                var artifact = G.DATA.shenqi.artifact[sqid];
                G.frame.shenqi_xq.data({
                    id: sqid,
                    jh: true,
                    lv: 120,
                    djlv: 24,
                    jxlv: 0,
                    rank: 0
                }).show();
            });

            me.ui.finds("listview").pushBackCustomItem(ui);
        }
    });
    G.frame[ID] = new fun('ui_tip2.json', ID);
})();