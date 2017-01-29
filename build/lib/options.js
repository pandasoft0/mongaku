"use strict";

var fs = require("fs");
var path = require("path");

var options = require("./default-options");
var recordOptions = require("./default-record-options");

var loadFile = true;
var optionsFile = path.resolve(process.cwd(), "mongaku.js");

if (process.env.NODE_ENV === "test") {
    optionsFile = "../tests/options.js";
} else {
    try {
        // Detect if the file exists, throwing an exception if it does not
        fs.statSync(optionsFile);
    } catch (e) {
        console.warn("No options file found: mongaku.js not located.");
        loadFile = false;
    }
}

if (loadFile) {
    // If it exists, load in the options from it...
    var customOptions = require(optionsFile);
    Object.assign(options, customOptions);
}

for (var typeName in options.types) {
    options.types[typeName] = Object.assign({}, recordOptions, options.types[typeName]);
}

module.exports = options;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvb3B0aW9ucy5qcyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJwYXRoIiwib3B0aW9ucyIsInJlY29yZE9wdGlvbnMiLCJsb2FkRmlsZSIsIm9wdGlvbnNGaWxlIiwicmVzb2x2ZSIsInByb2Nlc3MiLCJjd2QiLCJlbnYiLCJOT0RFX0VOViIsInN0YXRTeW5jIiwiZSIsImNvbnNvbGUiLCJ3YXJuIiwiY3VzdG9tT3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsInR5cGVOYW1lIiwidHlwZXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQU1BLEtBQUtDLFFBQVEsSUFBUixDQUFYO0FBQ0EsSUFBTUMsT0FBT0QsUUFBUSxNQUFSLENBQWI7O0FBRUEsSUFBTUUsVUFBVUYsUUFBUSxtQkFBUixDQUFoQjtBQUNBLElBQU1HLGdCQUFnQkgsUUFBUSwwQkFBUixDQUF0Qjs7QUFFQSxJQUFJSSxXQUFXLElBQWY7QUFDQSxJQUFJQyxjQUFjSixLQUFLSyxPQUFMLENBQWFDLFFBQVFDLEdBQVIsRUFBYixFQUE0QixZQUE1QixDQUFsQjs7QUFFQSxJQUFJRCxRQUFRRSxHQUFSLENBQVlDLFFBQVosS0FBeUIsTUFBN0IsRUFBcUM7QUFDakNMLGtCQUFjLHFCQUFkO0FBRUgsQ0FIRCxNQUdPO0FBQ0gsUUFBSTtBQUNBO0FBQ0FOLFdBQUdZLFFBQUgsQ0FBWU4sV0FBWjtBQUNILEtBSEQsQ0FHRSxPQUFPTyxDQUFQLEVBQVU7QUFDUkMsZ0JBQVFDLElBQVIsQ0FBYSxnREFBYjtBQUNBVixtQkFBVyxLQUFYO0FBQ0g7QUFDSjs7QUFFRCxJQUFJQSxRQUFKLEVBQWM7QUFDVjtBQUNBLFFBQU1XLGdCQUFnQmYsUUFBUUssV0FBUixDQUF0QjtBQUNBVyxXQUFPQyxNQUFQLENBQWNmLE9BQWQsRUFBdUJhLGFBQXZCO0FBQ0g7O0FBRUQsS0FBSyxJQUFNRyxRQUFYLElBQXVCaEIsUUFBUWlCLEtBQS9CLEVBQXNDO0FBQ2xDakIsWUFBUWlCLEtBQVIsQ0FBY0QsUUFBZCxJQUNJRixPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQmQsYUFBbEIsRUFBaUNELFFBQVFpQixLQUFSLENBQWNELFFBQWQsQ0FBakMsQ0FESjtBQUVIOztBQUVERSxPQUFPQyxPQUFQLEdBQWlCbkIsT0FBakIiLCJmaWxlIjoib3B0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5jb25zdCBvcHRpb25zID0gcmVxdWlyZShcIi4vZGVmYXVsdC1vcHRpb25zXCIpO1xuY29uc3QgcmVjb3JkT3B0aW9ucyA9IHJlcXVpcmUoXCIuL2RlZmF1bHQtcmVjb3JkLW9wdGlvbnNcIik7XG5cbmxldCBsb2FkRmlsZSA9IHRydWU7XG5sZXQgb3B0aW9uc0ZpbGUgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCJtb25nYWt1LmpzXCIpO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwidGVzdFwiKSB7XG4gICAgb3B0aW9uc0ZpbGUgPSBcIi4uL3Rlc3RzL29wdGlvbnMuanNcIjtcblxufSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgICAvLyBEZXRlY3QgaWYgdGhlIGZpbGUgZXhpc3RzLCB0aHJvd2luZyBhbiBleGNlcHRpb24gaWYgaXQgZG9lcyBub3RcbiAgICAgICAgZnMuc3RhdFN5bmMob3B0aW9uc0ZpbGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiTm8gb3B0aW9ucyBmaWxlIGZvdW5kOiBtb25nYWt1LmpzIG5vdCBsb2NhdGVkLlwiKTtcbiAgICAgICAgbG9hZEZpbGUgPSBmYWxzZTtcbiAgICB9XG59XG5cbmlmIChsb2FkRmlsZSkge1xuICAgIC8vIElmIGl0IGV4aXN0cywgbG9hZCBpbiB0aGUgb3B0aW9ucyBmcm9tIGl0Li4uXG4gICAgY29uc3QgY3VzdG9tT3B0aW9ucyA9IHJlcXVpcmUob3B0aW9uc0ZpbGUpO1xuICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgY3VzdG9tT3B0aW9ucyk7XG59XG5cbmZvciAoY29uc3QgdHlwZU5hbWUgaW4gb3B0aW9ucy50eXBlcykge1xuICAgIG9wdGlvbnMudHlwZXNbdHlwZU5hbWVdID1cbiAgICAgICAgT2JqZWN0LmFzc2lnbih7fSwgcmVjb3JkT3B0aW9ucywgb3B0aW9ucy50eXBlc1t0eXBlTmFtZV0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9wdGlvbnM7XG4iXX0=