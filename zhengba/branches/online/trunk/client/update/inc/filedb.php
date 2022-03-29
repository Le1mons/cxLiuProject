<?php
/**
 * 文件操作类
 */
class Core_Fun_File {

    /**
     * 创建目录，可以创建子目录
     * @param string $dir	目录路径，绝对路径
     * @author Icehu
     */
    public static function makeDir( $dir ) {
        mkdir( $dir , 0777 , true);
    }

    /**
     * 向一个文件写入数据
     * @param string $file	写入的文件
     * @param string $data	写入的数据
     * @author Icehu
     */
    public static function _write( $file , $data ) {
        file_put_contents( $file , $data , LOCK_EX );
        @chmod( $file , 0777 );
    }

    /**
     * 向一个文件写入数据
     * 在目录/文件不存在的时候，自动创建
     * @param string $file	写入的文件
     * @param string $data	写入的数据
     * @author Icehu
     */
    public static function write( $file , $data ) {
        $_updir = dirname( $file );
        if (!file_exists( $_updir ) || !is_dir( $_updir )) {
            self::makeDir( $_updir );
        }
        self::_write( $file , $data );
    }

    /**
     * 读取文件内容
     * @param string $file	文件地址，绝对路径
     * @param number $offset	起始位置
     * @param number $len	读取长度，默认读取所有
     * @return string
     * @author Icehu
     */
    public static function read( $file , $offset = 0 , $len = null) {
        if ($len) {
            return file_get_contents( $file , true , null , $offset , $len );
        }
        return file_get_contents( $file , true , null , $offset );
    }
    /**
     * 删除一个文件
     * @param string $file	文件名，绝对地址
     * @author Icehu
     */
    public static function delete( $file ) {
        self::remove( $file );
    }

    /**
     * 删除一个文件
     * @param string $file	文件名，绝对地址
     * @author Icehu
     */
    public static function remove( $file ) {
        @unlink( $file );
    }

    public static function deleteDir($dir) 
    { 
        if (is_dir($dir) && rmdir($dir)==false ) { 
            if ($dp = opendir($dir)) { 
                while (($file=readdir($dp)) != false) { 
                    if (is_dir($file) && $file!='.' && $file!='..') { 
                        self::deleteDir($file); 
                    } else { 
                        self::remove($file); 
                    } 
                } 
                closedir($dp); 
            } else { 
                exit('Not permission'); 
            } 
        }  
    }

}


/**/
$FILEDBCACHE=array();
class FILEDB{
	public function getFile($uid,$table){
		$uidmd5 = md5($uid);
		$cacheFile = ROOT.'./usrcache/'. left($uidmd5,2) . '/'. right($uidmd5,2). '/'.$uid .'_'. $table .'.php';
		return $cacheFile;
	}
	
	public function var_export_min($data){
		//return str_replace(array("\r","\n","\t"),'',var_export($data, true));
		return var_export($data, true);
	}
	
	/*
	$uid = 保存到哪个UID
	$table = 保存到哪张表
	$key = 保存为PHP的变量key
	$data = 要保存的数据
	*/
	public function writeArray($uid,$table,$key,$data){
		if(!is_array($data)) we('FILEDB::writeArray的数据必须是数组');
			
		$str = "<?php\r\nglobal \$". $key. ";\r\n\${$key}=";
		$str .= self::var_export_min($data, true).";\r\n?>";
		
		$file = self::getFile($uid,$table);
		//we($file);
		Core_Fun_File::write($file,$str);
		global $FILEDBCACHE;
		unset($FILEDBCACHE[$file]);		
	}
	/*
	获取一个缓存数据
	*/	
	public function get($uid,$table){
		$file = self::getFile($uid,$table);
		if(!file_exists($file)) return false;
		global $FILEDBCACHE;
		if(!$FILEDBCACHE[$file]){
			$FILEDBCACHE[$file] = 1;
			include $file;
		}
		return true;
	}
}
?>