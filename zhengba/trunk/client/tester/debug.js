(function(){

	var debugPanel = {
		main : null,
		_create : function(){
			var fs = cc.director.getWinSize();

			var panel = this.main = new ccui.Layout();
			panel.setBackGroundColor( cc.color('#000000') );
			panel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
			panel.width = 620;
			panel.height = fs.height/2;
			panel.setAnchorPoint(0,0);
			panel.x = (fs.width - panel.width)/2;
			panel.y = fs.height-panel.height-10;
			panel.zIndex = 99999999;
			panel.setBackGroundColorOpacity(100);

			this.list = new ccui.ListView();
			this.list.width = panel.width;
			this.list.height = panel.height-50;
			this.list.x = 0;
			this.list.y = 50;
			panel.addChild(this.list);

			var inputBG = this.inputBG = new ccui.Layout();
			inputBG.setBackGroundColor( cc.color('#000000') );
			inputBG.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
			inputBG.width = panel.width-20;
			inputBG.height = 30;
			inputBG.setAnchorPoint(0,0);
			inputBG.x = 10;
			inputBG.y = 10;
			inputBG.setBackGroundColorOpacity(100);
			panel.addChild(inputBG);

			var box = this.box = new cc.EditBox(cc.size(inputBG.width, inputBG.height), new cc.Scale9Sprite());
			box.setString("输入GM命令");
			box.setPlaceHolder('输入GM命令');
			box.x = 0;
			box.y = 0;
			box.setAnchorPoint(0,0);
			box.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
			box.setInputFlag(cc.EDITBOX_INPUT_FLAG_SENSITIVE);
			box.setReturnType(cc.KEYBOARD_RETURNTYPE_DONE );
			box.setFontColor(cc.color(15, 250, 245));
			box.setDelegate({
				editBoxEditingDidEnd:function (editBox) {
					var _val = editBox.getString();

					if(editBox._lastString==_val){
						editBox._lastString = '输入GM命令';
						editBox.setString('输入GM命令');
						return;
					}

					if(_val!='输入GM命令'){
						editBox._lastString = '输入GM命令';
						editBox.setString('输入GM命令');
						
						_val = _val.replace(/\n/g,'');
						cc.log('执行GM命令',_val);
						eval( _val );
					}
				}
			});
			inputBG.addChild(box);
			cc.director.getRunningScene().addChild(panel);
			this.showHistory();
		},
		toggle : function(){
			if(cc.sys.isObjectValid(this.main)){
				this.main.removeFromParent();
			}else{
				this._create();
			}
		},
		showHistory : function(){
			var me = this;
			cc.loader.loadTxt('GM.txt',function(err,res){
				var cmds = res.split("\n");
				for(var i=0;i<cmds.length;i++){
					var text = new ccui.Text( cmds[i] ,"",18);
					text.addTouchEventListener(function(sender,type){
						if (type == ccui.Widget.TOUCH_ENDED){
							var cmd = sender.getString();
							cmd = cmd.trim();
							if(cmd=="")return;

							if(cmd.indexOf('//有变量')==-1){
								cc.log('执行GM命令',cmd);
								eval(cmd);
							}else{
								me.box._lastString = cmd;
								me.box.setString( cmd );
							}
						}
					},text);
					text.setTouchEnabled(true);
					me.list.addChild(text);
				}
			});

		}
	};

	//setInterval(function(){
		cc.eventManager.addListener({
			event: cc.EventListener.KEYBOARD,
			onKeyReleased: function(keyCode, event) {
				if(123 == keyCode){
					debugPanel.toggle();
				}
			}
		}, -1);
	//},1000);
})();

function SHOW_UI_NAME(){
	X.bView.prototype._old_createSucc = X.bView.prototype._createSucc;
	
	X.bView.prototype._createSucc = function(){
		var me = this;
		X.bView.prototype._old_createSucc.call(this);

		if(!cc.isNode(me.__showuiname)){
			var text = new ccui.Text();
			text.setString(me._json);
			text.setAnchorPoint(0,1);
			text.setFontSize(19);

			var lay = me.__showuiname = new ccui.Layout();
			lay.setBackGroundColor( cc.color('#000000') );
			lay.setAnchorPoint(0,1);
			//lay.setBackGroundColorOpacity(255);
			lay.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
			lay.x = 0;
			lay.y = me.ui.height;
			lay.zIndex = 99999999;
			lay.setContentSize(text.width,text.height);

			text.y = lay.height;
			text.x = 0;
			lay.addChild(text);
			me.ui.addChild(lay);
		}
	};
}