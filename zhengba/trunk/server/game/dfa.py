#!/usr/bin/python
#coding:utf-8

#敏感词检测，DFA算法
import sys
ispypy = (sys.version.find('PyPy')!=-1)

class DFA:
    def __init__(self,words):
        self._dfaData = self._getDFAData(words)

    def _addWord(self,dfaData,word):
        node = dfaData
        _len = len(word)
        for i in range(_len):

            if word[i] not in node:
                node[word[i]] = {}

            if i == _len - 1:
                node[word[i]]['end'] = 1

            node = node[word[i]]

    def _getDFAData(self,words):
        '''
        _addWord(root,'fast')
        _addWord(root,'fuck')
        
        format to:
        {'f': {'a': {'s': {'t': {}}}, 'u': {'c': {'k': {}}}}}
        '''
        root = {}
        for w in words:
            if ispypy:
                self._addWord(root, w)
            else:
                self._addWord(root, w.decode('UTF-8'))
        return root
    
    #仅返回Ture或None 判断是有存在敏感词
    def search(self,txt):
        if not ispypy: txt = txt.decode('UTF-8')
        _len = len(txt)
        for i in xrange(_len):
            p = self._dfaData
            j = i
            while (j < _len and txt[j] in p):
                p = p[txt[j]]
                j = j + 1

            if len(p) == 0 or 'end' in p:
                return True

        return None
    
    #找出所有的敏感词
    def findall(self,txt):
        if not ispypy: txt = txt.decode('UTF-8')
        _len = len(txt)
        words = []
        for i in xrange(_len):
            p = self._dfaData
            j = i

            while (j < _len and txt[j] in p):
                p = p[txt[j]]
                j = j + 1

            if len(p) == 0 or 'end' in p:
                words.append(txt[i:j])

        return words

if __name__ == '__main__':
    '''
    _w = []
    fp = open('word.txt','r')
    for line in fp:
        line = line[0:-1]
        _w.append(line)
    fp.close()
    '''
    _w = ['ur','ur','URL']
    import time
    aaa = DFA(_w)
    start_time = time.time()
    for i in xrange(1):
        res = aaa.findall('url')
    end_time = time.time()
        
    print (end_time - start_time)
    print res

