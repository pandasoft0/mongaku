"use strict";

const tap = require("tap");
const request = require("request");

require("../init");

tap.test("Search", (t) => {
    const url = "http://localhost:3000/search";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("By Type", (t) => {
    const url = "http://localhost:3000/type/painting";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("By Type Missing", (t) => {
    const url = "http://localhost:3000/type/foo";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 404);
        t.end();
    });
});

tap.test("By Source", (t) => {
    const url = "http://localhost:3000/source/test";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("By Source Missing", (t) => {
    const url = "http://localhost:3000/source/foo";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 404);
        t.end();
    });
});

tap.test("Artwork", (t) => {
    const url = "http://localhost:3000/artworks/test/1234";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Artwork (Similar Images)", (t) => {
    const url = "http://localhost:3000/artworks/test/1235";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Artwork Compare", (t) => {
    const url = "http://localhost:3000/artworks/test/1235?compare";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Artwork Missing", (t) => {
    const url = "http://localhost:3000/artworks/test/foo";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 404);
        t.end();
    });
});

tap.test("Search: Filter", (t) => {
    const url = "http://localhost:3000/search?filter=test";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Location", (t) => {
    const url = "http://localhost:3000/search?location=test";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Artist", (t) => {
    const url = "http://localhost:3000/search?artist=test";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Date", (t) => {
    const url = "http://localhost:3000/search?dateStart=1500&dateEnd=1599";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Date (Start Only)", (t) => {
    const url = "http://localhost:3000/search?dateStart=1500";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Date (End Only)", (t) => {
    const url = "http://localhost:3000/search?dateEnd=1599";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Width", (t) => {
    const url = "http://localhost:3000/search?widthMin=0&widthMax=99";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Height", (t) => {
    const url = "http://localhost:3000/search?heightMin=0&heightMax=99";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Similar (Any)", (t) => {
    const url = "http://localhost:3000/search?similar=any";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Similar (Internal)", (t) => {
    const url = "http://localhost:3000/search?similar=internal";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Similar (External)", (t) => {
    const url = "http://localhost:3000/search?similar=external";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Multiple", (t) => {
    const url = "http://localhost:3000/search?filter=test&location=test";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.end();
    });
});

tap.test("Search: Defaults", (t) => {
    const url = "http://localhost:3000/search?filter=test&location=";
    request.get(url, (err, res) => {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.equal(res.request.uri.href,
            "http://localhost:3000/search?filter=test");
        t.end();
    });
});
