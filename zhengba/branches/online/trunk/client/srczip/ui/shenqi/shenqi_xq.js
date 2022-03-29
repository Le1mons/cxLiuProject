/**
 * Created by ys on 2018/9/15.
 */
(function () {
    //神器
    var ID = 'shenqi_xq';

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

            new X.bView('zhuangbei_tip4.json', function (view) {
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
            var data = me.data();
            var listview = view.nodes.pan;
            var buff, jnnr, bt, atk, hp, skillbuff, skillbuff_bt1, skillbuff_bt2;

            if(me.data().jh){
                buff = G.class.shenqi.getBuffByIdAndLv(id, data.lv).buff;
                jnnr = G.class.shenqi.getSkillByIdAndDj(id, data.djlv);
                bt = X.STR(L('SHENQI_bt'), conf.name, data.lv);
                skillbuff_bt1 = L('SHENQI_JCJC');
                skillbuff_bt2 = L('SHENQI_JNJC');
                atk = buff.atk;
                hp = buff.hp;
                skillbuff = conf.skillbuff;

                var txt_jnnr = view.nodes.txt_jnnr;
                var ico_jn = view.nodes.ico_jn;
                view.nodes.txt_bt.setString(bt);
                view.nodes.ico_jn.setBackGroundImage('img/shenbing/' + conf.shenqiicon + '.png',0);
                txt_jnnr.setString(jnnr.intr);
                txt_jnnr.setFontSize(18);
                txt_jnnr.height = 100;
                txt_jnnr.width = 380;
                ico_jn.setPositionX(35);
                ico_jn.setPositionY(ico_jn.y - 15); 
                txt_jnnr.setPositionY(txt_jnnr.y - 15);

                var str = "";
                var str1 = "";
                var str_buff = "";
                var str_kongge = "";
                str += skillbuff_bt1;
                str += "<br>" + X.STR(L('SHENQI_atk'), atk) + '         ' + X.STR(L('SHENQI_hp'), hp);
                // str += "<br>";
                str1 += "<br>" + skillbuff_bt2;

                for(var i in skillbuff){

                    var skillbuff_name = X.keysOfObject(skillbuff[i]);
                    var shenqi_killbuff = i <= data.djlv ? L('SHENQI_KILLBUFF') : L('SHENQI_KILLBUFF_H');
                    var shenqi_jndj = i <= data.djlv ? L('SHENQI_JNDJ') : L('SHENQI_JNDJ_H');

                    if(skillbuff_name == "speed"){
                        str_buff = X.STR(shenqi_killbuff, L(skillbuff_name), skillbuff[i][skillbuff_name]);
                        str_kongge = "                ";
                    }else{
                        str_buff =  X.STR(shenqi_killbuff, L(skillbuff_name), (skillbuff[i][skillbuff_name] / 10) + '%');
                        str_kongge = "          ";
                    }
                    str1 += "<br>" + str_buff;
                    str1 += str_kongge;
                    str1 += X.STR(shenqi_jndj, i);
                }

                var rh = new X.bRichText({
                    size:18,
                    maxWidth:listview.width,
                    lineHeight:28,
                    family:G.defaultFNT,
                    color: G.gc.COLOR.n5,
                });
                var rh1 = new X.bRichText({
                    size:18,
                    maxWidth:listview.width,
                    lineHeight:28,
                    family:G.defaultFNT,
                    color: G.gc.COLOR.n5,
                });
                rh.text(str);
                rh1.text(str1);
                listview.addChild(rh);
                listview.addChild(rh1);
                rh.setPositionY(140);
                rh1.setPositionY(17);
                var offsetY = rh.trueHeight() + rh1.trueHeight();
                var bg = view.finds('bg_1');
                bg.setContentSize( cc.size(bg.width,bg.height + offsetY + 10));
                ccui.helper.doLayout(bg);
                listview.setPosition(cc.p(32,listview.y + 40));
                bg.setPositionY(bg.y + view.nodes.txt_jnnr.height + view.nodes.txt_bt.height + 110);
            }
            view.nodes.panel_bg.setPositionY(-50);
        },
        checkShow: function () {
            var me = this;
        }
    });
    G.frame[ID] = new fun('panel_nr.json', ID);
})();