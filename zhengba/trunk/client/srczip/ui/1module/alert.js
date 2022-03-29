/**
 * Created by wfq on 2015/12/2.
 */
(function () {
    //提示
    var ID = 'alert';
    var fun = X.bUi.extend({
        ctor: function (json, id) {
            var me = this;

            me._super(json, id,{action:true});
        },
        onShow: function () {
            var me = this;

            this._okbtn = null;
            this._cancelbtn = null;
            me.ui.nodes.panel_nr.removeAllChildren();

            // ui_tip_tishi 有抬头文字
            // ui_tip_tishi5 无抬头文字
            new X.bView('tishi.json', function (view) {
                me.ui.nodes.panel_nr.addChild(view);
                me.view = view;
                cc.enableScrollBar(me.view.nodes.panel_txt);
                me.setContents();
            });
        },
        onRemove: function () {
        },
        onOpen: function () {
            var me = this;
            //cc.enableScrollBar()
        },
        setContents: function(){
            var me = this;

            this.fillSize();
            this.u_buttonbg = me.view.nodes.panel_btn;
            var args = this.data();
            this._autoClose = true;
            this.set(args);
            if (!this._okbtn) {
                this.okCall();
            }
            this.updateButtonPosition();
            this.ui.zIndex = args.zIndex!=null?args.zIndex:100000;

            this.close(true);
            !me.data().closeCall && this.closeCall();

            me.ui.setTimeout(function(){
            	G.guidevent.emit('alert_open_over');
            },500);
        },
        title: function (v) {
            // this.ui.nodes.top_title.setString(v);
            setPanelTitle(this.ui.nodes.txt_title, v);
        },
        autoClose: function (v) {
            this._autoClose = v;
        },
        ok: function (d) {
            d = d || {};
            if (!this._okbtn) {
                this._okbtn = new ccui.Button();
                this._okbtn.setTouchEnabled(true);
                this._okbtn.setName('btn_ok');
                this._okbtn.setAnchorPoint(C.ANCHOR[5]);
                this._okbtn.setTitleFontSize(24);
                this._okbtn.setTitleColor(cc.color(G.gc.COLOR.n13));
                this.u_buttonbg.addChild(this._okbtn);
                this._okbtn.setTitleFontName(G.defaultFNT);
            }
            this._okbtn.loadTextureNormal(d.bg || 'img/public/btn/btn1_on.png', ccui.Widget.PLIST_TEXTURE);
            this._okbtn.setTitleText(d.wz || L('BTN_OK'));
        },
        okCall: function (call) {
            if (!this._okbtn) {
                this.ok();
            }
            var me = this;
            this._okbtn.click(function (event, type) {
                if (me._autoClose) {
                    me.remove();
                }
                call && call();
            });
        },
        cancel: function (d) {
            d = d || {};
            if (!this._cancelbtn) {
                this._cancelbtn = new ccui.Button();
                this._cancelbtn.setTouchEnabled(true);
                this._cancelbtn.setName('btn_cancel');
                this._cancelbtn.setTitleFontName(G.defaultFNT);
                this._cancelbtn.setAnchorPoint(C.ANCHOR[5]);
                this._cancelbtn.setTitleFontSize(24);
                this._cancelbtn.setTitleColor(cc.color(G.gc.COLOR.n14));
                this.u_buttonbg.addChild(this._cancelbtn);
            }
            this._cancelbtn.loadTextureNormal(d.bg || 'img/public/btn/btn3_on.png', ccui.Widget.PLIST_TEXTURE);
            this._cancelbtn.setTitleText(d.wz || L('BTN_CANCEL'));
        },
        cancelCall: function (call) {
            if (!this._cancelbtn) {
                this.cancel();
            }
            var me = this;
            this._cancelbtn.click(function (event, type) {
                me.remove();
                call && call();
            }, this._cancelbtn);
        },
        close: function (v) {
            var me = this;
            me.ui.nodes.mask.setVisible(v);
        },
        closeCall: function (call) {
            var me = this;

            me.ui.nodes.mask.touch(function (sender, type) {
                if(type == ccui.Widget.TOUCH_ENDED){
                    me.remove();
                    call && call();
                }
            });
        },
        setButton: function (d) {
            var me = this;
            var button = new ccui.Button();
            button.setTouchEnabled(true);
            button.setAnchorPoint(C.ANCHOR[5]);
            button.loadTextures(d.img || 'button/button_hong1.png', '', '');
            button.setTitleFontSize(24);
            button.setTitleColor(cc.color(G.gc.COLOR.n14));
            button.setTitleText(d.name);
            button.click(function (sender, type) {
                d.call && d.call();
                me.remove();
            }, button);
            this.u_buttonbg.addChild(button);
        },
        setHeight: function (h) {
            this.view.height = h;
            this.fillSize();
        },
        sizeType: function (v) {
            v = v || 0;
            var sizesHeight = [400, 550, 710, 300, 350];
            this._uiHeight = sizesHeight[v];
            this.setHeight(this._uiHeight);  //不处理width
        },
        updateButtonPosition: function () {
            var buttonbg = this.u_buttonbg;
            var w = buttonbg.width;
            var h = buttonbg.height;
            var count = buttonbg.getChildrenCount();
            for (var i = 0; i < count; i++) {
                var button = buttonbg.getChildren()[i];
                var size = button.getSize();
                var x = w / 2 + (i + .5 - count / 2) * (size.width + 80);
                var y = h / 2;
                button.setPosition(cc.p(x, y));
            }
        },
        fontsize: function (v) {
            this._fontsize = v;
            return this;
        },
        cuttingLine: function(v){
            var me = this;
            me.view.nodes.text_xian.setString(v);
            me.view.nodes.text_xian.setTextColor('#804326');
        },
        remarks: function(v){
            var me = this;
            me.view.nodes.text_ts.setString(v);
            me.view.nodes.text_ts.setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
            me.view.nodes.text_ts.setTextColor(cc.color('#804326'));
        },
        richText: function (v) {
            // var listView = this.u_listView;
            var me = this;

            var _maxWidth = this.view.nodes.panel_txt.width;
            var data = me.data();
            var richText = new X.bRichText({
                size: me._fontsize || 24,
                maxWidth: _maxWidth,
                lineHeight: (data && data.lineheight) || ((me._fontsize || 24) + 2),
                family:G.defaultFNT,
                color: "#804326",
            });

            if (data && data.richNodes) {
                if(data.richNodes[0].getParent()) {
                    data.richNodes[0].parent = null;
                }
                richText.text(v, data.richNodes);
            } else {
                richText.text(v);
            }
            if(!v.indexOf('<br>') && richText.trueHeight() <= 26){
                this.view.nodes.panel_txt.x += (this.view.nodes.panel_txt.width/2 - richText.trueWidth()/2);
            }
            richText.setPosition(0, this.view.nodes.panel_txt.height - richText.trueHeight());
            this.view.nodes.panel_txt.removeAllChildren();
            this.view.nodes.panel_txt.addChild(richText);
            if(richText.trueWidth() < _maxWidth){
                this.view.nodes.panel_txt.setPosition(cc.p(this.view.width/2 + (this.view.nodes.panel_txt.width-richText.trueWidth())/2,140 + (richText.trueHeight() - 24)/2));
            }
        },
        xiaoHao: function(v) {
            var me = this;
            var _maxWidth = this.view.nodes.panel_xh.width;
            var data = me.data();
            var richText = new X.bRichText({
                size: me._fontsizeXh || 18,
                maxWidth: _maxWidth,
                lineHeight: (me._fontsizeXh || 18) + 2,
                color: G.gc.COLOR.n4,
                family: G.defaultFNT
            });

            richText.text.apply(richText, v); // [X.STR(str, a,n), img]
            richText.setPosition( (this.view.nodes.panel_xh.width - richText.trueWidth()) * 0.5, this.view.nodes.panel_xh.height - richText.trueHeight());
            this.view.nodes.panel_xh.removeAllChildren();
            this.view.nodes.panel_xh.addChild(richText);
        },
        set: function (args) {
            if (!args) return;
            if (!args.sizeType) args.sizeType = 0;

            // if (args.close || args.closeCall) {
            //     this.close(args.close);
            //     this.closeCall(args.closeCall);
            // }
            for (var key in args) {
                if (key == 'ok') continue;
                this[key] && this[key](args[key]);
            }
            if (args.ok || args.okCall) {
                this.ok(args.ok);
            }

            if (!args.title) {
                this.title(L('TS'));
            }
        },
        updateText: function () {
            var me = this;
            me.richText(me.data().richText);
        }
    });

    G.frame[ID] = new fun('ui_tip_tishi.json', ID);
    G.frame.alert_1 = new fun('ui_tip_tishi.json', "alert_1");
})();
