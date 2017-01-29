"use strict";

var tap = require("tap");

var init = require("../init");
var req = init.req;

tap.test("getURL", { autoend: true }, function (t) {
    var upload = init.getUpload();
    t.equal(upload.getURL("en"), "/artworks/uploads/4266906334", "Check 'en' URL");

    t.equal(upload.getURL("de"), "/artworks/uploads/4266906334?lang=de", "Check 'de' URL");
});

tap.test("getThumbURL", { autoend: true }, function (t) {
    var upload = init.getUpload();
    t.equal(upload.getThumbURL(), "/data/uploads/thumbs/4266906334.jpg", "Check Thumb URL");
});

tap.test("getTitle", { autoend: true }, function (t) {
    var upload = init.getUpload();
    t.equal(upload.getTitle(req), "Uploaded Image", "Check Title");
});

tap.test("updateSimilarity", function (t) {
    var upload = init.getUpload();
    upload.updateSimilarity(function (err) {
        t.error(err, "Error should be empty.");
        t.equal(upload.similarRecords.length, 1, "Correct number of matches.");
        t.same(upload.similarRecords[0].toJSON(), {
            _id: "test/1235",
            record: "test/1235",
            score: 10,
            source: "test",
            images: ["test/bar.jpg"]
        }, "Check similar upload result");
        t.end();
    });
});

tap.test("updateSimilarity with no similar", function (t) {
    var upload = init.getUpload();
    var uploadImage = init.getUploadImage();
    uploadImage.similarImages = [];

    upload.updateSimilarity(function (err) {
        t.error(err, "Error should be empty.");
        t.equal(upload.similarRecords.length, 0, "Correct number of matches.");
        t.end();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9zY2hlbWFzL1VwbG9hZC5qcyJdLCJuYW1lcyI6WyJ0YXAiLCJyZXF1aXJlIiwiaW5pdCIsInJlcSIsInRlc3QiLCJhdXRvZW5kIiwidCIsInVwbG9hZCIsImdldFVwbG9hZCIsImVxdWFsIiwiZ2V0VVJMIiwiZ2V0VGh1bWJVUkwiLCJnZXRUaXRsZSIsInVwZGF0ZVNpbWlsYXJpdHkiLCJlcnIiLCJlcnJvciIsInNpbWlsYXJSZWNvcmRzIiwibGVuZ3RoIiwic2FtZSIsInRvSlNPTiIsIl9pZCIsInJlY29yZCIsInNjb3JlIiwic291cmNlIiwiaW1hZ2VzIiwiZW5kIiwidXBsb2FkSW1hZ2UiLCJnZXRVcGxvYWRJbWFnZSIsInNpbWlsYXJJbWFnZXMiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTUEsTUFBTUMsUUFBUSxLQUFSLENBQVo7O0FBRUEsSUFBTUMsT0FBT0QsUUFBUSxTQUFSLENBQWI7QUFDQSxJQUFNRSxNQUFNRCxLQUFLQyxHQUFqQjs7QUFFQUgsSUFBSUksSUFBSixDQUFTLFFBQVQsRUFBbUIsRUFBQ0MsU0FBUyxJQUFWLEVBQW5CLEVBQW9DLFVBQUNDLENBQUQsRUFBTztBQUN2QyxRQUFNQyxTQUFTTCxLQUFLTSxTQUFMLEVBQWY7QUFDQUYsTUFBRUcsS0FBRixDQUFRRixPQUFPRyxNQUFQLENBQWMsSUFBZCxDQUFSLEVBQ0ksOEJBREosRUFDb0MsZ0JBRHBDOztBQUdBSixNQUFFRyxLQUFGLENBQVFGLE9BQU9HLE1BQVAsQ0FBYyxJQUFkLENBQVIsRUFDSSxzQ0FESixFQUM0QyxnQkFENUM7QUFFSCxDQVBEOztBQVNBVixJQUFJSSxJQUFKLENBQVMsYUFBVCxFQUF3QixFQUFDQyxTQUFTLElBQVYsRUFBeEIsRUFBeUMsVUFBQ0MsQ0FBRCxFQUFPO0FBQzVDLFFBQU1DLFNBQVNMLEtBQUtNLFNBQUwsRUFBZjtBQUNBRixNQUFFRyxLQUFGLENBQVFGLE9BQU9JLFdBQVAsRUFBUixFQUNJLHFDQURKLEVBRUksaUJBRko7QUFHSCxDQUxEOztBQU9BWCxJQUFJSSxJQUFKLENBQVMsVUFBVCxFQUFxQixFQUFDQyxTQUFTLElBQVYsRUFBckIsRUFBc0MsVUFBQ0MsQ0FBRCxFQUFPO0FBQ3pDLFFBQU1DLFNBQVNMLEtBQUtNLFNBQUwsRUFBZjtBQUNBRixNQUFFRyxLQUFGLENBQVFGLE9BQU9LLFFBQVAsQ0FBZ0JULEdBQWhCLENBQVIsRUFBOEIsZ0JBQTlCLEVBQWdELGFBQWhEO0FBQ0gsQ0FIRDs7QUFLQUgsSUFBSUksSUFBSixDQUFTLGtCQUFULEVBQTZCLFVBQUNFLENBQUQsRUFBTztBQUNoQyxRQUFNQyxTQUFTTCxLQUFLTSxTQUFMLEVBQWY7QUFDQUQsV0FBT00sZ0JBQVAsQ0FBd0IsVUFBQ0MsR0FBRCxFQUFTO0FBQzdCUixVQUFFUyxLQUFGLENBQVFELEdBQVIsRUFBYSx3QkFBYjtBQUNBUixVQUFFRyxLQUFGLENBQVFGLE9BQU9TLGNBQVAsQ0FBc0JDLE1BQTlCLEVBQXNDLENBQXRDLEVBQ0ksNEJBREo7QUFFQVgsVUFBRVksSUFBRixDQUFPWCxPQUFPUyxjQUFQLENBQXNCLENBQXRCLEVBQXlCRyxNQUF6QixFQUFQLEVBQTBDO0FBQ3RDQyxpQkFBSyxXQURpQztBQUV0Q0Msb0JBQVEsV0FGOEI7QUFHdENDLG1CQUFPLEVBSCtCO0FBSXRDQyxvQkFBUSxNQUo4QjtBQUt0Q0Msb0JBQVEsQ0FBQyxjQUFEO0FBTDhCLFNBQTFDLEVBTUcsNkJBTkg7QUFPQWxCLFVBQUVtQixHQUFGO0FBQ0gsS0FaRDtBQWFILENBZkQ7O0FBaUJBekIsSUFBSUksSUFBSixDQUFTLGtDQUFULEVBQTZDLFVBQUNFLENBQUQsRUFBTztBQUNoRCxRQUFNQyxTQUFTTCxLQUFLTSxTQUFMLEVBQWY7QUFDQSxRQUFNa0IsY0FBY3hCLEtBQUt5QixjQUFMLEVBQXBCO0FBQ0FELGdCQUFZRSxhQUFaLEdBQTRCLEVBQTVCOztBQUVBckIsV0FBT00sZ0JBQVAsQ0FBd0IsVUFBQ0MsR0FBRCxFQUFTO0FBQzdCUixVQUFFUyxLQUFGLENBQVFELEdBQVIsRUFBYSx3QkFBYjtBQUNBUixVQUFFRyxLQUFGLENBQVFGLE9BQU9TLGNBQVAsQ0FBc0JDLE1BQTlCLEVBQXNDLENBQXRDLEVBQ0ksNEJBREo7QUFFQVgsVUFBRW1CLEdBQUY7QUFDSCxLQUxEO0FBTUgsQ0FYRCIsImZpbGUiOiJVcGxvYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB0YXAgPSByZXF1aXJlKFwidGFwXCIpO1xuXG5jb25zdCBpbml0ID0gcmVxdWlyZShcIi4uL2luaXRcIik7XG5jb25zdCByZXEgPSBpbml0LnJlcTtcblxudGFwLnRlc3QoXCJnZXRVUkxcIiwge2F1dG9lbmQ6IHRydWV9LCAodCkgPT4ge1xuICAgIGNvbnN0IHVwbG9hZCA9IGluaXQuZ2V0VXBsb2FkKCk7XG4gICAgdC5lcXVhbCh1cGxvYWQuZ2V0VVJMKFwiZW5cIiksXG4gICAgICAgIFwiL2FydHdvcmtzL3VwbG9hZHMvNDI2NjkwNjMzNFwiLCBcIkNoZWNrICdlbicgVVJMXCIpO1xuXG4gICAgdC5lcXVhbCh1cGxvYWQuZ2V0VVJMKFwiZGVcIiksXG4gICAgICAgIFwiL2FydHdvcmtzL3VwbG9hZHMvNDI2NjkwNjMzND9sYW5nPWRlXCIsIFwiQ2hlY2sgJ2RlJyBVUkxcIik7XG59KTtcblxudGFwLnRlc3QoXCJnZXRUaHVtYlVSTFwiLCB7YXV0b2VuZDogdHJ1ZX0sICh0KSA9PiB7XG4gICAgY29uc3QgdXBsb2FkID0gaW5pdC5nZXRVcGxvYWQoKTtcbiAgICB0LmVxdWFsKHVwbG9hZC5nZXRUaHVtYlVSTCgpLFxuICAgICAgICBcIi9kYXRhL3VwbG9hZHMvdGh1bWJzLzQyNjY5MDYzMzQuanBnXCIsXG4gICAgICAgIFwiQ2hlY2sgVGh1bWIgVVJMXCIpO1xufSk7XG5cbnRhcC50ZXN0KFwiZ2V0VGl0bGVcIiwge2F1dG9lbmQ6IHRydWV9LCAodCkgPT4ge1xuICAgIGNvbnN0IHVwbG9hZCA9IGluaXQuZ2V0VXBsb2FkKCk7XG4gICAgdC5lcXVhbCh1cGxvYWQuZ2V0VGl0bGUocmVxKSwgXCJVcGxvYWRlZCBJbWFnZVwiLCBcIkNoZWNrIFRpdGxlXCIpO1xufSk7XG5cbnRhcC50ZXN0KFwidXBkYXRlU2ltaWxhcml0eVwiLCAodCkgPT4ge1xuICAgIGNvbnN0IHVwbG9hZCA9IGluaXQuZ2V0VXBsb2FkKCk7XG4gICAgdXBsb2FkLnVwZGF0ZVNpbWlsYXJpdHkoKGVycikgPT4ge1xuICAgICAgICB0LmVycm9yKGVyciwgXCJFcnJvciBzaG91bGQgYmUgZW1wdHkuXCIpO1xuICAgICAgICB0LmVxdWFsKHVwbG9hZC5zaW1pbGFyUmVjb3Jkcy5sZW5ndGgsIDEsXG4gICAgICAgICAgICBcIkNvcnJlY3QgbnVtYmVyIG9mIG1hdGNoZXMuXCIpO1xuICAgICAgICB0LnNhbWUodXBsb2FkLnNpbWlsYXJSZWNvcmRzWzBdLnRvSlNPTigpLCB7XG4gICAgICAgICAgICBfaWQ6IFwidGVzdC8xMjM1XCIsXG4gICAgICAgICAgICByZWNvcmQ6IFwidGVzdC8xMjM1XCIsXG4gICAgICAgICAgICBzY29yZTogMTAsXG4gICAgICAgICAgICBzb3VyY2U6IFwidGVzdFwiLFxuICAgICAgICAgICAgaW1hZ2VzOiBbXCJ0ZXN0L2Jhci5qcGdcIl0sXG4gICAgICAgIH0sIFwiQ2hlY2sgc2ltaWxhciB1cGxvYWQgcmVzdWx0XCIpO1xuICAgICAgICB0LmVuZCgpO1xuICAgIH0pO1xufSk7XG5cbnRhcC50ZXN0KFwidXBkYXRlU2ltaWxhcml0eSB3aXRoIG5vIHNpbWlsYXJcIiwgKHQpID0+IHtcbiAgICBjb25zdCB1cGxvYWQgPSBpbml0LmdldFVwbG9hZCgpO1xuICAgIGNvbnN0IHVwbG9hZEltYWdlID0gaW5pdC5nZXRVcGxvYWRJbWFnZSgpO1xuICAgIHVwbG9hZEltYWdlLnNpbWlsYXJJbWFnZXMgPSBbXTtcblxuICAgIHVwbG9hZC51cGRhdGVTaW1pbGFyaXR5KChlcnIpID0+IHtcbiAgICAgICAgdC5lcnJvcihlcnIsIFwiRXJyb3Igc2hvdWxkIGJlIGVtcHR5LlwiKTtcbiAgICAgICAgdC5lcXVhbCh1cGxvYWQuc2ltaWxhclJlY29yZHMubGVuZ3RoLCAwLFxuICAgICAgICAgICAgXCJDb3JyZWN0IG51bWJlciBvZiBtYXRjaGVzLlwiKTtcbiAgICAgICAgdC5lbmQoKTtcbiAgICB9KTtcbn0pO1xuIl19