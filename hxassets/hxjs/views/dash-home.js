var doctorData = {};
$(document).ready(function(){
	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){
            //console.log(prof_data[0].signature);
            doctorData = prof_data[0];
		 	getEvents();
		 	//getSchedule(prof_data);

		 	//update by emrick 8/14/2024
		 	var userid =  doctorData['user_id'];
		 	var secretary_acc =  doctorData['secretary_acc'];
		 	var sec_clinic_id =  doctorData['sec_clinic_id'];
		 	var secretary_fname =  doctorData['secretary_fname'];
		 	var secretary_lname =  doctorData['secretary_lname'];
            checkSchedule(userid,secretary_acc,sec_clinic_id,secretary_fname,secretary_lname);
		}else{
			forceLogout();
		}
	});

    // $("#test-btn").on("click",function() {
    //     checkSchedule();
    // });

	$(".close-clinic-popup").on("click",function() {
		menu("schedule-notif","close",250);
	});

	$("#accept-clinic-popup").on("click",function() {
		//showToastNotification("Clock in Successful","You have now clock in to clinic.");
        var clinic_id = $(this).attr("clinic-id");
        setActiveClinic(clinic_id,true,$(this));
	});

	function getEvents(){

		let data = {
			"keyword": "get-doctor-events",
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
			success: function (data) {

				let status = data.status;
				let message = data.message;
				let events = data.json;
				let event_html = "";

				if(status == "success"){

					if( !$.isEmptyObject(events) ){
						$.each(events, function(key, value){

							event_html += '<div class="splide__slide" style="max-width: 550px;">';
		                    event_html += '    <div class="card rounded-l mx-2 text-center shadow-l" data-card-height="320" style="background-image: url('+value['image']+'); height: 320px;">';
		                    event_html += '        <div class="card-bottom">';
		                    event_html += '            <h1 class="font-24 font-700">'+value['name']+'</h1>';
		                    event_html += '            <p class="boxed-text-xl">';
		                    event_html += '                '+value['remarks'];
		                    event_html += '            </p>';
		                    event_html += '        </div>';
		                    event_html += '        <div class="card-overlay bg-gradient-fade"></div>';
		                    event_html += '    </div>';
		                    event_html += '</div>';

						});
					}

					$("#dash-home-event-list").html(event_html);

					createSplideSlide("dash-home-event-slider");
					//next
					getAnnoucements();

				}else{
					showToastNotification("Error!", message);
				}
			},
			error: function (error) {
				showToastNotification("Error!", error);
			}
		});

	}

	function getAnnoucements(){

		let data = {
			"keyword": "get-doctor-announcements",
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
				let annoucements = data.json;
				let announce_html = "";

				if(status == "success"){

					if( !$.isEmptyObject(annoucements) ){
						$.each(annoucements, function(key, value){

							announce_html += '<a href="#">';
							announce_html += '	<div class="d-flex mb-3">';
							announce_html += '		<div class="align-self-center">';
							announce_html += '			<h5 class="font-500 font-15 pb-1">'+value['name']+'</h5>';
							announce_html += '			<span class="badge text-uppercase px-2 py-1 bg-green-dark">'+value['status']+'</span>';
							announce_html += '			<span class="color-theme font-11 ps-2 opacity-50">'+value['created_date']+'</span>';
							announce_html += '		</div>';
							announce_html += '		<div class="align-self-center ms-auto">';
							announce_html += '			<img src="'+value['image']+'" class="rounded-m ms-3" width="90">';
							announce_html += '		</div>';
							announce_html += '	</div>';
							announce_html += '</a>';
							announce_html += '<div class="divider mb-3"></div>';

						});
					}

					$("#dash-home-announcement-list").html(announce_html);

					//get conneceted patients
					getPatients("dash-home-patient-list", "approved");

				}else{
					showToastNotification("Error!", message);
				}

			},
			error: function (error) {
				showToastNotification("Error!", error);
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
						$.each(patients, function(key, value){

							let patient_info = value['patient_info'][0];

							patient_html += '<div class="splide__slide">';
	                        patient_html += '    <div class="text-center">';
	                        patient_html += '        <img src="../hxassets/hximages/avatars/1s.png" width="55" height="55" class="rounded-xl shadow-l gradient-blue">';
	                        patient_html += '        <p>'+patient_info['first_name']+' '+patient_info['last_name']+'</p>';
	                        patient_html += '    </div>';
	                        patient_html += '</div>';

							patientlist_ctr++;
						});
					}

					$("#" + _elem_id).html(patient_html);

					createSplideSlide("user-slider-1", 5);

				}else{
					showToastNotification("Error!", message);
				}

			},
			error: function (error) {
				showToastNotification("Error!", error);
			}
		});

	}


	// function getSchedule(prof_data) {
    //
	// 	var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	// 	var doctorData = {};
	// 	if(prof_data.length>0){
	// 		doctorData = prof_data[0];
	// 	}
    //
	// 	var d = new Date();
	// 	var dayName = days[d.getDay()];
	// 	dayName = "Sunday";
	// 	var day_key = "";
	// 	let where = {
	// 		access_token: actokensec
	// 	};
    //
	// 	$day_key = "monday_schedule";
	// 	if(dayName=="Monday"){
	// 		where.is_online_monday = true;
	// 		day_key = "monday_schedule";
	// 	} else if(dayName=="Tuesday") {
	// 		where.is_online_tuesday= true;
	// 		day_key = "tuesday_schedule";
	// 	} else if(dayName=="Wednesday") {
	// 		where.is_online_wednesday= true;
	// 		day_key = "wednesday_schedule";
	// 	} else if(dayName=="Thursday") {
	// 		where.is_online_thursday= true;
	// 		day_key = "thursday_schedule";
	// 	} else if(dayName=="Friday") {
	// 		where.is_online_friday= true;
	// 		day_key = "friday_schedule";
	// 	} else if(dayName=="Saturday") {
	// 		where.is_online_saturday = true;
	// 		day_key = "saturday_schedule";
	// 	} else if(dayName=="Sunday") {
	// 		where.is_online_sunday = true;
	// 		day_key = "sunday_schedule";
	// 	}
    //
	// 	var time = d.getHours();
	// 	var has_valid_clinic_notif = false;
	// 	var clinicName = "";
	// 	var clinicId = "";
	// 	var clinicStartTime = "";
	// 	var clinicEndTime = "";
	// 	var doctorLastName = doctorData.last_name;
    //
	// 	var html = "";
    //
    //     is_clinic_exist(clinic_schedule_table, false,where).then((prof_data) => {
	// 			$.each(prof_data, function(key, value){
	// 				var html_clinic = "";
	// 				var clinicName = value.clinic_name;
	// 				var scheduleLabel = "";
	// 				var scheDule = value[day_key];
    //
	// 				html_clinic += "<br/>"+clinicName+"";
	// 				$.each(scheDule, function(i, sched){
	// 					var start_time_val = sched.start_time;
	// 					var end_time_val = sched.end_time;
	// 					start_time_val = getTimeValue(start_time_val);
	// 					end_time_val = getTimeValue(end_time_val);
    //
	// 					if( parseInt(time) <= parseInt(end_time_val) && parseInt(time) >= parseInt(start_time_val)){
	// 						clinicName = clinicName;
	// 						clinicId = prof_data.clinic_id;
	// 						clinicStartTime = start_time_val;
	// 						clinicEndTime = end_time_val;
	// 						has_valid_clinic_notif = true;
	// 						return false;
	// 					}
	// 				});
    //
	// 				if(has_valid_clinic_notif){
	// 					return false;
	// 				}
	// 			});
    //
	// 			if( has_valid_clinic_notif) {
	// 				let html = '';
	// 			 	html += "Good morning Doctor "+doctorLastName;
	// 				html += "<br/>You have schedule at "+clinicName;
	// 				html += "<br/>From: "+clinicStartTime+" - "+clinicEndTime;
	// 				html += "<br>Would you like to Sign in?"
	// 				$("#schedule-text").html(html);
	// 				menu("schedule-notif","show",2000);
	// 			}
	// 	});
    //
	// }
});

// function getTimeValue(timeString) {
// 	var time = timeString;
// 	var hours = Number(time.match(/^(\d+)/)[1]);
// 	var minutes = Number(time.match(/:(\d+)/)[1]);
//
//     var AMPM = time.match(/\s(.*)$/)[1];
// 	if(AMPM == "PM" && hours<12) hours = hours+12;
// 	if(AMPM == "AM" && hours==12) hours = hours-12;
//
// 	var sHours = hours.toString();
// 	var sMinutes= minutes.toString();
//
// 	return sHours;
//
// }
