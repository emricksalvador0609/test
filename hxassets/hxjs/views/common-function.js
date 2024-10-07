/*
* Reusable Functions that can be used in multiple pages
*/
var patientlist_ctr = 0;

function drawRxMedicineList(_elem_id, items){

	if( $.isEmptyObject(items) ){
		return false;
	}

	let html = '';
	let med_ctr = 1;

	$.each(items, function(key, value){

		html += '<div class="dash-prescription-medicine-item-group mb-3">';
		html += '	<div class="col-12" style="text-align: left; margin-left: 10%;">';
		html += 		'<b>' + med_ctr + '</b> &emsp;';
		html +=			'<b>' + value['curr_medicine_generic'] + '</b>';
		html +=			'&nbsp;(' + value['curr_medicine_brand'].toUpperCase() + ')';
		html +=			'&nbsp;' + value['curr_medicine_dose'];
		html +=			'&emsp; #' + value['curr_medicine_qty'];
		html += '	</div>';

		if( typeof value['curr_medicine_sig'] != 'undefined'  &&  value['curr_medicine_sig'].length > 0 ){
			html += '	<div class="col-12" style="text-align: left; margin-left: 10%;">';
			html += '	Sig: &emsp;' + value['curr_medicine_sig'];
		}
        if(typeof value['curr_medicine_remark'] != 'undefined' && value['curr_medicine_remark'].length > 0 ){
			html += '	<div class="col-12" style="text-align: left;">';
			html += '' + '( ' +value['curr_medicine_remark']+ ' )';
		}

		html += '	</div>';
		html += '</div>';

		med_ctr++;

	});

	$(_elem_id).html(html);
}


function get_clinic_form_header(){

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

			if(status == "success"){

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
            }else{
                //showToastNotification("Error!", message);
            }

        },
        error: function (error) {
            //showToastNotification("Error!", error);
        }
    });

}
