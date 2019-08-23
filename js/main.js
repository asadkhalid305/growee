$(document).ready(() => {
    // global variables
    // var baseUrl = 'http://localhost:3010'
    var baseUrl = 'http://growee.local'
    var timer;

    //functions
    function getScanResults() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/wifi`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                action: "scan-results",
            }),
        })
            .done((data) => {
                console.log("Got scan results");
                console.log(data);
                if (data.success) {
                    $content = $("<div id=\"networks\"></div>");
                    for (var i = 0; i < data.count; i++) {
                        if (data.items[i].authtype == 5) {
                            // WPA2 Enterprise security - not supported
                            continue;
                        }

                        //generating dynamic id
                        $item = $("<div id=\"" + i + "\" class=\"network\" onclick=\"return on_network_click(this);\"></div>");
                        // check and reflect rssi
                        if (data.items[i].rssi < -80) {
                            $item.append("<img src=\"./img/layer561.png\" alt=\"wifi-signal-very-low\">");
                        } else if (data.items[i].rssi < -70) {
                            $item.append("<img src=\"./img/layer3_copy7.png\" alt=\"wifi-signal-low\">");
                        } else if (data.items[i].rssi < -60) {
                            $item.append("<img src=\"./img/layer558.png\" alt=\"wifi-signal-normal\">");
                        } else {
                            $item.append("<img src=\"./img/layer557.png\" alt=\"wifi-signal-good\">");
                        }
                        // AP name
                        $item.append("<a href=\"#\">" + data.items[i].ssid + "</a>");
                        // check and reflect authtype
                        if (data.items[i].authtype == 0) { // open AP
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer7.png\" alt=\"open\">");
                        } else if (data.items[i].authtype == 1) { // WEP security
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer4_copy3.png\" alt=\"badly-protected\">");
                        } else { // WPA/WPA2
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer4_copy4.png\" alt=\"protected\">");
                        }

                        $item.data("ssid", data.items[i].ssid);
                        $item.data("authtype", data.items[i].authtype);
                        $item.data("bssid", data.items[i].bssid);
                        $content.append($item);
                    }
                    $("#networks").replaceWith($content);
                } else {

                }
		$("#scan-btn").removeClass('disabled')
		timer = null;
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Get scan results failed");
		$("#scan-btn").removeClass('disabled')
		timer = null;
            });
    }

    function scan() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/wifi`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                action: "scan"
            }),
        })
            .done((data) => {
                console.log("Scan started");
                console.log(data);
                //location.assign('./networks.html')
		$("#scan-btn").addClass('disabled')
                timer = setTimeout(getScanResults, 5000);
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Scan failed");
            });
    }

    function login() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/auth`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                user: "admin",
                password: "growee"
            }),
        })
            .done((data) => {
                console.log("Login success");
                console.log(data);
                location.assign('./')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    }

    function storeLastTried() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/wifi`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                action: 'store-last-tried'
            }),
        })
            .done((data) => {
                console.log(data);
		location.assign("./registration.html");
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Store last tried AP failed");
		location.assign("./");
            });
    }
    function tryStatus () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/status`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                status: 'try-ap'
            }),
        })
            .done((data) => {
                console.log(data);
                timer = null;
		if (data.status <= 0) {
			$("#network-connect-btn").removeClass("disabled");
			$("#network-connect-btn").text("Connect");
		} else if (data.status == 6) {
			$("#network-connect-btn").text("Connected");
			timer = setTimeout(storeLastTried, 1000);
		} else {
		    switch(data.status) {
			case 1:
				$("#network-connect-btn").text("Preparing");
			break;
			case 2:
				$("#network-connect-btn").text("Scanning");
			break;
			case 3:
				$("#network-connect-btn").text("Connecting");
			break;
			case 4:
				$("#network-connect-btn").text("Retrieving IP");
			break;
			case 5:
				$("#network-connect-btn").text("Checking Internet");
			break;
			default:
			break;
		    }
		    timer = setTimeout(tryStatus, 1000);
		}
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                timer = null;
		timer = setTimeout(tryStatus, 1000);
            });
    }
    function tryAccessPoint() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/wifi`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                action: 'try-ap',
                ssid: sessionStorage.getItem('ssid'),
                pass: $("#network-password").val(),
                bssid: sessionStorage.getItem('bssid')
            }),
        })
            .done((data) => {
                console.log("Network success");
                console.log(data);
                //location.assign('./registration.html')
		if (data.success) {
			timer = setTimeout(tryStatus, 1000);
			$("#network-connect-btn").addClass("disabled");
			$("#network-connect-btn").text("Preparing");
		}
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    }

    function regReset() {
	$("#register-btn").removeClass("disabled");
	$("#register-btn").text("Register");
    }
    function regStatus () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/status`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                status: 'registration'
            }),
        })
            .done((data) => {
                console.log(data);
                timer = null;
		if (data.status <= 0) {
			regReset()
		} else if (data.status == 6) {
			$("#network-connect-btn").text("Registered");
			timer = setTimeout(function(){location.assign("./success.html");}, 1000);
		} else if (data.status == 5) {
			$("#network-connect-btn").text("Wrong registration code");
			//timer = setTimeout(function(){regReset();}, 1000);
		} else if (data.status == 4) {
			$("#network-connect-btn").text("Already registered");
			//timer = setTimeout(function(){regReset();}, 1000);
		} else {
		    switch(data.status) {
			case 1:
				$("#network-connect-btn").text("Connecting");
			break;
			case 2:
				$("#network-connect-btn").text("Sending request");
			break;
			case 3:
				$("#network-connect-btn").text("Receiving response");
			break;
			default:
			break;
		    }
		    timer = setTimeout(regStatus, 1000);
		}
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                timer = null;
		timer = setTimeout(regStatus, 1000);
            });
    }
    function registerDevice() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/registration`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                rc: $("#rc-code").val(),
            }),
        })
            .done((data) => {
                if (!data.success) {
			$('#error').val('Incorrect code')
			$('input:password').val('');
			console.log("Registration failed");
		} else {
			console.log("Registration started");
			console.log(data);
			//location.assign('./success.html')
			$("#register-btn").addClass("disabled");
			$("#register-btn").text("Preparing");
			timer = setTimeout(regStatus, 1000);
		}
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                $('#error').val('Incorrect code')
                $('input:password').val('');
                console.log("Registration failed");
            });
    }

    function logout() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/auth`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                user: null,
                password: null
            }),
        })
            .done((data) => {
                console.log("Logout success");
                console.log(data);
                location.replace('./login.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Logout failed");
            });
    }

    function on_network_click(obj) {
        sessionStorage.setItem('bssid', $(obj).data('bssid'));
        sessionStorage.setItem('ssid', $(obj).data('ssid'));
        sessionStorage.setItem('authtype', $(obj).data('authtype'));

        //change screen to password.html
        location.assign('./password.html')
	return false;
    }
    window.on_network_click = on_network_click;

    //events
    //screen 1
    $("#login-btn").click(() => {
        login()
        login()
    });

    //screen 2
    $("#scan-btn").click(() => {
	if (!timer)
		scan()
    });

    //screen 3
    //getting network id
    //getting typed password from input field
    $('network-password').on('keyup', (e) => {
        n_pass = e.target.value
    })

    $("#section-2").submit((event) => {
        tryAccessPoint()
	event.preventDefault();
    });

    $("#network-connect-btn").click(() => {
	    if (!$("#network-connect-btn").hasClass('disabled'))
		$("#section-2").submit();
    });

    //screen 4
    $('#rc-code').on('keyup', (e) => {
        rc_code = e.target.value
    })

    $("#register-btn").click(() => {
	    if (!timer)
		registerDevice()
    });

    //screen 5
    $("#logout-btn").click(() => {
        logout()
    });

    if ($("#networks").length > 0) {
        //networks page
        getScanResults();
    }
    if ($("#network-password").length > 0) {
        // password page
	$("#password-cover").text(sessionStorage.getItem('ssid'));
	if (sessionStorage.getItem('authtype') == 0) {
		$("#network-password").attr('disabled', 'disabled');
		$("#network-password").removeAttr('minlength');
		$("#network-password").removeAttr('required');
	} else {
		$("#network-password").removeAttr('disabled');
		$("#network-password").attr('minlength', '8');
		$("#network-password").attr('required', '');
	}
	$("#network-password").val('');
    }
});
