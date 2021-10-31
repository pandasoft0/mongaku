"use strict";

const tap = require("tap");

const init = require("../init");
const req = init.req;
const Artwork = init.Artwork;

tap.test("getURL", {autoend: true}, (t) => {
    const artwork = init.getArtwork();
    t.equal(artwork.getURL("en"),
        "/artworks/test/1234", "Check 'en' URL");

    t.equal(artwork.getURL("de"),
        "/artworks/test/1234?lang=de", "Check 'de' URL");
});

tap.test("getThumbURL", {autoend: true}, (t) => {
    const artwork = init.getArtwork();
    t.equal(artwork.getThumbURL(),
        "/data/test/thumbs/4266906334.jpg",
        "Check Thumb URL");
});

tap.test("getTitle", {autoend: true}, (t) => {
    const artwork = init.getArtwork();
    t.equal(artwork.getTitle(req), "Test", "Check Title");

    artwork.title = null;
    t.equal(artwork.getTitle(req), null, "Check Title");

    artwork.title = "Test";
});

tap.test("getSource", {autoend: true}, (t) => {
    const artwork = init.getArtwork();
    const source = init.getSource();
    t.equal(artwork.getSource(), source, "Get Source");
});

tap.test("date", {autoend: true}, (t) => {
    const artwork = init.getArtwork();
    t.same(artwork.date.toJSON(),
        {
            _id: "ca. 1456-1457",
            start: 1456,
            end: 1457,
            circa: true,
        },
        "Get Date");
});

tap.test("Artwork.fromData: Data error", (t) => {
    Artwork.fromData({}, req, (err, value, warnings) => {
        t.equal(err.message, "Required field `id` is empty.",
            "Data error.");
        t.equal(value, undefined, "No artwork should be returned.");
        t.equal(warnings, undefined, "There should be no warnings.");
        t.end();
    });
});

tap.test("Artwork.fromData: Existing artwork", (t) => {
    const artwork = init.getArtwork();
    const artworkData = init.getArtworkData();
    Artwork.fromData(artworkData, req, (err, value, warnings) => {
        t.error(err, "Error should be empty.");
        t.equal(value, artwork, "Artwork should be returned.");
        t.equal(value.defaultImageHash, "4266906334",
            "defaultImageHash is set.");
        t.equal(value.images.length, 1, "Images are set.");
        t.equal(value.images[0], "test/foo.jpg", "Images are set.");
        t.same(warnings, [], "There should be no warnings.");
        t.end();
    });
});

tap.test("Artwork.fromData: New artwork", (t) => {
    const artworkData = init.getArtworkData();
    const newData = Object.assign({}, artworkData, {
        id: "4266906334",
    });

    Artwork.fromData(newData, req, (err, value, warnings) => {
        t.error(err, "Error should be empty.");
        t.equal(value._id, "test/4266906334",
            "New artwork should be returned.");
        t.equal(value.defaultImageHash, "4266906334",
            "defaultImageHash is set.");
        t.equal(value.images.length, 1, "Images are set.");
        t.equal(value.images[0], "test/foo.jpg", "Images are set.");
        t.same(warnings, [], "There should be no warnings.");
        t.end();
    });
});

tap.test("Artwork.fromData: New artwork with warnings", (t) => {
    const artworkData = init.getArtworkData();
    const newData = Object.assign({}, artworkData, {
        id: "4266906334",
        batch: "batch",
    });

    Artwork.fromData(newData, req, (err, value, warnings) => {
        t.error(err, "Error should be empty.");
        t.equal(value._id, "test/4266906334",
            "New artwork should be returned.");
        t.equal(value.defaultImageHash, "4266906334",
            "defaultImageHash is set.");
        t.equal(value.images.length, 1, "Images are set.");
        t.equal(value.images[0], "test/foo.jpg", "Images are set.");
        t.same(warnings, ["Unrecognized field `batch`."],
            "There should be a single warning.");
        t.end();
    });
});

tap.test("Artwork.fromData: New artwork missing images", (t) => {
    const artworkData = init.getArtworkData();
    const newData = Object.assign({}, artworkData, {
        id: "4266906334",
        images: ["missing.jpg"],
    });

    Artwork.fromData(newData, req, (err, value, warnings) => {
        t.equal(err.message, "No images found.", "No images found.");
        t.equal(value, undefined, "No artwork should be returned.");
        t.equal(warnings, undefined, "There should be no warnings.");
        t.end();
    });
});

tap.test("Artwork.fromData: New artwork missing single image", (t) => {
    const artworkData = init.getArtworkData();
    const newData = Object.assign({}, artworkData, {
        id: "4266906334",
        images: ["missing.jpg", "foo.jpg"],
    });

    Artwork.fromData(newData, req, (err, value, warnings) => {
        t.error(err, "Error should be empty.");
        t.equal(value._id, "test/4266906334",
            "New artwork should be returned.");
        t.equal(value.defaultImageHash, "4266906334",
            "defaultImageHash is set.");
        t.equal(value.images.length, 1, "Images are set.");
        t.equal(value.images[0], "test/foo.jpg", "Images are set.");
        t.same(warnings, ["Image file not found: missing.jpg"],
            "There should be a warning.");
        t.end();
    });
});

tap.test("updateSimilarity", (t) => {
    const artwork = init.getArtwork();
    artwork.updateSimilarity((err) => {
        t.error(err, "Error should be empty.");
        t.equal(artwork.similarArtworks.length, 1,
            "Correct number of matches.");
        t.same(artwork.similarArtworks[0].toJSON(), {
            _id: "test/1235",
            artwork: "test/1235",
            score: 10,
            source: "test",
            images: ["test/bar.jpg"],
        }, "Check similar artwork result");
        t.end();
    });
});

tap.test("updateSimilarity with two matches", (t) => {
    const artworks = init.getArtworks();
    const artwork = artworks["test/1235"];
    artwork.updateSimilarity((err) => {
        t.error(err, "Error should be empty.");
        t.equal(artwork.similarArtworks.length, 2,
            "Correct number of matches.");
        t.same(artwork.similarArtworks[0].toJSON(), {
            _id: "test/1236",
            artwork: "test/1236",
            score: 17,
            source: "test",
            images: ["test/new1.jpg", "test/new2.jpg"],
        }, "Check similar artwork result");
        t.same(artwork.similarArtworks[1].toJSON(), {
            _id: "test/1234",
            artwork: "test/1234",
            score: 10,
            source: "test",
            images: ["test/foo.jpg"],
        }, "Check similar artwork result");
        t.end();
    });
});

tap.test("updateSimilarity with no similar", (t) => {
    const artworks = init.getArtworks();
    const artwork = artworks["test/1237"];
    artwork.updateSimilarity((err) => {
        t.error(err, "Error should be empty.");
        t.equal(artwork.similarArtworks.length, 0,
            "Correct number of matches.");
        t.end();
    });
});

tap.test("Artwork.lintData: Unknown Fields", {autoend: true}, (t) => {
    t.same(Artwork.lintData({
        batch: "test",
    }, req), {
        "error": "Required field `id` is empty.",
        "warnings": [
            "Unrecognized field `batch`.",
        ],
    }, "Known field");

    t.same(Artwork.lintData({
        random: "test",
    }, req), {
        "error": "Required field `id` is empty.",
        "warnings": [
            "Unrecognized field `random`.",
        ],
    }, "Unknown field");
});

tap.test("Artwork.lintData: Required Fields", {autoend: true}, (t) => {
    t.same(Artwork.lintData({}, req), {
        "error": "Required field `id` is empty.",
        "warnings": [],
    }, "ID");

    t.same(Artwork.lintData({
        id: "",
    }, req), {
        "error": "Required field `id` is empty.",
        "warnings": [],
    }, "ID Empty String");

    t.same(Artwork.lintData({
        id: "1234",
    }, req), {
        "error": "Required field `source` is empty.",
        "warnings": [],
    }, "Source");

    t.same(Artwork.lintData({
        id: "1234",
        source: "",
    }, req), {
        "error": "Required field `source` is empty.",
        "warnings": [],
    }, "Source Empty String");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
    }, req), {
        "error": "Required field `lang` is empty.",
        "warnings": [],
    }, "Lang");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "",
    }, req), {
        "error": "Required field `lang` is empty.",
        "warnings": [],
    }, "Lang Empty String");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
    }, req), {
        "error": "Required field `url` is empty.",
        "warnings": [],
    }, "URL");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "",
    }, req), {
        "error": "Required field `url` is empty.",
        "warnings": [],
    }, "URL Empty String");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
    }, req), {
        "error": "Required field `images` is empty.",
        "warnings": [],
    }, "Images");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: [],
    }, req), {
        "error": "Required field `images` is empty.",
        "warnings": [],
    }, "Images Empty Array");
});

tap.test("Artwork.lintData: Recommended Fields", {autoend: true}, (t) => {
    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
        },
        "warnings": [
            "Recommended field `title` is empty.",
            "Recommended field `objectType` is empty.",
        ],
    }, "Title and objectType recommended.");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "",
        objectType: "",
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
        },
        "warnings": [
            "Recommended field `title` is empty.",
            "Recommended field `objectType` is empty.",
        ],
    }, "Title and objectType recommended.");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
        },
        "warnings": [
            "Recommended field `objectType` is empty.",
        ],
    }, "objectType recommended.");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "",
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
        },
        "warnings": [
            "Recommended field `objectType` is empty.",
        ],
    }, "objectType recommended.");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
        },
        "warnings": [],
    }, "No recommended.");
});

tap.test("Artwork.lintData: Type checking", {autoend: true}, (t) => {
    t.same(Artwork.lintData({
        id: 1234,
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `id` is empty.",
        "warnings": [
            "`id` is the wrong type. Expected a string.",
        ],
    }, "ID");

    t.same(Artwork.lintData({
        id: "1234",
        source: 1234,
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `source` is empty.",
        "warnings": [
            "`source` is the wrong type. Expected a string.",
        ],
    }, "Source");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: true,
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `lang` is empty.",
        "warnings": [
            "`lang` is the wrong type. Expected a string.",
        ],
    }, "Lang");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: {},
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `url` is empty.",
        "warnings": [
            "`url` is the wrong type. Expected a string.",
        ],
    }, "URL");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: {},
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `images` is empty.",
        "warnings": [
            "`images` is the wrong type. Expected a array.",
        ],
    }, "Images");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        dates: [
            {start: "1234", end: 1976},
        ],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            dates: [
                {end: 1976},
            ],
        },
        "warnings": [
            "`dates`: `start` is the wrong type. Expected a number.",
        ],
    }, "Date Start");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        dates: [
            {start: 1234, end: 1976, circa: "foo"},
        ],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            dates: [
                {start: 1234, end: 1976},
            ],
        },
        "warnings": [
            "`dates`: `circa` is the wrong type. Expected a boolean.",
        ],
    }, "Date Circa");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        categories: {},
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
        },
        "warnings": [
            "`categories` is the wrong type. Expected a array.",
        ],
    }, "Categories");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        categories: [true],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com/",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
        },
        "warnings": [
            "`categories` value is the wrong type. Expected a string.",
        ],
    }, "Categories Values");
});

tap.test("Artwork.lintData: Validation", {autoend: true}, (t) => {
    t.same(Artwork.lintData({
        id: "1234/456",
        source: "nga",
        lang: "en",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `id` is empty.",
        "warnings": [
            "IDs can only contain letters, numbers, underscores, and hyphens.",
        ],
    }, "ID");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "",
        url: "http://google.com/",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `lang` is empty.",
        "warnings": [],
    }, "Lang");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http//google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `url` is empty.",
        "warnings": [
            "`url` must be properly-formatted URL.",
        ],
    }, "URL");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foojpg"],
        title: "Test",
        objectType: "painting",
    }, req), {
        "error": "Required field `images` is empty.",
        "warnings": [
            "Images must be a valid image file name. For example: `image.jpg`.",
        ],
    }, "Images");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "foo",
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
        },
        "warnings": [
            "`objectType` must be one of the following types: architecture, " +
                "decorative arts, drawing, fresco, medal, miniature, mosaic, " +
                "painting, photo, print, sculpture, stained glass.",
            "Recommended field `objectType` is empty.",
        ],
    }, "objectType");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{pseudonym: "Test"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
        },
        "warnings": [
            "`artists`: Required field `name` is empty.",
        ],
    }, "artists");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
        },
        "warnings": [
            "Dimensions must have a unit specified and at least a width " +
                "or height.",
        ],
    }, "dimensions");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{unit: "mm"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
        },
        "warnings": [
            "Dimensions must have a unit specified and at least a width " +
                "or height.",
        ],
    }, "dimensions");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123, unit: "mm"}],
        dates: [{circa: true}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
        },
        "warnings": [
            "Dates must have a start or end specified.",
        ],
    }, "dates");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{
            name: "Test",
            dates: [{circa: true}],
        }],
        dimensions: [{width: 123, unit: "mm"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
        },
        "warnings": [
            "`artists`: Dates must have a start or end specified.",
        ],
    }, "dates in artists");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123, unit: "mm"}],
        dates: [{start: 1456, end: 1457, circa: true}],
        locations: [{country: "United States"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
            dates: [{start: 1456, end: 1457, circa: true}],
        },
        "warnings": [
            "Locations must have a name or city specified.",
        ],
    }, "locations");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123, unit: "mm"}],
        dates: [{start: 1456, end: 1457, circa: true}],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
            dates: [{start: 1456, end: 1457, circa: true}],
            locations: [{city: "New York City"}],
        },
        "warnings": [],
    }, "All pass");
});

tap.test("Artwork.lintData: Conversion", {autoend: true}, (t) => {
    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: ["Test"],
        dimensions: [{width: 123, unit: "mm"}],
        dates: [{start: 1456, end: 1457, circa: true}],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
            dates: [{start: 1456, end: 1457, circa: true}],
            locations: [{city: "New York City"}],
        },
        "warnings": [],
    }, "Artists");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: ["123 x 100 cm"],
        dates: [{start: 1456, end: 1457, circa: true}],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{
                "original": "123 x 100 cm",
                height: 1230,
                width: 1000,
                unit: "mm",
            }],
            dates: [{start: 1456, end: 1457, circa: true}],
            locations: [{city: "New York City"}],
        },
        "warnings": [],
    }, "Dimensions");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: ["123"],
        dates: [{start: 1456, end: 1457, circa: true}],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dates: [{start: 1456, end: 1457, circa: true}],
            locations: [{city: "New York City"}],
        },
        "warnings": [
            "Dimensions must have a unit specified and at least a width" +
                " or height.",
        ],
    }, "Dimensions produce warnings");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123, unit: "mm"}],
        dates: ["ca. 1456-1457"],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
            dates: [{
                start: 1456,
                end: 1457,
                circa: true,
                "original": "ca. 1456-1457",
            }],
            locations: [{city: "New York City"}],
        },
        "warnings": [],
    }, "Dates");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{name: "Test"}],
        dimensions: [{width: 123, unit: "mm"}],
        dates: ["blah"],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{name: "Test"}],
            dimensions: [{width: 123, unit: "mm"}],
            locations: [{city: "New York City"}],
        },
        "warnings": [
            "Dates must have a start or end specified.",
        ],
    }, "Dates produce warnings");

    t.same(Artwork.lintData({
        id: "1234",
        source: "nga",
        lang: "en",
        url: "http://google.com",
        images: ["foo.jpg"],
        title: "Test",
        objectType: "painting",
        artists: [{
            name: "Test",
            dates: ["ca. 1456-1457"],
        }],
        dimensions: [{width: 123, unit: "mm"}],
        dates: ["ca. 1456-1457"],
        locations: [{city: "New York City"}],
    }, req), {
        data: {
            id: "1234",
            source: "nga",
            lang: "en",
            url: "http://google.com",
            images: ["nga/foo.jpg"],
            title: "Test",
            objectType: "painting",
            artists: [{
                name: "Test",
                dates: [{
                    start: 1456,
                    end: 1457,
                    circa: true,
                    "original": "ca. 1456-1457",
                }],
            }],
            dimensions: [{width: 123, unit: "mm"}],
            dates: [{
                start: 1456,
                end: 1457,
                circa: true,
                "original": "ca. 1456-1457",
            }],
            locations: [{city: "New York City"}],
        },
        "warnings": [],
    }, "Dates in Artists");
});
