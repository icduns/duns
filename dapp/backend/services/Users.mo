import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

import ArrayUtils "../utils/ArrayUtils";
import TextUtils "../utils/TextUtils";
import Utils "../utils/Utils";

import Types "../Types";

module {

  public type User = {
    id : Principal;
    firstName : Text;
    lastName : Text;
    roles : [Text];
    email : ?Text;
    aboutMe : ?Text;
    imageId : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  public type CreateUserRequest = {
    id : Principal;
    firstName : Text;
    lastName : Text;
    roles : [Text];
  };

  public type UpdateUserRequest = {
    id : Principal;
    firstName : Text;
    lastName : Text;
    roles : [Text];
    email : ?Text;
    aboutMe : ?Text;
    imageId : ?Text;
  };

  public type UserStorage = {
    users : [(Principal, User)];
  };

  public type UserServiceConfig = {
    userRoles : [Text];
  };

  public class UserService(config : UserServiceConfig) {
    private var users = HashMap.HashMap<Principal, User>(
      10,
      Principal.equal,
      Principal.hash,
    );

    public func getEmptyStorage() : UserStorage {
      return {
        users = [];
      };
    };

    public func importFromStorage(storage : UserStorage) {
      users := HashMap.fromIter<Principal, User>(
        storage.users.vals(),
        storage.users.size(),
        Principal.equal,
        Principal.hash,
      );
    };

    public func exportToStorage() : UserStorage {
      return {
        users = Iter.toArray(users.entries());
      };
    };

    public func getConfig() : Types.Response<UserServiceConfig> {
      return #ok(config);
    };

    public func getUser(id : Principal) : Types.Response<User> {
      switch (users.get(id)) {
        case (?user) {
          return #ok(user);
        };
        case (null) {
          return #err(userNotFoundResponse(id));
        };
      };
    };

    public func createUser(request : CreateUserRequest) : Types.Response<User> {
      if (Principal.isAnonymous(request.id)) {
        return #err(Utils.accessDeniedResponse());
      };

      if (Option.isSome(users.get(request.id))) {
        return #err(userAlreadyExistsResponse(request.id));
      };

      if (not validateUserRoles(request.roles)) {
        return #err(invalidUserRolesResponse());
      };

      let now : Time.Time = Time.now();

      let user : User = {
        id = request.id;
        firstName = request.firstName;
        lastName = request.lastName;
        roles = request.roles;
        email = null;
        aboutMe = null;
        imageId = null;
        createdAt = now;
        updatedAt = now;
      };

      if (not validateUser(user)) {
        return #err(invalidUserResponse());
      };

      users.put(user.id, user);
      return #ok(user);
    };

    public func updateUser(request : UpdateUserRequest) : Types.Response<User> {
      if (not validateUserRoles(request.roles)) {
        return #err(invalidUserRolesResponse());
      };

      switch (getUser(request.id)) {
        case (#ok(user)) {
          let updatedUser : User = {
            // unchanged properties
            id = user.id;
            createdAt = user.createdAt;
            // updated properties
            firstName = request.firstName;
            lastName = request.lastName;
            roles = request.roles;
            email = request.email;
            aboutMe = request.aboutMe;
            imageId = request.imageId;
            updatedAt = Time.now();
          };

          if (not validateUser(updatedUser)) {
            return #err(invalidUserResponse());
          };

          users.put(updatedUser.id, updatedUser);
          return #ok(updatedUser);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func deleteUser(id : Principal) : Types.Response<User> {
      switch (getUser(id)) {
        case (#ok(user)) {
          users.delete(user.id);
          return #ok(user);
        };
        case (#err(result)) {
          return #err(result);
        };
      };
    };

    public func isUserInRole(id : Principal, role : Text) : Bool {
      switch (users.get(id)) {
        case (?user) {
          return ArrayUtils.findInArray(user.roles, role, Text.equal);
        };
        case (null) {
          return false;
        };
      };
    };

    private func validateUser(user : User) : Bool {
      let checkEmail : Bool = switch (user.email) {
        case (null) { true };
        case (?email) { not TextUtils.isBlank(email) };
      };
      return checkEmail and not TextUtils.isBlank(user.firstName) and not TextUtils.isBlank(user.lastName);
    };

    private func validateUserRoles(roles : [Text]) : Bool {
      if (roles.size() == 0 or ArrayUtils.hasArrayDuplicates(roles, Text.hash, Text.equal)) {
        return false;
      };

      for (role in roles.vals()) {
        if (not ArrayUtils.findInArray(config.userRoles, role, Text.equal)) {
          return false;
        };
      };

      return true;
    };

    private func userAlreadyExistsResponse(id : Principal) : Types.ErrorResponse {
      return Utils.errorResponse(
        #already_exists,
        #text(
          "User with id " # Principal.toText(id) # " already exists",
        ),
      );
    };

    private func userNotFoundResponse(id : Principal) : Types.ErrorResponse {
      return Utils.errorResponse(
        #not_found,
        #text(
          "User with id " # Principal.toText(id) # " doesn't exist",
        ),
      );
    };

    private func invalidUserResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed user is invalid: firstName, lastName and email (if provided) should not be blank",
        ),
      );
    };

    private func invalidUserRolesResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed user roles are invalid",
        ),
      );
    };

  };

};
