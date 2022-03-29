/**
 * Created by LYF on 2018/6/2.
 */
(function () {
    //英雄-天命详情
    var ID = 'yingxiong_tianming';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id);
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {
                me.remove();
            });

            if(G.frame.yingxiong_xxxx.tongyu.isRecevie) {
                me.nodes.btn_rcjl.setTouchEnabled(false);
                me.nodes.btn_rcjl.setBright(false);
                me.nodes.btn_rcjl.setTitleText(L("YLQ"));
                me.nodes.btn_rcjl.setTitleColor(cc.color("#6c6c6c"));
            }
            me.nodes.btn_rcjl.click(function (sender) {
                me.ajax("hero_gettmprize", [], function (str, data) {
                    if(data.s == 1) {
                        G.frame.jiangli.data({
                            prize: data.d.prize
                        }).show();
                        sender.setTouchEnabled(false);
                        sender.setBright(false);
                        sender.setTitleText(L("YLQ"));
                        sender.setTitleColor(cc.color("#6c6c6c"));
                        G.frame.yingxiong_xxxx.tongyu.isRecevie = true;
                        G.hongdian.getData("destiny", 1, function () {
                            G.frame.yingxiong.checkRedPoint();
                            G.frame.yingxiong_xxxx.tongyu.checkRedPoint();
                        })
                    }
                })
            })
        },
        onOpen: function () {
            var me = this;

            me.fillSize();
            me.initUi();
            me.bindBtn();
            cc.enableScrollBar(me.nodes.listview);
            me.nodes.listview.setTouchEnabled(true);
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var conf = G.class.tongyu.get().base.destiny;

            for (var i = 0; i < conf.length; i ++) {
                me.nodes.listview.pushBackCustomItem(me.setItem(me.nodes.list.clone(), conf[i], i));
            }
        },
        setItem: function (ui, data, i) {
            X.autoInitUI(ui);

            ui.nodes.txt_name.setString(data[1].title + "(" + L("TMD") + data[0] + ")");
            ui.nodes.txt_jysz.setString(data[1].prize[0].n);
            ui.nodes.txt_gj.setString(L("QTGJ") + "+" + (data[1].buff[1].atkpro / 10) + "%");
            ui.nodes.txt_sm.setString(L("QTSM") + "+" + (data[1].buff[0].hppro / 10) + "%");
            ui.finds("txt_jl_0").setTextColor(cc.color("#F88826"));
            if(data[1].avater) {
                ui.finds("txt_jl_0").setString(L("HDZSTX") + data[1].head);
            }
            if(data[1].chenghao) {
                ui.finds("txt_jl_0").setString(L("HDZSCH") + data[1].chenghaoshow);
            }

            if((G.frame.yingxiong_xxxx.tongyu.index || G.frame.yingxiong_xxxx.tongyu.index == 0) && G.frame.yingxiong_xxxx.tongyu.index == i) {
                ui.nodes.img_dqzt.show();
                ui.nodes.img_bq.show();
                ui.nodes.txt_name.setTextColor(cc.color("#30ff01"));
                ui.nodes.txt_jl.setTextColor(cc.color("#30ff01"));
                ui.nodes.txt_gj.setTextColor(cc.color("#30ff01"));
                ui.nodes.txt_sm.setTextColor(cc.color("#30ff01"));
                ui.nodes.txt_jy.setTextColor(cc.color("#30ff01"));
                ui.nodes.txt_jysz.setTextColor(cc.color("#30ff01"));
            }

            if(!G.frame.yingxiong_xxxx.tongyu.index || G.frame.yingxiong_xxxx.tongyu.index < i) {
                ui.nodes.txt_name.setTextColor(cc.color("#615547"));
                ui.nodes.txt_jl.setTextColor(cc.color("#615547"));
                ui.nodes.txt_gj.setTextColor(cc.color("#615547"));
                ui.nodes.txt_sm.setTextColor(cc.color("#615547"));
                ui.nodes.txt_jy.setTextColor(cc.color("#615547"));
                ui.nodes.txt_jysz.setTextColor(cc.color("#615547"));
                ui.nodes.img_gj.setBackGroundImage("img/public/ico_ty_gongj2.png", 1);
                ui.nodes.img_sm.setBackGroundImage("img/public/ico_ty_shengm2.png", 1);
                ui.nodes.img_jy.setBackGroundImage("img/public/ico_ty_jingy2.png", 1);
            } else {
                ui.nodes.img_gj.setBackGroundImage("img/public/ico_ty_gongj1.png", 1);
                ui.nodes.img_sm.setBackGroundImage("img/public/ico_ty_shengm1.png", 1);
                ui.nodes.img_jy.setBackGroundImage("img/public/ico_ty_jingy1.png", 1);
            }

            ui.show();
            return ui;
        }
    });
    G.frame[ID] = new fun('ui_top9.json', ID);
})();