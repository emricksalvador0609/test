
var hospitalList = {};
// var clinicList = {};
//var clinicListWithHospital  = {};

$(document).ready( function(){

	requestHospitalList();
	// requestClinicList();

	$(".add-time").on("click" ,function(){
		 var parent_div = $(this).attr("parent-root-div");
 		 var time_range_container = $("#"+parent_div+" .time-range-container");
		 var html = getDrawTimeRange(parent_div,"","");
		 time_range_container.append(html);

	});

	$(document).on("click",".remove-time-range" ,function(){
		var parent_row = $(this).closest(".time-range ");
		parent_row.remove();
	});

    //edit-clinic
    $(document).on("click",".edit-clinic" ,function(){
        clearClinicInputs();
        var clinic_id = $(this).attr("clinic-id");
        var clinic_pk = $(this).attr("clinic-realid");
        var data = clinicData[clinic_id];

        $(".time-range").remove();
        $("#action-sheet-clinic").find("input:checkbox").prop('checked', false);
        $(".time-range-container").parent().removeClass("show");

         $("#secretary-temp-password").parent().hide();
          $("#secretary-confirm-temp-password").parent().hide();

        $("#dash-patient-save-clinic").parent().hide();
        $("#dash-patient-edit-clinic").parent().show();

        if(typeof data != 'undefined') {
            showEditClinicView(data,clinic_pk);
        } else {
            showToastNotification("Error!", "Sorry we're unable to find clinic data.","error");
        }
    });


	// $(document.body).on("change","#hospital-list",function(){
	//  	setClinicList(this.value);
    //
	// });


    $("#dash-patient-edit-clinic").click(function(){

        let _this = $(this);

		var selected_hospital_id  = $("#hospital-list").val();
		var clinic_name =  $("#clinic-name").val();
		var clinic_address =  $("#clinic-address").val();
		var clinic_header =  $("#clinic-header").val();
        var clinic_type = $("#clinic-type").val();
        var clinic_id = $("#clinic_pk").val();
        var schedule_id = $("#clinic_schedule_pk").val();
        var clinic_phone_number = $("#clinic-phone-number").val();

		var is_toggle_monday = $("#toggle-monday").is(":checked")
		var is_toggle_tuesday = $("#toggle-tuesday").is(":checked")
		var is_toggle_wednesday = $("#toggle-wednesday").is(":checked")
		var is_toggle_thursday = $("#toggle-thursday").is(":checked")
		var is_toggle_friday = $("#toggle-friday").is(":checked")
		var is_toggle_saturday = $("#toggle-saturday").is(":checked")
		var is_toggle_sunday = $("#toggle-sunday").is(":checked")

		var monday_schedule_json = [];
		if(is_toggle_monday) {

			var monday_container = $("#monday-time-container .time-range-container");
            var is_valid_monday = true;
            var error_msg_monday = "";

            if (monday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on monday", "error");
                return;
            }

			monday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_monday = false;
                        error_msg_monday ="Invalid time on Monday schedule";
                        return;
                    }
					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};
					monday_schedule_json.push(itemobj);

				}  else {
                    is_valid_monday = false;
                    error_msg_monday ="Monday schedule Start time and End time are required.";
                    return false;
                }
			});
            if(is_valid_monday==false){
                showToastNotification("Error!",error_msg_monday, "error");
                return;
            }

		}

		var tuesday_schedule_json = [];
		if(is_toggle_tuesday) {

            var tuesday_container = $("#tuesday-time-container .time-range-container");
            var is_valid_tuesday = true;
            var error_msg_tuesday = "";

            if (tuesday_container.children('.time-range').length <= 0) {
               showToastNotification("Error!","Please add time schedule on tuesday", "error");
               return;
            }

            tuesday_container.children('.time-range').each(function () {
               let _this = $(this);
               var start_time = _this.find(".start-time");
               var end_time = _this.find(".end-time");

               var start_time_val = start_time.val();
               var end_time_val = end_time.val();

               if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                   if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                       is_valid_tuesday = false;
                       error_msg_tuesday ="Invalid time on Tuesday schedule";
                       return;
                   }
                   var itemobj = {
                       "start_time":start_time_val,
                       "end_time":end_time_val
                   };
                   tuesday_schedule_json.push(itemobj);

               }  else {
                   is_valid_tuesday = false;
                   error_msg_tuesday ="Tuesday schedule Start time and End time are required.";
                   return false;
               }
            });
            if(is_valid_tuesday==false){
               showToastNotification("Error!",error_msg_tuesday, "error");
               return;
            }

		}

		var wednesday_schedule_json = [];
		if(is_toggle_wednesday) {

            var wednesday_container = $("#wednesday-time-container .time-range-container");
            var is_valid_wednesday = true;
            var error_msg_wednesday = "";

            if (wednesday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on wednesday", "error");
                return;
            }

            wednesday_container.children('.time-range').each(function () {
                let _this = $(this);
                var start_time = _this.find(".start-time");
                var end_time = _this.find(".end-time");

                var start_time_val = start_time.val();
                var end_time_val = end_time.val();

                if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_wednesday = false;
                        error_msg_wednesday ="Invalid time on Wednesday schedule";
                        return;
                    }
                    var itemobj = {
                        "start_time":start_time_val,
                        "end_time":end_time_val
                    };
                    wednesday_schedule_json.push(itemobj);

                }  else {
                    is_valid_wednesday = false;
                    error_msg_wednesday ="Wednesday schedule Start time and End time are required.";
                    return false;
                }
            });
            if(is_valid_wednesday==false){
                showToastNotification("Error!",error_msg_wednesday, "error");
                return;
            }
		}

		var thursday_schedule_json = [];
		if(is_toggle_thursday) {

            var thursday_container = $("#thursday-time-container .time-range-container");
            var is_valid_thursday = true;
            var error_msg_thursday = "";

            if (thursday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on thursday", "error");
                return;
            }

            thursday_container.children('.time-range').each(function () {
                let _this = $(this);
                var start_time = _this.find(".start-time");
                var end_time = _this.find(".end-time");

                var start_time_val = start_time.val();
                var end_time_val = end_time.val();

                if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_thursday = false;
                        error_msg_thursday ="Invalid time on Thursday schedule";
                        return;
                    }
                    var itemobj = {
                        "start_time":start_time_val,
                        "end_time":end_time_val
                    };
                    thursday_schedule_json.push(itemobj);

                }  else {
                    is_valid_thursday = false;
                    error_msg_thursday ="Thursday schedule Start time and End time are required.";
                    return false;
                }
            });
            if(is_valid_thursday==false){
                showToastNotification("Error!",error_msg_thursday, "error");
                return;
            }
		}

		var friday_schedule_json = [];
		if(is_toggle_friday) {

            var friday_container = $("#friday-time-container .time-range-container");
            var is_valid_friday = true;
            var error_msg_friday = "";

            if (friday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on friday", "error");
                return;
            }

            friday_container.children('.time-range').each(function () {
                let _this = $(this);
                var start_time = _this.find(".start-time");
                var end_time = _this.find(".end-time");

                var start_time_val = start_time.val();
                var end_time_val = end_time.val();

                if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_friday = false;
                        error_msg_friday ="Invalid time on Friday schedule";
                        return;
                    }
                    var itemobj = {
                        "start_time":start_time_val,
                        "end_time":end_time_val
                    };
                    friday_schedule_json.push(itemobj);

                }  else {
                    is_valid_friday = false;
                    error_msg_friday ="Friday schedule Start time and End time are required.";
                    return false;
                }
            });
            if(is_valid_friday==false){
                showToastNotification("Error!",error_msg_friday, "error");
                return;
            }
		}

		var saturday_schedule_json = [];
		if(is_toggle_saturday) {

            var saturday_container = $("#saturday-time-container .time-range-container");
            var is_valid_saturday = true;
            var error_msg_saturday = "";

            if (saturday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on saturday", "error");
                return;
            }

            saturday_container.children('.time-range').each(function () {
                let _this = $(this);
                var start_time = _this.find(".start-time");
                var end_time = _this.find(".end-time");

                var start_time_val = start_time.val();
                var end_time_val = end_time.val();

                if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_saturday = false;
                        error_msg_saturday ="Invalid time on Saturday schedule";
                        return;
                    }
                    var itemobj = {
                        "start_time":start_time_val,
                        "end_time":end_time_val
                    };
                    saturday_schedule_json.push(itemobj);

                }  else {
                    is_valid_saturday = false;
                    error_msg_saturday ="Saturday schedule Start time and End time are required.";
                    return false;
                }
            });
            if(is_valid_saturday==false){
                showToastNotification("Error!",error_msg_saturday, "error");
                return;
            }
		}

		var sunday_schedule_json = [];
		if(is_toggle_sunday) {
            var sunday_container = $("#sunday-time-container .time-range-container");
            var is_valid_sunday = true;
            var error_msg_sunday = "";

            if (sunday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on sunday", "error");
                return;
            }

            sunday_container.children('.time-range').each(function () {
                let _this = $(this);
                var start_time = _this.find(".start-time");
                var end_time = _this.find(".end-time");

                var start_time_val = start_time.val();
                var end_time_val = end_time.val();

                if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_sunday = false;
                        error_msg_sunday ="Invalid time on Sunday schedule";
                        return;
                    }
                    var itemobj = {
                        "start_time":start_time_val,
                        "end_time":end_time_val
                    };
                    sunday_schedule_json.push(itemobj);

                }  else {
                    is_valid_sunday = false;
                    error_msg_sunday ="Sunday schedule Start time and End time are required.";
                    return false;
                }
            });
            if(is_valid_sunday==false){
                showToastNotification("Error!",error_msg_sunday, "error");
                return;
            }
		}


        if (clinic_name == "") {
            showToastNotification("Error!", "Please enter Clinic name.","error");
            $("#clinic-name").focus();
            return;
        }

        if (clinic_type == "" ||  clinic_type == null) {
            showToastNotification("Error!", "Please enter Clinic Type.","error");
            $("#clinic-type").focus();
            return;
        }

        if (clinic_address == "" ||  clinic_address == null) {
            showToastNotification("Error!", "Please enter Clinic Address.","error");
            $("#clinic-address").focus();
            return;
        }

        // if (clinic_header == "") {
        //     showToastNotification("Error!", "Please enter Clinic Header.","error");
        //     $("#clinic-header").focus();
        //     return;
        // }

        // adding secretary fields validation start here
        // added by emrick 8/12/2024
        var secretary_firstname = null;
        var secretary_lastname = null;
        var secretary_email = null;
        var secretary_phone = null;
        var secretary_password = null;
        var secretary_confirmpassword = null;


         // validation for secretary added by emrick 8/13/2024
      

        var number_row = $("div[id='row']").length;


        var secstat = 0;

        if(number_row!=0){
            var ids = $('.secrow').map(function() {
              return $(this).data('id');
            });

            secstat = 1;

            secretary_firstname = $("#secretary-first-name1").val();
            secretary_lastname = $("#secretary-last-name1").val();
            secretary_email = $("#secretary-email1").val();
            secretary_phone = $("#secretary-phone-number1").val();
            secretary_password = $("#secretary-temp-password1").val();
            secretary_confirmpassword = $("#secretary-confirm-temp-password1").val();

            if(secretary_firstname.length <= 0){
                has_request = false;
                modalMessage = "First name is required";
                console.log(modalMessage);
                showMessage("modal-warning",modalMessage,"Warning!",500)
                //showMessage("modal-success",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_lastname.length <= 0){
                has_request = false;
                modalMessage = "Last name is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_email.length <= 0){
                has_request = false;
                modalMessage = "Email is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(!validateEmail(secretary_email)){
                has_request = false;
                modalMessage = "Invalid Email";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_phone.length <= 9){
                has_request = false;
                modalMessage = "Phone Number is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            // if(username.length <= 0){
            //     has_request = false;
            //     modalMessage = "Username is required";
            //     showMessage("modal-warning",modalMessage,"Warning!",500)
            //  return false;
            // }

            // if(username.length <= 5){
            //     has_request = false;
            //     modalMessage = "Invalid username";
            //     showMessage("modal-warning",modalMessage,"Warning!",500)
            //  return false;
            // }

            if(secretary_password.length <= 0){
                has_request = false;
                modalMessage = "Password is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_password != secretary_confirmpassword){
                has_request = false;
                modalMessage = "Password does not match";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }
        }

        // adding secretary fields validation end here



	  	let data = {
            "keyword": "update-clinic",
            "clinic_id":clinic_id,
            "schedule_id":schedule_id,
			"selected_hospital_id":selected_hospital_id,
			"clinic_name": clinic_name,
            "clinic_type": clinic_type,
			"clinic_address": clinic_address,
			"clinic_header":clinic_header,
            "clinic_phone_number":clinic_phone_number,
			"monday_schedule":monday_schedule_json,
			"tuesday_schedule":tuesday_schedule_json,
			"wednesday_schedule":wednesday_schedule_json,
			"thursday_schedule":thursday_schedule_json,
			"friday_schedule":friday_schedule_json,
			"saturday_schedule":saturday_schedule_json,
			"sunday_schedule":sunday_schedule_json,
			"actokensec": actokensec,
            // fields for secretary added by emrick 8/13/2024
            "first_name":secretary_firstname,
            "last_name":secretary_lastname,
            "username":secretary_email,
            "email_address":secretary_email,
            "mobile_number":secretary_phone,
            "password":secretary_password,
            "ifadding":secstat,
			"platform": "web",
		};

		_this.attr("disabled", true).text("Processing...");
        saveClinic(data,_this);

        $('#newinput').empty();

    });

	$("#dash-patient-save-clinic").click(function(){

		let _this = $(this);

		var selected_hospital_id  = $("#hospital-list").val();

		var clinic_name =  $("#clinic-name").val();
		var clinic_address =  $("#clinic-address").val();
		var clinic_header =  $("#clinic-header").val();
        var clinic_type = $("#clinic-type").val();
        var clinic_phone_number = $("#clinic-phone-number").val();

       

		var is_toggle_monday = $("#toggle-monday").is(":checked")
		var is_toggle_tuesday = $("#toggle-tuesday").is(":checked")
		var is_toggle_wednesday = $("#toggle-wednesday").is(":checked")
		var is_toggle_thursday = $("#toggle-thursday").is(":checked")
		var is_toggle_friday = $("#toggle-friday").is(":checked")
		var is_toggle_saturday = $("#toggle-saturday").is(":checked")
		var is_toggle_sunday = $("#toggle-sunday").is(":checked")

		var monday_schedule_json = [];
		if(is_toggle_monday) {

			var monday_container = $("#monday-time-container .time-range-container");
            var is_valid_monday = true;
            var error_msg_monday = "";

            if (monday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on monday", "error");
                return;
            }

			monday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();


				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_monday = false;
                        error_msg_monday ="Invalid time on Monday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};
					monday_schedule_json.push(itemobj);

				} else {
                    is_valid_monday = false;
                    error_msg_monday ="Monday schedule Start time and End time are required.";
                    return false;
                }
			});

            if(is_valid_monday==false){
                showToastNotification("Error!",error_msg_monday, "error");
                return;
            }

		}

		var tuesday_schedule_json = [];
		if(is_toggle_tuesday) {

			var tuesday_container = $("#tuesday-time-container .time-range-container");

            var is_valid_tuesday = true;
            var error_msg_tuesday = "";

            if (tuesday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on tuesday", "error");
                return;
            }

			tuesday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_tuesday = false;
                        error_msg_tuesday ="Invalid time on Tuesday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					tuesday_schedule_json.push(itemobj);

				}  else {
                    is_valid_tuesday = false;
                    error_msg_tuesday ="Tuesday schedule Start time and End time are required.";
                    return false;
                }
			});

            if(is_valid_tuesday==false){
                showToastNotification("Error!",error_msg_tuesday, "error");
                return;
            }
		}

		var wednesday_schedule_json = [];
		if(is_toggle_wednesday) {

			var wednesday_container = $("#wednesday-time-container .time-range-container");

            var is_valid_wednesday = true;
            var error_msg_wednesday = "";

            if (wednesday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on Wednesday", "error");
                return;
            }

			wednesday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_wednesday = false;
                        error_msg_wednesday ="Invalid time on Wednesday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					wednesday_schedule_json.push(itemobj);

				} else {
                    is_valid_wednesday = false;
                    error_msg_wednesday ="Wednesday schedule Start time and End time are required.";
                }
			});

            if(is_valid_wednesday==false){
                showToastNotification("Error!",error_msg_wednesday, "error");
                return;
            }
		}

		var thursday_schedule_json = [];
		if(is_toggle_thursday) {

			var thursday_container = $("#thursday-time-container .time-range-container");

            var is_valid_thursday = true;
            var error_msg_thursday = "";

            if (thursday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on Thursday", "error");
                return;
            }


			thursday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_thursday = false;
                        error_msg_thursday ="Invalid time on Thursday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					thursday_schedule_json.push(itemobj);

				}  else {
                    is_valid_thursday = false;
                    error_msg_thursday ="Thursday schedule Start time and End time are required.";
                }
			});

            if(is_valid_thursday==false){
                showToastNotification("Error!",error_msg_thursday, "error");
                return;
            }
		}

		var friday_schedule_json = [];
		if(is_toggle_friday) {

			var friday_container = $("#friday-time-container .time-range-container");

            var is_valid_friday = true;
            var error_msg_friday = "";

            if (friday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on Friday", "error");
                return;
            }


			friday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_friday = false;
                        error_msg_friday ="Invalid time on Friday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					friday_schedule_json.push(itemobj);

				}  else {
                    is_valid_friday = false;
                    error_msg_friday ="Friday schedule Start time and End time are required.";
                }
			});

            if(is_valid_friday==false){
                showToastNotification("Error!",error_msg_friday, "error");
                return;
            }
		}

		var saturday_schedule_json = [];
		if(is_toggle_saturday) {

			var saturday_container = $("#saturday-time-container .time-range-container");

            var is_valid_saturday = true;
            var error_msg_saturday = "";

            if (saturday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on Saturday", "error");
                return;
            }


			saturday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_saturday = false;
                        error_msg_saturday ="Invalid time on Saturday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					saturday_schedule_json.push(itemobj);

				}  else {
                    is_valid_saturday = false;
                    error_msg_saturday ="Saturday schedule Start time and End time are required.";
                }
			});

            if(is_valid_saturday==false){
                showToastNotification("Error!",error_msg_saturday, "error");
                return;
            }
		}

		var sunday_schedule_json = [];
		if(is_toggle_sunday) {

			var sunday_container = $("#sunday-time-container .time-range-container");

            var is_valid_sunday = true;
            var error_msg_sunday = "";

            if (sunday_container.children('.time-range').length <= 0) {
                showToastNotification("Error!","Please add time schedule on Sunday", "error");
                return;
            }

			sunday_container.children('.time-range').each(function () {
				let _this = $(this);
				var start_time = _this.find(".start-time");
				var end_time = _this.find(".end-time");

				var start_time_val = start_time.val();
				var end_time_val = end_time.val();

				if(start_time_val != "" && (typeof start_time_val) == "string"  && end_time_val != "" && (typeof end_time_val) == "string" ){

                    if(mapTime(start_time_val) >=  mapTime(end_time_val) ){
                        is_valid_sunday = false;
                        error_msg_sunday ="Invalid time on Sunday schedule";
                        return;
                    }

					var itemobj = {
						"start_time":start_time_val,
						"end_time":end_time_val
					};

					sunday_schedule_json.push(itemobj);
				} else {
                    is_valid_sunday = false;
                    error_msg_sunday ="Sunday schedule Start time and End time are required.";
                }
			});

            if(is_valid_sunday==false){
                showToastNotification("Error!",error_msg_sunday, "error");
                return;
            }
		}


        if (clinic_name == "") {
            showToastNotification("Error!", "Please enter Clinic name.","error");
            $("#clinic-name").focus();
            return;
        }

        if (clinic_type == "" ||  clinic_type == null) {
            showToastNotification("Error!", "Please enter Clinic Type.","error");
            $("#clinic-type").focus();
            return;
        }

        if (clinic_address == "") {
            showToastNotification("Error!", "Please enter Clinic Address.","error");
            $("#clinic-address").focus();
            return;
        }

        // if (clinic_header == "") {
        //     showToastNotification("Error!", "Please enter Clinic Header.","error");
        //     $("#clinic-header").focus();
        //     return;
        // }


        // adding secretary fields validation start here
        // added by emrick 8/12/2024
        var secretary_firstname = null;
        var secretary_lastname = null;
        var secretary_email = null;
        var secretary_phone = null;
        var secretary_password = null;
        var secretary_confirmpassword = null;


         // validation for secretary added by emrick 8/13/2024
      

        var number_row = $("div[id='row']").length;


        var secstat = 0;

        if(number_row!=0){
            var ids = $('.secrow').map(function() {
              return $(this).data('id');
            });

            secstat = 1;

            secretary_firstname = $("#secretary-first-name1").val();
            secretary_lastname = $("#secretary-last-name1").val();
            secretary_email = $("#secretary-email1").val();
            secretary_phone = $("#secretary-phone-number1").val();
            secretary_password = $("#secretary-temp-password1").val();
            secretary_confirmpassword = $("#secretary-confirm-temp-password1").val();

            if(secretary_firstname.length <= 0){
                has_request = false;
                modalMessage = "First name is required";
                console.log(modalMessage);
                showMessage("modal-warning",modalMessage,"Warning!",500)
                //showMessage("modal-success",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_lastname.length <= 0){
                has_request = false;
                modalMessage = "Last name is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_email.length <= 0){
                has_request = false;
                modalMessage = "Email is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(!validateEmail(secretary_email)){
                has_request = false;
                modalMessage = "Invalid Email";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_phone.length <= 9){
                has_request = false;
                modalMessage = "Phone Number is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            // if(username.length <= 0){
            //     has_request = false;
            //     modalMessage = "Username is required";
            //     showMessage("modal-warning",modalMessage,"Warning!",500)
            //  return false;
            // }

            // if(username.length <= 5){
            //     has_request = false;
            //     modalMessage = "Invalid username";
            //     showMessage("modal-warning",modalMessage,"Warning!",500)
            //  return false;
            // }

            if(secretary_password.length <= 0){
                has_request = false;
                modalMessage = "Password is required";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }

            if(secretary_password != secretary_confirmpassword){
                has_request = false;
                modalMessage = "Password does not match";
                showMessage("modal-warning",modalMessage,"Warning!",500)
                return false;
            }
        }

        // adding secretary fields validation end here



	  	let data = {
			"keyword": "add-clinic",
			"selected_hospital_id":selected_hospital_id,
			"clinic_name": clinic_name,
            "clinic_type": clinic_type,
			"clinic_address": clinic_address,
			"clinic_header":clinic_header,
            "clinic_phone_number":clinic_phone_number,
			"monday_schedule":monday_schedule_json,
			"tuesday_schedule":tuesday_schedule_json,
			"wednesday_schedule":wednesday_schedule_json,
			"thursday_schedule":thursday_schedule_json,
			"friday_schedule":friday_schedule_json,
			"saturday_schedule":saturday_schedule_json,
			"sunday_schedule":sunday_schedule_json,
			"actokensec": actokensec,
            // fields for secretary added by emrick 8/13/2024
            "first_name":secretary_firstname,
            "last_name":secretary_lastname,
            "username":secretary_email,
            "email_address":secretary_email,
            "mobile_number":secretary_phone,
            "password":secretary_password,
            "ifadding":secstat,
			"platform": "web",
		};


		_this.attr("disabled", true).text("Processing...");
	  	saveClinic(data,_this);
        
        $('#newinput').empty();
    
	});


	function saveClinic(data,element) {

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
	 			if(status=="success"){
			 		menu("action-sheet-clinic", 'hide', 250);
					showToastNotification("Successful!", message);
					getDoctorClinic();

				 } else {
					showToastNotification("Error!", message);
				 }

 				element.attr("disabled", false).text("SAVE CLINIC");
			},
			error: function (error) {
				showToastNotification("Error!", error);
 				element.attr("disabled", false).text("SAVE CLINIC");
			}
		});
	}

    


	function requestHospitalList(){

		let data = {
			"keyword": "hospital_list",
			"platform": "web",
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

	 			hospitalList = message;

	 			 $('#hospital-list').select2({
					width: '100%',
		            allowClear: true,
					data:  hospitalList,
	    			placeholder: "Select a hospital",

				});
			},
			error: function (error) {
				console.log(error);
			}
		});

	}

    

	// function requestClinicList() {
    //
	// 	let data = {
	// 		"keyword": "clinic_list",
	// 		"platform": "web",
	// 	};
    //
	// 	let jwt_data = jwt_encode(data);
    //
	// 	$.ajax({
	// 		url: baseApiUrl,
	// 		cache: true,
	// 		type: "POST",
	// 		data: jwt_data,
	// 		beforeSend: function (xhr) {
	// 			xhr.setRequestHeader ("Authorization", "Basic " + btoa(basicAuthUsername + ":" + basicAuthPass));
    //
	// 		},
	// 		success : function (data) {
    //
	// 			let status = data.status;
	// 			let message = data.message;
    //
	//  			clinicList = message;
    //
 	// 			 $('#clinic-list').select2({
	// 				width: '100%',
	// 	            allowClear: true,
	// 				data:  clinicList,
	//     			placeholder: "Select a Clinic",
    //
	// 			});
    //
	// 			for (var i=0; i < message.length; i++) {
	// 				var hospital_index = message[i].hospital_id;
	// 				if(!clinicListWithHospital.hasOwnProperty(message[i].hospital_id)){
	// 					clinicListWithHospital[hospital_index] = new Array();
	// 				}
	// 				clinicListWithHospital[hospital_index].push(message[i]);
	// 			}
	// 		},
	// 		error: function (error) {
	// 			console.log(error);
	// 		}
	// 	});
	// }

	// function setClinicList(index) {
	// 	var data = {}
	// 	if(index==""){
	// 		index = 0;
	// 		data = clinicList;
	// 	} else {
	// 		data = clinicListWithHospital[index];
	// 	}
    //
	// 	if(typeof clinicListWithHospital[index] != 'undefined') {
    //
	// 		 $('#clinic-list').html('').select2({data: [{id: '', text: ''}]});
	// 		 $('#clinic-list').select2({
	// 			width: '100%',
	//             allowClear: true,
	// 			data:  data,
    // 			placeholder: "Select a Clinic",
	// 		});
	// 	}
	// }






});

function showEditClinicView(data,clinic_pk) {
    $(".time-range-container .time-range").remove();
    $("#clinic_pk").val(data.clinic_id);
    $("#clinic_schedule_pk").val(data.PK);
    $("#clinic-name").val( data.clinic_name);
    $("#clinic-type").val( data.clinic_type);
    $("#clinic-address").val( data.clinic_address);
    $("#clinic-phone-number").val(data.phone_number);
    $('#hospital-list').select2().val(data.hospital_FK).trigger("change");

    if(data.is_online_monday && ( data.monday_schedule_json != "[]" || data.monday_schedule_json != "")){
        $("#toggle-monday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-monday").parent().parent().parent().addClass("collapsed");
        $("#monday-time-container").addClass("show");
        $("#toggle-monday").prop('checked', true);
        var monday_json_data  = JSON.parse(data.monday_schedule_json);
        var html = "";

        $.each(monday_json_data, function(key, value){
            var item_html = getDrawTimeRange("monday-time-container",value.start_time, value.end_time);
            $("#monday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_tuesday && ( data.tuesday_schedule_json != "[]" || data.tuesday_schedule_json != "")){
        $("#toggle-tuesday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-tuesday").parent().parent().parent().addClass("collapsed");
        $("#tuesday-time-container").addClass("show");
        $("#toggle-tuesday").prop('checked', true);
        var tuesday_json_data  = JSON.parse(data.tuesday_schedule_json);
        var html = "";

        $.each(tuesday_json_data, function(key, value){
            var item_html = getDrawTimeRange("tuesday-time-container",value.start_time, value.end_time);
            $("#tuesday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_wednesday && ( data.wednesday_schedule_json != "[]" || data.wednesday_schedule_json != "")){
        $("#toggle-wednesday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-wednesday").parent().parent().parent().addClass("collapsed");
        $("#wednesday-time-container").addClass("show");
        $("#toggle-wednesday").prop('checked', true);
        var wednesday_json_data  = JSON.parse(data.wednesday_schedule_json);
        var html = "";

        $.each(wednesday_json_data, function(key, value){
            var item_html = getDrawTimeRange("wednesday-time-container",value.start_time, value.end_time);
            $("#wednesday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_thursday && ( data.thursday_schedule_json != "[]" || data.thursday_schedule_json != "")){
        $("#toggle-thursday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-thursday").parent().parent().parent().addClass("collapsed");
        $("#thursday-time-container").addClass("show");
        $("#toggle-thursday").prop('checked', true);
        var thursday_json_data  = JSON.parse(data.thursday_schedule_json);
        var html = "";

        $.each(thursday_json_data, function(key, value){
            var item_html = getDrawTimeRange("thursday-time-container",value.start_time, value.end_time);
            $("#thursday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_friday && ( data.friday_schedule_json != "[]" || data.friday_schedule_json != "") ){
        $("#toggle-friday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-friday").parent().parent().parent().addClass("collapsed");
        $("#friday-time-container").addClass("show");
        $("#toggle-friday").prop('checked', true);
        var friday_json_data  = JSON.parse(data.friday_schedule_json);
        var html = "";

        $.each(friday_json_data, function(key, value){
            var item_html = getDrawTimeRange("friday-time-container",value.start_time, value.end_time);
            $("#friday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_saturday  && ( data.saturday_schedule_json != "[]" || data.saturday_schedule_json != "") ){
        $("#toggle-saturday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-saturday").parent().parent().parent().addClass("collapsed");
        $("#saturday-time-container").addClass("show");
        $("#toggle-saturday").prop('checked', true);
        var saturday_json_data  = JSON.parse(data.saturday_schedule_json);
        var html = "";

        $.each(saturday_json_data, function(key, value){
            var item_html = getDrawTimeRange("saturday-time-container",value.start_time, value.end_time);
            $("#saturday-time-container .time-range-container").append(item_html);
        });
    }

    if(data.is_online_sunday && ( data.sunday_schedule_json != "[]" || data.sunday_schedule_json != "") ){
        $("#toggle-sunday").parent().parent().parent().attr("aria-expanded",true);
        $("#toggle-sunday").parent().parent().parent().addClass("collapsed");
        $("#sunday-time-container").addClass("show");
        $("#toggle-sunday").prop('checked', true);
        var sunday_json_data  = JSON.parse(data.sunday_schedule_json);
        var html = "";

        $.each(sunday_json_data, function(key, value){
            console.log(value.start_time);

            var item_html = getDrawTimeRange("sunday-time-container",value.start_time, value.end_time);
            //console.log(item_html);
            $("#sunday-time-container .time-range-container").append(item_html);
        });
    }

    // added by emrick 8/13/2024
   // console.log(data.secretary_infos);

    // var secretary_infos_jsondata  = JSON.parse(data.secretary_infos);

let clinic_html2 = "";

    $.each(data.secretary_infos, function(key, value){
        //console.log(value);

        
    console.log(clinic_pk+' '+value.clinic_id)
    if(clinic_pk==value.clinic_id){


   checked2 = "";
    if(value.status=="Active"){
            checked2 = "checked";
    }


            clinic_html2 += '<div class="row justify-content-center  mb-0">';
            clinic_html2 += ' <div class="col-12">';
            clinic_html2 += '   <div class="d-flex no-effect collapsed"'+ 
                                   'data-trigger-switch="toggle-'+value.secretary_id+'"'+ 
                                   'data-bs-toggle="collapse"'+ 
                                   'href="#'+value.secretary_id+'-name-container" role="button"'+ 
                                   'aria-expanded="false" '+
                                   'aria-controls="'+value.secretary_id+'-name-container">';
            clinic_html2 += '       <div class="pt-2 mt-1">';
            clinic_html2 += '          <h5 class="font-600 font-14" id="'+value.secretary_id+'_name">'+value.first_name+' '+value.last_name+'</h5>';
            clinic_html2 += '       </div>';
            clinic_html2 += '       <div class="ms-auto me-4 pe-2">';
            clinic_html2 += '         <div class="ios-switch">';
            clinic_html2 += '            <input type="checkbox" class="ios-input" id="toggle-'+value.secretary_id+'" '+checked2+'>';
            clinic_html2 += '            <label class="custom-control-label" for="toggle-'+value.secretary_id+'"></label>';
            clinic_html2 += '         </div>';
            clinic_html2 += '       </div>';
            clinic_html2 += '   </div>';
            clinic_html2 += ' </div>';
            clinic_html2 += '</div>';

 
}

    

     });    

 $("#dash-profile-sec-div").html(clinic_html2);   


    menu("action-sheet-clinic","show",250);
}

    


function getDrawTimeRange(parent,start,end) {

    var hours_start = [
        "", "12:00 AM","01:00 AM","02:00 AM","03:00 AM","04:00 AM","05:00 AM","06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM",
        "12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM","07:00 PM","08:00 PM","09:00 PM","10:00 PM","11:00 PM"
    ];

    var hours_html = "";
    $.each(hours_start, function(key, value){
        if(value == "") {
            if(value == start){
                hours_html += '<option value="'+value+'"  selected>Start Time</option>';
            } else {
                hours_html += '<option value="'+value+'">Start Time</option>';
            }

        } else {

            if(value == start){
                hours_html += '<option value="'+value+'"  selected>'+value+'</option>';
            } else {
                hours_html += '<option value="'+value+'" >'+value+'</option>';
            }
        }
    });


    var hours_end = [
        "","11:59 PM","10:00 PM","09:00 PM","08:00 PM", "07:00 PM", "06:00 PM","05:00 PM","04:00 PM","03:00 PM","02:00 PM","01:00 PM","12:00 PM",
        "11:00 AM", "10:00 AM", "09:00 AM", "08:00 AM", "07:00 AM", "06:00 AM","05:00 AM","04:00 AM","03:00 AM","02:00 AM","01:00 AM"
    ]

    var end_hours_html = "";
    $.each(hours_end, function(key, value){
        if(value == "") {
            if(value == end){
                end_hours_html += '<option value="'+value+'"  selected>End Time</option>';
            } else {
                end_hours_html += '<option value="'+value+'">End Time</option>';
            }
        } else {
            if(value == end){
                end_hours_html += '<option value="'+value+'"  selected>'+value+'</option>';
            } else {
                end_hours_html += '<option value="'+value+'" >'+value+'</option>';
            }
        }
    });



    var html = '<div class="time-range row mb-0" parent="'+parent+'">'+
        '<div class="col-5">'+
        '<div class="input-style has-borders no-icon ">'+
        '<label for="form5" class="color-highlight">Start Time</label>'+
         '<select class="start-time">'+
         hours_html+
        '</select>'+
        '<span><i class="fa fa-chevron-down"></i></span>'+
        '<i class="fa fa-check disabled valid color-green-dark"></i>'+
        '<i class="fa fa-check disabled invalid color-red-dark"></i>'+
        '<em></em>'+
        '</div>'+
        '</div>'+
        '<div class="col-5">'+
        '<div class="input-style has-borders no-icon ">'+
        '<label for="form5" class="color-highlight">End Time</label>'+
         '<select class="end-time" value='+end+'>'+
            end_hours_html+
        '</select>'+
        '<span><i class="fa fa-chevron-down"></i></span>'+
        '<i class="fa fa-check disabled valid color-green-dark"></i>'+
        '<i class="fa fa-check disabled invalid color-red-dark"></i>'+
        '<em></em>'+
        '</div>'+
        '</div>'+
        '<div class="col-2 remove-time-range-parent">'+
        '<i class="remove-time-range fa fa-close" style="font-size:22px;color:red"></i>'+
        '</div>'+
        '</div>'
        ;
    return html;
}

function clearClinicInputs() {
    $("#clinic-name").val("");
    $("#clinic-type").val("");
    $("#clinic-address").val("");
    $("#clinic-phone-number").val("");
    $('#hospital-list').select2().val("").trigger("change");
}
