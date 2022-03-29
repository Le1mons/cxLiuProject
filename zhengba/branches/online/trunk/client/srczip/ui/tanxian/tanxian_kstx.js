/**
 * Created by wfq on 2018/5/29.
 */
(function () {
    //探险-快速探险
    var ID = 'tanxian_kstx';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f3";
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            // setPanelTitle(me.ui.nodes.txt_title,L('UI_TITLE_' + me.ID()));
        },
        bindBtn: function () {
            var me = this;

        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            var data = G.frame.tanxian.DATA;
            me.setContents();
            if((data.maxbuytxnum - data.txnum) < 1 && !data.isadventure){
                G.frame.alert.data({
                    title: L("GM"),
                    cancelCall: null,
                    okCall: function () {
                        X.tiaozhuan(31);
                        me.remove();
                    },
                    richText: L("GMTXTQ"),
                    sizeType: 3
                }).show();
            }
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            var data = G.frame.tanxian.DATA;

            var panel = me.ui;
            var txtName = panel.nodes.txt_title;
            var layMf = panel.nodes.txt_nr;
            var layZs = panel.nodes.txt_nr1;
            var panelBtn = panel.nodes.panel_btn;

            panelBtn.removeAllChildren();
            panelBtn.removeBackGroundImage();
            layMf.removeAllChildren();
            layZs.removeAllChildren();

            //名称
            txtName.setString(L('UI_TITLE_' + me.ID()));

            // 消耗
            var str1 = '';
            if (data.freetxnum > 0) {
                str1 = L('TANXIAN_KSTX_1')  + '<br><br>' + X.STR(L('TANXIAN_KSTX_2'),data.freetxnum);

            } else {
                var need = G.class.tanxian.getKstxNeed(data.txnum);
                str1 = L('TANXIAN_KSTX_1')  + '<br>' + X.STR(L('TANXIAN_KSTX_3'),data.maxbuytxnum - data.txnum,need[0].n,P.gud.rmbmoney);
            }
            var rh1 = new X.bRichText({
                size:18,
                maxWidth:layMf.width,
                lineHeight:30,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT
            });
            rh1.text(str1);
            rh1.setAnchorPoint(0,1);
            rh1.setPosition(cc.p(0,layMf.height - 5));
            layMf.addChild(rh1);

            //特权
            var str2 = X.STR(L('TANXIAN_KSTX_4'), data.zchuodong ? 13 : 8);
            var tq = "<br>" + (data.isadventure ? X.STR(L("TQYJH"), parseInt((data.tqpasstime - G.time) / (24 * 3600))) : L("TQZTWJH"));
            str2 += tq;
            var rh2 = new X.bRichText({
                size:18,
                maxWidth:layZs.width,
                lineHeight:30,
                color:G.gc.COLOR.n5,
                family:G.defaultFNT
            });
            rh2.text(str2);
            rh2.setAnchorPoint(0,1);
            rh2.setPosition(cc.p(0,layZs.height - 20));
            layZs.addChild(rh2);

            var btn = me.nodes.btn_kstx = new ccui.Button();
            var img = 'img/public/btn/btn1_on.png';
            btn.loadTextures(img,'','',1);
            btn.setTitleText(L('BTN_KSTX'));
            btn.setTitleFontSize(24);
            btn.setTitleFontName(G.defaultFNT);
            btn.setTitleColor(cc.color(G.gc.COLOR.n13));


            btn.setPosition(cc.p(panelBtn.width / 2,panelBtn.height / 2));
            panelBtn.addChild(btn);

            btn.click(function () {
                var dq_jifen = P.gud.jifen;
                G.ajax.send('tanxian_fasttx',[],function(d) {
                    if(!d) return;
                    var d = JSON.parse(d);
                    if(d.s == 1) {
                        // for (var key in d.d) {
                        //     if (key == 'prize') {
                        //         continue;
                        //     }
                        //     G.frame.tanxian.DATA[key] = d.d[key];
                        // }
                        G.frame.tanxian.checkRedPoint();
                        G.frame.tanxian.getData();
                        G.class.ani.show({
                            json: "ani_kuaisutiaozhan",
                            addTo: G.frame.tanxian.ui,
                            repeat: false,
                            autoRemove: true,
                            // onkey: function (node, action, event) {
                            //     if(event == "hit"){
                            //     }
                            // }
                            onload: function(node, action){
                                X.audio.playEffect("sound/kuaisu.mp3", false);
                                G.DATA.tanxianAni = true;
                            },
                            onend: function (node, action) {
                                G.frame.jiangli.data({
                                    prize:[].concat(d.d.prize)
                                }).show();
                                G.DATA.tanxianAni = false;
                                G.event.emit("aniEnd");
                                for(var jf in d.d.prize){
                                    if(d.d.prize[jf].t == 'jifen'){
                                        G.frame.tanxian.yuan_jdl(dq_jifen,d.d.prize[jf].n);
                                        continue;
                                    }
                                }
                            }
                        });

                        me.remove();
                    }
                },true)
            }, 2000);


            me.ui.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            
            me.ui.setTimeout(function(){
            	G.guidevent.emit('tanxian_kstx_showover');
            },500);
        },
    });

    G.frame[ID] = new fun('ui_top4.json', ID);
})();