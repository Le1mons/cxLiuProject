#!/usr/bin/python
#coding:utf-8

if __name__=='__main__':
    import sys
    sys.path.append('..')
    
import g
import urllib
import urllib2

#聊天日志相关
def saveLog(gud,content, mtype):
    owner = ""
    if not gud:
        return
    
    try:
        if "ext_owner" in gud:
            owner = gud["ext_owner"]
        #d = {
            #"game":"zhengba",
            #"t": mtype,
            #"vip":gud.get("vip",0),
            #"uid":gud["uid"],
            #"name":gud["name"],
            #"ctime":g.C.NOW(),
            #"owner":owner,
            #"sid":gud["sid"],
            #"m":content,
            #"ttltime":g.C.UTCNOW(),
            #"uped":0
        #}
        d = {
            "game":"zhengba",
            "uid":gud["uid"],
            "name":gud["name"],
            "ctime":g.C.NOW(),
            "owner":owner,
            "sid":gud["sid"],
            "content":content,
            "ttltime":g.C.UTCNOW(),
            "uped":0
        }        

        g.mdb.insert("chatlog",d)
    except:
        pass
    

def uploadLog():
    
    try:
        rs = g.mdb.find("chatlog",{"uped":0},limit=50)
        if len(rs)>0:
            ids = []
            
            for r in rs:
                ids.append(r['_id'])
                del r['_id']
                if 'ttltime' in r:del r['ttltime']
             
            data = {'log':g.minjson.write(rs)}
            data_urlencode = urllib.urlencode(data)
            requrl = "http://gamemana.legu.cc/index.php?g=admin&m=data&a=game_chat"
            req = urllib2.Request(url = requrl,data =data_urlencode)
            res_data = urllib2.urlopen(req)
            res = res_data.read()
            
            if res=='success':
                g.mdb.update('chatlog',{'_id':{'$in':ids}},{'uped':1})
    except:
        pass
    
    g.tw.reactor.callLater(g.C.RANDINT(35,90),uploadLog)


if __name__=='__main__':
    uploadLog()
    