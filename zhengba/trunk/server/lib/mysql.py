#coding:utf-8
'''
mysql 操作封装类fiename：Mysql.py
desc:数据库操作类
'''
import sys,os

sys.path.append(os.getcwd())
sys.path.append('..')
sys.path.append('lib')
sys.path.append('../lib')

import MySQLdb
from MySQLdb.cursors import DictCursor
from DBUtils.PooledDB import PooledDB

class Mysql(object):
	"""
@note:1、执行带参数的ＳＱＬ时，请先用sql语句指定需要输入的条件列表，然后再用tuple/list进行条件批配
２、在格式ＳＱＬ中不需要使用引号指定数据类型，系统会根据输入参数自动识别
３、在输入的值中不需要使用转意函数，系统会自动处理
	"""
	#连接池对象
	__pool = {}
	__tbpre = '' #表前缀
	__config = None

	def __init__(self,config,usePool=True):
		self.usePool=usePool
		self.__tbpre=config['tbpre']
		self.__config = config
		conn,cursor=self.connect()

	def connect(self):
		config = self.__config
		if self.usePool:
			conn = self.__getConn(config)
			conn.cursor().connection.autocommit(True)
		else:
			conn = MySQLdb.connect(
				 host=config['dbhost'] , port=config['dbport'] , user=config['dbuser'] , passwd=config['dbpwd'] ,
				 db=config['dbname'],charset=config['dbchar'],cursorclass=DictCursor,use_unicode=False
			)
			conn.autocommit(True)

		cursor = conn.cursor()
		return conn,cursor

	def filterSql(self,oldsql):
		return oldsql.replace('$$',self.__tbpre)

	def __getConn(self,config):
		"""
		@summary: 静态方法，从连接池中取出连接
		@return MySQLdb.connection
		"""
		_key = str(config['dbhost'])+str(config['dbport'])+str(config['dbuser'])+str(config['dbpwd'])+str(config['dbname'])

		if not _key in Mysql.__pool:
			"""
				mincached : 启动时开启的闲置连接数量(缺省值 0 以为着开始时不创建连接)
				maxcached : 连接池中允许的闲置的最多连接数量(缺省值 0 代表不闲置连接池大小)
				maxshared : 共享连接数允许的最大数量(缺省值 0 代表所有连接都是专用的)如果达到了最大数量,被请求为共享的连接将会被共享使用
				maxconnecyions : 创建连接池的最大数量(缺省值 0 代表不限制)
				blocking : 设置在连接池达到最大数量时的行为(缺省值 0 或 False 代表返回一个错误<toMany......>; 其他代表阻塞直到连接数减少,连接被分配)
				maxusage : 单个连接的最大允许复用次数(缺省值 0 或 False 代表不限制的复用).当达到最大数时,连接会自动重新连接(关闭和重新打开)
				setsession : 一个可选的SQL命令列表用于准备每个会话，如["set datestyle to german", ...]
			"""
			Mysql.__pool[_key] = PooledDB(creator=MySQLdb, mincached=0 , maxcached=10 ,
						 host=config['dbhost'] , port=config['dbport'] , user=config['dbuser'] , passwd=config['dbpwd'] ,
						 db=config['dbname'],charset=config['dbchar'],cursorclass=DictCursor,use_unicode=False
						 )
			#print 'Mysql.__pool',Mysql.__pool[_key]

		return Mysql.__pool[_key].connection()

	def getAll(self,sql,param=None):
		"""
		@summary: 执行查询，并取出所有结果集
		@param sql:查询ＳＱＬ，如果有查询条件，请只指定条件列表，并将条件值使用参数[param]传递进来
		@param param: 可选参数，条件列表值（元组/列表）
		@return: result list/boolean 查询到的结果集
		"""
		sql=self.filterSql(sql)
		conn,cursor = self.connect()
	
		if param is None:
			count = cursor.execute(sql)
		else:
			count = cursor.execute(sql,param)
		if count>0:
			result = cursor.fetchall()
		else:
			result = []

		cursor.close()
		conn.close()
		return result

	def getOne(self,sql,param=None):
		"""
		@summary: 执行查询，并取出第一条
		@param sql:查询ＳＱＬ，如果有查询条件，请只指定条件列表，并将条件值使用参数[param]传递进来
		@param param: 可选参数，条件列表值（元组/列表）
		@return: result list/boolean 查询到的结果集
		"""
		sql=self.filterSql(sql)
		conn,cursor=self.connect()
		if param is None:
			count = cursor.execute(sql)
		else:
			count = cursor.execute(sql,param)

		if count>0:
			result = cursor.fetchone()
		else:
			result = False

		cursor.close()
		conn.close()
		return result

	def getMany(self,sql,num,param=None):
		"""
		@summary: 执行查询，并取出num条结果
		@param sql:查询ＳＱＬ，如果有查询条件，请只指定条件列表，并将条件值使用参数[param]传递进来
		@param num:取得的结果条数
		@param param: 可选参数，条件列表值（元组/列表）
		@return: result list/boolean 查询到的结果集
		"""
		sql=self.filterSql(sql)
		conn,cursor=self.connect()
		if param is None:
			count = cursor.execute(sql)
		else:
			count = cursor.execute(sql,param)

		if count>0:
			result = cursor.fetchmany(num)
		else:
			result = []

		cursor.close()
		conn.close()
		return result

	def update(self,tbname,data,where=None):
		'''
		@summary: 修改记录
		@param data: dict {k:v} 或 string
		@param where: 条件语句 {k:v} 或 string

		EX:
		mysql.update('$$user',{'uid':'zbmusic2'},'id=2 or id=1')
		mysql.update('$$user',"uid='zbmusic',gold=gold+34",{'id':2,'uid':'zbmusic2'})
		'''
		sql='update '+ tbname + ' set '
		if type(data)==type({}):
			for k,v in data.items():
				if k.find('+=') != -1:
					nedK = k.replace('+=','')
					sql += nedK + " = " +nedK +'+(' +str(v)+'),'
				elif k.find('-=') != -1:
					nedK = k.replace('-=','')
					sql += nedK + " = " +nedK +'-(' +str(v)+'),'
				else:
					sql += k + "='"+ str(v) +"',"
			sql = sql[0:-1]
		else:
			sql += data

		if where!=None:sql += ' where '

		if type(where)==type({}):
			for k,v in where.items():
				sql += k + "='"+ str(v) +"' and "
			sql = sql[0:-4]
		else:
			sql += where
		return self.filterSql(sql)

	def insert(self,tbname,data,getNewid=False):
		"""
		@summary: 项数据表插入一条记录
		@param tbname: 表名
		@param data: 数据项词典
		@param getNewid:  是否返回插入数据生成的自增长ID，默认为False
		"""
		sql='insert into ' + tbname +' set '
		for k,v in data.items():
			sql += k + "='"+ str(v) +"',"
		sql = self.filterSql(sql[0:-1])

		if getNewid:
			conn,cursor=self.connect()
			count = cursor.execute(sql)
			cursor.close()
			conn.close()
			return cursor.lastrowid
		else:
			return sql

	def insertMany(self,sql,values):
		"""
		@summary: 向数据表插入多条记录
		@param sql:要插入的ＳＱＬ格式
		@param values:要插入的记录数据tuple(tuple)/list[list]
		@return: count 受影响的行数
		"""
		sql=self.filterSql(sql)

		conn,cursor=self.connect()
		count = cursor.executemany(sql,values)

		cursor.close()
		conn.close()
		return count

	def execute(self,sql,param=None):
		sql=self.filterSql(sql)
		conn,cursor=self.connect()

		if param is None:
			count = cursor.execute(sql)
		else:
			count = cursor.execute(sql,param)
		
		cursor.close()
		conn.close()
		return count

	def exe(self,sql,param=None):
		return self.execute(sql,param)

	def exesql(self,sql):
		if sql==None:
			return False

		'''执行多条sql命令，如果有insert语句，则将放回新的自增长ID，否则返回影响行数'''
		if type(sql)==type([]) or type(sql)==type(()):
			sql=';;;'.join(sql)
		sqls= sql.split(';;;')

		count,nid = 0,0
		conn,cursor=self.connect()

		for _sql in sqls:
			if not _sql: continue
			_sql=self.filterSql(_sql)
			count += cursor.execute(_sql)

		cursor.close()
		conn.close()
		return count