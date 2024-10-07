var has_request = false;

$(document).ready(function(){

	 //onClick
	 $("#btn-register").on("click",function(){

		 if(!has_request) {
	  		has_request = true;
	 		process_register();
		 }
	 });

	 function process_register(){

	    var firstName = $('#first-name').val();
	    var lastName = $('#last-name').val();
	    var email = $('#email').val();
	    var password = $('#password').val();
     	var passwordConfirmation = $('#password-confirmation').val();
     	var phone = $('#phone').val();
 		var username = $('#email').val();



		if(firstName.length <= 0){
	        has_request = false;
	        modalMessage = "First name is required";
	        console.log(modalMessage);
	        showMessage("modal-warning",modalMessage,"Warning!",500)
	        //showMessage("modal-success",modalMessage,"Warning!",500)
			return false;
		}

		if(lastName.length <= 0){
	        has_request = false;
	        modalMessage = "Last name is required";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}

		if(email.length <= 0){
	        has_request = false;
	        modalMessage = "Email is required";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}

		if(!validateEmail(email)){
	        has_request = false;
	        modalMessage = "Invalid Email";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}

		if(phone.length <= 9){
	        has_request = false;
	        modalMessage = "Phone Number is required";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}

		// if(username.length <= 0){
	    //     has_request = false;
	    //     modalMessage = "Username is required";
	    //     showMessage("modal-warning",modalMessage,"Warning!",500)
		// 	return false;
		// }

		// if(username.length <= 5){
	    //     has_request = false;
	    //     modalMessage = "Invalid username";
	    //     showMessage("modal-warning",modalMessage,"Warning!",500)
		// 	return false;
		// }

		if(password.length <= 0){
	        has_request = false;
	        modalMessage = "Password is required";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}

		if(password != passwordConfirmation){
	        has_request = false;
	        modalMessage = "Password does not match";
	        showMessage("modal-warning",modalMessage,"Warning!",500)
			return false;
		}



		let data = {
			"keyword": "register_doctor",
			"first_name":firstName,
			"last_name":lastName,
			"username":username,
			"email_address":email,
			"mobile_number":phone,
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

				let status = data.status;
				let message = data.message;

				if(status == "success"){
					//alert("Registration Completed You will be redirected to login page.");
					message = "Registration Completed You will be redirected to login page.";
	                 showMessage("modal-success",message,"Success!",500)
					window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=dash-profile")
	                //redirect
				}else{

	                 showMessage("modal-warning",message,"Warning!",500)
				}

				has_request = false;

			},
			error: function (error) {
				console.log(error);
            	showMessage("modal-warning",error,"Warning!",500)

				has_request = false;
			}
		});
	}

});
