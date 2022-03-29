/**
 * Created by yaosong on 2018-10-24
 */
(function() {
    //融魂-详情
    var ID = 'ui_top_rh';

    var fun = X.bUi.extend({
        ctor: function(json, id) {
            var me = this;
            me.singleGroup = "f4";
            me._super(json, id, {action:true});
        },
        setContents: function() {
            var me = this;

            var listview = me.nodes.listview;
            var bg = me.nodes.bg_top;
            cc.enableScrollBar(listview);
            listview.setTouchEnabled(true);
            var up = G.class.meltsoul.getById(me.data().hid);
            var openlv = G.class.meltsoulcom.get().base.tupo;
            var sarr = [L("atk"), L("def"), L("hp"), L("speed"), L("")];
            var arr = ["atk", "def", "hp", "speed", ""];

            var key = X.keysOfObject(up);
            for (var i = 0; i < key.length - 1; i++) {
                var up_list = me.nodes.list$.clone();
                X.autoInitUI(up_list);
                var txt_wz = up_list.nodes.txt_wz;

                // var ewai_up = "";
                // var ewai_name = "";
                // for (var j = 0; j < arr.length; j++) {
                //     if (up[i+1].extrabuff[arr[j]]) {
                //         ewai_up = up[i+1].extrabuff[arr[j]];
                //         ewai_name = sarr[j];
                //     }
                // }
                var ewa = up[i + 1].extrabuff;
                var bf = X.keysOfObject(ewa);



                var str = "";
                str += X.STR(L("YXRH_XQ1"), i + 2, openlv[i + 1]);
                str += "<br>";
                str += X.STR(L("YXRH_XQ2"), up[i+2].upperlimit.atk);
                str += "      ";
                str += X.STR(L("YXRH_XQ3"), up[i+2].upperlimit.hp);
                str += "<br>";
                str += X.STR(L("YXRH_XQ4"), L(bf[0]), bf[0].indexOf("pro") != -1 ? ewa[bf[0]] / 10 + "%" : ewa[bf[0]]);

                var rh = new X.bRichText({
                    size: 20,
                    maxWidth: txt_wz.width,
                    lineHeight: 24,
                    color: me.dengjie >= (i+2) ? "#30ff01" : "#63584a",
                    family: G.defaultFNT
                });

                rh.text(str);
                rh.setAnchorPoint(0, 1);
                rh.setPosition(5, txt_wz.height / 2 + rh.trueHeight() / 2);
                txt_wz.addChild(rh);
                up_list.show();
                listview.pushBackCustomItem(up_list);
            }
            listview.setContentSize(cc.size(me.nodes.list$.width, (me.nodes.list$.height + 10) * (key.length - 1)));
            var bg_addY = (me.nodes.list$.height + 10) * (key.length - 1) - bg.height;
            bg.setContentSize(cc.size(me.nodes.list$.width + 20, (me.nodes.list$.height + 2) * (key.length - 1)));
            if(key.length < 6){
                bg.setPositionY(bg.y - bg_addY/2);
            }
            listview.setPositionY(me.nodes.bg_top.y + me.nodes.bg_top.height / 2);
        },
        bindUI: function() {
            var me = this;

            me.nodes.mask.click(function() {
                me.remove();
            });
        },
        onOpen: function() {
            var me = this;
            me.bindUI();
        },
        onShow: function() {
            var me = this;
            me.curXbId = me.data().tid;
            me.curId = me.data().hid;
            me.dengjie = me.data().dengjie;

            me.setContents();

        },
        onRemove: function() {
            var me = this;
        },
    });

    G.frame[ID] = new fun('ui_top7.json', ID);
})();
