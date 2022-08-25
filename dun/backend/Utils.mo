import Error "mo:base/Error";

import AsyncSource "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";

import Types "./Types";

module {
  public func genUuid(): async Text {
    let uuid: UUID.UUID = await AsyncSource.Source().new();

    return UUID.toText(uuid);
  };

  public func errorResponse(code: Types.ErrorCodes, message: Types.ErrorMessage): Types.ErrorResponse {
    var errorMessage: Text = "";

    switch (message) {
      case (#text(message)) errorMessage := message;
      case (#error(message)) errorMessage := Error.message(message);
    };

    return {
      code = code;
      message = errorMessage;
    };
  };
};
