$(document).ready(function () {
    // default variables
    // var baseUrl = 'http://localhost:3010'
    var baseUrl = 'http://growee.local'
    var rc_code = ''

    //events

    //screen 1
    $("#login-btn").click(function () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/auth`,
            contentType: "application/json",
            dataType: "json",
            data: {
                user: "admin",
                password: "growee"
            },
        })
            .done((data) => {
                console.log("Login success");
                console.log(data);
                location.assign('../networks.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    });

    //screen 2
    $('input:password').on('keyup', (e) => {
        rc_code = e.target.value
    })

    $("#connect-btn").click(function () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/registration`,
            contentType: "application/json",
            dataType: "json",
            data: {
                rc: rc_code,
            },
        })
            .done((data) => {
                console.log("Registration success");
                console.log(data);
                location.assign('../success.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                $('#error').val('Incorrect code')
                $('input:password').val('');
                console.log("Registration failed");
            });
    });

    //screen 5
    $("#logout-btn").click(function () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/auth`,
            contentType: "application/json",
            dataType: "json",
            data: {
                user: null,
                password: null
            },
        })
            .done((data) => {
                console.log("Logout success");
                console.log(data);
                location.replace('../login.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Logout failed");
            });
    });
});
