#!/usr/bin/python
#coding:utf-8

#不参与游戏逻辑公用方法
import sys,os,time,copy,json,uuid,random,hashlib,re,datetime,math

class CommonFun:
    def __init__ (self):
        self.EasyCall()
    
    #公共简称
    def EasyCall(self):
        self.STR = self.formatString
        self.DATE = self.getDate
        self.NOW = self.getNowTime
        self.WEEK = self.getWeek
        self.HOUR = self.getHour
        self.RANDARR = self.getRandArr
        self.RAND = self.isRandNum
        self.UTCNOW = self.getUTCTime
        self.RANDINT = self.getRandNum
        self.RANDLIST = self.getRandList
        self.ZERO = self.getZeroTime
        self.TTL = self.getTTLTime
        self.MNOW = self.getNowMillisecond
        self.YDAY = self.getYearDay
        self.random = random

    # 向上取整
    def CEIL(self, num):
        return math.ceil(num)

    #在范围内随机一个整数
    def SHUFFLE(self,data):
        random.shuffle(data)

    #在范围内随机一个整数
    def getRandNum(self,minNum,maxNum):
        _num = random.randint(minNum,maxNum)
        return _num
    
    #在范围内随机一个浮点数
    def getRandFloat(self,minNum,maxNum):
        _num = random.uniform(minNum,maxNum)
        return _num
    
    #在数组中随机N个元素
    def getRandList(self,dlist,num=1):
        _num = num
        if _num > len(dlist): _num = len(dlist)
        _res = random.sample(dlist,_num)
        return _res
    
    #获取UTC时间对象
    def getUTCTime(self):
        return datetime.datetime.utcnow()

    #获取过期时间对象

    def getTTLTime(self):
        return datetime.datetime.now()
    
    #将时间格式转换成时间戳，默认返回当前时间戳
    def getNowTime(self,nt=None):
        if nt == None:
            return int(time.time())
    
        _fmt = '%Y-%m-%d'
        if len(nt.split(' ')) > 1:
            _fmt = '%Y-%m-%d %H:%M:%S'
    
        return int(time.mktime(time.strptime(nt,_fmt)))
    
    #获取将来的一个到期时间秒数
    def getPassTime(self,ntime,ptime=0):
        _ntime = ntime - ptime
        _startTime = getNowTime(getDate(_ntime+(24*60*60)))
        _passTime = _ntime - _startTime
        return _passTime

    #获取当前时间毫秒
    def getNowMillisecond(self):
        _nitem = time.time() * 1000
        return int(_nitem)
    
    #获取指定时间的日期格式
    '''
    默认返回格式 2012-10-12（string）
    '''
    def getDate(self,nt=None,fmtStr='%Y-%m-%d', many=False):
        if nt == None:
            nt = self.getNowTime()

        if many:
            fmtStr = "%Y-%m-%d %H:%M:%S"

        return time.strftime(fmtStr,time.localtime(int(nt)))

    # 获取小时
    def getHour(self, fmtStr='%H'):
        return int(self.getDate(fmtStr=fmtStr))
    
    #根据时间戳返回为一年中的第几周(默认星期一为第一天)
    def getWeekNumByTime(self,timestamp,st='%W'):
        #%U 一年中的星期数（00-53）星期天为星期的开始
        #%W 一年中的星期数（00-53）星期一为星期的开始
        _chkTime = timestamp
        if st == '%W':_chkTime = self.getWeekFirstDay(_chkTime)
        return self.getDate(_chkTime,'%Y-')+ time.strftime(st,time.localtime(int(_chkTime)))
    
    #根据时间戳返回星期几
    def getWeek(self,nt=None):
        if nt == None:
            nt = self.getNowTime()
        return int(time.strftime('%w',time.localtime(nt)))

    #检测指定日期之间的差异(默认天数)
    def getDateDiff(self,sdate=None,edate=None,w='d'):
        if sdate == None:
            sdate = self.getNowTime()
        if edate == None:
            edate = self.getNowTime()
        _sdata=self.getDate(sdate,'%Y-%m-%d')
        _edata=self.getDate(edate,'%Y-%m-%d')
        _diff=self.dataDiff(_sdata,_edata,w)
        return _diff
    
    #获取每周第一天的日期时间戳
    def getWeekFirstDay(self,timestamp):
        _dateObj = time.localtime(int(timestamp))
        _weekDay = int(_dateObj.tm_wday)
        _nt = self.getNowTime(self.getDate(timestamp))
        _firstDay = _nt - (_weekDay*60*60*24)
        return  _firstDay
    
    #获取该时间的零点时间戳
    def getZeroTime(self,time=None):
        time = time or self.NOW()
        _retVal = 0
        if isinstance(time,basestring):
            _retVal = self.NOW(self.DATE(self.NOW(time)))
        elif isinstance(time,int):
            _retVal = self.NOW(self.DATE(time))
        
        return _retVal

    # 获取本月的第一天
    def getMonthFirstDay(self,year=None, month=None):
        """
        :param year: 年份，默认是本年，可传int或str类型
        :param month: 月份，默认是本月，可传int或str类型
        :return: firstDay: 当月的第一天，datetime.date类型
                  lastDay: 当月的最后一天，datetime.date类型
        """
        if year:
            year = int(year)
        else:
            year = datetime.date.today().year

        if month:
            month = int(month)
        else:
            month = datetime.date.today().month

        # # 获取当月第一天的星期和当月的总天数
        # firstDayWeekDay, monthRange = calendar.monthrange(year, month)

        # 获取当月的第一天
        firstDay = datetime.date(year=year, month=month, day=1)
        # lastDay = datetime.date(year=year, month=month, day=monthRange)

        return self.getNowTime(str(firstDay))

    def getLastMonthTime(self,_time=None):
        """
        获取获得一个F中的最后一天
        :param any_day: 任意日期
        :return: string
        """
        if not _time:
            _time = self.NOW()
        _splitInfo = self.DATE(_time).split("-")

        first_day = datetime.date(int(_splitInfo[0]), int(_splitInfo[1]), int(_splitInfo[2]))
        next_month = first_day.replace(day=28) + datetime.timedelta(days=4)

        return self.getNowTime(str(next_month - datetime.timedelta(days=next_month.day)))

        
    #获取唯一标识
    def getUniqCode(self):
        _code = str(uuid.uuid1()).split('-')
        _res = _code[3] + _code[0][4:]
        return str(_res)

    #返回MD5加密32为小写字符串
    def md5(self,val):
        return (hashlib.md5(str(val)).hexdigest())
    
    def is_chinese(self,uchar):
        '''
        判断一个unicode是否是汉字
        '''
        if uchar >= u'\u4e00' and uchar<=u'\u9fa5':
            return True
        else:
            return False
    
    def is_number(self,uchar):
        '''
        判断一个unicode是否是数字
        '''
        return uchar.isdigit()
    
    def is_alphabet(self,uchar):
        '''
        判断一个unicode是否是英文字母
        '''
        if (uchar >= u'\u0041' and uchar<=u'\u005a') or (uchar >= u'\u0061' and uchar<=u'\u007a'):
            return True
        else:
            return False
    
    def is_other(self,uchar):
        '''
        判断是否非汉字，数字和英文字符
        '''
        if not (is_chinese(uchar) or is_number(uchar) or is_alphabet(uchar)):
            return True
        else:
            return False
    
    #json文件读取
    def readjsonFile(self,filename):
        _strJson = readFile(filename)
        _json = json.loads(_strJson)
        return _json
    
    #写文件
    def writeFile(self,foldname,filename,txt):
        Root=os.getcwd().split('game')[0]
        try:
            if os.path.exists(Root+foldname)==False:
                os.mkdir(Root+foldname)
            f = open(Root+foldname+filename, 'w')
            f.truncate()
            f.write(txt)
            f.close()
        except:
            return -1
        return 1
    
    #文件是否存在
    def isFileExists(self,filename):
        Root=os.getcwd().split('game')[0]
        _res = 0
        if     os.path.exists(Root+filename):
            _res = 1
    
        return _res
    
    #过滤内容中指定字符
    def FilterChat(self,msg):
        if type(msg)!=type(''):
            return msg
    
        _chatArr={'%':'％','&':'＆','\\n':'','\n':''}
        for k,v in _chatArr.items():
            msg=msg.replace(k,v)
        return msg
    
    #读文件
    def readFile(self,filename):
        Root=os.getcwd().split('game')[0]
        if Root[-1] != '/' and Root[-2:] != '\\':
            Root += '/'
        _outStr=""
        try:
            f = open(Root+filename, 'r')
            _outStr=f.read()
            f.close()
        except:
            _outStr=""
        return _outStr
    
    #读取文件，返回行数组
    def readFileLine(self,filename):
        Root=os.getcwd().split('game')[0]
        if Root[-1] != '/' and Root[-2:] != '\\':
            Root += '/'
    
        _allLines = []
        try:
            f = open(Root + filename,'r')
            _allLines = f.readlines()
            f.close()
        except:
            _allLines = []
    
        return _allLines
    
    
    #字典排序
    #orderby,1:字段val排序，0:字典key排序
    def dicSortByVal(self,dic,orderby=1,order=True):
        _res = sorted(dic.iteritems(), key=lambda d:int(d[orderby]), reverse = order)
        return _res
    
    
    #根据数字参数获取一个32位递进的code
    def getUnCode(self,_cid):
        _ct = int(_cid)
        _codeArr = ['1','2','3','4','5','6','7','8','9','a','b','c','d','e','f','g','h','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z']
        _codeNum = len(_codeArr)
        _rArr = []
        for i in xrange(6):
            _tmp = divmod(_ct,_codeNum)
            _rArr.append(_tmp[1])
            if _tmp[0] < _codeNum:
                _rArr.append(_tmp[0])
                break
            _ct = _tmp[0]
    
        _res=''
        _codeLen = len(_rArr)
        for o in xrange(_codeLen):
            _idx = _rArr[o]
            if _codeLen == 2 and _idx == 0 and o == 1:
                continue
    
            _res = _codeArr[_idx ]+_res
    
        return _res
    
    #替换字符串参数
    def formatString(self,strobj,*args):
        _res = strobj
        _idx = 1
        for d in args:
            _key = '{%s}'%str(_idx)
            _res = _res.replace(_key,str(d))
            _idx+=1
    
        return _res
    
    
    #是否随机到范围
    def isRandNum(self,base,pro):
        _randNum = random.randint(1,base)
        if _randNum <= pro:
            return True
        return False
    
    #随机获取数组中的某一项
    def getRandArr(self,arr,base):
        _rNum = random.randint(1,base)
        _tmpNum = 0
        for item in arr:
            _tmpNum +=item['p']
            if _rNum <= _tmpNum:
                return copy.deepcopy(item)

    # 随机获取数组中的某几项
    def getRandArrNum(self, arr, num):
        _base = sum([x['p'] for x in arr])
        _randNum = self.RANDINT(1, _base)
        _sump = 0
        itemlist = []
        flag = 0
        for idx, ele in enumerate(arr):
            _sump += ele['p']
            if _randNum <= _sump:
                num -= 1
                itemlist.append(ele)
                flag = idx
                break

        _newarr = arr[0: flag] + arr[flag+1: ]
        # 已结束
        if num == 0 or not _newarr:
            return itemlist

        else:
            itemlist += self.getRandArrNum(_newarr, num)

        return itemlist
    
    #检测字符串是否为空
    def chkStrIsNull(self,chkstr):
        _chatArr={' ':'','　':'','    ':''}
        for k,v in _chatArr.iteritems():
            chkstr=chkstr.replace(k,v)
        if chkstr=="":
            return 1
        return 0
    
    #去空格tab
    def trimStr(self,chkstr):
        _chatArr={' ':'','　':'','    ':''}
        _res = chkstr
        for k,v in _chatArr.iteritems():
            _res=chkstr.replace(k,v)
    
        return chkstr
    
    #检测空格
    def chkTrimStr(self,chkstr):
        _chatArr={' ':'','　':'','    ':''}
        for k,v in _chatArr.iteritems():
            if  chkstr.find(k)>-1:
                return 1
    
        return 0
    
    #判断是否是同一天
    #sec过期时间修正值(秒)
    #ntime:当前时间
    #chktime:目标时间
    #sec 主要用于不以0点为分割点时的修正的秒数，如每日凌晨5点判为第二天的话，则sec = 5*60*60 = 18000
    def chkSameDate(self,ntime,chktime,sec=0):
        _ntime = ntime - sec
        _chktme = chktime - sec
        if self.getDate(_chktme) == self.getDate(_ntime):
            return True

        return False

    #拷贝变量
    def dcopy(self,data):
        return copy.deepcopy(data)
    
    #检测指定时间戳的时间日差
    #chktime 表示从几点开始为1天
    def getTimeDiff(self,_nt,_et,_chktime=0):
        def fmtTime (t):
            t = self.DATE(t)
            sArr = t.split(' ')
            dArr = sArr[0].split('-')
            if len(sArr)>1:
                tArr = sArr[1].split(':')
                return datetime.datetime(int(dArr[0]),int(dArr[1]),int(dArr[2]),int(tArr[0]),int(tArr[1]),int(tArr[2]))
            else:
                return datetime.datetime(int(dArr[0]),int(dArr[1]),int(dArr[2]))
    
        _d1 = fmtTime(_nt)
        _d2 = fmtTime(_et)
        _diff = (_d1 - _d2).days
        #TODO 有坑，传进来的时候nt如果小于当天零点时间间，那必然会多减1天
        # _zt = self.NOW(self.DATE())
        _zt = self.ZERO(_nt)
        #如果当前时间小于chktime则是前一天
        if _nt <= _zt + _chktime:
            _diff-=1
        
        if _diff <0:
            _diff = 0
        
        return _diff
    
    #计算时间差
    def dataDiff (self,d1,d2,w):
        def fmtTime (t):
            sArr = t.split(' ')
            dArr = sArr[0].split('-')
            if len(sArr)>1:
                tArr = sArr[1].split(':')
                return datetime.datetime(int(dArr[0]),int(dArr[1]),int(dArr[2]),int(tArr[0]),int(tArr[1]),int(tArr[2]))
            else:
                return datetime.datetime(int(dArr[0]),int(dArr[1]),int(dArr[2]))
    
        _d1 = fmtTime(d1)
        _d2 = fmtTime(d2)
        if w=='d':
            return  (_d2-_d1).days

    def getYearDay(self):
        _year, _month, _day = self.DATE().split('-')
        _year, _month, _day = int(_year), int(_month), int(_day)
        days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        if (_year%4==0 and _year%100!=0) or (_year%400==0):
            days[1] = 29

        _sum = _day
        i = 0
        while i < _month - 1:
            _sum += days[i]
            i += 1

        return _sum
    
    #根据MONGON数据库_id字符生成6位数字字符串
    #tid一定要是mongodb的_id格式
    def getUUIDByDBID(self,tid):
        _code = tid[-6:]
        _intCode =  str(int(_code,16))
        return _intCode[1:]

    
if __name__=='__main__':
    pass
    '''dic = {'a':71, 'bc':5, 'c':3, 'asd':4, '33':50, 'd':0}
    print dicSortByVal(dic,1)
    print dicSortByVal(dic,0,False)'''
    a = CommonFun()
    list = a.DATE(a.NOW()).split("-")
    _nt = a.NOW()
    print a.getWeekNumByTime(_nt)

    #print time.localtime(getNowTime('2014-4-28'))
    #print time.strftime('%w',time.localtime(getNowTime('2014-4-27')))
    #print getNowTime('2014-4-4 12:00:00')
    #print getDate(1396598000,'%Y-%m-%d %H:%M:%S')
    #print formatString('fd{}sfs',1