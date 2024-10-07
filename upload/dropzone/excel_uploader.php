<?php

echo "TEST";
die();

date_default_timezone_set('Asia/Manila');

$post = "";
$action = "";
$file = "";
$id = 0;
$acceptable_columns = "";

if( isset($_POST) && count($_POST) > 0 ){
    
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
	* FileUpload Rules set
	*/
	$ruleset = array(
		"allow_invalid_email" => true,
		"allow_special_characters" => true,
	    "acceptable_columns" => array("Username", "First Name", "Last Name", "Gender", "Birthday", "Phone Number", "Email Address", "Address");
	);
	
	$excel_parser = new excel_parser($database, $action, $module, $file, $id, $count, $ruleset);	
	$parser = $excel_parser->upload_handler();
 
	echo $parser;
	
}else{
	echo "No post received.";
	exit();
}

?>