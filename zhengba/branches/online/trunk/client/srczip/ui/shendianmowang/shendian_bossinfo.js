G.class.bossInfo = function (type, id) {
    var conf = {};
    var img;

    switch (type) {
        case "name":

            conf.title = L("MWXX");
            conf.conf = G.class.shendianmowang.get().base[id].intr;
            img = "ico/skillico/" + G.class.shendianmowang.get().base[id].intr[0].ico + ".png";
            break;
        case "job":
            var config = G.class.shendianmowang.get().base.jobbuff;

            for (var i in config) {
                if(config[i].beidong == id) {
                    conf.conf = config[i];
                    break;
                }
            }

            conf.title = L("MWRD");
            img = "ico/skillico/" + conf.conf.ico + ".png";
            break;
        case "zhongzu":
            var config = G.class.shendianmowang.get().base.zhongzubuff;

            for (var i in config) {
                if(config[i].beidong == id) {
                    conf.conf = config[i];
                    break;
                }
            }

            conf.title = L("MWRD");
            img = "ico/skillico/" + conf.conf.ico + ".png";
            break;
    }

    var ico = new ccui.Layout;
    ico.setContentSize(50, 50);
    ico.setAnchorPoint(0.5, 0.5);
    ico.setTouchEnabled(true);
    ico.conf = conf;

    var pic = new ccui.ImageView(img);
    pic.setScale(.5);
    pic.setAnchorPoint(0.5, 0.5);
    pic.setPosition(ico.width / 2, ico.height / 2);
    ico.addChild(pic);

    ico.click(function (sender) {
        G.frame.shendianmowang_info.data(sender.conf).show();
    });

    return ico;
};

/**
 * Created by LYF on 2019/1/11.
 */
(function () {
    //神殿魔王-信息
    var ID = 'shendianmowang_info';

    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {action:true});
        },
        initUi: function () {
            var me = this;

            me.nodes.name.setString(me.DATA.title);
        },
        bindBtn: function () {
            var me = this;

            me.nodes.mask.click(function () {

                me.remove();
            })
        },
        onOpen: function () {
            var me = this;
            me.DATA = me.data();
            me.initUi();
            me.bindBtn();
            me.fillSize();
        },
        onAniShow: function () {
            var me = this;
        },
        onShow: function () {
            var me = this;

            cc.enableScrollBar(me.nodes.listview);
            me.nodes.panel_top.setPositionY(cc.director.getWinSize().height / 2);
            me.setContents();
        },
        onHide: function () {
            var me = this;
        },
        setContents: function () {
            var me = this;

            if(me.DATA.conf.length > 1) {
                me.nodes.panel_top.height += (me.DATA.conf.length - 1) * me.nodes.list.height + 30;
                ccui.helper.doLayout(me.nodes.panel_top);

                for (var i in me.DATA.conf) {
                    me.setList(me.DATA.conf[i]);
                }
            } else {
                me.setList(me.DATA.conf);
            }
        },
        setList: function (data) {
            var me = this;
            var list = me.nodes.list.clone();
            X.autoInitUI(list);
            list.nodes.panel_jn.setBackGroundImage("ico/skillico/" + data.ico + ".png");
            list.nodes.txt_jn_name.setString(data.name);
            list.nodes.panel_jnnr.setString(data.intr);
            list.show();
            me.nodes.listview.pushBackCustomItem(list);
        }
    });
    G.frame[ID] = new fun('ui_sdzl_tip1.json', ID);
})();