(function () {
    //读取服务端的特殊配置
    //这些配置主要配置在config.py中，并且需要在进入游戏前加载给客户端
    //如：是否处于appstore版本提审期等
    G.serverconfig = {
        DATA : {},
        getData : function(callback){
            var me = this;
            G.ajax.send("system_config",[], function (data) {
                data = X.toJSON(data);
                if (data.s == 1){
                    me.DATA = data.d;

					if(me.DATA['tishen']){
						G.tiShenIng = true;
					}

                }
                callback && callback();
            });
        }
    };
    
    G.gameconfig = {
		DATA : {},
		getData : function(callback){
			var me = this;
			X.ajax.get("http://gameconfig.legu.cc/?app=getkv&game=zhengba&ctype="+encodeURIComponent('客户端配置'),"", function (data) {
				data = X.toJSON(data);
				if (data.ret == true){
					me.DATA = data.data;
				}
				callback && callback();
			});
		},
		get:function(k){
			return this.DATA[k];
		}
	};
	G.gameconfig.getData();
	
})();