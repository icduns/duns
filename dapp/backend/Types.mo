import Result "mo:base/Result";

module {

  public type Response<T> = Result.Result<T, ErrorResponse>;

  public type ErrorCodes = {
    #not_found;
    #already_exist;
    #invalid_input;
    #internal_server_error;
  };

  public type ErrorMessage = {
    #text : Text;
    #error : Error;
  };

  public type ErrorResponse = {
    code : ErrorCodes;
    message : Text;
  };
};
