var has_hxlogin_request = false;

$(document).ready(function(){

	is_logged_in(session_table).then((is_logged_in) => {
		console.log("is_logged_in: "+is_logged_in);
	});

	 //onClick
	 $("#btn-login").on("click",function(){

		 let _this = $(this);
		 _this.attr("disabled", true).text("Logging-in...");

		 if( !has_hxlogin_request ) {
	  		has_hxlogin_request = true;
	 		process_hxlogin();
		 }
	 });

});

function process_hxlogin(){

    var username = $('#username').val();
    var password = $('#password').val();

	if(username.length <= 0){
        has_hxlogin_request = false;
        modalMessage = "Oops! Username is required to sign in.";
        showMessage("modal-warning",modalMessage,"Warning!",500)

        $("#btn-login").attr("disabled", false).text("LOGIN");
		return false;
	}

	if(password.length <= 0){
        has_hxlogin_request = false;
        modalMessage = "Oops! Password is required to sign in.";
        showMessage("modal-warning",modalMessage,"Warning!",500)
        $("#btn-login").attr("disabled", false).text("LOGIN");
		return false;
	}

	let data = {
		"keyword": "login_doctor",
		"phone_number":username,
		"password":password,
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

            //console.log(data);
			let status = data.status;
			let message = data.message;

            var jwt_decode = parseJwt(message);

			if(status == "success"){

				if( isJson(jwt_decode)){
					var obj_session = JSON.parse(jwt_decode)
					if(obj_session["user_access_token"].length != 0){
						//save here
						var access_token_value = obj_session["user_access_token"];
						var first_name_value = obj_session["first_name"];
						var last_name_value = obj_session["last_name"];
						var phone_number_value = obj_session["phone_number"];
						var email_address_value = obj_session["email_address"];
						var user_id_value = obj_session["user_id"];
						var userlog_id_value = obj_session["userlog_id"];
						var sig2_number = obj_session["sig2_number"];
						var ptr_number = obj_session["ptr_number"];
						var license_number = obj_session["license_number"];
                        var picture = obj_session["picture"];
                        var signature = obj_session["signature"];
                        var title = obj_session["title"];
                        var medical_form_header = obj_session["medical_form_header"];
                        var license_no_exp_date = obj_session["license_no_exp_date"];
                        var ptr_no_exp_date = obj_session["ptr_no_exp_date"];
                        var sig_2_no_exp_date = obj_session["sig_2_no_exp_date"];
                        var date_of_birth = obj_session["date_of_birth"];
                        var gender = obj_session["gender"];
                        var prc_id_image = obj_session["prc_id_image"];

                        // variable for secretary added by emrick 8/13/2024
                        var secretary_acc = obj_session["secretary_acc"];
                        var secretary_id = obj_session["secretary_id"];
                        var sec_clinic_id = obj_session["clinic_id"];
                        var secretary_fname = obj_session["secretary_fname"];
                        var secretary_mname = obj_session["secretary_mname"];
                        var secretary_lname = obj_session["secretary_lname"];

						sessionObj = {
							user_id: user_id_value,
							userlog_id: userlog_id_value,
							user_access_token: access_token_value,
							first_name: first_name_value,
							last_name: last_name_value,
							phone_number: phone_number_value,
							email_address: email_address_value,
							sig2_number: sig2_number,
							ptr_number: ptr_number,
							license_number: license_number,
                            signature: signature,
                            picture: picture,
                            medical_form_header: medical_form_header,
                            title: title,
                            license_no_exp_date: license_no_exp_date,
                            ptr_no_exp_date: ptr_no_exp_date,
                            sig_2_no_exp_date: sig_2_no_exp_date,
                            gender: gender,
                            date_of_birth: date_of_birth,
                            sig_2_no_exp_date: sig_2_no_exp_date,
                            prc_id_image: prc_id_image,
                             // variable for secretary added by emrick 8/13/2024
                            secretary_acc: secretary_acc,
                            secretary_id: secretary_id,
                            sec_clinic_id: sec_clinic_id,
                            secretary_fname: secretary_fname,
                            secretary_mname: secretary_mname,
                            secretary_lname: secretary_lname,
						}

						//always clear session data on login
						jsstoresqlite_clear_table(session_table);

						jsstoresqlite_insert_data(session_table, [sessionObj]).then((insert) => {
							if(insert == 1) {

								window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=dash-home");
							} else {

								modalMessage = "Cannot insert login record, please try again.";
						        showMessage("modal-warning",modalMessage,"Warning!",500)

							}
						});

					} else {
						modalMessage = "Oops! We cannot retrieve your access token, please try again.";
				        showMessage("modal-warning",modalMessage,"Warning!",500)
					}
				} else {
					//showMessage("Oops! Something is wrong with the response of the server, please try again.", "warning-modal", "warning", 250);
			        modalMessage = "Oops! Something is wrong with the response of the server, please try again.";
			        showMessage("modal-warning",modalMessage,"Warning!",500)
				}

			}else{
				console.log("error:  " +  message);
		        showMessage("modal-warning",message,"Warning!",500)
			}

			has_hxlogin_request = false;
			$("#btn-login").attr("disabled", false).text("LOGIN");

		},
		error: function (error) {
			console.log(error);
			has_hxlogin_request = false;
			$("#btn-login").attr("disabled", false).text("LOGIN");
		}
	});
}
