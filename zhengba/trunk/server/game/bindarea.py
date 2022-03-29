#!/usr/bin/python
#coding:utf-8
#混服相关逻辑，全部写在该文件内

#混合配置中的port
def mixGamePort (area):
    port = []
    for k,v in area.items():
        port += v['port']
       
    #去重
    port = list(set(port))
    return port

#通过port映射SID
def port2SidDict (area):
	res = {}
	area = sorted(area.items(), key=lambda x: int(x[0]))
	for k,v in area:
		for port in v['port']:
			res[int(port)] = int(k)
		if res:
			break
	return res

#生成sid->title配置
def sid2NameDict (area):
	res = {}
	area = sorted(area.items(), key=lambda x: int(x[0]))
	for k,v in area:
		res[int(k)] = v['title']
		break
	return res

#获取第一个SID
def getFirstSid(area):
    _sids = area.keys()
    _sids.sort()
    return int(_sids[0])
    
#获取第一个SERVERNAME
def getFirstSName (area):
    for k,v in area.items():
        return v['title']

#通过port获取sid
def getSidByPort(port,config):
    port = int(port)
    return config['port2sid'][port] if port in config['port2sid'] else 0

#通过port获取sname
def getSNameByPort(port,config):
    port = int(port)
    sid = getSidByPort(port, config)
    sid = int(sid)
    return config['sid2Name'][sid]    

if __name__=='__main__':
    AREA = {
        0 : {
            "title":"XXX1",
            "port":[7000,7001],
        },
        1 : {
            "title":"XXX2",
            "port":[7002,7003],
        }
    }
    print getFirstSName(AREA)