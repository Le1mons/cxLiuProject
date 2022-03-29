<?php
/*
*
*    Usage                    :
*        # Cache active time half an hour
*        # This Can Auotmatic make some none exist dirs
*        # Or you can use an cache file in curent dir
*        # The Usage Such as 
*        # $cache    = new cache(string cache_name,int seconds);
*
*        require ('cache.inc.php');
*        $cache    = new fileCache('dir1/dir2/cache_name.htm',60*30);    
*
*        $cache->start();
*
*        # Your Page Contents With print
*        phpinfo();
*
*        $cache->_end();
*
*/
 
class fileCache {
    var $_file;
    var $cache_time;
 
    function fileCache($_file='_index.htm',$cache_time=1) {
        $this->_file        = $_file;
        $this->cache_time    = $cache_time;
    }
    /*
    * Start cache method without return
    */
    function start() {
        if($this->cache_is_active()) {
            include($this->_file);
            exit;
        }
        ob_start();
    }
 
    /*
    * End of cache method without Return
    */
    function _end() {
        $this->make_cache();
        ob_end_flush();
    }
 
    /*
    * Check if cache file is actived
    * Return true/false
    */
    function cache_is_active() {
        if ($this->cache_is_exist()) {
            if (time() - $this->lastModified() < $this->cache_time)
                return true;
            else {
                return false;
            } 
        }
        else {
            return false;
        } 
    }
 
    /*
    * Create cache file
    * return true/false
    */
    function make_cache() {
        $content    = $this->get_cache_content();
		$content = str_replace(array("\r","\n","\t"),'',$content);
        if($this->write_file($content)) {
            return true;
        }
        else {
            return false;
        }
    }
 
    /*
    * Check if cache file is exists
    * return true/false
    */
    function cache_is_exist() {
        if(file_exists($this->_file)) {
            return true;
        }
        else {
            return false;
        }
    }
 
    /*
    * return last Modified time in bollin formart
    * Usage: $lastmodified = $this->lastModified();
    */
    function lastModified() {
        return @filemtime($this->_file);
    }
 
    /*
    * return Content of Page
    * Usage: $content = $this->get_cache_content();
    */
    function get_cache_content() {
        $contents = ob_get_contents();
//        return '<!--'.date('Y-m-d H:i:s').'-->'.$contents;
        return $contents;
    }
 
    /*Write content to $this->_file 
    * return true/false
    * Usage: $this->write_file($content);
    **/
    function write_file($content,$mode='w+')
    {
        $this->mk_dir($this->_file);
        if (!$fp = @fopen($this->_file,$mode)) {
            $this->report_Error($this->_file." 目录或者文件属性无法写入.");
            return false;
        } else{
            @fwrite($fp,$content);
            @fclose($fp);
            @umask($oldmask);
            return true;
        }
    }
 
    /*
    * Make given dir included in $this->_file
    * Without return
    * Usage: $this->mk_dir();
    */
    function mk_dir()
    {    //$this->_file    = str_replace('','/');
        $dir    = @explode("/", $this->_file);
        $num    = @count($dir)-1;
        $tmp    = './';
        for($i=0; $i<$num; $i++){
            $tmp    .= $dir[$i];
            if(!file_exists($tmp)){
                @mkdir($tmp);
                @chmod($tmp, 0777);
            }
            $tmp    .= '/';
        }
    }
 
    /*
    * Unlink an exists cache
    * return true/false
    * Usage: $this->clear_cache();
    */
    function clear_cache() {
        if (!@unlink($this->_file)) {
            $this->report_Error('Unable to remove cache');
            return false;
        }
        else {
            return true;
        }
    }
    /*
    * Report Error Messages
    * Usage: $this->report_Error($message);
    */
    function report_Error($message=NULL) {
        if($message!=NULL) {
            trigger_error($message);    
        }
    }
}
?>
