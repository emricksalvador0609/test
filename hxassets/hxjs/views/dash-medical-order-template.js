$(document).ready(function(){

	//show medical certificate form
	$(document).on('click', '.show-template-eprescription', function() {
		var eprescription_id = $(this).attr("medical-eprescription-id");
		requestEPrescriptionRx(eprescription_id);
	});

	//show medical certificate form
	$('body').on('click', '.show-template-medical-certificate', function() {
		var medical_id = $(this).attr("medical-certificate-id");
		requestMedicalCerfiticateData(medical_id);
	});

	//show lab request
    $('body').on('click', '.show-template-lab-request', function() {
		var lab_request_id = $(this).attr("medical-laboratory-request-id");
		requestLabRequestData(lab_request_id);
	});

	//show referral request
	$('body').on('click', '.show-template-referral-request', function() {
		var medical_id = $(this).attr("medical-referral-letter-id");
		requestReferralData(medical_id);
	});

    $('body').on('click', '.show-template-lab-result', function() {
		var result_id = $(this).attr("medical-laboratory-result-id");
        //menu-gallery
        menu("menu-gallery", "show", 250);
		requestLabResultData(result_id);
	});

    $('body').on('click','.print-soap', function() {
        //soap-request-content
        menu("eprescription-menu-wizard-rx", "show", 250);

        $("#eprescription-content").hide();
        $("#additional-info").hide();
        $("#dash-prescription-buttons, #dash-preview-buttons").hide();

        $("#emedical-certificate-content").hide();
        $("#ereferral-request-content").hide();
        $("#emedical-lab-request-content").hide();
        //$("#soap-request-content").css('visibility','hidden');
        $("#dash-standard-buttons").show();
        $("#soap-request-content").show();

        //let vital_signs = $(this).parents().eq(6).closest(".vital-signs");
        let soap_container = $(this).closest(".soap-container");
        let vital_signs = soap_container.find(".vital-signs");
        let soap_content = soap_container.find(".soap-item");
        let soap_diagnosis_html = soap_container.find(".accordion-diagnosis").html();

        let vital_signs_html = vital_signs.html();
        let soap_content_html = ' <p class="soap-item mt-n1 line-height-m">'+soap_content.html()+'</p>';

        $("#soap-content-vital-signs").html( vital_signs_html );
        $("#soap-content-main").html( soap_content_html );
        $("#soap-diagnosis").html( soap_diagnosis_html );

        setDoctorDetails();
        setPatientDetails()

    });

    $("#btn-print-form").click ( function () {
		var inserted_id= $("#inserted_id").val();
		var mdorder_type= $("#mdorder_type").val();
		let formal_id = getUrlParameter('patient-no');

		//modify by emrick 9/5/2024
		viewpdf(inserted_id,formal_id,mdorder_type);
        // $("#printable-form").printThis(
        //     {
        //         importCSS: true,
        //         beforePrint: beforePrint(),
        //         afterPrint: afterPrint(),
        //         printDelay: 3000
        //     }
        // );
    });


    is_logged_in(session_table, false).then((prof_data) => {

        if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

            //get_clinic_form_header();
		}else{
			forceLogout();
		}

    });


    //get_clinic_form_header
});


function requestEPrescriptionRx(eprescription_id){

	let _prescription_id = eprescription_id;
	if( _prescription_id <= 0 ){
		showToastNotification("Oops!", "System cannot get the required prescription details. Please refresh the page and try again.");
		return false;
	}

	//added by emrick 9/5/2024
	$("#inserted_id").val(_prescription_id);
	$("#mdorder_type").val(4);

	let data = {
		"keyword": "doctor-patient-prescription-detail",
		"prescription_id": _prescription_id,
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
			let resJson = data.json;

			if(status == "success"){

				if( !$.isEmptyObject(resJson) ){
                    let static_json_data = {};
                    if(resJson.static_pdf_info!= ""){
                        static_json_data = JSON.parse(resJson.static_pdf_info);
                    }
                    let patient_info = static_json_data.patient;
                    let doctor_info = static_json_data.doctor;

                    drawPatientInfo(patient_info);
                    drawDoctorInfo(doctor_info);

					let prescription_items = new Array();
					let item_details = resJson[0]['item_details'];

					$.each(item_details, function(key, value){
						let valueToPush = {};
						valueToPush["curr_medicine_id"] = value['prod_id'];
						valueToPush["curr_medicine_name"] = value['prod_name'];
						valueToPush["curr_medicine_generic"] = value['generic'];
						valueToPush["curr_medicine_brand"] = value['brand'];
						valueToPush["curr_medicine_dose"] = value['dose'];
						valueToPush["curr_medicine_form"] = value['form'];
						valueToPush["curr_medicine_qty"] = value['quantity'];
						valueToPush["curr_medicine_sig"] = value['sig'];
                        valueToPush["curr_medicine_remark"] = value['remark'];
						valueToPush["curr_medicine_frequency"] = value['frequency'];
						valueToPush["curr_medicine_frequency_unit"] = value['frequency_unit'];
						valueToPush["curr_medicine_duration_start"] = value['duration_start_date'];
						valueToPush["curr_medicine_duration_end"] = value['duration_end_date'];
						prescription_items.push(valueToPush);
					});

					showModalNotification("eprescription-menu-wizard-rx", 0, "", "");
					//draw the medicine
					drawRxMedicineList("#dash-prescription-medicine-list-div", prescription_items);

					//hide buttons
					$("#emedical-certificate-content, #ereferral-request-content, #dash-standard-buttons").hide();
					//$("#dash-prescription-buttons").hide();
					$("#dash-standard-buttons").show();

                    //$("#additional-info").hide();
                    $("#dash-prescription-buttons, #dash-preview-buttons").hide();
                    $("#ereferral-request-content").hide();

                    $("#eprescription-content").show();
                    $("#eprescription-footer-content").css('visibility','hidden')

				}

			}else{

				showToastNotification("Search Error", message);

				//access token error, redirect to login
				if(typeof data.actokenerror && data.actokenerror){
					setTimeout(function(){
						window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
					}, 3000);
				}

			}

		},
		error: function (error) {
			showToastNotification("ePrescription API Error", error);
		}
	});

}
function setPatientDetails() {
    let name = $("#patient-fullname").text();
    let age_gender =     $("#patient-age").text() +"/"+ $("#patient-gender").text();
    $("#dash-order-template-patient").text(name);
    $("#dash-order-template-age").text(age_gender);
    $("#dash-order-template-address").text( $("#patient-address").text() );

    let image_url = $("#patient-profile-image").attr("src");
    $("#print-patient-dp").attr("src",image_url);

}

function setDoctorDetails() {
    get_clinic_form_header();

    is_logged_in(session_table, false).then((prof_data) => {

        if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

            let doctor_data = prof_data[0];

            $("#header-doctor-name").text(doctor_data.first_name + " "+ doctor_data.last_name + " "+ doctor_data.title);
            $("#header-doctor-address").text("");

            $("#doctor_license_no").text("LIC NO: "+ doctor_data.license_number);
            $("#doctor_ptr_no").text("PTR NO: "+ doctor_data.ptr_number);
            $("#sig_no_2").text("S2 NO: "+ doctor_data.sig2_number);
            $("#doctor-sig").attr("src",doctor_data.signature);
		}else{
			forceLogout();
		}

    });



}

function requestMedicalCerfiticateData(medical_id) {

	menu("eprescription-menu-wizard-rx", "show", 250);
    $("#print-patient-dp").attr("src","");
    $("#additional-info").hide();
    $("#dash-prescription-buttons, #dash-preview-buttons").hide();
    $(".medical-form").hide();
    $("#eprescription-footer-content").css('visibility','hidden');

	//added by emrick 9/5/2024
	$("#inserted_id").val(medical_id);
	$("#mdorder_type").val(2);

	let data = {
		"keyword": "get-doctor-medical-certificate",
		"medical_id": medical_id,
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
			let medcert_data = data.json;
            //console.log(medcert_data);

			if(status == "success"){

                let static_json_data = {};
                if(medcert_data.static_pdf_info!= ""){
                    static_json_data = JSON.parse(medcert_data.static_pdf_info);
                }
                let patient_info = static_json_data.patient;
                let doctor_info = static_json_data.doctor;

                drawPatientInfo(patient_info);
                drawDoctorInfo(doctor_info)

				let diagnosis = medcert_data.diagnosis_txt;
				let medcert_remarks = medcert_data.remarks
				medcert_remarks = medcert_remarks.length > 0 ? medcert_remarks + "<br><br>" : "";
				//let day_rest_int = parseInt(medcert_data.no_rest_days);
				let day_rest = medcert_data.no_rest_days ; //day_rest_int > 1 ? day_rest_int + " days" : "1 day";
				let date_created_readable = medcert_data.date_created_readable;
				let date_medication_label = medcert_data.date_medication_label;
				let date_created = "<b>Date: </b>"+date_created_readable;

				$("#medcert-diagnosis").text(diagnosis);
				$("#medcert-remarks").html(medcert_remarks);
				$("#medcert-day-rest").text(day_rest);
				$("#medcert-consultation-date").html(date_created);
				$("#medical-cert-consultation-date-label").text(date_medication_label);
                $("#dash-standard-buttons").show();
                $("#emedical-certificate-content").show();

			}else{
				showToastNotification("Error!", message);
				if(typeof data.actokenerror && data.actokenerror){
					setTimeout(function(){
						window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
					}, 3000);
				}

			}

		},
		error: function (error) {
			console.log(error);
			showToastNotification("Error!", error);
		}
	});
}


function requestLabRequestData(lab_request_id) {

    $("#eprescription-content").hide();
    $("#additional-info").hide();
    $("#dash-prescription-buttons, #dash-preview-buttons").hide();
    $("#emedical-certificate-content").hide();
    $("#ereferral-request-content").hide();
    $("#dash-standard-buttons").show();
    $("#print-patient-dp").attr("src","");

	//added by emrick 9/5/2024
	$("#inserted_id").val(lab_request_id);
	$("#mdorder_type").val(1);

	menu("eprescription-menu-wizard-rx", "show", 250);

	let data = {
		"keyword": "get-doctor-lab-request-data",
		"lab_request_id": lab_request_id,
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
			let medcert_data = data.json;

			if(status == "success"){

                let static_json_data = {};
                if(medcert_data.static_pdf_info!= ""){
                    static_json_data = JSON.parse(medcert_data.static_pdf_info);
                }
                let patient_info = static_json_data.patient;
                let doctor_info = static_json_data.doctor;

                drawPatientInfo(patient_info);
                drawDoctorInfo(doctor_info)

				let diagnosis = medcert_data.diagnosis;
				let remarks = medcert_data.remarks
                if(remarks.length > 0){
                    remarks = "remarks: "+remarks;
                }


				let date_created_readable = medcert_data.created_date_readable;
				let date_created = "<b>Date: </b>"+date_created_readable;

	             $("#labrequest-consultation-date").html(date_created);


                $("#lab-request-diagnosis").html("Impression: "+diagnosis);
                $("#lab-diagnosis-remarks").html(remarks);

                let lab_test = "";
                let remark_lab_test = "";

                $.each(data.json.lab_test, function(key, value){
                    if(lab_test != ""){
                        lab_test += ", "+value.name;
                    } else {
                        lab_test += "For "+ value.name;
                    }
                });

                $("#lab-test-request").html(lab_test);
                $("#emedical-lab-request-content").show();
                $("#eprescription-footer-content").css('visibility','visible')

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
			console.log(error);
			showToastNotification("Error!", error);
		}
	});
}


function requestLabResultData(id) {

	let data = {
		"keyword": "get-medical-attachement",
        "module": "Laboratory-Result",
		"attachement_id": id,
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
			let attachment_data = data.json;


			if(status == "success"){
                drawAttachment(attachment_data);
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
			console.log(error);
			showToastNotification("Error!", error);
		}
	});
}

function drawAttachment(data) {

    var container = $("#attachment-container");
    container.html("");
    $.each(data, function(key, value){
        var item_html = "";
        var attachement_uri = baseAppUrl + "upload/dropzone/"+value.complete_path;
        if(value.extension == "pdf"){
            var icon =  baseAppUrl + "/hxassets/hximages/icons/pdf.png"
            item_html += '<a class="attachment-record col mb-4" href="'+attachement_uri+'" title=" " target="_blank">'+
                '<img src="'+icon+'" class="rounded-m preload-img shadow-l img-fluid img-attachement" alt="img">'+
            '</a>';

        } else {
            item_html = '<a class="attachment-record col mb-4" data-gallery="gallery-1" href="'+attachement_uri+'" title=" ">'+
                '<img src="'+attachement_uri+'" data-src="'+attachement_uri+'" class="rounded-m preload-img shadow-l img-fluid img-attachement" alt="img">'+
            '</a>';

        }
        container.append(item_html);

    });

    var lightbox = GLightbox({
        closeOnOutsideClick: false,
        zoomable:false,
        descPosition:'bottom',
        selector: '[data-gallery]',
        openEffect: 'fade',
        closeEffect: 'fade',
        dragAutoSnap:true,
    });

}

function requestReferralData(medical_id) {

	//added by emrick 9/5/2024
	$("#inserted_id").val(medical_id);
	$("#mdorder_type").val(3);

	menu("eprescription-menu-wizard-rx", "show", 250);

	let data = {
		"keyword": "get-doctor-referral-request",
		"medical_id": medical_id,
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
			let referral_request_data = data.json;
			if(status == "success"){

                let static_json_data = {};
                if(referral_request_data.static_pdf_info!= ""){
                    static_json_data = JSON.parse(referral_request_data.static_pdf_info);
                }
                let patient_info = static_json_data.patient;
                let doctor_info = static_json_data.doctor;

                drawPatientInfo(patient_info);
                drawDoctorInfo(doctor_info)

				let diagnosis = referral_request_data.diagnosis_txt;
				let remarks = referral_request_data.remarks;
				let refer_to = referral_request_data.refer_to;
				let consultation_date_val = referral_request_data.medrecord_date_formatted;
				let date_created = referral_request_data.created_date_formatted;
				let created_date_html = "<b>Date: </b>" + referral_request_data.created_date_readable;

				$("#refer-to").text(refer_to);
            	$("#referral-diagnosis").text(remarks);
                $("#referral-remarks").html(diagnosis + "<br><br>");
                $("#ereferral-date").html(created_date_html);

				$("#eprescription-content").hide();
				$("#additional-info").hide();
				$("#dash-prescription-buttons, #dash-preview-buttons").hide();
				$("#emedical-certificate-content").hide();
                $("#ereferral-request-content").hide();
                $("#emedical-lab-request-content").hide();
                $("#ereferral-request-content").show();
                $("#dash-standard-buttons").show();

                $("#eprescription-footer-content").css('visibility','hidden')
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
			console.log(error);
			showToastNotification("Error!", error);
		}
	});
}

function drawClinicForm(clinics) {
    let clinic_html = "";

    if( !$.isEmptyObject(clinics) ){
        clinicData = clinics;
        $.each(clinics, function(key, value){

            var clinic_id = value.clinic_id;
            var clinic_name = value.clinic_name;
            var doctor_clinic_id = value.PK;
            var clinic_address = value.clinic_address;
            var phone_number = value.phone_number;

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

            var schedule_label = value.schedule_label;


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

            let contact_html  = "";
            if(typeof phone_number !="undefined" && phone_number !=""){
                contact_html = '<p class="pb-0">Contact: '+phone_number+'</p>';
            }

            clinic_html += '<div class="clinic-item col-4 mt-2">'+
                '<h5 class="mb-0">'+titleCase(clinic_name)+'</h5>'+
                '<p class="pb-0">'+titleCase(clinic_address)+'</p>'+
                '<p class="pb-0">'+titleCase(schedule_label)+'</p>'+
                contact_html+
            '</div>';
        });
    }
    $("#clinic-list").html(clinic_html);

}

function drawPatientInfo(patient_info) {
    let patient_age = 0
    if(typeof (patient_info.age) !== "undefined"){
        patient_age = patient_info.age;
    }

    let patient_gender = patient_info.gender;
    let patient_name = patient_info.first_name + " " + patient_info.last_name;
    let patient_age_gender = patient_age + "/" + patient_gender;
    let patient_address = patient_info.address;

    $("#dash-order-template-patient").text(patient_name);
    $("#dash-order-template-age").text(patient_age_gender);
    $("#dash-order-template-address").text(patient_address);
    $("#medcert-patient-name").text(patient_name);
    $("#patient-age-gender").text(patient_age);
    $("#print-patient-dp").attr("src",patient_info.picture_path);
}

function drawDoctorInfo(doctor_info) {
    let doctor_first_name = doctor_info.first_name;
    let doctor_last_name = doctor_info.last_name;
    let docttor_title = doctor_info.title;

    $("#doctor_license_no").text("LIC NO: "+ doctor_info.license_no);
    $("#doctor_ptr_no").text("PTR NO: "+ doctor_info.ptr_no);
    $("#sig_no_2").text("S2 NO: "+ doctor_info.sig_2_no);
    $("#doctor-sig").attr("src",doctor_info.signature);

    $("#header-doctor-name").text(doctor_first_name + " "+ doctor_last_name + " "+ docttor_title);
    $("#header-doctor-address").text(doctor_info.address);
    $("#doctor_name").text(doctor_last_name +", "+ doctor_first_name + " "+docttor_title);
    drawClinicForm(doctor_info.clinic);
}


//added by emrick 9/5/2024
function viewpdf(inserted_id,formal_id,md_type){


    let data = {
        "keyword": "pdf-mdorders-view",
        "formal_id": formal_id,
        "inserted_id": inserted_id,
        "md_type": md_type,
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
        success : function (data) {

            let status = data.status;
            let message = data.message;
            //let patient_info = data.json;

            //console.log(patient_info);patient_info
			 // Create a URL for the blob
			 let url = URL.createObjectURL(data);

			 // Create a modal for the PDF preview
			 let modal = document.createElement('div');
			 modal.style.position = 'fixed';
			 modal.style.top = '0';
			 modal.style.left = '0';
			 modal.style.width = '100%';
			 modal.style.height = '100%';
			 modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
			 modal.style.zIndex = '1000';
			 modal.style.display = 'flex';
			 modal.style.justifyContent = 'center';
			 modal.style.alignItems = 'center';
	 
			 let iframe = document.createElement('iframe');
			 iframe.src = url;
			 iframe.style.width = '80%';
			 iframe.style.height = '80%';
			 iframe.style.border = 'none';
	 
			 let closeButton = document.createElement('button');
			 closeButton.textContent = 'Close';
			 closeButton.style.position = 'absolute';
			 closeButton.style.top = '20px';
			 closeButton.style.right = '20px';
			 closeButton.style.padding = '10px 20px';
			 closeButton.style.backgroundColor = 'white';
			 closeButton.style.border = 'none';
			 closeButton.style.cursor = 'pointer';
	 
			 closeButton.onclick = function() {
				 document.body.removeChild(modal);
				 URL.revokeObjectURL(url); // Clean up the URL object
			 };
	 
			 modal.appendChild(iframe);
			 modal.appendChild(closeButton);
			 document.body.appendChild(modal);
            console.log(data);

           

        },
        error: function (error) {
            showToastNotification("Error!", error);
        }
    });

}
