<?php
/* 
* Algie Rosario - 09265310089
* Dropzone file upload hander
* Sept 21, 2016 12:31 pm
* Updated February 22, 2018 12:00 PM 
*/

class excel_parser {
	
	private $action;
	private $id;
	private $count;
	private $folder;
	private $module;
	private $file = array();
	private $target_file;
	private $full_path_filename;
	private $ruleset = array();
	
	protected $database;
	
	public function __construct( $action, $module, $file, $id, $count, $ruleset) {
	    
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
		//file upload foler
		$this->folder = 'upload/dropzone/';
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

			//check if directory is existing and on upload	
			if( !$check_dir && $action == "upload") {
			    
				//if not, create the directory
				if( !$this->create_dir() ){					
					$message = $this->throw_message("Cannot create directory for this file.", "error");
					throw new Exception($message);
				}
			}	
								
			//if user uploaded a file
			if( strtolower(trim($this->action)) == "upload" ) {
			    
				//check file name
				if( strlen($this->_file['name']) == 0 ){
					$message = $this->throw_message("Cannot parse this file.", "error");
					throw new Exception($message);
				}
				
				$inb_upload_file = $this->upload_file();
				
				if( !$inb_upload_file ){
					$message = $this->throw_message("Cannot upload this file.", "error");
					throw new Exception($message);
				}else{
					
					//validate the content
					if( $this->validate_content() ){	
						//return tempfile as id	
					    $file_location = $this->module . "/" . date("Y") . "/" . date("m") . "/excels/" .$this->id."_".str_replace(' ', '_', $this->_file['name']);
						return $this->throw_message($file_location, "success");					
					}else{
					    $message = $this->throw_message("Cannot parse file: " . $this->_file['name'], "error");
					    throw new Exception($message);	
					}
				}
				
			//if user remove a file	
			}else if( strtolower(trim($this->action)) == "remove" ){
				
				if( $check_dir ){
					return $this->remove_file();
				}else{
					$message = $this->throw_message("This file is not existing in the directory", "error");
					throw new Exception($message);		
				}								
			}		
		}
		catch(Exception $e){
			
			return $e->getMessage();
		}//end TRY		
	}
	
	private function validate_content(){
		
		$new_file_name = $this->id."_".$this->_file['name'];              
		$targetPath = $this->target_file;		 
		$targetFile =  $targetPath . str_replace(' ', '_', $new_file_name);

		$row = 1;
		$column_data = array();
				
		//start parsing 
		//echo "File: " . $targetFile;
		$Spreadsheet = new SpreadsheetReader($targetFile);
		
		$Sheets = $Spreadsheet -> Sheets();
	
		foreach ($Sheets as $Index => $Name)
		{
		    
		    $Spreadsheet -> ChangeSheet($Index);
		    
		    $row_ctr = 0;
		    $row_ctr_error = 1;
		    $acceptable_columns = count($this->ruleset["acceptable_columns"]);
		    
		    foreach ($Spreadsheet as $Key => $Row)
		    {		       
		        if ($Row)
		        {
		            //first row
		            if($row_ctr <= 0){
		                
		                //need to check column headers
		                if(!$this->ruleset["allow_different_header_columns"]){
		                    
		                    $is_header_correct = ($this->ruleset["acceptable_columns"] == $Row);
		                    
		                    //check header row for acceptable header columns
		                    if( !$is_header_correct ){
		                        $message = $this->throw_message("File header title: '{$Row}' error. Please check header format above.", "error");
		                        throw new Exception($message);
		                    }
		                }
		                
		            }else{
		                
		                $column_ctr = 0;
		                
		                //loop thru each rows column value and then check
		                foreach($Row as $column_key=>$value){
		                    
		                    $value = trim($value);
		                    
		                    //if no value on email then stop
		                    if( strlen($value) <= 0 && $column_ctr == 3){
		                       // break;
		                    }
		                    
		                    //validate email address
		                    if($column_ctr == 6){
		                        
		                        if( filter_var($value, FILTER_VALIDATE_EMAIL) === false && $this->ruleset["allow_invalid_email"] === false ) {
		                            
		                            //$message = $this->throw_message("Invalid email address found: '{$value}' on Row {$row_ctr_error}.", "error");
		                            //throw new Exception($message);
		                        }
		                       
		                    }else{
		                        
		                        //validate other fields
		                        if( !preg_match("/^[a-z0-9\s\-_]+$/i", $value) && !$this->ruleset["allow_special_characters"] ) {
		                            
		                            $message = $this->throw_message("Special characters are not allowed, found: {$value} on Row {$row_ctr_error}.", "error");
		                            throw new Exception($message);
		                        }
		                    }
		                    
		                    $column_ctr++;
		                }
		            }
		           
		        }
		        else
		        {
		            //echo $Key.'Dumo ';
		            //var_dump($Row);
		        }	
		        
		        $row_ctr++;
		        $row_ctr_error++;
		    }
		    
		}
		//end parsing
	
		return true;
	}
	
	private function validateDate($date, $format = 'Y-m-d')
	{
	    $d = DateTime::createFromFormat($format, $date);
	    return $d && $d->format($format) == $date;
	}
	
	//for 24 hour format
	private function validateTime($time){
	    return preg_match("/(2[0-4]|[01][1-9]|10):([0-5][0-9])/", $time);
	}
	
	private function upload_file(){

		$new_file_name = $this->id."_".$this->_file['name'];
		$tempFile = $this->_file['tmp_name'];                 
		$targetPath = $this->target_file;		 
		$targetFile =  $targetPath . str_replace(' ', '_', $new_file_name);
	 	
		//upload the file to server	
		if( move_uploaded_file($tempFile, $targetFile) ){
		    
		    $this->full_path_filename = $targetFile;
			return true;
		}
		else{
			return false;
		}		
	}
	
	private function remove_file(){
		
		$cwd = $this->id;
		
		if (!unlink($cwd)){
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
		
		//error_log($this->target_file);	
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
		
	    $target_file = $this->module . "/" . date("Y") . "/" . date("m") . "/excels/";
		
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

