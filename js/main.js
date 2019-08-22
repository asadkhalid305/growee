$(document).ready(() => {
    // global variables
    // var baseUrl = 'http://localhost:3010'
    var baseUrl = 'http://growee.local'
    var rc_code = ''
    var n_idx = ''
    var n_pass = ''
    var n = {}

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
                    //storing all netowrks on the session memory
                    sessionStorage.setItem('network', data)

                    $content = $("<div id=\"networks\"></div>");
                    for (var i = 0; i < data.count; i++) {
                        if (data.items[i].authtype == 5) {
                            // WPA2 Enterprise security - not supported
                            continue;
                        }

                        //generating dynamic id
                        $item = $("<div id=\"" + i + "\" class=\"network\"></div>");
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
                        $item.append("<a href=\"./password.html\">" + data.items[i].ssid + "</a>");
                        // check and reflect authtype
                        if (data.items[i].authtype == 0) { // open AP
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer7.png\" alt=\"open\">");
                        } else if (data.items[i].authtype == 1) { // WEP security
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer4_copy3.png\" alt=\"badly-protected\">");
                        } else { // WPA/WPA2
                            $item.append("<img class=\"wifi-signal\" src=\"./img/layer4_copy4.png\" alt=\"protected\">");
                        }
                        $content.append($item);
                    }
                    $("#networks").replaceWith($content);
                } else {

                }
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Get scan results failed");
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
                setTimeout(getScanResults, 5000);
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
                location.assign('./networks.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    }

    function getPassword() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/wifi`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                action: 'add-ap',
                ssid: n.items[n_idx].ssid,
                pass: n_pass,
                bssid: n.items[n_idx].bssid
            }),
        })
            .done((data) => {
                console.log("Network success");
                console.log(data);
                location.assign('./registration.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    }

    function getRigistrationCode() {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/registration`,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify({
                rc: rc_code,
            }),
        })
            .done((data) => {
                console.log("Registration success");
                console.log(data);
                location.assign('./success.html')
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

    //events
    //screen 1
    $("#login-btn").click(() => {
        // setTimeout(login, 5000)
        login()
    });

    //screen 2
    $("#scan-btn").click(() => {
        // setTimeout(scan, 5000)
        scan()
    });

    //screen 3
    //getting network id
    $('#network').click(() => {
        //id might be string
        n_idx = $('#network').attr('id')

        //getting all networks from session storage
        n = sessionStorage.getItem('network')

        //change screen to password.html
        location.assign('./password.html')

        //dynamically setting network name on password.html
        $('#password-cover').text(n.items[n_idx].ssid)
    })

    //getting typed password from input field
    $('network-password').on('keyup', (e) => {
        n_pass = e.target.value
    })

    $("#network-connect-btn").click(() => {
        // setTimeout(getPassword, 5000)
        getPassword()
    });

    //screen 4
    $('#rc-code').on('keyup', (e) => {
        rc_code = e.target.value
    })

    $("#register-btn").click(() => {
        // setTimeout(getRigistrationCode, 5000)
        getRigistrationCode()
    });

    //screen 5
    $("#logout-btn").click(() => {
        // setTimeout(logout, 5000)
        logout()
    });
});
