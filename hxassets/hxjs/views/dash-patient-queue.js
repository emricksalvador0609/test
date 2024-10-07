$(document).ready(function(){

	is_logged_in(session_table, false).then((prof_data) => {

		if(typeof prof_data == "object" && prof_data.hasOwnProperty(0)){
		 	
		 	getTodaysPatients();
		 	//added by emrick 9/26/2024
		 	getrequestedconsult();
		 	getcountrequestedconsult();
		 	
		}else{
			forceLogout();
		}
	});
	
	function getTodaysPatients(){
	
		let data = {
			"keyword": "get-doctor-todays-patient",
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
				let patients = Object.values(data.json); 
				let patient_html = "";
				
				if(status == "success"){
					
					if( !$.isEmptyObject(patients) ){
						$.each(patients, function(key, value){ 
							
							let patient_info = value['patient_info'][0];
							patient_html += '<div class="col-xl-4 col-lg-6 ">';
								patient_html += '<div class="card">';
									patient_html += '<div class="card-body">';
										patient_html += '<div class="d-flex align-items-center">';

										    patient_html += '<img src="https://mdbootstrap.com/img/new/avatars/8.jpg" alt="" style="width: 45px; height: 45px" class="rounded-circle"/>';
										
											patient_html += '<div class="ms-3">';

											patient_html += '<a class="fw-bold mb-1" href="?hxcurrentpage=dash-patient-info&patient-no='+patient_info["formal_id"]+'">'+patient_info['first_name']+' '+patient_info['last_name']+'</a>';

											patient_html += '<p class="text-muted mb-0">Approval Date: Today - '+value['approval_date']+'</p>';
						                    patient_html += '</div>';
					                    patient_html += '</div>';
				                    patient_html += '</div>';
			                    patient_html += '</div>';
							patient_html += '</div>';
							patientlist_ctr++;
						});
						
					}else{
						
						patient_html += '<a class="mt-2" href="#">';
	                    patient_html += '    <span class="text-muted">No data found.</span>';
	                    patient_html += '</a>';
	                    
					}
					 

					$("#dash-patient-todays-count").text(patients.length);
					console.log('waiting_list'+patients.length);		
					$("#dash-patient-todays-list-div").html(patient_html);
					
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

	//added by emrick 9/26/2024
	function getcountrequestedconsult(){

        let data = {
            "keyword": "getcount-requested-bypatient",
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
                let request_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 


                        request_html += `${value['count']}`;
                    });

                    }else{
                        request_html += '0';

                    }   

               
                 $("#req_count_lbl").html(request_html);

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

    //added by emrick 9/26/2024
	function getrequestedconsult(){

        let data = {
            "keyword": "get-requested-bypatient",
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
                let request_html = "";

                if(status == "success"){
                    if( !$.isEmptyObject(patients) ){
                        $.each(patients, function(key, value){ 
                        var statusname = 'Pending';
                        var forbadge = 'primary';	

                        if(value['status']==0){
                        	statusname = 'Pending';
                        	forbadge = 'primary';
                        }else if(value['status']==1){
                        	statusname = 'Approved';
                        	forbadge = 'success';
                        }else if(value['status']==2){
                        	statusname = 'Declined';
                        	forbadge = 'danger';
                        }


                        request_html += `
                           	<a class="dropdown-item" href="#">
		                        <div class="d-flex justify-content-between">
		                            <div class="me-1"><b>${value['first_name']} ${value['last_name']}</b></div>
		                            <div class="ms-auto"> <span class="badge text-bg-${forbadge}">${statusname}</span></div>

		                        </div>
		                         <p class="fw-muted fs--7 mb-0">requested on: ${value['requested_date']}</p>
		                         <p class="fw-muted fs--7 mb-0 text-wrap lh-0">requested type: <span class="badge text-bg-warning">${value['request_type'] ?? '-'}</span></p>
		                    </a>`
		                if(value['status']==0){    
		                request_html +=`<div class="m-2 ms-3 mt-0">
		                      <button class="btn btn-success btn-sm p-2"  data-role="role_patientreq" data-id='${value['PK']}'>Approved</button>
		                      <button class="btn btn-danger btn-sm p-2">Declined</button>
	                        </div>`
		                    ;
		                }
                    });

                    }else{
                        request_html += 'No Requested yet..';

                    }   

               
                 $("#request_consul_list").html(request_html);

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

    $(document).on('click','button[data-role="role_patientreq"]', function() {
 	 	var pk = $(this).data('id');

	 	approvedrequestconsul(pk,1);
	});


    //added by emrick 9/26/2024
    function approvedrequestconsul(PK,status) {

	    let data = {
	        "keyword": "updatestatus-reqpatient-forconsult",
	        "PK": PK,
	        "status": status,
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

	            if(status == "success"){
	                showToastNotification("Success!", message);

	                $('#consultdoctorModal').modal('hide');
	                getrequestedconsult();
           			getTodaysPatients();
           			getcountrequestedconsult();
	            }else{	
	                showToastNotification("Error!", message,"error");

	                //access token error, redirect to login
	                if(typeof data.actokenerror && data.actokenerror){
	                    setTimeout(function(){
	                        window.location.replace(baseAppUrl+"hxviews/?hxcurrentpage=auth-login");
	                    }, 3000);
	                }
	            }


	        },
	        error: function (error) {
	            showToastNotification("Error!", error.responseText);
	        }
	    });

	}


	
});