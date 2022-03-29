(function(){
    //AJAX请求
    X.ajax = {
        /*
         o = {
             type : GET|POST,
             url : url,
             data : {k:v}
             callback : function(text){

             },
             error : function(readyState,status){

             }
         }
         */
        request : function(o){
            var xhr = new XMLHttpRequest();

            var _type  = o.type||'POST';
            var _form = [],_formText=null;
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
                        o.callback && o.callback(xhr.responseText);
                    }else{
                        //xhr.__errorcallback && xhr.__errorcallback(xhr.readyState,xhr.status);
                    }
                }
            };
            if(_type=='POST'){
                if (o.headType == "json") {
                    xhr.setRequestHeader("Content-type", "application/json");
                    _formText = JSON.stringify(o.data);
                } else {
                    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                }
            }
            if(_formText==null){
                xhr.send();
            }else{
                xhr.send(_formText);
            }
        }
        ,get : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'GET',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        }
        ,post : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'POST',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        },
        postJSON : function(url,data,succCallback,errCallback){
            return this.request({
                type : 'POST',
                headType:'json',
                url : url,
                data : data,
                callback : function(text){
                    succCallback && succCallback(text);
                },
                error : errCallback
            });
        },
        getJSON : function(url,succCallback,errCallback){
            return this.request({
                type : 'GET',
                url : url,
                callback : function(text){
                    var json = null;
                    try{
                        json = JSON.parse(text);
                    }catch(e){}
                    succCallback && succCallback(json);
                },
                error : errCallback
            });
        }
    };

})();