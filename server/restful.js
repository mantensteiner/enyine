module.exports = function (req, res, handlers) {
    // 
    // GOOD SOLUTION DIRECTLY FROM A STACK OVERFLOW POST
    // http://stackoverflow.com/questions/14882124/sending-405-from-express-js-when-there-is-a-route-match-but-no-http-method-match
    //
    
    // This shortcut function responses with HTTP 405
    // to the requests having a method that does not
    // have corresponding request handler. For example
    // if a resource allows only GET and POST requests
    // then PUT, DELETE, etc requests will be responsed
    // with the 405. HTTP 405 is required to have Allow
    // header set to a list of allowed methods so in
    // this case the response has "Allow: GET, POST" in
    // its headers [1].
    // 
    // Example usage
    //     
    //     A handler that allows only GET requests and returns
    //     
    //     exports.myrestfulhandler = function (req, res) {
    //         restful(req, res, {
    //             get: function (req, res) {
    //                 res.send(200, 'Hello restful world.');
    //             }
    //         });
    //     }
    // 
    // References
    //     [1] RFC-2616, 10.4.6 405 Method Not Allowed
    //     https://tools.ietf.org/html/rfc2616#page-66
    //
    var method = (req.method || '').toLowerCase();
    if (!(method in handlers)) {
        res.set('Allow', Object.keys(handlers).join(', ').toUpperCase());
        res.status(405).send();
    } else {
        handlers[method](req, res);
    }
};