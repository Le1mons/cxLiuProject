#!/usr/bin/python
#coding:utf-8
import g,sys,os
import traceback,time
import datetime

CHANGED = {
    "update":{},
    "delete":{}
}
SKIP_WHERE_CHECK = False

class DebugMongo(g.m.dbmongo.MongoDB):
    def __init__(self,config):
        print '[debug] use DebugMongo'
        super(DebugMongo, self).__init__(config)
    
    #获取表的索引列表
    def _getIndexes(self,tb):
        res = []
        indexlist = self.mongodb[tb].index_information()
        for index,v in indexlist.items():
            key = v['key']
            for kinfo in key:
                res.append(kinfo[0])
        return res

    def update(self,tb,where,data,**key):
        if tb not in CHANGED['update']:
            CHANGED['update'][tb] = {"n": 0,"a":g.mdb.count(tb)}

        if 'RELEASE' in key or SKIP_WHERE_CHECK==True:
            if 'RELEASE' in key:
                del key['RELEASE']
            _res =  super(DebugMongo, self).update(tb,where,data,**key)
            CHANGED['update'][tb]['n'] += _res['nModified']
            return _res
        
        if(len(where)==0):
            print '[error] update, len(where)==0'
            print tb,where,data
            sys.stdout.flush()
            os._exit(0)
            return
        
        indexs = self._getIndexes(tb)
        if 'uid' in indexs:
            if 'uid' not in where or len(where)<2:
                print '[error] update, uid not in where or len(where)<2'
                print tb,where,data
                sys.stdout.flush()
                os._exit(0)
                return   
        
        _res = super(DebugMongo, self).update(tb,where,data,**key)
        CHANGED['update'][tb]['n'] += _res['nModified']
        return _res
    
    
    def delete(self,tb,*arg,**key):
        if tb not in CHANGED['delete']:
            CHANGED['delete'][tb] = {"n": 0,"a":g.mdb.count(tb)}

        if 'RELEASE' in key or SKIP_WHERE_CHECK==True:
            if 'RELEASE' in key:
                del key['RELEASE']
            _res =   super(DebugMongo, self).delete(tb,*arg,**key)
            CHANGED['delete'][tb]['n'] += _res['n']
            return _res
        
        where = None
        
        if 'where' in key:
            where = key['where']
        elif len(arg)>0:
            where = arg[0]
        
        if not where:
            print '[error] delete, where==None'
            print tb,arg,key
            sys.stdout.flush()
            os._exit(0)
            return
        
        indexs = self._getIndexes(tb)
        if 'uid' in indexs:
            if 'uid' not in where or len(where)<2:
                print '[error] delete, uid not in where or len(where)<2'
                print tb,arg,key
                sys.stdout.flush()
                os._exit(0)
                return   
        
        _res = super(DebugMongo, self).delete(tb,*arg,**key)
        CHANGED['delete'][tb]['n'] += _res['n']
        return _res
        

def patch(func):
    funName = func.__name__
    fileName = os.path.basename(sys.argv[0])

    _key = str(fileName) + '_' + str(funName)

    def _deco(*args, **kwargs):
        ret = None
        try:
            runed = g.mdb.find1('_path_run_log',{"key":_key})
            if runed!=None:
                print('=====================')
                print('WARN:continue def', funName)
                print('=====================')
                return False

            print('=====================')
            print('start def', funName, datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            print('=====================')
            _start = time.time()
            ret = func(*args, **kwargs)

            g.mdb.insert('_path_run_log', {"key": _key,"ret":repr(ret),"ctime":time.time()})

            print('=====================')
            print('end def', funName,datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
            print('need time',time.time()-_start)
            print('=====================')
        except:
            _trace = traceback.format_exc()

            print('=====================')
            print('ERROR!! system exit')
            print(_trace)
            print('=====================')
            sys.stdout.flush()
            os._exit(0)

        return ret

    return _deco


def run(func):
    funName = func.__name__
    fileName = os.path.basename(sys.argv[0])
    _key = str(fileName) + '_' + str(funName)

    def _deco(*args, **kwargs):
        ret = None
        try:
            start = time.time()
            ret = func(*args, **kwargs)
            end = time.time()
            print('SUCCESS')

            print("\n\n\n=====================")
            print 'TIME:', end - start
            print "PLAYER NUM:", g.mdb.count('userinfo')
            for act,info in CHANGED.items():
                if act == 'update' and len(info)>0:
                    print '----UPDATE----'
                    for tb,tbn in info.items():
                        print tb,'==>',str(tbn['n'])+'/'+str(tbn['a']), " !!!!" if tbn['n']>tbn['a']/3 else ""  #如果变动条数达到一定比例 给提示

                if act == 'delete' and len(info)>0:
                    print '----DELETE----'
                    for tb,tbn in info.items():
                        print tb,'==>',str(tbn['n'])+'/'+str(tbn['a']), " !!!!" if tbn['n']>tbn['a']/3 else ""
            print('=====================')

            g.mdb.insert('_path_run_log', {"key": _key, "ret": repr(CHANGED), "ctime": time.time()})

        except:
            _trace = traceback.format_exc()
            print('=====================')
            print('ERROR!! system exit2')
            print(_trace)
            print('=====================')
            sys.stdout.flush()
            os._exit(0)

        return ret

    return _deco

#如果是临时脚本，则监测容错
if (sys.argv[0]).find('patch')!=-1 and (sys.argv[0]).find('nopatch')==-1:
    g.mdb = DebugMongo(g.conf['DBCONFIG'])