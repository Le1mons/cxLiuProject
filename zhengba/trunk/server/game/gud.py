#!/usr/bin/python
#coding:utf-8

'''
GUD类，用memcache缓存数据，防止多进程时数据不统一
'''
import g,time


def _key (uid):
    return 'king_gud_'+str(uid)

def _fromDB (uid):
    _rs = g.mdb.find1('userinfo',where={'uid':uid},fields={"_id":0})
    return _rs

def get (uid):
    key = _key(uid)
    v = g.mc.get(key)
    if v==False or v==None:
        v =  _fromDB(uid)
        if v != None:
            #临时显示战力
            #v['zhanli'] = 100
            #v['maxzhanli'] = 100
            _udemo = g.getTableDemo('userinfo')
            _udemo.update(v)

            #月卡信息
            #_yueka = g.m.payfun.getMyYuekaInfo(uid)
            #_nt = g.C.NOW()
            #if _yueka and _yueka > _nt: _udemo['yueka'] = 1
            
            #缓存公会id
            _ghInfo = g.mdb.find1('gonghuiuser',{'uid':uid},fields=['_id','ghid','power'])
            if _ghInfo:
                #有工会存在
                _gh = g.mdb.find1('gonghui',{'_id':g.mdb.toObjectId(_ghInfo["ghid"])},fields=['_id','name'])
                _udemo["ghid"] = _ghInfo["ghid"]
                _udemo["ghname"] = _gh["name"]
                _udemo['ghpower'] = _ghInfo['power']




            # 王者印记
            if _udemo['lv'] >= g.GC['crosswz']['lv'] and g.getOpenDay() >= 31:
                _udemo['wzyj'] = g.m.userfun.getUserWZYJ(uid)
            else:
                _udemo['wzyj'] = 0

            v = dict(_udemo)
            setGud(uid,v)
    
    return (v)

def setGud (uid,data):
    key = _key(uid)
    g.mc.set(key,data,time=24*3600)

def reGud(uid):
    key = _key(uid)
    g.mc.delete(key)
    
if __name__=='__main__':
    def test():
        gud = GUD()
        data = gud.get('0_55e68de085bf064a28765dfc')

        print data
        data['sex'] += 1
        gud.set(data)

    test()
    g.tw.reactor.run()
    '''
    g._init()
    gud = g.getGud('none')
    print gud

    g._init()
    gud = GUD('0_199')
    print gud.toDict()
    
    gud['money'] = 1

    print gud['money']
    print gud['gold']
    print gud['name']

    g.mc.delete(gud._verKey())

    print gud['name']
    print gud['gold']
    print gud['money']
    
    gud = GUD('0_199')
    print gud.toDict()
    
    print gud.toDict()
    print gud.toDict()
    print gud.toDict()

    gud['gold'] = 1
    print gud.toDict()
    print gud.toDict()
    
    gud['gold'] = 2
    print gud.toDict()
    print gud.toDict()
    #g.mc.set('aa',1)
    #print g.mc.gets('aa')
    #print g.mc.gets('aa')
    #g.mc.set('aa',2)
    #print g.mc.gets('aa')
    #bb['gold'] = 123
    
    #g.mc.set('bb',1)
    #print g.mc.incr('bb')
    #g.mc.set('bb',1)
    #print g.mc.incr('bb')
    #print gud
    '''