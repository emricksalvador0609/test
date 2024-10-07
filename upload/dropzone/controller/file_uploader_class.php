<?php
/*
* Dropzone file upload hander
* Sept 21, 2016 12:31 pm
*/

class file_uploader_class {
	
	private $action;
	private $id;
	private $count;
	private $folder;
	private $file = array();
	private $target_file;
	private $ruleset = array();
	
	public function __construct($action, $module, $file, $id, $count, $ruleset) {
	    		
		//id post by system
		$this->id = $id;	
		//file count
		$this->_count = $count;		
		//action post by user
		$this->action = $action;	
		//module that requested
		$this->module = $module;
		//file that requested
		$this->_file = $file;			
		//ruleset
		$this->ruleset = $ruleset;
		
	}	
	
	public function upload_handler(){
		
		//get the target directory to upload files
		$this->target_file = $this->get_target_file();
		
		//Start TRY
		try
		{				
			$check_dir = $this->check_dir();	
			
			//get action type
			$action = strtolower(trim($this->action));

			//check if directory is existing on upload	
			if( !$check_dir && $action == "upload") {					
				//if not, create the directory
				if( !$this->create_dir() ){					
					$message = $this->throw_message("Cannot create directory for this file.", "error");
					throw new Exception($message);
				}
			}
				
			//if user uploaded a file
			if( strtolower(trim($this->action)) == "upload" ) {	
	
				//validate file
				$validate = $this->validate_file();	
								
				//check file name
				if( strlen($this->_file['name']) == 0 ){
					$message = $this->throw_message("Cannot parse this file.", "error");
					throw new Exception($message);
				}
								
				if( !$this->upload_file() ){
					$message = $this->throw_message("Cannot upload this file.", "error");
					throw new Exception($message);
				}else{
					
				    $file_location = $this->module . "/" . date("Y") . "/" . date("m") . "/" .$this->id."_".preg_replace('/\s+/', '_', $this->_file['name']);
				    return $this->throw_message($file_location, "success");
				}
				
			//if user remove a file	
			}else if( strtolower(trim($this->action)) == "remove" ){
				
				if( $check_dir ){
					return $this->remove_file();
				}else{
					$message = $this->throw_message("This file is not existing in the directory : " . $this->target_file, "error");
					throw new Exception($message);		
				}								
			}		
		}
		catch(Exception $e){
			
			return $e->getMessage();
		}//end TRY		
	}
	
	function validate_file(){
		
		//check file count
		if( $this->_count > $this->ruleset["max_file_count"] ){
			$message = $this->throw_message("Can upload up to ".$this->ruleset["max_file_count"]." files only.", "error");
			throw new Exception($message);
		}
		
		//check file size
		if( $this->_file["size"] > $this->ruleset["max_size"] ){
			$message = $this->throw_message("File size should be lesser than ".$this->ruleset["max_size"]."", "error");
			throw new Exception($message);
		}
		
		//check file extension
		if( !in_array($this->_file['type'], $this->ruleset["acceptable_ext"]) && !empty($this->_file['type']) ) {

			$message = $this->throw_message(" Invalid file type. Only " . join(", ", $this->ruleset["acceptable_ext"]) . " are accepted !", "error");
			throw new Exception($message);
		}
			
		return true;
		
	}
	
	private function check_csv_content(){
		
		$new_file_name = $this->id."_".$this->_file['name'];              
		$targetPath = $this->target_file;		 
		$targetFile =  $targetPath . $new_file_name;

		$row = 1;
		$column_data = array();
				
		//open the file uploaded
		if ( ($handle = fopen($targetFile, "r")) !== false ) {
			// read/get the content	
			while ( ($data = fgetcsv($handle, 1000, ",")) !== false ) {
				
				$num = count($data);
				$row++;				
				//check # of columns
				if( $num != $this->ruleset["number_of_columns"] ){
					
					$message = $this->throw_message("Invalid CSV column count, should be " . $this->ruleset["number_of_columns"] . " columns !", "error");
					throw new Exception($message);
				}
											
				for ($c=0; $c < $num; $c++) {
					
					if($row == 2){				
						array_push($column_data,$data[$c]);
					}
						
					//validate email address
					if($c == 3 AND $row > 2){	

						if( filter_var($data[$c], FILTER_VALIDATE_EMAIL) === false && !$this->ruleset["allow_invalid_email"] ) {
							
							$message = $this->throw_message("Invalid email address found: " . $data[$c] . ".", "error");
							throw new Exception($message);
						}								
					}else{
						
						//validate name, lastname, title, check in, check out
						if( !preg_match("/^[a-z0-9\s\-_]+$/i", $data[$c]) && !$this->ruleset["allow_special_characters"] ) {
							
							$message = $this->throw_message("Special characters are not allowed, found: " . $data[$c] . ".", "error");
							throw new Exception($message);
						}
					}				
				}
				
				//check first row for the column titles
				if($row == 2){	
					if( array_diff($this->ruleset["acceptable_columns"], $column_data) ){
						$message = $this->throw_message("Column title error. Standard should be (" .join(',', $this->ruleset["acceptable_columns"]) . ").", "error");
						throw new Exception($message);
					}	
				}
			}			
			fclose($handle);
		}
	
		return true;
	}
	
	private function upload_file(){

// 	    ini_set('display_errors', 1);
// 	    ini_set('display_startup_errors', 1);
// 	    error_reporting(E_ALL);
	    
// 	    error_log($this->target_file);
	       
		$new_file_name = $this->id."_".preg_replace('/\s+/', '_', $this->_file['name']);
		$tempFile = $this->_file['tmp_name'];                 
		$targetPath = $this->target_file;		 
		$targetFile =  $targetPath . $new_file_name;
	 	
		//upload the file to server	
		if( move_uploaded_file($tempFile, $targetFile) ){			
			return true;
		}
		else{
			return false;
		}		
	}
	
	private function remove_file(){
		
		$cwd = $this->id;
		/* delete physical file */	
		$unlink = unlink($cwd);
		
		if (!$unlink){
			return false;
		}
		else{
			return true;
		}			
	}
	
	private function check_dir(){
	
		//check if rootlink is existing
		if(!is_dir($this->target_file)) {
			return false;
		}else {
			return true;
		}			
	}
	
	private function create_dir(){
	    
	   mkdir($this->target_file, 0777, true);
	   
		//check if successfully created
		if($this->check_dir()){
			return true;
		}else{
			//if still no dir, force to create
			return false;
		}
			
	}
	
	private function get_target_file(){
		
		$target_file = $this->module . "/" . date("Y") . "/" . date("m") . "/";
		//$target_file = "Test";
		return $target_file;		
	}
	
	private function throw_message($message, $status){
		
		$message_array = array(
							"msg" => $message, 
							"status" => $status,
						);
						
		return json_encode($message_array);				
	}
	
}
?>