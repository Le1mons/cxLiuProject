(function () {
    var ID = 'slzt_dt';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;
            me._super(json, id, {
                action: true
            });
        },
        onOpen: function () {
            var me = this;
            me.bindBtn();
            me.setContents();
            X.setHeroModel({
                parent: me.nodes.panel_rw,
                data: {},
                model: "63025",
                noRelease: true,
                cache: false
            });
        },
        setContents: function () {
            var me = this;
            var question = G.class.slzt.getQuestions()[me.data().data.idx];
            me.nodes.txt_title.setString(question.content);
            for (var k in question.answer) {
                me.nodes["txt_dtwz" + k].setString(question.answer[k].intr)
                me.nodes["btn_dati" + k].key = k;
                me.nodes["btn_dati" + k].click(function (sender) {
                    if (sender.key == question.right) {
                        sender.loadTextureNormal("img/dati/img_dt_bg02.png", 1);
                    } else {
                        sender.loadTextureNormal("img/dati/img_dt_bg03.png", 1);
                    }
                    G.ajax.send('shilianzt_event', [me.data().idx, sender.key], function (d) {
                        if (!d) return;
                        var d = JSON.parse(d);
                        if (d.s == 1) {
                            G.frame.jiangli.once("close",function(){
                                me.remove();
                            }).data({
                                prize: d.d.prize
                            }).show();
                            G.frame.slzt.DATA.mydata = d.d.mydata; 
                        }
                    }, true);
                })
            }
        },
        onShow: function () {
            var me = this;
        },
        onAniShow: function () {
            var me = this;
        },
        bindBtn: function () {
            var me = this;
            me.nodes.mask.click(function (sender) {
                me.remove()
            })
        },
        onRemove: function () {
            var me = this;
        },
    });
    G.frame[ID] = new fun('shilianzhita_tk4.json', ID);
})();