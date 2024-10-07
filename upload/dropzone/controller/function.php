<?php
/**
 * List of all callable functions
 */

/*
 * get image type to know which class to process
 */
function verify_file_type($file_type){

    //if images
    $images_extensions = array( //accept Images only
        'image/pjpeg',
        'image/bmp',
        'image/jpeg',
        'image/png',
        'image/jpg'
    );

    $pdf_extension = array( //accept Images only
        'application/pdf'
    );
    //if excels
    $excel_extensions = array( //accept Excels only
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.addin.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    if( in_array($file_type, $images_extensions)) {
        return "image";
    }

    if( in_array($file_type, $excel_extensions)) {
        return "excel";
    }

    if( in_array($file_type, $pdf_extension)) {
        return "document";
    }


    //pdf_extension

    return false;

}

/*
 * process images
 */
function process_image_upload($action, $module, $file, $id, $count){

    /**
     * FileUpload Rules set
     */
    $ruleset = array(
        "max_file_count" => 10,
        "max_size" => 10000000, //limit file upload to less than 500kb only for testing
        "acceptable_ext" => array( //accept Images only
            'image/pjpeg',
            'image/bmp',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ),
    );

    $upload_handler = new file_uploader_class($action, $module, $file, $id, $count, $ruleset);
    return $upload_handler->upload_handler();

}


function process_document($action, $module, $file, $id, $count){

    /**
     * FileUpload Rules set
     */
    $ruleset = array(
        "max_file_count" => 10,
        "max_size" => 10000000, //limit file upload to less than 500kb only for testing
        "acceptable_ext" => array( //accept Images only
            'application/pdf'
        ),
    );

    $upload_handler = new file_uploader_class($action, $module, $file, $id, $count, $ruleset);
    return $upload_handler->upload_handler();

}

/*
 * process excels
 */
function process_excel_upload($action, $module, $file, $id, $count){

    /**
     * FileUpload Rules set
     */
    $ruleset = array(
        "allow_invalid_email" => false,
        "allow_special_characters" => true,
        "allow_different_header_columns" => true,
        "acceptable_columns" => array("Username", "First Name", "Last Name", "Gender", "Birthday", "Phone Number", "Email Address", "Address")
    );

    $excel_parser = new excel_parser($action, $module, $file, $id, $count, $ruleset);
    return $excel_parser->upload_handler();

}

?>
