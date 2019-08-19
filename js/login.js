$(document).ready(function () {
    // var baseUrl = 'http://localhost:3010'
    var baseUrl = 'http://growee.local'

    $("#login-btn").click(function () {
        $.ajax({
            type: 'POST',
            url: `${baseUrl}/auth`,
            data: {
                user: "admin",
                password: "growee"
            },
        })
            .done((data) => {
                console.log("Login success");
                console.log(data);
                location.assign('../network.html')
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                console.log("Login failed");
            });
    });
});
