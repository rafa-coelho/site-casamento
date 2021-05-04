function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}



$(async() => {

    const guestCode = getParameterByName("guest") || "_";

    if (guestCode) {
        Login(guestCode).then((code) => {
            setCookie("GUEST_CODE", code, 1);
            document.location = '/';
        }).catch((msg) => {
            setCookie("GUEST_CODE", "", 1);
            document.location = '/';
        });
    }


    var guest = getGuest(false);

    if (!guest) {

    }


});