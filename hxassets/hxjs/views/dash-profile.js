/* DROPZONE GLOBAL JS FILE UPLOADS START */

let clinicData = {};
let clinicsecData = {};
let active_clinic =  0;
$(document).ready(function(){


    Dropzone.autoDiscover = false;
    var module_name = "Profile-Picture-Doctor";

    is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

		 	prof_data = prof_data[0];
            active_clinic = prof_data.active_clinic;

		 	let first_name = validate_clean_hxdata(prof_data['first_name']);
		 	let last_name = validate_clean_hxdata(prof_data['last_name']);
		 	let email_address = validate_clean_hxdata(prof_data['email_address']);
		 	let phone_number = validate_clean_hxdata(prof_data['phone_number']);

		 	let sig2_number = validate_clean_hxdata(prof_data['sig2_number']);
		 	let ptr_number = validate_clean_hxdata(prof_data['ptr_number']);
		 	let license_number = validate_clean_hxdata(prof_data['license_number']);
            let title = validate_clean_hxdata(prof_data['title']);

            let license_no_exp_date = validate_clean_hxdata(prof_data['license_no_exp_date']);
            let ptr_no_exp_date = validate_clean_hxdata(prof_data['ptr_no_exp_date']);
            let sig_2_no_exp_date = validate_clean_hxdata(prof_data['sig_2_no_exp_date']);
            let date_of_birth = validate_clean_hxdata(prof_data['date_of_birth']);
            let gender = validate_clean_hxdata(prof_data['gender']);

            //title = "DR";

            var profile_picture = validate_clean_hxdata(prof_data['picture']);
            profile_picture = baseAppUrl + "upload/dropzone/"+profile_picture;

            var medical_header_picture = validate_clean_hxdata(prof_data['medical_form_header']);
            if(medical_header_picture != "" || medical_header_picture!= null){
                medical_header_picture = baseAppUrl + "upload/dropzone/"+medical_header_picture;
            }

            var prc_id_image = validate_clean_hxdata(prof_data['prc_id_image']);
            if(prc_id_image != "" || prc_id_image!= null){
                prc_id_image = baseAppUrl + "upload/dropzone/"+prc_id_image;
            }

		 	$("#first-name").val(first_name);
		 	$("#last-name").val(last_name);
		 	$("#email-address").val(email_address);
		 	$("#phone-number").val(phone_number);

		 	$("#doctor-sig2-no").val(sig2_number);
		 	$("#doctor-ptr-no").val(ptr_number);
		 	$("#doctor-license-no").val(license_number);
            $("#title").val(title);
            $("#doctor-license-no-expiration-date").val(license_no_exp_date);
            $("#doctor-ptr-no-expiration-date").val(ptr_no_exp_date);
            $("#doctor-sig2-no-expiration-date").val(sig_2_no_exp_date);
            $("#birthday").val(date_of_birth);
            $("#gender").val(gender);

            $("#profile-avatar").attr("src",profile_picture);
            $("#profile-image-preview").attr("src",profile_picture);
            $("#medical-form-header-view").attr("src",medical_header_picture);
            $("#medical-prc-id-view").attr("src",prc_id_image);
            $("#medical-prc-id-view").attr("data-src",prc_id_image);
            $("#medical-prc-id-container").attr("href",prc_id_image);
            //data-gallery="gallery-1"

		 	$("#my-profile-full-name").text(first_name + " " + last_name);

			getDoctorClinic();

            var lightbox = GLightbox({
                closeOnOutsideClick: false,
                zoomable:false,
                descPosition:'bottom',
                selector: '[data-gallery]',
                openEffect: 'fade',
                closeEffect: 'fade',
                dragAutoSnap:true,
            });

		}else{
			//redirect to login
		}

	});

    $("#show-medical-header-view").click(function(){
        menu("menu-medical-header-view","show",250);
    });

    $("#show-prc-viewer").click( function() {
        menu("menu-prc-id-view","show",250);
    });

    $("#save-prc-id").click ( function() {
        let image = $("input[name=prc_id]").val();
        var isValid = true;
        if(image == "[]" || image == ""){
            showToastNotification("Error!", "Please add PRC Id Image","error");
            isValid = false;
        }

        if (isValid) {
            savePrcId($(this),image,"PRC-ID");
        }
    });

    $('body').on('click', '.checkbox-clinic', function() {
        //console.log("asdasdsada");
        let current_clinic_id = $(this).val();
        $(".checkbox-clinic").each(function( index ) {
             let this_id = $(this).val();

             if (current_clinic_id != this_id) {
                 $(this).prop('checked', false);
             }
        });

        if ( !$(this).prop("checked")) {
            $(this).prop('checked', false);
            current_clinic_id = 0;
        } else {
            $(this).prop('checked', true);
        }

        setActiveClinic(current_clinic_id,false,null);

    });


	//BASIC INFO - START
	$("#dash-profile-update").click(function(){
		updateProfile( $(this) );
	});
	//BASIC INFO - END

	// CLINIC - START
	$("#dash-profile-add-clinic").click(function(){
        clearClinicInputs();
        $(".time-range").remove();
        $("#action-sheet-clinic").find("input:checkbox").prop('checked', false);
        $(".time-range-container").parent().removeClass("show");
        $("#dash-patient-save-clinic").parent().show();
        $("#dash-patient-edit-clinic").parent().hide();

      $('#dash-profile-sec-div').empty();
      
		showModalNotification("action-sheet-clinic", 0, "", "");
	});

	// CLINIC - END

	//SHORTCUT - START
	$("#auth-logout").click(function(){
		showModalNotification("menu-confirm", 0, "Log out of your account?", "This action will redirect you to Login Page.");
		$("#menu-confirm").find(".menu-confirm-button").attr("id", "auth-confirm-logout");
	});

	$(document).on("click", "#auth-confirm-logout", function(){
		//always clear session data on login
		jsstoresqlite_clear_table(session_table);

		setTimeout(function(){
			window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
		}, 1000);
	});
	//SHORTCUT - END

    $("#profile-picture-container").click (function(){
        menu("menu-profile-pic","show",250);
    });

    $("#update-profile-picture").click (function(){
        menu("menu-profile-pic","hide",250);
        menu("menu-profile-pic-dropzone","show",250);
    });

    $("#save-profile-picture").click (function(){
        let profile_image = $("input[name=profile_image]").val();


        var isValid = true;
        if(profile_image == "[]" || profile_image == ""){
            showToastNotification("Error!", "Please add Profile picture image","error");
            isValid = false;
        }

        if (isValid) {
            $(this).attr("disabled", true).text("Processing...");
            saveProfilePicture(profile_image,module_name)
        }

    });

    if($(".dropzone").length){

        $(".dropzone").each(function(){
            var dropzone_id = $(this).attr("id");
            var input_val = $(this).parent().find('.file_value');
            var mock_file_text = $(this).parent().find("#image_mock_file_list").text();
            var module_name = $(this).parent().find("#module_name").val();


            var file_limit = 1;
            var accepted_filetypes = ".pjpeg, .bmp, .png, .jpeg, .jpg";
            var file_max_size = 4; //MB

            init_dropzone( "div#"+dropzone_id, baseAppUrl + "upload/dropzone/index.php", module_name, input_val, file_limit, accepted_filetypes, file_max_size);
        });
    }

    $("#save-medical-form-header").click (function(){

        let image = $("input[name=medical_form_header]").val();
        $(this).attr("disabled", true).text("Processing...");

        var isValid = true;
        if(image == "[]" || image == ""){
            showToastNotification("Error!", "Please add Medical Form Header Image","error");
            isValid = false;
        }

        if (isValid) {
            saveMedicalFormHeader(image,"Medical-Form-Header")
        }

    });


});

function getDoctorClinic(){

	let data = {
		"keyword": "get-doctor-clinic",
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
			let clinics = data.json;
			let clinic_html = "";
            
			var dataInsert = [];

			if(status == "success"){

				if( !$.isEmptyObject(clinics) ){
                    clinicData = clinics;
                    //console.log(clinicData);
                    $.each(clinics, function(key, value){
                        //console.log(key);
                        //console.log(value);
                        	//clinic_html += '<a href="javascript:void(0)" data-trigger-switch="clinic-'+key+'">';
                        var checked = "";
                        if(active_clinic == value['clinic_id'] ){
                            checked = "checked";
                        }

                        clinic_html += '<a href="javascript:void(0)">';

	                    clinic_html += '    <span>'+value['clinic_name']+'</span>';
                        clinic_html += '    <i class="fa fa-edit edit-clinic" clinic-id="'+key+'" clinic-realid="'+value.clinic_id+'"></i>';
	                    clinic_html += '    <div class="custom-control scale-switch ios-switch clinic-toggle">';
	                    //clinic_html += '        <input type="checkbox" class="ios-input" id="clinic-'+key+'" value="'+value['clinic_id']+'">';
                        clinic_html += '        <input type="checkbox" '+checked+' class="ios-input checkbox-clinic" id="clinic-'+key+'" value="'+value['clinic_id']+'">';
	                    //clinic_html += '        <label class="custom-control-label" for="clinic-'+key+'"></label>';
                        clinic_html += '        <label class="custom-control-label" for="clinic-'+key+'"></label>';
	                    clinic_html += '    </div>';
	                    clinic_html += '</a>';

	                    var clinic_id = value.clinic_id;
	                    var clinic_name = value.clinic_name;
	                    var doctor_clinic_id = value.PK;
	                    var monday_schedule_json = value.monday_schedule_json;
	                    var tuesday_schedule_json = value.tuesday_schedule_json;
	                    var wednesday_schedule_json = value.wednesday_schedule_json;
	                    var thursday_schedule_json = value.thursday_schedule_json;
	                    var friday_schedule_json = value.friday_schedule_json;
                     	var saturday_schedule_json = value.saturday_schedule_json;
	                    var sunday_schedule_json = value.sunday_schedule_json;

	                    var is_online_monday = value.is_online_monday;
	                    var is_online_tuesday = value.is_online_tuesday;
	                    var is_online_wednesday = value.is_online_wednesday;
	                    var is_online_thursday = value.is_online_thursday;
	                    var is_online_friday = value.is_online_friday;
	                    var is_online_saturday = value.is_online_saturday;
	                    var is_online_sunday = value.is_online_sunday;


	                    if(isJson(monday_schedule_json)) {
							var monday_schedule_obj  = JSON.parse(monday_schedule_json);
						}
						if(isJson(tuesday_schedule_json)) {
							var tuesday_schedule_obj  = JSON.parse(tuesday_schedule_json);
						}
						if(isJson(wednesday_schedule_json)) {
							var wednesday_schedule_obj  = JSON.parse(wednesday_schedule_json);
						}
						if(isJson(thursday_schedule_json)) {
							var thursday_schedule_obj  = JSON.parse(thursday_schedule_json);
						}
						if(isJson(friday_schedule_json)) {
							var friday_schedule_obj  = JSON.parse(friday_schedule_json);
						}
						if(isJson(saturday_schedule_json)) {
							var saturday_schedule_obj  = JSON.parse(saturday_schedule_json);
						}

						if(isJson(sunday_schedule_json)) {
							var sunday_schedule_obj  = JSON.parse(sunday_schedule_json);
						}

                        
                    // added by emrick 8/13/2024
                
                    var secretary_infos = value.secretary_infos;

					objClinic = {
								access_token: actokensec,
								doctor_clinic_id: doctor_clinic_id,
								clinic_name: clinic_name,
								clinic_id: clinic_id,
								monday_schedule: monday_schedule_obj,
								tuesday_schedule: tuesday_schedule_obj,
								wednesday_schedule: wednesday_schedule_obj,
								thursday_schedule: thursday_schedule_obj,
								friday_schedule: friday_schedule_obj,
								saturday_schedule: saturday_schedule_obj,
								sunday_schedule: sunday_schedule_obj,
								is_online_monday: is_online_monday,
								is_online_tuesday:is_online_tuesday,
								is_online_wednesday:is_online_wednesday,
								is_online_thursday:is_online_thursday,
								is_online_friday:is_online_friday,
								is_online_saturday:is_online_saturday,
								is_online_sunday:is_online_sunday,
                                // added by emrick 8/13/2024
                               
                                secretary_infos:secretary_infos,
                                
						}
						dataInsert.push(objClinic)
					});
					jsstoresqlite_clear_table("health_xense_clinic_schedule_table");
					insertClinicIndexDb( dataInsert);
				}

				$("#dash-profile-clinic-div").html(clinic_html);
                
			}else{
				showToastNotification("Error!", message);
			}

		},
		error: function (error) {
			showToastNotification("Error!", error);
		}
	});

}




function saveProfilePicture(file_js,module_name) {

    let data = {
        "keyword": "update-profile-picture-doctor",
        'module': module_name,
        "dropzone_data": file_js,
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
            console.log(data);

            let status = data.status;
            let message = data.message;

            if(status == "success"){
                let picture = data.picture;
                showToastNotification("Update Successful!", message);
                console.log(picture);
                let where = {
                    user_access_token: actokensec
                };
                let update_data = {
                    picture: picture
                }
                //update
                 jsstoresqlite_update_data(session_table, update_data, where).then((prof_data) => {
                     location.reload()
                 });

            }else{
                showToastNotification("Error!", message,"error");
                if(typeof data.actokenerror && data.actokenerror){
                	setTimeout(function(){
                		window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                	}, 3000);
                }
            }
            $("#save-profile-picture").attr("disabled", false).text("Save");
        },
        error: function (error) {
            showToastNotification("Error!", error.responseText);
            $("#save-profile-picture").attr("disabled", false).text("Save");
        }
    });

}

function updateProfile(element) {
    let _this = element;
    let first_name = $("#first-name").val();
    let last_name = $("#last-name").val();
    let email_address = $("#email-address").val();
    let phone_number = $("#phone-number").val();
    let license_number = $("#doctor-license-no").val();
    let ptr_number = $("#doctor-ptr-no").val();
    let sig2_number = $("#doctor-sig2-no").val();
    let title = $("#title").val();
    let date_of_birth = $("#birthday").val();
    let gender = $("#gender").val();

    let license_no_exp_date = $("#doctor-license-no-expiration-date").val();
    let ptr_no_exp_date = $("#doctor-ptr-no-expiration-date").val();
    let sig_2_no_exp_date = $("#doctor-sig2-no-expiration-date").val();

    // if(first_name.length <= 0 || last_name.length <= 0 || email_address.length <= 0 || phone_number.length <= 0 || date_of_birth.length <= 0
    //     || ptr_number.length <= 0|| sig2_number.length <= 0  || title.length <= 0
    //     || license_no_exp_date.length <= 0|| ptr_no_exp_date.length <= 0  || sig_2_no_exp_date.length <= 0 ){
    //     showToastNotification("Error", "Oops! All fields is required, please check and try again.");
    //     return false;
    // }

    if(first_name.length <= 0 || last_name.length <= 0 || email_address.length <= 0 || phone_number.length <= 0 || date_of_birth.length <= 0|| title.length <= 0){
        showToastNotification("Error", "Oops! All fields is required, please check and try again.");
        return false;
    }

    _this.attr("disabled", true).text("Processing...");

    let data = {
        "keyword": "update-doctor-basic-profile",
        "first_name": first_name,
        "last_name": last_name,
        "email_address": email_address,
        "phone_number": phone_number,
        "license_number":license_number,
        "ptr_number": ptr_number,
        "sig2_number":sig2_number,
        "license_no_exp_date":license_no_exp_date,
        "ptr_no_exp_date":ptr_no_exp_date,
        "sig_2_no_exp_date":sig_2_no_exp_date,
        "date_of_birth":date_of_birth,
        "gender":gender,
        "actokensec": actokensec,
        "title": title
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

                let dataObj = {
                    first_name: first_name,
                    last_name: last_name,
                    phone_number: phone_number,
                    email_address: email_address,
                    sig2_number: sig2_number,
                    ptr_number: ptr_number,
                    license_number: license_number,
                    license_no_exp_date: license_no_exp_date,
                    ptr_no_exp_date: ptr_no_exp_date,
                    sig_2_no_exp_date: sig_2_no_exp_date,
                    date_of_birth:date_of_birth,
                    gender:gender,
                    title: title
                }

                //console.log(dataObj);

                let whereObj = {user_access_token: actokensec};

                jsstoresqlite_update_data(session_table, dataObj, whereObj).then((sqliteres) => {

                    if(sqliteres > 0) {
                        showToastNotification("Update Successful!", message);
                    } else {
                        showToastNotification("Cannot update local data, please try again!", message);
                    }
                });

            }else{

                showToastNotification("Update Error", message);

                //access token error, redirect to login
                if(typeof data.actokenerror && data.actokenerror){
                    setTimeout(function(){
                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                    }, 3000);
                }
            }

            _this.attr("disabled", false).text("UPDATE INFORMATION");

        },
        error: function (error) {
            _this.attr("disabled", false).text("UPDATE INFORMATION");
        }
    });
}

function saveMedicalFormHeader(file_js,module_name) {

    let data = {
        "keyword": "update-medical-form-header",
        'module': module_name,
        "dropzone_data": file_js,
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

                let picture = data.picture;

                showToastNotification("Update Successful!", message);
                let where = {
                    user_access_token: actokensec
                };
                let update_data = {
                    medical_form_header: picture
                }
                //update
                 jsstoresqlite_update_data(session_table, update_data, where).then((prof_data) => {
                     location.reload()
                 });

            }else{
                showToastNotification("Error!", message,"error");
                if(typeof data.actokenerror && data.actokenerror){
                	setTimeout(function(){
                		window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                	}, 3000);
                }
            }
            $("#save-medical-form-header").attr("disabled", false).text("Save");
        },
        error: function (error) {
            showToastNotification("Error!", error.responseText);
            $("#save-medical-form-header").attr("disabled", false).text("Save");
        }
    });

}

function savePrcId(element,file_js,module_name) {
    element.attr("disabled", false).text("Processing...");

    let data = {
        "keyword": "update-prc-id",
        'module': module_name,
        "dropzone_data": file_js,
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

                let picture = data.picture;
                showToastNotification("Update Successful!", message);
                let where = {
                    user_access_token: actokensec
                };
                let update_data = {
                    prc_id_image: picture
                }
                //update
                 jsstoresqlite_update_data(session_table, update_data, where).then((prof_data) => {
                     location.reload()
                 });

            }else{

                showToastNotification("Error!", message,"error");
                if(typeof data.actokenerror && data.actokenerror){
                	setTimeout(function(){
                		window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                	}, 3000);
                }
            }
            element.attr("disabled", false).text("Save");
        },
        error: function (error) {
            showToastNotification("Error!", error.responseText);
            element.attr("disabled", false).text("Save");
        }
    });
}
