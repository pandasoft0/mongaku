"use strict";

var fs = require("fs");
var path = require("path");

var tap = require("tap");
var request = require("request").defaults({ jar: true });

require("../init");

var login = function login(email, callback) {
    request.post({
        url: "http://localhost:3000/login",
        form: {
            email: email,
            password: "test"
        }
    }, callback);
};

var adminLogin = function adminLogin(callback) {
    return login("test@test.com", callback);
};
var normalLogin = function normalLogin(callback) {
    return login("normal@test.com", callback);
};

tap.test("Admin Page", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Admin Page (Logged Out)", function (t) {
    var url = "http://localhost:3000/artworks/source/test/admin";
    request.get(url, function (err, res) {
        t.error(err, "Error should be empty.");
        t.equal(res.statusCode, 200);
        t.match(res.request.uri.href, "http://localhost:3000/login");
        t.end();
    });
});

tap.test("Admin Page (Unauthorized User)", function (t) {
    normalLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 500);
            t.end();
        });
    });
});

tap.test("Record Import Page", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/started";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Record Import Page (Completed)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/completed";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Record Import Page (Error)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/error";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Record Import Page (Missing)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/foo";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 404);
            t.end();
        });
    });
});

tap.test("Record Import Finalize", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/started&finalize=true";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.match(res.request.uri.href, "http://localhost:3000/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("Record Import Abandon", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?records=test/started&abandon=true";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.match(res.request.uri.href, "http://localhost:3000/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("Image Import Page", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?images=test/started";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Image Import Page (Completed)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?images=test/completed";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Image Import Page (Completed, Expanded)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?images=test/completed&expanded=models";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Image Import Page (Error)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?images=test/error";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 200);
            t.end();
        });
    });
});

tap.test("Image Import Page (Missing)", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/admin" + "?images=test/foo";
        request.get(url, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 404);
            t.end();
        });
    });
});

tap.test("uploadData: Source not found", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/foo/upload-data";
        var formData = {};
        request.post({ url: url, formData: formData }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 404);
            t.end();
        });
    });
});

tap.test("uploadData: No files", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-data";
        var formData = {};
        request.post({ url: url, formData: formData }, function (err, res, body) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 500);
            t.match(body, "No data files specified.");
            t.end();
        });
    });
});

tap.test("uploadData: File Error", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-data";
        var file = "default-error.json";
        var formData = {
            files: {
                value: fs.createReadStream(path.resolve("testData", file)),
                options: {
                    filename: file
                }
            }
        };
        request.post({
            url: url,
            formData: formData
        }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 302);
            t.match(res.headers.location, "/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("uploadData: Default File", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-data";
        var file = "default.json";
        var formData = {
            files: {
                value: fs.createReadStream(path.resolve("testData", file)),
                options: {
                    filename: file
                }
            }
        };
        request.post({
            url: url,
            formData: formData
        }, function (err, res, body) {
            console.log(body);
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 302);
            t.match(res.headers.location, "/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("uploadImages: Source not found", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/foo/upload-images";
        var formData = {};
        request.post({ url: url, formData: formData }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 404);
            t.end();
        });
    });
});

tap.test("uploadImages: No files", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-images";
        var formData = {};
        request.post({ url: url, formData: formData }, function (err, res, body) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 500);
            t.match(body, "No zip file specified.");
            t.end();
        });
    });
});

tap.test("uploadImages: Empty Zip", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-images";
        var file = "empty.zip";
        var formData = {
            zipField: {
                value: fs.createReadStream(path.resolve("testData", file)),
                options: {
                    filename: file
                }
            }
        };
        request.post({
            url: url,
            formData: formData
        }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 302);
            t.match(res.headers.location, "/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("uploadImages: Corrupted Zip", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-images";
        var file = "corrupted.zip";
        var formData = {
            zipField: {
                value: fs.createReadStream(path.resolve("testData", file)),
                options: {
                    filename: file
                }
            }
        };
        request.post({
            url: url,
            formData: formData
        }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 302);
            t.match(res.headers.location, "/artworks/source/test/admin");
            t.end();
        });
    });
});

tap.test("uploadImages: Normal Zip", function (t) {
    adminLogin(function () {
        var url = "http://localhost:3000/artworks/source/test/upload-images";
        var file = "test.zip";
        var formData = {
            zipField: {
                value: fs.createReadStream(path.resolve("testData", file)),
                options: {
                    filename: file
                }
            }
        };
        request.post({
            url: url,
            formData: formData
        }, function (err, res) {
            t.error(err, "Error should be empty.");
            t.equal(res.statusCode, 302);
            t.match(res.headers.location, "/artworks/source/test/admin");
            t.end();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9sb2dpYy9hZG1pbi5qcyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwYXRoIiwidGFwIiwicmVxdWVzdCIsImRlZmF1bHRzIiwiamFyIiwibG9naW4iLCJlbWFpbCIsImNhbGxiYWNrIiwicG9zdCIsInVybCIsImZvcm0iLCJwYXNzd29yZCIsImFkbWluTG9naW4iLCJub3JtYWxMb2dpbiIsInRlc3QiLCJ0IiwiZ2V0IiwiZXJyIiwicmVzIiwiZXJyb3IiLCJlcXVhbCIsInN0YXR1c0NvZGUiLCJlbmQiLCJtYXRjaCIsInVyaSIsImhyZWYiLCJmb3JtRGF0YSIsImJvZHkiLCJmaWxlIiwiZmlsZXMiLCJ2YWx1ZSIsImNyZWF0ZVJlYWRTdHJlYW0iLCJyZXNvbHZlIiwib3B0aW9ucyIsImZpbGVuYW1lIiwiaGVhZGVycyIsImxvY2F0aW9uIiwiY29uc29sZSIsImxvZyIsInppcEZpZWxkIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQU1BLEtBQUtDLFFBQVEsSUFBUixDQUFYO0FBQ0EsSUFBTUMsT0FBT0QsUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTUUsTUFBTUYsUUFBUSxLQUFSLENBQVo7QUFDQSxJQUFNRyxVQUFVSCxRQUFRLFNBQVIsRUFBbUJJLFFBQW5CLENBQTRCLEVBQUNDLEtBQUssSUFBTixFQUE1QixDQUFoQjs7QUFFQUwsUUFBUSxTQUFSOztBQUVBLElBQU1NLFFBQVEsU0FBUkEsS0FBUSxDQUFDQyxLQUFELEVBQVFDLFFBQVIsRUFBcUI7QUFDL0JMLFlBQVFNLElBQVIsQ0FBYTtBQUNUQyxhQUFLLDZCQURJO0FBRVRDLGNBQU07QUFDRkosd0JBREU7QUFFRkssc0JBQVU7QUFGUjtBQUZHLEtBQWIsRUFNR0osUUFOSDtBQU9ILENBUkQ7O0FBVUEsSUFBTUssYUFBYSxTQUFiQSxVQUFhLENBQUNMLFFBQUQ7QUFBQSxXQUFjRixNQUFNLGVBQU4sRUFBdUJFLFFBQXZCLENBQWQ7QUFBQSxDQUFuQjtBQUNBLElB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REFBWjtBQUNBLFlBQU1tQixPQUFPLFVBQWI7QUFDQSxZQUFNRixXQUFXO0FBQ2JhLHNCQUFVO0FBQ05ULHVCQUFPaEMsR0FBR2lDLGdCQUFILENBQW9CL0IsS0FBS2dDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCSixJQUF6QixDQUFwQixDQUREO0FBRU5LLHlCQUFTO0FBQ0xDLDhCQUFVTjtBQURMO0FBRkg7QUFERyxTQUFqQjtBQVFBMUIsZ0JBQVFNLElBQVIsQ0FBYTtBQUNUQyxvQkFEUztBQUVUaUI7QUFGUyxTQUFiLEVBR0csVUFBQ1QsR0FBRCxFQUFNQyxHQUFOLEVBQWM7QUFDYkgsY0FBRUksS0FBRixDQUFRRixHQUFSLEVBQWEsd0JBQWI7QUFDQUYsY0FBRUssS0FBRixDQUFRRixJQUFJRyxVQUFaLEVBQXdCLEdBQXhCO0FBQ0FOLGNBQUVRLEtBQUYsQ0FBUUwsSUFBSWlCLE9BQUosQ0FBWUMsUUFBcEIsRUFBOEIsNkJBQTlCO0FBQ0FyQixjQUFFTyxHQUFGO0FBQ0gsU0FSRDtBQVNILEtBcEJEO0FBcUJILENBdEJEIiwiZmlsZSI6ImFkbWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5cbmNvbnN0IHRhcCA9IHJlcXVpcmUoXCJ0YXBcIik7XG5jb25zdCByZXF1ZXN0ID0gcmVxdWlyZShcInJlcXVlc3RcIikuZGVmYXVsdHMoe2phcjogdHJ1ZX0pO1xuXG5yZXF1aXJlKFwiLi4vaW5pdFwiKTtcblxuY29uc3QgbG9naW4gPSAoZW1haWwsIGNhbGxiYWNrKSA9PiB7XG4gICAgcmVxdWVzdC5wb3N0KHtcbiAgICAgICAgdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9sb2dpblwiLFxuICAgICAgICBmb3JtOiB7XG4gICAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBcInRlc3RcIixcbiAgICAgICAgfSxcbiAgICB9LCBjYWxsYmFjayk7XG59O1xuXG5jb25zdCBhZG1pbkxvZ2luID0gKGNhbGxiYWNrKSA9PiBsb2dpbihcInRlc3RAdGVzdC5jb21cIiwgY2FsbGJhY2spO1xuY29uc3Qgbm9ybWFsTG9naW4gPSAoY2FsbGJhY2spID0+IGxvZ2luKFwibm9ybWFsQHRlc3QuY29tXCIsIGNhbGxiYWNrKTtcblxudGFwLnRlc3QoXCJBZG1pbiBQYWdlXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCI7XG4gICAgICAgIHJlcXVlc3QuZ2V0KHVybCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgMjAwKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwiQWRtaW4gUGFnZSAoTG9nZ2VkIE91dClcIiwgKHQpID0+IHtcbiAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiO1xuICAgIHJlcXVlc3QuZ2V0KHVybCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgIHQubWF0Y2gocmVzLnJlcXVlc3QudXJpLmhyZWYsXG4gICAgICAgICAgICBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9sb2dpblwiKTtcbiAgICAgICAgdC5lbmQoKTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIkFkbWluIFBhZ2UgKFVuYXV0aG9yaXplZCBVc2VyKVwiLCAodCkgPT4ge1xuICAgIG5vcm1hbExvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIjtcbiAgICAgICAgcmVxdWVzdC5nZXQodXJsLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCA1MDApO1xuICAgICAgICAgICAgdC5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxudGFwLnRlc3QoXCJSZWNvcmQgSW1wb3J0IFBhZ2VcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIiArXG4gICAgICAgICAgICBcIj9yZWNvcmRzPXRlc3Qvc3RhcnRlZFwiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIlJlY29yZCBJbXBvcnQgUGFnZSAoQ29tcGxldGVkKVwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiICtcbiAgICAgICAgICAgIFwiP3JlY29yZHM9dGVzdC9jb21wbGV0ZWRcIjtcbiAgICAgICAgcmVxdWVzdC5nZXQodXJsLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCAyMDApO1xuICAgICAgICAgICAgdC5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxudGFwLnRlc3QoXCJSZWNvcmQgSW1wb3J0IFBhZ2UgKEVycm9yKVwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiICtcbiAgICAgICAgICAgIFwiP3JlY29yZHM9dGVzdC9lcnJvclwiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIlJlY29yZCBJbXBvcnQgUGFnZSAoTWlzc2luZylcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIiArXG4gICAgICAgICAgICBcIj9yZWNvcmRzPXRlc3QvZm9vXCI7XG4gICAgICAgIHJlcXVlc3QuZ2V0KHVybCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgNDA0KTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwiUmVjb3JkIEltcG9ydCBGaW5hbGl6ZVwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiICtcbiAgICAgICAgICAgIFwiP3JlY29yZHM9dGVzdC9zdGFydGVkJmZpbmFsaXplPXRydWVcIjtcbiAgICAgICAgcmVxdWVzdC5nZXQodXJsLCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCAyMDApO1xuICAgICAgICAgICAgdC5tYXRjaChyZXMucmVxdWVzdC51cmkuaHJlZixcbiAgICAgICAgICAgICAgICBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwiUmVjb3JkIEltcG9ydCBBYmFuZG9uXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIgK1xuICAgICAgICAgICAgXCI/cmVjb3Jkcz10ZXN0L3N0YXJ0ZWQmYWJhbmRvbj10cnVlXCI7XG4gICAgICAgIHJlcXVlc3QuZ2V0KHVybCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgMjAwKTtcbiAgICAgICAgICAgIHQubWF0Y2gocmVzLnJlcXVlc3QudXJpLmhyZWYsXG4gICAgICAgICAgICAgICAgXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIik7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIkltYWdlIEltcG9ydCBQYWdlXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIgK1xuICAgICAgICAgICAgXCI/aW1hZ2VzPXRlc3Qvc3RhcnRlZFwiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIkltYWdlIEltcG9ydCBQYWdlIChDb21wbGV0ZWQpXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIgK1xuICAgICAgICAgICAgXCI/aW1hZ2VzPXRlc3QvY29tcGxldGVkXCI7XG4gICAgICAgIHJlcXVlc3QuZ2V0KHVybCwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgMjAwKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwiSW1hZ2UgSW1wb3J0IFBhZ2UgKENvbXBsZXRlZCwgRXhwYW5kZWQpXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIgK1xuICAgICAgICAgICAgXCI/aW1hZ2VzPXRlc3QvY29tcGxldGVkJmV4cGFuZGVkPW1vZGVsc1wiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIkltYWdlIEltcG9ydCBQYWdlIChFcnJvcilcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIiArXG4gICAgICAgICAgICBcIj9pbWFnZXM9dGVzdC9lcnJvclwiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDIwMCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcIkltYWdlIEltcG9ydCBQYWdlIChNaXNzaW5nKVwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiICtcbiAgICAgICAgICAgIFwiP2ltYWdlcz10ZXN0L2Zvb1wiO1xuICAgICAgICByZXF1ZXN0LmdldCh1cmwsIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDQwNCk7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcInVwbG9hZERhdGE6IFNvdXJjZSBub3QgZm91bmRcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL2Zvby91cGxvYWQtZGF0YVwiO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHt9O1xuICAgICAgICByZXF1ZXN0LnBvc3Qoe3VybCwgZm9ybURhdGF9LCAoZXJyLCByZXMpID0+IHtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCA0MDQpO1xuICAgICAgICAgICAgdC5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxudGFwLnRlc3QoXCJ1cGxvYWREYXRhOiBObyBmaWxlc1wiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC91cGxvYWQtZGF0YVwiO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHt9O1xuICAgICAgICByZXF1ZXN0LnBvc3Qoe3VybCwgZm9ybURhdGF9LCAoZXJyLCByZXMsIGJvZHkpID0+IHtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCA1MDApO1xuICAgICAgICAgICAgdC5tYXRjaChib2R5LCBcIk5vIGRhdGEgZmlsZXMgc3BlY2lmaWVkLlwiKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBsb2FkRGF0YTogRmlsZSBFcnJvclwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC91cGxvYWQtZGF0YVwiO1xuICAgICAgICBjb25zdCBmaWxlID0gXCJkZWZhdWx0LWVycm9yLmpzb25cIjtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSB7XG4gICAgICAgICAgICBmaWxlczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBmcy5jcmVhdGVSZWFkU3RyZWFtKHBhdGgucmVzb2x2ZShcInRlc3REYXRhXCIsIGZpbGUpKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LnBvc3Qoe1xuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgZm9ybURhdGEsXG4gICAgICAgIH0sIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDMwMik7XG4gICAgICAgICAgICB0Lm1hdGNoKHJlcy5oZWFkZXJzLmxvY2F0aW9uLCBcIi9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBsb2FkRGF0YTogRGVmYXVsdCBGaWxlXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L3VwbG9hZC1kYXRhXCI7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBcImRlZmF1bHQuanNvblwiO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHtcbiAgICAgICAgICAgIGZpbGVzOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aC5yZXNvbHZlKFwidGVzdERhdGFcIiwgZmlsZSkpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgfSwgKGVyciwgcmVzLCBib2R5KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhib2R5KTtcbiAgICAgICAgICAgIHQuZXJyb3IoZXJyLCBcIkVycm9yIHNob3VsZCBiZSBlbXB0eS5cIik7XG4gICAgICAgICAgICB0LmVxdWFsKHJlcy5zdGF0dXNDb2RlLCAzMDIpO1xuICAgICAgICAgICAgdC5tYXRjaChyZXMuaGVhZGVycy5sb2NhdGlvbiwgXCIvYXJ0d29ya3Mvc291cmNlL3Rlc3QvYWRtaW5cIik7XG4gICAgICAgICAgICB0LmVuZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuXG50YXAudGVzdChcInVwbG9hZEltYWdlczogU291cmNlIG5vdCBmb3VuZFwiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvZm9vL3VwbG9hZC1pbWFnZXNcIjtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSB7fTtcbiAgICAgICAgcmVxdWVzdC5wb3N0KHt1cmwsIGZvcm1EYXRhfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgNDA0KTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBsb2FkSW1hZ2VzOiBObyBmaWxlc1wiLCAodCkgPT4ge1xuICAgIGFkbWluTG9naW4oKCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMC9hcnR3b3Jrcy9zb3VyY2UvdGVzdC91cGxvYWQtaW1hZ2VzXCI7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0ge307XG4gICAgICAgIHJlcXVlc3QucG9zdCh7dXJsLCBmb3JtRGF0YX0sIChlcnIsIHJlcywgYm9keSkgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDUwMCk7XG4gICAgICAgICAgICB0Lm1hdGNoKGJvZHksIFwiTm8gemlwIGZpbGUgc3BlY2lmaWVkLlwiKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBsb2FkSW1hZ2VzOiBFbXB0eSBaaXBcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvdXBsb2FkLWltYWdlc1wiO1xuICAgICAgICBjb25zdCBmaWxlID0gXCJlbXB0eS56aXBcIjtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSB7XG4gICAgICAgICAgICB6aXBGaWVsZDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBmcy5jcmVhdGVSZWFkU3RyZWFtKHBhdGgucmVzb2x2ZShcInRlc3REYXRhXCIsIGZpbGUpKSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICByZXF1ZXN0LnBvc3Qoe1xuICAgICAgICAgICAgdXJsLFxuICAgICAgICAgICAgZm9ybURhdGEsXG4gICAgICAgIH0sIChlcnIsIHJlcykgPT4ge1xuICAgICAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgICAgIHQuZXF1YWwocmVzLnN0YXR1c0NvZGUsIDMwMik7XG4gICAgICAgICAgICB0Lm1hdGNoKHJlcy5oZWFkZXJzLmxvY2F0aW9uLCBcIi9hcnR3b3Jrcy9zb3VyY2UvdGVzdC9hZG1pblwiKTtcbiAgICAgICAgICAgIHQuZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBsb2FkSW1hZ2VzOiBDb3JydXB0ZWQgWmlwXCIsICh0KSA9PiB7XG4gICAgYWRtaW5Mb2dpbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVybCA9IFwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FydHdvcmtzL3NvdXJjZS90ZXN0L3VwbG9hZC1pbWFnZXNcIjtcbiAgICAgICAgY29uc3QgZmlsZSA9IFwiY29ycnVwdGVkLnppcFwiO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHtcbiAgICAgICAgICAgIHppcEZpZWxkOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aC5yZXNvbHZlKFwidGVzdERhdGFcIiwgZmlsZSkpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgMzAyKTtcbiAgICAgICAgICAgIHQubWF0Y2gocmVzLmhlYWRlcnMubG9jYXRpb24sIFwiL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIpO1xuICAgICAgICAgICAgdC5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcblxudGFwLnRlc3QoXCJ1cGxvYWRJbWFnZXM6IE5vcm1hbCBaaXBcIiwgKHQpID0+IHtcbiAgICBhZG1pbkxvZ2luKCgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gXCJodHRwOi8vbG9jYWxob3N0OjMwMDAvYXJ0d29ya3Mvc291cmNlL3Rlc3QvdXBsb2FkLWltYWdlc1wiO1xuICAgICAgICBjb25zdCBmaWxlID0gXCJ0ZXN0LnppcFwiO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IHtcbiAgICAgICAgICAgIHppcEZpZWxkOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGZzLmNyZWF0ZVJlYWRTdHJlYW0ocGF0aC5yZXNvbHZlKFwidGVzdERhdGFcIiwgZmlsZSkpLFxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QucG9zdCh7XG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgfSwgKGVyciwgcmVzKSA9PiB7XG4gICAgICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICAgICAgdC5lcXVhbChyZXMuc3RhdHVzQ29kZSwgMzAyKTtcbiAgICAgICAgICAgIHQubWF0Y2gocmVzLmhlYWRlcnMubG9jYXRpb24sIFwiL2FydHdvcmtzL3NvdXJjZS90ZXN0L2FkbWluXCIpO1xuICAgICAgICAgICAgdC5lbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiJdfQ==