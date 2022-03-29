/**
 * Created by wfq on 2018/6/6.
 */
(function () {
    //战斗-种族克制
    var ID = 'fight_zzkezhi';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me.singleGroup = "f5";
            me._super(json, id, {action: true});
        },
        initUi: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            
            me.nodes.mask.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
            
            me.nodes.txt_djgb.setTouchEnabled(true);
            me.nodes.txt_djgb.touch(function (sender, type) {
                if (type == ccui.Widget.TOUCH_ENDED) {
                    me.remove();
                }
            });
        },
        onOpen: function () {
            var me = this;
            me.fillSize();
            me.initUi();
            me.bindBtn();
            me.zf = me.data() || "";
            cc.enableScrollBar(me.nodes.listview);
        },
        onAniShow: function () {
            var me = this;
            G.guidevent.emit('fight_zzkezhiOpenOver');
        },
        onShow: function () {
            var me = this;

            me.nodes.list.hide();
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;
            var zf = [];
            var conf = G.class.zhenfa.get();
            var keys = X.keysOfObject(conf.zhenfa);

            for (var i = 0; i < keys.length; i ++) {
                var obj = {
                    id: keys[i],
                    active: me.zf == keys[i] ? 1 : 0
                };
                zf.push(obj);
            }
            zf.sort(function (a, b) {
                if(a.active !== b.active) {
                    return a.active > b.active ? -1 : 1;
                }else{
                    return a.id * 1 < b.id * 1 ? -1 : 1;
                }
            });
            for (var i = 0; i < zf.length; i ++) {
                me.nodes.listview.pushBackCustomItem(me.setItem(zf[i]));
            }
        },
        setItem: function (conf) {
            var me = this;
            var buffArr = [];
            var data = G.class.zhenfa.getById(conf.id);
            var list = me.nodes.list.clone();

            list.show();

            list.finds("panel_1").setBackGroundImage('img/zhenfa/' + G.class.zhenfa.getIcoById(conf.id) + '.png',1);
            // G.class.ani.show({
            //     json: parseInt(conf.id) < 10 ? "ani_zhenyingbuff_0" + conf.id : "ani_zhenyingbuff_" + conf.id,
            //     addTo: list.finds("panel_1"),
            //     x: list.finds("panel_1").width / 2,
            //     y: list.finds("panel_1").height / 2,
            //     repeat: true,
            //     autoRemove: false
            // });

            if(conf.active == 1) list.finds("Image_3").show();

            var buffKeys = X.keysOfObject(data.buff);
            buffKeys.sort(function (a,b) {
                return a < b ? -1 : 1;
            });

            for (var i = 0; i < buffKeys.length; i++) {
                var key = buffKeys[i];
                var obj = {};
                obj[key] = data.buff[key];
                var tip = X.fmtBuff(obj,'<font color='+ G.gc.COLOR.n5 +'>{1}</font>+{2}')[0].tip;
                buffArr.push(tip);
            }

            for (var i = 0; i < buffArr.length; i ++) {
                var rt = new X.bRichText({
                    size: 20,
                    lineHeight: 20,
                    color: G.gc.COLOR.n7,
                    maxWidth: list.finds("panel_3").width,
                    family: G.defaultFNT,
                });
                rt.text(buffArr[i]);
                rt.setAnchorPoint(0, 1);
                rt.setPosition(50, list.finds("panel_3").height - 4 - i * (rt.trueHeight() + 5));
                list.finds("panel_3").addChild(rt);
            }

            var zzImg = [];
            for (var i in data.cond) {
                var img = new ccui.ImageView('img/public/ico/ico_zz' + (i * 1 + 1) + '.png', 1);
                if(data.cond[i] > 1) {
                    for(var j = 1; j < data.cond[i]; j ++) {
                        zzImg.push(img.clone());
                    }
                }
                zzImg.push(img.clone());
            }
            X.center(zzImg, list.finds("panel_2"), {
                scale: .86
            });
            
            return  list;
        }
    });

    G.frame[ID] = new fun('zhandou_top_zzkz.json', ID);
})();