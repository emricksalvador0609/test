var lab_order_arr = [];
$(document).ready(function(){

	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){
		 	//bypass
		 	//getLaboratoryOrders();
            active_clinic_id = prof_data[0].active_clinic;

            getDoctorClinicPopup();

		}else{
			forceLogout();
		}
	});

	$("#new-medical-record").click(function(){
        //check if there is an active_clinic first_name

        if(active_clinic_id != "0"){
            showModalNotification("new-medical-record-wizard-1", 300, "", "");
        } else {
            showToastNotification("Error", "Please select an active clinic first, Thank you");
            menu("menu-select-clinic", "show", 500)
        }

	});

    $("#next-clinic-popup").click(function(){

        if(active_clinic_id != "0"){
            menu("menu-select-clinic", "close", 0)
            showModalNotification("new-medical-record-wizard-1", 300, "", "");
        } else {
            menu("menu-select-clinic", "show", 0)
            showToastNotification("Error", "Please select an active Clinic first, Thank you");
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

	//Show MD Orders List
	$(document).on("click", ".dash-medical-record-add-order", function(){
        if (active_clinic_id == "0" || active_clinic_id=="") {
            showToastNotification("Error", "No active clinic has bee selected yet. Kindly go to profile","error");
            return false;
        }
		let medical_record_id = $(this).attr("medical-record-id");
		let medical_record_diagnosis = $(this).attr("medical-record-diagnosis");
		let medical_record_date = $(this).attr("medical-record-date");
        let is_latest = $(this).attr("is-latest");

        if(is_latest == 1){
            $("#dash-medical-record-eprescription, #dash-medical-record-laboratory-request, #dash-medical-record-medical-certificate, #dash-medical-record-referral-letter").show();
        } else {
            $("#dash-medical-record-eprescription, #dash-medical-record-laboratory-request, #dash-medical-record-medical-certificate, #dash-medical-record-referral-letter").hide();
        }

		$("#medical-id-hidden").val(medical_record_id);
		$("#medical-record-diagnosis-hidden").val(medical_record_diagnosis);
		$("#medical-record-date-hidden").val(medical_record_date);

		let ePrescriptionHref = encodeURI("?hxcurrentpage=dash-prescription&medicalRecId=" + medical_record_id + "&patientFormalId=" + $("#dash-patient-formal-id").val() + "&patientId=" + $("#dash-patient-id").val() + "&patientName=" + $("#patient-fullname").text());
		$("#dash-medical-record-eprescription").attr("href", ePrescriptionHref);

		showModalNotification("menu-order-list", 0, "", "");
	});

	//Show Vital Signs Form
	$("#dash-medical-record-vital-stats").click(function(){

		menu("menu-order-list", "close", 0)

		// showModalNotification("dash-medical-record-vital-stats-form", 300, "", "");
		$('#dash-medical-record-vital-stats-form').modal('show');
	});


	//SEARCH DIAGNOSIS - START
	var typingTimer;                //timer identifier
	var doneTypingInterval = 2000;  //time in ms, 2 seconds for example
	$("#dash-medrecord-search-diagnosis-loader").hide(); //hide loader

	//on keyup, start the countdown
	$(document).on("keyup", "#dash-medrecord-search-diagnosis", function(){

		clearTimeout(typingTimer);
  		typingTimer = setTimeout(doneTyping, doneTypingInterval);

  		$("#dash-medrecord-search-diagnosis-loader").show();
	 	$("#dash-medrecord-searched-diagnosis-result").addClass("disabled-search-list");
	 	$("#dash-medrecord-searched-diagnosis-empty").addClass("disabled");
	});

	//on keydown, clear the countdown
	$(document).on("keydown", "#dash-medrecord-search-diagnosis", function(){
		clearTimeout(typingTimer);
	});

	//user is "finished typing," do something
	function doneTyping () {

	 	let diagnosis_search_str = $("#dash-medrecord-search-diagnosis").val();

	 	//hide keyboard
	 	hideKeyboard();

	 	if(diagnosis_search_str.length <= 0){
			$("#dash-medrecord-search-diagnosis-loader").hide();
			$("#dash-medrecord-searched-diagnosis-result").addClass("disabled-search-list");
			$("#dash-medrecord-searched-diagnosis-empty ").addClass("disabled");
			return false;
		 }

	 	//trigger search diagnosis
	 	search_diagnosis(diagnosis_search_str);
	}

	$(document).on("click", ".dash-medrecord-search-diagnosis", function(){

		let curr_patient_name = $(this).find(".dash-prescription-curr-patient-name").text();
		selected_patient_id = $(this).attr("curr-patient-id");
		selected_patient_formalid = $(this).attr("curr-formal-id");

		showModalNotification("eprescription-menu-wizard-2", 0, curr_patient_name, "");

		//add datepicker
		createDatePicker(".date-picker");
	});


	function search_diagnosis(_val){

		let data = {
			"keyword": "search-medical-record-diagnosis",
			"diagnosis_str": _val,
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

				$("#dash-medrecord-search-diagnosis-loader").hide();
				$("#dash-medrecord-searched-diagnosis-empty ").addClass("disabled");

				if(status == "success"){

					let res_html = "";

					if( !$.isEmptyObject(resJson) ){
						$.each(resJson, function(key, value){

							res_html +=	'<a href="#" class="dash-medrecord-curr-diagnosis" curr-diagnosis-id="'+value['icd_code']+'" curr-diagnosis-name="'+value['description']+' ('+value['icd_code']+')">';
				            res_html +=	'	<i class="fab color-gray-dark"></i>';
				            res_html +=	'	<span class="dash-medrecord-curr-diagnosis-name">'+value['description']+' ('+value['icd_code']+')</span>';
				            res_html +=	'	<strong>Info: '+value['name']+'</strong>';
				            res_html +=	'</a>';
						});

						$("#dash-medrecord-searched-diagnosis-result").removeClass("disabled-search-list").children("div").html(res_html);

					}else{
						$("#dash-medrecord-searched-diagnosis-empty").removeClass("disabled");
					}

				}else{

					showToastNotification("Search Error", message);

					//access token error, redirect to login
					if(typeof data.actokenerror && data.actokenerror){
						setTimeout(function(){
							window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
						}, 3000);
					}

					$("#dash-medrecord-searched-diagnosis-result").addClass("disabled-search-list");
				}


			},
			error: function (error) {
				$("#dash-medrecord-search-diagnosis-loader").hide();
				$("#dash-medrecord-searched-diagnosis-result").addClass("disabled-search-list");
				$("#dash-medrecord-searched-diagnosis-empty ").addClass("disabled");
				showToastNotification("Diagnosis Search API Error", error);
			}
		});
	}

	var curr_medrecord_diagnosis_ctr = 0;
	$(document).on("click", ".dash-medrecord-curr-diagnosis", function(){

		let diagnosis_code = $(this).attr("curr-diagnosis-id");
		let diagnosis_name = $(this).attr("curr-diagnosis-name");

		if($("#diagnosis-code-" + diagnosis_code).length){
			return false;
		}

		let html = draw_medrecord_diagnosis(curr_medrecord_diagnosis_ctr, diagnosis_code, diagnosis_name);

		$("#dash-medrecord-selected-diagnosis-list").append(html);

		//reset
		$("#dash-medrecord-search-diagnosis").val("").focus();
		$("#dash-medrecord-search-diagnosis-loader").hide();
		$("#dash-medrecord-searched-diagnosis-result").addClass("disabled-search-list");
		$("#dash-medrecord-searched-diagnosis-empty ").addClass("disabled");

		curr_medrecord_diagnosis_ctr++;
	});
	//SEARCH DIAGNOSIS - END

	//MEDICAL RECORD - START
	var is_processing_medrec = false;
	$("#dash-medical-record-confirm-save").click(function(){

		let _this = $(this);
		let _old_text = _this.text();

		let medrec_patient_id = $("#dash-patient-id").val();
		let medrec_chief_complaint = $("#dash-medrecord-chief-complaint").val();
		let medrec_history = $("#dash-medrecord-history").val();
		let medrec_remark = $("#dash-medrecord-remark").val();
		let medrec_doctor_note = $("#dash-medrecord-doctor-note").val();
		let medrec_diagnosis = []; //$("#dash-medrecord-diagnosis").val();
		let medrec_diagnosis_code = [];
		let medrec_plan = $("#dash-medrecord-plan").val();
		let medrec_ffup_date = $("#dash-medrecord-ffup-date").val();

		//process selected diagnosis
		$("#dash-medrecord-selected-diagnosis-list").find(".searched-diagnosis").each(function(){

			if( $(this).is(':checked') ){
				medrec_diagnosis.push($(this).val());
				medrec_diagnosis_code.push($(this).attr("curr-diagnosis-code"));
			}
		});

		if(is_processing_medrec){
			return false;
		}

		if(medrec_chief_complaint.length <= 0 || medrec_diagnosis.length <= 0){
			showToastNotification("Error!", "Chief Complaint and Diagnosis are required.");
			return false;
		}

		is_processing_medrec = true;
		_this.text("Processing...").attr("disabled", true);

		let data = {
			"keyword": "save-patient-medical-record",
			"medrec_patient_id": medrec_patient_id,
			"medrec_chief_complaint": medrec_chief_complaint,
			"medrec_history": medrec_history,
			"medrec_remark": medrec_remark,
			"medrec_diagnosis": medrec_diagnosis,
			"medrec_diagnosis_code": medrec_diagnosis_code,
			"medrec_plan": medrec_plan,
			"medrec_doctor_note": medrec_doctor_note,
			"medrec_ffup_date": medrec_ffup_date,
            "clinic_id":active_clinic_id,
			"actokensec": actokensec,
		};

		let jwt_data = jwt_encode(data);

		$.ajax({
			url: baseApiUrl,
			cache: false,
			type: "POST",
			data: jwt_data,
			beforeSend: function (xhr) {
				xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));
			},
			success : function (data) {

				is_processing_medrec = false;

				let status = data.status;
				let message = data.message;

	 			if(status == "success"){

					showToastNotification("Successful!", message);

					//get updated med record
					getPatientMedicalRecord(medrec_patient_id);

					menu("new-medical-record-wizard-1", "hide", 0);

				 } else {
					 showToastNotification("Error!", message);
				 }

 				 _this.text(_old_text).attr("disabled", false);

			},
			error: function (error) {
				is_processing_medrec = false;
				showToastNotification("Error!", error);
 				_this.text(_old_text).attr("disabled", false);
			}
		});

	});
	//MEDICAL RECORD - END

});

function getPatientMedicalRecord(patient_id){

	let data = {
		"keyword": "patient-medical-record-list",
		"patient_id": patient_id,
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
			let medrec_info = data.json;
			let medrec_html = "";

			if(status == "success"){

				if( !$.isEmptyObject(medrec_info) ){

					$.each(medrec_info, function(key, value){

						let medical_record_id = value['PK'];
                        let vital_signs = value['vital_signs'];

						medrec_html += '';
						medrec_html += '<div class="mb-0 soap-container">';
	                    medrec_html += '    <button class="btn ps-0 pe-0 accordion-btn color-theme no-effect" data-bs-toggle="collapse" data-bs-target="#collapse'+key+'" aria-expanded="false">';
	                    medrec_html += '        '+value['createdDate']+' - '+value['clinic_name'];
	                    medrec_html += '        <br>';
	                    medrec_html += '        <small class="text-muted accordion-diagnosis">'+value['diagnosis']+'</small>';
	                    medrec_html += '        <i class="fa fa-chevron-down font-10 accordion-icon" style="margin-top: -5px;"></i>';
	                    medrec_html += '    </button>';
	                    medrec_html += '    <div id="collapse'+key+'" class="collapse w-100" data-parent="#accordion-1">';
	                    medrec_html += '        <div class="pt-1 pb-2 row mb-0">';

                        //medrec_html += '<div class="mb-0 soap-container">';
	                    medrec_html += '<b class="vital-signs-label">Vital Signs:</b> ';
					    medrec_html += drawVitalSign(vital_signs);

	                    medrec_html += '            <div class="row justify-content-center pb-1 mb-n1">';

                        if(value['show_soap'] == 1){
                            medrec_html += '                <p class="soap-item mt-n1 line-height-m">';

                            medrec_html += '<b>SOAP:</b> ';

                            if(value['chief_complaint'].length > 0){
                               medrec_html += '                    <br><b>Chief Complaint:</b><br> ' + value['chief_complaint'];
                           }

                           if(value['history_of_present_illness'].length > 0){
                               medrec_html += '                    <br><b>History:</b><br> ' + value['history_of_present_illness'];
                           }
                           if(value['remark'].length > 0){
                               medrec_html += '                    <br><b>Findings:</b><br> ' + value['remark'];
                           }

                           if(value['plan'].length > 0){
                               medrec_html += '                    <br><b>Plan:</b><br> ' + value['plan'];
                           }

                           if(value['doctors_note'].length > 0){
                               medrec_html += '                    <br><b>Note:</b><br> ' + value['doctors_note'];
                           }

                           if(value['followup_date'].length > 0 && value['followup_date'] != "0000-00-00"){
                               medrec_html += '                    <br><b>Next Follow-up:</b><br> ' + value['followup_date'];
                           }

                            if(value['chief_complaint'].length > 0){
                                medrec_html += '<br><b><i class="fa fa-print print-soap" aria-hidden="true"></i></b><br> ';
                            }

                            medrec_html += '</p>';

                        }




				        //MD ORDERS - START
                        medrec_html += '<div class="md-orders mt-2" >';
				        if( !$.isEmptyObject(value['mdorders']) ){

				        	medrec_html += '                    <b>MD Orders:</b> ';

				        	//loop thru each mdorders
				        	$.each(value['mdorders'], function(mdkey, mdvalue){

								if(mdvalue['mdordertype'] == 'ePrescription'){
									medrec_html += '                	<br><span class="badge text-uppercase px-2 py-1 bg-green-dark show-template-eprescription" medical-eprescription-id="'+mdvalue['PK']+'">ePrescription</span>';
				        			medrec_html += '					<span class="color-theme font-11 ps-2 opacity-50">'+mdvalue['labelCreatedDate']+'</span>';
								}

								if(mdvalue['mdordertype'] == 'eLabRequest'){
									medrec_html += '                	<br><span class="badge text-uppercase px-2 py-1 bg-blue-dark show-template-lab-request" medical-laboratory-request-id="'+mdvalue['PK']+'">Laboratory Request</span>';
				        			medrec_html += '					<span class="color-theme font-11 ps-2 opacity-50">'+mdvalue['labelCreatedDate']+'</span>';
								}

								if(mdvalue['mdordertype'] == 'eMedCertificate'){
									medrec_html += '                	<br><span class="badge text-uppercase px-2 py-1 bg-red-dark show-template-medical-certificate" medical-certificate-id="'+mdvalue['PK']+'">Medical Certificate</span>';
				        			medrec_html += '					<span class="color-theme font-11 ps-2 opacity-50">'+mdvalue['labelCreatedDate']+'</span>';
								}

								if(mdvalue['mdordertype'] == 'eRefLetter'){
									medrec_html += '                	<br><span class="badge text-uppercase px-2 py-1 bg-yellow-dark show-template-referral-request" medical-referral-letter-id="'+mdvalue['PK']+'">Refferral Letter</span>';
				        			medrec_html += '					<span class="color-theme font-11 ps-2 opacity-50">'+mdvalue['labelCreatedDate']+'</span>';
								}

                                if(mdvalue['mdordertype'] == 'eLabResult'){
									medrec_html += '                	<br><span class="badge text-uppercase px-2 py-1 bg-magenta-light show-template-lab-result" medical-laboratory-result-id="'+mdvalue['PK']+'">Lab result</span>';
				        			medrec_html += '					<span class="color-theme font-11 ps-2 opacity-50">'+mdvalue['labelCreatedDate']+'</span>';
								}
							});
				        }
				        //MD ORDERS - END

                        medrec_html += '                </div>';
                    //    medrec_html += '                </p>';
                        if(value['show_soap'] == 1){
                            medrec_html += '                <a href="javascript:void(0);" class="btn btn-xxs btn-border btn-m mt-3 mb-3 rounded-sm text-uppercase border-blue-dark color-blue-dark bg-theme dash-medical-record-add-order btn-outline-primary" style="width: 60%;" medical-record-id="'+medical_record_id+'" medical-record-diagnosis="'+value['diagnosis']+'" medical-record-date="'+value['ymd_createdDate']+'"   is-latest="'+value['is_latest']+'">';
    						medrec_html += '					Add MD Order';
    						medrec_html += '				</a>';
                        }


					    medrec_html += '            </div>';
	                    medrec_html += '            ';
	                    medrec_html += '        </div>';
	                    medrec_html += '    </div>';
	                    medrec_html += '</div>';

					});

				}else{
					showToastNotification("Information!", message);
				}

				$("#medical-records").find("#accordion-1").html(medrec_html);

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

function drawVitalSign(vital_signs){

    let bp = "";
    if(typeof vital_signs.blood_pressure_systolic != "undefined" && typeof vital_signs.blood_pressure_diastolic != "undefined"){
        bp = vital_signs.blood_pressure_systolic + "/" + vital_signs.blood_pressure_diastolic;
    }

    let respiratory_rate  = "";
    if(typeof vital_signs.respiratory_rate != "undefined" ){
        respiratory_rate = vital_signs.respiratory_rate;
    }

    let heart_rate  = "";
    if(typeof vital_signs.heart_rate != "undefined" ){
        heart_rate = vital_signs.heart_rate;
    }

    let temperature  = "";
    if(typeof vital_signs.temperature != "undefined" ){
        temperature = vital_signs.temperature;
    }

    let weight  = "";
    if(typeof vital_signs.weight != "undefined" ){
        weight = vital_signs.weight;
    }

    let saturation  = "";
    if(typeof vital_signs.saturation != "undefined" ){
        saturation = vital_signs.saturation;
    }

    let height  = "";
    if(typeof vital_signs.height != "undefined" ){
        height = vital_signs.height;
    }

    let bmi_classification  = "";
    if(typeof vital_signs.bmi_classification != "undefined" ){
        bmi_classification = '('+vital_signs.bmi_classification+')';
    }

    let bmi_value  = "";
    if(typeof vital_signs.bmi_value != "undefined" ){
        bmi_value = vital_signs.bmi_value;
    }

	let html = '';
    html += '	 	 <div class="vital-signs row mb-0">';
	html += '	 	 <div class="col-4">';
    html += '            <p class="font-300 color-theme">Blood Pressure (mmHg):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+bp+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">Heart Rate (bpm):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+heart_rate+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">Temperature (°C):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+temperature+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">O2 Saturation (%):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+saturation+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">Resp Rate (cpm):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+respiratory_rate+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">Height (m):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+height+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">Weight (kg):</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+weight+'</p>';
    html += '        </div>';

    html += '        <div class="col-4">';
    html += '            <p class="font-300 color-theme">BMI:</p>';
    html += '        </div>';
    html += '        <div class="col-2">';
    html += '            <p>'+bmi_value+' <span>'+bmi_classification+'</span></p>';
    html += '        </div>';
    html += '        </div>';

    return html;

}

function draw_medrecord_diagnosis(key, code, name){

	let html = '';

	html += '<div class="form-check interest-check" id="diagnosis-code-'+code+'">';
	html += '	<input class="form-check-input searched-diagnosis" type="checkbox" value="'+name+'" curr-diagnosis-code='+code+' id="diagnosis-'+key+'" checked>';
	html += '	<label class="form-check-label shadow-xl rounded-xl" for="diagnosis-'+key+'">'+name+'</label>';
	html += '	<i class="fa fa-check-circle color-white font-18"></i>';
	html += '	<i class="fa fa-plus font-17 color-blue-dark"></i>';
	html += '</div>';

	return html;
}


function getDoctorClinicPopup(){

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

                    $.each(clinics, function(key, value){
                        var checked = "";


                        clinic_html += '<a href="javascript:void(0)">';

	                    clinic_html += '    <span>'+value['clinic_name']+'</span>';
	                    clinic_html += '    <div class="custom-control scale-switch ios-switch clinic-toggle-popup">';
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
								is_online_sunday:is_online_sunday
						}
						dataInsert.push(objClinic)
					});
					jsstoresqlite_clear_table("health_xense_clinic_schedule_table");
					insertClinicIndexDb( dataInsert);
				}
				$("#dash-popup-clinic-div").html(clinic_html);
			}else{
				showToastNotification("Error!", message);
			}

		},
		error: function (error) {
			showToastNotification("Error!", error);
		}
	});

}
