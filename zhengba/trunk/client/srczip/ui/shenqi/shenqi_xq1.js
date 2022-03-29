/**
 * Created by ys on 2018/9/15.
 */
(function () {
    //神器
    var ID = 'shenqi_xq1';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;

            me.ui.finds('panel_1').click(function () {
                me.remove();
            });
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
        getData: function(callback) {
            var me = this;
        },
        onShow: function () {
            var me = this;

            new X.bView('zhuangbei_tip5.json', function (view) {
                me._view = view;
                me.defHeight = me._view.height;
                me.ui.nodes.panel_nr.removeAllChildren();
                me.ui.nodes.panel_nr.addChild(view);
                me.curId = me.data().id;
                me.setContents();
                view.setTouchEnabled(true);
            });

        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var view = me._view;
            var id = me.curId;
            var conf = G.class.shenqi.getComById(id);
            var listview = view.nodes.pan;
            var buff, jnnr, bt, atk, hp, skillbuff, skillbuff_bt1, skillbuff_bt2;

            buff = G.class.shenqi.getBuffByIdAndLv(id, 1).buff;
            jnnr = G.class.shenqi.getSkillByIdAndDj(id, 0);
            bt = conf.name;
            skillbuff_bt1 = L('SHENQI_JCSX');
            atk = buff.atk;
            hp = buff.hp;
            skillbuff = conf.skillbuff;

            var inter = "";
            var interArr = jnnr.intr.split("$");
            for (var i in interArr) {
                inter += interArr[i];
            }
            var txt_jnnr = view.nodes.txt_jnnr;
            var ico_jn = view.nodes.ico_jn;
            view.nodes.txt_bt.setString(bt);
            view.nodes.ico_jn.setBackGroundImage('img/shenbing/' + conf.shenqiicon + '.png',0);
            txt_jnnr.setString(inter);
            txt_jnnr.setFontSize(18);
            txt_jnnr.height = 100;
            txt_jnnr.width = 380;
            ico_jn.setPosition(cc.p(28,ico_jn.y - 10));
            txt_jnnr.setPosition(cc.p(txt_jnnr.x + 3, txt_jnnr.y - 15));

            var str = "";
            str += skillbuff_bt1;
            str += "   ";
            str += X.STR(L('SHENQI_atk'), atk) + '      ' + X.STR(L('SHENQI_hp'), hp);
            var rh = new X.bRichText({
                size:18,
                maxWidth:listview.width,
                lineHeight:28,
                family:G.defaultFNT,
                color: G.gc.COLOR.n5,
            });
            rh.text(str);
            listview.addChild(rh);
            listview.setPosition(cc.p(listview.x + 5 , listview.y - 10));
            var offsetY = rh.trueHeight();
            var bg = view.finds('bg_1');
            bg.setContentSize( cc.size(bg.width,bg.height + offsetY + 5));
            ccui.helper.doLayout(bg);
            bg.setPositionY(bg.y + 20);
        },
        checkShow: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('panel_nr.json', ID);
})();