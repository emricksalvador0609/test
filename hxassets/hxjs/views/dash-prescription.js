let doctorSessionData = "";
var selected_medrecord_id = 0;
var selected_patient_id = 0;
var selected_patient_formalid = "";
var doctor_prod_data = null;

$(document).ready(function(){



//$('#hider').css("z-index","111");

    $("#show-prescription-wizard").click( function(event) {
        $('#hider').css("z-index","0");
        let prescription_list_html = $("#dash-prescription-card-medication-list").html();
        let prescription_count = $("#dash-prescription-card-medication-list .dash-prescription-card-medication").length;

        if(prescription_count <= 0){
            let medication_card = draw_medication_card(false);
            $("#eprescription-menu-wizard-2").find("#dash-prescription-card-medication-list").append(medication_card);
        }
    })

    $("#hider").click( function(event) {
        $('#hider').css("z-index","0");
        var delete_is_active = $("#menu-confirm").hasClass("menu-active");
        if(delete_is_active){
            initPrescription();
        }

        event.preventDefault();
        return false;
    })
	is_logged_in(session_table, false).then((prof_data) => {

		//if patient info was set
		let patient_formal_id = getUrlParameter('patientFormalId');
		selected_medrecord_id = getUrlParameter('medicalRecId');

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

			doctor_prod_data = prof_data;
            doctorSessionData = prof_data[0];

		 	if(patient_formal_id.length > 0){

				// let curr_patient_name = getUrlParameter('patientName');
				// selected_patient_id = getUrlParameter('patientId');
				// selected_patient_formalid = patient_formal_id;
                //
				// showModalNotification("eprescription-menu-wizard-2", 0, curr_patient_name, "");

                initPrescription();

				//add datepicker
				createDatePicker(".date-picker");
			}else{
				getPrescriptionList();
			}

		}else{
			forceLogout();
		}
	});

    function initPrescription(){
        let patient_formal_id = getUrlParameter('patientFormalId');
        selected_medrecord_id = getUrlParameter('medicalRecId');

        let curr_patient_name = getUrlParameter('patientName');
        selected_patient_id = getUrlParameter('patientId');
        selected_patient_formalid = patient_formal_id;

        showModalNotification("eprescription-menu-wizard-2", 0, curr_patient_name, "");

    }

	//PRESCRIPTION LIST - START
	function getPrescriptionList(){

		let activity_range = $("#dash-prescription-activity-range").val();

		let data = {
			"keyword": "doctor-patient-prescription-list",
			"activity_range": activity_range,
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

				//console.log(resJson);

				if(status == "success"){

					let res_html = "";

					if( !$.isEmptyObject(resJson) ){
						$.each(resJson, function(key, value){

							res_html +=	'<div class="d-flex dash-prescription-view-rx" prescription-id='+value['PK']+'>';
			                res_html +=	'    <div class="align-self-center">';
			                res_html +=	'        <h5 class="font-600 font-14 mb-n2 mt-0">'+value['patient_first_name']+'</h5>';
			                res_html +=	'        <span class="color-theme font-11">'+value['ref_no']+' | '+value['clinic_name']+'</span>';
			                res_html +=	'    </div>';
			                res_html +=	'    <div class="align-self-center ms-auto">';
			                res_html +=	'        <h5 class="color-blue-dark mb-n1 text-end">'+value['item_count']+' Medicines</h5>';
			                res_html +=	'        <span class="color-theme d-block font-11 text-end">'+value['createdDate']+'</span>';
			                res_html +=	'    </div>';
			                res_html +=	'</div>';
			                res_html += '<div class="divider mt-3 mb-3"></div>';

						});

						$("#dash-prescripion-list").html(res_html);

					}else{
						$("#dash-prescripion-list").html("<h5>No result found.</h5>");
					}

				}else{

					showToastNotification("Search Error", message);

					//access token error, redirect to login
					if(typeof data.actokenerror && data.actokenerror){
						setTimeout(function(){
							window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
						}, 3000);
					}

					$("#dash-prescripion-list").html("<h5>No result found.</h5>");
				}

			},
			error: function (error) {
				showToastNotification("Search API Error", error);
			}
		});

	}

	$(document).on("click", ".dash-prescription-view-rx", function(){

		let _prescription_id = $(this).attr("prescription-id");

		if( _prescription_id <= 0 ){
			showToastNotification("Oops!", "System cannot get the required prescription details. Please refresh the page and try again.");
			return false;
		}

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

						let prescription_items = new Array();
						let item_details = resJson[0]['item_details'];

						//console.log(item_details);

						$.each(item_details, function(key, value){

							let valueToPush = {};

							valueToPush["curr_medicine_id"] = value['prod_id'];
							valueToPush["curr_medicine_name"] = value['prod_name'];
							valueToPush["curr_medicine_generic"] = value['generic'];
							valueToPush["curr_medicine_brand"] = value['brand'];
							valueToPush["curr_medicine_dose"] = value['dose'];
							valueToPush["curr_medicine_form"] = value['form'];
							valueToPush["curr_medicine_qty"] = value['quantity'];
							valueToPush["curr_medicine_sig"] = value['note'];
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
						$("#dash-prescription-buttons").hide();
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
				$("#dash-prescription-search-patient-loader").hide();
				$("#dash-prescription-searched-patient-result").addClass("disabled-search-list");
				$("#dash-prescription-searched-patient-empty ").addClass("disabled");
				showToastNotification("Search API Error", error);
			}
		});

	});
	//PRESCRIPTION LIST - END


	//SEARCH PATIENT - START
	var typingTimer;                //timer identifier
	var doneTypingInterval = 2000;  //time in ms, 2 seconds for example
	$("#dash-prescription-search-patient-loader").hide(); //hide loader

	//on keyup, start the countdown
	$(document).on("keyup", "#dash-prescription-search-patient", function(){

		clearTimeout(typingTimer);
  		typingTimer = setTimeout(doneTyping, doneTypingInterval);

  		$("#dash-prescription-search-patient-loader").show();
	 	$("#dash-prescription-searched-patient-result").addClass("disabled-search-list");
	 	$("#dash-prescription-searched-patient-empty ").addClass("disabled");
	});

	//on keydown, clear the countdown
	$(document).on("keydown", "#dash-prescription-search-patient", function(){
		clearTimeout(typingTimer);
	});

	//user is "finished typing," do something
	function doneTyping () {

	 	let patient_search_str = $("#dash-prescription-search-patient").val();

	 	//hide keyboard
	 	hideKeyboard();

	 	//trigger search patient
	 	search_patient(patient_search_str);
	}

	$(document).on("click", ".dash-prescription-curr-patient", function(){

		let curr_patient_name = $(this).find(".dash-prescription-curr-patient-name").text();
		selected_patient_id = $(this).attr("curr-patient-id");
		selected_patient_formalid = $(this).attr("curr-formal-id");

		showModalNotification("eprescription-menu-wizard-2", 0, curr_patient_name, "");

		//add datepicker
		createDatePicker(".date-picker");
	});


	function search_patient(_val){

		let data = {
			"keyword": "search-doctor-patient",
			"patient_str": _val,
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
				let patientJson = data.json;

				$("#dash-prescription-search-patient-loader").hide();
				$("#dash-prescription-searched-patient-empty ").addClass("disabled");

				if(status == "success"){

					let patient_html = "";

					if( !$.isEmptyObject(patientJson) ){
						$.each(patientJson, function(key, value){

							patient_html +=	'<a href="#" class="dash-prescription-curr-patient" curr-patient-id="'+value['PK']+'" curr-formal-id="'+value['formal_id']+'">';
				            patient_html +=	'        <i class="fab fa-apple color-gray-dark"></i>';
				            patient_html +=	'        <span class="dash-prescription-curr-patient-name">'+value['first_name']+' '+value['last_name']+'</span>';
				            patient_html +=	'        <strong>Gender: '+value['gender']+' | Phone: '+value['phone_number']+'</strong>';
				            patient_html +=	'    </a>';
						});

						$("#dash-prescription-searched-patient-result").removeClass("disabled-search-list").children("div").html(patient_html);

					}else{
						$("#dash-prescription-searched-patient-empty").removeClass("disabled");
					}

				}else{

					showToastNotification("Search Error", message);

					//access token error, redirect to login
					if(typeof data.actokenerror && data.actokenerror){
						setTimeout(function(){
							window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
						}, 3000);
					}

					$("#dash-prescription-searched-patient-result").addClass("disabled-search-list");
				}

			},
			error: function (error) {
				$("#dash-prescription-search-patient-loader").hide();
				$("#dash-prescription-searched-patient-result").addClass("disabled-search-list");
				$("#dash-prescription-searched-patient-empty ").addClass("disabled");
				showToastNotification("Search API Error", error);
			}
		});
	}
	//SEARCH PATIENT - END


	//MEDICATION - START
	var medicard_trans_ctr = 0;

	//create first medication card div
	let medication_card = draw_medication_card(false);
	$("#eprescription-menu-wizard-2").find("#dash-prescription-card-medication-list").append(medication_card);

	//on keyup, start the countdown
	$(document).on("keyup", ".dash-prescription-search-generic", function(){

		let curr_medicard_trans_ctr = $(this).attr("curr-medical-card-id");
		let generic_search_str = $("#dash-prescription-search-generic-" + curr_medicard_trans_ctr).val();

  		if( generic_search_str.length > 0 ){

			clearTimeout(typingTimer);
  			typingTimer = setTimeout( doneTypingGeneric, doneTypingInterval, curr_medicard_trans_ctr);

	  		showLoader("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr);
	  	}
	});

	//on keydown, clear the countdown
	$(document).on("keydown", ".dash-prescription-search-generic", function(){
		clearTimeout(typingTimer);
	});

	//user is "finished typing," do something
	function doneTypingGeneric(curr_medicard_trans_ctr) {

	 	let generic_search_str = $("#dash-prescription-search-generic-" + curr_medicard_trans_ctr).val();

	 	if( generic_search_str.length <= 3 ){
			 Snackbar.show({text: 'Searching of generic medicine must be more than 3 characters.'});
			 return false;
		 }

		 //hide keyboard
	 	hideKeyboard();

	 	//trigger search patient
	 	search_generic(curr_medicard_trans_ctr, generic_search_str);
	}

	function search_generic(curr_medicard_trans_ctr, generic_search_str){

		let data = {
			"keyword": "search-doctor-medicine",
			"generic_str": generic_search_str,
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
				let resultJson = data.json;

				$("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr).html("");

				if(status == "success"){

					let generic_html = "";

					if( !$.isEmptyObject(resultJson) ){
						$.each(resultJson, function(key, value){

				            generic_html +=	'<a href="#"  class="dash-prescription-curr-medicine" curr-medical-card-id="'+curr_medicard_trans_ctr+'" curr-medicine-id="'+value['PK']+'" curr-medicine-name="'+value['name']+'" curr-medicine-generic-name="'+value['generic_name']+'" curr-medicine-brand-name="'+value['brand_name']+'" curr-medicine-dose-name="'+value['dose_name']+'" curr-medicine-form-name="'+value['form_name']+'">';
					        //generic_html +=	'    <i class="color-gray-dark"></i>';
					        generic_html +=	'    <span>'+value['name']+'</span>';
					        generic_html +=	'    <strong>'+value['generic_name']+' | '+value['brand_name']+' | '+value['dose_name']+' | '+value['form_name']+'</strong>';
					        generic_html +=	'    <i class="fa fa-angle-right"></i>';
					        generic_html +=	'</a>';
						});

						$("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr).html(generic_html);

					}else{
						$("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr).html("<h4>No Results</h4>");
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
				$("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr).html(error);
				showToastNotification("Search API Error", error);
			}
		});

	}

	$(document).on("click", ".dash-prescription-curr-medicine", function(){

		let curr_medicard_trans_ctr = $(this).attr("curr-medical-card-id");
		let curr_medicine_id = $(this).attr("curr-medicine-id");
		let curr_medicine_name = $(this).attr("curr-medicine-name");
		let curr_medicine_generic_name = $(this).attr("curr-medicine-generic-name");
		let curr_medicine_brand_name = $(this).attr("curr-medicine-brand-name");
		let curr_medicine_dose_name = $(this).attr("curr-medicine-dose-name");
		let curr_medicine_form_name = $(this).attr("curr-medicine-form-name");

		$("#medicine-id-" + curr_medicard_trans_ctr).val(curr_medicine_id);
		$("#medicine-name-" + curr_medicard_trans_ctr).val(curr_medicine_name);
		$("#medicine-generic-name-" + curr_medicard_trans_ctr).val(curr_medicine_generic_name);
		$("#medicine-brand-name-" + curr_medicard_trans_ctr).val(curr_medicine_brand_name);
		$("#medicine-dose-" + curr_medicard_trans_ctr).val(curr_medicine_dose_name);
		$("#medicine-form-" + curr_medicard_trans_ctr).val(curr_medicine_form_name);
        $("#medicine-quantity-" + curr_medicard_trans_ctr).val(1);
        //medicine-quantity-

		$("#dash-prescription-searched-generic-result-" + curr_medicard_trans_ctr).html("");

        //dash-prescription-card-medication-
        //let card_id = "dash-prescription-card-medication-"+curr_medicard_trans_ctr;
        //$("#"+card_id +" ");

	});

	$(document).on("click", "#dash-prescription-add-medication", function(){

		let medication_card = draw_medication_card(true);

		//create new div
		$("#eprescription-menu-wizard-2").find("#dash-prescription-card-medication-list").append(medication_card);

		//fix medication #
		fix_medication_card_no();

		//scroll to bottom
		$("#eprescription-menu-wizard-2").animate({ scrollTop: $("#dash-prescription-card-medication-list").height() - 500 }, 1000);

	});

	$(document).on("click", ".dash-prescription-card-medication-deletion", function(){

		let curr_medicard_trans_ctr = $(this).attr("curr-medical-card-id");
		let medication_no = $(this).parents().eq(1).find(".dash-prescription-card-medication-title").text();

		//show modal
		showModalNotification("menu-confirm", 0, "Are you sure to Remove?.", "Click Confirm to remove the " + medication_no + "?");

		//hide default buttons
		$("#menu-confirm-buttons").find(".close-menu").hide();

		let nbutton_html = '<div class="col-6">';
		nbutton_html +=	'		<a href="#" curr-medical-card-id="'+curr_medicard_trans_ctr+'" class="btn btn-sm btn-full button-s shadow-l rounded-s text-uppercase font-900 bg-blue-dark" id="dash-prescription-confirm-delete-medication">CONFIRM</a>';
		nbutton_html +=	'	</div>';
		nbutton_html +=	'	<div class="col-6">';
		nbutton_html +=	'		<a href="#" curr-medical-card-id="'+curr_medicard_trans_ctr+'" class="btn btn-sm btn-full button-s shadow-l rounded-s text-uppercase font-900 bg-red-dark" id="dash-prescription-cancel-delete-medication">CANCEL</a>';
		nbutton_html +=	'	</div>';
        $("#menu-confirm-buttons").html(""); //reset button
		$("#menu-confirm-buttons").append(nbutton_html);

        //$('.menu-hider').css("opacity","1 !important");
        $('#hider').css("z-index","111");
        //console.log($('#hider').length);


	});

	$(document).on("click", "#dash-prescription-cancel-delete-medication", function(){

		//remove buttons
		$("#dash-prescription-confirm-delete-medication, dash-prescription-cancel-delete-medication").remove();

		//show default
		$("#menu-confirm-buttons").find(".close-menu").fadeIn();

		menu("menu-confirm", "hide", 0);
	});

	$(document).on("click", "#dash-prescription-confirm-delete-medication", function(){

		let curr_medicard_trans_ctr = $(this).attr("curr-medical-card-id");

		//remove buttons
		$("#dash-prescription-confirm-delete-medication, #dash-prescription-cancel-delete-medication").remove();

		//show default
		$("#menu-confirm-buttons").find(".close-menu").fadeIn();

		menu("menu-confirm", "hide", 0);

		//remove now
		$("#dash-prescription-card-medication-" + curr_medicard_trans_ctr).remove();

		//fix medication #
		fix_medication_card_no();
	});

	function draw_medication_card(show_delete){

		let medic_html = '';
        let delete_html = '';

        if(show_delete){
            delete_html = '				<svg class="dash-prescription-card-medication-deletion" curr-medical-card-id="'+medicard_trans_ctr+'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user" data-feather-line="1" data-feather-size="40" data-feather-color="blue-dark" data-feather-bg="blue-fade-light" style="stroke-width: 1; width: 40px; height: 40px;">';
        }

		medic_html += '<div class="card card-style dash-prescription-card-medication" curr-medical-card-id="'+medicard_trans_ctr+'" id="dash-prescription-card-medication-'+medicard_trans_ctr+'">';
		medic_html += '	<div class="content pb-3">';
		medic_html += '		<div class="d-flex">';
		medic_html += '			<div class="me-auto">';
		medic_html += '				<h4 class="font-600 dash-prescription-card-medication-title">Medication# 1</h4>';
	    medic_html += '			</div>';

	    medic_html += '			<div class="ms-auto">';
		medic_html += delete_html;
		medic_html += '					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>';
		medic_html += '			    </svg>';
		medic_html += '			</div>';

		medic_html += '		</div>';
		medic_html += '		<div class="divider"></div>';

		medic_html += '		<div class="search-box search-color bg-highlight rounded-s mb-3">';
	    medic_html += '			<i class="fa fa-search"></i>';
	    medic_html += '			<input type="text" class="border-0 dash-prescription-search-generic" placeholder="Search Generic Name..." curr-medical-card-id="'+medicard_trans_ctr+'" id="dash-prescription-search-generic-'+medicard_trans_ctr+'">';
	    medic_html += '     </div>';

		medic_html += '		<div class="search-results">';
		medic_html += '			<div class="list-group list-custom-large" id="dash-prescription-searched-generic-result-'+medicard_trans_ctr+'">';
       	medic_html += '     	</div>';
       	medic_html += ' 	</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '			<input type="hidden" class="form-control" id="medicine-id-'+medicard_trans_ctr+'" readonly>';
		medic_html += '			<input type="text" class="form-control" id="medicine-name-'+medicard_trans_ctr+'" placeholder="" readonly>';
		medic_html += '			<label for="medicine-name" class="color-highlight">Name</label>';
		medic_html += '		</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '			<input type="text" class="form-control validate-name" id="medicine-generic-name-'+medicard_trans_ctr+'" placeholder="" readonly>';
		medic_html += '			<label for="medicine-generic-name" class="color-highlight">Generic Name</label>';
		medic_html += '		</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '			<input type="text" class="form-control validate-name" id="medicine-brand-name-'+medicard_trans_ctr+'" placeholder="" readonly>';
		medic_html += '			<label for="medicine-brand-name" class="color-highlight">Brand Name</label>';
		medic_html += '		</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '			<input type="text" class="form-control validate-name" id="medicine-dose-'+medicard_trans_ctr+'" placeholder="" readonly>';
		medic_html += '			<label for="medicine-dose" class="color-highlight">Dose</label>';
		medic_html += '		</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '			<input type="text" class="form-control validate-name" id="medicine-form-'+medicard_trans_ctr+'" placeholder="" readonly>';
		medic_html += '			<label for="medicine-form" class="color-highlight">Form</label>';
		medic_html += '		</div>';

		medic_html += '		<div class="input-style input-style-always-active has-borders no-icon validate-field my-4">';
		medic_html += '			<input type="number" class="form-control validate-name" id="medicine-quantity-'+medicard_trans_ctr+'" placeholder="">';
		medic_html += '			<label for="medicine-quantity" class="color-highlight">Quantity</label>';
		medic_html += '			<i class="fa fa-times disabled invalid color-red-dark"></i>';
		medic_html += '			<i class="fa fa-check disabled valid color-green-dark"></i>';
		medic_html += '			<em>(required)</em>';
		medic_html += '		</div>';


		// medic_html += '		<div class="row justify-content-center  mb-3">';
        // medic_html += '            <div class="col-12">';
		// medic_html += '				<div class="d-flex no-effect collapsed" data-trigger-switch="toggle-monday" data-bs-toggle="collapse" href="#sig-container-'+medicard_trans_ctr+'" role="button" aria-expanded="false" aria-controls="sig-container-'+medicard_trans_ctr+'">';
	    // medic_html += '                	<div class="pt-2 mt-1">';
	    // medic_html += '                    	<h5 class="font-600 font-14">Sig - Advanced Options</h5>';
	    // medic_html += '                	</div>';
	    // medic_html += '                	<div class="ms-auto me-4 pe-2">';
	    // medic_html += '                    	<div class="ios-switch">';
	    // medic_html += '                        	<input type="checkbox" class="ios-input" id="toggle-sig-'+medicard_trans_ctr+'">';
	    // medic_html += '                        	<label class="custom-control-label" for="toggle-sig-'+medicard_trans_ctr+'"></label>';
	    // medic_html += '                    	</div>';
	    // medic_html += '                	</div>';
	    // medic_html += '            	</div>';
        // medic_html += '            </div>';
        // medic_html += '        </div> ';

		medic_html += '		<div class="mb-0 collapse" id="sig-container-'+medicard_trans_ctr+'">';
		medic_html += '			<div class="row input-style input-style-always-active has-borders no-icon my-4">';
        medic_html += '            	<div class="col-4">';
		medic_html += '					<p class="font-14">Every</p>';
		medic_html += '				</div>';
		medic_html += '				<div class="col-4">';
		medic_html += '					<input type="number" class="form-control validate-name medicine-frequency" id="medicine-frequency-'+medicard_trans_ctr+'" placeholder="">';
		medic_html += '				</div>	';
		medic_html += '				<div class="col-4">';
		medic_html += '					<select class="medicine-frequency-day" id="medicine-frequency-day-'+medicard_trans_ctr+'">';
		medic_html += '						<option value="1" selected>Hours</option>';
		medic_html += '						<option value="2">Days</option>';
		medic_html += '						<option value="3">Weeks</option>';
		medic_html += '						<option value="4">Months</option>';
		medic_html += '					</select>';
		medic_html += '				</div>';
		medic_html += '			</div>';

		medic_html += '			<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '				<input type="date" class="form-control validate-name medicine-duration-start" id="medicine-duration-start-'+medicard_trans_ctr+'" placeholder="">';
		medic_html += '				<label for="medicine-duration-start-'+medicard_trans_ctr+'" class="color-highlight">Start Date</label>	';
		medic_html += '			</div>';

		medic_html += '			<div class="input-style input-style-always-active has-borders no-icon my-4">';
		medic_html += '				<input type="date" class="form-control validate-name medicine-duration-end" id="medicine-duration-end-'+medicard_trans_ctr+'" placeholder="">';
		medic_html += '				<label for="medicine-duration-end-'+medicard_trans_ctr+'" class="color-highlight">End Date</label>	';
		medic_html += '			</div>	';

		medic_html += '		</div>';


		//medic_html += '		<h6 class="font-13 ps-1 font-500 mb-1">Remark / Note</h6>';
        medic_html += '		<h6 class="font-13 ps-1 font-500 mb-1">Sig</h6>';
		medic_html += '		<div class="input-style has-borders no-icon mb-4">';
		medic_html += '			<textarea id="medicine-sig-'+medicard_trans_ctr+'" placeholder=""></textarea>';
		medic_html += '		</div>';

        medic_html += '		<h6 class="font-13 ps-1 font-500 mb-1">Remark</h6>';
        medic_html += '		<div class="input-style has-borders no-icon mb-4">';
        medic_html += '			<input type="text" class="form-control" id="medicine-remark-'+medicard_trans_ctr+'" placeholder=""></input>';
        medic_html += '		</div>';

		medic_html += '	</div>';
		medic_html += '</div>';

		//increase by 1
		medicard_trans_ctr++;

		return medic_html;

	}

	function fix_medication_card_no(){

		let medication_card_ctr = 1;

		$("#dash-prescription-card-medication-list").find(".dash-prescription-card-medication").each(function(){

			$(this).find(".dash-prescription-card-medication-title").text("Medication# "+ medication_card_ctr);

			medication_card_ctr++;

		});

	}
	//MEDICATION - END
	var prescription_items_global = new Array();

	//RX MEDICATIION - START
	$("#dash-prescription-confirm-review").click(function(){

		console.log(1);
		//reset
        setFormData();
        getPatientInfo( selected_patient_formalid );

		let prescription_items = new Array();

		$("#dash-prescription-card-medication-list").find(".dash-prescription-card-medication").each(function(){

			let valueToPush = {};
			let curr_medicard_trans_ctr = $(this).attr("curr-medical-card-id");

			let curr_medicine_id = $(this).find("#medicine-id-" + curr_medicard_trans_ctr).val();
			let curr_medicine_name = $(this).find("#medicine-name-" + curr_medicard_trans_ctr).val();
			let curr_medicine_generic = $(this).find("#medicine-generic-name-" + curr_medicard_trans_ctr).val();
			let curr_medicine_brand = $(this).find("#medicine-brand-name-" + curr_medicard_trans_ctr).val();
			let curr_medicine_dose = $(this).find("#medicine-dose-" + curr_medicard_trans_ctr).val();
			let curr_medicine_form = $(this).find("#medicine-form-" + curr_medicard_trans_ctr).val();
			let curr_medicine_qty = $(this).find("#medicine-quantity-" + curr_medicard_trans_ctr).val();
			let curr_medicine_note = $(this).find("#medicine-sig-" + curr_medicard_trans_ctr).val();
            let curr_medicine_remark = $(this).find("#medicine-remark-" + curr_medicard_trans_ctr).val();

			let curr_medicine_frequency = $(this).find("#medicine-frequency-" + curr_medicard_trans_ctr).val();
			let curr_medicine_frequency_unit = $(this).find("#medicine-frequency-day-" + curr_medicard_trans_ctr).val();
			let curr_medicine_duration_start = $(this).find("#medicine-duration-start-" + curr_medicard_trans_ctr).val();
			let curr_medicine_duration_end = $(this).find("#medicine-duration-end-" + curr_medicard_trans_ctr).val();

            let curr_medicine_qty_int = parseInt(curr_medicine_qty);
            if(curr_medicine_qty_int <= 0){
                showToastNotification("Error!", "Invalid quantity please check","error");
                $(this).find("#medicine-quantity-" + curr_medicard_trans_ctr).focus();
                return false;
            }

			valueToPush["curr_medicine_id"] = curr_medicine_id;
			valueToPush["curr_medicine_name"] = curr_medicine_name;
			valueToPush["curr_medicine_generic"] = curr_medicine_generic;
			valueToPush["curr_medicine_brand"] = curr_medicine_brand;
			valueToPush["curr_medicine_dose"] = curr_medicine_dose;
			valueToPush["curr_medicine_form"] = curr_medicine_form;
			valueToPush["curr_medicine_qty"] = curr_medicine_qty;
			valueToPush["curr_medicine_sig"] = curr_medicine_note;
            valueToPush["curr_medicine_remark"] = curr_medicine_remark;
			valueToPush["curr_medicine_frequency"] = curr_medicine_frequency;
			valueToPush["curr_medicine_frequency_unit"] = curr_medicine_frequency_unit;
			valueToPush["curr_medicine_duration_start"] = curr_medicine_duration_start;
			valueToPush["curr_medicine_duration_end"] = curr_medicine_duration_end;

			prescription_items.push(valueToPush);

		});

		showModalNotification("eprescription-menu-wizard-rx", 0, "", "");
		$("#dash-prescription-buttons").show();
		$("#emedical-certificate-content, #ereferral-request-content, #dash-standard-buttons").hide();

		//set footer data
		//console.log(doctor_prod_data);

		// let doc_full_name = typeof doctor_prod_data[0]['first_name'] != "undefined" ? doctor_prod_data[0]['first_name'] + " " + doctor_prod_data[0]['last_name'] : "--";
		// let doctor_license_no = typeof doctor_prod_data[0]['license_number'] != "undefined" ? doctor_prod_data[0]['license_number'] : "--";
		// let doctor_ptr_no = typeof doctor_prod_data[0]['ptr_number'] != "undefined" ? doctor_prod_data[0]['ptr_number'] : "--";
		// let sig_no_2 = typeof doctor_prod_data[0]['sig2_number'] != "undefined" ? doctor_prod_data[0]['sig2_number'] : "--";
        //
		// $("#doctor_name").text(doc_full_name);
		// $("#doctor_license_no").text(doctor_license_no);
		// $("#doctor_ptr_no").text(doctor_ptr_no);
		// $("#sig_no_2").text(sig_no_2);

		//draw the medicine
		drawRxMedicineList("#dash-prescription-medicine-list-div", prescription_items);

		prescription_items_global = prescription_items;
	});


	$("#dash-prescription-edit-medication").click(function(){

		//hide rx preview
		menu("eprescription-menu-wizard-rx", "hide", 0);
		$("#dash-prescription-buttons").hide();

	});

	var is_processing_rx = false;

	$("#dash-prescription-cofirm-proceed-rx").click(function(){

		let _this = $(this);
		let _old_text = _this.text();

		//only 1 request at a time
		if(is_processing_rx){
			return false;
		}

		if( $.isEmptyObject(prescription_items_global) ){
			showToastNotification("Error!", "Application cannot process the medicines on the prescription, please check and try again.");
			return false;
		}

		_this.text("Processing...").attr("disabled", true);
		is_processing_rx = true;

		let data = {
			"keyword": "process-doctor-prescription",
			"item_arr": prescription_items_global,
			"medrecord_id": selected_medrecord_id,
			"patient_formalid": selected_patient_formalid,
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

				is_processing_rx = false;

				let status = data.status;
				let message = data.message;
				//added by emrick 6/5/2024
				let inserted_id = data.inserted_id;

	 			if(status == "success"){

					showToastNotification("Successful!", message);

					//close modal
					menu("eprescription-menu-wizard-rx", "hide", 0);
					menu("eprescription-menu-wizard-2", "hide", 0);


					setTimeout(function(){

						//show modal success
						showModalNotification("menu-wizard-prescription-successful", 0, "", "");

						//added by emrick 9/5/2024
						let patientId = getUrlParameter('patientId');

						archivepdf(inserted_id,patientId,4);

						//reload
						setTimeout(function(){
							window.location = '?hxcurrentpage=dash-patient-info&patient-no=' + selected_patient_formalid;
						}, 3000);

					}, 300);


				 } else {
					 showToastNotification("Error!", message);
				 }

 				 _this.text(_old_text).attr("disabled", false);

			},
			error: function (error) {
				is_processing_rx = false;
				showToastNotification("Error!", error);
 				_this.text(_old_text).attr("disabled", false);
			}
		});

	});

	//RX MEDICATIION - END
});

function setFormData() {
    get_clinic_form_header();
    if(doctorSessionData!= ""){
        console.log(doctorSessionData)
        var title = "";
        if(doctorSessionData.title != "" || doctorSessionData.title != null){
            title = ", "+doctorSessionData.title;
        }
        $("#doctor_name").text(doctorSessionData.last_name +", "+ doctorSessionData.first_name + title);
        $("#doctor_license_no").text("LIC NO: "+ doctorSessionData.license_number);
        $("#doctor_ptr_no").text("PTR NO: "+ doctorSessionData.ptr_number);
        $("#sig_no_2").text("S2 NO: "+ doctorSessionData.sig2_number);
        $("#doctor-sig").attr("src",doctorSessionData.signature);
        $("#header-doctor-name").text(doctorSessionData.first_name  + " "+ doctorSessionData.last_name  + " "+ title);
        //$("#header-doctor-address").text(doctor_info.address);
    }
}

function getPatientInfo(patient_formal_id){

    let data = {
        "keyword": "get-doctor-patient-info",
        "patient_formal_id": patient_formal_id,
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

            if(status == "success"){

                if( !$.isEmptyObject(patient_info) ){
                    let name = patient_info['first_name'] + " " + patient_info['last_name'];
                    let age_gender = +patient_info['age']+"/"+patient_info['gender'];
                    let address = patient_info['address'];

                    $("#dash-order-template-patient").text(name);
                    $("#dash-order-template-age").text(age_gender);
                    $("#dash-order-template-address").text( address );

                    if(patient_info.picture != ""){
                        $("#print-patient-dp").attr("src",patient_info.picture);
                    }

                    //next is to get the medical records
                }else{
                    showToastNotification("Error!", message);
                }

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


//added by emrick 9/5/2024
function archivepdf(inserted_id,patient_id,md_type){


    let data = {
        "keyword": "pdf-laboraty-request",
        "patient_id": patient_id,
        "inserted_id": inserted_id,
        "md_type": md_type,
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