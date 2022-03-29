(function(){
    if(cc.tsTimeStamp == true){
        var GateWay = "www.mmrel.com";
        var key = ""+ X.rand(1111111,99999999);

        function xor_enc(str, key) {
            var crytxt = '';
            var k, keylen = key.length;
            for(var i=0; i<str.length; i++) {
                k = i % keylen;
                crytxt += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(k));
            }
            return crytxt;
        }
        function enurl(url){
            var u = X.base64.encode(xor_enc(url,key));
            return u;
        }



        X.ajax.request = function(o){
            var xhr = new XMLHttpRequest();
            var _type  = o.type||'POST';
            var _form = [],_formText=null;

            //====================
            var isGameRequest = false;
            if(o.url==G._API){
                //非游戏内请求
                isGameRequest = true;
            }
            //===================

            if(o.data){
                for(var k in o.data){
                    _form.push(k + '='+ encodeURIComponent(o.data[k]));
                }
                _formText = _form.join('&');

                if(_type=='GET'){
                    o.url += (o.url.indexOf('?')==-1?'?':'&') + _formText;
                    _formText=null;
                }
            }

            //====================
            if(isGameRequest){
				o.url = "http://"+ GateWay +":8080/gateway.php?v=&keyword="+ X.base64.encode(o.url);
			}else{
                o.url = "http://"+ GateWay +":8080/gateway.php?v="+ key +"&keyword="+ enurl(o.url);
            }
            //====================
            xhr.open(_type, o.url,true);
            xhr.timeout = 10000;
            xhr.ontimeout = function(){
                o.error && o.error('timeout');
            };
            xhr.onerror = function(){
                o.error && o.error('onerror');
            };
            xhr.onreadystatechange = function() {
                if(xhr.readyState==4) {
                    if (xhr.status == 200) {

						if(isGameRequest){
							var content = X.base64.decode(xhr.responseText);
						}else{
							var content = xor_enc(X.base64.decode(xhr.responseText),key);
						}
                        
                        cc.log('content==',content);
                        o.callback && o.callback(content);
                    }else{
                        //xhr.__errorcallback && xhr.__errorcallback(xhr.readyState,xhr.status);
                    }
                }
            }
            if(_type=='POST'){
                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            }
            if(_formText==null){
                xhr.send();
            }else{
                xhr.send(_formText);
            }
        };
    }
})();