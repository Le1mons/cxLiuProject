/**
 * Created by wfq on 2018/6/2.
 */
(function () {
    //英雄-技能-详情
    var ID = 'yingxiong_skill_xq';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f6";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
        },
        onOpen: function () {
            var me = this;
            me.fillSize();

            me.initUi();
            me.bindBtn();
            me.ui.y -= 110;
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            me.DATA = me.data();
            if(me.DATA.is){
                if(G.frame.yingxiong_hecheng.isShow){
                    me.nodes.panel_top.setPosition(320, cc.director.getWinSize().height / 2 + 20);
                }else if(G.frame.worldtree.isShow){
                    me.nodes.panel_top.setPosition(313, 610);
                }else{
                    me.nodes.panel_top.setPosition(313, 471);
                }

                if(G.frame.yingxiong_pinglun.isShow) {
                    me.nodes.panel_top.setPosition(313, cc.director.getWinSize().height / 2 + 410);
                }
            }else{
                me.nodes.panel_top.setPosition(313, 700);
            }
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var data = me.DATA;
            var layIco = me.nodes.panel_jn;
            var txtName = me.nodes.txt_jn_name;
            var txtIntr = me.nodes.panel_jnnr;
            var txt_h = txtIntr.height;

            layIco.setBackGroundImage('ico/skillico/' + data.ico + '.png', 0);
            txtName.setString(data.name);

            var rt = new X.bRichText({
                size: 20,
                lineHeight: 20,
                color: G.gc.COLOR.n5,
                maxWidth: txtIntr.width,
                family: G.defaultFNT,
            });
            rt.text(data.intr);
            rt.setAnchorPoint(0, 1);
            rt.setPosition( cc.p(0, txtIntr.height) );
            txtIntr.removeAllChildren();
            txtIntr.addChild(rt);


            var extHeight = rt.trueHeight() - txt_h > 0 ? rt.trueHeight() - txt_h : 0;
            me.nodes.panel_top.height += extHeight;

            ccui.helper.doLayout(me.nodes.panel_top);
        },
    });

    G.frame[ID] = new fun('ui_top2.json', ID);
})();
