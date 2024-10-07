let patient_formal_id = getUrlParameter('patient-no');
let hast_request = false;
$(document).ready(function(){
	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){

		 	//if patient info was set
		 	if( patient_formal_id !== false ){
				 getPatientInfo(patient_formal_id);
				 getVitalSigns(patient_formal_id);
			}

            doctorData = prof_data[0];

            //update by emrick 8/14/2024
            var secretary_acc =  doctorData['secretary_acc'];
            if(secretary_acc==1){
                $('#new-medical-record').addClass('d-none');

            }
        
		}else{
			forceLogout();
		}
	});

    $(document).on('click',".delete-vital-sign", function() {
         let vital_signs_id = $(this).attr("vital-sign-id");
        // console.log(hast_request);
        //
        // if(hast_request==false){
        //     hast_request = true;
        //     delete_vital_signs(vital_signs_id);
        // }
        menu("confirm-delete-vital","show",250);
        $("#confirm-delete-vital-sign").attr("vital-sign-id",vital_signs_id);
        //console.log(hast_request);
    });

    $("#confirm-delete-vital-sign").click(function(){
         let vital_signs_id = $(this).attr("vital-sign-id");
         if(hast_request==false){
             hast_request = true;
             delete_vital_signs(vital_signs_id);
         }
    });



    //save vital signs
    $("#dash-medical-record-save-vital-signs").click(function(){

        let blood_pressure_systolic = $("#vs-bp-systolic").val();
        let blood_pressure_diastolic = $("#vs-bp-diastolic").val();
        let heart_rate = $("#vs-hr").val();
        let respiratory_rate = $("#vs-rr").val();
        let temperature = $("#vs-temp").val();
        let saturation = $("#vs-o2").val();
        let height = $("#vs-ht").val();
        let weight = $("#vs-wt").val();

        //add validation ---
        let bmi_ojb =	getBMI(weight,height);
        var is_valid = true;

        if(blood_pressure_systolic == ""){
            is_valid = false;
            showToastNotification("Error!", "Please enter BP systolic","error");
            $("#vs-bp-systolic").focus();
        } else if(blood_pressure_diastolic == ""){
            showToastNotification("Error!", "Please enter BP diastolic","error");
            $("#vs-bp-diastolic").focus();
            is_valid = false;
        } else if(heart_rate == ""){
            $("#vs-hr").focus();
            showToastNotification("Error!", "Please enter Heart rate","error");
            is_valid = false;
        } else if(respiratory_rate == ""){
            $("#vs-rr").focus();
            showToastNotification("Error!", "Please enter Respiratory rate","error");
            is_valid = false;
        } else if(temperature == ""){
            $("#vs-temp").focus();
            showToastNotification("Error!", "Please enter Temperature","error");
            is_valid = false;

        } else if(saturation == ""){
            $("#vs-o2").focus();
            showToastNotification("Error!", "Please enter Saturation","error");
            is_valid = false;
        } else if(height == ""){
            $("#vs-ht").focus();
            showToastNotification("Error!", "Please enter Height","error");
            is_valid = false;
        } else if(weight == ""){
            $("#vs-wt").focus();
            showToastNotification("Error!", "Please enter Weight","error");
            is_valid = false;
        }


        if(is_valid){
            saveVitalSigns( patient_formal_id,blood_pressure_systolic, blood_pressure_diastolic,heart_rate, respiratory_rate, temperature, saturation, height, weight, bmi_ojb["bmi"] , bmi_ojb["classification"]);
        }

    });

    $("#vs-ht, #vs-wt").keyup(function(){

        let height = $("#vs-ht").val();
        let weight = $("#vs-wt").val();
        if(height.length != 0 && weight.length != 0){
            let bmi_ojb =	getBMI(weight,height);
            setBMIView(bmi_ojb["bmi"],bmi_ojb["classification"]);
        }

    });

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
						$("#dash-patient-id").val(patient_info['PK']);
						$("#dash-patient-formal-id").val(patient_formal_id);
						$("#patient-fullname").text(patient_info['first_name'] + " " + patient_info['last_name']);
						$("#patient-age").text(patient_info['age']);
						$("#patient-gender").text(patient_info['gender']);
						// $("#patient-height").text("5'7");
						// $("#patient-weight").text("75 kg");
						$("#patient-birthday").text(patient_info['date_of_birth_label']);
						$("#patient-contact-no").text(patient_info['phone_number']);
						$("#patient-email").text(patient_info['email_address']);
						//$("#patient-civil-status").text("Single");
						$("#patient-address").text(patient_info['address']);

                        if(patient_info.picture != ""){
                            $("#patient-profile-image").attr("src",patient_info.picture);
                            $("#print-patient-dp").attr("src",patient_info.picture);

                            //print-patient-dp
                        }


						//next is to get the medical records
						getPatientMedicalRecord(patient_info['PK']);

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



});

function getVitalSigns(patient_formal_id){
    let data = {
        "keyword": "get-vital-signs-list",
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
            let vitalSigns = data.json;


            if(status == "success"){
                if( !$.isEmptyObject(vitalSigns) ){
                    $("#vital-signs-timeline").empty();
                    $.each(vitalSigns, function(key, value){
                        let str_json = value.json;
                        if( isJson(str_json)) {
                            let json_obj = JSON.parse(str_json);
                            var date = new Date(value.createdDate);

                            let html = drawHtmlVitalSignsItem(json_obj,value.allow_delete,value.PK,date.toDateString());
                            $("#vital-signs-timeline").append(html);
                        }
                    })
                }

            }else{
                showToastNotification("Error!", message,"error");
            }
        },
        error: function (error) {
            showToastNotification("Error!", error);
        }
    });
}

function drawHtmlVitalSignsItem(json_obj,allow_delete,vital_sign_id,date) {

    var bmi_html =  '<p>'+json_obj.bmi_value+' <mark class="highlight ps-1 font-12 pe-1" style="border-radius: 5px;">('+json_obj.bmi_classification+')</mark></p>';

    var delete_btn = '';
    //console.log(json_obj);
    if(allow_delete == 1){
        delete_btn = '<i vital-sign-id="'+vital_sign_id+'" class="fa fa-close text-danger delete-vital-sign" style="font-size:22px; float: right;"></i>';
    }

     let html =  '<div class="col-md-4 timeline-item">'+
        '<div class="timeline-item-content rounded-s shadow-l" style="margin: 0px 0px 0px 0px !important; padding: 5px;">'+
            '<div class="content"  style="margin: 13px 15px 11px 15px !important;">'+
                '<div class="row mb-0">'+
                    '<div class="col-12">'+
                        '<p>'+
    						date+
    						delete_btn+
    					'</p>'+
                    '</div>'+
                    '<div class="mb-3 w-100"></div>'+
                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Blood Pressure (mmHg)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.blood_pressure_systolic+' / '+json_obj.blood_pressure_diastolic+'</p>'+
                    '</div>'+
                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Heart Rate (bpm)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.heart_rate+'</p>'+
                    '</div>'+

                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Respiratory Rate (cpm)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.respiratory_rate+'</p>'+
                    '</div>'+

                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Temperature (°C)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.temperature+'</p>'+
                    '</div>'+

                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">O2 Saturation (%)</p>'+
                    '</div>'+
                    '<div class="col-4  ">'+
                        '<p>'+json_obj.saturation+'</p>'+
                    '</div>'+

                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Height (m)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.height+'</p>'+
                    '</div>'+

                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">Weight (kg)</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        '<p>'+json_obj.weight+'</p>'+
                    '</div>'+
                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">BMI</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        json_obj.bmi_value+
                    '</div>'+
                    '<div class="col-8">'+
                        '<p class="font-300 color-theme">BMI Class</p>'+
                    '</div>'+
                    '<div class="col-4">'+
                        json_obj.bmi_classification+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'+
    '</div>';

    return html;
}

function saveVitalSigns(formal_id,blood_pressure_systolic, blood_pressure_diastolic, heart_rate, respiratory_rate, temperature, saturation, height, weight,bmi_value, bmi_classification) {
    $("#dash-medical-record-save-vital-signs").text("Processing...").attr("disabled", true);
	let data = {
		"keyword" : "save-vital-signs",
		"formal_id" : formal_id,
		"blood_pressure_systolic" : blood_pressure_systolic,
        "blood_pressure_diastolic" : blood_pressure_diastolic,
		"heart_rate" : heart_rate,
		"respiratory_rate" : respiratory_rate,
		"temperature" : temperature,
		"saturation" : saturation,
		"height" : height,
		"weight" : weight,
		"bmi_value" : bmi_value,
		"bmi_classification" : bmi_classification,
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

			if (status == "success") {

				$("#vs-bp-systolic").val("");
                $("#vs-bp-diastolic").val("");
        		$("#vs-hr").val("");
				$("#vs-rr").val("");
				$("#vs-temp").val("");
				$("#vs-o2").val("");
				$("#vs-ht").val("");
				$("#vs-wt").val("");
                $("#vs-bmi").val("");
                $("#vs-bmi-class").val("");

                 getVitalSigns(patient_formal_id);
                $('#dash-medical-record-vital-stats-form').modal('hide');
		 		menu("dash-medical-record-vital-stats-form", 'hide', 250);

				showMessage("modal-success",message,"Successful!",500)
			} else {
				//console.log("error:  " +  message);
		        showMessage("modal-warning",message,"Warning!",500)
			}
            $("#dash-medical-record-save-vital-signs").text("CONFIRM & SAVE").attr("disabled", false);
            

		},
		error: function (error) {
            $("#dash-medical-record-save-vital-signs").text("CONFIRM & SAVE").attr("disabled", false);

		}
	});

}

function delete_vital_signs(vital_sign_id) {
	let data = {
		"keyword" : "delete-vital-signs",
		"vital_signs_id" : vital_sign_id,
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
            hast_request = false;
			let status = data.status;
			let message = data.message;
            //console.log(data);
			if (status == "success") {
                 getVitalSigns(patient_formal_id);
				showToastNotification("Success!", "Please enter Respiratory rate");
			} else {
                showToastNotification("Error!", message ,"error");
			}
		},
		error: function (error) {
            hast_request = false;
		}
	});
}

function setBMIView(bmiVal,bmiClass){
    console.log(bmiVal);
    console.log(bmiClass);
	$("#vs-bmi").val(bmiVal);
	$("#vs-bmi-class").val(bmiClass);
}








