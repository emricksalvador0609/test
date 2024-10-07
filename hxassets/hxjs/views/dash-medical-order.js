var lab_order_ctr = 1;
var simple_lab_order = {};
var comprehensive_lab_order = {};

let max_file_size = 1;
let max_file_count = 1;


var doctorSessionData = "";
$(document).ready(function(){

    //get_lab_order_basic

    is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){
            get_lab_order_basic(true);
            get_lab_order_basic(false);
            getUploadConfig();


            doctorSessionData = prof_data[0];
		}else{
			forceLogout();
		}
	});


    //Save laboratory results
    $("#save-laboratory-results").click(function(){
        let attachment = $("input[name=medical_attachment").val();
        var isValid = true;
        if(attachment == "[]" || attachment == ""){
            showToastNotification("Error!", "Please Add attachement","error");
            isValid = false;
        }

        if (isValid) {
            //saveProfilePicture(profile_image,module_name)
            //console.log(attachement);
            $(this).attr("disabled", true).text("Processing...");
            saveLaboratory(attachment,"Laboratory-Result");
        }
    });
    //save laboratory result end


	//let patient_formal_id = getUrlParameter('patient-no');

	//Add Lab Test
	$("#dash-prescription-add-lab-order").click(function(){
		draw_lab_order();
	});

    $(document).on("click", "#confirm-basic-laborder", function(){
        processBasicLaborder(false);
    });

    $(document).on("click", "#confirm-comprehensive-laborder", function(){
        processBasicLaborder(true);
    });

	$(document).on("click", ".dash-medrecord-remove-laborder", function(){

        var parent = $(this).parent(".dash-medrecord-laborder-group");
        var current_lab_order_id = parent.find(".dash-medrecord-search-laborder").attr("curr-laborder-id");
        $(document).find("[lab-order-id='"+current_lab_order_id+"']").prop('checked',false);
        parent.remove();
	});

	//ePresciption Form
	$("#dash-medical-record-eprescription").click(function(){

		let new_winsrc = $(this).attr("href");

		window.location.href = new_winsrc;
	});

	//SEARCH LAB TEST - START
	var typingTimer;                //timer identifier
	var doneTypingInterval = 2000;  //time in ms, 2 seconds for example
	var curr_lab_order_ctr = 0;

	//on keyup, start the countdown
	$(document).on("keyup", ".dash-medrecord-search-laborder", function(){

		curr_lab_order_ctr = $(this).attr("lab-order-ctr");
		let curr_lab_order_req = $(this).val();

		clearTimeout(typingTimer);
  		typingTimer = setTimeout(doneTyping, doneTypingInterval, curr_lab_order_req);

  		//console.log("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr);

  		$("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr).show();
	 	$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).addClass("disabled-search-list");
	 	$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).addClass("disabled");
	});

	//on keydown, clear the countdown
	$(document).on("keydown", ".dash-medrecord-search-laborder", function(){
		clearTimeout(typingTimer);
	});

	//user is "finished typing," do something
	function doneTyping(curr_lab_order_req = "") {


	 	let laborder_search_str = curr_lab_order_req;

	 	//hide keyboard
	 	hideKeyboard();

	 	if(laborder_search_str.length <= 0){
			$("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr).hide();
			$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).addClass("disabled-search-list");
			$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).addClass("disabled");
			return false;
		 }

	 	//trigger search lab order
	 	search_laborder_request(laborder_search_str);
	}

	function search_laborder_request(_val){

		let data = {
			"keyword": "search-medical-record-laborder-request",
			"laborder_str": _val,
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

				$("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr).hide();
				$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).addClass("disabled");

				if(status == "success"){

					let res_html = "";

					if( !$.isEmptyObject(resJson) ){
						$.each(resJson, function(key, value){

							res_html +=	'<a href="#" class="dash-medrecord-curr-laborder" curr-laborder-id="'+value['PK']+'" curr-laborder-name="'+value['name']+'" style="line-height: 50px;">';
				            res_html +=	'	<i class="fab color-gray-dark"></i>';
				            res_html +=	'	<span class="dash-medrecord-curr-laborder-name" style="position: relative; opacity: 1;">'+value['name']+'</span>';
				            //res_html +=	'	<strong>Info: '+value['name']+'</strong>';
				            res_html +=	'</a>';
						});

						$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).removeClass("disabled-search-list").children("div").html(res_html);

					}else{
						$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).removeClass("disabled");
					}

				}else{

					showToastNotification("Search Error", message);

					//access token error, redirect to login
					if(typeof data.actokenerror && data.actokenerror){
						setTimeout(function(){
							window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
						}, 3000);
					}

					$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).addClass("disabled-search-list");
				}

			},
			error: function (error) {
				$("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr).hide();
				$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).addClass("disabled-search-list");
				$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).addClass("disabled");

				showToastNotification("Lab Order Search API Error", error);
			}
		});
	}

	var curr_medrecord_diagnosis_ctr = 0;
	$(document).on("click", ".dash-medrecord-curr-laborder", function(){

		let curr_laborder_id = $(this).attr("curr-laborder-id");
		let curr_laborder_name = $(this).attr("curr-laborder-name");

		$("#dash-medrecord-search-laborder-"+curr_lab_order_ctr).val(curr_laborder_name).attr("curr-laborder-id", curr_laborder_id);

		//reset
		$("#dash-medrecord-search-laborder-loader-" + curr_lab_order_ctr).hide();
		$("#dash-medrecord-searched-laborder-result-" + curr_lab_order_ctr).addClass("disabled-search-list");
		$("#dash-medrecord-searched-laborder-empty-" + curr_lab_order_ctr).addClass("disabled");

		curr_medrecord_diagnosis_ctr++;
	});
	//SEARCH LAB TEST - END

	//Show Laboratory Request Form
	$("#dash-medical-record-laboratory-request").click(function(){

		menu("menu-order-list", "close", 0);

		//diagnosis list
		let md_diagnosis_list = $("#medical-record-diagnosis-hidden").val();
		md_diagnosis_list = md_diagnosis_list.split(", ");

		let md_diganostic_html = '';
		$("#dash-medical-record-labtest-list").html('');

		//draw diagnostic html
		if( !$.isEmptyObject(md_diagnosis_list) ){
			$.each(md_diagnosis_list, function(key, value){

				md_diganostic_html += '<div class="form-check interest-check">';
				md_diganostic_html += '	<input class="form-check-input diagnosis-checkbox" type="checkbox" value="'+value+'" id="refletter-diagnostic-'+key+'">';
				md_diganostic_html += '	<label class="form-check-label shadow-xl rounded-xl" for="refletter-diagnostic-'+key+'">'+value+'</label>';
				md_diganostic_html += '	<i class="fa fa-check-circle color-white font-18"></i>';
				md_diganostic_html += '	<i class="fa fa-plus font-17 color-blue-dark"></i>';
				md_diganostic_html += '</div>';

			});

			$("#dash-medical-record-labtest-list").html(md_diganostic_html);
		}


		showModalNotification("dash-medical-record-laboratory-request-form", 300, "", "");
	});

	//Show Medical Certificate Request Form
	$("#dash-medical-record-medical-certificate").click(function(){

        //console.log(active_clinic_id);
        menu("menu-order-list", "close", 0);

		//diagnosis list
		$("#dash-medical-record-medcert-diagnosis-list").text( $("#medical-record-diagnosis-hidden").val() );

		// showModalNotification("dash-medical-record-medical-certificate-form", 300, "", "");
		 $('#dash-medical-record-medical-certificate-form').modal('show');
		setTimeout(function(){
			$('#dash-medrecord-consultation-date').val($("#medical-record-date-hidden").val());
		}, 300);

	});

	//Show Referral Request Form
	$("#dash-medical-record-referral-letter").click(function(){

		menu("menu-order-list", "close", 0);

		//diagnosis list
		let md_diagnosis_list = $("#medical-record-diagnosis-hidden").val();
		md_diagnosis_list = md_diagnosis_list.split(", ");

		let md_diganostic_html = '';
		$("#dash-medical-record-referral-letter-list").html('');

		//draw diagnostic html
		if( !$.isEmptyObject(md_diagnosis_list) ){
			$.each(md_diagnosis_list, function(key, value){

				md_diganostic_html += '<div class="form-check interest-check">';
				md_diganostic_html += '	<input class="form-check-input diagnosis-checkbox" type="checkbox" value="'+value+'" id="refletter-diagnostic-'+key+'">';
				md_diganostic_html += '	<label class="form-check-label shadow-xl rounded-xl" for="refletter-diagnostic-'+key+'">'+value+'</label>';
				md_diganostic_html += '	<i class="fa fa-check-circle color-white font-18"></i>';
				md_diganostic_html += '	<i class="fa fa-plus font-17 color-blue-dark"></i>';
				md_diganostic_html += '</div>';

			});

			$("#dash-medical-record-referral-letter-list").html(md_diganostic_html);
		}

		//showModalNotification("dash-medical-record-referral-letter-form", 300, "", "");
		$('#dash-medical-record-referral-letter-form').modal('show');
	});


    //dash-medical-record-attachement
    $("#dash-medical-record-attachement").click(function(){
        menu("menu-order-list", "close", 0);
        var html_dropzone = '<div class="dz-default dz-message"><span><img src="../hxassets/hximages/upload.png"></span></div>';
        //$("input[name=medical_attachment").val("");

        myDropzone.removeAllFiles(); //reset
        //$("#medical_attachment").html(html_dropzone);
    //    $('.dz-preview').remove()

        showModalNotification("menu-medical-attachement-dropzone", 300, "", "");

    });
	//save lab order request
	$("#dash-medical-record-save-laboratory-test").click(function(){

		let message = "";
		let _this = $(this);
		let is_valid = true;
		let medical_record_id = $("#medical-id-hidden").val();
        let remark = $("#dash-medrecord-lab-test-remark").val();
        let follow_update_date_labtest = $("#dash-medrecord-lab-test-ffup-date").val();


		//dash-medical-record-referral-letter-form
		let selectedDiagnosis = [];

		$("#dash-medical-record-laboratory-request-form .diagnosis-checkbox").each(function(){
			if($(this).prop('checked')) {
				selectedDiagnosis.push($(this).val());
			}
		});

        let laborder = [];

        $(".dash-medrecord-laborder-group").each(function(){
            let lab_order_element = $(this).find(".dash-medrecord-search-laborder");

            let lab_order_name = lab_order_element.val()
            let lab_order_id = lab_order_element.attr("curr-laborder-id")
            let lab_order_remark = $(this).find(".lab-order-remark").val();
            let followup_date = $(this).find(".lab-order-ffup-date").val();

            if(lab_order_id == ""){
                is_valid = false;
            	showToastNotification("Error!", "Lab order item is not selected","error");
                lab_order_element.focus();
                return;
            }

            followup_date = "";
            lab_order_remark = "";

            var labOrderObject = {
                "name": lab_order_name,
                "id": lab_order_id,
                "remark": lab_order_remark,
                "followup_date": followup_date
            }

            laborder.push(labOrderObject)
		});




		if(selectedDiagnosis.length == 0){
			is_valid = false;
			message = "Please Select diagnosis";
		}

		if(is_valid){
			saveLabOrderRequest(_this, medical_record_id, selectedDiagnosis,laborder,remark,follow_update_date_labtest);
		} else {
			showToastNotification("Error!", message,"error");
		}

	});


	//refferral letter start
	$("#dash-medical-record-save-referral-letter").click (function(){

		let message = "";
		let _this = $(this);
		let is_valid = true;
		let dash_medrecord_refer_to = $("#dash-medrecord-refer-to").val();
		let dash_medrecord_remarks = $("#dash-medrecord-remarks").val();
		let medical_record_id = $("#medical-id-hidden").val();

		//dash-medical-record-referral-letter-form
		let selectedDiagnosis = [];

		$("#dash-medical-record-referral-letter-form .diagnosis-checkbox").each(function(){
			if($(this).prop('checked')) {
				selectedDiagnosis.push($(this).val());
			}
		});

		if(selectedDiagnosis.length == 0){
			is_valid = false;
			message = "Please Select diagnosis";
		}

		if(dash_medrecord_remarks.length == 0){
			is_valid = false;
			message = "Please Enter remarks";
		}

		if(dash_medrecord_refer_to.length == 0){
			is_valid = false;
			message = "Please Enter refer to";
		}

		if(is_valid){
			saveReferralLetter(_this, medical_record_id, selectedDiagnosis, dash_medrecord_refer_to, dash_medrecord_remarks);
		} else {
			showToastNotification("Error!", message,"error");
		}

	});

    $("#dash-medical-record-review-referral-letter").click (function(){

        let message = "";
		let _this = $(this);
		let is_valid = true;
		let dash_medrecord_refer_to = $("#dash-medrecord-refer-to").val();
		let dash_medrecord_remarks = $("#dash-medrecord-remarks").val();
		let medical_record_id = $("#medical-id-hidden").val();

		//dash-medical-record-referral-letter-form
		let selectedDiagnosis = [];
        let diagnosisTxt = "";

		$("#dash-medical-record-referral-letter-form .diagnosis-checkbox").each(function(){
			if($(this).prop('checked')) {
				selectedDiagnosis.push($(this).val());
			}
		});

		if(selectedDiagnosis.length == 0){
			is_valid = false;
			message = "Please Select diagnosis";
		}

		if(dash_medrecord_remarks.length == 0){
			is_valid = false;
			message = "Please Enter remarks";
		}

		if(dash_medrecord_refer_to.length == 0){
			is_valid = false;
			message = "Please Enter refer to";
		}

		if(is_valid){
            diagnosisTxt = selectedDiagnosis.join(", ");
            drawReferralLetter(dash_medrecord_refer_to,dash_medrecord_remarks,diagnosisTxt);
            showMedicalForm("ereferral-request-content");
              $('#dash-medical-record-referral-letter-form').modal('hide');
              
		} else {
			showToastNotification("Error!", message,"error");
		}

    });

    $("#dash-medical-record-review-lab-request").click (function(){
        //showMedicalForm("emedical-lab-request-content");

        let message = "";
        let _this = $(this);
        let is_valid = true;
        let medical_record_id = $("#medical-id-hidden").val();
        let remark = $("#dash-medrecord-lab-test-remark").val();
        let follow_update_date_labtest = $("#dash-medrecord-lab-test-ffup-date").val();


        //dash-medical-record-referral-letter-form
        let selectedDiagnosis = [];
        let diagnosisTxt = "";
        let labOrders = "";

        $("#dash-medical-record-laboratory-request-form .diagnosis-checkbox").each(function(){
            if($(this).prop('checked')) {
                selectedDiagnosis.push($(this).val());

            }
        });

        let laborder = [];
        let labOrderNames = [];

        $(".dash-medrecord-laborder-group").each(function(){
            let lab_order_element = $(this).find(".dash-medrecord-search-laborder");

            let lab_order_name = lab_order_element.val()
            let lab_order_id = lab_order_element.attr("curr-laborder-id")
            let lab_order_remark = $(this).find(".lab-order-remark").val();
            let followup_date = $(this).find(".lab-order-ffup-date").val();

            if(lab_order_id == ""){
                is_valid = false;
                showToastNotification("Error!", "Lab order item is not selected","error");
                lab_order_element.focus();
                return;
            }

            followup_date = "";
            lab_order_remark = "";

            var labOrderObject = {
                "name": lab_order_name,
                "id": lab_order_id,
                "remark": lab_order_remark,
                "followup_date": followup_date
            }

            labOrderNames.push(lab_order_name);
            laborder.push(labOrderObject)
        });


        if(selectedDiagnosis.length == 0){
            is_valid = false;
            message = "Please Select diagnosis";
        }

        if(laborder.length == 0) {
            is_valid = false;
            message = "Please Add Lab Test Request";
        }

        if(is_valid){
            diagnosisTxt = selectedDiagnosis.join(", ");
            labOrders = "For: "+ labOrderNames.join(", ");

            //console.log();

            drawPreviewLabRequest(diagnosisTxt,labOrders, remark);
            showMedicalForm("emedical-lab-request-content");
        } else {
            showToastNotification("Error!", message,"error");
        }
    });

    $("#dash-medical-record-review-medical-certificate").click (function(){

        var is_valid = true;
        let medical_record_id = $("#medical-id-hidden").val();
        let medical_record_diagnosis = $("#medical-record-diagnosis-hidden").val();

        var consultation_date = $("#dash-medrecord-consultation-date").val();
        var no_rest_days = $("#dash-medrecord-no-rest-day").val();
        var remarks = $("#dash-medical-record-remarks").val();

        if(medical_record_diagnosis.length <= 0){
			is_valid = false;
			message = "Diagnosis is required, please check the Medical record.";
		}

		if(consultation_date.length <= 0){
			is_valid = false;
			message = "Consultation date is required.";

		}

		if(no_rest_days.length <= 0){
			is_valid = false;
			message = "Rest days is required.";
		}

        if(is_valid){
            drawPreviewMedcert();
            showMedicalForm("emedical-certificate-content");
             $('#dash-medical-record-medical-certificate-form').modal('hide');
        } else {
            showToastNotification("Error!", message,"error");
        }

    });

    //for edit or back to for medical for saving item
    $("#btn-medical-edit-preview").click (function(){

        menu("eprescription-menu-wizard-rx", "hide", 0);
       
        var previous_menu = $(this).attr("previous-menu");
        $('#'+previous_menu).modal('show');
        //menu(previous_menu, "show", 0);
    });

    $("#dash-medical-form-save").click (function(){
        var formType = $(this).attr("medical-form-type");
        let _this = $(this);
        if(formType == "med-cert"){
            processSaveMedCert(_this);
        } else if (formType == "lab-request") {
            processSaveLabRequest(_this);

        } else if (formType == "referral-letter") {
            processSaveReferralLetter();

        }
    });

	$("#dash-medical-record-save-medical-certificate").click (function(){

		let _this = $(this);
		let is_valid = true;
		let medical_record_id = $("#medical-id-hidden").val();
		let medical_record_diagnosis = $("#medical-record-diagnosis-hidden").val();

		var consultation_date = $("#dash-medrecord-consultation-date").val();
		var no_rest_days = $("#dash-medrecord-no-rest-day").val();
		var remarks = $("#dash-medical-record-remarks").val();

		if(medical_record_diagnosis.length <= 0){
			is_valid = false;
			message = "Diagnosis is required, please check the Medical record.";
		}

		if(consultation_date.length <= 0){
			is_valid = false;
			message = "Consultation date is required.";

		}

		if(no_rest_days.length <= 0){
			is_valid = false;
			message = "Rest days is required.";
		}

		if(is_valid){
			_this.text("Processing...").attr("disabled", true);
			saveMedicalCertificate(_this, medical_record_id, medical_record_diagnosis, consultation_date, no_rest_days, remarks);
		} else {
			showToastNotification("Error!", message,"error");
		}
	});
});

function processSaveReferralLetter(element) {

    let message = "";
    let _this = element;
    let is_valid = true;
    let dash_medrecord_refer_to = $("#dash-medrecord-refer-to").val();
    let dash_medrecord_remarks = $("#dash-medrecord-remarks").val();
    let medical_record_id = $("#medical-id-hidden").val();

    //dash-medical-record-referral-letter-form
    let selectedDiagnosis = [];

    $("#dash-medical-record-referral-letter-form .diagnosis-checkbox").each(function(){
        if($(this).prop('checked')) {
            selectedDiagnosis.push($(this).val());
        }
    });

    if(selectedDiagnosis.length == 0){
        is_valid = false;
        message = "Please Select diagnosis";
    }

    if(dash_medrecord_remarks.length == 0){
        is_valid = false;
        message = "Please Enter remarks";
    }

    if(dash_medrecord_refer_to.length == 0){
        is_valid = false;
        message = "Please Enter refer to";
    }

    if(is_valid){
        saveReferralLetter(_this, medical_record_id, selectedDiagnosis, dash_medrecord_refer_to, dash_medrecord_remarks);
    } else {
        showToastNotification("Error!", message,"error");
    }

}
function processSaveLabRequest(element) {

    let message = "";
    let _this = element;
    let is_valid = true;
    let medical_record_id = $("#medical-id-hidden").val();
    let remark = $("#dash-medrecord-lab-test-remark").val();
    let follow_update_date_labtest = $("#dash-medrecord-lab-test-ffup-date").val();

    //dash-medical-record-referral-letter-form
    let selectedDiagnosis = [];

    $("#dash-medical-record-laboratory-request-form .diagnosis-checkbox").each(function(){
        if($(this).prop('checked')) {
            selectedDiagnosis.push($(this).val());
        }
    });

    let laborder = [];

    $(".dash-medrecord-laborder-group").each(function(){
        let lab_order_element = $(this).find(".dash-medrecord-search-laborder");

        let lab_order_name = lab_order_element.val()
        let lab_order_id = lab_order_element.attr("curr-laborder-id")
        let lab_order_remark = $(this).find(".lab-order-remark").val();
        let followup_date = $(this).find(".lab-order-ffup-date").val();

        if(lab_order_id == ""){
            is_valid = false;
            showToastNotification("Error!", "Lab order item is not selected","error");
            lab_order_element.focus();
            return;
        }

        followup_date = "";
        lab_order_remark = "";

        var labOrderObject = {
            "name": lab_order_name,
            "id": lab_order_id,
            "remark": lab_order_remark,
            "followup_date": followup_date
        }

        laborder.push(labOrderObject)
    });


    if(selectedDiagnosis.length == 0){
        is_valid = false;
        message = "Please Select diagnosis";
    }

    if(laborder.length == 0) {
        is_valid = false;
        message = "Please Add Lab Test Request";
    }

    if(is_valid){
        saveLabOrderRequest(_this, medical_record_id, selectedDiagnosis,laborder,remark,follow_update_date_labtest);
    } else {
        showToastNotification("Error!", message,"error");
    }

}

function processSaveMedCert(element) {

    let _this = element;
    let is_valid = true;
    let medical_record_id = $("#medical-id-hidden").val();
    let medical_record_diagnosis = $("#medical-record-diagnosis-hidden").val();

    var consultation_date = $("#dash-medrecord-consultation-date").val();
    var no_rest_days = $("#dash-medrecord-no-rest-day").val();
    var remarks = $("#dash-medical-record-remarks").val();

    if(medical_record_diagnosis.length <= 0){
        is_valid = false;
        message = "Diagnosis is required, please check the Medical record.";
    }

    if(consultation_date.length <= 0){
        is_valid = false;
        message = "Consultation date is required.";

    }

    if(no_rest_days.length <= 0){
        is_valid = false;
        message = "Rest days is required.";
    }

    if(is_valid){
        _this.text("Processing...").attr("disabled", true);
        saveMedicalCertificate(_this, medical_record_id, medical_record_diagnosis, consultation_date, no_rest_days, remarks);
    } else {
        showToastNotification("Error!", message,"error");
    }

}


function get_lab_order_basic(is_basic) {
    var data = {};
    if(is_basic){
         data = {
            "keyword": "laboratory-order-list",
            "is_basic": true,
            "actokensec": actokensec
        };
    } else {
         data = {
            "keyword": "laboratory-order-list",
            "is_comprehensive": true,
            "actokensec": actokensec
        };
    }


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
                let laborder_html = '';
                var html = "";
                if(is_basic){
                    simple_lab_order = resJson;
                    html = get_lab_order_html(is_basic);
                    $("#dash-medrecord-basiclist-laborder .lab-order-container").append(html);
                } else {
                    comprehensive_lab_order = resJson;
                    html = get_lab_order_html(is_basic);
                    $("#dash-medrecord-comprehensive-laborder .lab-order-container").append(html);
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
            console.log(error);
        }
    });
}

function draw_lab_order(sel_laborder_id = 0, sel_laborder_name = ""){

	let laborder_html = '';

	if(lab_order_ctr == 1){

        // var simple_item_html = get_simple_lab_order_html();
        //
		// laborder_html += '<h1 class="text-center font-700 mt-3 pt-2">Lab Orders</h1>';
		// laborder_html += '<div class="divider"></div>';
        //
		// //basic lab orders
		// laborder_html += '<div class="mb-3">';
        // laborder_html += '    <button id="btn-show-simple-lab-order" class="btn accordion-btn no-effect color-theme collapsed" data-bs-toggle="collapse" data-bs-target="#dash-medrecord-basiclist-laborder" aria-expanded="false" style="width: 100%; padding-left: 0;">';
        // laborder_html += '        <h4>Basic List of Selections</h4>';
        // laborder_html += '        <i class="fa fa-chevron-down font-10 accordion-icon" style="margin-top: -20px;"></i>';
        // laborder_html += '    </button>';
        // laborder_html += '    <div id="dash-medrecord-basiclist-laborder" class="collapse" style="">';
        // laborder_html += '        <div class="pt-1 pb-2 ps-3 pe-3 row">';
        //
        // laborder_html+= simple_item_html;
        //
        // laborder_html += '<div class="col-12 mt-3">';
        // laborder_html += '<a href="#" id="confirm-basic-laborder" class="btn btn-border btn-m btn-full mb-3 rounded-xl text-uppercase font-900 border-blue-dark color-blue-dark bg-theme">Confirm Selection</a>';
        // laborder_html += '</div>';
        //
        // laborder_html += '        </div>';
        // laborder_html += '    </div>';
        // laborder_html += '</div>';
        //
        // laborder_html += '    <button id="btn-show-simple-lab-order" class="btn accordion-btn no-effect color-theme collapsed" data-bs-toggle="collapse" data-bs-target="#dash-medrecord-basiclist-laborder" aria-expanded="false" style="width: 100%; padding-left: 0;">';
        // laborder_html += '        <h4>Comprehensive List of Selections</h4>';
        // laborder_html += '        <i class="fa fa-chevron-down font-10 accordion-icon" style="margin-top: -20px;"></i>';
        // laborder_html += '    </button>';
        //
        // laborder_html += '<div class="divider"></div>';

	}

	laborder_html += '<div class="dash-medrecord-laborder-group me-10">';
	laborder_html += '<i class="fa fa-close text-danger dash-medrecord-remove-laborder" style="font-size:22px; float: right;"></i>';
	laborder_html += '<h6 class="font-13 ps-1 font-500 mb-1 text-info">Lab Order #'+lab_order_ctr+'</h6>';

	//Search for Diagnosis
	laborder_html += '<div class="input-style has-borders input-style-always-active">';
	laborder_html += '	<div class="search-box search-color shadow-xl border-0 bg-dark-dark rounded-l bottom-0" style="margin-bottom: 3%;">';
    laborder_html += '    	<input type="text" class="border-0 dash-medrecord-search-laborder" value="'+sel_laborder_name+'" curr-laborder-id="'+sel_laborder_id+'" placeholder="Search Lab Order..." id="dash-medrecord-search-laborder-'+lab_order_ctr+'" lab-order-ctr="'+lab_order_ctr+'">';
    laborder_html += '	</div>';

    laborder_html += '<div class="content pt-3 pb-3 dash-medrecord-search-laborder-loader" id="dash-medrecord-search-laborder-loader-'+lab_order_ctr+'">';
    laborder_html += '	<div class="d-flex justify-content-center">';
    laborder_html += '        <div class="spinner-border color-blue-dark" role="status">';
    laborder_html += '        </div>';
    laborder_html += '    </div>';
	laborder_html += '</div>';

    laborder_html += '<div class="search-results disabled-search-list" id="dash-medrecord-searched-laborder-result-'+lab_order_ctr+'" style="margin-bottom: 5%;">';
	laborder_html += '	<div class="list-group list-custom-large">';
    laborder_html += '    </div>';
    laborder_html += '</div>';
    laborder_html += '<div class="search-no-results disabled mt-4" id="dash-medrecord-searched-laborder-empty-'+lab_order_ctr+'">';
    laborder_html += '    <h4>No Results</h4>';
    laborder_html += '    <p>';
    laborder_html += '        Your search brought up no results. Try using a different keyword of the lab order name.';
    laborder_html += '    </p>';
    laborder_html += '</div>';
    laborder_html += '</div>';
	//Search for Diagnosis

	// laborder_html += '<h6 class="font-13 ps-1 font-500 mb-1">Remarks</h6>';
	// laborder_html += '<div class="input-style has-borders no-icon mb-4">';
	// laborder_html += '	<textarea class="lab-order-remark" id="lab-order-remark-'+lab_order_ctr+'"></textarea>';
	// laborder_html += '</div>';
    //
	// laborder_html += '<h6 class="font-13 ps-1 font-500 mb-1">Followup Date</h6>';
	// laborder_html += '<div class="input-style has-borders">				';
	// laborder_html += '	<input type="date" class="form-control lab-order-ffup-date"  id="lab-order-ffup-date-'+lab_order_ctr+'">';
	// laborder_html += '</div>';

	// laborder_html += '<div class="divider"></div>';
	laborder_html += '</div>';

	$("#dash-medical-record-labtest-laborder-list").append(laborder_html);
	$(".dash-medrecord-search-laborder-loader").hide(); //hide loader

	lab_order_ctr++;

}


function get_lab_order_html(is_basic) {
    var html = "";

    var prefix = "";
    var obj = [];
    if(is_basic){
        prefix = "basic";
        obj = simple_lab_order;
    } else {
        prefix = "comprehensive";
        obj = comprehensive_lab_order;
    }
    //console.log(simple_lab_order);

    $.each(obj, function(category, item_lab_order){

            html += '<h4 style="color:white; background-color: '+item_lab_order.color_hex+' ">'+category+'</h4>';

            $.each(item_lab_order.item, function(key, value){
                var lab_order_item_html = "";
                lab_order_item_html += '<div class="col-6">';
                lab_order_item_html += '    <div class="fac fac-checkbox fac-default"><span></span>';
                lab_order_item_html += '        <input id="'+prefix+'-lab-order-'+value.PK+'" class="item-laborder" type="checkbox" lab-order-id="'+value.PK+'" value="'+value.name+'" >';
                lab_order_item_html += '        <label for="'+prefix+'-lab-order-'+value.PK+'">'+value.name+'</label>';
                lab_order_item_html += '    </div>';
                lab_order_item_html += '</div>';

                html += lab_order_item_html;
            });
            html += "<br/>";
    });

    return html;
}



function saveLabOrderRequest(_this, medical_record_id, selectedDiagnosis,laborder,remark,follow_update_date_labtest){

	let patient_id = $("#dash-patient-id").val();
	let patient_age = $("#patient-age").text();
	let patient_gender = $("#patient-gender").text();

    _this.text("Processing...").attr("disabled", true);

	let data = {
		"keyword" : "save-lab-test-request",
		"medical_record_id": medical_record_id,
		"patient_id" : patient_id,
		"patient_age" : patient_age,
		"patient_gender" : patient_gender,
		"diagnosis" : selectedDiagnosis,
        "laborder": laborder,
		"remarks": remark,
        "follow_update_date_labtest": follow_update_date_labtest,
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
            //added by emrick 9/5/2024
            let inserted_id = data.inserted_id;
			if (status == "success") {

		        showToastNotification("Success!", message);
                menu("eprescription-menu-wizard-rx", "hide", 0);
				menu("dash-medical-record-laboratory-request-form", 'hide', 250);
                $(".medical-buttons").hide();
                $("#dash-standard-buttons").show();
		        getPatientMedicalRecord(patient_id);
                //added by emrick 9/5/2024
                archivepdf(inserted_id,patient_id,1);


			} else {
		        showToastNotification("Error!", message,"error");
			}
            _this.text("CONFIRM & SAVE").attr("disabled", false);

		},
		error: function (error) {
			console.log(error);
            _this.text("CONFIRM & SAVE").attr("disabled", false);
		}
	});

}

function saveMedicalCertificate(_this, medical_record_id, diagnosis, consultation_date, no_rest_days, remarks) {

	let patient_id = $("#dash-patient-id").val();
	let patient_age = $("#patient-age").text();
	let patient_gender = $("#patient-gender").text();

	let data = {
		"keyword" : "save-medical-certificate",
		"medical_record_id": medical_record_id,
        "clinic_id": active_clinic_id,
		"diagnosis" : diagnosis,
		"patient_id" : patient_id,
		"patient_age" : patient_age,
		"patient_gender" : patient_gender,
		"consultation_date" : consultation_date,
		"no_rest_days": no_rest_days,
		"remarks": remarks,
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
            //added by emrick 9/5/2024
            let inserted_id = data.inserted_id;

			_this.text("CONFIRM & SAVE").attr("disabled", false);

			if (status == "success") {

				$("#dash-medrecord-consultation-date").val("");
				$("#dash-medrecord-no-rest-day").val("");
				$("#dash-medical-record-remarks").val("");

                menu("eprescription-menu-wizard-rx", "hide", 0);
                $('#dash-medical-record-medical-certificate-form').modal('hide');
				menu("dash-medical-record-medical-certificate-form", 'hide', 250);
				 
		        showToastNotification("Success!", message);

                $(".medical-buttons").hide();
                $("#dash-standard-buttons").show();
                //get updated medical record
		        getPatientMedicalRecord(patient_id);
                //added by emrick 9/5/2024
                archivepdf(inserted_id,patient_id,2);

			} else {
		        showToastNotification("Error!", message,"error");
			}
		},
		error: function (error) {
			_this.text("CONFIRM & SAVE").attr("disabled", false);
	        showToastNotification("Error!", error,"error");

		}
	});
}

function saveReferralLetter(_this, medical_record_id, diagnosis, refer_to,remarks) {

	let patient_id = $("#dash-patient-id").val();
	let patient_age = $("#patient-age").text();
	let patient_gender = $("#patient-gender").text();

	let data = {
		"keyword" : "save-referral-letter",
		"medical_record_id": medical_record_id,
		"patient_id" : patient_id,
		"patient_age" : patient_age,
		"patient_gender" : patient_gender,
		"diagnosis" : diagnosis,
		"refer_to" : refer_to,
		"remarks": remarks,
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
            //added by emrick 9/5/2024
            let inserted_id = data.inserted_id;
            
			if (status == "success") {
				$("#dash-medrecord-refer-to").val("");
				$("#dash-medrecord-remarks").val("");

				menu("dash-medical-record-referral-letter-form", 'hide', 250);
		        showToastNotification("Success!", message);
                menu("eprescription-menu-wizard-rx", "hide", 0);
				menu("dash-medical-record-laboratory-request-form", 'hide', 250);
                $(".medical-buttons").hide();
                $("#dash-standard-buttons").show();
		        //get updated medical record
		        getPatientMedicalRecord(patient_id);
                //added by emrick 9/5/2024
                archivepdf(inserted_id,patient_id,3);

			} else {
		        showToastNotification("Error!", message,"error");
			}

		},
		error: function (error) {
			console.log(error);
			//$("#btn-login").attr("disabled", false).text("LOGIN");
		}
	});

}

function processBasicLaborder(is_comprehensive) {

    if(!is_comprehensive){

        $("#dash-medrecord-basiclist-laborder").find(".item-laborder").each(function(){
            var is_checked = $(this).is(':checked');
            if(is_checked){
                var lab_order_id = $(this).attr("lab-order-id");
                var lab_order = $(this).val();

                var length = $(document).find("[curr-laborder-id='"+lab_order_id+"']").length;

                if(length == 0){
                    draw_lab_order(lab_order_id,lab_order);
                }
            }

        });

        $("#btn-show-simple-lab-order").click();
    } else {
        //dash-medrecord-comprehensive-laborder
        $("#dash-medrecord-comprehensive-laborder").find(".item-laborder").each(function(){
            var is_checked = $(this).is(':checked');
            if(is_checked){
                var lab_order_id = $(this).attr("lab-order-id");
                var lab_order = $(this).val();

                var length = $(document).find("[curr-laborder-id='"+lab_order_id+"']").length;

                if(length == 0){
                    draw_lab_order(lab_order_id,lab_order);
                }
            }

        });

        $("#btn-show-comprehensive-lab-order").click();
    }

}


function drawPreviewLabRequest(diagnosisTxt,labOrders, remark){

    let name = $("#patient-fullname").text();
    let patient_age = $("#patient-age").text();
    let patient_gender = $("#patient-gender").text();

    let age_gender = patient_age+"/"+ patient_gender;

    $("#dash-order-template-patient").text(name);
    $("#dash-order-template-age").text(age_gender);
    $("#dash-order-template-address").text( $("#patient-address").text() );

    var fomatedConsultationDate = "<b>Date: </b>"+formatDate("");
    $("#labrequest-consultation-date").html(fomatedConsultationDate);

    $("#lab-request-diagnosis").html("Impression: "+diagnosisTxt);
    $("#lab-diagnosis-remarks").html(remark);
    $("#lab-test-request").html(labOrders);

    if(doctorSessionData!= ""){
        var title = "";
        if(doctorSessionData.title != "" || doctorSessionData.title != null){
            title = ", "+doctorSessionData.title;
        }
        $("#doctor_name").text(doctorSessionData.last_name +", "+ doctorSessionData.first_name + title);
        $("#doctor_license_no").text("LIC NO: "+ doctorSessionData.license_number);
        $("#doctor_ptr_no").text("PTR NO: "+ doctorSessionData.ptr_number);
        $("#sig_no_2").text("S2 NO: "+ doctorSessionData.sig2_number);
        $("#doctor-sig").attr("src",doctorSessionData.signature);

        get_clinic_form_header();
        $("#header-doctor-name").text(doctorSessionData.first_name  + " "+ doctorSessionData.last_name  + " "+ title);
    }
}

function drawReferralLetter(dash_medrecord_refer_to,dash_medrecord_remarks,diagnosis) {
    let name = $("#patient-fullname").text();
    let patient_age = $("#patient-age").text();
    let patient_gender = $("#patient-gender").text();

    let age_gender = patient_age+"/"+ patient_gender;

    $("#dash-order-template-patient").text(name);
    $("#dash-order-template-age").text(age_gender);
    $("#dash-order-template-address").text( $("#patient-address").text() )
    var fomatedConsultationDate = "<b>Date: </b>"+formatDate("");
    $("#labrequest-consultation-date").html(fomatedConsultationDate);

    $("#patient-age-gender").text(age_gender);

    $("#referral-patient-name").html("<strong>"+name+"</strong>");
    $("#refer-to").html("<strong>"+dash_medrecord_refer_to+"</strong>");

    $("#referral-remarks").html(diagnosis);
    $("#referral-diagnosis").html(dash_medrecord_remarks);

    if(doctorSessionData!= ""){

        var title = "";
        if(doctorSessionData.title != "" || doctorSessionData.title != null){
            title = ", "+doctorSessionData.title;
        }

        $("#doctor_name").text(doctorSessionData.last_name +", "+ doctorSessionData.first_name + title);
        $("#doctor_license_no").text("LIC NO: "+ doctorSessionData.license_number);
        $("#doctor_ptr_no").text("PTR NO: "+ doctorSessionData.ptr_number);
        $("#sig_no_2").text("S2 NO: "+ doctorSessionData.sig2_number);
        $("#doctor-sig").attr("src",doctorSessionData.signature);

        get_clinic_form_header();
        $("#header-doctor-name").text(doctorSessionData.first_name  + " "+ doctorSessionData.last_name  + " "+ title);
    }


}
function drawPreviewMedcert() {
    get_clinic_form_header();

    let name = $("#patient-fullname").text();
    let patient_age = $("#patient-age").text();
    let patient_gender = $("#patient-gender").text();

    var consultation_date = $("#dash-medrecord-consultation-date").val();
    var no_rest_days = $("#dash-medrecord-no-rest-day").val();
    var remarks = $("#dash-medical-record-remarks").val();

    let medical_record_diagnosis = $("#medical-record-diagnosis-hidden").val();

    let age_gender = $("#patient-age").text() +"/"+ $("#patient-gender").text();

    $("#dash-order-template-patient").text(name);
    $("#dash-order-template-age").text(age_gender);
    $("#dash-order-template-address").text( $("#patient-address").text() );

    $("#medcert-patient-name").text(name);
    $("#patient-age-gender").text(age_gender);

    var fomatedConsultationDate = formatDate(consultation_date);

    $("#medcert-diagnosis").text(medical_record_diagnosis);
    $("#medcert-remarks").html(remarks);
    $("#medcert-day-rest").text(no_rest_days);
    $("#medcert-consultation-date").html("<b>Date: </b>"+fomatedConsultationDate);
    $("#medical-cert-consultation-date-label").text(fomatedConsultationDate);

    if(doctorSessionData!= ""){

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

function saveLaboratory(file_js, module_name) {
    let patient_id = $("#dash-patient-id").val();
    let medical_record_id = $("#medical-id-hidden").val();

    let data = {
        "keyword": "save-laboratory-result",
        'module': module_name,
        'patient_id': patient_id,
        'medical_record_id': medical_record_id,
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
                menu("menu-medical-attachement-dropzone", "close", 300);

                getPatientMedicalRecord(patient_id);
            }else{
                showToastNotification("Error!", message,"error");
                if(typeof data.actokenerror && data.actokenerror){
                	setTimeout(function(){
                		window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
                	}, 3000);
                }
            }

            $("#save-laboratory-results").attr("disabled", false).text("Save");
        },
        error: function (error) {
            showToastNotification("Error!", error.responseText);
            $("#save-laboratory-results").attr("disabled", false).text("Save");
        }
    });

}

function getUploadConfig() {
    let data = {
        "keyword": "get-upload-config",
        "module": "Laboratory Upload Settings",
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
                max_file_count = resJson.max_file_count
                max_file_size = resJson.max_file_size
                var label = "Select Image or PDF file (max file size "+max_file_size+"mb, max file count "+max_file_count+")";
                //file-upload-label
                $("#file-upload-label").html(label);
            }

            initiateDropzone();

        },
        error: function (error) {
            console.log(error);
        }
    });

}

function initiateDropzone() {
    Dropzone.autoDiscover = false;
    if($(".dropzone").length){

        $(".dropzone").each(function(){
            var dropzone_id = $(this).attr("id");
            var input_val = $(this).parent().find('.file_value');
            var mock_file_text = $(this).parent().find("#image_mock_file_list").text();

            var file_limit = max_file_count
            var accepted_filetypes = ".pjpeg, .bmp, .png, .jpeg, .jpg, .pdf";
            var file_max_size = max_file_size
            var module_name = "Laboratory-Result";
            init_dropzone( "div#"+dropzone_id, baseAppUrl + "upload/dropzone/index.php", module_name, input_val, file_limit, accepted_filetypes, file_max_size);
        });
    }
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
