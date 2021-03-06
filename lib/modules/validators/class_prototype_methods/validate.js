import castNested from '../../fields/utils/cast_nested.js';
import documentValidate from '../utils/document_validate.js';
import callMeteorMethod from '../../storage/utils/call_meteor_method.js';

function validate(args = {}, callback) {
  let doc = this;
  let Class = doc.constructor;
  let Collection = Class.getCollection();
  let connection = Collection && Collection._connection;
  if (!connection && (!Collection || !Collection._name)) {
    connection = Meteor.connection;
  }

  // If the first argument is callback function then reassign values.
  if (arguments.length === 1 && Match.test(args, Function)) {
    callback = args;
    args = {};
  }

  let {
    fields = Class.getValidationOrder(),
    stopOnFirstError = true,
    simulation = true,
  } = args;

  // If a fields property is a string then put it into array.
  if (Match.test(fields, String)) {
    fields = [fields];
  }

  // Cast nested documents.
  castNested({
    doc
  });

  // Prepare arguments for meteor method and utility.
  let methodArgs = {
    doc,
    fields,
    stopOnFirstError,
    simulation,
  };

  // If we are dealing with a remote collection and we are not on the server.
  if (connection && connection !== Meteor.server) {
    // Prepare arguments for meteor method.
    let methodName = '/Astronomy/validate';

    try {
      // Run Meteor method.
      return callMeteorMethod(
        Class, methodName, [methodArgs], callback
      );
    }
    // Catch stub exceptions.
    catch (err) {
      if (callback) {
        callback(err);
        return null;
      }
      throw err;
    }
  }

  // If we can just validate a document without calling the meteor method. We
  // may be on the server or the collection may be local.
  try {
    // Validate a document.
    let result = documentValidate(methodArgs);
    if (callback) {
      callback();
    }
    return result;
  }
  catch (err) {
    if (callback) {
      callback(err);
      return null;
    }
    throw err;
  }
}

export default validate;