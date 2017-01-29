"use strict";

var fs = require("fs");

var async = require("async");
var formidable = require("formidable");
var jdp = require("jsondiffpatch");

var models = require("../lib/models");

module.exports = function (app) {
    var ImageImport = models("ImageImport");
    var RecordImport = models("RecordImport");

    var auth = require("./shared/auth");

    var importRecords = function importRecords(req, res) {
        var batchState = function batchState(batch) {
            return batch.getCurState().name(req);
        };
        var batchError = function batchError(err) {
            return RecordImport.getError(req, err);
        };

        RecordImport.findById(req.query.records, function (err, batch) {
            if (err || !batch) {
                return res.status(404).render("Error", {
                    title: req.gettext("Import not found.")
                });
            }

            if (req.query.abandon) {
                return batch.abandon(function () {
                    res.redirect(req.source.getAdminURL(req.lang));
                });
            } else if (req.query.finalize) {
                return batch.manuallyApprove(function () {
                    res.redirect(req.source.getAdminURL(req.lang));
                });
            }

            var adminURL = req.source.getAdminURL(req.lang);

            res.render("ImportRecords", {
                batch: batch,
                results: batch.getFilteredResults(),
                expanded: req.query.expanded,
                adminURL: adminURL,
                batchState: batchState,
                batchError: batchError,
                diff: function diff(delta) {
                    return jdp.formatters.html.format(delta);
                }
            });
        });
    };

    var importImages = function importImages(req, res) {
        var Image = models("Image");

        var batchState = function batchState(batch) {
            return batch.getCurState().name(req);
        };
        var batchError = function batchError(err) {
            return ImageImport.getError(req, err);
        };

        ImageImport.findById(req.query.images, function (err, batch) {
            if (err || !batch) {
                return res.status(404).render("Error", {
                    title: req.gettext("Import not found.")
                });
            }

            var expanded = req.query.expanded;
            var results = batch.results.filter(function (result) {
                return !!result.model;
            });
            var toPopulate = req.query.expanded === "models" ? results : results.slice(0, 8);

            async.eachLimit(toPopulate, 4, function (result, callback) {
                Image.findById(result.model, function (err, image) {
                    if (image) {
                        result.model = image;
                    }

                    callback();
                });
            }, function () {
                var adminURL = req.source.getAdminURL(req.lang);

                res.render("ImportImages", {
                    batch: batch,
                    expanded: expanded,
                    adminURL: adminURL,
                    batchState: batchState,
                    batchError: batchError
                });
            });
        });
    };

    var adminPage = function adminPage(req, res, next) {
        var source = req.source;
        var batchState = function batchState(batch) {
            return batch.getCurState().name(req);
        };
        var batchError = function batchError(batch) {
            return batch.getError(req);
        };

        async.parallel([function (callback) {
            return ImageImport.find({ source: source._id }, null, { sort: { created: "desc" } }, callback);
        }, function (callback) {
            return RecordImport.find({ source: source._id }, {
                state: true,
                fileName: true,
                source: true,
                created: true,
                modified: true,
                error: true,
                "results.result": true,
                "results.error": true,
                "results.warnings": true
            }, {}, callback);
        }], function (err, results) {
            /* istanbul ignore if */
            if (err) {
                return next(new Error(req.gettext("Error retrieving records.")));
            }

            var imageImport = results[0];
            var dataImport = results[1].sort(function (a, b) {
                return b.created - a.created;
            });

            res.render("Admin", {
                source: source,
                imageImport: imageImport,
                dataImport: dataImport,
                batchState: batchState,
                batchError: batchError
            });
        });
    };

    return {
        admin: function admin(req, res, next) {
            if (req.query.records) {
                importRecords(req, res, next);
            } else if (req.query.images) {
                importImages(req, res, next);
            } else {
                adminPage(req, res, next);
            }
        },
        uploadImages: function uploadImages(req, res, next) {
            var source = req.source;

            var form = new formidable.IncomingForm();
            form.encoding = "utf-8";

            form.parse(req, function (err, fields, files) {
                /* istanbul ignore if */
                if (err) {
                    return next(new Error(req.gettext("Error processing zip file.")));
                }

                var zipField = files && files.zipField;

                if (!zipField || !zipField.path || zipField.size === 0) {
                    return next(new Error(req.gettext("No zip file specified.")));
                }

                var zipFile = zipField.path;
                var fileName = zipField.name;

                var batch = ImageImport.fromFile(fileName, source._id);
                batch.zipFile = zipFile;

                batch.save(function (err) {
                    /* istanbul ignore if */
                    if (err) {
                        return next(new Error(req.gettext("Error saving zip file.")));
                    }

                    res.redirect(source.getAdminURL(req.lang));
                });
            });
        },
        uploadData: function uploadData(req, res, next) {
            var source = req.source;

            var form = new formidable.IncomingForm();
            form.encoding = "utf-8";
            form.multiples = true;

            form.parse(req, function (err, fields, files) {
                /* istanbul ignore if */
                if (err) {
                    return next(new Error(req.gettext("Error processing data files.")));
                }

                var inputFiles = (Array.isArray(files.files) ? files.files : files.files ? [files.files] : []).filter(function (file) {
                    return file.path && file.size > 0;
                });

                if (inputFiles.length === 0) {
                    return next(new Error(req.gettext("No data files specified.")));
                }

                var fileName = inputFiles.map(function (file) {
                    return file.name;
                }).join(", ");
                var inputStreams = inputFiles.map(function (file) {
                    return fs.createReadStream(file.path);
                });

                var batch = RecordImport.fromFile(fileName, source._id, source.type);

                batch.setResults(inputStreams, function (err) {
                    /* istanbul ignore if */
                    if (err) {
                        return next(new Error(req.gettext("Error saving data file.")));
                    }

                    batch.save(function (err) {
                        /* istanbul ignore if */
                        if (err) {
                            return next(new Error(req.gettext("Error saving data file.")));
                        }

                        res.redirect(source.getAdminURL(req.lang));
                    });
                });
            });
        },
        routes: function routes() {
            var source = function source(req, res, next) {
                var Source = models("Source");

                try {
                    req.source = Source.getSource(req.params.source);
                    next();
                } catch (e) {
                    return res.status(404).render("Error", {
                        title: req.gettext("Source not found.")
                    });
                }
            };

            app.get("/:type/source/:source/admin", auth, source, this.admin);
            app.post("/:type/source/:source/upload-images", auth, source, this.uploadImages);
            app.post("/:type/source/:source/upload-data", auth, source, this.uploadData);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dpYy9hZG1pbi5qcyJdLCJuYW1lcyI6WyJmcyIsInJlcXVpcmUiLCJhc3luYyIsImZvcm1pZGFibGUiLCJqZHAiLCJtb2RlbHMiLCJtb2R1bGUiLCJleHBvcnRzIiwiYXBwIiwiSW1hZ2VJbXBvcnQiLCJSZWNvcmRJbXBvcnQiLCJhdXRoIiwiaW1wb3J0UmVjb3JkcyIsInJlcSIsInJlcyIsImJhdGNoU3RhdGUiLCJiYXRjaCIsImdldEN1clN0YXRlIiwibmFtZSIsImJhdGNoRXJyb3IiLCJlcnIiLCJnZXRFcnJvciIsImZpbmRCeUlkIiwicXVlcnkiLCJyZWNvcmRzIiwic3RhdHVzIiwicmVuZGVyIiwidGl0bGUiLCJnZXR0ZXh0IiwiYWJhbmRvbiIsInJlZGlyZWN0Iiwic291cmNlIiwiZ2V0QWRtaW5VUkwiLCJsYW5nIiwiZmluYWxpemUiLCJtYW51YWxseUFwcHJvdmUiLCJhZG1pblVSTCIsInJlc3VsdHMiLCJnZXRGaWx0ZXJlZFJlc3VsdHMiLCJleHBhbmRlZCIsImRpZmYiLCJkZWx0YSIsImZvcm1hdHRlcnMiLCJodG1sIiwiZm9ybWF0IiwiaW1wb3J0SW1hZ2VzIiwiSW1hZ2UiLCJpbWFnZXMiLCJmaWx0ZXIiLCJyZXN1bHQiLCJtb2RlbCIsInRvUG9wdWxhdGUiLCJzbGljZSIsImVhY2hMaW1pdCIsImNhbGxiYWNrIiwiaW1hZ2UiLCJhZG1pblBhZ2UiLCJuZXh0IiwicGFyYWxsZWwiLCJmaW5kIiwiX2lkIiwic29ydCIsImNyZWF0ZWQiLCJzdGF0ZSIsImZpbGVOYW1lIiwibW9kaWZpZWQiLCJlcnJvciIsIkVycm9yIiwiaW1hZ2VJbXBvcnQiLCJkYXRhSW1wb3J0IiwiYSIsImIiLCJhZG1pbiIsInVwbG9hZEltYWdlcyIsImZvcm0iLCJJbmNvbWluZ0Zvcm0iLCJlbmNvZGluZyIsInBhcnNlIiwiZmllbGRzIiwiZmlsZXMiLCJ6aXBGaWVsZCIsInBhdGgiLCJzaXplIiwiemlwRmlsZSIsImZyb21GaWxlIiwic2F2ZSIsInVwbG9hZERhdGEiLCJtdWx0aXBsZXMiLCJpbnB1dEZpbGVzIiwiQXJyYXkiLCJpc0FycmF5IiwiZmlsZSIsImxlbmd0aCIsIm1hcCIsImpvaW4iLCJpbnB1dFN0cmVhbXMiLCJjcmVhdGVSZWFkU3RyZWFtIiwidHlwZSIsInNldFJlc3VsdHMiLCJyb3V0ZXMiLCJTb3VyY2UiLCJnZXRTb3VyY2UiLCJwYXJhbXMiLCJlIiwiZ2V0IiwicG9zdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFNQSxLQUFLQyxRQUFRLElBQVIsQ0FBWDs7QUFFQSxJQUFNQyxRQUFRRCxRQUFRLE9BQVIsQ0FBZDtBQUNBLElBQU1FLGFBQWFGLFFBQVEsWUFBUixDQUFuQjtBQUNBLElBQU1HLE1BQU1ILFFBQVEsZUFBUixDQUFaOztBQUVBLElBQU1JLFNBQVNKLFFBQVEsZUFBUixDQUFmOztBQUVBSyxPQUFPQyxPQUFQLEdBQWlCLFVBQVNDLEdBQVQsRUFBYztBQUMzQixRQUFNQyxjQUFjSixPQUFPLGFBQVAsQ0FBcEI7QUFDQSxRQUFNSyxlQUFlTCxPQUFPLGNBQVAsQ0FBckI7O0FBRUEsUUFBTU0sT0FBT1YsUUFBUSxlQUFSLENBQWI7O0FBRUEsUUFBTVcsZ0JBQWdCLFNBQWhCQSxhQUFnQixDQUFDQyxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUNoQyxZQUFNQyxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsS0FBRDtBQUFBLG1CQUFXQSxNQUFNQyxXQUFOLEdBQW9CQyxJQUFwQixDQUF5QkwsR0FBekIsQ0FBWDtBQUFBLFNBQW5CO0FBQ0EsWUFBTU0sYUFBYSxTQUFiQSxVQUFhLENBQUNDLEdBQUQ7QUFBQSxtQkFBU1YsYUFBYVcsUUFBYixDQUFzQlIsR0FBdEIsRUFBMkJPLEdBQTNCLENBQVQ7QUFBQSxTQUFuQjs7QUFFQVYscUJBQWFZLFFBQWIsQ0FBc0JULElBQUlVLEtBQUosQ0FBVUMsT0FBaEMsRUFBeUMsVUFBQ0osR0FBRCxFQUFNSixLQUFOLEVBQWdCO0FBQ3JELGdCQUFJSSxPQUFPLENBQUNKLEtBQVosRUFBbUI7QUFD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LE1BQTVCLENBQWI7QUFDQTBCO0FBRUgsaUJBSkQsQ0FJRSxPQUFPOEMsQ0FBUCxFQUFVO0FBQ1IsMkJBQU96RixJQUFJVyxNQUFKLENBQVcsR0FBWCxFQUFnQkMsTUFBaEIsQ0FBdUIsT0FBdkIsRUFBZ0M7QUFDbkNDLCtCQUFPZCxJQUFJZSxPQUFKLENBQVksbUJBQVo7QUFENEIscUJBQWhDLENBQVA7QUFHSDtBQUNKLGFBWkQ7O0FBY0FwQixnQkFBSWdHLEdBQUosQ0FBUSw2QkFBUixFQUF1QzdGLElBQXZDLEVBQTZDb0IsTUFBN0MsRUFBcUQsS0FBS3lDLEtBQTFEO0FBQ0FoRSxnQkFBSWlHLElBQUosQ0FBUyxxQ0FBVCxFQUFnRDlGLElBQWhELEVBQXNEb0IsTUFBdEQsRUFDSSxLQUFLMEMsWUFEVDtBQUVBakUsZ0JBQUlpRyxJQUFKLENBQVMsbUNBQVQsRUFBOEM5RixJQUE5QyxFQUFvRG9CLE1BQXBELEVBQ0ksS0FBS3VELFVBRFQ7QUFFSDtBQTNIRSxLQUFQO0FBNkhILENBelBEIiwiZmlsZSI6ImFkbWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbmNvbnN0IGFzeW5jID0gcmVxdWlyZShcImFzeW5jXCIpO1xuY29uc3QgZm9ybWlkYWJsZSA9IHJlcXVpcmUoXCJmb3JtaWRhYmxlXCIpO1xuY29uc3QgamRwID0gcmVxdWlyZShcImpzb25kaWZmcGF0Y2hcIik7XG5cbmNvbnN0IG1vZGVscyA9IHJlcXVpcmUoXCIuLi9saWIvbW9kZWxzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAgIGNvbnN0IEltYWdlSW1wb3J0ID0gbW9kZWxzKFwiSW1hZ2VJbXBvcnRcIik7XG4gICAgY29uc3QgUmVjb3JkSW1wb3J0ID0gbW9kZWxzKFwiUmVjb3JkSW1wb3J0XCIpO1xuXG4gICAgY29uc3QgYXV0aCA9IHJlcXVpcmUoXCIuL3NoYXJlZC9hdXRoXCIpO1xuXG4gICAgY29uc3QgaW1wb3J0UmVjb3JkcyA9IChyZXEsIHJlcykgPT4ge1xuICAgICAgICBjb25zdCBiYXRjaFN0YXRlID0gKGJhdGNoKSA9PiBiYXRjaC5nZXRDdXJTdGF0ZSgpLm5hbWUocmVxKTtcbiAgICAgICAgY29uc3QgYmF0Y2hFcnJvciA9IChlcnIpID0+IFJlY29yZEltcG9ydC5nZXRFcnJvcihyZXEsIGVycik7XG5cbiAgICAgICAgUmVjb3JkSW1wb3J0LmZpbmRCeUlkKHJlcS5xdWVyeS5yZWNvcmRzLCAoZXJyLCBiYXRjaCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciB8fCAhYmF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLnJlbmRlcihcIkVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHJlcS5nZXR0ZXh0KFwiSW1wb3J0IG5vdCBmb3VuZC5cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXEucXVlcnkuYWJhbmRvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXRjaC5hYmFuZG9uKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnJlZGlyZWN0KHJlcS5zb3VyY2UuZ2V0QWRtaW5VUkwocmVxLmxhbmcpKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXEucXVlcnkuZmluYWxpemUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmF0Y2gubWFudWFsbHlBcHByb3ZlKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzLnJlZGlyZWN0KHJlcS5zb3VyY2UuZ2V0QWRtaW5VUkwocmVxLmxhbmcpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYWRtaW5VUkwgPSByZXEuc291cmNlLmdldEFkbWluVVJMKHJlcS5sYW5nKTtcblxuICAgICAgICAgICAgcmVzLnJlbmRlcihcIkltcG9ydFJlY29yZHNcIiwge1xuICAgICAgICAgICAgICAgIGJhdGNoLFxuICAgICAgICAgICAgICAgIHJlc3VsdHM6IGJhdGNoLmdldEZpbHRlcmVkUmVzdWx0cygpLFxuICAgICAgICAgICAgICAgIGV4cGFuZGVkOiByZXEucXVlcnkuZXhwYW5kZWQsXG4gICAgICAgICAgICAgICAgYWRtaW5VUkwsXG4gICAgICAgICAgICAgICAgYmF0Y2hTdGF0ZSxcbiAgICAgICAgICAgICAgICBiYXRjaEVycm9yLFxuICAgICAgICAgICAgICAgIGRpZmY6IChkZWx0YSkgPT4gamRwLmZvcm1hdHRlcnMuaHRtbC5mb3JtYXQoZGVsdGEpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBpbXBvcnRJbWFnZXMgPSAocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgSW1hZ2UgPSBtb2RlbHMoXCJJbWFnZVwiKTtcblxuICAgICAgICBjb25zdCBiYXRjaFN0YXRlID0gKGJhdGNoKSA9PiBiYXRjaC5nZXRDdXJTdGF0ZSgpLm5hbWUocmVxKTtcbiAgICAgICAgY29uc3QgYmF0Y2hFcnJvciA9IChlcnIpID0+IEltYWdlSW1wb3J0LmdldEVycm9yKHJlcSwgZXJyKTtcblxuICAgICAgICBJbWFnZUltcG9ydC5maW5kQnlJZChyZXEucXVlcnkuaW1hZ2VzLCAoZXJyLCBiYXRjaCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVyciB8fCAhYmF0Y2gpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLnJlbmRlcihcIkVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IHJlcS5nZXR0ZXh0KFwiSW1wb3J0IG5vdCBmb3VuZC5cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4cGFuZGVkID0gcmVxLnF1ZXJ5LmV4cGFuZGVkO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGJhdGNoLnJlc3VsdHNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChyZXN1bHQpID0+ICEhcmVzdWx0Lm1vZGVsKTtcbiAgICAgICAgICAgIGNvbnN0IHRvUG9wdWxhdGUgPSByZXEucXVlcnkuZXhwYW5kZWQgPT09IFwibW9kZWxzXCIgP1xuICAgICAgICAgICAgICAgIHJlc3VsdHMgOlxuICAgICAgICAgICAgICAgIHJlc3VsdHMuc2xpY2UoMCwgOCk7XG5cbiAgICAgICAgICAgIGFzeW5jLmVhY2hMaW1pdCh0b1BvcHVsYXRlLCA0LCAocmVzdWx0LCBjYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgICAgIEltYWdlLmZpbmRCeUlkKHJlc3VsdC5tb2RlbCwgKGVyciwgaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQubW9kZWwgPSBpbWFnZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRtaW5VUkwgPSByZXEuc291cmNlLmdldEFkbWluVVJMKHJlcS5sYW5nKTtcblxuICAgICAgICAgICAgICAgIHJlcy5yZW5kZXIoXCJJbXBvcnRJbWFnZXNcIiwge1xuICAgICAgICAgICAgICAgICAgICBiYXRjaCxcbiAgICAgICAgICAgICAgICAgICAgZXhwYW5kZWQsXG4gICAgICAgICAgICAgICAgICAgIGFkbWluVVJMLFxuICAgICAgICAgICAgICAgICAgICBiYXRjaFN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBiYXRjaEVycm9yLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBhZG1pblBhZ2UgPSAocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3Qgc291cmNlID0gcmVxLnNvdXJjZTtcbiAgICAgICAgY29uc3QgYmF0Y2hTdGF0ZSA9IChiYXRjaCkgPT4gYmF0Y2guZ2V0Q3VyU3RhdGUoKS5uYW1lKHJlcSk7XG4gICAgICAgIGNvbnN0IGJhdGNoRXJyb3IgPSAoYmF0Y2gpID0+IGJhdGNoLmdldEVycm9yKHJlcSk7XG5cbiAgICAgICAgYXN5bmMucGFyYWxsZWwoW1xuICAgICAgICAgICAgKGNhbGxiYWNrKSA9PiBJbWFnZUltcG9ydC5maW5kKHtzb3VyY2U6IHNvdXJjZS5faWR9LCBudWxsLFxuICAgICAgICAgICAgICAgIHtzb3J0OiB7Y3JlYXRlZDogXCJkZXNjXCJ9fSwgY2FsbGJhY2spLFxuICAgICAgICAgICAgKGNhbGxiYWNrKSA9PiBSZWNvcmRJbXBvcnQuZmluZCh7c291cmNlOiBzb3VyY2UuX2lkfSwge1xuICAgICAgICAgICAgICAgIHN0YXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGZpbGVOYW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNvdXJjZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1vZGlmaWVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwicmVzdWx0cy5yZXN1bHRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcInJlc3VsdHMuZXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcInJlc3VsdHMud2FybmluZ3NcIjogdHJ1ZSxcbiAgICAgICAgICAgIH0sIHt9LCBjYWxsYmFjayksXG4gICAgICAgIF0sIChlcnIsIHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgcmVxLmdldHRleHQoXCJFcnJvciByZXRyaWV2aW5nIHJlY29yZHMuXCIpKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGltYWdlSW1wb3J0ID0gcmVzdWx0c1swXTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFJbXBvcnQgPSByZXN1bHRzWzFdXG4gICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGIuY3JlYXRlZCAtIGEuY3JlYXRlZCk7XG5cbiAgICAgICAgICAgIHJlcy5yZW5kZXIoXCJBZG1pblwiLCB7XG4gICAgICAgICAgICAgICAgc291cmNlLFxuICAgICAgICAgICAgICAgIGltYWdlSW1wb3J0LFxuICAgICAgICAgICAgICAgIGRhdGFJbXBvcnQsXG4gICAgICAgICAgICAgICAgYmF0Y2hTdGF0ZSxcbiAgICAgICAgICAgICAgICBiYXRjaEVycm9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZG1pbihyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICAgICAgaWYgKHJlcS5xdWVyeS5yZWNvcmRzKSB7XG4gICAgICAgICAgICAgICAgaW1wb3J0UmVjb3JkcyhyZXEsIHJlcywgbmV4dCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxLnF1ZXJ5LmltYWdlcykge1xuICAgICAgICAgICAgICAgIGltcG9ydEltYWdlcyhyZXEsIHJlcywgbmV4dCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWRtaW5QYWdlKHJlcSwgcmVzLCBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGxvYWRJbWFnZXMocmVxLCByZXMsIG5leHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IHJlcS5zb3VyY2U7XG5cbiAgICAgICAgICAgIGNvbnN0IGZvcm0gPSBuZXcgZm9ybWlkYWJsZS5JbmNvbWluZ0Zvcm0oKTtcbiAgICAgICAgICAgIGZvcm0uZW5jb2RpbmcgPSBcInV0Zi04XCI7XG5cbiAgICAgICAgICAgIGZvcm0ucGFyc2UocmVxLCAoZXJyLCBmaWVsZHMsIGZpbGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICByZXEuZ2V0dGV4dChcIkVycm9yIHByb2Nlc3NpbmcgemlwIGZpbGUuXCIpKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgemlwRmllbGQgPSBmaWxlcyAmJiBmaWxlcy56aXBGaWVsZDtcblxuICAgICAgICAgICAgICAgIGlmICghemlwRmllbGQgfHwgIXppcEZpZWxkLnBhdGggfHwgemlwRmllbGQuc2l6ZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihyZXEuZ2V0dGV4dChcIk5vIHppcCBmaWxlIHNwZWNpZmllZC5cIikpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCB6aXBGaWxlID0gemlwRmllbGQucGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHppcEZpZWxkLm5hbWU7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBiYXRjaCA9IEltYWdlSW1wb3J0LmZyb21GaWxlKGZpbGVOYW1lLCBzb3VyY2UuX2lkKTtcbiAgICAgICAgICAgICAgICBiYXRjaC56aXBGaWxlID0gemlwRmlsZTtcblxuICAgICAgICAgICAgICAgIGJhdGNoLnNhdmUoKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQobmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5nZXR0ZXh0KFwiRXJyb3Igc2F2aW5nIHppcCBmaWxlLlwiKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmVzLnJlZGlyZWN0KHNvdXJjZS5nZXRBZG1pblVSTChyZXEubGFuZykpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBsb2FkRGF0YShyZXEsIHJlcywgbmV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gcmVxLnNvdXJjZTtcblxuICAgICAgICAgICAgY29uc3QgZm9ybSA9IG5ldyBmb3JtaWRhYmxlLkluY29taW5nRm9ybSgpO1xuICAgICAgICAgICAgZm9ybS5lbmNvZGluZyA9IFwidXRmLThcIjtcbiAgICAgICAgICAgIGZvcm0ubXVsdGlwbGVzID0gdHJ1ZTtcblxuICAgICAgICAgICAgZm9ybS5wYXJzZShyZXEsIChlcnIsIGZpZWxkcywgZmlsZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXh0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5nZXR0ZXh0KFwiRXJyb3IgcHJvY2Vzc2luZyBkYXRhIGZpbGVzLlwiKSkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGlucHV0RmlsZXMgPSAoQXJyYXkuaXNBcnJheShmaWxlcy5maWxlcykgP1xuICAgICAgICAgICAgICAgICAgICBmaWxlcy5maWxlcyA6XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLmZpbGVzID8gW2ZpbGVzLmZpbGVzXSA6IFtdKVxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnBhdGggJiYgZmlsZS5zaXplID4gMCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5wdXRGaWxlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3IocmVxLmdldHRleHQoXCJObyBkYXRhIGZpbGVzIHNwZWNpZmllZC5cIikpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGlucHV0RmlsZXNcbiAgICAgICAgICAgICAgICAgICAgLm1hcCgoZmlsZSkgPT4gZmlsZS5uYW1lKS5qb2luKFwiLCBcIik7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5wdXRTdHJlYW1zID0gaW5wdXRGaWxlc1xuICAgICAgICAgICAgICAgICAgICAubWFwKChmaWxlKSA9PiBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUucGF0aCkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYmF0Y2ggPSBSZWNvcmRJbXBvcnQuZnJvbUZpbGUoZmlsZU5hbWUsIHNvdXJjZS5faWQsXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZS50eXBlKTtcblxuICAgICAgICAgICAgICAgIGJhdGNoLnNldFJlc3VsdHMoaW5wdXRTdHJlYW1zLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxLmdldHRleHQoXCJFcnJvciBzYXZpbmcgZGF0YSBmaWxlLlwiKSkpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYmF0Y2guc2F2ZSgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcS5nZXR0ZXh0KFwiRXJyb3Igc2F2aW5nIGRhdGEgZmlsZS5cIikpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnJlZGlyZWN0KHNvdXJjZS5nZXRBZG1pblVSTChyZXEubGFuZykpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJvdXRlcygpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZSA9IChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFNvdXJjZSA9IG1vZGVscyhcIlNvdXJjZVwiKTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcS5zb3VyY2UgPSBTb3VyY2UuZ2V0U291cmNlKHJlcS5wYXJhbXMuc291cmNlKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLnJlbmRlcihcIkVycm9yXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiByZXEuZ2V0dGV4dChcIlNvdXJjZSBub3QgZm91bmQuXCIpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBhcHAuZ2V0KFwiLzp0eXBlL3NvdXJjZS86c291cmNlL2FkbWluXCIsIGF1dGgsIHNvdXJjZSwgdGhpcy5hZG1pbik7XG4gICAgICAgICAgICBhcHAucG9zdChcIi86dHlwZS9zb3VyY2UvOnNvdXJjZS91cGxvYWQtaW1hZ2VzXCIsIGF1dGgsIHNvdXJjZSxcbiAgICAgICAgICAgICAgICB0aGlzLnVwbG9hZEltYWdlcyk7XG4gICAgICAgICAgICBhcHAucG9zdChcIi86dHlwZS9zb3VyY2UvOnNvdXJjZS91cGxvYWQtZGF0YVwiLCBhdXRoLCBzb3VyY2UsXG4gICAgICAgICAgICAgICAgdGhpcy51cGxvYWREYXRhKTtcbiAgICAgICAgfSxcbiAgICB9O1xufTtcbiJdfQ==