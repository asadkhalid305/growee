$(document).ready(function () {
    $("#login-btn").click(function () {
        $.ajax({
            type: 'POST',
            url: "http://localhost:3010/auth",
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
