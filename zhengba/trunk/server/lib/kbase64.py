#!/usr/bin/python
# -*- coding: utf-8 -*-  
# Functions: Base64 编解码模块  
  
import base64  
import os  
import StringIO  
      
class KBase64:  
    """ 
    Base64 编码和解码模块，用于对文件，字符串，URL的编解码 
    对base64的简单封装 
    """  
      
    def __init__(self):  
        pass  
      
    def encodeFile(self, strFileName, strDecName):  
        """ 
        将一个文件的内容编码为Base64 
        """  
          
        if not os.path.exists(strFileName):  
            return False  
          
        f1 = None  
        f2 = None  
        try:  
            f1 = open(strFileName, "r")  
            f2 = open(strDecName, "w")  
          
            base64.encode(f1, f2)  
              
        except Exception, e:  
            print e  
            if f1 != None:  
                f1.close()  
            if f1 != None:  
                f2.close()  
            return False  
                  
        f1.close()  
        f2.close()  
        return True  
      
    def decodeFile(self, strFileName, strDecName):  
        """ 
        将一个Base64文件的内容解码 
        """  
          
        if not os.path.exists(strFileName):  
            return False  
          
        f1 = None  
        f2 = None  
        try:  
            f1 = open(strFileName, "r")  
            f2 = open(strDecName, "w")  
          
            base64.decode(f1, f2)  
              
        except Exception, e:  
            print e  
            if f1 != None:  
                f1.close()  
            if f1 != None:  
                f2.close()  
            return False  
                  
        f1.close()  
        f2.close()  
        return True  
      
    def encodeSting(self, strSrc):  
        """ 
        对字符串进行Base64编码 
        """  
        try:  
            strDec = base64.encodestring(strSrc)  
        except Exception, e:  
            print e  
            return "", False  
          
        return strDec, True  
      
    def decodeSting(self, strSrc):  
        """ 
        将Base64字符串解码为源字符串 
        """  
        try:  
            strDec = base64.decodestring(strSrc)  
        except Exception, e:  
            print e  
            return "", False  
          
        return strDec, True  
      
if __name__ == "__main__":  
    dd = KBase64()  
    print dd.encodeSting("hjgh ")  