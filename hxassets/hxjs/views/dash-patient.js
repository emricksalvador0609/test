
let patientdEditList = {};
$(document).ready(function(){

	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

		 	getPatients("dash-patient-pending-list-div");

		 	setTimeout(function(){
				getPatients("dash-patient-approved-list-div", "approved");
			}, 2000);

            setTimeout(function(){
		 		getPatients("dash-patient-non-hx-list-div", "non-hx-user");
		 	}, 3000);


		 	setTimeout(function(){
		 		getPatients("dash-patient-rejected-list-div", "rejected");
		 	}, 4000);


		}else{
			forceLogout();
		}
	});

    $(document).on('click',".fa-edit-patient", function() {
        var edit_id = $(this).attr("edit-id");
        var edit_data = patientdEditList[edit_id];
        console.log(edit_id);
        console.log(edit_data);
        clearInputs();
        $("#btn-update-patient").parent().show();
        $("#btn-add-patient").parent().hide();
        $("#menu-add-patient-title").text("Edit Patient Data");

        $("#patient_id").val(edit_data.PK);
        $("#patient-first-name").val(edit_data.first_name);
        $("#patient-last-name").val(edit_data.last_name);
        $("#patient-gender").val(edit_data.gender);
        $("#patient-date-of-birth").val(edit_data.date_of_birth);
        $("#patient-phone-number").val(edit_data.phone_number);
        $("#patient-email-address").val(edit_data.email_address);
        $("#patient-address").val(edit_data.address);

        menu("menu-add-patient", "show", 250);
        event.preventDefault()
    });

    $("#btn-update-patient").click(function(){

        let _this = $(this);
        let first_name = $("#patient-first-name").val();
        let last_name = $("#patient-last-name").val();
        let email_address = $("#patient-email-address").val();
        let phone_number = $("#patient-phone-number").val();
        let gender = $("#patient-gender").val();
        let date_of_birth = $("#patient-date-of-birth").val();
        let address = $("#patient-address").val();

        let patient_id = $("#patient_id").val();

        if(first_name.length <= 0 ){
            showToastNotification("Error", "First name is required","error");
            return false;
        }

        if(last_name.length <= 0 ){
            showToastNotification("Error", "Last name is required","error");
            return false;
        }

        if(gender.length <= 0 ){
            showToastNotification("Error", "Gender is required","error");
            return false;
        }

        if(date_of_birth.length <= 0 ){
            showToastNotification("Error", "Date of birth is required","error");
            return false;
        }

        let data = {
           "keyword": "update-patient-basic-profile",
           "first_name": first_name,
           "last_name": last_name,
           "email_address": email_address,
           "phone_number": phone_number,
           "actokensec": actokensec,
            "gender": gender,
            "date_of_birth":date_of_birth,
            "patient_id": patient_id,
            "address": address
       };
       updateDependantsProfile(_this,data);
    });

	$("#dash-patient-connect-patient").click(function(){

		showModalNotification("action-sheet-connect-to-patient", 0, "", "");

		//initialize the camera for QRCODE
		initQrCodeScanner();
	});

    $("#btn-add-non-hx-patient").click(function(){
        clearInputs();
        $("#btn-update-patient").parent().hide();
        $("#btn-add-patient").parent().show();
        $("#menu-add-patient-title").text("Add Patient");
        menu("menu-add-patient", "show", 250);
    });

    $("#btn-add-patient").click(function(){
        var btn_element = $(this);
        var is_valid = true;
        var first_name = $("#patient-first-name").val();
        var last_name = $("#patient-last-name").val();
        var gender = $("#patient-gender").val();
        var birth_date = $("#patient-date-of-birth").val();
        var phone_number = $("#patient-phone-number").val();
        var email_address = $("#patient-email-address").val();
        var address = $("#patient-address").val();

        if(first_name == "" || typeof first_name=="null" ) {
             showToastNotification("Error", "First name is reqired.","error");
             is_valid = false;
             return;
        }

        if(last_name == "" || typeof last_name=="null") {
             showToastNotification("Error", "Last name is reqired.","error");
             is_valid = false;
             return;
        }

        if(gender == "" || typeof gender=="null") {
             showToastNotification("Error", "Gender is reqired.","error");
             is_valid = false;
             return;
        }


        if(birth_date == "" || typeof birth_date=="null") {
             showToastNotification("Error", "Date of birth is reqired.","error");
             is_valid = false;
             return;
        }

        if(is_valid){
            saveNonHxUser(btn_element,first_name, last_name, gender, birth_date,phone_number,email_address,address);
        }

    });


	function initQrCodeScanner(){

		// If found you qr code
	    function onScanSuccess(decodeText, decodeResult) {
	        document.getElementById("dash-profile-patient-id").value = decodeText
	    }

	    let htmlscanner = new Html5QrcodeScanner(
	        "my-qr-reader",
	        { fps: 100, qrbos: 1000}
	    );

	    htmlscanner.render(onScanSuccess);
	}

	$("#dash-patient-confirm-conn-request").click(function(){

		let _this = $(this);
		let old_txt = _this.text();
		let patient_id = $("#dash-profile-patient-id").val();
		let clinic_id = 1;

		if(patient_id.length <= 0 ){
	        showToastNotification("Error", "Patient ID is required. Please check and try again.");
			return false;
		}

		_this.attr("disabled", true).text("Processing...");

		let data = {
			"keyword": "send-manual-conn-request",
			"patient_id": patient_id,
			"clinic_id": clinic_id,
			"actokensec": actokensec,
		};

		let jwt_data = jwt_encode(data);

		$.ajax({
			url: baseApiUrl,
			cache: true,
			type: "POST",
			data: jwt_data,
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

			},
			success : function (data) {

				let status = data.status;
				let message = data.message;

				if(status == "success"){

					showToastNotification("Success!", message);

					//hide modal
					hideModalNotification("action-sheet-connect-to-patient");

					getPatients("dash-patient-approved-list-div", "approved");

				}else{
					showToastNotification("Error!", message);

					//access token error, redirect to login
					if(typeof data.actokenerror && data.actokenerror){
						setTimeout(function(){
							window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
						}, 3000);
					}
				}

				_this.attr("disabled", false).text(old_txt);

			},
			error: function (error) {
				_this.attr("disabled", false).text(old_txt);
				showToastNotification("Error!", error.responseText);
			}
		});
	});



});

function saveNonHxUser(btn_element, first_name, last_name, gender, birth_date,phone_number,email_address,address) {

    btn_element.attr("disabled", true).text("Processing...");

    let data = {
        "keyword": "add-non-hx-user",
        "first_name": first_name,
        "last_name":last_name,
        "gender":gender,
        "birth_date":birth_date,
        "phone_number":phone_number,
        "email_address":email_address,
        "address":address,
        "actokensec": actokensec
    };

    let jwt_data = jwt_encode(data);

    $.ajax({
        url: baseApiUrl,
        cache: true,
        type: "POST",
        data: jwt_data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

        },
        success : function (data) {

            let status = data.status;
            let message = data.message;

            if(status == "success"){
                showToastNotification("Success!", message);
                //hide modal
                hideModalNotification("menu-add-patient");
                getPatients("dash-patient-non-hx-list-div", "non-hx-user");

            }else{
                showToastNotification("Error!", message,"error");

                //access token error, redirect to login
                if(typeof data.actokenerror && data.actokenerror){
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
            }

            btn_element.attr("disabled", false).text("Add");

        },
        error: function (error) {
            btn_element.attr("disabled", false).text("Add");
            showToastNotification("Error!", error.responseText);
        }
    });

}

function getPatients(_elem_id, approval_status = ""){

    let data = {
        "keyword": "get-doctor-patient",
        "approval_status": approval_status,
        "actokensec": actokensec,
    };

    let jwt_data = jwt_encode(data);

    $.ajax({
        url: baseApiUrl + jwt_data,
        cache: true,
        type: "GET",
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

        },
        success : function (data) {

            let status = data.status;
            let message = data.message;
            let patients = data.json;
            let patient_html = "";

            if(status == "success"){

                if( !$.isEmptyObject(patients) ){
                    patientdEditList = patients
                    $.each(patients, function(key, value){

                        if(approval_status != "non-hx-user") {
                            let patient_info = value['patient_info'][0];
                            //let patient_color = approval_status == "pending" ? "blue" : (approval_status == "approved" ? "green" : "red");
                            let full_name = titleCase( patient_info['first_name']+' '+patient_info['last_name']);
                            patient_html += '<div class="col-xl-4 col-lg-6 ">';
                                patient_html += '<div class="card">';
                                    patient_html += '<div class="card-body">';
                                        patient_html += '<div class="d-flex align-items-center">';
                                            patient_html += '<img src="https://mdbootstrap.com/img/new/avatars/8.jpg" alt="" style="width: 45px; height: 45px" class="rounded-circle"/>';
                                        
                                            patient_html += '<div class="ms-3">';

                                            patient_html += '<div class="d-flex justify-content-between ">';
                                            patient_html += '<a class="fw-bold mb-1" href="?hxcurrentpage=dash-patient-info&patient-no='+patient_info['formal_id']+'">'+full_name+'</a>';
                                            patient_html += '<a href="?hxcurrentpage=dash-patient-info&patient-no='+patient_info['formal_id']+'"><i class="fa fa-share-from-square  fa-open-patient-info"></i></a>';
                                             patient_html += '</div>';
                                            
                                            patient_html += '<p class="text-muted mb-0">Last Approval Date: '+value['approval_date']+'</p>';
                                            patient_html += '</div>';
    
                                        patient_html += '</div>';
                                    patient_html += '</div>';
                                patient_html += '</div>';
                            patient_html += '</div>';

                        } else {
                            let full_name = titleCase( value['first_name']+' '+value['last_name']);

                             patient_html += '<div class="col-xl-4 col-lg-6 ">';
                                patient_html += '<div class="card">';
                                    patient_html += '<div class="card-body">';
                                        patient_html += '<div class="d-flex justify-content-between">';
                                        patient_html += '<div class="d-flex align-items-center">';
                                            patient_html += '<img src="https://mdbootstrap.com/img/new/avatars/8.jpg" alt="" style="width: 45px; height: 45px" class="rounded-circle"/>';
                                        
                                            patient_html += '<div class="ms-3">';

                                            
                                            patient_html += '<a class="fw-bold mb-1" href="?hxcurrentpage=dash-patient-info&patient-no='+value['formal_id']+'">'+full_name+'</a>';
                                     

                                          
                                           
                                            
                                            patient_html += '<p class="text-muted mb-0">Created Date: '+value['createdDate']+'</p>';
                                            patient_html += '</div>';

                                            
                                            patient_html += '<div class="ps-2">';
                                                  patient_html += '<a href="?hxcurrentpage=dash-patient-info&patient-no='+value['formal_id']+'"><i class="fa fa-share-from-square fa-open-patient-info"></i></a>';
                                                 patient_html += '<i class=" fa fa-pen-to-square fa-edit-patient" edit-id="'+value['PK']+'" ></i>';
                                            patient_html += '</div>';


                                              patient_html += '</div>';

    
                                        patient_html += '</div>';
                                    patient_html += '</div>';
                                patient_html += '</div>';
                            patient_html += '</div>';

           
                        }
                        patientlist_ctr++;
                    });

                }else{
                     patient_html += '<span class="text-muted">No data found.</span>';


                }

                $("#" + _elem_id).html(patient_html);

            }else{
                showToastNotification("Error!", message);

                //access token error, redirect to login
                if(typeof data.actokenerror && data.actokenerror){
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
            }

        },
        error: function (error) {
            showToastNotification("Error!", error);
        }
    });

}

function updateDependantsProfile(element,data){
    element.attr("disabled", true).text("Processing...");

    let jwt_data = jwt_encode(data);
    $.ajax({
        url: baseApiUrl,
        cache: true,
        type: "POST",
        data: jwt_data,
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));
        },
        success : function (data) {

            let status = data.status;
            let message = data.message;

            if(status == "success"){
                showToastNotification("Update Successful!", message);
                hideModalNotification("menu-add-patient");
                getPatients("dash-patient-non-hx-list-div", "non-hx-user");
            }else{
                showToastNotification("Update Error", message);
                //access token error, redirect to login
                if(typeof data.actokenerror && data.actokenerror){
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
            }
            element.attr("disabled", false).text("Update");
        },
        error: function (error) {
            element.attr("disabled", false).text("Update");
        }
    });
}


function clearInputs() {
    $("#patient_id").val("");
    $("#patient-first-name").val("");
    $("#patient-last-name").val("");
    $("#patient-gender").val("");
    $("#patient-date-of-birth").val("");
    $("#patient-phone-number").val("");
    $("#patient-email-address").val("");
    $("#patient-address").val("");
}


// added by emrick 8/14/2024

$(document).ready(function() {

   
 $(document).on('click','a[class="class_arc"]', function() {

        var $row = $(this).closest('tr');
        var $td = $row.find('td').eq(0);
       
        downloadfile($(this).data('pk')); 

     
    });





 function downloadfile(PK = ""){

    let data = {
        "keyword": "download-patient-list",
        "PK": PK,
        "actokensec": actokensec,
    };

    let jwt_data = jwt_encode(data);

    $.ajax({
        url: baseApiUrl + jwt_data,
        cache: true,
        type: "GET",
         xhrFields: {
                    responseType: 'blob'
                },
        beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

        },
        success: function(data, status, xhr) {
             // Extract filename from the Content-Disposition header if available
            let disposition = xhr.getResponseHeader('Content-Disposition');
            let filename = 'archive.zip'; // Default filename
            
            if (disposition) {
                let matches = disposition.match(/filename="(.+)"/);
                if (matches.length === 2) {
                    filename = matches[1];
                }
            }

            // Create a link element to trigger the download
            let link = document.createElement('a');
            let url = window.URL.createObjectURL(data);
            link.href = url;
            link.download = filename; // Use extracted or default filename
            link.click(); // Trigger the download
            window.URL.revokeObjectURL(url); // Clean up
            },
        error: function (error) {
            showToastNotification("Error!",  error.statusText);
        }
    });


 }




 $(document).on('click',"#dash-patient-archive", function() {
   getarchivetable();
    $('#archivemodal').modal('show');
 });

function getarchivetable(){

        let data = {
            "keyword": "get-archive-list",
            "actokensec": actokensec,
        };

        let jwt_data = jwt_encode(data);

        $.ajax({
            url: baseApiUrl + jwt_data,
            cache: true,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

            },
            success : function (data) {

                let status = data.status;
                let message = data.message;
                let patients = data.json;
                let patient_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 

                            let patient_info = value['patient_info'];

                            key++;
                            var file_direct = value['file_directory'];
        

                            patient_html += '<tr>';
                            patient_html += ' <td>'+key+'</td>';
                            patient_html += ' <td>'+value['CreatedDate']+'</td>';
                            patient_html += ' <td>'+value['user_username']+'</td>';
                            patient_html += ' <td><a href="#" data-pk="'+value['PK']+'" class="class_arc" id="download_id">Download</a></td>';
                            patient_html += '</tr>';
                        });

                    }else{
                        patient_html += '<tr>';
                        patient_html += ' <td colspan="4">';
                        patient_html += '   <div class="text-center">';
                        patient_html += '     <p class="text-muted mb-0">No Archiving File Yet.';
                        patient_html += '   </p>';
                        patient_html += '   </div>';
                        patient_html += ' </td>';
                        patient_html += '</tr>';

                    }   


               
                 $("#archive_tbl").html(patient_html);

                }else{
                    showToastNotification("Error!", message);
                    
                    //access token error, redirect to login
                    if(typeof data.actokenerror && data.actokenerror){
                        setTimeout(function(){
                            window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                        }, 3000);
                    }
                }  

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }



 $(document).on('click',"#dash-patient-download", function() {
    getPatientInfo();
 });


    function getPatientInfo(){

        let data = {
            "keyword": "get-patient-mdorders",
            "actokensec": actokensec,
        };

        let jwt_data = jwt_encode(data);

        $.ajax({
            url: baseApiUrl + jwt_data,
            cache: true,
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));

            },
            success : function (data) {

                let status = data.status;
                let message = data.message;
                let patient_info = data.json;

                //console.log(patient_info);patient_info
           
                console.log(data);

                 if(status == "success"){
                    showToastNotification("File Archived!", message);
                    getarchivetable();
                 }else{
                showToastNotification("Error", message);
                //access token error, redirect to login
                if(typeof data.actokenerror && data.actokenerror){
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
            }

            },
            error: function (error) {
                showToastNotification("Error!", error);
            }
        });

    }

});
   

