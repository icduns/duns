import Error "mo:base/Error";

import AsyncSource "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";

import Types "../Types";

module {

  public func generateUuid() : async Text {
    let uuid : UUID.UUID = await AsyncSource.Source().new();
    return UUID.toText(uuid);
  };

  public func errorResponse(
    code : Types.ErrorCodes,
    message : Types.ErrorMessage,
  ) : Types.ErrorResponse {
    let errorMessage : Text = switch (message) {
      case (#text(message)) {
        message;
      };
      case (#error(message)) {
        Error.message(message);
      };
    };

    return {
      code = code;
      message = errorMessage;
    };
  };

  public func accessDeniedResponse() : Types.ErrorResponse {
    return errorResponse(
      #access_denied,
      #text(
        "Access denied: caller principal doesn't have sufficient rights to perform this call",
      ),
    );
  };

};
