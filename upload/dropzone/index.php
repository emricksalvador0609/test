<?php

$post = "";
$action = "";
$file = "";
$id = 0;

if( isset($_POST) && count($_POST) > 0 ){

    require_once('controller/function.php');

	if ( 0 < $_FILES['file']['error'] ) {
		echo 'Error: ' . $_FILES['file']['error'] . '<br>';
		exit();
	}

	$post = $_POST;
	/**
	* action made by user like upload or delete
	*/
	$action = $post['action'];
	/**
	* determine which module requested
	*/
	$module = $post['module'];
	/**
	* timestamp unique id for the file
	*/
	$id = trim($post['id']);
	/**
	* file count
	*/
	$count = trim($post['count']);
	/**
	* file being uploaded or deleted
	*/
	$file = $_FILES['file'];


	/**
	 * get the filetype
	 */
	$file_type = $_FILES['file']['type'];
	$file_type = verify_file_type($file_type);


	/**
	 * check file type to get the right class
	 */

	if( $file_type == "image") {

	    require_once('controller/file_uploader_class.php');
	    echo process_image_upload($action, $module, $file, $id, $count);
    }else if( $file_type == "document" ){
        require_once('controller/file_uploader_class.php');
       echo process_document($action, $module, $file, $id, $count);

	}else if( $file_type == "excel" ){

	    // Excel reader from http://code.google.com/p/php-excel-reader/
	    require_once('libraries/phpexcel_reader/php-excel-reader/excel_reader2.php');
	    require_once('libraries/phpexcel_reader/SpreadsheetReader.php');

	    require_once('controller/excel_parser_class.php');
	    echo process_excel_upload($action, $module, $file, $id, $count);

	} else {

	    echo "File type is not supported.";
	}

}else{
	echo "No post received.";
	exit();
}




?>
