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
    profile : UserProfile;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    roles : [Text];
  };

  public type UserProfile = {
    firstName : Text;
    lastName : Text;
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

    public func createUser(
      id : Principal,
      profile : UserProfile,
      roles : [Text],
    ) : Types.Response<User> {
      if (Principal.isAnonymous(id)) {
        return #err(Utils.accessDeniedResponse());
      };

      if (Option.isSome(users.get(id))) {
        return #err(userAlreadyExistsResponse(id));
      };

      if (not validateUserProfile(profile)) {
        return #err(invalidUserProfileResponse());
      };

      if (not validateUserRoles(roles)) {
        return #err(invalidUserRolesResponse());
      };

      let now : Time.Time = Time.now();

      let user : User = {
        id = id;
        profile = profile;
        roles = roles;
        createdAt = now;
        updatedAt = now;
      };

      users.put(user.id, user);
      return #ok(user);
    };

    public func updateUser(
      id : Principal,
      profile : UserProfile,
      roles : [Text],
    ) : Types.Response<User> {
      if (not validateUserProfile(profile)) {
        return #err(invalidUserProfileResponse());
      };

      if (not validateUserRoles(roles)) {
        return #err(invalidUserRolesResponse());
      };

      switch (getUser(id)) {
        case (#ok(user)) {
          let updatedUser : User = {
            // unchanged properties
            id = user.id;
            createdAt = user.createdAt;
            // updated properties
            profile = profile;
            roles = roles;
            updatedAt = Time.now();
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

    private func validateUserProfile(profile : UserProfile) : Bool {
      let checkEmail : Bool = switch (profile.email) {
        case (null) { true };
        case (?email) { not TextUtils.isBlank(email) };
      };
      return checkEmail and not TextUtils.isBlank(profile.firstName) and not TextUtils.isBlank(profile.lastName);
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

    private func invalidUserProfileResponse() : Types.ErrorResponse {
      return Utils.errorResponse(
        #invalid_input,
        #text(
          "Passed user profile is invalid: firstName, lastName and email (if provided) should not be blank",
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
