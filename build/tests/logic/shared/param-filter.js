"use strict";

var tap = require("tap");

require("../../init");

var paramFilter = require("../../../logic/shared/param-filter");

tap.test("paramFilter - primary", { autoend: true }, function (t) {
    var query = {
        filter: "test"
    };

    t.same(paramFilter(query), {
        all: { filter: "test" },
        primary: ["filter"],
        secondary: {}
    });
});

tap.test("paramFilter - secondary", { autoend: true }, function (t) {
    var query = {
        filter: "test",
        start: 0
    };

    t.same(paramFilter(query), {
        all: { filter: "test" },
        primary: ["filter"],
        secondary: {}
    });

    query.start = 100;

    t.same(paramFilter(query), {
        all: { filter: "test" },
        primary: ["filter"],
        secondary: {
            start: 100
        }
    });

    // Test keepSecondary
    t.same(paramFilter(query, true), {
        all: { filter: "test", start: 100 },
        primary: ["filter"],
        secondary: {
            start: 100
        }
    });
});