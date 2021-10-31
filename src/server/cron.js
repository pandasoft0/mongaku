// How often queries should be performed
const QUERY_RATE = 5000;

const record = require("../lib/record");
const models = require("../lib/models");
const options = require("../lib/options");

module.exports = {
    updateRecordImport() {
        const advance = () =>
            models("RecordImport").advance(() =>
                setTimeout(advance, QUERY_RATE),
            );

        advance();
    },

    updateRecordSimilarity() {
        for (const typeName in options.types) {
            const Record = record(typeName);
            const next = () => setTimeout(update, QUERY_RATE);
            const update = () =>
                Record.updateSimilarity((err, success) => {
                    // If nothing happened then we wait to try again
                    if (err || !success) {
                        return next();
                    }

                    // If it worked immediately attempt to index or update
                    // another image.
                    process.nextTick(update);
                });

            update();
        }
    },

    updateImageImport() {
        const advance = () =>
            models("ImageImport").advance(() =>
                setTimeout(advance, QUERY_RATE),
            );

        advance();
    },

    updateImageSimilarity() {
        const Image = models("Image");
        const next = () => setTimeout(update, QUERY_RATE);
        const update = () =>
            Image.indexSimilarity((err, success) => {
                // If we hit an error attempt again after a small delay
                /* istanbul ignore if */
                if (err) {
                    return next();
                }

                // If it worked immediately attempt to index or update
                // another image.
                if (success) {
                    return process.nextTick(update);
                }

                // If nothing happened attempt to update the similarity
                // of an image instead.
                Image.updateSimilarity((err, success) => {
                    // If nothing happened then we wait to try again
                    if (err || !success) {
                        return next();
                    }

                    // If it worked immediately attempt to index or update
                    // another image.
                    process.nextTick(update);
                });
            });

        update();
    },

    start() {
        this.updateRecordImport();
        this.updateRecordSimilarity();
        this.updateImageImport();
        this.updateImageSimilarity();
    },
};
