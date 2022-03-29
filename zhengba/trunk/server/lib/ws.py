#!/usr/bin/python
#coding:utf-8

#本文件主要用于webSocket握手协议及消息处理
import hashlib, struct, base64

#WS握手开始，socket=socket对象 msg=消息体
def shake (conn,msg):
	headers = {}
	header, data = msg.split('\r\n\r\n', 1)
	for line in header.split('\r\n')[1:]:
		if line.find(': ')==-1:continue
		key, value = line.split(": ", 1)
		headers[key] = value
	if "Host" in headers:headers["Location"] = "ws://%s/" % headers["Host"]
	conn.attr['type'] = 'ws'

	#老版本的ws协议 目主要用于兼容IOS
	if headers.has_key('Sec-WebSocket-Key1'):
		key1 = headers["Sec-WebSocket-Key1"]
		key2 = headers["Sec-WebSocket-Key2"]
		key3 = data[:8]
		token = creatToken(key1, key2, key3)
		handshake = '\
HTTP/1.1 101 Web Socket Protocol Handshake\r\n\
Upgrade: WebSocket\r\n\
Connection: Upgrade\r\n\
Sec-WebSocket-Origin: %s\r\n\
Sec-WebSocket-Location: %s\r\n\r\n\
' %(headers['Origin'], headers['Location'])

		conn.attr['newVersion'] = False
		conn.sendDo(handshake + token)
	#新版本ws协议
	else:
		key = headers['Sec-WebSocket-Key']
		token = creatToken2(key)
		handshake = '\
HTTP/1.1 101 Switching Protocols\r\n\
Upgrade: WebSocket\r\n\
Connection: Upgrade\r\n\
Sec-WebSocket-Accept: %s\r\n\r\n\
' % (token)
		conn.attr['newVersion'] = True
		conn.sendDo(handshake)
		
#格式化http协议发来的消息
def parse_httprecv_data(conn,_string,callBack):
	#TODO解密_string
	raw_str = _string
	callBack(raw_str)

#WS收到消息时，格式化消息
def parse_recv_data(conn,_string,callBack):

	if not 'socket_BUFF' in conn.attr:
		conn.attr['socket_BUFF'] = ''
		
	msg = conn.attr['socket_BUFF'] + _string
	
	if 'newVersion' in conn.attr and conn.attr['newVersion']:
		code_length = ord(msg[1]) & 127
		if code_length == 126:
			msgLen = struct.unpack('>H',msg[2:4])[0]
			masks = msg[4:8]
			msgTo = 8+msgLen
			data = msg[8:msgTo]
		elif code_length == 127:
			msgLen = struct.unpack('>I',msg[2:6])[0]
			masks = msg[10:14]
			msgTo = 14+msgLen
			data = msg[14:msgTo]
		else:
			msgLen = code_length
			masks = msg[2:6]
			msgTo = 6+msgLen
			data = msg[6:msgTo]

		#数据长度不够，等待
		if len(data)<msgLen:
			conn.attr['socket_BUFF'] = msg
			return

		if len(data)==msgLen:
			conn.attr['socket_BUFF'] = ''
			parse_recv_data_over(conn,data,masks,callBack)

		#还有未处理的数据
		if msgTo<len(msg):
			conn.attr['socket_buff'] = ''
			parse_recv_data(conn,msg[msgTo:],callBack)

		if msgTo==len(msg):
			conn.attr['socket_buff'] = ''

	else:
		raw_str = msg.split("\xFF")[0][1:]
		callBack(raw_str)

def parse_recv_data_over (conn,data,masks,callBack):
	i = 0
	raw_str = ''
	for d in data:
		raw_str += chr(ord(d) ^ ord(masks[i%4]))
		i += 1
	callBack(raw_str)

#WS发送消息时，格式化消息
def send_data(conn, raw_str):
	if 'newVersion' in conn.attr and conn.attr['newVersion']:
		
		'''
		首先是一个固定的字节（1000 0001或是1000 0002），这个字节可以不用理会。麻烦的是第二个字节，这里假设第二个字节是1011 1100，首先这个字节的第一位肯定是1，表示这是一个”masked”位，剩下的7个0/1位能够计算出一个数值，比如这里剩下的是 011 1100，计算出来就是60，这个值需要做如下判断：
		如果这个值介于0000 0000 和 0111 1101 (0 ~ 125) 之间，那么这个值就代表了实际数据的长度；如果这个数值刚好等于0111 1110 (126)，那么接下来的2个字节才代表真实数据长度；如果这个数值刚好等于0111 1111 (127)，那么接下来的8个字节代表数据长度。		
		'''
		token = "\x81"
		length = len(raw_str)
		if length < 126:
			token += struct.pack("B", length)
		elif length <= 0xFFFF:
			token += struct.pack("!BH", 126, length)
		else:
			token += struct.pack("!BQ", 127, length)
			
		back_str = '%s%s' % (token,raw_str)		
		
		'''
		back_str = []
		back_str.append('\x81')
		data_length = len(raw_str)

		if data_length <= 125:
			back_str.append(chr(data_length))
		else:
			back_str.append(chr(126))
			back_str.append(chr(data_length >> 8))
			back_str.append(chr(data_length & 0xFF))

		back_str = "".join(back_str) + raw_str
		'''
	else:
		back_str = '\x00%s\xFF' % (raw_str)
	return back_str

#老版本WS服务器握手信息
def creatToken( key1, key2, key3):
	num1 = int("".join([digit for digit in list(key1) if digit.isdigit()]))
	spaces1 = len([char for char in list(key1) if char == " "])
	num2 = int("".join([digit for digit in list(key2) if digit.isdigit()]))
	spaces2 = len([char for char in list(key2) if char == " "])

	combined = struct.pack(">II", num1/spaces1, num2/spaces2) + key3
	return hashlib.md5(combined).digest()

#新版本WS服务器握手信息
def creatToken2(key):
	key = key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
	ser_key = hashlib.sha1(key).digest()
	return base64.b64encode(ser_key)

if __name__=='__main__':
	print send_data("conn", "raw_str"*50000)